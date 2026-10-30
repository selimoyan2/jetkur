/**
 * JetKur Canonical Template Manifest: Artisan Warm
 *
 * Designed for restaurants, bakeries, artisan workshops, and local gourmet businesses.
 * Features warm crimson/amber accents, story-driven card styling, and visual mosaic showcases.
 */

import { TemplateManifest } from "../types";

export const artisanWarmManifest: TemplateManifest = {
  schemaVersion: 1,
  id: "tmpl-artisan-warm",
  slug: "artisan-warm",
  name: "Sıcak Zanaat & Butik",
  description: "Restoranlar, gurme lezzetler, el sanatları ve butik atölyeler için zengin görsel hikaye anlatımı ve sıcak renk armonisi.",
  version: "1.0.0",
  status: "ACTIVE",
  category: "artisan",
  previewImageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
  designTokens: {
    palette: {
      primary: "#DC2626",
      primaryDark: "#B91C1C",
      secondary: "#FEF2F2",
      accent: "#F59E0B",
      text: "#1C1917",
      textMuted: "#78716C",
      background: "#FFFFFF",
      surface: "#FFFBEB",
      border: "#FDE68A",
      surfaceMuted: "#FEF3C7",
      surfaceDark: "#292524",
      surfaceAccent: "#FFF7ED",
      heroGradient: "linear-gradient(135deg, #292524 0%, #7f1d1d 100%)",
      sectionGradient: "linear-gradient(180deg, #fffbeb 0%, #fef3c7 100%)",
    },
    typography: {
      fontHeading: "Playfair Display",
      fontBody: "Plus Jakarta Sans",
      headingWeight: "700",
      baseFontSize: "16px",
      bodyWeight: "400",
      headingLetterSpacing: "normal",
      bodyLineHeight: "relaxed",
      headingScale: "editorial",
      uppercaseLabels: false,
    },
    geometry: {
      borderRadius: "xl",
      containerMaxWidth: "standard",
      sectionSpacing: "normal",
      cardStyle: "elevated",
      cardShadow: "elevated",
      borderTreatment: "subtle",
      buttonRadius: "xl",
      buttonEmphasis: "solid",
      heroTextWidth: "balanced",
      sectionDivider: "soft-band",
      sectionSurfaceSequence: ["gradient", "light", "muted", "dark", "light", "muted"],
    },
    header: {
      layout: "centered",
      showTopBar: true,
    },
    footer: {
      layout: "multi-column-rich",
    },
  },
  sectionRecipe: {
    header: "centered",
    hero: "image-background",
    about: "cards-narrative",
    services: "image-card",
    whyUs: "cards-3",
    gallery: "mosaic",
    testimonials: "carousel",
    faqs: "separated-cards",
    contact: "split-map-form",
    footer: "multi-column",
  },
  sectionDefaults: [
    { sectionId: "header", defaultEnabled: true, recommendedOrder: 0 },
    { sectionId: "hero", defaultEnabled: true, recommendedOrder: 1 },
    { sectionId: "about", defaultEnabled: true, recommendedOrder: 2 },
    { sectionId: "services", defaultEnabled: true, recommendedOrder: 3 },
    { sectionId: "gallery", defaultEnabled: true, recommendedOrder: 4 },
    { sectionId: "whyUs", defaultEnabled: true, recommendedOrder: 5 },
    { sectionId: "testimonials", defaultEnabled: true, recommendedOrder: 6 },
    { sectionId: "faqs", defaultEnabled: true, recommendedOrder: 7 },
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
  recommendedIndustries: ["food", "restaurant", "artisan", "bakery", "craft"],
  tags: ["zanaat", "lezzet", "sıcak", "butik", "restoran"],
};
