/**
 * JetKur Canonical Template Manifest: Tech Dynamic
 *
 * Designed for software agencies, IT consultants, SaaS startups, and high-tech equipment providers.
 * Features vibrant cyan/tech palettes, product/module catalog, and comparison tables.
 */

import { TemplateManifest } from "../types";

export const techDynamicManifest: TemplateManifest = {
  schemaVersion: 1,
  id: "tmpl-tech-dynamic",
  slug: "tech-dynamic",
  name: "Dinamik Teknoloji & Dijital",
  description: "Yazılım şirketleri, teknoloji bayileri ve SaaS sağlayıcıları için dinamik turkuaz aksanlı modern dijital vitrin.",
  version: "1.0.0",
  status: "ACTIVE",
  category: "technical",
  previewImageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
  designTokens: {
    palette: {
      primary: "#0891B2",
      primaryDark: "#0E7490",
      secondary: "#ECFEFF",
      accent: "#10B981",
      text: "#083344",
      textMuted: "#64748B",
      background: "#FFFFFF",
      surface: "#F0FDFA",
      border: "#CCFBF1",
      surfaceMuted: "#F1F5F9",
      surfaceDark: "#090D16",
      surfaceAccent: "#ECFEFF",
      heroGradient: "linear-gradient(135deg, #090d16 0%, #0f172a 55%, #164e63 100%)",
      sectionGradient: "linear-gradient(135deg, #f8fafc 0%, #ecfeff 50%, #f0fdfa 100%)",
    },
    typography: {
      fontHeading: "Space Grotesk",
      fontBody: "Plus Jakarta Sans",
      headingWeight: "700",
      baseFontSize: "16px",
      bodyWeight: "400",
      headingLetterSpacing: "tight",
      bodyLineHeight: "normal",
      headingScale: "display",
      uppercaseLabels: true,
    },
    geometry: {
      borderRadius: "lg",
      containerMaxWidth: "standard",
      sectionSpacing: "normal",
      cardStyle: "flat-bordered",
      cardShadow: "elevated",
      borderTreatment: "subtle",
      buttonRadius: "lg",
      buttonEmphasis: "gradient",
      heroTextWidth: "wide",
      sectionDivider: "hairline",
      sectionSurfaceSequence: ["gradient", "light", "dark", "gradient", "light", "bordered"],
    },
    header: {
      layout: "split-action",
      showTopBar: true,
    },
    footer: {
      layout: "multi-column-rich",
    },
  },
  sectionRecipe: {
    header: "split-action",
    hero: "split-content-image",
    services: "grid-4",
    about: "story-timeline",
    whyUs: "icon-grid",
    products: "grid",
    pricing: "comparison-table",
    testimonials: "cards-grid",
    faqs: "two-column",
    contact: "split-map-form",
    footer: "multi-column",
  },
  sectionDefaults: [
    { sectionId: "header", defaultEnabled: true, recommendedOrder: 0 },
    { sectionId: "hero", defaultEnabled: true, recommendedOrder: 1 },
    { sectionId: "services", defaultEnabled: true, recommendedOrder: 2 },
    { sectionId: "about", defaultEnabled: true, recommendedOrder: 3 },
    { sectionId: "whyUs", defaultEnabled: true, recommendedOrder: 4 },
    { sectionId: "products", defaultEnabled: false, recommendedOrder: 5 },
    { sectionId: "pricing", defaultEnabled: false, recommendedOrder: 6 },
    { sectionId: "testimonials", defaultEnabled: true, recommendedOrder: 7 },
    { sectionId: "faqs", defaultEnabled: true, recommendedOrder: 8 },
    { sectionId: "contact", defaultEnabled: true, recommendedOrder: 9 },
    { sectionId: "footer", defaultEnabled: true, recommendedOrder: 999 },
  ],
  capabilities: {
    supportsDarkMode: true,
    isResponsive: true,
    supportsCustomTokens: true,
    maxHeaderLinks: 7,
    recommendedContainerWidth: "standard",
  },
  recommendedIndustries: ["technology", "saas", "software", "it-services", "digital"],
  tags: ["teknoloji", "yazılım", "turkuaz", "dinamik", "ürün-kataloğu"],
};
