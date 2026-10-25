/**
 * JetKur Premium Color Palette Engine (Theme Foundation 02D)
 *
 * ARCHITECTURAL PRINCIPLES:
 * 1. 16 Master Semantic Palettes covering all business and industry archetypes.
 * 2. Complete Token Coverage:
 *    - primary, secondary, accent, background, surface
 *    - foreground (text), mutedForeground (textMuted), border
 *    - buttonBackground, buttonForeground, link, hover, overlay
 * 3. WCAG AA (4.5:1) Contrast Compliance with automatic validation.
 * 4. Custom HEX color input support with deterministic harmonic derivation.
 * 5. Deterministic, zero runtime side-effects.
 */

import {
  normalizeHexColor,
  getContrastRatio,
  darkenColor,
  tintColor,
  getOptimalForeground,
} from "./colorUtils";
import { TemplateColorTokens } from "../site/designTemplate";

export interface PremiumPaletteTokens extends TemplateColorTokens {
  readonly id: string;
  readonly name: string;
  readonly category: "corporate" | "luxury" | "modern" | "natural" | "creative" | "dark" | "warm" | "minimal";
  readonly description: string;

  // Canonical base tokens
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

  // Extended Sprint 02D tokens
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
    description: "Finans, danışmanlık, kurumsal holding ve güven odaklı kurumsal işletmeler için otoriter lacivert tonlar.",
    primary: "#1E3A8A",
    primaryDark: "#172554",
    primaryLight: "#DBEAFE",
    secondary: "#F8FAFC",
    accent: "#D97706",
    background: "#FFFFFF",
    surface: "#F1F5F9",
    text: "#0F172A",
    textMuted: "#64748B",
    border: "#CBD5E1",
    foreground: "#0F172A",
    mutedForeground: "#64748B",
    buttonBackground: "#1E3A8A",
    buttonForeground: "#FFFFFF",
    link: "#1E3A8A",
    hover: "#172554",
    overlay: "rgba(15, 23, 42, 0.7)",
  },

  // 2. Modern Blue
  {
    id: "modern-blue",
    name: "Modern Blue",
    category: "modern",
    description: "Yazılım, teknoloji, modern sağlık ve çağdaş servisler için taze ve dinamik kobalt mavisi.",
    primary: "#2563EB",
    primaryDark: "#1D4ED8",
    primaryLight: "#EFF6FF",
    secondary: "#F0F9FF",
    accent: "#06B6D4",
    background: "#FFFFFF",
    surface: "#F8FAFC",
    text: "#0F172A",
    textMuted: "#64748B",
    border: "#E2E8F0",
    foreground: "#0F172A",
    mutedForeground: "#64748B",
    buttonBackground: "#2563EB",
    buttonForeground: "#FFFFFF",
    link: "#2563EB",
    hover: "#1D4ED8",
    overlay: "rgba(15, 23, 42, 0.65)",
  },

  // 3. Emerald Green
  {
    id: "emerald-green",
    name: "Emerald Green",
    category: "natural",
    description: "Sağlık merkezleri, diş klinikleri, çevre ve bio-teknoloji için canlı ve güvenli zümrüt yeşili.",
    primary: "#047857",
    primaryDark: "#065F46",
    primaryLight: "#ECFDF5",
    secondary: "#F0FDF4",
    accent: "#0284C7",
    background: "#FFFFFF",
    surface: "#F7FEE7",
    text: "#064E3B",
    textMuted: "#047857",
    border: "#A7F3D0",
    foreground: "#064E3B",
    mutedForeground: "#047857",
    buttonBackground: "#047857",
    buttonForeground: "#FFFFFF",
    link: "#047857",
    hover: "#065F46",
    overlay: "rgba(6, 78, 59, 0.75)",
  },

  // 4. Botanical Sage
  {
    id: "botanical-sage",
    name: "Botanical Sage",
    category: "natural",
    description: "Estetik klinikler, spa merkezleri, organik ürünler ve sakin mimari için adaçayı yeşili.",
    primary: "#4D7C0F",
    primaryDark: "#3F6212",
    primaryLight: "#F7FEE7",
    secondary: "#FAFAF9",
    accent: "#B45309",
    background: "#FEFCE8",
    surface: "#F5F5F4",
    text: "#1C1917",
    textMuted: "#78716C",
    border: "#D6D3D1",
    foreground: "#1C1917",
    mutedForeground: "#78716C",
    buttonBackground: "#4D7C0F",
    buttonForeground: "#FFFFFF",
    link: "#3F6212",
    hover: "#365314",
    overlay: "rgba(28, 25, 23, 0.6)",
  },

  // 5. Black & Gold
  {
    id: "black-gold",
    name: "Black & Gold",
    category: "luxury",
    description: "VIP transfer, lüks otel, mücevher ve yüksek bütçeli özel danışmanlık için obsidian ve altın uyumu.",
    primary: "#D97706",
    primaryDark: "#B45309",
    primaryLight: "#FEF3C7",
    secondary: "#18181B",
    accent: "#FBBF24",
    background: "#09090B",
    surface: "#18181B",
    text: "#FAFAFA",
    textMuted: "#A1A1AA",
    border: "#27272A",
    foreground: "#FAFAFA",
    mutedForeground: "#A1A1AA",
    buttonBackground: "#D97706",
    buttonForeground: "#09090B",
    link: "#FBBF24",
    hover: "#B45309",
    overlay: "rgba(9, 9, 11, 0.85)",
  },

  // 6. Champagne Luxury
  {
    id: "champagne-luxury",
    name: "Champagne Luxury",
    category: "luxury",
    description: "Butik oteller, lüks etkinlik mekanları ve gastronomi için şampanya ve sıcak bej zarafeti.",
    primary: "#B45309",
    primaryDark: "#92400E",
    primaryLight: "#FFFBEB",
    secondary: "#FDFBF7",
    accent: "#4F46E5",
    background: "#FFFCF6",
    surface: "#FBF7ED",
    text: "#292524",
    textMuted: "#78716C",
    border: "#E7E5E4",
    foreground: "#292524",
    mutedForeground: "#78716C",
    buttonBackground: "#B45309",
    buttonForeground: "#FFFFFF",
    link: "#B45309",
    hover: "#92400E",
    overlay: "rgba(41, 37, 36, 0.7)",
  },

  // 7. Royal Purple
  {
    id: "royal-purple",
    name: "Royal Purple",
    category: "corporate",
    description: "Hukuk büroları, noterler, patent ofisleri ve yüksek prestijli resmi kurumlar için kraliyet moru.",
    primary: "#6D28D9",
    primaryDark: "#5B21B6",
    primaryLight: "#EDE9FE",
    secondary: "#FAF5FF",
    accent: "#F43F5E",
    background: "#FFFFFF",
    surface: "#F5F3FF",
    text: "#1E1B4B",
    textMuted: "#6B7280",
    border: "#DDD6FE",
    foreground: "#1E1B4B",
    mutedForeground: "#6B7280",
    buttonBackground: "#6D28D9",
    buttonForeground: "#FFFFFF",
    link: "#6D28D9",
    hover: "#5B21B6",
    overlay: "rgba(30, 27, 75, 0.75)",
  },

  // 8. Violet Gradient
  {
    id: "violet-gradient",
    name: "Violet Gradient",
    category: "creative",
    description: "Yaratıcı stüdyolar, dijital ajanslar ve yeni nesil girişimler için enerjik menekşe ve fuşya gradyanı.",
    primary: "#8B5CF6",
    primaryDark: "#7C3AED",
    primaryLight: "#F5F3FF",
    secondary: "#FDF4FF",
    accent: "#EC4899",
    background: "#0F172A",
    surface: "#1E293B",
    text: "#F8FAFC",
    textMuted: "#94A3B8",
    border: "#334155",
    foreground: "#F8FAFC",
    mutedForeground: "#94A3B8",
    buttonBackground: "#6D28D9",
    buttonForeground: "#FFFFFF",
    link: "#C084FC",
    hover: "#5B21B6",
    overlay: "rgba(15, 23, 42, 0.8)",
  },

  // 9. Burgundy Elegance
  {
    id: "burgundy-elegance",
    name: "Burgundy Elegance",
    category: "luxury",
    description: "Özel şaraphaneler, lüks steakhouse, klasik avukatlık ve antika galerileri için zengin bordo.",
    primary: "#881337",
    primaryDark: "#701A75",
    primaryLight: "#FFE4E6",
    secondary: "#FFF1F2",
    accent: "#F59E0B",
    background: "#FFFFFF",
    surface: "#FFF5F5",
    text: "#4C0519",
    textMuted: "#831843",
    border: "#FECDD3",
    foreground: "#4C0519",
    mutedForeground: "#831843",
    buttonBackground: "#881337",
    buttonForeground: "#FFFFFF",
    link: "#881337",
    hover: "#701A75",
    overlay: "rgba(76, 5, 25, 0.8)",
  },

  // 10. Terracotta
  {
    id: "terracotta",
    name: "Terracotta",
    category: "warm",
    description: "Akdeniz restoranları, seramik atölyeleri, butik kafeler ve iç mimarlar için sıcak pişmiş toprak.",
    primary: "#C2410C",
    primaryDark: "#9A3412",
    primaryLight: "#FFEDD5",
    secondary: "#FFF7ED",
    accent: "#0D9488",
    background: "#FFFBF7",
    surface: "#FFFAF0",
    text: "#431407",
    textMuted: "#78716C",
    border: "#FED7AA",
    foreground: "#431407",
    mutedForeground: "#78716C",
    buttonBackground: "#C2410C",
    buttonForeground: "#FFFFFF",
    link: "#9A3412",
    hover: "#7C2D12",
    overlay: "rgba(67, 20, 7, 0.7)",
  },

  // 11. Ocean Teal
  {
    id: "ocean-teal",
    name: "Ocean Teal",
    category: "modern",
    description: "Marina, su sporları, sıhhi tesisat, diş klinikleri ve serinletici ferah servisler için derin turkuaz.",
    primary: "#0F766E",
    primaryDark: "#115E59",
    primaryLight: "#CCFBF1",
    secondary: "#F0FDFA",
    accent: "#0284C7",
    background: "#FFFFFF",
    surface: "#F0FDFA",
    text: "#134E4A",
    textMuted: "#2DD4BF",
    border: "#99F6E4",
    foreground: "#134E4A",
    mutedForeground: "#115E59",
    buttonBackground: "#0F766E",
    buttonForeground: "#FFFFFF",
    link: "#115E59",
    hover: "#042F2E",
    overlay: "rgba(19, 78, 74, 0.75)",
  },

  // 12. Minimal White
  {
    id: "minimal-white",
    name: "Minimal White",
    category: "minimal",
    description: "Mimari tasarım, çağdaş sanat, moda ve minimalist fotoğrafçılık için saf ve net beyaz fon.",
    primary: "#18181B",
    primaryDark: "#09090B",
    primaryLight: "#F4F4F5",
    secondary: "#FAFAFA",
    accent: "#71717A",
    background: "#FFFFFF",
    surface: "#F4F4F5",
    text: "#09090B",
    textMuted: "#71717A",
    border: "#E4E4E7",
    foreground: "#09090B",
    mutedForeground: "#71717A",
    buttonBackground: "#18181B",
    buttonForeground: "#FFFFFF",
    link: "#09090B",
    hover: "#27272A",
    overlay: "rgba(9, 9, 11, 0.5)",
  },

  // 13. Midnight Dark
  {
    id: "midnight-dark",
    name: "Midnight Dark",
    category: "dark",
    description: "Gece kulüpleri, siber güvenlik, yazılım evleri ve kripto platformları için ultra koyu antrasit.",
    primary: "#6366F1",
    primaryDark: "#4F46E5",
    primaryLight: "#EEF2FF",
    secondary: "#0F172A",
    accent: "#38BDF8",
    background: "#020617",
    surface: "#0F172A",
    text: "#F8FAFC",
    textMuted: "#94A3B8",
    border: "#1E293B",
    foreground: "#F8FAFC",
    mutedForeground: "#94A3B8",
    buttonBackground: "#4F46E5",
    buttonForeground: "#FFFFFF",
    link: "#818CF8",
    hover: "#4338CA",
    overlay: "rgba(2, 6, 23, 0.9)",
  },

  // 14. Copper Industrial
  {
    id: "copper-industrial",
    name: "Copper Industrial",
    category: "warm",
    description: "Ağır sanayi, çelik konstrüksiyon, elektrik mühendisliği ve müteahhitlik için bakır ve metalik gri.",
    primary: "#B45309",
    primaryDark: "#78350F",
    primaryLight: "#FEF3C7",
    secondary: "#F3F4F6",
    accent: "#F59E0B",
    background: "#FFFFFF",
    surface: "#F9FAFB",
    text: "#1F2937",
    textMuted: "#4B5563",
    border: "#D1D5DB",
    foreground: "#1F2937",
    mutedForeground: "#4B5563",
    buttonBackground: "#B45309",
    buttonForeground: "#FFFFFF",
    link: "#78350F",
    hover: "#78350F",
    overlay: "rgba(31, 41, 55, 0.75)",
  },

  // 15. Sunset Gradient
  {
    id: "sunset-gradient",
    name: "Sunset Gradient",
    category: "creative",
    description: "Seyahat acenteleri, yaz festivalleri, tatil köyleri ve dinamik girişimler için gün batımı sıcaklığı.",
    primary: "#E11D48",
    primaryDark: "#BE123C",
    primaryLight: "#FFE4E6",
    secondary: "#FFF1F2",
    accent: "#F97316",
    background: "#FFFFFF",
    surface: "#FFF7ED",
    text: "#881337",
    textMuted: "#9F1239",
    border: "#FECDD3",
    foreground: "#881337",
    mutedForeground: "#9F1239",
    buttonBackground: "#E11D48",
    buttonForeground: "#FFFFFF",
    link: "#BE123C",
    hover: "#9F1239",
    overlay: "rgba(136, 19, 55, 0.75)",
  },

  // 16. Warm Neutral
  {
    id: "warm-neutral",
    name: "Warm Neutral",
    category: "warm",
    description: "Psikologlar, pedagoglar, ev dekorasyonu ve danışmanlık merkezleri için huzurlu ve sıcak natürel tonlar.",
    primary: "#57534E",
    primaryDark: "#44403C",
    primaryLight: "#F5F5F4",
    secondary: "#FAFAF9",
    accent: "#D97706",
    background: "#FBFBFA",
    surface: "#F5F5F4",
    text: "#292524",
    textMuted: "#78716C",
    border: "#E7E5E4",
    foreground: "#292524",
    mutedForeground: "#78716C",
    buttonBackground: "#57534E",
    buttonForeground: "#FFFFFF",
    link: "#44403C",
    hover: "#292524",
    overlay: "rgba(41, 37, 36, 0.65)",
  },
];

/**
 * Fast lookup map by ID
 */
const PALETTES_BY_ID = new Map<string, PremiumPaletteTokens>(
  PREMIUM_PALETTES.map((p) => [p.id, p])
);

/**
 * List all 16 premium palettes
 */
export function listPremiumPalettes(): readonly PremiumPaletteTokens[] {
  return PREMIUM_PALETTES;
}

/**
 * Retrieve palette by id with fallback to corporate-navy
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
