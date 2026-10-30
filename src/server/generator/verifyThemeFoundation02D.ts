/**
 * JetKur - Theme Foundation 02D Verification Suite
 * Premium Design Identity, Typography & Visual Composition
 *
 * Verifies all 13 architectural requirements of Theme Foundation 02D:
 * 1. Typography tokens resolve correctly for all 8 canonical templates
 * 2. Font fallback stacks exist & Google Fonts links use display=swap with minimal required families
 * 3. User font overrides win over template defaults
 * 4. Brand Kit overrides win over template defaults
 * 5. Explicit custom token overrides win over Brand Kit (Template < BrandKit < CustomTokens)
 * 6. Section surface tokens & rhythm render distinctly across templates
 * 7. Button style tokens (buttonRadius, buttonEmphasis) apply correctly
 * 8. Card shadow and border treatments apply correctly
 * 9. Hero visual hierarchy tokens (heroGradient, heroTextWidth, h1Size) apply
 * 10. Template switching updates visual identity cleanly while preserving canonical data
 * 11. Preview and static publish outputs remain consistent
 * 12. No hardcoded customer data or fake claims exist
 * 13. All 8 canonical manifests pass strict purity validation (zero Tailwind utility class leaks)
 */

import { CANONICAL_TEMPLATE_MANIFESTS, resolveTemplate } from "../../domain/templates/catalog";
import {
  INDUSTRY_DESIGN_PRESETS,
  getIndustryPresetById,
  buildPresetCustomTokens,
} from "../../domain/templates/manifests/industryTemplates";
import { validateTemplateManifest } from "../../domain/templates/validator";
import {
  resolveDesignTokens,
  createBrandKit,
  listPremiumPalettes,
  auditPaletteWcagContrast,
  toCanonicalPaletteTokens,
  listTypographyPresets,
  toCanonicalTypographyTokens,
  verifyTurkishCharsetSupport,
  GRADIENT_PRESETS,
  validateSafeImageUrl,
  toCanonicalSurfaceTokens,
  recommendDesignPackages,
} from "../../domain/brand";
import { fromLegacySiteConfig, toLegacySiteConfig } from "../../domain/site/legacyAdapter";
import { applyTemplateManifest } from "../../domain/templates/switcher";
import { generateCandidatePreviewHtml } from "../../domain/templates/preview";
import { generateProductionSiteFiles } from "../../utils/productionGeneratorBridge";
import { generateStaticCss } from "../../utils/staticCssGenerator";
import { buildGoogleFontsStylesheetUrl } from "../../utils/generator/seoHeadRenderer";
import { createNeutralSiteConfig, createDefaultSiteConfig } from "../../data/mockData";
import { SiteConfig } from "../../types";

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string): void {
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
// 1. Typography Tokens & Manifest Purity Across All 8 Templates
// ---------------------------------------------------------------------------
console.log("--- 1. Typography Tokens & Manifest Purity (All 8 Templates) ---");
{
  const typographySignatures = new Set<string>();

  for (const manifest of CANONICAL_TEMPLATE_MANIFESTS) {
    const validation = validateTemplateManifest(manifest);
    assert(
      validation.valid && validation.issues.length === 0,
      `Template [${manifest.id}] passes strict manifest purity validator (0 issues)`
    );

    const resolved = resolveDesignTokens(manifest.designTokens);
    const t = resolved.typography;
    const hasCoherentTypography =
      Boolean(t.fontHeading) &&
      Boolean(t.fontBody) &&
      Boolean(t.headingWeight) &&
      Boolean(t.bodyWeight) &&
      Boolean(t.headingLetterSpacing) &&
      Boolean(t.bodyLineHeight) &&
      Boolean(t.headingScale) &&
      typeof t.uppercaseLabels === "boolean";

    assert(
      hasCoherentTypography,
      `Template [${manifest.id}] resolves complete 02D typography tokens (${t.fontHeading} / ${t.fontBody}, scale=${t.headingScale})`
    );

    typographySignatures.add(
      `${t.fontHeading}|${t.fontBody}|${t.headingWeight}|${t.headingLetterSpacing}|${t.bodyLineHeight}|${t.headingScale}`
    );
  }

  assert(
    typographySignatures.size >= 6,
    `Templates exhibit distinct typography identities (${typographySignatures.size} unique typography profiles across 8 templates)`
  );
}

// ---------------------------------------------------------------------------
// 2. Font Fallback Stacks, Minimal Google Fonts Loading & Turkish/RTL Safety
// ---------------------------------------------------------------------------
console.log("\n--- 2. Font Fallback Stacks & Google Fonts display=swap ---");
{
  const luxuryManifest = resolveTemplate("tmpl-vip-luxury")!;
  const legalManifest = resolveTemplate("tmpl-formal-legal")!;
  const techManifest = resolveTemplate("tmpl-tech-dynamic")!;

  const luxuryCss = generateStaticCss({}, resolveDesignTokens(luxuryManifest.designTokens));
  const legalCss = generateStaticCss({}, resolveDesignTokens(legalManifest.designTokens));
  const techCss = generateStaticCss({}, resolveDesignTokens(techManifest.designTokens));

  assert(
    luxuryCss.includes("--jk-font-heading: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;") &&
      legalCss.includes("--jk-font-heading: 'Libre Baskerville', Georgia, 'Times New Roman', serif;"),
    "Editorial serif templates compile heading fonts with serif fallback stack (Georgia, 'Times New Roman', serif)"
  );

  assert(
    techCss.includes("--jk-font-heading: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;"),
    "Modern geometric templates compile heading fonts with system sans-serif fallback stack"
  );

  const luxuryFontsUrl = buildGoogleFontsStylesheetUrl(luxuryManifest.designTokens);
  assert(
    luxuryFontsUrl.includes("family=Cormorant+Garamond:wght@600;700") &&
      luxuryFontsUrl.includes("family=Plus+Jakarta+Sans:wght@400;500;600;700;800") &&
      luxuryFontsUrl.endsWith("&display=swap") &&
      !luxuryFontsUrl.includes("Space+Grotesk") &&
      !luxuryFontsUrl.includes("Libre+Baskerville"),
    "Google Fonts URL includes only active template's heading & body families with display=swap"
  );

  assert(
    techCss.includes("body.rtl-layout {\n  direction: rtl;\n  text-align: right;\n}"),
    "Static CSS preserves RTL layout rules for Arabic/Persian localization"
  );
}

// ---------------------------------------------------------------------------
// 3, 4 & 5. Token Hierarchy: TemplateManifest < BrandKit < Explicit Custom Overrides
// ---------------------------------------------------------------------------
console.log("\n--- 3, 4 & 5. Strict Token Hierarchy (Template < BrandKit < Custom Overrides) ---");
{
  const corporateManifest = resolveTemplate("tmpl-corporate-prestige")!;

  // Layer 2: BrandKit overrides template default font & primary color
  const brandKit = {
    ...createBrandKit({
      siteId: "site-02d-hierarchy",
      preferredPrimary: "#0d9488",
      preferredSecondary: "#f0fdfa",
      preferredAccent: "#f59e0b",
    }),
    typography: {
      fontHeading: "Outfit",
      fontBody: "DM Sans",
    },
  };

  const resolvedWithBrandKit = resolveDesignTokens(corporateManifest.designTokens, brandKit);
  assert(
    resolvedWithBrandKit.palette.primary === "#0d9488" &&
      resolvedWithBrandKit.typography.fontHeading === "Outfit" &&
      resolvedWithBrandKit.typography.fontBody === "DM Sans",
    "BrandKit overrides TemplateManifest primary color and heading/body fonts (Priority 2 > Priority 1)"
  );
  assert(
    resolvedWithBrandKit.palette.heroGradient?.includes(resolvedWithBrandKit.palette.primaryDark) === true,
    "Hero gradient adapts harmoniously when BrandKit overrides primary color"
  );

  // Layer 3: Explicit user customTokens win over BrandKit & TemplateManifest
  const resolvedWithCustom = resolveDesignTokens(corporateManifest.designTokens, brandKit, {
    palette: {
      primary: "#be123c",
      surfaceMuted: "#fff1f2",
    },
    typography: {
      fontHeading: "Playfair Display",
      headingScale: "editorial",
      uppercaseLabels: false,
    },
    geometry: {
      buttonRadius: "full",
      buttonEmphasis: "gradient",
      cardShadow: "luxury",
      heroTextWidth: "narrow",
    },
  });

  assert(
    resolvedWithCustom.palette.primary === "#be123c" &&
      resolvedWithCustom.palette.surfaceMuted === "#fff1f2",
    "Explicit custom palette & surfaceMuted tokens win over BrandKit (Priority 3 > Priority 2)"
  );
  assert(
    resolvedWithCustom.typography.fontHeading === "Playfair Display" &&
      resolvedWithCustom.typography.fontBody === "DM Sans" &&
      resolvedWithCustom.typography.headingScale === "editorial" &&
      resolvedWithCustom.typography.uppercaseLabels === false,
    "Explicit user fontHeading & typography scale win over BrandKit while non-overridden BrandKit fontBody remains active"
  );
  assert(
    resolvedWithCustom.geometry.buttonRadius === "full" &&
      resolvedWithCustom.geometry.buttonEmphasis === "gradient" &&
      resolvedWithCustom.geometry.cardShadow === "luxury" &&
      resolvedWithCustom.geometry.heroTextWidth === "narrow",
    "Explicit user geometry tokens (buttonRadius, buttonEmphasis, cardShadow, heroTextWidth) win at Priority 3"
  );
}

// ---------------------------------------------------------------------------
// 6, 7, 8 & 9. Section Surfaces, Buttons, Cards & Hero Hierarchy Across All 8 Templates
// ---------------------------------------------------------------------------
console.log("\n--- 6, 7, 8 & 9. Section Surfaces, Buttons, Cards & Hero Hierarchy ---");
{
  const neutralBase = createNeutralSiteConfig();
  const baseConfig: SiteConfig = {
    ...neutralBase,
    companyName: "Anadolu Mühendislik & Danışmanlık A.Ş.",
    slogan: "Kurumsal Çözümler ve Profesyonel Hizmetler",
    phone: "0212 555 44 33",
    whatsapp: "905325554433",
    email: "iletisim@anadolumuhendislik.com.tr",
    address: "Levent Mah. Büyükdere Cad. No: 120, İstanbul",
    services: {
      ...neutralBase.services,
      enabled: true,
      items: [
        {
          id: "srv-1",
          title: "Stratejik Danışmanlık",
          desc: "Kurumsal büyüme ve operasyonel mükemmellik süreçleri.",
          icon: "Briefcase",
          price: "",
          features: [],
        },
        {
          id: "srv-2",
          title: "Mühendislik & Uygulama",
          desc: "Uluslararası standartlarda anahtar teslim proje yönetimi.",
          icon: "Shield",
          price: "",
          features: [],
        },
        {
          id: "srv-3",
          title: "Sürekli Destek & Denetim",
          desc: "Periyodik kalite kontrol ve teknik bakım hizmetleri.",
          icon: "CheckCircle",
          price: "",
          features: [],
        },
      ],
    },
    whyUs: {
      ...neutralBase.whyUs,
      enabled: true,
      items: [
        { id: "w1", title: "Uzman Kadro", desc: "Alanında deneyimli mühendis ve danışman ekibi.", icon: "Award" },
        { id: "w2", title: "Şeffaf Süreç", desc: "Her aşamada ölçülebilir ve raporlanabilir proje takibi.", icon: "Shield" },
        { id: "w3", title: "Kalite Güvencesi", desc: "Uluslararası standartlara uygun hizmet disiplini.", icon: "Check" },
      ],
    },
    testimonials: {
      ...neutralBase.testimonials,
      enabled: true,
      items: [
        {
          id: "t1",
          name: "Kemal Arslan",
          role: "Operasyon Direktörü",
          comment: "Proje sürecimiz boyunca yüksek profesyonellik ve zamanında teslimat sağladılar.",
          rating: 5,
          date: "2026",
        },
        {
          id: "t2",
          name: "Zeynep Kaya",
          role: "Genel Müdür",
          comment: "Kurumsal yaklaşımı ve teknik uzmanlığı ile güven veren bir iş ortağı.",
          rating: 5,
          date: "2026",
        },
      ],
    },
    faqs: {
      ...neutralBase.faqs,
      enabled: true,
      items: [
        {
          id: "f1",
          q: "Keşif ve ön değerlendirme süreci nasıl işliyor?",
          a: "Uzman ekibimiz ihtiyacınızı analiz ederek size özel kapsam ve teklif planını sunar.",
          question: "Keşif ve ön değerlendirme süreci nasıl işliyor?",
          answer: "Uzman ekibimiz ihtiyacınızı analiz ederek size özel kapsam ve teklif planını sunar.",
        },
        {
          id: "f2",
          q: "Hizmet sonrası teknik destek sunuyor musunuz?",
          a: "Evet, tamamlanan tüm projelerimizde periyodik bakım ve danışmanlık desteği sağlıyoruz.",
          question: "Hizmet sonrası teknik destek sunuyor musunuz?",
          answer: "Evet, tamamlanan tüm projelerimizde periyodik bakım ve danışmanlık desteği sağlıyoruz.",
        },
      ],
    },
  };
  const templateVisualSignatures = new Set<string>();

  for (const manifest of CANONICAL_TEMPLATE_MANIFESTS) {
    const siteConfig: SiteConfig = {
      ...baseConfig,
      templateId: manifest.id,
      theme: manifest.slug as any,
      designTemplate: {
        templateId: manifest.id,
        templateSlug: manifest.slug,
        templateVersion: manifest.version,
        sectionVariants: { ...manifest.sectionRecipe },
      },
      palette: createNeutralSiteConfig().palette,
      colorTheme: undefined,
      fontFamily: "Inter",
    } as any;

    const files = generateProductionSiteFiles(siteConfig);
    const homeHtml = files.find((f) => f.filename === "index.html")?.content || "";
    const siteCss = files.find((f) => f.filename === "assets/site.css")?.content || "";

    // Check section surface rhythm
    const surfaceMatches = Array.from(homeHtml.matchAll(/data-section-surface="([^"]+)"/g)).map((m) => m[1]);
    const uniqueSurfacesInPage = new Set(surfaceMatches);
    assert(
      surfaceMatches.length >= 4 && uniqueSurfacesInPage.size >= 2,
      `Template [${manifest.id}] renders multi-surface section rhythm (${surfaceMatches.join(" -> ")})`
    );

    // Check button emphasis & radius tokens
    const expectedEmphasis = manifest.designTokens.geometry.buttonEmphasis || "solid";
    assert(
      homeHtml.includes(`data-button-emphasis="${expectedEmphasis}"`) &&
        homeHtml.includes(`jk-button--${expectedEmphasis}`) &&
        siteCss.includes("--jk-button-radius:"),
      `Template [${manifest.id}] applies button emphasis (${expectedEmphasis}) and --jk-button-radius`
    );

    // Check card shadow & border tokens
    assert(
      siteCss.includes("--jk-card-shadow:") &&
        siteCss.includes("--jk-color-surface-muted:") &&
        siteCss.includes("--jk-color-surface-dark:"),
      `Template [${manifest.id}] compiles card shadow and surface tokens in CSS`
    );

    // Check hero visual hierarchy tokens
    const expectedHeroWidth = manifest.designTokens.geometry.heroTextWidth || "balanced";
    assert(
      homeHtml.includes(`data-hero-width="${expectedHeroWidth}"`) &&
        siteCss.includes("--jk-gradient-hero:") &&
        siteCss.includes("--jk-h1-size: clamp(") &&
        siteCss.includes("--jk-hero-text-width:"),
      `Template [${manifest.id}] applies hero hierarchy (heroWidth=${expectedHeroWidth}, fluid clamp h1, hero gradient)`
    );

    templateVisualSignatures.add(
      `${manifest.designTokens.typography.fontHeading}|${expectedEmphasis}|${expectedHeroWidth}|${surfaceMatches.join(",")}`
    );
  }

  assert(
    templateVisualSignatures.size === 8,
    "All 8 canonical templates produce 8 distinct full-page visual composition signatures"
  );
}

// ---------------------------------------------------------------------------
// 10 & 11. Template Switching & Preview / Static Publish Parity
// ---------------------------------------------------------------------------
console.log("\n--- 10 & 11. Template Switching & Preview / Publish Parity ---");
{
  const initialConfig: SiteConfig = {
    ...createDefaultSiteConfig(),
    companyName: "Boğaziçi Mimarlık & Mühendislik",
    phone: "0212 555 44 33",
    email: "iletisim@bogazicimimarlik.com.tr",
    templateId: "tmpl-corporate-prestige",
    palette: createNeutralSiteConfig().palette,
    colorTheme: undefined,
    fontFamily: "Inter",
  } as any;

  const initialCanonical = fromLegacySiteConfig(initialConfig);
  const vipManifest = resolveTemplate("tmpl-vip-luxury")!;
  const switchedSite = applyTemplateManifest(initialCanonical, vipManifest);

  assert(
    switchedSite.designTemplate.templateId === "tmpl-vip-luxury",
    "applyTemplateManifest transitions site from Corporate Prestige to VIP Luxury"
  );

  // Preview vs Production Static Publish parity
  const preview = generateCandidatePreviewHtml(initialCanonical, "tmpl-vip-luxury");
  const switchedLegacy = toLegacySiteConfig(switchedSite);
  const prodFiles = generateProductionSiteFiles(switchedLegacy);
  const prodHome = prodFiles.find((f) => f.filename === "index.html")?.content || "";
  const prodCss = prodFiles.find((f) => f.filename === "assets/site.css")?.content || "";

  assert(
    preview.html.includes("'Cormorant Garamond'") &&
      prodCss.includes("'Cormorant Garamond'") &&
      prodHome.includes("family=Cormorant+Garamond"),
    "Preview and static publish both emit VIP Luxury Cormorant Garamond typography"
  );

  assert(
    preview.html.includes('data-button-emphasis="outline-refined"') &&
      prodHome.includes('data-button-emphasis="outline-refined"') &&
      preview.html.includes('data-section-surface="editorial"') &&
      prodHome.includes('data-section-surface="editorial"'),
    "Preview and static publish emit identical button emphasis and editorial section surface attributes"
  );

  assert(
    prodHome.includes("Boğaziçi Mimarlık &amp; Mühendislik") &&
      prodHome.includes("0212 555 44 33") &&
      switchedSite.businessProfile.services.length === initialCanonical.businessProfile.services.length,
    "Template switch preserves 100% of canonical customer identity, contact data, and services"
  );
}

// ---------------------------------------------------------------------------
// 12. Zero Hardcoded Customer Data or Invented Claims
// ---------------------------------------------------------------------------
console.log("\n--- 12. Zero Hardcoded Customer Data or Invented Claims ---");
{
  const forbiddenClaims = [
    /30\s*dakikada/i,
    /15\s*dakikada/i,
    /en\s*ucuz\s*garanti/i,
    /10\.000\+\s*mutlu/i,
  ];

  let anyForbiddenClaimFound = false;
  for (const manifest of CANONICAL_TEMPLATE_MANIFESTS) {
    const cfg: SiteConfig = {
      ...createNeutralSiteConfig(),
      companyName: "Örnek Kurum A.Ş.",
      phone: "0216 444 0 123",
      templateId: manifest.id,
    };
    const files = generateProductionSiteFiles(cfg);
    const home = files.find((f) => f.filename === "index.html")?.content || "";
    const css = files.find((f) => f.filename === "assets/site.css")?.content || "";

    if (css.includes("Örnek Kurum") || css.includes("0216")) {
      anyForbiddenClaimFound = true;
    }
    for (const pattern of forbiddenClaims) {
      if (pattern.test(home)) {
        anyForbiddenClaimFound = true;
      }
    }
  }

  assert(
    !anyForbiddenClaimFound,
    "Zero customer data in generated CSS and zero invented availability/response claims across all 8 templates"
  );
}

// ---------------------------------------------------------------------------
// 13. Sprint 02D.R — Canonical Theme Engine & Smart Presets Reconciliation
// ---------------------------------------------------------------------------
console.log("\n--- 13. Sprint 02D.R — Canonical Theme Engine & Smart Presets Reconciliation ---");
{
  const canonicalIds = new Set(CANONICAL_TEMPLATE_MANIFESTS.map((m) => m.id));

  // 13.1 Canonical 8 templates remain valid and uninflated
  assert(
    CANONICAL_TEMPLATE_MANIFESTS.length === 8 &&
      INDUSTRY_DESIGN_PRESETS.length === 12 &&
      INDUSTRY_DESIGN_PRESETS.every((p) => canonicalIds.has(p.canonicalTemplateId)),
    "13.1 Canonical catalog strictly retains 8 TemplateManifests while 12 IndustryDesignPresets map to canonical templateIds"
  );

  // 13.2 Palette presets map into canonical palette tokens & pass WCAG 2.1 AA
  const palettes = listPremiumPalettes();
  const sampleCanonicalPalette = toCanonicalPaletteTokens(palettes[0]);
  assert(
    palettes.length === 16 &&
      palettes.every((p) => auditPaletteWcagContrast(p).passesWcag) &&
      Boolean(sampleCanonicalPalette.primary && sampleCanonicalPalette.surfaceAccent),
    "13.2 All 16 palette presets pass WCAG 2.1 AA contrast and map cleanly into canonical TemplateColorTokens"
  );

  // 13.3 Typography presets map into canonical typography tokens with Turkish charset support
  const typoPresets = listTypographyPresets();
  const sampleCanonicalTypo = toCanonicalTypographyTokens(typoPresets[2]);
  assert(
    typoPresets.length === 4 &&
      typoPresets.every((t) => t.googleFontsUrl.includes("latin-ext")) &&
      verifyTurkishCharsetSupport("Çağdaş İşletme Çözümleri ğüşıöç İĞÜŞÖÇ") &&
      sampleCanonicalTypo.fontHeading === "Playfair Display" &&
      sampleCanonicalTypo.headingScale === "display",
    "13.3 All 4 typography presets support Turkish latin-ext and map cleanly into canonical TemplateTypographyTokens"
  );

  // 13.4 Background presets sanitize unsafe URLs and map to canonical surface tokens
  const surfaceTokens = toCanonicalSurfaceTokens({
    type: "linear-gradient",
    presetId: "royal-purple",
    contrastMode: "dark",
  });
  assert(
    GRADIENT_PRESETS.length === 6 &&
      validateSafeImageUrl("javascript:alert(1)") === null &&
      validateSafeImageUrl("data:text/html,<script>alert(1)</script>") === null &&
      validateSafeImageUrl("https://images.unsplash.com/photo-1585704032915-c3400ca199e7") !== null &&
      surfaceTokens.heroSurface === "gradient-brand",
    "13.4 Background presets reject unsafe URLs (javascript:, data:text/html) and map cleanly to canonical surface tokens"
  );

  // 13.5 Token precedence remains: customTokens > BrandKit > template defaults with presets
  const plumbingPreset = getIndustryPresetById("preset-plumbing-pro")!;
  const rapidManifest = resolveTemplate(plumbingPreset.canonicalTemplateId)!;
  const brandKit = createBrandKit({
    siteId: "reconcile-site",
    preferredPrimary: "#7C3AED",
    fallbackTemplateTokens: rapidManifest.designTokens,
  });
  const tokensWithBrandKit = resolveDesignTokens(rapidManifest.designTokens, brandKit, undefined);
  const presetTokensOverride = buildPresetCustomTokens(plumbingPreset);
  const tokensWithPresetOverride = resolveDesignTokens(
    rapidManifest.designTokens,
    brandKit,
    presetTokensOverride
  );
  assert(
    tokensWithBrandKit.palette.primary.toLowerCase() === "#7c3aed" &&
      tokensWithPresetOverride.palette.primary.toLowerCase() === "#0369a1",
    "13.5 Token hierarchy strictly enforces customTokens (Priority 3) > BrandKit (Priority 2) > template defaults (Priority 1)"
  );

  // 13.6 Smart recommendations map exclusively to canonical template IDs
  const sectorInputs = [
    "Sıhhi Tesisat ve Su Kaçağı",
    "Diş Kliniği ve İmplant",
    "Hukuk Bürosu ve Avukat",
    "Butik Otel ve Konaklama",
    "Gurme Restoran ve Kafe",
  ];
  const allRecsCanonical = sectorInputs.every((input) => {
    const recs = recommendDesignPackages(input);
    return recs.length === 3 && recs.every((r) => canonicalIds.has(r.templateId));
  });
  assert(
    allRecsCanonical,
    "13.6 Smart Design Engine deterministically recommends canonical template IDs across all sectors"
  );

  // 13.7 Applying a preset preserves 100% of customer content
  const baseDefaultCfg = createDefaultSiteConfig();
  const customerCfg: SiteConfig = {
    ...baseDefaultCfg,
    companyName: "Anadolu Tesisat Mühendislik",
    phone: "0216 333 22 11",
    email: "iletisim@anadolutesisat.com",
    services: {
      ...baseDefaultCfg.services,
      items: [
        {
          ...baseDefaultCfg.services.items[0],
          id: "s1",
          title: "Cihazla Su Kaçağı Tespiti",
          desc: "Kırmadan termal kameralı tespit",
        },
        {
          ...baseDefaultCfg.services.items[0],
          id: "s2",
          title: "Tıkanıklık Açma",
          desc: "Robot cihazla gider açma",
        },
      ],
    },
    templateId: plumbingPreset.canonicalTemplateId,
    designTemplate: {
      templateId: plumbingPreset.canonicalTemplateId,
      templateSlug: "rapid-service",
      templateVersion: "1.0.0",
      customTokens: presetTokensOverride,
      sectionVariants: {
        ...rapidManifest.sectionRecipe,
        ...plumbingPreset.sectionVariants,
      },
    },
  } as any;
  const canonicalPresetSite = fromLegacySiteConfig(customerCfg);
  assert(
    canonicalPresetSite.businessProfile.identity.companyName === "Anadolu Tesisat Mühendislik" &&
      canonicalPresetSite.businessProfile.contact.phone === "0216 333 22 11" &&
      canonicalPresetSite.businessProfile.contact.email === "iletisim@anadolutesisat.com" &&
      canonicalPresetSite.businessProfile.services.length === 2,
    "13.7 Applying an Industry Design Preset preserves 100% of customer identity, contact details, and services"
  );

  // 13.8 Preview and static output match for preset/recommended configurations
  const presetPreview = generateCandidatePreviewHtml(
    canonicalPresetSite,
    plumbingPreset.canonicalTemplateId
  );
  const presetProdFiles = generateProductionSiteFiles(customerCfg);
  const presetProdHome = presetProdFiles.find((f) => f.filename === "index.html")?.content || "";
  assert(
    presetPreview.html.length > 1000 &&
      presetProdHome.includes("Anadolu Tesisat Mühendislik") &&
      presetPreview.html.includes("Anadolu Tesisat Mühendislik") &&
      presetProdHome.includes('data-header-variant="local-service"') &&
      presetPreview.html.includes('data-header-variant="local-service"'),
    "13.8 Preview and static production output remain consistent when rendering an Industry Design Preset"
  );

  // 13.9 Header, footer, service card, and mobile menu render properly with preset applied
  assert(
    presetProdHome.includes("jk-header--local-service") &&
      presetProdHome.includes("jk-footer--local-service") &&
      presetProdHome.includes('data-card-variant="compact-local"') &&
      presetProdHome.includes('id="mobileMenuToggleBtn"') &&
      presetProdHome.includes('id="mobileDrawer"'),
    "13.9 Canonical Header, Footer, Service Card, and Mobile Navigation render properly with preset applied"
  );

  // 13.10 No fabricated 24/7 or emergency claims appear in presets or recommendations
  const presetsClaimSafe = INDUSTRY_DESIGN_PRESETS.every(
    (p) =>
      !p.name.includes("7/24") &&
      !p.description.includes("7/24") &&
      !p.name.includes("Acil") &&
      !p.description.includes("Acil") &&
      !p.description.includes("%100")
  );
  const recsClaimSafe = sectorInputs.every((input) =>
    recommendDesignPackages(input).every(
      (r) =>
        !r.rationale.includes("%") &&
        !r.rationale.includes("katına") &&
        !r.conversionBenefit.includes("%") &&
        !r.conversionBenefit.includes("katına")
    )
  );
  assert(
    presetsClaimSafe && recsClaimSafe,
    "13.10 Zero fabricated 24/7, emergency, or marketing percentage claims in Industry Design Presets and Smart Recommendations"
  );
}

console.log(`\n=== SUMMARY: ${passed} passed, ${failed} failed ===`);
if (failed > 0) {
  process.exit(1);
}
