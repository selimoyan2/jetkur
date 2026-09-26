/**
 * JetKur Canonical Section Registry - Validator
 *
 * ARCHITECTURAL PRINCIPLE:
 * Enforces component contracts and invariants:
 * - Variant conformance with fallback strategy
 * - Mandatory vs optional sections
 * - Structural restrictions (reordering, disabling)
 * - Pure functions with zero side effects
 */

import { SectionConfiguration } from "../site/sectionConfiguration";
import {
  SectionConfigurationValidationResult,
  SectionDefinition,
  SectionValidationIssue,
  VariantValidationResult,
} from "./types";
import { getSectionDefinition, normalizeSectionId } from "./normalizer";

/**
 * Validates a requested variant for a given section.
 * If invalid or unknown, gracefully resolves to the section's canonical defaultVariant.
 */
export function validateSectionVariant(
  sectionIdOrAlias: string,
  variant: string
): VariantValidationResult {
  const def = getSectionDefinition(sectionIdOrAlias);

  if (!def) {
    return {
      valid: false,
      requestedVariant: variant,
      resolvedVariant: "default",
      isDefault: false,
      error: `Unknown section identifier '${sectionIdOrAlias}'`,
    };
  }

  const trimmedVariant = (variant || "").trim();

  if (def.allowedVariants.includes(trimmedVariant)) {
    return {
      valid: true,
      requestedVariant: variant,
      resolvedVariant: trimmedVariant,
      isDefault: trimmedVariant === def.defaultVariant,
    };
  }

  // Graceful fallback to default variant
  return {
    valid: false,
    requestedVariant: variant,
    resolvedVariant: def.defaultVariant,
    isDefault: true,
    error: `Variant '${variant}' is not supported for section '${def.id}'. Allowed: [${def.allowedVariants.join(", ")}]. Falling back to default '${def.defaultVariant}'.`,
  };
}

/**
 * Validates a single SectionDefinition structure
 */
export function validateSectionDefinition(def: SectionDefinition): SectionValidationIssue[] {
  const issues: SectionValidationIssue[] = [];

  if (!def.id) {
    issues.push({
      field: "id",
      code: "UNKNOWN_SECTION_TYPE",
      message: "Section ID is required",
      severity: "error",
    });
  }

  if (!def.label || def.label.trim().length === 0) {
    issues.push({
      sectionId: def.id,
      field: "label",
      code: "UNKNOWN_SECTION_TYPE",
      message: `Section '${def.id}' must have a non-empty human-readable label`,
      severity: "error",
    });
  }

  if (!def.defaultVariant) {
    issues.push({
      sectionId: def.id,
      field: "defaultVariant",
      code: "INVALID_VARIANT",
      message: `Section '${def.id}' must specify a defaultVariant`,
      severity: "error",
    });
  } else if (!def.allowedVariants.includes(def.defaultVariant)) {
    issues.push({
      sectionId: def.id,
      field: "defaultVariant",
      code: "INVALID_VARIANT",
      message: `Section '${def.id}' defaultVariant '${def.defaultVariant}' must exist in allowedVariants`,
      severity: "error",
    });
  }

  if (!Array.isArray(def.allowedVariants) || def.allowedVariants.length === 0) {
    issues.push({
      sectionId: def.id,
      field: "allowedVariants",
      code: "INVALID_VARIANT",
      message: `Section '${def.id}' must declare at least one allowed variant`,
      severity: "error",
    });
  }

  return issues;
}

/**
 * Validates an entire customer SectionConfiguration against the canonical registry rules
 */
export function validateSectionConfiguration(
  config: SectionConfiguration
): SectionConfigurationValidationResult {
  const issues: SectionValidationIssue[] = [];

  if (!config || !Array.isArray(config.sections)) {
    return {
      valid: false,
      issues: [
        {
          field: "sections",
          code: "UNKNOWN_SECTION_TYPE",
          message: "Configuration must contain a sections array",
          severity: "error",
        },
      ],
      normalizedCount: 0,
    };
  }

  const seenTypes = new Set<string>();

  for (let idx = 0; idx < config.sections.length; idx++) {
    const sec = config.sections[idx];

    // 1. Section Type Identification
    const canonicalId = normalizeSectionId(sec.type || sec.id);
    if (!canonicalId) {
      issues.push({
        sectionId: sec.id,
        field: `sections[${idx}].type`,
        code: "UNKNOWN_SECTION_TYPE",
        message: `Section '${sec.id || idx}' uses unknown type '${sec.type}'`,
        severity: "error",
      });
      continue;
    }

    const def = getSectionDefinition(canonicalId);
    if (!def) {
      issues.push({
        sectionId: sec.id,
        field: `sections[${idx}]`,
        code: "UNKNOWN_SECTION_TYPE",
        message: `Cannot load definition for section '${canonicalId}'`,
        severity: "error",
      });
      continue;
    }

    // 2. Structural restrictions: cannot disable required sections
    if (!def.capabilities.canDisable && sec.enabled === false) {
      issues.push({
        sectionId: sec.id,
        field: `sections[${idx}].enabled`,
        code: "CANNOT_DISABLE_REQUIRED",
        message: `Mandatory section '${def.label}' cannot be disabled`,
        severity: "error",
      });
    }

    // 3. Variant Validation
    if (sec.variant && sec.variant !== "default") {
      const variantRes = validateSectionVariant(canonicalId, sec.variant);
      if (!variantRes.valid) {
        issues.push({
          sectionId: sec.id,
          field: `sections[${idx}].variant`,
          code: "INVALID_VARIANT",
          message: variantRes.error || `Invalid variant '${sec.variant}'`,
          severity: "warning",
        });
      }
    }

    // 4. Order sanity
    if (typeof sec.order !== "number" || isNaN(sec.order) || sec.order < 0) {
      issues.push({
        sectionId: sec.id,
        field: `sections[${idx}].order`,
        code: "INVALID_ORDER",
        message: `Section '${sec.id}' has invalid order '${sec.order}'`,
        severity: "error",
      });
    }

    // 5. Duplicate Check
    if (sec.enabled) {
      if (seenTypes.has(canonicalId)) {
        issues.push({
          sectionId: sec.id,
          field: `sections[${idx}]`,
          code: "DUPLICATE_SECTION",
          message: `Multiple active instances of section '${canonicalId}' detected`,
          severity: "warning",
        });
      } else {
        seenTypes.add(canonicalId);
      }
    }
  }

  const hasFatalErrors = issues.some((i) => i.severity === "error");

  return {
    valid: !hasFatalErrors,
    issues,
    normalizedCount: seenTypes.size,
  };
}
