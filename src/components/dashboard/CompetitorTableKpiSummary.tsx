import React, { useMemo, useState } from "react";
import {
  Globe,
  TrendingUp,
  Award,
  Search,
  Gauge,
  Info,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  FileDown
} from "lucide-react";
import { CompetitorKeywordRanking, CompetitorContentMetric } from "../../types";

export interface CompetitorTableKpiSummaryProps {
  /** The currently displayed rankings in the table (filtered and sorted) */
  rankings: CompetitorKeywordRanking[];
  /** The list of competitors configured for the domain */
  competitors?: CompetitorContentMetric[];
  /** Active entity filter: 'all' | 'top5_overall' | 'comp1' | 'comp2' | 'comp3' */
  topEntityFilter?: string;
  /** Active company name search string if filtered */
  competitorCompanySearch?: string;
  /** User's website name */
  userName?: string;
  /** User's website domain */
  userDomain?: string;
  /** Live PageSpeed scores if loaded */
  livePageSpeedScoresMap?: Map<string, any>;
  /** Optional container class names */
  className?: string;
  /** Optional callback to trigger export to PDF */
  onExportPdf?: () => void;
}

export interface CompetitorKpiSummaryStats {
  displayedCount: number;
  activeCompetitorsCount: number;
  avgDomainAuthority: number;
  minDomainAuthority: number;
  maxDomainAuthority: number;
  userDomainAuthority: number;
  daDifference: number;
  totalCompetitorTraffic: number;
  avgCompetitorTraffic: number;
  avgTrafficPerKeyword: number;
  userEstimatedTraffic: number;
  avgCompetitorRank: number;
  avgUserRank: number;
  competitorTop3Share: number;
  totalMonthlyVolume: number;
  avgMonthlyVolume: number;
  avgDifficulty: number;
  avgSpeedScore: number;
  userSpeedScore: number;
  speedDifference: number;
  competitorTrafficBreakdown: { name: string; domain: string; traffic: number; da: number; avgRank: number }[];
}

/**
 * Standard Google SERP Organic Click-Through Rate (CTR) curve by position
 */
export function getCompetitorCtr(rank: number | null | undefined): number {
  if (!rank || rank <= 0 || rank > 20) return 0;
  if (rank === 1) return 0.316;
  if (rank === 2) return 0.178;
  if (rank === 3) return 0.106;
  if (rank === 4) return 0.072;
  if (rank === 5) return 0.052;
  if (rank === 6) return 0.039;
  if (rank === 7) return 0.031;
  if (rank === 8) return 0.024;
  if (rank === 9) return 0.019;
  if (rank === 10) return 0.014;
  return 0.007; // positions 11-20
}

/**
 * Parses numeric search volume from strings like "18.400 / ay" or "5000"
 */
export function parseMonthlyVolume(val: string | undefined): number {
  if (!val) return 0;
  const digits = val.replace(/[^0-9]/g, "");
  return digits.length > 0 ? parseInt(digits, 10) : 0;
}

/**
 * Formats a number nicely for display (e.g. 14200 -> "14.2K" or "14,200")
 */
export function formatNumberCompact(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1).replace(".", ",")}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1).replace(".", ",")}K`;
  }
  return num.toLocaleString("tr-TR");
}

/**
 * Calculates aggregated KPI stats for given rankings and competitors
 */
export function calculateAggregatedKpiStats(
  rankings: CompetitorKeywordRanking[] = [],
  activeCompetitors: CompetitorContentMetric[] = [],
  livePageSpeedScoresMap?: Map<string, any>,
  userName: string = "Siteniz"
): CompetitorKpiSummaryStats {
  const displayedCount = rankings.length;
  const userDomainAuthority = 64;
  const userSpeedScore = 94;

  if (displayedCount === 0 || activeCompetitors.length === 0) {
    return {
      displayedCount: 0,
      activeCompetitorsCount: activeCompetitors.length,
      avgDomainAuthority: 0,
      minDomainAuthority: 0,
      maxDomainAuthority: 0,
      userDomainAuthority,
      daDifference: 0,
      totalCompetitorTraffic: 0,
      avgCompetitorTraffic: 0,
      avgTrafficPerKeyword: 0,
      userEstimatedTraffic: 0,
      avgCompetitorRank: 0,
      avgUserRank: 0,
      competitorTop3Share: 0,
      totalMonthlyVolume: 0,
      avgMonthlyVolume: 0,
      avgDifficulty: 0,
      avgSpeedScore: 0,
      userSpeedScore,
      speedDifference: 0,
      competitorTrafficBreakdown: []
    };
  }

  // A. Domain Authority (DA / Visibility Score) calculation
  const daValues: number[] = activeCompetitors.map((c, idx) => {
    const directDA = (c as any).domainAuthority;
    if (typeof directDA === "number" && directDA > 0) return directDA;
    if (typeof c.visibilityScore === "number" && c.visibilityScore > 0) return c.visibilityScore;
    return idx === 0 ? 92 : idx === 1 ? 85 : 78;
  });

  const sumDA = daValues.reduce((acc, v) => acc + v, 0);
  const avgDomainAuthority = Math.round((sumDA / daValues.length) * 10) / 10;
  const minDomainAuthority = Math.min(...daValues);
  const maxDomainAuthority = Math.max(...daValues);
  const daDifference = Math.round((avgDomainAuthority - userDomainAuthority) * 10) / 10;

  // B. Organic Traffic calculation across currently displayed keywords
  let comp1TotalTraffic = 0;
  let comp2TotalTraffic = 0;
  let comp3TotalTraffic = 0;
  let userTotalTraffic = 0;

  let comp1RankSum = 0;
  let comp1RankCount = 0;
  let comp2RankSum = 0;
  let comp2RankCount = 0;
  let comp3RankSum = 0;
  let comp3RankCount = 0;

  let userRankSum = 0;
  let userRankCount = 0;

  let totalCompetitorTop3Keywords = 0;
  let totalKeywordsTested = 0;

  let sumVolume = 0;
  let sumDifficulty = 0;

  rankings.forEach((r) => {
    const vol = parseMonthlyVolume(r.monthlyVolume) || 1200;
    sumVolume += vol;
    sumDifficulty += r.difficulty ?? 35;

    // User traffic
    if (r.userRank !== null && r.userRank > 0 && r.userRank <= 20) {
      userTotalTraffic += vol * getCompetitorCtr(r.userRank);
      userRankSum += r.userRank;
      userRankCount++;
    }

    let hasCompInTop3 = false;

    // Competitor 1
    if (r.comp1Rank !== null && r.comp1Rank > 0 && r.comp1Rank <= 20) {
      comp1TotalTraffic += vol * getCompetitorCtr(r.comp1Rank);
      comp1RankSum += r.comp1Rank;
      comp1RankCount++;
      if (r.comp1Rank <= 3) hasCompInTop3 = true;
    }

    // Competitor 2
    if (r.comp2Rank !== null && r.comp2Rank > 0 && r.comp2Rank <= 20) {
      comp2TotalTraffic += vol * getCompetitorCtr(r.comp2Rank);
      comp2RankSum += r.comp2Rank;
      comp2RankCount++;
      if (r.comp2Rank <= 3) hasCompInTop3 = true;
    }

    // Competitor 3
    if (r.comp3Rank !== null && r.comp3Rank > 0 && r.comp3Rank <= 20) {
      comp3TotalTraffic += vol * getCompetitorCtr(r.comp3Rank);
      comp3RankSum += r.comp3Rank;
      comp3RankCount++;
      if (r.comp3Rank <= 3) hasCompInTop3 = true;
    }

    if (hasCompInTop3) {
      totalCompetitorTop3Keywords++;
    }
    totalKeywordsTested++;
  });

  // Build competitor breakdown based on active competitors
  const competitorTrafficBreakdown: { name: string; domain: string; traffic: number; da: number; avgRank: number }[] = [];

  activeCompetitors.forEach((c, idx) => {
    let t = 0;
    let avgRk = 0;
    if (idx === 0) {
      t = Math.round(comp1TotalTraffic);
      avgRk = comp1RankCount > 0 ? Math.round((comp1RankSum / comp1RankCount) * 10) / 10 : 3.8;
    } else if (idx === 1) {
      t = Math.round(comp2TotalTraffic);
      avgRk = comp2RankCount > 0 ? Math.round((comp2RankSum / comp2RankCount) * 10) / 10 : 4.4;
    } else {
      t = Math.round(comp3TotalTraffic);
      avgRk = comp3RankCount > 0 ? Math.round((comp3RankSum / comp3RankCount) * 10) / 10 : 5.1;
    }

    competitorTrafficBreakdown.push({
      name: c.name,
      domain: c.domain,
      traffic: t,
      da: daValues[idx] || 75,
      avgRank: avgRk
    });
  });

  const totalCompetitorTraffic = competitorTrafficBreakdown.reduce((acc, c) => acc + c.traffic, 0);
  const avgCompetitorTraffic = activeCompetitors.length > 0
    ? Math.round(totalCompetitorTraffic / activeCompetitors.length)
    : 0;
  const avgTrafficPerKeyword = displayedCount > 0
    ? Math.round(totalCompetitorTraffic / displayedCount)
    : 0;

  // C. Competitor Average SERP Rank calculation
  const allCompRankSums = comp1RankSum + comp2RankSum + comp3RankSum;
  const allCompRankCounts = comp1RankCount + comp2RankCount + comp3RankCount;
  const avgCompetitorRank = allCompRankCounts > 0
    ? Math.round((allCompRankSums / allCompRankCounts) * 10) / 10
    : 3.9;

  const avgUserRank = userRankCount > 0
    ? Math.round((userRankSum / userRankCount) * 10) / 10
    : 5.2;

  const competitorTop3Share = totalKeywordsTested > 0
    ? Math.round((totalCompetitorTop3Keywords / totalKeywordsTested) * 100)
    : 0;

  // D. Search Volume & Difficulty
  const avgMonthlyVolume = Math.round(sumVolume / displayedCount);
  const avgDifficulty = Math.round((sumDifficulty / displayedCount) * 10) / 10;

  // E. PageSpeed / Core Web Vitals
  const speedScores = activeCompetitors.map((c) => {
    const live = livePageSpeedScoresMap?.get(c.id) || livePageSpeedScoresMap?.get(c.domain.toLowerCase());
    if (live && typeof live.performanceScore === "number") {
      return live.performanceScore;
    }
    return c.speedScore || 76;
  });
  const sumSpeed = speedScores.reduce((acc, s) => acc + s, 0);
  const avgSpeedScore = Math.round((sumSpeed / (speedScores.length || 1)) * 10) / 10;
  const speedDifference = Math.round((userSpeedScore - avgSpeedScore) * 10) / 10;

  return {
    displayedCount,
    activeCompetitorsCount: activeCompetitors.length,
    avgDomainAuthority,
    minDomainAuthority,
    maxDomainAuthority,
    userDomainAuthority,
    daDifference,
    totalCompetitorTraffic,
    avgCompetitorTraffic,
    avgTrafficPerKeyword,
    userEstimatedTraffic: Math.round(userTotalTraffic),
    avgCompetitorRank,
    avgUserRank,
    competitorTop3Share,
    totalMonthlyVolume: sumVolume,
    avgMonthlyVolume,
    avgDifficulty,
    avgSpeedScore,
    userSpeedScore,
    speedDifference,
    competitorTrafficBreakdown
  };
}

export const CompetitorTableKpiSummary: React.FC<CompetitorTableKpiSummaryProps> = ({
  rankings = [],
  competitors = [],
  topEntityFilter = "all",
  competitorCompanySearch = "",
  userName = "Siteniz",
  userDomain = "sitemiz.com.tr",
  livePageSpeedScoresMap,
  className = "",
  onExportPdf
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // 1. Determine active displayed competitors
  const activeCompetitors = useMemo(() => {
    const defaultComps: CompetitorContentMetric[] = [
      {
        id: "comp1",
        name: competitors[0]?.name || "1. Rakip",
        domain: competitors[0]?.domain || "rakip1.com",
        rank: 1,
        visibilityScore: competitors[0]?.visibilityScore || 92,
        avgWordCount: competitors[0]?.avgWordCount || 1850,
        indexedPages: competitors[0]?.indexedPages || 84,
        topKeywordReach: competitors[0]?.topKeywordReach || 320,
        speedScore: competitors[0]?.speedScore || 78,
        schemaScore: competitors[0]?.schemaScore || 88,
        backlinkSignals: "Güçlü",
        contentVelocity: "Haftalık 3+",
        keyStrengths: ["1500+ kelimelik rehberler", "Yüksek DA Backlink"],
        weaknesses: ["Mobil sayfa hızı", "Şema işaretlemesi eksik"]
      },
      {
        id: "comp2",
        name: competitors[1]?.name || "2. Rakip",
        domain: competitors[1]?.domain || "rakip2.com",
        rank: 2,
        visibilityScore: competitors[1]?.visibilityScore || 85,
        avgWordCount: competitors[1]?.avgWordCount || 1420,
        indexedPages: competitors[1]?.indexedPages || 65,
        topKeywordReach: competitors[1]?.topKeywordReach || 280,
        speedScore: competitors[1]?.speedScore || 72,
        schemaScore: competitors[1]?.schemaScore || 82,
        backlinkSignals: "Güçlü",
        contentVelocity: "Haftalık 1-2",
        keyStrengths: ["Görsel optimizasyon", "Lokal alıntılar"],
        weaknesses: ["Site mimarisi", "Yinelenen içerikler"]
      },
      {
        id: "comp3",
        name: competitors[2]?.name || "3. Rakip",
        domain: competitors[2]?.domain || "rakip3.com",
        rank: 3,
        visibilityScore: competitors[2]?.visibilityScore || 78,
        avgWordCount: competitors[2]?.avgWordCount || 1180,
        indexedPages: competitors[2]?.indexedPages || 48,
        topKeywordReach: competitors[2]?.topKeywordReach || 210,
        speedScore: competitors[2]?.speedScore || 81,
        schemaScore: competitors[2]?.schemaScore || 75,
        backlinkSignals: "Orta",
        contentVelocity: "Aylık",
        keyStrengths: ["Sosyal medya entegrasyonu"],
        weaknesses: ["Teknik SEO", "Düşük DA"]
      }
    ];

    const sourceComps = competitors.length > 0 ? competitors : defaultComps;

    // Filter by topEntityFilter if specific competitor selected
    let filtered = sourceComps;
    if (topEntityFilter === "comp1") {
      filtered = [sourceComps[0] || defaultComps[0]];
    } else if (topEntityFilter === "comp2") {
      filtered = [sourceComps[1] || defaultComps[1]];
    } else if (topEntityFilter === "comp3") {
      filtered = [sourceComps[2] || defaultComps[2]];
    }

    // Filter by competitor company search if active
    if (competitorCompanySearch && competitorCompanySearch.trim()) {
      const q = competitorCompanySearch.trim().toLowerCase();
      const matched = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.domain.toLowerCase().includes(q)
      );
      if (matched.length > 0) filtered = matched;
    }

    return filtered;
  }, [competitors, topEntityFilter, competitorCompanySearch]);

  // 2. Aggregate metrics for currently displayed competitors & rankings
  const aggregatedStats = useMemo(() => {
    return calculateAggregatedKpiStats(rankings, activeCompetitors, livePageSpeedScoresMap, userName);
  }, [rankings, activeCompetitors, livePageSpeedScoresMap, userName]);

  return (
    <div
      id="competitor-table-kpi-summary-cards"
      data-testid="competitor-table-kpi-summary-cards"
      className={`rounded-3xl bg-slate-900 text-white border border-slate-800/90 shadow-xl overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* 1. Header Bar: Title, Context Badges & Collapse Toggle */}
      <div className="p-4 sm:px-6 sm:py-3.5 bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 flex items-center justify-center font-black shadow-xs">
            <Layers className="w-4 h-4 text-indigo-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs sm:text-sm font-black text-white tracking-tight flex items-center gap-1.5">
                <span>Görüntülenen Rakipler Toplam Ortalamaları</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Canlı SERP Özeti
                </span>
              </h4>
            </div>
            <p className="text-[11px] text-slate-400">
              Şu an tabloda listelenen{" "}
              <strong className="text-slate-200 font-mono">{aggregatedStats.displayedCount}</strong> anahtar kelime ve{" "}
              <strong className="text-slate-200 font-mono">{aggregatedStats.activeCompetitorsCount}</strong> rakip bazında hesaplanan ortalamalar.
            </p>
          </div>
        </div>

        {/* Dynamic Context & Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Active Competitors Indicator Tags */}
          <div className="hidden md:flex items-center gap-1.5 text-[10px]">
            {activeCompetitors.slice(0, 3).map((c, i) => (
              <span
                key={c.id || i}
                className="px-2 py-0.5 rounded-md bg-slate-800/90 text-slate-300 border border-slate-700 font-medium truncate max-w-[130px]"
                title={`${c.name} (${c.domain})`}
              >
                {c.name.split(" ")[0]}
              </span>
            ))}
          </div>

          {/* Export to PDF Button */}
          {onExportPdf && (
            <button
              type="button"
              id="btn-kpi-summary-export-pdf"
              data-testid="btn-kpi-summary-export-pdf"
              data-action="export-kpi-pdf"
              onClick={onExportPdf}
              className="px-3 py-1 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-rose-400/40 shadow-xs active:scale-95"
              title="Görüntülenen KPI özet kartlarını ve filtrelenmiş tablo verilerini içeren profesyonel PDF raporunu indirin"
              aria-label="Export to PDF"
            >
              <FileDown className="w-3.5 h-3.5 text-rose-100" />
              <span>Export to PDF</span>
            </button>
          )}

          {/* Toggle Expand / Compact View Button */}
          <button
            type="button"
            id="btn-toggle-kpi-summary-cards"
            data-testid="btn-toggle-kpi-summary-cards"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer border border-slate-700 shadow-2xs"
            title={isExpanded ? "KPI kartlarını daralt" : "KPI kartlarını genişlet"}
            aria-expanded={isExpanded}
          >
            <span>{isExpanded ? "Daralt" : "Genişlet"}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. KPI Cards Grid Body */}
      {isExpanded && (
        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            
            {/* KPI CARD 1: ORTALAMA DOMAIN OTORİTESİ (AVERAGE DOMAIN AUTHORITY) */}
            <div
              id="kpi-card-avg-domain-authority"
              data-testid="kpi-card-avg-domain-authority"
              className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 hover:border-indigo-500/50 transition-all shadow-sm space-y-2 group relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                  <span>Ortalama Domain Otoritesi</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold border border-indigo-500/30">
                  DA Skoru
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                  {aggregatedStats.avgDomainAuthority > 0 ? `${aggregatedStats.avgDomainAuthority}` : "-"}
                </span>
                <span className="text-xs text-slate-400 font-medium">/ 100 DA</span>
              </div>

              {/* Benchmark comparison against user's site */}
              <div className="pt-2 border-t border-slate-700/70 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1 text-slate-400">
                  <span>{userName}:</span>
                  <strong className="text-slate-200 font-mono">{aggregatedStats.userDomainAuthority} DA</strong>
                </div>
                <span
                  className={`font-mono font-bold px-1.5 py-0.2 rounded text-[10px] flex items-center gap-0.5 ${
                    aggregatedStats.daDifference > 0
                      ? "text-amber-300 bg-amber-500/20 border border-amber-500/30"
                      : "text-emerald-300 bg-emerald-500/20 border border-emerald-500/30"
                  }`}
                  title={
                    aggregatedStats.daDifference > 0
                      ? "Rakiplerin domain otoritesi sitenizden daha yüksek"
                      : "Sitenizin domain otoritesi rakiplerin önünde"
                  }
                >
                  {aggregatedStats.daDifference > 0 ? (
                    <>
                      <ArrowUpRight className="w-3 h-3" />
                      +{aggregatedStats.daDifference} Rakip
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Siteniz Önde
                    </>
                  )}
                </span>
              </div>

              {/* Range indicator */}
              <div className="text-[10px] text-slate-400 flex items-center justify-between pt-0.5">
                <span>Rakip Aralığı:</span>
                <span className="font-mono text-slate-300">
                  Min {aggregatedStats.minDomainAuthority} - Maks {aggregatedStats.maxDomainAuthority} DA
                </span>
              </div>
            </div>

            {/* KPI CARD 2: ORTALAMA ORGANİK TRAFİK (AVERAGE ORGANIC TRAFFIC) */}
            <div
              id="kpi-card-avg-organic-traffic"
              data-testid="kpi-card-avg-organic-traffic"
              className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 hover:border-emerald-500/50 transition-all shadow-sm space-y-2 group relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span>Ortalama Organik Trafik</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/30">
                  Aylık Ziyaretçi
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight">
                  ~{formatNumberCompact(aggregatedStats.avgCompetitorTraffic)}
                </span>
                <span className="text-xs text-slate-400 font-medium">/ rakip</span>
              </div>

              {/* Total competitor traffic across displayed keywords */}
              <div className="pt-2 border-t border-slate-700/70 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1 text-slate-400">
                  <span>Toplam Hacim:</span>
                  <strong className="text-slate-200 font-mono">
                    ~{formatNumberCompact(aggregatedStats.totalCompetitorTraffic)}
                  </strong>
                </div>
                <span className="text-[10px] text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-1.5 py-0.2 rounded font-mono font-bold">
                  ~{formatNumberCompact(aggregatedStats.avgTrafficPerKeyword)} / kelime
                </span>
              </div>

              {/* Siteniz estimated organic traffic benchmark */}
              <div className="text-[10px] text-slate-400 flex items-center justify-between pt-0.5">
                <span>{userName} Tahmini:</span>
                <span className="font-mono text-indigo-300 font-bold">
                  ~{formatNumberCompact(aggregatedStats.userEstimatedTraffic)} / ay
                </span>
              </div>
            </div>

            {/* KPI CARD 3: ORTALAMA RAKİP SIRALAMASI (AVERAGE COMPETITOR SERP RANK) */}
            <div
              id="kpi-card-avg-competitor-rank"
              data-testid="kpi-card-avg-competitor-rank"
              className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 hover:border-amber-500/50 transition-all shadow-sm space-y-2 group relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span>Ortalama Rakip Sırası</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/30">
                  Google SERP
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tracking-tight">
                  #{aggregatedStats.avgCompetitorRank > 0 ? aggregatedStats.avgCompetitorRank : "-"}
                </span>
                <span className="text-xs text-slate-400 font-medium">ortalama pozisyon</span>
              </div>

              {/* Podyum / Top 3 Share */}
              <div className="pt-2 border-t border-slate-700/70 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1 text-slate-400">
                  <span>Podyum (Top 3):</span>
                  <strong className="text-amber-300 font-mono">%{aggregatedStats.competitorTop3Share}</strong>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  Siteniz: <strong className="text-white">#{aggregatedStats.avgUserRank}</strong>
                </span>
              </div>

              {/* Comparison badge */}
              <div className="text-[10px] text-slate-400 flex items-center justify-between pt-0.5">
                <span>SERP Üstünlüğü:</span>
                <span className="font-mono text-amber-300 font-bold">
                  {aggregatedStats.avgUserRank <= aggregatedStats.avgCompetitorRank
                    ? "🏆 Siteniz Önde"
                    : `⚠️ Rakipler +${(aggregatedStats.avgUserRank - aggregatedStats.avgCompetitorRank).toFixed(1)} sıra önde`}
                </span>
              </div>
            </div>

            {/* KPI CARD 4: ORTALAMA ARAMA HACMİ & SEO ZORLUĞU (AVERAGE SEARCH VOLUME & DIFFICULTY) */}
            <div
              id="kpi-card-avg-search-volume"
              data-testid="kpi-card-avg-search-volume"
              className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 hover:border-violet-500/50 transition-all shadow-sm space-y-2 group relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <Search className="w-4 h-4 text-violet-400 group-hover:scale-110 transition-transform" />
                  <span>Ortalama Arama Hacmi</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-[10px] font-mono font-bold border border-violet-500/30">
                  Aylık Potansiyel
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                  ~{formatNumberCompact(aggregatedStats.avgMonthlyVolume)}
                </span>
                <span className="text-xs text-slate-400 font-medium">/ kelime hacmi</span>
              </div>

              {/* SEO Difficulty KD */}
              <div className="pt-2 border-t border-slate-700/70 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1 text-slate-400">
                  <span>Ort. SEO Zorluğu:</span>
                  <strong className="text-slate-200 font-mono">KD {aggregatedStats.avgDifficulty}</strong>
                </div>
                <span className="text-[10px] text-violet-300 bg-violet-500/20 border border-violet-500/30 px-1.5 py-0.2 rounded font-bold">
                  {aggregatedStats.avgDifficulty > 50 ? "Yüksek" : aggregatedStats.avgDifficulty > 30 ? "Orta" : "Düşük"}
                </span>
              </div>

              {/* Total Volume Across Displayed */}
              <div className="text-[10px] text-slate-400 flex items-center justify-between pt-0.5">
                <span>Görüntülenen Toplam:</span>
                <span className="font-mono text-slate-300 font-bold">
                  ~{formatNumberCompact(aggregatedStats.totalMonthlyVolume)} / ay
                </span>
              </div>
            </div>

          </div>

          {/* 3. Granular Competitor Breakdown Strip (Shows per-competitor contribution) */}
          {aggregatedStats.competitorTrafficBreakdown.length > 1 && (
            <div
              id="kpi-competitor-breakdown-strip"
              data-testid="kpi-competitor-breakdown-strip"
              className="mt-3.5 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5 text-xs"
            >
              <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-bold text-slate-300">Görüntülenen Rakip Dağılımı:</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {aggregatedStats.competitorTrafficBreakdown.map((c, idx) => (
                  <div
                    key={c.domain || idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800/80 border border-slate-700 text-[11px]"
                    title={`${c.name} (${c.domain}) - Ortalama Sıra: #${c.avgRank}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    <span className="font-semibold text-slate-200">{c.name.split(" ")[0]}:</span>
                    <span className="font-mono text-emerald-300 font-bold">~{formatNumberCompact(c.traffic)}/ay</span>
                    <span className="text-slate-500">•</span>
                    <span className="font-mono text-indigo-300">{c.da} DA</span>
                  </div>
                ))}

                {/* Siteniz Summary Chip */}
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-950/80 border border-indigo-500/50 text-[11px]"
                  title={`${userName} (${userDomain}) - Sitenizin tahmini toplam organik trafiği`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span className="font-bold text-amber-300">{userName}:</span>
                  <span className="font-mono text-white font-bold">
                    ~{formatNumberCompact(aggregatedStats.userEstimatedTraffic)}/ay
                  </span>
                  <span className="text-indigo-400">•</span>
                  <span className="font-mono text-amber-300">{aggregatedStats.userDomainAuthority} DA</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
