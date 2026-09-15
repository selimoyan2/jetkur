import { SiteConfig } from "../types";

export type HeatmapMetricKey = "ctr" | "clicks" | "impressions" | "rank" | "heatIndex";

export type SearchIntentType = "Yerel" | "Ticari" | "İşlemsel" | "Bilgi";

export interface HeatmapRegion {
  id: string;
  name: string;
  shortName: string;
  code: string;
  icon: string;
  color: string;
  majorCities: string[];
  marketShareEstimate: number; // percentage
  baseCtrModifier: number; // regional multiplier for CTR
  volumeModifier: number;  // population / search density modifier
  isHomeRegion?: boolean;
}

export interface HeatmapKeyword {
  id: string;
  term: string;
  category: string;
  intent: SearchIntentType;
  intentColor: string;
  totalSearchVolume: number;
  difficulty: "Düşük" | "Orta" | "Yüksek";
  isCustom?: boolean;
}

export interface HeatmapCellPerformance {
  keywordId: string;
  regionId: string;
  keywordTerm: string;
  regionName: string;
  regionShortName: string;
  
  // Core Metrics
  ctr: number; // Click-Through-Rate as percentage (e.g. 8.4)
  clicks: number; // Estimated monthly or period clicks
  impressions: number; // Impressions count
  rank: number; // Average SERP Position (e.g. 2.4, 6.1)
  heatIndex: number; // 0 - 100 composite index
  
  // Trend and Meta
  trendMoM: number; // Month-over-month % change (+12.4, -3.1)
  serpFeature: "Local 3-Pack" | "Snippet" | "Organic #1" | "Sitelinks" | "Standart SERP";
  conversionPotential: "Yüksek" | "Çok Yüksek" | "Orta" | "Geliştirilmeli";
  
  // Actionable Regional Recommendation
  recommendedAction: string;
  suggestedTitle: string;
  suggestedH1: string;
}

export interface RegionalSummary {
  region: HeatmapRegion;
  avgCtr: number;
  totalClicks: number;
  totalImpressions: number;
  avgRank: number;
  topKeyword: string;
  topKeywordCtr: number;
  strongestIntent: SearchIntentType;
}

export interface KeywordSummary {
  keyword: HeatmapKeyword;
  nationalCtr: number;
  nationalClicks: number;
  nationalImpressions: number;
  avgRank: number;
  bestRegionName: string;
  bestRegionCtr: number;
}

export interface SeoPerformanceHeatmapDataset {
  analyzedAt: string;
  timeRange: "7d" | "28d" | "90d";
  companyName: string;
  sector: string;
  homeCity: string;
  
  // Axes & Dimensions
  regions: HeatmapRegion[];
  keywords: HeatmapKeyword[];
  
  // 2D Matrix lookup: cells[keywordId][regionId]
  cells: Record<string, Record<string, HeatmapCellPerformance>>;
  cellList: HeatmapCellPerformance[];
  
  // Aggregated Summaries
  overallStats: {
    avgCtr: number;
    totalClicks: number;
    totalImpressions: number;
    avgRank: number;
    topPerformingRegion: string;
    topPerformingKeyword: string;
    topCtrValue: number;
    pageOneKeywordPercentage: number;
  };
  
  regionalSummaries: RegionalSummary[];
  keywordSummaries: KeywordSummary[];
  
  // Quick recommendations based on matrix gaps
  priorityOpportunities: {
    title: string;
    keyword: string;
    region: string;
    currentCtr: number;
    potentialClicks: number;
    action: string;
  }[];
}

// Built-in Default Geographic Regions for Turkish & Regional Market Coverage
export const DEFAULT_REGIONS: HeatmapRegion[] = [
  {
    id: "reg-marmara",
    name: "Marmara (İstanbul, Kocaeli, Bursa)",
    shortName: "Marmara",
    code: "MAR",
    icon: "🏙️",
    color: "#3b82f6",
    majorCities: ["İstanbul", "Kocaeli", "Bursa", "Tekirdağ"],
    marketShareEstimate: 42,
    baseCtrModifier: 1.15,
    volumeModifier: 1.55
  },
  {
    id: "reg-icanadolu",
    name: "İç Anadolu (Ankara, Konya, Eskişehir)",
    shortName: "İç Anadolu",
    code: "İÇA",
    icon: "🏛️",
    color: "#f59e0b",
    majorCities: ["Ankara", "Konya", "Eskişehir", "Kayseri"],
    marketShareEstimate: 21,
    baseCtrModifier: 1.05,
    volumeModifier: 1.18
  },
  {
    id: "reg-ege",
    name: "Ege Bölgesi (İzmir, Aydın, Muğla)",
    shortName: "Ege",
    code: "EGE",
    icon: "🌊",
    color: "#06b6d4",
    majorCities: ["İzmir", "Aydın", "Muğla", "Manisa", "Denizli"],
    marketShareEstimate: 16,
    baseCtrModifier: 1.12,
    volumeModifier: 1.10
  },
  {
    id: "reg-akdeniz",
    name: "Akdeniz (Antalya, Adana, Mersin)",
    shortName: "Akdeniz",
    code: "AKD",
    icon: "☀️",
    color: "#10b981",
    majorCities: ["Antalya", "Adana", "Mersin", "Hatay"],
    marketShareEstimate: 11,
    baseCtrModifier: 0.98,
    volumeModifier: 0.95
  },
  {
    id: "reg-karadeniz",
    name: "Karadeniz (Samsun, Trabzon, Ordu)",
    shortName: "Karadeniz",
    code: "KRD",
    icon: "🌲",
    color: "#84cc16",
    majorCities: ["Samsun", "Trabzon", "Ordu", "Rize"],
    marketShareEstimate: 5,
    baseCtrModifier: 0.92,
    volumeModifier: 0.70
  },
  {
    id: "reg-guneydogu",
    name: "Güneydoğu Anadolu (Gaziantep, Şanlıurfa)",
    shortName: "G.Doğu",
    code: "GDA",
    icon: "🏺",
    color: "#ec4899",
    majorCities: ["Gaziantep", "Şanlıurfa", "Diyarbakır"],
    marketShareEstimate: 5,
    baseCtrModifier: 0.88,
    volumeModifier: 0.65
  }
];

// Helper to sanitize and create deterministic pseudo-random seeds based on strings
function pseudoHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Generate context-aware keyword set based on SiteConfig
export function extractKeywordsFromConfig(config: SiteConfig, customTerms: string[] = []): HeatmapKeyword[] {
  const company = config.companyName || "Kurumsal Hizmetler";
  const sector = config.sector || "Hizmet";
  const city = config.city || "İstanbul";
  
  const keywords: HeatmapKeyword[] = [];
  const addedTerms = new Set<string>();

  const addTerm = (term: string, category: string, intent: SearchIntentType, volume: number, diff: "Düşük" | "Orta" | "Yüksek", isCustom = false) => {
    const clean = term.trim();
    if (!clean || clean.length < 3 || addedTerms.has(clean.toLowerCase())) return;
    addedTerms.add(clean.toLowerCase());
    
    let intentColor = "#3b82f6";
    if (intent === "İşlemsel") intentColor = "#10b981";
    if (intent === "Ticari") intentColor = "#8b5cf6";
    if (intent === "Yerel") intentColor = "#f59e0b";

    keywords.push({
      id: `kw-${keywords.length + 1}`,
      term: clean,
      category,
      intent,
      intentColor,
      totalSearchVolume: volume,
      difficulty: diff,
      isCustom
    });
  };

  // 1. User-provided custom terms first
  customTerms.forEach((term, idx) => {
    addTerm(term, "Özel Terim", "Ticari", 3200 + (idx * 400), "Orta", true);
  });

  // 2. Add keywords from config.seo.keywords
  if (config.seo?.keywords) {
    const splitKeywords = config.seo.keywords
      .split(/[,;\n]+/)
      .map((k) => k.trim())
      .filter(Boolean);
      
    splitKeywords.slice(0, 5).forEach((kw, i) => {
      const isLocal = kw.toLowerCase().includes(city.toLowerCase()) || kw.toLowerCase().includes("yakın");
      const isTransactional = /fiyat|ücret|satın|sipariş|randevu|teklif/i.test(kw);
      addTerm(
        kw,
        "SEO Anahtar Kelime",
        isLocal ? "Yerel" : isTransactional ? "İşlemsel" : "Ticari",
        4500 - (i * 450),
        i % 2 === 0 ? "Orta" : "Yüksek"
      );
    });
  }

  // 3. Add keywords from services
  if (config.services && Array.isArray(config.services)) {
    config.services.slice(0, 6).forEach((s, idx) => {
      if (s.title) {
        addTerm(`${s.title}`, "Hizmetler", "Ticari", 5800 - (idx * 500), idx < 2 ? "Düşük" : "Orta");
        addTerm(`${s.title} Fiyatları`, "Hizmet Fiyatı", "İşlemsel", 3400 - (idx * 300), "Orta");
        addTerm(`${city} ${s.title}`, "Yerel Arama", "Yerel", 4200 - (idx * 400), "Düşük");
      }
    });
  }

  // 4. Default high-intent permutations if keyword count is low
  if (keywords.length < 8) {
    addTerm(`${company} Hizmetleri`, "Marka Araması", "İşlemsel", 3800, "Düşük");
    addTerm(`En İyi ${sector} Firmaları`, "Sektörel Karşılaştırma", "Ticari", 7200, "Yüksek");
    addTerm(`${city} ${sector} Tavsiye`, "Yerel Tavsiye", "Yerel", 4900, "Orta");
    addTerm(`${sector} Danışmanlığı & Fiyat Teklifi`, "Teklif & İletişim", "İşlemsel", 2900, "Düşük");
    addTerm(`${sector} Nasıl Seçilir`, "Rehber & Bilgi", "Bilgi", 5400, "Orta");
  }

  return keywords.slice(0, 14); // Limit to top 14 keywords for clean matrix presentation
}

// Generate the complete SEO Performance Dataset
export function generateSeoPerformanceHeatmapData(
  config: SiteConfig,
  timeRange: "7d" | "28d" | "90d" = "28d",
  customTerms: string[] = []
): SeoPerformanceHeatmapDataset {
  const company = config.companyName || "Kurumsal Hizmetler";
  const sector = config.sector || "Hizmet";
  const homeCity = config.city || "İstanbul";

  // Time multiplier for counts
  const timeMultiplier = timeRange === "7d" ? 0.25 : timeRange === "90d" ? 3.1 : 1.0;

  // Build Regions (marking the home city region)
  const regions: HeatmapRegion[] = DEFAULT_REGIONS.map((reg) => {
    const isHome = reg.majorCities.some(
      (c) => c.toLowerCase() === homeCity.toLowerCase() || homeCity.toLowerCase().includes(c.toLowerCase())
    );
    return {
      ...reg,
      isHomeRegion: isHome,
      // Home region gets a natural boost in local organic relevance
      baseCtrModifier: isHome ? reg.baseCtrModifier * 1.35 : reg.baseCtrModifier
    };
  });

  const keywords = extractKeywordsFromConfig(config, customTerms);

  const cells: Record<string, Record<string, HeatmapCellPerformance>> = {};
  const cellList: HeatmapCellPerformance[] = [];

  let aggregateCtrSum = 0;
  let aggregateClicks = 0;
  let aggregateImpressions = 0;
  let aggregateRankSum = 0;
  let pageOneRankCount = 0;

  let maxCtr = 0;
  let topKeywordTerm = "";
  let topRegionName = "";

  keywords.forEach((kw) => {
    cells[kw.id] = {};

    regions.forEach((reg) => {
      // Deterministic calculation based on keyword + region + company seed
      const seed = pseudoHash(`${company}-${kw.term}-${reg.name}-${timeRange}`);
      const baseSeedNormalized = (seed % 1000) / 1000; // 0.0 to 1.0

      // Compute rank (position 1.2 to 24.5)
      // Home region and lower difficulty keywords rank higher (closer to 1)
      let baseRank = 1.5 + (baseSeedNormalized * 8.5);
      if (kw.difficulty === "Yüksek") baseRank += 4.5;
      if (kw.difficulty === "Düşük") baseRank -= 1.2;
      if (reg.isHomeRegion) baseRank = Math.max(1.1, baseRank * 0.55);
      if (kw.intent === "Yerel" && reg.isHomeRegion) baseRank = Math.max(1.0, baseRank * 0.4);
      baseRank = Math.round(baseRank * 10) / 10;

      // Compute CTR based on rank & SERP position physics
      // Rank 1: ~18-28% CTR, Rank 2: ~12-16%, Rank 3: ~8-11%, Rank 4-10: ~2-6%, Page 2: <2%
      let baseCtr = 0;
      if (baseRank <= 1.5) baseCtr = 20.5 + (baseSeedNormalized * 6.0);
      else if (baseRank <= 3.0) baseCtr = 13.2 + (baseSeedNormalized * 4.5);
      else if (baseRank <= 5.0) baseCtr = 8.1 + (baseSeedNormalized * 3.2);
      else if (baseRank <= 10.0) baseCtr = 3.8 + (baseSeedNormalized * 2.5);
      else baseCtr = 0.8 + (baseSeedNormalized * 1.6);

      // Apply regional modifier
      let finalCtr = baseCtr * reg.baseCtrModifier;
      // High-intent Transactional keywords get bonus CTR
      if (kw.intent === "İşlemsel") finalCtr *= 1.18;
      if (kw.intent === "Yerel" && reg.isHomeRegion) finalCtr *= 1.25;
      finalCtr = Math.max(0.5, Math.min(34.0, Math.round(finalCtr * 10) / 10));

      // Impressions based on keyword volume * regional density * time period
      const regionalVolumeFactor = (reg.marketShareEstimate / 100) * reg.volumeModifier;
      const impressions = Math.max(
        15,
        Math.round(kw.totalSearchVolume * regionalVolumeFactor * (0.8 + baseSeedNormalized * 0.4) * timeMultiplier)
      );

      // Clicks derived from Impressions * (CTR / 100)
      const clicks = Math.max(1, Math.round(impressions * (finalCtr / 100)));

      // Composite Heat Index (0 - 100)
      // Rank component: 1 = 100 pts, 10 = 30 pts, 20+ = 5 pts
      const rankScore = Math.max(0, 100 - ((baseRank - 1) * 6.5));
      // CTR component: 20%+ = 100 pts
      const ctrScore = Math.min(100, (finalCtr / 20) * 100);
      // Volume component
      const volScore = Math.min(100, (clicks / 200) * 100);
      const heatIndex = Math.round((ctrScore * 0.45) + (rankScore * 0.35) + (volScore * 0.20));

      // Trend MoM
      const trendMoM = Math.round(((baseSeedNormalized * 32) - 8) * 10) / 10;

      // SERP Feature
      let serpFeature: HeatmapCellPerformance["serpFeature"] = "Standart SERP";
      if (baseRank <= 2.0 && kw.intent === "Yerel") serpFeature = "Local 3-Pack";
      else if (baseRank <= 1.8) serpFeature = "Organic #1";
      else if (baseRank <= 3.2 && kw.intent === "Bilgi") serpFeature = "Snippet";
      else if (baseRank <= 4.0) serpFeature = "Sitelinks";

      // Conversion potential
      let conversionPotential: HeatmapCellPerformance["conversionPotential"] = "Orta";
      if (finalCtr >= 14 || (finalCtr >= 9 && kw.intent === "İşlemsel")) conversionPotential = "Çok Yüksek";
      else if (finalCtr >= 7.5) conversionPotential = "Yüksek";
      else if (finalCtr < 3.5) conversionPotential = "Geliştirilmeli";

      // Recommendation
      let recommendedAction = "";
      let suggestedTitle = "";
      let suggestedH1 = "";

      if (baseRank <= 3.0) {
        recommendedAction = `${reg.shortName} bölgesinde liderlik konumunu korumak için SSS Schema ve hızlı CTA butonlarını güncel tutun.`;
        suggestedTitle = `${kw.term} | ${company} - ${reg.majorCities[0]} Yetkili Servis & Destek`;
        suggestedH1 = `${reg.shortName} Bölgesinde Güvenilir ${kw.term}`;
      } else if (baseRank <= 9.0) {
        recommendedAction = `İlk 3 sıraya tırmanmak için "${reg.majorCities[0]}" odaklı yerel içerik ve başlık optimizasyonu yapın.`;
        suggestedTitle = `${reg.majorCities[0]} ${kw.term} Hizmeti | Uygun Fiyat & Teklif - ${company}`;
        suggestedH1 = `${reg.majorCities[0]} ve Çevresinde Profesyonel ${kw.term}`;
      } else {
        recommendedAction = `Arama görünürlüğü düşük. Bu bölgeye özel açılış sayfası (landing page) ve yerel geri bağlantı (backlink) stratejisi oluşturun.`;
        suggestedTitle = `${kw.term} - ${reg.name} | ${company}`;
        suggestedH1 = `${kw.term} İçin Bölgesel Çözüm Rehberi`;
      }

      const cellData: HeatmapCellPerformance = {
        keywordId: kw.id,
        regionId: reg.id,
        keywordTerm: kw.term,
        regionName: reg.name,
        regionShortName: reg.shortName,
        ctr: finalCtr,
        clicks,
        impressions,
        rank: baseRank,
        heatIndex,
        trendMoM,
        serpFeature,
        conversionPotential,
        recommendedAction,
        suggestedTitle,
        suggestedH1
      };

      cells[kw.id][reg.id] = cellData;
      cellList.push(cellData);

      aggregateCtrSum += finalCtr;
      aggregateClicks += clicks;
      aggregateImpressions += impressions;
      aggregateRankSum += baseRank;
      if (baseRank <= 10.0) pageOneRankCount++;

      if (finalCtr > maxCtr) {
        maxCtr = finalCtr;
        topKeywordTerm = kw.term;
        topRegionName = reg.shortName;
      }
    });
  });

  const totalCellsCount = cellList.length || 1;
  const avgCtr = Math.round((aggregateCtrSum / totalCellsCount) * 10) / 10;
  const avgRank = Math.round((aggregateRankSum / totalCellsCount) * 10) / 10;
  const pageOnePercentage = Math.round((pageOneRankCount / totalCellsCount) * 100);

  // Regional Summaries
  const regionalSummaries: RegionalSummary[] = regions.map((reg) => {
    const regCells = cellList.filter((c) => c.regionId === reg.id);
    const rClicks = regCells.reduce((acc, c) => acc + c.clicks, 0);
    const rImpressions = regCells.reduce((acc, c) => acc + c.impressions, 0);
    const rAvgCtr = regCells.length ? Math.round((regCells.reduce((acc, c) => acc + c.ctr, 0) / regCells.length) * 10) / 10 : 0;
    const rAvgRank = regCells.length ? Math.round((regCells.reduce((acc, c) => acc + c.rank, 0) / regCells.length) * 10) / 10 : 0;

    let bestCell = regCells[0];
    regCells.forEach((c) => {
      if (c.ctr > (bestCell?.ctr || 0)) bestCell = c;
    });

    return {
      region: reg,
      avgCtr: rAvgCtr,
      totalClicks: rClicks,
      totalImpressions: rImpressions,
      avgRank: rAvgRank,
      topKeyword: bestCell?.keywordTerm || "",
      topKeywordCtr: bestCell?.ctr || 0,
      strongestIntent: reg.isHomeRegion ? "Yerel" : "Ticari"
    };
  });

  // Keyword Summaries
  const keywordSummaries: KeywordSummary[] = keywords.map((kw) => {
    const kwCells = cellList.filter((c) => c.keywordId === kw.id);
    const kClicks = kwCells.reduce((acc, c) => acc + c.clicks, 0);
    const kImpressions = kwCells.reduce((acc, c) => acc + c.impressions, 0);
    const kAvgCtr = kwCells.length ? Math.round((kwCells.reduce((acc, c) => acc + c.ctr, 0) / kwCells.length) * 10) / 10 : 0;
    const kAvgRank = kwCells.length ? Math.round((kwCells.reduce((acc, c) => acc + c.rank, 0) / kwCells.length) * 10) / 10 : 0;

    let bestCell = kwCells[0];
    kwCells.forEach((c) => {
      if (c.ctr > (bestCell?.ctr || 0)) bestCell = c;
    });

    return {
      keyword: kw,
      nationalCtr: kAvgCtr,
      nationalClicks: kClicks,
      nationalImpressions: kImpressions,
      avgRank: kAvgRank,
      bestRegionName: bestCell?.regionShortName || "",
      bestRegionCtr: bestCell?.ctr || 0
    };
  });

  // Priority Opportunities (high impressions, but sub-optimal CTR rank 4-9)
  const priorityOpportunities = cellList
    .filter((c) => c.rank >= 3.5 && c.rank <= 9.5 && c.impressions >= 150)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 4)
    .map((c) => ({
      title: `${c.regionShortName} - ${c.keywordTerm}`,
      keyword: c.keywordTerm,
      region: c.regionShortName,
      currentCtr: c.ctr,
      potentialClicks: Math.round(c.impressions * 0.14) - c.clicks,
      action: c.recommendedAction
    }));

  return {
    analyzedAt: new Date().toLocaleDateString("tr-TR"),
    timeRange,
    companyName: company,
    sector,
    homeCity,
    regions,
    keywords,
    cells,
    cellList,
    overallStats: {
      avgCtr,
      totalClicks: aggregateClicks,
      totalImpressions: aggregateImpressions,
      avgRank,
      topPerformingRegion: topRegionName || "Marmara",
      topPerformingKeyword: topKeywordTerm,
      topCtrValue: maxCtr,
      pageOneKeywordPercentage: pageOnePercentage
    },
    regionalSummaries,
    keywordSummaries,
    priorityOpportunities
  };
}

// Format CSV string for download
export function exportHeatmapDataToCsv(dataset: SeoPerformanceHeatmapDataset): string {
  const headers = [
    "Anahtar Kelime",
    "Bölge",
    "Tıklanma Oranı (CTR %)",
    "Tıklama",
    "Gösterim",
    "Ortalama Sıra (Rank)",
    "Isı İndeksi (0-100)",
    "SERP Özelliği",
    "Aylık Trend (%)",
    "Önerilen Başlık"
  ];

  const rows = dataset.cellList.map((cell) => [
    `"${cell.keywordTerm.replace(/"/g, '""')}"`,
    `"${cell.regionName.replace(/"/g, '""')}"`,
    `${cell.ctr}%`,
    cell.clicks,
    cell.impressions,
    cell.rank,
    cell.heatIndex,
    `"${cell.serpFeature}"`,
    `${cell.trendMoM > 0 ? "+" : ""}${cell.trendMoM}%`,
    `"${cell.suggestedTitle.replace(/"/g, '""')}"`
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}
