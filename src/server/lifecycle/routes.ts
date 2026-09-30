/**
 * JetKur Canonical Customer Site Lifecycle API Routes (Sprint 13)
 *
 * Exposes server-authoritative publish, status, preview, and rollback endpoints.
 */

import { Router, Request, Response } from "express";
import { publishService, PublishServiceError } from "./publishService";
import { siteRepository } from "../db/siteRepository";
import { toSiteConfig } from "../../domain/site/legacyAdapter";
import { generateProductionPreviewHtml } from "../../utils/productionGeneratorBridge";

export const lifecycleRouter = Router();

/**
 * Middleware: Resolves workspaceId from header or query or context
 */
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
 * POST /api/lifecycle/sites/:siteId/publish
 * Executes atomic publish pipeline
 */
lifecycleRouter.post("/sites/:siteId/publish", async (req: Request, res: Response) => {
  try {
    const { siteId } = req.params;
    const { workspaceId, userId } = getWorkspaceContext(req);
    const { idempotencyToken, forceRebuild } = req.body || {};

    const result = await publishService.publishSite(siteId, {
      workspaceId,
      userId,
      idempotencyToken,
      forceRebuild: Boolean(forceRebuild),
    });

    const statusCode = result.success ? 200 : result.code === "PUBLISH_IN_PROGRESS" ? 409 : 400;
    res.status(statusCode).json(result);
  } catch (err: any) {
    if (err instanceof PublishServiceError) {
      res.status(err.statusCode).json({
        success: false,
        code: err.code,
        message: err.message,
        liveSitePreserved: true,
      });
      return;
    }
    res.status(500).json({
      success: false,
      code: "INTERNAL_ERROR",
      message: err?.message || "Sunucu hatası oluştu.",
      liveSitePreserved: true,
    });
  }
});

/**
 * GET /api/lifecycle/sites/:siteId/status
 * Returns server-authoritative lifecycle and publish status
 */
lifecycleRouter.get("/sites/:siteId/status", async (req: Request, res: Response) => {
  try {
    const { siteId } = req.params;
    const { workspaceId } = getWorkspaceContext(req);

    const status = await publishService.getSiteLifecycleStatus(siteId, { workspaceId });
    res.json({ success: true, status });
  } catch (err: any) {
    if (err instanceof PublishServiceError) {
      res.status(err.statusCode).json({ success: false, code: err.code, message: err.message });
      return;
    }
    res.status(500).json({ success: false, code: "INTERNAL_ERROR", message: err?.message || "Sunucu hatası." });
  }
});

/**
 * GET /api/lifecycle/sites/:siteId/history
 * Returns deployment history for customer dashboard
 */
lifecycleRouter.get("/sites/:siteId/history", async (req: Request, res: Response) => {
  try {
    const { siteId } = req.params;
    const limit = req.query.limit ? Number(req.query.limit) : 5;

    const history = await publishService.getDeploymentHistory(siteId, limit);
    res.json({ success: true, history });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || "Geçmiş yüklenemedi." });
  }
});

/**
 * POST /api/lifecycle/sites/:siteId/rollback
 * Restores past snapshot to live without deleting customer draft
 */
lifecycleRouter.post("/sites/:siteId/rollback", async (req: Request, res: Response) => {
  try {
    const { siteId } = req.params;
    const { workspaceId, userId } = getWorkspaceContext(req);
    const { targetVersion } = req.body || {};

    if (!targetVersion || typeof targetVersion !== "number") {
      res.status(400).json({ success: false, message: "Hedef sürüm numarası (targetVersion) zorunludur." });
      return;
    }

    const result = await publishService.rollbackToVersion(siteId, targetVersion, {
      workspaceId,
      userId,
    });

    res.json(result);
  } catch (err: any) {
    if (err instanceof PublishServiceError) {
      res.status(err.statusCode).json({ success: false, code: err.code, message: err.message });
      return;
    }
    res.status(500).json({ success: false, message: err?.message || "Geri alma başarısız oldu." });
  }
});

/**
 * GET /api/lifecycle/sites/:siteId/preview
 * Renders current DRAFT using the exact canonical production renderer
 * PREVIEW_RENDERER == PRODUCTION_RENDERER
 */
lifecycleRouter.get("/sites/:siteId/preview", async (req: Request, res: Response) => {
  try {
    const { siteId } = req.params;
    const site = await siteRepository.getSiteById(siteId);

    if (!site) {
      res.status(404).send("<h1>Site bulunamadı</h1>");
      return;
    }

    const legacyConfig = toSiteConfig(site);
    const previewHtml = generateProductionPreviewHtml(legacyConfig);

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.send(previewHtml);
  } catch (err: any) {
    res.status(500).send(`<h1>Önizleme oluşturulamadı</h1><p>${err?.message || ""}</p>`);
  }
});

export default lifecycleRouter;
