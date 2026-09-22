import React from "react";
import { CompetitorKeywordRanking } from "../../types";
import {
  Flame,
  Trophy,
  AlertTriangle,
  SlidersHorizontal,
  Eye,
  EyeOff,
  Sparkles,
  TrendingUp,
  TrendingDown,
  X,
  Layers,
  Zap,
  Info,
  Check
} from "lucide-react";

export type HeatmapMetricFocus = "all" | "ranks" | "gap" | "volume_kd";
export type HeatmapPalette = "classic" | "emerald_rose" | "cool_warm";
export type HeatmapIntensity = "subtle" | "medium" | "vibrant";

export interface RowHeatmapResult {
  itemId: string;
  // Rank performance scores: 0 (worst) to 100 (best)
  userScore: number;
  comp1Score: number;
  comp2Score: number;
  comp3Score: number;
  // Best and worst ranks in this specific keyword row
  bestRank: number;
  worstRank: number;
  bestEntities: ("user" | "comp1" | "comp2" | "comp3")[];
  worstEntities: ("user" | "comp1" | "comp2" | "comp3")[];
  isUserBest: boolean;
  isUserWorst: boolean;
  isComp1Best: boolean;
  isComp1Worst: boolean;
  isComp2Best: boolean;
  isComp2Worst: boolean;
  isComp3Best: boolean;
  isComp3Worst: boolean;
  // Volume comparisons
  volumeNum: number;
  volumePercentile: number;
  isTableMaxVolume: boolean;
  isTableMinVolume: boolean;
  // Difficulty comparisons
  difficultyNum: number;
  difficultyPercentile: number;
  isTableMaxDifficulty: boolean;
  isTableMinDifficulty: boolean;
  // Gap comparisons
  gapNum: number;
  isTableMaxGap: boolean;
  isTableMinGap: boolean;
  // Performance gap vs row average rank
  avgRankInRow: number;
  userRankDeltaVsAvg: number;
}

export interface TableHeatmapStats {
  totalKeywords: number;
  userLeaderCount: number;
  comp1LeaderCount: number;
  comp2LeaderCount: number;
  comp3LeaderCount: number;
  avgUserRank: number;
  avgGap: number;
  maxVolumeKeyword: string;
  maxVolumeVal: number;
  easiestKeyword: string;
  easiestKdVal: number;
}

/**
 * Parses numeric volume from text like "18.400 / ay"
 */
function parseVolume(val?: string): number {
  if (!val) return 0;
  const cleaned = val.replace(/[^0-9]/g, "");
  return cleaned ? parseInt(cleaned, 10) : 0;
}

/**
 * Normalizes rank into 0-100 score where #1 is 100, rank 25 or unranked is 0
 */
function rankToScore(rank: number | null): number {
  if (rank === null || rank <= 0) return 0;
  // 1 is 100%, 2 is 95%, 3 is 90%, 10 is 60%, 20 is 20%, 25+ is 0%
  const clamped = Math.min(25, rank);
  return Math.max(0, Math.round(((25 - clamped) / 24) * 100));
}

/**
 * Computes heatmap metrics for all rows and across the entire table
 */
export function computeTableHeatmap(rankings: CompetitorKeywordRanking[]): {
  heatmapMap: Map<string, RowHeatmapResult>;
  stats: TableHeatmapStats;
} {
  const heatmapMap = new Map<string, RowHeatmapResult>();

  if (!rankings || rankings.length === 0) {
    return {
      heatmapMap,
      stats: {
        totalKeywords: 0,
        userLeaderCount: 0,
        comp1LeaderCount: 0,
        comp2LeaderCount: 0,
        comp3LeaderCount: 0,
        avgUserRank: 0,
        avgGap: 0,
        maxVolumeKeyword: "-",
        maxVolumeVal: 0,
        easiestKeyword: "-",
        easiestKdVal: 0
      }
    };
  }

  // 1. Calculate global table bounds (volume, kd, gap)
  const volumes = rankings.map((r) => parseVolume(r.monthlyVolume));
  const maxVol = Math.max(...volumes, 1);
  const minVol = Math.min(...volumes, 0);

  const difficulties = rankings.map((r) => r.difficulty ?? 0);
  const maxKd = Math.max(...difficulties, 1);
  const minKd = Math.min(...difficulties, 0);

  const gaps = rankings.map((r) => r.gap ?? 0);
  const maxGap = Math.max(...gaps);
  const minGap = Math.min(...gaps);

  let userLeaders = 0;
  let comp1Leaders = 0;
  let comp2Leaders = 0;
  let comp3Leaders = 0;
  let totalUserRank = 0;
  let userRankCount = 0;
  let totalGap = 0;

  let maxVolKw = "";
  let maxVolAmount = -1;
  let minKdKw = "";
  let minKdAmount = 999;

  // 2. Process each keyword row
  rankings.forEach((item) => {
    const userRankVal = item.userRank !== null ? item.userRank : 25;
    const comp1RankVal = item.comp1Rank !== null && item.comp1Rank > 0 ? item.comp1Rank : 25;
    const comp2RankVal = item.comp2Rank !== null && item.comp2Rank > 0 ? item.comp2Rank : 25;
    const comp3RankVal = item.comp3Rank !== null && item.comp3Rank > 0 ? item.comp3Rank : 25;

    const rankList = [
      { entity: "user" as const, rank: userRankVal },
      { entity: "comp1" as const, rank: comp1RankVal },
      { entity: "comp2" as const, rank: comp2RankVal },
      { entity: "comp3" as const, rank: comp3RankVal }
    ];

    // Find min rank (best: lowest number e.g. 1)
    const numericalRanks = rankList.map((r) => r.rank);
    const bestRank = Math.min(...numericalRanks);
    const worstRank = Math.max(...numericalRanks);

    const bestEntities = rankList.filter((r) => r.rank === bestRank).map((r) => r.entity);
    const worstEntities = rankList.filter((r) => r.rank === worstRank).map((r) => r.entity);

    if (bestEntities.includes("user")) userLeaders++;
    if (bestEntities.includes("comp1")) comp1Leaders++;
    if (bestEntities.includes("comp2")) comp2Leaders++;
    if (bestEntities.includes("comp3")) comp3Leaders++;

    if (item.userRank !== null) {
      totalUserRank += item.userRank;
      userRankCount++;
    }
    totalGap += item.gap ?? 0;

    const vol = parseVolume(item.monthlyVolume);
    if (vol > maxVolAmount) {
      maxVolAmount = vol;
      maxVolKw = item.keyword;
    }

    const kd = item.difficulty ?? 0;
    if (kd < minKdAmount && kd > 0) {
      minKdAmount = kd;
      minKdKw = item.keyword;
    }

    const avgRankInRow =
      (userRankVal + comp1RankVal + comp2RankVal + comp3RankVal) / 4;
    const userRankDeltaVsAvg = Math.round(avgRankInRow - userRankVal);

    const volumePercentile =
      maxVol > minVol ? Math.round(((vol - minVol) / (maxVol - minVol)) * 100) : 50;

    const difficultyPercentile =
      maxKd > minKd ? Math.round(((kd - minKd) / (maxKd - minKd)) * 100) : 50;

    heatmapMap.set(item.id, {
      itemId: item.id,
      userScore: rankToScore(item.userRank),
      comp1Score: rankToScore(item.comp1Rank),
      comp2Score: rankToScore(item.comp2Rank),
      comp3Score: rankToScore(item.comp3Rank),
      bestRank,
      worstRank,
      bestEntities,
      worstEntities,
      isUserBest: bestEntities.includes("user"),
      isUserWorst: worstEntities.includes("user") && worstRank > bestRank,
      isComp1Best: bestEntities.includes("comp1"),
      isComp1Worst: worstEntities.includes("comp1") && worstRank > bestRank,
      isComp2Best: bestEntities.includes("comp2"),
      isComp2Worst: worstEntities.includes("comp2") && worstRank > bestRank,
      isComp3Best: bestEntities.includes("comp3"),
      isComp3Worst: worstEntities.includes("comp3") && worstRank > bestRank,
      volumeNum: vol,
      volumePercentile,
      isTableMaxVolume: vol === maxVol && vol > 0,
      isTableMinVolume: vol === minVol && volumes.length > 1,
      difficultyNum: kd,
      difficultyPercentile,
      isTableMaxDifficulty: kd === maxKd && kd > 0,
      isTableMinDifficulty: kd === minKd && difficulties.length > 1,
      gapNum: item.gap ?? 0,
      isTableMaxGap: (item.gap ?? 0) === maxGap && gaps.length > 1,
      isTableMinGap: (item.gap ?? 0) === minGap && gaps.length > 1,
      avgRankInRow,
      userRankDeltaVsAvg
    });
  });

  const avgUserRank = userRankCount > 0 ? Math.round((totalUserRank / userRankCount) * 10) / 10 : 0;
  const avgGap = rankings.length > 0 ? Math.round((totalGap / rankings.length) * 10) / 10 : 0;

  return {
    heatmapMap,
    stats: {
      totalKeywords: rankings.length,
      userLeaderCount: userLeaders,
      comp1LeaderCount: comp1Leaders,
      comp2LeaderCount: comp2Leaders,
      comp3LeaderCount: comp3Leaders,
      avgUserRank,
      avgGap,
      maxVolumeKeyword: maxVolKw || "-",
      maxVolumeVal: maxVolAmount > 0 ? maxVolAmount : 0,
      easiestKeyword: minKdKw || "-",
      easiestKdVal: minKdAmount < 999 ? minKdAmount : 0
    }
  };
}

/**
 * Returns dynamic heatmap styling classes for competitor & user rank cells
 */
export function getHeatmapRankCellStyle(
  rowHeatmap: RowHeatmapResult | undefined,
  entity: "user" | "comp1" | "comp2" | "comp3",
  isHeatmapMode: boolean,
  highlightMinMax: boolean,
  focus: HeatmapMetricFocus,
  intensity: HeatmapIntensity,
  palette: HeatmapPalette
): string {
  if (!isHeatmapMode || !rowHeatmap) return "";
  if (focus !== "all" && focus !== "ranks") return "";

  const scoreMap = {
    user: rowHeatmap.userScore,
    comp1: rowHeatmap.comp1Score,
    comp2: rowHeatmap.comp2Score,
    comp3: rowHeatmap.comp3Score
  };

  const isBestMap = {
    user: rowHeatmap.isUserBest,
    comp1: rowHeatmap.isComp1Best,
    comp2: rowHeatmap.isComp2Best,
    comp3: rowHeatmap.isComp3Best
  };

  const isWorstMap = {
    user: rowHeatmap.isUserWorst,
    comp1: rowHeatmap.isComp1Worst,
    comp2: rowHeatmap.isComp2Worst,
    comp3: rowHeatmap.isComp3Worst
  };

  const isBest = isBestMap[entity];
  const isWorst = isWorstMap[entity];
  const score = scoreMap[entity];

  // Min/Max Highlight priority
  if (highlightMinMax) {
    if (isBest) {
      if (palette === "cool_warm") {
        return intensity === "vibrant"
          ? "bg-blue-200/90 text-blue-950 font-black ring-2 ring-blue-500/80 shadow-inner"
          : "bg-blue-100/70 text-blue-950 font-black ring-1 ring-blue-400/60";
      }
      return intensity === "vibrant"
        ? "bg-emerald-200/90 text-emerald-950 font-black ring-2 ring-emerald-500/80 shadow-inner"
        : intensity === "subtle"
        ? "bg-emerald-50/90 text-emerald-950 font-bold ring-1 ring-emerald-300"
        : "bg-emerald-100/80 text-emerald-950 font-black ring-1.5 ring-emerald-400";
    }
    if (isWorst) {
      return intensity === "vibrant"
        ? "bg-rose-200/90 text-rose-950 font-black ring-2 ring-rose-500/80 shadow-inner"
        : intensity === "subtle"
        ? "bg-rose-50/90 text-rose-900 ring-1 ring-rose-300"
        : "bg-rose-100/80 text-rose-950 font-bold ring-1.5 ring-rose-400";
    }
  }

  // Smooth Heatmap Gradient according to performance score (0 - 100)
  if (score >= 90) {
    // Rank 1 or 2
    return intensity === "vibrant"
      ? "bg-emerald-200/80 text-emerald-950 font-black"
      : intensity === "subtle"
      ? "bg-emerald-50/70 text-emerald-900 font-bold"
      : "bg-emerald-100/70 text-emerald-950 font-black";
  } else if (score >= 75) {
    // Rank 3-5
    return intensity === "vibrant"
      ? "bg-teal-200/75 text-teal-950 font-bold"
      : intensity === "subtle"
      ? "bg-teal-50/60 text-teal-900 font-medium"
      : "bg-teal-100/60 text-teal-950 font-bold";
  } else if (score >= 50) {
    // Rank 6-10
    return intensity === "vibrant"
      ? "bg-amber-200/75 text-amber-950 font-bold"
      : intensity === "subtle"
      ? "bg-amber-50/60 text-amber-900 font-medium"
      : "bg-amber-100/60 text-amber-950 font-bold";
  } else if (score >= 25) {
    // Rank 11-18
    return intensity === "vibrant"
      ? "bg-orange-200/75 text-orange-950 font-medium"
      : intensity === "subtle"
      ? "bg-orange-50/60 text-orange-900 text-xs"
      : "bg-orange-100/60 text-orange-950 font-medium";
  } else {
    // Rank 19+ or unranked
    return intensity === "vibrant"
      ? "bg-rose-200/80 text-rose-950 font-semibold"
      : intensity === "subtle"
      ? "bg-rose-50/60 text-rose-900 text-xs"
      : "bg-rose-100/60 text-rose-950 font-medium";
  }
}

/**
 * Returns dynamic heatmap styling classes for search volume cells
 */
export function getHeatmapVolumeCellStyle(
  rowHeatmap: RowHeatmapResult | undefined,
  isHeatmapMode: boolean,
  highlightMinMax: boolean,
  focus: HeatmapMetricFocus,
  intensity: HeatmapIntensity
): string {
  if (!isHeatmapMode || !rowHeatmap) return "";
  if (focus !== "all" && focus !== "volume_kd") return "";

  if (highlightMinMax && rowHeatmap.isTableMaxVolume) {
    return intensity === "vibrant"
      ? "bg-purple-200/90 text-purple-950 font-black ring-2 ring-purple-500/80 shadow-inner"
      : "bg-purple-100/80 text-purple-950 font-black ring-1.5 ring-purple-400";
  }

  const p = rowHeatmap.volumePercentile;
  if (p >= 80) {
    return intensity === "vibrant" ? "bg-indigo-100/80 text-indigo-950 font-bold" : "bg-indigo-50/80 text-indigo-900";
  } else if (p >= 50) {
    return intensity === "vibrant" ? "bg-sky-100/70 text-sky-950 font-medium" : "bg-sky-50/70 text-sky-900";
  } else if (p <= 20 && highlightMinMax && rowHeatmap.isTableMinVolume) {
    return "bg-slate-100/80 text-slate-800 ring-1 ring-slate-300";
  }
  return "";
}

/**
 * Returns dynamic heatmap styling classes for Gap cells
 */
export function getHeatmapGapCellStyle(
  rowHeatmap: RowHeatmapResult | undefined,
  isHeatmapMode: boolean,
  highlightMinMax: boolean,
  focus: HeatmapMetricFocus,
  intensity: HeatmapIntensity
): string {
  if (!isHeatmapMode || !rowHeatmap) return "";
  if (focus !== "all" && focus !== "gap") return "";

  if (highlightMinMax && rowHeatmap.isTableMaxGap) {
    return intensity === "vibrant"
      ? "bg-rose-200/90 text-rose-950 font-black ring-2 ring-rose-500/80"
      : "bg-rose-100/80 text-rose-950 font-black ring-1.5 ring-rose-400";
  }
  if (highlightMinMax && rowHeatmap.isTableMinGap && rowHeatmap.gapNum < 0) {
    return intensity === "vibrant"
      ? "bg-emerald-200/90 text-emerald-950 font-black ring-2 ring-emerald-500/80"
      : "bg-emerald-100/80 text-emerald-950 font-black ring-1.5 ring-emerald-400";
  }

  if (rowHeatmap.gapNum < 0) {
    // Siteniz önde (Gap negatif = daha küçük sıralama = lider)
    return intensity === "vibrant" ? "bg-emerald-100/75 text-emerald-950" : "bg-emerald-50/70 text-emerald-900";
  } else if (rowHeatmap.gapNum > 5) {
    // Rakip belirgin önde
    return intensity === "vibrant" ? "bg-rose-100/75 text-rose-950" : "bg-rose-50/70 text-rose-900";
  } else if (rowHeatmap.gapNum > 0) {
    return intensity === "vibrant" ? "bg-amber-100/75 text-amber-950" : "bg-amber-50/70 text-amber-900";
  }
  return "";
}

/**
 * Dedicated min/max badge renderer for cells
 */
export const HeatmapMinMaxBadge: React.FC<{
  isBest?: boolean;
  isWorst?: boolean;
  isMaxVolume?: boolean;
  isMinVolume?: boolean;
  rankDelta?: number;
  labelOverride?: string;
}> = ({ isBest, isWorst, isMaxVolume, isMinVolume, rankDelta, labelOverride }) => {
  if (isBest) {
    return (
      <span
        className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider shadow-2xs whitespace-nowrap animate-in fade-in"
        title="Bu kelimede rakipler arasındaki en yüksek performans / lider sıralama"
      >
        <Trophy className="w-2.5 h-2.5 text-amber-300 fill-amber-300" />
        <span>{labelOverride || "En Yüksek"}</span>
      </span>
    );
  }

  if (isWorst) {
    return (
      <span
        className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-rose-600 text-white text-[9px] font-black uppercase tracking-wider shadow-2xs whitespace-nowrap animate-in fade-in"
        title="Bu kelimede rakipler arasındaki en düşük / en gerideki sıralama"
      >
        <TrendingDown className="w-2.5 h-2.5 text-rose-200" />
        <span>{labelOverride || "En Düşük"}</span>
      </span>
    );
  }

  if (isMaxVolume) {
    return (
      <span
        className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-purple-600 text-white text-[9px] font-black uppercase tracking-wider shadow-2xs whitespace-nowrap animate-in fade-in"
        title="Tüm tablodaki en yüksek aranma hacmine sahip anahtar kelime"
      >
        <Flame className="w-2.5 h-2.5 text-amber-300 animate-pulse" />
        <span>Max Hacim</span>
      </span>
    );
  }

  if (isMinVolume) {
    return (
      <span
        className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded-md bg-slate-600 text-slate-100 text-[8px] font-bold uppercase tracking-wider whitespace-nowrap"
        title="Tablodaki en düşük arama hacmi"
      >
        Min Hacim
      </span>
    );
  }

  return null;
};

/**
 * Interactive Heatmap Controls & Legend Panel (rendered right above table)
 */
export interface TableHeatmapPanelProps {
  isActive: boolean;
  onToggleActive: () => void;
  metricFocus: HeatmapMetricFocus;
  onChangeMetricFocus: (focus: HeatmapMetricFocus) => void;
  highlightMinMax: boolean;
  onToggleHighlightMinMax: () => void;
  palette: HeatmapPalette;
  onChangePalette: (palette: HeatmapPalette) => void;
  intensity: HeatmapIntensity;
  onChangeIntensity: (intensity: HeatmapIntensity) => void;
  stats: TableHeatmapStats;
  userName?: string;
}

export const TableHeatmapPanel: React.FC<TableHeatmapPanelProps> = ({
  isActive,
  onToggleActive,
  metricFocus,
  onChangeMetricFocus,
  highlightMinMax,
  onToggleHighlightMinMax,
  palette,
  onChangePalette,
  intensity,
  onChangeIntensity,
  stats,
  userName = "Siteniz"
}) => {
  if (!isActive) return null;

  return (
    <div
      id="seo-table-heatmap-panel"
      data-testid="seo-table-heatmap-panel"
      className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/98 to-indigo-950 border-2 border-amber-500/40 text-white shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-98 duration-200"
    >
      {/* Background ambient accents */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* 1. Header with Title & Action Controls */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3.5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 shrink-0">
            <Flame className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-1.5">
                <span>Dinamik Isı Haritası Modu</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                  Canlı Analiz
                </span>
              </h3>
            </div>
            <p className="text-xs text-slate-300">
              Tablodaki metrikleri kıyaslayarak rakipler arasındaki performans farklarını görselleştirir ve en yüksek/düşük değerleri renk skalasıyla vurgular.
            </p>
          </div>
        </div>

        {/* Action buttons on header right */}
        <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
          {/* Min/Max Highlighting Switch */}
          <button
            type="button"
            id="btn-heatmap-toggle-minmax"
            data-testid="heatmap-toggle-minmax-btn"
            onClick={onToggleHighlightMinMax}
            className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 ${
              highlightMinMax
                ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-emerald-500/25 ring-2 ring-emerald-400/40"
                : "bg-slate-800/90 hover:bg-slate-800 text-slate-300 border-slate-700"
            }`}
            title="Her satırda ve tabloda en yüksek/lider ile en düşük değerleri belirgin etiketlerle vurgula"
          >
            {highlightMinMax ? (
              <Trophy className="w-3.5 h-3.5 text-slate-950" />
            ) : (
              <EyeOff className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>En Yüksek/Düşük Vurgusu: {highlightMinMax ? "Açık" : "Kapalı"}</span>
          </button>

          {/* Close Heatmap Mode */}
          <button
            type="button"
            id="btn-heatmap-close-panel"
            data-testid="heatmap-close-panel-btn"
            onClick={onToggleActive}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            title="Isı Haritası Modundan Çık"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Interactive Controls: Metric Focus, Intensity & Palette */}
      <div className="relative z-10 py-3.5 grid grid-cols-1 md:grid-cols-3 gap-3 border-b border-slate-800/80">
        
        {/* Metric Focus Selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3 text-amber-400" />
            <span>Isı Haritası Metrik Odağı:</span>
          </label>
          <div className="grid grid-cols-2 gap-1 bg-slate-950/70 p-1 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => onChangeMetricFocus("all")}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer truncate ${
                metricFocus === "all"
                  ? "bg-amber-400 text-slate-950 font-black shadow-xs"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              🔥 Tüm Metrikler
            </button>
            <button
              type="button"
              onClick={() => onChangeMetricFocus("ranks")}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer truncate ${
                metricFocus === "ranks"
                  ? "bg-amber-400 text-slate-950 font-black shadow-xs"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              👑 Sadece Sıralamalar
            </button>
            <button
              type="button"
              onClick={() => onChangeMetricFocus("gap")}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer truncate ${
                metricFocus === "gap"
                  ? "bg-amber-400 text-slate-950 font-black shadow-xs"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              ⚡ Rank Gap Farkları
            </button>
            <button
              type="button"
              onClick={() => onChangeMetricFocus("volume_kd")}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer truncate ${
                metricFocus === "volume_kd"
                  ? "bg-amber-400 text-slate-950 font-black shadow-xs"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              📊 Hacim & Zorluk
            </button>
          </div>
        </div>

        {/* Heatmap Palette Selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
            <Layers className="w-3 h-3 text-emerald-400" />
            <span>Renk Paleti & Ölçek:</span>
          </label>
          <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => onChangePalette("classic")}
              className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer truncate text-center ${
                palette === "classic"
                  ? "bg-emerald-500 text-slate-950 font-black shadow-xs"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Yeşil - Kırmızı
            </button>
            <button
              type="button"
              onClick={() => onChangePalette("emerald_rose")}
              className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer truncate text-center ${
                palette === "emerald_rose"
                  ? "bg-emerald-500 text-slate-950 font-black shadow-xs"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Zümrüt - Gül
            </button>
            <button
              type="button"
              onClick={() => onChangePalette("cool_warm")}
              className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer truncate text-center ${
                palette === "cool_warm"
                  ? "bg-emerald-500 text-slate-950 font-black shadow-xs"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Mavi - Kırmızı
            </button>
          </div>
        </div>

        {/* Heatmap Intensity Selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-rose-400" />
            <span>Renk Yoğunluğu (Kontrast):</span>
          </label>
          <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => onChangeIntensity("subtle")}
              className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer text-center ${
                intensity === "subtle"
                  ? "bg-indigo-600 text-white font-black shadow-xs"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Yumuşak (%20)
            </button>
            <button
              type="button"
              onClick={() => onChangeIntensity("medium")}
              className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer text-center ${
                intensity === "medium"
                  ? "bg-indigo-600 text-white font-black shadow-xs"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Standart (%35)
            </button>
            <button
              type="button"
              onClick={() => onChangeIntensity("vibrant")}
              className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer text-center ${
                intensity === "vibrant"
                  ? "bg-indigo-600 text-white font-black shadow-xs"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Canlı (%50)
            </button>
          </div>
        </div>

      </div>

      {/* 3. Summary KPI Cards for Performance Differences */}
      <div className="relative z-10 py-3.5 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Card 1: User Leadership */}
        <div className="p-3 rounded-2xl bg-slate-950/80 border border-emerald-500/30 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-emerald-300 font-bold">
            <span className="flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>{userName} Liderliği</span>
            </span>
            <span className="font-mono text-emerald-400 font-black">
              %{stats.totalKeywords > 0 ? Math.round((stats.userLeaderCount / stats.totalKeywords) * 100) : 0}
            </span>
          </div>
          <div className="text-xl font-black text-white">
            {stats.userLeaderCount} <span className="text-xs text-slate-400 font-normal">/ {stats.totalKeywords} kelime</span>
          </div>
          <div className="text-[10px] text-emerald-400">
            {stats.userLeaderCount > stats.comp1LeaderCount ? "👑 Sektörde lider konumdasınız" : "Rekabet yakın takipte"}
          </div>
        </div>

        {/* Card 2: Competitor Dominance */}
        <div className="p-3 rounded-2xl bg-slate-950/80 border border-amber-500/30 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-amber-300 font-bold">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Rakip Liderlikleri</span>
            </span>
            <span className="font-mono text-amber-400 font-black">
              {stats.comp1LeaderCount + stats.comp2LeaderCount + stats.comp3LeaderCount} Kelime
            </span>
          </div>
          <div className="text-xl font-black text-amber-200">
            {stats.comp1LeaderCount} <span className="text-xs text-slate-400 font-normal">(1. Rakip)</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono truncate">
            2. Rakip: {stats.comp2LeaderCount} • 3. Rakip: {stats.comp3LeaderCount}
          </div>
        </div>

        {/* Card 3: Avg SERP Rank & Gap */}
        <div className="p-3 rounded-2xl bg-slate-950/80 border border-indigo-500/30 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-indigo-300 font-bold">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
              <span>Ortalama Rank Gap</span>
            </span>
            <span className="font-mono text-indigo-400 font-black">
              Avg #{stats.avgUserRank}
            </span>
          </div>
          <div className={`text-xl font-black ${stats.avgGap <= 0 ? "text-emerald-400" : "text-amber-400"}`}>
            {stats.avgGap < 0 ? `+${Math.abs(stats.avgGap)}` : stats.avgGap} <span className="text-xs font-normal text-slate-400">{stats.avgGap <= 0 ? "Sıra Önde" : "Sıra Fark"}</span>
          </div>
          <div className="text-[10px] text-slate-400">
            {stats.avgGap <= 0 ? "Genel SERP farkı lehinize" : "Rakiplerle farkı kapatma fırsatı"}
          </div>
        </div>

        {/* Card 4: Top Volume & Easiest Keyword */}
        <div className="p-3 rounded-2xl bg-slate-950/80 border border-purple-500/30 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-purple-300 font-bold">
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-purple-400" />
              <span>En Yüksek Hacim</span>
            </span>
            <span className="font-mono text-purple-400 font-black">
              {stats.maxVolumeVal.toLocaleString("tr-TR")} / ay
            </span>
          </div>
          <div className="text-sm font-black text-white truncate" title={stats.maxVolumeKeyword}>
            {stats.maxVolumeKeyword}
          </div>
          <div className="text-[10px] text-amber-300 truncate">
            En Kolay Fırsat: {stats.easiestKeyword} (KD {stats.easiestKdVal})
          </div>
        </div>
      </div>

      {/* 4. Color Scale Legend Bar */}
      <div className="relative z-10 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400">Renk Skalası:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/30 text-emerald-300 text-[10px] font-black border border-emerald-500/40">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>En Yüksek (#1 Lider)</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-teal-500/30 text-teal-300 text-[10px] font-bold border border-teal-500/40">
              <span className="w-2 h-2 rounded-full bg-teal-400" />
              <span>Güçlü (#2 - #3)</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/30 text-amber-300 text-[10px] font-bold border border-amber-500/40">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Orta (#4 - #10)</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-500/30 text-rose-300 text-[10px] font-bold border border-rose-500/40">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>En Düşük / Geride (&gt;#10)</span>
            </span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center gap-1 self-end sm:self-auto">
          <Info className="w-3 h-3 text-amber-400" />
          <span>Hücrelerdeki arka plan tonu ve min/max rozetleri anlık güncellenir.</span>
        </div>
      </div>
    </div>
  );
};
