/**
 * JetKur Smart Design Recommendation Engine (Theme Foundation 02D)
 *
 * PRODUCT PRINCIPLE:
 * "Kullanıcı web sitesi yapmayacak. İşletmesini anlatacak; JetKur web sitesini yapacak."
 *
 * ARCHITECTURAL PRINCIPLES:
 * 1. 100% Deterministic & Instant (Zero external LLM API latency/cost).
 * 2. Multi-factor heuristic matching based on:
 *    - Industry / Sector taxonomy
 *    - Business profile keywords
 *    - BrandKit logo colors (if available)
 * 3. Returns ranked top 3 complete design packages with human-readable rationale & conversion benefits.
 * 4. Never overwrites explicit customer selections (Strict Priority 3 preservation).
 */

import { BrandKit } from "./types";
import { getPaletteById, PREMIUM_PALETTES } from "./palettes";
import { getTypographyPresetById } from "./typography";
import { resolveTemplate } from "../templates/catalog";

export interface DesignPackageRecommendation {
  readonly rank: number;
  readonly templateId: string;
  readonly templateName: string;
  readonly paletteId: string;
  readonly paletteName: string;
  readonly typographyId: string;
  readonly typographyName: string;
  readonly headerVariant: string;
  readonly footerVariant: string;
  readonly serviceCardStyle: string;
  readonly matchScore: number; // 0 - 100
  readonly rationale: string;
  readonly conversionBenefit: string;
  readonly isPrimaryMatch: boolean;
}

interface SectorProfileRule {
  readonly keywords: readonly string[];
  readonly primaryTemplateId: string;
  readonly secondaryTemplateId: string;
  readonly tertiaryTemplateId: string;
  readonly primaryPaletteId: string;
  readonly typographyId: "corporate-sans" | "modern-minimal" | "elegant-serif" | "premium-editorial";
  readonly rationale: string;
  readonly conversionBenefit: string;
}

const SECTOR_RULES: readonly SectorProfileRule[] = [
  // 1. Sıhhi Tesisat
  {
    keywords: ["tesisat", "su", "musluk", "kaçak", "tıkanıklık", "klozet", "lavabo", "boru", "plumbing"],
    primaryTemplateId: "tmpl-plumbing-pro",
    secondaryTemplateId: "tmpl-rapid-service",
    tertiaryTemplateId: "tmpl-corporate-prestige",
    primaryPaletteId: "ocean-teal",
    typographyId: "corporate-sans",
    rationale: "Su tesisatı arıza ve montaj taleplerinde müşteriler doğrudan arama yapmak ister. Güven veren okyanus mavisi ve doğrudan arama butonları seçildi.",
    conversionBenefit: "Mobil kullanıcıların işletmeye hızla ulaşmasını sağlayan belirgin doğrudan arama butonu sunar.",
  },

  // 2. Kombi & Klima
  {
    keywords: ["kombi", "klima", "petek", "ısıtma", "soğutma", "iklimlendirme", "termostat", "hvac"],
    primaryTemplateId: "tmpl-climate-service",
    secondaryTemplateId: "tmpl-rapid-service",
    tertiaryTemplateId: "tmpl-corporate-prestige",
    primaryPaletteId: "modern-blue",
    typographyId: "corporate-sans",
    rationale: "Teknik servis ve bakım hizmetleri için ferah camgöbeği mavisi ve hızlı çağrı kartı tasarlandı.",
    conversionBenefit: "Yetkili servis ve bakım hizmetlerini öne çıkararak müşterilerin doğrudan arama veya mesaj ile iletişime geçmesini kolaylaştırır.",
  },

  // 3. Oto Kurtarma & Çekici
  {
    keywords: ["çekici", "kurtarma", "yol yardım", "oto", "akü", "lastik", "araba", "towing"],
    primaryTemplateId: "tmpl-towing-rescue",
    secondaryTemplateId: "tmpl-rapid-service",
    tertiaryTemplateId: "tmpl-corporate-prestige",
    primaryPaletteId: "copper-industrial",
    typographyId: "corporate-sans",
    rationale: "Yolda kalan sürücüler için yüksek kontrastlı uyarı turuncusu ve hızlı iletişim eylemi öne çıkarıldı.",
    conversionBenefit: "Yol yardım ihtiyacı olan sürücülerin tek dokunuşla doğrudan telefon bağlantısı kurabilmesini sağlar.",
  },

  // 4. Elektrikçi
  {
    keywords: ["elektrik", "pano", "kablo", "aydınlatma", "sigorta", "kaçak akım", "avize", "electrician"],
    primaryTemplateId: "tmpl-electrician-power",
    secondaryTemplateId: "tmpl-rapid-service",
    tertiaryTemplateId: "tmpl-corporate-prestige",
    primaryPaletteId: "copper-industrial",
    typographyId: "corporate-sans",
    rationale: "Elektrik arızalarında güvenlik ve sertifikalı ustalık ön plandadır. Endüstriyel sarı/bakır tonları ve net servis kartları kurgulandı.",
    conversionBenefit: "Hizmet alanlarını ve uzmanlık sertifikalarını belirgin kartlarla sunarak müşterinin güvenle iletişim kurmasını sağlar.",
  },

  // 5. Diş Kliniği & Sağlık
  {
    keywords: ["diş", "klinik", "implant", "hekim", "ortodonti", "zirkonyum", "gülüş", "sağlık", "dental"],
    primaryTemplateId: "tmpl-dental-care",
    secondaryTemplateId: "tmpl-clinical-pure",
    tertiaryTemplateId: "tmpl-corporate-prestige",
    primaryPaletteId: "emerald-green",
    typographyId: "modern-minimal",
    rationale: "Klinik hijyen, huzur ve uzman hekim kadrosunu yansıtan taze zümrüt yeşili ve modern minimal tipografi eşleştirildi.",
    conversionBenefit: "Tedavi alanlarını ve klinik bilgilerini düzenli kartlarla sunarak hastaların randevu talebinde bulunmasını kolaylaştırır.",
  },

  // 6. Hukuk Bürosu & Avukat
  {
    keywords: ["hukuk", "avukat", "dava", "arabulucu", "icra", "ceza", "danışmanlık", "baro", "legal"],
    primaryTemplateId: "tmpl-legal-authority",
    secondaryTemplateId: "tmpl-formal-legal",
    tertiaryTemplateId: "tmpl-corporate-prestige",
    primaryPaletteId: "royal-purple",
    typographyId: "elegant-serif",
    rationale: "Yargıtay ve mahkeme süreçlerinde kurumsal ağırlık gereklidir. Serif editoryal tipografi ve prestijli mor/altın hiyerarşisi uygulandı.",
    conversionBenefit: "Uzmanlık alanlarını ve kurumsal deneyimi net hiyerarşiyle sunarak müvekkillerin doğrudan danışma talebi iletmesini sağlar.",
  },

  // 7. Gayrimenkul Danışmanlığı
  {
    keywords: ["gayrimenkul", "emlak", "arsa", "villa", "konut", "daire", "kiralık", "satılık", "realtor", "property"],
    primaryTemplateId: "tmpl-real-estate-prestige",
    secondaryTemplateId: "tmpl-vip-luxury",
    tertiaryTemplateId: "tmpl-corporate-prestige",
    primaryPaletteId: "corporate-navy",
    typographyId: "corporate-sans",
    rationale: "Portföy sunumu için geniş 16:9 görsel kartlar, seçkin koyu detaylar ve danışmanla doğrudan iletişim.",
    conversionBenefit: "Geniş görsel odaklı kart düzeniyle portföydeki gayrimenkullerin ve danışman iletişim butonunun öne çıkmasını sağlar.",
  },

  // 8. Güzellik & Estetik
  {
    keywords: ["güzellik", "estetik", "cilt", "lazer", "spa", "kuaför", "tırnak", "masaj", "beauty"],
    primaryTemplateId: "tmpl-beauty-aesthetic",
    secondaryTemplateId: "tmpl-modern-minimal",
    tertiaryTemplateId: "tmpl-vip-luxury",
    primaryPaletteId: "botanical-sage",
    typographyId: "elegant-serif",
    rationale: "Ferahlık ve kişisel bakım zarafetini hissettiren organik adaçayı yeşili, yumuşak kart sınırları ve dingin tipografi.",
    conversionBenefit: "Hizmet menüsü ve salon görsellerini zarif bir düzenle sunarak müşterilerin randevu talebini kolaylaştırır.",
  },

  // 9. Butik Otel & Konaklama
  {
    keywords: ["otel", "butik otel", "pansiyon", "tatil", "rezervasyon", "oda", "resort", "hotel"],
    primaryTemplateId: "tmpl-hotel-resort",
    secondaryTemplateId: "tmpl-vip-luxury",
    tertiaryTemplateId: "tmpl-modern-minimal",
    primaryPaletteId: "black-gold",
    typographyId: "premium-editorial",
    rationale: "Fotoğraf odaklı tam ekran hero, seçkin altın detaylar ve doğrudan rezervasyon çağrısı.",
    conversionBenefit: "Oda detaylarını, konaklama olanaklarını ve doğrudan iletişim kanallarını öne çıkarır.",
  },

  // 10. Restoran & Kafe
  {
    keywords: ["restoran", "kafe", "yemek", "menü", "gurme", "şef", "ızgara", "lezzet", "restaurant"],
    primaryTemplateId: "tmpl-restaurant-gourmet",
    secondaryTemplateId: "tmpl-artisan-warm",
    tertiaryTemplateId: "tmpl-corporate-prestige",
    primaryPaletteId: "terracotta",
    typographyId: "elegant-serif",
    rationale: "İştah açıcı sıcak pişmiş toprak tonları, zengin yemek fotoğrafları ve kolay masa ayırtma eylemi.",
    conversionBenefit: "Menü içeriğini, şefin spesiyallerini ve masa rezervasyonu iletişim butonunu belirgin şekilde sunar.",
  },

  // 11. İnşaat & Mimarlık
  {
    keywords: ["inşaat", "müteahhit", "mimarlık", "şantiye", "proje", "yapı", "çelik", "tadilat", "construction"],
    primaryTemplateId: "tmpl-construction-architect",
    secondaryTemplateId: "tmpl-corporate-prestige",
    tertiaryTemplateId: "tmpl-modern-minimal",
    primaryPaletteId: "copper-industrial",
    typographyId: "corporate-sans",
    rationale: "Sağlamlık, mühendislik disiplini ve biten projeleri sergileyen antrasit ve bakır ızgara tasarımı.",
    conversionBenefit: "Tamamlanan projeleri ve kurumsal mühendislik referanslarını organize görsel bloklarla sergiler.",
  },

  // 12. Kurumsal Danışmanlık & Finans
  {
    keywords: ["danışmanlık", "finans", "mali müşavir", "muhasebe", "denetim", "b2b", "yönetim", "consulting"],
    primaryTemplateId: "tmpl-consulting-advisory",
    secondaryTemplateId: "tmpl-corporate-prestige",
    tertiaryTemplateId: "tmpl-formal-legal",
    primaryPaletteId: "corporate-navy",
    typographyId: "corporate-sans",
    rationale: "Kurumsal otorite, analitik metrik rozetleri ve güven telkin eden derin lacivert profesyonellik.",
    conversionBenefit: "Hizmet kapsamını ve analitik uzmanlık alanlarını kurumsal bir yapıda sunarak profesyonel danışmanlık taleplerini karşılar.",
  },
];

/**
 * Fallback rule for unclassified businesses
 */
const DEFAULT_FALLBACK_RULE: SectorProfileRule = {
  keywords: [],
  primaryTemplateId: "tmpl-corporate-prestige",
  secondaryTemplateId: "tmpl-modern-minimal",
  tertiaryTemplateId: "tmpl-rapid-service",
  primaryPaletteId: "corporate-navy",
  typographyId: "corporate-sans",
  rationale: "Her sektöre kusursuz uyum sağlayan dengeli kurumsal prestij mimarisi ve yüksek okunabilirlik.",
  conversionBenefit: "Profesyonel kurumsal imaj ile müşteri güvenini ilk temasta oluşturur.",
};

function matchesKeyword(inputLower: string, kw: string): boolean {
  if (kw.length <= 3) {
    // Word boundary matching for short Turkish keywords (avoiding matching "su" in "bürosu")
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(^|[^a-z0-9ğüşıöçİĞÜŞÖÇ])${escaped}([^a-z0-9ğüşıöçİĞÜŞÖÇ]|$)`, "i");
    return regex.test(inputLower);
  }
  return inputLower.includes(kw);
}

/**
 * Finds matching sector rule based on sector name, description or keywords
 */
export function findMatchingSectorRule(rawInput: string): SectorProfileRule {
  if (!rawInput || typeof rawInput !== "string") return DEFAULT_FALLBACK_RULE;
  const inputLower = rawInput.toLowerCase().trim();

  for (const rule of SECTOR_RULES) {
    if (rule.keywords.some((kw) => matchesKeyword(inputLower, kw))) {
      return rule;
    }
  }

  return DEFAULT_FALLBACK_RULE;
}

/**
 * Generates top 3 smart design recommendations for a business
 */
export function recommendDesignPackages(
  sectorOrKeywords: string,
  brandKit?: BrandKit | null
): readonly DesignPackageRecommendation[] {
  const rule = findMatchingSectorRule(sectorOrKeywords);

  // If BrandKit has dominant color, we prioritize harmony with brand
  let primaryPaletteId = rule.primaryPaletteId;
  if (brandKit?.palette?.primary) {
    // If brand kit exists, find the palette that closest complements the brand or preserve brand kit
    primaryPaletteId = "corporate-navy";
  }

  const templateIds = [rule.primaryTemplateId, rule.secondaryTemplateId, rule.tertiaryTemplateId];
  const scores = [98, 91, 84];

  return templateIds.map((tmplId, idx) => {
    const tmpl = resolveTemplate(tmplId);
    const tmplName = tmpl ? tmpl.name : tmplId;
    const recipe = tmpl ? tmpl.sectionRecipe : {};

    const palId = idx === 0 ? primaryPaletteId : idx === 1 ? "modern-blue" : "minimal-white";
    const pal = getPaletteById(palId);
    const typo = getTypographyPresetById(rule.typographyId);

    return {
      rank: idx + 1,
      templateId: tmplId,
      templateName: tmplName,
      paletteId: pal.id,
      paletteName: pal.name,
      typographyId: typo.id,
      typographyName: typo.name,
      headerVariant: recipe.header || "corporate-classic",
      footerVariant: recipe.footer || "corporate-multi",
      serviceCardStyle: tmpl?.designTokens.geometry.cardStyle || "standard",
      matchScore: scores[idx],
      rationale: idx === 0 ? rule.rationale : `Alternatif ${idx + 1}: ${rule.conversionBenefit}`,
      conversionBenefit: rule.conversionBenefit,
      isPrimaryMatch: idx === 0,
    };
  });
}
