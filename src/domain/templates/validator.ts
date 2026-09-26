/**
 * JetKur Canonical Template Manifest - Pure Validator
 *
 * ARCHITECTURAL PRINCIPLE:
 * Enforces strict manifest purity and security:
 * - Authority check: All sections and variants must validate against Sprint 06 Section Registry.
 * - Security check: Zero executable code, zero raw HTML tags, zero event handlers.
 * - Invariant check: Zero customer-owned data, zero industry copy, zero Tailwind utility class leaks.
 */

import { TemplateManifest, TemplateValidationIssue, TemplateValidationResult } from "./types";
import { normalizeSectionId, isCanonicalSectionId } from "../sections/normalizer";
import { validateSectionVariant } from "../sections/validator";

/**
 * Tokens forbidden in template manifests to preserve the presentation boundary and prevent code injection
 */
const FORBIDDEN_SECURITY_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /<iframe\b/gi,
  /javascript:/gi,
  /onload\s*=/gi,
  /onerror\s*=/gi,
  /onclick\s*=/gi,
  /eval\s*\(/gi,
  /new\s+Function/gi,
];

const FORBIDDEN_TAILWIND_PREFIXES = [
  "px-",
  "py-",
  "pt-",
  "pb-",
  "bg-",
  "text-",
  "grid-cols-",
  "flex-",
  "rounded-",
  "max-w-",
  "min-h-",
];

const FORBIDDEN_CUSTOMER_FIELDS = [
  "companyName",
  "phone",
  "whatsapp",
  "email",
  "address",
  "fullAddress",
  "city",
  "taxId",
];

const FORBIDDEN_INDUSTRY_FIELDS = [
  "defaultServices",
  "defaultFaqs",
  "servicesList",
  "faqItems",
  "aboutStory",
  "industryKeywords",
];

/**
 * Validates a TemplateManifest against architectural contracts
 */
export function validateTemplateManifest(manifest: TemplateManifest): TemplateValidationResult {
  const issues: TemplateValidationIssue[] = [];

  if (!manifest) {
    return {
      valid: false,
      issues: [
        {
          field: "manifest",
          code: "INVALID_SCHEMA_VERSION",
          message: "Manifest object cannot be null or undefined",
          severity: "error",
        },
      ],
    };
  }

  // 1. Schema Version & Identity
  if (typeof manifest.schemaVersion !== "number" || manifest.schemaVersion <= 0) {
    issues.push({
      field: "schemaVersion",
      code: "INVALID_SCHEMA_VERSION",
      message: `Invalid schemaVersion '${manifest.schemaVersion}'. Must be a positive integer.`,
      severity: "error",
    });
  }

  if (!manifest.id || typeof manifest.id !== "string" || manifest.id.trim().length === 0) {
    issues.push({
      field: "id",
      code: "DUPLICATE_IDENTIFIER",
      message: "Template ID is required",
      severity: "error",
    });
  }

  if (!manifest.slug || typeof manifest.slug !== "string" || manifest.slug.trim().length === 0) {
    issues.push({
      field: "slug",
      code: "DUPLICATE_IDENTIFIER",
      message: "Template slug is required",
      severity: "error",
    });
  }

  if (!manifest.name || typeof manifest.name !== "string" || manifest.name.trim().length === 0) {
    issues.push({
      field: "name",
      code: "DUPLICATE_IDENTIFIER",
      message: "Template human-readable name is required",
      severity: "error",
    });
  }

  if (!manifest.version || !/^\d+\.\d+\.\d+$/.test(manifest.version)) {
    issues.push({
      field: "version",
      code: "INVALID_VERSION",
      message: `Template version '${manifest.version}' must follow semantic versioning (e.g. 1.0.0)`,
      severity: "error",
    });
  }

  // 2. Section Registry Authority Validation
  if (!manifest.sectionRecipe || typeof manifest.sectionRecipe !== "object") {
    issues.push({
      field: "sectionRecipe",
      code: "UNKNOWN_SECTION_ID",
      message: "Template must specify a valid sectionRecipe object",
      severity: "error",
    });
  } else {
    for (const [rawSecId, variant] of Object.entries(manifest.sectionRecipe)) {
      const canonicalId = normalizeSectionId(rawSecId);
      if (!canonicalId || !isCanonicalSectionId(canonicalId)) {
        issues.push({
          field: `sectionRecipe.${rawSecId}`,
          code: "UNKNOWN_SECTION_ID",
          message: `Section ID '${rawSecId}' is not recognized in Canonical Section Registry`,
          severity: "error",
        });
        continue;
      }

      if (typeof variant !== "string" || variant.trim().length === 0) {
        issues.push({
          field: `sectionRecipe.${rawSecId}`,
          code: "UNKNOWN_SECTION_VARIANT",
          message: `Section '${canonicalId}' must specify a non-empty variant string`,
          severity: "error",
        });
        continue;
      }

      const variantRes = validateSectionVariant(canonicalId, variant);
      if (!variantRes.valid) {
        issues.push({
          field: `sectionRecipe.${rawSecId}`,
          code: "UNKNOWN_SECTION_VARIANT",
          message: `Variant '${variant}' is not allowed for section '${canonicalId}'. Supported: ${variantRes.error || ""}`,
          severity: "error",
        });
      }
    }
  }

  // 3. Design Tokens Validation
  if (!manifest.designTokens) {
    issues.push({
      field: "designTokens",
      code: "INVALID_DESIGN_TOKENS",
      message: "Template must provide designTokens",
      severity: "error",
    });
  } else {
    const { palette, typography, geometry } = manifest.designTokens;
    if (!palette?.primary || !palette?.secondary || !palette?.accent) {
      issues.push({
        field: "designTokens.palette",
        code: "INVALID_DESIGN_TOKENS",
        message: "Palette must define primary, secondary, and accent colors",
        severity: "error",
      });
    }

    if (!typography?.fontHeading || !typography?.fontBody) {
      issues.push({
        field: "designTokens.typography",
        code: "INVALID_DESIGN_TOKENS",
        message: "Typography must define fontHeading and fontBody",
        severity: "error",
      });
    }

    if (!geometry?.borderRadius || !geometry?.sectionSpacing) {
      issues.push({
        field: "designTokens.geometry",
        code: "INVALID_DESIGN_TOKENS",
        message: "Geometry must define borderRadius and sectionSpacing",
        severity: "error",
      });
    }
  }

  // 4. Invariant & Security Checks via String Serialization
  const serialized = JSON.stringify(manifest);

  // Security: No raw HTML tags or executable patterns
  for (const pattern of FORBIDDEN_SECURITY_PATTERNS) {
    if (pattern.test(serialized)) {
      issues.push({
        field: "manifest",
        code: "RAW_HTML_DETECTED",
        message: `Security violation: Forbidden script or raw HTML pattern detected`,
        severity: "error",
      });
      break;
    }
  }

  // Presentation Purity: No Tailwind utility class tokens in the manifest
  for (const prefix of FORBIDDEN_TAILWIND_PREFIXES) {
    if (serialized.includes(`"${prefix}`) || serialized.includes(` ${prefix}`)) {
      issues.push({
        field: "manifest",
        code: "TAILWIND_IMPLEMENTATION_LEAK",
        message: `Presentation leak: Manifest contains hardcoded Tailwind utility class prefix '${prefix}'`,
        severity: "error",
      });
      break;
    }
  }

  // Domain Purity: No customer-owned fields
  for (const field of FORBIDDEN_CUSTOMER_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(manifest, field)) {
      issues.push({
        field,
        code: "CUSTOMER_CONTENT_LEAK",
        message: `Boundary violation: Template Manifest must not contain customer-owned field '${field}'`,
        severity: "error",
      });
    }
  }

  // Domain Purity: No industry copy fields
  for (const field of FORBIDDEN_INDUSTRY_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(manifest, field)) {
      issues.push({
        field,
        code: "INDUSTRY_CONTENT_LEAK",
        message: `Boundary violation: Template Manifest must not contain industry-specific field '${field}'`,
        severity: "error",
      });
    }
  }

  return {
    valid: !issues.some((i) => i.severity === "error"),
    issues,
  };
}
