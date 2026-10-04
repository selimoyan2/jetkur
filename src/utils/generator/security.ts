/**
 * JetKur Generator Security & Escaping Engine (Sprint 09)
 *
 * Strict context-aware HTML escaping, URL sanitization, and JSON-LD serialization.
 * Protects published static sites from XSS, script breakouts, and malicious customer data.
 */

const HTML_ENTITY_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/**
 * Escapes plain text for safe inclusion within HTML element bodies.
 */
export function escapeHtml(str: unknown): string {
  if (str === null || str === undefined) return "";
  const s = String(str);
  return s.replace(/[&<>"']/g, (m) => HTML_ENTITY_MAP[m] || m);
}

/**
 * Escapes text for safe inclusion within HTML attribute values (e.g. title="...", alt="...").
 */
export function escapeHtmlAttr(str: unknown): string {
  if (str === null || str === undefined) return "";
  const s = String(str);
  return s
    .replace(/[&<>"']/g, (m) => HTML_ENTITY_MAP[m] || m)
    .replace(/\n/g, "&#10;")
    .replace(/\r/g, "&#13;");
}

export function sanitizeUrl(url: unknown, fallback = "#"): string {
  if (typeof url !== "string") return fallback;
  const trimmed = url.trim();
  if (!trimmed) return fallback;

  // Reject dangerous script protocols
  if (/^(javascript|vbscript|file):/i.test(trimmed)) {
    return fallback;
  }

  // Allow safe data URIs for images only (PNG, JPEG, WebP, SVG, GIF)
  if (/^data:/i.test(trimmed)) {
    const isSafeImageData = /^data:image\/(png|jpeg|jpg|webp|svg\+xml|gif);(base64|utf8),/i.test(trimmed);
    return isSafeImageData ? trimmed : fallback;
  }

  // Reject newlines / control characters in URLs
  if (/[\r\n\t]/.test(trimmed)) {
    return fallback;
  }

  return escapeHtmlAttr(trimmed);
}

/**
 * Safely serializes objects to JSON for embedding within <script type="application/ld+json">.
 * Prevents HTML/script breakout by escaping forward slashes and angle brackets.
 */
export function safeJsonLd(data: unknown): string {
  const json = typeof data === "string" ? data : JSON.stringify(data, null, 2);
  return json
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
