/**
 * JetKur Canonical Customer Site Lifecycle & Safe Publishing Types (Sprint 13)
 *
 * Core Product Principle:
 * "Kullanıcı web sitesi yapmayacak. İşletmesini anlatacak; JetKur web sitesini yapacak."
 *
 * Lifecycle Formula:
 * DRAFT -> PREVIEW -> PUBLISH -> LIVE -> UPDATE -> REPUBLISH
 * and on demand: ROLLBACK
 */

import { CanonicalSite } from "../site/site";

export type SiteLifecycleState =
  | "DRAFT"
  | "PUBLISHING"
  | "LIVE"
  | "PUBLISH_FAILED"
  | "ARCHIVED";

export type CustomerPublishStatus =
  | "LIVE" // Site is live, draft is identical to live (Site Güncel)
  | "UNPUBLISHED_CHANGES" // Live version exists, but current draft has unsaved/unpublished modifications
  | "DRAFT_ONLY" // Never published yet
  | "PUBLISHING" // Currently running atomic publish pipeline
  | "PUBLISH_FAILED"; // Last publish failed, live version safely preserved

export interface ArtifactPageMetadata {
  path: string;
  sizeBytes: number;
  sha256: string;
}

export interface ArtifactMetadata {
  filesCount: number;
  totalSizeBytes: number;
  pages: ArtifactPageMetadata[];
  tailwindCdnCount: number;
  runtimeCssFrameworksCount: number;
  reactRuntimeInCustomerSiteCount: number;
  brandRuntimeJsBytes: number;
  generatedAt: string;
}

export interface PublishedSnapshot {
  id: string;
  siteId: string;
  version: number;
  createdAt: string;
  publishedAt: string;
  fingerprint: string;
  templateId: string;
  industryPackVersion: string;
  canonicalSiteSnapshot: CanonicalSite;
  artifactMetadata: ArtifactMetadata;
  deploymentId: string;
  productionUrl: string;
  previewUrl?: string;
  isLive: boolean;
  rolledBackFromVersion?: number;
}

export interface PublishResult {
  success: boolean;
  code:
    | "PUBLISHED"
    | "NO_CHANGES_TO_PUBLISH"
    | "PUBLISH_IN_PROGRESS"
    | "VALIDATION_FAILED"
    | "GENERATION_FAILED"
    | "DEPLOYMENT_FAILED"
    | "VERIFICATION_FAILED"
    | "UNAUTHORIZED"
    | "ENTITLEMENT_LIMIT_EXCEEDED";
  message: string;
  version?: number;
  snapshotId?: string;
  productionUrl?: string;
  fingerprint?: string;
  liveSitePreserved: boolean;
  executionTimeMs: number;
  errorDetails?: string;
}

export interface RollbackResult {
  success: boolean;
  message: string;
  targetVersion: number;
  restoredSnapshotId: string;
  draftPreserved: boolean;
  newLiveVersion: number;
  executionTimeMs: number;
}

export interface CustomerDeploymentHistoryItem {
  id: string;
  version: number;
  publishedAt: string;
  relativeTime: string;
  status: "LIVE" | "SUPERSEDED" | "ROLLED_BACK" | "FAILED";
  displayStatus: string;
  productionUrl?: string;
  isCurrentLive: boolean;
  canRollback: boolean;
  summary: {
    templateName: string;
    pageCount: number;
    totalSizeBytes: number;
  };
}

export interface SiteLifecycleInfo {
  siteId: string;
  lifecycleState: SiteLifecycleState;
  customerStatus: CustomerPublishStatus;
  statusLabel: string;
  statusDescription: string;
  hasUnpublishedChanges: boolean;
  currentLiveVersion?: number;
  currentLiveUrl?: string;
  lastPublishedAt?: string;
  draftFingerprint: string;
  liveFingerprint?: string;
  isPublishLocked: boolean;
  canPublish: boolean;
  canRollback: boolean;
}
