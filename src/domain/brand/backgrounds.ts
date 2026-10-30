/**
 * JetKur Background & Surface Preset Engine (Theme Foundation 02D.R)
 *
 * ARCHITECTURAL PRINCIPLES:
 * 1. Background Types:
 *    - solid, linear-gradient, radial-gradient, subtle-texture,
 *    - background-image, image-overlay, gradient-overlay
 * 2. 6 Curated Gradient Presets:
 *    - Royal Purple, Ocean Blue, Emerald Glow, Sunset, Champagne, Dark Luxury
 * 3. Canonical Mapping:
 *    - Maps cleanly into canonical `DesignSurfaceTokens` (`heroSurface`, `servicesSurface`,
 *      `aboutSurface`, `ctaSurface`, `footerSurface`, `sectionDivider`).
 * 4. Security Hardening:
 *    - Validates and sanitizes all URLs and CSS values.
 *    - Rejects `javascript:`, `data:text/html`, `expression()`, unescaped quotes, and CSS breakouts.
 */

import { validateColorToken, isSafeCssValue } from "../../utils/staticCssGenerator";
import { sanitizeUrl } from "../../utils/generator/security";
import { SectionSurfaceTone, TemplateGeometryTokens } from "../site/designTemplate";

export type BackgroundType =
  | "solid"
  | "linear-gradient"
  | "radial-gradient"
  | "subtle-texture"
  | "background-image"
  | "image-overlay"
  | "gradient-overlay";

export interface GradientColorStop {
  color: string;
  position?: number; // 0 - 100 (%)
}

export interface GradientPreset {
  readonly id: string;
  readonly name: string;
  readonly type: "linear" | "radial";
  readonly angle: number;
  readonly stops: readonly GradientColorStop[];
  readonly description: string;
  readonly contrastMode: "dark" | "light";
  readonly canonicalHeroSurface: "light" | "muted" | "tinted" | "dark" | "gradient-brand";
}

export interface BackgroundConfig {
  type: BackgroundType;
  color?: string;
  gradientAngle?: number;
  gradientStops?: GradientColorStop[];
  presetId?: string;
  texturePattern?: "subtle-dots" | "subtle-grid" | "diagonal-lines" | "noise";
  imageUrl?: string;
  imagePosition?: "center" | "top" | "bottom";
  overlayOpacity?: number;
  overlayColor?: string;
  contrastMode?: "dark" | "light";
}

export const GRADIENT_PRESETS: readonly GradientPreset[] = [
  // 1. Royal Purple
  {
    id: "royal-purple",
    name: "Royal Purple",
    type: "linear",
    angle: 135,
    stops: [
      { color: "#4C1D95", position: 0 },
      { color: "#7C3AED", position: 50 },
      { color: "#C026D3", position: 100 },
    ],
    description: "Prestijli ve otoriter kraliyet moru ile fuşya geçişi.",
    contrastMode: "dark",
    canonicalHeroSurface: "gradient-brand",
  },
  // 2. Ocean Blue
  {
    id: "ocean-blue",
    name: "Ocean Blue",
    type: "linear",
    angle: 140,
    stops: [
      { color: "#0C4A6E", position: 0 },
      { color: "#0284C7", position: 60 },
      { color: "#06B6D4", position: 100 },
    ],
    description: "Derin okyanus mavisi ve turkuaz enerji akışı.",
    contrastMode: "dark",
    canonicalHeroSurface: "gradient-brand",
  },
  // 3. Emerald Glow
  {
    id: "emerald-glow",
    name: "Emerald Glow",
    type: "linear",
    angle: 120,
    stops: [
      { color: "#064E3B", position: 0 },
      { color: "#059669", position: 50 },
      { color: "#10B981", position: 100 },
    ],
    description: "Sağlık ve güven veren canlı zümrüt yeşili ışıltısı.",
    contrastMode: "dark",
    canonicalHeroSurface: "gradient-brand",
  },
  // 4. Sunset
  {
    id: "sunset",
    name: "Sunset",
    type: "linear",
    angle: 135,
    stops: [
      { color: "#881337", position: 0 },
      { color: "#E11D48", position: 50 },
      { color: "#F97316", position: 100 },
    ],
    description: "Sıcak gün batımı, gastronomi ve turizm için zengin tonlar.",
    contrastMode: "dark",
    canonicalHeroSurface: "gradient-brand",
  },
  // 5. Champagne
  {
    id: "champagne",
    name: "Champagne",
    type: "linear",
    angle: 150,
    stops: [
      { color: "#FEF3C7", position: 0 },
      { color: "#FDE68A", position: 60 },
      { color: "#F59E0B", position: 100 },
    ],
    description: "Lüks şampanya ışıltısı ve zarafet.",
    contrastMode: "light",
    canonicalHeroSurface: "tinted",
  },
  // 6. Dark Luxury
  {
    id: "dark-luxury",
    name: "Dark Luxury",
    type: "linear",
    angle: 135,
    stops: [
      { color: "#09090B", position: 0 },
      { color: "#18181B", position: 60 },
      { color: "#27272A", position: 100 },
    ],
    description: "Obsidian ve antrasit dokulu seçkin VIP karanlığı.",
    contrastMode: "dark",
    canonicalHeroSurface: "dark",
  },
];

export const GRADIENT_PRESETS_BY_ID = new Map<string, GradientPreset>(
  GRADIENT_PRESETS.map((p) => [p.id, p])
);

/**
 * Validates safe image URL specifically avoiding `javascript:`, `data:text/html`, and CSS injection
 */
export function validateSafeImageUrl(url: unknown): string | null {
  if (typeof url !== "string" || !url.trim()) return null;
  const trimmed = url.trim();

  // Reject dangerous protocols and CSS breakouts
  if (/^(javascript|vbscript|data):/i.test(trimmed)) return null;
  if (/[()"'\\;<>]|expression\s*\(|url\s*\(/i.test(trimmed)) return null;
  if (!isSafeCssValue(trimmed)) return null;

  const sanitized = sanitizeUrl(trimmed);
  if (!sanitized || sanitized === "#") return null;

  if (
    /^https?:\/\/[a-zA-Z0-9-._~:/?#[\]@!$&*+,;=%]+$/i.test(sanitized) ||
    /^\/[a-zA-Z0-9-._~/?#[\]@!$&*+,;=%]+$/i.test(sanitized)
  ) {
    return sanitized;
  }

  return null;
}

/**
 * Compiles a BackgroundConfig into safe CSS properties and contrast metadata
 */
export function compileBackgroundStyle(config: BackgroundConfig): {
  styleString: string;
  className: string;
  contrastMode: "dark" | "light";
} {
  const type = config.type || "solid";
  let contrastMode: "dark" | "light" = config.contrastMode || "light";

  if (type === "solid") {
    const color = validateColorToken(config.color, "#ffffff");
    return {
      styleString: `background-color: ${color};`,
      className: "jk-bg-solid",
      contrastMode,
    };
  }

  if (type === "linear-gradient" || type === "gradient-overlay") {
    let angle = Number(config.gradientAngle) || 135;
    if (angle < 0 || angle > 360) angle = 135;

    let stops: readonly GradientColorStop[] | undefined = config.gradientStops;
    if (config.presetId && GRADIENT_PRESETS_BY_ID.has(config.presetId)) {
      const preset = GRADIENT_PRESETS_BY_ID.get(config.presetId)!;
      angle = preset.angle;
      stops = preset.stops;
      contrastMode = preset.contrastMode;
    }

    if (!stops || stops.length < 2) {
      stops = [
        { color: "#1E3A8A", position: 0 },
        { color: "#2563EB", position: 100 },
      ];
      contrastMode = "dark";
    }

    const stopsCss = stops
      .map((s) => {
        const c = validateColorToken(s.color, "#1E3A8A");
        const pos =
          typeof s.position === "number" ? ` ${Math.max(0, Math.min(100, s.position))}%` : "";
        return `${c}${pos}`;
      })
      .join(", ");

    const gradientCss = `linear-gradient(${angle}deg, ${stopsCss})`;

    if (type === "gradient-overlay" && config.imageUrl) {
      const safeImg = validateSafeImageUrl(config.imageUrl);
      if (safeImg) {
        const opacity = Math.max(0, Math.min(1, Number(config.overlayOpacity) || 0.85));
        const pos =
          config.imagePosition === "top"
            ? "top center"
            : config.imagePosition === "bottom"
            ? "bottom center"
            : "center";
        return {
          styleString: `background: linear-gradient(rgba(0, 0, 0, ${opacity}), rgba(0, 0, 0, ${opacity})), url('${safeImg}'); background-size: cover; background-position: ${pos};`,
          className: "jk-bg-gradient-overlay",
          contrastMode: "dark",
        };
      }
    }

    return {
      styleString: `background: ${gradientCss};`,
      className: "jk-bg-gradient-linear",
      contrastMode,
    };
  }

  if (type === "radial-gradient") {
    let stops: readonly GradientColorStop[] | undefined = config.gradientStops;
    if (config.presetId && GRADIENT_PRESETS_BY_ID.has(config.presetId)) {
      const preset = GRADIENT_PRESETS_BY_ID.get(config.presetId)!;
      stops = preset.stops;
      contrastMode = preset.contrastMode;
    }

    if (!stops || stops.length < 2) {
      stops = [
        { color: "#3B82F6", position: 0 },
        { color: "#1E3A8A", position: 100 },
      ];
      contrastMode = "dark";
    }

    const stopsCss = stops
      .map((s) => {
        const c = validateColorToken(s.color, "#1E3A8A");
        const pos =
          typeof s.position === "number" ? ` ${Math.max(0, Math.min(100, s.position))}%` : "";
        return `${c}${pos}`;
      })
      .join(", ");

    return {
      styleString: `background: radial-gradient(circle at center, ${stopsCss});`,
      className: "jk-bg-gradient-radial",
      contrastMode,
    };
  }

  if (type === "subtle-texture") {
    const color = validateColorToken(config.color, "#f8fafc");
    const pattern = config.texturePattern || "subtle-dots";
    return {
      styleString: `background-color: ${color};`,
      className: `jk-bg-texture jk-texture-${pattern}`,
      contrastMode,
    };
  }

  if (type === "background-image" || type === "image-overlay") {
    const safeImg =
      validateSafeImageUrl(config.imageUrl) ||
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80";
    const pos =
      config.imagePosition === "top"
        ? "top center"
        : config.imagePosition === "bottom"
        ? "bottom center"
        : "center";

    if (type === "image-overlay") {
      const opacity = Math.max(0, Math.min(1, Number(config.overlayOpacity) || 0.75));
      return {
        styleString: `background: linear-gradient(rgba(15, 23, 42, ${opacity}), rgba(15, 23, 42, ${opacity})), url('${safeImg}'); background-size: cover; background-position: ${pos};`,
        className: "jk-bg-image-overlay",
        contrastMode: "dark",
      };
    }

    return {
      styleString: `background-image: url('${safeImg}'); background-size: cover; background-position: ${pos};`,
      className: "jk-bg-image",
      contrastMode,
    };
  }

  return {
    styleString: "background-color: #ffffff;",
    className: "jk-bg-solid",
    contrastMode: "light",
  };
}

/**
 * Maps a BackgroundConfig or GradientPreset into canonical section surface and geometry tokens
 */
export function toCanonicalSurfaceTokens(config: BackgroundConfig): {
  heroSurface: "light" | "muted" | "tinted" | "dark" | "gradient-brand";
  sectionSurfaceSequence: ReadonlyArray<SectionSurfaceTone>;
  heroGradient?: string;
} {
  if (config.presetId && GRADIENT_PRESETS_BY_ID.has(config.presetId)) {
    const preset = GRADIENT_PRESETS_BY_ID.get(config.presetId)!;
    const compiled = compileBackgroundStyle({
      type: "linear-gradient",
      presetId: preset.id,
      contrastMode: preset.contrastMode,
    });
    return {
      heroSurface: preset.canonicalHeroSurface,
      sectionSurfaceSequence:
        preset.contrastMode === "dark"
          ? ["gradient", "light", "muted", "dark"]
          : ["light", "muted", "bordered", "light"],
      heroGradient: compiled.styleString.replace(/^background:\s*/i, "").replace(/;$/, ""),
    };
  }
  if (config.type === "linear-gradient" || config.type === "radial-gradient") {
    return {
      heroSurface: "gradient-brand",
      sectionSurfaceSequence: ["gradient", "light", "muted", "dark"],
    };
  }
  if (config.contrastMode === "dark") {
    return {
      heroSurface: "dark",
      sectionSurfaceSequence: ["dark", "light", "muted", "dark"],
    };
  }
  return {
    heroSurface: "light",
    sectionSurfaceSequence: ["light", "muted", "light", "muted"],
  };
}
