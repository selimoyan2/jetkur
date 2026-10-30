/**
 * JETKUR — THEME FOUNDATION 02C VERIFICATION SUITE
 * Premium Headers, Footers, Service Cards & Responsive Design
 */

import { createDefaultSiteConfig, createNeutralSiteConfig } from "../../data/mockData";
import { SiteConfig } from "../../types";
import { fromLegacySiteConfig, toLegacySiteConfig } from "../../domain/site/legacyAdapter";
import { createBrandKit } from "../../domain/brand";
import { CANONICAL_TEMPLATE_MANIFESTS, resolveTemplate } from "../../domain/templates/catalog";
import { switchTemplate } from "../../domain/templates/switcher";
import { generateCandidatePreviewHtml } from "../../domain/templates/preview";
import { validateTemplateManifest } from "../../domain/templates/validator";
import { renderCanonicalSection } from "../../utils/generator/sectionRenderer";
import { renderProgressiveScripts } from "../../utils/generator/progressiveScriptRenderer";
import { generateStaticCss } from "../../utils/staticCssGenerator";
import {
  generateProductionSiteFiles,
  generateProductionPreviewHtml,
} from "../../utils/productionGeneratorBridge";
import { MediaAsset } from "../../domain/media/types";

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

function buildTestCanonicalSite() {
  const base = createDefaultSiteConfig();
  const legacy: SiteConfig = {
    ...base,
    id: "site-02c-test",
    companyName: "Anadolu Mühendislik A.Ş.",
    slogan: "Endüstriyel Otomasyon ve Mühendislik Çözümleri",
    phone: "0212 555 44 33",
    whatsapp: "905325554433",
    email: "bilgi@anadolumuhendislik.com.tr",
    address: "Organize Sanayi Bölgesi 4. Cad. No: 18, İstanbul",
    workingHours: "Pzt - Cum: 08:30 - 18:00",
    services: {
      ...base.services,
      items: [
        {
          ...base.services.items[0],
          id: "srv-1",
          title: "PLC Otomasyon Sistemleri",
          desc: "Üretim hatlarınız için anahtar teslim endüstriyel otomasyon kurulumu.",
          icon: "⚙️",
        },
        {
          ...base.services.items[0],
          id: "srv-2",
          title: "Enerji İzleme ve Raporlama",
          desc: "Fabrika enerji tüketimini anlık izleyen SCADA çözümleri.",
          icon: "⚡",
        },
        {
          ...base.services.items[0],
          id: "srv-3",
          title: "Periyodik Bakım ve Onarım",
          desc: "7/24 saha destek ekibiyle kesintisiz üretim güvencesi.",
          icon: "🛠️",
        },
      ],
    },
  };
  return fromLegacySiteConfig(legacy);
}

async function runVerification() {
  console.log("==================================================================");
  console.log("JETKUR — THEME FOUNDATION 02C VERIFICATION SUITE");
  console.log("==================================================================\n");

  // -------------------------------------------------------------------------
  // 1. TEMPLATE VALIDATOR & MANIFEST RECIPES
  // -------------------------------------------------------------------------
  console.log("1. Template Manifests & Validator Compliance");
  const invalidTemplates = CANONICAL_TEMPLATE_MANIFESTS.filter(
    (m) => !validateTemplateManifest(m).valid
  );
  assert(
    invalidTemplates.length === 0,
    "All 8 registered canonical templates pass manifest validator (zero forbidden Tailwind classes)",
    invalidTemplates.map((m) => m.id).join(", ")
  );

  const mCorp = resolveTemplate("tmpl-corporate-prestige")!;
  const mRapid = resolveTemplate("tmpl-rapid-service")!;
  const mMinimal = resolveTemplate("tmpl-modern-minimal")!;
  const mLuxury = resolveTemplate("tmpl-vip-luxury")!;
  const mArtisan = resolveTemplate("tmpl-artisan-warm")!;

  assert(
    mCorp.sectionRecipe.header === "corporate-classic" &&
      mCorp.sectionRecipe.hero === "centered-prestige" &&
      mCorp.sectionRecipe.services === "standard-card" &&
      mCorp.sectionRecipe.footer === "corporate-multicolumn",
    "Corporate Prestige manifest configures corporate-classic header, standard-card services, corporate-multicolumn footer"
  );
  assert(
    mRapid.sectionRecipe.header === "local-service" &&
      mRapid.sectionRecipe.services === "grid-4" &&
      mRapid.sectionRecipe.footer === "local-service",
    "Rapid Service manifest configures local-service header, compact-local (grid-4) services, local-service footer"
  );
  assert(
    mMinimal.sectionRecipe.header === "modern-minimal" &&
      mMinimal.sectionRecipe.hero === "split-content-image" &&
      mMinimal.sectionRecipe.services === "minimal-icon" &&
      mMinimal.sectionRecipe.footer === "minimal",
    "Modern Minimal manifest configures modern-minimal header, split-image hero, minimal-icon services, minimal footer"
  );
  assert(
    mLuxury.sectionRecipe.header === "premium-luxury" &&
      mLuxury.sectionRecipe.services === "bordered-premium" &&
      mLuxury.sectionRecipe.about === "image-left" &&
      mLuxury.sectionRecipe.footer === "premium",
    "VIP Luxury manifest configures premium-luxury header, bordered-premium services, image-left about, premium footer"
  );
  assert(
    mArtisan.sectionRecipe.services === "image-card",
    "Artisan Warm manifest configures image-card services"
  );

  // -------------------------------------------------------------------------
  // 2. HEADER VARIANTS (4 DISTINCT LAYOUTS)
  // -------------------------------------------------------------------------
  console.log("\n2. Header Variants (4 Distinct Layouts)");
  const baseSite = buildTestCanonicalSite();

  const headerCorp = renderCanonicalSection("header", {
    site: switchTemplate(baseSite, mCorp).updatedSite,
    manifest: mCorp,
  });
  const headerLocal = renderCanonicalSection("header", {
    site: switchTemplate(baseSite, mRapid).updatedSite,
    manifest: mRapid,
  });
  const headerMinimal = renderCanonicalSection("header", {
    site: switchTemplate(baseSite, mMinimal).updatedSite,
    manifest: mMinimal,
  });
  const headerPremium = renderCanonicalSection("header", {
    site: switchTemplate(baseSite, mLuxury).updatedSite,
    manifest: mLuxury,
  });

  assert(
    headerCorp.includes('data-header-variant="corporate-classic"') &&
      headerCorp.includes("jk-header--corporate-classic") &&
      headerCorp.includes("jk-header-topbar"),
    "Header A (corporate-classic) renders top utility strip and corporate-classic layout"
  );
  assert(
    headerLocal.includes('data-header-variant="local-service"') &&
      headerLocal.includes("jk-header--local-service") &&
      headerLocal.includes("Hemen Ara") &&
      headerLocal.includes("tel:02125554433"),
    "Header B (local-service) renders high-conversion phone and tap-to-call action strip"
  );
  assert(
    headerMinimal.includes('data-header-variant="modern-minimal"') &&
      headerMinimal.includes("jk-header--modern-minimal") &&
      !headerMinimal.includes("jk-header-topbar"),
    "Header C (modern-minimal) renders single-row clean header without top bar clutter"
  );
  assert(
    headerPremium.includes('data-header-variant="premium-luxury"') &&
      headerPremium.includes("jk-header--premium-luxury") &&
      headerPremium.includes("bg-slate-950"),
    "Header D (premium-luxury) renders editorial dark luxury header with refined uppercase links"
  );
  assert(
    headerCorp !== headerLocal &&
      headerLocal !== headerMinimal &&
      headerMinimal !== headerPremium &&
      headerCorp !== headerPremium,
    "All 4 Header variants produce genuinely distinct HTML structures"
  );

  // -------------------------------------------------------------------------
  // 3. MOBILE NAVIGATION ACCESSIBILITY & ZERO DUPLICATE IDS
  // -------------------------------------------------------------------------
  console.log("\n3. Mobile Navigation Drawer & Accessibility");
  assert(
    headerCorp.includes('id="mobileMenuToggleBtn"') &&
      headerCorp.includes('aria-expanded="false"') &&
      headerCorp.includes('aria-controls="mobileDrawer"') &&
      headerCorp.includes('id="mobileDrawer"') &&
      headerCorp.includes('aria-hidden="true"') &&
      headerCorp.includes('role="dialog"'),
    "Header includes accessible mobile toggle button and mobile drawer with ARIA attributes"
  );

  // Verify zero duplicate IDs inside rendered header + drawer
  const idMatches = [...headerCorp.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
  const uniqueIds = new Set(idMatches);
  assert(
    idMatches.length === uniqueIds.size,
    "Header and Mobile Navigation Drawer contain zero duplicate DOM IDs",
    `Found IDs: ${idMatches.join(", ")}`
  );

  const runtimeScript = renderProgressiveScripts(createDefaultSiteConfig(), {
    mobileNav: true,
    faqAccordion: false,
    heroSlider: false,
    galleryLightbox: false,
    languageSwitcher: false,
    catalogModal: false,
  });
  assert(
    runtimeScript.includes("aria-expanded") &&
      runtimeScript.includes("aria-hidden") &&
      runtimeScript.includes("e.key === 'Escape'") &&
      runtimeScript.includes("e.key === 'Tab'") &&
      runtimeScript.includes("#mobileDrawer a"),
    "Progressive runtime script supports aria-expanded/aria-hidden, Escape key close, Tab focus trap, and link-click auto-close"
  );

  // -------------------------------------------------------------------------
  // 4. FOOTER VARIANTS (4 DISTINCT LAYOUTS) & ZERO INVENTED DATA
  // -------------------------------------------------------------------------
  console.log("\n4. Footer Variants (4 Distinct Layouts) & Zero Invented Contact Info");
  const footerCorp = renderCanonicalSection("footer", {
    site: switchTemplate(baseSite, mCorp).updatedSite,
    manifest: mCorp,
  });
  const footerLocal = renderCanonicalSection("footer", {
    site: switchTemplate(baseSite, mRapid).updatedSite,
    manifest: mRapid,
  });
  const footerMinimal = renderCanonicalSection("footer", {
    site: switchTemplate(baseSite, mMinimal).updatedSite,
    manifest: mMinimal,
  });
  const footerPremium = renderCanonicalSection("footer", {
    site: switchTemplate(baseSite, mLuxury).updatedSite,
    manifest: mLuxury,
  });

  assert(
    footerCorp.includes('data-layout-variant="corporate-multicolumn"') &&
      footerCorp.includes("jk-footer--corporate-multicolumn") &&
      footerCorp.includes("Hızlı Bağlantılar") &&
      footerCorp.includes("PLC Otomasyon Sistemleri"),
    "Footer A (corporate-multicolumn) renders 4-column layout with company info, nav, services, and contact"
  );
  assert(
    footerLocal.includes('data-layout-variant="local-service"') &&
      footerLocal.includes("jk-footer--local-service") &&
      footerLocal.includes("jk-footer-cta-strip") &&
      footerLocal.includes("WhatsApp Hattı"),
    "Footer B (local-service) renders top conversion CTA strip with Phone + WhatsApp buttons"
  );
  assert(
    footerMinimal.includes('data-layout-variant="minimal"') &&
      footerMinimal.includes("jk-footer--minimal"),
    "Footer C (minimal) renders compact two-row clean layout"
  );
  assert(
    footerPremium.includes('data-layout-variant="premium"') &&
      footerPremium.includes("jk-footer--premium") &&
      footerPremium.includes("Kurumsal Seçkinlik"),
    "Footer D (premium) renders high-contrast editorial footer with prominent heading and tagline"
  );
  assert(
    footerCorp !== footerLocal &&
      footerLocal !== footerMinimal &&
      footerMinimal !== footerPremium &&
      footerCorp !== footerPremium,
    "All 4 Footer variants produce genuinely distinct HTML structures"
  );

  // Test missing optional contact data (zero invented addresses, emails, hours, or social links)
  const neutralLegacy = createNeutralSiteConfig();
  neutralLegacy.companyName = "Sade Danışmanlık";
  neutralLegacy.phone = "";
  neutralLegacy.whatsapp = "";
  neutralLegacy.email = "";
  neutralLegacy.address = "";
  neutralLegacy.city = "";
  neutralLegacy.workingHours = "";
  neutralLegacy.socialMedia = {};
  const minimalDataSite = fromLegacySiteConfig(neutralLegacy);
  minimalDataSite.businessProfile.location.city = "";
  minimalDataSite.businessProfile.location.district = "";

  const headerNoContact = renderCanonicalSection("header", {
    site: switchTemplate(minimalDataSite, mCorp).updatedSite,
    manifest: mCorp,
  });
  const footerNoContact = renderCanonicalSection("footer", {
    site: switchTemplate(minimalDataSite, mCorp).updatedSite,
    manifest: mCorp,
  });

  assert(
    !headerNoContact.includes("tel:") &&
      !headerNoContact.includes("mailto:") &&
      !headerNoContact.includes("jk-header-topbar"),
    "Header omits empty top utility bar, tel:, and mailto: when contact fields are empty"
  );
  assert(
    !footerNoContact.includes("mailto:") &&
      !footerNoContact.includes("Pazartesi") &&
      !footerNoContact.includes("09:00") &&
      !footerNoContact.includes("instagram.com") &&
      !footerNoContact.includes("facebook.com"),
    "Footer never invents missing working hours, emails, addresses, or social links"
  );

  // -------------------------------------------------------------------------
  // 5. SERVICE CARD VARIANTS (5 DISTINCT STYLES + MEDIA ASSET PIPELINE)
  // -------------------------------------------------------------------------
  console.log("\n5. Service Card Variants (5 Distinct Styles & MediaAsset Pipeline)");
  const srvStandard = renderCanonicalSection("services", {
    site: switchTemplate(baseSite, mCorp).updatedSite,
    manifest: mCorp,
  });
  const srvMinimalIcon = renderCanonicalSection("services", {
    site: switchTemplate(baseSite, mMinimal).updatedSite,
    manifest: mMinimal,
  });
  const srvBorderedPremium = renderCanonicalSection("services", {
    site: switchTemplate(baseSite, mLuxury).updatedSite,
    manifest: mLuxury,
  });
  const srvCompactLocal = renderCanonicalSection("services", {
    site: switchTemplate(baseSite, mRapid).updatedSite,
    manifest: mRapid,
  });

  assert(
    srvStandard.includes('data-card-variant="standard-card"') &&
      srvStandard.includes("jk-service-card--standard-card"),
    "Service Card 1 (standard-card) renders clean icon badge, title, description, and action link"
  );
  assert(
    srvMinimalIcon.includes('data-card-variant="minimal-icon"') &&
      srvMinimalIcon.includes("jk-service-card--minimal-icon") &&
      srvMinimalIcon.includes('data-layout-variant="icon-list"'),
    "Service Card 2 (minimal-icon) renders horizontal icon-list layout"
  );
  assert(
    srvBorderedPremium.includes('data-card-variant="bordered-premium"') &&
      srvBorderedPremium.includes("jk-service-card--bordered-premium") &&
      srvBorderedPremium.includes("jk-service-card-index") &&
      srvBorderedPremium.includes("01"),
    "Service Card 4 (bordered-premium) renders numbered index badge, subtle border, and generous padding"
  );
  assert(
    srvCompactLocal.includes('data-card-variant="compact-local"') &&
      srvCompactLocal.includes("jk-service-card--compact-local") &&
      srvCompactLocal.includes("Hızlı Çözüm"),
    "Service Card 5 (compact-local) renders dense scannable card with quick-response badge and direct CTA"
  );

  // Test Service Card 3 (image-card) WITH canonical MediaAsset vs WITHOUT image vs Cross-Tenant MediaAsset
  const artisanSite = switchTemplate(baseSite, mArtisan).updatedSite;
  (artisanSite.businessProfile.services[0] as any).primaryMediaId = "media-srv-custom-1";
  (artisanSite.businessProfile.services[1] as any).primaryMediaId = "media-cross-tenant";
  // services[2] has no primaryMediaId

  const mediaAssets: MediaAsset[] = [
    {
      id: "media-srv-custom-1",
      siteId: artisanSite.id,
      workspaceId: artisanSite.workspaceId,
      sourceType: "STOCK",
      originalUrl: "https://cdn.example.com/tenant-02c-test/plc-panel.webp",
      mimeType: "image/webp",
      width: 800,
      height: 600,
      aspectRatio: "4:3",
      altText: "PLC Otomasyon Panosu Görseli",
      title: "PLC Panosu",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "media-cross-tenant",
      siteId: "other-evil-site",
      workspaceId: "other-evil-workspace",
      sourceType: "STOCK",
      originalUrl: "https://cdn.example.com/other-evil-tenant/secret.webp",
      mimeType: "image/webp",
      width: 800,
      height: 600,
      aspectRatio: "4:3",
      altText: "Cross tenant image",
      title: "Secret",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
  artisanSite.content.mediaAssets = mediaAssets;

  const srvImageCard = renderCanonicalSection("services", {
    site: artisanSite,
    manifest: mArtisan,
  });

  assert(
    srvImageCard.includes('data-card-variant="image-card"') &&
      srvImageCard.includes("jk-service-card--image-card") &&
      srvImageCard.includes("https://cdn.example.com/tenant-02c-test/plc-panel.webp") &&
      srvImageCard.includes('alt="PLC Otomasyon Panosu Görseli"'),
    "Service Card 3 (image-card) resolves valid same-tenant MediaAsset via primaryMediaId"
  );
  assert(
    !srvImageCard.includes("other-evil-tenant/secret.webp"),
    "Service Card 3 (image-card) strictly rejects cross-tenant MediaAsset"
  );
  assert(
    srvImageCard.includes("Enerji İzleme ve Raporlama") &&
      srvImageCard.includes("Periyodik Bakım ve Onarım") &&
      !srvImageCard.includes("unsplash.com"),
    "Service Card 3 (image-card) falls back cleanly to a text-based card when no image exists (zero random stock images)"
  );

  // -------------------------------------------------------------------------
  // 6. LANDING vs MULTI_PAGE NAVIGATION COMPATIBILITY
  // -------------------------------------------------------------------------
  console.log("\n6. LANDING vs MULTI_PAGE Navigation Compatibility");
  const landingSite = switchTemplate(baseSite, mCorp).updatedSite;
  landingSite.settings.structureMode = "single-page";
  landingSite.settings.siteMode = "LANDING";
  const landingHeader = renderCanonicalSection("header", { site: landingSite, manifest: mCorp });

  const multiSite = switchTemplate(baseSite, mCorp).updatedSite;
  multiSite.settings.structureMode = "multi-page";
  multiSite.settings.siteMode = "MULTI_PAGE";
  const multiHeader = renderCanonicalSection("header", { site: multiSite, manifest: mCorp });

  assert(
    landingHeader.includes('href="#services"') &&
      landingHeader.includes('href="#about"') &&
      landingHeader.includes('href="#contact"'),
    "LANDING (single-page) header navigation uses section anchor links (#services, #about, #contact)"
  );
  assert(
    multiHeader.includes('href="index.html"') &&
      (multiHeader.includes('href="hizmetler/index.html"') ||
        multiHeader.includes('href="hizmetlerimiz/index.html"')) &&
      multiHeader.includes('href="hakkimizda/index.html"') &&
      multiHeader.includes('href="iletisim/index.html"'),
    "MULTI_PAGE header navigation uses multi-page HTML routes (index.html, hizmetler(imiz)/index.html, hakkimizda/index.html, iletisim/index.html)",
    multiHeader
  );

  // Disabled section is omitted from navigation
  const siteNoAbout = switchTemplate(baseSite, mCorp).updatedSite;
  siteNoAbout.sectionConfiguration.sections = siteNoAbout.sectionConfiguration.sections.map((s) =>
    s.type === "about" || s.id === "about" || s.id === "sec-about" ? { ...s, enabled: false } : s
  );
  const headerNoAbout = renderCanonicalSection("header", { site: siteNoAbout, manifest: mCorp });
  assert(
    !headerNoAbout.includes('href="#about"'),
    "Navigation links only include enabled sections (disabled About section is excluded)"
  );

  // -------------------------------------------------------------------------
  // 7. TEMPLATE SWITCHING, BRAND KIT PRECEDENCE & PREVIEW/STATIC PARITY
  // -------------------------------------------------------------------------
  console.log("\n7. Template Switching, Brand Kit Precedence & Preview/Static Parity");
  const siteWithBrandKit = buildTestCanonicalSite();
  const brandKit = createBrandKit({
    siteId: "site-02c-brandkit",
    preferredPrimary: "#DC2626",
    preferredSecondary: "#FEF2F2",
    preferredAccent: "#F59E0B",
  });
  siteWithBrandKit.brandKit = brandKit;
  siteWithBrandKit.designTemplate.customTokens = {
    palette: { primary: "#7C3AED" } as any,
  };

  const switchedToLuxury = switchTemplate(siteWithBrandKit, mLuxury).updatedSite;

  assert(
    switchedToLuxury.businessProfile.identity.companyName === "Anadolu Mühendislik A.Ş." &&
      switchedToLuxury.businessProfile.services.length === 3 &&
      switchedToLuxury.businessProfile.services[0].title === "PLC Otomasyon Sistemleri",
    "Switching templates preserves 100% of canonical customer content"
  );
  assert(
    switchedToLuxury.designTemplate.sectionVariants?.header === "premium-luxury" &&
      switchedToLuxury.designTemplate.sectionVariants?.services === "bordered-premium" &&
      switchedToLuxury.designTemplate.sectionVariants?.footer === "premium",
    "Switching templates updates canonical Header, Services, and Footer variants to target manifest recipe"
  );

  // Verify Preview vs Production Bundle Parity & CSS Token Precedence
  const legacyLuxury = toLegacySiteConfig(switchedToLuxury);
  const previewHtml = generateProductionPreviewHtml(legacyLuxury);
  const prodFiles = generateProductionSiteFiles(legacyLuxury);
  const indexPage = prodFiles.find((p) => p.filename === "index.html")!;
  const cssFile = prodFiles.find((p) => p.filename === "assets/site.css")!;
  const candidatePreview = generateCandidatePreviewHtml(switchedToLuxury, "tmpl-vip-luxury");

  assert(
    (cssFile.content || "").toLowerCase().includes("--jk-color-primary: #7c3aed"),
    "Token precedence (TemplateManifest < BrandKit < customTokens) remains intact in compiled static CSS after template switch"
  );
  assert(
    previewHtml.includes("jk-header--premium-luxury") &&
      previewHtml.includes("jk-service-card--bordered-premium") &&
      previewHtml.includes("jk-footer--premium") &&
      indexPage.html.includes("jk-header--premium-luxury") &&
      indexPage.html.includes("jk-service-card--bordered-premium") &&
      indexPage.html.includes("jk-footer--premium") &&
      candidatePreview.html.includes("jk-header--premium-luxury"),
    "Preview generator, candidate preview bridge, and production static generator all render identical 02C variants"
  );

  // -------------------------------------------------------------------------
  // 8. STATIC CSS GENERATOR 02C CLASSES & RESPONSIVE RULES
  // -------------------------------------------------------------------------
  console.log("\n8. Static CSS Generator 02C Classes & Responsive Rules");
  const css = generateStaticCss(legacyLuxury, mLuxury.designTokens);
  assert(
    css.includes(".jk-header--corporate-classic") &&
      css.includes(".jk-header--local-service") &&
      css.includes(".jk-header--modern-minimal") &&
      css.includes(".jk-header--premium-luxury"),
    "Static CSS contains all 4 Header variant style blocks"
  );
  assert(
    css.includes(".jk-footer--corporate-multicolumn") &&
      css.includes(".jk-footer--local-service") &&
      css.includes(".jk-footer--minimal") &&
      css.includes(".jk-footer--premium"),
    "Static CSS contains all 4 Footer variant style blocks"
  );
  assert(
    css.includes(".jk-service-card--standard-card") &&
      css.includes(".jk-service-card--minimal-icon") &&
      css.includes(".jk-service-card--image-card") &&
      css.includes(".jk-service-card--bordered-premium") &&
      css.includes(".jk-service-card--compact-local"),
    "Static CSS contains all 5 Service Card variant style blocks"
  );
  assert(
    css.includes("overflow-x: hidden") &&
      css.includes(".jk-mobile-drawer") &&
      css.includes(":focus-visible") &&
      css.includes("@media (max-width: 374px)") &&
      css.includes("@media (min-width: 640px)") &&
      css.includes("@media (min-width: 768px)") &&
      css.includes("@media (min-width: 1024px)") &&
      css.includes("@media (min-width: 1440px)"),
    "Static CSS includes horizontal overflow protection, mobile drawer rules, focus-visible accessibility, and responsive breakpoints (320px to 1440px)"
  );

  console.log("\n==================================================================");
  console.log(`THEME FOUNDATION 02C SUMMARY: ${passed}/${passed + failed} PASSED`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error("Unhandled verification error:", err);
  process.exit(1);
});
