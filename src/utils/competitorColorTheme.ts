export interface CompetitorColorPalette {
  user: string;  // Siteniz / Markanız
  comp1: string; // 1. Rakip
  comp2: string; // 2. Rakip
  comp3: string; // 3. Rakip
}

export interface CompetitorThemePreset {
  id: string;
  name: string;
  badge: string;
  description: string;
  colors: CompetitorColorPalette;
}

export const DEFAULT_COMPETITOR_PALETTE: CompetitorColorPalette = {
  user: "#f59e0b",
  comp1: "#ef4444",
  comp2: "#0ea5e9",
  comp3: "#10b981"
};

export const COMPETITOR_THEME_PRESETS: CompetitorThemePreset[] = [
  {
    id: "default-amber-coral",
    name: "Varsayılan Klasik (Amber & Mercan)",
    badge: "Önerilen",
    description: "Siteniz için sıcak kehribar, rakipler için mercan kırmızısı, gök mavisi ve zümrüt.",
    colors: {
      user: "#f59e0b",
      comp1: "#ef4444",
      comp2: "#0ea5e9",
      comp3: "#10b981"
    }
  },
  {
    id: "neon-cyberpunk",
    name: "Neon Siberpunk (Canlı Kontrast)",
    badge: "Yüksek Kontrast",
    description: "Karanlık arayüzde maksimum ayrışma sağlayan neon camgöbeği, fuşya, mor ve sarı.",
    colors: {
      user: "#06b6d4",
      comp1: "#f43f5e",
      comp2: "#a855f7",
      comp3: "#eab308"
    }
  },
  {
    id: "ocean-emerald",
    name: "Okyanus & Zümrüt (Teal Pro)",
    badge: "Sakin",
    description: "Gözü yormayan profesyonel turkuaz, safir mavisi, pembe mercan ve lavanta.",
    colors: {
      user: "#14b8a6",
      comp1: "#3b82f6",
      comp2: "#ec4899",
      comp3: "#8b5cf6"
    }
  },
  {
    id: "sunset-warmth",
    name: "Gün Batımı Ateşi (Sıcak Tonlar)",
    badge: "Dinamik",
    description: "Enerjik altın sarısı, alev turuncusu, gül kurusu ve akşam moru.",
    colors: {
      user: "#fbbf24",
      comp1: "#f97316",
      comp2: "#e11d48",
      comp3: "#9333ea"
    }
  },
  {
    id: "corporate-indigo",
    name: "Kurumsal Indigo & Safir",
    badge: "Kurumsal",
    description: "Kurumsal SaaS ve finans analizlerine uygun sofistike indigo, parlak mavi ve amber.",
    colors: {
      user: "#6366f1",
      comp1: "#3b82f6",
      comp2: "#10b981",
      comp3: "#f59e0b"
    }
  },
  {
    id: "accessible-high-contrast",
    name: "Erişilebilir Yüksek Kontrast (WCAG AAA)",
    badge: "Erişilebilir",
    description: "Renk hassasiyeti olanlar ve projeksiyon sunumları için yüksek kontrastlı net tonlar.",
    colors: {
      user: "#facc15",
      comp1: "#dc2626",
      comp2: "#2563eb",
      comp3: "#16a34a"
    }
  }
];

export const PRESET_SWATCHES = [
  "#f59e0b", "#ef4444", "#0ea5e9", "#10b981",
  "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e",
  "#06b6d4", "#14b8a6", "#84cc16", "#eab308",
  "#f97316", "#d97706", "#2563eb", "#3b82f6",
  "#a855f7", "#e11d48", "#15803d", "#0284c7"
];

const STORAGE_KEY = "seo_competitor_d3_color_theme";

export function loadSavedColorTheme(): CompetitorColorPalette {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (
        parsed &&
        typeof parsed.user === "string" &&
        typeof parsed.comp1 === "string"
      ) {
        return {
          user: parsed.user,
          comp1: parsed.comp1,
          comp2: parsed.comp2 || DEFAULT_COMPETITOR_PALETTE.comp2,
          comp3: parsed.comp3 || DEFAULT_COMPETITOR_PALETTE.comp3
        };
      }
    }
  } catch (e) {
    console.warn("Failed to load saved competitor color theme:", e);
  }
  return DEFAULT_COMPETITOR_PALETTE;
}

export function saveColorTheme(palette: CompetitorColorPalette): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(palette));
  } catch (e) {
    console.warn("Failed to save competitor color theme:", e);
  }
}
