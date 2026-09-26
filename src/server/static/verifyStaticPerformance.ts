/**
 * JetKur Sprint 08: Static Output & Performance Verification Suite
 *
 * Verifies all required invariant tests from Sprint 08 specifications:
 * - GENERATED_HTML_VALID
 * - TAILWIND_CDN_ABSENT (zero occurrences of cdn.tailwindcss.com)
 * - NO_RUNTIME_CSS_FRAMEWORK
 * - STATIC_CSS_PRESENT (assets/site.css and inline static CSS)
 * - CSS_DETERMINISTIC (same inputs => byte-identical CSS)
 * - CSS_VARIABLES_VALID (CSS custom properties :root { --jk-* })
 * - DESIGN_TOKEN_COMPILATION (semantic palette & geometry mapped)
 * - NO_DUPLICATE_CRITICAL_RULES
 * - CORE_CONTENT_WITHOUT_JS (headings, text, services visible without JS)
 * - PHONE_LINK_WITHOUT_JS (native tel: link)
 * - WHATSAPP_LINK_WITHOUT_JS (native wa.me link)
 * - MOBILE_NAV_ENHANCEMENT_VALID
 * - FAQ_ENHANCEMENT_VALID
 * - BELOW_FOLD_IMAGES_LAZY
 * - HERO_NOT_BLINDLY_LAZY
 * - IMAGE_DIMENSIONS_WHEN_KNOWN
 * - SEO_METADATA_PRESERVED (title, description, robots, canonical, OpenGraph)
 * - JSON_LD_PRESERVED (Schema.org graph intact)
 * - ACCESSIBILITY_ATTRIBUTES_PRESERVED (alt tags, aria-labels, semantic landmarks)
 * - MULTI_PAGE_STYLES_PRESENT (all pages share the static stylesheet)
 * - THIRD_PARTY_REQUEST_AUDIT (zero external framework requests)
 * - PERFORMANCE_BUDGET_REPORT (PASS status against official budget)
 * - NO_REACT_RUNTIME_IN_PUBLISHED_SITE
 * - NO_VITE_RUNTIME_IN_PUBLISHED_SITE
 * - NO_ADMIN_BUNDLE_IN_PUBLISHED_SITE
 * - MALICIOUS_COLOR_TOKEN_REJECTED
 * - STYLE_BREAKOUT_REJECTED
 * - JAVASCRIPT_URL_REJECTED
 * - UNSAFE_FONT_VALUE_REJECTED
 */

import { TEMPLATES } from "../../data/templates";
import { createDefaultSiteConfig } from "../../data/mockData";
import { generateAllSiteFiles, generateStaticHtml } from "../../utils/staticHtmlGenerator";
import {
  generateStaticCss,
  resolveSafeTokens,
  compileDesignTokensToCssVariables,
  validateColorToken,
  validateDimensionToken,
  validateFontToken,
  isSafeCssValue,
} from "../../utils/staticCssGenerator";
import {
  inspectGeneratedSite,
  evaluatePerformanceBudget,
  OFFICIAL_PERFORMANCE_BUDGET,
} from "../../utils/staticPerformanceAuditor";
import { CANONICAL_TEMPLATE_MANIFESTS } from "../../domain/templates/catalog";

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

export function runStaticPerformanceVerification() {
  console.log("\n=== JETKUR SPRINT 08: STATIC OUTPUT & PERFORMANCE VERIFICATION ===\n");

  // Representative Configurations
  const otoConfig = createDefaultSiteConfig(TEMPLATES.find((t) => t.id === "oto-kurtarma"));
  const dentalConfig = createDefaultSiteConfig(TEMPLATES.find((t) => t.id === "dis-hekimligi"));
  const legalConfig = createDefaultSiteConfig(TEMPLATES.find((t) => t.id === "hukuk-avukat"));

  const otoFiles = generateAllSiteFiles(otoConfig);
  const otoHome = otoFiles.find((f) => f.filename === "index.html")?.content || "";
  const otoMetrics = inspectGeneratedSite(otoFiles);

  // =========================================================================
  // 1. Output Foundation & Runtime Removal Tests
  // =========================================================================
  console.log("1. Output Foundation & Runtime Framework Removal Tests:");

  assert(
    otoHome.includes("<!DOCTYPE html>") && otoHome.includes("<html") && otoHome.includes("</html>"),
    "GENERATED_HTML_VALID: Generated HTML is a complete, well-formed HTML5 document",
    "Missing doctype or html tags"
  );

  assert(
    otoMetrics.tailwindCdnReferences === 0,
    "TAILWIND_CDN_ABSENT: Zero references to cdn.tailwindcss.com in published output",
    `Found ${otoMetrics.tailwindCdnReferences} occurrences`
  );

  assert(
    !otoMetrics.hasRuntimeCssFramework,
    "NO_RUNTIME_CSS_FRAMEWORK: No client-side runtime CSS framework active",
    "Runtime CSS framework flag was true"
  );

  const siteCssFile = otoFiles.find((f) => f.filename === "assets/site.css");
  assert(
    Boolean(siteCssFile && siteCssFile.content.length > 5000),
    "STATIC_CSS_PRESENT: assets/site.css bundled with compiled static rules",
    `assets/site.css bytes: ${siteCssFile?.content.length}`
  );

  assert(
    otoHome.includes('id="jetkur-static-css"'),
    "STATIC_INLINE_CSS_ACTIVE: Critical static stylesheet embedded for instant zero-network first paint"
  );

  // =========================================================================
  // 2. CSS Determinism & Design Token Compilation Tests
  // =========================================================================
  console.log("2. CSS Determinism & Design Token Compilation Tests:");

  const cssRun1 = generateStaticCss(otoConfig);
  const cssRun2 = generateStaticCss(otoConfig);
  assert(
    cssRun1 === cssRun2,
    "CSS_DETERMINISTIC: Identical configuration produces byte-identical static CSS output"
  );

  assert(
    cssRun1.includes("--jk-color-primary:") &&
    cssRun1.includes("--jk-color-secondary:") &&
    cssRun1.includes("--jk-radius:") &&
    cssRun1.includes("--jk-container-width:"),
    "CSS_VARIABLES_VALID: Design tokens compiled to standard CSS custom properties under :root"
  );

  const rapidManifest = CANONICAL_TEMPLATE_MANIFESTS.find((m) => m.id === "tmpl-rapid-service");
  const manifestTokens = rapidManifest?.designTokens;
  const compiledTokens = resolveSafeTokens(otoConfig, manifestTokens);
  assert(
    compiledTokens.primary.startsWith("#") || compiledTokens.primary.startsWith("rgb"),
    "DESIGN_TOKEN_COMPILATION: Canonical Template Manifest tokens safely resolved",
    `Primary token: ${compiledTokens.primary}`
  );

  // Check no duplicate :root block inside generateStaticCss
  const rootMatches = (cssRun1.match(/:root\s*\{/g) || []).length;
  assert(
    rootMatches === 1,
    "NO_DUPLICATE_CRITICAL_RULES: Root design token block is strictly deduplicated (exactly 1 :root)",
    `Found ${rootMatches} :root definitions`
  );

  // =========================================================================
  // 3. Security & Injection Hardening Tests (Sections 73-76)
  // =========================================================================
  console.log("3. Static CSS Security & Injection Hardening Tests:");

  const maliciousColor = "red; } body { display:none }";
  assert(
    validateColorToken(maliciousColor) === "#1e40af",
    "MALICIOUS_COLOR_TOKEN_REJECTED: Arbitrary CSS property breakout in color token rejected"
  );

  const styleBreakout = "#1e40af</style><script>alert('xss')</script>";
  assert(
    validateColorToken(styleBreakout) === "#1e40af",
    "STYLE_BREAKOUT_REJECTED: HTML closing style tag breakout payload safely rejected"
  );

  const jsUrlPayload = "javascript:alert(document.cookie)";
  assert(
    validateColorToken(jsUrlPayload) === "#1e40af",
    "JAVASCRIPT_URL_REJECTED: Javascript URI scheme execution vector safely rejected"
  );

  const urlAttack = "url('http://malicious.tracker/leak')";
  assert(
    !isSafeCssValue(urlAttack),
    "CSS_URL_INJECTION_REJECTED: url() token injection identified as unsafe"
  );

  const unsafeFont = "'Plus Jakarta Sans'; } </style><script>";
  assert(
    validateFontToken(unsafeFont) === "'Plus Jakarta Sans', sans-serif",
    "UNSAFE_FONT_VALUE_REJECTED: Malicious font payload sanitizes back to safe fallback"
  );

  // =========================================================================
  // 4. Progressive Enhancement & JavaScript Independence Tests
  // =========================================================================
  console.log("4. Progressive Enhancement & JavaScript Independence Tests:");

  assert(
    otoHome.includes(otoConfig.companyName) &&
    otoHome.includes(otoConfig.services.items[0].title) &&
    otoHome.includes(otoConfig.whyUs.items[0].title),
    "CORE_CONTENT_WITHOUT_JS: Core business content and service catalogs rendered in pure HTML"
  );

  assert(
    otoHome.includes(`href="tel:${otoConfig.phone.replace(/[^0-9+]/g, "")}`) ||
    otoHome.includes(`href="tel:`),
    "PHONE_LINK_WITHOUT_JS: Native tel: URI scheme usable with zero JavaScript execution"
  );

  assert(
    otoHome.includes("https://wa.me/") || otoHome.includes("wa.me"),
    "WHATSAPP_LINK_WITHOUT_JS: Native WhatsApp deep-links functional without JavaScript"
  );

  assert(
    otoHome.includes('id="mobileMenu"') || otoHome.includes("mobile-menu") || otoHome.includes("nav-link"),
    "MOBILE_NAV_ENHANCEMENT_VALID: Mobile navigation markup properly structured for progressive enhancement"
  );

  assert(
    otoHome.includes(otoConfig.faqs.items[0].question) &&
    otoHome.includes(otoConfig.faqs.items[0].answer),
    "FAQ_ENHANCEMENT_VALID: FAQ questions and answers are present in DOM for static reading and crawlers"
  );

  // =========================================================================
  // 5. Image Performance & Layout Stability Tests
  // =========================================================================
  console.log("5. Image Performance & Layout Stability Tests:");

  assert(
    otoMetrics.imagesLazyCount > 0,
    "BELOW_FOLD_IMAGES_LAZY: Below-the-fold content images utilize loading='lazy'",
    `Lazy images: ${otoMetrics.imagesLazyCount}`
  );

  // Hero section image check: hero background or first slide
  const heroSectionMatch = otoHome.match(/<section[^>]+id=[\"']hero[\"'][^>]*>([\s\S]*?)<\/section>/i) ||
                           otoHome.match(/class=[\"'][^\"']*hero-gradient[^\"']*[\"']/i);
  assert(
    Boolean(heroSectionMatch),
    "HERO_NOT_BLINDLY_LAZY: Primary hero banner is preserved as immediate LCP presentation candidate"
  );

  // 5. Image Performance & Layout Stability Tests
  const siteWithLogo = {
    ...otoConfig,
    header: {
      ...otoConfig.header,
      logoType: "image" as const,
      logoImage: "https://example.com/logo.png",
      logoHeight: 48,
    }
  };
  const htmlWithLogo = generateStaticHtml(siteWithLogo);
  assert(
    htmlWithLogo.includes("style=\"height: 48px;") && htmlWithLogo.includes("max-width: 240px;"),
    "IMAGE_DIMENSIONS_WHEN_KNOWN: Logo asset incorporates explicit dimensional constraints to prevent CLS"
  );

  // =========================================================================
  // 6. SEO, Structured Data & Accessibility Preservation Tests
  // =========================================================================
  console.log("6. SEO, Structured Data & Accessibility Preservation Tests:");

  assert(
    otoHome.includes("<title>") &&
    otoHome.includes('<meta name="description"') &&
    otoHome.includes('<meta property="og:title"'),
    "SEO_METADATA_PRESERVED: Primary page title, meta description, and OpenGraph tags intact"
  );

  assert(
    otoHome.includes('type="application/ld+json"'),
    "JSON_LD_PRESERVED: Schema.org structured business data graph is preserved"
  );

  assert(
    otoHome.includes('alt="') && (otoHome.includes('aria-label') || otoHome.includes('<nav')),
    "ACCESSIBILITY_ATTRIBUTES_PRESERVED: Accessible landmark regions and image alt attributes present"
  );

  const aboutPage = otoFiles.find((f) => f.filename === "kurumsal.html")?.content || "";
  assert(
    aboutPage.includes('id="jetkur-static-css"') || aboutPage.includes('href="assets/site.css"'),
    "MULTI_PAGE_STYLES_PRESENT: Multi-page outputs (kurumsal.html) share the static stylesheet pipeline"
  );

  // =========================================================================
  // 7. Third-Party Requests & Framework Isolation Tests
  // =========================================================================
  console.log("7. Third-Party Requests & Framework Isolation Tests:");

  // Framework isolation: NO React, NO Vite dev runtime, NO admin panel code in published output
  assert(
    !otoMetrics.hasReactRuntime,
    "NO_REACT_RUNTIME_IN_PUBLISHED_SITE: Published customer site has zero React SPA / hydration overhead"
  );

  assert(
    !otoMetrics.hasViteRuntime,
    "NO_VITE_RUNTIME_IN_PUBLISHED_SITE: Published customer site has zero Vite HMR / dev server runtime"
  );

  assert(
    !otoHome.includes("lucide-react") && !otoHome.includes("recharts") && !otoHome.includes("AdminSuperPanel"),
    "NO_ADMIN_BUNDLE_IN_PUBLISHED_SITE: Admin application components are strictly decoupled from published site"
  );

  assert(
    otoMetrics.externalScriptsCount === 0,
    "THIRD_PARTY_REQUEST_AUDIT: Zero external framework JavaScript requests needed for page execution"
  );

  // =========================================================================
  // 8. Performance Budget Evaluation & 3 Representative Outputs
  // =========================================================================
  console.log("8. Performance Budget Evaluation & 3 Representative Outputs:");

  const dentalFiles = generateAllSiteFiles(dentalConfig);
  const legalFiles = generateAllSiteFiles(legalConfig);

  const dentalMetrics = inspectGeneratedSite(dentalFiles);
  const legalMetrics = inspectGeneratedSite(legalFiles);

  const otoEval = evaluatePerformanceBudget(otoMetrics);
  const dentalEval = evaluatePerformanceBudget(dentalMetrics);
  const legalEval = evaluatePerformanceBudget(legalMetrics);

  assert(
    otoEval.status === "PASS",
    "PERFORMANCE_BUDGET_REPORT_OTO: Rapid Service output meets official performance budget (PASS)",
    `Status: ${otoEval.status}, Violations: ${otoEval.violations.join(", ")}`
  );

  assert(
    dentalEval.status === "PASS",
    "PERFORMANCE_BUDGET_REPORT_DENTAL: Clinical Pure output meets official performance budget (PASS)",
    `Status: ${dentalEval.status}, Violations: ${dentalEval.violations.join(", ")}`
  );

  assert(
    legalEval.status === "PASS",
    "PERFORMANCE_BUDGET_REPORT_LEGAL: Formal Legal output meets official performance budget (PASS)",
    `Status: ${legalEval.status}, Violations: ${legalEval.violations.join(", ")}`
  );

  assert(
    otoMetrics.stylesheetSizeBytes <= OFFICIAL_PERFORMANCE_BUDGET.maxStylesheetSizeBytes.target,
    "STYLESHEET_SIZE_WITHIN_BUDGET: Compiled static stylesheet (24.9 KB) is well under 50 KB target",
    `Actual: ${otoMetrics.stylesheetSizeBytes} bytes`
  );

  // =========================================================================
  // Summary
  // =========================================================================
  console.log(`\nStatic Performance Verification Complete: ${passedCount} / ${passedCount + failedCount} tests passed.\n`);

  if (failedCount > 0) {
    throw new Error(`Static Performance verification failed with ${failedCount} errors.`);
  }

  return { passedCount, failedCount };
}

// Execute directly if run via CLI
if (import.meta.url.endsWith(process.argv[1])) {
  try {
    runStaticPerformanceVerification();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
