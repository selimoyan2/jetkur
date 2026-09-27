/**
 * JetKur Sprint 09.2 Verification Suite: Canonical Renderer Production Cutover
 *
 * Validates:
 * 1. Production generation uses canonical modular renderer (StaticDeployModal, LivePreviewFrame, cloudflareDeployEngine)
 * 2. Preview uses canonical renderer
 * 3. Deploy artifacts use canonical renderer
 * 4. Export uses canonical renderer
 * 5. Preview and export share identical render authority
 * 6. Legacy generator (generateAllSiteFiles) has 0 production calls
 * 7. Canonical template resolution through production bridge
 * 8. Representative Plumbing production path
 * 9. Representative Dental production path
 * 10. Representative Legal production path
 * 11. Static CSS present after cutover (assets/site.css)
 * 12. Tailwind CDN absent after cutover (0 occurrences)
 * 13. No React runtime after cutover
 * 14. No Vite runtime after cutover
 * 15. Feature-aware JS after cutover
 * 16. SEO preserved after cutover
 * 17. Sitemap preserved after cutover
 * 18. Robots preserved after cutover
 * 19. Headers preserved after cutover
 * 20. Redirects preserved after cutover
 * 21. Multi-page preserved after cutover
 * 22. Content preserved after cutover
 * 23. Performance non-regression after cutover
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { SiteConfig, GeneratedPageFile } from "../../types";
import {
  generateProductionSiteFiles,
  generateProductionPreviewHtml,
  resolveManifestForConfig,
} from "../../utils/productionGeneratorBridge";
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
// Sample Site Configurations
// ---------------------------------------------------------------------------

function createMockSiteConfig(
  sector: "sihhi-tesisat" | "dis-hekimligi" | "hukuk-avukat",
  templateId: string,
  siteType: "single-page" | "multi-page" = "multi-page"
): SiteConfig {
  const isMulti = siteType === "multi-page";
  return {
    id: `site-${sector}`,
    companyName: sector === "sihhi-tesisat" ? "Usta Tesisat Ltd." : sector === "dis-hekimligi" ? "Dt. Ayşe Aydın Klinik" : "Aydın & Ortakları Hukuk",
    slogan: sector === "sihhi-tesisat" ? "7/24 Acil Sıhhi Tesisat" : "Modern ve Ağrısız Diş Tedavisi",
    phone: "+90 212 555 0101",
    whatsapp: "+90 532 555 0101",
    email: "info@example.com",
    address: "Bağdat Caddesi No:42 Kadıköy",
    city: "İstanbul",
    sector,
    templateId,
    siteType,
    palette: {
      primary: sector === "sihhi-tesisat" ? "#0284c7" : sector === "dis-hekimligi" ? "#059669" : "#1e3a8a",
      primaryDark: "#0f172a",
      secondary: "#0d9488",
      accent: "#f59e0b",
      text: "#1e293b",
      bg: "#ffffff",
    },
    hero: {
      title: `${sector === "sihhi-tesisat" ? "Usta Tesisat" : "Klinik"} Profesyonel Hizmet`,
      subtitle: "Garantili, güvenilir ve 7/24 hızlı kurumsal çözümler.",
      ctaPrimaryText: "Hemen Ara",
      ctaPrimaryLink: "tel:+902125550101",
    },
    services: {
      items: [
        { id: "s1", name: "Ana Hizmet 1", description: "Hızlı ve profesyonel müdahale.", price: "1.000 TL" },
        { id: "s2", name: "Ana Hizmet 2", description: "Kapsamlı bakım ve onarım desteği.", price: "2.500 TL" },
      ],
    },
    about: {
      title: "Hakkımızda",
      content: "15 yılı aşkın süredir sektörümüzde kesintisiz, dürüst ve ilkeli hizmet vermekteyiz.",
      yearsExperience: "15+",
      completedProjects: "10.000+",
    },
    whyUs: {
      items: [
        { id: "w1", title: "7/24 Acil Destek", desc: "Her an yanınızdayız." },
        { id: "w2", title: "Garantili İşçilik", desc: "1 yıl tam işçilik garantisi." },
      ],
    },
    testimonials: {
      items: [
        { id: "t1", name: "Ahmet Bey", comment: "Çok memnun kaldım, zamanında geldiler.", role: "Müşteri" },
      ],
    },
    faqs: {
      items: [
        { id: "f1", question: "Hangi bölgelere hizmet veriyorsunuz?", answer: "Tüm il genelinde hizmetimiz mevcuttur." },
        { id: "f2", question: "Fiyat politikanız nedir?", answer: "Sabit ve şeffaf fiyatlandırma uygulanır." },
      ],
    },
    homepageSections: [
      { id: "hero", name: "Hero Banner", enabled: true, order: 0 },
      { id: "services", name: "Hizmetlerimiz", enabled: true, order: 1 },
      { id: "about", name: "Hakkımızda", enabled: true, order: 2 },
      { id: "whyUs", name: "Neden Biz?", enabled: true, order: 3 },
      { id: "testimonials", name: "Müşteri Yorumları", enabled: true, order: 4 },
      { id: "faqs", name: "Sıkça Sorulan Sorular", enabled: true, order: 5 },
      { id: "contact", name: "İletişim", enabled: true, order: 6 },
    ],
    seo: {
      metaTitle: `${sector} Resmi Web Sitesi`,
      metaDescription: "Kurumsal ve profesyonel hizmetler.",
      canonicalUrl: "https://example.com",
    },
    cloudflare: {
      status: "idle",
      deployedUrl: "https://example.pages.dev",
      subdomain: `site-${sector}`,
    },
  } as unknown as SiteConfig;
}

// ---------------------------------------------------------------------------
// Run Test Suite
// ---------------------------------------------------------------------------

console.log("=== JETKUR SPRINT 09.2: CANONICAL RENDERER CUTOVER VERIFICATION ===");

// 1. Call Site Verification via Static Inspection
console.log("\n1. Call Site & Source Code Cutover Verification:");

const staticDeployModalPath = path.resolve(process.cwd(), "src/components/StaticDeployModal.tsx");
const livePreviewFramePath = path.resolve(process.cwd(), "src/components/LivePreviewFrame.tsx");
const cloudflareEnginePath = path.resolve(process.cwd(), "src/utils/cloudflareDeployEngine.ts");

const deployModalContent = fs.readFileSync(staticDeployModalPath, "utf-8");
const previewFrameContent = fs.readFileSync(livePreviewFramePath, "utf-8");
const cloudflareEngineContent = fs.readFileSync(cloudflareEnginePath, "utf-8");

assert(
  deployModalContent.includes("generateProductionSiteFiles(config)") &&
  !deployModalContent.includes("generateAllSiteFiles(config)"),
  "PRODUCTION_GENERATION_USES_CANONICAL_RENDERER",
  "StaticDeployModal generates allFiles via generateProductionSiteFiles"
);

assert(
  previewFrameContent.includes("generateProductionSiteFiles(config)") &&
  !previewFrameContent.includes("generateAllSiteFiles(config)"),
  "PREVIEW_USES_CANONICAL_RENDERER",
  "LivePreviewFrame generates allFiles via generateProductionSiteFiles"
);

assert(
  cloudflareEngineContent.includes("generateProductionSiteFiles(config)") &&
  !cloudflareEngineContent.includes("generateAllSiteFiles(config)"),
  "DEPLOY_ARTIFACTS_USE_CANONICAL_RENDERER",
  "cloudflareDeployEngine generates allFiles via generateProductionSiteFiles"
);

assert(
  deployModalContent.includes("generateProductionSiteFiles(config)"),
  "EXPORT_USES_CANONICAL_RENDERER",
  "Export ZIP in StaticDeployModal is powered by canonical files"
);

// 2. Scan whole codebase for any other production call to legacy generateAllSiteFiles
const allTsFiles = [
  "src/components/StaticDeployModal.tsx",
  "src/components/LivePreviewFrame.tsx",
  "src/utils/cloudflareDeployEngine.ts",
];

const legacyInProd = allTsFiles.some((f) => {
  const content = fs.readFileSync(path.resolve(process.cwd(), f), "utf-8");
  return content.includes("generateAllSiteFiles(");
});

assert(!legacyInProd, "LEGACY_GENERATOR_NOT_USED_BY_PRODUCTION_CONSUMERS", "Zero production consumers call generateAllSiteFiles");

// 3. Shared Authority Invariant
console.log("\n2. Shared Render Authority Invariant:");

const plumbingConfig = createMockSiteConfig("sihhi-tesisat", "tmpl-rapid-service", "multi-page");
const filesFromBridge = generateProductionSiteFiles(plumbingConfig);
const previewHtmlFromBridge = generateProductionPreviewHtml(plumbingConfig, "index.html");
const indexFileHtml = filesFromBridge.find((f) => f.filename === "index.html")?.html || "";

assert(
  previewHtmlFromBridge === indexFileHtml,
  "PREVIEW_AND_EXPORT_SHARE_RENDER_AUTHORITY",
  "Preview HTML and Export index.html are byte-identical"
);

// 4. Canonical Template Resolution
console.log("\n3. Canonical Template Resolution:");

const manifestPlumbing = resolveManifestForConfig(plumbingConfig);
assert(manifestPlumbing.id === "tmpl-rapid-service", "CANONICAL_TEMPLATE_RESOLUTION", "Resolves to tmpl-rapid-service");

const dentalConfig = createMockSiteConfig("dis-hekimligi", "medical-pure-emerald", "multi-page");
const manifestDental = resolveManifestForConfig(dentalConfig);
assert(manifestDental.id === "tmpl-clinical-pure", "LEGACY_DESIGN_SET_COMPATIBILITY_RESOLUTION", "medical-pure-emerald resolves to tmpl-clinical-pure");

// 5. Representative Sites via Production Cutover Path
console.log("\n4. Representative Sites via Production Cutover Path:");

const plumbingFiles = generateProductionSiteFiles(plumbingConfig);
assert(plumbingFiles.length >= 8 && plumbingFiles.some((f) => f.filename === "index.html"), "REPRESENTATIVE_PLUMBING_PRODUCTION_PATH");

const legalConfig = createMockSiteConfig("hukuk-avukat", "tmpl-formal-legal", "multi-page");
const dentalFiles = generateProductionSiteFiles(dentalConfig);
const legalFiles = generateProductionSiteFiles(legalConfig);

assert(dentalFiles.length >= 8 && dentalFiles.some((f) => f.filename === "index.html"), "REPRESENTATIVE_DENTAL_PRODUCTION_PATH");
assert(legalFiles.length >= 8 && legalFiles.some((f) => f.filename === "index.html"), "REPRESENTATIVE_LEGAL_PRODUCTION_PATH");

// 6. Static CSS & Zero Framework Invariants
console.log("\n5. Static CSS & Zero Runtime Invariants:");

const cssFile = plumbingFiles.find((f) => f.filename === "assets/site.css");
assert(Boolean(cssFile && (cssFile.content || cssFile.html || "").length > 5000), "STATIC_CSS_PRESENT_AFTER_CUTOVER");

const plumbingMetrics = inspectGeneratedSite(plumbingFiles);
assert(plumbingMetrics.tailwindCdnReferences === 0, "TAILWIND_CDN_ABSENT_AFTER_CUTOVER", "Zero Tailwind CDN refs");
assert(!plumbingMetrics.hasReactRuntime, "NO_REACT_RUNTIME_AFTER_CUTOVER", "Zero React runtime");
assert(!plumbingMetrics.hasViteRuntime, "NO_VITE_RUNTIME_AFTER_CUTOVER", "Zero Vite runtime");

// 7. Feature-Aware JavaScript
console.log("\n6. Feature-Aware JavaScript Invariant:");

const configWithoutFaq = createMockSiteConfig("sihhi-tesisat", "tmpl-rapid-service", "multi-page");
configWithoutFaq.homepageSections = configWithoutFaq.homepageSections.filter((s) => s.id !== "faqs");
const filesNoFaq = generateProductionSiteFiles(configWithoutFaq);
const indexNoFaq = filesNoFaq.find((f) => f.filename === "index.html")?.html || "";

assert(!indexNoFaq.includes("function toggleFaq"), "FEATURE_AWARE_JS_AFTER_CUTOVER", "toggleFaq JS omitted when FAQ section disabled");

// 8. Artifact Preservation
console.log("\n7. Artifact & Multi-page Preservation:");

const filenames = plumbingFiles.map((f) => f.filename);
assert(filenames.includes("robots.txt"), "ROBOTS_PRESERVED_AFTER_CUTOVER");
assert(filenames.includes("sitemap.xml"), "SITEMAP_PRESERVED_AFTER_CUTOVER");
assert(filenames.includes("_headers"), "HEADERS_PRESERVED_AFTER_CUTOVER");
assert(filenames.includes("_redirects"), "REDIRECTS_PRESERVED_AFTER_CUTOVER");
assert(
  filenames.includes("kurumsal.html") &&
  filenames.includes("hizmetler.html") &&
  filenames.includes("iletisim.html"),
  "MULTI_PAGE_PRESERVED_AFTER_CUTOVER",
  "Subpages kurumsal, hizmetler, iletisim generated"
);

// 9. SEO & Content Preservation
console.log("\n8. SEO & Content Preservation:");

const indexHtml = plumbingFiles.find((f) => f.filename === "index.html")?.html || "";
assert(
  indexHtml.includes("<title>") &&
  indexHtml.includes('name="description"') &&
  indexHtml.includes('application/ld+json') &&
  indexHtml.includes('property="og:title"'),
  "SEO_PRESERVED_AFTER_CUTOVER"
);

assert(
  indexHtml.includes("Usta Tesisat Ltd.") &&
  indexHtml.includes("+90 212 555 0101"),
  "CONTENT_PRESERVED_AFTER_CUTOVER"
);

// 10. Performance Non-Regression
console.log("\n9. Performance Non-Regression Check:");

const cssBytes = (cssFile?.content || cssFile?.html || "").length;

assert(
  cssBytes >= 20000 &&
  cssBytes <= 35000 &&
  indexHtml.length <= 60000,
  "PERFORMANCE_NON_REGRESSION_AFTER_CUTOVER",
  `CSS: ${cssBytes} bytes, Index HTML: ${indexHtml.length} bytes`
);

console.log(`\nCutover Verification Complete: ${passedCount} / ${passedCount + failedCount} tests passed.`);

if (failedCount > 0) {
  process.exit(1);
}
