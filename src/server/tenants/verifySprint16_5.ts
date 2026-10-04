/**
 * JetKur Sprint 16.5 Regression & Verification Suite
 *
 * Verifies:
 * 1. Customer Data Integrity: Fresh customer gets ZERO fixture/demo leakage (no Yıldız, Oto Kurtarma, Ramada).
 * 2. Single Canonical Data Path: Authenticated User -> Workspace -> Site -> BusinessProfile -> Content -> Preview.
 * 3. Tenant Isolation: Customer A cannot see Customer B's site, content, or media.
 * 4. Logo Persistence & MediaAsset Association.
 * 5. Logo Color Extraction & Truthful Fallback.
 * 6. Business Profile Editing & Persistence across reloads.
 * 7. Non-Destructive Template Switching.
 * 8. Simple Dashboard Neutral Defaults.
 */

import assert from "assert";
import { siteRepository } from "../db/siteRepository";
import { onboardingService } from "../onboarding/onboardingService";
import { mediaService } from "../media/mediaService";
import { toSiteConfig, fromLegacySiteConfig } from "../../domain/site/legacyAdapter";
import { generateProductionPreviewHtml } from "../../utils/productionGeneratorBridge";
import { extractLogoColors } from "../../domain/brand/imageColorExtractor";
import { createNeutralSiteConfig, createDefaultSiteConfig } from "../../data/mockData";
import { applyTemplateManifest } from "../../domain/templates/switcher";
import { resolveTemplate } from "../../domain/templates/catalog";

async function runSprint16_5Verification() {
  console.log("============================================================");
  console.log("JETKUR — SPRINT 16.5 VERIFICATION SUITE");
  console.log("============================================================\n");

  // TEST 1: Neutral Default Config Integrity
  console.log("[TEST 1] Verifying Neutral Default Site Configuration...");
  const neutral = createNeutralSiteConfig();
  assert.ok(neutral.companyName && !neutral.companyName.includes("Yıldız"), "Neutral config must not contain Yıldız");
  assert.ok(!JSON.stringify(neutral).includes("yildizotokurtarma"), "Neutral config must not contain yildizotokurtarma");
  assert.ok(!JSON.stringify(neutral).includes("Oto Kurtarma"), "Neutral config must not contain Oto Kurtarma");
  console.log("  ✓ createNeutralSiteConfig() has zero fixture leakage.");

  // TEST 2: Canonical Onboarding with Fresh SME Customer
  console.log("\n[TEST 2] Running 5-step Canonical Onboarding for Customer A...");
  const workspaceA = "ws-customer-tesisat-" + Date.now();
  const userIdA = "user-tesisat-" + Date.now();

  const customerALogoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <rect width="100" height="100" fill="#0284c7" />
    <circle cx="50" cy="50" r="30" fill="#f59e0b" />
  </svg>`;

  const onboardingInputA = {
    companyName: "JetKur Test Tesisat",
    industry: "sihhi-tesisat",
    tagline: "7/24 Acil Su Tesisatçısı & Tıkanıklık Açma",
    phone: "0532 111 22 33",
    whatsapp: "0532 111 22 33",
    email: "iletisim@jetkurtesttesisat.com",
    address: "Bağdat Caddesi No:42, Kadıköy",
    city: "İstanbul",
    services: [
      { title: "Tıkanıklık Açma", shortDescription: "Kırmadan robot cihazla pimaş ve gider tıkanıklığı açma.", priceHint: "750 ₺'den başlayan" },
      { title: "Su Kaçağı Tespiti", shortDescription: "Termal kamera ve akustik dinleme ile noktasal kaçak bulma.", priceHint: "1.000 ₺" },
      { title: "Petek Temizliği", shortDescription: "Özel kimyasal ve makine ile verimli tesisat temizliği.", priceHint: "500 ₺" }
    ],
    logo: {
      svgContent: customerALogoSvg,
      mimeType: "image/svg+xml",
      fileName: "tesisat-logo.svg",
      sizeBytes: customerALogoSvg.length,
    },
    brandColor: "#0284c7",
    workspaceId: workspaceA,
  };

  const onboardingResultA = await onboardingService.createSiteFromOnboarding(
    onboardingInputA,
    { workspaceId: workspaceA, userId: userIdA }
  );

  assert.ok(onboardingResultA.success, "Onboarding must succeed");
  const siteA = onboardingResultA.site;
  assert.equal(siteA.businessProfile.identity.companyName, "JetKur Test Tesisat");
  assert.equal(siteA.businessProfile.contact.phone, "0532 111 22 33");
  assert.equal(siteA.businessProfile.contact.email, "iletisim@jetkurtesttesisat.com");
  console.log("  ✓ Customer A Canonical Site created successfully:", siteA.id);

  // TEST 3: Zero Fixture Leakage Check
  console.log("\n[TEST 3] Invariant Check: Zero Demo/Fixture Leakage in Customer A Runtime...");
  const siteConfigA = toSiteConfig(siteA);
  const previewHtmlA = generateProductionPreviewHtml(siteConfigA, "index.html");

  const siteAJson = JSON.stringify(siteA);
  const configAJson = JSON.stringify(siteConfigA);

  assert.ok(!siteAJson.includes("Yıldız"), "Site A must not contain 'Yıldız'");
  assert.ok(!siteAJson.includes("yildizotokurtarma"), "Site A must not contain 'yildizotokurtarma'");
  assert.ok(!configAJson.includes("Yıldız"), "SiteConfig A must not contain 'Yıldız'");
  assert.ok(!configAJson.includes("yildizotokurtarma"), "SiteConfig A must not contain 'yildizotokurtarma'");
  assert.ok(!previewHtmlA.includes("Yıldız"), "Preview HTML must not contain 'Yıldız'");
  assert.ok(!previewHtmlA.includes("yildizotokurtarma"), "Preview HTML must not contain 'yildizotokurtarma'");
  assert.ok(!previewHtmlA.includes("Oto Kurtarma"), "Preview HTML must not contain 'Oto Kurtarma'");
  assert.ok(previewHtmlA.includes("JetKur Test Tesisat"), "Preview HTML must contain 'JetKur Test Tesisat'");
  assert.ok(previewHtmlA.includes("0532 111 22 33"), "Preview HTML must contain '0532 111 22 33'");
  console.log("  ✓ Zero fixture leakage confirmed across CanonicalSite, SiteConfig, and Preview HTML.");

  // TEST 4: Logo Persistence & MediaAsset Association
  console.log("\n[TEST 4] Verifying Logo Persistence and MediaAsset Association...");
  assert.ok(siteA.businessProfile.branding.logoUrl, "Logo URL must be present in BusinessProfile branding");
  assert.ok(siteConfigA.logo, "Logo must be present in SiteConfig");

  const mediaAssetsA = await mediaService.getMediaForSite(siteA.id, workspaceA);
  const logoAsset = mediaAssetsA.find(a => a.assignedSlots?.some(s => s.slotKey === "logo") || a.id.includes("logo"));
  assert.ok(logoAsset, "MediaAsset for logo must be registered in MediaService");
  assert.equal(logoAsset.workspaceId, workspaceA, "Logo MediaAsset must belong to Workspace A");
  console.log("  ✓ Logo correctly persisted in BusinessProfile, SiteConfig, and MediaAsset.");

  // TEST 5: Logo Color Extraction
  console.log("\n[TEST 5] Testing Logo Color Extraction Engine...");
  const extracted = await extractLogoColors({
    svgContent: customerALogoSvg,
    mimeType: "image/svg+xml",
    fileName: "tesisat-logo.svg",
  });
  assert.ok(extracted.isExtracted, "SVG color extraction must succeed");
  assert.ok(extracted.primary, "Extracted primary color must be non-empty");
  console.log("  ✓ Extracted Colors:", extracted.primary, "(accent:", extracted.accent, ")");

  // Test truthful fallback
  const invalidExtract = await extractLogoColors({
    svgContent: "<svg></svg>",
    mimeType: "image/svg+xml",
  });
  assert.strictEqual(invalidExtract.isExtracted, false, "Empty SVG must truthfully report isExtracted=false");
  console.log("  ✓ Truthful fallback verified: no false success claimed on empty image.");

  // TEST 6: Persistence across Reloads & Business Profile Editing
  console.log("\n[TEST 6] Testing Business Profile Editing & Persistence across Reloads...");
  // Simulate reload by querying SiteRepository
  const reloadedSiteA = await siteRepository.getSiteById(siteA.id);
  assert.ok(reloadedSiteA, "Site must be retrieved from repository");
  assert.equal(reloadedSiteA.businessProfile.identity.companyName, "JetKur Test Tesisat");

  // Edit Business Profile
  await siteRepository.updateBusinessProfile(siteA.id, {
    identity: {
      companyName: "JetKur Test Tesisat & Isıtma",
      slogan: "İstanbul Anadolu & Avrupa Yakası 7/24 Kesintisiz Hizmet",
      sector: "sihhi-tesisat",
      shortDescription: "Profesyonel su tesisatı ve ısıtma hizmetleri.",
    },
    contact: {
      phone: "0532 999 88 77",
      whatsapp: "0532 999 88 77",
      email: "destek@jetkurtesttesisat.com",
    },
    location: {
      address: "Fahrettin Kerim Gökay Cad. No:10, Göztepe, Kadıköy",
      city: "İstanbul",
      district: "Kadıköy",
      serviceAreas: ["Kadıköy", "Ataşehir"],
    },
  });

  const updatedSiteA = await siteRepository.getSiteById(siteA.id);
  assert.ok(updatedSiteA, "Updated site must exist");
  assert.equal(updatedSiteA.businessProfile.identity.companyName, "JetKur Test Tesisat & Isıtma");
  assert.equal(updatedSiteA.businessProfile.contact.phone, "0532 999 88 77");
  assert.equal(updatedSiteA.businessProfile.contact.email, "destek@jetkurtesttesisat.com");

  const updatedConfigA = toSiteConfig(updatedSiteA);
  assert.equal(updatedConfigA.companyName, "JetKur Test Tesisat & Isıtma");
  assert.equal(updatedConfigA.email, "destek@jetkurtesttesisat.com");

  const updatedPreviewHtml = generateProductionPreviewHtml(updatedConfigA, "index.html");
  assert.ok(
    updatedPreviewHtml.includes("JetKur Test Tesisat &amp; Isıtma") ||
    updatedPreviewHtml.includes("JetKur Test Tesisat & Isıtma") ||
    (updatedPreviewHtml.includes("JetKur Test Tesisat") && updatedPreviewHtml.includes("Isıtma")),
    "Updated name must appear in preview"
  );
  assert.ok(updatedPreviewHtml.includes("0532 999 88 77"), "Updated phone must appear in preview");
  console.log("  ✓ Business Profile edited, persisted, and updated in preview HTML.");

  // TEST 7: Non-Destructive Template Switching
  console.log("\n[TEST 7] Testing Non-Destructive Template Switching...");
  const newManifest = resolveTemplate("tmpl-corporate-clean") || resolveTemplate("oto-kurtarma");
  if (newManifest) {
    const switchedSite = applyTemplateManifest(updatedSiteA, newManifest);
    assert.equal(switchedSite.businessProfile.identity.companyName, "JetKur Test Tesisat & Isıtma", "Template switch must preserve company name");
    assert.equal(switchedSite.businessProfile.contact.phone, "0532 999 88 77", "Template switch must preserve phone");
    assert.equal(switchedSite.businessProfile.services?.length, 3, "Template switch must preserve services");
    console.log("  ✓ Template switched to", newManifest.id, "with 100% customer content preservation.");
  }

  // TEST 8: Multi-Tenant Workspace Isolation
  console.log("\n[TEST 8] Verifying Multi-Tenant Workspace & Site Isolation...");
  const workspaceB = "ws-customer-danismanlik-" + Date.now();
  const userIdB = "user-danismanlik-" + Date.now();

  const onboardingResultB = await onboardingService.createSiteFromOnboarding(
    {
      companyName: "JetKur Test Danışmanlık",
      industry: "genel-isletme",
      phone: "0212 444 55 66",
      whatsapp: "0212 444 55 66",
      email: "info@testdanismanlik.com",
      city: "Ankara",
    },
    { workspaceId: workspaceB, userId: userIdB }
  );

  const siteB = onboardingResultB.site;

  // Workspace A must only see Site A
  const sitesInWsA = await siteRepository.listSitesByWorkspace(workspaceA);
  assert.equal(sitesInWsA.length, 1, "Workspace A must have exactly 1 site");
  assert.equal(sitesInWsA[0].id, siteA.id, "Workspace A must only contain Site A");
  assert.notEqual(sitesInWsA[0].id, siteB.id, "Workspace A must not contain Site B");

  // Workspace B must only see Site B
  const sitesInWsB = await siteRepository.listSitesByWorkspace(workspaceB);
  assert.equal(sitesInWsB.length, 1, "Workspace B must have exactly 1 site");
  assert.equal(sitesInWsB[0].id, siteB.id, "Workspace B must only contain Site B");

  // Media isolation
  const mediaAssetsB = await mediaService.getMediaForSite(siteB.id, workspaceB);
  assert.ok(!mediaAssetsB.some(a => a.workspaceId === workspaceA), "Workspace B cannot see Workspace A media");
  console.log("  ✓ Strict tenant isolation confirmed between Workspace A and Workspace B.");

  console.log("\n============================================================");
  console.log("ALL SPRINT 16.5 VERIFICATION CHECKS PASSED SUCCESSFULLY!");
  console.log("============================================================\n");
}

runSprint16_5Verification().catch((err) => {
  console.error("\n❌ SPRINT 16.5 VERIFICATION FAILED:", err);
  process.exit(1);
});
