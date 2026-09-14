export interface JetkurHomepageSettings {
  badgeText: string;
  heroTitle: string;
  heroHighlight: string;
  heroSubtitle: string;
  primaryCtaText: string;
  secondaryCtaText: string;
  announcementActive: boolean;
  announcementText: string;
  supportPhone: string;
  whatsappNumber: string;
  speedGuaranteeText: string;
  stats: {
    edgeResponseTime: string;
    pageSpeedScore: string;
    edgeLocations: string;
    crashRisk: string;
  };
}

export interface JetkurPricingPackage {
  id: string;
  name: string;
  category: string;
  annualPrice: number;
  monthlyEquivalent: number;
  description: string;
  siteLimit: number;
  badge?: string;
  isPopular?: boolean;
  features: string[];
}

export interface JetkurClientSite {
  id: string;
  clientName: string;
  companyName: string;
  email: string;
  phone: string;
  domain: string;
  subdomain: string;
  sector: string;
  siteType: "single-page" | "multi-page" | "catalog";
  planName: string;
  annualRenewalFee: number;
  startDate: string; // YYYY-MM-DD
  renewalDate: string; // YYYY-MM-DD
  status: "active" | "expiring_soon" | "expired" | "suspended";
  paymentStatus: "paid" | "pending" | "overdue";
  autoRenew: boolean;
  sslStatus: "active" | "expiring" | "pending";
  pageSpeedScore: number;
  lastBackupDate: string;
}

const HOMEPAGE_SETTINGS_KEY = "jetkur_platform_homepage_settings";
const PACKAGES_KEY = "jetkur_platform_pricing_packages";
const CLIENT_SITES_KEY = "jetkur_platform_client_sites";

export const DEFAULT_HOMEPAGE_SETTINGS: JetkurHomepageSettings = {
  badgeText: "Dünyanın En Hızlı Web Sitesi Altyapısı • 14 Gün Ücretsiz Deneyin",
  heroTitle: "WordPress'in Hantallığına ve Kalitesiz Hazır Sitelere",
  heroHighlight: "Son Verin.",
  heroSubtitle: "Kalitesiz paneller veya WordPress gibi sunucuya yük bindiren hantal yapılar yerine; 0.02 saniyede açılan, sıfır veritabanı ile asla çökmeyen, yapay zeka destekli ultra hızlı JetKur statik web siteleri.",
  primaryCtaText: "14 Günlük Ücretsiz Denemeyi Başlat",
  secondaryCtaText: "0.02s Hız Testini İncele",
  announcementActive: true,
  announcementText: "🚀 JetKur 14 Günlük Ücretsiz Deneme Başladı! Kredi kartı gerekmeden e-posta ve şifrenizle hemen katılın.",
  supportPhone: "+90 850 308 00 00",
  whatsappNumber: "+90 532 000 00 00",
  speedGuaranteeText: "0.02 saniye Edge yanıt süresi & 100/100 Google PageSpeed garantisi",
  stats: {
    edgeResponseTime: "0.02 sn",
    pageSpeedScore: "100 / 100",
    edgeLocations: "310+",
    crashRisk: "%0 Risk"
  }
};

export const DEFAULT_PRICING_PACKAGES: JetkurPricingPackage[] = [
  {
    id: "pkg-1",
    name: "1 Web Sitesi",
    category: "Bireysel & Tekil İşletme",
    annualPrice: 990,
    monthlyEquivalent: 82,
    description: "Tek bir işletme veya şirket için tam donanımlı, ultra hızlı kurumsal web sitesi.",
    siteLimit: 1,
    isPopular: false,
    badge: "Başlangıç",
    features: [
      "Tek Sayfa veya Çok Sayfalı Kurumsal Web Sitesi",
      "Fotoğraflı Ürün & Fiyat Kataloğu Modülü",
      "Kategori Filtreli Blog & Makale Sistemi",
      "Zengin Metin (Rich Text) İçerik Editörü",
      "Global Anycast Edge 0.02s Statik Hız & Ücretsiz SSL",
      "Özel Müşteri Yönetim Paneli"
    ]
  },
  {
    id: "pkg-2",
    name: "3 Web Sitesi Paketi",
    category: "Çoklu Şirket & Grup",
    annualPrice: 2490,
    monthlyEquivalent: 207,
    description: "Birden fazla şirketi veya farklı markaları olan işletmeler için en avantajlı paket.",
    siteLimit: 3,
    isPopular: true,
    badge: "En Popüler • 3 Şirket",
    features: [
      "3 Farklı Şirket / Alan Adı Yönetimi",
      "Ayrı Ayrı Müşteri Yönetim Panelleri",
      "Gelişmiş Hero Slider & Bölüm Modülerliği",
      "Zengin Metin & Çoklu Görsel Katalogları",
      "Yapay Zeka ile Otomatik İçerik & SEO Üretimi",
      "7/24 Öncelikli WhatsApp & Telefon Desteği"
    ]
  },
  {
    id: "pkg-3",
    name: "Ajans Paketi (10 Site)",
    category: "Ajans & Web Tasarımcılar",
    annualPrice: 6900,
    monthlyEquivalent: 575,
    description: "Müşterilerine web sitesi satan ajanslar, danışmanlar ve yazılımcılar için 10 adet site hakkı.",
    siteLimit: 10,
    isPopular: false,
    badge: "Ajans & Bayi",
    features: [
      "10 Adet Bağımsız Müşteri Sitesi Oluşturma",
      "Ajans Süper Yönetim Paneli & Müşteri Devri",
      "Sınırsız Statik Trafik & 0.02s Yanıt Hızı",
      "Çoklu Görsel & Zengin Editör Desteği",
      "Özel DNS & Let's Encrypt Global SSL",
      "VIP Destek Hattı & Öncelikli Dağıtım"
    ]
  }
];

export const DEFAULT_CLIENT_SITES: JetkurClientSite[] = [
  {
    id: "site-1",
    clientName: "Ahmet Yıldız",
    companyName: "Yıldız 7/24 Oto Kurtarma",
    email: "ahmet@yildizotokurtarma.com.tr",
    phone: "+90 532 555 12 34",
    domain: "yildizotokurtarma.com.tr",
    subdomain: "yildiz-otokurtarma.jetkur.me",
    sector: "Oto Çekici & Kurtarma",
    siteType: "multi-page",
    planName: "3 Web Sitesi Paketi",
    annualRenewalFee: 2490,
    startDate: "2026-08-16",
    renewalDate: "2027-08-16",
    status: "active",
    paymentStatus: "paid",
    autoRenew: true,
    sslStatus: "active",
    pageSpeedScore: 100,
    lastBackupDate: "2026-09-13"
  },
  {
    id: "site-2",
    clientName: "Dr. Selin Çelik",
    companyName: "DentNova Diş Kliniği",
    email: "info@dentnovaklinik.com",
    phone: "+90 533 222 99 88",
    domain: "dentnovaklinik.com",
    subdomain: "dentnova.jetkur.me",
    sector: "Sağlık & Diş Hekimliği",
    siteType: "catalog",
    planName: "3 Web Sitesi Paketi",
    annualRenewalFee: 2490,
    startDate: "2026-08-12",
    renewalDate: "2027-08-12",
    status: "active",
    paymentStatus: "paid",
    autoRenew: true,
    sslStatus: "active",
    pageSpeedScore: 99,
    lastBackupDate: "2026-09-14"
  },
  {
    id: "site-3",
    clientName: "Av. Can Demir",
    companyName: "Demir Hukuk & Danışmanlık",
    email: "can@demirhukuk.av.tr",
    phone: "+90 542 333 44 55",
    domain: "demirhukuk.av.tr",
    subdomain: "demirhukuk.jetkur.me",
    sector: "Hukuk Bürosu",
    siteType: "multi-page",
    planName: "1 Web Sitesi",
    annualRenewalFee: 990,
    startDate: "2026-08-08",
    renewalDate: "2026-10-15", // Expiring soon for demo!
    status: "expiring_soon",
    paymentStatus: "pending",
    autoRenew: false,
    sslStatus: "active",
    pageSpeedScore: 100,
    lastBackupDate: "2026-09-12"
  },
  {
    id: "site-4",
    clientName: "Mehmet Pak",
    companyName: "MisPak Halı Yıkama",
    email: "siparis@mispakhaliyikama.com",
    phone: "+90 555 888 77 66",
    domain: "mispakhaliyikama.com",
    subdomain: "mispak.jetkur.me",
    sector: "Temizlik & Fabrika",
    siteType: "catalog",
    planName: "3 Web Sitesi Paketi",
    annualRenewalFee: 2490,
    startDate: "2026-08-01",
    renewalDate: "2027-08-01",
    status: "active",
    paymentStatus: "paid",
    autoRenew: true,
    sslStatus: "active",
    pageSpeedScore: 100,
    lastBackupDate: "2026-09-10"
  },
  {
    id: "site-5",
    clientName: "Burak Anahtar",
    companyName: "Acil Çilingir & Kilit",
    email: "burak@acilcilingir.com",
    phone: "+90 535 999 11 22",
    domain: "acilcilingir.jetkur.me",
    subdomain: "acilcilingir.jetkur.me",
    sector: "Çilingir & Güvenlik",
    siteType: "single-page",
    planName: "1 Web Sitesi",
    annualRenewalFee: 990,
    startDate: "2026-07-28",
    renewalDate: "2026-09-25", // Very close renewal!
    status: "expiring_soon",
    paymentStatus: "pending",
    autoRenew: false,
    sslStatus: "active",
    pageSpeedScore: 100,
    lastBackupDate: "2026-09-14"
  }
];

export function getJetkurHomepageSettings(): JetkurHomepageSettings {
  try {
    const saved = localStorage.getItem(HOMEPAGE_SETTINGS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.heroSubtitle && (parsed.heroSubtitle.toLowerCase().includes("sitenizolsun"))) {
        parsed.heroSubtitle = DEFAULT_HOMEPAGE_SETTINGS.heroSubtitle;
        try {
          localStorage.setItem(HOMEPAGE_SETTINGS_KEY, JSON.stringify({ ...DEFAULT_HOMEPAGE_SETTINGS, ...parsed }));
        } catch {}
      }
      return { ...DEFAULT_HOMEPAGE_SETTINGS, ...parsed };
    }
  } catch {
    // fallback
  }
  return DEFAULT_HOMEPAGE_SETTINGS;
}

export function saveJetkurHomepageSettings(settings: JetkurHomepageSettings): void {
  try {
    localStorage.setItem(HOMEPAGE_SETTINGS_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent("jetkur_homepage_settings_updated", { detail: settings }));
  } catch (e) {
    console.error("Failed to save homepage settings", e);
  }
}

export function getJetkurPackages(): JetkurPricingPackage[] {
  try {
    const saved = localStorage.getItem(PACKAGES_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_PRICING_PACKAGES;
}

export function saveJetkurPackages(packages: JetkurPricingPackage[]): void {
  try {
    localStorage.setItem(PACKAGES_KEY, JSON.stringify(packages));
    window.dispatchEvent(new CustomEvent("jetkur_packages_updated", { detail: packages }));
  } catch (e) {
    console.error("Failed to save pricing packages", e);
  }
}

export function getJetkurClientSites(): JetkurClientSite[] {
  try {
    const saved = localStorage.getItem(CLIENT_SITES_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_CLIENT_SITES;
}

export function saveJetkurClientSites(sites: JetkurClientSite[]): void {
  try {
    localStorage.setItem(CLIENT_SITES_KEY, JSON.stringify(sites));
    window.dispatchEvent(new CustomEvent("jetkur_client_sites_updated", { detail: sites }));
  } catch (e) {
    console.error("Failed to save client sites", e);
  }
}

export function calculateDaysRemaining(dateStr: string): number {
  try {
    const target = new Date(dateStr);
    const today = new Date();
    // Normalize to midnight
    target.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}
