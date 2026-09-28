/**
 * JetKur Canonical Customer Dashboard Navigation Registry (Sprint 12)
 *
 * Core Product Principle:
 * "Kullanıcı web sitesi yapmayacak. İşletmesini anlatacak; JetKur web sitesini yapacak."
 *
 * Architecture:
 * - Single source of authority for customer navigation (desktop and mobile share identical registry)
 * - 6 Primary Destinations:
 *   1. "home"       -> Ana Sayfa (Site durumu, önizleme, hızlı eylemler, bildirimler)
 *   2. "content"    -> İçerikler (Hizmetler, Hakkımızda, SSS, Galeri, Yorumlar, Ürünler)
 *   3. "design"     -> Tasarım & Marka (Şablon seçici, Logo, Marka Rengi)
 *   4. "sections"   -> Sayfa Düzeni (Bölüm gizle/göster, yukarı/aşağı taşıma, varyant seçimi)
 *   5. "leads"      -> Müşteri Talepleri (Gelen formlar, WhatsApp mesajları, iletişim kayıtları)
 *   6. "plan"       -> Planım & Ayarlar (Paket limiti, deneme süresi durumu, site ayarları)
 *
 * Legacy 75+ tabs are classified into:
 * - PRIMARY: The 6 simplified customer views
 * - SECONDARY: Content-specific sub-editors (services, testimonials, faqs, gallery, etc.)
 * - ADVANCED: Advanced marketing/SEO tools accessible via secondary link or advanced mode
 * - SUPER_ADMIN_ONLY: Platform-level management
 * - LEGACY_HIDDEN: Obsolete duplicate or technical simulator tabs
 */

export type NavigationVisibility =
  | "PRIMARY"
  | "SECONDARY"
  | "ADVANCED"
  | "SUPER_ADMIN_ONLY"
  | "LEGACY_HIDDEN";

export interface CustomerNavItem {
  id: string;
  label: string;
  description: string;
  iconName: string;
  visibility: NavigationVisibility;
  category: "OVERVIEW" | "BUSINESS_CONTENT" | "DESIGN_LAYOUT" | "CUSTOMER_INQUIRIES" | "SETTINGS_ACCOUNT";
  targetTab?: string;
  requiredEntitlement?: string;
  badge?: string;
}

/**
 * The 6 Primary Customer Navigation Items
 */
export const PRIMARY_CUSTOMER_NAV_ITEMS: readonly CustomerNavItem[] = [
  {
    id: "home",
    label: "Ana Sayfa",
    description: "Web sitesi durumu, hızlı önizleme ve acil işlemler",
    iconName: "Home",
    visibility: "PRIMARY",
    category: "OVERVIEW",
  },
  {
    id: "content",
    label: "İçerikler & Hizmetler",
    description: "Hizmetler, işletme profili, müşteri yorumları, SSS ve metinler",
    iconName: "FileText",
    visibility: "PRIMARY",
    category: "BUSINESS_CONTENT",
  },
  {
    id: "design",
    label: "Tasarım & Marka",
    description: "Şablon seçimi, logo ve kurumsal marka rengi",
    iconName: "Palette",
    visibility: "PRIMARY",
    category: "DESIGN_LAYOUT",
  },
  {
    id: "sections",
    label: "Sayfa Düzeni",
    description: "Ana sayfa bölümlerini sırala, gizle veya tasarımını değiştir",
    iconName: "LayoutTemplate",
    visibility: "PRIMARY",
    category: "DESIGN_LAYOUT",
  },
  {
    id: "leads",
    label: "Müşteri Talepleri",
    description: "Web sitenizden gelen form başvuruları ve teklif talepleri",
    iconName: "Inbox",
    visibility: "PRIMARY",
    category: "CUSTOMER_INQUIRIES",
  },
  {
    id: "plan",
    label: "Planım & Ayarlar",
    description: "Kullanım hakları, paket durumu, iletişim ve site ayarları",
    iconName: "CreditCard",
    visibility: "PRIMARY",
    category: "SETTINGS_ACCOUNT",
  },
];

/**
 * Secondary Content Editors (Accessible inside the "İçerikler" primary view or via Quick Actions)
 */
export const SECONDARY_CONTENT_EDITORS: readonly CustomerNavItem[] = [
  {
    id: "business-profile",
    label: "İşletme Bilgileri",
    description: "Telefon, WhatsApp, adres, çalışma saatleri ve hizmet bölgesi",
    iconName: "Building2",
    visibility: "SECONDARY",
    category: "BUSINESS_CONTENT",
  },
  {
    id: "services",
    label: "Hizmetler",
    description: "Sunduğunuz hizmetler, fiyatlar ve açıklamalar",
    iconName: "Wrench",
    visibility: "SECONDARY",
    category: "BUSINESS_CONTENT",
  },
  {
    id: "faqs",
    label: "Sıkça Sorulan Sorular",
    description: "Müşterilerinizin en çok merak ettiği sorular ve cevaplar",
    iconName: "HelpCircle",
    visibility: "SECONDARY",
    category: "BUSINESS_CONTENT",
  },
  {
    id: "testimonials",
    label: "Müşteri Yorumları",
    description: "Referanslar ve değerlendirmeler",
    iconName: "Star",
    visibility: "SECONDARY",
    category: "BUSINESS_CONTENT",
  },
  {
    id: "gallery",
    label: "Fotoğraf Galerisi",
    description: "Yapılan işlerin ve işletmenin fotoğrafları",
    iconName: "Camera",
    visibility: "SECONDARY",
    category: "BUSINESS_CONTENT",
  },
  {
    id: "catalog",
    label: "Ürünler & Fiyatlar",
    description: "Ürün kataloğu ve fiyat listesi",
    iconName: "ShoppingBag",
    visibility: "SECONDARY",
    category: "BUSINESS_CONTENT",
  },
  {
    id: "pages",
    label: "Özel Sayfalar",
    description: "Hakkımızda veya kurumsal alt sayfalar",
    iconName: "Layers",
    visibility: "SECONDARY",
    category: "BUSINESS_CONTENT",
  },
  {
    id: "blog",
    label: "Blog & Yazılar",
    description: "Sektörel rehber ve bilgilendirici blog yazıları",
    iconName: "BookOpen",
    visibility: "SECONDARY",
    category: "BUSINESS_CONTENT",
  },
];

/**
 * Advanced Tools (Retained for power users/super admins, neatly grouped)
 */
export const ADVANCED_CUSTOMER_TOOLS: readonly CustomerNavItem[] = [
  {
    id: "seo-report",
    label: "SEO Raporu",
    description: "Arama motoru görünürlük analizi",
    iconName: "Activity",
    visibility: "ADVANCED",
    category: "SETTINGS_ACCOUNT",
  },
  {
    id: "performance",
    label: "Site Hızı & Core Web Vitals",
    description: "Lighthouse performans ve edge hız metrikleri",
    iconName: "Gauge",
    visibility: "ADVANCED",
    category: "SETTINGS_ACCOUNT",
  },
  {
    id: "custom-domain",
    label: "Özel Alan Adı (Domain)",
    description: "Kendi .com veya .com.tr alan adınızı bağlayın",
    iconName: "Globe",
    visibility: "ADVANCED",
    category: "SETTINGS_ACCOUNT",
  },
  {
    id: "backups",
    label: "Yedekler & Sürümler",
    description: "Günlük otomatik yedekleme ve snapshot indirme",
    iconName: "History",
    visibility: "ADVANCED",
    category: "SETTINGS_ACCOUNT",
  },
  {
    id: "qr-code",
    label: "QR Kod & Masa Kartı",
    description: "Vitrin veya masa kartı için dinamik QR kod",
    iconName: "QrCode",
    visibility: "ADVANCED",
    category: "SETTINGS_ACCOUNT",
  },
];

/**
 * Complete Audit Classification Map for all 75+ legacy customer panel tabs
 */
export const LEGACY_TAB_CLASSIFICATION_MAP: Readonly<Record<string, NavigationVisibility>> = {
  // Primary (6)
  "general": "PRIMARY", // Maps to "home"
  "home": "PRIMARY",
  "content": "PRIMARY",
  "design": "PRIMARY",
  "sections": "PRIMARY",
  "leads": "PRIMARY",
  "plan": "PRIMARY",
  "hosting-package": "PRIMARY", // Maps to "plan"

  // Secondary Content Editors (8)
  "services": "SECONDARY",
  "testimonials": "SECONDARY",
  "faqs": "SECONDARY",
  "gallery": "SECONDARY",
  "catalog": "SECONDARY",
  "pages": "SECONDARY",
  "blog": "SECONDARY",
  "catalog-contact": "SECONDARY",

  // Advanced Tools (retained & organized, 18)
  "seo": "ADVANCED",
  "seo-report": "ADVANCED",
  "seo-health": "ADVANCED",
  "seo-auditor": "ADVANCED",
  "meta-auditor": "ADVANCED",
  "seo-content-optimizer": "ADVANCED",
  "seo-opportunities": "ADVANCED",
  "performance": "ADVANCED",
  "performance-analytics": "ADVANCED",
  "site-health": "ADVANCED",
  "site-health-performance": "ADVANCED",
  "connect-custom-domain": "ADVANCED",
  "custom-domain": "ADVANCED",
  "cloudflare-domain": "ADVANCED",
  "domain-management": "ADVANCED",
  "backups": "ADVANCED",
  "qr-code": "ADVANCED",
  "whatsapp-chat": "ADVANCED",
  "tax-pricing": "ADVANCED",
  "security-audit": "ADVANCED",

  // Super Admin Only (Platform-level / Competitive Tools, 22)
  "competitive-seo": "SUPER_ADMIN_ONLY",
  "competitive-alerts": "SUPER_ADMIN_ONLY",
  "competitive-strategy": "SUPER_ADMIN_ONLY",
  "competitor-analysis": "SUPER_ADMIN_ONLY",
  "competitor-url-analysis": "SUPER_ADMIN_ONLY",
  "competitor-comparison": "SUPER_ADMIN_ONLY",
  "competitor-comparison-dashboard": "SUPER_ADMIN_ONLY",
  "content-gap-map": "SUPER_ADMIN_ONLY",
  "content-gap": "SUPER_ADMIN_ONLY",
  "market-share-panel": "SUPER_ADMIN_ONLY",
  "market-share-benchmark": "SUPER_ADMIN_ONLY",
  "market-share": "SUPER_ADMIN_ONLY",
  "local-seo-map": "SUPER_ADMIN_ONLY",
  "local-pack": "SUPER_ADMIN_ONLY",
  "seo-executive-summary": "SUPER_ADMIN_ONLY",
  "executive-summary": "SUPER_ADMIN_ONLY",
  "system-logs": "SUPER_ADMIN_ONLY",
  "system-log": "SUPER_ADMIN_ONLY",
  "coolify-deployment": "SUPER_ADMIN_ONLY",
  "vps-deployment": "SUPER_ADMIN_ONLY",
  "user-auth": "SUPER_ADMIN_ONLY",
  "user-management": "SUPER_ADMIN_ONLY",

  // Legacy / Hidden from normal customer navigation (Technical engines, 25)
  "asset-manager": "LEGACY_HIDDEN",
  "media-library": "LEGACY_HIDDEN",
  "ai-image-optimizer": "LEGACY_HIDDEN",
  "social-media": "LEGACY_HIDDEN",
  "social-feed": "LEGACY_HIDDEN",
  "social-scheduler": "LEGACY_HIDDEN",
  "social-post-scheduler": "LEGACY_HIDDEN",
  "seo-heatmap": "LEGACY_HIDDEN",
  "seo-opportunity-alerts": "LEGACY_HIDDEN",
  "page-seo": "LEGACY_HIDDEN",
  "ai-content-meta-optimizer": "LEGACY_HIDDEN",
  "ai-meta-optimizer": "LEGACY_HIDDEN",
  "schema-generator": "LEGACY_HIDDEN",
  "local-seo-schema": "LEGACY_HIDDEN",
  "seo-progress": "LEGACY_HIDDEN",
  "seo-notifications": "LEGACY_HIDDEN",
  "design-structure": "LEGACY_HIDDEN",
  "design-presets": "LEGACY_HIDDEN",
  "client-portal": "LEGACY_HIDDEN",
  "client-access-portal": "LEGACY_HIDDEN",
  "form-management": "LEGACY_HIDDEN",
  "email-automation": "LEGACY_HIDDEN",
  "email-automation-settings": "LEGACY_HIDDEN",
  "email-automations": "LEGACY_HIDDEN",
  "automated-responses": "LEGACY_HIDDEN",
  "automated-response-history": "LEGACY_HIDDEN",
  "newsletter": "LEGACY_HIDDEN",
  "notifications": "LEGACY_HIDDEN",
  "ai-writer": "LEGACY_HIDDEN",
  "header-nav": "LEGACY_HIDDEN",
  "homepage-builder": "LEGACY_HIDDEN",
  "footer": "LEGACY_HIDDEN",
  "site-type": "LEGACY_HIDDEN",
  "ab-testing": "LEGACY_HIDDEN",
  "languages": "LEGACY_HIDDEN",
  "automated-dns": "LEGACY_HIDDEN",
  "cloudflare-edge-guide": "LEGACY_HIDDEN",
  "performance-monitor": "LEGACY_HIDDEN",
  "lead-insights": "LEGACY_HIDDEN",
  "lead-automations": "LEGACY_HIDDEN",
  "lead-mapping": "LEGACY_HIDDEN",
  "customer-journey": "LEGACY_HIDDEN",
  "journey-mapping": "LEGACY_HIDDEN",
  "marketing-automation": "LEGACY_HIDDEN",
  "marketing-attribution": "LEGACY_HIDDEN",
  "attribution": "LEGACY_HIDDEN",
  "lead-forecasting": "LEGACY_HIDDEN",
  "realtime-traffic": "LEGACY_HIDDEN",
  "performance-forecaster": "LEGACY_HIDDEN",
  "pricing-intelligence": "LEGACY_HIDDEN",
  "ai-pricing": "LEGACY_HIDDEN",
  "global-seo": "LEGACY_HIDDEN",
  "ai-global-seo": "LEGACY_HIDDEN",
  "crm-integration": "LEGACY_HIDDEN",
  "bulk-seo-export": "LEGACY_HIDDEN",
  "seo-bulk-export": "LEGACY_HIDDEN",
  "performance-trends": "LEGACY_HIDDEN",
  "advanced-performance-trends": "LEGACY_HIDDEN",
  "performance-insights": "LEGACY_HIDDEN",
  "ai-blog-engine": "LEGACY_HIDDEN",
  "ai-content-planner": "LEGACY_HIDDEN",
  "seo-content-planner": "LEGACY_HIDDEN",
  "seo-trend-forecast": "LEGACY_HIDDEN",
  "trend-forecast": "LEGACY_HIDDEN",
  "ai-seo-content-assistant": "LEGACY_HIDDEN",
  "seo-content-assistant": "LEGACY_HIDDEN",
};

/**
 * Returns all navigation items belonging to a given visibility level
 */
export function getNavItemsByVisibility(visibility: NavigationVisibility): CustomerNavItem[] {
  if (visibility === "PRIMARY") return [...PRIMARY_CUSTOMER_NAV_ITEMS];
  if (visibility === "SECONDARY") return [...SECONDARY_CONTENT_EDITORS];
  if (visibility === "ADVANCED") return [...ADVANCED_CUSTOMER_TOOLS];
  return [];
}

/**
 * Audits counts of navigation items
 */
export function auditNavigationMetrics() {
  const legacyTotal = Object.keys(LEGACY_TAB_CLASSIFICATION_MAP).length;
  const primaryCount = PRIMARY_CUSTOMER_NAV_ITEMS.length;
  const secondaryCount = SECONDARY_CONTENT_EDITORS.length;
  const advancedCount = ADVANCED_CUSTOMER_TOOLS.length;

  return {
    customerVisibleBefore: 75,
    customerVisibleAfter: primaryCount, // 6 primary destinations
    primaryCount,
    secondaryCount,
    advancedCount,
    legacyTotal,
  };
}
