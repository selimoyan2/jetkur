/**
 * JetKur Canonical Template Manifest & Design System - Domain Types
 *
 * ARCHITECTURAL PRINCIPLE:
 * TemplateManifest is strictly a DESIGN RECIPE.
 * It contains ZERO customer content, ZERO business profiles, and ZERO industry-specific copy.
 *
 * SEPARATION OF CONCERNS:
 * - TemplateManifest = Design recipe + section variants + semantic design tokens
 * - SectionRegistry = Authority on which sections and variants exist
 * - IndustryPack = Recommended starter copy & business domain intelligence
 * - BusinessProfile = Customer's authentic business identity (portable & immutable)
 * - SiteContent = Customer's marketing text, stories, FAQs, media (customer-owned)
 */

import { CanonicalSectionId } from "../sections/types";
import {
  DesignTokens,
  TemplateCategory,
  TemplateColorTokens,
  TemplateTypographyTokens,
  TemplateGeometryTokens,
  TemplateHeaderTokens,
  TemplateFooterTokens,
} from "../site/designTemplate";

export type {
  TemplateCategory,
  DesignTokens,
  TemplateColorTokens,
  TemplateTypographyTokens,
  TemplateGeometryTokens,
  TemplateHeaderTokens,
  TemplateFooterTokens,
};

/**
 * Lifecycle status of a template manifest
 */
export type TemplateManifestStatus = "ACTIVE" | "DRAFT" | "ARCHIVED";

/**
 * Section layout variant assignment in a template manifest.
 * Keys MUST be valid CanonicalSectionIds.
 * Values MUST be allowed variants defined in Section Registry.
 */
export type TemplateSectionRecipe = Partial<Record<CanonicalSectionId, string>>;

/**
 * Default visibility and sequence rules recommended by the template.
 * Customer choices always take precedence during template switching.
 */
export interface TemplateSectionConfigDefault {
  readonly sectionId: CanonicalSectionId;
  readonly defaultEnabled: boolean;
  readonly recommendedOrder: number;
}

/**
 * Capabilities and layout constraints of the template
 */
export interface TemplateCapabilities {
  readonly supportsDarkMode: boolean;
  readonly isResponsive: boolean;
  readonly supportsCustomTokens: boolean;
  readonly maxHeaderLinks?: number;
  readonly recommendedContainerWidth: "boxed" | "standard" | "wide" | "full";
}

/**
 * Canonical Template Manifest Aggregate
 */
export interface TemplateManifest {
  /** Contract format version (e.g. 1) */
  readonly schemaVersion: number;
  /** Unique machine identifier (e.g. "tmpl-rapid-service") */
  readonly id: string;
  /** URL-friendly slug (e.g. "rapid-service") */
  readonly slug: string;
  /** Human-readable marketing name (e.g. "Hızlı Müdahale & Acil Servis") */
  readonly name: string;
  /** Design philosophy and description */
  readonly description: string;
  /** Template semantic version (e.g. "1.0.0") */
  readonly version: string;
  /** Publishing lifecycle status */
  readonly status: TemplateManifestStatus;
  /** Aesthetic design category */
  readonly category: TemplateCategory;
  /** Preview image asset URL (optional metadata, not architectural authority) */
  readonly previewImageUrl?: string;
  /** Semantic design tokens (colors, typography, geometry, header, footer) */
  readonly designTokens: DesignTokens;
  /** Section layout recipe (canonical section ID -> allowed variant) */
  readonly sectionRecipe: TemplateSectionRecipe;
  /** Default section ordering and visibility rules for initial site creation */
  readonly sectionDefaults: readonly TemplateSectionConfigDefault[];
  /** Technical capabilities */
  readonly capabilities: TemplateCapabilities;
  /** Industry category recommendation hints (purely advisory, never a hard lock) */
  readonly recommendedIndustries?: readonly string[];
  /** Tags for catalog filtering */
  readonly tags: readonly string[];
}

/**
 * Template validation issue
 */
export interface TemplateValidationIssue {
  readonly field: string;
  readonly code:
    | "UNKNOWN_SECTION_ID"
    | "UNKNOWN_SECTION_VARIANT"
    | "INVALID_DESIGN_TOKENS"
    | "CUSTOMER_CONTENT_LEAK"
    | "INDUSTRY_CONTENT_LEAK"
    | "RAW_HTML_DETECTED"
    | "EXECUTABLE_CODE_DETECTED"
    | "TAILWIND_IMPLEMENTATION_LEAK"
    | "INVALID_SCHEMA_VERSION"
    | "INVALID_VERSION"
    | "DUPLICATE_IDENTIFIER";
  readonly message: string;
  readonly severity: "error" | "warning";
}

export interface TemplateValidationResult {
  readonly valid: boolean;
  readonly issues: readonly TemplateValidationIssue[];
}

/**
 * Policy for merging section configurations when switching templates
 */
export type SectionMergePolicy =
  | "PRESERVE_CUSTOMER_PREFERENCES"
  | "OVERRIDE_WITH_TEMPLATE_DEFAULTS";

export interface TemplateSwitchOptions {
  /** How to handle disabled sections and custom reordering */
  readonly mergePolicy?: SectionMergePolicy;
  /** Optional custom color tokens override */
  readonly customTokens?: Partial<DesignTokens>;
}

export interface TemplateSwitchResult {
  readonly success: boolean;
  readonly previousTemplateId: string;
  readonly newTemplateId: string;
  readonly preservedSectionsCount: number;
  readonly updatedVariantsCount: number;
  readonly notes: readonly string[];
}
