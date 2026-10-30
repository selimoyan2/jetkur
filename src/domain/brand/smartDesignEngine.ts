/**
 * JetKur Smart Design Recommendation Engine (Theme Foundation 02D.R)
 *
 * ARCHITECTURAL PRINCIPLES:
 * 1. Recommends canonical `templateId`s from the 8 canonical `TemplateManifest`s
 *    paired with curated Industry Design Presets, Palette Presets, Typography Presets,
 *    and supported canonical section variants.
 * 2. 100% deterministic keyword matching across 12 industry sectors + corporate fallback.
 * 3. Pure read-only recommendation function: never mutates saved site content.
 * 4. Truthful & Claim-Safe: never invents marketing multipliers, conversion percentages,
 *    or unverified performance claims.
 */

import { BrandKit } from "./types";
import { getPaletteById } from "./palettes";
import { TypographyArchetypeId, getTypographyPresetById } from "./typography";
import { resolveTemplate } from "../templates/catalog";
import {
  CanonicalTemplateId,
  getIndustryPresetById,
} from "../templates/manifests/industryTemplates";
import { CanonicalSectionId } from "../sections/types";

export interface DesignPackageRecommendation {
  readonly rank: number;
  /** Always one of the 8 canonical TemplateManifest IDs */
  readonly templateId: CanonicalTemplateId;
  readonly templateName: string;
  /** Matched IndustryDesignPreset ID (e.g. 'preset-plumbing-pro') */
  readonly presetId: string;
  readonly presetName: string;
  readonly paletteId: string;
  readonly paletteName: string;
  readonly typographyId: TypographyArchetypeId;
  readonly typographyName: string;
  readonly backgroundPresetId: string;
  readonly headerVariant: string;
  readonly footerVariant: string;
  readonly serviceCardStyle: string;
  readonly sectionVariants: Partial<Record<CanonicalSectionId, string>>;
  readonly rationale: string;
  readonly conversionBenefit: string;
  readonly isPrimaryMatch: boolean;
}

export interface SectorProfileRule {
  readonly sectorKey: string;
  readonly keywords: readonly string[];
  readonly presetId: string;
  readonly primaryTemplateId: CanonicalTemplateId;
  readonly secondaryTemplateId: CanonicalTemplateId;
  readonly tertiaryTemplateId: CanonicalTemplateId;
  readonly primaryPaletteId: string;
  readonly typographyId: TypographyArchetypeId;
  readonly backgroundPresetId: string;
  readonly rationale: string;
  readonly conversionBenefit: string;
}

const SECTOR_RULES: readonly SectorProfileRule[] = [
  // 1. Sıhhi Tesisat
  {
    sectorKey: "plumbing",
    keywords: ["tesisat", "su kaçağı", "tıkanıklık", "musluk", "boru", "petek", "sıhhi", "plumbing"],
    presetId: "preset-plumbing-pro",
    primaryTemplateId: "tmpl-rapid-service",
    secondaryTemplateId: "tmpl-corporate-prestige",
    tertiaryTemplateId: "tmpl-modern-minimal",
    primaryPaletteId: "modern-blue",
    typographyId: "corporate-sans",
    backgroundPresetId: "ocean-blue",
    rationale:
      "Sıhhi tesisat ve arıza taleplerinde ziyaretçiler hızlı telefon ve WhatsApp bağlantısı arar. Net servis kartları ve doğrudan iletişim üst barı önceliklendirildi.",
    conversionBenefit:
      "Doğrudan telefon ve WhatsApp butonlarını üst bölümde erişilebilir tutarak ziyaretçinin hızlıca ulaşmasını kolaylaştırır.",
  },
  // 2. Kombi & Klima Servisi
  {
    sectorKey: "climate",
    keywords: ["kombi", "klima", "petek", "ısıtma", "soğutma", "kazan", "servis", "hvac", "climate"],
    presetId: "preset-climate-service",
    primaryTemplateId: "tmpl-rapid-service",
    secondaryTemplateId: "tmpl-corporate-prestige",
    tertiaryTemplateId: "tmpl-tech-dynamic",
    primaryPaletteId: "ocean-cyan",
    typographyId: "corporate-sans",
    backgroundPresetId: "ocean-blue",
    rationale:
      "Kombi ve klima bakım-onarım süreçlerinde net hizmet kapsamı ve kolay servis kaydı önemlidir. Kompakt servis kartları ve yerel servis üst barı seçildi.",
    conversionBenefit:
      "Bakım ve arıza hizmet başlıklarını düzenli kartlarla sunarak müşterilerin doğrudan arama veya mesaj ile iletişime geçmesini kolaylaştırır.",
  },
  // 3. Oto Kurtarma & Çekici
  {
    sectorKey: "towing",
    keywords: ["çekici", "kurtarma", "yol yardım", "oto", "akü", "lastik", "araba", "towing"],
    presetId: "preset-towing-rescue",
    primaryTemplateId: "tmpl-rapid-service",
    secondaryTemplateId: "tmpl-corporate-prestige",
    tertiaryTemplateId: "tmpl-tech-dynamic",
    primaryPaletteId: "copper-industrial",
    typographyId: "corporate-sans",
    backgroundPresetId: "dark-luxury",
    rationale:
      "Yol yardım ve çekici hizmetlerinde yüksek kontrastlı başlıklar ve doğrudan arama eylemi kritik önem taşır.",
    conversionBenefit:
      "Yol yardım ihtiyacı olan sürücülerin tek dokunuşla doğrudan telefon bağlantısı kurabilmesini sağlar.",
  },
  // 4. Elektrikçi
  {
    sectorKey: "electrical",
    keywords: ["elektrik", "pano", "kablo", "aydınlatma", "sigorta", "kaçak akım", "avize", "electrician"],
    presetId: "preset-electrician-power",
    primaryTemplateId: "tmpl-rapid-service",
    secondaryTemplateId: "tmpl-corporate-prestige",
    tertiaryTemplateId: "tmpl-tech-dynamic",
    primaryPaletteId: "copper-industrial",
    typographyId: "corporate-sans",
    backgroundPresetId: "champagne",
    rationale:
      "Elektrik tesisatı ve arıza çözümlerinde güvenlik ve uzmanlık ön plandadır. Yüksek okunabilirlikli tipografi ve düzenli servis kartları kurgulandı.",
    conversionBenefit:
      "Hizmet alanlarını ve uzmanlık bilgilerini belirgin kartlarla sunarak müşterinin güvenle iletişim kurmasını sağlar.",
  },
  // 5. Diş Kliniği & Sağlık
  {
    sectorKey: "dental",
    keywords: ["diş", "klinik", "implant", "hekim", "ortodonti", "zirkonyum", "gülüş", "sağlık", "dental"],
    presetId: "preset-dental-care",
    primaryTemplateId: "tmpl-clinical-pure",
    secondaryTemplateId: "tmpl-corporate-prestige",
    tertiaryTemplateId: "tmpl-modern-minimal",
    primaryPaletteId: "emerald-green",
    typographyId: "modern-minimal",
    backgroundPresetId: "emerald-glow",
    rationale:
      "Klinik hijyen, huzur ve uzman hekim kadrosunu yansıtan ferah zümrüt yeşili ve modern minimal tipografi eşleştirildi.",
    conversionBenefit:
      "Tedavi alanlarını ve klinik bilgilerini düzenli kartlarla sunarak hastaların randevu talebinde bulunmasını kolaylaştırır.",
  },
  // 6. Hukuk Bürosu & Avukat
  {
    sectorKey: "legal",
    keywords: ["hukuk", "avukat", "dava", "arabulucu", "icra", "ceza", "baro", "legal"],
    presetId: "preset-legal-authority",
    primaryTemplateId: "tmpl-formal-legal",
    secondaryTemplateId: "tmpl-corporate-prestige",
    tertiaryTemplateId: "tmpl-vip-luxury",
    primaryPaletteId: "royal-purple",
    typographyId: "elegant-serif",
    backgroundPresetId: "royal-purple",
    rationale:
      "Hukuki süreçlerde kurumsal ağırlık ve ciddiyet esastır. Klasik serif tipografi ve prestijli renk hiyerarşisi uygulandı.",
    conversionBenefit:
      "Uzmanlık alanlarını ve kurumsal deneyimi net hiyerarşiyle sunarak müvekkillerin doğrudan danışma talebi iletmesini sağlar.",
  },
  // 7. Gayrimenkul Danışmanlığı
  {
    sectorKey: "real-estate",
    keywords: ["gayrimenkul", "emlak", "arsa", "villa", "konut", "daire", "kiralık", "satılık", "realtor", "property"],
    presetId: "preset-real-estate-prestige",
    primaryTemplateId: "tmpl-vip-luxury",
    secondaryTemplateId: "tmpl-corporate-prestige",
    tertiaryTemplateId: "tmpl-modern-minimal",
    primaryPaletteId: "corporate-navy",
    typographyId: "corporate-sans",
    backgroundPresetId: "dark-luxury",
    rationale:
      "Portföy sunumu için geniş görsel odaklı kartlar, seçkin kurumsal detaylar ve danışmanla doğrudan iletişim yapısı seçildi.",
    conversionBenefit:
      "Görsel odaklı kart düzeniyle portföydeki gayrimenkullerin ve danışman iletişim butonunun öne çıkmasını sağlar.",
  },
  // 8. Güzellik & Estetik
  {
    sectorKey: "beauty",
    keywords: ["güzellik", "estetik", "cilt", "lazer", "spa", "kuaför", "tırnak", "masaj", "beauty"],
    presetId: "preset-beauty-aesthetic",
    primaryTemplateId: "tmpl-modern-minimal",
    secondaryTemplateId: "tmpl-vip-luxury",
    tertiaryTemplateId: "tmpl-clinical-pure",
    primaryPaletteId: "botanical-sage",
    typographyId: "elegant-serif",
    backgroundPresetId: "champagne",
    rationale:
      "Ferahlık ve kişisel bakım zarafetini hissettiren doğal adaçayı yeşili, yumuşak kart sınırları ve dingin tipografi bir araya getirildi.",
    conversionBenefit:
      "Hizmet menüsü ve salon görsellerini zarif bir düzenle sunarak müşterilerin randevu talebini kolaylaştırır.",
  },
  // 9. Butik Otel & Konaklama
  {
    sectorKey: "hotel",
    keywords: ["otel", "butik otel", "pansiyon", "tatil", "rezervasyon", "oda", "resort", "hotel"],
    presetId: "preset-hotel-resort",
    primaryTemplateId: "tmpl-vip-luxury",
    secondaryTemplateId: "tmpl-artisan-warm",
    tertiaryTemplateId: "tmpl-modern-minimal",
    primaryPaletteId: "black-gold",
    typographyId: "premium-editorial",
    backgroundPresetId: "dark-luxury",
    rationale:
      "Atmosferik vitrin sunumu, seçkin altın detaylar ve doğrudan rezervasyon iletişim çağrısı ön plana alındı.",
    conversionBenefit:
      "Oda detaylarını, konaklama olanaklarını ve doğrudan iletişim kanallarını öne çıkarır.",
  },
  // 10. Restoran & Kafe
  {
    sectorKey: "restaurant",
    keywords: ["restoran", "kafe", "yemek", "menü", "gurme", "şef", "ızgara", "lezzet", "restaurant"],
    presetId: "preset-restaurant-gourmet",
    primaryTemplateId: "tmpl-artisan-warm",
    secondaryTemplateId: "tmpl-vip-luxury",
    tertiaryTemplateId: "tmpl-corporate-prestige",
    primaryPaletteId: "terracotta",
    typographyId: "elegant-serif",
    backgroundPresetId: "sunset",
    rationale:
      "İştah açıcı sıcak pişmiş toprak tonları, görsel odaklı kartlar ve kolay masa rezervasyonu eylemi birleştirildi.",
    conversionBenefit:
      "Menü içeriğini, özel lezzetleri ve masa rezervasyonu iletişim butonunu belirgin şekilde sunar.",
  },
  // 11. İnşaat & Mimarlık
  {
    sectorKey: "construction",
    keywords: ["inşaat", "müteahhit", "mimarlık", "şantiye", "proje", "yapı", "çelik", "tadilat", "construction"],
    presetId: "preset-construction-architect",
    primaryTemplateId: "tmpl-modern-minimal",
    secondaryTemplateId: "tmpl-corporate-prestige",
    tertiaryTemplateId: "tmpl-tech-dynamic",
    primaryPaletteId: "slate-modern",
    typographyId: "corporate-sans",
    backgroundPresetId: "dark-luxury",
    rationale:
      "Sağlamlık, mühendislik disiplini ve tamamlanan projeleri sergileyen mimari ızgara tasarımı seçildi.",
    conversionBenefit:
      "Tamamlanan projeleri ve kurumsal mühendislik referanslarını organize görsel bloklarla sergiler.",
  },
  // 12. Kurumsal Danışmanlık & Finans
  {
    sectorKey: "consulting",
    keywords: ["danışmanlık", "finans", "mali müşavir", "muhasebe", "denetim", "b2b", "yönetim", "consulting"],
    presetId: "preset-consulting-advisory",
    primaryTemplateId: "tmpl-corporate-prestige",
    secondaryTemplateId: "tmpl-formal-legal",
    tertiaryTemplateId: "tmpl-modern-minimal",
    primaryPaletteId: "corporate-navy",
    typographyId: "corporate-sans",
    backgroundPresetId: "ocean-blue",
    rationale:
      "Kurumsal otorite, net bilgi mimarisi ve güven telkin eden derin lacivert profesyonellik bir araya getirildi.",
    conversionBenefit:
      "Hizmet kapsamını ve uzmanlık alanlarını kurumsal bir yapıda sunarak profesyonel danışmanlık taleplerini karşılar.",
  },
];

const DEFAULT_FALLBACK_RULE: SectorProfileRule = {
  sectorKey: "corporate",
  keywords: [],
  presetId: "preset-consulting-advisory",
  primaryTemplateId: "tmpl-corporate-prestige",
  secondaryTemplateId: "tmpl-modern-minimal",
  tertiaryTemplateId: "tmpl-rapid-service",
  primaryPaletteId: "corporate-navy",
  typographyId: "corporate-sans",
  backgroundPresetId: "ocean-blue",
  rationale:
    "Her sektöre uyum sağlayan dengeli kurumsal prestij mimarisi ve yüksek okunabilirlik.",
  conversionBenefit:
    "Profesyonel kurumsal imaj ile müşteri güvenini ilk temasta oluşturur.",
};

function matchesKeyword(inputLower: string, kw: string): boolean {
  if (kw.length <= 3) {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(^|[^a-z0-9ğüşıöçİĞÜŞÖÇ])${escaped}([^a-z0-9ğüşıöçİĞÜŞÖÇ]|$)`, "i");
    return regex.test(inputLower);
  }
  return inputLower.includes(kw);
}

/**
 * Finds matching sector rule based on sector name, description, or keywords
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
 * Generates top 3 canonical smart design recommendations for a business.
 * Pure & deterministic: never mutates site content.
 */
export function recommendDesignPackages(
  sectorOrKeywords: string,
  brandKit?: BrandKit | null
): readonly DesignPackageRecommendation[] {
  const rule = findMatchingSectorRule(sectorOrKeywords);
  const preset = getIndustryPresetById(rule.presetId);

  let primaryPaletteId = rule.primaryPaletteId;
  if (brandKit?.palette?.primary) {
    primaryPaletteId = "corporate-navy";
  }

  const templateIds: readonly CanonicalTemplateId[] = [
    rule.primaryTemplateId,
    rule.secondaryTemplateId,
    rule.tertiaryTemplateId,
  ];

  return templateIds.map((tmplId, idx) => {
    const tmpl = resolveTemplate(tmplId);
    const tmplName = tmpl ? tmpl.name : tmplId;
    const recipe = idx === 0 && preset ? preset.sectionVariants : tmpl ? tmpl.sectionRecipe : {};

    const palId = idx === 0 ? primaryPaletteId : idx === 1 ? "modern-blue" : "minimal-white";
    const pal = getPaletteById(palId);
    const typo = getTypographyPresetById(rule.typographyId);

    return {
      rank: idx + 1,
      templateId: tmplId,
      templateName: tmplName,
      presetId: preset ? preset.id : rule.presetId,
      presetName: idx === 0 && preset ? preset.name : tmplName,
      paletteId: pal.id,
      paletteName: pal.name,
      typographyId: typo.id,
      typographyName: typo.name,
      backgroundPresetId: rule.backgroundPresetId,
      headerVariant: recipe.header || "corporate-classic",
      footerVariant: recipe.footer || "corporate-multi",
      serviceCardStyle:
        (idx === 0 && preset?.sectionVariants.services) ||
        tmpl?.sectionRecipe.services ||
        "standard",
      sectionVariants: recipe,
      rationale: idx === 0 ? rule.rationale : `Alternatif ${idx + 1}: ${rule.conversionBenefit}`,
      conversionBenefit: rule.conversionBenefit,
      isPrimaryMatch: idx === 0,
    };
  });
}
