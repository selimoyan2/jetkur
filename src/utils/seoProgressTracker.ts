import {
  SiteConfig,
  SeoProgressNotificationConfig,
  SeoProgressNotificationLog,
  SeoKeywordRankShift
} from "../types";

export const INITIAL_SEO_PROGRESS_LOGS: SeoProgressNotificationLog[] = [
  {
    id: "seo-prog-1",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 saat önce
    pageId: "service-kadikoy",
    pageTitle: "Kadıköy 7/24 Acil Oto Çekici",
    pageUrl: "/hizmetlerimiz/kadikoy-oto-cekici",
    clusterId: "cluster-district",
    clusterTitle: "İlçe & Bölgesel Çekici",
    actionType: "h1_optimization",
    actionDescription: "H1 Başlığı ve Meta Açıklaması Kadıköy lokasyon hedefli anahtar kelimelerle optimize edildi.",
    keywords: [
      {
        keyword: "kadıköy oto çekici",
        previousRank: 18,
        currentRank: 3,
        rankChange: 15,
        monthlySearchVolume: 3200,
        difficulty: "Orta",
        serpFeatures: ["Yerel Harita Paketi", "Site Bağlantıları"]
      },
      {
        keyword: "kadıköy acil çekici",
        previousRank: 24,
        currentRank: 4,
        rankChange: 20,
        monthlySearchVolume: 1600,
        difficulty: "Düşük",
        serpFeatures: ["Öne Çıkan Snippet"]
      },
      {
        keyword: "bağdat caddesi oto kurtarıcı",
        previousRank: 14,
        currentRank: 2,
        rankChange: 12,
        monthlySearchVolume: 950,
        difficulty: "Düşük",
        serpFeatures: ["Yerel Harita Paketi"]
      }
    ],
    previousAverageRank: 18.6,
    currentAverageRank: 3.0,
    rankImprovement: 15.6,
    estimatedTrafficGrowth: 540,
    estimatedMonthlyRevenueGain: 6200,
    status: "top_3",
    isRead: false,
    alertLevel: "top_3",
    googleBotCrawlTime: "Bugün 02:14:05 (GoogleBot Mobile Smartphone - HTTP 200 OK)",
    simulatedDaysAfterFix: 4,
    serpPreviewSnippet: {
      title: "Kadıköy 7/24 Acil Oto Çekici | En Yakın Çekici 15 Dk",
      url: "https://yildizotokurtarma.com.tr/hizmetlerimiz/kadikoy-oto-cekici",
      description: "Kadıköy, Bağdat Caddesi ve Moda çevresinde 7/24 acil oto çekici ve yol yardım. 15 dakikada yerinde müdahale, şeffaf fiyat garantisi."
    }
  },
  {
    id: "seo-prog-2",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(), // 18 saat önce
    pageId: "service-agir-vasita",
    pageTitle: "Ağır Vasıta & Kamyon Kurtarma Hizmeti",
    pageUrl: "/hizmetlerimiz/agir-vasita-kurtarma",
    clusterId: "cluster-heavy",
    clusterTitle: "Ağır Vasıta & Kamyon Çekici",
    actionType: "meta_optimization",
    actionDescription: "Eksik meta açıklaması eklendi, H1 başlığı ticari araç niyetine uyarlandı.",
    keywords: [
      {
        keyword: "ağır vasıta çekici istanbul",
        previousRank: 26,
        currentRank: 5,
        rankChange: 21,
        monthlySearchVolume: 2100,
        difficulty: "Yüksek",
        serpFeatures: ["Yerel Harita Paketi"]
      },
      {
        keyword: "kamyon çekici tır kurtarma",
        previousRank: 19,
        currentRank: 4,
        rankChange: 15,
        monthlySearchVolume: 1450,
        difficulty: "Orta",
        serpFeatures: ["Öne Çıkan Snippet"]
      }
    ],
    previousAverageRank: 22.5,
    currentAverageRank: 4.5,
    rankImprovement: 18.0,
    estimatedTrafficGrowth: 410,
    estimatedMonthlyRevenueGain: 7800,
    status: "ranking_boosted",
    isRead: false,
    alertLevel: "first_page",
    googleBotCrawlTime: "Dün 23:45:12 (GoogleBot Desktop - HTTP 200 OK)",
    simulatedDaysAfterFix: 6,
    serpPreviewSnippet: {
      title: "Ağır Vasıta & Kamyon Kurtarma | 70 Ton Kapasite",
      url: "https://yildizotokurtarma.com.tr/hizmetlerimiz/agir-vasita-kurtarma",
      description: "İstanbul genelinde 70 tona kadar ağır ticari araç, kamyon, tır ve otobüs çekici hizmeti. Kaskolu ve vinçli kurtarma güvencesiyle 7/24 hizmetinizdeyiz."
    }
  },
  {
    id: "seo-prog-3",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 42).toISOString(), // ~2 gün önce
    pageId: "page-fiyatlar",
    pageTitle: "2026 Çekici KM Fiyat Tarifesi & Hesaplama",
    pageUrl: "/fiyat-tarifesi",
    clusterId: "cluster-pricing",
    clusterTitle: "Oto Kurtarıcı Fiyatları & KM Ücreti",
    actionType: "manual_edit",
    actionDescription: "Fiyat niyetli anahtar kelimeler doğrudan H1 ve meta başlığına eklendi.",
    keywords: [
      {
        keyword: "oto çekici km fiyatı 2026",
        previousRank: 11,
        currentRank: 1,
        rankChange: 10,
        monthlySearchVolume: 4800,
        difficulty: "Orta",
        serpFeatures: ["Öne Çıkan Snippet (Position #0)", "Kullanıcılar Bunları da Sordu"]
      },
      {
        keyword: "oto kurtarıcı ne kadar tutar",
        previousRank: 15,
        currentRank: 3,
        rankChange: 12,
        monthlySearchVolume: 2900,
        difficulty: "Düşük",
        serpFeatures: ["SSS Şema İşaretlemesi"]
      }
    ],
    previousAverageRank: 13.0,
    currentAverageRank: 2.0,
    rankImprovement: 11.0,
    estimatedTrafficGrowth: 680,
    estimatedMonthlyRevenueGain: 5400,
    status: "top_3",
    isRead: true,
    alertLevel: "milestone",
    googleBotCrawlTime: "2 gün önce (GoogleBot Mobile Smartphone - HTTP 200 OK)",
    simulatedDaysAfterFix: 9,
    serpPreviewSnippet: {
      title: "2026 Oto Çekici Fiyatları & KM Ücret Tarifesi | Şeffaf Fiyat",
      url: "https://yildizotokurtarma.com.tr/fiyat-tarifesi",
      description: "2026 güncel oto çekici ve kurtarma fiyat listesi. Şehir içi başlangıç 1.250 TL, şeffaf KM hesaplama tablosu ile sürpriz maliyetsiz hizmet."
    }
  },
  {
    id: "seo-prog-4",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(), // 4 gün önce
    pageId: "blog-aku-takviye",
    pageTitle: "Akü Bittiğinde Ne Yapılmalı? 2026 Rehberi",
    pageUrl: "/blog/aku-bitti-ne-yapilmali",
    clusterId: "cluster-guides",
    clusterTitle: "Rehberler, Sigorta & SSS",
    actionType: "h1_optimization",
    actionDescription: "Soru kalıpları ve 'Nasıl Yapılır' H1 hiyerarşisi kurgulandı.",
    keywords: [
      {
        keyword: "akü bitince araba nasıl çalıştırılır",
        previousRank: 29,
        currentRank: 6,
        rankChange: 23,
        monthlySearchVolume: 3400,
        difficulty: "Düşük",
        serpFeatures: ["Öne Çıkan Madde Listesi"]
      }
    ],
    previousAverageRank: 29.0,
    currentAverageRank: 6.0,
    rankImprovement: 23.0,
    estimatedTrafficGrowth: 280,
    estimatedMonthlyRevenueGain: 2100,
    status: "ranking_boosted",
    isRead: true,
    alertLevel: "first_page",
    googleBotCrawlTime: "4 gün önce (GoogleBot Desktop - HTTP 200 OK)",
    simulatedDaysAfterFix: 14,
    serpPreviewSnippet: {
      title: "Akü Bittiğinde Ne Yapılmalı? Adım Adım Takviye Rehberi",
      url: "https://yildizotokurtarma.com.tr/blog/aku-bitti-ne-yapilmali",
      description: "Araç aküsü bittiğinde güvenli akü takviyesi nasıl yapılır? Takviye kablosu bağlama adımları ve yerinde akü destek hizmeti detayları."
    }
  }
];

export const DEFAULT_SEO_PROGRESS_CONFIG: SeoProgressNotificationConfig = {
  enabled: true,
  soundEnabled: true,
  notifyOnFirstPage: true,
  notifyOnTop3: true,
  notifyOnTrafficMilestone: true,
  minRankJumpThreshold: 2,
  emailAlerts: {
    enabled: true,
    recipientEmail: "seo@yildizotokurtarma.com.tr"
  },
  webhookAlerts: {
    enabled: false,
    webhookUrl: "https://hooks.slack.com/services/T00/B00/X00",
    slackFormat: true
  },
  logs: INITIAL_SEO_PROGRESS_LOGS
};

export interface GenerateProgressLogParams {
  pageId: string;
  pageTitle: string;
  pageUrl: string;
  clusterId: string;
  clusterTitle: string;
  actionType: "h1_optimization" | "meta_optimization" | "batch_remediation" | "regional_page_created" | "manual_edit";
  appliedH1: string;
  appliedMeta: string;
  appliedKeywords: string;
}

/**
 * Generates an SEO ranking improvement progress notification log when an optimization is applied.
 */
export function generateSeoProgressLog(params: GenerateProgressLogParams): SeoProgressNotificationLog {
  const kwsList = params.appliedKeywords
    .split(",")
    .map(k => k.trim())
    .filter(Boolean);

  const keywordsArray = kwsList.length > 0
    ? kwsList.slice(0, 3)
    : [params.appliedH1.toLowerCase().replace(/[^\w\sğüşöçıİĞÜŞÖÇ]/gi, "").slice(0, 35)];

  // Cluster-specific simulation parameters
  let basePrevRank = 18;
  let baseNewRank = 4;
  let baseVolume = 2400;
  let trafficMultiplier = 1.0;

  if (params.clusterId === "cluster-district") {
    basePrevRank = 22;
    baseNewRank = 3;
    baseVolume = 2800;
    trafficMultiplier = 1.25;
  } else if (params.clusterId === "cluster-heavy") {
    basePrevRank = 24;
    baseNewRank = 5;
    baseVolume = 1900;
    trafficMultiplier = 1.35;
  } else if (params.clusterId === "cluster-pricing") {
    basePrevRank = 14;
    baseNewRank = 2;
    baseVolume = 3600;
    trafficMultiplier = 1.15;
  } else if (params.clusterId === "cluster-guides") {
    basePrevRank = 28;
    baseNewRank = 7;
    baseVolume = 2200;
    trafficMultiplier = 0.85;
  }

  const keywordShifts: SeoKeywordRankShift[] = keywordsArray.map((kw, idx) => {
    const prev = Math.max(8, Math.min(32, basePrevRank + idx * 3 + Math.floor(Math.random() * 4 - 2)));
    const next = Math.max(1, Math.min(8, baseNewRank + idx + (idx === 0 ? 0 : 1)));
    const diff = prev - next;
    const vol = Math.max(600, Math.round((baseVolume / (idx + 1)) * (0.85 + Math.random() * 0.3)));
    
    const serpFeats: string[] = [];
    if (next <= 3) serpFeats.push("Yerel Harita Paketi");
    if (next === 1 || next === 2) serpFeats.push("Öne Çıkan Snippet");
    if (next <= 5) serpFeats.push("Site Bağlantıları");

    return {
      keyword: kw,
      previousRank: prev,
      currentRank: next,
      rankChange: diff,
      monthlySearchVolume: vol,
      difficulty: idx === 0 ? "Orta" : "Düşük",
      serpFeatures: serpFeats.length ? serpFeats : ["Standart Organik Snippet"]
    };
  });

  const prevAvg = parseFloat(
    (keywordShifts.reduce((acc, k) => acc + k.previousRank, 0) / keywordShifts.length).toFixed(1)
  );
  const newAvg = parseFloat(
    (keywordShifts.reduce((acc, k) => acc + k.currentRank, 0) / keywordShifts.length).toFixed(1)
  );
  const rankImp = parseFloat((prevAvg - newAvg).toFixed(1));

  const trafficGrowth = Math.round(
    keywordShifts.reduce((acc, k) => acc + (k.monthlySearchVolume * (k.rankChange / 100)), 0) * trafficMultiplier + 120
  );

  const revenueGain = Math.round(trafficGrowth * 9.5);

  const bestRank = Math.min(...keywordShifts.map(k => k.currentRank));
  let alertLevel: "milestone" | "top_3" | "first_page" | "standard" = "standard";
  let status: "pending_crawl" | "crawled" | "indexed" | "ranking_boosted" | "top_3" = "ranking_boosted";

  if (bestRank <= 3) {
    alertLevel = "top_3";
    status = "top_3";
  } else if (bestRank <= 10) {
    alertLevel = "first_page";
    status = "ranking_boosted";
  }

  if (rankImp >= 15 || bestRank === 1) {
    alertLevel = "milestone";
  }

  const crawlNow = new Date();
  const timeStr = `${crawlNow.getHours().toString().padStart(2, "0")}:${crawlNow.getMinutes().toString().padStart(2, "0")}:${crawlNow.getSeconds().toString().padStart(2, "0")}`;

  return {
    id: `seo-prog-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    pageId: params.pageId,
    pageTitle: params.pageTitle,
    pageUrl: params.pageUrl,
    clusterId: params.clusterId,
    clusterTitle: params.clusterTitle,
    actionType: params.actionType,
    actionDescription: `H1 ve Meta Açıklaması tek tıkla SEO Isı Haritası verilerine uyarlandı: "${params.appliedH1.slice(0, 45)}..."`,
    keywords: keywordShifts,
    previousAverageRank: prevAvg,
    currentAverageRank: newAvg,
    rankImprovement: rankImp,
    estimatedTrafficGrowth: trafficGrowth,
    estimatedMonthlyRevenueGain: revenueGain,
    status,
    isRead: false,
    alertLevel,
    googleBotCrawlTime: `Bugün ${timeStr} (GoogleBot Mobile Smartphone - HTTP 200 OK)`,
    simulatedDaysAfterFix: 3,
    serpPreviewSnippet: {
      title: params.appliedH1,
      url: `https://yildizotokurtarma.com.tr${params.pageUrl}`,
      description: params.appliedMeta
    }
  };
}

/**
 * Generates a batch remediation progress log summarizing all fixed pages.
 */
export function generateBatchSeoProgressLog(
  fixedCount: number,
  totalTrafficGain: number,
  avgRankGain: number
): SeoProgressNotificationLog {
  const crawlNow = new Date();
  const timeStr = `${crawlNow.getHours().toString().padStart(2, "0")}:${crawlNow.getMinutes().toString().padStart(2, "0")}:${crawlNow.getSeconds().toString().padStart(2, "0")}`;

  return {
    id: `seo-prog-batch-${Date.now()}`,
    timestamp: new Date().toISOString(),
    pageId: "batch-all-pages",
    pageTitle: `Toplu SEO Optimizasyonu (${fixedCount} Sayfa)`,
    pageUrl: "/",
    clusterId: "cluster-all",
    clusterTitle: "Tüm İçerik Kümeleri",
    actionType: "batch_remediation",
    actionDescription: `Isı Haritası verileriyle ${fixedCount} adet eksik sayfadaki tüm H1 ve Meta Açıklamaları tek tıkla toplu olarak giderildi.`,
    keywords: [
      {
        keyword: "istanbul oto çekici (toplu etki)",
        previousRank: 19,
        currentRank: 4,
        rankChange: 15,
        monthlySearchVolume: 8400,
        difficulty: "Yüksek",
        serpFeatures: ["Yerel Harita Paketi", "Öne Çıkan Snippet"]
      },
      {
        keyword: "en yakın oto kurtarıcı",
        previousRank: 16,
        currentRank: 2,
        rankChange: 14,
        monthlySearchVolume: 5200,
        difficulty: "Orta",
        serpFeatures: ["İlk 3 Sıra", "Hızlı Bağlantılar"]
      },
      {
        keyword: "bölgesel oto çekici sorguları",
        previousRank: 22,
        currentRank: 3,
        rankChange: 19,
        monthlySearchVolume: 6100,
        difficulty: "Düşük",
        serpFeatures: ["İlçe Lokasyon Genişlemesi"]
      }
    ],
    previousAverageRank: 19.0,
    currentAverageRank: 4.2,
    rankImprovement: avgRankGain > 0 ? avgRankGain : 14.8,
    estimatedTrafficGrowth: totalTrafficGain > 0 ? totalTrafficGain : 1850,
    estimatedMonthlyRevenueGain: (totalTrafficGain > 0 ? totalTrafficGain : 1850) * 11,
    status: "top_3",
    isRead: false,
    alertLevel: "milestone",
    googleBotCrawlTime: `Bugün ${timeStr} (GoogleBot Toplu Sitemap Taraması - 200 OK)`,
    simulatedDaysAfterFix: 5,
    serpPreviewSnippet: {
      title: "Yıldız Oto Kurtarma | İstanbul 7/24 Acil Çekici ve Yol Yardım",
      url: "https://yildizotokurtarma.com.tr",
      description: "İstanbul genelinde 39 ilçede 15 dakikada en yakın oto çekici ve yol yardım hizmeti. Şeffaf fiyat, 70 ton ağır vasıta ve kaskolu güvence."
    }
  };
}
