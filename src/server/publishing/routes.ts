/**
 * JetKur Cloudflare Static Assets Edge Publishing Routes (Sprint 16.1)
 *
 * Implements:
 * 1. GET /api/publishing/manifest: Edge routing manifest output (PII-free, credential-free).
 * 2. GET /api/publishing/metrics: Cloudflare Free usage observability metrics.
 * 3. POST /api/publishing/plan: Calculates atomic dry-run deployment execution plan.
 * 4. POST /api/publishing/sites/:siteId/publish: Namespaces static artifact and updates edge route.
 */

import { Router, Request, Response } from "express";
import { CloudflareStaticAssetsProvider } from "../../domain/publishing/provider";
import { siteRepository } from "../db/siteRepository";
import { toSiteConfig } from "../../domain/site/legacyAdapter";
import { generateProductionSiteFiles } from "../../utils/productionGeneratorBridge";
import { computeSiteFingerprint } from "../../domain/lifecycle/fingerprint";
import { sampleCanonicalSite } from "../../domain/site/fixtures";

export const publishingRouter = Router();
export const staticAssetsProvider = new CloudflareStaticAssetsProvider();

function getWorkspaceContext(req: Request) {
  const workspaceId =
    (req.headers["x-workspace-id"] as string) ||
    (req.query.workspaceId as string) ||
    (req.body?.workspaceId as string) ||
    "default-workspace";

  const userId =
    (req.headers["x-user-id"] as string) ||
    (req.query.userId as string) ||
    (req.body?.userId as string) ||
    undefined;

  return { workspaceId, userId };
}

/**
 * GET /api/publishing/manifest
 * Returns sanitized, edge-compatible routing manifest for Cloudflare Workers Static Assets
 */
publishingRouter.get("/manifest", (_req: Request, res: Response) => {
  const manifest = staticAssetsProvider.getManifestStore().toJson();
  res.json({
    success: true,
    routesCount: Object.keys(manifest).length,
    manifest,
  });
});

/**
 * GET /api/publishing/metrics
 * Usage observability foundation for Cloudflare Free tier
 */
publishingRouter.get("/metrics", (_req: Request, res: Response) => {
  const metrics = staticAssetsProvider.getMetrics();
  res.json({
    success: true,
    metrics,
  });
});

/**
 * POST /api/publishing/plan
 * Generates concrete dry-run deployment execution plan without executing external mutations
 */
publishingRouter.post("/plan", async (req: Request, res: Response) => {
  try {
    const { siteId, version = 1, hostname } = req.body || {};

    if (!siteId || !hostname) {
      res.status(400).json({ success: false, message: "siteId ve hostname zorunludur." });
      return;
    }

    const plan = staticAssetsProvider.generateDeploymentPlan(siteId, Number(version), hostname);
    res.json({
      success: true,
      plan,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || "Plan oluşturulamadı." });
  }
});

/**
 * POST /api/publishing/sites/:siteId/publish
 * Generates immutable namespaced static artifact and promotes route
 */
publishingRouter.post("/sites/:siteId/publish", async (req: Request, res: Response) => {
  try {
    const { siteId } = req.params;
    const { workspaceId } = getWorkspaceContext(req);
    const { hostname, version = 1 } = req.body || {};

    const targetHostname = hostname || `${siteId}.jetkur.com.tr`;

    // 1. Fetch site
    let site = null;
    try {
      site = await siteRepository.getSiteById(siteId);
    } catch {
      // Offline
    }

    if (!site) {
      site = JSON.parse(JSON.stringify(sampleCanonicalSite));
      site.id = siteId;
      site.workspaceId = workspaceId;
    }

    // 2. Generate canonical production files
    const config = toSiteConfig(site);
    (config as any).deploymentVersion = version;
    const files = generateProductionSiteFiles(config);
    const fingerprint = computeSiteFingerprint(site);

    // 3. Compile immutable namespaced artifact (sites/<siteId>/v<version>/)
    const artifact = staticAssetsProvider.prepareArtifact(
      siteId,
      Number(version),
      fingerprint,
      files
    );

    // 4. Publish / route mapping (DRY_RUN by default)
    const result = await staticAssetsProvider.publishArtifact(
      siteId,
      Number(version),
      targetHostname,
      artifact
    );

    res.json({
      success: result.success,
      mode: result.mode,
      message: result.message,
      artifactPrefix: artifact.namespacePrefix,
      filesCount: artifact.filesCount,
      totalSizeBytes: artifact.totalSizeBytes,
      routingManifestEntry: staticAssetsProvider.getManifestStore().resolveRoute(targetHostname),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || "Yayınlama başarısız." });
  }
});

export default publishingRouter;
