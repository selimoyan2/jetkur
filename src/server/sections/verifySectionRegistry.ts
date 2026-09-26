/**
 * JetKur Sprint 06: Canonical Section Registry & Component Contract Verification Suite
 *
 * Verifies:
 * 1. ALL_SECTIONS_VALID (all 16 canonical section definitions pass schema validation)
 * 2. UNIQUE_SECTION_IDS (no duplicate section IDs in registry)
 * 3. CANONICAL_NORMALIZATION (direct, uppercase, whitespace resolution)
 * 4. LEGACY_ALIAS_RESOLUTION (faq->faqs, catalog->products, reviews->testimonials, features->whyUs, map->contact)
 * 5. TURKISH_ALIAS_RESOLUTION (hizmetler->services, hakkimizda->about, galeri->gallery)
 * 6. UNKNOWN_SECTION_HANDLING (graceful null return without exceptions)
 * 7. PRESENTATION_BOUNDARY (zero CSS/Tailwind/HTML leakage in domain models)
 * 8. VARIANT_CONTRACT_VALID (allowed variants accepted)
 * 9. VARIANT_FALLBACK (unknown variant gracefully resolves to section's defaultVariant)
 * 10. INDUSTRY_PACK_ALIGNMENT (all 7 industry packs' recommended sections match registry)
 * 11. INDUSTRY_PACK_VARIANTS_VALID (all 7 industry packs' variants exist in allowedVariants)
 * 12. STRUCTURAL_CONSTRAINTS (header/footer non-reorderable, hero non-disableable)
 * 13. CONTENT_READINESS_READY (complete data produces READY and canRender=true)
 * 14. CONTENT_READINESS_EMPTY (0 services or 0 gallery images produces EMPTY and canRender=false)
 * 15. CONTENT_READINESS_DEGRADED (missing recommended items produces DEGRADED with warnings)
 * 16. CONTENT_READINESS_DISABLED (disabled section in config evaluates to NOT_CONFIGURED)
 * 17. CONFIG_VALIDATOR_VALID (valid SectionConfiguration passes validation)
 * 18. CONFIG_VALIDATOR_CANNOT_DISABLE_REQUIRED (flagged when mandatory section disabled)
 * 19. CONFIG_VALIDATOR_INVALID_VARIANT (flagged when unsupported variant used)
 * 20. CONFIG_VALIDATOR_DUPLICATE_CHECK (flags duplicate active section types)
 * 21. CATEGORY_AND_STATUS_FILTERS (category and status query functions return correct subsets)
 */

import {
  CANONICAL_SECTION_DEFINITIONS,
  SECTION_REGISTRY_MAP,
  normalizeSectionId,
  isCanonicalSectionId,
  getSectionDefinition,
  getAllSectionDefinitions,
  getAllCanonicalSectionIds,
  getSectionsByCategory,
  getSectionsByStatus,
  getDefaultPageSections,
  validateSectionDefinition,
  validateSectionVariant,
  validateSectionConfiguration,
  evaluateSectionReadiness,
  evaluateAllSectionsReadiness,
  getRenderableSections,
  ReadinessContext,
} from "../../domain/sections";
import { ALL_INDUSTRY_PACKS } from "../../domain/industries/catalog";
import { SectionConfiguration } from "../../domain/site/sectionConfiguration";
import { BusinessProfile } from "../../domain/site/businessProfile";
import { SiteContent } from "../../domain/site/siteContent";
import { sampleCanonicalSite } from "../../domain/site/fixtures";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    passedCount++;
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    failedCount++;
    console.error(`  ✗ [FAIL] ${testName} ${details ? `(${details})` : ""}`);
  }
}

export function runSectionRegistryVerification() {
  console.log("\n=== JETKUR SPRINT 06: CANONICAL SECTION REGISTRY & COMPONENT CONTRACT VERIFICATION ===\n");

  // =========================================================================
  // 1. Registry Size & Schema Validation
  // =========================================================================
  console.log("1. Registry Integrity & Schema Validation Tests:");

  assert(
    CANONICAL_SECTION_DEFINITIONS.length === 16,
    "REGISTRY_SIZE: Exactly 16 canonical sections defined (14 in-page + header + footer)",
    `Actual: ${CANONICAL_SECTION_DEFINITIONS.length}`
  );

  const ids = new Set<string>();
  let hasDuplicateId = false;
  for (const def of CANONICAL_SECTION_DEFINITIONS) {
    if (ids.has(def.id)) {
      hasDuplicateId = true;
    }
    ids.add(def.id);
  }
  assert(!hasDuplicateId, "UNIQUE_SECTION_IDS: All section IDs are strictly unique");

  let allValid = true;
  for (const def of CANONICAL_SECTION_DEFINITIONS) {
    const issues = validateSectionDefinition(def);
    if (issues.length > 0) {
      allValid = false;
      console.error(`Section ${def.id} validation issues:`, issues);
    }
  }
  assert(allValid, "ALL_SECTIONS_VALID: All 16 section definitions pass structural schema validation");

  // =========================================================================
  // 2. Normalization & Resolver Tests
  // =========================================================================
  console.log("\n2. Normalization, Alias & Resolution Tests:");

  assert(normalizeSectionId("hero") === "hero", "EXACT_NORMALIZATION: 'hero' normalizes to 'hero'");
  assert(normalizeSectionId("services") === "services", "EXACT_NORMALIZATION: 'services' normalizes to 'services'");
  assert(normalizeSectionId("faqs") === "faqs", "EXACT_NORMALIZATION: 'faqs' normalizes to 'faqs'");
  assert(normalizeSectionId("header") === "header", "EXACT_NORMALIZATION: 'header' normalizes to 'header'");
  assert(normalizeSectionId("footer") === "footer", "EXACT_NORMALIZATION: 'footer' normalizes to 'footer'");

  // Case & Whitespace Insensitivity
  assert(normalizeSectionId("  SERVICES  ") === "services", "CASE_WHITESPACE: '  SERVICES  ' resolves to 'services'");
  assert(normalizeSectionId("FAQ") === "faqs", "CASE_WHITESPACE: 'FAQ' resolves to 'faqs'");
  assert(normalizeSectionId("WhyUs") === "whyUs", "CASE_WHITESPACE: 'WhyUs' resolves to 'whyUs'");
  assert(normalizeSectionId("SocialFeed") === "socialFeed", "CASE_WHITESPACE: 'SocialFeed' resolves to 'socialFeed'");

  // Legacy Aliases
  assert(normalizeSectionId("faq") === "faqs", "LEGACY_ALIAS: 'faq' -> 'faqs'");
  assert(normalizeSectionId("catalog") === "products", "LEGACY_ALIAS: 'catalog' -> 'products'");
  assert(normalizeSectionId("reviews") === "testimonials", "LEGACY_ALIAS: 'reviews' -> 'testimonials'");
  assert(normalizeSectionId("features") === "whyUs", "LEGACY_ALIAS: 'features' -> 'whyUs'");
  assert(normalizeSectionId("map") === "contact", "LEGACY_ALIAS: 'map' -> 'contact'");

  // Turkish Aliases
  assert(normalizeSectionId("hizmetler") === "services", "TURKISH_ALIAS: 'hizmetler' -> 'services'");
  assert(normalizeSectionId("hakkimizda") === "about", "TURKISH_ALIAS: 'hakkimizda' -> 'about'");
  assert(normalizeSectionId("galeri") === "gallery", "TURKISH_ALIAS: 'galeri' -> 'gallery'");
  assert(normalizeSectionId("sss") === "faqs", "TURKISH_ALIAS: 'sss' -> 'faqs'");
  assert(normalizeSectionId("iletisim") === "contact", "TURKISH_ALIAS: 'iletisim' -> 'contact'");
  assert(normalizeSectionId("urunler") === "products", "TURKISH_ALIAS: 'urunler' -> 'products'");

  // Unknown Handling
  assert(normalizeSectionId("quantum-portal") === null, "UNKNOWN_SECTION: Unknown name returns null");
  assert(normalizeSectionId("") === null, "EMPTY_SECTION: Empty string returns null");
  assert(normalizeSectionId(null as unknown as string) === null, "NULL_SECTION: Null input returns null");

  // Type Guard
  assert(isCanonicalSectionId("services"), "TYPE_GUARD: 'services' isCanonicalSectionId returns true");
  assert(!isCanonicalSectionId("randomThing"), "TYPE_GUARD: 'randomThing' isCanonicalSectionId returns false");

  // =========================================================================
  // 3. Presentation Boundary Invariant
  // =========================================================================
  console.log("\n3. Presentation Boundary Invariant Tests:");

  let presentationPurity = true;
  const bannedKeywords = ["px-", "py-", "text-", "bg-", "rounded-", "flex", "grid-cols", "#", "<div", "<section"];

  for (const def of CANONICAL_SECTION_DEFINITIONS) {
    const jsonStr = JSON.stringify(def);
    for (const kw of bannedKeywords) {
      if (jsonStr.includes(`"${kw}`) || jsonStr.includes(` ${kw}`)) {
        presentationPurity = false;
        console.error(`Section '${def.id}' leaked presentation token '${kw}'`);
      }
    }
  }
  assert(presentationPurity, "PRESENTATION_BOUNDARY: Zero CSS/Tailwind/HTML tokens in section definitions");

  // =========================================================================
  // 4. Variant Contract & Fallback Tests
  // =========================================================================
  console.log("\n4. Variant Contract & Fallback Tests:");

  const validHeroVar = validateSectionVariant("hero", "urgent-callout");
  assert(validHeroVar.valid === true, "VARIANT_VALID: 'hero' with 'urgent-callout' is valid");
  assert(validHeroVar.resolvedVariant === "urgent-callout", "VARIANT_RESOLVED: requested variant preserved");
  assert(validHeroVar.isDefault === true, "VARIANT_IS_DEFAULT: 'urgent-callout' is correctly recognized as default");

  const splitHeroVar = validateSectionVariant("hero", "split-content-image");
  assert(splitHeroVar.valid === true, "VARIANT_VALID: 'split-content-image' is valid");
  assert(splitHeroVar.isDefault === false, "VARIANT_IS_DEFAULT: secondary variant is not default");

  const unknownHeroVar = validateSectionVariant("hero", "non-existent-funky-variant");
  assert(unknownHeroVar.valid === false, "VARIANT_INVALID: unknown variant rejected");
  assert(
    unknownHeroVar.resolvedVariant === "urgent-callout",
    "VARIANT_FALLBACK: unknown variant cleanly falls back to 'urgent-callout'"
  );
  assert(Boolean(unknownHeroVar.error), "VARIANT_ERROR_MESSAGE: helpful error message provided");

  const unknownSectionVar = validateSectionVariant("unknownSection", "anything");
  assert(unknownSectionVar.valid === false, "UNKNOWN_SECTION_VARIANT: rejected gracefully");

  // =========================================================================
  // 5. Industry Pack Alignment Tests
  // =========================================================================
  console.log("\n5. Industry Pack Alignment Tests (Sprint 05 <-> Sprint 06):");

  let allPacksSectionsValid = true;
  let allPacksVariantsValid = true;

  for (const pack of ALL_INDUSTRY_PACKS) {
    for (const recSec of pack.recommendedSections) {
      const canonicalId = normalizeSectionId(recSec.type);
      if (!canonicalId) {
        allPacksSectionsValid = false;
        console.error(`Pack '${pack.slug}' has unmapped section type '${recSec.type}'`);
      }

      if (recSec.recommendedVariant) {
        const variantRes = validateSectionVariant(recSec.type, recSec.recommendedVariant);
        if (!variantRes.valid) {
          allPacksVariantsValid = false;
          console.error(`Pack '${pack.slug}' uses invalid variant '${recSec.recommendedVariant}' for section '${recSec.type}'`);
        }
      }
    }
  }

  assert(
    allPacksSectionsValid,
    "INDUSTRY_PACK_SECTIONS_ALIGNED: All recommended sections in 7 packs match CanonicalSectionId"
  );
  assert(
    allPacksVariantsValid,
    "INDUSTRY_PACK_VARIANTS_ALIGNED: All recommended variants in 7 packs exist in allowedVariants"
  );

  // =========================================================================
  // 6. Structural Constraints Tests
  // =========================================================================
  console.log("\n6. Structural Constraints Tests:");

  const headerDef = getSectionDefinition("header")!;
  assert(headerDef.capabilities.isStructural === true, "STRUCTURAL_HEADER: Header is marked structural");
  assert(headerDef.capabilities.canDisable === false, "CANNOT_DISABLE_HEADER: Header cannot be disabled");
  assert(headerDef.capabilities.canReorder === false, "CANNOT_REORDER_HEADER: Header cannot be reordered");

  const footerDef = getSectionDefinition("footer")!;
  assert(footerDef.capabilities.isStructural === true, "STRUCTURAL_FOOTER: Footer is marked structural");
  assert(footerDef.capabilities.canDisable === false, "CANNOT_DISABLE_FOOTER: Footer cannot be disabled");
  assert(footerDef.capabilities.canReorder === false, "CANNOT_REORDER_FOOTER: Footer cannot be reordered");

  const heroDef = getSectionDefinition("hero")!;
  assert(heroDef.capabilities.canDisable === false, "CANNOT_DISABLE_HERO: Core hero banner cannot be disabled");

  const servicesDef = getSectionDefinition("services")!;
  assert(servicesDef.capabilities.canDisable === true, "CAN_DISABLE_SERVICES: Services section can be toggled");
  assert(servicesDef.capabilities.canReorder === true, "CAN_REORDER_SERVICES: Services section can be reordered");

  // =========================================================================
  // 7. Content Readiness Evaluation Tests
  // =========================================================================
  console.log("\n7. Content Readiness Evaluation Tests:");

  const readyContext: ReadinessContext = {
    businessProfile: sampleCanonicalSite.businessProfile,
    siteContent: sampleCanonicalSite.content,
  };

  // Services with data
  const servicesReady = evaluateSectionReadiness("services", readyContext);
  assert(servicesReady.status === "READY", "READINESS_SERVICES_READY: Status is READY with full services");
  assert(servicesReady.canRender === true, "READINESS_CAN_RENDER: canRender is true");
  assert(servicesReady.itemCount === sampleCanonicalSite.businessProfile.services.length, "READINESS_ITEM_COUNT: Counts match");

  // Services with 0 items
  const emptyServicesProfile: BusinessProfile = {
    ...sampleCanonicalSite.businessProfile,
    services: [],
  };
  const servicesEmpty = evaluateSectionReadiness("services", {
    businessProfile: emptyServicesProfile,
    siteContent: sampleCanonicalSite.content,
  });
  assert(servicesEmpty.status === "EMPTY", "READINESS_SERVICES_EMPTY: 0 services produces EMPTY status");
  assert(servicesEmpty.canRender === false, "READINESS_CANNOT_RENDER: Empty services cannot render");
  assert(servicesEmpty.missingRequired.length > 0, "READINESS_MISSING_REQ: Reports missing services");

  // Gallery with 0 items
  const emptyGalleryContent: SiteContent = {
    ...sampleCanonicalSite.content,
    gallery: [],
  };
  const galleryEmpty = evaluateSectionReadiness("gallery", {
    businessProfile: sampleCanonicalSite.businessProfile,
    siteContent: emptyGalleryContent,
  });
  assert(galleryEmpty.status === "EMPTY", "READINESS_GALLERY_EMPTY: 0 gallery photos produces EMPTY status");
  assert(galleryEmpty.canRender === false, "READINESS_GALLERY_CANNOT_RENDER: Empty gallery cannot render");

  // FAQs with 0 items
  const emptyFaqsContent: SiteContent = {
    ...sampleCanonicalSite.content,
    faqs: [],
  };
  const faqsEmpty = evaluateSectionReadiness("faqs", {
    businessProfile: sampleCanonicalSite.businessProfile,
    siteContent: emptyFaqsContent,
  });
  assert(faqsEmpty.status === "EMPTY", "READINESS_FAQS_EMPTY: 0 FAQs produces EMPTY status");
  assert(faqsEmpty.canRender === false, "READINESS_FAQS_CANNOT_RENDER: Empty FAQs cannot render");

  // Testimonials with 0 items
  const emptyTestimonialsContent: SiteContent = {
    ...sampleCanonicalSite.content,
    testimonials: [],
  };
  const testimonialsEmpty = evaluateSectionReadiness("testimonials", {
    businessProfile: sampleCanonicalSite.businessProfile,
    siteContent: emptyTestimonialsContent,
  });
  assert(testimonialsEmpty.status === "EMPTY", "READINESS_TESTIMONIALS_EMPTY: 0 reviews produces EMPTY status");

  // Degraded Mode (e.g., only 1 service when >= 2 is recommended)
  const singleServiceProfile: BusinessProfile = {
    ...sampleCanonicalSite.businessProfile,
    services: [sampleCanonicalSite.businessProfile.services[0]],
  };
  const servicesDegraded = evaluateSectionReadiness("services", {
    businessProfile: singleServiceProfile,
    siteContent: sampleCanonicalSite.content,
  });
  assert(servicesDegraded.status === "DEGRADED", "READINESS_DEGRADED: 1 service produces DEGRADED status");
  assert(servicesDegraded.canRender === true, "READINESS_DEGRADED_CAN_RENDER: Degraded section can still render");
  assert(servicesDegraded.missingRecommended.length > 0, "READINESS_MISSING_RECOMMENDED: Notes missing items");

  // Disabled in config
  const disabledConfig: SectionConfiguration = {
    sections: [
      { id: "hero", type: "hero", enabled: true, order: 0, variant: "urgent-callout" },
      { id: "services", type: "services", enabled: false, order: 1, variant: "grid-4" },
    ],
    header: { sticky: true, showPhoneButton: true, showWhatsAppButton: true, showCtaButton: true, navLinks: [] },
    footer: { showWorkingHours: true, showSocialIcons: true, showQuickLinks: true, showCopyright: true },
  };
  const servicesDisabled = evaluateSectionReadiness("services", {
    businessProfile: sampleCanonicalSite.businessProfile,
    siteContent: sampleCanonicalSite.content,
    sectionConfig: disabledConfig,
  });
  assert(servicesDisabled.status === "NOT_CONFIGURED", "READINESS_NOT_CONFIGURED: Disabled in config produces NOT_CONFIGURED");
  assert(servicesDisabled.canRender === false, "READINESS_DISABLED_CANNOT_RENDER: Disabled section cannot render");

  // Multi-section evaluation
  const allReadiness = evaluateAllSectionsReadiness(disabledConfig.sections, readyContext);
  assert(Boolean(allReadiness["hero"]), "ALL_READINESS: Contains hero entry");
  assert(Boolean(allReadiness["services"]), "ALL_READINESS: Contains services entry");

  // Filter renderable sections
  const renderable = getRenderableSections(disabledConfig.sections, readyContext);
  assert(renderable.length === 1 && renderable[0].id === "hero", "GET_RENDERABLE: Filters out disabled services");

  // =========================================================================
  // 8. Section Configuration Validation Tests
  // =========================================================================
  console.log("\n8. Section Configuration Validation Tests:");

  const validConfig: SectionConfiguration = {
    sections: [
      { id: "hero", type: "hero", enabled: true, order: 0, variant: "urgent-callout" },
      { id: "services", type: "services", enabled: true, order: 1, variant: "grid-4" },
      { id: "about", type: "about", enabled: true, order: 2, variant: "side-by-side" },
    ],
    header: { sticky: true, showPhoneButton: true, showWhatsAppButton: true, showCtaButton: true, navLinks: [] },
    footer: { showWorkingHours: true, showSocialIcons: true, showQuickLinks: true, showCopyright: true },
  };
  const validRes = validateSectionConfiguration(validConfig);
  assert(validRes.valid === true, "CONFIG_VALID: Conforming configuration passes validation");
  assert(validRes.issues.length === 0, "CONFIG_NO_ISSUES: Zero issues detected");

  // Attempt to disable hero
  const invalidHeroDisable: SectionConfiguration = {
    ...validConfig,
    sections: [
      { id: "hero", type: "hero", enabled: false, order: 0, variant: "urgent-callout" },
    ],
  };
  const heroDisableRes = validateSectionConfiguration(invalidHeroDisable);
  assert(heroDisableRes.valid === false, "CONFIG_FATAL: Disabling hero fails validation");
  assert(
    heroDisableRes.issues.some((i) => i.code === "CANNOT_DISABLE_REQUIRED"),
    "CONFIG_ERROR_CODE: CANNOT_DISABLE_REQUIRED reported"
  );

  // Unknown section type
  const unknownTypeConfig: SectionConfiguration = {
    ...validConfig,
    sections: [
      { id: "bogus", type: "bogusType" as any, enabled: true, order: 0, variant: "default" },
    ],
  };
  const unknownTypeRes = validateSectionConfiguration(unknownTypeConfig);
  assert(unknownTypeRes.valid === false, "CONFIG_FATAL: Unknown section type rejected");
  assert(
    unknownTypeRes.issues.some((i) => i.code === "UNKNOWN_SECTION_TYPE"),
    "CONFIG_ERROR_CODE: UNKNOWN_SECTION_TYPE reported"
  );

  // Invalid Variant (produces warning)
  const invalidVariantConfig: SectionConfiguration = {
    ...validConfig,
    sections: [
      { id: "hero", type: "hero", enabled: true, order: 0, variant: "super-alien-layout" },
    ],
  };
  const invalidVariantRes = validateSectionConfiguration(invalidVariantConfig);
  assert(
    invalidVariantRes.issues.some((i) => i.code === "INVALID_VARIANT" && i.severity === "warning"),
    "CONFIG_WARN_CODE: INVALID_VARIANT reported as warning"
  );

  // Duplicate active section
  const duplicateConfig: SectionConfiguration = {
    ...validConfig,
    sections: [
      { id: "services-1", type: "services", enabled: true, order: 1, variant: "grid-4" },
      { id: "services-2", type: "services", enabled: true, order: 2, variant: "cards-3" },
    ],
  };
  const duplicateRes = validateSectionConfiguration(duplicateConfig);
  assert(
    duplicateRes.issues.some((i) => i.code === "DUPLICATE_SECTION"),
    "CONFIG_WARN_CODE: DUPLICATE_SECTION detected"
  );

  // Invalid Order
  const invalidOrderConfig: SectionConfiguration = {
    ...validConfig,
    sections: [
      { id: "services", type: "services", enabled: true, order: -5, variant: "grid-4" },
    ],
  };
  const invalidOrderRes = validateSectionConfiguration(invalidOrderConfig);
  assert(
    invalidOrderRes.issues.some((i) => i.code === "INVALID_ORDER"),
    "CONFIG_ERROR_CODE: INVALID_ORDER detected for negative value"
  );

  // =========================================================================
  // 9. Query & Filter Helpers Tests
  // =========================================================================
  console.log("\n9. Query & Filter Helpers Tests:");

  const structural = getSectionsByCategory("STRUCTURAL");
  assert(
    structural.length === 2 && structural.some((s) => s.id === "header") && structural.some((s) => s.id === "footer"),
    "FILTER_CATEGORY: STRUCTURAL returns header and footer"
  );

  const trust = getSectionsByCategory("TRUST");
  assert(
    trust.length === 3 && trust.some((s) => s.id === "whyUs") && trust.some((s) => s.id === "testimonials") && trust.some((s) => s.id === "faqs"),
    "FILTER_CATEGORY: TRUST returns whyUs, testimonials, faqs"
  );

  const active = getSectionsByStatus("ACTIVE");
  assert(active.length === 15, "FILTER_STATUS: 15 ACTIVE sections");

  const experimental = getSectionsByStatus("EXPERIMENTAL");
  assert(
    experimental.length === 1 && experimental[0].id === "customHtml",
    "FILTER_STATUS: 1 EXPERIMENTAL section (customHtml)"
  );

  const defaultPage = getDefaultPageSections();
  assert(
    defaultPage.length === 10,
    "FILTER_DEFAULT_PAGE: 10 default enabled sections (header, hero, services, about, whyUs, gallery, testimonials, faqs, contact, footer)"
  );

  const allIds = getAllCanonicalSectionIds();
  assert(allIds.length === 16, "ALL_CANONICAL_IDS: Exactly 16 canonical IDs returned");

  // Summary
  console.log(`\nSection Registry Verification Complete: ${passedCount} / ${passedCount + failedCount} tests passed.\n`);

  if (failedCount > 0) {
    process.exit(1);
  }
}

// Auto-run if executed directly via CLI
if (process.argv[1]?.includes("verifySectionRegistry")) {
  runSectionRegistryVerification();
}
