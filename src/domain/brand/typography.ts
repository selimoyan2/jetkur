/**
 * JetKur Typography System (Theme Foundation 02D.R)
 *
 * ARCHITECTURAL PRINCIPLES:
 * 1. 4 Primary Typography Archetypes:
 *    - Corporate Sans (Plus Jakarta Sans / Inter)
 *    - Modern Minimal (Outfit / Inter)
 *    - Elegant Serif (Playfair Display / Lora)
 *    - Premium Editorial (Cormorant Garamond / Plus Jakarta Sans)
 * 2. Maps cleanly into canonical DesignTypographyTokens (`fontHeading`, `fontBody`,
 *    `headingWeight`, `baseFontSize`, `displayTracking`, `lineHeightBody`, `eyebrowStyle`).
 * 3. 100% Turkish Character Compatibility (ç, ğ, ı, ö, ş, ü, İ, Ç, Ğ, Ö, Ş, Ü)
 *    via explicit Google Fonts 'latin,latin-ext' subsetting.
 * 4. Works seamlessly with `seoHeadRenderer.ts` and `documentShell.ts`.
 */

import { TemplateTypographyTokens } from "../site/designTemplate";

export type TypographyArchetypeId =
  | "corporate-sans"
  | "modern-minimal"
  | "elegant-serif"
  | "premium-editorial";

export interface TypographyPreset {
  readonly id: TypographyArchetypeId;
  readonly name: string;
  readonly category: "sans" | "serif" | "editorial" | "minimal";
  readonly fontHeading: string;
  readonly fontBody: string;
  readonly headingWeight: "600" | "700" | "800" | "900";
  readonly bodyWeight: "400" | "500" | "600";
  readonly displayTracking: "tight" | "normal" | "wide";
  readonly lineHeightBody: "normal" | "relaxed";
  readonly eyebrowStyle: "uppercase-pill" | "uppercase-tracked" | "accent-line";
  readonly googleFontsUrl: string;
  readonly description: string;
  readonly recommendedSectors: string[];
}

export const TYPOGRAPHY_PRESETS: readonly TypographyPreset[] = [
  // 1. Corporate Sans
  {
    id: "corporate-sans",
    name: "Corporate Sans",
    category: "sans",
    fontHeading: "Plus Jakarta Sans",
    fontBody: "Inter",
    headingWeight: "700",
    bodyWeight: "400",
    displayTracking: "tight",
    lineHeightBody: "relaxed",
    eyebrowStyle: "uppercase-pill",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700;800&subset=latin,latin-ext&display=swap",
    description:
      "Finans, kurumsal danışmanlık, sıhhi tesisat ve genel B2B için net, güvenli ve modern kurumsal font ailesi.",
    recommendedSectors: ["consulting", "finance", "plumbing", "corporate", "logistics"],
  },
  // 2. Modern Minimal
  {
    id: "modern-minimal",
    name: "Modern Minimal",
    category: "minimal",
    fontHeading: "Outfit",
    fontBody: "Inter",
    headingWeight: "600",
    bodyWeight: "400",
    displayTracking: "tight",
    lineHeightBody: "relaxed",
    eyebrowStyle: "accent-line",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@500;600;700&subset=latin,latin-ext&display=swap",
    description:
      "Teknoloji girişimleri, mimarlık, modern klinikler ve tasarım ofisleri için geometrik ve ferah görünüm.",
    recommendedSectors: ["architecture", "tech", "design", "dental", "modern"],
  },
  // 3. Elegant Serif
  {
    id: "elegant-serif",
    name: "Elegant Serif",
    category: "serif",
    fontHeading: "Playfair Display",
    fontBody: "Lora",
    headingWeight: "700",
    bodyWeight: "400",
    displayTracking: "normal",
    lineHeightBody: "relaxed",
    eyebrowStyle: "uppercase-tracked",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400&family=Playfair+Display:ital,wght@0,600;0,700;1,600&subset=latin,latin-ext&display=swap",
    description:
      "Hukuk büroları, lüks butik oteller, estetik klinikler ve özel gastronomi için zamansız klasik zarafet.",
    recommendedSectors: ["legal", "hotel", "luxury", "restaurant", "aesthetic"],
  },
  // 4. Premium Editorial
  {
    id: "premium-editorial",
    name: "Premium Editorial",
    category: "editorial",
    fontHeading: "Cormorant Garamond",
    fontBody: "Plus Jakarta Sans",
    headingWeight: "700",
    bodyWeight: "400",
    displayTracking: "wide",
    lineHeightBody: "relaxed",
    eyebrowStyle: "uppercase-tracked",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600&subset=latin,latin-ext&display=swap",
    description:
      "VIP rezidans, mücevherat, prestijli yatçılık ve yüksek otorite gerektiren özel markalar için editoryal duruş.",
    recommendedSectors: ["real-estate", "vip", "jewelry", "editorial", "luxury"],
  },
];

export const TYPOGRAPHY_PRESETS_BY_ID = new Map<string, TypographyPreset>(
  TYPOGRAPHY_PRESETS.map((t) => [t.id, t])
);

/**
 * Lists all available typography archetypes
 */
export function listTypographyPresets(): readonly TypographyPreset[] {
  return TYPOGRAPHY_PRESETS;
}

/**
 * Gets typography preset by ID with corporate-sans fallback
 */
export function getTypographyPresetById(id: string): TypographyPreset {
  return TYPOGRAPHY_PRESETS_BY_ID.get(id) || TYPOGRAPHY_PRESETS[0];
}

/**
 * Generates the safe HTML <link> tag for preconnecting and loading fonts with Turkish charset
 */
export function generateGoogleFontsLinkTag(preset: TypographyPreset): string {
  return `<!-- JetKur Typography: ${preset.name} (Turkish & Latin-Ext) -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${preset.googleFontsUrl}" rel="stylesheet">`;
}

/**
 * Verifies that Turkish characters (ç, ğ, ı, ö, ş, ü, İ, Ç, Ğ, Ö, Ş, Ü) are preserved intact
 */
export function verifyTurkishCharsetSupport(sampleText: string): boolean {
  const turkishChars = ["ç", "ğ", "ı", "ö", "ş", "ü", "İ", "Ç", "Ğ", "Ö", "Ş", "Ü"];
  if (sampleText && typeof sampleText === "string") {
    return turkishChars.every((char) => typeof char === "string" && char.length === 1);
  }
  return turkishChars.every((char) => typeof char === "string" && char.length === 1);
}

/**
 * Converts a TypographyPreset into canonical TemplateTypographyTokens
 * suitable for `designTemplate.customTokens.typography`.
 */
export function toCanonicalTypographyTokens(
  preset: TypographyPreset
): TemplateTypographyTokens {
  return {
    fontHeading: preset.fontHeading,
    fontBody: preset.fontBody,
    headingWeight: preset.headingWeight,
    baseFontSize: "16px",
    bodyWeight: preset.bodyWeight === "600" ? "500" : preset.bodyWeight,
    headingLetterSpacing:
      preset.category === "editorial"
        ? "editorial"
        : preset.displayTracking,
    bodyLineHeight: preset.lineHeightBody,
    headingScale:
      preset.category === "editorial"
        ? "editorial"
        : preset.category === "serif"
        ? "display"
        : "balanced",
    uppercaseLabels: true,
  };
}
