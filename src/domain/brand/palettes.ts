/**
 * JetKur Premium Color Palette Presets (Theme Foundation 02D.R)
 *
 * ARCHITECTURAL PRINCIPLES:
 * 1. 16 Curated Professional Palettes tailored for Turkish & global SMB sectors.
 * 2. Maps cleanly into canonical DesignPaletteTokens / CustomDesignTokensOverride.
 * 3. Respects the 3-tier token precedence hierarchy:
 *    Priority 3: Explicit user custom tokens
 *    Priority 2: BrandKit extracted palette
 *    Priority 1: Canonical template manifest defaults
 * 4. Enforces WCAG 2.1 AA contrast validation (minimum 4.5:1) and CSS color sanitization.
 */

import {
  getContrastRatio,
  darkenColor,
  tintColor,
  normalizeHexColor,
  getOptimalForeground,
} from "./colorUtils";
import { TemplateColorTokens } from "../site/designTemplate";
import { validateColorToken } from "../../utils/staticCssGenerator";

export interface PremiumPaletteTokens {
  readonly id: string;
  readonly name: string;
  readonly category: "corporate" | "modern" | "luxury" | "warm" | "dark" | "vibrant";
  readonly description: string;
  readonly primary: string;
  readonly primaryDark: string;
  readonly primaryLight: string;
  readonly secondary: string;
  readonly accent: string;
  readonly background: string;
  readonly surface: string;
  readonly text: string;
  readonly textMuted: string;
  readonly border: string;
  readonly foreground: string;
  readonly mutedForeground: string;
  readonly buttonBackground: string;
  readonly buttonForeground: string;
  readonly link: string;
  readonly hover: string;
  readonly overlay: string;
}

export const PREMIUM_PALETTES: readonly PremiumPaletteTokens[] = [
  // 1. Corporate Navy
  {
    id: "corporate-navy",
    name: "Corporate Navy",
    category: "corporate",
    description: "Kurumsal danışmanlık, finans, mühendislik ve B2B firmaları için güven veren derin lacivert.",
    primary: "#1E3A8A",
    primaryDark: "#172554",
    primaryLight: "#DBEAFE",
    secondary: "#F8FAFC",
    accent: "#D97706",
    background: "#FFFFFF",
    surface: "#F1F5F9",
    text: "#0F172A",
    textMuted: "#475569",
    border: "#CBD5E1",
    foreground: "#0F172A",
    mutedForeground: "#475569",
    buttonBackground: "#1E3A8A",
    buttonForeground: "#FFFFFF",
    link: "#1E3A8A",
    hover: "#172554",
    overlay: "rgba(15, 23, 42, 0.78)",
  },
  // 2. Modern Blue
  {
    id: "modern-blue",
    name: "Modern Blue",
    category: "modern",
    description: "Sıhhi tesisat, teknik servis, bilişim ve modern hizmet işletmeleri için net ve dinamik mavi.",
    primary: "#0369A1",
    primaryDark: "#075985",
    primaryLight: "#E0F2FE",
    secondary: "#F0F9FF",
    accent: "#EA580C",
    background: "#FFFFFF",
    surface: "#F8FAFC",
    text: "#0C4A6E",
    textMuted: "#475569",
    border: "#BAE6FD",
    foreground: "#0C4A6E",
    mutedForeground: "#475569",
    buttonBackground: "#0369A1",
    buttonForeground: "#FFFFFF",
    link: "#0369A1",
    hover: "#075985",
    overlay: "rgba(12, 74, 110, 0.75)",
  },
  // 3. Emerald Green
  {
    id: "emerald-green",
    name: "Emerald Green",
    category: "modern",
    description: "Diş klinikleri, sağlık merkezleri, medikal ve çevre dostu hizmetler için ferah zümrüt yeşili.",
    primary: "#047857",
    primaryDark: "#065F46",
    primaryLight: "#D1FAE5",
    secondary: "#ECFDF5",
    accent: "#0284C7",
    background: "#FFFFFF",
    surface: "#F0FDF4",
    text: "#064E3B",
    textMuted: "#475569",
    border: "#A7F3D0",
    foreground: "#064E3B",
    mutedForeground: "#475569",
    buttonBackground: "#047857",
    buttonForeground: "#FFFFFF",
    link: "#065F46",
    hover: "#065F46",
    overlay: "rgba(6, 78, 59, 0.75)",
  },
  // 4. Royal Purple
  {
    id: "royal-purple",
    name: "Royal Purple",
    category: "luxury",
    description: "Hukuk büroları, arabuluculuk, eğitim kurumları ve seçkin danışmanlık markaları için otoriter mor.",
    primary: "#5B21B6",
    primaryDark: "#4C1D95",
    primaryLight: "#EDE9FE",
    secondary: "#F5F3FF",
    accent: "#B45309",
    background: "#FFFFFF",
    surface: "#FAF5FF",
    text: "#1E1B4B",
    textMuted: "#475569",
    border: "#DDD6FE",
    foreground: "#1E1B4B",
    mutedForeground: "#475569",
    buttonBackground: "#5B21B6",
    buttonForeground: "#FFFFFF",
    link: "#4C1D95",
    hover: "#4C1D95",
    overlay: "rgba(30, 27, 75, 0.78)",
  },
  // 5. Black & Gold
  {
    id: "black-gold",
    name: "Black & Gold",
    category: "luxury",
    description: "VIP transfer, lüks otel, mücevherat ve üst segment gayrimenkul için altın detaylı siyah.",
    primary: "#18181B",
    primaryDark: "#09090B",
    primaryLight: "#FEF3C7",
    secondary: "#FAFAF9",
    accent: "#B45309",
    background: "#FFFFFF",
    surface: "#F4F4F5",
    text: "#09090B",
    textMuted: "#52525B",
    border: "#E4E4E7",
    foreground: "#09090B",
    mutedForeground: "#52525B",
    buttonBackground: "#18181B",
    buttonForeground: "#FFFFFF",
    link: "#18181B",
    hover: "#27272A",
    overlay: "rgba(9, 9, 11, 0.85)",
  },
  // 6. Copper Industrial
  {
    id: "copper-industrial",
    name: "Copper Industrial",
    category: "warm",
    description: "Oto kurtarma, elektrik, inşaat, tesisat ve ağır sanayi için yüksek görünürlüklü bakır ve antrasit.",
    primary: "#C2410C",
    primaryDark: "#9A3412",
    primaryLight: "#FFEDD5",
    secondary: "#FFF7ED",
    accent: "#1E293B",
    background: "#FFFFFF",
    surface: "#F8FAFC",
    text: "#0F172A",
    textMuted: "#475569",
    border: "#FED7AA",
    foreground: "#0F172A",
    mutedForeground: "#475569",
    buttonBackground: "#C2410C",
    buttonForeground: "#FFFFFF",
    link: "#9A3412",
    hover: "#9A3412",
    overlay: "rgba(15, 23, 42, 0.80)",
  },
  // 7. Slate Modern
  {
    id: "slate-modern",
    name: "Slate Modern",
    category: "corporate",
    description: "Mimarlık ofisleri, yapı denetim ve endüstriyel tasarım stüdyoları için monokrom antrasit.",
    primary: "#334155",
    primaryDark: "#1E293B",
    primaryLight: "#E2E8F0",
    secondary: "#F8FAFC",
    accent: "#0284C7",
    background: "#FFFFFF",
    surface: "#F1F5F9",
    text: "#0F172A",
    textMuted: "#475569",
    border: "#CBD5E1",
    foreground: "#0F172A",
    mutedForeground: "#475569",
    buttonBackground: "#334155",
    buttonForeground: "#FFFFFF",
    link: "#1E293B",
    hover: "#0F172A",
    overlay: "rgba(15, 23, 42, 0.78)",
  },
  // 8. Terracotta Warm
  {
    id: "terracotta",
    name: "Terracotta",
    category: "warm",
    description: "Restoranlar, kafeler, fırınlar, butik atölyeler ve zanaatkar işletmeler için sıcak pişmiş toprak.",
    primary: "#B45309",
    primaryDark: "#92400E",
    primaryLight: "#FEF3C7",
    secondary: "#FFFBEB",
    accent: "#047857",
    background: "#FFFDF9",
    surface: "#FEF3C7",
    text: "#292524",
    textMuted: "#57534E",
    border: "#FDE68A",
    foreground: "#292524",
    mutedForeground: "#57534E",
    buttonBackground: "#B45309",
    buttonForeground: "#FFFFFF",
    link: "#92400E",
    hover: "#78350F",
    overlay: "rgba(41, 37, 36, 0.75)",
  },
  // 9. Minimal White
  {
    id: "minimal-white",
    name: "Minimal White",
    category: "modern",
    description: "Tasarım ajansları, fotoğraf stüdyoları ve kreatif portfolyolar için yüksek kontrastlı yalın siyah-beyaz.",
    primary: "#171717",
    primaryDark: "#0A0A0A",
    primaryLight: "#F5F5F5",
    secondary: "#FAFAFA",
    accent: "#2563EB",
    background: "#FFFFFF",
    surface: "#F5F5F5",
    text: "#171717",
    textMuted: "#525252",
    border: "#E5E5E5",
    foreground: "#171717",
    mutedForeground: "#525252",
    buttonBackground: "#171717",
    buttonForeground: "#FFFFFF",
    link: "#171717",
    hover: "#262626",
    overlay: "rgba(10, 10, 10, 0.75)",
  },
  // 10. Dark Luxury
  {
    id: "dark-luxury",
    name: "Dark Luxury",
    category: "dark",
    description: "Seçkin gece kulüpleri, lüks otomobil galerileri ve özel güvenlik firmaları için sofistike koyu tema.",
    primary: "#27272A",
    primaryDark: "#18181B",
    primaryLight: "#E4E4E7",
    secondary: "#F4F4F5",
    accent: "#CA8A04",
    background: "#FFFFFF",
    surface: "#F4F4F5",
    text: "#09090B",
    textMuted: "#52525B",
    border: "#D4D4D8",
    foreground: "#09090B",
    mutedForeground: "#52525B",
    buttonBackground: "#18181B",
    buttonForeground: "#FFFFFF",
    link: "#18181B",
    hover: "#09090B",
    overlay: "rgba(9, 9, 11, 0.85)",
  },
  // 11. Burgundy Prestige
  {
    id: "burgundy-prestige",
    name: "Burgundy Prestige",
    category: "luxury",
    description: "Noterler, yeminli tercümanlar, özel okullar ve geleneksel kurumlar için asil bordo.",
    primary: "#881337",
    primaryDark: "#4C0519",
    primaryLight: "#FFE4E6",
    secondary: "#FFF1F2",
    accent: "#B45309",
    background: "#FFFFFF",
    surface: "#FFF1F2",
    text: "#1F2937",
    textMuted: "#4B5563",
    border: "#FECDD3",
    foreground: "#1F2937",
    mutedForeground: "#4B5563",
    buttonBackground: "#881337",
    buttonForeground: "#FFFFFF",
    link: "#881337",
    hover: "#4C0519",
    overlay: "rgba(76, 5, 25, 0.80)",
  },
  // 12. Ocean Cyan
  {
    id: "ocean-cyan",
    name: "Ocean Cyan",
    category: "modern",
    description: "Kombi-klima servisi, su arıtma, havuz bakımı ve temizlik şirketleri için ferah okyanus mavisi.",
    primary: "#0E7490",
    primaryDark: "#155E75",
    primaryLight: "#CFFAFE",
    secondary: "#ECFEFF",
    accent: "#EA580C",
    background: "#FFFFFF",
    surface: "#F0FDFA",
    text: "#0F172A",
    textMuted: "#475569",
    border: "#A5F3FC",
    foreground: "#0F172A",
    mutedForeground: "#475569",
    buttonBackground: "#0E7490",
    buttonForeground: "#FFFFFF",
    link: "#155E75",
    hover: "#164E63",
    overlay: "rgba(22, 78, 99, 0.75)",
  },
  // 13. Botanical Sage
  {
    id: "botanical-sage",
    name: "Botanical Sage",
    category: "warm",
    description: "Güzellik salonları, spa merkezleri, diyetisyenler ve peyzaj mimarlığı için doğal adaçayı yeşili.",
    primary: "#3F6212",
    primaryDark: "#365314",
    primaryLight: "#ECFCCB",
    secondary: "#F7FEE7",
    accent: "#B45309",
    background: "#FFFFFF",
    surface: "#F7FEE7",
    text: "#1A2E05",
    textMuted: "#4D7C0F",
    border: "#D9F99D",
    foreground: "#1A2E05",
    mutedForeground: "#4D7C0F",
    buttonBackground: "#3F6212",
    buttonForeground: "#FFFFFF",
    link: "#365314",
    hover: "#1A2E05",
    overlay: "rgba(26, 46, 5, 0.75)",
  },
  // 14. Cobalt Tech
  {
    id: "cobalt-tech",
    name: "Cobalt Tech",
    category: "vibrant",
    description: "Yazılım evleri, dijital ajanslar, e-ticaret danışmanları ve SaaS ürünleri için enerjik kobalt.",
    primary: "#1D4ED8",
    primaryDark: "#1E40AF",
    primaryLight: "#DBEAFE",
    secondary: "#EFF6FF",
    accent: "#0891B2",
    background: "#FFFFFF",
    surface: "#F8FAFC",
    text: "#0F172A",
    textMuted: "#475569",
    border: "#BFDBFE",
    foreground: "#0F172A",
    mutedForeground: "#475569",
    buttonBackground: "#1D4ED8",
    buttonForeground: "#FFFFFF",
    link: "#1E40AF",
    hover: "#1E3A8A",
    overlay: "rgba(15, 23, 42, 0.78)",
  },
  // 15. Sunset Coral
  {
    id: "sunset-coral",
    name: "Sunset Coral",
    category: "vibrant",
    description: "Seyahat acenteleri, etkinlik organizasyon, tatil köyleri ve dinamik girişimler için gün batımı mercanı.",
    primary: "#BE123C",
    primaryDark: "#9F1239",
    primaryLight: "#FFE4E6",
    secondary: "#FFF1F2",
    accent: "#D97706",
    background: "#FFFFFF",
    surface: "#FFF7ED",
    text: "#4C0519",
    textMuted: "#881337",
    border: "#FECDD3",
    foreground: "#4C0519",
    mutedForeground: "#881337",
    buttonBackground: "#BE123C",
    buttonForeground: "#FFFFFF",
    link: "#9F1239",
    hover: "#881337",
    overlay: "rgba(76, 5, 25, 0.75)",
  },
  // 16. Warm Neutral
  {
    id: "warm-neutral",
    name: "Warm Neutral",
    category: "warm",
    description: "Psikologlar, pedagoglar, iç mimarlık ve danışmanlık merkezleri için huzurlu ve sıcak natürel tonlar.",
    primary: "#57534E",
    primaryDark: "#44403C",
    primaryLight: "#F5F5F4",
    secondary: "#FAFAF9",
    accent: "#B45309",
    background: "#FBFBFA",
    surface: "#F5F5F4",
    text: "#292524",
    textMuted: "#57534E",
    border: "#E7E5E4",
    foreground: "#292524",
    mutedForeground: "#57534E",
    buttonBackground: "#57534E",
    buttonForeground: "#FFFFFF",
    link: "#44403C",
    hover: "#292524",
    overlay: "rgba(41, 37, 36, 0.68)",
  },
];

const PALETTES_BY_ID = new Map<string, PremiumPaletteTokens>(
  PREMIUM_PALETTES.map((p) => [p.id, p])
);

/**
 * Lists all 16 curated premium palettes
 */
export function listPremiumPalettes(): readonly PremiumPaletteTokens[] {
  return PREMIUM_PALETTES;
}

/**
 * Retrieves palette by ID with deterministic fallback to corporate-navy
 */
export function getPaletteById(id: string): PremiumPaletteTokens {
  return PALETTES_BY_ID.get(id) || PREMIUM_PALETTES[0];
}

/**
 * Evaluates WCAG 2.1 AA Contrast (minimum 4.5:1 for body and normal buttons)
 */
export function auditPaletteWcagContrast(palette: PremiumPaletteTokens): {
  textOnBg: number;
  textOnSurface: number;
  btnTextOnBtnBg: number;
  passesWcag: boolean;
} {
  const textOnBg = getContrastRatio(palette.text, palette.background);
  const textOnSurface = getContrastRatio(palette.text, palette.surface);
  const btnTextOnBtnBg = getContrastRatio(palette.buttonForeground, palette.buttonBackground);

  const passesWcag = textOnBg >= 4.5 && textOnSurface >= 4.5 && btnTextOnBtnBg >= 4.5;

  return {
    textOnBg,
    textOnSurface,
    btnTextOnBtnBg,
    passesWcag,
  };
}

/**
 * Generates custom palette tokens from a user-provided custom HEX color
 */
export function createCustomPaletteFromHex(
  primaryHex: string,
  basePaletteId: string = "corporate-navy"
): PremiumPaletteTokens {
  const base = getPaletteById(basePaletteId);
  const normPrimary = normalizeHexColor(primaryHex) || base.primary;
  const primaryDark = darkenColor(normPrimary, 15);
  const primaryLight = tintColor(normPrimary, 0.85);
  const buttonForeground = getOptimalForeground(normPrimary);

  return {
    ...base,
    id: `custom-${normPrimary.replace("#", "")}`,
    name: `Özel Renk (${normPrimary})`,
    primary: normPrimary,
    primaryDark,
    primaryLight,
    buttonBackground: normPrimary,
    buttonForeground,
    link: normPrimary,
    hover: primaryDark,
  };
}

/**
 * Converts a PremiumPaletteTokens preset into sanitized canonical TemplateColorTokens
 * suitable for `designTemplate.customTokens.palette`.
 */
export function toCanonicalPaletteTokens(
  palette: PremiumPaletteTokens
): TemplateColorTokens {
  return {
    primary: validateColorToken(palette.primary, "#1E3A8A"),
    primaryDark: validateColorToken(palette.primaryDark, "#172554"),
    secondary: validateColorToken(palette.secondary, "#F8FAFC"),
    accent: validateColorToken(palette.accent, "#D97706"),
    text: validateColorToken(palette.text, "#0F172A"),
    textMuted: validateColorToken(palette.textMuted, "#475569"),
    background: validateColorToken(palette.background, "#FFFFFF"),
    surface: validateColorToken(palette.surface, "#F1F5F9"),
    border: validateColorToken(palette.border, "#CBD5E1"),
    surfaceAccent: validateColorToken(palette.primaryLight, "#DBEAFE"),
    surfaceMuted: validateColorToken(palette.surface, "#F1F5F9"),
  };
}
