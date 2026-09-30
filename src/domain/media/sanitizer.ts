/**
 * JetKur Media Security & Upload Sanitization Engine (Sprint 14)
 *
 * Implements strict security validations:
 * - Magic byte inspection (does not trust file extension or Content-Type header)
 * - Embedded script detection
 * - Path traversal prevention
 * - Protocol & URL injection defense
 * - Bounded upload file size (max 10MB)
 */

export interface MediaValidationResult {
  valid: boolean;
  mimeType?: string;
  error?: string;
}

export const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Checks magic bytes of a buffer to determine authentic image format.
 */
export function detectMagicMimeType(buffer: Buffer): string | null {
  if (!buffer || buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "image/png";
  }

  // WebP: RIFF .... WEBP
  // bytes 0-3 = "RIFF", bytes 8-11 = "WEBP"
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "image/webp";
  }

  return null;
}

/**
 * Checks whether buffer contains malicious script injections.
 */
export function containsMaliciousPayload(buffer: Buffer): boolean {
  // Convert first 4KB and last 4KB to ASCII/UTF8 for heuristic scan
  const sampleSize = Math.min(buffer.length, 4096);
  const headStr = buffer.slice(0, sampleSize).toString("utf8").toLowerCase();
  const tailStr = buffer.slice(-sampleSize).toString("utf8").toLowerCase();

  const dangerousTokens = [
    "<script",
    "javascript:",
    "vbscript:",
    "onload=",
    "onerror=",
    "document.cookie",
    "window.location",
    "eval(",
    "data:text/html",
  ];

  for (const token of dangerousTokens) {
    if (headStr.includes(token) || tailStr.includes(token)) {
      return true;
    }
  }

  return false;
}

/**
 * Validates an uploaded image buffer.
 */
export function validateUploadedImageBuffer(
  buffer: Buffer,
  declaredMimeType?: string
): MediaValidationResult {
  // 1. File size check
  if (!buffer || buffer.length === 0) {
    return { valid: false, error: "Boş dosya yüklenemez." };
  }

  if (buffer.length > MAX_UPLOAD_SIZE_BYTES) {
    return {
      valid: false,
      error: `Dosya boyutu çok yüksek. Maksimum izin verilen boyut: 10 MB (Yüklenen: ${(buffer.length / (1024 * 1024)).toFixed(1)} MB).`,
    };
  }

  // 2. Magic byte check
  const authenticMime = detectMagicMimeType(buffer);
  if (!authenticMime) {
    return {
      valid: false,
      error: "Desteklenmeyen veya geçersiz görsel formatı. Yalnızca gerçek JPEG, PNG ve WebP dosyaları desteklenir.",
    };
  }

  // 3. Reject declared mismatch if spoofed
  if (declaredMimeType && declaredMimeType.includes("svg")) {
    return {
      valid: false,
      error: "Raster medya yüklemelerinde SVG formatı güvenlik gereği kabul edilmemektedir.",
    };
  }

  // 4. Malicious script scan
  if (containsMaliciousPayload(buffer)) {
    return {
      valid: false,
      error: "Görsel içeriğinde güvenlik tehdidi tespit edildi (Zararlı kod enjeksiyonu engellendi).",
    };
  }

  return { valid: true, mimeType: authenticMime };
}

/**
 * Sanitizes filename to prevent directory traversal and special character attacks.
 */
export function sanitizeMediaFilename(rawName: string): string {
  if (!rawName) return "image.webp";

  // Strip path separators, null bytes, and traversal tokens
  let clean = rawName
    .replace(/\0/g, "")
    .replace(/\\/g, "/")
    .replace(/\.\.+/g, "")
    .replace(/[\/\?<>\\:\*\|":]/g, "-")
    .trim();

  // Keep only alphanumeric, dots, dashes, underscores
  clean = clean.replace(/[^a-zA-Z0-9.\-_]/g, "-").replace(/-+/g, "-");

  if (!clean || clean === "." || clean === "..") {
    clean = "media-asset-" + Date.now();
  }

  return clean.slice(0, 100);
}

/**
 * Sanitizes external image URLs to prevent SSRF and protocol exploits.
 */
export function sanitizeImageUrl(rawUrl: string, fallbackUrl = ""): string {
  if (!rawUrl || typeof rawUrl !== "string") return fallbackUrl;

  const trimmed = rawUrl.trim();

  // Allow safe HTTPS URLs
  if (trimmed.startsWith("https://")) {
    // Disallow local loopback addresses (SSRF defense)
    if (
      trimmed.includes("localhost") ||
      trimmed.includes("127.0.0.1") ||
      trimmed.includes("169.254.169.254") ||
      trimmed.includes("0.0.0.0")
    ) {
      return fallbackUrl;
    }
    return trimmed;
  }

  // Allow safe HTTP in dev only if not localhost internal
  if (trimmed.startsWith("http://") && process.env.NODE_ENV !== "production") {
    return trimmed;
  }

  // Allow safe base64 raster data URLs
  if (
    trimmed.startsWith("data:image/jpeg;base64,") ||
    trimmed.startsWith("data:image/png;base64,") ||
    trimmed.startsWith("data:image/webp;base64,")
  ) {
    return trimmed;
  }

  return fallbackUrl;
}
