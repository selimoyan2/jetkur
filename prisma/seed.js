// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

// src/domain/entitlements/registry.ts
var ENTITLEMENT_KEYS = {
  // Core Site Access & Authoring
  SITE_VIEW: "site.view",
  SITE_CREATE: "site.create",
  SITE_EDIT: "site.edit",
  SITE_PUBLISH: "site.publish",
  SITE_CUSTOM_DOMAIN: "site.customDomain",
  SITE_BLOG: "site.blog",
  SITE_FAQ: "site.faq",
  SITE_GALLERY: "site.gallery",
  SITE_MULTILANGUAGE: "site.multilanguage",
  // Analytics & Lead Capture
  ANALYTICS_BASIC: "site.analytics.basic",
  ANALYTICS_ADVANCED: "site.analytics.advanced",
  FORMS_BASIC: "site.forms.basic",
  FORMS_ADVANCED: "site.forms.advanced",
  // Growth & Marketing
  MARKETING_QR: "marketing.qr",
  MARKETING_AB_TESTING: "marketing.abTesting",
  MARKETING_EMAIL_AUTOMATION: "marketing.emailAutomation",
  // Search Engine Optimization (SEO)
  SEO_BASIC: "seo.basic",
  SEO_ADVANCED: "seo.advanced",
  // Agency & Multi-Client Scale
  AGENCY_MULTI_SITE: "agency.multiSite",
  AGENCY_CLIENT_PORTAL: "agency.clientPortal",
  AGENCY_COMPETITOR_ANALYSIS: "agency.competitorAnalysis",
  AGENCY_WHITE_LABEL: "agency.whiteLabel",
  // Platform & Architecture
  PLATFORM_TEMPLATE_FACTORY: "platform.templateFactory"
};
var LIMIT_KEYS = {
  MAX_SITES: "sites.max",
  MAX_LANGUAGES: "languages.max",
  MAX_TEAM_MEMBERS: "teamMembers.max"
};
var ENTITLEMENT_CATALOG = {
  [ENTITLEMENT_KEYS.SITE_VIEW]: {
    key: ENTITLEMENT_KEYS.SITE_VIEW,
    name: "Site G\xF6r\xFCnt\xFCleme & Okuma",
    description: "T\xFCm aktif ve s\xFCresi dolmu\u015F hesaplarda sitelerin okunabilmesi",
    category: "CORE",
    isCore: true
  },
  [ENTITLEMENT_KEYS.SITE_CREATE]: {
    key: ENTITLEMENT_KEYS.SITE_CREATE,
    name: "Yeni Site Olu\u015Fturma",
    description: "Paket limitine g\xF6re yeni site/landing page \xFCretimi",
    category: "CORE",
    isCore: true
  },
  [ENTITLEMENT_KEYS.SITE_EDIT]: {
    key: ENTITLEMENT_KEYS.SITE_EDIT,
    name: "Site \u0130\xE7eri\u011Fi D\xFCzenleme",
    description: "Firma bilgileri, ileti\u015Fim, hizmetler ve b\xF6l\xFCmlerin d\xFCzenlenmesi",
    category: "CORE",
    isCore: true
  },
  [ENTITLEMENT_KEYS.SITE_PUBLISH]: {
    key: ENTITLEMENT_KEYS.SITE_PUBLISH,
    name: "Canl\u0131ya Yay\u0131nlama (Deploy)",
    description: "Siteyi internete ve CDN a\u011F\u0131na canl\u0131 olarak da\u011F\u0131tma",
    category: "CORE",
    isCore: true
  },
  [ENTITLEMENT_KEYS.SITE_FAQ]: {
    key: ENTITLEMENT_KEYS.SITE_FAQ,
    name: "S\u0131k\xE7a Sorulan Sorular",
    description: "Sekt\xF6rel ve \xF6zel SSS y\xF6netimi",
    category: "CORE",
    isCore: true
  },
  [ENTITLEMENT_KEYS.SITE_GALLERY]: {
    key: ENTITLEMENT_KEYS.SITE_GALLERY,
    name: "Foto\u011Fraf & Medya Galerisi",
    description: "\u0130\u015Fletme g\xF6rsel galerisi y\xF6netimi",
    category: "CORE",
    isCore: true
  },
  [ENTITLEMENT_KEYS.FORMS_BASIC]: {
    key: ENTITLEMENT_KEYS.FORMS_BASIC,
    name: "Temel \u0130leti\u015Fim Formlar\u0131",
    description: "Ziyaret\xE7i teklif ve randevu formlar\u0131",
    category: "CORE",
    isCore: true
  },
  [ENTITLEMENT_KEYS.ANALYTICS_BASIC]: {
    key: ENTITLEMENT_KEYS.ANALYTICS_BASIC,
    name: "Temel Ziyaret\xE7i \u0130statistikleri",
    description: "G\xFCnl\xFCk tekil ziyaret\xE7i ve sayfa g\xF6sterimleri",
    category: "CORE",
    isCore: true
  },
  [ENTITLEMENT_KEYS.SEO_BASIC]: {
    key: ENTITLEMENT_KEYS.SEO_BASIC,
    name: "Temel Arama Motoru Optimizasyonu",
    description: "Meta etiketleri, sitemap.xml ve temel indeksleme",
    category: "CORE",
    isCore: true
  },
  [ENTITLEMENT_KEYS.MARKETING_QR]: {
    key: ENTITLEMENT_KEYS.MARKETING_QR,
    name: "\u0130\u015Fletme QR Kod \xDCretimi",
    description: "Masa, bro\u015F\xFCr ve vitrin i\xE7in dinamik QR kodlar",
    category: "CORE",
    isCore: true
  },
  [ENTITLEMENT_KEYS.SITE_CUSTOM_DOMAIN]: {
    key: ENTITLEMENT_KEYS.SITE_CUSTOM_DOMAIN,
    name: "\xD6zel Alan Ad\u0131 (Custom Domain)",
    description: "Kendi alan ad\u0131n\u0131 (firma.com) ba\u011Flama ve otomatik SSL",
    category: "STANDARD",
    isCore: false
  },
  [ENTITLEMENT_KEYS.SITE_BLOG]: {
    key: ENTITLEMENT_KEYS.SITE_BLOG,
    name: "Sekt\xF6rel Blog & \u0130\xE7erik Motoru",
    description: "D\xFCzenli organik trafik \xE7eken blog mod\xFCl\xFC",
    category: "STANDARD",
    isCore: false
  },
  [ENTITLEMENT_KEYS.SITE_MULTILANGUAGE]: {
    key: ENTITLEMENT_KEYS.SITE_MULTILANGUAGE,
    name: "\xC7oklu Dil Deste\u011Fi (i18n)",
    description: "\u0130ngilizce, Almanca, Rus\xE7a ve Arap\xE7a \xE7oklu dil altyap\u0131s\u0131",
    category: "STANDARD",
    isCore: false
  },
  [ENTITLEMENT_KEYS.FORMS_ADVANCED]: {
    key: ENTITLEMENT_KEYS.FORMS_ADVANCED,
    name: "Geli\u015Fmi\u015F Formlar & \xD6zel Ak\u0131\u015Flar",
    description: "Ko\u015Fullu alanlar, dosya y\xFCkleme ve CRM webhooklar\u0131",
    category: "PRO",
    isCore: false
  },
  [ENTITLEMENT_KEYS.ANALYTICS_ADVANCED]: {
    key: ENTITLEMENT_KEYS.ANALYTICS_ADVANCED,
    name: "Geli\u015Fmi\u015F Analitik & Is\u0131 Haritas\u0131",
    description: "D\xF6n\xFC\u015F\xFCm hunileri ve detayl\u0131 kullan\u0131c\u0131 etkile\u015Fim raporlar\u0131",
    category: "PRO",
    isCore: false
  },
  [ENTITLEMENT_KEYS.SEO_ADVANCED]: {
    key: ENTITLEMENT_KEYS.SEO_ADVANCED,
    name: "Geli\u015Fmi\u015F AI Destekli SEO & Schema",
    description: "Yerel SEO zengin sonu\xE7lar\u0131 (LocalBusiness Schema) ve anahtar kelime takibi",
    category: "PRO",
    isCore: false
  },
  [ENTITLEMENT_KEYS.MARKETING_AB_TESTING]: {
    key: ENTITLEMENT_KEYS.MARKETING_AB_TESTING,
    name: "A/B Test Altyap\u0131s\u0131",
    description: "Ba\u015Fl\u0131k ve CTA d\xF6n\xFC\u015F\xFCm split testleri",
    category: "PRO",
    isCore: false
  },
  [ENTITLEMENT_KEYS.MARKETING_EMAIL_AUTOMATION]: {
    key: ENTITLEMENT_KEYS.MARKETING_EMAIL_AUTOMATION,
    name: "Otomatik E-posta Bildirimleri",
    description: "Teklif formlar\u0131 i\xE7in anl\u0131k m\xFC\u015Fteri ve i\u015Fletme bildirimleri",
    category: "PRO",
    isCore: false
  },
  [ENTITLEMENT_KEYS.AGENCY_MULTI_SITE]: {
    key: ENTITLEMENT_KEYS.AGENCY_MULTI_SITE,
    name: "\xC7oklu M\xFC\u015Fteri / Site Y\xF6netimi",
    description: "Tek panelden 10+ m\xFC\u015Fteri sitesini y\xF6netebilme",
    category: "AGENCY",
    isCore: false
  },
  [ENTITLEMENT_KEYS.AGENCY_CLIENT_PORTAL]: {
    key: ENTITLEMENT_KEYS.AGENCY_CLIENT_PORTAL,
    name: "M\xFC\u015Fteri Yetkilendirme Portal\u0131",
    description: "M\xFC\u015Fterilere k\u0131s\u0131tl\u0131 d\xFCzenleme eri\u015Fimi sa\u011Flama",
    category: "AGENCY",
    isCore: false
  },
  [ENTITLEMENT_KEYS.AGENCY_COMPETITOR_ANALYSIS]: {
    key: ENTITLEMENT_KEYS.AGENCY_COMPETITOR_ANALYSIS,
    name: "Rakip Analizi & K\u0131yaslama Motoru",
    description: "Sekt\xF6rel rakipleri inceleme ve stratejik a\xE7\u0131k raporlar\u0131",
    category: "AGENCY",
    isCore: false
  },
  [ENTITLEMENT_KEYS.AGENCY_WHITE_LABEL]: {
    key: ENTITLEMENT_KEYS.AGENCY_WHITE_LABEL,
    name: "White-Label & Markas\u0131z Panel",
    description: "Ajans\u0131n kendi logosu ve markas\u0131yla paneli sunabilmesi",
    category: "AGENCY",
    isCore: false
  },
  [ENTITLEMENT_KEYS.PLATFORM_TEMPLATE_FACTORY]: {
    key: ENTITLEMENT_KEYS.PLATFORM_TEMPLATE_FACTORY,
    name: "AI \u015Eablon Fabrikas\u0131",
    description: "Sekt\xF6re \xF6zel \xF6zelle\u015Ftirilebilir \u015Fablon \xFCretimi",
    category: "AGENCY",
    isCore: false
  }
};

// src/server/entitlements/planDefinitions.ts
var TRIAL_DAYS_DEFAULT = 14;
var CANONICAL_PLAN_CODES = {
  ENTRY: "ENTRY",
  BUSINESS: "BUSINESS",
  AGENCY: "AGENCY"
};
var DEFAULT_TRIAL_PLAN_CODE = CANONICAL_PLAN_CODES.BUSINESS;
var CANONICAL_PLANS = {
  [CANONICAL_PLAN_CODES.ENTRY]: {
    code: CANONICAL_PLAN_CODES.ENTRY,
    name: "Ba\u015Flang\u0131\xE7",
    description: "Tek siteyle dijital varl\u0131\u011F\u0131n\u0131 h\u0131zl\u0131 ve zahmetsizce kurmak isteyen yerel esnaf ve KOB\u0130'ler i\xE7in",
    siteLimit: 1,
    trialDays: TRIAL_DAYS_DEFAULT,
    monthlyPrice: 29900,
    currency: "TRY",
    features: {
      // Core Access
      [ENTITLEMENT_KEYS.SITE_VIEW]: true,
      [ENTITLEMENT_KEYS.SITE_CREATE]: true,
      [ENTITLEMENT_KEYS.SITE_EDIT]: true,
      [ENTITLEMENT_KEYS.SITE_PUBLISH]: true,
      [ENTITLEMENT_KEYS.SITE_FAQ]: true,
      [ENTITLEMENT_KEYS.SITE_GALLERY]: true,
      [ENTITLEMENT_KEYS.FORMS_BASIC]: true,
      [ENTITLEMENT_KEYS.ANALYTICS_BASIC]: true,
      [ENTITLEMENT_KEYS.SEO_BASIC]: true,
      [ENTITLEMENT_KEYS.MARKETING_QR]: true,
      // Standard & Pro features (disabled in Entry)
      [ENTITLEMENT_KEYS.SITE_CUSTOM_DOMAIN]: false,
      [ENTITLEMENT_KEYS.SITE_BLOG]: false,
      [ENTITLEMENT_KEYS.SITE_MULTILANGUAGE]: false,
      [ENTITLEMENT_KEYS.FORMS_ADVANCED]: false,
      [ENTITLEMENT_KEYS.ANALYTICS_ADVANCED]: false,
      [ENTITLEMENT_KEYS.SEO_ADVANCED]: false,
      [ENTITLEMENT_KEYS.MARKETING_AB_TESTING]: false,
      [ENTITLEMENT_KEYS.MARKETING_EMAIL_AUTOMATION]: false,
      // Agency features (disabled in Entry)
      [ENTITLEMENT_KEYS.AGENCY_MULTI_SITE]: false,
      [ENTITLEMENT_KEYS.AGENCY_CLIENT_PORTAL]: false,
      [ENTITLEMENT_KEYS.AGENCY_COMPETITOR_ANALYSIS]: false,
      [ENTITLEMENT_KEYS.AGENCY_WHITE_LABEL]: false,
      [ENTITLEMENT_KEYS.PLATFORM_TEMPLATE_FACTORY]: false
    },
    limits: {
      [LIMIT_KEYS.MAX_SITES]: 1,
      [LIMIT_KEYS.MAX_LANGUAGES]: 1,
      [LIMIT_KEYS.MAX_TEAM_MEMBERS]: 1
    }
  },
  [CANONICAL_PLAN_CODES.BUSINESS]: {
    code: CANONICAL_PLAN_CODES.BUSINESS,
    name: "\u0130\u015Fletme",
    description: "Kendi alan ad\u0131n\u0131 ba\u011Flamak, blog yay\u0131nlamak ve birden fazla lokasyonu y\xF6netmek isteyen b\xFCy\xFCyen i\u015Fletmeler i\xE7in",
    siteLimit: 3,
    trialDays: TRIAL_DAYS_DEFAULT,
    monthlyPrice: 69900,
    currency: "TRY",
    features: {
      // All Entry Features
      [ENTITLEMENT_KEYS.SITE_VIEW]: true,
      [ENTITLEMENT_KEYS.SITE_CREATE]: true,
      [ENTITLEMENT_KEYS.SITE_EDIT]: true,
      [ENTITLEMENT_KEYS.SITE_PUBLISH]: true,
      [ENTITLEMENT_KEYS.SITE_FAQ]: true,
      [ENTITLEMENT_KEYS.SITE_GALLERY]: true,
      [ENTITLEMENT_KEYS.FORMS_BASIC]: true,
      [ENTITLEMENT_KEYS.ANALYTICS_BASIC]: true,
      [ENTITLEMENT_KEYS.SEO_BASIC]: true,
      [ENTITLEMENT_KEYS.MARKETING_QR]: true,
      // Standard & Pro Features (enabled in Business)
      [ENTITLEMENT_KEYS.SITE_CUSTOM_DOMAIN]: true,
      [ENTITLEMENT_KEYS.SITE_BLOG]: true,
      [ENTITLEMENT_KEYS.SITE_MULTILANGUAGE]: true,
      [ENTITLEMENT_KEYS.FORMS_ADVANCED]: true,
      [ENTITLEMENT_KEYS.ANALYTICS_ADVANCED]: true,
      [ENTITLEMENT_KEYS.SEO_ADVANCED]: true,
      [ENTITLEMENT_KEYS.MARKETING_AB_TESTING]: true,
      [ENTITLEMENT_KEYS.MARKETING_EMAIL_AUTOMATION]: true,
      // Agency Features (disabled in Business)
      [ENTITLEMENT_KEYS.AGENCY_MULTI_SITE]: false,
      [ENTITLEMENT_KEYS.AGENCY_CLIENT_PORTAL]: false,
      [ENTITLEMENT_KEYS.AGENCY_COMPETITOR_ANALYSIS]: false,
      [ENTITLEMENT_KEYS.AGENCY_WHITE_LABEL]: false,
      [ENTITLEMENT_KEYS.PLATFORM_TEMPLATE_FACTORY]: false
    },
    limits: {
      [LIMIT_KEYS.MAX_SITES]: 3,
      [LIMIT_KEYS.MAX_LANGUAGES]: 3,
      [LIMIT_KEYS.MAX_TEAM_MEMBERS]: 3
    }
  },
  [CANONICAL_PLAN_CODES.AGENCY]: {
    code: CANONICAL_PLAN_CODES.AGENCY,
    name: "Ajans",
    description: "M\xFC\u015Fterilerine anahtar teslim web sitesi ve SEO y\xF6netimi sunan dijital ajanslar ve profesyoneller i\xE7in",
    siteLimit: 10,
    trialDays: TRIAL_DAYS_DEFAULT,
    monthlyPrice: 199900,
    currency: "TRY",
    features: {
      // All Business Features
      [ENTITLEMENT_KEYS.SITE_VIEW]: true,
      [ENTITLEMENT_KEYS.SITE_CREATE]: true,
      [ENTITLEMENT_KEYS.SITE_EDIT]: true,
      [ENTITLEMENT_KEYS.SITE_PUBLISH]: true,
      [ENTITLEMENT_KEYS.SITE_FAQ]: true,
      [ENTITLEMENT_KEYS.SITE_GALLERY]: true,
      [ENTITLEMENT_KEYS.FORMS_BASIC]: true,
      [ENTITLEMENT_KEYS.ANALYTICS_BASIC]: true,
      [ENTITLEMENT_KEYS.SEO_BASIC]: true,
      [ENTITLEMENT_KEYS.MARKETING_QR]: true,
      [ENTITLEMENT_KEYS.SITE_CUSTOM_DOMAIN]: true,
      [ENTITLEMENT_KEYS.SITE_BLOG]: true,
      [ENTITLEMENT_KEYS.SITE_MULTILANGUAGE]: true,
      [ENTITLEMENT_KEYS.FORMS_ADVANCED]: true,
      [ENTITLEMENT_KEYS.ANALYTICS_ADVANCED]: true,
      [ENTITLEMENT_KEYS.SEO_ADVANCED]: true,
      [ENTITLEMENT_KEYS.MARKETING_AB_TESTING]: true,
      [ENTITLEMENT_KEYS.MARKETING_EMAIL_AUTOMATION]: true,
      // Agency Features (all enabled)
      [ENTITLEMENT_KEYS.AGENCY_MULTI_SITE]: true,
      [ENTITLEMENT_KEYS.AGENCY_CLIENT_PORTAL]: true,
      [ENTITLEMENT_KEYS.AGENCY_COMPETITOR_ANALYSIS]: true,
      [ENTITLEMENT_KEYS.AGENCY_WHITE_LABEL]: true,
      [ENTITLEMENT_KEYS.PLATFORM_TEMPLATE_FACTORY]: true
    },
    limits: {
      [LIMIT_KEYS.MAX_SITES]: 10,
      [LIMIT_KEYS.MAX_LANGUAGES]: 10,
      [LIMIT_KEYS.MAX_TEAM_MEMBERS]: 20
    }
  }
};

// src/domain/templates/manifests/rapidService.ts
var rapidServiceManifest = {
  schemaVersion: 1,
  id: "tmpl-rapid-service",
  slug: "rapid-service",
  name: "H\u0131zl\u0131 M\xFCdahale & Acil \xC7a\u011Fr\u0131",
  description: "Zaman\u0131n kritik oldu\u011Fu acil sekt\xF6rler ve h\u0131zl\u0131 servis hizmetleri i\xE7in tek t\u0131kla arama ve acil eylem odakl\u0131 kompakt tasar\u0131m.",
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
      border: "#E7E5E4"
    },
    typography: {
      fontHeading: "Plus Jakarta Sans",
      fontBody: "Inter",
      headingWeight: "800",
      baseFontSize: "16px"
    },
    geometry: {
      borderRadius: "xl",
      containerMaxWidth: "standard",
      sectionSpacing: "compact",
      cardStyle: "subtle-shadow"
    },
    header: {
      layout: "standard",
      showTopBar: true
    },
    footer: {
      layout: "simple-centered"
    }
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
    footer: "simple-centered"
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
    { sectionId: "footer", defaultEnabled: true, recommendedOrder: 999 }
  ],
  capabilities: {
    supportsDarkMode: false,
    isResponsive: true,
    supportsCustomTokens: true,
    maxHeaderLinks: 6,
    recommendedContainerWidth: "standard"
  },
  recommendedIndustries: ["automotive", "home-services", "emergency", "repair"],
  tags: ["acil", "h\u0131zl\u0131-arama", "y\xFCksek-d\xF6n\xFC\u015F\xFCm", "kompakt"]
};

// src/domain/templates/manifests/corporatePrestige.ts
var corporatePrestigeManifest = {
  schemaVersion: 1,
  id: "tmpl-corporate-prestige",
  slug: "corporate-prestige",
  name: "Kurumsal Prestij & Otorite",
  description: "Mali m\xFC\u015Favirler, dan\u0131\u015Fmanl\u0131k firmalar\u0131 ve kurumsal \u015Firketler i\xE7in tasarlanm\u0131\u015F otoriter, g\xFCven veren lacivert mimari.",
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
      border: "#CBD5E1"
    },
    typography: {
      fontHeading: "Plus Jakarta Sans",
      fontBody: "Inter",
      headingWeight: "700",
      baseFontSize: "16px"
    },
    geometry: {
      borderRadius: "lg",
      containerMaxWidth: "standard",
      sectionSpacing: "normal",
      cardStyle: "flat-bordered"
    },
    header: {
      layout: "split-action",
      showTopBar: true
    },
    footer: {
      layout: "corporate-detailed"
    }
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
    footer: "corporate-detailed"
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
    { sectionId: "footer", defaultEnabled: true, recommendedOrder: 999 }
  ],
  capabilities: {
    supportsDarkMode: false,
    isResponsive: true,
    supportsCustomTokens: true,
    maxHeaderLinks: 7,
    recommendedContainerWidth: "standard"
  },
  recommendedIndustries: ["legal", "consulting", "finance", "logistics", "corporate"],
  tags: ["kurumsal", "prestij", "lacivert", "g\xFCven", "b2b"]
};

// src/domain/templates/manifests/clinicalPure.ts
var clinicalPureManifest = {
  schemaVersion: 1,
  id: "tmpl-clinical-pure",
  slug: "clinical-pure",
  name: "Ferah Klinik & Sa\u011Fl\u0131k",
  description: "Di\u015F klinikleri, estetik merkezleri ve uzman hekimler i\xE7in hasta g\xFCvenini \xF6n plana \xE7\u0131karan ferah z\xFCmr\xFCt tonlar\u0131 ve randevu odakl\u0131 yap\u0131.",
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
      border: "#E5E7EB"
    },
    typography: {
      fontHeading: "Plus Jakarta Sans",
      fontBody: "Inter",
      headingWeight: "700",
      baseFontSize: "16px"
    },
    geometry: {
      borderRadius: "2xl",
      containerMaxWidth: "standard",
      sectionSpacing: "spacious",
      cardStyle: "subtle-shadow"
    },
    header: {
      layout: "standard",
      showTopBar: true
    },
    footer: {
      layout: "multi-column-rich"
    }
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
    footer: "multi-column"
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
    { sectionId: "footer", defaultEnabled: true, recommendedOrder: 999 }
  ],
  capabilities: {
    supportsDarkMode: false,
    isResponsive: true,
    supportsCustomTokens: true,
    maxHeaderLinks: 6,
    recommendedContainerWidth: "standard"
  },
  recommendedIndustries: ["health", "dental", "clinic", "wellness", "medical"],
  tags: ["sa\u011Fl\u0131k", "klinik", "di\u015F-hekimi", "ferah", "randevu"]
};

// src/domain/templates/manifests/modernMinimal.ts
var modernMinimalManifest = {
  schemaVersion: 1,
  id: "tmpl-modern-minimal",
  slug: "modern-minimal",
  name: "Modern Minimalist & Mimari",
  description: "Mimarlar, tasar\u0131m st\xFCdyolar\u0131 ve butik ajanslar i\xE7in monokrom, geni\u015F bo\u015Fluklu ve y\xFCksek kontrastl\u0131 minimalist vitrin.",
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
      border: "#E2E8F0"
    },
    typography: {
      fontHeading: "Plus Jakarta Sans",
      fontBody: "Inter",
      headingWeight: "800",
      baseFontSize: "16px"
    },
    geometry: {
      borderRadius: "none",
      containerMaxWidth: "wide",
      sectionSpacing: "spacious",
      cardStyle: "flat-bordered"
    },
    header: {
      layout: "minimal-split",
      showTopBar: false
    },
    footer: {
      layout: "simple-centered"
    }
  },
  sectionRecipe: {
    header: "minimal-sticky",
    hero: "minimal-lead",
    services: "list",
    about: "minimal-stats",
    whyUs: "icon-grid",
    gallery: "masonry",
    testimonials: "quotes-minimal",
    faqs: "minimal-clean",
    contact: "compact-direct",
    footer: "minimal-legal"
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
    { sectionId: "footer", defaultEnabled: true, recommendedOrder: 999 }
  ],
  capabilities: {
    supportsDarkMode: true,
    isResponsive: true,
    supportsCustomTokens: true,
    maxHeaderLinks: 5,
    recommendedContainerWidth: "wide"
  },
  recommendedIndustries: ["architecture", "design", "creative", "engineering", "consulting"],
  tags: ["minimal", "mimari", "modern", "monokrom", "portfolyo"]
};

// src/domain/templates/manifests/artisanWarm.ts
var artisanWarmManifest = {
  schemaVersion: 1,
  id: "tmpl-artisan-warm",
  slug: "artisan-warm",
  name: "S\u0131cak Zanaat & Butik",
  description: "Restoranlar, gurme lezzetler, el sanatlar\u0131 ve butik at\xF6lyeler i\xE7in zengin g\xF6rsel hikaye anlat\u0131m\u0131 ve s\u0131cak renk armonisi.",
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
      border: "#FDE68A"
    },
    typography: {
      fontHeading: "Plus Jakarta Sans",
      fontBody: "Inter",
      headingWeight: "700",
      baseFontSize: "16px"
    },
    geometry: {
      borderRadius: "xl",
      containerMaxWidth: "standard",
      sectionSpacing: "normal",
      cardStyle: "elevated"
    },
    header: {
      layout: "centered",
      showTopBar: true
    },
    footer: {
      layout: "multi-column-rich"
    }
  },
  sectionRecipe: {
    header: "centered",
    hero: "image-background",
    about: "cards-narrative",
    services: "cards",
    whyUs: "cards-3",
    gallery: "mosaic",
    testimonials: "carousel",
    faqs: "separated-cards",
    contact: "split-map-form",
    footer: "multi-column"
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
    { sectionId: "footer", defaultEnabled: true, recommendedOrder: 999 }
  ],
  capabilities: {
    supportsDarkMode: false,
    isResponsive: true,
    supportsCustomTokens: true,
    maxHeaderLinks: 6,
    recommendedContainerWidth: "standard"
  },
  recommendedIndustries: ["food", "restaurant", "artisan", "bakery", "craft"],
  tags: ["zanaat", "lezzet", "s\u0131cak", "butik", "restoran"]
};

// src/domain/templates/manifests/vipLuxury.ts
var vipLuxuryManifest = {
  schemaVersion: 1,
  id: "tmpl-vip-luxury",
  slug: "vip-luxury",
  name: "L\xFCks VIP & Estetik",
  description: "\xD6zel klinikler, VIP salonlar ve se\xE7kin hizmet sunucular\u0131 i\xE7in alt\u0131n yald\u0131zl\u0131 vurgular ve \xFCst d\xFCzey kurumsal vitrin.",
  version: "1.0.0",
  status: "ACTIVE",
  category: "luxury",
  previewImageUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80",
  designTokens: {
    palette: {
      primary: "#D97706",
      primaryDark: "#B45309",
      secondary: "#FFFBEB",
      accent: "#4338CA",
      text: "#1E1B4B",
      textMuted: "#6B7280",
      background: "#FFFFFF",
      surface: "#FFFBEB",
      border: "#FDE68A"
    },
    typography: {
      fontHeading: "Plus Jakarta Sans",
      fontBody: "Inter",
      headingWeight: "700",
      baseFontSize: "16px"
    },
    geometry: {
      borderRadius: "xl",
      containerMaxWidth: "standard",
      sectionSpacing: "spacious",
      cardStyle: "elevated"
    },
    header: {
      layout: "centered",
      showTopBar: true
    },
    footer: {
      layout: "corporate-detailed"
    }
  },
  sectionRecipe: {
    header: "centered",
    hero: "centered-prestige",
    about: "side-by-side",
    services: "cards-3",
    whyUs: "metrics-badges",
    gallery: "carousel",
    pricing: "cards-3",
    testimonials: "badge-rating",
    contact: "formal-consultation-form",
    footer: "corporate-detailed"
  },
  sectionDefaults: [
    { sectionId: "header", defaultEnabled: true, recommendedOrder: 0 },
    { sectionId: "hero", defaultEnabled: true, recommendedOrder: 1 },
    { sectionId: "about", defaultEnabled: true, recommendedOrder: 2 },
    { sectionId: "services", defaultEnabled: true, recommendedOrder: 3 },
    { sectionId: "pricing", defaultEnabled: false, recommendedOrder: 4 },
    { sectionId: "gallery", defaultEnabled: true, recommendedOrder: 5 },
    { sectionId: "whyUs", defaultEnabled: true, recommendedOrder: 6 },
    { sectionId: "testimonials", defaultEnabled: true, recommendedOrder: 7 },
    { sectionId: "contact", defaultEnabled: true, recommendedOrder: 8 },
    { sectionId: "footer", defaultEnabled: true, recommendedOrder: 999 }
  ],
  capabilities: {
    supportsDarkMode: false,
    isResponsive: true,
    supportsCustomTokens: true,
    maxHeaderLinks: 6,
    recommendedContainerWidth: "standard"
  },
  recommendedIndustries: ["luxury", "beauty", "vip-services", "wellness", "lifestyle"],
  tags: ["l\xFCks", "alt\u0131n", "vip", "estetik", "prestij"]
};

// src/domain/templates/manifests/techDynamic.ts
var techDynamicManifest = {
  schemaVersion: 1,
  id: "tmpl-tech-dynamic",
  slug: "tech-dynamic",
  name: "Dinamik Teknoloji & Dijital",
  description: "Yaz\u0131l\u0131m \u015Firketleri, teknoloji bayileri ve SaaS sa\u011Flay\u0131c\u0131lar\u0131 i\xE7in dinamik turkuaz aksanl\u0131 modern dijital vitrin.",
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
      border: "#CCFBF1"
    },
    typography: {
      fontHeading: "Plus Jakarta Sans",
      fontBody: "Inter",
      headingWeight: "700",
      baseFontSize: "16px"
    },
    geometry: {
      borderRadius: "lg",
      containerMaxWidth: "standard",
      sectionSpacing: "normal",
      cardStyle: "flat-bordered"
    },
    header: {
      layout: "split-action",
      showTopBar: true
    },
    footer: {
      layout: "multi-column-rich"
    }
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
    footer: "multi-column"
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
    { sectionId: "footer", defaultEnabled: true, recommendedOrder: 999 }
  ],
  capabilities: {
    supportsDarkMode: true,
    isResponsive: true,
    supportsCustomTokens: true,
    maxHeaderLinks: 7,
    recommendedContainerWidth: "standard"
  },
  recommendedIndustries: ["technology", "saas", "software", "it-services", "digital"],
  tags: ["teknoloji", "yaz\u0131l\u0131m", "turkuaz", "dinamik", "\xFCr\xFCn-katalo\u011Fu"]
};

// src/domain/templates/manifests/formalLegal.ts
var formalLegalManifest = {
  schemaVersion: 1,
  id: "tmpl-formal-legal",
  slug: "formal-legal",
  name: "Resmi Hukuk & Dan\u0131\u015Fmanl\u0131k",
  description: "Avukatlar, hukuk b\xFCrolar\u0131 ve arabuluculuk merkezleri i\xE7in a\u011F\u0131rba\u015Fl\u0131 mor ve lacivert tonlar\u0131 ile g\xFCven tesis eden resmi mimari.",
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
      border: "#E4E4E7"
    },
    typography: {
      fontHeading: "Plus Jakarta Sans",
      fontBody: "Inter",
      headingWeight: "700",
      baseFontSize: "16px"
    },
    geometry: {
      borderRadius: "md",
      containerMaxWidth: "standard",
      sectionSpacing: "normal",
      cardStyle: "flat-bordered"
    },
    header: {
      layout: "standard",
      showTopBar: true
    },
    footer: {
      layout: "corporate-detailed"
    }
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
    footer: "corporate-detailed"
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
    { sectionId: "footer", defaultEnabled: true, recommendedOrder: 999 }
  ],
  capabilities: {
    supportsDarkMode: false,
    isResponsive: true,
    supportsCustomTokens: true,
    maxHeaderLinks: 6,
    recommendedContainerWidth: "standard"
  },
  recommendedIndustries: ["legal", "law-firm", "attorney", "consulting", "mediation"],
  tags: ["hukuk", "avukat", "prestij", "resmi", "dan\u0131\u015Fmanl\u0131k"]
};

// src/domain/templates/catalog.ts
var CANONICAL_TEMPLATE_MANIFESTS = [
  rapidServiceManifest,
  corporatePrestigeManifest,
  clinicalPureManifest,
  modernMinimalManifest,
  artisanWarmManifest,
  vipLuxuryManifest,
  techDynamicManifest,
  formalLegalManifest
];
var TEMPLATES_BY_ID = new Map(
  CANONICAL_TEMPLATE_MANIFESTS.map((t) => [t.id, t])
);
var TEMPLATES_BY_SLUG = new Map(
  CANONICAL_TEMPLATE_MANIFESTS.map((t) => [t.slug, t])
);

// prisma/seed.ts
var prisma = new PrismaClient();
async function seedProductionDatabase() {
  console.log("=== SEEDING JETKUR PRODUCTION DATABASE BASELINE ===");
  console.log("Seeding canonical plans and entitlements...");
  for (const planDef of Object.values(CANONICAL_PLANS)) {
    const plan = await prisma.plan.upsert({
      where: { code: planDef.code },
      update: {
        name: planDef.name,
        description: planDef.description,
        siteLimit: planDef.siteLimit,
        trialDays: planDef.trialDays,
        monthlyPrice: planDef.monthlyPrice,
        currency: planDef.currency,
        status: "ACTIVE"
      },
      create: {
        code: planDef.code,
        name: planDef.name,
        description: planDef.description,
        siteLimit: planDef.siteLimit,
        trialDays: planDef.trialDays,
        monthlyPrice: planDef.monthlyPrice,
        currency: planDef.currency,
        status: "ACTIVE"
      }
    });
    for (const [featureKey, enabled] of Object.entries(planDef.features)) {
      await prisma.planEntitlement.upsert({
        where: {
          planId_featureKey: {
            planId: plan.id,
            featureKey
          }
        },
        update: {
          enabled
        },
        create: {
          planId: plan.id,
          featureKey,
          enabled
        }
      });
    }
    for (const [limitKey, limitValue] of Object.entries(planDef.limits)) {
      await prisma.planEntitlement.upsert({
        where: {
          planId_featureKey: {
            planId: plan.id,
            featureKey: limitKey
          }
        },
        update: {
          limitValue,
          enabled: true
        },
        create: {
          planId: plan.id,
          featureKey: limitKey,
          limitValue,
          enabled: true
        }
      });
    }
    console.log(`  \u2713 Plan seeded: ${plan.code} (${plan.name})`);
  }
  console.log("Seeding canonical design templates catalog...");
  for (const tmpl of CANONICAL_TEMPLATE_MANIFESTS) {
    await prisma.designTemplate.upsert({
      where: { slug: tmpl.slug },
      update: {
        name: tmpl.name,
        category: tmpl.category,
        previewImage: tmpl.previewImageUrl || null,
        defaultTokens: tmpl.designTokens,
        supportedVariants: tmpl.sectionRecipe
      },
      create: {
        slug: tmpl.slug,
        name: tmpl.name,
        category: tmpl.category,
        previewImage: tmpl.previewImageUrl || null,
        defaultTokens: tmpl.designTokens,
        supportedVariants: tmpl.sectionRecipe
      }
    });
    console.log(`  \u2713 Template seeded: ${tmpl.slug} (${tmpl.name})`);
  }
  console.log("=== SEEDING COMPLETED SUCCESSFULLY ===");
}
if (process.argv[1]?.endsWith("seed.ts") || process.argv[1]?.endsWith("seed.js")) {
  seedProductionDatabase().then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  }).catch(async (e) => {
    console.error("Seed error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
}
export {
  seedProductionDatabase
};
