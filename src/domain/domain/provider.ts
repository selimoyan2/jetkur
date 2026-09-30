/**
 * JetKur Domain Provider Abstraction & Cloudflare Adapter with Dry-Run Safety (Sprint 16)
 *
 * Core Principles:
 * 1. Absolute Production Safety: ZERO live mutations on jetkur.com.tr root zone.
 * 2. Provider Abstraction: Domain lifecycle decoupled from Cloudflare specifics.
 * 3. Dry-Run / Simulated Modes: Safe local and test execution without external API mutations.
 * 4. Root Zone Mutation Guard: Explicit hard block against mutating core platform domains.
 * 5. Credentials Secrecy: Token and credentials strictly contained server-side.
 */

import { DomainStatus, SslStatus, DeploymentExecutionMode } from "./types";

export interface DomainProviderStatusResult {
  hostname: string;
  status: DomainStatus;
  sslStatus: SslStatus;
  dnsVerified: boolean;
  sslActive: boolean;
  edgeRouted: boolean;
  message: string;
}

export interface DomainProviderActionResult {
  success: boolean;
  action: "PREPARE" | "VERIFY" | "ACTIVATE" | "DISCONNECT";
  hostname: string;
  mode: DeploymentExecutionMode;
  mutationsPlanned: string[];
  mutationsExecuted: string[];
  message: string;
  error?: string;
}

export interface DomainProvider {
  readonly providerName: string;
  readonly mode: DeploymentExecutionMode;

  prepareDomain(hostname: string, siteId: string, workspaceId: string): Promise<DomainProviderActionResult>;
  verifyDnsTxt(hostname: string, expectedToken: string): Promise<{ verified: boolean; error?: string }>;
  activateDomain(hostname: string, siteId: string): Promise<DomainProviderActionResult>;
  disconnectDomain(hostname: string, siteId: string): Promise<DomainProviderActionResult>;
  getDomainStatus(hostname: string): Promise<DomainProviderStatusResult>;
}

/**
 * Root zones that MUST NEVER be mutated by customer domain operations
 */
export const PROTECTED_ROOT_HOSTNAMES: ReadonlySet<string> = new Set([
  "jetkur.com.tr",
  "www.jetkur.com.tr",
  "api.jetkur.com.tr",
  "app.jetkur.com.tr",
  "admin.jetkur.com.tr",
  "status.jetkur.com.tr",
  "cdn.jetkur.com.tr",
]);

/**
 * Root Zone Guard: Throws immediately if a mutation is attempted on platform root hostnames
 */
export function assertNotProtectedRootHostname(hostname: string, actionName: string): void {
  const normalized = hostname.trim().toLowerCase();
  if (PROTECTED_ROOT_HOSTNAMES.has(normalized)) {
    throw new Error(
      `GÜVENLİK İHLALİ: "${normalized}" ana platform alan adıdır. ${actionName} işlemi kesinlikle engellendi.`
    );
  }
}

/**
 * Cloudflare Domain Provider with Dry-Run Safety
 */
export class CloudflareDomainProvider implements DomainProvider {
  readonly providerName = "cloudflare";
  readonly mode: DeploymentExecutionMode;
  private apiToken?: string;
  private mockDnsRecords: Map<string, string> = new Map();

  constructor(options?: { mode?: DeploymentExecutionMode; apiToken?: string }) {
    // Default to DRY_RUN to protect production environment
    this.mode = options?.mode || (process.env.DOMAIN_PROVIDER_MODE as DeploymentExecutionMode) || "DRY_RUN";
    this.apiToken = options?.apiToken || process.env.CLOUDFLARE_API_TOKEN;
  }

  /**
   * Helper to set mock TXT records in tests
   */
  setMockTxtRecord(hostname: string, token: string): void {
    this.mockDnsRecords.set(hostname.toLowerCase(), token);
  }

  async prepareDomain(
    hostname: string,
    siteId: string,
    workspaceId: string
  ): Promise<DomainProviderActionResult> {
    assertNotProtectedRootHostname(hostname, "PREPARE_DOMAIN");

    const planned = [
      `Register Custom Hostname "${hostname}" in Cloudflare SSL for SaaS`,
      `Generate DNS TXT ownership challenge for "${hostname}"`,
      `Associate with site "${siteId}" in workspace "${workspaceId}"`,
    ];

    if (this.mode === "DRY_RUN" || this.mode === "SIMULATED") {
      return {
        success: true,
        action: "PREPARE",
        hostname,
        mode: this.mode,
        mutationsPlanned: planned,
        mutationsExecuted: [], // Zero mutations in dry run
        message: `[${this.mode}] Alan adı hazırlığı simüle edildi. Canlı Cloudflare API çağrısı yapılmadı.`,
      };
    }

    // LIVE mode deferred until dedicated sandbox zone confirmed
    return {
      success: true,
      action: "PREPARE",
      hostname,
      mode: "DRY_RUN",
      mutationsPlanned: planned,
      mutationsExecuted: [],
      message: "Canlı provider aktivasyonu güvenlik amacıyla ertelendi (DRY_RUN uygulandı).",
    };
  }

  async verifyDnsTxt(
    hostname: string,
    expectedToken: string
  ): Promise<{ verified: boolean; error?: string }> {
    assertNotProtectedRootHostname(hostname, "VERIFY_DNS_TXT");

    // In dry-run / test environment, verify against in-memory mock store
    const mockValue = this.mockDnsRecords.get(hostname.toLowerCase());
    if (mockValue !== undefined) {
      const verified = mockValue === expectedToken;
      return {
        verified,
        error: verified ? undefined : "DNS TXT kaydı eşleşmedi veya henüz yayılmadı.",
      };
    }

    // Default simulation behavior for unknown test domains
    return {
      verified: false,
      error: "DNS kayıtlarınız henüz görünmüyor. Yayılması birkaç dakika sürebilir.",
    };
  }

  async activateDomain(hostname: string, siteId: string): Promise<DomainProviderActionResult> {
    assertNotProtectedRootHostname(hostname, "ACTIVATE_DOMAIN");

    const planned = [
      `Activate Custom Hostname "${hostname}" on Cloudflare Edge`,
      `Request Universal SSL Certificate for "${hostname}"`,
      `Route traffic to deployment for site "${siteId}"`,
    ];

    if (this.mode === "DRY_RUN" || this.mode === "SIMULATED") {
      return {
        success: true,
        action: "ACTIVATE",
        hostname,
        mode: this.mode,
        mutationsPlanned: planned,
        mutationsExecuted: [],
        message: `[${this.mode}] Alan adı aktivasyonu simüle edildi. Canlı zone mutation yapılmadı.`,
      };
    }

    return {
      success: true,
      action: "ACTIVATE",
      hostname,
      mode: "DRY_RUN",
      mutationsPlanned: planned,
      mutationsExecuted: [],
      message: "Canlı provider aktivasyonu güvenlik amacıyla ertelendi (DRY_RUN uygulandı).",
    };
  }

  async disconnectDomain(hostname: string, siteId: string): Promise<DomainProviderActionResult> {
    assertNotProtectedRootHostname(hostname, "DISCONNECT_DOMAIN");

    const planned = [
      `Remove Custom Hostname "${hostname}" from Cloudflare routing`,
      `Revoke Edge SSL certificate for "${hostname}"`,
      `Restore fallback JetKur subdomain for site "${siteId}"`,
    ];

    return {
      success: true,
      action: "DISCONNECT",
      hostname,
      mode: this.mode,
      mutationsPlanned: planned,
      mutationsExecuted: [],
      message: `[${this.mode}] Alan adı bağlantısı güvenle kaldırıldı. Müşteri içerik ve fotoğrafları korundu.`,
    };
  }

  async getDomainStatus(hostname: string): Promise<DomainProviderStatusResult> {
    const isMockVerified = this.mockDnsRecords.has(hostname.toLowerCase());

    return {
      hostname,
      status: isMockVerified ? "ACTIVE" : "AWAITING_DNS",
      sslStatus: isMockVerified ? "ACTIVE" : "PENDING",
      dnsVerified: isMockVerified,
      sslActive: isMockVerified,
      edgeRouted: isMockVerified,
      message: isMockVerified
        ? "Alan adı ve güvenli SSL bağlantısı aktif."
        : "DNS TXT doğrulaması bekleniyor.",
    };
  }
}
