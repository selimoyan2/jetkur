/**
 * JetKur Canonical Domain & Publishing Architecture Types (Sprint 16)
 *
 * Core Principle:
 * "Domain != Deployment. Domain bir routing/hostname kimliğidir.
 * Deployment ise belirli bir yayınlanmış sürümün artefaktıdır."
 */

export type DomainType = "JETKUR_SUBDOMAIN" | "CUSTOM_DOMAIN" | "PREVIEW_DOMAIN";

export type DomainStatus =
  | "PENDING"
  | "AWAITING_DNS"
  | "VERIFYING"
  | "VERIFIED"
  | "ACTIVATING"
  | "ACTIVE"
  | "FAILED"
  | "DISCONNECTED";

export type SslStatus = "UNKNOWN" | "PENDING" | "ACTIVE" | "FAILED";

export type DeploymentExecutionMode = "REAL" | "DRY_RUN" | "SIMULATED" | "UNAVAILABLE";

export interface DnsInstructionRecord {
  type: "TXT" | "CNAME" | "A";
  name: string;
  value: string;
  ttl?: number;
  description: string;
}

export interface DomainRecord {
  id: string;
  siteId: string;
  workspaceId: string;
  hostname: string; // e.g. "aksoy-tesisat.jetkur.com.tr" or "aksoytesisat.com"
  apexHostname?: string; // e.g. "aksoytesisat.com"
  type: DomainType;
  status: DomainStatus;
  sslStatus: SslStatus;
  isPrimary: boolean;
  verificationToken?: string;
  verificationTxtRecord?: DnsInstructionRecord;
  cnameTarget?: string;
  dnsInstructions?: DnsInstructionRecord[];
  failureReason?: string;
  verifiedAt?: string;
  activatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DomainAuditEvent {
  id: string;
  siteId: string;
  workspaceId: string;
  hostname: string;
  eventType:
    | "DOMAIN_ADDED"
    | "DOMAIN_VERIFICATION_STARTED"
    | "DOMAIN_VERIFIED"
    | "DOMAIN_ACTIVATION_STARTED"
    | "DOMAIN_ACTIVATED"
    | "DOMAIN_FAILED"
    | "DOMAIN_DISCONNECTED"
    | "PRIMARY_DOMAIN_CHANGED";
  details?: Record<string, any>;
  timestamp: string;
}
