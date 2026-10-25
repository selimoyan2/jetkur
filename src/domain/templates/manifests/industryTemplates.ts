/**
 * JetKur Industry Template Expansion (Theme Foundation 02D)
 *
 * ARCHITECTURAL PRINCIPLES:
 * 1. Dedicated design recipes for 12 key industry sectors:
 *    - Plumbing, HVAC, Towing, Electrician, Dental, Legal, Real Estate, Beauty, Hotel, Restaurant, Construction, Consulting
 * 2. Tailored layout recipe, typography, color palette, and conversion structure for each sector.
 * 3. 100% compliant with Canonical Section Renderer and Section Registry variants.
 * 4. Preserves authentic customer data: ZERO fabricated marketing claims.
 */

import { TemplateManifest } from "../types";

// 1. Sıhhi Tesisat (Plumbing Pro)
export const plumbingProManifest: TemplateManifest = {
  schemaVersion: 1,
  id: "tmpl-plumbing-pro",
  slug: "plumbing-pro",
  name: "Sıhhi Tesisat & Su Kaçağı Uzmanı",
  description: "Su kaçağı tespiti, tıkanıklık açma ve sıhhi tesisat ustaları için arama ve WhatsApp odaklı tema.",
  version: "1.0.0",
  status: "ACTIVE",
  category: "modern",
  previewImageUrl: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80",
  designTokens: {
    palette: {
      primary: "#0284C7", // Ocean blue
      primaryDark: "#0369A1",
      secondary: "#F0F9FF",
      accent: "#EA580C", // Alert orange
      text: "#0C4A6E",
      textMuted: "#64748B",
      background: "#FFFFFF",
      surface: "#F8FAFC",
      border: "#BAE6FD",
    },
    typography: {
      fontHeading: "Plus Jakarta Sans",
      fontBody: "Inter",
      headingWeight: "800",
      baseFontSize: "16px",
    },
    geometry: {
      borderRadius: "md",
      containerMaxWidth: "standard",
      sectionSpacing: "compact",
      cardStyle: "flat-bordered",
    },
    header: {
      layout: "local-service",
      showTopBar: true,
    },
    footer: {
      layout: "local-service",
    },
  },
  sectionRecipe: {
    header: "local-service",
    hero: "urgent-callout",
    services: "compact-service",
    about: "story-timeline",
    whyUs: "metrics-badges",
    testimonials: "cards-3",
    faqs: "two-column",
    contact: "urgent-dispatch",
    footer: "local-service",
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
    maxHeaderLinks: 5,
    recommendedContainerWidth: "standard",
  },
  recommendedIndustries: ["plumbing", "water-leak", "pipe-repair", "local-trades"],
  tags: ["tesisat", "su kaçağı", "hızlı arama", "yerel servis", "mavi"],
};

// 2. Kombi & Klima Servisi (Climate Service)
export const climateServiceManifest: TemplateManifest = {
  schemaVersion: 1,
  id: "tmpl-climate-service",
  slug: "climate-service",
  name: "Kombi & Klima Yetkili Özel Servis",
  description: "Kombi bakımı, klima montaj ve arıza onarım servisleri için garantili servis ve yerinde müdahale odaklı tema.",
  version: "1.0.0",
  status: "ACTIVE",
  category: "modern",
  previewImageUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80",
  designTokens: {
    palette: {
      primary: "#0891B2", // Cyan/Teal
      primaryDark: "#0E7490",
      secondary: "#ECFEFF",
      accent: "#F97316", // Flame orange
      text: "#164E63",
      textMuted: "#64748B",
      background: "#FFFFFF",
      surface: "#F0FDFA",
      border: "#CFFAFE",
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
      layout: "local-service",
      showTopBar: true,
    },
    footer: {
      layout: "local-service",
    },
  },
  sectionRecipe: {
    header: "local-service",
    hero: "urgent-callout",
    services: "compact-service",
    about: "story-timeline",
    whyUs: "metrics-badges",
    testimonials: "cards-3",
    faqs: "two-column",
    contact: "urgent-dispatch",
    footer: "local-service",
  },
  sectionDefaults: [
    { sectionId: "header", defaultEnabled: true, recommendedOrder: 0 },
    { sectionId: "hero", defaultEnabled: true, recommendedOrder: 1 },
    { sectionId: "services", defaultEnabled: true, recommendedOrder: 2 },
    { sectionId: "whyUs", defaultEnabled: true, recommendedOrder: 3 },
    { sectionId: "testimonials", defaultEnabled: true, recommendedOrder: 4 },
    { sectionId: "contact", defaultEnabled: true, recommendedOrder: 5 },
    { sectionId: "footer", defaultEnabled: true, recommendedOrder: 999 },
  ],
  capabilities: {
    supportsDarkMode: false,
    isResponsive: true,
    supportsCustomTokens: true,
    maxHeaderLinks: 6,
    recommendedContainerWidth: "standard",
  },
  recommendedIndustries: ["hvac", "climate", "boiler", "repair"],
  tags: ["kombi", "klima", "bakım", "onarım", "yetkili özel servis"],
};

// 3. Oto Kurtarma & Çekici (Towing Rescue)
export const towingRescueManifest: TemplateManifest = {
  schemaVersion: 1,
  id: "tmpl-towing-rescue",
  slug: "towing-rescue",
  name: "Oto Kurtarma & Yol Yardım",
  description: "Yolda kalan sürücüler için tek dokunuşla konum paylaşma ve doğrudan çekici çağrı tasarımı.",
  version: "1.0.0",
  status: "ACTIVE",
  category: "bold",
  previewImageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
  designTokens: {
    palette: {
      primary: "#EA580C", // Alert Emergency Orange
      primaryDark: "#C2410C",
      secondary: "#FFF7ED",
      accent: "#EAB308", // Warning yellow
      text: "#1C1917",
      textMuted: "#78716C",
      background: "#FFFFFF",
      surface: "#FFFBEB",
      border: "#FED7AA",
    },
    typography: {
      fontHeading: "Plus Jakarta Sans",
      fontBody: "Inter",
      headingWeight: "900",
      baseFontSize: "16px",
    },
    geometry: {
      borderRadius: "xl",
      containerMaxWidth: "standard",
      sectionSpacing: "compact",
      cardStyle: "flat-bordered",
    },
    header: {
      layout: "local-service",
      showTopBar: true,
    },
    footer: {
      layout: "local-service",
    },
  },
  sectionRecipe: {
    header: "local-service",
    hero: "urgent-callout",
    services: "compact-service",
    about: "story-timeline",
    whyUs: "metrics-badges",
    testimonials: "cards-3",
    contact: "urgent-dispatch",
    footer: "local-service",
  },
  sectionDefaults: [
    { sectionId: "header", defaultEnabled: true, recommendedOrder: 0 },
    { sectionId: "hero", defaultEnabled: true, recommendedOrder: 1 },
    { sectionId: "services", defaultEnabled: true, recommendedOrder: 2 },
    { sectionId: "whyUs", defaultEnabled: true, recommendedOrder: 3 },
    { sectionId: "contact", defaultEnabled: true, recommendedOrder: 4 },
    { sectionId: "footer", defaultEnabled: true, recommendedOrder: 999 },
  ],
  capabilities: {
    supportsDarkMode: false,
    isResponsive: true,
    supportsCustomTokens: true,
    maxHeaderLinks: 5,
    recommendedContainerWidth: "standard",
  },
  recommendedIndustries: ["towing", "roadside", "automotive", "rescue"],
  tags: ["çekici", "oto kurtarma", "yol yardım", "turuncu"],
};

// 4. Elektrikçi & Güç Sistemleri (Electrician Power)
export const electricianPowerManifest: TemplateManifest = {
  schemaVersion: 1,
  id: "tmpl-electrician-power",
  slug: "electrician-power",
  name: "Usta Elektrikçi & Güç Sistemleri",
  description: "Ev ve işyeri elektrik arızaları, pano montajı ve güvenlik sistemleri için yüksek kontrastlı teknik tema.",
  version: "1.0.0",
  status: "ACTIVE",
  category: "bold",
  previewImageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
  designTokens: {
    palette: {
      primary: "#D97706", // Electric Amber
      primaryDark: "#B45309",
      secondary: "#FEF3C7",
      accent: "#2563EB",
      text: "#1E293B",
      textMuted: "#64748B",
      background: "#FFFFFF",
      surface: "#F8FAFC",
      border: "#E2E8F0",
    },
    typography: {
      fontHeading: "Plus Jakarta Sans",
      fontBody: "Inter",
      headingWeight: "800",
      baseFontSize: "16px",
    },
    geometry: {
      borderRadius: "md",
      containerMaxWidth: "standard",
      sectionSpacing: "normal",
      cardStyle: "flat-bordered",
    },
    header: {
      layout: "local-service",
      showTopBar: true,
    },
    footer: {
      layout: "local-service",
    },
  },
  sectionRecipe: {
    header: "local-service",
    hero: "urgent-callout",
    services: "bordered-premium",
    about: "story-timeline",
    whyUs: "metrics-badges",
    testimonials: "cards-3",
    contact: "urgent-dispatch",
    footer: "local-service",
  },
  sectionDefaults: [
    { sectionId: "header", defaultEnabled: true, recommendedOrder: 0 },
    { sectionId: "hero", defaultEnabled: true, recommendedOrder: 1 },
    { sectionId: "services", defaultEnabled: true, recommendedOrder: 2 },
    { sectionId: "whyUs", defaultEnabled: true, recommendedOrder: 3 },
    { sectionId: "contact", defaultEnabled: true, recommendedOrder: 4 },
    { sectionId: "footer", defaultEnabled: true, recommendedOrder: 999 },
  ],
  capabilities: {
    supportsDarkMode: false,
    isResponsive: true,
    supportsCustomTokens: true,
    maxHeaderLinks: 6,
    recommendedContainerWidth: "standard",
  },
  recommendedIndustries: ["electrical", "electrician", "contractor", "maintenance"],
  tags: ["elektrikçi", "arıza", "montaj", "güç", "aydınlatma"],
};

// 5. Diş Kliniği & Ağız Sağlığı (Dental Care)
export const dentalCareManifest: TemplateManifest = {
  schemaVersion: 1,
  id: "tmpl-dental-care",
  slug: "dental-care",
  name: "Diş Kliniği & Gülüş Tasarımı",
  description: "İmplant, ortodonti, estetik gülüş tasarımı ve diş hekimleri için hijyenik, huzur veren ve randevu odaklı tema.",
  version: "1.0.0",
  status: "ACTIVE",
  category: "clean",
  previewImageUrl: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80",
  designTokens: {
    palette: {
      primary: "#059669", // Emerald Medical
      primaryDark: "#047857",
      secondary: "#F0FDF4",
      accent: "#0284C7",
      text: "#064E3B",
      textMuted: "#047857",
      background: "#FFFFFF",
      surface: "#F7FEE7",
      border: "#A7F3D0",
    },
    typography: {
      fontHeading: "Plus Jakarta Sans",
      fontBody: "Inter",
      headingWeight: "700",
      baseFontSize: "16px",
    },
    geometry: {
      borderRadius: "xl",
      containerMaxWidth: "standard",
      sectionSpacing: "spacious",
      cardStyle: "flat-bordered",
    },
    header: {
      layout: "corporate-classic",
      showTopBar: true,
    },
    footer: {
      layout: "corporate-multi",
    },
  },
  sectionRecipe: {
    header: "corporate-classic",
    hero: "centered-prestige",
    services: "standard",
    about: "story-timeline",
    whyUs: "metrics-badges",
    testimonials: "cards-3",
    faqs: "two-column",
    contact: "formal-consultation-form",
    footer: "corporate-multi",
  },
  sectionDefaults: [
    { sectionId: "header", defaultEnabled: true, recommendedOrder: 0 },
    { sectionId: "hero", defaultEnabled: true, recommendedOrder: 1 },
    { sectionId: "about", defaultEnabled: true, recommendedOrder: 2 },
    { sectionId: "services", defaultEnabled: true, recommendedOrder: 3 },
    { sectionId: "testimonials", defaultEnabled: true, recommendedOrder: 4 },
    { sectionId: "faqs", defaultEnabled: true, recommendedOrder: 5 },
    { sectionId: "contact", defaultEnabled: true, recommendedOrder: 6 },
    { sectionId: "footer", defaultEnabled: true, recommendedOrder: 999 },
  ],
  capabilities: {
    supportsDarkMode: false,
    isResponsive: true,
    supportsCustomTokens: true,
    maxHeaderLinks: 6,
    recommendedContainerWidth: "standard",
  },
  recommendedIndustries: ["dental", "healthcare", "clinic", "medical"],
  tags: ["diş hekimi", "klinik", "sağlık", "implant", "zümrüt"],
};

// 6. Hukuk Bürosu & Danışmanlık (Legal Authority)
export const legalAuthorityManifest: TemplateManifest = {
  schemaVersion: 1,
  id: "tmpl-legal-authority",
  slug: "legal-authority",
  name: "Hukuk Bürosu & Avukatlık Ortaklığı",
  description: "Ceza, ticaret, icra ve aile hukuku avukatları için resmi, saygın ve editoryal prestij mimarisi.",
  version: "1.0.0",
  status: "ACTIVE",
  category: "corporate",
  previewImageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
  designTokens: {
    palette: {
      primary: "#1E3A8A", // Deep Navy
      primaryDark: "#172554",
      secondary: "#F8FAFC",
      accent: "#B45309", // Old Gold
      text: "#0F172A",
      textMuted: "#64748B",
      background: "#FFFFFF",
      surface: "#F1F5F9",
      border: "#CBD5E1",
    },
    typography: {
      fontHeading: "Playfair Display",
      fontBody: "Lora",
      headingWeight: "700",
      baseFontSize: "16px",
    },
    geometry: {
      borderRadius: "sm",
      containerMaxWidth: "standard",
      sectionSpacing: "spacious",
      cardStyle: "flat-bordered",
    },
    header: {
      layout: "corporate-classic",
      showTopBar: true,
    },
    footer: {
      layout: "corporate-multi",
    },
  },
  sectionRecipe: {
    header: "corporate-classic",
    hero: "centered-prestige",
    services: "bordered-premium",
    about: "story-timeline",
    whyUs: "metrics-badges",
    testimonials: "quotes-minimal",
    faqs: "two-column",
    contact: "formal-consultation-form",
    footer: "corporate-multi",
  },
  sectionDefaults: [
    { sectionId: "header", defaultEnabled: true, recommendedOrder: 0 },
    { sectionId: "hero", defaultEnabled: true, recommendedOrder: 1 },
    { sectionId: "about", defaultEnabled: true, recommendedOrder: 2 },
    { sectionId: "services", defaultEnabled: true, recommendedOrder: 3 },
    { sectionId: "whyUs", defaultEnabled: true, recommendedOrder: 4 },
    { sectionId: "faqs", defaultEnabled: true, recommendedOrder: 5 },
    { sectionId: "contact", defaultEnabled: true, recommendedOrder: 6 },
    { sectionId: "footer", defaultEnabled: true, recommendedOrder: 999 },
  ],
  capabilities: {
    supportsDarkMode: false,
    isResponsive: true,
    supportsCustomTokens: true,
    maxHeaderLinks: 6,
    recommendedContainerWidth: "standard",
  },
  recommendedIndustries: ["legal", "lawyer", "attorney", "consulting"],
  tags: ["avukat", "hukuk", "dava", "arabuluculuk", "serif"],
};

// 7. Gayrimenkul & Yatırım Danışmanlığı (Real Estate Prestige)
export const realEstatePrestigeManifest: TemplateManifest = {
  schemaVersion: 1,
  id: "tmpl-real-estate-prestige",
  slug: "real-estate-prestige",
  name: "Gayrimenkul & Yatırım Danışmanlığı",
  description: "Lüks konut, arsa, villa ve ticari gayrimenkul danışmanları için görsel vitrin ve doğrudan WhatsApp sunum tasarımı.",
  version: "1.0.0",
  status: "ACTIVE",
  category: "luxury",
  previewImageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
  designTokens: {
    palette: {
      primary: "#0F172A", // Slate dark
      primaryDark: "#020617",
      secondary: "#F8FAFC",
      accent: "#D97706", // Gold
      text: "#0F172A",
      textMuted: "#64748B",
      background: "#FFFFFF",
      surface: "#F1F5F9",
      border: "#E2E8F0",
    },
    typography: {
      fontHeading: "Plus Jakarta Sans",
      fontBody: "Inter",
      headingWeight: "700",
      baseFontSize: "16px",
    },
    geometry: {
      borderRadius: "xl",
      containerMaxWidth: "wide",
      sectionSpacing: "normal",
      cardStyle: "flat-bordered",
    },
    header: {
      layout: "corporate-classic",
      showTopBar: true,
    },
    footer: {
      layout: "corporate-multi",
    },
  },
  sectionRecipe: {
    header: "corporate-classic",
    hero: "centered-prestige",
    services: "image-focused",
    about: "story-timeline",
    whyUs: "metrics-badges",
    testimonials: "cards-3",
    contact: "formal-consultation-form",
    footer: "corporate-multi",
  },
  sectionDefaults: [
    { sectionId: "header", defaultEnabled: true, recommendedOrder: 0 },
    { sectionId: "hero", defaultEnabled: true, recommendedOrder: 1 },
    { sectionId: "services", defaultEnabled: true, recommendedOrder: 2 },
    { sectionId: "about", defaultEnabled: true, recommendedOrder: 3 },
    { sectionId: "testimonials", defaultEnabled: true, recommendedOrder: 4 },
    { sectionId: "contact", defaultEnabled: true, recommendedOrder: 5 },
    { sectionId: "footer", defaultEnabled: true, recommendedOrder: 999 },
  ],
  capabilities: {
    supportsDarkMode: false,
    isResponsive: true,
    supportsCustomTokens: true,
    maxHeaderLinks: 6,
    recommendedContainerWidth: "wide",
  },
  recommendedIndustries: ["real-estate", "property", "investment", "luxury"],
  tags: ["gayrimenkul", "emlak", "arsa", "villa", "yatırım"],
};

// 8. Güzellik, Spa & Estetik (Beauty & Aesthetic)
export const beautyAestheticManifest: TemplateManifest = {
  schemaVersion: 1,
  id: "tmpl-beauty-aesthetic",
  slug: "beauty-aesthetic",
  name: "Güzellik, Spa & Medikal Estetik",
  description: "Güzellik merkezleri, kuaförler, tırnak stüdyoları ve cilt bakım merkezleri için zarif, dingin ve randevu odaklı tema.",
  version: "1.0.0",
  status: "ACTIVE",
  category: "artisan",
  previewImageUrl: "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=800&q=80",
  designTokens: {
    palette: {
      primary: "#9D174D", // Rose Elegance
      primaryDark: "#831843",
      secondary: "#FDF2F8",
      accent: "#B45309",
      text: "#500724",
      textMuted: "#831843",
      background: "#FFFBFB",
      surface: "#FFF1F2",
      border: "#FBCFE8",
    },
    typography: {
      fontHeading: "Playfair Display",
      fontBody: "Lora",
      headingWeight: "600",
      baseFontSize: "16px",
    },
    geometry: {
      borderRadius: "2xl",
      containerMaxWidth: "standard",
      sectionSpacing: "normal",
      cardStyle: "flat-bordered",
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
    hero: "minimal-lead",
    services: "minimal-icon",
    about: "story-timeline",
    whyUs: "metrics-badges",
    testimonials: "cards-3",
    contact: "formal-consultation-form",
    footer: "minimal",
  },
  sectionDefaults: [
    { sectionId: "header", defaultEnabled: true, recommendedOrder: 0 },
    { sectionId: "hero", defaultEnabled: true, recommendedOrder: 1 },
    { sectionId: "services", defaultEnabled: true, recommendedOrder: 2 },
    { sectionId: "about", defaultEnabled: true, recommendedOrder: 3 },
    { sectionId: "testimonials", defaultEnabled: true, recommendedOrder: 4 },
    { sectionId: "contact", defaultEnabled: true, recommendedOrder: 5 },
    { sectionId: "footer", defaultEnabled: true, recommendedOrder: 999 },
  ],
  capabilities: {
    supportsDarkMode: false,
    isResponsive: true,
    supportsCustomTokens: true,
    maxHeaderLinks: 5,
    recommendedContainerWidth: "standard",
  },
  recommendedIndustries: ["beauty", "aesthetic", "spa", "salon"],
  tags: ["güzellik", "estetik", "cilt bakımı", "spa", "pembe"],
};

// 9. Butik Otel & Konaklama (Hotel & Resort)
export const hotelResortManifest: TemplateManifest = {
  schemaVersion: 1,
  id: "tmpl-hotel-resort",
  slug: "hotel-resort",
  name: "Butik Otel & Rezervasyon",
  description: "Butik oteller, tatil köyleri ve pansiyonlar için tam ekran fotoğraf vitrini ve doğrudan oda rezervasyon deneyimi.",
  version: "1.0.0",
  status: "ACTIVE",
  category: "luxury",
  previewImageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
  designTokens: {
    palette: {
      primary: "#D97706", // Amber Gold
      primaryDark: "#B45309",
      secondary: "#18181B",
      accent: "#FBBF24",
      background: "#09090B",
      surface: "#18181B",
      text: "#FAFAFA",
      textMuted: "#A1A1AA",
      border: "#27272A",
    },
    typography: {
      fontHeading: "Cinzel",
      fontBody: "Plus Jakarta Sans",
      headingWeight: "700",
      baseFontSize: "16px",
    },
    geometry: {
      borderRadius: "none",
      containerMaxWidth: "wide",
      sectionSpacing: "spacious",
      cardStyle: "flat-bordered",
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
    services: "image-focused",
    about: "story-timeline",
    whyUs: "metrics-badges",
    testimonials: "cards-3",
    contact: "formal-consultation-form",
    footer: "premium",
  },
  sectionDefaults: [
    { sectionId: "header", defaultEnabled: true, recommendedOrder: 0 },
    { sectionId: "hero", defaultEnabled: true, recommendedOrder: 1 },
    { sectionId: "services", defaultEnabled: true, recommendedOrder: 2 },
    { sectionId: "about", defaultEnabled: true, recommendedOrder: 3 },
    { sectionId: "testimonials", defaultEnabled: true, recommendedOrder: 4 },
    { sectionId: "contact", defaultEnabled: true, recommendedOrder: 5 },
    { sectionId: "footer", defaultEnabled: true, recommendedOrder: 999 },
  ],
  capabilities: {
    supportsDarkMode: true,
    isResponsive: true,
    supportsCustomTokens: true,
    maxHeaderLinks: 6,
    recommendedContainerWidth: "wide",
  },
  recommendedIndustries: ["hotel", "hospitality", "resort", "tourism"],
  tags: ["otel", "butik otel", "konaklama", "tatil", "altın"],
};

// 10. Restoran, Kafe & Gastronomi (Restaurant Gourmet)
export const restaurantGourmetManifest: TemplateManifest = {
  schemaVersion: 1,
  id: "tmpl-restaurant-gourmet",
  slug: "restaurant-gourmet",
  name: "Gurme Restoran & Masa Rezervasyonu",
  description: "Şef restoranları, kafeler, pastaneler ve ocakbaşı mekanları için iştah açıcı menü ve masa ayırtma tasarımı.",
  version: "1.0.0",
  status: "ACTIVE",
  category: "artisan",
  previewImageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
  designTokens: {
    palette: {
      primary: "#C2410C", // Terracotta
      primaryDark: "#9A3412",
      secondary: "#FFF7ED",
      accent: "#0D9488",
      text: "#431407",
      textMuted: "#78716C",
      background: "#FFFBF7",
      surface: "#FFFAF0",
      border: "#FED7AA",
    },
    typography: {
      fontHeading: "Playfair Display",
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
      layout: "modern-minimal",
      showTopBar: false,
    },
    footer: {
      layout: "corporate-multi",
    },
  },
  sectionRecipe: {
    header: "modern-minimal",
    hero: "minimal-lead",
    services: "image-focused",
    about: "story-timeline",
    whyUs: "metrics-badges",
    testimonials: "cards-3",
    contact: "formal-consultation-form",
    footer: "corporate-multi",
  },
  sectionDefaults: [
    { sectionId: "header", defaultEnabled: true, recommendedOrder: 0 },
    { sectionId: "hero", defaultEnabled: true, recommendedOrder: 1 },
    { sectionId: "services", defaultEnabled: true, recommendedOrder: 2 },
    { sectionId: "about", defaultEnabled: true, recommendedOrder: 3 },
    { sectionId: "testimonials", defaultEnabled: true, recommendedOrder: 4 },
    { sectionId: "contact", defaultEnabled: true, recommendedOrder: 5 },
    { sectionId: "footer", defaultEnabled: true, recommendedOrder: 999 },
  ],
  capabilities: {
    supportsDarkMode: false,
    isResponsive: true,
    supportsCustomTokens: true,
    maxHeaderLinks: 6,
    recommendedContainerWidth: "standard",
  },
  recommendedIndustries: ["restaurant", "cafe", "culinary", "food"],
  tags: ["restoran", "kafe", "menü", "rezervasyon", "gurme"],
};

// 11. İnşaat, Mimarlık & Taahhüt (Construction & Architect)
export const constructionArchitectManifest: TemplateManifest = {
  schemaVersion: 1,
  id: "tmpl-construction-architect",
  slug: "construction-architect",
  name: "İnşaat, Müteahhitlik & Mimarlık",
  description: "Konut projeleri, kentsel dönüşüm, çelik yapı ve mimarlık ofisleri için sağlam, teknik ve referans vitrini.",
  version: "1.0.0",
  status: "ACTIVE",
  category: "bold",
  previewImageUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80",
  designTokens: {
    palette: {
      primary: "#334155", // Slate Industrial
      primaryDark: "#1E293B",
      secondary: "#F8FAFC",
      accent: "#EA580C", // Hard hat orange
      text: "#0F172A",
      textMuted: "#64748B",
      background: "#FFFFFF",
      surface: "#F1F5F9",
      border: "#CBD5E1",
    },
    typography: {
      fontHeading: "Plus Jakarta Sans",
      fontBody: "Inter",
      headingWeight: "800",
      baseFontSize: "16px",
    },
    geometry: {
      borderRadius: "none",
      containerMaxWidth: "wide",
      sectionSpacing: "spacious",
      cardStyle: "flat-bordered",
    },
    header: {
      layout: "corporate-classic",
      showTopBar: true,
    },
    footer: {
      layout: "corporate-multi",
    },
  },
  sectionRecipe: {
    header: "corporate-classic",
    hero: "centered-prestige",
    services: "bordered-premium",
    about: "story-timeline",
    whyUs: "metrics-badges",
    testimonials: "cards-3",
    contact: "formal-consultation-form",
    footer: "corporate-multi",
  },
  sectionDefaults: [
    { sectionId: "header", defaultEnabled: true, recommendedOrder: 0 },
    { sectionId: "hero", defaultEnabled: true, recommendedOrder: 1 },
    { sectionId: "services", defaultEnabled: true, recommendedOrder: 2 },
    { sectionId: "about", defaultEnabled: true, recommendedOrder: 3 },
    { sectionId: "whyUs", defaultEnabled: true, recommendedOrder: 4 },
    { sectionId: "contact", defaultEnabled: true, recommendedOrder: 5 },
    { sectionId: "footer", defaultEnabled: true, recommendedOrder: 999 },
  ],
  capabilities: {
    supportsDarkMode: false,
    isResponsive: true,
    supportsCustomTokens: true,
    maxHeaderLinks: 6,
    recommendedContainerWidth: "wide",
  },
  recommendedIndustries: ["construction", "architecture", "contractor", "engineering"],
  tags: ["inşaat", "müteahhit", "mimarlık", "proje", "antrasit"],
};

// 12. Kurumsal Danışmanlık & Yönetim (Consulting Advisory)
export const consultingAdvisoryManifest: TemplateManifest = {
  schemaVersion: 1,
  id: "tmpl-consulting-advisory",
  slug: "consulting-advisory",
  name: "Yönetim Danışmanlığı & Finansal Strateji",
  description: "Mali müşavirler, yönetim koçları ve denetim firmaları için stratejik, analitik ve güven verici B2B tasarım.",
  version: "1.0.0",
  status: "ACTIVE",
  category: "corporate",
  previewImageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
  designTokens: {
    palette: {
      primary: "#1E3A8A", // Executive Navy
      primaryDark: "#172554",
      secondary: "#F8FAFC",
      accent: "#0D9488", // Strategy Teal
      text: "#0F172A",
      textMuted: "#64748B",
      background: "#FFFFFF",
      surface: "#F1F5F9",
      border: "#E2E8F0",
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
      layout: "corporate-classic",
      showTopBar: true,
    },
    footer: {
      layout: "corporate-multi",
    },
  },
  sectionRecipe: {
    header: "corporate-classic",
    hero: "centered-prestige",
    services: "bordered-premium",
    about: "story-timeline",
    whyUs: "metrics-badges",
    testimonials: "quotes-minimal",
    faqs: "two-column",
    contact: "formal-consultation-form",
    footer: "corporate-multi",
  },
  sectionDefaults: [
    { sectionId: "header", defaultEnabled: true, recommendedOrder: 0 },
    { sectionId: "hero", defaultEnabled: true, recommendedOrder: 1 },
    { sectionId: "about", defaultEnabled: true, recommendedOrder: 2 },
    { sectionId: "services", defaultEnabled: true, recommendedOrder: 3 },
    { sectionId: "whyUs", defaultEnabled: true, recommendedOrder: 4 },
    { sectionId: "faqs", defaultEnabled: true, recommendedOrder: 5 },
    { sectionId: "contact", defaultEnabled: true, recommendedOrder: 6 },
    { sectionId: "footer", defaultEnabled: true, recommendedOrder: 999 },
  ],
  capabilities: {
    supportsDarkMode: false,
    isResponsive: true,
    supportsCustomTokens: true,
    maxHeaderLinks: 7,
    recommendedContainerWidth: "standard",
  },
  recommendedIndustries: ["consulting", "advisory", "management", "finance", "audit"],
  tags: ["danışmanlık", "strateji", "finans", "yönetim", "b2b"],
};

export const INDUSTRY_MANIFESTS: readonly TemplateManifest[] = [
  plumbingProManifest,
  climateServiceManifest,
  towingRescueManifest,
  electricianPowerManifest,
  dentalCareManifest,
  legalAuthorityManifest,
  realEstatePrestigeManifest,
  beautyAestheticManifest,
  hotelResortManifest,
  restaurantGourmetManifest,
  constructionArchitectManifest,
  consultingAdvisoryManifest,
];
