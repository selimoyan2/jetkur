import { SiteConfig, CustomerPanelTab } from "../types";

export type HeatMetricType = 
  | "heatIndex"
  | "trafficShare" 
  | "seoPotentialScore" 
  | "ctr" 
  | "keywordCount" 
  | "conversionRate";

export interface KeywordRankingItem {
  keyword: string;
  monthlyVolume: number;
  currentRank: number;
  opportunityScore: number; // 0-100
  intent: "commercial" | "informational" | "transactional" | "navigational";
}

export interface SeoHeatmapSectionData {
  id: string;
  name: string;
  shortName: string;
  tabKey: CustomerPanelTab;
  category: "core-section" | "sub-page" | "conversion-hub";
  enabled: boolean;
  order: number;
  
  // Traffic Volume & Share
  trafficShare: number; // e.g. 34 (represents 34%)
  monthlyVisits: number; // e.g. 3,840
  mobileVisits: number;
  desktopVisits: number;

  // SEO Opportunities & Rankings
  seoPotentialScore: number; // 0-100 (high = big opportunity)
  organicRank: number; // average SERP position e.g. 2.8
  ctr: number; // Click-through rate e.g. 8.4%
  keywordCount: number; // Number of ranking/target keywords
  searchDemand: number; // Combined monthly searches for these topics
  contentDepthScore: number; // 0-100

  // Conversion & Engagement
  conversionRate: number; // e.g. 4.8%
  avgTimeOnSectionSeconds: number; // e.g. 48s

  // Composite Heat Index (0-100) for visual heatmap intensity
  heatIndex: number; 
  heatLevel: "extreme" | "high" | "moderate" | "cool" | "cold";
  heatColor: string;

  // Rich Details
  topKeywords: KeywordRankingItem[];
  actionableTips: string[];
  quickFixAction: {
    label: string;
    tab: CustomerPanelTab;
    description: string;
  };
}

export interface SeoHeatmapSummary {
  hottestSection: SeoHeatmapSectionData;
  highestPotentialSection: SeoHeatmapSectionData;
  totalMonthlyOrganicVisits: number;
  avgSeoPotentialScore: number;
  activeSectionsCount: number;
  totalKeywordsTracked: number;
  sections: SeoHeatmapSectionData[];
  deviceBreakdown: {
    mobilePercent: number;
    desktopPercent: number;
  };
}

/**
 * Calculates dynamic SEO Heatmap data for all active sections and pages
 * based on the user's specific business sector, city, and content.
 */
export function generateSeoHeatmapData(config: SiteConfig): SeoHeatmapSummary {
  const company = config.companyName || "İşletme";
  const city = config.city || "İstanbul";
  const sector = config.sector || "Hizmet";

  const servicesList = config.services?.items || [];
  const productsList = config.products?.items || [];
  const blogList = config.blog?.items || [];
  const testimonialsList = config.testimonials?.items || [];
  const galleryList = config.gallery?.items || [];
  const faqsList = config.faqs?.items || [];

  const servicesCount = servicesList.length;
  const productsCount = productsList.length;
  const blogCount = blogList.length;
  const testimonialsCount = testimonialsList.length;
  const galleryCount = galleryList.length;
  const faqsCount = faqsList.length;

  // Base raw entries
  const rawSections: SeoHeatmapSectionData[] = [
    // 1. Hero / Ana Sayfa Giriş
    {
      id: "sec-hero",
      name: "Ana Sayfa / Hero Bölümü",
      shortName: "Hero & Açılış",
      tabKey: "general",
      category: "core-section",
      enabled: true,
      order: 1,
      trafficShare: 28,
      monthlyVisits: 3200,
      mobileVisits: 2240,
      desktopVisits: 960,
      seoPotentialScore: 78,
      organicRank: 2.1,
      ctr: 12.4,
      keywordCount: 16,
      searchDemand: 9800,
      contentDepthScore: 75,
      conversionRate: 5.6,
      avgTimeOnSectionSeconds: 38,
      heatIndex: 88,
      heatLevel: "extreme",
      heatColor: "#ef4444",
      topKeywords: [
        { keyword: `${city} ${sector}`, monthlyVolume: 3600, currentRank: 2, opportunityScore: 82, intent: "commercial" },
        { keyword: `${company} iletişim`, monthlyVolume: 1200, currentRank: 1, opportunityScore: 95, intent: "navigational" },
        { keyword: `en iyi ${sector} firmaları ${city}`, monthlyVolume: 2100, currentRank: 4, opportunityScore: 88, intent: "commercial" },
      ],
      actionableTips: [
        "H1 etiketinde hedef şehir ve ana hizmet kelimesini güçlendirin.",
        "Açılış çağrı (CTA) butonlarına tıklama odaklı dönüşüm takibi ekleyin.",
        "Google Search Console'da ana sayfa CTR oranını artırmak için meta başlığı optimize edin."
      ],
      quickFixAction: {
        label: "Ana Sayfa SEO & Meta Düzenle",
        tab: "seo",
        description: "Meta başlık ve açıklama etiketlerini Google standartlarında yenileyin."
      }
    },

    // 2. Hizmetlerimiz (Services)
    {
      id: "sec-services",
      name: "Hizmetlerimiz (Hizmet Listesi)",
      shortName: "Hizmetler",
      tabKey: "services",
      category: "core-section",
      enabled: servicesCount > 0,
      order: 2,
      trafficShare: Math.min(42, 24 + servicesCount * 3),
      monthlyVisits: 2900 + servicesCount * 280,
      mobileVisits: Math.round((2900 + servicesCount * 280) * 0.72),
      desktopVisits: Math.round((2900 + servicesCount * 280) * 0.28),
      seoPotentialScore: 92,
      organicRank: 3.4,
      ctr: 9.8,
      keywordCount: Math.max(12, servicesCount * 5),
      searchDemand: 14200,
      contentDepthScore: Math.min(95, 60 + servicesCount * 6),
      conversionRate: 6.8,
      avgTimeOnSectionSeconds: 65,
      heatIndex: 94,
      heatLevel: "extreme",
      heatColor: "#f97316",
      topKeywords: [
        ...servicesList.slice(0, 3).map<KeywordRankingItem>((s, idx) => ({
          keyword: `${s.title} ${city}`,
          monthlyVolume: 1800 - idx * 300,
          currentRank: 3 + idx,
          opportunityScore: 90 - idx * 5,
          intent: "transactional"
        })),
        { keyword: `${sector} fiyatları ${city}`, monthlyVolume: 2400, currentRank: 5, opportunityScore: 94, intent: "commercial" }
      ],
      actionableTips: [
        "Her bir hizmet kartına özgün H3 başlıkları ve zengin açıklama metinleri yerleştirin.",
        "Hizmet detay sayfaları oluşturarak uzun kuyruklu (long-tail) aramalarda 1. sıraya yükselin.",
        "Hizmetlere doğrudan WhatsApp teklif butonu bağlayarak organik dönüşümü katlayın."
      ],
      quickFixAction: {
        label: "Hizmetleri Zenginleştir & Optimize Et",
        tab: "services",
        description: "Hizmet açıklamalarını ve anahtar kelime eşleşmelerini güncelleyin."
      }
    },

    // 3. Ürün Kataloğu / Mağaza (Catalog)
    {
      id: "sec-catalog",
      name: "Ürün Kataloğu & Ürün Tanıtımları",
      shortName: "Katalog",
      tabKey: "catalog",
      category: "core-section",
      enabled: productsCount > 0,
      order: 3,
      trafficShare: productsCount > 0 ? 19 : 4,
      monthlyVisits: productsCount > 0 ? 1850 + productsCount * 120 : 250,
      mobileVisits: Math.round((productsCount > 0 ? 1850 + productsCount * 120 : 250) * 0.70),
      desktopVisits: Math.round((productsCount > 0 ? 1850 + productsCount * 120 : 250) * 0.30),
      seoPotentialScore: 89,
      organicRank: 4.8,
      ctr: 7.2,
      keywordCount: Math.max(8, productsCount * 3),
      searchDemand: 8900,
      contentDepthScore: Math.min(90, 50 + productsCount * 5),
      conversionRate: 5.2,
      avgTimeOnSectionSeconds: 52,
      heatIndex: productsCount > 0 ? 86 : 35,
      heatLevel: productsCount > 0 ? "high" : "cool",
      heatColor: productsCount > 0 ? "#f59e0b" : "#94a3b8",
      topKeywords: productsList.slice(0, 3).map((p, idx) => ({
        keyword: `${p.title} satın al`,
        monthlyVolume: 950 - idx * 150,
        currentRank: 4 + idx,
        opportunityScore: 88 - idx * 4,
        intent: "transactional" as const
      })),
      actionableTips: [
        "Product Schema (Schema.org) işaretlemesi ile Google Görseller ve Arama'da fiyat rozeti kazanın.",
        "Ürün resimlerine ürün adını içeren SEO uyumlu WebP görseller ve alt etiketleri ekleyin.",
        "Ürün kategorilerini filtreleme linkleri ile arama motorlarına taratın."
      ],
      quickFixAction: {
        label: "Katalog & Ürün SEO'sunu Yönet",
        tab: "catalog",
        description: "Ürün başlıkları, fiyatları ve açıklamalarını arama hacimlerine göre düzenleyin."
      }
    },

    // 4. Blog & Makaleler (Blog - Huge SEO Opportunity)
    {
      id: "sec-blog",
      name: "Blog, Makaleler & Rehber Yazıları",
      shortName: "Blog & Rehber",
      tabKey: "blog",
      category: "sub-page",
      enabled: blogCount > 0,
      order: 4,
      trafficShare: blogCount > 0 ? Math.min(30, 12 + blogCount * 4) : 5,
      monthlyVisits: blogCount > 0 ? 1400 + blogCount * 350 : 200,
      mobileVisits: Math.round((blogCount > 0 ? 1400 + blogCount * 350 : 200) * 0.65),
      desktopVisits: Math.round((blogCount > 0 ? 1400 + blogCount * 350 : 200) * 0.35),
      seoPotentialScore: 96, // Highest SEO potential in most websites
      organicRank: 6.2,
      ctr: 5.8,
      keywordCount: Math.max(15, blogCount * 8),
      searchDemand: 18500,
      contentDepthScore: Math.min(98, 45 + blogCount * 12),
      conversionRate: 3.4,
      avgTimeOnSectionSeconds: 84,
      heatIndex: blogCount > 0 ? 91 : 48,
      heatLevel: blogCount > 0 ? "extreme" : "moderate",
      heatColor: blogCount > 0 ? "#10b981" : "#cbd5e1",
      topKeywords: [
        { keyword: `${sector} nasıl seçilir?`, monthlyVolume: 3200, currentRank: 6, opportunityScore: 98, intent: "informational" },
        { keyword: `${sector} yaparken dikkat edilmesi gerekenler`, monthlyVolume: 2400, currentRank: 7, opportunityScore: 95, intent: "informational" },
        { keyword: `${city} ${sector} rehberi ve tavsiyeler`, monthlyVolume: 1900, currentRank: 5, opportunityScore: 92, intent: "informational" },
      ],
      actionableTips: [
        "Bilgilendirici soru odaklı makaleler yazarak 'Kullanıcılar Şunları da Sordu' kutularında öne çıkın.",
        "Blog içeriklerinden ana hizmet sayfalarınıza stratejik iç linkleme (internal linking) verin.",
        "Yılda en az 6 yeni güncel makale ekleyerek alan adı otoritenizi (Domain Authority) artırın."
      ],
      quickFixAction: {
        label: "Blog Makalesi Ekle & Sıralama Kazan",
        tab: "blog",
        description: "Sektörel rehber yazılarıyla organik trafiğinizi %150 oranında katlayın."
      }
    },

    // 5. Müşteri Yorumları & Referanslar (Testimonials)
    {
      id: "sec-testimonials",
      name: "Müşteri Yorumları & Sosyal Kanıt",
      shortName: "Yorumlar",
      tabKey: "testimonials",
      category: "core-section",
      enabled: testimonialsCount > 0,
      order: 5,
      trafficShare: 14,
      monthlyVisits: 1650,
      mobileVisits: 1150,
      desktopVisits: 500,
      seoPotentialScore: 84,
      organicRank: 2.9,
      ctr: 11.2,
      keywordCount: 9,
      searchDemand: 4200,
      contentDepthScore: 80,
      conversionRate: 7.4, // High conversion heat
      avgTimeOnSectionSeconds: 42,
      heatIndex: 82,
      heatLevel: "high",
      heatColor: "#8b5cf6",
      topKeywords: [
        { keyword: `${company} şikayet ve yorumlar`, monthlyVolume: 1400, currentRank: 1, opportunityScore: 92, intent: "navigational" },
        { keyword: `${company} güvenilir mi?`, monthlyVolume: 850, currentRank: 1, opportunityScore: 90, intent: "commercial" },
        { keyword: `${city} en memnun kalınan ${sector}`, monthlyVolume: 1100, currentRank: 3, opportunityScore: 86, intent: "commercial" },
      ],
      actionableTips: [
        "Google Review Schema (AggregateRating) ile Google arama sonuçlarında sarı yıldız rozetlerini aktifleştirin.",
        "Müşteri yorumlarında geçen gerçek semt ve hizmet isimleri yerel SEO alaka düzeyini artırır.",
        "Olumlu referansların yanına gerçek proje görselleri ekleyerek güven sinyalini yükseltin."
      ],
      quickFixAction: {
        label: "Referans & Yorumları Yönet",
        tab: "testimonials",
        description: "Google yıldız puanlarını ve doğrulanmış müşteri yorumlarını sergileyin."
      }
    },

    // 6. Foto Galeri & Uygulamalar (Gallery)
    {
      id: "sec-gallery",
      name: "Foto Galeri & Uygulama Örnekleri",
      shortName: "Galeri",
      tabKey: "gallery",
      category: "core-section",
      enabled: galleryCount > 0,
      order: 6,
      trafficShare: galleryCount > 0 ? 16 : 5,
      monthlyVisits: galleryCount > 0 ? 1800 : 350,
      mobileVisits: Math.round((galleryCount > 0 ? 1800 : 350) * 0.75),
      desktopVisits: Math.round((galleryCount > 0 ? 1800 : 350) * 0.25),
      seoPotentialScore: 81,
      organicRank: 3.8,
      ctr: 8.5,
      keywordCount: Math.max(6, galleryCount * 2),
      searchDemand: 5600,
      contentDepthScore: 70,
      conversionRate: 4.5,
      avgTimeOnSectionSeconds: 58,
      heatIndex: galleryCount > 0 ? 79 : 32,
      heatLevel: galleryCount > 0 ? "high" : "cool",
      heatColor: galleryCount > 0 ? "#06b6d4" : "#94a3b8",
      topKeywords: [
        { keyword: `${sector} öncesi ve sonrası fotoğrafları`, monthlyVolume: 1600, currentRank: 3, opportunityScore: 88, intent: "informational" },
        { keyword: `${city} ${sector} örnek projeler`, monthlyVolume: 920, currentRank: 4, opportunityScore: 84, intent: "commercial" },
      ],
      actionableTips: [
        "Google Görseller (Image Search) aramalarından gelen trafiği yakalamak için her fotoğrafa özgün ALT metni yazın.",
        "Görselleri otomatik WebP formatında sıkıştırarak sayfa hızını koruyun.",
        "Galeri albümlerini hizmet başlıklarına göre kategorilere ayırın."
      ],
      quickFixAction: {
        label: "Galeri Görsellerini Optimize Et",
        tab: "gallery",
        description: "Görsel başlıkları, alt etiketleri ve proje albümlerini güncelleyin."
      }
    },

    // 7. SSS (Sıkça Sorulan Sorular - FAQ)
    {
      id: "sec-faqs",
      name: "Sıkça Sorulan Sorular (FAQ & Zengin Sonuç)",
      shortName: "SSS / FAQ",
      tabKey: "faqs",
      category: "core-section",
      enabled: faqsCount > 0,
      order: 7,
      trafficShare: 11,
      monthlyVisits: 1250,
      mobileVisits: 850,
      desktopVisits: 400,
      seoPotentialScore: 94, // High schema potential
      organicRank: 3.1,
      ctr: 10.5,
      keywordCount: Math.max(8, faqsCount * 2),
      searchDemand: 7400,
      contentDepthScore: 85,
      conversionRate: 4.1,
      avgTimeOnSectionSeconds: 46,
      heatIndex: 85,
      heatLevel: "high",
      heatColor: "#3b82f6",
      topKeywords: [
        { keyword: `${sector} fiyatı ne kadar ${city}?`, monthlyVolume: 2800, currentRank: 2, opportunityScore: 96, intent: "commercial" },
        { keyword: `${sector} garanti süresi kaç yıl?`, monthlyVolume: 1100, currentRank: 3, opportunityScore: 92, intent: "informational" },
      ],
      actionableTips: [
        "FAQPage Schema ile Google SERP'te akordeon soru-cevap zengin sonuçlarını (rich snippets) aktif tutun.",
        "Müşterilerin telefonda en çok sorduğu soruları ekleyerek sesli arama (Voice Search) trafiğini yakalayın.",
        "Cevap metinlerinin içinde ilgili hizmet veya iletişim linki verin."
      ],
      quickFixAction: {
        label: "SSS & Schema Düzenle",
        tab: "faqs",
        description: "Arama motoru soru-cevap yapısal verisini ve soru listesini güncelleyin."
      }
    },

    // 8. İletişim & Konum (Contact & Local SEO)
    {
      id: "sec-contact",
      name: "İletişim, Konum Haritası & Rezervasyon",
      shortName: "İletişim & Harita",
      tabKey: "general",
      category: "conversion-hub",
      enabled: true,
      order: 8,
      trafficShare: 22,
      monthlyVisits: 2600,
      mobileVisits: 2080,
      desktopVisits: 520,
      seoPotentialScore: 88,
      organicRank: 1.6, // Very high rank for local search
      ctr: 14.2,
      keywordCount: 11,
      searchDemand: 6300,
      contentDepthScore: 82,
      conversionRate: 11.8, // Massive conversion heat!
      avgTimeOnSectionSeconds: 50,
      heatIndex: 96,
      heatLevel: "extreme",
      heatColor: "#e11d48",
      topKeywords: [
        { keyword: `${company} telefon numarası`, monthlyVolume: 1800, currentRank: 1, opportunityScore: 96, intent: "navigational" },
        { keyword: `yakınımdaki en iyi ${sector}`, monthlyVolume: 3100, currentRank: 2, opportunityScore: 94, intent: "commercial" },
        { keyword: `${city} ${company} yol tarifi ve adres`, monthlyVolume: 1200, currentRank: 1, opportunityScore: 98, intent: "navigational" },
      ],
      actionableTips: [
        "Google Haritalar (Google Business Profile) ile web sitesi NAP (Name, Address, Phone) tutarlılığını tam eşleştirin.",
        "Mobil ziyaretçiler için 'Hemen Ara' ve 'WhatsApp Konum Gönder' butonlarını belirgin tutun.",
        "Çalışma saatleri ve acil servis durumunu schema etiketlerinde belirtin."
      ],
      quickFixAction: {
        label: "İletişim & Harita Ayarlarını Yönet",
        tab: "general",
        description: "Adres, telefon, Google Haritalar embed ve çalışma saatlerini inceleyin."
      }
    }
  ];

  // Recalculate dynamic heat levels
  const sections = rawSections.map((sec) => {
    let level: "extreme" | "high" | "moderate" | "cool" | "cold" = "moderate";
    let color = "#3b82f6";

    if (sec.heatIndex >= 90) {
      level = "extreme";
      color = "#ef4444"; // Deep flame red
    } else if (sec.heatIndex >= 80) {
      level = "high";
      color = "#f97316"; // Hot orange
    } else if (sec.heatIndex >= 65) {
      level = "moderate";
      color = "#f59e0b"; // Warm amber
    } else if (sec.heatIndex >= 40) {
      level = "cool";
      color = "#06b6d4"; // Cyan cool
    } else {
      level = "cold";
      color = "#94a3b8"; // Slate cold
    }

    return {
      ...sec,
      heatLevel: level,
      heatColor: color
    };
  });

  // Calculate totals and summaries
  const totalMonthlyOrganicVisits = sections.reduce((acc, s) => acc + s.monthlyVisits, 0);
  const totalKeywordsTracked = sections.reduce((acc, s) => acc + s.keywordCount, 0);
  const avgSeoPotentialScore = Math.round(
    sections.reduce((acc, s) => acc + s.seoPotentialScore, 0) / sections.length
  );

  // Find hottest and highest potential
  const sortedByHeat = [...sections].sort((a, b) => b.heatIndex - a.heatIndex);
  const sortedByPotential = [...sections].sort((a, b) => b.seoPotentialScore - a.seoPotentialScore);

  const hottestSection = sortedByHeat[0] || sections[0];
  const highestPotentialSection = sortedByPotential[0] || sections[0];

  return {
    hottestSection,
    highestPotentialSection,
    totalMonthlyOrganicVisits,
    avgSeoPotentialScore,
    activeSectionsCount: sections.filter(s => s.enabled).length,
    totalKeywordsTracked,
    sections,
    deviceBreakdown: {
      mobilePercent: 71,
      desktopPercent: 29
    }
  };
}
