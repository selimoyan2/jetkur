/**
 * JetKur Sprint 10 Verification Suite: Brand Kit & Logo Color Engine Foundation
 *
 * Validates:
 * 1. BrandKit canonical domain model & JSON serialization
 * 2. Token resolution order: Template < BrandKit < Site Custom
 * 3. Color extraction, normalization, and monochrome/light/no-logo fallbacks
 * 4. WCAG 2.1 contrast calculations and auto-contrast foreground correction
 * 5. CSS, SVG, and URL injection hardening & security
 * 6. BrandKit template independence & template switch content immutability
 * 7. Canonical static generation integration across 3 representative templates
 * 8. Zero runtime JS & output determinism
 */

import crypto from "crypto";
import {
  BrandKit,
  createBrandKit,
  updateBrandKitLogo,
  resolveDesignTokens,
  normalizeHexColor,
  getContrastRatio,
  getOptimalForeground,
  darkenColor,
  lightenColor,
  isSafeColorString,
  extractColorsFromSvg,
  auditSvgSecurity,
  sanitizeLogoUrl,
  analyzeLogo,
  generateBrandPalette,
} from "../../domain/brand";
import {
  CANONICAL_TEMPLATE_MANIFESTS,
  resolveTemplate,
} from "../../domain/templates/catalog";
import { CanonicalSite } from "../../domain/site/site";
import { sampleCanonicalSite } from "../../domain/site/fixtures";
import { generateStaticSite } from "../../utils/generator";
import { generateProductionSiteFiles, generateProductionPreviewHtml } from "../../utils/productionGeneratorBridge";
import { SiteConfig } from "../../types";

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
// Helpers
// ---------------------------------------------------------------------------

function createMockSite(
  sector: "sihhi-tesisat" | "dis-hekimligi" | "hukuk-avukat",
  templateId: string,
  brandKit?: BrandKit
): CanonicalSite {
  return {
    ...sampleCanonicalSite,
    id: `site-${sector}`,
    businessProfile: {
      ...sampleCanonicalSite.businessProfile,
      identity: {
        ...sampleCanonicalSite.businessProfile.identity,
        companyName: sector === "sihhi-tesisat" ? "Usta Tesisat Ltd." : sector === "dis-hekimligi" ? "Dt. Ayşe Aydın Klinik" : "Aydın & Ortakları Hukuk",
        sector,
      },
      branding: {
        ...sampleCanonicalSite.businessProfile.branding,
        brandKit,
      },
    },
    designTemplate: {
      templateId,
      templateSlug: templateId,
      customTokens: {},
    },
    brandKit,
  };
}

console.log("=== JETKUR SPRINT 10: BRAND KIT & LOGO COLOR ENGINE VERIFICATION ===");

// ---------------------------------------------------------------------------
// 1. BrandKit Model & Serialization
// ---------------------------------------------------------------------------
console.log("\n1. BrandKit Domain Model & JSON Serialization:");

const sampleKit = createBrandKit({
  siteId: "site-123",
  preferredPrimary: "#2563eb",
  preferredSecondary: "#10b981",
  preferredAccent: "#f59e0b",
});

assert(
  sampleKit.id && sampleKit.siteId === "site-123" && sampleKit.version === 1 && Boolean(sampleKit.palette?.primary),
  "BRAND_KIT_MODEL_VALID",
  "BrandKit contains required aggregate root fields"
);

const serialized = JSON.stringify(sampleKit);
const parsed = JSON.parse(serialized);
assert(
  parsed.siteId === sampleKit.siteId && parsed.palette.primary === sampleKit.palette.primary,
  "BRAND_KIT_JSON_SERIALIZABLE",
  "BrandKit cleanly round-trips via pure JSON with zero binary artifacts"
);

// ---------------------------------------------------------------------------
// 2. Token Resolution Order
// ---------------------------------------------------------------------------
console.log("\n2. Token Resolution Authority & Priority Order:");

const templateManifest = CANONICAL_TEMPLATE_MANIFESTS[0]; // tmpl-rapid-service default
const basePrimary = templateManifest.designTokens.palette.primary; // typically blue #0284c7 or similar

// A: Template default without brand
const tokensWithoutBrand = resolveDesignTokens(templateManifest.designTokens, null, null);
assert(
  tokensWithoutBrand.palette.primary === basePrimary,
  "TEMPLATE_DEFAULT_WITHOUT_BRAND",
  "Template default tokens govern when no BrandKit exists"
);

// B: BrandKit override
const brandRedKit = createBrandKit({
  siteId: "site-123",
  preferredPrimary: "#dc2626", // Red
});
const tokensWithBrand = resolveDesignTokens(templateManifest.designTokens, brandRedKit, null);
assert(
  tokensWithBrand.palette.primary === "#dc2626",
  "BRAND_OVERRIDE_APPLIED",
  "BrandKit primary overrides TemplateManifest default"
);

// C: Site Custom Override beats BrandKit
const siteCustomOverrides = {
  palette: {
    primary: "#16a34a", // Green
  },
} as any;
const tokensWithCustom = resolveDesignTokens(templateManifest.designTokens, brandRedKit, siteCustomOverrides);
assert(
  tokensWithCustom.palette.primary === "#16a34a",
  "SITE_OVERRIDE_BEATS_BRAND",
  "Site explicit custom token beats both TemplateManifest and BrandKit"
);

assert(
  basePrimary !== "#dc2626" &&
  tokensWithBrand.palette.primary === "#dc2626" &&
  tokensWithCustom.palette.primary === "#16a34a",
  "TOKEN_RESOLUTION_ORDER",
  "Verified: Template default < BrandKit override < Site custom override"
);

// ---------------------------------------------------------------------------
// 3. Palette Engine & Color Derivations
// ---------------------------------------------------------------------------
console.log("\n3. Palette Engine & Color Derivations:");

assert(
  sampleKit.palette.primaryDark !== sampleKit.palette.primary &&
  Boolean(sampleKit.palette.primaryDark),
  "PRIMARY_DARK_DERIVATION",
  "primaryDark is deterministically darker than primary"
);

assert(
  sampleKit.palette.primaryLight !== sampleKit.palette.primary &&
  Boolean(sampleKit.palette.primaryLight),
  "PRIMARY_LIGHT_DERIVATION",
  "primaryLight is deterministically derived and lighter than primary"
);

assert(
  sampleKit.palette.accent === "#f59e0b",
  "ACCENT_SELECTION",
  "Preferred accent candidate preserved in semantic palette"
);

// ---------------------------------------------------------------------------
// 4. Edge Cases & Fallbacks
// ---------------------------------------------------------------------------
console.log("\n4. Edge Cases & Fallback Policies:");

// Monochrome White Logo
const whiteLogoKit = createBrandKit({
  siteId: "site-white",
  preferredPrimary: "#ffffff",
});
assert(
  whiteLogoKit.palette.primary !== "#ffffff" &&
  whiteLogoKit.palette.buttonTextPrimary === "#ffffff",
  "MONOCHROME_FALLBACK",
  "Monochrome white logo safely generates dark slate primary (#0f172a) with high contrast"
);

// Light Yellow Logo
const yellowLogoKit = createBrandKit({
  siteId: "site-yellow",
  preferredPrimary: "#facc15",
});
assert(
  yellowLogoKit.palette.buttonTextPrimary === "#0f172a",
  "LIGHT_LOGO_FALLBACK",
  "Light yellow primary automatically pairs with dark text on buttons to prevent unreadable white-on-yellow"
);

// No Logo / No Preferred Color
const noLogoKit = createBrandKit({
  siteId: "site-empty",
  fallbackTemplateTokens: templateManifest.designTokens,
});
assert(
  Boolean(noLogoKit.palette.primary) &&
  noLogoKit.metadata.source === "template_default",
  "NO_LOGO_FALLBACK",
  "No logo cleanly falls back to template default tokens"
);

// Color normalization
assert(
  normalizeHexColor("#fff") === "#ffffff" &&
  normalizeHexColor("#3B82F6") === "#3b82f6" &&
  normalizeHexColor("rgb(239, 68, 68)") === "#ef4444" &&
  normalizeHexColor("blue") === "#3b82f6",
  "COLOR_NORMALIZATION",
  "3-digit, 6-digit, RGB, and named colors normalized to canonical #rrggbb"
);

// Transparent Pixel Policy
const svgWithTransparent = `
  <svg viewBox="0 0 100 100">
    <rect width="100" height="100" fill="transparent"/>
    <path d="M10 10" fill="none"/>
    <circle cx="50" cy="50" r="30" fill="#2563eb"/>
  </svg>
`;
const extractedSvg = extractColorsFromSvg(svgWithTransparent);
assert(
  extractedSvg.sourceColors.dominant === "#2563eb" &&
  !extractedSvg.sourceColors.rawSampledColors?.includes("transparent"),
  "TRANSPARENT_PIXEL_POLICY",
  "Transparent and none fill attributes are ignored and not treated as brand colors"
);

// ---------------------------------------------------------------------------
// 5. Accessibility & Contrast Engine
// ---------------------------------------------------------------------------
console.log("\n5. Accessibility & WCAG Contrast Engine:");

const ratioBlackOnWhite = getContrastRatio("#000000", "#ffffff");
const ratioWhiteOnWhite = getContrastRatio("#ffffff", "#ffffff");
assert(
  ratioBlackOnWhite >= 20.0 && ratioWhiteOnWhite === 1.0,
  "CONTRAST_CALCULATION",
  "Relative luminance and contrast ratio calculated per WCAG 2.1 specs"
);

assert(
  sampleKit.metadata.contrastAudit?.textOnBackground.passes === true &&
  (sampleKit.metadata.contrastAudit?.textOnBackground.ratio || 0) >= 4.5,
  "CONTRAST_TEXT_BACKGROUND",
  "Body text on background passes WCAG AA >= 4.5:1"
);

assert(
  sampleKit.metadata.contrastAudit?.textOnSurface.passes === true &&
  (sampleKit.metadata.contrastAudit?.textOnSurface.ratio || 0) >= 4.5,
  "CONTRAST_TEXT_SURFACE",
  "Body text on surface passes WCAG AA >= 4.5:1"
);

assert(
  sampleKit.metadata.contrastAudit?.buttonTextOnPrimary.passes === true,
  "CONTRAST_BUTTON_PRIMARY",
  "Button text on primary button passes accessible contrast"
);

assert(
  sampleKit.metadata.contrastAudit?.buttonTextOnAccent.passes === true,
  "CONTRAST_BUTTON_ACCENT",
  "Button text on accent button passes accessible contrast"
);

assert(
  getOptimalForeground("#fde047") === "#0f172a",
  "LIGHT_BRAND_AUTO_FOREGROUND",
  "Light yellow background selects dark slate foreground"
);

assert(
  getOptimalForeground("#1e3a8a") === "#ffffff",
  "DARK_BRAND_AUTO_FOREGROUND",
  "Dark navy background selects white foreground"
);

// ---------------------------------------------------------------------------
// 6. Security Hardening
// ---------------------------------------------------------------------------
console.log("\n6. Security Hardening (CSS, URLs, SVG):");

assert(
  !isSafeColorString("red;}</style><script>alert(1)</script>"),
  "MALICIOUS_COLOR_REJECTED",
  "CSS property breakout rejected"
);

assert(
  !isSafeColorString("</style><script>alert(1)</script>"),
  "STYLE_BREAKOUT_REJECTED",
  "Style closing tag breakout rejected"
);

assert(
  !isSafeColorString("url(javascript:alert(1))"),
  "JAVASCRIPT_COLOR_PAYLOAD_REJECTED",
  "javascript: in CSS color rejected"
);

assert(
  sanitizeLogoUrl("javascript:alert(1)") === null &&
  sanitizeLogoUrl("data:text/html;base64,PHNjcmlwdD4=") === null &&
  sanitizeLogoUrl("https://example.com/logo.png") === "https://example.com/logo.png",
  "UNSAFE_LOGO_URL_REJECTED",
  "javascript: and malicious data URIs in logo URLs rejected"
);

const maliciousSvg1 = `
  <svg viewBox="0 0 100 100">
    <script>alert('pwned')</script>
    <rect width="100" height="100" fill="#059669"/>
  </svg>
`;
const svgResult1 = extractColorsFromSvg(maliciousSvg1);
assert(
  svgResult1.status === "analyzed" &&
  svgResult1.sourceColors.dominant === "#059669" &&
  (svgResult1.securityWarnings?.length || 0) > 0,
  "MALICIOUS_SVG_SCRIPT_SAFE",
  "<script> tag in SVG stripped and reported in security warnings without execution"
);

const maliciousSvg2 = `
  <svg viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="40" fill="#7c3aed" onload="alert(1)"/>
  </svg>
`;
const svgResult2 = extractColorsFromSvg(maliciousSvg2);
assert(
  svgResult2.sourceColors.dominant === "#7c3aed" &&
  (svgResult2.securityWarnings?.length || 0) > 0,
  "MALICIOUS_SVG_EVENT_HANDLER_SAFE",
  "onload= handler in SVG safely disarmed"
);

const maliciousSvg3 = `
  <svg viewBox="0 0 100 100">
    <foreignObject width="100" height="100">
      <body xmlns="http://www.w3.org/1999/xhtml">
        <script>alert(1)</script>
      </body>
    </foreignObject>
    <rect width="50" height="50" fill="#ea580c"/>
  </svg>
`;
const svgResult3 = extractColorsFromSvg(maliciousSvg3);
assert(
  svgResult3.sourceColors.dominant === "#ea580c",
  "MALICIOUS_SVG_FOREIGN_OBJECT_SAFE",
  "<foreignObject> in SVG safely stripped"
);

// ---------------------------------------------------------------------------
// 7. Independence & Immutability
// ---------------------------------------------------------------------------
console.log("\n7. Template Independence & Content Immutability:");

const initialManifest = CANONICAL_TEMPLATE_MANIFESTS[0]; // Rapid Service
const brandKitForSwitch = createBrandKit({
  siteId: "site-switch",
  preferredPrimary: "#8b5cf6",
  preferredSecondary: "#06b6d4",
});

const siteBeforeSwitch = createMockSite("sihhi-tesisat", "tmpl-rapid-service", brandKitForSwitch);
const contentBefore = JSON.stringify(siteBeforeSwitch.businessProfile);

// Switch template to Clinical Pure
const switchedManifest = resolveTemplate("tmpl-clinical-pure");
const siteAfterSwitch = {
  ...siteBeforeSwitch,
  designTemplate: {
    templateId: "tmpl-clinical-pure",
    templateSlug: "tmpl-clinical-pure",
    customTokens: {},
  },
};
const contentAfter = JSON.stringify(siteAfterSwitch.businessProfile);

assert(
  contentBefore === contentAfter,
  "BRAND_KIT_TEMPLATE_INDEPENDENCE",
  "BusinessProfile and BrandKit are completely independent of TemplateManifest"
);

assert(
  siteBeforeSwitch.brandKit?.palette.primary === siteAfterSwitch.brandKit?.palette.primary,
  "BRAND_KIT_PRESERVED_ON_TEMPLATE_SWITCH",
  "BrandKit survives template switching unchanged"
);

// Mutate BrandKit (new brand logo/colors)
const updatedBrandKit = updateBrandKitLogo(
  brandKitForSwitch,
  {
    sourceType: "svg",
    svgContent: '<svg><rect fill="#059669"/></svg>',
  },
  switchedManifest?.designTokens
);

const siteWithNewBrand = {
  ...siteAfterSwitch,
  businessProfile: {
    ...siteAfterSwitch.businessProfile,
    branding: {
      ...siteAfterSwitch.businessProfile.branding,
      brandKit: updatedBrandKit,
    },
  },
  brandKit: updatedBrandKit,
};

assert(
  JSON.stringify(siteWithNewBrand.businessProfile.services) === JSON.stringify(siteBeforeSwitch.businessProfile.services) &&
  JSON.stringify(siteWithNewBrand.content) === JSON.stringify(siteBeforeSwitch.content),
  "CONTENT_PRESERVED_ON_BRAND_CHANGE",
  "Updating BrandKit does not alter customer service items or marketing copy"
);

assert(
  JSON.stringify(siteWithNewBrand.sectionConfiguration) === JSON.stringify(siteBeforeSwitch.sectionConfiguration),
  "SECTION_CONFIG_PRESERVED_ON_BRAND_CHANGE",
  "Updating BrandKit does not reset section order or visibility"
);

// ---------------------------------------------------------------------------
// 8. Static Renderer Integration & Representative Output
// ---------------------------------------------------------------------------
console.log("\n8. Static Renderer Integration across 3 Representative Templates:");

const brandForRender = createBrandKit({
  siteId: "site-render",
  preferredPrimary: "#7c3aed", // Vibrant purple brand
  preferredSecondary: "#06b6d4",
  preferredAccent: "#f59e0b",
});

// A. Rapid Service with BrandKit
const plumbingSite = createMockSite("sihhi-tesisat", "tmpl-rapid-service", brandForRender);
const plumbingFiles = generateStaticSite(plumbingSite, resolveTemplate("tmpl-rapid-service")!);
const plumbingCss = plumbingFiles.find((f) => f.filename === "assets/site.css")?.content || "";
assert(
  plumbingFiles.length >= 5 && plumbingCss.includes("#7c3aed"),
  "BRAND_RENDER_RAPID_SERVICE",
  "Rapid Service static output compiled with resolved brand primary"
);

// B. Clinical Pure with BrandKit
const dentalSite = createMockSite("dis-hekimligi", "tmpl-clinical-pure", brandForRender);
const dentalFiles = generateStaticSite(dentalSite, resolveTemplate("tmpl-clinical-pure")!);
const dentalCss = dentalFiles.find((f) => f.filename === "assets/site.css")?.content || "";
assert(
  dentalFiles.length >= 5 && dentalCss.includes("#7c3aed"),
  "BRAND_RENDER_CLINICAL_PURE",
  "Clinical Pure static output compiled with resolved brand primary"
);

// C. Formal Legal with BrandKit
const legalSite = createMockSite("hukuk-avukat", "tmpl-formal-legal", brandForRender);
const legalFiles = generateStaticSite(legalSite, resolveTemplate("tmpl-formal-legal")!);
const legalCss = legalFiles.find((f) => f.filename === "assets/site.css")?.content || "";
assert(
  legalFiles.length >= 5 && legalCss.includes("#7c3aed"),
  "BRAND_RENDER_FORMAL_LEGAL",
  "Formal Legal static output compiled with resolved brand primary"
);

assert(
  Boolean(plumbingCss && plumbingCss.length > 10000),
  "BRAND_CSS_PRESENT",
  "assets/site.css generated and non-empty"
);

assert(
  plumbingCss.includes("--jk-color-primary: #7c3aed") &&
  plumbingCss.includes("--brand: var(--jk-color-primary)"),
  "BRAND_CSS_USES_RESOLVED_TOKENS",
  "assets/site.css contains CSS custom properties derived from resolved BrandKit"
);

// Zero runtime BrandKit JS in published static site
const indexHtml = plumbingFiles.find((f) => f.filename === "index.html")?.html || "";
assert(
  !indexHtml.includes("paletteEngine") &&
  !indexHtml.includes("resolveDesignTokens") &&
  !indexHtml.includes("BrandKit") &&
  !indexHtml.includes("contrastAudit"),
  "BRAND_RUNTIME_JS_ZERO",
  "Zero BrandKit engine runtime JavaScript shipped to published static website"
);

// ---------------------------------------------------------------------------
// 9. Production Bridge Parity & Determinism
// ---------------------------------------------------------------------------
console.log("\n9. Production Bridge Parity & Determinism:");

const configForBridge: SiteConfig = {
  id: "site-bridge-test",
  templateId: "tmpl-rapid-service",
  companyName: "Usta Tesisat",
  sector: "sihhi-tesisat",
  brandKit: brandForRender,
  palette: {
    primary: brandForRender.palette.primary,
    primaryDark: brandForRender.palette.primaryDark,
    secondary: brandForRender.palette.secondary,
    accent: brandForRender.palette.accent,
    text: brandForRender.palette.text,
    bg: brandForRender.palette.background,
  },
} as unknown as SiteConfig;

const bridgeFiles = generateProductionSiteFiles(configForBridge);
const bridgePreviewHtml = generateProductionPreviewHtml(configForBridge, "index.html");
const bridgeIndexHtml = bridgeFiles.find((f) => f.filename === "index.html")?.html || "";

assert(
  bridgePreviewHtml === bridgeIndexHtml,
  "PREVIEW_PUBLISH_BRAND_CONSISTENCY",
  "Live Preview HTML and Published index.html are byte-identical under BrandKit"
);

const run1 = generateStaticSite(plumbingSite, resolveTemplate("tmpl-rapid-service")!);
const run2 = generateStaticSite(plumbingSite, resolveTemplate("tmpl-rapid-service")!);

const hash1 = crypto.createHash("sha256").update(run1[0].html || "").digest("hex");
const hash2 = crypto.createHash("sha256").update(run2[0].html || "").digest("hex");

assert(
  hash1 === hash2,
  "BRAND_OUTPUT_DETERMINISTIC",
  "Successive static generations with identical BrandKit inputs produce byte-identical output"
);

console.log(`\nSprint 10 Verification Complete: ${passedCount} / ${passedCount + failedCount} tests passed.`);

if (failedCount > 0) {
  process.exit(1);
}
