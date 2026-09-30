/**
 * JetKur Aggregate Active Asset Deployment & Edge Desired State Planner (Sprint 16.3)
 *
 * Core Architectural Invariant:
 * "A Cloudflare Worker deployment must represent the COMPLETE desired state of the shared customer-site layer.
 * Publishing Site B must NEVER remove Site A.
 * Publishing a new version of Site A must NEVER remove Sites B-Z.
 * The candidate target site must replace ONLY its previous active version in the desired state.
 * All other active sites must remain byte/logically identical."
 */

import {
  STATIC_ASSET_FILES_PER_WORKER_VERSION,
  MAX_INDIVIDUAL_STATIC_ASSET_SIZE,
  NamespacedStaticFile,
  RoutingManifest,
  RoutingManifestEntry,
} from "./types";
import { normalizeCustomHostname } from "../domain/customDomain";

export interface ActiveSiteDeploymentState {
  siteId: string;
  version: number;
  fingerprint: string;
  hostname: string;
  artifactPrefix: string;
  files: NamespacedStaticFile[];
  canonicalUrl: string;
  publishedAt: string;
}

export interface EdgeDesiredState {
  revision: number;
  updatedAt: string;
  targetSiteId: string;
  activeSites: Record<string, ActiveSiteDeploymentState>;
  routingManifest: RoutingManifest;
  completeAssetManifest: Record<string, { hash: string; size: number }>;
  filesByHash: Map<string, string>; // hash -> file content
  // Aggregate observability metrics
  activeSiteCount: number;
  totalAssetCount: number;
  totalAssetBytes: number;
  largestAssetBytes: number;
  routingManifestBytes: number;
}

export class AggregateDesiredStatePlanner {
  private activeSitesRegistry: Map<string, ActiveSiteDeploymentState> = new Map();
  private revision = 0;

  constructor(initialActiveSites?: ActiveSiteDeploymentState[]) {
    if (initialActiveSites) {
      for (const site of initialActiveSites) {
        this.activeSitesRegistry.set(site.siteId, site);
      }
    }
  }

  /**
   * Retrieves all currently active sites from the authoritative state
   */
  getActiveSites(): ActiveSiteDeploymentState[] {
    return Array.from(this.activeSitesRegistry.values());
  }

  /**
   * Registers or updates an active site in the planner's state
   */
  setActiveSite(site: ActiveSiteDeploymentState): void {
    this.activeSitesRegistry.set(site.siteId, site);
  }

  /**
   * Removes an active site from edge routing (e.g. on unpublish or deletion)
   */
  removeActiveSite(siteId: string): boolean {
    return this.activeSitesRegistry.delete(siteId);
  }

  /**
   * Constructs the COMPLETE desired edge state by merging all currently active sites
   * with the candidate site version.
   *
   * Enforces:
   * 1. 20,000 files limit guard
   * 2. 25 MiB individual file size limit guard
   * 3. Content deduplication by hash
   * 4. PII/secret scrubbing from routing manifest
   */
  buildDesiredState(candidate: ActiveSiteDeploymentState): EdgeDesiredState {
    this.revision++;
    const nowIso = new Date().toISOString();

    // 1. Clone currently active sites and update/insert the candidate site
    const activeSitesMap: Record<string, ActiveSiteDeploymentState> = {};
    for (const [sId, existingSite] of this.activeSitesRegistry.entries()) {
      if (sId !== candidate.siteId) {
        // Unchanged existing site: preserved 100% byte-identical
        activeSitesMap[sId] = existingSite;
      }
    }
    // Candidate replaces ONLY its own prior version
    activeSitesMap[candidate.siteId] = candidate;

    // 2. Build complete Routing Manifest & Asset Sets across ALL active sites
    const routingManifest: RoutingManifest = {};
    const completeAssetManifest: Record<string, { hash: string; size: number }> = {};
    const filesByHash = new Map<string, string>();

    let totalAssetBytes = 0;
    let largestAssetBytes = 0;

    for (const siteState of Object.values(activeSitesMap)) {
      const normalizedHost = normalizeCustomHostname(siteState.hostname);
      if (!normalizedHost) continue;

      // PII-free routing manifest entry
      const manifestEntry: RoutingManifestEntry = {
        siteId: siteState.siteId,
        version: siteState.version,
        fingerprint: siteState.fingerprint,
        artifactPrefix: siteState.artifactPrefix,
        canonicalUrl: siteState.canonicalUrl || `https://${normalizedHost}`,
        publishedAt: siteState.publishedAt,
      };

      routingManifest[normalizedHost] = manifestEntry;

      // Collect static files for this site
      for (const file of siteState.files) {
        // SIZE GUARD: Individual asset must not exceed 25 MiB
        if (file.sizeBytes > MAX_INDIVIDUAL_STATIC_ASSET_SIZE) {
          throw new Error(
            `Kritik Limit Aşımı: "${file.filename}" dosyası ${file.sizeBytes} byte. Tekil dosya sınırı 25 MiB (${MAX_INDIVIDUAL_STATIC_ASSET_SIZE} byte).`
          );
        }

        totalAssetBytes += file.sizeBytes;
        if (file.sizeBytes > largestAssetBytes) {
          largestAssetBytes = file.sizeBytes;
        }

        // Relative path within the Worker static assets bundle
        const assetPath = file.path.startsWith("/") ? file.path.slice(1) : file.path;
        completeAssetManifest[assetPath] = {
          hash: file.sha256,
          size: file.sizeBytes,
        };

        // Map content for bucket upload (deduplicated by sha256)
        filesByHash.set(file.sha256, file.content);
      }
    }

    const totalAssetCount = Object.keys(completeAssetManifest).length;

    // COUNT GUARD: Total static files must not exceed 20,000 files
    if (totalAssetCount > STATIC_ASSET_FILES_PER_WORKER_VERSION) {
      throw new Error(
        `Kritik Limit Aşımı: Toplam statik dosya sayısı ${totalAssetCount} oldu. Cloudflare Worker sürümü başına sınır ${STATIC_ASSET_FILES_PER_WORKER_VERSION} dosyadır.`
      );
    }

    const routingManifestBytes = Buffer.byteLength(JSON.stringify(routingManifest), "utf8");

    const desiredState: EdgeDesiredState = {
      revision: this.revision,
      updatedAt: nowIso,
      targetSiteId: candidate.siteId,
      activeSites: activeSitesMap,
      routingManifest,
      completeAssetManifest,
      filesByHash,
      activeSiteCount: Object.keys(activeSitesMap).length,
      totalAssetCount,
      totalAssetBytes,
      largestAssetBytes,
      routingManifestBytes,
    };

    return desiredState;
  }

  /**
   * Commits the desired state to the internal registry after successful deployment
   */
  commitDesiredState(desiredState: EdgeDesiredState): void {
    this.activeSitesRegistry.clear();
    for (const [siteId, site] of Object.entries(desiredState.activeSites)) {
      this.activeSitesRegistry.set(siteId, site);
    }
  }
}

export const globalDesiredStatePlanner = new AggregateDesiredStatePlanner();
