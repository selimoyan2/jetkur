/**
 * JetKur Sprint 09 Verification Suite: Canonical Renderer & Modular Generation
 *
 * Rigorously audits:
 * 1. CanonicalSite + TemplateManifest input to generateStaticSite()
 * 2. Active Section Renderer coverage (all 15 canonical sections)
 * 3. 3 Representative Canonical Sites (Sıhhi Tesisat, Diş Hekimliği, Hukuk)
 * 4. Output File Structure (index.html, site.css, multi-page HTMLs, sitemap, robots, _headers, _redirects)
 * 5. Template Switching & Content Immutability (Fingerprint preservation)
 * 6. Security (HTML escaping, URL sanitization, JSON-LD breakout resistance)
 * 7. Section Readiness integration (EMPTY, DEGRADED, READY)
 * 8. Variant Resolution priority
 * 9. Feature-Aware JavaScript
 * 10. No-JS Core Content preservation
 * 11. Deterministic Output
 * 12. Static Performance Non-Regression (Zero Tailwind CDN, Zero runtime frameworks)
 */

import crypto from "crypto";
import {
  CANONICAL_TEMPLATE_MANIFESTS,
  rapidServiceManifest,
  clinicalPureManifest,
  formalLegalManifest,
  getTemplateBySlug,
} from "../../domain/templates";
import { CANONICAL_SECTION_DEFINITIONS } from "../../domain/sections/registry";
import { CanonicalSectionId } from "../../domain/sections/types";
import {
  generateStaticSite,
  CANONICAL_SECTION_RENDERER_MAP,
  renderCanonicalSection,
  escapeHtml,
  sanitizeUrl,
  safeJsonLd,
  collectRequiredEnhancements,
} from "../../utils/generator";
import { CanonicalSite } from "../../domain/site/site";
import { inspectGeneratedSite } from "../../utils/staticPerformanceAuditor";

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

// ---------------------------------------------------------------------------
// Helper: Create a representative CanonicalSite
// ---------------------------------------------------------------------------
function createTestCanonicalSite(
  sector: "sihhi-tesisat" | "dis-hekimligi" | "hukuk-avukat",
  templateSlug: string,
  structureMode: "single-page" | "multi-page" = "multi-page"
): CanonicalSite {
  const isDental = sector === "dis-hekimligi";
  const isLegal = sector === "hukuk-avukat";

  const companyName = isDental
    ? "Dt. Ayşe Yılmaz Diş Kliniği"
    : isLegal
    ? "Yılmaz & Kaya Hukuk Bürosu"
    : "Usta Tesisat 7/24";

  return {
    id: `site-${sector}-01`,
    workspaceId: "ws-test-01",
    name: companyName,
    slug: sector,
    industryPackId: `pack-${sector}`,
    designTemplate: {
      templateId: `tmpl-${templateSlug}`,
      templateSlug: templateSlug,
      templateVersion: "1.0.0",
    },
    sectionConfiguration: {
      sections: [
        { id: "sec-header", type: "header" as any, enabled: true, order: 0, variant: "standard" },
        { id: "sec-hero", type: "hero", enabled: true, order: 1, variant: "urgent-callout" },
        { id: "sec-services", type: "services", enabled: true, order: 2, variant: "cards-3" },
        { id: "sec-about", type: "about", enabled: true, order: 3, variant: "side-by-side" },
        { id: "sec-whyUs", type: "whyUs", enabled: true, order: 4, variant: "cards-3" },
        { id: "sec-gallery", type: "gallery", enabled: true, order: 5, variant: "grid-lightbox" },
        { id: "sec-testimonials", type: "testimonials", enabled: true, order: 6, variant: "cards-grid" },
        { id: "sec-faqs", type: "faqs", enabled: true, order: 7, variant: "accordion" },
        { id: "sec-contact", type: "contact", enabled: true, order: 8, variant: "split-map-form" },
        { id: "sec-footer", type: "footer" as any, enabled: true, order: 9, variant: "multi-column" },
      ],
      headerNav: [
        { label: "Ana Sayfa", href: "#hero" },
        { label: "Hizmetler", href: "#services" },
        { label: "Kurumsal", href: "#about" },
        { label: "İletişim", href: "#contact" },
      ],
    },
    businessProfile: {
      identity: {
        companyName,
        brandName: companyName,
        sector,
        slogan: isDental ? "Gülüşünüz Sağlığınızdır" : isLegal ? "Adalet ve Güven" : "7/24 Acil Tesisat Çözümleri",
        shortDescription: `${companyName} profesyonel ve güvenilir hizmet sunar.`,
        story: `${companyName} 15 yıllık tecrübesiyle sektörde öncü hizmetler vermektedir.`,
      },
      contact: {
        phone: "+90 212 555 0101",
        whatsapp: "+90 532 555 0101",
        email: "iletisim@example.com",
      },
      location: {
        address: "Atatürk Cad. No:42 Kadıköy",
        city: "İstanbul",
        country: "Türkiye",
      },
      branding: {
        colors: {
          primary: "#0284c7",
          secondary: "#0f172a",
        },
      },
      services: [
        { id: "s1", name: isDental ? "İmplant Tedavisi" : isLegal ? "Ceza Hukuku" : "Tıkanıklık Açma", description: "Uzman kadro ile hızlı çözüm.", price: "1500 TL" },
        { id: "s2", name: isDental ? "Diş Beyazlatma" : isLegal ? "Ticaret Hukuku" : "Su Kaçağı Tespiti", description: "Cihazlı kırmadan tespit.", price: "2000 TL" },
        { id: "s3", name: isDental ? "Ortodonti" : isLegal ? "İş Hukuku" : "Petek Temizliği", description: "Yüksek verimli temizlik.", price: "1200 TL" },
      ],
    },
    content: {
      hero: {
        badge: "★ Güvenilir Hizmet",
        title: companyName,
        subtitle: isDental ? "Modern Klinik, Uzman Hekimler" : isLegal ? "Hukuki Danışmanlık ve Avukatlık" : "Acil Usta Kapınızda",
        ctaPrimaryText: "Hemen Ara",
        ctaPrimaryLink: "tel:+902125550101",
        ctaSecondaryText: "WhatsApp",
        ctaSecondaryLink: "https://wa.me/905325550101",
        bgImageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341",
      },
      about: {
        badge: "Kurumsal",
        title: "Hakkımızda",
        contentHtml: "<p>Şirketimiz uzun yıllardır kesintisiz hizmet vermektedir.</p>",
        bulletPoints: ["15 Yıl Tecrübe", "Garantili İşçilik", "7/24 Destek"],
        imageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341",
      },
      whyUs: {
        badge: "Neden Biz?",
        title: "Avantajlarımız",
        subtitle: "Bizi tercih etmeniz için 3 önemli neden",
        items: [
          { id: "w1", title: "Hızlı Müdahale", description: "30 dakikada adresteyiz.", icon: "zap" },
          { id: "w2", title: "Garantili Çözüm", description: "1 yıl işçilik garantisi.", icon: "shield" },
          { id: "w3", title: "Uygun Fiyat", description: "Şeffaf fiyatlandırma politikası.", icon: "tag" },
        ],
      },
      gallery: {
        badge: "Fotoğraflar",
        title: "Uygulama Kareleri",
        items: [
          { id: "g1", title: "Çalışma 1", imageUrl: "https://images.unsplash.com/photo-1" },
          { id: "g2", title: "Çalışma 2", imageUrl: "https://images.unsplash.com/photo-2" },
        ],
      },
      testimonials: [
        { id: "t1", name: "Ahmet Demir", role: "Müşteri", comment: "Çok hızlı ve temiz çalıştılar, teşekkürler.", rating: 5 },
        { id: "t2", name: "Zeynep Kaya", role: "Müşteri", comment: "Güler yüzlü ve profesyonel ekip.", rating: 5 },
      ],
      faqs: [
        { id: "f1", question: "Hizmet süresi ne kadar?", answer: "Genellikle 1-2 saat içinde tamamlanmaktadır." },
        { id: "f2", question: "Garanti veriyor musunuz?", answer: "Tüm işlemlerimiz 1 yıl resmi garantilidir." },
      ],
      blogPosts: [],
      catalogProducts: [],
    },
    settings: {
      structureMode,
      domain: {
        customDomain: `${sector}.example.com`,
        status: "ACTIVE",
        verifiedAt: new Date().toISOString(),
      },
      deployment: {
        provider: "CLOUDFLARE_PAGES",
        status: "DEPLOYED",
      },
      seo: {
        canonicalUrl: `https://${sector}.example.com`,
        robots: "index, follow",
        defaultTitle: companyName,
        defaultDescription: `${companyName} resmi web sitesi.`,
      },
      analytics: {},
      whatsappWidget: {
        enabled: true,
        phoneNumber: "+905325550101",
        defaultMessage: "Merhaba, bilgi almak istiyorum.",
      },
      leads: {},
      performance: {
        enableCriticalCssInline: true,
        enableProgressiveHydration: true,
      },
      locale: {
        defaultLocale: "tr",
        supportedLocales: ["tr"],
      },
    },
  } as unknown as CanonicalSite;
}

export function runCanonicalRendererVerification() {
  console.log("\n=== JETKUR SPRINT 09: CANONICAL RENDERER FORENSIC VERIFICATION ===\n");

  // =========================================================================
  // 1. CanonicalSite Input & Generation Tests
  // =========================================================================
  console.log("1. CanonicalSite Input & Multi-File Static Generation:");

  const rapidManifest = getTemplateBySlug("rapid-service") || CANONICAL_TEMPLATE_MANIFESTS[0];
  const clinicalManifest = getTemplateBySlug("clinical-pure") || CANONICAL_TEMPLATE_MANIFESTS[1];
  const formalManifest = getTemplateBySlug("formal-legal") || CANONICAL_TEMPLATE_MANIFESTS[2];

  const sitePlumbing = createTestCanonicalSite("sihhi-tesisat", "rapid-service", "multi-page");
  const siteDental = createTestCanonicalSite("dis-hekimligi", "clinical-pure", "multi-page");
  const siteLegal = createTestCanonicalSite("hukuk-avukat", "formal-legal", "multi-page");

  const plumbingFiles = generateStaticSite(sitePlumbing, rapidManifest);
  const dentalFiles = generateStaticSite(siteDental, clinicalManifest);
  const legalFiles = generateStaticSite(siteLegal, formalManifest);

  assert(plumbingFiles.length >= 8, "PLUMBING_OUTPUT_FILES: Generates >= 8 files for multi-page", `Files: ${plumbingFiles.length}`);
  assert(dentalFiles.length >= 8, "DENTAL_OUTPUT_FILES: Generates >= 8 files for multi-page", `Files: ${dentalFiles.length}`);
  assert(legalFiles.length >= 8, "LEGAL_OUTPUT_FILES: Generates >= 8 files for multi-page", `Files: ${legalFiles.length}`);

  // =========================================================================
  // 2. Output File Inventory & Required Assets
  // =========================================================================
  console.log("2. Generated File Inventory & Required Asset Verification:");

  const requiredFileNames = [
    "index.html",
    "kurumsal.html",
    "hizmetler.html",
    "iletisim.html",
    "assets/site.css",
    "robots.txt",
    "sitemap.xml",
    "_headers",
    "_redirects",
  ];

  for (const req of requiredFileNames) {
    const found = plumbingFiles.some((f) => f.filename === req);
    assert(found, `FILE_EXISTS_${req.replace(/[/.]/g, "_").toUpperCase()}: Output contains ${req}`);
  }

  // =========================================================================
  // 3. Active Section Coverage (Sprint 06 Canonical Sections)
  // =========================================================================
  console.log("3. Active Section Renderer Coverage Verification:");

  const activeSectionDefs = CANONICAL_SECTION_DEFINITIONS.filter((s) => s.status === "ACTIVE");
  assert(activeSectionDefs.length === 15, "ACTIVE_SECTION_COUNT: Exactly 15 active sections in registry", `Found: ${activeSectionDefs.length}`);

  let renderedCount = 0;
  for (const def of activeSectionDefs) {
    const fn = CANONICAL_SECTION_RENDERER_MAP[def.id as CanonicalSectionId];
    if (typeof fn === "function") {
      renderedCount++;
    } else {
      console.error(`Missing renderer for section: ${def.id}`);
    }
  }

  assert(
    renderedCount === activeSectionDefs.length,
    `SECTION_RENDERER_COVERAGE: All ${activeSectionDefs.length} active sections have registered renderers`,
    `Covered: ${renderedCount}/${activeSectionDefs.length}`
  );

  // Test experimental section
  const customHtmlFn = CANONICAL_SECTION_RENDERER_MAP["customHtml"];
  assert(typeof customHtmlFn === "function", "EXPERIMENTAL_CUSTOM_HTML_RENDERER: customHtml renderer exists");

  // =========================================================================
  // 4. Section Readiness Integration Tests
  // =========================================================================
  console.log("4. Section Readiness Engine Integration:");

  // Site with EMPTY gallery (0 items)
  const siteEmptyGallery = createTestCanonicalSite("sihhi-tesisat", "rapid-service");
  (siteEmptyGallery.content as any).gallery = { badge: "Galeri", title: "Boş", items: [] };
  const emptyGalleryFiles = generateStaticSite(siteEmptyGallery, rapidManifest);
  const emptyGalleryHtml = emptyGalleryFiles.find((f) => f.filename === "index.html")?.html || "";

  assert(!emptyGalleryHtml.includes('id="gallery"'), "EMPTY_SECTION_NOT_RENDERED: Empty gallery section is omitted from DOM");

  // Site with READY gallery (2 items)
  const readyGalleryHtml = plumbingFiles.find((f) => f.filename === "index.html")?.html || "";
  assert(readyGalleryHtml.includes('id="gallery"'), "READY_SECTION_RENDERED: Ready gallery section is rendered in DOM");

  // =========================================================================
  // 5. Variant Resolution Priority Tests
  // =========================================================================
  console.log("5. Variant Resolution Priority:");

  // 1. Customer explicit override
  const siteExplicit = createTestCanonicalSite("sihhi-tesisat", "rapid-service");
  siteExplicit.sectionConfiguration.sections = [
    { id: "s-hero", type: "hero", enabled: true, order: 0, variant: "centered-prestige" },
  ];
  const explicitResult = renderCanonicalSection("hero", {
    site: siteExplicit,
    manifest: rapidManifest,
  });
  assert(explicitResult.includes("Hero Section: centered-prestige"), "VARIANT_EXPLICIT_PRIORITY: Customer variant override respected");

  // 2. Fallback on invalid variant
  const siteInvalidVariant = createTestCanonicalSite("sihhi-tesisat", "rapid-service");
  siteInvalidVariant.sectionConfiguration.sections = [
    { id: "s-hero", type: "hero", enabled: true, order: 0, variant: "non-existent-variant-xyz" },
  ];
  const fallbackResult = renderCanonicalSection("hero", {
    site: siteInvalidVariant,
    manifest: rapidManifest,
  });
  assert(!fallbackResult.includes("non-existent-variant-xyz"), "VARIANT_FALLBACK_SAFE: Invalid variant safely ignored");

  // =========================================================================
  // 6. Template Switching & Content Fingerprint Preservation
  // =========================================================================
  console.log("6. Template Switching & Content Immutability:");

  const testSite = createTestCanonicalSite("sihhi-tesisat", "rapid-service");
  const fingerprintBefore = crypto
    .createHash("sha256")
    .update(JSON.stringify(testSite.businessProfile) + JSON.stringify(testSite.content))
    .digest("hex");

  // Render with Template A
  const filesA = generateStaticSite(testSite, rapidManifest);
  const htmlA = filesA.find((f) => f.filename === "index.html")?.html || "";

  // Render with Template B
  const filesB = generateStaticSite(testSite, clinicalManifest);
  const htmlB = filesB.find((f) => f.filename === "index.html")?.html || "";

  const fingerprintAfter = crypto
    .createHash("sha256")
    .update(JSON.stringify(testSite.businessProfile) + JSON.stringify(testSite.content))
    .digest("hex");

  assert(
    fingerprintBefore === fingerprintAfter,
    "CONTENT_FINGERPRINT_PRESERVED: Customer business profile & content byte-identical before and after switch"
  );
  assert(htmlA.length > 0 && htmlB.length > 0, "BOTH_TEMPLATES_RENDERED: Both templates produce valid HTML output");

  // =========================================================================
  // 7. Security Verification (XSS, URL Sanitization, JSON-LD Breakout)
  // =========================================================================
  console.log("7. Security & Injection Resistance:");

  // HTML escaping
  const escapedText = escapeHtml("<script>alert(1)</script>");
  assert(
    !escapedText.includes("<script>") && escapedText.includes("&lt;script&gt;"),
    "HTML_ESCAPING_SCRIPT: Script tags escaped to entities"
  );

  const maliciousSite = createTestCanonicalSite("sihhi-tesisat", "rapid-service");
  maliciousSite.businessProfile.identity.companyName = '"><script>alert("pwn")</script>';
  maliciousSite.content.testimonials = [
    { id: "m1", name: '<img src=x onerror=alert(1)>', comment: 'test', rating: 5 }
  ];
  const maliciousFiles = generateStaticSite(maliciousSite, rapidManifest);
  const maliciousHtml = maliciousFiles.find((f) => f.filename === "index.html")?.html || "";

  assert(!maliciousHtml.includes('<script>alert("pwn")</script>'), "MALICIOUS_BUSINESS_NAME_ESCAPED: Unsafe companyName disarmed");
  assert(!maliciousHtml.includes('<img src=x onerror=alert(1)>'), "MALICIOUS_TESTIMONIAL_ESCAPED: XSS in testimonial disarmed");

  // URL Sanitization
  const safeJsUrl = sanitizeUrl("javascript:alert(1)");
  assert(safeJsUrl === "#", "URL_SECURITY_JAVASCRIPT_REJECTED: javascript: protocol rejected and replaced with #");

  const safeVbUrl = sanitizeUrl("vbscript:msgbox(1)");
  assert(safeVbUrl === "#", "URL_SECURITY_VBSCRIPT_REJECTED: vbscript: protocol rejected");

  // JSON-LD Breakout
  const jsonLdInput = '</script><script>alert("breakout")</script>';
  const safeJson = safeJsonLd({ desc: jsonLdInput });
  assert(!safeJson.includes("</script>"), "JSON_LD_BREAKOUT_PREVENTED: </script> tags escaped to \\u003c/script\\u003e");

  // =========================================================================
  // 8. Progressive Enhancement & Feature-Aware JavaScript
  // =========================================================================
  console.log("8. Progressive Enhancement & Feature-Aware JavaScript:");

  const minimalConfig = {
    companyName: "Minimal Co",
    faqs: { enabled: false, items: [] },
    gallery: { enabled: false, items: [] },
    hero: { slides: [] },
    products: { enabled: false, items: [] },
  } as any;

  const enhancements = collectRequiredEnhancements(minimalConfig);
  assert(!enhancements.faqAccordion, "FEATURE_AWARE_JS_NO_FAQ: No FAQ accordion script when FAQs disabled");
  assert(!enhancements.heroSlider, "FEATURE_AWARE_JS_NO_SLIDER: No slider script when no multi-slides");
  assert(!enhancements.galleryLightbox, "FEATURE_AWARE_JS_NO_GALLERY: No gallery lightbox script when no gallery");

  // No-JS Core Content Check
  const homeHtml = plumbingFiles.find((f) => f.filename === "index.html")?.html || "";
  assert(homeHtml.includes("Usta Tesisat 7/24"), "NO_JS_CORE_CONTENT_NAME: Business name rendered in plain HTML");
  assert(homeHtml.includes("tel:+902125550101"), "NO_JS_CORE_CONTENT_PHONE: Phone link works without JS");
  assert(homeHtml.includes("Tıkanıklık Açma"), "NO_JS_CORE_CONTENT_SERVICES: Services list rendered in plain HTML");

  // =========================================================================
  // 9. Output Determinism
  // =========================================================================
  console.log("9. Output Determinism:");

  const run1 = generateStaticSite(sitePlumbing, rapidManifest);
  const run2 = generateStaticSite(sitePlumbing, rapidManifest);

  const htmlRun1 = run1.find((f) => f.filename === "index.html")?.html || "";
  const htmlRun2 = run2.find((f) => f.filename === "index.html")?.html || "";

  assert(htmlRun1 === htmlRun2, "OUTPUT_DETERMINISTIC_HTML: Successive generations yield byte-identical HTML");
  assert(run1.length === run2.length, "OUTPUT_DETERMINISTIC_FILE_COUNT: File counts are identical");

  // =========================================================================
  // 10. Static Performance & Budget Non-Regression
  // =========================================================================
  console.log("10. Static Performance Non-Regression:");

  const metrics = inspectGeneratedSite(plumbingFiles);
  assert(metrics.tailwindCdnReferences === 0, "TAILWIND_CDN_ZERO: Zero references to cdn.tailwindcss.com");
  assert(!metrics.hasRuntimeCssFramework, "NO_RUNTIME_FRAMEWORK: Zero runtime CSS frameworks");
  assert(!metrics.hasReactRuntime && !metrics.hasViteRuntime && metrics.externalScriptsCount === 0, "ZERO_FRAMEWORK_REQUESTS: Zero runtime framework requests");

  const siteCss = plumbingFiles.find((f) => f.filename === "assets/site.css");
  assert(Boolean(siteCss && siteCss.content.length > 5000), "SITE_CSS_GENERATED: assets/site.css compiled and non-empty");

  // Summary
  console.log(`\nVerification Complete: ${passedCount} / ${passedCount + failedCount} tests passed.\n`);

  if (failedCount > 0) {
    throw new Error(`Sprint 09 Verification failed with ${failedCount} errors.`);
  }
}

// Execute if run directly via tsx
if (import.meta.url === `file://${process.argv[1]}`) {
  runCanonicalRendererVerification();
}
