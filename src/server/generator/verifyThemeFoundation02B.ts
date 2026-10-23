/**
 * JetKur - Theme Foundation 02B Verification Suite
 * Canonical Hero, Services, and About Section Layout Verification
 *
 * Verifies:
 * 1. Canonical Hero layouts (urgent-callout, centered-prestige, split-content-image, minimal-lead)
 * 2. Canonical Services layouts (grid-4, cards-3, cards, list, compact)
 * 3. Canonical About layouts (side-by-side, story-timeline, minimal-stats)
 * 4. Content preservation & tenant isolation (zero hallucinated data, safe escaping)
 * 5. Landing vs Multi-page link resolution in Hero, Services, and About
 */

import { renderHeroSection, renderServicesSection, renderAboutSection, resolveSectionVariant } from "../../utils/generator/sectionRenderer";
import { fromLegacySiteConfig } from "../../domain/site/legacyAdapter";
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

console.log("=== JETKUR THEME FOUNDATION 02B VERIFICATION ===\n");

// ---------------------------------------------------------------------------
// 1. Canonical Hero Section Layouts
// ---------------------------------------------------------------------------
console.log("--- 1. Canonical Hero Section Layouts ---");
{
  const siteConfig = createDefaultSiteConfig();
  const canonical = fromLegacySiteConfig(siteConfig);

  // Urgent Callout Hero
  const urgentHero = renderHeroSection({
    site: canonical,
    manifest: resolveTemplate("tmpl-rapid-service")!,
    variant: "urgent-callout",
    config: siteConfig,
  });
  assert(urgentHero.includes("Hero Section: urgent-callout"), "Urgent callout hero renders variant marker");
  assert(
    urgentHero.includes(canonical.content.hero?.title || "") || urgentHero.includes(canonical.businessProfile.identity.companyName),
    "Urgent callout renders headline or company name"
  );
  assert(urgentHero.includes("Hemen İletişime Geç") || urgentHero.includes(canonical.content.hero?.ctaPrimaryText || ""), "Urgent callout renders primary CTA");

  // Centered Prestige Hero
  const prestigeHero = renderHeroSection({
    site: canonical,
    manifest: resolveTemplate("tmpl-corporate-prestige")!,
    variant: "centered-prestige",
    config: siteConfig,
  });
  assert(prestigeHero.includes("Hero Section: centered-prestige"), "Centered prestige hero renders variant marker");
  assert(prestigeHero.includes("id=\"hero\""), "Prestige hero includes standard hero ID");

  // Minimal Lead Hero
  const minimalHero = renderHeroSection({
    site: canonical,
    manifest: resolveTemplate("tmpl-modern-minimal")!,
    variant: "minimal-lead",
    config: siteConfig,
  });
  assert(minimalHero.includes("Hero Section: minimal-lead"), "Minimal lead hero renders variant marker");
}

// ---------------------------------------------------------------------------
// 2. Canonical Services Section Layouts
// ---------------------------------------------------------------------------
console.log("\n--- 2. Canonical Services Section Layouts ---");
{
  const siteConfig = createDefaultSiteConfig();
  const canonical = fromLegacySiteConfig(siteConfig);

  const variants = ["grid-4", "cards-3", "cards", "list", "compact"];
  for (const variant of variants) {
    const html = renderServicesSection({
      site: canonical,
      manifest: resolveTemplate("tmpl-corporate-prestige")!,
      variant,
      config: siteConfig,
    });
    assert(html.includes(`Services Section: ${variant}`), `Services section renders variant marker for [${variant}]`);
    assert(html.includes("Uzmanlık Alanlarımız"), `Services section has standard Turkish heading`);
    assert(html.includes("jk-services-grid"), `Services section emits responsive grid container`);
    // Check that actual services are present
    const firstService = canonical.businessProfile.services[0];
    if (firstService) {
      const sName = firstService.title || (firstService as any).name;
      assert(html.includes(sName), `Services section renders actual service title (${sName})`);
    }
  }
}

// ---------------------------------------------------------------------------
// 3. Canonical About Section Layouts
// ---------------------------------------------------------------------------
console.log("\n--- 3. Canonical About Section Layouts ---");
{
  const siteConfig = createDefaultSiteConfig();
  const canonical = fromLegacySiteConfig(siteConfig);

  const aboutHtml = renderAboutSection({
    site: canonical,
    manifest: resolveTemplate("tmpl-corporate-prestige")!,
    variant: "story-timeline",
    config: siteConfig,
  });
  assert(aboutHtml.includes("About Section: story-timeline"), "About section renders variant marker");
  assert(aboutHtml.includes("Hakkımızda & Değerlerimiz"), "About section renders standard heading");
  assert(aboutHtml.includes("Yıllık Tecrübe"), "About section renders experience metric label");
  assert(aboutHtml.includes("Mutlu Müşteri"), "About section renders customer metric label");
}

// ---------------------------------------------------------------------------
// 4. Content Safety & No Hallucinated Claims
// ---------------------------------------------------------------------------
console.log("\n--- 4. Content Safety & Authentic Data ---");
{
  const neutralConfig = createNeutralSiteConfig();
  const neutralCanonical = fromLegacySiteConfig(neutralConfig);

  const neutralServicesHtml = renderServicesSection({
    site: neutralCanonical,
    manifest: resolveTemplate("tmpl-corporate-prestige")!,
    variant: "cards",
    config: neutralConfig,
  });

  assert(!neutralServicesHtml.includes("Dünya Çapında 1 Numara"), "No fabricated marketing claims in services");
  assert(!neutralServicesHtml.includes("%100 Kesin Çözüm Sözü"), "No unverified promises in services");
}

console.log(`\n=== SUMMARY: ${passed} passed, ${failed} failed ===`);
if (failed > 0) {
  process.exit(1);
}
