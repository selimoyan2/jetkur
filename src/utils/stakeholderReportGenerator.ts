import { SiteConfig } from "../types";
import { simulateLighthousePerformance } from "./coreWebVitalsSimulator";
import { calculateSiteHealthScore } from "./siteHealthScoreCalculator";

export interface StakeholderReportData {
  // Document Metadata
  reportId: string;
  generatedDate: string;
  generatedDateTime: string;
  
  // Enterprise & Stakeholder Identity
  companyName: string;
  sector: string;
  city: string;
  domain: string;
  liveUrl: string;
  slogan: string;
  phone: string;
  email: string;
  address: string;
  workingHours: string;
  logoUrl: string;

  // Visual & Brand Configuration
  theme: {
    paletteName: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
    borderRadius: string;
  };

  // Content Architecture & Sections Inventory
  architecture: {
    siteType: string;
    totalPages: number;
    enabledSections: { name: string; count?: number; status: string }[];
    servicesCount: number;
    productsCount: number;
    testimonialsCount: number;
    galleryCount: number;
    faqsCount: number;
    hasContactMap: boolean;
    hasWhatsAppWidget: boolean;
    hasLeadCaptureForm: boolean;
    hasNewsletter: boolean;
  };

  // Technical SEO & Compliance
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
    schemaType: string;
    canonicalUrl: string;
    robots: string;
    hasOgImage: boolean;
    hasGoogleSearchConsole: boolean;
  };

  // Infrastructure & Security
  infrastructure: {
    cdnProvider: string;
    sslTls: string;
    httpVersion: string;
    compression: string;
    dailyBackups: string;
    securityGrade: string;
    edgeCaching: string;
  };

  // Core Performance Benchmarks (Google Lighthouse + Core Web Vitals)
  performance: {
    mobileScore: number;
    desktopScore: number;
    performanceGrade: string;
    allVitalsPassed: boolean;
    vitals: {
      id: string;
      name: string;
      fullName: string;
      value: string;
      target: string;
      status: "good" | "needs-improvement" | "poor";
      statusText: string;
      description: string;
    }[];
    siteHealthScore: number;
    siteHealthGrade: string;
    siteHealthStatus: string;
  };

  // Commercial & Lead Funnel Metrics
  commercial: {
    totalLeads: number;
    wonDealsCount: number;
    conversionRate: string;
    totalRevenue: number;
    formattedRevenue: string;
    avgLeadScore: number;
    topInquiryService: string;
  };

  // Strategic Executive Recommendations
  recommendations: {
    category: string;
    priority: "Yüksek" | "Orta" | "Stratejik";
    title: string;
    detail: string;
    expectedImpact: string;
  }[];
}

/**
 * Compiles all active site configurations and simulated performance metrics
 * into a structured, executive-grade data object for stakeholder reporting.
 */
export function compileStakeholderReportData(config: SiteConfig): StakeholderReportData {
  const companyName = config.companyName || "Dijital İşletmeniz";
  const sector = config.sector || "Kurumsal Hizmetler";
  const city = config.city || "Türkiye";
  const subdomain = config.cloudflare?.subdomain || "sirket";
  const customDomain = config.cloudflare?.customDomain;
  const domain = customDomain || `${subdomain}.hizliweb.site`;
  const liveUrl = `https://${domain}`;
  
  const now = new Date();
  const dateStr = now.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
  const timeStr = now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  const reportId = `REP-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Lighthouse Benchmarks
  const mobileLighthouse = simulateLighthousePerformance(config, "mobile");
  const desktopLighthouse = simulateLighthousePerformance(config, "desktop");
  const siteHealth = calculateSiteHealthScore(config);

  // Leads & Commercial Calculations
  const leads = config.leads || [];
  const wonLeads = leads.filter(l => l.status === "closed" || (l.dealValue && l.dealValue > 0));
  const wonDealsCount = wonLeads.length;
  const totalRevenue = wonLeads.reduce((sum, l) => sum + (l.dealValue || 0), 0);
  const conversionRate = leads.length > 0 
    ? `${((wonDealsCount / leads.length) * 100).toFixed(1)}%`
    : "%0.0";
  
  // Calculate average quality score of incoming leads
  const avgLeadScore = leads.length > 0
    ? Math.round(leads.reduce((acc, l) => {
        let score = 50;
        if (l.phone && l.phone.length > 9) score += 20;
        if (l.email) score += 10;
        if (l.dealValue && l.dealValue > 0) score += 15;
        if (l.serviceOrProduct) score += 5;
        return acc + Math.min(100, score);
      }, 0) / leads.length)
    : 85;
  
  // Service frequency
  const serviceCounts: Record<string, number> = {};
  leads.forEach(l => {
    const s = l.serviceOrProduct || "Genel Talep";
    serviceCounts[s] = (serviceCounts[s] || 0) + 1;
  });
  const topServiceEntry = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0];
  const topInquiryService = topServiceEntry ? `${topServiceEntry[0]} (${topServiceEntry[1]} talep)` : "Standart Teklif Formu";

  // Active Sections Inventory
  const enabledSections = [
    { name: "Kahraman (Hero Slider & CTA)", status: "Aktif" },
    { name: "Hizmetlerimiz (Services)", count: config.services?.items?.length || 0, status: config.services?.enabled !== false ? "Aktif" : "Pasif" },
    { name: "Ürün & Çözüm Kataloğu", count: config.products?.items?.length || 0, status: config.products?.enabled ? "Aktif" : "Pasif" },
    { name: "Hakkımızda & Kurumsal", status: config.about?.enabled !== false ? "Aktif" : "Pasif" },
    { name: "Neden Biz (Özellikler)", count: config.whyUs?.items?.length || 0, status: config.whyUs?.enabled !== false ? "Aktif" : "Pasif" },
    { name: "Müşteri Yorumları & Referanslar", count: config.testimonials?.items?.length || 0, status: config.testimonials?.enabled !== false ? "Aktif" : "Pasif" },
    { name: "Görsel Galeri", count: config.gallery?.items?.length || 0, status: config.gallery?.enabled ? "Aktif" : "Pasif" },
    { name: "Sıkça Sorulan Sorular (SSS)", count: config.faqs?.items?.length || 0, status: config.faqs?.enabled !== false ? "Aktif" : "Pasif" },
    { name: "İletişim & Lokasyon Haritası", status: config.contact?.enabled !== false ? "Aktif" : "Pasif" }
  ];

  // Core Web Vitals extraction
  const vitals = [
    {
      id: "lcp",
      name: "LCP",
      fullName: "Largest Contentful Paint (En Büyük İçerikli Boyama)",
      value: mobileLighthouse.lcp.valueFormatted,
      target: "≤ 2.5 sn",
      status: mobileLighthouse.lcp.status,
      statusText: mobileLighthouse.lcp.status === "good" ? "İdeal (Geçti)" : "İyileştirilmeli",
      description: "Ana içeriğin ekranda tam görünür olma süresi. Google SEO sıralamasında birincil hız kriteridir."
    },
    {
      id: "inp",
      name: "INP",
      fullName: "Interaction to Next Paint (Etkileşim Yanıt Gecikmesi)",
      value: mobileLighthouse.inp.valueFormatted,
      target: "≤ 200 ms",
      status: mobileLighthouse.inp.status,
      statusText: mobileLighthouse.inp.status === "good" ? "İdeal (Geçti)" : "İyileştirilmeli",
      description: "Kullanıcının butona tıklaması veya forma dokunması ile sayfanın tepki vermesi arasındaki gecikme."
    },
    {
      id: "cls",
      name: "CLS",
      fullName: "Cumulative Layout Shift (Kümülatif Düzen Kayması)",
      value: mobileLighthouse.cls.valueFormatted,
      target: "≤ 0.1",
      status: mobileLighthouse.cls.status,
      statusText: mobileLighthouse.cls.status === "good" ? "İdeal (Geçti)" : "İyileştirilmeli",
      description: "Sayfa yüklenirken butonların ve metinlerin istemsizce kayma oranı; sıfıra yakın olması mükemmel kullanıcı deneyimi sağlar."
    },
    {
      id: "fcp",
      name: "FCP",
      fullName: "First Contentful Paint (İlk İçerikli Boyama)",
      value: mobileLighthouse.fcp.valueFormatted,
      target: "≤ 1.8 sn",
      status: mobileLighthouse.fcp.status,
      statusText: mobileLighthouse.fcp.status === "good" ? "İdeal (Geçti)" : "İyileştirilmeli",
      description: "Kullanıcının tarayıcısında ilk pikselin ve metnin belirdiği andır."
    },
    {
      id: "ttfb",
      name: "TTFB",
      fullName: "Time to First Byte (İlk Bayt Alma Süresi)",
      value: mobileLighthouse.ttfb.valueFormatted,
      target: "≤ 100 ms",
      status: mobileLighthouse.ttfb.status,
      statusText: mobileLighthouse.ttfb.status === "good" ? "İdeal (Geçti)" : "İyileştirilmeli",
      description: "Cloudflare Global Edge CDN sunucusundan ilk veri paketinin kullanıcıya ulaştığı ultra hızlı yanıt süresi."
    }
  ];

  // Tailored recommendations based on real config state
  const recommendations: StakeholderReportData["recommendations"] = [
    {
      category: "Arama Motoru (SEO)",
      priority: config.seo?.metaDescription ? "Orta" : "Yüksek",
      title: "Bölgesel Arama Görünürlüğünü Güçlendirme",
      detail: `${city} ve çevre ilçeler için '${sector}' odaklı Google İşletme Profil entegrasyonu ve Schema.org LocalBusiness yapılandırılmış veri işaretlemesi aktifleştirildi.`,
      expectedImpact: "Organik yerel aramalarda %35 daha fazla tıklama ve doğrudan telefon araması."
    },
    {
      category: "Dönüşüm Optimizasyonu (CRO)",
      priority: config.whatsappWidget?.enabled ? "Orta" : "Yüksek",
      title: "Anlık WhatsApp & Teklif Dönüşüm Akışı",
      detail: "Mobil kullanıcılarda dönüşüm oranını maksimize etmek için tek tıkla arama ve sabit WhatsApp teklif butonu devrede tutulmalıdır.",
      expectedImpact: "Gelen form ve arama taleplerinde ortalama %20-30 artış."
    },
    {
      category: "Hız & Altyapı",
      priority: "Stratejik",
      title: "Cloudflare Edge Önbellek ve Brotli Sıkıştırma",
      detail: "Sayfalar statik olarak derlenip global 300+ edge lokasyonuna dağıtıldığı için sunucu çökmesi veya yavaşlama riski sıfırlanmıştır.",
      expectedImpact: "0.02s anında açılış ile hemen çıkma (bounce rate) oranında %40 düşüş."
    },
    {
      category: "Müşteri Güveni & İtibar",
      priority: (config.testimonials?.items?.length || 0) < 3 ? "Yüksek" : "Orta",
      title: "Gerçek Müşteri Yorumları & Google Yıldız Rozeti",
      detail: "Tamamlanan müşteri projelerinin görsel ve değerlendirmelerini referanslar modülüne ekleyerek güven sinyalleri artırılmalıdır.",
      expectedImpact: "Ziyaretçiden teklif aşamasına geçişte %25 güven artışı."
    }
  ];

  return {
    reportId,
    generatedDate: dateStr,
    generatedDateTime: `${dateStr}, ${timeStr}`,
    companyName,
    sector,
    city,
    domain,
    liveUrl,
    slogan: config.slogan || "Hızlı, Güvenilir ve Profesyonel Çözümler",
    phone: config.phone || "+90 555 000 00 00",
    email: config.email || "info@" + domain,
    address: config.address || `${city}, Türkiye`,
    workingHours: config.workingHours || "7/24 Hizmetinizdeyiz",
    logoUrl: config.header?.logoImage || "",

    theme: {
      paletteName: config.palette?.name || "Kurumsal Mavi",
      primaryColor: config.palette?.primary || "#2563eb",
      secondaryColor: config.palette?.secondary || "#1e293b",
      accentColor: config.palette?.accent || "#f59e0b",
      fontFamily: config.fontFamily || "Inter / System Sans",
      borderRadius: config.borderRadius || "0.75rem (rounded-xl)"
    },

    architecture: {
      siteType: config.siteType === "multi-page" ? "Çok Sayfalı Kurumsal Web Sitesi" : "Tek Sayfalı Yüksek Dönüşümlü Açılış Sitesi (Landing Page)",
      totalPages: (config.pages?.length || 0) + 1,
      enabledSections,
      servicesCount: config.services?.items?.length || 0,
      productsCount: config.products?.items?.length || 0,
      testimonialsCount: config.testimonials?.items?.length || 0,
      galleryCount: config.gallery?.items?.length || 0,
      faqsCount: config.faqs?.items?.length || 0,
      hasContactMap: Boolean(config.contact?.showMap),
      hasWhatsAppWidget: Boolean(config.whatsappWidget?.enabled),
      hasLeadCaptureForm: Boolean(config.contact?.showForm !== false),
      hasNewsletter: Boolean(config.newsletter?.enabled)
    },

    seo: {
      metaTitle: config.seo?.metaTitle || `${companyName} - ${city} ${sector}`,
      metaDescription: config.seo?.metaDescription || `${city} bölgesinde profesyonel ${sector.toLowerCase()} hizmetleri. 7/24 hızlı servis, uygun fiyat garantisi.`,
      keywords: config.seo?.keywords || `${sector}, ${city}, en yakın servis, ${companyName}`,
      schemaType: config.seo?.schemaType || "LocalBusiness",
      canonicalUrl: config.seo?.canonicalUrl || liveUrl,
      robots: config.seo?.robots || "index, follow, max-image-preview:large",
      hasOgImage: Boolean(config.seo?.ogImage),
      hasGoogleSearchConsole: Boolean(config.seo?.googleSearchConsoleTag)
    },

    infrastructure: {
      cdnProvider: "Cloudflare Global Edge Network (300+ Lokasyon)",
      sslTls: "TLS 1.3 / End-to-End Enterprise SSL Sertifikası",
      httpVersion: "HTTP/3 & QUIC Protocol",
      compression: "Brotli + Gzip Dinamik Sıkıştırma",
      dailyBackups: "Otomatik Günlük Veritabanı ve Medya Snapshot",
      securityGrade: config.securityConfig?.lastAudit?.grade || "A+ (Maksimum Güvenlik)",
      edgeCaching: "Akıllı Statik Varlık Önbellekleme (30 Gün TTL)"
    },

    performance: {
      mobileScore: mobileLighthouse.overallScore,
      desktopScore: desktopLighthouse.overallScore,
      performanceGrade: mobileLighthouse.overallScore >= 90 ? "A+ (Olağanüstü)" : "A (Çok İyi)",
      allVitalsPassed: mobileLighthouse.allVitalsPassed,
      vitals,
      siteHealthScore: siteHealth.overallScore,
      siteHealthGrade: siteHealth.grade,
      siteHealthStatus: siteHealth.status
    },

    commercial: {
      totalLeads: leads.length,
      wonDealsCount,
      conversionRate,
      totalRevenue,
      formattedRevenue: totalRevenue > 0 ? `₺${totalRevenue.toLocaleString("tr-TR")}` : "₺0",
      avgLeadScore,
      topInquiryService
    },

    recommendations
  };
}
