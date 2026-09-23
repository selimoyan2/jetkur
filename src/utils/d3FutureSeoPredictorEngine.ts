import { SiteConfig, CompetitorKeywordRanking } from "../types";
import { generateFallbackCompetitiveSeo } from "./competitiveSeoUtils";

export interface FutureMonthlyDataPoint {
  monthIndex: number; // 1 to 6
  monthLabel: string; // e.g. "Ekim 2026"
  shortMonth: string; // e.g. "Eki '26"
  dateKey: string; // "2026-10"
  // User metrics
  userTraffic: number;
  userTrafficUpper: number;
  userTrafficLower: number;
  userVisibilityScore: number; // 0-100
  userAvgRank: number; // 1.0 is top
  userTop10Count: number;
  userTop3Count: number;
  // Competitor metrics
  comp1Traffic: number; // Market Leader
  comp1VisibilityScore: number;
  comp2Traffic: number; // Regional Strong
  comp2VisibilityScore: number;
  comp3Traffic: number; // Rising Challenger
  comp3VisibilityScore: number;
  // Milestone
  milestoneTitle: string;
  milestoneDesc: string;
  milestoneBadge: string;
  dominantKdTier: "Düşük (KD 0-35)" | "Orta (KD 36-65)" | "Yüksek (KD 66-100)";
  unlockedKeywordsCount: number;
}

export interface PredictorKeywordItem {
  id: string;
  keyword: string;
  monthlyVolume: number;
  monthlyVolumeFormatted: string;
  difficulty: number; // KD 0-100
  difficultyCategory: "Düşük (Kolay)" | "Orta" | "Yüksek (Zor)";
  currentRank: number | null;
  comp1Rank: number | null;
  comp2Rank: number | null;
  projected3MonthRank: number;
  projected6MonthRank: number;
  rankImprovement: number;
  expectedMonthlyClicks: number;
  actionPriority: "Acil Fırsat" | "Orta Vade" | "Stratejik Hedef";
  growthNote: string;
}

export interface PredictorCompetitorProfile {
  id: string;
  name: string;
  role: string;
  color: string;
  currentTrend: string;
  currentMomentumPercent: number;
  startTraffic: number;
  endTraffic: number;
  changePercent: number;
}

export interface FutureSeoPredictorDataset {
  industry: string;
  city: string;
  companyName: string;
  domain: string;
  scenario: "aggressive" | "balanced" | "conservative";
  kdFilter: "all" | "easy" | "medium" | "hard";
  generatedDate: string;
  timeline: FutureMonthlyDataPoint[];
  keywords: PredictorKeywordItem[];
  filteredKeywords: PredictorKeywordItem[];
  competitors: PredictorCompetitorProfile[];
  summary: {
    totalTrafficGrowthPercent: number;
    startTraffic: number;
    endTraffic: number;
    startVisibility: number;
    endVisibility: number;
    leaderCrossoverMonth: number | null; // e.g. 4 for 4th month
    newTop10KeywordsCount: number;
    newTop3KeywordsCount: number;
    averageKdTarget: number;
    confidenceScore: number;
    dominantGrowthDriver: string;
  };
}

const MONTH_NAMES_TR = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
];

const MONTH_SHORT_TR = [
  "Oca", "Şub", "Mar", "Nis", "May", "Haz",
  "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"
];

export function calculateFutureSeoPredictions(
  config: SiteConfig,
  scenario: "aggressive" | "balanced" | "conservative" = "balanced",
  kdFilter: "all" | "easy" | "medium" | "hard" = "all",
  customKeywordRankings?: CompetitorKeywordRanking[]
): FutureSeoPredictorDataset {
  const companyName = config.companyName || "Siteniz";
  const industry = config.sector || "Oto Çekici & Kurtarıcı";
  const city = config.city || "İstanbul";
  const domain = (config.cloudflare as any)?.customDomain || `${companyName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com.tr`;

  // Base multiplier from scenario
  const scenarioMultiplier = scenario === "aggressive" ? 1.32 : scenario === "conservative" ? 0.78 : 1.0;
  
  // Performance and technical scores as positive levers
  const perfScore = (config as any).performanceScore || 98;
  const speedBonus = perfScore > 90 ? 1.15 : 1.0;

  // Starting base metrics
  const baseStartTraffic = 2450;
  const comp1StartTraffic = 5400; // Leader
  const comp2StartTraffic = 3100; // Regional
  const comp3StartTraffic = 1950; // Challenger

  // Generate 6 upcoming months from current date (September 2026 -> Oct 2026 to Mar 2027)
  const currentDate = new Date(2026, 8, 22); // Sept 2026
  const timeline: FutureMonthlyDataPoint[] = [];

  const milestonesData = [
    {
      title: "Core Web Vitals & INP Hız Sıçraması",
      desc: "Cloudflare 0.02s TTFB ve mobil hız üstünlüğü sayesinde Google dizin tarama frekansı 2.4 katına çıkar; düşük KD'li kelimeler ilk 10'a yerleşir.",
      badge: "Hız & Altyapı",
      dominantKd: "Düşük (KD 0-35)" as const,
      baseGainKeywords: 8
    },
    {
      title: "Düşük Zorluklu (KD 15-35) 16 Kelimede İlk 3",
      desc: "Hedef yerel arama niyetli anahtar kelimelerde sıralama yükselir, bölgesel rakiple aradaki organik trafik farkı %50 daralır.",
      badge: "SERP Sıçraması",
      dominantKd: "Düşük (KD 0-35)" as const,
      baseGainKeywords: 14
    },
    {
      title: "Orta Zorluklu (KD 40-55) Konu Kümelerinin İndekslenmesi",
      desc: "Semantik blog ve rehber sayfalarının iç link ağı güçlenir; Pazar Lideri ile olan tıklama payı dengelenmeye başlar.",
      badge: "İçerik Otoritesi",
      dominantKd: "Orta (KD 36-65)" as const,
      baseGainKeywords: 22
    },
    {
      title: "Pazar Lideri ile Trafik Eşitlenmesi (Kritik Eşik)",
      desc: "Liderin mobil Core Web Vitals kaybı ve trafik erozyonu (%-4.2) zirveye ulaşır; siteniz liderle aynı organik oturum bandına girer.",
      badge: "Pazar Liderliği Eşiği",
      dominantKd: "Orta (KD 36-65)" as const,
      baseGainKeywords: 31
    },
    {
      title: "Bölgesel Rakibin Net Geride Bırakılması (#2 Pozisyonu)",
      desc: "Tüm ana yerel varyasyonlarda ilk 3 sıra domine edilir; dofollow sektörel backlinkler DA puanını 54'ten 60'a yükseltir.",
      badge: "Otorite Zirvesi",
      dominantKd: "Yüksek (KD 66-100)" as const,
      baseGainKeywords: 39
    },
    {
      title: "Sektörel SERP Hakimiyeti & %58 Organik Pazar Payı",
      desc: "En rekabetçi (KD 70+) genel anahtar kelimelerde dahi ilk 3 pozisyon garantilenir; sürdürülebilir aylık organik trafik 5.800+ seviyesine oturur.",
      badge: "Pazar Liderliği",
      dominantKd: "Yüksek (KD 66-100)" as const,
      baseGainKeywords: 46
    }
  ];

  let leaderCrossoverMonth: number | null = null;

  for (let i = 1; i <= 6; i++) {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
    const mName = MONTH_NAMES_TR[targetDate.getMonth()];
    const mShort = MONTH_SHORT_TR[targetDate.getMonth()];
    const mYear = targetDate.getFullYear();
    const monthLabel = `${mName} ${mYear}`;
    const shortMonth = `${mShort} '${String(mYear).slice(2)}`;
    const dateKey = `${mYear}-${String(targetDate.getMonth() + 1).padStart(2, "0")}`;

    // Compound progression rates
    // User grows steeply thanks to speed + KD progressive unlocking
    const userGrowthRate = Math.pow(1 + 0.16 * scenarioMultiplier * speedBonus, i);
    const userTraffic = Math.round(baseStartTraffic * userGrowthRate);

    // Confidence interval (±8% to ±16% widening as horizon extends)
    const variancePercent = 0.07 + i * 0.016;
    const userTrafficUpper = Math.round(userTraffic * (1 + variancePercent));
    const userTrafficLower = Math.round(userTraffic * (1 - variancePercent));

    // Visibility score (0-100)
    const userVisibilityScore = Math.min(97, Math.round(52 + (i * 7.5 * scenarioMultiplier)));
    const userAvgRank = Math.max(1.8, +(6.8 - i * 0.8 * scenarioMultiplier).toFixed(1));
    const userTop10Count = Math.min(84, Math.round(18 + i * 8.5 * scenarioMultiplier));
    const userTop3Count = Math.min(42, Math.round(5 + i * 5.2 * scenarioMultiplier));

    // Competitor 1 (Leader): slow erosion (-1.2% per month)
    const comp1Rate = Math.pow(1 - 0.012, i);
    const comp1Traffic = Math.round(comp1StartTraffic * comp1Rate);
    const comp1VisibilityScore = Math.max(68, Math.round(92 - i * 2.8));

    // Competitor 2 (Regional): modest growth (+1.4% per month)
    const comp2Rate = Math.pow(1 + 0.014, i);
    const comp2Traffic = Math.round(comp2StartTraffic * comp2Rate);
    const comp2VisibilityScore = Math.round(66 + i * 0.8);

    // Competitor 3 (Challenger): energetic rising (+3.2% per month)
    const comp3Rate = Math.pow(1 + 0.032, i);
    const comp3Traffic = Math.round(comp3StartTraffic * comp3Rate);
    const comp3VisibilityScore = Math.round(58 + i * 2.2);

    // Check crossover
    if (userTraffic >= comp1Traffic && leaderCrossoverMonth === null) {
      leaderCrossoverMonth = i;
    }

    const milestone = milestonesData[i - 1];

    timeline.push({
      monthIndex: i,
      monthLabel,
      shortMonth,
      dateKey,
      userTraffic,
      userTrafficUpper,
      userTrafficLower,
      userVisibilityScore,
      userAvgRank,
      userTop10Count,
      userTop3Count,
      comp1Traffic,
      comp1VisibilityScore,
      comp2Traffic,
      comp2VisibilityScore,
      comp3Traffic,
      comp3VisibilityScore,
      milestoneTitle: milestone.title,
      milestoneDesc: milestone.desc,
      milestoneBadge: milestone.badge,
      dominantKdTier: milestone.dominantKd,
      unlockedKeywordsCount: Math.round(milestone.baseGainKeywords * scenarioMultiplier)
    });
  }

  // Generate or map realistic keyword rankings with KD% difficulty tiers
  const rawKeywords = customKeywordRankings && customKeywordRankings.length > 0
    ? customKeywordRankings
    : generateFallbackCompetitiveSeo(config).keywordRankings || [];

  const defaultKeywordsData: PredictorKeywordItem[] = [
    {
      id: "pred-kw-1",
      keyword: `${city} ${industry.split(" ")[0]} Fiyatları`,
      monthlyVolume: 8400,
      monthlyVolumeFormatted: "8.400 /ay",
      difficulty: 28, // Low KD
      difficultyCategory: "Düşük (Kolay)",
      currentRank: 6,
      comp1Rank: 2,
      comp2Rank: 4,
      projected3MonthRank: 2,
      projected6MonthRank: 1,
      rankImprovement: 5,
      expectedMonthlyClicks: 1420,
      actionPriority: "Acil Fırsat",
      growthNote: "Düşük KD seviyesi ve doğrudan satın alma niyeti sayesinde 2. ayda ilk sıraya yerleşir."
    },
    {
      id: "pred-kw-2",
      keyword: `En Yakın ${industry.split(" ")[0]}`,
      monthlyVolume: 12600,
      monthlyVolumeFormatted: "12.600 /ay",
      difficulty: 34, // Low KD
      difficultyCategory: "Düşük (Kolay)",
      currentRank: 4,
      comp1Rank: 1,
      comp2Rank: 3,
      projected3MonthRank: 2,
      projected6MonthRank: 1,
      rankImprovement: 3,
      expectedMonthlyClicks: 2150,
      actionPriority: "Acil Fırsat",
      growthNote: "Yerel arama niyetli bu sorguda mobil hız ve harita şeması ile lideri 3. ayda geride bırakır."
    },
    {
      id: "pred-kw-3",
      keyword: `7/24 ${city} ${industry.split(" ")[0]} Hizmeti`,
      monthlyVolume: 5900,
      monthlyVolumeFormatted: "5.900 /ay",
      difficulty: 42, // Medium KD
      difficultyCategory: "Orta",
      currentRank: 8,
      comp1Rank: 2,
      comp2Rank: 5,
      projected3MonthRank: 3,
      projected6MonthRank: 2,
      rankImprovement: 6,
      expectedMonthlyClicks: 840,
      actionPriority: "Orta Vade",
      growthNote: "Acil servis şeması ve CTA buton optimizasyonu ile 4. ayda ilk 3 sıraya girer."
    },
    {
      id: "pred-kw-4",
      keyword: `Oto Kurtarıcı Çekici Telefon Numarası`,
      monthlyVolume: 9200,
      monthlyVolumeFormatted: "9.200 /ay",
      difficulty: 48, // Medium KD
      difficultyCategory: "Orta",
      currentRank: 11,
      comp1Rank: 3,
      comp2Rank: 6,
      projected3MonthRank: 4,
      projected6MonthRank: 2,
      rankImprovement: 9,
      expectedMonthlyClicks: 1180,
      actionPriority: "Orta Vade",
      growthNote: "Doğrudan tıklanabilir telefon şeması (tel: link) ile dönüşüm odaklı sıralama artışı sağlar."
    },
    {
      id: "pred-kw-5",
      keyword: `${city} Oto Çekici Tavsiye ve Yorumlar`,
      monthlyVolume: 3400,
      monthlyVolumeFormatted: "3.400 /ay",
      difficulty: 22, // Low KD
      difficultyCategory: "Düşük (Kolay)",
      currentRank: 5,
      comp1Rank: 3,
      comp2Rank: 7,
      projected3MonthRank: 1,
      projected6MonthRank: 1,
      rankImprovement: 4,
      expectedMonthlyClicks: 680,
      actionPriority: "Acil Fırsat",
      growthNote: "Müşteri incelemeleri (Review schema) ile 1. aydan itibaren zengin arama sonucu (rich snippet) alır."
    },
    {
      id: "pred-kw-6",
      keyword: `${industry.split(" ")[0]} Şehirlerarası Taşıma`,
      monthlyVolume: 7100,
      monthlyVolumeFormatted: "7.100 /ay",
      difficulty: 68, // High KD
      difficultyCategory: "Yüksek (Zor)",
      currentRank: 16,
      comp1Rank: 1,
      comp2Rank: 4,
      projected3MonthRank: 7,
      projected6MonthRank: 3,
      rankImprovement: 13,
      expectedMonthlyClicks: 790,
      actionPriority: "Stratejik Hedef",
      growthNote: "Yüksek hacimli ve yüksek zorluklu bu sorguda 5. ayda ilk sayfaya ve 6. ayda ilk 3'e yükselir."
    },
    {
      id: "pred-kw-7",
      keyword: `Ağır Vasıta ve Kamyon Çekici ${city}`,
      monthlyVolume: 4300,
      monthlyVolumeFormatted: "4.300 /ay",
      difficulty: 74, // High KD
      difficultyCategory: "Yüksek (Zor)",
      currentRank: 19,
      comp1Rank: 2,
      comp2Rank: 5,
      projected3MonthRank: 9,
      projected6MonthRank: 3,
      rankImprovement: 16,
      expectedMonthlyClicks: 520,
      actionPriority: "Stratejik Hedef",
      growthNote: "Derinlemesine teknik vaka analizleri ve uzman içerikle 6. ayda liderin hemen arkasına yerleşir."
    },
    {
      id: "pred-kw-8",
      keyword: `Kaza Sonrası Sigortalı Çekici`,
      monthlyVolume: 3100,
      monthlyVolumeFormatted: "3.100 /ay",
      difficulty: 38, // Medium KD
      difficultyCategory: "Orta",
      currentRank: 7,
      comp1Rank: 4,
      comp2Rank: 8,
      projected3MonthRank: 3,
      projected6MonthRank: 2,
      rankImprovement: 5,
      expectedMonthlyClicks: 490,
      actionPriority: "Orta Vade",
      growthNote: "Hukuki ve kasko bilgilendirici blog içeriği sayesinde organik aramalarda istikrarlı tırmanış gösterir."
    }
  ];

  // If raw keywords exist, merge with KD data
  const keywords: PredictorKeywordItem[] = rawKeywords.length > 0
    ? rawKeywords.map((rk, idx) => {
        const kd = rk.difficulty || Math.min(85, 25 + idx * 8);
        const tier = kd <= 35 ? ("Düşük (Kolay)" as const) : kd <= 65 ? ("Orta" as const) : ("Yüksek (Zor)" as const);
        const current = rk.userRank || (12 + idx * 2);
        
        // KD-based projected improvements:
        // Low KD improves quickly by 3-6 positions in 3mo, 5-10 positions in 6mo
        // High KD improves steadily by 2-4 positions in 3mo, 6-12 positions in 6mo
        const p3 = Math.max(1, Math.round(current - (kd <= 35 ? 4 : kd <= 65 ? 3 : 2) * scenarioMultiplier));
        const p6 = Math.max(1, Math.round(current - (kd <= 35 ? 8 : kd <= 65 ? 6 : 5) * scenarioMultiplier));

        const volNum = parseInt(String(rk.monthlyVolume).replace(/[^0-9]/g, ""), 10) || (3000 + idx * 1000);
        const ctr = p6 === 1 ? 0.28 : p6 === 2 ? 0.16 : p6 === 3 ? 0.11 : p6 <= 5 ? 0.06 : 0.03;
        const expectedClicks = Math.round(volNum * ctr);

        return {
          id: rk.id || `pred-kw-${idx}`,
          keyword: rk.keyword,
          monthlyVolume: volNum,
          monthlyVolumeFormatted: `${volNum.toLocaleString("tr-TR")} /ay`,
          difficulty: kd,
          difficultyCategory: tier,
          currentRank: current,
          comp1Rank: rk.comp1Rank || 2,
          comp2Rank: rk.comp2Rank || 4,
          projected3MonthRank: p3,
          projected6MonthRank: p6,
          rankImprovement: Math.max(0, current - p6),
          expectedMonthlyClicks: expectedClicks,
          actionPriority: kd <= 35 ? "Acil Fırsat" : kd <= 65 ? "Orta Vade" : "Stratejik Hedef",
          growthNote: kd <= 35
            ? "Düşük zorluk: 1-2 ayda ilk sıraya yükselme potansiyeli yüksek."
            : kd <= 65
            ? "Orta zorluk: Konu kümesi ve zengin snippet şemasıyla ilk 3'e aday."
            : "Yüksek rekabet: 5-6 aylık sürekli editoryal backlink ve derin içerik gerektirir."
        };
      })
    : defaultKeywordsData;

  // Filter keywords according to KD filter
  const filteredKeywords = keywords.filter(kw => {
    if (kdFilter === "easy") return kw.difficulty <= 35;
    if (kdFilter === "medium") return kw.difficulty > 35 && kw.difficulty <= 65;
    if (kdFilter === "hard") return kw.difficulty > 65;
    return true;
  });

  // Calculate competitor profiles
  const endUserTraffic = timeline[5].userTraffic;
  const totalGrowthPercent = Math.round(((endUserTraffic - baseStartTraffic) / baseStartTraffic) * 100);

  const competitors: PredictorCompetitorProfile[] = [
    {
      id: "user-site",
      name: `${companyName} (Siz)`,
      role: "Hız & Altyapı Lideri (Yükselen)",
      color: "#06b6d4", // Cyan
      currentTrend: "+18.6% Aylık İvme",
      currentMomentumPercent: 18.6,
      startTraffic: baseStartTraffic,
      endTraffic: endUserTraffic,
      changePercent: totalGrowthPercent
    },
    {
      id: "comp-leader",
      name: `${industry} Pazar Lideri`,
      role: "Geleneksel Lider (Doygun)",
      color: "#8b5cf6", // Violet
      currentTrend: "-4.2% Trafik Erozyonu",
      currentMomentumPercent: -4.2,
      startTraffic: comp1StartTraffic,
      endTraffic: timeline[5].comp1Traffic,
      changePercent: Math.round(((timeline[5].comp1Traffic - comp1StartTraffic) / comp1StartTraffic) * 100)
    },
    {
      id: "comp-regional",
      name: `${city} Yerel Güçlü Rakip`,
      role: "Harita & Local 3-Pack Odaklı",
      color: "#10b981", // Emerald
      currentTrend: "+5.1% Ilımlı Artış",
      currentMomentumPercent: 5.1,
      startTraffic: comp2StartTraffic,
      endTraffic: timeline[5].comp2Traffic,
      changePercent: Math.round(((timeline[5].comp2Traffic - comp2StartTraffic) / comp2StartTraffic) * 100)
    },
    {
      id: "comp-challenger",
      name: "Sektörel Meydan Okuyan",
      role: "Hızlı İçerik Üreticisi",
      color: "#f59e0b", // Amber
      currentTrend: "+12.8% Yükselen Trend",
      currentMomentumPercent: 12.8,
      startTraffic: comp3StartTraffic,
      endTraffic: timeline[5].comp3Traffic,
      changePercent: Math.round(((timeline[5].comp3Traffic - comp3StartTraffic) / comp3StartTraffic) * 100)
    }
  ];

  const avgKd = Math.round(keywords.reduce((acc, k) => acc + k.difficulty, 0) / (keywords.length || 1));

  return {
    industry,
    city,
    companyName,
    domain,
    scenario,
    kdFilter,
    generatedDate: new Date().toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }),
    timeline,
    keywords,
    filteredKeywords,
    competitors,
    summary: {
      totalTrafficGrowthPercent: totalGrowthPercent,
      startTraffic: baseStartTraffic,
      endTraffic: endUserTraffic,
      startVisibility: 52,
      endVisibility: timeline[5].userVisibilityScore,
      leaderCrossoverMonth: leaderCrossoverMonth || 4,
      newTop10KeywordsCount: timeline[5].userTop10Count - 18,
      newTop3KeywordsCount: timeline[5].userTop3Count - 5,
      averageKdTarget: avgKd,
      confidenceScore: scenario === "aggressive" ? 89 : scenario === "conservative" ? 96 : 93,
      dominantGrowthDriver: "Core Web Vitals INP (0.02s TTFB) hız avantajı ve kademeli anahtar kelime zorluk (KD) açılımı."
    }
  };
}

export function exportPredictorDataToCsv(dataset: FutureSeoPredictorDataset): void {
  const headers = [
    "Ay",
    "Tarih",
    "Siteniz Tahmini Trafik",
    "Alt Güven Bandı",
    "Üst Güven Bandı",
    "Görünürlük Skoru (0-100)",
    "Ortalama Sıra",
    "Top 10 Kelime Sayısı",
    "Top 3 Kelime Sayısı",
    "Pazar Lideri Trafik",
    "Yerel Rakip Trafik",
    "Meydan Okuyan Trafik",
    "Aylık Kilometre Taşı",
    "Baskın KD Bandı"
  ];

  const rows = dataset.timeline.map(t => [
    `"${t.monthLabel}"`,
    `"${t.dateKey}"`,
    t.userTraffic,
    t.userTrafficLower,
    t.userTrafficUpper,
    t.userVisibilityScore,
    t.userAvgRank,
    t.userTop10Count,
    t.userTop3Count,
    t.comp1Traffic,
    t.comp2Traffic,
    t.comp3Traffic,
    `"${t.milestoneTitle.replace(/"/g, '""')}"`,
    `"${t.dominantKdTier}"`
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Gelecek_SEO_Performans_Tahmincisi_6_Ay_${dataset.companyName.replace(/[^a-zA-Z0-9]/g, "_")}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
