/**
 * JetKur Theme Foundation 02B Verification Suite:
 * Template Layout Architecture & Section Variants
 *
 * Verifies:
 * 1. Three representative template configurations (Corporate, Local Services, Modern Visual)
 * 2. Hero canonical layout variants: centered, split-image, full-width / full-width-background
 * 3. Services canonical layout variants: card-grid, icon-list
 * 4. About canonical layout variants: image-left, image-right (DOM column order & classes)
 * 5. Content preservation after template switching (services, products, pages, images, SEO)
 * 6. BrandKit & explicit custom token precedence preservation (02A non-regression)
 * 7. Deterministic fallback when a variant is unsupported
 * 8. LANDING and MULTI_PAGE compatibility
 * 9. Preview / static generator parity (generateCandidatePreviewHtml vs generateProductionSiteFiles)
 * 10. Static CSS & zero runtime framework invariants
 */

import { createDefaultSiteConfig } from "../../data/mockData";
import { SiteConfig } from "../../types";
import {
  fromLegacySiteConfig,
  toLegacySiteConfig,
  resolveCanonicalManifestForLegacy,
} from "../../domain/site/legacyAdapter";
import { createBrandKit, resolveDesignTokens } from "../../domain/brand";
import { resolveTemplate } from "../../domain/templates/catalog";
import { corporatePrestigeManifest } from "../../domain/templates/manifests/corporatePrestige";
import { rapidServiceManifest } from "../../domain/templates/manifests/rapidService";
import { modernMinimalManifest } from "../../domain/templates/manifests/modernMinimal";
import { switchTemplate } from "../../domain/templates/switcher";
import {
  generateCandidatePreviewHtml,
  clearCandidatePreviewCache,
} from "../../domain/templates/preview";
import {
  generateProductionSiteFiles,
  generateProductionPreviewHtml,
} from "../../utils/productionGeneratorBridge";
import {
  generateStaticSite,
  renderCanonicalSection,
  resolveSectionVariant,
  resolveHeroLayoutVariant,
  resolveServicesLayoutVariant,
  resolveAboutLayoutVariant,
} from "../../utils/generator";
import { validateSectionVariant } from "../../domain/sections/validator";

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string, detail?: string): void {
  if (condition) {
    passed++;
    console.log(`  ✓ [PASS] ${label}`);
  } else {
    failed++;
    console.error(`  ✗ [FAIL] ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

function createRepresentativeCustomerSiteConfig(): SiteConfig {
  const base = createDefaultSiteConfig();
  return {
    ...base,
    id: "site-02b-test",
    companyName: "Anadolu Mühendislik & Servis A.Ş.",
    slogan: "Güvenilir Kurumsal ve Teknik Çözümler",
    phone: "+90 216 444 02 02",
    whatsapp: "+90 532 444 02 02",
    email: "iletisim@anadolumuhendislik.com.tr",
    address: "Kozyatağı Mah. Değirmen Sok. No:18 Kadıköy",
    city: "İstanbul",
    sector: "muhendislik-servis",
    templateId: "tmpl-corporate-prestige",
    theme: "corporate-prestige" as any,
    siteType: "single-page",
    hero: {
      ...base.hero,
      badge: "ISO 9001 Belgeli Hizmet",
      title: "Anadolu Mühendislik ile Kesintisiz Güvence",
      subtitle: "20 yıllık uzman kadromuzla uçtan uca kurumsal bakım ve teknik servis.",
      ctaPrimaryText: "Ücretsiz Keşif Talep Et",
      ctaPrimaryLink: "#contact",
      bgImage: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=1600&q=80",
    },
    services: {
      ...base.services,
      items: [
        {
          ...base.services.items[0],
          id: "srv-1",
          title: "Endüstriyel Bakım",
          desc: "Periyodik fabrika ve tesis bakım hizmetleri.",
          price: "4.500 TL",
          icon: "Wrench",
        },
        {
          ...base.services.items[0],
          id: "srv-2",
          title: "Acil Arıza Müdahale",
          desc: "7/24 yerinde arıza tespiti ve onarım.",
          price: "2.000 TL",
          icon: "ShieldCheck",
        },
        {
          ...base.services.items[0],
          id: "srv-3",
          title: "Mühendislik Danışmanlığı",
          desc: "Projelendirme ve enerji verimliliği denetimi.",
          price: "Teklif Alınız",
          icon: "Award",
        },
      ],
    },
    about: {
      ...base.about,
      title: "20 Yıllık Mühendislik Tecrübesi",
      content: "Anadolu Mühendislik olarak Türkiye genelinde 3.500'den fazla projeyi başarıyla tamamladık.",
      yearsExperience: "20+",
      completedProjects: "3.500+",
      image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
    },
    seo: {
      ...createDefaultSiteConfig().seo,
      metaTitle: "Anadolu Mühendislik | Resmi Web Sitesi",
      metaDescription: "Kurumsal mühendislik ve teknik servis çözümleri.",
      keywords: "mühendislik, teknik servis, bakım",
      canonicalUrl: "https://anadolumuhendislik.com.tr",
    },
  } as SiteConfig;
}

export function runThemeFoundation02BVerification(): void {
  console.log("=== JETKUR THEME FOUNDATION 02B VERIFICATION SUITE ===\n");

  // =========================================================================
  // 1. Three Representative Template Configurations Produce Distinct Layouts
  // =========================================================================
  console.log("1. Three Representative Templates (Corporate, Local Services, Modern Visual):");

  const baseConfig = createRepresentativeCustomerSiteConfig();

  // Template 1: Corporate / Professional (tmpl-corporate-prestige)
  const corpConfig: SiteConfig = {
    ...JSON.parse(JSON.stringify(baseConfig)),
    templateId: "tmpl-corporate-prestige",
    theme: "corporate-prestige" as any,
  };
  const corpHtml = generateProductionPreviewHtml(corpConfig, "index.html");

  // Template 2: Local Services (tmpl-rapid-service)
  const rapidConfig: SiteConfig = {
    ...JSON.parse(JSON.stringify(baseConfig)),
    templateId: "tmpl-rapid-service",
    theme: "rapid-service" as any,
  };
  const rapidHtml = generateProductionPreviewHtml(rapidConfig, "index.html");

  // Template 3: Modern Visual (tmpl-modern-minimal)
  const modernConfig: SiteConfig = {
    ...JSON.parse(JSON.stringify(baseConfig)),
    templateId: "tmpl-modern-minimal",
    theme: "modern-minimal" as any,
  };
  const modernHtml = generateProductionPreviewHtml(modernConfig, "index.html");

  assert(
    corpHtml.includes('data-section="hero"') &&
      corpHtml.includes('data-layout-variant="centered"') &&
      corpHtml.includes("jk-hero--centered"),
    "CORPORATE_HERO_LAYOUT: tmpl-corporate-prestige renders centered Hero layout"
  );
  assert(
    corpHtml.includes('data-section="services"') &&
      corpHtml.includes('data-layout-variant="card-grid"') &&
      corpHtml.includes("jk-services--card-grid"),
    "CORPORATE_SERVICES_LAYOUT: tmpl-corporate-prestige renders card-grid Services layout"
  );
  assert(
    corpHtml.includes('data-section="about"') &&
      corpHtml.includes('data-layout-variant="image-right"') &&
      corpHtml.includes("jk-about--image-right"),
    "CORPORATE_ABOUT_LAYOUT: tmpl-corporate-prestige renders image-right About layout"
  );

  assert(
    rapidHtml.includes('data-section="hero"') &&
      rapidHtml.includes('data-layout-variant="full-width"') &&
      rapidHtml.includes("jk-hero--full-width"),
    "LOCAL_SERVICES_HERO_LAYOUT: tmpl-rapid-service renders full-width Hero layout"
  );
  assert(
    rapidHtml.includes('data-section="services"') &&
      rapidHtml.includes('data-layout-variant="card-grid"') &&
      rapidHtml.includes("jk-services-grid--4col"),
    "LOCAL_SERVICES_SERVICES_LAYOUT: tmpl-rapid-service renders 4-col card-grid Services layout"
  );

  assert(
    modernHtml.includes('data-section="hero"') &&
      modernHtml.includes('data-layout-variant="split-image"') &&
      modernHtml.includes("jk-hero--split-image"),
    "MODERN_VISUAL_HERO_LAYOUT: tmpl-modern-minimal renders split-image Hero layout"
  );
  assert(
    modernHtml.includes('data-section="services"') &&
      modernHtml.includes('data-layout-variant="icon-list"') &&
      modernHtml.includes("jk-services--icon-list"),
    "MODERN_VISUAL_SERVICES_LAYOUT: tmpl-modern-minimal renders icon-list Services layout"
  );
  assert(
    modernHtml.includes('data-section="about"') &&
      modernHtml.includes('data-layout-variant="image-left"') &&
      modernHtml.includes("jk-about--image-left"),
    "MODERN_VISUAL_ABOUT_LAYOUT: tmpl-modern-minimal renders image-left About layout"
  );

  assert(
    corpHtml !== rapidHtml && rapidHtml !== modernHtml && corpHtml !== modernHtml,
    "THREE_TEMPLATES_DISTINCT_HTML: All 3 representative templates produce distinct HTML output"
  );

  // =========================================================================
  // 2. Hero Variants (centered, split-image, full-width / full-width-background)
  // =========================================================================
  console.log("\n2. Canonical Hero Variants (centered, split-image, full-width):");

  const canonicalSite = fromLegacySiteConfig(baseConfig);

  assert(
    validateSectionVariant("hero", "centered").valid &&
      validateSectionVariant("hero", "split-image").valid &&
      validateSectionVariant("hero", "full-width").valid &&
      validateSectionVariant("hero", "full-width-background").valid,
    "HERO_CANONICAL_VARIANTS_REGISTERED: centered, split-image, full-width, full-width-background are valid in Section Registry"
  );

  assert(
    resolveHeroLayoutVariant("centered") === "centered" &&
      resolveHeroLayoutVariant("centered-prestige") === "centered" &&
      resolveHeroLayoutVariant("split-image") === "split-image" &&
      resolveHeroLayoutVariant("split-content-image") === "split-image" &&
      resolveHeroLayoutVariant("full-width") === "full-width" &&
      resolveHeroLayoutVariant("full-width-background") === "full-width" &&
      resolveHeroLayoutVariant("urgent-callout") === "full-width",
    "HERO_LAYOUT_MAPPING_DETERMINISTIC: All Hero variant IDs map deterministically to canonical layouts"
  );

  const heroCenteredSite = JSON.parse(JSON.stringify(canonicalSite));
  heroCenteredSite.sectionConfiguration.sections = [
    { id: "sec-hero", type: "hero", enabled: true, order: 1, variant: "centered" },
  ];
  const heroCenteredHtml = renderCanonicalSection("hero", {
    site: heroCenteredSite,
    manifest: corporatePrestigeManifest,
  });

  const heroSplitSite = JSON.parse(JSON.stringify(canonicalSite));
  heroSplitSite.sectionConfiguration.sections = [
    { id: "sec-hero", type: "hero", enabled: true, order: 1, variant: "split-image" },
  ];
  const heroSplitHtml = renderCanonicalSection("hero", {
    site: heroSplitSite,
    manifest: corporatePrestigeManifest,
  });

  const heroFullWidthSite = JSON.parse(JSON.stringify(canonicalSite));
  heroFullWidthSite.sectionConfiguration.sections = [
    { id: "sec-hero", type: "hero", enabled: true, order: 1, variant: "full-width-background" },
  ];
  const heroFullWidthHtml = renderCanonicalSection("hero", {
    site: heroFullWidthSite,
    manifest: corporatePrestigeManifest,
  });

  assert(
    heroCenteredHtml.includes("jk-hero--centered") &&
      heroCenteredHtml.includes("jk-hero-layout-centered") &&
      heroCenteredHtml.includes("Anadolu Mühendislik ile Kesintisiz Güvence"),
    "HERO_VARIANT_CENTERED_RENDERS: centered variant renders centered layout with canonical content"
  );
  assert(
    heroSplitHtml.includes("jk-hero--split-image") &&
      heroSplitHtml.includes("jk-hero-split-grid") &&
      heroSplitHtml.includes("jk-hero-split-content") &&
      heroSplitHtml.includes("jk-hero-split-media") &&
      heroSplitHtml.includes("Anadolu Mühendislik ile Kesintisiz Güvence"),
    "HERO_VARIANT_SPLIT_IMAGE_RENDERS: split-image variant renders two-column split layout with canonical content"
  );
  assert(
    heroFullWidthHtml.includes("jk-hero--full-width") &&
      heroFullWidthHtml.includes("background-image: linear-gradient") &&
      heroFullWidthHtml.includes("Anadolu Mühendislik ile Kesintisiz Güvence"),
    "HERO_VARIANT_FULL_WIDTH_RENDERS: full-width-background variant renders full-bleed background with canonical content"
  );

  // =========================================================================
  // 3. Services Variants (card-grid, icon-list)
  // =========================================================================
  console.log("\n3. Canonical Services Variants (card-grid, icon-list):");

  assert(
    validateSectionVariant("services", "card-grid").valid &&
      validateSectionVariant("services", "icon-list").valid,
    "SERVICES_CANONICAL_VARIANTS_REGISTERED: card-grid and icon-list are valid in Section Registry"
  );

  assert(
    resolveServicesLayoutVariant("card-grid") === "card-grid" &&
      resolveServicesLayoutVariant("grid-4") === "card-grid" &&
      resolveServicesLayoutVariant("cards-3") === "card-grid" &&
      resolveServicesLayoutVariant("icon-list") === "icon-list" &&
      resolveServicesLayoutVariant("list") === "icon-list" &&
      resolveServicesLayoutVariant("compact") === "icon-list",
    "SERVICES_LAYOUT_MAPPING_DETERMINISTIC: All Services variant IDs map deterministically"
  );

  const srvGridSite = JSON.parse(JSON.stringify(canonicalSite));
  srvGridSite.sectionConfiguration.sections = [
    { id: "sec-services", type: "services", enabled: true, order: 2, variant: "card-grid" },
  ];
  const srvGridHtml = renderCanonicalSection("services", {
    site: srvGridSite,
    manifest: corporatePrestigeManifest,
  });

  const srvListSite = JSON.parse(JSON.stringify(canonicalSite));
  srvListSite.sectionConfiguration.sections = [
    { id: "sec-services", type: "services", enabled: true, order: 2, variant: "icon-list" },
  ];
  const srvListHtml = renderCanonicalSection("services", {
    site: srvListSite,
    manifest: corporatePrestigeManifest,
  });

  assert(
    srvGridHtml.includes("jk-services--card-grid") &&
      srvGridHtml.includes("jk-services-grid") &&
      srvGridHtml.includes("jk-service-card") &&
      srvGridHtml.includes("Endüstriyel Bakım") &&
      srvGridHtml.includes("Acil Arıza Müdahale"),
    "SERVICES_VARIANT_CARD_GRID_RENDERS: card-grid renders card grid structure with customer services"
  );
  assert(
    srvListHtml.includes("jk-services--icon-list") &&
      srvListHtml.includes("jk-services-list") &&
      srvListHtml.includes("jk-service-list-item") &&
      srvListHtml.includes("jk-service-list-icon") &&
      srvListHtml.includes("Endüstriyel Bakım") &&
      srvListHtml.includes("Acil Arıza Müdahale"),
    "SERVICES_VARIANT_ICON_LIST_RENDERS: icon-list renders horizontal list rows with customer services"
  );

  // =========================================================================
  // 4. About Variants (image-left, image-right)
  // =========================================================================
  console.log("\n4. Canonical About Variants (image-left, image-right):");

  assert(
    validateSectionVariant("about", "image-left").valid &&
      validateSectionVariant("about", "image-right").valid,
    "ABOUT_CANONICAL_VARIANTS_REGISTERED: image-left and image-right are valid in Section Registry"
  );

  assert(
    resolveAboutLayoutVariant("image-left") === "image-left" &&
      resolveAboutLayoutVariant("minimal-stats") === "image-left" &&
      resolveAboutLayoutVariant("image-right") === "image-right" &&
      resolveAboutLayoutVariant("side-by-side") === "image-right" &&
      resolveAboutLayoutVariant("story-timeline") === "image-right",
    "ABOUT_LAYOUT_MAPPING_DETERMINISTIC: All About variant IDs map deterministically"
  );

  const aboutLeftSite = JSON.parse(JSON.stringify(canonicalSite));
  aboutLeftSite.sectionConfiguration.sections = [
    { id: "sec-about", type: "about", enabled: true, order: 3, variant: "image-left" },
  ];
  const aboutLeftHtml = renderCanonicalSection("about", {
    site: aboutLeftSite,
    manifest: corporatePrestigeManifest,
  });

  const aboutRightSite = JSON.parse(JSON.stringify(canonicalSite));
  aboutRightSite.sectionConfiguration.sections = [
    { id: "sec-about", type: "about", enabled: true, order: 3, variant: "image-right" },
  ];
  const aboutRightHtml = renderCanonicalSection("about", {
    site: aboutRightSite,
    manifest: corporatePrestigeManifest,
  });

  const leftMediaIdx = aboutLeftHtml.indexOf("jk-about-media-col");
  const leftContentIdx = aboutLeftHtml.indexOf("jk-about-content-col");
  assert(
    aboutLeftHtml.includes("jk-about--image-left") &&
      leftMediaIdx > -1 &&
      leftContentIdx > -1 &&
      leftMediaIdx < leftContentIdx,
    "ABOUT_VARIANT_IMAGE_LEFT_ORDER: image-left places media column before content column in DOM"
  );

  const rightContentIdx = aboutRightHtml.indexOf("jk-about-content-col");
  const rightMediaIdx = aboutRightHtml.indexOf("jk-about-media-col");
  assert(
    aboutRightHtml.includes("jk-about--image-right") &&
      rightContentIdx > -1 &&
      rightMediaIdx > -1 &&
      rightContentIdx < rightMediaIdx,
    "ABOUT_VARIANT_IMAGE_RIGHT_ORDER: image-right places content column before media column in DOM"
  );

  assert(
    aboutLeftHtml.includes("20 Yıllık Mühendislik Tecrübesi") &&
      aboutRightHtml.includes("20 Yıllık Mühendislik Tecrübesi") &&
      aboutLeftHtml.includes("3.500+") &&
      aboutRightHtml.includes("3.500+"),
    "ABOUT_VARIANTS_SHARE_CANONICAL_CONTENT: Both About variants render identical customer narrative and metrics"
  );

  // =========================================================================
  // 5. Template Switching Preserves Customer Content 100%
  // =========================================================================
  console.log("\n5. Template Switching & Content Preservation:");

  const initialCanonical = fromLegacySiteConfig(baseConfig);
  const { updatedSite: afterRapid } = switchTemplate(initialCanonical, rapidServiceManifest);
  const { updatedSite: afterModern } = switchTemplate(afterRapid, modernMinimalManifest);
  const { updatedSite: afterCorp } = switchTemplate(afterModern, corporatePrestigeManifest);

  assert(
    JSON.stringify(initialCanonical.businessProfile) === JSON.stringify(afterCorp.businessProfile),
    "SWITCH_PRESERVES_BUSINESS_PROFILE: BusinessProfile & services 100% unchanged after 3 template switches"
  );
  assert(
    JSON.stringify(initialCanonical.content) === JSON.stringify(afterCorp.content),
    "SWITCH_PRESERVES_SITE_CONTENT: Hero, About, Gallery, FAQs, Products, Pages 100% unchanged"
  );
  assert(
    JSON.stringify(initialCanonical.settings.seo) === JSON.stringify(afterCorp.settings.seo),
    "SWITCH_PRESERVES_SEO: SEO metadata 100% unchanged after template switches"
  );
  assert(
    afterRapid.designTemplate.sectionVariants?.hero === rapidServiceManifest.sectionRecipe.hero &&
      afterModern.designTemplate.sectionVariants?.hero === modernMinimalManifest.sectionRecipe.hero &&
      afterCorp.designTemplate.sectionVariants?.hero === corporatePrestigeManifest.sectionRecipe.hero,
    "SWITCH_UPDATES_SECTION_VARIANTS: Template switch deterministically updates sectionVariants recipe"
  );

  // =========================================================================
  // 6. BrandKit & Explicit Override Precedence Across Layout Variants (02A)
  // =========================================================================
  console.log("\n6. BrandKit & Custom Token Precedence Preservation (02A + 02B):");

  const brandKit = createBrandKit({
    siteId: "site-02b-brandkit",
    preferredPrimary: "#0D9488",
    preferredSecondary: "#F0FDFA",
    preferredAccent: "#F59E0B",
  });

  const configWithBrandKit: SiteConfig = {
    ...JSON.parse(JSON.stringify(modernConfig)),
    brandKit,
  };
  const filesWithBrandKit = generateProductionSiteFiles(configWithBrandKit);
  const cssWithBrandKit = filesWithBrandKit.find((f) => f.filename === "assets/site.css")?.content || "";
  const htmlWithBrandKit = filesWithBrandKit.find((f) => f.filename === "index.html")?.html || "";

  assert(
    cssWithBrandKit.toLowerCase().includes("--jk-color-primary: #0d9488"),
    "BRANDKIT_PRECEDENCE_IN_CSS: BrandKit primary color (#0D9488) overrides modern-minimal template default (#334155)"
  );
  assert(
    htmlWithBrandKit.includes('data-layout-variant="split-image"') &&
      htmlWithBrandKit.includes('data-layout-variant="icon-list"'),
    "BRANDKIT_WITH_LAYOUT_VARIANTS: Modern Minimal layout variants render alongside BrandKit colors"
  );

  const configWithExplicitOverride: SiteConfig = {
    ...JSON.parse(JSON.stringify(configWithBrandKit)),
    designTemplate: {
      templateId: "tmpl-modern-minimal",
      templateSlug: "modern-minimal",
      customTokens: {
        palette: {
          primary: "#BE123C",
        },
      },
    },
  } as any;
  const filesWithOverride = generateProductionSiteFiles(configWithExplicitOverride);
  const cssWithOverride = filesWithOverride.find((f) => f.filename === "assets/site.css")?.content || "";

  assert(
    cssWithOverride.toLowerCase().includes("--jk-color-primary: #be123c"),
    "EXPLICIT_OVERRIDE_PRECEDENCE_IN_CSS: Explicit customTokens.palette.primary (#BE123C) overrides BrandKit (#0D9488)"
  );

  // =========================================================================
  // 7. Unsupported Variant Safe Fallback
  // =========================================================================
  console.log("\n7. Unsupported Variant Safe Fallback:");

  const invalidVariantSite = JSON.parse(JSON.stringify(canonicalSite));
  invalidVariantSite.sectionConfiguration.sections = [
    { id: "sec-hero", type: "hero", enabled: true, order: 1, variant: "unsupported-3d-hologram" },
    { id: "sec-services", type: "services", enabled: true, order: 2, variant: "unsupported-carousel-99" },
    { id: "sec-about", type: "about", enabled: true, order: 3, variant: "unsupported-diagonal-split" },
  ];

  const resolvedHeroFallback = resolveSectionVariant("hero", invalidVariantSite, modernMinimalManifest);
  const resolvedServicesFallback = resolveSectionVariant("services", invalidVariantSite, modernMinimalManifest);
  const resolvedAboutFallback = resolveSectionVariant("about", invalidVariantSite, modernMinimalManifest);

  assert(
    resolvedHeroFallback === modernMinimalManifest.sectionRecipe.hero &&
      resolvedServicesFallback === modernMinimalManifest.sectionRecipe.services &&
      resolvedAboutFallback === modernMinimalManifest.sectionRecipe.about,
    "UNSUPPORTED_VARIANT_FALLBACK_TO_MANIFEST: Unsupported variants safely fall back to active TemplateManifest recipe"
  );

  const fallbackFiles = generateStaticSite(invalidVariantSite, modernMinimalManifest);
  const fallbackIndex = fallbackFiles.find((f) => f.filename === "index.html")?.html || "";
  assert(
    fallbackIndex.includes('data-layout-variant="split-image"') &&
      fallbackIndex.includes('data-layout-variant="icon-list"') &&
      fallbackIndex.includes('data-layout-variant="image-left"') &&
      !fallbackIndex.includes("unsupported-3d-hologram"),
    "UNSUPPORTED_VARIANT_SAFE_RENDER: Static generator renders fallback layouts without leaking invalid variant IDs"
  );

  // =========================================================================
  // 8. LANDING and MULTI_PAGE Compatibility
  // =========================================================================
  console.log("\n8. LANDING and MULTI_PAGE Mode Compatibility:");

  const landingFiles = generateProductionSiteFiles({
    ...modernConfig,
    siteType: "single-page",
  } as SiteConfig);
  const multiPageFiles = generateProductionSiteFiles({
    ...modernConfig,
    siteType: "multi-page",
  } as SiteConfig);

  const landingHtml = landingFiles.find((f) => f.filename === "index.html")?.html || "";
  const multiHomeHtml = multiPageFiles.find((f) => f.filename === "index.html")?.html || "";
  const multiServicesPage =
    multiPageFiles.find((f) => f.filename === "hizmetlerimiz/index.html")?.html ||
    multiPageFiles.find((f) => f.filename === "hizmetler.html")?.html ||
    "";
  const multiAboutPage =
    multiPageFiles.find((f) => f.filename === "hakkimizda/index.html")?.html ||
    multiPageFiles.find((f) => f.filename === "kurumsal.html")?.html ||
    "";

  assert(
    landingHtml.includes("jk-hero--split-image") &&
      landingHtml.includes("jk-services--icon-list") &&
      landingHtml.includes("jk-about--image-left"),
    "LANDING_MODE_VARIANTS: LANDING mode renders all section layout variants on index.html"
  );
  assert(
    multiHomeHtml.includes("jk-hero--split-image") &&
      multiHomeHtml.includes("jk-services--icon-list") &&
      multiHomeHtml.includes("jk-about--image-left") &&
      multiServicesPage.length > 500 &&
      multiAboutPage.length > 500,
    "MULTI_PAGE_MODE_VARIANTS: MULTI_PAGE mode renders layout variants on homepage and generates subpages"
  );

  // =========================================================================
  // 9. Preview / Static Generator Parity
  // =========================================================================
  console.log("\n9. Candidate Preview & Static Generator Parity:");

  clearCandidatePreviewCache();
  const canonicalForPreview = fromLegacySiteConfig(baseConfig);

  for (const templateId of ["tmpl-corporate-prestige", "tmpl-rapid-service", "tmpl-modern-minimal"]) {
    const targetManifest = resolveTemplate(templateId)!;
    const candidatePreview = generateCandidatePreviewHtml(canonicalForPreview, templateId);
    const { updatedSite } = switchTemplate(canonicalForPreview, targetManifest);
    const switchedBridgeConfig = toLegacySiteConfig(updatedSite);
    const staticFiles = generateProductionSiteFiles(switchedBridgeConfig);
    const staticIndexHtml = staticFiles.find((f) => f.filename === "index.html")?.html || "";

    const directConfig: SiteConfig = {
      ...JSON.parse(JSON.stringify(baseConfig)),
      templateId,
      theme: targetManifest.slug as any,
    };
    const directPreviewHtml = generateProductionPreviewHtml(directConfig, "index.html");
    const directStaticHtml =
      generateProductionSiteFiles(directConfig).find((f) => f.filename === "index.html")?.html || "";

    assert(
      candidatePreview.html === staticIndexHtml && directPreviewHtml === directStaticHtml,
      `PREVIEW_STATIC_PARITY_${templateId}: Candidate preview HTML and static index.html are byte-identical for ${templateId}`
    );
  }

  console.log(`\n=============================================================`);
  console.log(`THEME FOUNDATION 02B SUMMARY: ${passed}/${passed + failed} assertions passed.`);
  console.log(`=============================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

if (process.argv[1]?.includes("verifyThemeFoundation02B")) {
  runThemeFoundation02BVerification();
}
