import { CompetitorKeywordRanking, CompetitorContentMetric } from "../types";
import { CompetitorColorPalette, DEFAULT_COMPETITOR_PALETTE } from "./competitorColorTheme";

export interface CompetitorGrowthPoint {
  monthIndex: number; // 0 (Güncel) to 6 (6. Ay)
  monthLabel: string; // e.g. "Eyl 2026", "Eki 2026", ...
  shortMonth: string; // "Güncel", "Eki", "Kas", "Ara", "Oca", "Şub", "Mar"
  fullMonth: string;  // "Eylül 2026 (Mevcut)", "Ekim 2026 (1. Ay)", etc.
  traffic: number;
  visibility: number;
  avgRank: number;
  growthPct: number; // vs Month 0
  // Confidence Interval Bounds (based on data volatility & time horizon)
  lowerTraffic: number;
  upperTraffic: number;
  lowerVisibility: number;
  upperVisibility: number;
  lowerAvgRank: number; // Best case rank (lower number, e.g. #2.4 vs #3.5)
  upperAvgRank: number; // Worst case rank (higher number, e.g. #4.8 vs #3.5)
  uncertaintyPct: number; // e.g. 9.4% (± uncertainty radius)
}

export interface CompetitorGrowthProfile {
  id: "user" | "comp1" | "comp2" | "comp3";
  name: string;
  domain: string;
  isUser: boolean;
  color: string;
  currentMetrics: {
    visibility: number;
    avgRank: number;
    speedScore: number;
    schemaScore: number;
    contentVelocity: string;
    backlinkSignals: string;
    indexedPages: number;
    estTraffic: number;
  };
  growthDrivers: {
    velocityImpactPct: number;
    backlinkImpactPct: number;
    speedImpactPct: number;
    schemaImpactPct: number;
    serpImpactPct: number;
    summaryText: string;
  };
  monthlyGrowthRate: number; // e.g. +0.028 (2.8% per month)
  sixMonthGrowthRate: number; // e.g. +0.182 (18.2% total)
  confidenceIntervalPct: number; // e.g. 9.8% (Month 6 uncertainty band)
  volatilityScore: number; // e.g. 7.4% (Standard error / volatility index)
  volatilityLevel: "Düşük Oynaklık" | "Orta Oynaklık" | "Yüksek Oynaklık";
  volatilityDescription: string;
  points: CompetitorGrowthPoint[];
}

export interface KeywordTrendProjection {
  keywordId: string;
  keyword: string;
  monthlyVolume: number;
  userRank: number;
  comp1Rank: number;
  comp2Rank: number;
  comp3Rank: number;
  projectedUserRankM6: number;
  projectedUserGrowthPct: number;
  trendDirection: "up" | "down" | "stable";
  winningEntity: "user" | "comp1" | "comp2" | "comp3";
  points: Array<{
    monthIndex: number;
    monthLabel: string;
    userRank: number;
    comp1Rank: number;
    comp2Rank: number;
    comp3Rank: number;
    userEstClicks: number;
    lowerUserRank: number;
    upperUserRank: number;
    lowerClicks: number;
    upperClicks: number;
  }>;
}

// 6-Month Calendar configuration starting from current date (Eylül 2026)
export const FORECAST_MONTHS = [
  { index: 0, short: "Güncel", label: "Eyl 2026", full: "Eylül 2026 (Mevcut SERP)" },
  { index: 1, short: "Eki", label: "Eki 2026", full: "Ekim 2026 (1. Ay Öngörüsü)" },
  { index: 2, short: "Kas", label: "Kas 2026", full: "Kasım 2026 (2. Ay Öngörüsü)" },
  { index: 3, short: "Ara", label: "Ara 2026", full: "Aralık 2026 (3. Ay Öngörüsü)" },
  { index: 4, short: "Oca", label: "Oca 2027", full: "Ocak 2027 (4. Ay Öngörüsü)" },
  { index: 5, short: "Şub", label: "Şub 2027", full: "Şubat 2027 (5. Ay Öngörüsü)" },
  { index: 6, short: "Mar", label: "Mar 2027", full: "Mart 2027 (6. Ay Öngörüsü)" },
];

/**
 * Calculates algorithmic 6-month projected growth rates for all competitors and your site
 * based on their current actual SEO, speed, backlink, and content metrics.
 */
export function calculateCompetitorGrowthProfiles(
  rankings: CompetitorKeywordRanking[],
  competitors: CompetitorContentMetric[],
  userName: string = "Siteniz",
  userDomain: string = "sitemiz.com.tr",
  colorPalette: CompetitorColorPalette = DEFAULT_COMPETITOR_PALETTE,
  scenarioMultiplier: number = 1.0 // 1.0 = normal, 1.25 = aggressive, 0.85 = conservative
): CompetitorGrowthProfile[] {
  // Aggregate keyword stats
  const totalKeywords = Math.max(1, rankings.length);
  
  // Calculate average user rank and volume
  let userRankSum = 0;
  let comp1RankSum = 0;
  let comp2RankSum = 0;
  let comp3RankSum = 0;
  let totalSearchVolume = 0;

  rankings.forEach((r) => {
    userRankSum += r.userRank ?? 20;
    comp1RankSum += r.comp1Rank ?? 20;
    comp2RankSum += r.comp2Rank ?? 20;
    comp3RankSum += r.comp3Rank ?? 20;
    const vol = parseInt(r.monthlyVolume?.replace(/[^0-9]/g, "") || "1000", 10);
    totalSearchVolume += isNaN(vol) ? 1000 : vol;
  });

  const avgUserRank = +(userRankSum / totalKeywords).toFixed(1);
  const avgComp1Rank = +(comp1RankSum / totalKeywords).toFixed(1);
  const avgComp2Rank = +(comp2RankSum / totalKeywords).toFixed(1);
  const avgComp3Rank = +(comp3RankSum / totalKeywords).toFixed(1);

  // Entities to build
  const entities: Array<{
    id: "user" | "comp1" | "comp2" | "comp3";
    name: string;
    domain: string;
    isUser: boolean;
    color: string;
    avgRank: number;
    baseVisibility: number;
    speedScore: number;
    schemaScore: number;
    contentVelocity: string;
    backlinkSignals: string;
    indexedPages: number;
    baseTrafficRatio: number;
  }> = [
    {
      id: "user",
      name: userName,
      domain: userDomain,
      isUser: true,
      color: colorPalette.user,
      avgRank: avgUserRank,
      baseVisibility: 88,
      speedScore: 98,
      schemaScore: 95,
      contentVelocity: "Haftalık 3+",
      backlinkSignals: "Güçlü",
      indexedPages: 3120,
      baseTrafficRatio: 0.38
    },
    {
      id: "comp1",
      name: competitors[0]?.name || "1. Rakip",
      domain: competitors[0]?.domain || "rakip1.com.tr",
      isUser: false,
      color: colorPalette.comp1,
      avgRank: avgComp1Rank,
      baseVisibility: competitors[0]?.visibilityScore ?? 72,
      speedScore: competitors[0]?.speedScore ?? 74,
      schemaScore: competitors[0]?.schemaScore ?? 80,
      contentVelocity: competitors[0]?.contentVelocity || "Haftalık 1-2",
      backlinkSignals: competitors[0]?.backlinkSignals || "Güçlü",
      indexedPages: competitors[0]?.indexedPages ?? 5400,
      baseTrafficRatio: 0.29
    },
    {
      id: "comp2",
      name: competitors[1]?.name || "2. Rakip",
      domain: competitors[1]?.domain || "rakip2.com.tr",
      isUser: false,
      color: colorPalette.comp2,
      avgRank: avgComp2Rank,
      baseVisibility: competitors[1]?.visibilityScore ?? 54,
      speedScore: competitors[1]?.speedScore ?? 81,
      schemaScore: competitors[1]?.schemaScore ?? 65,
      contentVelocity: competitors[1]?.contentVelocity || "Aylık",
      backlinkSignals: competitors[1]?.backlinkSignals || "Orta",
      indexedPages: competitors[1]?.indexedPages ?? 1940,
      baseTrafficRatio: 0.19
    },
    {
      id: "comp3",
      name: competitors[2]?.name || "3. Rakip",
      domain: competitors[2]?.domain || "rakip3.com.tr",
      isUser: false,
      color: colorPalette.comp3,
      avgRank: avgComp3Rank,
      baseVisibility: competitors[2]?.visibilityScore ?? 41,
      speedScore: competitors[2]?.speedScore ?? 62,
      schemaScore: competitors[2]?.schemaScore ?? 50,
      contentVelocity: competitors[2]?.contentVelocity || "Düşük",
      backlinkSignals: competitors[2]?.backlinkSignals || "Zayıf",
      indexedPages: competitors[2]?.indexedPages ?? 880,
      baseTrafficRatio: 0.14
    }
  ];

  return entities.map((ent) => {
    // 1. Content Velocity Factor (Weekly 3+ = +2.6%/mo, Weekly 1-2 = +1.4%/mo, Monthly = +0.4%/mo, Low = -0.4%/mo)
    const velocityRate = 
      ent.contentVelocity === "Haftalık 3+" ? 0.026 :
      ent.contentVelocity === "Haftalık 1-2" ? 0.014 :
      ent.contentVelocity === "Aylık" ? 0.004 : -0.004;

    // 2. Backlink Authority Factor (Strong = +1.8%/mo, Medium = +0.7%/mo, Weak = -0.6%/mo)
    const backlinkRate =
      ent.backlinkSignals === "Güçlü" ? 0.018 :
      ent.backlinkSignals === "Orta" ? 0.007 : -0.006;

    // 3. Technical PageSpeed / CWV Factor (Score 90+ = +1.2%/mo, 75-89 = +0.4%/mo, <75 = -0.5%/mo)
    const speedRate =
      ent.speedScore >= 90 ? 0.012 :
      ent.speedScore >= 75 ? 0.004 : -0.005;

    // 4. Schema & Structured Data Factor
    const schemaRate = (ent.schemaScore / 100) * 0.006;

    // 5. Baseline SERP Momentum (top positions earn compounding user clicks)
    const serpRate = Math.max(-0.005, (10 - Math.min(10, ent.avgRank)) * 0.002);

    // Monthly Compound Rate with scenario multiplier
    const rawMonthlyRate = (velocityRate + backlinkRate + speedRate + schemaRate + serpRate) * scenarioMultiplier;
    // Bound monthly rate between -4% and +6%
    const monthlyRate = Math.max(-0.04, Math.min(0.065, rawMonthlyRate));

    // 6-Month Compounded Growth Rate
    const sixMonthRate = Math.pow(1 + monthlyRate, 6) - 1;

    // Base estimated monthly traffic
    const baseTraffic = Math.round(totalSearchVolume * ent.baseTrafficRatio);

    // Calculate Data Volatility (Oynaklık) based on keyword rank standard deviation, speed, and content stability
    const ranksList = rankings.map((r) => {
      if (ent.id === "user") return r.userRank ?? 20;
      if (ent.id === "comp1") return r.comp1Rank ?? 20;
      if (ent.id === "comp2") return r.comp2Rank ?? 20;
      return r.comp3Rank ?? 20;
    });

    const meanRank = ranksList.reduce((acc, v) => acc + v, 0) / Math.max(1, ranksList.length);
    const variance = ranksList.reduce((acc, v) => acc + Math.pow(v - meanRank, 2), 0) / Math.max(1, ranksList.length);
    const rankStdDev = Math.sqrt(variance);

    // Volatility coefficient: higher ranking spread and lower speed/content velocity increase volatility
    const speedPenalty = ent.speedScore < 75 ? 0.025 : ent.speedScore < 85 ? 0.012 : 0.0;
    const velocityPenalty = ent.contentVelocity === "Düşük" ? 0.028 : ent.contentVelocity === "Aylık" ? 0.015 : 0.0;
    const rankDispersionFactor = Math.min(0.04, (rankStdDev / 50) * 0.035);

    // Base Monthly Volatility Sigma (typically 3.5% to 7.5% per month)
    const baseMonthlyVolatility = 0.038 + speedPenalty + velocityPenalty + rankDispersionFactor;
    const volatilityScore = +(baseMonthlyVolatility * 100 * (1 + rankStdDev * 0.03)).toFixed(1);

    const volatilityLevel: "Düşük Oynaklık" | "Orta Oynaklık" | "Yüksek Oynaklık" = 
      volatilityScore <= 6.5 ? "Düşük Oynaklık" :
      volatilityScore <= 11.0 ? "Orta Oynaklık" : "Yüksek Oynaklık";

    const volatilityDescription = 
      volatilityLevel === "Düşük Oynaklık"
        ? `Kararlı SERP sıralamaları (σ=${rankStdDev.toFixed(1)}), yüksek PSI (${ent.speedScore}/100) ve düzenli içerik akışı.`
        : volatilityLevel === "Orta Oynaklık"
        ? `Ortalama SERP dalgalanması (σ=${rankStdDev.toFixed(1)}) ve dengeli teknik sinyaller.`
        : `Yüksek SERP sıralama yayılımı (σ=${rankStdDev.toFixed(1)}), algoritma güncellemelerine duyarlı dalgalanma payı.`;

    // Summary driver explanation
    const driverParts: string[] = [];
    if (velocityRate > 0.01) driverParts.push(`Yüksek İçerik Üretimi (${ent.contentVelocity})`);
    if (backlinkRate > 0.01) driverParts.push(`Güçlü Backlink Otoritesi`);
    if (speedRate > 0.008) driverParts.push(`Mükemmel PageSpeed (${ent.speedScore}/100)`);
    if (velocityRate <= 0) driverParts.push(`Düşük İçerik Frekansı`);
    if (speedRate < 0) driverParts.push(`Yavaş Mobil LCP`);
    const summaryText = driverParts.join(" • ") || "Dengeli SERP Hareketi";

    // Generate 6 points (Month 0 to 6) with Volatility-Driven Confidence Bounds
    const points: CompetitorGrowthPoint[] = FORECAST_MONTHS.map((m) => {
      const idx = m.index;
      const compoundFactor = Math.pow(1 + monthlyRate, idx);
      const traffic = Math.round(baseTraffic * compoundFactor);
      const growthPct = idx === 0 ? 0 : +((compoundFactor - 1) * 100).toFixed(1);

      // Visibility progression
      const visibility = Math.round(
        Math.min(100, Math.max(10, ent.baseVisibility * Math.pow(1 + monthlyRate * 0.65, idx)))
      );

      // Average Rank progression (lower is better)
      const rankDelta = (monthlyRate * 18) * (idx / 6);
      const avgRank = +(Math.max(1, ent.avgRank - rankDelta)).toFixed(1);

      // Volatility Uncertainty Band (Cone of Uncertainty: expanding as sqrt(time))
      // Month 0 has 0 uncertainty (exact current observed data)
      const timeFactor = idx === 0 ? 0 : Math.sqrt(idx);
      const uncertaintyBand = baseMonthlyVolatility * timeFactor * (scenarioMultiplier === 1.3 ? 1.25 : 1.0);
      const uncertaintyPct = +(uncertaintyBand * 100).toFixed(1);

      // 1. Traffic bounds
      const lowerTraffic = Math.max(0, Math.round(traffic * (1 - uncertaintyBand)));
      const upperTraffic = Math.round(traffic * (1 + uncertaintyBand));

      // 2. Visibility bounds (0% to 100%)
      const lowerVisibility = Math.max(5, Math.round(visibility * (1 - uncertaintyBand * 0.65)));
      const upperVisibility = Math.min(100, Math.round(visibility * (1 + uncertaintyBand * 0.65)));

      // 3. Average Rank bounds (lower number is better SERP rank)
      const rankSpread = idx === 0 ? 0 : Math.max(0.3, +(avgRank * uncertaintyBand * 0.6).toFixed(1));
      const lowerAvgRank = Math.max(1, +(avgRank - rankSpread).toFixed(1)); // Best case
      const upperAvgRank = +(avgRank + rankSpread).toFixed(1); // Worst case

      return {
        monthIndex: idx,
        monthLabel: m.label,
        shortMonth: m.short,
        fullMonth: m.full,
        traffic,
        visibility,
        avgRank,
        growthPct,
        lowerTraffic,
        upperTraffic,
        lowerVisibility,
        upperVisibility,
        lowerAvgRank,
        upperAvgRank,
        uncertaintyPct
      };
    });

    const month6Uncertainty = points[6].uncertaintyPct;

    return {
      id: ent.id,
      name: ent.name,
      domain: ent.domain,
      isUser: ent.isUser,
      color: ent.color,
      currentMetrics: {
        visibility: ent.baseVisibility,
        avgRank: ent.avgRank,
        speedScore: ent.speedScore,
        schemaScore: ent.schemaScore,
        contentVelocity: ent.contentVelocity,
        backlinkSignals: ent.backlinkSignals,
        indexedPages: ent.indexedPages,
        estTraffic: baseTraffic
      },
      growthDrivers: {
        velocityImpactPct: +(velocityRate * 100).toFixed(2),
        backlinkImpactPct: +(backlinkRate * 100).toFixed(2),
        speedImpactPct: +(speedRate * 100).toFixed(2),
        schemaImpactPct: +(schemaRate * 100).toFixed(2),
        serpImpactPct: +(serpRate * 100).toFixed(2),
        summaryText
      },
      monthlyGrowthRate: +monthlyRate.toFixed(4),
      sixMonthGrowthRate: +(sixMonthRate * 100).toFixed(1),
      confidenceIntervalPct: month6Uncertainty,
      volatilityScore,
      volatilityLevel,
      volatilityDescription,
      points
    };
  });
}

/**
 * Computes projected 6-month rank evolution for an individual keyword row.
 */
export function calculateKeywordTrendProjection(
  item: CompetitorKeywordRanking,
  profiles: CompetitorGrowthProfile[]
): KeywordTrendProjection {
  const vol = parseInt(item.monthlyVolume?.replace(/[^0-9]/g, "") || "1000", 10);
  const monthlyVolume = isNaN(vol) ? 1000 : vol;
  const userRank = item.userRank ?? 20;
  const comp1Rank = item.comp1Rank ?? 20;
  const comp2Rank = item.comp2Rank ?? 20;
  const comp3Rank = item.comp3Rank ?? 20;

  const userProfile = profiles.find((p) => p.id === "user");
  const comp1Profile = profiles.find((p) => p.id === "comp1");
  const comp2Profile = profiles.find((p) => p.id === "comp2");
  const comp3Profile = profiles.find((p) => p.id === "comp3");

  const userMonthlyRate = userProfile?.monthlyGrowthRate ?? 0.025;
  const comp1MonthlyRate = comp1Profile?.monthlyGrowthRate ?? 0.012;
  const comp2MonthlyRate = comp2Profile?.monthlyGrowthRate ?? 0.006;
  const comp3MonthlyRate = comp3Profile?.monthlyGrowthRate ?? -0.004;

  const userVolatility = (userProfile?.volatilityScore ?? 7.0) / 100;

  const points = FORECAST_MONTHS.map((m) => {
    const idx = m.index;
    const projectRank = (current: number, rate: number) => {
      // Faster growth decreases rank number (improving position towards #1)
      const rankShift = rate * 20 * (idx / 6);
      return Math.max(1, Math.min(50, Math.round(current - rankShift)));
    };

    const curUserRank = idx === 0 ? userRank : projectRank(userRank, userMonthlyRate);
    const curComp1Rank = idx === 0 ? comp1Rank : projectRank(comp1Rank, comp1MonthlyRate);
    const curComp2Rank = idx === 0 ? comp2Rank : projectRank(comp2Rank, comp2MonthlyRate);
    const curComp3Rank = idx === 0 ? comp3Rank : projectRank(comp3Rank, comp3MonthlyRate);

    // Approximate CTR model based on rank
    const getCtr = (r: number) => {
      if (r === 1) return 0.32;
      if (r === 2) return 0.17;
      if (r === 3) return 0.11;
      if (r <= 5) return 0.06;
      if (r <= 10) return 0.025;
      return 0.008;
    };

    const userEstClicks = Math.round(monthlyVolume * getCtr(curUserRank));

    // Confidence interval for keyword rank: expanding cone of uncertainty
    const timeFactor = idx === 0 ? 0 : Math.sqrt(idx);
    const rankError = idx === 0 ? 0 : Math.max(0.4, Math.round(curUserRank * userVolatility * timeFactor * 0.8));
    const lowerUserRank = Math.max(1, curUserRank - rankError); // best case
    const upperUserRank = curUserRank + rankError; // worst case

    const lowerClicks = Math.round(monthlyVolume * getCtr(upperUserRank));
    const upperClicks = Math.round(monthlyVolume * getCtr(lowerUserRank));

    return {
      monthIndex: idx,
      monthLabel: m.label,
      userRank: curUserRank,
      comp1Rank: curComp1Rank,
      comp2Rank: curComp2Rank,
      comp3Rank: curComp3Rank,
      userEstClicks,
      lowerUserRank,
      upperUserRank,
      lowerClicks,
      upperClicks
    };
  });

  const projectedUserRankM6 = points[6].userRank;
  const rankDelta = userRank - projectedUserRankM6;
  const trendDirection: "up" | "down" | "stable" =
    rankDelta > 0 ? "up" : rankDelta < 0 ? "down" : "stable";

  const projectedUserGrowthPct = +(
    ((points[6].userEstClicks - points[0].userEstClicks) / Math.max(1, points[0].userEstClicks)) * 100
  ).toFixed(1);

  // Who holds the best position at Month 6?
  const finalRanks = [
    { id: "user" as const, rank: points[6].userRank },
    { id: "comp1" as const, rank: points[6].comp1Rank },
    { id: "comp2" as const, rank: points[6].comp2Rank },
    { id: "comp3" as const, rank: points[6].comp3Rank },
  ];
  finalRanks.sort((a, b) => a.rank - b.rank);
  const winningEntity = finalRanks[0].id;

  return {
    keywordId: item.id,
    keyword: item.keyword,
    monthlyVolume,
    userRank,
    comp1Rank,
    comp2Rank,
    comp3Rank,
    projectedUserRankM6,
    projectedUserGrowthPct,
    trendDirection,
    winningEntity,
    points
  };
}
