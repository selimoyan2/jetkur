/**
 * JetKur Canonical Section Registry - Domain Types
 *
 * ARCHITECTURAL PRINCIPLE:
 * Section Registry defines the canonical contract for all website sections:
 * capabilities, variants, content requirements, default settings, and semantic metadata.
 *
 * SEPARATION OF CONCERNS:
 * - Presentation Boundary: Zero CSS, zero Tailwind classes, zero HTML markup.
 * - Platform Owned: Section registry is platform-owned canonical metadata.
 * - Customer Owned: SectionConfiguration and SiteContent are customer-owned data.
 * - Industry Pack: Provides recommended sections and variants from this registry.
 */

import { CanonicalSectionType } from "../site/sectionConfiguration";
import { BusinessProfile } from "../site/businessProfile";
import { SiteContent } from "../site/siteContent";
import { SectionConfiguration } from "../site/sectionConfiguration";

/**
 * Complete Canonical Section Identifier
 * Unifies the 14 in-page sections with the 2 structural frame sections (header, footer).
 */
export type CanonicalSectionId = CanonicalSectionType | "header" | "footer";

/**
 * High-level semantic grouping for dashboard organization and discovery
 */
export type SectionCategory =
  | "STRUCTURAL"
  | "HERO"
  | "CONTENT"
  | "TRUST"
  | "CONVERSION"
  | "MEDIA"
  | "COMMERCE";

/**
 * Lifecycle status of a canonical section
 */
export type SectionStatus = "ACTIVE" | "EXPERIMENTAL" | "DEPRECATED";

/**
 * Layout / presentation variant contract
 */
export interface VariantDefinition {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly isDefault?: boolean;
}

/**
 * Declarative requirement for content needed by a section to render properly
 */
export type ContentRequirementSeverity = "required" | "recommended" | "optional";

export interface SectionContentRequirement {
  readonly targetDomain: "SiteContent" | "BusinessProfile" | "SectionConfiguration";
  readonly path: string;
  readonly label: string;
  readonly description: string;
  readonly severity: ContentRequirementSeverity;
  readonly minCount?: number;
}

/**
 * Display and configuration toggles supported by the section
 */
export interface SectionDisplaySetting {
  readonly key: string;
  readonly label: string;
  readonly type: "boolean" | "select" | "number" | "string";
  readonly defaultValue: unknown;
  readonly description?: string;
  readonly options?: ReadonlyArray<{ readonly value: string; readonly label: string }>;
}

/**
 * Capabilities and constraints for page composition
 */
export interface SectionCapabilities {
  /** Whether the user can toggle this section off */
  readonly canDisable: boolean;
  /** Whether the user can move this section up or down */
  readonly canReorder: boolean;
  /** Fixed position if not reorderable (e.g., 0 for header, 999 for footer) */
  readonly fixedPosition?: number;
  /** Whether this is a structural shell section (header/footer) */
  readonly isStructural: boolean;
  /** Maximum allowed occurrences on a single page (usually 1) */
  readonly maxInstances: number;
  /** Supports custom user-defined section heading */
  readonly supportsCustomTitle: boolean;
}

/**
 * Canonical Section Definition Aggregate
 */
export interface SectionDefinition {
  readonly id: CanonicalSectionId;
  readonly label: string;
  readonly description: string;
  readonly category: SectionCategory;
  readonly status: SectionStatus;
  readonly defaultEnabled: boolean;
  readonly defaultVariant: string;
  readonly allowedVariants: readonly string[];
  readonly variants: readonly VariantDefinition[];
  readonly capabilities: SectionCapabilities;
  readonly contentRequirements: readonly SectionContentRequirement[];
  readonly supportedSettings: readonly SectionDisplaySetting[];
  readonly legacyAliases: readonly string[];
}

/**
 * Content readiness status for a section
 */
export type SectionReadinessStatus =
  | "READY"
  | "DEGRADED"
  | "EMPTY"
  | "NOT_CONFIGURED";

export interface SectionReadinessResult {
  readonly sectionId: CanonicalSectionId;
  readonly status: SectionReadinessStatus;
  readonly canRender: boolean;
  readonly itemCount?: number;
  readonly missingRequired: readonly string[];
  readonly missingRecommended: readonly string[];
  readonly warnings: readonly string[];
}

/**
 * Context passed to evaluate section readiness
 */
export interface ReadinessContext {
  readonly businessProfile: BusinessProfile;
  readonly siteContent: SiteContent;
  readonly sectionConfig?: SectionConfiguration;
}

/**
 * Variant validation result
 */
export interface VariantValidationResult {
  readonly valid: boolean;
  readonly requestedVariant: string;
  readonly resolvedVariant: string;
  readonly isDefault: boolean;
  readonly error?: string;
}

/**
 * Configuration validation issue
 */
export interface SectionValidationIssue {
  readonly sectionId?: string;
  readonly field: string;
  readonly code:
    | "UNKNOWN_SECTION_TYPE"
    | "INVALID_VARIANT"
    | "CANNOT_DISABLE_REQUIRED"
    | "CANNOT_REORDER_STRUCTURAL"
    | "DUPLICATE_SECTION"
    | "INVALID_ORDER";
  readonly message: string;
  readonly severity: "error" | "warning";
}

export interface SectionConfigurationValidationResult {
  readonly valid: boolean;
  readonly issues: readonly SectionValidationIssue[];
  readonly normalizedCount: number;
}
