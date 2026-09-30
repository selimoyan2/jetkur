/**
 * JetKur Subdomain Normalization, Validation & Suggestion Engine (Sprint 16)
 *
 * Enforces:
 * 1. RFC 1123 hostname compliance
 * 2. Full Turkish character transliteration (ç->c, ğ->g, ı->i, ö->o, ş->s, ü->u)
 * 3. ASCII lowercase, hyphen collapsing, boundary stripping
 * 4. Strict length bounds (3-63 chars)
 * 5. Comprehensive platform reserved words protection
 */

export const JETKUR_ROOT_DOMAIN = "jetkur.com.tr";

/**
 * Platform reserved subdomains that can never be claimed by customers
 */
export const RESERVED_SUBDOMAINS: ReadonlySet<string> = new Set([
  "www",
  "api",
  "admin",
  "app",
  "dashboard",
  "mail",
  "smtp",
  "ftp",
  "cdn",
  "assets",
  "static",
  "status",
  "support",
  "help",
  "docs",
  "blog",
  "auth",
  "login",
  "register",
  "billing",
  "preview",
  "staging",
  "dev",
  "test",
  "demo",
  "jetkur",
  "root",
  "ns1",
  "ns2",
  "cname",
  "ssl",
  "mx",
  "autoconfig",
  "autodiscover",
  "webmail",
  "panel",
  "control",
  "cloud",
  "edge",
  "server",
  "system",
]);

/**
 * Transliterates Turkish characters to standard English ASCII equivalents
 */
export function transliterateTurkish(input: string): string {
  if (!input) return "";

  return input
    .replace(/İ/g, "i")
    .replace(/I/g, "i")
    .replace(/ı/g, "i")
    .replace(/ç/g, "c")
    .replace(/Ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/Ğ/g, "g")
    .replace(/ö/g, "o")
    .replace(/Ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/Ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/Ü/g, "u")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Normalizes a raw string into a clean, safe subdomain slug
 */
export function normalizeSubdomain(rawInput: string): string {
  if (!rawInput || typeof rawInput !== "string") return "";

  // 1. Transliterate Turkish characters
  let clean = transliterateTurkish(rawInput.trim().toLowerCase());

  // 2. Strip protocol, path, and queries if entered as a URL
  clean = clean.replace(/^(https?:\/\/)?(www\.)?/, "");
  clean = clean.split("/")[0].split("?")[0].split("#")[0].split(":")[0];

  // 3. Remove common domain suffixes if user entered a full hostname
  clean = clean.replace(/\.jetkur\.com\.tr$/, "");
  clean = clean.replace(/\.jetkur\.app$/, "");
  clean = clean.replace(/\.com\.tr$/, "");
  clean = clean.replace(/\.[a-z]{2,}$/, "");

  // 3. Replace whitespace and underscores with hyphen
  clean = clean.replace(/[\s_]+/g, "-");

  // 4. Remove all characters except lowercase alphanumeric and hyphen
  clean = clean.replace(/[^a-z0-9-]/g, "");

  // 5. Collapse consecutive hyphens
  clean = clean.replace(/-+/g, "-");

  // 6. Strip leading and trailing hyphens
  clean = clean.replace(/^-+|-+$/g, "");

  // 7. Enforce max length of 63 chars (RFC 1035 label limit)
  if (clean.length > 63) {
    clean = clean.substring(0, 63).replace(/-+$/, "");
  }

  return clean;
}

export interface SubdomainValidationResult {
  valid: boolean;
  slug: string;
  fullHostname: string;
  error?: string;
  errorCode?: "TOO_SHORT" | "TOO_LONG" | "INVALID_FORMAT" | "RESERVED_WORD";
}

/**
 * Validates a normalized subdomain against length, RFC format, and reserved words
 */
export function validateSubdomain(slug: string): SubdomainValidationResult {
  const normalized = normalizeSubdomain(slug);

  if (normalized.length < 3) {
    return {
      valid: false,
      slug: normalized,
      fullHostname: `${normalized}.${JETKUR_ROOT_DOMAIN}`,
      error: "Site adresi en az 3 karakter olmalıdır.",
      errorCode: "TOO_SHORT",
    };
  }

  if (normalized.length > 63) {
    return {
      valid: false,
      slug: normalized,
      fullHostname: `${normalized}.${JETKUR_ROOT_DOMAIN}`,
      error: "Site adresi en fazla 63 karakter olabilir.",
      errorCode: "TOO_LONG",
    };
  }

  if (RESERVED_SUBDOMAINS.has(normalized)) {
    return {
      valid: false,
      slug: normalized,
      fullHostname: `${normalized}.${JETKUR_ROOT_DOMAIN}`,
      error: `"${normalized}" sistem tarafından ayrılmış özel bir adrestir. Lütfen başka bir adres seçin.`,
      errorCode: "RESERVED_WORD",
    };
  }

  // Must start and end with an alphanumeric character
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(normalized)) {
    return {
      valid: false,
      slug: normalized,
      fullHostname: `${normalized}.${JETKUR_ROOT_DOMAIN}`,
      error: "Site adresi yalnızca harf, rakam ve tire içerebilir.",
      errorCode: "INVALID_FORMAT",
    };
  }

  return {
    valid: true,
    slug: normalized,
    fullHostname: `${normalized}.${JETKUR_ROOT_DOMAIN}`,
  };
}

/**
 * Suggests a smart, friendly JetKur subdomain from a business name
 */
export function suggestSubdomain(companyName: string): string {
  const normalized = normalizeSubdomain(companyName);
  if (normalized.length >= 3 && !RESERVED_SUBDOMAINS.has(normalized)) {
    return normalized;
  }
  return normalized ? `${normalized}-site` : "isletme-site";
}
