/**
 * JetKur Canonical Template Switcher & Resolver
 *
 * ARCHITECTURAL PRINCIPLE:
 * Template switching is strictly a PRESENTATION / RECIPE mutation.
 * It NEVER mutates or deletes customer-owned content:
 * - BusinessProfile: 100% preserved (identity, phone, address, services)
 * - SiteContent: 100% preserved (hero texts, stories, FAQs, media, blog)
 * - Industry Pack: 100% preserved (sector baseline remains intact)
 * - Customer Section Preferences: preserved (disabled sections stay disabled)
 */

import { CanonicalSite } from "../site/site";
import { SectionConfiguration, SiteSectionItem } from "../site/sectionConfiguration";
import { IndustryPack } from "../industries/types";
import { TemplateManifest, TemplateSwitchOptions, TemplateSwitchResult } from "./types";
import { normalizeSectionId } from "../sections/normalizer";
import { validateSectionVariant } from "../sections/validator";

/**
 * Pure function to apply a new TemplateManifest to a CanonicalSite.
 * Guarantees zero data loss across business profiles, content, and industry packs.
 */
export function applyTemplateManifest(
  site: CanonicalSite,
  manifest: TemplateManifest,
  options: TemplateSwitchOptions = {}
): CanonicalSite {
  const mergePolicy = options.mergePolicy || "PRESERVE_CUSTOMER_PREFERENCES";
  const now = new Date().toISOString();

  // 1. Re-map in-page sections with template recipe variants
  const updatedSections: SiteSectionItem[] = (site.sectionConfiguration?.sections || []).map((sec) => {
    const canonicalId = normalizeSectionId(sec.type || sec.id);
    if (!canonicalId) return sec;

    // Check if the new template specifies a variant for this section
    const templateVariant = manifest.sectionRecipe[canonicalId];

    if (templateVariant) {
      const validated = validateSectionVariant(canonicalId, templateVariant);
      return {
        ...sec,
        variant: validated.resolvedVariant,
      };
    }

    return sec;
  });

  // 2. Check if the template specifies default sections not yet in customer configuration
  if (mergePolicy === "OVERRIDE_WITH_TEMPLATE_DEFAULTS") {
    // If explicit override requested, align section defaults with manifest
    for (const def of manifest.sectionDefaults) {
      const existing = updatedSections.find(
        (s) => normalizeSectionId(s.type || s.id) === def.sectionId
      );
      if (!existing && def.sectionId !== "header" && def.sectionId !== "footer") {
        const variant = manifest.sectionRecipe[def.sectionId] || "default";
        updatedSections.push({
          id: `sec-${def.sectionId}`,
          type: def.sectionId as any,
          enabled: def.defaultEnabled,
          order: def.recommendedOrder,
          variant,
        });
      }
    }
  }

  // 3. Update Header & Footer configuration based on template tokens
  const currentHeader = site.sectionConfiguration?.header || {
    sticky: true,
    showPhoneButton: true,
    showWhatsAppButton: true,
    showCtaButton: true,
    navLinks: [],
  };

  const currentFooter = site.sectionConfiguration?.footer || {
    showWorkingHours: true,
    showSocialIcons: true,
    showQuickLinks: true,
    showCopyright: true,
  };

  const updatedSectionConfiguration: SectionConfiguration = {
    sections: updatedSections,
    header: {
      ...currentHeader,
      sticky: manifest.designTokens.header?.layout !== "fixed-solid",
    },
    footer: {
      ...currentFooter,
    },
  };

  // 4. Return new immutable CanonicalSite aggregate
  return {
    ...site,
    updatedAt: now,
    // Update design template reference with version pinning
    designTemplate: {
      templateId: manifest.id,
      templateSlug: manifest.slug,
      templateVersion: manifest.version,
      appliedAt: now,
      customTokens: options.customTokens || site.designTemplate?.customTokens,
    },
    sectionConfiguration: updatedSectionConfiguration,
    // CRITICAL INVARIANTS: Content, Business Profile, Industry Pack, Settings are 100% UNTOUCHED
    businessProfile: site.businessProfile,
    content: site.content,
    industryPackId: site.industryPackId,
    settings: site.settings,
  };
}

/**
 * Executes template switch and returns detailed transition audit metrics
 */
export function switchTemplate(
  site: CanonicalSite,
  manifest: TemplateManifest,
  options: TemplateSwitchOptions = {}
): { updatedSite: CanonicalSite; result: TemplateSwitchResult } {
  const previousTemplateId = site.designTemplate?.templateId || "unknown";
  const updatedSite = applyTemplateManifest(site, manifest, options);

  let updatedVariantsCount = 0;
  for (const sec of updatedSite.sectionConfiguration.sections) {
    const canonicalId = normalizeSectionId(sec.type || sec.id);
    if (canonicalId && manifest.sectionRecipe[canonicalId]) {
      updatedVariantsCount++;
    }
  }

  const result: TemplateSwitchResult = {
    success: true,
    previousTemplateId,
    newTemplateId: manifest.id,
    preservedSectionsCount: updatedSite.sectionConfiguration.sections.length,
    updatedVariantsCount,
    notes: [
      `Switched template from '${previousTemplateId}' to '${manifest.id}' (v${manifest.version})`,
      `Customer-owned business profile and content remained 100% immutable`,
      `Applied ${updatedVariantsCount} section variant recipes from manifest`,
    ],
  };

  return { updatedSite, result };
}

/**
 * Generates initial SectionConfiguration combining IndustryPack's recommended sections
 * with TemplateManifest's design variants.
 *
 * Conflict Resolution Policy:
 * - Industry Pack determines WHICH sections are recommended for the business.
 * - Template Manifest determines HOW those sections look (presentation variants).
 */
export function generateInitialSectionConfiguration(
  manifest: TemplateManifest,
  industryPack?: IndustryPack
): SectionConfiguration {
  const sections: SiteSectionItem[] = [];

  if (industryPack && Array.isArray(industryPack.recommendedSections)) {
    // 1. Use Industry Pack recommended sections as base
    for (const rec of industryPack.recommendedSections) {
      const canonicalId = normalizeSectionId(rec.type);
      if (!canonicalId) continue;

      // Template variant takes precedence for presentation styling
      const variant =
        manifest.sectionRecipe[canonicalId] || rec.recommendedVariant || "default";

      sections.push({
        id: `sec-${canonicalId}`,
        type: canonicalId as any,
        enabled: rec.enabled,
        order: rec.order,
        variant,
      });
    }
  } else {
    // 2. Fall back to template section defaults
    for (const def of manifest.sectionDefaults) {
      if (def.sectionId === "header" || def.sectionId === "footer") continue;
      const variant = manifest.sectionRecipe[def.sectionId] || "default";
      sections.push({
        id: `sec-${def.sectionId}`,
        type: def.sectionId as any,
        enabled: def.defaultEnabled,
        order: def.recommendedOrder,
        variant,
      });
    }
  }

  return {
    sections,
    header: {
      sticky: manifest.designTokens.header?.layout !== "fixed-solid",
      showPhoneButton: true,
      showWhatsAppButton: true,
      showCtaButton: true,
      navLinks: [],
    },
    footer: {
      showWorkingHours: true,
      showSocialIcons: true,
      showQuickLinks: true,
      showCopyright: true,
    },
  };
}
