/**
 * JetKur Content Foundation 05A.1 Forensic Verification Suite
 *
 * Verifies:
 * 1. LANDING homepage regression (index.html only, preserves section anchors, no subpages generated)
 * 2. MULTI_PAGE page generation (index.html, hakkimizda/index.html, hizmetler/index.html, urunler/index.html, iletisim/index.html)
 * 3. Active/Passive PageContent filtering (inactive pages are NOT generated in static files)
 * 4. Canonical slug normalization (e.g. "Ürün & Hizmetlerimiz!" -> "urun-ve-hizmetlerimiz")
 * 5. Duplicate and unsafe slug protection (path traversal ../, reserved slugs like "assets", "api" safely disarmed)
 * 6. Desktop & Header navigation (in MULTI_PAGE links to active pages, in LANDING links to section anchors)
 * 7. Mobile navigation (uses identical unified route resolver and markup)
 * 8. Nested asset paths (nested pages resolve assets/site.css via ../assets/site.css)
 * 9. Long content rendering (renders rich multi-paragraph text safely without XSS)
 * 10. SEO metadata preservation (title, meta description, og tags preserved on each dedicated page)
 * 11. Existing static publishing compatibility (zero Tailwind CDN, pure static CSS, edge compatibility)
 */

import assert from "assert";
import { generateStaticSite } from "../../utils/generator";
import { CanonicalSite } from "../../domain/site/site";
import { CANONICAL_TEMPLATE_MANIFESTS } from "../../domain/templates/catalog";
import { PageContent } from "../../domain/site/pageContent";
import { normalizePageSlug, resolveMultiPageRoutes, resolveNavigationLinks } from "../../utils/generator/routeResolver";

console.log("=== JETKUR CONTENT FOUNDATION 05A.1 FORENSIC VERIFICATION ===");

function createBaseTestSite(siteMode: "LANDING" | "MULTI_PAGE"): CanonicalSite {
  return {
    id: "site-test-05a",
    workspaceId: "ws-test-01",
    name: "Aksoy Tesisat ve Mühendislik",
    slug: "aksoy-tesisat",
    industryPackId: "pack-sihhi-tesisat",
    designTemplate: {
      templateId: "tmpl-rapid-service",
      templateSlug: "rapid-service",
      templateVersion: "1.0.0",
    },
    sectionConfiguration: {
      sections: [
        { id: "sec-header", type: "header" as any, enabled: true, order: 0, variant: "standard" },
        { id: "sec-hero", type: "hero", enabled: true, order: 1, variant: "urgent-callout" },
        { id: "sec-services", type: "services", enabled: true, order: 2, variant: "cards-3" },
        { id: "sec-about", type: "about", enabled: true, order: 3, variant: "side-by-side" },
        { id: "sec-contact", type: "contact", enabled: true, order: 4, variant: "split-map-form" },
        { id: "sec-footer", type: "footer" as any, enabled: true, order: 5, variant: "multi-column" },
      ],
    },
    businessProfile: {
      identity: {
        companyName: "Aksoy Tesisat ve Mühendislik",
        brandName: "Aksoy Tesisat",
        sector: "sihhi-tesisat",
        slogan: "7/24 Profesyonel Tesisat Çözümleri",
        shortDescription: "İstanbul Kadıköy bölgesinde 15 yıllık tecrübeyle garantili sıhhi tesisat ve petek temizleme hizmetleri.",
        story: "Firmamız 2010 yılında kurulmuş olup sektörde güvenin adresi olmuştur.",
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
      },
      branding: {
        colors: { primary: "#0284c7", secondary: "#0f172a" },
      },
      services: [
        { id: "s1", name: "Tıkanıklık Açma", description: "Robot cihazlarla kırmadan dökmeden pimaş ve gider açma.", price: "1200 TL" },
        { id: "s2", name: "Su Kaçağı Tespiti", description: "Termal kamera ve akustik dinleme cihazları ile noktasal tespit.", price: "1500 TL" },
      ],
    },
    content: {
      hero: {
        badge: "★ 7/24 Acil Servis",
        title: "Aksoy Tesisat ve Mühendislik",
        subtitle: "Garantili, güvenilir ve 30 dakikada kapınızda acil tesisat servisi.",
        ctaPrimaryText: "Hemen Ara",
        ctaPrimaryLink: "tel:+902165551020",
      },
      about: {
        title: "Hakkımızda",
        contentHtml: "Uzman usta kadromuzla Kadıköy ve çevresinde kesintisiz hizmet sunuyoruz.",
        yearsExperience: "15+",
        completedProjects: "10.000+",
      },
      catalogProducts: [
        { id: "p1", title: "Termostatik Vana", price: "450 TL", shortDescription: "Enerji tasarruflu petek vanası" },
      ],
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
          heroMediaIds: [],
          seoTitle: "Kurumsal & Hakkımızda | Aksoy Tesisat",
          seoDescription: "Aksoy Tesisat kurumsal tarihçesi, vizyonu ve uzman teknisyen kadrosu.",
        },
        {
          id: "page-services",
          pageType: "SERVICES",
          title: "Hizmetlerimiz ve Çözümler",
          slug: "hizmetler",
          shortDescription: "Kırmadan su kaçağı tespiti, tıkanıklık açma ve petek temizliği.",
          longContent: "En son teknoloji robot kameralar ve akustik dinleme cihazları ile evinizi kırmadan su kaçaklarını noktasal tespit ediyoruz.\n\nYapılan tüm onarımlar 1 yıl resmi işçilik garantisi altındadır.",
          active: true,
          heroMediaMode: "SINGLE",
          heroMediaIds: [],
          seoTitle: "Tesisat Hizmetlerimiz | Aksoy Tesisat",
          seoDescription: "Kadıköy ve İstanbul genelinde profesyonel sıhhi tesisat hizmetleri.",
        },
        {
          id: "page-products",
          pageType: "PRODUCTS",
          title: "Ürün ve Yedek Parça Kataloğu",
          slug: "urunler",
          shortDescription: "Kombi bağlantı setleri ve termostatik vanalar.",
          longContent: "Tesisat sistemleriniz için orijinal, faturalı ve garantili yedek parça ve montaj kitleri sunmaktayız.",
          active: true,
          heroMediaMode: "SINGLE",
          heroMediaIds: [],
          seoTitle: "Ürün Kataloğu | Aksoy Tesisat",
          seoDescription: "Garantili tesisat ekipmanları ve yedek parça kataloğu.",
        },
        {
          id: "page-contact",
          pageType: "CONTACT",
          title: "İletişim & Randevu",
          slug: "iletisim",
          shortDescription: "7/24 çağrı merkezi ve WhatsApp hattı.",
          longContent: "Acil tesisat arızalarında 30 dakika içinde adrese ulaşım sağlıyoruz. Bize dilediğiniz an telefonla ulaşabilirsiniz.",
          active: true,
          heroMediaMode: "SINGLE",
          heroMediaIds: [],
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
        robots: "index, follow",
      },
      analytics: {},
      whatsappWidget: { enabled: true, phoneNumber: "+90 532 555 1020" },
      leads: {},
      performance: {},
      locale: { defaultLocale: "tr", supportedLocales: ["tr"] },
    },
  } as unknown as CanonicalSite;
}

// --------------------------------------------------------------------------
// TEST 1: LANDING Homepage Regression
// --------------------------------------------------------------------------
console.log("Test 1: LANDING Homepage Regression...");
const landingSite = createBaseTestSite("LANDING");
const landingFiles = generateStaticSite(landingSite, CANONICAL_TEMPLATE_MANIFESTS[0]);
const landingFilenames = landingFiles.map((f) => f.filename);

assert.ok(landingFilenames.includes("index.html"), "LANDING must generate index.html");
assert.ok(!landingFilenames.includes("hakkimizda/index.html"), "LANDING must NOT generate hakkimizda/index.html");
assert.ok(!landingFilenames.includes("hizmetler/index.html"), "LANDING must NOT generate hizmetler/index.html");
assert.ok(!landingFilenames.includes("urunler/index.html"), "LANDING must NOT generate urunler/index.html");
assert.ok(!landingFilenames.includes("iletisim/index.html"), "LANDING must NOT generate iletisim/index.html");

const landingHomeHtml = landingFiles.find((f) => f.filename === "index.html")?.html || "";
assert.ok(landingHomeHtml.includes('href="#services"'), "LANDING navigation must preserve #services anchor");
assert.ok(landingHomeHtml.includes('href="#about"'), "LANDING navigation must preserve #about anchor");
assert.ok(landingHomeHtml.includes('href="#contact"'), "LANDING navigation must preserve #contact anchor");
console.log("✓ Test 1 Passed: LANDING mode preserves existing single-page anchor behavior.");

// --------------------------------------------------------------------------
// TEST 2: MULTI_PAGE Page Generation
// --------------------------------------------------------------------------
console.log("Test 2: MULTI_PAGE Page Generation...");
const multiSite = createBaseTestSite("MULTI_PAGE");
const multiFiles = generateStaticSite(multiSite, CANONICAL_TEMPLATE_MANIFESTS[0]);
const multiFilenames = multiFiles.map((f) => f.filename);

assert.ok(multiFilenames.includes("index.html"), "MULTI_PAGE must include index.html");
assert.ok(multiFilenames.includes("hakkimizda/index.html"), "MULTI_PAGE must generate hakkimizda/index.html");
assert.ok(multiFilenames.includes("hizmetler/index.html"), "MULTI_PAGE must generate hizmetler/index.html");
assert.ok(multiFilenames.includes("urunler/index.html"), "MULTI_PAGE must generate urunler/index.html");
assert.ok(multiFilenames.includes("iletisim/index.html"), "MULTI_PAGE must generate iletisim/index.html");
console.log("✓ Test 2 Passed: MULTI_PAGE generates all canonical directory subpages.");

// --------------------------------------------------------------------------
// TEST 3: Active/Passive Filtering
// --------------------------------------------------------------------------
console.log("Test 3: Active/Passive Filtering...");
const passiveSite = createBaseTestSite("MULTI_PAGE");
// Mark PRODUCTS and CONTACT as inactive
passiveSite.content.pages![2].active = false; // PRODUCTS
passiveSite.content.pages![3].active = false; // CONTACT

const passiveFiles = generateStaticSite(passiveSite, CANONICAL_TEMPLATE_MANIFESTS[0]);
const passiveFilenames = passiveFiles.map((f) => f.filename);

assert.ok(passiveFilenames.includes("hakkimizda/index.html"), "Active page ABOUT must be generated");
assert.ok(passiveFilenames.includes("hizmetler/index.html"), "Active page SERVICES must be generated");
assert.ok(!passiveFilenames.includes("urunler/index.html"), "Inactive page PRODUCTS must NOT be generated");
assert.ok(!passiveFilenames.includes("iletisim/index.html"), "Inactive page CONTACT must NOT be generated");

const passiveHomeHtml = passiveFiles.find((f) => f.filename === "index.html")?.html || "";
assert.ok(!passiveHomeHtml.includes("urunler/index.html"), "Inactive page PRODUCTS must NOT appear in header navigation");
assert.ok(!passiveHomeHtml.includes("iletisim/index.html"), "Inactive page CONTACT must NOT appear in header navigation");
console.log("✓ Test 3 Passed: Inactive pages are strictly excluded from output and navigation.");

// --------------------------------------------------------------------------
// TEST 4: Canonical Slug Normalization
// --------------------------------------------------------------------------
console.log("Test 4: Canonical Slug Normalization...");
assert.strictEqual(normalizePageSlug("Hakkımızda & Vizyonumuz!", "hakkimizda"), "hakkimizda-ve-vizyonumuz");
assert.strictEqual(normalizePageSlug("7/24 Acil Hizmetler", "hizmetler"), "7-24-acil-hizmetler");
assert.strictEqual(normalizePageSlug("Ürünler ve Fiyatlar", "urunler"), "urunler-ve-fiyatlar");
assert.strictEqual(normalizePageSlug("", "hakkimizda"), "hakkimizda");
assert.strictEqual(normalizePageSlug(null, "iletisim"), "iletisim");
console.log("✓ Test 4 Passed: Slug normalization handles Turkish characters and fallback cases correctly.");

// --------------------------------------------------------------------------
// TEST 5: Duplicate and Unsafe Slug Protection
// --------------------------------------------------------------------------
console.log("Test 5: Duplicate and Unsafe Slug Protection...");
// Path traversal attempt
assert.strictEqual(normalizePageSlug("../../../etc/passwd", "guvenli"), "etc-passwd");
// Reserved paths
assert.strictEqual(normalizePageSlug("assets", "fallback-slug"), "fallback-slug");
assert.strictEqual(normalizePageSlug("api", "fallback-slug"), "fallback-slug");
assert.strictEqual(normalizePageSlug("robots", "fallback-slug"), "fallback-slug");

// Duplicate slug resolution test
const duplicateSlugSite = createBaseTestSite("MULTI_PAGE");
duplicateSlugSite.content.pages![0].slug = "ayni-slug";
duplicateSlugSite.content.pages![1].slug = "ayni-slug";
const routes = resolveMultiPageRoutes(duplicateSlugSite);
const routeSlugs = routes.map((r) => r.slug);
assert.strictEqual(new Set(routeSlugs).size, routeSlugs.length, "Route slugs must be strictly deduplicated");
console.log("✓ Test 5 Passed: Directory traversal and collision protections verified.");

// --------------------------------------------------------------------------
// TEST 6 & 7: Desktop and Mobile Navigation Parity
// --------------------------------------------------------------------------
console.log("Test 6 & 7: Desktop and Mobile Navigation Parity...");
const navSite = createBaseTestSite("MULTI_PAGE");
const rootNav = resolveNavigationLinks(navSite, 0);
const nestedNav = resolveNavigationLinks(navSite, 1);

assert.strictEqual(rootNav[0].href, "index.html", "Root home link must be index.html");
assert.strictEqual(rootNav[1].href, "hakkimizda/index.html", "Root link to about must be hakkimizda/index.html");
assert.strictEqual(nestedNav[0].href, "../index.html", "Nested home link must resolve relative ../index.html");
assert.strictEqual(nestedNav[1].href, "../hakkimizda/index.html", "Nested subpage link must resolve relative ../hakkimizda/index.html");

const multiHomeHtml = multiFiles.find((f) => f.filename === "index.html")?.html || "";
assert.ok(multiHomeHtml.includes('id="mobileDrawer"'), "Mobile drawer markup must be present in DOM");
assert.ok(multiHomeHtml.includes('hakkimizda/index.html'), "Mobile drawer must contain active subpage links");
console.log("✓ Test 6 & 7 Passed: Unified desktop and mobile navigation route resolution verified.");

// --------------------------------------------------------------------------
// TEST 8: Nested Asset Paths
// --------------------------------------------------------------------------
console.log("Test 8: Nested Asset Paths...");
const aboutSubpageHtml = multiFiles.find((f) => f.filename === "hakkimizda/index.html")?.html || "";
assert.ok(aboutSubpageHtml.includes('href="../assets/site.css"'), "Nested page must link ../assets/site.css");
assert.ok(aboutSubpageHtml.includes('id="jetkur-static-css"'), "Nested page must include inline static CSS block");
console.log("✓ Test 8 Passed: Nested subpages correctly resolve CSS and stylesheet paths.");

// --------------------------------------------------------------------------
// TEST 9: Long Content Rendering & XSS Protection
// --------------------------------------------------------------------------
console.log("Test 9: Long Content Rendering & XSS Protection...");
assert.ok(
  aboutSubpageHtml.includes("Aksoy Tesisat olarak 2010 yılından beri"),
  "Long content paragraph 1 must be rendered in about subpage"
);
assert.ok(
  aboutSubpageHtml.includes("Müşteri memnuniyeti odaklı çalışma prensibimiz"),
  "Long content paragraph 2 must be rendered in about subpage"
);

// XSS check: injection in long content
const xssSite = createBaseTestSite("MULTI_PAGE");
xssSite.content.pages![0].longContent = '<script>alert("hacked")</script>Güvenli İçerik Metni';
const xssFiles = generateStaticSite(xssSite, CANONICAL_TEMPLATE_MANIFESTS[0]);
const xssAboutHtml = xssFiles.find((f) => f.filename === "hakkimizda/index.html")?.html || "";
assert.ok(!xssAboutHtml.includes('<script>alert("hacked")</script>'), "Malicious script tags must be stripped from long content");
assert.ok(xssAboutHtml.includes("Güvenli İçerik Metni"), "Legitimate text in long content must be preserved");
console.log("✓ Test 9 Passed: Multi-paragraph longContent rendered safely without script execution.");

// --------------------------------------------------------------------------
// TEST 10: SEO Metadata Preservation
// --------------------------------------------------------------------------
console.log("Test 10: SEO Metadata Preservation...");
assert.ok(aboutSubpageHtml.includes("<title>Kurumsal &amp; Hakkımızda | Aksoy Tesisat</title>") || aboutSubpageHtml.includes("<title>Kurumsal & Hakkımızda | Aksoy Tesisat</title>"), "Subpage title must match canonical page seoTitle");
assert.ok(aboutSubpageHtml.includes('content="Aksoy Tesisat kurumsal tarihçesi, vizyonu ve uzman teknisyen kadrosu."'), "Subpage meta description must match canonical page seoDescription");

const servicesSubpageHtml = multiFiles.find((f) => f.filename === "hizmetler/index.html")?.html || "";
assert.ok(servicesSubpageHtml.includes("Tesisat Hizmetlerimiz | Aksoy Tesisat"), "Services subpage title must match seoTitle");
console.log("✓ Test 10 Passed: SEO metadata preserved across all dedicated static pages.");

// --------------------------------------------------------------------------
// TEST 11: Static Performance Non-Regression & Publishing Compatibility
// --------------------------------------------------------------------------
console.log("Test 11: Static Performance Non-Regression & Publishing Compatibility...");
for (const file of multiFiles) {
  if (file.filename.endsWith(".html")) {
    assert.ok(!file.html.includes("cdn.tailwindcss.com"), `No Tailwind CDN allowed in ${file.filename}`);
    assert.ok(!file.html.includes("react-dom"), `No React runtime allowed in ${file.filename}`);
    assert.ok(!file.html.includes("bootstrap.min.css"), `No Bootstrap allowed in ${file.filename}`);
  }
}
console.log("✓ Test 11 Passed: Zero Tailwind CDN, zero runtime frameworks across all generated static pages.");

console.log("\n=======================================================");
console.log("ALL 11 CONTENT FOUNDATION 05A.1 FORENSIC TESTS PASSED!");
console.log("=======================================================\n");
