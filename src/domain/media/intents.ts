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
