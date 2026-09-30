/**
 * JetKur Domain Ownership Verification Engine (Sprint 16)
 *
 * Implements:
 * 1. Cryptographically secure DNS TXT challenge token generation
 * 2. Standardized DNS TXT challenge record format (_jetkur-verify.<hostname>)
 * 3. Routing CNAME instructions
 * 4. Rate-limited DNS verification mechanism
 * 5. Provider-independent DNS lookup abstraction
 */

import crypto from "crypto";
import { DnsInstructionRecord } from "./types";

export const JETKUR_ROUTING_CNAME_TARGET = "cname.jetkur.com.tr";

/**
 * Generates a cryptographically secure, unguessable ownership challenge token
 */
export function generateVerificationToken(siteId: string, hostname: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .createHmac("sha256", salt)
    .update(`${siteId}:${hostname}:${Date.now()}`)
    .digest("hex")
    .substring(0, 32);

  return `jetkur-site-verification=${hash}`;
}

/**
 * Builds customer-friendly DNS instructions for a custom domain
 */
export function buildDnsInstructions(
  hostname: string,
  verificationToken: string,
  apexHostname: string
): DnsInstructionRecord[] {
  const instructions: DnsInstructionRecord[] = [];

  // 1. Ownership TXT verification record
  instructions.push({
    type: "TXT",
    name: `_jetkur-verify.${apexHostname}`,
    value: verificationToken,
    ttl: 300,
    description: "Alan adı sahipliğini doğrulamak için DNS yöneticinize bu TXT kaydını ekleyin.",
  });

  // 2. Traffic routing CNAME record (for www)
  instructions.push({
    type: "CNAME",
    name: "www",
    value: JETKUR_ROUTING_CNAME_TARGET,
    ttl: 300,
    description: "Ziyaretçileri JetKur Anycast Edge CDN ağına yönlendirmek için www kaydını oluşturun.",
  });

  // 3. Optional Apex A record recommendation (IP pointing)
  instructions.push({
    type: "A",
    name: "@",
    value: "172.67.180.20", // Cloudflare Edge Proxy Anycast IP
    ttl: 300,
    description: "Ana alan adınızı (@) www adresine otomatik yönlendirmek için A kaydını ayarlayın.",
  });

  return instructions;
}

// In-memory rate limiting store for DNS verification checks (max 1 check per 10 seconds per domain)
const LAST_VERIFICATION_CHECK = new Map<string, number>();
const VERIFICATION_RATE_LIMIT_MS = 10 * 1000; // 10 seconds

/**
 * Checks if a domain is currently rate-limited for DNS checks
 */
export function isVerificationRateLimited(hostname: string): { limited: boolean; waitSeconds?: number } {
  const now = Date.now();
  const lastCheck = LAST_VERIFICATION_CHECK.get(hostname.toLowerCase());
  if (lastCheck && now - lastCheck < VERIFICATION_RATE_LIMIT_MS) {
    const remainingMs = VERIFICATION_RATE_LIMIT_MS - (now - lastCheck);
    return { limited: true, waitSeconds: Math.ceil(remainingMs / 1000) };
  }
  return { limited: false };
}

/**
 * Records a verification attempt timestamp
 */
export function recordVerificationAttempt(hostname: string): void {
  LAST_VERIFICATION_CHECK.set(hostname.toLowerCase(), Date.now());
}

/**
 * Resets rate limit (for testing)
 */
export function resetVerificationRateLimit(hostname?: string): void {
  if (hostname) {
    LAST_VERIFICATION_CHECK.delete(hostname.toLowerCase());
  } else {
    LAST_VERIFICATION_CHECK.clear();
  }
}
