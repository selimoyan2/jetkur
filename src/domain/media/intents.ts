/**
 * JetKur Canonical Image Intent Generator (Sprint 14)
 *
 * Derives structured image search intents from IndustryPack defaults and site content.
 * Keeps provider query logic strictly separated from IndustryPack storage.
 */

import { ImageIntent, ImageIntentCategory, ImageOrientation } from "./types";
import { IndustryPack } from "../site/industryPack";
import { CanonicalSite } from "../site/site";

const DEFAULT_NEGATIVE_KEYWORDS = [
  "cartoon",
  "illustration",
  "drawing",
  "vector",
  "3d render",
  "anime",
  "logo",
  "icon",
  "meme",
  "watermark",
  "text",
];

/**
 * Builds canonical image intents for a site based on its industry and content requirements.
 */
export function buildSiteImageIntents(site: CanonicalSite, pack?: IndustryPack): ImageIntent[] {
  const industrySlug = pack?.slug || site.industryPackId || "generic-business";
  const industryName = pack?.name || site.businessProfile.identity.sector || "İşletme";
  const companyName = site.businessProfile.identity.companyName;

  const intents: ImageIntent[] = [];

  // 1. Hero Intent (Landscape, 16:9, High visual impact)
  intents.push({
    category: "HERO",
    industrySlug,
    industryName,
    subject: `${industryName} profesyonel hizmet çalışma alanı`,
    orientation: "landscape",
    preferredAspectRatio: "16:9",
    keywords: [
      industrySlug.replace(/-/g, " "),
      "professional",
      "workplace",
      "service",
      "expert",
    ],
    negativeKeywords: DEFAULT_NEGATIVE_KEYWORDS,
    fallbackUrl:
      pack?.imageIntents?.find((i) => i.key === "hero-bg")?.fallbackUrl ||
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1600&q=80",
    suggestedAlt: `${companyName} profesyonel ${industryName.toLowerCase()} hizmeti`,
    slotKey: "hero-bg",
  });

  // 2. About Intent (Landscape or 4:3, Authentic team/craftsman)
  intents.push({
    category: "ABOUT",
    industrySlug,
    industryName,
    subject: `${industryName} usta ve uzman ekip`,
    orientation: "landscape",
    preferredAspectRatio: "4:3",
    keywords: [
      industrySlug.replace(/-/g, " "),
      "technician",
      "teamwork",
      "craftsman",
      "consultation",
    ],
    negativeKeywords: DEFAULT_NEGATIVE_KEYWORDS,
    fallbackUrl:
      pack?.imageIntents?.find((i) => i.key.includes("team") || i.key.includes("about"))?.fallbackUrl ||
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80",
    suggestedAlt: `${companyName} uzman ekibi ve çalışma ortamı`,
    slotKey: "about-main",
  });

  // 3. Services Intents (One per active service)
  const services = site.businessProfile.services || [];
  services.forEach((srv, idx) => {
    const srvName = typeof srv === "string" ? srv : srv.title || (srv as any).name || `Hizmet ${idx + 1}`;
    intents.push({
      category: "SERVICE",
      industrySlug,
      industryName,
      serviceTitle: srvName,
      subject: `${srvName} detay ve ekipman`,
      orientation: "landscape",
      preferredAspectRatio: "4:3",
      keywords: [
        srvName.toLowerCase(),
        industrySlug.replace(/-/g, " "),
        "repair",
        "service",
        "maintenance",
      ],
      negativeKeywords: DEFAULT_NEGATIVE_KEYWORDS,
      fallbackUrl:
        pack?.imageIntents?.[idx % (pack.imageIntents.length || 1)]?.fallbackUrl ||
        "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80",
      suggestedAlt: `${srvName} hizmeti uygulaması`,
      slotKey: `service-${idx + 1}`,
    });
  });

  // 4. Gallery Intents (3-4 items for work showcase)
  for (let g = 1; g <= 3; g++) {
    intents.push({
      category: "GALLERY",
      industrySlug,
      industryName,
      subject: `${industryName} tamamlanan iş örneği ${g}`,
      orientation: g % 2 === 0 ? "square" : "landscape",
      preferredAspectRatio: g % 2 === 0 ? "1:1" : "4:3",
      keywords: [
        industrySlug.replace(/-/g, " "),
        "renovation",
        "completed work",
        "quality service",
      ],
      negativeKeywords: DEFAULT_NEGATIVE_KEYWORDS,
      fallbackUrl:
        pack?.imageIntents?.[(g + 1) % (pack.imageIntents.length || 1)]?.fallbackUrl ||
        "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?auto=format&fit=crop&w=800&q=80",
      suggestedAlt: `${companyName} örnek uygulama ve iş alanı ${g}`,
      slotKey: `gallery-${g}`,
    });
  }

  return intents;
}

/**
 * Derives a concise, context-aware image search query for a service
 * based on industry pack/sector and service title.
 * Used for server-side search and Pexels modal suggestion.
 */
export function deriveServiceSearchQuery(
  serviceTitle: string,
  sectorOrIndustrySlug?: string,
  _context?: string
): string {
  const title = (serviceTitle || "").trim();
  const rawSector = (sectorOrIndustrySlug || "").toLowerCase();

  // Normalize industry category
  let sectorCategory = "general";
  if (/tesisat|plumb|su|sihhi/i.test(rawSector)) {
    sectorCategory = "plumbing";
  } else if (/kurtarma|oto|cekici|çekiç|tow/i.test(rawSector)) {
    sectorCategory = "towing";
  } else if (/di[sş]|hekim|dent/i.test(rawSector)) {
    sectorCategory = "dental";
  } else if (/hukuk|avukat|dava|law/i.test(rawSector)) {
    sectorCategory = "legal";
  } else if (/hal[ıi]|y[ıi]kama|clean/i.test(rawSector)) {
    sectorCategory = "cleaning";
  } else if (/nakliyat|ta[sş][ıi]|mov/i.test(rawSector)) {
    sectorCategory = "moving";
  } else if (/kombi|klima|hvac|isitma|ısıtma/i.test(rawSector)) {
    sectorCategory = "hvac";
  }

  // Sector-specific high-yield intent mappings (optimized for stock photo index)
  if (sectorCategory === "plumbing") {
    if (/su kaça[gğ]ı|ka[cç]ak|s[ıi]z[ıi]nt[ıi]|leak/i.test(title)) return "water leak detection";
    if (/t[ıi]kan[ıi]kl[ıi]k|gider|kanalizasyon|lavabo|klozet|drain|pipe/i.test(title)) return "plumber drain cleaning";
    if (/petek|kombi|radyat[oö]r|heating|boiler/i.test(title)) return "boiler heating repair";
    if (/musluk|batarya|rezervuar|faucet|tap/i.test(title)) return "faucet plumbing installation";
    if (/k[ıi]rmadan|termal|kamera|cihaz|tespit/i.test(title)) return "plumbing inspection";
    return "plumber service repair";
  }

  if (sectorCategory === "towing") {
    if (/[cç]ekici|kurtarma|kurtar[ıi]c[ıi]|tow/i.test(title)) return "flatbed tow truck";
    if (/ak[uü]|yol yard[ıi]m|battery|jump/i.test(title)) return "roadside assistance car";
    if (/kaza|ar[ıi]za|hasar/i.test(title)) return "car breakdown towing";
    return "tow truck service";
  }

  if (sectorCategory === "dental") {
    if (/beyazlatma|bleaching|whitening/i.test(title)) return "teeth whitening dental";
    if (/implant|protez/i.test(title)) return "dental implant clinic";
    if (/tel|ortodonti|braces/i.test(title)) return "orthodontics braces dentist";
    if (/dolgu|kanal|root canal/i.test(title)) return "dentist teeth treatment";
    return "dentist clinic care";
  }

  if (sectorCategory === "legal") {
    if (/ceza|dava|court|trial/i.test(title)) return "lawyer courtroom legal";
    if (/bo[sş]anma|aile|family/i.test(title)) return "family lawyer consultation";
    if (/s[oö]zle[sş]me|ticaret|corporate/i.test(title)) return "business contract law";
    return "lawyer legal consultation";
  }

  if (sectorCategory === "cleaning") {
    if (/koltuk|kanepe|sofa|upholstery/i.test(title)) return "sofa upholstery cleaning";
    if (/hal[ıi]|carpet|rug/i.test(title)) return "professional carpet wash";
    if (/perde|stor|zebra/i.test(title)) return "curtain dry cleaning";
    return "carpet cleaning service";
  }

  if (sectorCategory === "moving") {
    if (/asans[oö]rl[uü]|lift/i.test(title)) return "moving furniture lift";
    if (/paketleme|ambalaj|packing|box/i.test(title)) return "moving boxes packing";
    if (/[sş]ehirleraras[ıi]|[sş]ehir i[cç]i/i.test(title)) return "moving truck transport";
    return "moving truck logistics";
  }

  if (sectorCategory === "hvac") {
    if (/klima|air condition/i.test(title)) return "air conditioner service";
    if (/kombi|kazan|boiler/i.test(title)) return "hvac boiler repair";
    return "hvac technician service";
  }

  // Generic fallback: strip fluff/stop words
  const stopWords = new Set([
    "kırmadan", "cihazla", "noktasal", "kameralı", "acil", "hızlı", "yerinde",
    "garantili", "uygun", "fiyatlı", "fiyat", "profesyonel", "uzman", "özel",
    "ozel", "tam", "ve", "ile", "için", "hizmeti", "hizmetleri", "servisi",
    "işleri", "islemleri", "işlemleri"
  ]);

  const cleanWords = title
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !stopWords.has(w.toLowerCase()));

  if (cleanWords.length > 0) {
    return cleanWords.slice(0, 3).join(" ");
  }

  return title || "business service";
}
