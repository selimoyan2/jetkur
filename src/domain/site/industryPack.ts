/**
 * JetKur Canonical Data Architecture - Industry Pack Domain
 *
 * ARCHITECTURAL PRINCIPLE:
 * IndustryPack is NOT user data.
 * It is JetKur's curated domain intelligence for a specific SME sector
 * (e.g. plumbing, locksmith, dental clinic, car recovery, cleaning).
 *
 * It provides starter services, FAQ items, recommended homepage layout,
 * image search intents, and SEO/Schema defaults when an SME is onboarded.
 */

export type IndustryCategory =
  | "home_services"
  | "automotive"
  | "health_wellness"
  | "legal_finance"
  | "cleaning_hygiene"
  | "transport_logistics"
  | "beauty_personal_care"
  | "food_hospitality"
  | "technical_repairs"
  | "construction_realestate";

export interface IndustryStarterService {
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription?: string;
  priceHint?: string;
  icon: string;
  features: string[];
}

export interface IndustryStarterFaq {
  question: string;
  answer: string;
  category?: string;
}

export interface IndustryContentDefaults {
  heroBadges: string[];
  heroHeadlines: string[];
  heroSubtitles: string[];
  aboutStoryTemplate: string;
  whyUsItems: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
  defaultStats: Array<{
    label: string;
    value: string;
  }>;
  primaryCta: {
    text: string;
    targetAction: "phone" | "whatsapp" | "form" | "quote";
  };
  secondaryCta: {
    text: string;
    targetAction: "services" | "about" | "contact" | "whatsapp" | "phone" | "quote";
  };
}

export interface IndustryImageIntent {
  /** Identifier key (e.g. "hero-bg", "emergency-repair", "equipment-tools") */
  key: string;
  /** Semantic search query for AI image generator or photo library */
  searchPrompt: string;
  /** Curated default fallback CDN image */
  fallbackUrl: string;
  /** Suggested alt text for accessibility & SEO */
  suggestedAlt: string;
}

export interface IndustrySeoDefaults {
  /** Template string supporting tokens like {{companyName}}, {{city}}, {{district}} */
  titleTemplate: string;
  /** Meta description template */
  descriptionTemplate: string;
  defaultKeywords: string[];
  /** Schema.org specific sub-type (e.g. "Plumber", "Dentist", "AutoRepair", "LegalService") */
  schemaOrgType: string;
}

export interface IndustrySectionRecommendation {
  type: string; // e.g. "hero", "services", "about", "whyUs", "testimonials", "faqs", "contact"
  enabled: boolean;
  order: number;
  recommendedVariant: string;
}

export interface IndustrySchemaHints {
  businessType: string;
  priceRange: "₺" | "₺₺" | "₺₺₺";
  currenciesAccepted: string;
  openingHoursDefault: string;
  areaServedType: "City" | "AdministrativeArea" | "Country";
}

/**
 * The Canonical IndustryPack Aggregate
 */
export interface IndustryPack {
  id: string;
  slug: string;
  name: string;
  category: IndustryCategory;
  version?: string;
  status?: "ACTIVE" | "DRAFT" | "ARCHIVED";
  description?: string;
  /** Synonyms and search queries that identify this industry in onboarding */
  aliases: string[];
  /** Default service offerings with industry-accurate descriptions */
  defaultServices: IndustryStarterService[];
  /** Curated frequently asked questions and professional answers */
  defaultFaqs: IndustryStarterFaq[];
  /** Default copy text options for Hero, About, Why Us */
  contentDefaults: IndustryContentDefaults;
  /** Semantic queries and high-resolution fallback visuals */
  imageIntents: IndustryImageIntent[];
  /** SEO titles, meta descriptions, and Schema.org classification */
  seoDefaults: IndustrySeoDefaults;
  /** Recommended initial homepage section order and default states */
  recommendedSections: IndustrySectionRecommendation[];
  /** Schema.org structured data attributes */
  schemaHints: IndustrySchemaHints;
}
