/**
 * JetKur Edge Routing Manifest Engine (Sprint 16.1)
 *
 * Architectural Invariant:
 * "Customer request başına PostgreSQL query YAPMA.
 * Hostname routing: edge-compatible manifest veya static mapping üzerinden yapılmalıdır.
 * Manifestte: PII, secret, API token, DB credential OLMAMALIDIR."
 */

import { RoutingManifest, RoutingManifestEntry } from "./types";
import { normalizeCustomHostname } from "../domain/customDomain";

export class RoutingManifestStore {
  private manifest: RoutingManifest = {};

  constructor(initialManifest?: RoutingManifest) {
    if (initialManifest) {
      this.manifest = JSON.parse(JSON.stringify(initialManifest));
    }
  }

  /**
   * Sanitizes a site ID and version to prevent directory traversal
   */
  static sanitizeNamespace(siteId: string, version: number): string {
    const cleanSiteId = siteId.replace(/[^a-zA-Z0-9-_]/g, "");
    if (!cleanSiteId) throw new Error("Geçersiz site ID");
    const cleanVersion = Math.max(1, Math.floor(version));
    return `sites/${cleanSiteId}/v${cleanVersion}`;
  }

  /**
   * Registers or updates a hostname mapping in the edge routing manifest
   */
  setRoute(
    hostname: string,
    siteId: string,
    version: number,
    fingerprint: string,
    canonicalUrl: string
  ): RoutingManifestEntry {
    const normalizedHost = normalizeCustomHostname(hostname);
    if (!normalizedHost) throw new Error("Geçersiz hostname");

    const artifactPrefix = RoutingManifestStore.sanitizeNamespace(siteId, version);

    // Guaranteed PII-free, secret-free metadata
    const entry: RoutingManifestEntry = {
      siteId,
      version,
      fingerprint,
      artifactPrefix,
      canonicalUrl,
      publishedAt: new Date().toISOString(),
    };

    this.manifest[normalizedHost] = entry;
    return entry;
  }

  /**
   * Removes a hostname mapping from the manifest (e.g. on domain disconnect)
   */
  removeRoute(hostname: string): boolean {
    const normalizedHost = normalizeCustomHostname(hostname);
    if (this.manifest[normalizedHost]) {
      delete this.manifest[normalizedHost];
      return true;
    }
    return false;
  }

  /**
   * Resolves an incoming HTTP hostname to its immutable artifact prefix
   * Fast, in-memory O(1) lookup with zero database roundtrips
   */
  resolveRoute(hostname: string): RoutingManifestEntry | null {
    const normalized = normalizeCustomHostname(hostname);

    // 1. Direct exact match (e.g. "demo.jetkur.com.tr" or "www.aksoytesisat.com")
    if (this.manifest[normalized]) {
      return this.manifest[normalized];
    }

    // 2. Apex / WWW reciprocal fallback
    if (normalized.startsWith("www.")) {
      const apex = normalized.replace(/^www\./, "");
      if (this.manifest[apex]) return this.manifest[apex];
    } else {
      const www = `www.${normalized}`;
      if (this.manifest[www]) return this.manifest[www];
    }

    return null;
  }

  /**
   * Serializes the manifest into sanitized, edge-compatible JSON
   */
  toJson(): RoutingManifest {
    return JSON.parse(JSON.stringify(this.manifest));
  }

  /**
   * Count of active routing entries
   */
  get activeRoutesCount(): number {
    return Object.keys(this.manifest).length;
  }
}

export const globalRoutingManifest = new RoutingManifestStore();
