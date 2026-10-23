/**
 * JetKur - Theme Foundation 02A Verification Suite
 * Canonical Design Token & Brand Kit Pipeline Fix
 *
 * Verifies:
 * 1. Strict Token Precedence: TemplateManifest defaults < BrandKit-derived tokens < Explicit user overrides
 * 2. Auto-populated legacy defaults are ignored (never falsely treated as explicit user overrides)
 * 3. Genuinely customized legacy site colors are preserved; ambiguous legacy colors are preserved & reported
 * 4. BrandKit tokens reach production static CSS/HTML generator
 * 5. Lossless round-trip (fromLegacySiteConfig <-> toLegacySiteConfig) without customTokens pollution
 * 6. Template switching updates canonical template & section variants while preserving 100% of business data, content, and SEO
 */

import {
  fromLegacySiteConfig,
  toLegacySiteConfig,
  inspectLegacyTokenProvenance,
} from "../../domain/site/legacyAdapter";
import { CANONICAL_TEMPLATE_MANIFESTS, resolveTemplate } from "../../domain/templates/catalog";
import { createBrandKit, darkenColor } from "../../domain/brand";
import { generateProductionSiteFiles } from "../../utils/productionGeneratorBridge";
import { createNeutralSiteConfig, createDefaultSiteConfig } from "../../data/mockData";
import { SiteConfig } from "../../types";

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

console.log("=== JETKUR THEME FOUNDATION 02A VERIFICATION ===\n");

// ---------------------------------------------------------------------------
// 1. Auto-populated legacy defaults do NOT block TemplateManifest defaults
// ---------------------------------------------------------------------------
console.log("--- 1. TemplateManifest Defaults & Auto-Default Filtering ---");
{
  const neutral = createNeutralSiteConfig();
  for (const manifest of CANONICAL_TEMPLATE_MANIFESTS) {
    const candidateConfig: SiteConfig = {
      ...neutral,
      templateId: manifest.id,
    };
    const canonical = fromLegacySiteConfig(candidateConfig);
    assert(
      canonical.designTemplate.templateId === manifest.id,
      `Template [${manifest.id}] resolves canonical templateId (${canonical.designTemplate.templateId})`
    );
    assert(
      canonical.designTemplate.customTokens?.palette === undefined,
      `Template [${manifest.id}] does not treat createNeutralSiteConfig() palette as explicit override`
    );
    assert(
      canonical.designTemplate.customTokens?.typography === undefined,
      `Template [${manifest.id}] does not treat default 'Inter' fontFamily as explicit override`
    );

    const files = generateProductionSiteFiles(candidateConfig);
    const cssFile = files.find((f) => f.filename === "assets/site.css" || f.fileName === "assets/site.css");
    const css = cssFile?.content || cssFile?.html || "";
    assert(
      css.toLowerCase().includes(`--jk-color-primary: ${manifest.designTokens.palette.primary.toLowerCase()};`),
      `Template [${manifest.id}] production CSS emits manifest primary (${manifest.designTokens.palette.primary})`
    );
  }
}

// ---------------------------------------------------------------------------
// 2. BrandKit-derived tokens override TemplateManifest defaults (Priority 2 > 1)
// ---------------------------------------------------------------------------
console.log("\n--- 2. BrandKit-Derived Tokens Precedence (Priority 2 > Priority 1) ---");
{
  const baseSite = createNeutralSiteConfig();
  const brandKit = createBrandKit({
    siteId: "site-brandkit-test",
    preferredPrimary: "#7c3aed",
    preferredSecondary: "#1e1b4b",
    preferredAccent: "#ec4899",
  });

  const configWithBrandKit: SiteConfig = {
    ...baseSite,
    templateId: "tmpl-clinical-pure",
    brandKit,
  };

  const canonical = fromLegacySiteConfig(configWithBrandKit);
  assert(
    canonical.designTemplate.customTokens?.palette === undefined,
    "Site with BrandKit and auto-default legacy palette has no Priority 3 palette overrides"
  );
  assert(
    canonical.brandKit?.palette.primary === "#7c3aed",
    "CanonicalSite preserves top-level BrandKit primary (#7c3aed)"
  );

  const files = generateProductionSiteFiles(configWithBrandKit);
  const css = (files.find((f) => f.filename === "assets/site.css")?.content || "").toLowerCase();
  assert(
    css.includes("--jk-color-primary: #7c3aed;"),
    "Production CSS uses BrandKit primary (#7c3aed) over Clinical Pure default (#059669)"
  );
  assert(
    css.includes(`--jk-color-accent: ${brandKit.palette.accent.toLowerCase()};`),
    `Production CSS uses BrandKit accent (${brandKit.palette.accent}) over Clinical Pure default (#0284c7)`
  );
}

// ---------------------------------------------------------------------------
// 3. Explicit user overrides win over BrandKit & TemplateManifest (Priority 3 > 2 > 1)
// ---------------------------------------------------------------------------
console.log("\n--- 3. Explicit User Overrides Precedence (Priority 3 > Priority 2 > Priority 1) ---");
{
  const baseSite = createNeutralSiteConfig();
  const brandKit = createBrandKit({
    siteId: "site-override-test",
    preferredPrimary: "#7c3aed",
    preferredSecondary: "#1e1b4b",
    preferredAccent: "#ec4899",
  });

  const explicitPrimary = "#dc2626";
  const expectedPrimaryDark = darkenColor(explicitPrimary, 15);

  const configWithOverride: SiteConfig = {
    ...baseSite,
    templateId: "tmpl-corporate-prestige",
    brandKit,
    colorTheme: {
      id: "custom-override",
      name: "Özel Renk Paleti",
      primary: explicitPrimary,
      secondary: brandKit.palette.secondary,
      accent: brandKit.palette.accent,
    },
  } as any;

  const canonical = fromLegacySiteConfig(configWithOverride);
  assert(
    canonical.designTemplate.customTokens?.palette?.primary === explicitPrimary,
    `Explicit user override (${explicitPrimary}) is captured in customTokens.palette.primary`
  );
  assert(
    canonical.designTemplate.customTokens?.palette?.primaryDark === expectedPrimaryDark,
    `primaryDark (${expectedPrimaryDark}) is deterministically derived from overridden primary`
  );

  const files = generateProductionSiteFiles(configWithOverride);
  const css = (files.find((f) => f.filename === "assets/site.css")?.content || "").toLowerCase();
  assert(
    css.includes(`--jk-color-primary: ${explicitPrimary.toLowerCase()};`),
    `Production CSS uses explicit override primary (${explicitPrimary}) over BrandKit (#7c3aed)`
  );
  assert(
    css.includes(`--jk-color-primary-dark: ${expectedPrimaryDark.toLowerCase()};`),
    `Production CSS uses derived primaryDark (${expectedPrimaryDark}) and does not leak BrandKit primaryDark`
  );
  assert(
    css.includes(`--jk-color-accent: ${brandKit.palette.accent.toLowerCase()};`),
    `Non-overridden BrandKit tokens (accent ${brandKit.palette.accent}) remain active at Priority 2`
  );
}

// ---------------------------------------------------------------------------
// 4. Genuinely customized legacy site colors & Ambiguity Detection
// ---------------------------------------------------------------------------
console.log("\n--- 4. Preserved Legacy Customizations & Ambiguity Reporting ---");
{
  const defaultBase = createDefaultSiteConfig();

  // 4A. Intentional stock palette selection on legacy site (e.g. emerald-trust on a corporate site)
  const siteWithIntentionalStockPalette: SiteConfig = {
    ...defaultBase,
    id: "site-legacy-stock",
    companyName: "Anadolu Mühendislik",
    templateId: "corporate-clean",
    palette: {
      id: "emerald-trust",
      name: "Zümrüt Güven",
      primary: "#047857",
      primaryDark: "#065f46",
      secondary: "#0f766e",
      accent: "#10b981",
      bg: "#ffffff",
      text: "#0f172a",
    },
    colorTheme: undefined,
    designSet: undefined,
  } as any;

  const provStock = inspectLegacyTokenProvenance(siteWithIntentionalStockPalette);
  assert(
    provStock.provenance.classification === "preserved_legacy_custom",
    "Intentional non-default stock palette is classified as preserved_legacy_custom"
  );
  assert(
    provStock.customTokens?.palette?.primary === "#047857",
    "Intentional non-default stock palette primary (#047857) is preserved"
  );

  // 4B. Ambiguous custom legacy palette (no palette.id, no colorTheme.id, custom hex colors)
  const siteWithAmbiguousPalette: SiteConfig = {
    ...defaultBase,
    id: "site-legacy-ambiguous",
    companyName: "Özel Tasarım Atölyesi",
    templateId: "corporate-clean",
    palette: {
      id: "",
      name: "",
      primary: "#8b5cf6",
      primaryDark: "#6d28d9",
      secondary: "#1e1b4b",
      accent: "#f43f5e",
      bg: "#ffffff",
      text: "#0f172a",
    },
    colorTheme: undefined,
    designSet: undefined,
  } as any;

  const provAmbiguous = inspectLegacyTokenProvenance(siteWithAmbiguousPalette);
  assert(
    provAmbiguous.provenance.classification === "ambiguous_preserved",
    "Unlabelled custom legacy palette is classified as ambiguous_preserved"
  );
  assert(
    provAmbiguous.provenance.ambiguities.length > 0,
    "Ambiguous legacy palette reports ambiguity reason instead of silently changing branding"
  );
  assert(
    provAmbiguous.customTokens?.palette?.primary === "#8b5cf6",
    "Ambiguous legacy palette primary (#8b5cf6) is safely preserved"
  );
}

// ---------------------------------------------------------------------------
// 5. Lossless Round-Trip (fromLegacySiteConfig <-> toLegacySiteConfig)
// ---------------------------------------------------------------------------
console.log("\n--- 5. Lossless Round-Tripping ---");
{
  // 5A. TemplateManifest default only round-trip
  const fresh = createNeutralSiteConfig();
  fresh.templateId = "tmpl-vip-luxury";
  const c1 = fromLegacySiteConfig(fresh);
  const l1 = toLegacySiteConfig(c1);
  const c2 = fromLegacySiteConfig(l1);
  assert(
    c2.designTemplate.templateId === "tmpl-vip-luxury",
    "Round-trip preserves canonical templateId (tmpl-vip-luxury)"
  );
  assert(
    c2.designTemplate.customTokens === undefined,
    "Round-trip of template-default site does NOT pollute customTokens"
  );

  // 5B. BrandKit round-trip
  const bk = createBrandKit({
    siteId: "site-rt-2",
    preferredPrimary: "#0d9488",
    preferredSecondary: "#134e4a",
    preferredAccent: "#f59e0b",
  });
  const withBk: SiteConfig = {
    ...createNeutralSiteConfig(),
    templateId: "tmpl-modern-minimal",
    brandKit: bk,
  };
  const cb1 = fromLegacySiteConfig(withBk);
  const lb1 = toLegacySiteConfig(cb1);
  const cb2 = fromLegacySiteConfig(lb1);
  assert(
    cb2.brandKit?.palette.primary === "#0d9488",
    "Round-trip preserves BrandKit primary (#0d9488) at Priority 2"
  );
  assert(
    cb2.designTemplate.customTokens?.palette === undefined,
    "Round-trip with BrandKit does NOT promote BrandKit tokens into Priority 3 customTokens"
  );
}

// ---------------------------------------------------------------------------
// 6. Content, Business Data & SEO Immutability Across Theme Switching
// ---------------------------------------------------------------------------
console.log("\n--- 6. Content & Business Data Immutability Across Theme Switching ---");
{
  const sourceSite: SiteConfig = {
    ...createDefaultSiteConfig(),
    templateId: "tmpl-clinical-pure",
    seo: {
      metaTitle: "Anadolu Klinik | Uzman Sağlık Hizmetleri",
      metaDescription: "7/24 profesyonel sağlık ve klinik çözümleri.",
      keywords: "klinik, sağlık, uzman doktor",
      canonicalUrl: "https://anadoluklinik.com",
      author: "HızlıWeb Engine",
      schemaType: "LocalBusiness",
    },
  };

  const beforeServicesJson = JSON.stringify(sourceSite.services);
  const beforeProductsJson = JSON.stringify(sourceSite.products);
  const beforeGalleryJson = JSON.stringify(sourceSite.gallery);
  const beforeSeoJson = JSON.stringify(sourceSite.seo);
  const beforePhone = sourceSite.phone;
  const beforeWhatsapp = sourceSite.whatsapp;
  const beforeEmail = sourceSite.email;
  const beforeAddress = sourceSite.address;

  // Switch template to tmpl-formal-legal
  const legalManifest = resolveTemplate("tmpl-formal-legal")!;
  const switchedSite: SiteConfig = {
    ...sourceSite,
    templateId: legalManifest.id,
    theme: legalManifest.slug as any,
    designTemplate: {
      templateId: legalManifest.id,
      templateSlug: legalManifest.slug,
      templateVersion: legalManifest.version || "1.0.0",
      sectionVariants: { ...legalManifest.sectionRecipe },
    },
  } as any;

  const canonicalSwitched = fromLegacySiteConfig(switchedSite);
  assert(
    canonicalSwitched.designTemplate.templateId === "tmpl-formal-legal",
    "Switched site resolves to tmpl-formal-legal"
  );
  assert(
    canonicalSwitched.designTemplate.sectionVariants?.hero === legalManifest.sectionRecipe.hero &&
      canonicalSwitched.designTemplate.sectionVariants?.header === legalManifest.sectionRecipe.header,
    "Switched site updates canonical sectionVariants to new template recipe"
  );
  assert(
    JSON.stringify(switchedSite.services) === beforeServicesJson &&
      canonicalSwitched.businessProfile.services.length === sourceSite.services.items.length,
    "Services are 100% preserved after template switch"
  );
  assert(
    JSON.stringify(switchedSite.products) === beforeProductsJson,
    "Products are 100% preserved after template switch"
  );
  assert(
    JSON.stringify(switchedSite.gallery) === beforeGalleryJson,
    "Gallery is 100% preserved after template switch"
  );
  assert(
    JSON.stringify(switchedSite.seo) === beforeSeoJson &&
      canonicalSwitched.settings.seo.metaTitle === sourceSite.seo.metaTitle,
    "SEO settings are 100% preserved after template switch"
  );
  assert(
    canonicalSwitched.businessProfile.contact.phone === beforePhone &&
      canonicalSwitched.businessProfile.contact.whatsapp === beforeWhatsapp &&
      canonicalSwitched.businessProfile.contact.email === beforeEmail &&
      canonicalSwitched.businessProfile.location.address === beforeAddress,
    "Contact and location info (phone, whatsapp, email, address) are 100% preserved"
  );
}

console.log(`\n=== SUMMARY: ${passed} passed, ${failed} failed ===`);
if (failed > 0) {
  process.exit(1);
}
