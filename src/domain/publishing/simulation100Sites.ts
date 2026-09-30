/**
 * JetKur 100-Customer Site Multi-Tenant Simulation Engine (Sprint 16.2)
 *
 * Simulates:
 * 1. 100 independent SME sites deployed into the single shared Cloudflare Static Assets layer.
 * 2. Immutable namespacing: sites/site-<N>/v1/
 * 3. Total file count, asset bytes, and manifest footprint measurements.
 * 4. Site #37 update from v1 to v2: verifies that the other 99 sites' routes and artifacts
 *    remain 100% untouched and preserved.
 */

import { RoutingManifestStore } from "./manifest";
import { CloudflareStaticAssetsProvider, StaticFileCandidate } from "./provider";

export interface SimulationResult {
  simulatedSiteCount: number;
  simulatedTotalFiles: number;
  simulatedArtifactBytes: number;
  routingManifestBytes: number;
  site37UpdatePreservesOthers: boolean;
  site37VersionBefore: number;
  site37VersionAfter: number;
  unaffectedSitesVerifiedCount: number;
}

/**
 * Runs a deterministic simulation of 100 customer sites on the shared static layer
 */
export function run100SitesSimulation(): SimulationResult {
  const manifestStore = new RoutingManifestStore();
  const provider = new CloudflareStaticAssetsProvider({
    mode: "DRY_RUN",
    manifestStore,
  });

  let totalFiles = 0;
  let totalBytes = 0;

  // 1. Seed 100 initial sites at Version 1
  for (let i = 1; i <= 100; i++) {
    const siteId = `site-cust-${i}`;
    const hostname = `musteri-${i}.jetkur.com.tr`;
    const version = 1;

    // Simulate 6 canonical files per site
    const files: StaticFileCandidate[] = [
      {
        filename: "index.html",
        content: `<!DOCTYPE html><html><head><title>Müşteri ${i}</title></head><body><h1>Hoşgeldiniz ${i}</h1></body></html>`,
      },
      {
        filename: "assets/site.css",
        content: `:root { --primary: #1e${(i % 90) + 10}a8; } body { margin: 0; }`,
      },
      {
        filename: "hakkimizda.html",
        content: `<!DOCTYPE html><html><body><h1>Hakkımızda ${i}</h1></body></html>`,
      },
      {
        filename: "hizmetler.html",
        content: `<!DOCTYPE html><html><body><h1>Hizmetlerimiz ${i}</h1></body></html>`,
      },
      {
        filename: "robots.txt",
        content: `User-agent: *\nAllow: /\nSitemap: https://${hostname}/sitemap.xml`,
      },
      {
        filename: "sitemap.xml",
        content: `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://${hostname}/</loc></url></urlset>`,
      },
    ];

    const artifact = provider.prepareArtifact(siteId, version, `fp_initial_${i}`, files);
    totalFiles += artifact.filesCount;
    totalBytes += artifact.totalSizeBytes;

    manifestStore.setRoute(
      hostname,
      siteId,
      version,
      artifact.fingerprint,
      `https://${hostname}`
    );
  }

  // 2. Measure state of Customer #37 before update
  const site37Hostname = "musteri-37.jetkur.com.tr";
  const site37Before = manifestStore.resolveRoute(site37Hostname);
  const versionBefore = site37Before?.version || 1;

  // Snapshot manifest state of all other 99 sites before Site #37 update
  const manifestBefore = manifestStore.toJson();

  // 3. Customer #37 publishes an update (v1 -> v2)
  const site37Id = "site-cust-37";
  const v2Version = 2;
  const v2Files: StaticFileCandidate[] = [
    {
      filename: "index.html",
      content: `<!DOCTYPE html><html><head><title>Müşteri 37 (Güncellendi)</title></head><body><h1>Yeni Kampanya</h1></body></html>`,
    },
    {
      filename: "assets/site.css",
      content: `:root { --primary: #ea580c; } body { margin: 0; }`,
    },
    {
      filename: "hakkimizda.html",
      content: `<!DOCTYPE html><html><body><h1>Hakkımızda 37 v2</h1></body></html>`,
    },
    {
      filename: "hizmetler.html",
      content: `<!DOCTYPE html><html><body><h1>Hizmetlerimiz 37 v2</h1></body></html>`,
    },
    {
      filename: "robots.txt",
      content: `User-agent: *\nAllow: /\nSitemap: https://${site37Hostname}/sitemap.xml`,
    },
    {
      filename: "sitemap.xml",
      content: `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://${site37Hostname}/</loc></url></urlset>`,
    },
  ];

  const v2Artifact = provider.prepareArtifact(site37Id, v2Version, "fp_updated_37_v2", v2Files);
  totalFiles += v2Artifact.filesCount;
  totalBytes += v2Artifact.totalSizeBytes;

  // Atomically update route for customer 37
  manifestStore.setRoute(
    site37Hostname,
    site37Id,
    v2Version,
    v2Artifact.fingerprint,
    `https://${site37Hostname}`
  );

  const site37After = manifestStore.resolveRoute(site37Hostname);
  const versionAfter = site37After?.version || 2;

  // 4. Verify that the other 99 sites were NOT modified
  let unaffectedCount = 0;
  for (let i = 1; i <= 100; i++) {
    if (i === 37) continue;
    const host = `musteri-${i}.jetkur.com.tr`;
    const beforeEntry = manifestBefore[host];
    const afterEntry = manifestStore.resolveRoute(host);

    if (
      beforeEntry &&
      afterEntry &&
      beforeEntry.siteId === afterEntry.siteId &&
      beforeEntry.version === afterEntry.version &&
      beforeEntry.artifactPrefix === afterEntry.artifactPrefix &&
      beforeEntry.fingerprint === afterEntry.fingerprint
    ) {
      unaffectedCount++;
    }
  }

  const manifestBytes = Buffer.byteLength(JSON.stringify(manifestStore.toJson()), "utf8");

  return {
    simulatedSiteCount: 100,
    simulatedTotalFiles: totalFiles,
    simulatedArtifactBytes: totalBytes,
    routingManifestBytes: manifestBytes,
    site37UpdatePreservesOthers: unaffectedCount === 99,
    site37VersionBefore: versionBefore,
    site37VersionAfter: versionAfter,
    unaffectedSitesVerifiedCount: unaffectedCount,
  };
}
