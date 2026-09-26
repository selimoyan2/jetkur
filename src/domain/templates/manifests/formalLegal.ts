/**
 * JetKur Canonical Template Manifest: Formal Legal
 *
 * Designed for law firms, attorneys, mediators, and formal legal consultancies.
 * Features stately royal purple/navy hues, structured article feeds, and case evaluation forms.
 */

import { TemplateManifest } from "../types";

export const formalLegalManifest: TemplateManifest = {
  schemaVersion: 1,
  id: "tmpl-formal-legal",
  slug: "formal-legal",
  name: "Resmi Hukuk & Danışmanlık",
  description: "Avukatlar, hukuk büroları ve arabuluculuk merkezleri için ağırbaşlı mor ve lacivert tonları ile güven tesis eden resmi mimari.",
  version: "1.0.0",
  status: "ACTIVE",
  category: "corporate",
  previewImageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
  designTokens: {
    palette: {
      primary: "#7C3AED",
      primaryDark: "#6D28D9",
      secondary: "#FAF5FF",
      accent: "#F43F5E",
      text: "#18181B",
      textMuted: "#71717A",
      background: "#FFFFFF",
      surface: "#FAF5FF",
      border: "#E4E4E7",
    },
    typography: {
      fontHeading: "Plus Jakarta Sans",
      fontBody: "Inter",
      headingWeight: "700",
      baseFontSize: "16px",
    },
    geometry: {
      borderRadius: "md",
      containerMaxWidth: "standard",
      sectionSpacing: "normal",
      cardStyle: "flat-bordered",
    },
    header: {
      layout: "standard",
      showTopBar: true,
    },
    footer: {
      layout: "corporate-detailed",
    },
  },
  sectionRecipe: {
    header: "standard",
    hero: "centered-prestige",
    about: "side-by-side",
    services: "list",
    whyUs: "checklist",
    testimonials: "quotes-minimal",
    blog: "magazine-list",
    faqs: "accordion",
    contact: "formal-consultation-form",
    footer: "corporate-detailed",
  },
  sectionDefaults: [
    { sectionId: "header", defaultEnabled: true, recommendedOrder: 0 },
    { sectionId: "hero", defaultEnabled: true, recommendedOrder: 1 },
    { sectionId: "about", defaultEnabled: true, recommendedOrder: 2 },
    { sectionId: "services", defaultEnabled: true, recommendedOrder: 3 },
    { sectionId: "whyUs", defaultEnabled: true, recommendedOrder: 4 },
    { sectionId: "testimonials", defaultEnabled: true, recommendedOrder: 5 },
    { sectionId: "blog", defaultEnabled: false, recommendedOrder: 6 },
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
  recommendedIndustries: ["legal", "law-firm", "attorney", "consulting", "mediation"],
  tags: ["hukuk", "avukat", "prestij", "resmi", "danışmanlık"],
};
