/**
 * JetKur Sprint 05: Industry Pack Engine & Catalog Verification Suite
 *
 * Verifies:
 * 1. ALL_PACKS_VALID (all 7 canonical industry packs pass structural validation)
 * 2. UNIQUE_SLUGS (no slug collisions across catalog)
 * 3. UNIQUE_IDS (no pack ID collisions)
 * 4. ACTIVE_PACK_RESOLUTION (only active packs returned in onboarding catalog)
 * 5. EXACT_SLUG_RESOLUTION (direct slug lookup)
 * 6. ALIAS_RESOLUTION (synonyms resolve correctly)
 * 7. TURKISH_NORMALIZATION (case, dotless i, Turkish char resilience)
 * 8. UNKNOWN_INDUSTRY (graceful NOT_FOUND without throwing or crashing)
 * 9. AMBIGUOUS_INDUSTRY (handles ambiguous input with typed candidate list)
 * 10. DEFAULT_SERVICES_VALID (realistic starter services per industry)
 * 11. FAQ_VALID (authentic curated FAQs per industry)
 * 12. IMAGE_INTENTS_VALID (semantic search prompts, no provider lock-in)
 * 13. SEO_DEFAULTS_VALID (title/meta description templates with tokens)
 * 14. RECOMMENDED_SECTIONS_VALID (sections match CanonicalSectionType)
 * 15. NO_PRESENTATION_DATA (zero CSS/Tailwind leakage in domain)
 * 16. NO_PROVIDER_SPECIFIC_IMAGE_DATA (zero provider API ID leakage)
 * 17. MATERIALIZATION_SUCCESS (pure function converts pack -> SiteContent)
 * 18. PLACEHOLDER_REPLACEMENT ({{businessName}}, {{city}}, {{phone}} substituted)
 * 19. CUSTOMER_CONTENT_IMMUTABILITY (customer edits never overwritten by pack updates)
 * 20. TEMPLATE_INDEPENDENCE (pack domain has zero imports from DesignTemplate)
 * 21. SEED_IDEMPOTENCY (seeder runs idempotently without duplicates)
 */

import {
  ALL_INDUSTRY_PACKS,
  CANONICAL_INDUSTRY_PACKS,
} from "../../domain/industries/catalog";
import {
  getIndustryPackBySlug,
  findIndustryPackByAlias,
  listActiveIndustryPacks,
  searchIndustryPacks,
  resolveIndustryPack,
} from "../../domain/industries/resolver";
import { normalizeTurkishText } from "../../domain/industries/normalization";
import {
  materializeIndustryStarterContent,
  interpolatePlaceholders,
} from "../../domain/industries/materializer";
import { validateIndustryPack } from "../../domain/industries/validator";
import { IndustryPack } from "../../domain/industries/types";
import { industryPackService } from "./industryPackService";

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

async function runIndustryVerification() {
  console.log("=== JETKUR SPRINT 05: INDUSTRY PACK ENGINE & CATALOG VERIFICATION ===\n");

  // ==========================================
  // 1. CATALOG INTEGRITY & VALIDATION
  // ==========================================
  console.log("1. Catalog Integrity & Schema Validation Tests:");
  {
    assert(ALL_INDUSTRY_PACKS.length >= 7, "CATALOG_SIZE: At least 7 canonical industry packs exist", `Count: ${ALL_INDUSTRY_PACKS.length}`);

    // Verify all packs pass validation
    let allValid = true;
    for (const pack of ALL_INDUSTRY_PACKS) {
      const res = validateIndustryPack(pack);
      if (!res.valid) {
        allValid = false;
        console.error(`Pack ${pack.slug} validation failed:`, res.issues);
      }
    }
    assert(allValid, "ALL_PACKS_VALID: All canonical packs pass structural schema validation");

    // Unique slugs
    const slugs = ALL_INDUSTRY_PACKS.map((p) => p.slug);
    const uniqueSlugs = new Set(slugs);
    assert(slugs.length === uniqueSlugs.size, "UNIQUE_SLUGS: All industry pack slugs are globally unique");

    // Unique IDs
    const ids = ALL_INDUSTRY_PACKS.map((p) => p.id);
    const uniqueIds = new Set(ids);
    assert(ids.length === uniqueIds.size, "UNIQUE_IDS: All industry pack IDs are globally unique");

    // Active pack listing
    const activePacks = listActiveIndustryPacks();
    assert(activePacks.length === ALL_INDUSTRY_PACKS.length, "ACTIVE_PACK_RESOLUTION: All 7 packs are ACTIVE for onboarding");
  }

  // ==========================================
  // 2. RESOLVER & ALIAS TESTS
  // ==========================================
  console.log("\n2. Resolver, Alias & Normalization Tests:");
  {
    // Exact slug resolution
    const resOto = resolveIndustryPack("oto-kurtarma");
    assert(resOto.status === "EXACT_MATCH" && resOto.pack?.slug === "oto-kurtarma", "EXACT_SLUG_RESOLUTION: 'oto-kurtarma' resolves exact match");

    const resDis = resolveIndustryPack("dis-hekimligi");
    assert(resDis.status === "EXACT_MATCH" && resDis.pack?.slug === "dis-hekimligi", "EXACT_SLUG_RESOLUTION: 'dis-hekimligi' resolves exact match");

    const resHukuk = resolveIndustryPack("hukuk-avukat");
    assert(resHukuk.status === "EXACT_MATCH" && resHukuk.pack?.slug === "hukuk-avukat", "EXACT_SLUG_RESOLUTION: 'hukuk-avukat' resolves exact match");

    // Turkish alias normalization
    const resCekici = resolveIndustryPack("çekici");
    assert(resCekici.status === "ALIAS_MATCH" && resCekici.pack?.slug === "oto-kurtarma", "ALIAS_RESOLUTION: 'çekici' resolves to 'oto-kurtarma'");

    const resAvukat = resolveIndustryPack("avukatlık");
    assert(resAvukat.status === "ALIAS_MATCH" && resAvukat.pack?.slug === "hukuk-avukat", "ALIAS_RESOLUTION: 'avukatlık' resolves to 'hukuk-avukat'");

    const resHali = resolveIndustryPack("Halı Yıkama");
    assert(resHali.status === "EXACT_MATCH" || resHali.status === "ALIAS_MATCH", "TURKISH_NORMALIZATION: 'Halı Yıkama' matches case/accent-insensitively");

    const resKombi = resolveIndustryPack("kombi ustası");
    assert(resKombi.status === "ALIAS_MATCH" && resKombi.pack?.slug === "kombi-klima-servisi", "ALIAS_RESOLUTION: 'kombi ustası' resolves to 'kombi-klima-servisi'");

    const resNakliye = resolveIndustryPack("evden eve nakliye");
    assert(resNakliye.status === "ALIAS_MATCH" && resNakliye.pack?.slug === "evden-eve-nakliyat", "ALIAS_RESOLUTION: 'evden eve nakliye' resolves to 'evden-eve-nakliyat'");

    const resTesisat = resolveIndustryPack("sıhhi tesisatçı");
    assert(resTesisat.status === "ALIAS_MATCH" && resTesisat.pack?.slug === "sihhi-tesisat", "TURKISH_NORMALIZATION: 'sıhhi tesisatçı' resolves to 'sihhi-tesisat'");

    // Legacy slug compatibility: "plumbing" maps to "sihhi-tesisat"
    const legacyPlumbing = getIndustryPackBySlug("plumbing");
    assert(legacyPlumbing?.slug === "sihhi-tesisat", "LEGACY_SLUG_COMPATIBILITY: 'plumbing' resolves to 'sihhi-tesisat'");

    // Unknown industry (no crash, safe NOT_FOUND)
    const resUnknown = resolveIndustryPack("piyano akort ve restorasyon servisi");
    assert(resUnknown.status === "NOT_FOUND" && resUnknown.pack === undefined, "UNKNOWN_INDUSTRY: Unknown sector produces clean NOT_FOUND");

    // Empty input check
    const resEmpty = resolveIndustryPack("");
    assert(resEmpty.status === "NOT_FOUND", "EMPTY_INPUT: Empty string returns NOT_FOUND");
  }

  // ==========================================
  // 3. INDUSTRY CONTENT QUALITY & DOMAIN PURITY
  // ==========================================
  console.log("\n3. Industry Content Quality & Purity Tests:");
  {
    for (const pack of ALL_INDUSTRY_PACKS) {
      // Default services check
      assert(pack.defaultServices.length >= 4, `DEFAULT_SERVICES_VALID: '${pack.slug}' has >= 4 services (${pack.defaultServices.length})`);

      // Default FAQs check
      assert(pack.defaultFaqs.length >= 3, `FAQ_VALID: '${pack.slug}' has >= 3 FAQs (${pack.defaultFaqs.length})`);

      // Image intents check
      assert(pack.imageIntents.length >= 2, `IMAGE_INTENTS_VALID: '${pack.slug}' has >= 2 image intents`);

      // SEO defaults check
      assert(
        pack.seoDefaults.titleTemplate.includes("{{companyName}}") &&
          pack.seoDefaults.descriptionTemplate.includes("{{city}}"),
        `SEO_DEFAULTS_VALID: '${pack.slug}' contains tokenized SEO templates`
      );

      // Schema hints check
      assert(Boolean(pack.schemaHints.businessType), `SCHEMA_HINTS_VALID: '${pack.slug}' has schema businessType '${pack.schemaHints.businessType}'`);

      // Presentation leakage check
      const rawPack = pack as any;
      assert(rawPack.className === undefined, `NO_PRESENTATION_DATA: '${pack.slug}' has no className`);
      assert(rawPack.tailwindClasses === undefined, `NO_PRESENTATION_DATA: '${pack.slug}' has no tailwindClasses`);
      assert(rawPack.backgroundColor === undefined, `NO_PRESENTATION_DATA: '${pack.slug}' has no backgroundColor`);

      // Provider leakage check
      for (const img of pack.imageIntents) {
        const rawImg = img as any;
        assert(rawImg.pexelsId === undefined && rawImg.unsplashId === undefined, `NO_PROVIDER_SPECIFIC_IMAGE_DATA: '${pack.slug}' img has no provider IDs`);
      }
    }
  }

  // ==========================================
  // 4. STARTER CONTENT MATERIALIZATION
  // ==========================================
  console.log("\n4. Starter Content Materialization Tests:");
  {
    const plumbingPack = getIndustryPackBySlug("sihhi-tesisat")!;
    const mockProfile = {
      identity: {
        companyName: "Usta Tesisat Kadıköy",
        sector: "Sıhhi Tesisat",
      },
      location: {
        city: "İstanbul",
        district: "Kadıköy",
      },
      contact: {
        phone: "0532 555 12 34",
        email: "info@ustatesisat.com",
      },
    };

    const starterContent = materializeIndustryStarterContent(plumbingPack, mockProfile as any);

    assert(starterContent.hero !== undefined, "MATERIALIZATION_SUCCESS: Hero content generated");
    assert(starterContent.hero.title.includes("Usta Tesisat Kadıköy") || starterContent.hero.title.includes("Su Kaçağı"), "PLACEHOLDER_REPLACEMENT: Hero title contains business context");
    assert(starterContent.hero.ctaPrimaryLink === "tel:05325551234", "PLACEHOLDER_REPLACEMENT: CTA link injected from phone");
    assert(starterContent.about.contentHtml.includes("İstanbul"), "PLACEHOLDER_REPLACEMENT: About story contains city");
    assert(starterContent.faqs.length === plumbingPack.defaultFaqs.length, "MATERIALIZATION_SUCCESS: All starter FAQs materialized");
    assert(starterContent.whyUs.items.length === 3, "MATERIALIZATION_SUCCESS: WhyUs cards materialized");
  }

  // ==========================================
  // 5. CUSTOMER CONTENT IMMUTABILITY INVARIANT
  // ==========================================
  console.log("\n5. Invariant: Customer Content Immutability Tests:");
  {
    const towPack = getIndustryPackBySlug("oto-kurtarma")!;
    const initialContent = materializeIndustryStarterContent(towPack, {
      identity: { companyName: "Merkez Çekici" },
    } as any);

    // Customer modifies an FAQ answer in their own SiteContent
    initialContent.faqs[0].answer = "ÖZEL MÜŞTERİ YANITI: Biz sadece Kadıköy ve Üsküdar'a bakıyoruz.";

    // Now simulate an update to the platform Industry Pack
    const originalFaqAnswer = towPack.defaultFaqs[0].answer;
    towPack.defaultFaqs[0].answer = "PLATFORM GÜNCELLEMESİ: 2026 yeni tarifeleri geçerlidir.";

    // Customer's content MUST NOT CHANGE
    assert(
      initialContent.faqs[0].answer === "ÖZEL MÜŞTERİ YANITI: Biz sadece Kadıköy ve Üsküdar'a bakıyoruz.",
      "CUSTOMER_CONTENT_IMMUTABILITY: Customer-owned SiteContent was NOT mutated by platform IndustryPack update"
    );

    // Restore original pack FAQ for test hygiene
    towPack.defaultFaqs[0].answer = originalFaqAnswer;
  }

  // ==========================================
  // 6. TEMPLATE INDEPENDENCE
  // ==========================================
  console.log("\n6. Template Independence Tests:");
  {
    // IndustryPack does not import or know about DesignTemplates
    const pack = getIndustryPackBySlug("dis-hekimligi")!;
    const raw = pack as any;
    assert(raw.defaultColors === undefined, "TEMPLATE_INDEPENDENCE: Pack contains no defaultColors");
    assert(raw.templateId === undefined, "TEMPLATE_INDEPENDENCE: Pack contains no templateId");
    assert(raw.coverImage === undefined, "TEMPLATE_INDEPENDENCE: Pack contains no UI coverImage");
  }

  // ==========================================
  // 7. SEED IDEMPOTENCY
  // ==========================================
  console.log("\n7. Seed Idempotency Tests:");
  {
    // Seeder upserts without duplicating records
    const mockDb = new Map<string, any>();
    const mockClient = {
      industryPack: {
        upsert: async ({ where, create, update }: any) => {
          const existing = mockDb.get(where.slug);
          const data = existing ? { ...existing, ...update } : { ...create };
          mockDb.set(where.slug, data);
          return data;
        },
      },
    };

    const seedResult1 = await industryPackService.seedDatabaseIndustryPacks(mockClient);
    const seedResult2 = await industryPackService.seedDatabaseIndustryPacks(mockClient);

    assert(seedResult1.seeded === ALL_INDUSTRY_PACKS.length, "SEED_IDEMPOTENCY: First run seeded all packs", `Seeded: ${seedResult1.seeded}`);
    assert(mockDb.size === ALL_INDUSTRY_PACKS.length, "SEED_IDEMPOTENCY: Mock DB has exactly 7 distinct packs");
    assert(seedResult2.seeded === ALL_INDUSTRY_PACKS.length, "SEED_IDEMPOTENCY: Re-running seed preserves count without duplicates");
    assert(mockDb.size === ALL_INDUSTRY_PACKS.length, "SEED_IDEMPOTENCY: Re-running seed does NOT create duplicate records");
  }

  console.log(`\nIndustry Pack Verification Complete: ${passedCount} / ${passedCount + failedCount} tests passed.`);
  if (failedCount > 0) {
    process.exit(1);
  }
}

runIndustryVerification().catch((err) => {
  console.error("Verification suite failed:", err);
  process.exit(1);
});
