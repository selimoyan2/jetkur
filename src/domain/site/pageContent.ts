/**
 * JetKur Canonical Data Architecture - Page Content Domain (Sprint 17 Foundation)
 *
 * ARCHITECTURAL PRINCIPLES:
 * 1. SiteMode:
 *    - LANDING: Primary business content is presented as sections on the homepage.
 *    - MULTI_PAGE: Business content may also have dedicated pages (About, Services, Products, Contact).
 *    - Presentation-only control: Switching between LANDING <-> MULTI_PAGE does NOT mutate,
 *      duplicate, or delete customer content.
 *
 * 2. Canonical PageContent:
 *    - Reusable domain model for page-level business content (ABOUT, SERVICES, PRODUCTS, CONTACT).
 *    - shortDescription: Summary/preview content reused by homepage sections in both modes.
 *    - longContent: Full page content for dedicated pages.
 *    - active: Visibility toggle allowing modules to be enabled or disabled.
 *    - heroMediaMode: "SINGLE" | "SLIDER" (defaulting safely to SINGLE).
 *    - heroMediaIds: References existing MediaAsset architecture (MediaAsset.id).
 */

export type SiteMode = "LANDING" | "MULTI_PAGE";

export const DEFAULT_SITE_MODE: SiteMode = "LANDING";

export type CanonicalPageType =
  | "ABOUT"
  | "SERVICES"
  | "PRODUCTS"
  | "CONTACT"
  | "CUSTOM";

export type HeroMediaMode = "SINGLE" | "SLIDER";

export const DEFAULT_HERO_MEDIA_MODE: HeroMediaMode = "SINGLE";

export interface PageContent {
  /** Unique Page Content identifier (e.g. "page-about", "page-services") */
  id: string;

  /** Canonical page type */
  pageType: CanonicalPageType;

  /** Primary page title (e.g. "Hakkımızda", "Hizmetlerimiz") */
  title: string;

  /** URL-friendly slug (e.g. "hakkimizda", "hizmetlerimiz") */
  slug: string;

  /**
   * Summary/preview description.
   * NOT restricted to Landing mode; reused by homepage sections in both modes.
   */
  shortDescription: string;

  /** Full rich/long content normally used on dedicated pages */
  longContent: string;

  /** Active visibility toggle. When false, the content area/page is disabled */
  active: boolean;

  /** Hero/banner media display mode: SINGLE (default) or SLIDER */
  heroMediaMode: HeroMediaMode;

  /**
   * Reference IDs pointing to existing MediaAsset architecture.
   * SINGLE uses one media reference; SLIDER may use multiple references.
   */
  heroMediaIds: string[];

  /** Optional hero title override */
  heroTitle?: string;

  /** Optional hero subtitle override */
  heroSubtitle?: string;

  /** Optional page-specific SEO meta title */
  seoTitle?: string;

  /** Optional page-specific SEO meta description */
  seoDescription?: string;
}

/**
 * Normalizes any legacy or external site mode input into a canonical SiteMode.
 * Defaults safely to "LANDING" without modifying customer data.
 */
export function normalizeSiteMode(mode?: string | null): SiteMode {
  if (!mode) return DEFAULT_SITE_MODE;
  const normalized = mode.trim().toUpperCase();
  if (normalized === "MULTI_PAGE" || normalized === "MULTI-PAGE" || mode === "multi-page") {
    return "MULTI_PAGE";
  }
  return "LANDING";
}

/**
 * Canonical core page types supported in Simple Dashboard
 */
export const CANONICAL_PAGE_TYPES: CanonicalPageType[] = [
  "ABOUT",
  "SERVICES",
  "PRODUCTS",
  "CONTACT",
];

/**
 * Creates a default canonical PageContent structure for an industry module.
 */
export function createDefaultPageContent(
  pageType: CanonicalPageType,
  overrides?: Partial<PageContent>
): PageContent {
  const defaultSlugs: Record<CanonicalPageType, string> = {
    ABOUT: "hakkimizda",
    SERVICES: "hizmetlerimiz",
    PRODUCTS: "urunlerimiz",
    CONTACT: "iletisim",
    CUSTOM: "sayfa",
  };

  const defaultTitles: Record<CanonicalPageType, string> = {
    ABOUT: "Hakkımızda",
    SERVICES: "Hizmetlerimiz",
    PRODUCTS: "Ürünlerimiz",
    CONTACT: "İletişim",
    CUSTOM: "Özel Sayfa",
  };

  return {
    id: `page-${pageType.toLowerCase()}`,
    pageType,
    title: defaultTitles[pageType] || "Sayfa",
    slug: defaultSlugs[pageType] || "sayfa",
    shortDescription: "",
    longContent: "",
    active: true,
    heroMediaMode: DEFAULT_HERO_MEDIA_MODE,
    heroMediaIds: [],
    ...overrides,
  };
}

/**
 * Initializes or backfills reasonable sector-relevant PageContent defaults
 * for ABOUT, SERVICES, PRODUCTS, and CONTACT.
 * Never overwrites customer-edited content.
 */
export function initializeDefaultPages(
  config: {
    companyName?: string;
    sector?: string;
    city?: string;
    phone?: string;
    about?: { content?: string; image?: string; enabled?: boolean };
    services?: { subtitle?: string; enabled?: boolean };
    products?: { subtitle?: string; enabled?: boolean };
    industryPackId?: string;
  },
  existingPages?: PageContent[]
): PageContent[] {
  const current = existingPages ? [...existingPages] : [];
  const companyName = config.companyName?.trim() || "İşletmemiz";
  const city = config.city?.trim() || "";

  for (const pageType of CANONICAL_PAGE_TYPES) {
    const exists = current.some((p) => p.pageType === pageType);
    if (exists) {
      continue; // Preserve customer's existing page intact
    }

    if (pageType === "ABOUT") {
      current.push(
        createDefaultPageContent("ABOUT", {
          id: "page-about",
          title: "Hakkımızda",
          slug: "hakkimizda",
          shortDescription:
            config.about?.content ||
            `${companyName} olarak uzman kadromuz ve kaliteli hizmet anlayışımızla müşterilerimizin yanındayız.`,
          longContent:
            `${companyName}, ${city ? city + " bölgesinde " : ""}güvenilir, ilkeli ve müşteri odaklı çözümler sunmaktadır. Sektör tecrübemiz ve uzman ekibimizle tüm ihtiyaçlarınızda profesyonel standartlarda destek sağlıyoruz. Kaliteden ödün vermeyen iş ahlakımız ve şeffaf çalışma prensibimizle her zaman yanınızdayız.`,
          heroTitle: "Hakkımızda",
          heroSubtitle: `${companyName} kalitesi ve kurumsal güvencesiyle tanışın.`,
          heroMediaMode: "SINGLE",
          heroMediaIds: config.about?.image ? [config.about.image] : [],
          active: config.about?.enabled !== false,
          seoTitle: `Hakkımızda | ${companyName}`,
          seoDescription: `${companyName} kurumsal bilgileri, vizyonu ve kaliteli hizmet anlayışı.`,
        })
      );
    } else if (pageType === "SERVICES") {
      current.push(
        createDefaultPageContent("SERVICES", {
          id: "page-services",
          title: "Hizmetlerimiz",
          slug: "hizmetlerimiz",
          shortDescription:
            config.services?.subtitle ||
            "İhtiyaçlarınıza özel, garantili ve profesyonel hizmet çözümlerimiz.",
          longContent:
            `${companyName} bünyesinde sunduğumuz tüm hizmetler sektör standartlarına uygun olarak titizlikle gerçekleştirilmektedir. Modern ekipmanlarımız ve alanında deneyimli ustalarımızla her aşamada güvenilir sonuçlar üretiyoruz. Şeffaf fiyatlandırma ve işçilik garantisiyle daima hizmetinizdeyiz.`,
          heroTitle: "Hizmetlerimiz",
          heroSubtitle: `${companyName} güvencesiyle kapsamlı ve güvenilir çözümler.`,
          heroMediaMode: "SINGLE",
          heroMediaIds: [],
          active: config.services?.enabled !== false,
          seoTitle: `Hizmetlerimiz | ${companyName}`,
          seoDescription: `${companyName} profesyonel hizmet seçenekleri, uzman kadro ve uygun fiyat teklifleri.`,
        })
      );
    } else if (pageType === "PRODUCTS") {
      current.push(
        createDefaultPageContent("PRODUCTS", {
          id: "page-products",
          title: "Ürünlerimiz",
          slug: "urunlerimiz",
          shortDescription:
            config.products?.subtitle ||
            "Kaliteli, dayanıklı ve garantili ürün seçenekleri.",
          longContent:
            "İşletmemizin sunduğu orijinal, garantili ve test edilmiş ürünlerimizi güvenle tercih edebilirsiniz. Geniş ürün yelpazemiz ve teknik desteğimiz ile ihtiyaç duyduğunuz tüm materyalleri sağlamaktayız. Detaylı bilgi veya sipariş için bizimle iletişime geçebilirsiniz.",
          heroTitle: "Ürünlerimiz",
          heroSubtitle: "Geniş ürün gamı ve uygun fiyat avantajları.",
          heroMediaMode: "SINGLE",
          heroMediaIds: [],
          active: config.products?.enabled !== false,
          seoTitle: `Ürünlerimiz | ${companyName}`,
          seoDescription: `${companyName} orijinal ve garantili ürün seçenekleri kataloğu.`,
        })
      );
    } else if (pageType === "CONTACT") {
      current.push(
        createDefaultPageContent("CONTACT", {
          id: "page-contact",
          title: "İletişim",
          slug: "iletisim",
          shortDescription:
            config.phone
              ? `Bize telefon (${config.phone}) veya WhatsApp üzerinden kolayca ulaşabilirsiniz.`
              : "Bize telefon veya iletişim kanallarımız üzerinden dilediğiniz an ulaşabilirsiniz.",
          longContent:
            `${companyName} ile doğrudan iletişime geçerek bilgi alabilir, randevu oluşturabilir veya adresimizi ziyaret edebilirsiniz. Müşteri memnuniyetini ön planda tutan ekibimiz tüm taleplerinize en kısa sürede dönüş yapmaktadır.`,
          heroTitle: "İletişim",
          heroSubtitle: "Hızlı iletişim, kesintisiz destek ve doğrudan ulaşım.",
          heroMediaMode: "SINGLE",
          heroMediaIds: [],
          active: true,
          seoTitle: `İletişim | ${companyName}`,
          seoDescription: `${companyName} iletişim bilgileri, telefon, WhatsApp ve açık adres detayları.`,
        })
      );
    }
  }

  return current;
}

