/**
 * JetKur Canonical Template Manifest: VIP Luxury
 *
 * Designed for luxury beauty salons, VIP services, premium event planners, and high-end aesthetics.
 * Features opulent gold/amber accents, centered prestige hero, and rating badge vitrines.
 */

import { TemplateManifest } from "../types";

export const vipLuxuryManifest: TemplateManifest = {
  schemaVersion: 1,
  id: "tmpl-vip-luxury",
  slug: "vip-luxury",
  name: "Lüks VIP & Estetik",
  description: "Özel klinikler, VIP salonlar ve seçkin hizmet sunucuları için altın yaldızlı vurgular ve üst düzey kurumsal vitrin.",
  version: "1.0.0",
  status: "ACTIVE",
  category: "luxury",
  previewImageUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80",
  designTokens: {
    palette: {
      primary: "#D97706",
      primaryDark: "#B45309",
      secondary: "#FFFBEB",
      accent: "#4338CA",
      text: "#1E1B4B",
      textMuted: "#6B7280",
      background: "#FFFFFF",
      surface: "#FFFBEB",
      border: "#FDE68A",
      surfaceMuted: "#F5F0E6",
      surfaceDark: "#090D16",
      surfaceAccent: "#FEF3C7",
      heroGradient: "linear-gradient(135deg, #090d16 0%, #1c1917 65%, #451a03 100%)",
      sectionGradient: "linear-gradient(180deg, #faf8f5 0%, #f5f0e6 100%)",
    },
    typography: {
      fontHeading: "Cormorant Garamond",
      fontBody: "Plus Jakarta Sans",
      headingWeight: "700",
      baseFontSize: "16px",
      bodyWeight: "400",
      headingLetterSpacing: "editorial",
      bodyLineHeight: "relaxed",
      headingScale: "editorial",
      uppercaseLabels: true,
    },
    geometry: {
      borderRadius: "xl",
      containerMaxWidth: "standard",
      sectionSpacing: "spacious",
      cardStyle: "elevated",
      cardShadow: "luxury",
      borderTreatment: "accent-top",
      buttonRadius: "sm",
      buttonEmphasis: "outline-refined",
      heroTextWidth: "narrow",
      sectionDivider: "editorial-rule",
      sectionSurfaceSequence: ["dark", "editorial", "light", "dark", "editorial", "light"],
    },
    header: {
      layout: "premium-luxury",
      showTopBar: true,
    },
    footer: {
      layout: "premium",
    },
  },
  sectionRecipe: {
    header: "premium-luxury",
    hero: "centered-prestige",
    about: "image-left",
    services: "bordered-premium",
    whyUs: "metrics-badges",
    gallery: "carousel",
    pricing: "cards-3",
    testimonials: "badge-rating",
    contact: "formal-consultation-form",
    footer: "premium",
  },
  sectionDefaults: [
    { sectionId: "header", defaultEnabled: true, recommendedOrder: 0 },
    { sectionId: "hero", defaultEnabled: true, recommendedOrder: 1 },
    { sectionId: "about", defaultEnabled: true, recommendedOrder: 2 },
    { sectionId: "services", defaultEnabled: true, recommendedOrder: 3 },
    { sectionId: "pricing", defaultEnabled: false, recommendedOrder: 4 },
    { sectionId: "gallery", defaultEnabled: true, recommendedOrder: 5 },
    { sectionId: "whyUs", defaultEnabled: true, recommendedOrder: 6 },
    { sectionId: "testimonials", defaultEnabled: true, recommendedOrder: 7 },
    { sectionId: "contact", defaultEnabled: true, recommendedOrder: 8 },
    { sectionId: "footer", defaultEnabled: true, recommendedOrder: 999 },
  ],
  capabilities: {
    supportsDarkMode: false,
    isResponsive: true,
    supportsCustomTokens: true,
    maxHeaderLinks: 6,
    recommendedContainerWidth: "standard",
  },
  recommendedIndustries: ["luxury", "beauty", "vip-services", "wellness", "lifestyle"],
  tags: ["lüks", "altın", "vip", "estetik", "prestij"],
};
