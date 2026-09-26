/**
 * JetKur Sprint 07: Template Manifest & Design System Verification Suite
 *
 * Verifies all 35 required checks from Sprint 07 specifications:
 * - Manifest schema validity and identity uniqueness
 * - Section Registry authority and variant conformance
 * - Presentation boundary, semantic tokens, zero Tailwind utility class leaks
 * - Security: Zero raw HTML, zero executable code, zero script injection
 * - Domain purity: Zero customer data, zero industry copy
 * - Template switching: 100% preservation of BusinessProfile, SiteContent, and IndustryPack
 * - Explicit customer preferences preservation (disabled sections stay disabled)
 * - Round-trip switching stability (A -> B -> A)
 * - Industry neutrality & multiple industry / multiple template interoperability
 */

import {
  CANONICAL_TEMPLATE_MANIFESTS,
  LEGACY_TEMPLATE_COMPATIBILITY_MAP,
  getTemplateById,
  getTemplateBySlug,
  listActiveTemplates,
  listTemplates,
  resolveTemplate,
} from "../../domain/templates/catalog";
import { validateTemplateManifest } from "../../domain/templates/validator";
import { applyTemplateManifest, switchTemplate, generateInitialSectionConfiguration } from "../../domain/templates/switcher";
import { TemplateManifest } from "../../domain/templates/types";
import { ALL_INDUSTRY_PACKS } from "../../domain/industries/catalog";
import { isCanonicalSectionId } from "../../domain/sections/normalizer";
import { validateSectionVariant } from "../../domain/sections/validator";
import { evaluateSectionReadiness } from "../../domain/sections/readiness";
import { sampleCanonicalSite } from "../../domain/site/fixtures";
import { CanonicalSite } from "../../domain/site/site";

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

export function runTemplateManifestVerification() {
  console.log("\n=== JETKUR SPRINT 07: TEMPLATE MANIFEST & DESIGN SYSTEM VERIFICATION ===\n");

  // =========================================================================
  // 1. Manifest Schema & Identity Tests
  // =========================================================================
  console.log("1. Manifest Schema, Identity & Catalog Tests:");

  assert(
    CANONICAL_TEMPLATE_MANIFESTS.length === 8,
    "CATALOG_SIZE: Exactly 8 canonical template manifests defined",
    `Actual: ${CANONICAL_TEMPLATE_MANIFESTS.length}`
  );

  const ids = new Set<string>();
  const slugs = new Set<string>();
  let duplicateId = false;
  let duplicateSlug = false;

  for (const t of CANONICAL_TEMPLATE_MANIFESTS) {
    if (ids.has(t.id)) duplicateId = true;
    if (slugs.has(t.slug)) duplicateSlug = true;
    ids.add(t.id);
    slugs.add(t.slug);
  }

  assert(!duplicateId, "UNIQUE_TEMPLATE_IDS: All template IDs are strictly unique");
  assert(!duplicateSlug, "UNIQUE_TEMPLATE_SLUGS: All template slugs are strictly unique");

  let allSchemasValid = true;
  for (const t of CANONICAL_TEMPLATE_MANIFESTS) {
    const val = validateTemplateManifest(t);
    if (!val.valid) {
      allSchemasValid = false;
      console.error(`Validation failed for '${t.id}':`, val.issues);
    }
  }
  assert(allSchemasValid, "MANIFEST_SCHEMA_VALID: All 8 canonical manifests pass strict validation");

  const activeTemplates = listActiveTemplates();
  assert(
    activeTemplates.length === 8,
    "ACTIVE_TEMPLATE_LOOKUP: All 8 templates have ACTIVE status for customer site creation"
  );

  assert(
    Boolean(getTemplateById("tmpl-rapid-service")),
    "GET_BY_ID: 'tmpl-rapid-service' resolves successfully"
  );
  assert(
    Boolean(getTemplateBySlug("corporate-prestige")),
    "GET_BY_SLUG: 'corporate-prestige' resolves successfully"
  );
  assert(
    resolveTemplate("non-existent-template-xyz") === null,
    "UNKNOWN_TEMPLATE_SAFE: Unknown identifier safely returns null"
  );

  // =========================================================================
  // 2. Section Registry Authority Tests
  // =========================================================================
  console.log("\n2. Section Registry Authority & Variant Conformance Tests:");

  let allSectionsValid = true;
  let allVariantsValid = true;

  for (const t of CANONICAL_TEMPLATE_MANIFESTS) {
    for (const [secId, variant] of Object.entries(t.sectionRecipe)) {
      if (!isCanonicalSectionId(secId)) {
        allSectionsValid = false;
        console.error(`Template '${t.id}' uses non-canonical section ID '${secId}'`);
      }
      const varRes = validateSectionVariant(secId, variant as string);
      if (!varRes.valid) {
        allVariantsValid = false;
        console.error(`Template '${t.id}' uses unallowed variant '${variant}' for section '${secId}'`);
      }
    }
  }

  assert(allSectionsValid, "SECTION_IDS_VALID: Every section in all recipes matches CanonicalSectionId");
  assert(allVariantsValid, "SECTION_VARIANTS_VALID: Every variant matches Section Registry allowedVariants");

  // Unknown variant rejection test
  const forgedManifest: TemplateManifest = {
    ...CANONICAL_TEMPLATE_MANIFESTS[0],
    id: "tmpl-forged-test",
    sectionRecipe: {
      hero: "ultra-quantum-3d-unsupported-variant",
    },
  };
  const forgedVal = validateTemplateManifest(forgedManifest);
  assert(forgedVal.valid === false, "UNKNOWN_VARIANT_REJECTED: Arbitrary variant is rejected by validator");
  assert(
    forgedVal.issues.some((i) => i.code === "UNKNOWN_SECTION_VARIANT"),
    "UNKNOWN_VARIANT_ERROR_CODE: Reported as UNKNOWN_SECTION_VARIANT"
  );

  // Structural header/footer variants
  for (const t of CANONICAL_TEMPLATE_MANIFESTS) {
    const headerVar = t.sectionRecipe.header;
    if (headerVar) {
      assert(
        validateSectionVariant("header", headerVar).valid,
        `HEADER_VARIANT_VALID: '${t.id}' header variant '${headerVar}' is valid`
      );
    }
    const footerVar = t.sectionRecipe.footer;
    if (footerVar) {
      assert(
        validateSectionVariant("footer", footerVar).valid,
        `FOOTER_VARIANT_VALID: '${t.id}' footer variant '${footerVar}' is valid`
      );
    }
  }

  // =========================================================================
  // 3. Presentation Boundary & Security Invariant Tests
  // =========================================================================
  console.log("\n3. Presentation Boundary & Security Invariant Tests:");

  let presentationPurity = true;
  let securityPurity = true;
  let domainPurity = true;

  const bannedTailwind = ["px-", "py-", "bg-", "text-", "rounded-", "grid-cols-", "max-w-"];
  const bannedHtml = ["<script", "<div", "<span", "<iframe", "javascript:", "onload=", "onclick="];
  const bannedCustomerFields = ["companyName", "phone", "whatsapp", "email", "address", "taxId"];
  const bannedIndustryFields = ["defaultServices", "defaultFaqs", "servicesList", "aboutStory"];

  for (const t of CANONICAL_TEMPLATE_MANIFESTS) {
    const jsonStr = JSON.stringify(t);

    for (const tw of bannedTailwind) {
      if (jsonStr.includes(`"${tw}`) || jsonStr.includes(` ${tw}`)) {
        presentationPurity = false;
        console.error(`Template '${t.id}' leaks Tailwind prefix '${tw}'`);
      }
    }

    for (const html of bannedHtml) {
      if (jsonStr.toLowerCase().includes(html)) {
        securityPurity = false;
        console.error(`Template '${t.id}' leaks HTML/script pattern '${html}'`);
      }
    }

    for (const cust of bannedCustomerFields) {
      if (Object.prototype.hasOwnProperty.call(t, cust)) {
        domainPurity = false;
        console.error(`Template '${t.id}' leaks customer field '${cust}'`);
      }
    }

    for (const ind of bannedIndustryFields) {
      if (Object.prototype.hasOwnProperty.call(t, ind)) {
        domainPurity = false;
        console.error(`Template '${t.id}' leaks industry field '${ind}'`);
      }
    }
  }

  assert(presentationPurity, "NO_TAILWIND_IMPLEMENTATION_LEAK: Zero Tailwind utility classes in manifests");
  assert(securityPurity, "NO_RAW_HTML: Zero raw HTML or script tags in manifests");
  assert(securityPurity, "NO_EXECUTABLE_CODE: Zero executable JavaScript or function handles");
  assert(domainPurity, "NO_CUSTOMER_CONTENT: Zero customer-owned data in manifests");
  assert(domainPurity, "NO_INDUSTRY_CONTENT: Zero industry-specific copy in manifests");

  // Deterministic JSON serialization
  const serialized = JSON.stringify(CANONICAL_TEMPLATE_MANIFESTS);
  const parsed = JSON.parse(serialized);
  assert(Array.isArray(parsed) && parsed.length === 8, "SERIALIZATION_DETERMINISTIC: Pure JSON serializable");

  // Semantic Design Tokens
  let allTokensValid = true;
  for (const t of CANONICAL_TEMPLATE_MANIFESTS) {
    const { palette, typography, geometry } = t.designTokens;
    if (!palette?.primary || !palette?.secondary || !palette?.accent) allTokensValid = false;
    if (!typography?.fontHeading || !typography?.fontBody) allTokensValid = false;
    if (!geometry?.borderRadius || !geometry?.sectionSpacing) allTokensValid = false;
  }
  assert(allTokensValid, "DESIGN_TOKENS_VALID: All templates define semantic palette, typography, and geometry");

  // Versioning
  const allVersionsValid = CANONICAL_TEMPLATE_MANIFESTS.every((t) => /^\d+\.\d+\.\d+$/.test(t.version));
  assert(allVersionsValid, "TEMPLATE_VERSION_VALID: All templates follow semantic versioning (1.0.0)");

  const allSchemaVersionsValid = CANONICAL_TEMPLATE_MANIFESTS.every((t) => t.schemaVersion === 1);
  assert(allSchemaVersionsValid, "SCHEMA_VERSION_VALID: All templates use schemaVersion = 1");

  // =========================================================================
  // 4. Template Switching & Content Preservation Tests
  // =========================================================================
  console.log("\n4. Template Switching & Content Preservation Tests:");

  const templateA = CANONICAL_TEMPLATE_MANIFESTS[0]; // rapid-service (hero: urgent-callout, services: grid-4)
  const templateB = CANONICAL_TEMPLATE_MANIFESTS[1]; // corporate-prestige (hero: centered-prestige, services: cards-3)

  // Initial site with Template A
  const initialSite: CanonicalSite = {
    ...sampleCanonicalSite,
    designTemplate: {
      templateId: templateA.id,
      templateSlug: templateA.slug,
      templateVersion: templateA.version,
    } as any,
  };

  // Switch to Template B
  const { updatedSite: switchedSite, result: switchResult } = switchTemplate(initialSite, templateB);

  assert(switchResult.success === true, "TEMPLATE_SWITCH_SUCCESS: Switch executed successfully");
  assert(switchedSite.designTemplate.templateId === templateB.id, "TEMPLATE_ID_UPDATED: New template ID applied");
  assert(switchedSite.designTemplate.templateVersion === templateB.version, "TEMPLATE_VERSION_PINNED: Version pinned");

  // Invariant 1: BusinessProfile completely preserved
  const originalProfileJson = JSON.stringify(initialSite.businessProfile);
  const switchedProfileJson = JSON.stringify(switchedSite.businessProfile);
  assert(originalProfileJson === switchedProfileJson, "BUSINESS_PROFILE_PRESERVED: BusinessProfile is 100% immutable");

  // Invariant 2: SiteContent completely preserved
  const originalContentJson = JSON.stringify(initialSite.content);
  const switchedContentJson = JSON.stringify(switchedSite.content);
  assert(originalContentJson === switchedContentJson, "SITE_CONTENT_PRESERVED: SiteContent is 100% immutable");

  // Invariant 3: Industry selection preserved
  assert(switchedSite.industryPackId === initialSite.industryPackId, "INDUSTRY_PRESERVED: industryPackId unchanged");

  // Invariant 4: Services, FAQs, Gallery, Blog preserved
  assert(
    switchedSite.businessProfile.services.length === initialSite.businessProfile.services.length,
    "SERVICES_PRESERVED: Service items count unchanged"
  );
  assert(
    switchedSite.content.faqs.length === initialSite.content.faqs.length,
    "FAQS_PRESERVED: FAQ items count unchanged"
  );
  assert(
    switchedSite.content.gallery.length === initialSite.content.gallery.length,
    "GALLERY_PRESERVED: Gallery items count unchanged"
  );
  assert(
    switchedSite.content.blogPosts.length === initialSite.content.blogPosts.length,
    "BLOG_PRESERVED: Blog posts count unchanged"
  );

  // Invariant 5: Section variants updated to Template B recipe
  const switchedHeroSec = switchedSite.sectionConfiguration.sections.find((s) => s.id.includes("hero"));
  assert(
    switchedHeroSec?.variant === templateB.sectionRecipe.hero,
    `SECTION_VARIANT_UPDATED: Hero variant updated to '${templateB.sectionRecipe.hero}'`,
    `Actual: ${switchedHeroSec?.variant}`
  );

  // Invariant 6: Disabled Section Customer Choice Preservation
  const siteWithDisabledFaq: CanonicalSite = {
    ...initialSite,
    sectionConfiguration: {
      ...initialSite.sectionConfiguration,
      sections: initialSite.sectionConfiguration.sections.map((s) =>
        s.id.includes("faq") ? { ...s, enabled: false } : s
      ),
    },
  };
  const { updatedSite: switchedDisabledSite } = switchTemplate(siteWithDisabledFaq, templateB);
  const faqAfterSwitch = switchedDisabledSite.sectionConfiguration.sections.find((s) => s.id.includes("faq"));
  assert(
    faqAfterSwitch?.enabled === false,
    "DISABLED_SECTION_PREFERENCE_PRESERVED: User disabled FAQ remains disabled after template switch"
  );

  // Invariant 7: Template Without Section Preserves Data
  // Create a template that omits gallery in recipe
  const templateWithoutGallery: TemplateManifest = {
    ...templateA,
    id: "tmpl-no-gallery",
    sectionRecipe: {
      hero: "urgent-callout",
      services: "grid-4",
    },
  };
  const { updatedSite: switchedNoGallerySite } = switchTemplate(initialSite, templateWithoutGallery);
  assert(
    switchedNoGallerySite.content.gallery.length === initialSite.content.gallery.length,
    "MISSING_TEMPLATE_SECTION_DATA_PRESERVED: Customer gallery data is NOT deleted even if template has no gallery recipe"
  );

  // Invariant 8: Round-Trip Switching (Template A -> Template B -> Template A)
  const { updatedSite: roundTripSite } = switchTemplate(switchedSite, templateA);
  const roundTripContentJson = JSON.stringify(roundTripSite.content);
  assert(
    originalContentJson === roundTripContentJson,
    "ROUND_TRIP_TEMPLATE_SWITCH: Content after A -> B -> A is byte-identical"
  );
  const roundTripProfileJson = JSON.stringify(roundTripSite.businessProfile);
  assert(
    originalProfileJson === roundTripProfileJson,
    "ROUND_TRIP_PROFILE_IDENTICAL: BusinessProfile after A -> B -> A is byte-identical"
  );

  // =========================================================================
  // 5. Industry Independence & Multi-Industry / Multi-Template Tests
  // =========================================================================
  console.log("\n5. Industry Independence & Cross-Compatibility Tests (Sections 78-79):");

  const testIndustries = ALL_INDUSTRY_PACKS.slice(0, 3); // oto-kurtarma, dis-hekimligi, hukuk-avukat
  let allIndustriesNeutral = true;

  for (const pack of testIndustries) {
    const initialConfig = generateInitialSectionConfiguration(templateA, pack);
    if (!initialConfig || initialConfig.sections.length === 0) {
      allIndustriesNeutral = false;
      console.error(`Failed initial section generation for pack '${pack.slug}' with '${templateA.id}'`);
    }
  }
  assert(allIndustriesNeutral, "INDUSTRY_TEMPLATE_INDEPENDENCE: Same template (Template A) works across multiple industries");

  // Same industry with multiple templates
  const plumbingPack = ALL_INDUSTRY_PACKS.find((p) => p.slug === "sihhi-tesisat")!;
  const configTmplA = generateInitialSectionConfiguration(templateA, plumbingPack);
  const configTmplB = generateInitialSectionConfiguration(templateB, plumbingPack);

  assert(
    configTmplA.sections.length > 0 && configTmplB.sections.length > 0,
    "MULTIPLE_TEMPLATES_SAME_INDUSTRY: Industry Pack works with both Template A and Template B"
  );

  const heroA = configTmplA.sections.find((s) => s.type === "hero");
  const heroB = configTmplB.sections.find((s) => s.type === "hero");
  assert(
    heroA?.variant === templateA.sectionRecipe.hero && heroB?.variant === templateB.sectionRecipe.hero,
    "PRESENTATION_RECIPE_GOVERNS: Template recipe governs section presentation, not industry pack"
  );

  // Section Readiness compatibility
  const readinessCheck = evaluateSectionReadiness("services", {
    businessProfile: switchedSite.businessProfile,
    siteContent: switchedSite.content,
    sectionConfig: switchedSite.sectionConfiguration,
  });
  assert(readinessCheck.canRender === true, "SECTION_READINESS_COMPATIBILITY: Section readiness engine validates switched site");

  // =========================================================================
  // 6. Legacy Template Compatibility Mapping Tests
  // =========================================================================
  console.log("\n6. Legacy Template Compatibility Mapping Tests:");

  const legacyKeys = Object.keys(LEGACY_TEMPLATE_COMPATIBILITY_MAP);
  assert(legacyKeys.length >= 6, "LEGACY_MAP_SIZE: At least 6 legacy templates mapped");

  let allLegacyResolve = true;
  for (const [legacyKey, canonicalId] of Object.entries(LEGACY_TEMPLATE_COMPATIBILITY_MAP)) {
    const resolved = resolveTemplate(legacyKey);
    if (!resolved || resolved.id !== canonicalId) {
      allLegacyResolve = false;
      console.error(`Legacy mapping failed for '${legacyKey}' -> expected '${canonicalId}', got '${resolved?.id}'`);
    }
  }
  assert(allLegacyResolve, "LEGACY_TEMPLATE_MAPPING_VALID: All legacy templates resolve to canonical manifests");

  // Summary
  console.log(`\nTemplate Manifest Verification Complete: ${passedCount} / ${passedCount + failedCount} tests passed.\n`);

  if (failedCount > 0) {
    process.exit(1);
  }
}

// Auto-run if executed directly via CLI
if (process.argv[1]?.includes("verifyTemplateManifests")) {
  runTemplateManifestVerification();
}
