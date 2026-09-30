/**
 * JetKur Custom Domain Normalization & Security Validation Engine (Sprint 16)
 *
 * Enforces:
 * 1. Hostname normalization (strips http/https, ports, paths, query, hash)
 * 2. Strict RFC 1123 hostname syntax
 * 3. Security guards:
 *    - Rejects IP addresses (IPv4 & IPv6)
 *    - Rejects localhost, loopback, private IPv4/IPv6 networks (SSRF defense)
 *    - Rejects wildcards (*.domain.com)
 *    - Rejects newline / carriage return header injection attempts
 *    - Rejects javascript: or data: URIs
 * 4. Apex + WWW canonical strategy
 */

import { transliterateTurkish } from "./subdomain";

// Common private IP ranges / loopback regex for SSRF defense
const PRIVATE_IP_PATTERNS = [
  /^127\./, // 127.0.0.0/8 loopback
  /^10\./, // 10.0.0.0/8 private
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12 private
  /^192\.168\./, // 192.168.0.0/16 private
  /^169\.254\./, // 169.254.0.0/16 link-local / cloud metadata
  /^0\./, // 0.0.0.0/8
  /^localhost$/i,
  /^.*\.local$/i,
  /^.*\.internal$/i,
  /^.*\.localhost$/i,
  /^::1$/, // IPv6 loopback
  /^fc00:/i, // IPv6 unique local
  /^fe80:/i, // IPv6 link-local
];

export interface CustomDomainValidationResult {
  valid: boolean;
  hostname: string;
  apexHostname: string;
  isWww: boolean;
  canonicalHostname: string;
  redirectHostname: string;
  error?: string;
  errorCode?:
    | "EMPTY_HOSTNAME"
    | "INVALID_CHARACTERS"
    | "IP_NOT_ALLOWED"
    | "PRIVATE_NETWORK_REJECTED"
    | "WILDCARD_NOT_ALLOWED"
    | "INVALID_TLD"
    | "HEADER_INJECTION";
}

/**
 * Normalizes a raw user domain input to a bare hostname
 */
export function normalizeCustomHostname(rawInput: string): string {
  if (!rawInput || typeof rawInput !== "string") return "";

  let cleaned = rawInput.trim();

  // 1. Check for header injection characters
  if (/[\r\n\0]/.test(cleaned)) {
    return "";
  }

  // 2. Strip protocol if provided
  cleaned = cleaned.replace(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//, "");

  // 3. Strip paths, query strings, and hash fragments
  cleaned = cleaned.split("/")[0];
  cleaned = cleaned.split("?")[0];
  cleaned = cleaned.split("#")[0];

  // 4. Strip port if present
  cleaned = cleaned.split(":")[0];

  // 5. Lowercase and transliterate Turkish characters
  cleaned = transliterateTurkish(cleaned.toLowerCase());

  // 6. Strip trailing dot if present
  cleaned = cleaned.replace(/\.+$/, "");

  return cleaned;
}

/**
 * Validates a custom domain hostname against RFC and security standards
 */
export function validateCustomHostname(rawInput: string): CustomDomainValidationResult {
  // Check header injection characters before stripping
  if (/[\r\n\0]/.test(rawInput)) {
    return {
      valid: false,
      hostname: "",
      apexHostname: "",
      isWww: false,
      canonicalHostname: "",
      redirectHostname: "",
      error: "Alan adı geçersiz karakterler veya satır sonu içeriyor.",
      errorCode: "HEADER_INJECTION",
    };
  }

  const hostname = normalizeCustomHostname(rawInput);

  if (!hostname) {
    return {
      valid: false,
      hostname: "",
      apexHostname: "",
      isWww: false,
      canonicalHostname: "",
      redirectHostname: "",
      error: "Lütfen geçerli bir alan adı girin (Örn: firmaniz.com).",
      errorCode: "EMPTY_HOSTNAME",
    };
  }

  // Reject wildcards
  if (hostname.includes("*")) {
    return {
      valid: false,
      hostname,
      apexHostname: "",
      isWww: false,
      canonicalHostname: "",
      redirectHostname: "",
      error: "Joker karakterli (*.alanadi.com) alan adları desteklenmemektedir.",
      errorCode: "WILDCARD_NOT_ALLOWED",
    };
  }

  // Reject IPv4 & IPv6 addresses
  if (
    /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(hostname) ||
    hostname.includes(":") ||
    hostname.startsWith("[")
  ) {
    return {
      valid: false,
      hostname,
      apexHostname: "",
      isWww: false,
      canonicalHostname: "",
      redirectHostname: "",
      error: "IP adresleri alan adı olarak kullanılamaz. Lütfen geçerli bir alan adı girin.",
      errorCode: "IP_NOT_ALLOWED",
    };
  }

  // Reject loopback, localhost, and private networks (SSRF defense)
  for (const pattern of PRIVATE_IP_PATTERNS) {
    if (pattern.test(hostname)) {
      return {
        valid: false,
        hostname,
        apexHostname: "",
        isWww: false,
        canonicalHostname: "",
        redirectHostname: "",
        error: "Yerel veya özel ağ adresleri bağlanamaz.",
        errorCode: "PRIVATE_NETWORK_REJECTED",
      };
    }
  }

  // Verify hostname label syntax (RFC 1123)
  const labels = hostname.split(".");
  if (labels.length < 2) {
    return {
      valid: false,
      hostname,
      apexHostname: "",
      isWww: false,
      canonicalHostname: "",
      redirectHostname: "",
      error: "Geçerli bir uzantı (.com, .com.tr vb.) belirtilmelidir.",
      errorCode: "INVALID_TLD",
    };
  }

  for (const label of labels) {
    if (!label || label.length > 63) {
      return {
        valid: false,
        hostname,
        apexHostname: "",
        isWww: false,
        canonicalHostname: "",
        redirectHostname: "",
        error: "Alan adı etiket uzunluğu geçersiz.",
        errorCode: "INVALID_CHARACTERS",
      };
    }
    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(label)) {
      return {
        valid: false,
        hostname,
        apexHostname: "",
        isWww: false,
        canonicalHostname: "",
        redirectHostname: "",
        error: `"${label}" etiketi geçersiz karakterler içeriyor.`,
        errorCode: "INVALID_CHARACTERS",
      };
    }
  }

  // Apex + WWW Strategy
  const isWww = hostname.startsWith("www.");
  let apexHostname = hostname;
  if (isWww) {
    apexHostname = hostname.replace(/^www\./, "");
  }

  // In standard edge/Cloudflare DNS architecture, www is preferred for CNAME flattening resilience
  const canonicalHostname = `www.${apexHostname}`;
  const redirectHostname = apexHostname;

  return {
    valid: true,
    hostname,
    apexHostname,
    isWww,
    canonicalHostname,
    redirectHostname,
  };
}
