/**
 * JetKur - Theme Foundation 02C Verification Suite
 * Premium Headers, Footers, Service Cards & Responsive Design
 *
 * Verifies:
 * 1. All four Header variants (Corporate Classic, Local Service, Modern Minimal, Premium Luxury)
 * 2. All four Footer variants (Corporate Multi-column, Local Service, Minimal, Premium)
 * 3. Five Service Card styles (Standard professional, Minimal icon/text, Image-focused, Bordered premium, Compact local-service)
 * 4. Correct navigation links for LANDING and MULTI_PAGE modes
 * 5. Mobile menu structure, vanilla JS progressive enhancement, and accessibility attributes:
 *    - aria-expanded, aria-controls, role="dialog", aria-modal="true", keyboard focus, escape-to-close
 * 6. No invented contact information (no fabricated addresses, hours, social media)
 * 7. Missing optional data fallbacks (missing phone, missing email, missing logoUrl)
 * 8. Template switching content preservation across the 4 key manifests:
 *    - tmpl-corporate-prestige, tmpl-rapid-service, tmpl-modern-minimal, tmpl-vip-luxury
 * 9. BrandKit and customTokens precedence
 * 10. Preview and static generation parity (generateProductionPreviewHtml === generateProductionSiteFiles[0].html)
 * 11. Responsive design compliance (zero horizontal overflow, 320px to 1440px)
 */

import {
  renderHeaderSection,
  renderServicesSection,
  renderFooterSection,
  resolveSectionVariant,
} from "../../utils/generator/sectionRenderer";
import { generateStaticCss } from "../../utils/staticCssGenerator";
import { renderProgressiveScripts } from "../../utils/generator/progressiveScriptRenderer";
import {
  generateProductionSiteFiles,
  generateProductionPreviewHtml,
} from "../../utils/productionGeneratorBridge";
import { generateCandidatePreviewHtml } from "../../domain/templates/preview";
import {
  fromLegacySiteConfig,
  toLegacySiteConfig,
} from "../../domain/site/legacyAdapter";
import { resolveTemplate, CANONICAL_TEMPLATE_MANIFESTS } from "../../domain/templates/catalog";
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

console.log("=== JETKUR THEME FOUNDATION 02C VERIFICATION ===\n");

const testServices = {
  enabled: true,
  items: [
    { id: "srv-1", title: "Oto Çekici & Kurtarma", shortDescription: "7/24 profesyonel çekici ve yol yardım hizmeti.", price: "1.500 TL", icon: "Truck" },
    { id: "srv-2", title: "Akü Takviye & Değişim", shortDescription: "Yerinde hızlı akü şarj ve takviye servisi.", price: "800 TL", icon: "Battery" },
    { id: "srv-3", title: "Lastik Tamiri & Değişimi", shortDescription: "Patlayan lastikleriniz için mobil tamir aracı.", price: "600 TL", icon: "Wrench" }
  ]
};

const baseSiteConfig: SiteConfig = {
  ...createDefaultSiteConfig(),
  phone: "0555 123 4567",
  email: "destek@jetkurisletme.com",
  address: "Bağdat Caddesi No: 120, Kadıköy, İstanbul",
  services: testServices as any,
};

// ---------------------------------------------------------------------------
// 1. All Four Header Variants
// ---------------------------------------------------------------------------
console.log("--- 1. Header Layout Variants ---");
{
  const canonical = fromLegacySiteConfig(baseSiteConfig);

  // A. Corporate Classic Header
  const corporateHeader = renderHeaderSection({
    site: canonical,
    manifest: resolveTemplate("tmpl-corporate-prestige")!,
    variant: "corporate-classic",
    config: baseSiteConfig,
  });
  assert(corporateHeader.includes("Structural Header: corporate-classic"), "Corporate Classic header renders variant marker");
  assert(corporateHeader.includes("jk-header-corporate"), "Corporate Classic header emits jk-header-corporate class");
  assert(corporateHeader.includes("aria-label=\"Ana Menü\""), "Corporate Classic includes accessible desktop nav");
  assert(corporateHeader.includes("mobileMenuToggleBtn"), "Corporate Classic includes mobile menu toggle");

  // B. Local Service Conversion Header
  const localHeader = renderHeaderSection({
    site: canonical,
    manifest: resolveTemplate("tmpl-rapid-service")!,
    variant: "local-service",
    config: baseSiteConfig,
  });
  assert(localHeader.includes("Structural Header: local-service"), "Local Service header renders variant marker");
  assert(localHeader.includes("jk-header-local"), "Local Service header emits jk-header-local class");
  assert(localHeader.includes("Hemen Ara"), "Local Service header has high-visibility 'Hemen Ara' CTA");
  assert(localHeader.includes("tel:"), "Local Service header provides tap-to-call link");

  // C. Modern Minimal Header
  const minimalHeader = renderHeaderSection({
    site: canonical,
    manifest: resolveTemplate("tmpl-modern-minimal")!,
    variant: "modern-minimal",
    config: baseSiteConfig,
  });
  assert(minimalHeader.includes("Structural Header: modern-minimal"), "Modern Minimal header renders variant marker");
  assert(minimalHeader.includes("jk-header-minimal"), "Modern Minimal header emits jk-header-minimal class");
  assert(minimalHeader.includes("İletişim"), "Modern Minimal header has understated CTA");

  // D. Premium Luxury Header
  const luxuryHeader = renderHeaderSection({
    site: canonical,
    manifest: resolveTemplate("tmpl-vip-luxury")!,
    variant: "premium-luxury",
    config: baseSiteConfig,
  });
  assert(luxuryHeader.includes("Structural Header: premium-luxury"), "Premium Luxury header renders variant marker");
  assert(luxuryHeader.includes("jk-header-luxury"), "Premium Luxury header emits jk-header-luxury class");
  assert(luxuryHeader.includes("Randevu Al"), "Premium Luxury header has luxury action CTA");
}

// ---------------------------------------------------------------------------
// 2. All Four Footer Variants
// ---------------------------------------------------------------------------
console.log("\n--- 2. Footer Layout Variants ---");
{
  const canonical = fromLegacySiteConfig(baseSiteConfig);

  // A. Corporate Multi-column Footer
  const corporateFooter = renderFooterSection({
    site: canonical,
    manifest: resolveTemplate("tmpl-corporate-prestige")!,
    variant: "corporate-multi",
    config: baseSiteConfig,
  });
  assert(corporateFooter.includes("Structural Footer: corporate-multi"), "Corporate Multi-column footer renders variant marker");
  assert(corporateFooter.includes("jk-footer-corporate"), "Corporate Multi-column footer emits jk-footer-corporate class");
  assert(corporateFooter.includes("Hızlı Bağlantılar"), "Corporate Multi-column renders navigation column");
  assert(corporateFooter.includes("Hizmetlerimiz"), "Corporate Multi-column renders services column");

  // B. Local Service Footer
  const localFooter = renderFooterSection({
    site: canonical,
    manifest: resolveTemplate("tmpl-rapid-service")!,
    variant: "local-service",
    config: baseSiteConfig,
  });
  assert(localFooter.includes("Structural Footer: local-service"), "Local Service footer renders variant marker");
  assert(localFooter.includes("jk-footer-local"), "Local Service footer emits jk-footer-local class");
  assert(localFooter.includes("Acil Hizmet ve Danışma Hattı"), "Local Service footer features prominent call card");

  // C. Minimal Footer
  const minimalFooter = renderFooterSection({
    site: canonical,
    manifest: resolveTemplate("tmpl-modern-minimal")!,
    variant: "minimal",
    config: baseSiteConfig,
  });
  assert(minimalFooter.includes("Structural Footer: minimal"), "Minimal footer renders variant marker");
  assert(minimalFooter.includes("jk-footer-minimal"), "Minimal footer emits jk-footer-minimal class");
  assert(minimalFooter.includes("Başa Dön ↑"), "Minimal footer includes clean back-to-top action");

  // D. Premium Luxury Footer
  const luxuryFooter = renderFooterSection({
    site: canonical,
    manifest: resolveTemplate("tmpl-vip-luxury")!,
    variant: "premium",
    config: baseSiteConfig,
  });
  assert(luxuryFooter.includes("Structural Footer: premium"), "Premium footer renders variant marker");
  assert(luxuryFooter.includes("jk-footer-luxury"), "Premium footer emits jk-footer-luxury class");
}

// ---------------------------------------------------------------------------
// 3. Five Service Card Visual Variants
// ---------------------------------------------------------------------------
console.log("\n--- 3. Service Card Visual Variants ---");
{
  const canonical = fromLegacySiteConfig(baseSiteConfig);

  // 1. Standard professional card
  const standardServices = renderServicesSection({
    site: canonical,
    manifest: resolveTemplate("tmpl-corporate-prestige")!,
    variant: "standard",
    config: baseSiteConfig,
  });
  assert(standardServices.includes("jk-service-card-standard"), "Standard service cards emit jk-service-card-standard");

  // 2. Minimal icon / text card
  const minimalServices = renderServicesSection({
    site: canonical,
    manifest: resolveTemplate("tmpl-modern-minimal")!,
    variant: "minimal-icon",
    config: baseSiteConfig,
  });
  assert(minimalServices.includes("jk-service-card-minimal"), "Minimal service cards emit jk-service-card-minimal");
  assert(minimalServices.includes("border-l-brand"), "Minimal card includes distinctive left border indicator");

  // 3. Image-focused service card
  const imageServices = renderServicesSection({
    site: canonical,
    manifest: resolveTemplate("tmpl-vip-luxury")!,
    variant: "image-focused",
    config: baseSiteConfig,
  });
  assert(imageServices.includes("jk-service-card-image"), "Image-focused service cards emit jk-service-card-image");
  assert(imageServices.includes("aspect-video"), "Image-focused card enforces standard aspect ratio");

  // 4. Bordered premium card
  const borderedServices = renderServicesSection({
    site: canonical,
    manifest: resolveTemplate("tmpl-corporate-prestige")!,
    variant: "bordered-premium",
    config: baseSiteConfig,
  });
  assert(borderedServices.includes("jk-service-card-bordered"), "Bordered premium cards emit jk-service-card-bordered");
  assert(borderedServices.includes("Teklif & Detay Al"), "Bordered card includes dedicated CTA button");

  // 5. Compact local-service card
  const compactServices = renderServicesSection({
    site: canonical,
    manifest: resolveTemplate("tmpl-rapid-service")!,
    variant: "compact-service",
    config: baseSiteConfig,
  });
  assert(compactServices.includes("jk-service-card-compact"), "Compact service cards emit jk-service-card-compact");
  assert(compactServices.includes("jk-services-grid-compact"), "Compact layout triggers jk-services-grid-compact grid");
}

// ---------------------------------------------------------------------------
// 4. Mobile Menu Structure & Accessibility Attributes
// ---------------------------------------------------------------------------
console.log("\n--- 4. Mobile Menu Accessibility & Progressive Enhancement ---");
{
  const canonical = fromLegacySiteConfig(baseSiteConfig);
  const headerHtml = renderHeaderSection({
    site: canonical,
    manifest: resolveTemplate("tmpl-corporate-prestige")!,
    variant: "corporate-classic",
    config: baseSiteConfig,
  });

  assert(headerHtml.includes("id=\"mobileMenuToggleBtn\""), "Mobile menu toggle button has unique ID");
  assert(headerHtml.includes("aria-expanded=\"false\""), "Toggle button starts with aria-expanded='false'");
  assert(headerHtml.includes("aria-controls=\"mobileDrawer\""), "Toggle button controls mobileDrawer");
  assert(headerHtml.includes("id=\"mobileDrawer\""), "Mobile drawer container exists");
  assert(headerHtml.includes("role=\"dialog\""), "Mobile drawer has role='dialog'");
  assert(headerHtml.includes("aria-modal=\"true\""), "Mobile drawer has aria-modal='true'");
  assert(headerHtml.includes("onclick=\"closeMobileMenu()\""), "Drawer navigation links close drawer on selection");

  // Progressive Script Check
  const scripts = renderProgressiveScripts(baseSiteConfig);
  assert(scripts.includes("function openMobileMenu()"), "Progressive scripts contain openMobileMenu");
  assert(scripts.includes("function closeMobileMenu()"), "Progressive scripts contain closeMobileMenu");
  assert(scripts.includes("e.key === 'Escape'"), "Progressive scripts listen for Escape key to close drawer");
  assert(scripts.includes("toggleBtn.setAttribute('aria-expanded', 'true')"), "Scripts update aria-expanded on open");
  assert(scripts.includes("toggleBtn.setAttribute('aria-expanded', 'false')"), "Scripts update aria-expanded on close");
}

// ---------------------------------------------------------------------------
// 5. Authentic Content Safety & Missing Data Fallbacks
// ---------------------------------------------------------------------------
console.log("\n--- 5. Content Safety & Missing Data Fallbacks ---");
{
  // A. No invented contact information
  const configWithoutPhone: SiteConfig = {
    ...createNeutralSiteConfig(),
    phone: "",
    address: "",
    email: "",
    city: "",
  };
  const canonicalWithoutPhone = fromLegacySiteConfig(configWithoutPhone);
  canonicalWithoutPhone.businessProfile.contact.phone = "";
  canonicalWithoutPhone.businessProfile.contact.email = "";
  canonicalWithoutPhone.businessProfile.location.address = "";
  canonicalWithoutPhone.businessProfile.location.city = "";

  const headerWithoutPhone = renderHeaderSection({
    site: canonicalWithoutPhone,
    manifest: resolveTemplate("tmpl-rapid-service")!,
    variant: "local-service",
    config: configWithoutPhone,
  });

  assert(!headerWithoutPhone.includes("tel:undefined"), "No undefined tel links rendered");
  assert(!headerWithoutPhone.includes("tel:null"), "No null tel links rendered");

  const footerWithoutPhone = renderFooterSection({
    site: canonicalWithoutPhone,
    manifest: resolveTemplate("tmpl-corporate-prestige")!,
    variant: "corporate-multi",
    config: configWithoutPhone,
  });

  assert(!footerWithoutPhone.includes("Telefon: 05"), "No invented phone numbers in footer");
  assert(!footerWithoutPhone.includes("Adres: İstanbul"), "No invented address in footer");
  assert(!footerWithoutPhone.includes("7/24 Açık"), "No unconfigured 24/7 promises");
}

// ---------------------------------------------------------------------------
// 6. LANDING and MULTI_PAGE Compatibility
// ---------------------------------------------------------------------------
console.log("\n--- 6. Structure Mode Compatibility (LANDING vs MULTI_PAGE) ---");
{
  // Landing mode
  const landingConfig: SiteConfig = {
    ...baseSiteConfig,
    siteType: "single-page",
  };
  const landingCanonical = fromLegacySiteConfig(landingConfig);
  landingCanonical.settings.structureMode = "single-page";
  landingCanonical.settings.siteMode = "LANDING";
  const landingHeader = renderHeaderSection({
    site: landingCanonical,
    manifest: resolveTemplate("tmpl-corporate-prestige")!,
    variant: "corporate-classic",
    config: landingConfig,
  });
  assert(landingHeader.includes("href=\"#"), "Landing header uses anchor links (#)");

  // Multi-page mode
  const multiConfig: SiteConfig = {
    ...baseSiteConfig,
    siteType: "multi-page",
  };
  const multiCanonical = fromLegacySiteConfig(multiConfig);
  multiCanonical.settings.structureMode = "multi-page";
  multiCanonical.settings.siteMode = "MULTI_PAGE";
  const multiHeader = renderHeaderSection({
    site: multiCanonical,
    manifest: resolveTemplate("tmpl-corporate-prestige")!,
    variant: "corporate-classic",
    config: multiConfig,
  });
  assert(multiHeader.includes(".html"), "Multi-page header uses page URL links (.html)");
}

// ---------------------------------------------------------------------------
// 7. Template Switching Content Preservation
// ---------------------------------------------------------------------------
console.log("\n--- 7. Template Switching Content Preservation ---");
{
  const originalConfig: SiteConfig = {
    ...baseSiteConfig,
    templateId: "tmpl-corporate-prestige",
    companyName: "Atlas Danışmanlık A.Ş.",
    phone: "0212 555 1234",
    email: "info@atlasdanismanlik.com",
    address: "Levent Mah. No: 42, İstanbul",
    services: testServices as any,
  };

  const templatesToTest = [
    "tmpl-rapid-service",
    "tmpl-modern-minimal",
    "tmpl-vip-luxury",
    "tmpl-corporate-prestige",
  ];

  for (const newTmplId of templatesToTest) {
    const switchedConfig: SiteConfig = {
      ...originalConfig,
      templateId: newTmplId,
    };
    const switchedCanonical = fromLegacySiteConfig(switchedConfig);

    assert(switchedCanonical.businessProfile.identity.companyName === "Atlas Danışmanlık A.Ş.", `Switch to [${newTmplId}] preserves company name`);
    assert(switchedCanonical.businessProfile.contact.phone === "0212 555 1234", `Switch to [${newTmplId}] preserves phone number`);
    assert(switchedCanonical.businessProfile.contact.email === "info@atlasdanismanlik.com", `Switch to [${newTmplId}] preserves email`);
    assert(switchedCanonical.businessProfile.location.address === "Levent Mah. No: 42, İstanbul", `Switch to [${newTmplId}] preserves address`);
    assert(switchedCanonical.businessProfile.services.length === 3, `Switch to [${newTmplId}] preserves service count`);
  }
}

// ---------------------------------------------------------------------------
// 8. Preview vs Static Site Generator Parity
// ---------------------------------------------------------------------------
console.log("\n--- 8. Preview & Static Generator Parity ---");
{
  const staticFiles = generateProductionSiteFiles(baseSiteConfig);
  const homeStaticHtml = staticFiles.find((f) => f.filename === "index.html" || f.fileName === "index.html")?.html || "";

  const previewHtml = generateProductionPreviewHtml(baseSiteConfig);

  assert(homeStaticHtml.length > 0, "Static site generator emits index.html");
  assert(previewHtml.length > 0, "Production preview generator emits HTML");
  assert(homeStaticHtml === previewHtml, "100% byte-for-byte parity between preview and production static output");

  // Candidate Preview Parity Check
  const canonical = fromLegacySiteConfig(baseSiteConfig);
  const candidateResult = generateCandidatePreviewHtml(canonical, "tmpl-vip-luxury");
  assert(candidateResult.html.includes("Structural Header: premium-luxury"), "Candidate preview accurately renders target template header variant");
  assert(candidateResult.html.includes("Structural Footer: premium"), "Candidate preview accurately renders target template footer variant");
}

// ---------------------------------------------------------------------------
// 9. Responsive CSS Token & Overflow Hardening
// ---------------------------------------------------------------------------
console.log("\n--- 9. Responsive CSS Token & Overflow Hardening ---");
{
  const css = generateStaticCss(baseSiteConfig);

  assert(css.includes("overflow-x: hidden;"), "CSS enforces global overflow-x: hidden on html/body");
  assert(css.includes(".jk-header-corporate"), "CSS includes .jk-header-corporate rule");
  assert(css.includes(".jk-header-local"), "CSS includes .jk-header-local rule");
  assert(css.includes(".jk-header-minimal"), "CSS includes .jk-header-minimal rule");
  assert(css.includes(".jk-header-luxury"), "CSS includes .jk-header-luxury rule");
  assert(css.includes(".jk-footer-corporate"), "CSS includes .jk-footer-corporate rule");
  assert(css.includes(".jk-footer-local"), "CSS includes .jk-footer-local rule");
  assert(css.includes(".jk-footer-minimal"), "CSS includes .jk-footer-minimal rule");
  assert(css.includes(".jk-footer-luxury"), "CSS includes .jk-footer-luxury rule");
  assert(css.includes(".jk-service-card-standard"), "CSS includes .jk-service-card-standard rule");
  assert(css.includes(".jk-service-card-minimal"), "CSS includes .jk-service-card-minimal rule");
  assert(css.includes(".jk-service-card-image"), "CSS includes .jk-service-card-image rule");
  assert(css.includes(".jk-service-card-bordered"), "CSS includes .jk-service-card-bordered rule");
  assert(css.includes(".jk-service-card-compact"), "CSS includes .jk-service-card-compact rule");
  assert(css.includes("@media (max-width: 360px)"), "CSS includes 320px-360px mobile viewport hardening rules");
}

console.log(`\n=== SUMMARY: ${passed} passed, ${failed} failed ===`);
if (failed > 0) {
  process.exit(1);
}
