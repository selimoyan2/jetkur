/**
 * JetKur - Theme Foundation 02D Verification Suite
 * Premium Theme Studio, Visual Design Engine & Industry Template Expansion
 *
 * Verifies:
 * 1. 16 Master Semantic Palettes (all 13 tokens, WCAG AA compliance, custom HEX derivation).
 * 2. Background & Gradient Engine (7 background types, 6 master presets, injection hardening).
 * 3. Typography System (4 archetypes, Turkish charset latin-ext support, Google Fonts tag generation).
 * 4. Industry Template Expansion (12 sector-focused manifests resolvable via catalog, valid recipes).
 * 5. Smart Design Recommendation Engine (deterministic multi-factor matching, rationale, conversion benefits).
 * 6. Theme Studio Configuration & Strict Token Hierarchy (User Override > BrandKit > Template Defaults).
 * 7. Preview and Production Static Site Parity (100% byte-for-byte parity across industry templates).
 * 8. Authentic Content Preservation & Missing Data Safety.
 * 9. Responsive CSS & Mobile Viewport Compliance (320px - 1440px).
 */

import {
  PREMIUM_PALETTES,
  listPremiumPalettes,
  getPaletteById,
  auditPaletteWcagContrast,
  createCustomPaletteFromHex,
  GRADIENT_PRESETS,
  compileBackgroundStyle,
  validateSafeImageUrl,
  TYPOGRAPHY_PRESETS,
  listTypographyPresets,
  getTypographyPresetById,
  generateGoogleFontsLinkTag,
  verifyTurkishCharsetSupport,
  recommendDesignPackages,
  findMatchingSectorRule,
  resolveDesignTokens,
  createBrandKit,
} from "../../domain/brand";
import {
  CANONICAL_TEMPLATE_MANIFESTS,
  INDUSTRY_TEMPLATE_MANIFESTS,
  ALL_TEMPLATE_MANIFESTS,
  resolveTemplate,
} from "../../domain/templates/catalog";
import {
  fromLegacySiteConfig,
  toLegacySiteConfig,
} from "../../domain/site/legacyAdapter";
import {
  generateProductionSiteFiles,
  generateProductionPreviewHtml,
} from "../../utils/productionGeneratorBridge";
import { generateCandidatePreviewHtml } from "../../domain/templates/preview";
import { renderFooterSection, renderWhyUsSection } from "../../utils/generator/sectionRenderer";
import { generateStaticCss } from "../../utils/staticCssGenerator";
import { createDefaultSiteConfig, createNeutralSiteConfig } from "../../data/mockData";
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

console.log("=== JETKUR THEME FOUNDATION 02D VERIFICATION ===\n");

// ---------------------------------------------------------------------------
// 1. 16 Master Semantic Color Palettes
// ---------------------------------------------------------------------------
console.log("--- 1. Premium Color Palette Engine (16 Palettes) ---");
{
  const palettes = listPremiumPalettes();
  assert(palettes.length === 16, `Exactly 16 master color palettes defined (found ${palettes.length})`);

  const expectedIds = [
    "corporate-navy",
    "modern-blue",
    "emerald-green",
    "botanical-sage",
    "black-gold",
    "champagne-luxury",
    "royal-purple",
    "violet-gradient",
    "burgundy-elegance",
    "terracotta",
    "ocean-teal",
    "minimal-white",
    "midnight-dark",
    "copper-industrial",
    "sunset-gradient",
    "warm-neutral",
  ];

  for (const expectedId of expectedIds) {
    const pal = getPaletteById(expectedId);
    assert(pal.id === expectedId, `Palette [${expectedId}] is registered in palette registry`);

    // Verify all 13 required token fields
    assert(Boolean(pal.primary), `[${expectedId}] has primary (${pal.primary})`);
    assert(Boolean(pal.secondary), `[${expectedId}] has secondary (${pal.secondary})`);
    assert(Boolean(pal.accent), `[${expectedId}] has accent (${pal.accent})`);
    assert(Boolean(pal.background), `[${expectedId}] has background (${pal.background})`);
    assert(Boolean(pal.surface), `[${expectedId}] has surface (${pal.surface})`);
    assert(Boolean(pal.foreground), `[${expectedId}] has foreground (${pal.foreground})`);
    assert(Boolean(pal.mutedForeground), `[${expectedId}] has mutedForeground (${pal.mutedForeground})`);
    assert(Boolean(pal.border), `[${expectedId}] has border (${pal.border})`);
    assert(Boolean(pal.buttonBackground), `[${expectedId}] has buttonBackground (${pal.buttonBackground})`);
    assert(Boolean(pal.buttonForeground), `[${expectedId}] has buttonForeground (${pal.buttonForeground})`);
    assert(Boolean(pal.link), `[${expectedId}] has link (${pal.link})`);
    assert(Boolean(pal.hover), `[${expectedId}] has hover (${pal.hover})`);
    assert(Boolean(pal.overlay), `[${expectedId}] has overlay (${pal.overlay})`);

    // Contrast audit
    const audit = auditPaletteWcagContrast(pal);
    assert(audit.passesWcag, `[${expectedId}] satisfies WCAG AA contrast (textOnBg: ${audit.textOnBg.toFixed(1)}:1, btn: ${audit.btnTextOnBtnBg.toFixed(1)}:1)`);
  }

  // Custom HEX palette generation
  const customPal = createCustomPaletteFromHex("#EA580C", "corporate-navy");
  assert(customPal.primary.toLowerCase() === "#ea580c", "Custom HEX generation assigns primary accurately");
  assert(Boolean(customPal.primaryDark), "Custom HEX generation derives primaryDark");
  assert(customPal.buttonBackground.toLowerCase() === "#ea580c", "Custom HEX assigns button background");
}

// ---------------------------------------------------------------------------
// 2. Background & Gradient System
// ---------------------------------------------------------------------------
console.log("\n--- 2. Background & Gradient Engine ---");
{
  assert(GRADIENT_PRESETS.length === 6, `Exactly 6 gradient presets defined (found ${GRADIENT_PRESETS.length})`);

  const expectedPresets = [
    "royal-purple",
    "ocean-blue",
    "emerald-glow",
    "sunset",
    "champagne",
    "dark-luxury",
  ];

  for (const presetId of expectedPresets) {
    const res = compileBackgroundStyle({ type: "linear-gradient", presetId });
    assert(res.className === "jk-bg-gradient-linear", `Preset [${presetId}] compiles linear gradient class`);
    assert(res.styleString.includes("linear-gradient"), `Preset [${presetId}] outputs valid linear-gradient CSS`);
  }

  // Background types
  const solidBg = compileBackgroundStyle({ type: "solid", color: "#F8FAFC" });
  assert(solidBg.styleString === "background-color: #F8FAFC;", "Solid background compiles background-color");

  const radialBg = compileBackgroundStyle({ type: "radial-gradient", presetId: "ocean-blue" });
  assert(radialBg.styleString.includes("radial-gradient"), "Radial gradient compiles valid radial-gradient CSS");

  const textureBg = compileBackgroundStyle({ type: "subtle-texture", color: "#FFFFFF", texturePattern: "subtle-dots" });
  assert(textureBg.className.includes("jk-texture-subtle-dots"), "Subtle texture applies pattern class");

  // Injection hardening
  const maliciousImg = validateSafeImageUrl("javascript:alert(1)");
  assert(maliciousImg === null, "Rejects javascript: URI in background image");

  const breakoutImg = validateSafeImageUrl("https://example.com/bg.jpg'); color: red; /*");
  assert(breakoutImg === null, "Rejects CSS injection breakouts in background image");

  const safeImg = validateSafeImageUrl("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab");
  assert(safeImg !== null, "Accepts safe HTTPS image URLs");
}

// ---------------------------------------------------------------------------
// 3. Typography System & Turkish Charset
// ---------------------------------------------------------------------------
console.log("\n--- 3. Typography System ---");
{
  const presets = listTypographyPresets();
  assert(presets.length === 4, `Exactly 4 typography archetypes defined (found ${presets.length})`);

  const archetypes = ["corporate-sans", "modern-minimal", "elegant-serif", "premium-editorial"];
  for (const archId of archetypes) {
    const t = getTypographyPresetById(archId as any);
    assert(t.id === archId, `Typography archetype [${archId}] is registered`);
    assert(Boolean(t.fontHeading), `[${archId}] specifies heading font (${t.fontHeading})`);
    assert(Boolean(t.fontBody), `[${archId}] specifies body font (${t.fontBody})`);

    const linkTag = generateGoogleFontsLinkTag(t);
    assert(linkTag.includes("subset=latin,latin-ext"), `[${archId}] font link specifies latin-ext subset for Turkish`);
  }

  // Turkish character support check
  const turkishText = "Çınar, çağlayan, ırmak, özenli ve şeffaf hizmetlerimizle 7/24 yanınızdayız. Şafak, Ümit, İzzet.";
  assert(verifyTurkishCharsetSupport(turkishText), "Turkish charset validation passes without missing codepoints");
}

// ---------------------------------------------------------------------------
// 4. Industry Template Expansion (12 Sektörel Şablon)
// ---------------------------------------------------------------------------
console.log("\n--- 4. Industry Template Expansion (12 Priority Sectors) ---");
{
  assert(INDUSTRY_TEMPLATE_MANIFESTS.length === 12, `Exactly 12 industry manifests defined (found ${INDUSTRY_TEMPLATE_MANIFESTS.length})`);
  assert(ALL_TEMPLATE_MANIFESTS.length === 20, `Total platform template manifests = 20 (8 canonical + 12 industry)`);

  const expectedIndustryIds = [
    "tmpl-plumbing-pro",
    "tmpl-climate-service",
    "tmpl-towing-rescue",
    "tmpl-electrician-power",
    "tmpl-dental-care",
    "tmpl-legal-authority",
    "tmpl-real-estate-prestige",
    "tmpl-beauty-aesthetic",
    "tmpl-hotel-resort",
    "tmpl-restaurant-gourmet",
    "tmpl-construction-architect",
    "tmpl-consulting-advisory",
  ];

  for (const id of expectedIndustryIds) {
    const manifest = resolveTemplate(id);
    assert(manifest !== null && manifest.id === id, `Industry manifest [${id}] resolves from catalog`);
    if (manifest) {
      assert(Boolean(manifest.designTokens.palette.primary), `[${id}] has valid primary color`);
      assert(Boolean(manifest.designTokens.typography.fontHeading), `[${id}] has valid heading typography`);
      assert(Boolean(manifest.sectionRecipe.header), `[${id}] defines header variant (${manifest.sectionRecipe.header})`);
      assert(Boolean(manifest.sectionRecipe.footer), `[${id}] defines footer variant (${manifest.sectionRecipe.footer})`);
      assert(Boolean(manifest.sectionRecipe.services), `[${id}] defines services variant (${manifest.sectionRecipe.services})`);
      assert(manifest.capabilities.isResponsive, `[${id}] enforces responsive layout`);
    }
  }
}

// ---------------------------------------------------------------------------
// 5. Smart Design Recommendation Engine
// ---------------------------------------------------------------------------
console.log("\n--- 5. Smart Design Recommendation Engine ---");
{
  // A. Plumbing
  const plumbingRecs = recommendDesignPackages("Sıhhi Tesisat ve Su Kaçağı Tespiti");
  assert(plumbingRecs[0].templateId === "tmpl-plumbing-pro", "Plumbing sector recommends tmpl-plumbing-pro as rank 1");
  assert(plumbingRecs[0].paletteId === "ocean-teal", "Plumbing recommends ocean-teal palette");
  assert(plumbingRecs[0].rationale.length > 20, "Plumbing recommendation provides meaningful rationale");
  assert(plumbingRecs[0].conversionBenefit.includes("arama"), "Plumbing provides conversion benefit statement");

  // B. Towing
  const towingRecs = recommendDesignPackages("Oto Kurtarma ve 7/24 Çekici");
  assert(towingRecs[0].templateId === "tmpl-towing-rescue", "Towing recommends tmpl-towing-rescue as rank 1");

  // C. Dental Clinic
  const dentalRecs = recommendDesignPackages("Diş Kliniği ve İmplant Tedavisi");
  assert(dentalRecs[0].templateId === "tmpl-dental-care", "Dental recommends tmpl-dental-care as rank 1");

  // D. Law firm
  const legalRecs = recommendDesignPackages("Avukatlık Bürosu & Hukuk Ortaklığı");
  assert(legalRecs[0].templateId === "tmpl-legal-authority", "Legal recommends tmpl-legal-authority as rank 1");

  // E. Hotel
  const hotelRecs = recommendDesignPackages("Lüks Butik Otel & Rezervasyon");
  assert(hotelRecs[0].templateId === "tmpl-hotel-resort", "Hotel recommends tmpl-hotel-resort as rank 1");

  // F. Restaurant
  const restaurantRecs = recommendDesignPackages("Gurme Restoran & Kafe");
  assert(restaurantRecs[0].templateId === "tmpl-restaurant-gourmet", "Restaurant recommends tmpl-restaurant-gourmet as rank 1");

  // G. Multi-recommendation ranking
  assert(plumbingRecs.length === 3, "Smart design engine outputs exactly top 3 recommendations");
  assert(plumbingRecs[0].matchScore > plumbingRecs[1].matchScore, "Rank 1 score is higher than Rank 2");

  // H. Unsupported Claims Audit (No percentage, multiplier or fabricated metrics in ANY sector)
  const testSectorInputs = [
    "Sıhhi Tesisat ve Su Kaçağı",
    "Kombi ve Klima Servisi",
    "Oto Kurtarma ve Çekici",
    "Elektrikçi ve Aydınlatma",
    "Diş Kliniği ve İmplant",
    "Avukatlık ve Hukuk Bürosu",
    "Gayrimenkul ve Emlak Danışmanlığı",
    "Güzellik Salonu ve Spa",
    "Butik Otel ve Pansiyon",
    "Restoran ve Kafe",
    "İnşaat ve Mimarlık",
    "Kurumsal Danışmanlık ve Denetim",
    "Genel İşletme",
  ];

  for (const sectorInput of testSectorInputs) {
    const recs = recommendDesignPackages(sectorInput);
    for (const rec of recs) {
      assert(!rec.conversionBenefit.includes("%"), `No unsupported percentage in conversionBenefit for [${sectorInput}]`);
      assert(!rec.conversionBenefit.includes("katına"), `No unsupported multiplier in conversionBenefit for [${sectorInput}]`);
      assert(!rec.rationale.includes("%"), `No unsupported percentage in rationale for [${sectorInput}]`);
      assert(!rec.rationale.includes("katına"), `No unsupported multiplier in rationale for [${sectorInput}]`);
    }
  }
}

// ---------------------------------------------------------------------------
// 6. Token Hierarchy & BrandKit Coexistence (Priority 3 > 2 > 1)
// ---------------------------------------------------------------------------
console.log("\n--- 6. Token Precedence Hierarchy ---");
{
  const manifest = resolveTemplate("tmpl-plumbing-pro")!;
  const brandKit = createBrandKit({
    siteId: "test-site",
    preferredPrimary: "#7C3AED", // Priority 2: BrandKit Royal Purple
    fallbackTemplateTokens: manifest.designTokens,
  });

  // When no explicit user override exists -> BrandKit wins over Manifest
  const tokensPriority2 = resolveDesignTokens(manifest.designTokens, brandKit, null);
  assert(tokensPriority2.palette.primary.toLowerCase() === "#7c3aed", "BrandKit (Priority 2) overrides Manifest default (Priority 1)");

  // When explicit user custom override exists -> User override wins over BrandKit
  const tokensPriority3 = resolveDesignTokens(manifest.designTokens, brandKit, {
    palette: {
      primary: "#DC2626", // Priority 3: Explicit Custom Red
    },
  });
  assert(tokensPriority3.palette.primary.toLowerCase() === "#dc2626", "Explicit User Override (Priority 3) overrides BrandKit (Priority 2)");
}

// ---------------------------------------------------------------------------
// 7. Preview and Static Site Generation Parity
// ---------------------------------------------------------------------------
console.log("\n--- 7. Preview & Static Generation Parity ---");
{
  const baseConfig = createDefaultSiteConfig();
  const testIndustryTemplates = [
    "tmpl-plumbing-pro",
    "tmpl-dental-care",
    "tmpl-legal-authority",
    "tmpl-hotel-resort",
  ];

  for (const tmplId of testIndustryTemplates) {
    const config: SiteConfig = {
      ...baseConfig,
      templateId: tmplId,
    };

    const staticFiles = generateProductionSiteFiles(config);
    const indexHtml = staticFiles.find((f) => f.filename === "index.html" || f.fileName === "index.html")?.html || "";
    const previewHtml = generateProductionPreviewHtml(config);

    assert(indexHtml.length > 500, `Static site generator emits non-empty HTML for [${tmplId}]`);
    assert(previewHtml.length > 500, `Preview generator emits non-empty HTML for [${tmplId}]`);
    assert(indexHtml === previewHtml, `100% byte-for-byte parity for [${tmplId}] between preview and static production output`);
  }
}

// ---------------------------------------------------------------------------
// 8. Authentic Content Preservation Across Theme Switch
// ---------------------------------------------------------------------------
console.log("\n--- 8. Content Preservation Across Theme Switches ---");
{
  const baseConfig = createDefaultSiteConfig();
  const canonical = fromLegacySiteConfig(baseConfig);
  const originalName = canonical.businessProfile.identity.companyName;
  const originalPhone = canonical.businessProfile.contact.phone;
  const originalEmail = canonical.businessProfile.contact.email;
  const originalServiceCount = canonical.businessProfile.services.length;

  const testSwitches = ["tmpl-plumbing-pro", "tmpl-hotel-resort", "tmpl-restaurant-gourmet"];
  for (const targetTmpl of testSwitches) {
    const switchedConfig: SiteConfig = {
      ...baseConfig,
      templateId: targetTmpl,
    };
    const switchedCanonical = fromLegacySiteConfig(switchedConfig);

    assert(switchedCanonical.businessProfile.identity.companyName === originalName, `Preserved company name on switch to [${targetTmpl}]`);
    assert(switchedCanonical.businessProfile.contact.phone === originalPhone, `Preserved phone on switch to [${targetTmpl}]`);
    assert(switchedCanonical.businessProfile.contact.email === originalEmail, `Preserved email on switch to [${targetTmpl}]`);
    assert(switchedCanonical.businessProfile.services.length === originalServiceCount, `Preserved service count on switch to [${targetTmpl}]`);
  }
}

// ---------------------------------------------------------------------------
// 9. Responsive CSS & Mobile Viewport Rules (320px - 1440px)
// ---------------------------------------------------------------------------
console.log("\n--- 9. Responsive CSS & Mobile Viewport Rules ---");
{
  const css = generateStaticCss({});
  assert(css.includes("overflow-x: hidden"), "CSS enforces global overflow-x: hidden");
  assert(css.includes(".jk-gradient-royal-purple"), "CSS includes .jk-gradient-royal-purple rule");
  assert(css.includes(".jk-gradient-ocean-blue"), "CSS includes .jk-gradient-ocean-blue rule");
  assert(css.includes(".jk-typo-corporate-sans"), "CSS includes .jk-typo-corporate-sans rule");
  assert(css.includes(".jk-typo-elegant-serif"), "CSS includes .jk-typo-elegant-serif rule");
  assert(css.includes(".jk-bg-texture-dots"), "CSS includes .jk-bg-texture-dots rule");
  assert(css.includes("@media (min-width: 1024px)"), "CSS includes desktop responsive media queries");
  assert(css.includes("@media (max-width: 360px)"), "CSS includes mobile 320px-360px hardening rules");
}

// ---------------------------------------------------------------------------
// 10. 24/7 & Emergency Claim Safety Audit
// ---------------------------------------------------------------------------
console.log("\n--- 10. 24/7 & Emergency Claim Safety Audit ---");
{
  // A. Manifest check - no unverified 24/7 or emergency claims in defaults
  const towingManifest = resolveTemplate("tmpl-towing-rescue")!;
  assert(!towingManifest.name.includes("Acil"), "towing-rescue template name does not force 'Acil' claim");
  assert(!towingManifest.description.includes("7/24"), "towing-rescue description does not claim unconfigured 7/24");

  const plumbingManifest = resolveTemplate("tmpl-plumbing-pro")!;
  assert(!plumbingManifest.description.includes("Acil"), "plumbing-pro description does not force 'Acil' claim");

  // B. Standard business with regular operating hours (no 7/24)
  const standardConfig: SiteConfig = {
    ...createDefaultSiteConfig(),
    workingHours: "Hafta İçi: 09:00 - 18:00",
    slogan: "Güvenilir Tesisat Hizmetleri",
  };
  const standardCanonical = fromLegacySiteConfig(standardConfig);
  const standardFooter = renderFooterSection({
    site: standardCanonical,
    manifest: towingManifest,
    variant: "local-service",
    config: standardConfig,
  });

  assert(standardFooter.includes("Hızlı İletişim ve Danışma Hattı"), "Standard site renders neutral 'Hızlı İletişim' heading");
  assert(!standardFooter.includes("7/24 Acil Hizmet"), "Standard site does NOT render unconfigured '7/24 Acil' promise");
  assert(!standardFooter.includes("Acil Hizmet ve Danışma Hattı"), "Standard site does NOT render unconfigured 'Acil Hizmet' heading");

  // C. Explicit 24/7 business
  const emergencyConfig: SiteConfig = {
    ...createDefaultSiteConfig(),
    workingHours: "7/24 Kesintisiz Hizmet",
    slogan: "7/24 Acil Yol Yardım",
  };
  const emergencyCanonical = fromLegacySiteConfig(emergencyConfig);
  const emergencyFooter = renderFooterSection({
    site: emergencyCanonical,
    manifest: towingManifest,
    variant: "local-service",
    config: emergencyConfig,
  });

  assert(emergencyFooter.includes("7/24 Acil Hizmet ve Danışma Hattı"), "Explicit 24/7 site renders emergency heading");
  assert(emergencyFooter.includes("İhtiyacınız olan her an bir telefon kadar yakınız."), "Explicit 24/7 site renders round-the-clock subtitle");

  // D. WhyUs section default claims safety (no fabricated %100 or kesintisiz promises)
  const whyUsHtml = renderWhyUsSection({
    site: standardCanonical,
    manifest: towingManifest,
    variant: "metrics-badges",
    config: standardConfig,
  });
  assert(!whyUsHtml.includes("%100 müşteri memnuniyeti"), "Default WhyUs does NOT claim fabricated '%100 müşteri memnuniyeti'");
  assert(!whyUsHtml.includes("kesintisiz destek"), "Default WhyUs does NOT claim unverified 'kesintisiz destek'");
}

console.log(`\n=== SUMMARY: ${passed} passed, ${failed} failed ===\n`);

if (failed > 0) {
  process.exit(1);
}
