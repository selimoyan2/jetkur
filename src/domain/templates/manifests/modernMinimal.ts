/**
 * JetKur Canonical Template Manifest: Modern Minimal
 *
 * Designed for architects, designers, studios, and high-end modern service providers.
 * Features monochromatic dark slate tones, razor-sharp geometric edges, and portfolio focus.
 */

import { TemplateManifest } from "../types";

export const modernMinimalManifest: TemplateManifest = {
  schemaVersion: 1,
  id: "tmpl-modern-minimal",
  slug: "modern-minimal",
  name: "Modern Minimalist & Mimari",
  description: "Mimarlar, tasarım stüdyoları ve butik ajanslar için monokrom, geniş boşluklu ve yüksek kontrastlı minimalist vitrin.",
  version: "1.0.0",
  status: "ACTIVE",
  category: "minimal",
  previewImageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
  designTokens: {
    palette: {
      primary: "#334155",
      primaryDark: "#1E293B",
      secondary: "#F8FAFC",
      accent: "#3B82F6",
      text: "#0F172A",
      textMuted: "#64748B",
      background: "#FFFFFF",
      surface: "#F8FAFC",
      border: "#E2E8F0",
      surfaceMuted: "#FAFAFA",
      surfaceDark: "#18181B",
      surfaceAccent: "#F4F4F5",
      heroGradient: "linear-gradient(135deg, #18181b 0%, #27272a 100%)",
      sectionGradient: "linear-gradient(180deg, #ffffff 0%, #fafafa 100%)",
    },
    typography: {
      fontHeading: "Space Grotesk",
      fontBody: "Inter",
      headingWeight: "800",
      baseFontSize: "16px",
      bodyWeight: "400",
      headingLetterSpacing: "tight",
      bodyLineHeight: "relaxed",
      headingScale: "display",
      uppercaseLabels: true,
    },
    geometry: {
      borderRadius: "none",
      containerMaxWidth: "wide",
      sectionSpacing: "spacious",
      cardStyle: "flat-bordered",
      cardShadow: "none",
      borderTreatment: "hairline",
      buttonRadius: "none",
      buttonEmphasis: "outline-refined",
      heroTextWidth: "narrow",
      sectionDivider: "hairline",
      sectionSurfaceSequence: ["light", "bordered", "light", "muted", "light", "bordered"],
    },
    header: {
      layout: "modern-minimal",
      showTopBar: false,
    },
    footer: {
      layout: "minimal",
    },
  },
  sectionRecipe: {
    header: "modern-minimal",
    hero: "split-content-image",
    services: "minimal-icon",
    about: "minimal-stats",
    whyUs: "icon-grid",
    gallery: "masonry",
    testimonials: "quotes-minimal",
    faqs: "minimal-clean",
    contact: "compact-direct",
    footer: "minimal",
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
    supportsDarkMode: true,
    isResponsive: true,
    supportsCustomTokens: true,
    maxHeaderLinks: 5,
    recommendedContainerWidth: "wide",
  },
  recommendedIndustries: ["architecture", "design", "creative", "engineering", "consulting"],
  tags: ["minimal", "mimari", "modern", "monokrom", "portfolyo"],
};
