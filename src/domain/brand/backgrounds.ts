/**
 * JetKur Background & Gradient Engine (Theme Foundation 02D)
 *
 * ARCHITECTURAL PRINCIPLES:
 * 1. Background Types:
 *    - solid, linear-gradient, radial-gradient, subtle-texture,
 *    - background-image, image-overlay, gradient-overlay
 * 2. Pre-configured high-converting gradient presets:
 *    - Royal Purple, Ocean Blue, Emerald Glow, Sunset, Champagne, Dark Luxury
 * 3. Security Hardening: Validates and sanitizes all URLs and CSS values.
 *    Rejects javascript:, expression(), unescaped quotes, or css breakouts.
 * 4. Deterministic compile function to pure inline/CSS utility styles.
 */

import { validateColorToken, isSafeCssValue } from "../../utils/staticCssGenerator";
import { sanitizeUrl } from "../../utils/generator/security";

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
  id: string;
  name: string;
  type: "linear" | "radial";
  angle: number; // in degrees, e.g. 135
  stops: GradientColorStop[];
  description: string;
  contrastMode: "dark" | "light"; // dark = white text, light = dark text
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
  overlayOpacity?: number; // 0.0 to 1.0
  overlayColor?: string;
  contrastMode?: "dark" | "light";
}

/**
 * 6 Master Gradient Presets required by Sprint 02D specification
 */
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
  },
];

export const GRADIENT_PRESETS_BY_ID = new Map<string, GradientPreset>(
  GRADIENT_PRESETS.map((p) => [p.id, p])
);

/**
 * Validates safe image URL specifically avoiding javascript: and css injection
 */
export function validateSafeImageUrl(url: unknown): string | null {
  if (typeof url !== "string" || !url.trim()) return null;
  const trimmed = url.trim();
  if (!isSafeCssValue(trimmed)) return null;

  const sanitized = sanitizeUrl(trimmed);
  if (!sanitized) return null;

  // Ensure it is a valid web URL or clean relative path
  if (/^https?:\/\/[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=%]+$/i.test(sanitized) || /^\/[a-zA-Z0-9-._~/?#[\]@!$&'()*+,;=%]+$/i.test(sanitized)) {
    return sanitized;
  }
  return null;
}

/**
 * Builds safe CSS background property value from BackgroundConfig
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

    let stops = config.gradientStops;
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
        const pos = typeof s.position === "number" ? ` ${Math.max(0, Math.min(100, s.position))}%` : "";
        return `${c}${pos}`;
      })
      .join(", ");

    const gradientCss = `linear-gradient(${angle}deg, ${stopsCss})`;

    if (type === "gradient-overlay" && config.imageUrl) {
      const safeImg = validateSafeImageUrl(config.imageUrl);
      if (safeImg) {
        const opacity = Math.max(0, Math.min(1, Number(config.overlayOpacity) || 0.85));
        return {
          styleString: `background: linear-gradient(rgba(0, 0, 0, ${opacity}), rgba(0, 0, 0, ${opacity})), url('${safeImg}'); background-size: cover; background-position: ${config.imagePosition || "center"};`,
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
    let stops = config.gradientStops;
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
        const pos = typeof s.position === "number" ? ` ${Math.max(0, Math.min(100, s.position))}%` : "";
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
    const safeImg = validateSafeImageUrl(config.imageUrl) || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80";
    const pos = config.imagePosition === "top" ? "top center" : config.imagePosition === "bottom" ? "bottom center" : "center";

    if (type === "image-overlay") {
      const overlayColor = validateColorToken(config.overlayColor, "rgba(15, 23, 42, 0.75)");
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
