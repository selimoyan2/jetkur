/**
 * JetKur Canonical Template Manifest: Clinical Pure
 *
 * Designed for dental clinics, doctors, wellness centers, and healthcare providers.
 * Features hygienic emerald green accents, rounded corners, and patient appointment focus.
 */

import { TemplateManifest } from "../types";

export const clinicalPureManifest: TemplateManifest = {
  schemaVersion: 1,
  id: "tmpl-clinical-pure",
  slug: "clinical-pure",
  name: "Ferah Klinik & Sağlık",
  description: "Diş klinikleri, estetik merkezleri ve uzman hekimler için hasta güvenini ön plana çıkaran ferah zümrüt tonları ve randevu odaklı yapı.",
  version: "1.0.0",
  status: "ACTIVE",
  category: "clean",
  previewImageUrl: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80",
  designTokens: {
    palette: {
      primary: "#059669",
      primaryDark: "#047857",
      secondary: "#F0FDF4",
      accent: "#0284C7",
      text: "#064E3B",
      textMuted: "#6B7280",
      background: "#FFFFFF",
      surface: "#F9FAFB",
      border: "#E5E7EB",
    },
    typography: {
      fontHeading: "Plus Jakarta Sans",
      fontBody: "Inter",
      headingWeight: "700",
      baseFontSize: "16px",
    },
    geometry: {
      borderRadius: "2xl",
      containerMaxWidth: "standard",
      sectionSpacing: "spacious",
      cardStyle: "subtle-shadow",
    },
    header: {
      layout: "standard",
      showTopBar: true,
    },
    footer: {
      layout: "multi-column-rich",
    },
  },
  sectionRecipe: {
    header: "standard",
    hero: "split-content-image",
    services: "grid-4",
    about: "side-by-side",
    whyUs: "checklist",
    gallery: "grid-lightbox",
    testimonials: "cards-grid",
    faqs: "accordion",
    contact: "split-map-form",
    footer: "multi-column",
  },
  sectionDefaults: [
    { sectionId: "header", defaultEnabled: true, recommendedOrder: 0 },
    { sectionId: "hero", defaultEnabled: true, recommendedOrder: 1 },
    { sectionId: "services", defaultEnabled: true, recommendedOrder: 2 },
    { sectionId: "about", defaultEnabled: true, recommendedOrder: 3 },
    { sectionId: "whyUs", defaultEnabled: true, recommendedOrder: 4 },
    { sectionId: "gallery", defaultEnabled: true, recommendedOrder: 5 },
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
  recommendedIndustries: ["health", "dental", "clinic", "wellness", "medical"],
  tags: ["sağlık", "klinik", "diş-hekimi", "ferah", "randevu"],
};
