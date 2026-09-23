import { SiteConfig, MarketShareCompetitorData } from "../types";
import { generateMarketShareBenchmarkData } from "./marketShareBenchmarkEngine";

export interface CompetitorContentCluster {
  id: string;
  name: string;
  description: string;
  userKeywordCount: number;
  userAvgDensity: number;
  userPagesCount: number;
  comp1KeywordCount: number;
  comp1AvgDensity: number;
  comp1PagesCount: number;
  comp2KeywordCount: number;
  comp2AvgDensity: number;
  comp2PagesCount: number;
  comp3KeywordCount: number;
  comp3AvgDensity: number;
  comp3PagesCount: number;
  marketTotalVolume: number;
  opportunityLevel: "Kritik Fırsat" | "Yüksek Potansiyel" | "Dengeli" | "Lider";
}

export interface CompetitorComparisonReport {
  generatedAt: string;
  userSite: MarketShareCompetitorData;
  top3Competitors: MarketShareCompetitorData[];
  allProfiles: MarketShareCompetitorData[];
  marketAvgDA: number;
  marketAvgDensity: number;
  contentClusters: CompetitorContentCluster[];
  summaryMetrics: {
    daScore: number;
    daDiffVsLeader: number;
    userKeywordDensity: number;
    densityStatus: string;
    isDensityOptimal: boolean;
    referringDomainsGap: number;
    semanticCoverage: number;
    cleanSpamScore: number;
  };
}

/**
 * Computes deep competitor comparison metrics specifically geared towards
 * Domain Authority, Keyword Density, and Content Distribution across topic clusters.
 */
export function generateCompetitorComparisonReport(
  config: SiteConfig,
  customCompetitorList?: MarketShareCompetitorData[]
): CompetitorComparisonReport {
  const benchmarkData = generateMarketShareBenchmarkData(config, customCompetitorList || []);
  const userSite = benchmarkData.userItem;
  
  // Exclude user site and take the top 3 competitors
  const competitorsOnly = benchmarkData.items.filter(item => !item.isUser);
  const top3Competitors = competitorsOnly.slice(0, 3);
  const allProfiles = [userSite, ...top3Competitors];

  // Market averages
  const marketAvgDA = Math.round(
    allProfiles.reduce((acc, curr) => acc + curr.domainAuthority, 0) / allProfiles.length
  );
  const marketAvgDensity = Number(
    (allProfiles.reduce((acc, curr) => acc + curr.avgKeywordDensityPercent, 0) / allProfiles.length).toFixed(2)
  );

  const comp1 = top3Competitors[0] || userSite;
  const comp2 = top3Competitors[1] || userSite;
  const comp3 = top3Competitors[2] || userSite;

  const servicesCount = config.services?.items?.length || 4;
  const blogCount = config.blog?.items?.length || 2;
  const hasFaq = (config.faqs?.items?.length || 0) > 0;

  // 5 Strategic Content Clusters
  const contentClusters: CompetitorContentCluster[] = [
    {
      id: "core-services",
      name: "Temel Hizmet Sayfaları",
      description: "Ana hizmet kalemleri, uzmanlık alanları ve direkt arama hacmi yüksek ana terimler.",
      userKeywordCount: Math.min(85, 24 + servicesCount * 5),
      userAvgDensity: 2.2,
      userPagesCount: servicesCount,
      comp1KeywordCount: 110,
      comp1AvgDensity: 3.9,
      comp1PagesCount: 18,
      comp2KeywordCount: 68,
      comp2AvgDensity: 2.8,
      comp2PagesCount: 12,
      comp3KeywordCount: 42,
      comp3AvgDensity: 1.5,
      comp3PagesCount: 8,
      marketTotalVolume: 24500,
      opportunityLevel: "Dengeli"
    },
    {
      id: "emergency-intent",
      name: "Acil & 7/24 Çağrı Sayfaları",
      description: "Anlık telefon araması ve acil müdahale odaklı yüksek dönüşümlü arama terimleri.",
      userKeywordCount: Math.min(60, 18 + servicesCount * 3),
      userAvgDensity: 2.4,
      userPagesCount: Math.max(2, Math.floor(servicesCount / 2)),
      comp1KeywordCount: 85,
      comp1AvgDensity: 4.2, // Heavy stuffing
      comp1PagesCount: 14,
      comp2KeywordCount: 45,
      comp2AvgDensity: 2.5,
      comp2PagesCount: 6,
      comp3KeywordCount: 30,
      comp3AvgDensity: 1.8,
      comp3PagesCount: 4,
      marketTotalVolume: 18900,
      opportunityLevel: "Yüksek Potansiyel"
    },
    {
      id: "local-districts",
      name: "İlçe & Semt Lokasyonları",
      description: "Bölgesel harita sıralamaları ve ilçe bazlı 'en yakın' arama varyasyonları.",
      userKeywordCount: Math.min(120, 25 + blogCount * 8 + servicesCount * 4),
      userAvgDensity: 2.1,
      userPagesCount: Math.min(24, 4 + blogCount * 2),
      comp1KeywordCount: 220,
      comp1AvgDensity: 3.6,
      comp1PagesCount: 45,
      comp2KeywordCount: 95,
      comp2AvgDensity: 2.2,
      comp2PagesCount: 20,
      comp3KeywordCount: 50,
      comp3AvgDensity: 1.4,
      comp3PagesCount: 10,
      marketTotalVolume: 32000,
      opportunityLevel: "Kritik Fırsat"
    },
    {
      id: "pricing-guides",
      name: "Fiyat & Maliyet Rehberleri",
      description: "Ücret tarifeleri, maliyet hesaplama ve şeffaf fiyat arayan kullanıcı aramaları.",
      userKeywordCount: Math.min(45, 12 + blogCount * 3),
      userAvgDensity: 1.9,
      userPagesCount: Math.max(1, Math.floor(blogCount / 2)),
      comp1KeywordCount: 40,
      comp1AvgDensity: 2.9,
      comp1PagesCount: 5,
      comp2KeywordCount: 28,
      comp2AvgDensity: 2.0,
      comp2PagesCount: 4,
      comp3KeywordCount: 65, // Budget competitor focuses heavily here
      comp3AvgDensity: 2.3,
      comp3PagesCount: 12,
      marketTotalVolume: 14200,
      opportunityLevel: "Kritik Fırsat"
    },
    {
      id: "trust-faq",
      name: "Güven, SSS & İncelemeler",
      description: "Müşteri yorumları, sertifikalar, sigortalı hizmet garantisi ve SSS schema içerikleri.",
      userKeywordCount: hasFaq ? Math.min(55, 30 + blogCount * 4) : 15,
      userAvgDensity: 1.8,
      userPagesCount: hasFaq ? 4 : 1,
      comp1KeywordCount: 35,
      comp1AvgDensity: 2.4,
      comp1PagesCount: 6,
      comp2KeywordCount: 50,
      comp2AvgDensity: 2.1,
      comp2PagesCount: 9,
      comp3KeywordCount: 15,
      comp3AvgDensity: 1.2,
      comp3PagesCount: 2,
      marketTotalVolume: 9800,
      opportunityLevel: hasFaq ? "Lider" : "Yüksek Potansiyel"
    }
  ];

  const daDiffVsLeader = (comp1.domainAuthority || 75) - userSite.domainAuthority;
  const isDensityOptimal = userSite.avgKeywordDensityPercent >= 1.7 && userSite.avgKeywordDensityPercent <= 2.5;

  return {
    generatedAt: new Date().toLocaleDateString("tr-TR"),
    userSite,
    top3Competitors,
    allProfiles,
    marketAvgDA,
    marketAvgDensity,
    contentClusters,
    summaryMetrics: {
      daScore: userSite.domainAuthority,
      daDiffVsLeader,
      userKeywordDensity: userSite.avgKeywordDensityPercent,
      densityStatus: userSite.densityStatus,
      isDensityOptimal,
      referringDomainsGap: Math.max(0, (comp1.referringDomains || 400) - userSite.referringDomains),
      semanticCoverage: userSite.semanticCoveragePercent,
      cleanSpamScore: userSite.spamScore
    }
  };
}

/**
 * Exports comprehensive Competitor Comparison benchmarks to CSV.
 */
export function exportCompetitorComparisonCsv(report: CompetitorComparisonReport): void {
  const rows: string[][] = [
    ["=== RAKİP KIYASLAMA VE İÇERİK DAĞILIM RAPORU ==="],
    ["Rapor Tarihi", report.generatedAt],
    ["Kullanıcı Sitesi", report.userSite.name, report.userSite.domain],
    [""],
    [
      "Alan Adı / Firma",
      "Durum",
      "Domain Otoritesi (DA)",
      "Page Otoritesi (PA)",
      "Kök Domain (RD)",
      "Backlink Sayısı",
      "Spam Skoru (%)",
      "Anahtar Kelime Yoğunluğu (%)",
      "Yoğunluk Değerlendirmesi",
      "İlk 3 Kelime Hacmi",
      "İlk 10 Kelime Hacmi",
      "Pazar Payı (%)",
      "Tahmini Aylık Ziyaretçi"
    ],
    ...report.allProfiles.map(p => [
      p.name,
      p.isUser ? "Siteniz" : `Rakip #${p.rank}`,
      p.domainAuthority.toString(),
      p.pageAuthority.toString(),
      p.referringDomains.toString(),
      p.backlinksCount.toString(),
      `%${p.spamScore}`,
      `%${p.avgKeywordDensityPercent}`,
      p.densityStatus,
      p.top3KeywordsCount.toString(),
      p.top10KeywordsCount.toString(),
      `%${p.marketSharePercent}`,
      p.estimatedMonthlyVisits.toString()
    ]),
    [""],
    ["=== İÇERİK KÜMELERİ DAĞILIMI VE KELİME HACMİ ==="],
    [
      "İçerik Kümesi",
      "Açıklama",
      "Siteniz Kelime Sayısı",
      "Siteniz Ort. Yoğunluk (%)",
      `${report.top3Competitors[0]?.name || "Rakip 1"} Kelime`,
      `${report.top3Competitors[0]?.name || "Rakip 1"} Yoğunluk (%)`,
      `${report.top3Competitors[1]?.name || "Rakip 2"} Kelime`,
      `${report.top3Competitors[1]?.name || "Rakip 2"} Yoğunluk (%)`,
      `${report.top3Competitors[2]?.name || "Rakip 3"} Kelime`,
      `${report.top3Competitors[2]?.name || "Rakip 3"} Yoğunluk (%)`,
      "Pazar Arama Hacmi",
      "Stratejik Fırsat Derecesi"
    ],
    ...report.contentClusters.map(c => [
      c.name,
      c.description,
      c.userKeywordCount.toString(),
      `%${c.userAvgDensity}`,
      c.comp1KeywordCount.toString(),
      `%${c.comp1AvgDensity}`,
      c.comp2KeywordCount.toString(),
      `%${c.comp2AvgDensity}`,
      c.comp3KeywordCount.toString(),
      `%${c.comp3AvgDensity}`,
      c.marketTotalVolume.toString(),
      c.opportunityLevel
    ])
  ];

  const csvContent = "\uFEFF" + rows.map(r => r.map(cell => `"${(cell || "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `rakip_kiyaslama_da_ve_yogunluk_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
