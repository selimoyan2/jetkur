/**
 * JetKur Canonical Template Catalog
 *
 * ARCHITECTURAL PRINCIPLE:
 * Serves as the central repository of all canonical, platform-owned TemplateManifests.
 * Completely decoupled from industry copy, customer data, and presentation frameworks.
 */

import { TemplateCategory, TemplateManifest } from "./types";
import { rapidServiceManifest } from "./manifests/rapidService";
import { corporatePrestigeManifest } from "./manifests/corporatePrestige";
import { clinicalPureManifest } from "./manifests/clinicalPure";
import { modernMinimalManifest } from "./manifests/modernMinimal";
import { artisanWarmManifest } from "./manifests/artisanWarm";
import { vipLuxuryManifest } from "./manifests/vipLuxury";
import { techDynamicManifest } from "./manifests/techDynamic";
import { formalLegalManifest } from "./manifests/formalLegal";

/**
 * All 8 Canonical Platform Template Manifests
 */
export const CANONICAL_TEMPLATE_MANIFESTS: readonly TemplateManifest[] = [
  rapidServiceManifest,
  corporatePrestigeManifest,
  clinicalPureManifest,
  modernMinimalManifest,
  artisanWarmManifest,
  vipLuxuryManifest,
  techDynamicManifest,
  formalLegalManifest,
];

/**
 * Fast lookup maps by ID and Slug
 */
const TEMPLATES_BY_ID = new Map<string, TemplateManifest>(
  CANONICAL_TEMPLATE_MANIFESTS.map((t) => [t.id, t])
);

const TEMPLATES_BY_SLUG = new Map<string, TemplateManifest>(
  CANONICAL_TEMPLATE_MANIFESTS.map((t) => [t.slug, t])
);

/**
 * Legacy Template Compatibility Map
 * Maps the 6 legacy templates from src/data/templates.ts to canonical industry-neutral manifests
 */
export const LEGACY_TEMPLATE_COMPATIBILITY_MAP: Readonly<Record<string, string>> = {
  // Legacy template ID -> Canonical template ID
  "oto-kurtarma": "tmpl-rapid-service",
  "dis-hekimligi": "tmpl-clinical-pure",
  "hukuk-avukat": "tmpl-formal-legal",
  "hali-yikama": "tmpl-artisan-warm",
  "evden-eve-nakliyat": "tmpl-rapid-service",
  "kombi-klima-servisi": "tmpl-rapid-service",

  // Legacy designSet IDs -> Canonical template ID
  "emergency-speed-orange": "tmpl-rapid-service",
  "corporate-prestige-navy": "tmpl-corporate-prestige",
  "medical-pure-emerald": "tmpl-clinical-pure",
  "gourmet-warm-crimson": "tmpl-artisan-warm",
  "architecture-dark-minimal": "tmpl-modern-minimal",
  "luxury-gold-vip": "tmpl-vip-luxury",
  "tech-cyan-modern": "tmpl-tech-dynamic",
  "legal-prestige-purple": "tmpl-formal-legal",
};

/**
 * Lists all canonical templates in the platform
 */
export function listTemplates(): readonly TemplateManifest[] {
  return CANONICAL_TEMPLATE_MANIFESTS;
}

/**
 * Lists only ACTIVE templates available for customer site creation
 */
export function listActiveTemplates(): readonly TemplateManifest[] {
  return CANONICAL_TEMPLATE_MANIFESTS.filter((t) => t.status === "ACTIVE");
}

/**
 * Retrieves a template manifest by its exact machine ID
 */
export function getTemplateById(id: string): TemplateManifest | null {
  if (!id) return null;
  return TEMPLATES_BY_ID.get(id) || null;
}

/**
 * Retrieves a template manifest by its URL slug
 */
export function getTemplateBySlug(slug: string): TemplateManifest | null {
  if (!slug) return null;
  return TEMPLATES_BY_SLUG.get(slug) || null;
}

/**
 * Resolves a template by ID, slug, or legacy compatibility identifier
 */
export function resolveTemplate(idOrSlugOrLegacy: string): TemplateManifest | null {
  if (!idOrSlugOrLegacy || typeof idOrSlugOrLegacy !== "string") return null;

  const trimmed = idOrSlugOrLegacy.trim();

  // 1. Direct ID match
  if (TEMPLATES_BY_ID.has(trimmed)) {
    return TEMPLATES_BY_ID.get(trimmed)!;
  }

  // 2. Direct Slug match
  if (TEMPLATES_BY_SLUG.has(trimmed)) {
    return TEMPLATES_BY_SLUG.get(trimmed)!;
  }

  // 3. Legacy compatibility mapping
  const mappedId = LEGACY_TEMPLATE_COMPATIBILITY_MAP[trimmed];
  if (mappedId && TEMPLATES_BY_ID.has(mappedId)) {
    return TEMPLATES_BY_ID.get(mappedId)!;
  }

  // 4. Case-insensitive slug match
  const lower = trimmed.toLowerCase();
  for (const t of CANONICAL_TEMPLATE_MANIFESTS) {
    if (t.slug.toLowerCase() === lower || t.id.toLowerCase() === lower) {
      return t;
    }
  }

  return null;
}

/**
 * Filters templates by semantic design category
 */
export function getTemplatesByCategory(category: TemplateCategory): TemplateManifest[] {
  return CANONICAL_TEMPLATE_MANIFESTS.filter((t) => t.category === category);
}
