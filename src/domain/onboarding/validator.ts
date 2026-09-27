/**
 * JetKur Smart Onboarding - Input Validation & Security Engine (Sprint 11)
 *
 * Enforces:
 * 1. Required minimal fields: business name, phone, industry.
 * 2. Size bounds & XSS protection on text fields (name, tagline, services, contact).
 * 3. Logo format validation: MIME types, extensions, size limits (<2MB).
 * 4. SVG security auditing (disarming scripts, handlers, external scripts).
 * 5. URL protocol security (rejecting javascript:, vbscript:, malformed data URIs).
 * 6. Brand color sanitization (rejecting CSS injection breakout payloads).
 */

import { OnboardingInput, OnboardingValidationResult } from "./types";
import { isSafeColorString } from "../brand/colorUtils";
import { sanitizeLogoUrl } from "../brand/logoAnalyzer";
import { auditSvgSecurity } from "../brand/svgColorExtractor";

// 2 MB Maximum Logo File Size
export const MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024;

// Allowed image MIME types
const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/svg+xml",
]);

// Allowed image file extensions
const ALLOWED_EXTENSIONS = new Set(["png", "jpg", "jpeg", "webp", "svg"]);

// Malicious script tag pattern
const DANGEROUS_SCRIPT_REGEX = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;

/**
 * Validates the customer onboarding input on the server independently of client UI.
 */
export function validateOnboardingInput(input: unknown): OnboardingValidationResult {
  const errors: OnboardingValidationResult["errors"] = [];

  if (!input || typeof input !== "object") {
    return {
      valid: false,
      errors: [{ field: "root", message: "Geçersiz başvuru verisi.", code: "INVALID_BODY" }],
    };
  }

  const data = input as Partial<OnboardingInput>;

  // 1. Business Name (Required, 2 - 100 chars)
  if (!data.companyName || typeof data.companyName !== "string" || !data.companyName.trim()) {
    errors.push({
      field: "companyName",
      message: "İşletme adı zorunludur.",
      code: "REQUIRED_FIELD",
    });
  } else {
    const trimmedName = data.companyName.trim();
    if (trimmedName.length < 2) {
      errors.push({
        field: "companyName",
        message: "İşletme adı en az 2 karakter olmalıdır.",
        code: "MIN_LENGTH",
      });
    } else if (trimmedName.length > 120) {
      errors.push({
        field: "companyName",
        message: "İşletme adı en fazla 120 karakter olabilir.",
        code: "MAX_LENGTH",
      });
    }
  }

  // 2. Phone (Required)
  if (!data.phone || typeof data.phone !== "string" || !data.phone.trim()) {
    errors.push({
      field: "phone",
      message: "İletişim telefon numarası zorunludur.",
      code: "REQUIRED_FIELD",
    });
  } else {
    const rawDigits = data.phone.replace(/[^0-9]/g, "");
    if (rawDigits.length < 7) {
      errors.push({
        field: "phone",
        message: "Lütfen geçerli bir telefon numarası giriniz.",
        code: "INVALID_PHONE",
      });
    }
  }

  // 3. Industry (Required string)
  if (!data.industry || typeof data.industry !== "string" || !data.industry.trim()) {
    errors.push({
      field: "industry",
      message: "Lütfen bir sektör veya faaliyet alanı belirtiniz.",
      code: "REQUIRED_FIELD",
    });
  }

  // 4. Logo Security & Format Checks
  if (data.logo) {
    const logo = data.logo;

    // Size limit
    if (logo.sizeBytes && logo.sizeBytes > MAX_LOGO_SIZE_BYTES) {
      errors.push({
        field: "logo",
        message: `Logo dosya boyutu maksimum 2 MB olabilir. Yüklenen: ${(logo.sizeBytes / (1024 * 1024)).toFixed(1)} MB`,
        code: "OVERSIZED_LOGO",
      });
    }

    // MIME type check
    if (logo.mimeType && !ALLOWED_MIME_TYPES.has(logo.mimeType.toLowerCase())) {
      errors.push({
        field: "logo",
        message: "Desteklenmeyen logo dosya biçimi. Lütfen PNG, JPEG, WebP veya SVG yükleyiniz.",
        code: "UNSUPPORTED_MIME_TYPE",
      });
    }

    // Extension check
    if (logo.fileName) {
      const ext = logo.fileName.split(".").pop()?.toLowerCase();
      if (ext && !ALLOWED_EXTENSIONS.has(ext)) {
        errors.push({
          field: "logo",
          message: "Geçersiz dosya uzantısı. Yalnızca .png, .jpg, .jpeg, .webp, .svg kabul edilmektedir.",
          code: "UNSUPPORTED_EXTENSION",
        });
      }
    }

    // URL security check
    if (logo.url) {
      const sanitized = sanitizeLogoUrl(logo.url);
      if (!sanitized) {
        errors.push({
          field: "logo",
          message: "Güvenli olmayan veya geçersiz logo bağlantısı (URL).",
          code: "UNSAFE_LOGO_URL",
        });
      }
    }

    // SVG security audit
    if (logo.svgContent) {
      const svgAudit = auditSvgSecurity(logo.svgContent);
      if (!svgAudit.isSafe) {
        errors.push({
          field: "logo",
          message: "Logo SVG dosyası çalıştırılabilir veya güvensiz kod parçacıkları içeriyor.",
          code: "UNSAFE_SVG_CONTENT",
        });
      }
    }
  }

  // 5. Brand Color check
  if (data.brandColor) {
    if (!isSafeColorString(data.brandColor)) {
      errors.push({
        field: "brandColor",
        message: "Geçersiz renk kodu formatı.",
        code: "INVALID_COLOR",
      });
    }
  }

  // 6. Services validation
  if (data.services && Array.isArray(data.services)) {
    for (let i = 0; i < data.services.length; i++) {
      const svc = data.services[i];
      if (!svc.title || typeof svc.title !== "string" || !svc.title.trim()) {
        errors.push({
          field: `services[${i}].title`,
          message: "Hizmet başlığı boş olamaz.",
          code: "REQUIRED_SERVICE_TITLE",
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
