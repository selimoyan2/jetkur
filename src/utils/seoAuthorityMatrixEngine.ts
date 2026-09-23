import { SiteConfig } from "../types";

export interface BacklinkQualityMetrics {
  totalBacklinks: number;
  referringDomains: number;
  doFollowRatio: number; // percentage (e.g. 94)
  authorityScore: number; // 0-100 composite backlink quality
  spamScore: number; // percentage (e.g. 1)
  eduGovBacklinks: number;
  anchorTextDiversityScore: number; // 0-100
}

export interface MonthlyTrafficMetrics {
  visits: number;
  trafficValueUsd: number;
  top3Keywords: number;
  top10Keywords: number;
  totalIndexedKeywords: number;
  cwvPerformanceScore: number; // 0-100 Core Web Vitals
}

export interface AuthorityCompetitorEntity {
  id: string;
  name: string;
  domain: string;
  isUser: boolean;
  color: string;
  secondaryColor: string;
  badge: string;
  domainAuthority: number; // Moz DA 0-100
  domainRating: number; // Ahrefs DR 0-100
  backlinkQuality: BacklinkQualityMetrics;
  monthlyTraffic: MonthlyTrafficMetrics;
  growthRatePct: number; // e.g. +14.2% YoY
  daGapToLeader: number; // negative means behind leader, 0 for leader
  refDomainsGapToLeader: number;
  trafficGapToLeader: number;
  estimatedCatchUpDays: number;
  tacticalRecommendation: string;
}

export interface AuthorityMatrixMetricDef {
  key: "domainAuthority" | "backlinkQuality" | "monthlyTraffic";
  label: string;
  shortLabel: string;
  unit: string;
  description: string;
  color: string;
}

export interface AuthorityMatrixDataset {
  companyName: string;
  sector: string;
  city: string;
  entities: AuthorityCompetitorEntity[];
  sectorAverages: {
    domainAuthority: number;
    referringDomains: number;
    monthlyTraffic: number;
    doFollowRatio: number;
  };
  executiveVerdict: string;
  recommendedAction: string;
  lastAuditDate: string;
}

/**
 * Generates an authoritative, realistic dataset customized for the active SiteConfig
 */
export const generateAuthorityMatrixDataset = (
  config: Partial<SiteConfig>
): AuthorityMatrixDataset => {
  const companyName = config.companyName || "Siteniz";
  const sector = config.sector || "Genel Hizmet";
  const city = config.city || "İstanbul";

  const entities: AuthorityCompetitorEntity[] = [
    {
      id: "user-company",
      name: `${companyName} (Siteniz)`,
      domain:
        (config as Record<string, any>).domain ||
        (companyName ? `${companyName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com.tr` : "siteniz.com.tr"),
      isUser: true,
      color: "#6366f1", // Indigo 500
      secondaryColor: "#4338ca", // Indigo 700
      badge: "Hızlı Büyüyen (0.02s Hız)",
      domainAuthority: 48,
      domainRating: 52,
      backlinkQuality: {
        totalBacklinks: 4850,
        referringDomains: 142,
        doFollowRatio: 94,
        authorityScore: 88,
        spamScore: 1,
        eduGovBacklinks: 14,
        anchorTextDiversityScore: 92
      },
      monthlyTraffic: {
        visits: 18200,
        trafficValueUsd: 14800,
        top3Keywords: 38,
        top10Keywords: 142,
        totalIndexedKeywords: 1650,
        cwvPerformanceScore: 96
      },
      growthRatePct: 24.5,
      daGapToLeader: -8,
      refDomainsGapToLeader: -168,
      trafficGapToLeader: -6300,
      estimatedCatchUpDays: 90,
      tacticalRecommendation: "0.02s hız avantajı ve %94 dofollow kalitesiyle, 3 köşe taşı içerik ve 8 yerel PR yayını ile 90 günde DA 54'e çıkıp lideri yakalayabilir."
    },
    {
      id: "competitor-leader",
      name: `${sector} Lider A.Ş.`,
      domain: `lider${sector.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
      isUser: false,
      color: "#f43f5e", // Rose 500
      secondaryColor: "#be123c", // Rose 700
      badge: "Pazar Lideri (#1)",
      domainAuthority: 56,
      domainRating: 61,
      backlinkQuality: {
        totalBacklinks: 19400,
        referringDomains: 310,
        doFollowRatio: 81,
        authorityScore: 79,
        spamScore: 4,
        eduGovBacklinks: 22,
        anchorTextDiversityScore: 78
      },
      monthlyTraffic: {
        visits: 24500,
        trafficValueUsd: 21500,
        top3Keywords: 64,
        top10Keywords: 210,
        totalIndexedKeywords: 2840,
        cwvPerformanceScore: 64 // Slower LCP
      },
      growthRatePct: 4.2,
      daGapToLeader: 0,
      refDomainsGapToLeader: 0,
      trafficGapToLeader: 0,
      estimatedCatchUpDays: 0,
      tacticalRecommendation: "Ağır monolitik altyapı (3.4s LCP) ve %4 spam skoru zayıf karnıdır. Sabırsız mobil kullanıcılar hız farkı nedeniyle sitenize kaymaktadır."
    },
    {
      id: "competitor-challenger",
      name: `Bölgesel ${city} ${sector}`,
      domain: `bolgesel${city.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
      isUser: false,
      color: "#f59e0b", // Amber 500
      secondaryColor: "#b45309", // Amber 700
      badge: "Bölgesel Meydan Okuyan",
      domainAuthority: 42,
      domainRating: 44,
      backlinkQuality: {
        totalBacklinks: 3200,
        referringDomains: 118,
        doFollowRatio: 76,
        authorityScore: 68,
        spamScore: 3,
        eduGovBacklinks: 6,
        anchorTextDiversityScore: 72
      },
      monthlyTraffic: {
        visits: 14100,
        trafficValueUsd: 9600,
        top3Keywords: 26,
        top10Keywords: 98,
        totalIndexedKeywords: 1120,
        cwvPerformanceScore: 71
      },
      growthRatePct: 8.5,
      daGapToLeader: -14,
      refDomainsGapToLeader: -192,
      trafficGapToLeader: -10400,
      estimatedCatchUpDays: 140,
      tacticalRecommendation: "Yerel harita paketine yoğunlaşmış ancak blog ve semantik içerik derinliği eksiktir. Hizmet sayfalarınız bu rakibi geride bırakmıştır."
    },
    {
      id: "competitor-niche",
      name: `Ekspres ${sector} Servis`,
      domain: `ekspres${sector.toLowerCase().replace(/[^a-z0-9]/g, "")}.net`,
      isUser: false,
      color: "#06b6d4", // Cyan 500
      secondaryColor: "#0e7490", // Cyan 700
      badge: "Niş Rakip",
      domainAuthority: 36,
      domainRating: 38,
      backlinkQuality: {
        totalBacklinks: 1950,
        referringDomains: 76,
        doFollowRatio: 71,
        authorityScore: 58,
        spamScore: 7,
        eduGovBacklinks: 2,
        anchorTextDiversityScore: 64
      },
      monthlyTraffic: {
        visits: 9800,
        trafficValueUsd: 6200,
        top3Keywords: 14,
        top10Keywords: 62,
        totalIndexedKeywords: 840,
        cwvPerformanceScore: 58
      },
      growthRatePct: -2.1,
      daGapToLeader: -20,
      refDomainsGapToLeader: -234,
      trafficGapToLeader: -14700,
      estimatedCatchUpDays: 210,
      tacticalRecommendation: "Aşırı anahtar kelime doldurma ve düşük kaliteli dizin backlinkleri nedeniyle sıralama kaybı yaşamaktadır. Tehdit seviyesi düşüktür."
    }
  ];

  const sectorAverages = {
    domainAuthority: 45.5,
    referringDomains: 161.5,
    monthlyTraffic: 16650,
    doFollowRatio: 80.5
  };

  const executiveVerdict = `${companyName}, 48 DA ve %94 dofollow backlink kalitesiyle sektör ortalamasının (45.5 DA) üzerinde yer almaktadır. Pazar lideri (${entities[1].name}) 56 DA ile önde görünse de, sitenizin 0.02s hız skoru ve yüksek organik dönüşüm gücü sayesinde 90 günlük hedefli backlink ve köşe taşı içerik hamlesiyle 1. sırayı devralması matematiksel olarak mümkündür.`;

  const recommendedAction = "Yüksek otoriteli 8 yerel sektörel basın bülteni (DA 60+) ve 3 köşe taşı derinlemesine rehber yayınlayarak aradaki 8 DA ve 168 referans domain farkını kapatın.";

  const now = new Date();
  const lastAuditDate = now.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  return {
    companyName,
    sector,
    city,
    entities,
    sectorAverages,
    executiveVerdict,
    recommendedAction,
    lastAuditDate
  };
};

/**
 * Export the Authority Matrix to CSV file format
 */
export const exportAuthorityMatrixToCSV = (dataset: AuthorityMatrixDataset): void => {
  const headers = [
    "İşletme Adı",
    "Alan Adı",
    "Rol / Statü",
    "Domain Otoritesi (DA)",
    "Domain Rating (DR)",
    "Toplam Backlink",
    "Referans Domain",
    "DoFollow Oranı (%)",
    "Backlink Kalite Skoru (100)",
    "Spam Skoru (%)",
    "Aylık Organik Trafik",
    "Tahmini Trafik Değeri (USD)",
    "İlk 3 Kelime Sayısı",
    "İlk 10 Kelime Sayısı",
    "Core Web Vitals Skoru",
    "Lidere Olan DA Farkı",
    "Lidere Olan Trafik Farkı",
    "Stratejik Tavsiye"
  ];

  const rows = dataset.entities.map(e => [
    `"${e.name}"`,
    `"${e.domain}"`,
    `"${e.badge}"`,
    e.domainAuthority,
    e.domainRating,
    e.backlinkQuality.totalBacklinks,
    e.backlinkQuality.referringDomains,
    `%${e.backlinkQuality.doFollowRatio}`,
    e.backlinkQuality.authorityScore,
    `%${e.backlinkQuality.spamScore}`,
    e.monthlyTraffic.visits,
    `$${e.monthlyTraffic.trafficValueUsd}`,
    e.monthlyTraffic.top3Keywords,
    e.monthlyTraffic.top10Keywords,
    e.monthlyTraffic.cwvPerformanceScore,
    e.daGapToLeader,
    e.trafficGapToLeader,
    `"${e.tacticalRecommendation.replace(/"/g, '""')}"`
  ]);

  const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map(r => r.join(";"))].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `SEO_Otorite_Matrisi_${dataset.companyName.replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
