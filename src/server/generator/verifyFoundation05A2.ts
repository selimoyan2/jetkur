/**
 * JetKur Content Foundation 05A.2 Forensic Verification Suite
 *
 * Verifies all 13 runtime/functional invariants for Canonical Page Hero Media & Slider Rendering:
 * 1. SINGLE mode with one valid image
 * 2. SLIDER mode with three images in saved order
 * 3. SLIDER mode with one image (static hero degradation, zero slider JS)
 * 4. Missing MediaAsset (clean text-only hero, no broken image placeholders, no invented fallback images)
 * 5. Cross-tenant media isolation (rejects other tenant siteId/workspaceId and raw Pexels URLs)
 * 6. Nested page image paths (relative assets resolve via ../ on nested subpages)
 * 7. Responsive image markup (width, height, sizes, srcset, aspect-ratio, object-fit, eager/lazy loading)
 * 8. Accessible navigation (ARIA carousel/slide roles, button labels, keyboard ArrowLeft/ArrowRight)
 * 9. Reduced-motion behavior (CSS @media (prefers-reduced-motion: reduce) + JS matchMedia guard)
 * 10. Zero unnecessary slider JavaScript (no slider JS in SINGLE, TEXT_ONLY, or 1-image SLIDER)
 * 11. Existing LANDING mode regression
 * 12. MULTI_PAGE routing regression
 * 13. Preview / Publish parity
 */

import assert from "assert";
import { generateStaticSite, resolvePageHeroMedia } from "../../utils/generator";
import { generateProductionSiteFiles, generateProductionPreviewHtml } from "../../utils/productionGeneratorBridge";
import { toSiteConfig } from "../../domain/site/legacyAdapter";
import { CanonicalSite } from "../../domain/site/site";
import { CANONICAL_TEMPLATE_MANIFESTS } from "../../domain/templates/catalog";
import { MediaAsset } from "../../domain/media/types";

console.log("=== JETKUR CONTENT FOUNDATION 05A.2 FORENSIC VERIFICATION ===");

function createTestMediaAssets(siteId = "site-tenant-a", workspaceId = "ws-tenant-a"): MediaAsset[] {
  const now = "2026-10-13T10:00:00.000Z";
  return [
    {
      id: "media-stock-101",
      siteId,
      workspaceId,
      sourceType: "STOCK",
      originalUrl: "https://images.pexels.com/photos/101/pexels-photo-101.jpeg?auto=compress&cs=tinysrgb&w=1600",
      mimeType: "image/jpeg",
      width: 1600,
      height: 900,
      aspectRatio: "16:9",
      altText: "Uzman Tesisat Ekibi Sahada",
      title: "Tesisat Ekibi 1",
      variants: [
        { width: 640, height: 360, url: "https://images.pexels.com/photos/101/pexels-photo-101.jpeg?w=640", mimeType: "image/jpeg" },
        { width: 1600, height: 900, url: "https://images.pexels.com/photos/101/pexels-photo-101.jpeg?w=1600", mimeType: "image/jpeg" },
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "media-stock-202",
      siteId,
      workspaceId,
      sourceType: "STOCK",
      originalUrl: "https://images.pexels.com/photos/202/pexels-photo-202.jpeg?auto=compress&cs=tinysrgb&w=1600",
      mimeType: "image/jpeg",
      width: 1600,
      height: 900,
      aspectRatio: "16:9",
      altText: "Termal Kamera ile Su Kaçağı Tespiti",
      title: "Termal Kamera 2",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "media-stock-303",
      siteId,
      workspaceId,
      sourceType: "STOCK",
      originalUrl: "https://images.pexels.com/photos/303/pexels-photo-303.jpeg?auto=compress&cs=tinysrgb&w=1600",
      mimeType: "image/jpeg",
      width: 1600,
      height: 900,
      aspectRatio: "16:9",
      altText: "Garantili Petek Temizleme Cihazı",
      title: "Petek Temizleme 3",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "media-local-404",
      siteId,
      workspaceId,
      sourceType: "CUSTOMER_UPLOAD",
      originalUrl: "assets/uploads/atolyemiz-hero.webp",
      localAssetPath: "assets/uploads/atolyemiz-hero.webp",
      mimeType: "image/webp",
      width: 1920,
      height: 1080,
      aspectRatio: "16:9",
      altText: "Kadıköy Merkez Atölyemiz",
      title: "Merkez Atölye",
      variants: [
        { width: 640, height: 360, url: "assets/uploads/atolyemiz-hero-640.webp", mimeType: "image/webp" },
        { width: 1920, height: 1080, url: "assets/uploads/atolyemiz-hero.webp", mimeType: "image/webp" },
      ],
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function createBaseSite(siteMode: "LANDING" | "MULTI_PAGE" = "MULTI_PAGE"): CanonicalSite {
  return {
    id: "site-tenant-a",
    workspaceId: "ws-tenant-a",
    schemaVersion: "1.0.0",
    status: "active",
    createdAt: "2026-10-13T10:00:00.000Z",
    updatedAt: "2026-10-13T10:00:00.000Z",
    industryPackId: "pack-sihhi-tesisat",
    designTemplate: {
      templateId: "tmpl-rapid-service",
      templateSlug: "rapid-service",
    },
    sectionConfiguration: {
      sections: [
        { id: "sec-header", type: "header" as any, label: "Üst Menü", enabled: true, order: 0, variant: "standard" },
        { id: "sec-hero", type: "hero", label: "Giriş", enabled: true, order: 1, variant: "urgent-callout" },
        { id: "sec-services", type: "services", label: "Hizmetler", enabled: true, order: 2, variant: "cards-3" },
        { id: "sec-about", type: "about", label: "Hakkımızda", enabled: true, order: 3, variant: "side-by-side" },
        { id: "sec-contact", type: "contact", label: "İletişim", enabled: true, order: 4, variant: "split-map-form" },
        { id: "sec-footer", type: "footer" as any, label: "Alt Bilgi", enabled: true, order: 5, variant: "multi-column" },
      ],
      header: {
        sticky: true,
        showPhoneButton: true,
        showWhatsAppButton: true,
        showCtaButton: true,
        ctaText: "Hemen Ara",
        ctaTarget: "#contact",
        navLinks: [],
      },
      footer: {
        showWorkingHours: true,
        showSocialIcons: true,
        showQuickLinks: true,
        showCopyright: true,
      },
    },
    businessProfile: {
      identity: {
        companyName: "Aksoy Tesisat ve Mühendislik",
        brandName: "Aksoy Tesisat",
        sector: "sihhi-tesisat",
        slogan: "7/24 Profesyonel Tesisat Çözümleri",
        shortDescription: "İstanbul Kadıköy bölgesinde 15 yıllık tecrübeyle garantili sıhhi tesisat hizmetleri.",
        story: "Firmamız 2010 yılında kurulmuştur.",
      },
      contact: {
        phone: "+90 216 555 1020",
        whatsapp: "+90 532 555 1020",
        email: "info@aksoytesisat.com",
      },
      location: {
        address: "Bağdat Cad. No:120 Kadıköy",
        city: "İstanbul",
        country: "Türkiye",
        serviceAreas: ["Kadıköy", "Üsküdar"],
      },
      branding: {
        brandColors: { primary: "#0284c7", secondary: "#0f172a" },
      },
      workingHours: {
        raw: "7/24 Kesintisiz Hizmet",
        is24x7Emergency: true,
      },
      services: [
        { id: "s1", title: "Tıkanıklık Açma", slug: "tikaniklik-acma", shortDescription: "Robot cihazlarla kırmadan açma.", features: [] },
        { id: "s2", title: "Su Kaçağı Tespiti", slug: "su-kacagi-tespiti", shortDescription: "Termal kameralı tespit.", features: [] },
      ],
      social: {},
    },
    content: {
      hero: {
        badge: "★ 7/24 Acil Servis",
        title: "Aksoy Tesisat ve Mühendislik",
        subtitle: "Garantili ve hızlı tesisat servisi.",
        ctaPrimaryText: "Hemen Ara",
        ctaPrimaryLink: "tel:+902165551020",
        ctaSecondaryText: "WhatsApp",
        ctaSecondaryLink: "https://wa.me/905325551020",
        bgImageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200",
      },
      about: {
        badge: "Kurumsal",
        title: "Hakkımızda",
        contentHtml: "Uzman usta kadromuzla Kadıköy ve çevresinde kesintisiz hizmet sunuyoruz.",
        yearsExperience: "15+",
        completedProjects: "10.000+",
        bulletPoints: ["Garantili İşçilik"],
        imageUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1200",
      },
      whyUs: {
        badge: "Neden Biz?",
        title: "Farkımız",
        subtitle: "Kaliteli hizmet",
        items: [{ id: "w1", title: "Hızlı Servis", description: "30 dakikada kapınızda", icon: "Zap" }],
      },
      contact: {
        badge: "İletişim",
        title: "Bize Ulaşın",
        subtitle: "7/24 destek hattı",
      },
      gallery: [],
      testimonials: [],
      faqs: [],
      pricingPlans: [],
      customPages: [],
      blogPosts: [],
      catalogProducts: [
        {
          id: "p1",
          title: "Termostatik Vana",
          slug: "termostatik-vana",
          category: "Yedek Parça",
          price: "450 TL",
          shortDescription: "Enerji tasarruflu petek vanası",
          descriptionHtml: "Orijinal termostatik vana",
          images: [],
          inStock: true,
        },
      ],
      mediaAssets: createTestMediaAssets("site-tenant-a", "ws-tenant-a"),
      pages: [
        {
          id: "page-about",
          pageType: "ABOUT",
          title: "Hakkımızda & Kurumsal",
          slug: "hakkimizda",
          shortDescription: "Aksoy Tesisat kurumsal profili ve hizmet standartları.",
          longContent: "Aksoy Tesisat olarak 2010 yılından beri İstanbul genelinde profesyonel tesisat çözümleri üretiyoruz.\n\nMüşteri memnuniyeti odaklı çalışma prensibimiz ile TSE standartlarında orijinal yedek parçalar kullanıyoruz.",
          active: true,
          heroMediaMode: "SINGLE",
          heroMediaIds: ["media-stock-101"],
          seoTitle: "Kurumsal & Hakkımızda | Aksoy Tesisat",
          seoDescription: "Aksoy Tesisat kurumsal tarihçesi, vizyonu ve uzman teknisyen kadrosu.",
        },
        {
          id: "page-services",
          pageType: "SERVICES",
          title: "Hizmetlerimiz ve Çözümler",
          slug: "hizmetler",
          shortDescription: "Kırmadan su kaçağı tespiti, tıkanıklık açma ve petek temizliği.",
          longContent: "En son teknoloji robot kameralar ve akustik dinleme cihazları ile evinizi kırmadan su kaçaklarını noktasal tespit ediyoruz.",
          active: true,
          heroMediaMode: "SLIDER",
          heroMediaIds: ["media-stock-303", "media-stock-101", "media-stock-202"],
          seoTitle: "Tesisat Hizmetlerimiz | Aksoy Tesisat",
          seoDescription: "Kadıköy ve İstanbul genelinde profesyonel sıhhi tesisat hizmetleri.",
        },
        {
          id: "page-products",
          pageType: "PRODUCTS",
          title: "Ürün ve Yedek Parça Kataloğu",
          slug: "urunler",
          shortDescription: "Kombi bağlantı setleri ve termostatik vanalar.",
          longContent: "Tesisat sistemleriniz için orijinal, faturalı ve garantili yedek parça sunmaktayız.",
          active: true,
          heroMediaMode: "SLIDER",
          heroMediaIds: ["media-stock-202"], // Only 1 image in SLIDER mode -> should degrade to static SINGLE hero
          seoTitle: "Ürün Kataloğu | Aksoy Tesisat",
          seoDescription: "Garantili tesisat ekipmanları ve yedek parça kataloğu.",
        },
        {
          id: "page-contact",
          pageType: "CONTACT",
          title: "İletişim & Randevu",
          slug: "iletisim",
          shortDescription: "7/24 çağrı merkezi ve WhatsApp hattı.",
          longContent: "Acil tesisat arızalarında 30 dakika içinde adrese ulaşım sağlıyoruz.",
          active: true,
          heroMediaMode: "SINGLE",
          heroMediaIds: ["media-nonexistent-999"], // Missing MediaAsset -> should degrade to TEXT_ONLY hero
          seoTitle: "İletişim & Konum | Aksoy Tesisat",
          seoDescription: "Aksoy Tesisat 7/24 iletişim numaraları ve adres krokisi.",
        },
      ],
    },
    settings: {
      siteMode,
      structureMode: siteMode === "MULTI_PAGE" ? "multi-page" : "single-page",
      domain: {
        hostname: "aksoytesisat.com",
        isCustom: true,
        status: "active",
        sslActive: true,
      },
      deployment: {
        provider: "cloudflare_pages",
        status: "deployed",
      },
      seo: {
        metaTitle: "Aksoy Tesisat ve Mühendislik",
        metaDescription: "7/24 Kadıköy tesisat servisi.",
        keywords: "tesisat, kadıköy",
        author: "Aksoy Tesisat",
        robots: "index, follow",
      },
      analytics: {},
      whatsappWidget: {
        enabled: true,
        phoneNumber: "+90 532 555 1020",
        defaultMessage: "Merhaba",
        position: "bottom-right",
        showOnlineBadge: true,
      },
      leads: { enableInstantEmailNotification: true },
      performance: {
        enableEdgeCache: true,
        lazyLoadImages: true,
        minifyStaticHtml: true,
        criticalCssInline: true,
      },
      locale: { defaultLocale: "tr", supportedLocales: ["tr"] },
    },
  } as unknown as CanonicalSite;
}

const site = createBaseSite("MULTI_PAGE");
const files = generateStaticSite(site, CANONICAL_TEMPLATE_MANIFESTS[0]);

const aboutHtml = files.find((f) => f.filename === "hakkimizda/index.html")?.html || "";
const servicesHtml = files.find((f) => f.filename === "hizmetler/index.html")?.html || "";
const productsHtml = files.find((f) => f.filename === "urunler/index.html")?.html || "";
const contactHtml = files.find((f) => f.filename === "iletisim/index.html")?.html || "";

// --------------------------------------------------------------------------
// TEST 1: SINGLE Mode with One Valid Image
// --------------------------------------------------------------------------
console.log("Test 1: SINGLE mode with one valid image...");
assert.ok(aboutHtml.includes('data-hero-mode="SINGLE"'), "ABOUT page must render data-hero-mode=\"SINGLE\"");
assert.ok(aboutHtml.includes('data-media-id="media-stock-101"'), "ABOUT page must reference media-stock-101");
assert.ok(
  aboutHtml.includes("https://images.pexels.com/photos/101/pexels-photo-101.jpeg"),
  "ABOUT page hero must render resolved MediaAsset URL"
);
assert.ok(
  aboutHtml.includes('alt="Uzman Tesisat Ekibi Sahada"'),
  "ABOUT page hero must preserve meaningful MediaAsset altText"
);
console.log("✓ Test 1 Passed: SINGLE mode resolves and renders canonical MediaAsset.");

// --------------------------------------------------------------------------
// TEST 2: SLIDER Mode with Three Images in Saved Order
// --------------------------------------------------------------------------
console.log("Test 2: SLIDER mode with three images in saved order...");
assert.ok(servicesHtml.includes('data-hero-mode="SLIDER"'), "SERVICES page must render data-hero-mode=\"SLIDER\"");
assert.ok(servicesHtml.includes('data-slide-count="3"'), "SERVICES slider must have 3 slides");

const pos303 = servicesHtml.indexOf('data-media-id="media-stock-303"');
const pos101 = servicesHtml.indexOf('data-media-id="media-stock-101"');
const pos202 = servicesHtml.indexOf('data-media-id="media-stock-202"');
assert.ok(pos303 > -1 && pos101 > -1 && pos202 > -1, "All three slides must be rendered in DOM");
assert.ok(
  pos303 < pos101 && pos101 < pos202,
  `Slides must strictly preserve saved order [303, 101, 202], got positions [${pos303}, ${pos101}, ${pos202}]`
);
assert.ok(servicesHtml.includes("var totalPageHeroSlides = 3;"), "Slider JS must configure totalPageHeroSlides = 3");
console.log("✓ Test 2 Passed: SLIDER mode renders all 3 images in exact saved order.");

// --------------------------------------------------------------------------
// TEST 3: SLIDER Mode with One Image (Graceful Degradation)
// --------------------------------------------------------------------------
console.log("Test 3: SLIDER mode with one valid image...");
assert.ok(
  productsHtml.includes('data-hero-mode="SINGLE"'),
  "PRODUCTS page with SLIDER mode but only 1 valid image must degrade to static SINGLE hero"
);
assert.ok(
  productsHtml.includes('data-media-id="media-stock-202"'),
  "PRODUCTS page must render the single valid image media-stock-202"
);
assert.ok(
  !productsHtml.includes('id="pageHeroPrevBtn"'),
  "Single-image slider fallback must NOT render prev/next carousel buttons"
);
assert.ok(
  !productsHtml.includes("showPageHeroSlide"),
  "Single-image slider fallback must NOT emit slider JavaScript"
);
console.log("✓ Test 3 Passed: SLIDER mode with 1 image degrades to static hero with zero slider JS.");

// --------------------------------------------------------------------------
// TEST 4: Missing MediaAsset (Clean Text-Only Fallback)
// --------------------------------------------------------------------------
console.log("Test 4: Missing MediaAsset fallback...");
assert.ok(
  contactHtml.includes('data-hero-mode="TEXT_ONLY"'),
  "CONTACT page with missing MediaAsset ID must render clean TEXT_ONLY hero"
);
// Extract the page hero section from contactHtml
const contactHeroMatch = contactHtml.match(/<section[^>]*jk-page-hero[\s\S]*?<\/section>/);
assert.ok(contactHeroMatch, "CONTACT page hero section must exist");
assert.ok(
  !contactHeroMatch![0].includes("<img"),
  "TEXT_ONLY hero must NOT contain any broken <img> tags or invented fallback images"
);
assert.ok(
  contactHeroMatch![0].includes("İletişim &amp; Randevu"),
  "TEXT_ONLY hero must preserve canonical page title"
);
console.log("✓ Test 4 Passed: Missing MediaAsset renders clean text-only hero without broken placeholders.");

// --------------------------------------------------------------------------
// TEST 5: Cross-Tenant Media Isolation & Raw URL Rejection
// --------------------------------------------------------------------------
console.log("Test 5: Cross-tenant media isolation...");
const crossTenantSite = createBaseSite("MULTI_PAGE");
crossTenantSite.content.mediaAssets!.push(
  {
    id: "media-foreign-site",
    siteId: "site-other-tenant-999",
    workspaceId: "ws-tenant-a",
    sourceType: "STOCK",
    originalUrl: "https://images.pexels.com/photos/999/foreign-site.jpeg",
    mimeType: "image/jpeg",
    altText: "Başka Site Görseli",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "media-foreign-workspace",
    siteId: "site-tenant-a",
    workspaceId: "ws-other-workspace-888",
    sourceType: "STOCK",
    originalUrl: "https://images.pexels.com/photos/888/foreign-workspace.jpeg",
    mimeType: "image/jpeg",
    altText: "Başka Workspace Görseli",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
);
// Attempt to reference foreign tenant assets + raw Pexels URL in ABOUT page
crossTenantSite.content.pages![0].heroMediaMode = "SLIDER";
crossTenantSite.content.pages![0].heroMediaIds = [
  "media-foreign-site",
  "media-foreign-workspace",
  "https://images.pexels.com/photos/777/raw-url-injection.jpeg",
];

const isolatedResolved = resolvePageHeroMedia(crossTenantSite, crossTenantSite.content.pages![0]);
assert.strictEqual(isolatedResolved.assets.length, 0, "Foreign tenant assets and raw URLs must be strictly rejected");
assert.strictEqual(isolatedResolved.effectiveMode, "TEXT_ONLY", "Must fall back to TEXT_ONLY when all IDs are unauthorized");

const isolatedFiles = generateStaticSite(crossTenantSite, CANONICAL_TEMPLATE_MANIFESTS[0]);
const isolatedAboutHtml = isolatedFiles.find((f) => f.filename === "hakkimizda/index.html")?.html || "";
assert.ok(!isolatedAboutHtml.includes("foreign-site.jpeg"), "Foreign site image URL must never leak into output");
assert.ok(!isolatedAboutHtml.includes("foreign-workspace.jpeg"), "Foreign workspace image URL must never leak into output");
assert.ok(!isolatedAboutHtml.includes("raw-url-injection.jpeg"), "Raw Pexels URL in heroMediaIds must never render");
console.log("✓ Test 5 Passed: Cross-tenant MediaAssets and raw Pexels URLs are strictly blocked.");

// --------------------------------------------------------------------------
// TEST 6: Nested Page Image Paths
// --------------------------------------------------------------------------
console.log("Test 6: Nested page image paths...");
const localAssetSite = createBaseSite("MULTI_PAGE");
localAssetSite.content.pages![0].heroMediaMode = "SINGLE";
localAssetSite.content.pages![0].heroMediaIds = ["media-local-404"];

const localAssetFiles = generateStaticSite(localAssetSite, CANONICAL_TEMPLATE_MANIFESTS[0]);
const nestedLocalAboutHtml = localAssetFiles.find((f) => f.filename === "hakkimizda/index.html")?.html || "";
const rootAliasAboutHtml = localAssetFiles.find((f) => f.filename === "kurumsal.html")?.html || "";

assert.ok(
  nestedLocalAboutHtml.includes('src="../assets/uploads/atolyemiz-hero.webp"'),
  "Nested page hakkimizda/index.html must prefix relative hero image URL with ../"
);
assert.ok(
  nestedLocalAboutHtml.includes("../assets/uploads/atolyemiz-hero-640.webp 640w"),
  "Nested page hakkimizda/index.html must prefix relative variant srcset URLs with ../"
);
assert.ok(
  rootAliasAboutHtml.includes('src="assets/uploads/atolyemiz-hero.webp"'),
  "Root alias page kurumsal.html must resolve relative hero image URL from root without ../"
);
console.log("✓ Test 6 Passed: Relative local MediaAsset URLs and srcset variants resolve accurately at any depth.");

// --------------------------------------------------------------------------
// TEST 7: Responsive Image Markup & Aspect Ratio
// --------------------------------------------------------------------------
console.log("Test 7: Responsive image markup & aspect ratio...");
assert.ok(aboutHtml.includes('width="1600"'), "Hero image must include explicit width attribute");
assert.ok(aboutHtml.includes('height="900"'), "Hero image must include explicit height attribute");
assert.ok(aboutHtml.includes('sizes="100vw"'), "Hero image must include responsive sizes attribute");
assert.ok(aboutHtml.includes("srcset="), "Hero image with variants must include srcset attribute");
assert.ok(aboutHtml.includes("aspect-ratio: 16 / 9"), "Hero image must preserve aspect-ratio style");
assert.ok(aboutHtml.includes("object-fit: cover"), "Hero image must apply object-fit: cover");
assert.ok(aboutHtml.includes('loading="eager" fetchpriority="high"'), "Primary hero image must use eager loading and high fetchpriority");
assert.ok(servicesHtml.includes('loading="lazy"'), "Subsequent slider images (index > 0) must use lazy loading");
console.log("✓ Test 7 Passed: Responsive dimensions, srcset, aspect-ratio, object-fit, and LCP attributes verified.");

// --------------------------------------------------------------------------
// TEST 8: Accessible Navigation
// --------------------------------------------------------------------------
console.log("Test 8: Accessible slider navigation...");
assert.ok(servicesHtml.includes('role="region"'), "Slider container must have role=\"region\"");
assert.ok(servicesHtml.includes('aria-roledescription="carousel"'), "Slider must have aria-roledescription=\"carousel\"");
assert.ok(servicesHtml.includes('role="group"'), "Each slide must have role=\"group\"");
assert.ok(servicesHtml.includes('aria-roledescription="slide"'), "Each slide must have aria-roledescription=\"slide\"");
assert.ok(servicesHtml.includes('aria-label="Önceki görsel"'), "Previous button must have Turkish aria-label");
assert.ok(servicesHtml.includes('aria-label="Sonraki görsel"'), "Next button must have Turkish aria-label");
assert.ok(servicesHtml.includes('aria-controls="jkPageHeroSlider"'), "Navigation buttons must reference slider ID via aria-controls");
assert.ok(servicesHtml.includes("e.key === 'ArrowLeft'") && servicesHtml.includes("e.key === 'ArrowRight'"), "Slider JS must support ArrowLeft and ArrowRight keyboard navigation");
console.log("✓ Test 8 Passed: Full ARIA carousel semantics and keyboard accessibility verified.");

// --------------------------------------------------------------------------
// TEST 9: Reduced-Motion Behavior
// --------------------------------------------------------------------------
console.log("Test 9: Reduced-motion compliance...");
assert.ok(
  servicesHtml.includes("window.matchMedia('(prefers-reduced-motion: reduce)').matches"),
  "Slider JS must inspect prefers-reduced-motion media query"
);
assert.ok(
  servicesHtml.includes("if (totalPageHeroSlides > 1 && !prefersReducedMotion)"),
  "Auto-advance timer must be disabled when prefers-reduced-motion is active"
);
assert.ok(
  servicesHtml.includes("@media (prefers-reduced-motion: reduce)"),
  "Static CSS must include @media (prefers-reduced-motion: reduce) rule"
);
console.log("✓ Test 9 Passed: prefers-reduced-motion respected in both CSS and vanilla JS.");

// --------------------------------------------------------------------------
// TEST 10: Zero Unnecessary Slider JavaScript
// --------------------------------------------------------------------------
console.log("Test 10: Zero unnecessary slider JavaScript...");
assert.ok(!aboutHtml.includes("showPageHeroSlide"), "SINGLE hero page (ABOUT) must NOT include page slider JS");
assert.ok(!productsHtml.includes("showPageHeroSlide"), "1-image SLIDER page (PRODUCTS) must NOT include page slider JS");
assert.ok(!contactHtml.includes("showPageHeroSlide"), "TEXT_ONLY hero page (CONTACT) must NOT include page slider JS");
assert.ok(servicesHtml.includes("showPageHeroSlide"), "Multi-image SLIDER page (SERVICES) MUST include page slider JS");
console.log("✓ Test 10 Passed: Slider JavaScript is emitted strictly when 2+ valid slider images exist.");

// --------------------------------------------------------------------------
// TEST 11: Existing LANDING Mode Regression
// --------------------------------------------------------------------------
console.log("Test 11: Existing LANDING mode regression...");
const landingSite = createBaseSite("LANDING");
const landingFiles = generateStaticSite(landingSite, CANONICAL_TEMPLATE_MANIFESTS[0]);
const landingFilenames = landingFiles.map((f) => f.filename);
assert.ok(landingFilenames.includes("index.html"), "LANDING must generate index.html");
assert.ok(!landingFilenames.includes("hakkimizda/index.html"), "LANDING must NOT generate hakkimizda/index.html");
assert.ok(!landingFilenames.includes("hizmetler/index.html"), "LANDING must NOT generate hizmetler/index.html");
const landingHome = landingFiles.find((f) => f.filename === "index.html")?.html || "";
assert.ok(landingHome.includes('href="#services"'), "LANDING homepage must preserve #services anchor");
assert.ok(landingHome.includes('href="#about"'), "LANDING homepage must preserve #about anchor");
assert.ok(landingHome.includes('href="#contact"'), "LANDING homepage must preserve #contact anchor");
console.log("✓ Test 11 Passed: LANDING mode regression check passed.");

// --------------------------------------------------------------------------
// TEST 12: MULTI_PAGE Routing Regression
// --------------------------------------------------------------------------
console.log("Test 12: MULTI_PAGE routing regression...");
const multiFilenames = files.map((f) => f.filename);
assert.ok(multiFilenames.includes("index.html"), "MULTI_PAGE must include index.html");
assert.ok(multiFilenames.includes("hakkimizda/index.html"), "MULTI_PAGE must include hakkimizda/index.html");
assert.ok(multiFilenames.includes("hizmetler/index.html"), "MULTI_PAGE must include hizmetler/index.html");
assert.ok(multiFilenames.includes("urunler/index.html"), "MULTI_PAGE must include urunler/index.html");
assert.ok(multiFilenames.includes("iletisim/index.html"), "MULTI_PAGE must include iletisim/index.html");
assert.ok(aboutHtml.includes('href="../assets/site.css"'), "Nested page must link ../assets/site.css");
assert.ok(aboutHtml.includes('href="../hizmetler/index.html"'), "Nested page navigation must link ../hizmetler/index.html");
console.log("✓ Test 12 Passed: MULTI_PAGE routing and navigation regression check passed.");

// --------------------------------------------------------------------------
// TEST 13: Preview / Publish Parity
// --------------------------------------------------------------------------
console.log("Test 13: Preview / Publish parity...");
const legacyConfig = toSiteConfig(site);
const previewAboutHtml = generateProductionPreviewHtml(legacyConfig, "hakkimizda/index.html");
const previewServicesHtml = generateProductionPreviewHtml(legacyConfig, "hizmetler/index.html");
const publishedFiles = generateProductionSiteFiles(legacyConfig);
const publishedAboutHtml = publishedFiles.find((f) => f.filename === "hakkimizda/index.html")?.html || "";
const publishedServicesHtml = publishedFiles.find((f) => f.filename === "hizmetler/index.html")?.html || "";

assert.strictEqual(previewAboutHtml, publishedAboutHtml, "Preview and published HTML for SINGLE hero page must be byte-identical");
assert.strictEqual(previewServicesHtml, publishedServicesHtml, "Preview and published HTML for SLIDER hero page must be byte-identical");
assert.ok(previewServicesHtml.includes('data-hero-mode="SLIDER"'), "Preview HTML must reflect canonical SLIDER mode");
assert.ok(previewServicesHtml.includes('data-slide-count="3"'), "Preview HTML must reflect all 3 ordered hero slides");

for (const f of publishedFiles) {
  if (f.filename.endsWith(".html")) {
    assert.ok(!f.html.includes("cdn.tailwindcss.com"), `Zero Tailwind CDN in ${f.filename}`);
    assert.ok(!f.html.includes("swiper"), `Zero Swiper runtime in ${f.filename}`);
    assert.ok(!f.html.includes("react-dom"), `Zero React runtime in ${f.filename}`);
  }
}
console.log("✓ Test 13 Passed: 100% Preview / Publish parity and static invariants verified.");

console.log("\n=======================================================");
console.log("ALL 13 CONTENT FOUNDATION 05A.2 FORENSIC TESTS PASSED!");
console.log("=======================================================\n");
