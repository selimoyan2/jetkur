/**
 * JetKur Industry Design Presets (Theme Foundation 02D.R)
 *
 * ARCHITECTURAL PRINCIPLES:
 * 1. Does NOT inflate or duplicate the 8 canonical `TemplateManifest` entries.
 * 2. Defines 12 curated Industry Design Presets / Recommendations that map directly onto:
 *    - One of the 8 canonical `templateId`s (`tmpl-rapid-service`, `tmpl-corporate-prestige`,
 *      `tmpl-clinical-pure`, `tmpl-modern-minimal`, `tmpl-artisan-warm`, `tmpl-vip-luxury`,
 *      `tmpl-tech-dynamic`, `tmpl-formal-legal`)
 *    - Supported canonical section variants (`header`, `hero`, `services`, `about`, `footer`, etc.)
 *    - Curated Palette Preset ID (`PREMIUM_PALETTES`)
 *    - Curated Typography Preset ID (`TYPOGRAPHY_PRESETS`)
 *    - Curated Background Preset ID (`GRADIENT_PRESETS`)
 *    - Suggested canonical section order (`TemplateSectionDefault[]`)
 * 3. 100% Claim-Safe: Never fabricates 24/7 availability, emergency promises, certifications,
 *    ratings, guarantees, or phone numbers.
 */

import { CanonicalSectionId } from "../../sections/types";
import {
  TemplateCategory,
  TemplateSectionConfigDefault,
  TemplateGeometryTokens,
} from "../types";
import { TypographyArchetypeId, getTypographyPresetById, toCanonicalTypographyTokens } from "../../brand/typography";
import { getPaletteById, toCanonicalPaletteTokens } from "../../brand/palettes";
import { CustomDesignTokens } from "../../site/designTemplate";

export type CanonicalTemplateId =
  | "tmpl-rapid-service"
  | "tmpl-corporate-prestige"
  | "tmpl-clinical-pure"
  | "tmpl-modern-minimal"
  | "tmpl-artisan-warm"
  | "tmpl-vip-luxury"
  | "tmpl-tech-dynamic"
  | "tmpl-formal-legal";

export interface IndustryDesignPreset {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly description: string;
  readonly category: TemplateCategory;
  readonly previewImageUrl: string;
  /** Target canonical TemplateManifest ID from the 8 canonical templates */
  readonly canonicalTemplateId: CanonicalTemplateId;
  /** Curated palette preset from `PREMIUM_PALETTES` */
  readonly palettePresetId: string;
  /** Curated typography archetype from `TYPOGRAPHY_PRESETS` */
  readonly typographyPresetId: TypographyArchetypeId;
  /** Curated gradient/background preset from `GRADIENT_PRESETS` */
  readonly backgroundPresetId: string;
  /** Canonical section variant recipe */
  readonly sectionVariants: Partial<Record<CanonicalSectionId, string>>;
  /** Suggested canonical section order */
  readonly suggestedSectionOrder: readonly TemplateSectionConfigDefault[];
  /** Optional geometry overrides */
  readonly geometryOverrides?: Partial<TemplateGeometryTokens>;
  readonly recommendedIndustries: readonly string[];
  readonly tags: readonly string[];
}

export const INDUSTRY_DESIGN_PRESETS: readonly IndustryDesignPreset[] = [
  // 1. Sıhhi Tesisat (Plumbing Pro -> maps to tmpl-rapid-service)
  {
    id: "preset-plumbing-pro",
    slug: "plumbing-pro",
    name: "Sıhhi Tesisat & Su Kaçağı Uzmanı",
    description:
      "Su kaçağı tespiti, tıkanıklık açma ve sıhhi tesisat ustaları için telefon ve WhatsApp iletişim odaklı tasarım paketi.",
    category: "modern",
    previewImageUrl:
      "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80",
    canonicalTemplateId: "tmpl-rapid-service",
    palettePresetId: "modern-blue",
    typographyPresetId: "corporate-sans",
    backgroundPresetId: "ocean-blue",
    sectionVariants: {
      header: "local-service",
      hero: "urgent-callout",
      services: "compact-local",
      about: "story-timeline",
      whyUs: "metrics-badges",
      testimonials: "cards-3",
      faqs: "two-column",
      contact: "urgent-dispatch",
      footer: "local-service",
    },
    suggestedSectionOrder: [
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
    geometryOverrides: {
      borderRadius: "md",
      sectionSpacing: "compact",
      cardStyle: "flat-bordered",
      buttonEmphasis: "solid",
    },
    recommendedIndustries: ["plumbing", "water-leak", "pipe-repair", "local-trades", "tesisat"],
    tags: ["tesisat", "su kaçağı", "hızlı arama", "yerel servis", "mavi"],
  },

  // 2. Kombi & Klima Servisi (Climate Service -> maps to tmpl-rapid-service)
  {
    id: "preset-climate-service",
    slug: "climate-service",
    name: "Kombi & Klima Teknik Servis",
    description:
      "Kombi bakımı, klima montaj ve arıza onarım servisleri için yerinde müdahale ve hızlı servis talebi odaklı tasarım paketi.",
    category: "modern",
    previewImageUrl:
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80",
    canonicalTemplateId: "tmpl-rapid-service",
    palettePresetId: "ocean-cyan",
    typographyPresetId: "corporate-sans",
    backgroundPresetId: "ocean-blue",
    sectionVariants: {
      header: "local-service",
      hero: "urgent-callout",
      services: "compact-local",
      about: "story-timeline",
      whyUs: "metrics-badges",
      testimonials: "cards-3",
      faqs: "two-column",
      contact: "urgent-dispatch",
      footer: "local-service",
    },
    suggestedSectionOrder: [
      { sectionId: "header", defaultEnabled: true, recommendedOrder: 0 },
      { sectionId: "hero", defaultEnabled: true, recommendedOrder: 1 },
      { sectionId: "services", defaultEnabled: true, recommendedOrder: 2 },
      { sectionId: "whyUs", defaultEnabled: true, recommendedOrder: 3 },
      { sectionId: "testimonials", defaultEnabled: true, recommendedOrder: 4 },
      { sectionId: "contact", defaultEnabled: true, recommendedOrder: 5 },
      { sectionId: "footer", defaultEnabled: true, recommendedOrder: 999 },
    ],
    geometryOverrides: {
      borderRadius: "lg",
      sectionSpacing: "normal",
      cardStyle: "flat-bordered",
      buttonEmphasis: "solid",
    },
    recommendedIndustries: ["hvac", "climate", "boiler", "repair", "kombi", "klima"],
    tags: ["kombi", "klima", "petek temizliği", "teknik servis", "turkuaz"],
  },

  // 3. Oto Kurtarma & Yol Yardım (Towing Rescue -> maps to tmpl-rapid-service)
  {
    id: "preset-towing-rescue",
    slug: "towing-rescue",
    name: "Oto Kurtarma & Yol Yardım",
    description:
      "Oto çekici, yol yardım ve araç taşıma firmaları için yüksek görünürlüklü telefon ve konum paylaşımı odaklı tasarım paketi.",
    category: "bold",
    previewImageUrl:
      "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80",
    canonicalTemplateId: "tmpl-rapid-service",
    palettePresetId: "copper-industrial",
    typographyPresetId: "corporate-sans",
    backgroundPresetId: "dark-luxury",
    sectionVariants: {
      header: "local-service",
      hero: "urgent-callout",
      services: "compact-local",
      about: "story-timeline",
      whyUs: "metrics-badges",
      testimonials: "cards-3",
      contact: "urgent-dispatch",
      footer: "local-service",
    },
    suggestedSectionOrder: [
      { sectionId: "header", defaultEnabled: true, recommendedOrder: 0 },
      { sectionId: "hero", defaultEnabled: true, recommendedOrder: 1 },
      { sectionId: "services", defaultEnabled: true, recommendedOrder: 2 },
      { sectionId: "whyUs", defaultEnabled: true, recommendedOrder: 3 },
      { sectionId: "about", defaultEnabled: true, recommendedOrder: 4 },
      { sectionId: "contact", defaultEnabled: true, recommendedOrder: 5 },
      { sectionId: "footer", defaultEnabled: true, recommendedOrder: 999 },
    ],
    geometryOverrides: {
      borderRadius: "md",
      sectionSpacing: "compact",
      cardStyle: "elevated",
      buttonEmphasis: "solid",
    },
    recommendedIndustries: ["towing", "roadside-assistance", "auto-rescue", "çekici", "oto kurtarma"],
    tags: ["çekici", "oto kurtarma", "yol yardım", "araç taşıma", "turuncu"],
  },

  // 4. Elektrik & Aydınlatma (Electrician Power -> maps to tmpl-rapid-service)
  {
    id: "preset-electrician-power",
    slug: "electrician-power",
    name: "Elektrik Arıza & Tesisat Uzmanı",
    description:
      "Elektrik arıza onarım, pano montajı ve aydınlatma sistemleri için düzenli servis kartları ve hızlı iletişim odaklı tasarım paketi.",
    category: "bold",
    previewImageUrl:
      "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80",
    canonicalTemplateId: "tmpl-rapid-service",
    palettePresetId: "copper-industrial",
    typographyPresetId: "corporate-sans",
    backgroundPresetId: "champagne",
    sectionVariants: {
      header: "local-service",
      hero: "urgent-callout",
      services: "compact-local",
      about: "story-timeline",
      whyUs: "metrics-badges",
      faqs: "two-column",
      contact: "urgent-dispatch",
      footer: "local-service",
    },
    suggestedSectionOrder: [
      { sectionId: "header", defaultEnabled: true, recommendedOrder: 0 },
      { sectionId: "hero", defaultEnabled: true, recommendedOrder: 1 },
      { sectionId: "services", defaultEnabled: true, recommendedOrder: 2 },
      { sectionId: "whyUs", defaultEnabled: true, recommendedOrder: 3 },
      { sectionId: "faqs", defaultEnabled: true, recommendedOrder: 4 },
      { sectionId: "contact", defaultEnabled: true, recommendedOrder: 5 },
      { sectionId: "footer", defaultEnabled: true, recommendedOrder: 999 },
    ],
    recommendedIndustries: ["electrician", "electrical", "lighting", "elektrik"],
    tags: ["elektrikçi", "pano", "aydınlatma", "tesisat", "bakır"],
  },

  // 5. Diş Kliniği & Ağız Sağlığı (Dental Care -> maps to tmpl-clinical-pure)
  {
    id: "preset-dental-care",
    slug: "dental-care",
    name: "Diş Kliniği & Ağız Sağlığı Merkezi",
    description:
      "Diş hekimleri, ortodonti ve implant klinikleri için ferah, güven veren ve randevu odaklı klinik tasarım paketi.",
    category: "clean",
    previewImageUrl:
      "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80",
    canonicalTemplateId: "tmpl-clinical-pure",
    palettePresetId: "emerald-green",
    typographyPresetId: "modern-minimal",
    backgroundPresetId: "emerald-glow",
    sectionVariants: {
      header: "corporate-classic",
      hero: "clinical-trust",
      services: "bordered-premium",
      about: "doctor-credentials",
      whyUs: "metrics-badges",
      testimonials: "cards-3",
      faqs: "two-column",
      contact: "appointment-booking",
      footer: "corporate-multicolumn",
    },
    suggestedSectionOrder: [
      { sectionId: "header", defaultEnabled: true, recommendedOrder: 0 },
      { sectionId: "hero", defaultEnabled: true, recommendedOrder: 1 },
      { sectionId: "services", defaultEnabled: true, recommendedOrder: 2 },
      { sectionId: "about", defaultEnabled: true, recommendedOrder: 3 },
      { sectionId: "testimonials", defaultEnabled: true, recommendedOrder: 4 },
      { sectionId: "faqs", defaultEnabled: true, recommendedOrder: 5 },
      { sectionId: "contact", defaultEnabled: true, recommendedOrder: 6 },
      { sectionId: "footer", defaultEnabled: true, recommendedOrder: 999 },
    ],
    geometryOverrides: {
      borderRadius: "xl",
      sectionSpacing: "spacious",
      cardStyle: "elevated",
      buttonRadius: "full",
      buttonEmphasis: "solid",
    },
    recommendedIndustries: ["dental", "clinic", "healthcare", "medical", "diş"],
    tags: ["diş kliniği", "implant", "hekim", "randevu", "zümrüt"],
  },

  // 6. Hukuk Bürosu & Avukatlık (Legal Authority -> maps to tmpl-formal-legal)
  {
    id: "preset-legal-authority",
    slug: "legal-authority",
    name: "Hukuk Bürosu & Danışmanlık Ortaklığı",
    description:
      "Avukatlar, arabulucular ve hukuk büroları için ciddi, kurumsal ağırlıklı ve uzmanlık alanı odaklı tasarım paketi.",
    category: "corporate",
    previewImageUrl:
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
    canonicalTemplateId: "tmpl-formal-legal",
    palettePresetId: "royal-purple",
    typographyPresetId: "elegant-serif",
    backgroundPresetId: "royal-purple",
    sectionVariants: {
      header: "corporate-classic",
      hero: "formal-authority",
      services: "bordered-premium",
      about: "legal-partner-bio",
      whyUs: "metrics-badges",
      faqs: "two-column",
      contact: "formal-consultation-form",
      footer: "corporate-multicolumn",
    },
    suggestedSectionOrder: [
      { sectionId: "header", defaultEnabled: true, recommendedOrder: 0 },
      { sectionId: "hero", defaultEnabled: true, recommendedOrder: 1 },
      { sectionId: "about", defaultEnabled: true, recommendedOrder: 2 },
      { sectionId: "services", defaultEnabled: true, recommendedOrder: 3 },
      { sectionId: "faqs", defaultEnabled: true, recommendedOrder: 4 },
      { sectionId: "contact", defaultEnabled: true, recommendedOrder: 5 },
      { sectionId: "footer", defaultEnabled: true, recommendedOrder: 999 },
    ],
    geometryOverrides: {
      borderRadius: "sm",
      sectionSpacing: "spacious",
      cardStyle: "flat-bordered",
      buttonEmphasis: "solid",
    },
    recommendedIndustries: ["legal", "law-firm", "attorney", "mediation", "hukuk", "avukat"],
    tags: ["hukuk", "avukat", "arabulucu", "danışmanlık", "serif"],
  },

  // 7. Gayrimenkul & Portföy (Real Estate Prestige -> maps to tmpl-vip-luxury)
  {
    id: "preset-real-estate-prestige",
    slug: "real-estate-prestige",
    name: "Gayrimenkul & Yatırım Danışmanlığı",
    description:
      "Emlak ofisleri, ticari gayrimenkul uzmanları ve konut projeleri için geniş görsel vitrinli prestij tasarım paketi.",
    category: "luxury",
    previewImageUrl:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80",
    canonicalTemplateId: "tmpl-vip-luxury",
    palettePresetId: "corporate-navy",
    typographyPresetId: "corporate-sans",
    backgroundPresetId: "dark-luxury",
    sectionVariants: {
      header: "premium-editorial",
      hero: "centered-prestige",
      services: "image-card",
      about: "story-timeline",
      whyUs: "metrics-badges",
      testimonials: "cards-3",
      contact: "formal-consultation-form",
      footer: "premium-editorial",
    },
    suggestedSectionOrder: [
      { sectionId: "header", defaultEnabled: true, recommendedOrder: 0 },
      { sectionId: "hero", defaultEnabled: true, recommendedOrder: 1 },
      { sectionId: "services", defaultEnabled: true, recommendedOrder: 2 },
      { sectionId: "whyUs", defaultEnabled: true, recommendedOrder: 3 },
      { sectionId: "about", defaultEnabled: true, recommendedOrder: 4 },
      { sectionId: "contact", defaultEnabled: true, recommendedOrder: 5 },
      { sectionId: "footer", defaultEnabled: true, recommendedOrder: 999 },
    ],
    geometryOverrides: {
      borderRadius: "lg",
      containerMaxWidth: "wide",
      sectionSpacing: "spacious",
      cardStyle: "elevated",
    },
    recommendedIndustries: ["real-estate", "property", "realtor", "gayrimenkul", "emlak"],
    tags: ["gayrimenkul", "emlak", "portföy", "yatırım", "lacivert"],
  },

  // 8. Güzellik & Estetik Merkezi (Beauty Aesthetic -> maps to tmpl-modern-minimal)
  {
    id: "preset-beauty-aesthetic",
    slug: "beauty-aesthetic",
    name: "Güzellik Salonu, Spa & Estetik",
    description:
      "Cilt bakımı, güzellik merkezleri ve spa salonları için zarif tipografi ve görsel odaklı tasarım paketi.",
    category: "minimal",
    previewImageUrl:
      "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=800&q=80",
    canonicalTemplateId: "tmpl-modern-minimal",
    palettePresetId: "botanical-sage",
    typographyPresetId: "elegant-serif",
    backgroundPresetId: "champagne",
    sectionVariants: {
      header: "modern-minimal",
      hero: "minimal-lead",
      services: "image-card",
      about: "story-timeline",
      testimonials: "cards-3",
      faqs: "two-column",
      contact: "appointment-booking",
      footer: "minimal-clean",
    },
    suggestedSectionOrder: [
      { sectionId: "header", defaultEnabled: true, recommendedOrder: 0 },
      { sectionId: "hero", defaultEnabled: true, recommendedOrder: 1 },
      { sectionId: "services", defaultEnabled: true, recommendedOrder: 2 },
      { sectionId: "about", defaultEnabled: true, recommendedOrder: 3 },
      { sectionId: "testimonials", defaultEnabled: true, recommendedOrder: 4 },
      { sectionId: "contact", defaultEnabled: true, recommendedOrder: 5 },
      { sectionId: "footer", defaultEnabled: true, recommendedOrder: 999 },
    ],
    geometryOverrides: {
      borderRadius: "xl",
      sectionSpacing: "spacious",
      cardStyle: "elevated",
      buttonRadius: "full",
      buttonEmphasis: "solid",
    },
    recommendedIndustries: ["beauty", "aesthetic", "spa", "salon", "güzellik", "estetik"],
    tags: ["güzellik", "estetik", "spa", "randevu", "adaçayı"],
  },

  // 9. Butik Otel & Konaklama (Hotel Resort -> maps to tmpl-vip-luxury)
  {
    id: "preset-hotel-resort",
    slug: "hotel-resort",
    name: "Butik Otel & Seçkin Konaklama",
    description:
      "Butik oteller, tatil köyleri ve pansiyonlar için atmosferik görsel sunum ve rezervasyon iletişim odaklı tasarım paketi.",
    category: "luxury",
    previewImageUrl:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    canonicalTemplateId: "tmpl-vip-luxury",
    palettePresetId: "black-gold",
    typographyPresetId: "premium-editorial",
    backgroundPresetId: "dark-luxury",
    sectionVariants: {
      header: "premium-editorial",
      hero: "centered-prestige",
      services: "image-card",
      about: "story-timeline",
      testimonials: "cards-3",
      contact: "formal-consultation-form",
      footer: "premium-editorial",
    },
    suggestedSectionOrder: [
      { sectionId: "header", defaultEnabled: true, recommendedOrder: 0 },
      { sectionId: "hero", defaultEnabled: true, recommendedOrder: 1 },
      { sectionId: "services", defaultEnabled: true, recommendedOrder: 2 },
      { sectionId: "about", defaultEnabled: true, recommendedOrder: 3 },
      { sectionId: "testimonials", defaultEnabled: true, recommendedOrder: 4 },
      { sectionId: "contact", defaultEnabled: true, recommendedOrder: 5 },
      { sectionId: "footer", defaultEnabled: true, recommendedOrder: 999 },
    ],
    geometryOverrides: {
      borderRadius: "sm",
      containerMaxWidth: "wide",
      sectionSpacing: "spacious",
      cardStyle: "flat-bordered",
    },
    recommendedIndustries: ["hotel", "hospitality", "resort", "tourism", "otel", "konaklama"],
    tags: ["otel", "butik otel", "konaklama", "tatil", "altın"],
  },

  // 10. Restoran, Kafe & Gastronomi (Restaurant Gourmet -> maps to tmpl-artisan-warm)
  {
    id: "preset-restaurant-gourmet",
    slug: "restaurant-gourmet",
    name: "Gurme Restoran & Masa Rezervasyonu",
    description:
      "Şef restoranları, kafeler, pastaneler ve lezzet mekanları için sıcak pişmiş toprak tonları ve masa rezervasyonu tasarım paketi.",
    category: "artisan",
    previewImageUrl:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    canonicalTemplateId: "tmpl-artisan-warm",
    palettePresetId: "terracotta",
    typographyPresetId: "elegant-serif",
    backgroundPresetId: "sunset",
    sectionVariants: {
      header: "modern-minimal",
      hero: "minimal-lead",
      services: "image-card",
      about: "story-timeline",
      whyUs: "metrics-badges",
      testimonials: "cards-3",
      contact: "formal-consultation-form",
      footer: "corporate-multicolumn",
    },
    suggestedSectionOrder: [
      { sectionId: "header", defaultEnabled: true, recommendedOrder: 0 },
      { sectionId: "hero", defaultEnabled: true, recommendedOrder: 1 },
      { sectionId: "services", defaultEnabled: true, recommendedOrder: 2 },
      { sectionId: "about", defaultEnabled: true, recommendedOrder: 3 },
      { sectionId: "testimonials", defaultEnabled: true, recommendedOrder: 4 },
      { sectionId: "contact", defaultEnabled: true, recommendedOrder: 5 },
      { sectionId: "footer", defaultEnabled: true, recommendedOrder: 999 },
    ],
    geometryOverrides: {
      borderRadius: "lg",
      sectionSpacing: "normal",
      cardStyle: "flat-bordered",
    },
    recommendedIndustries: ["restaurant", "cafe", "culinary", "food", "restoran", "kafe"],
    tags: ["restoran", "kafe", "menü", "rezervasyon", "gurme"],
  },

  // 11. İnşaat, Mimarlık & Taahhüt (Construction Architect -> maps to tmpl-modern-minimal)
  {
    id: "preset-construction-architect",
    slug: "construction-architect",
    name: "İnşaat, Müteahhitlik & Mimarlık",
    description:
      "Konut projeleri, kentsel dönüşüm, çelik yapı ve mimarlık ofisleri için sağlam, teknik ve referans vitrini tasarım paketi.",
    category: "minimal",
    previewImageUrl:
      "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80",
    canonicalTemplateId: "tmpl-modern-minimal",
    palettePresetId: "slate-modern",
    typographyPresetId: "corporate-sans",
    backgroundPresetId: "dark-luxury",
    sectionVariants: {
      header: "corporate-classic",
      hero: "centered-prestige",
      services: "bordered-premium",
      about: "story-timeline",
      whyUs: "metrics-badges",
      testimonials: "cards-3",
      contact: "formal-consultation-form",
      footer: "corporate-multicolumn",
    },
    suggestedSectionOrder: [
      { sectionId: "header", defaultEnabled: true, recommendedOrder: 0 },
      { sectionId: "hero", defaultEnabled: true, recommendedOrder: 1 },
      { sectionId: "services", defaultEnabled: true, recommendedOrder: 2 },
      { sectionId: "about", defaultEnabled: true, recommendedOrder: 3 },
      { sectionId: "whyUs", defaultEnabled: true, recommendedOrder: 4 },
      { sectionId: "contact", defaultEnabled: true, recommendedOrder: 5 },
      { sectionId: "footer", defaultEnabled: true, recommendedOrder: 999 },
    ],
    geometryOverrides: {
      borderRadius: "none",
      containerMaxWidth: "wide",
      sectionSpacing: "spacious",
      cardStyle: "flat-bordered",
    },
    recommendedIndustries: ["construction", "architecture", "contractor", "engineering", "inşaat", "mimarlık"],
    tags: ["inşaat", "müteahhit", "mimarlık", "proje", "antrasit"],
  },

  // 12. Kurumsal Danışmanlık & Yönetim (Consulting Advisory -> maps to tmpl-corporate-prestige)
  {
    id: "preset-consulting-advisory",
    slug: "consulting-advisory",
    name: "Yönetim Danışmanlığı & Finansal Strateji",
    description:
      "Mali müşavirler, yönetim danışmanları ve denetim firmaları için stratejik, analitik ve güven verici B2B tasarım paketi.",
    category: "corporate",
    previewImageUrl:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
    canonicalTemplateId: "tmpl-corporate-prestige",
    palettePresetId: "corporate-navy",
    typographyPresetId: "corporate-sans",
    backgroundPresetId: "ocean-blue",
    sectionVariants: {
      header: "corporate-classic",
      hero: "centered-prestige",
      services: "bordered-premium",
      about: "story-timeline",
      whyUs: "metrics-badges",
      testimonials: "quotes-minimal",
      faqs: "two-column",
      contact: "formal-consultation-form",
      footer: "corporate-multicolumn",
    },
    suggestedSectionOrder: [
      { sectionId: "header", defaultEnabled: true, recommendedOrder: 0 },
      { sectionId: "hero", defaultEnabled: true, recommendedOrder: 1 },
      { sectionId: "about", defaultEnabled: true, recommendedOrder: 2 },
      { sectionId: "services", defaultEnabled: true, recommendedOrder: 3 },
      { sectionId: "whyUs", defaultEnabled: true, recommendedOrder: 4 },
      { sectionId: "faqs", defaultEnabled: true, recommendedOrder: 5 },
      { sectionId: "contact", defaultEnabled: true, recommendedOrder: 6 },
      { sectionId: "footer", defaultEnabled: true, recommendedOrder: 999 },
    ],
    geometryOverrides: {
      borderRadius: "lg",
      containerMaxWidth: "standard",
      sectionSpacing: "normal",
      cardStyle: "flat-bordered",
    },
    recommendedIndustries: ["consulting", "advisory", "management", "finance", "audit", "danışmanlık"],
    tags: ["danışmanlık", "strateji", "finans", "yönetim", "b2b"],
  },
];

const INDUSTRY_PRESETS_BY_ID = new Map<string, IndustryDesignPreset>();
for (const preset of INDUSTRY_DESIGN_PRESETS) {
  INDUSTRY_PRESETS_BY_ID.set(preset.id, preset);
  INDUSTRY_PRESETS_BY_ID.set(preset.slug, preset);
  INDUSTRY_PRESETS_BY_ID.set(`tmpl-${preset.slug}`, preset);
}

/**
 * Lists all 12 canonical Industry Design Presets
 */
export function listIndustryDesignPresets(): readonly IndustryDesignPreset[] {
  return INDUSTRY_DESIGN_PRESETS;
}

/**
 * Resolves an Industry Design Preset by its ID, slug, or legacy `tmpl-*` alias
 */
export function getIndustryPresetById(idOrSlug: string): IndustryDesignPreset | null {
  if (!idOrSlug || typeof idOrSlug !== "string") return null;
  return INDUSTRY_PRESETS_BY_ID.get(idOrSlug.trim()) || null;
}

/**
 * Builds canonical `CustomDesignTokens` for an IndustryDesignPreset
 */
export function buildPresetCustomTokens(
  preset: IndustryDesignPreset,
  preserveExistingPaletteOverride?: CustomDesignTokens["palette"]
): CustomDesignTokens {
  const pal = getPaletteById(preset.palettePresetId);
  const typo = getTypographyPresetById(preset.typographyPresetId);

  return {
    palette:
      preserveExistingPaletteOverride && Object.keys(preserveExistingPaletteOverride).length > 0
        ? preserveExistingPaletteOverride
        : toCanonicalPaletteTokens(pal),
    typography: toCanonicalTypographyTokens(typo),
    ...(preset.geometryOverrides ? { geometry: preset.geometryOverrides } : {}),
  };
}
