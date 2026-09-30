/**
 * JetKur Cloudflare Static Assets & Edge Publishing Types (Sprint 16.1)
 *
 * Core Principle:
 * "Customer static sites JetKur SaaS dashboard runtime'ına bağımlı olmamalıdır.
 * 100 müşteri için 100 ayrı worker/pages değil; tek shared static assets mimarisi kullanılır."
 */

import { DeploymentExecutionMode } from "../domain/types";

/**
 * Cloudflare Workers Static Assets Verified Limits & Constants (Sprint 16.2.1)
 *
 * Workers Free:
 * - STATIC_ASSET_FILES_PER_WORKER_VERSION = 20,000 files
 * - MAX_INDIVIDUAL_STATIC_ASSET_SIZE = 25 MiB (26,214,400 bytes) per individual file
 * - TOTAL_DEPLOYMENT_25_MIB_LIMIT_EXISTS = false (25 MiB applies per individual asset, NOT total bundle)
 */
export const STATIC_ASSET_FILES_PER_WORKER_VERSION = 20_000;
export const MAX_INDIVIDUAL_STATIC_ASSET_SIZE = 25 * 1024 * 1024; // 25 MiB
export const TOTAL_DEPLOYMENT_25_MIB_LIMIT_EXISTS = false;

export interface NamespacedStaticFile {
  path: string; // e.g. "sites/site-1/v2/index.html"
  filename: string; // e.g. "index.html"
  content: string;
  sizeBytes: number;
  contentType: string;
  sha256: string;
}

export interface StaticAssetArtifact {
  siteId: string;
  version: number;
  fingerprint: string;
  namespacePrefix: string; // e.g. "sites/site-1/v2"
  files: NamespacedStaticFile[];
  totalSizeBytes: number;
  filesCount: number;
  createdAt: string;
}

export interface RoutingManifestEntry {
  siteId: string;
  version: number;
  fingerprint: string;
  artifactPrefix: string; // e.g. "sites/site-1/v2"
  canonicalUrl: string;
  publishedAt: string;
}

export type RoutingManifest = Record<string, RoutingManifestEntry>;

export interface DeploymentMarker {
  siteId: string;
  version: number;
  fingerprint: string;
  publishedAt: string;
}

export interface DeploymentPlanStep {
  step: number;
  action:
    | "PREPARE_STATIC_ARTIFACT"
    | "VALIDATE_ASSET_INVARIANTS"
    | "ATOMIC_UPLOAD"
    | "UPDATE_ROUTING_MANIFEST"
    | "VERIFY_DEPLOYMENT"
    | "PROMOTE_LIVE";
  target: string;
  description: string;
  executionMode: DeploymentExecutionMode;
}

export interface DeploymentPlanResult {
  siteId: string;
  version: number;
  hostname: string;
  mode: DeploymentExecutionMode;
  artifactPrefix: string;
  steps: DeploymentPlanStep[];
  readyForExecution: boolean;
  dnsRequirements: {
    hostname: string;
    recordType: "CNAME" | "A";
    target: string;
    proxied: boolean;
  }[];
}

export interface DeploymentVerificationResult {
  verified: boolean;
  hostname: string;
  statusCode?: number;
  markerFound?: DeploymentMarker;
  error?: string;
  latencyMs?: number;
}

export interface UsageObservabilityMetrics {
  publishedSites: number;
  activeHostnames: number;
  artifactCount: number;
  artifactBytes: number;
  publishCount: number;
  publishFailures: number;
  lastUpdated: string;
}
