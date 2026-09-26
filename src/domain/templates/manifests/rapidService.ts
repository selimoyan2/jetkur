/**
 * JetKur Canonical Template Manifest: Rapid Service
 *
 * Designed for emergency services, roadside assistance, plumbers, and high-urgency SMEs.
 * Features ultra-fast one-click callout buttons, prominent phone badges, and compact layout.
 */

import { TemplateManifest } from "../types";

export const rapidServiceManifest: TemplateManifest = {
  schemaVersion: 1,
  id: "tmpl-rapid-service",
  slug: "rapid-service",
  name: "Hızlı Müdahale & Acil Çağrı",
  description: "Zamanın kritik olduğu acil sektörler ve hızlı servis hizmetleri için tek tıkla arama ve acil eylem odaklı kompakt tasarım.",
  version: "1.0.0",
  status: "ACTIVE",
  category: "bold",
  previewImageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
  designTokens: {
    palette: {
      primary: "#EA580C",
      primaryDark: "#C2410C",
      secondary: "#FFF7ED",
      accent: "#EAB308",
      text: "#1C1917",
      textMuted: "#78716C",
      background: "#FFFFFF",
      surface: "#FAFAF9",
      border: "#E7E5E4",
    },
    typography: {
      fontHeading: "Plus Jakarta Sans",
      fontBody: "Inter",
      headingWeight: "800",
      baseFontSize: "16px",
    },
    geometry: {
      borderRadius: "xl",
      containerMaxWidth: "standard",
      sectionSpacing: "compact",
      cardStyle: "subtle-shadow",
    },
    header: {
      layout: "standard",
      showTopBar: true,
    },
    footer: {
      layout: "simple-centered",
    },
  },
  sectionRecipe: {
    header: "standard",
    hero: "urgent-callout",
    services: "grid-4",
    about: "side-by-side",
    whyUs: "cards-3",
    testimonials: "cards-grid",
    faqs: "accordion",
    contact: "emergency-contact-strip",
    footer: "simple-centered",
  },
  sectionDefaults: [
    { sectionId: "header", defaultEnabled: true, recommendedOrder: 0 },
    { sectionId: "hero", defaultEnabled: true, recommendedOrder: 1 },
    { sectionId: "services", defaultEnabled: true, recommendedOrder: 2 },
    { sectionId: "whyUs", defaultEnabled: true, recommendedOrder: 3 },
    { sectionId: "about", defaultEnabled: true, recommendedOrder: 4 },
    { sectionId: "testimonials", defaultEnabled: true, recommendedOrder: 5 },
    { sectionId: "faqs", defaultEnabled: true, recommendedOrder: 6 },
    { sectionId: "contact", defaultEnabled: true, recommendedOrder: 7 },
    { sectionId: "footer", defaultEnabled: true, recommendedOrder: 999 },
  ],
  capabilities: {
    supportsDarkMode: false,
    isResponsive: true,
    supportsCustomTokens: true,
    maxHeaderLinks: 6,
    recommendedContainerWidth: "standard",
  },
  recommendedIndustries: ["automotive", "home-services", "emergency", "repair"],
  tags: ["acil", "hızlı-arama", "yüksek-dönüşüm", "kompakt"],
};
