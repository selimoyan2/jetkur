/**
 * JetKur Canonical Template Manifest: Corporate Prestige
 *
 * Designed for consulting, corporate B2B, finance, legal, and institutional organizations.
 * Features stately deep navy tones, structured metrics badges, and formal consultation CTAs.
 */

import { TemplateManifest } from "../types";

export const corporatePrestigeManifest: TemplateManifest = {
  schemaVersion: 1,
  id: "tmpl-corporate-prestige",
  slug: "corporate-prestige",
  name: "Kurumsal Prestij & Otorite",
  description: "Mali müşavirler, danışmanlık firmaları ve kurumsal şirketler için tasarlanmış otoriter, güven veren lacivert mimari.",
  version: "1.0.0",
  status: "ACTIVE",
  category: "corporate",
  previewImageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
  designTokens: {
    palette: {
      primary: "#1E3A8A",
      primaryDark: "#172554",
      secondary: "#F8FAFC",
      accent: "#D97706",
      text: "#0F172A",
      textMuted: "#64748B",
      background: "#FFFFFF",
      surface: "#F1F5F9",
      border: "#CBD5E1",
    },
    typography: {
      fontHeading: "Plus Jakarta Sans",
      fontBody: "Inter",
      headingWeight: "700",
      baseFontSize: "16px",
    },
    geometry: {
      borderRadius: "lg",
      containerMaxWidth: "standard",
      sectionSpacing: "normal",
      cardStyle: "flat-bordered",
    },
    header: {
      layout: "split-action",
      showTopBar: true,
    },
    footer: {
      layout: "corporate-detailed",
    },
  },
  sectionRecipe: {
    header: "split-action",
    hero: "centered-prestige",
    about: "story-timeline",
    services: "cards-3",
    whyUs: "metrics-badges",
    testimonials: "quotes-minimal",
    faqs: "two-column",
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
    { sectionId: "faqs", defaultEnabled: true, recommendedOrder: 6 },
    { sectionId: "contact", defaultEnabled: true, recommendedOrder: 7 },
    { sectionId: "footer", defaultEnabled: true, recommendedOrder: 999 },
  ],
  capabilities: {
    supportsDarkMode: false,
    isResponsive: true,
    supportsCustomTokens: true,
    maxHeaderLinks: 7,
    recommendedContainerWidth: "standard",
  },
  recommendedIndustries: ["legal", "consulting", "finance", "logistics", "corporate"],
  tags: ["kurumsal", "prestij", "lacivert", "güven", "b2b"],
};
