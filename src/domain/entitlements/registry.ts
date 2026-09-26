/**
 * JetKur Canonical Entitlement Registry (Sprint 04)
 * 
 * Principle: PAKET != MENÜ. Paket ENTITLEMENT sağlar.
 * Centralized, decoupled feature capability keys and numeric limits.
 */

export const ENTITLEMENT_KEYS = {
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
  PLATFORM_TEMPLATE_FACTORY: "platform.templateFactory",
} as const;

export type EntitlementKey = typeof ENTITLEMENT_KEYS[keyof typeof ENTITLEMENT_KEYS] | (string & {});

/**
 * Numeric limit keys enforced alongside boolean capabilities
 */
export const LIMIT_KEYS = {
  MAX_SITES: "sites.max",
  MAX_LANGUAGES: "languages.max",
  MAX_TEAM_MEMBERS: "teamMembers.max",
} as const;

export type LimitKey = typeof LIMIT_KEYS[keyof typeof LIMIT_KEYS] | (string & {});

/**
 * Feature Category metadata for UI categorization without hardcoding
 */
export type FeatureVisibilityCategory = 
  | "CORE" 
  | "STANDARD" 
  | "PRO" 
  | "AGENCY" 
  | "SUPER_ADMIN" 
  | "BACKGROUND";

export interface EntitlementMetadata {
  key: string;
  name: string;
  description: string;
  category: FeatureVisibilityCategory;
  isCore: boolean;
}

export const ENTITLEMENT_CATALOG: Record<string, EntitlementMetadata> = {
  [ENTITLEMENT_KEYS.SITE_VIEW]: {
    key: ENTITLEMENT_KEYS.SITE_VIEW,
    name: "Site Görüntüleme & Okuma",
    description: "Tüm aktif ve süresi dolmuş hesaplarda sitelerin okunabilmesi",
    category: "CORE",
    isCore: true,
  },
  [ENTITLEMENT_KEYS.SITE_CREATE]: {
    key: ENTITLEMENT_KEYS.SITE_CREATE,
    name: "Yeni Site Oluşturma",
    description: "Paket limitine göre yeni site/landing page üretimi",
    category: "CORE",
    isCore: true,
  },
  [ENTITLEMENT_KEYS.SITE_EDIT]: {
    key: ENTITLEMENT_KEYS.SITE_EDIT,
    name: "Site İçeriği Düzenleme",
    description: "Firma bilgileri, iletişim, hizmetler ve bölümlerin düzenlenmesi",
    category: "CORE",
    isCore: true,
  },
  [ENTITLEMENT_KEYS.SITE_PUBLISH]: {
    key: ENTITLEMENT_KEYS.SITE_PUBLISH,
    name: "Canlıya Yayınlama (Deploy)",
    description: "Siteyi internete ve CDN ağına canlı olarak dağıtma",
    category: "CORE",
    isCore: true,
  },
  [ENTITLEMENT_KEYS.SITE_FAQ]: {
    key: ENTITLEMENT_KEYS.SITE_FAQ,
    name: "Sıkça Sorulan Sorular",
    description: "Sektörel ve özel SSS yönetimi",
    category: "CORE",
    isCore: true,
  },
  [ENTITLEMENT_KEYS.SITE_GALLERY]: {
    key: ENTITLEMENT_KEYS.SITE_GALLERY,
    name: "Fotoğraf & Medya Galerisi",
    description: "İşletme görsel galerisi yönetimi",
    category: "CORE",
    isCore: true,
  },
  [ENTITLEMENT_KEYS.FORMS_BASIC]: {
    key: ENTITLEMENT_KEYS.FORMS_BASIC,
    name: "Temel İletişim Formları",
    description: "Ziyaretçi teklif ve randevu formları",
    category: "CORE",
    isCore: true,
  },
  [ENTITLEMENT_KEYS.ANALYTICS_BASIC]: {
    key: ENTITLEMENT_KEYS.ANALYTICS_BASIC,
    name: "Temel Ziyaretçi İstatistikleri",
    description: "Günlük tekil ziyaretçi ve sayfa gösterimleri",
    category: "CORE",
    isCore: true,
  },
  [ENTITLEMENT_KEYS.SEO_BASIC]: {
    key: ENTITLEMENT_KEYS.SEO_BASIC,
    name: "Temel Arama Motoru Optimizasyonu",
    description: "Meta etiketleri, sitemap.xml ve temel indeksleme",
    category: "CORE",
    isCore: true,
  },
  [ENTITLEMENT_KEYS.MARKETING_QR]: {
    key: ENTITLEMENT_KEYS.MARKETING_QR,
    name: "İşletme QR Kod Üretimi",
    description: "Masa, broşür ve vitrin için dinamik QR kodlar",
    category: "CORE",
    isCore: true,
  },
  [ENTITLEMENT_KEYS.SITE_CUSTOM_DOMAIN]: {
    key: ENTITLEMENT_KEYS.SITE_CUSTOM_DOMAIN,
    name: "Özel Alan Adı (Custom Domain)",
    description: "Kendi alan adını (firma.com) bağlama ve otomatik SSL",
    category: "STANDARD",
    isCore: false,
  },
  [ENTITLEMENT_KEYS.SITE_BLOG]: {
    key: ENTITLEMENT_KEYS.SITE_BLOG,
    name: "Sektörel Blog & İçerik Motoru",
    description: "Düzenli organik trafik çeken blog modülü",
    category: "STANDARD",
    isCore: false,
  },
  [ENTITLEMENT_KEYS.SITE_MULTILANGUAGE]: {
    key: ENTITLEMENT_KEYS.SITE_MULTILANGUAGE,
    name: "Çoklu Dil Desteği (i18n)",
    description: "İngilizce, Almanca, Rusça ve Arapça çoklu dil altyapısı",
    category: "STANDARD",
    isCore: false,
  },
  [ENTITLEMENT_KEYS.FORMS_ADVANCED]: {
    key: ENTITLEMENT_KEYS.FORMS_ADVANCED,
    name: "Gelişmiş Formlar & Özel Akışlar",
    description: "Koşullu alanlar, dosya yükleme ve CRM webhookları",
    category: "PRO",
    isCore: false,
  },
  [ENTITLEMENT_KEYS.ANALYTICS_ADVANCED]: {
    key: ENTITLEMENT_KEYS.ANALYTICS_ADVANCED,
    name: "Gelişmiş Analitik & Isı Haritası",
    description: "Dönüşüm hunileri ve detaylı kullanıcı etkileşim raporları",
    category: "PRO",
    isCore: false,
  },
  [ENTITLEMENT_KEYS.SEO_ADVANCED]: {
    key: ENTITLEMENT_KEYS.SEO_ADVANCED,
    name: "Gelişmiş AI Destekli SEO & Schema",
    description: "Yerel SEO zengin sonuçları (LocalBusiness Schema) ve anahtar kelime takibi",
    category: "PRO",
    isCore: false,
  },
  [ENTITLEMENT_KEYS.MARKETING_AB_TESTING]: {
    key: ENTITLEMENT_KEYS.MARKETING_AB_TESTING,
    name: "A/B Test Altyapısı",
    description: "Başlık ve CTA dönüşüm split testleri",
    category: "PRO",
    isCore: false,
  },
  [ENTITLEMENT_KEYS.MARKETING_EMAIL_AUTOMATION]: {
    key: ENTITLEMENT_KEYS.MARKETING_EMAIL_AUTOMATION,
    name: "Otomatik E-posta Bildirimleri",
    description: "Teklif formları için anlık müşteri ve işletme bildirimleri",
    category: "PRO",
    isCore: false,
  },
  [ENTITLEMENT_KEYS.AGENCY_MULTI_SITE]: {
    key: ENTITLEMENT_KEYS.AGENCY_MULTI_SITE,
    name: "Çoklu Müşteri / Site Yönetimi",
    description: "Tek panelden 10+ müşteri sitesini yönetebilme",
    category: "AGENCY",
    isCore: false,
  },
  [ENTITLEMENT_KEYS.AGENCY_CLIENT_PORTAL]: {
    key: ENTITLEMENT_KEYS.AGENCY_CLIENT_PORTAL,
    name: "Müşteri Yetkilendirme Portalı",
    description: "Müşterilere kısıtlı düzenleme erişimi sağlama",
    category: "AGENCY",
    isCore: false,
  },
  [ENTITLEMENT_KEYS.AGENCY_COMPETITOR_ANALYSIS]: {
    key: ENTITLEMENT_KEYS.AGENCY_COMPETITOR_ANALYSIS,
    name: "Rakip Analizi & Kıyaslama Motoru",
    description: "Sektörel rakipleri inceleme ve stratejik açık raporları",
    category: "AGENCY",
    isCore: false,
  },
  [ENTITLEMENT_KEYS.AGENCY_WHITE_LABEL]: {
    key: ENTITLEMENT_KEYS.AGENCY_WHITE_LABEL,
    name: "White-Label & Markasız Panel",
    description: "Ajansın kendi logosu ve markasıyla paneli sunabilmesi",
    category: "AGENCY",
    isCore: false,
  },
  [ENTITLEMENT_KEYS.PLATFORM_TEMPLATE_FACTORY]: {
    key: ENTITLEMENT_KEYS.PLATFORM_TEMPLATE_FACTORY,
    name: "AI Şablon Fabrikası",
    description: "Sektöre özel özelleştirilebilir şablon üretimi",
    category: "AGENCY",
    isCore: false,
  },
};
