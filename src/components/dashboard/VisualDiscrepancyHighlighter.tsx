import React, { useMemo } from "react";
import { CompetitorKeywordRanking, CompetitorContentMetric } from "../../types";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Percent,
  SlidersHorizontal,
  X,
  Check,
  AlertTriangle,
  Flame,
  Zap,
  Filter,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Trophy,
  Gauge
} from "lucide-react";

export type DiscrepancyThreshold = 15 | 20 | 30 | 50;
export type DiscrepancyDirection = "positive" | "negative" | "opportunity";
export type DiscrepancyFocusFilter = "all" | "positive_only" | "negative_only" | "extreme_only";

export interface CellDiscrepancy {
  itemId: string;
  metricKey: "userRank" | "comp1Rank" | "comp2Rank" | "comp3Rank" | "gap" | "volume" | "speed" | "difficulty";
  pctDiff: number;
  direction: DiscrepancyDirection;
  badgeText: string;
  title: string;
  explanation: string;
  rawValue: string | number;
  benchmarkValue: string | number;
  isExtreme: boolean;
}

export interface DiscrepancyAnalysisResult {
  cellMap: Record<string, CellDiscrepancy>;
  rowDiscrepancies: Record<string, CellDiscrepancy[]>;
  totalScannedPoints: number;
  highlightedCount: number;
  positiveCount: number;
  negativeCount: number;
  opportunityCount: number;
  topGains: CellDiscrepancy[];
  topRisks: CellDiscrepancy[];
}

/**
 * Parses search volume string (e.g. "8.400 / ay" or "12.500") to numeric value
 */
export function parseVolumeNumber(valStr?: string): number {
  if (!valStr) return 0;
  const cleaned = valStr.replace(/[^0-9]/g, "");
  return cleaned ? parseInt(cleaned, 10) : 0;
}

/**
 * Core Algorithm: Scans all metrics across the table and computes variances vs benchmarks
 */
export function scanTableDiscrepancies(
  rankings: CompetitorKeywordRanking[],
  threshold: DiscrepancyThreshold = 20,
  competitors: CompetitorContentMetric[] = []
): DiscrepancyAnalysisResult {
  const cellMap: Record<string, CellDiscrepancy> = {};
  const rowDiscrepancies: Record<string, CellDiscrepancy[]> = {};
  let totalScannedPoints = 0;

  // 1. Calculate median volume benchmark
  const volumes = rankings.map((r) => parseVolumeNumber(r.monthlyVolume)).filter((v) => v > 0);
  const sortedVolumes = [...volumes].sort((a, b) => a - b);
  const medianVolume = sortedVolumes.length > 0 
    ? sortedVolumes[Math.floor(sortedVolumes.length / 2)] 
    : 4000;

  // 2. User base speed vs competitors speed
  const userSpeed = 98; // User PageSpeed benchmark in app
  const comp1Speed = competitors[0]?.speedScore || 74;
  const comp2Speed = competitors[1]?.speedScore || 81;
  const comp3Speed = competitors[2]?.speedScore || 62;

  // 3. SEO Zorluk Skoru Benchmark (KD)
  const difficulties = rankings.map((r) => r.difficulty ?? 0).filter((d) => d > 0);
  const avgDifficulty = difficulties.length > 0
    ? Math.round(difficulties.reduce((a, b) => a + b, 0) / difficulties.length)
    : 45;

  rankings.forEach((item) => {
    const itemRowDiscrepancies: CellDiscrepancy[] = [];

    // Helper to register discrepancy
    const addDiscrepancy = (disc: CellDiscrepancy) => {
      const key = `${disc.itemId}_${disc.metricKey}`;
      cellMap[key] = disc;
      itemRowDiscrepancies.push(disc);
    };

    const compRanks = [item.comp1Rank, item.comp2Rank, item.comp3Rank].filter(
      (r): r is number => r !== null && r > 0
    );
    const bestCompRank = compRanks.length > 0 ? Math.min(...compRanks) : null;
    const avgCompRank = compRanks.length > 0
      ? compRanks.reduce((sum, val) => sum + val, 0) / compRanks.length
      : null;

    // Metric 1: Siteniz Sıralaması (userRank)
    totalScannedPoints++;
    if (item.userRank !== null && bestCompRank !== null) {
      if (item.userRank < bestCompRank) {
        // User is ahead (e.g. user=2, comp=6 => (6 - 2)/6 = +66.7%)
        const pctDiff = Math.round(((bestCompRank - item.userRank) / bestCompRank) * 100);
        if (pctDiff >= threshold) {
          addDiscrepancy({
            itemId: item.id,
            metricKey: "userRank",
            pctDiff,
            direction: "positive",
            badgeText: `▲ +%${pctDiff}`,
            title: "Sıralama Avantajı",
            explanation: `Siteniz #${item.userRank}, en yakın rakip #${bestCompRank} (${bestCompRank - item.userRank} sıra ve %${pctDiff} daha önde).`,
            rawValue: `#${item.userRank}`,
            benchmarkValue: `#${bestCompRank}`,
            isExtreme: pctDiff >= 50
          });
        }
      } else if (item.userRank > bestCompRank) {
        // User is trailing (e.g. user=7, comp=2 => (7 - 2)/2 = 250% deficit)
        const pctDiff = Math.round(((item.userRank - bestCompRank) / bestCompRank) * 100);
        if (pctDiff >= threshold) {
          addDiscrepancy({
            itemId: item.id,
            metricKey: "userRank",
            pctDiff: -pctDiff,
            direction: "negative",
            badgeText: `▼ -%${pctDiff}`,
            title: "Kritik Sıralama Açığı",
            explanation: `Siteniz #${item.userRank}, lider rakip #${bestCompRank} (${item.userRank - bestCompRank} sıra geride, %${pctDiff} açık var).`,
            rawValue: `#${item.userRank}`,
            benchmarkValue: `#${bestCompRank}`,
            isExtreme: pctDiff >= 50
          });
        }
      }
    } else if (item.userRank === null && bestCompRank !== null) {
      // User is unranked (>20) while competitor is ranked
      const pctDiff = 100;
      addDiscrepancy({
        itemId: item.id,
        metricKey: "userRank",
        pctDiff: -pctDiff,
        direction: "negative",
        badgeText: "▼ -%100 (Kayıp)",
        title: "SERP Dışı Kalma Açığı",
        explanation: `Siteniz ilk 20'de yokken rakip #${bestCompRank} konumunda. Acil optimizasyon gerektirir.`,
        rawValue: "İlk 20'de Yok",
        benchmarkValue: `#${bestCompRank}`,
        isExtreme: true
      });
    }

    // Metric 2: Rakip 1 (comp1Rank)
    totalScannedPoints++;
    if (item.comp1Rank !== null && item.userRank !== null) {
      if (item.userRank < item.comp1Rank) {
        // User outperforms comp1
        const pctDiff = Math.round(((item.comp1Rank - item.userRank) / item.comp1Rank) * 100);
        if (pctDiff >= threshold) {
          addDiscrepancy({
            itemId: item.id,
            metricKey: "comp1Rank",
            pctDiff,
            direction: "positive",
            badgeText: `▲ +%${pctDiff}`,
            title: "Rakip 1 Önündesiniz",
            explanation: `Siteniz #${item.userRank}, ${competitors[0]?.name || "Rakip 1"} #${item.comp1Rank} (${item.comp1Rank - item.userRank} sıra üstünlük).`,
            rawValue: `#${item.comp1Rank}`,
            benchmarkValue: `#${item.userRank}`,
            isExtreme: pctDiff >= 40
          });
        }
      } else if (item.comp1Rank < item.userRank) {
        // Comp1 outperforms user
        const pctDiff = Math.round(((item.userRank - item.comp1Rank) / item.comp1Rank) * 100);
        if (pctDiff >= threshold) {
          addDiscrepancy({
            itemId: item.id,
            metricKey: "comp1Rank",
            pctDiff: -pctDiff,
            direction: "negative",
            badgeText: `▼ -%${pctDiff}`,
            title: "Rakip 1 Üstünlüğü",
            explanation: `${competitors[0]?.name || "Rakip 1"} #${item.comp1Rank}, siteniz #${item.userRank} (${item.userRank - item.comp1Rank} sıra geridesiniz).`,
            rawValue: `#${item.comp1Rank}`,
            benchmarkValue: `#${item.userRank}`,
            isExtreme: pctDiff >= 40
          });
        }
      }
    }

    // Metric 3: Rakip 2 (comp2Rank)
    totalScannedPoints++;
    if (item.comp2Rank !== null && item.userRank !== null) {
      if (item.userRank < item.comp2Rank) {
        const pctDiff = Math.round(((item.comp2Rank - item.userRank) / item.comp2Rank) * 100);
        if (pctDiff >= threshold) {
          addDiscrepancy({
            itemId: item.id,
            metricKey: "comp2Rank",
            pctDiff,
            direction: "positive",
            badgeText: `▲ +%${pctDiff}`,
            title: "Rakip 2 Önündesiniz",
            explanation: `Siteniz #${item.userRank}, ${competitors[1]?.name || "Rakip 2"} #${item.comp2Rank} (${item.comp2Rank - item.userRank} sıra üstünlük).`,
            rawValue: `#${item.comp2Rank}`,
            benchmarkValue: `#${item.userRank}`,
            isExtreme: pctDiff >= 40
          });
        }
      } else if (item.comp2Rank < item.userRank) {
        const pctDiff = Math.round(((item.userRank - item.comp2Rank) / item.comp2Rank) * 100);
        if (pctDiff >= threshold) {
          addDiscrepancy({
            itemId: item.id,
            metricKey: "comp2Rank",
            pctDiff: -pctDiff,
            direction: "negative",
            badgeText: `▼ -%${pctDiff}`,
            title: "Rakip 2 Üstünlüğü",
            explanation: `${competitors[1]?.name || "Rakip 2"} #${item.comp2Rank}, siteniz #${item.userRank} (${item.userRank - item.comp2Rank} sıra geridesiniz).`,
            rawValue: `#${item.comp2Rank}`,
            benchmarkValue: `#${item.userRank}`,
            isExtreme: pctDiff >= 40
          });
        }
      }
    }

    // Metric 4: Rakip 3 (comp3Rank)
    totalScannedPoints++;
    if (item.comp3Rank !== null && item.userRank !== null) {
      if (item.userRank < item.comp3Rank) {
        const pctDiff = Math.round(((item.comp3Rank - item.userRank) / item.comp3Rank) * 100);
        if (pctDiff >= threshold) {
          addDiscrepancy({
            itemId: item.id,
            metricKey: "comp3Rank",
            pctDiff,
            direction: "positive",
            badgeText: `▲ +%${pctDiff}`,
            title: "Rakip 3 Önündesiniz",
            explanation: `Siteniz #${item.userRank}, ${competitors[2]?.name || "Rakip 3"} #${item.comp3Rank} (${item.comp3Rank - item.userRank} sıra üstünlük).`,
            rawValue: `#${item.comp3Rank}`,
            benchmarkValue: `#${item.userRank}`,
            isExtreme: pctDiff >= 40
          });
        }
      } else if (item.comp3Rank < item.userRank) {
        const pctDiff = Math.round(((item.userRank - item.comp3Rank) / item.comp3Rank) * 100);
        if (pctDiff >= threshold) {
          addDiscrepancy({
            itemId: item.id,
            metricKey: "comp3Rank",
            pctDiff: -pctDiff,
            direction: "negative",
            badgeText: `▼ -%${pctDiff}`,
            title: "Rakip 3 Üstünlüğü",
            explanation: `${competitors[2]?.name || "Rakip 3"} #${item.comp3Rank}, siteniz #${item.userRank} (${item.userRank - item.comp3Rank} sıra geridesiniz).`,
            rawValue: `#${item.comp3Rank}`,
            benchmarkValue: `#${item.userRank}`,
            isExtreme: pctDiff >= 40
          });
        }
      }
    }

    // Metric 5: Gap (Sıra Açığı / Avantajı Durumu)
    totalScannedPoints++;
    if (item.userRank === null) {
      addDiscrepancy({
        itemId: item.id,
        metricKey: "gap",
        pctDiff: -100,
        direction: "negative",
        badgeText: "▼ %100 Açık",
        title: "Kritik Boşluk",
        explanation: "İlk 20 sıralama dışında kalındığı için maksimum pazar payı kaybı yaşanıyor (+99 boşluk).",
        rawValue: "+99",
        benchmarkValue: "İlk 3 Hedef",
        isExtreme: true
      });
    } else if (item.gap <= -2) {
      // Leading by 2 or more positions
      const pct = Math.min(100, Math.round((Math.abs(item.gap) / (item.userRank + Math.abs(item.gap))) * 100));
      if (pct >= threshold) {
        addDiscrepancy({
          itemId: item.id,
          metricKey: "gap",
          pctDiff: pct,
          direction: "positive",
          badgeText: `▲ +%${pct}`,
          title: "Güçlü Liderlik Açığı",
          explanation: `Rakiplerden ${Math.abs(item.gap)} sıra önde liderlik korunuyor.`,
          rawValue: `+${Math.abs(item.gap)} Sıra`,
          benchmarkValue: "Rakipler",
          isExtreme: pct >= 40
        });
      }
    } else if (item.gap >= 3) {
      // Trailing by 3 or more positions
      const pct = Math.round((item.gap / Math.max(1, (bestCompRank || 1))) * 100);
      if (pct >= threshold) {
        addDiscrepancy({
          itemId: item.id,
          metricKey: "gap",
          pctDiff: -pct,
          direction: "negative",
          badgeText: `▼ -%${pct}`,
          title: "Kapatılması Gereken Sıra Farkı",
          explanation: `Lider rakiple aranızda ${item.gap} sıra fark var (%${pct} açık).`,
          rawValue: `-${item.gap} Sıra`,
          benchmarkValue: `#${bestCompRank || 1}`,
          isExtreme: pct >= 40
        });
      }
    }

    // Metric 6: Arama Hacmi (Volume Spike Opportunity)
    totalScannedPoints++;
    const numVol = parseVolumeNumber(item.monthlyVolume);
    if (numVol > 0 && medianVolume > 0) {
      const volDiffPct = Math.round(((numVol - medianVolume) / medianVolume) * 100);
      if (volDiffPct >= threshold) {
        addDiscrepancy({
          itemId: item.id,
          metricKey: "volume",
          pctDiff: volDiffPct,
          direction: "opportunity",
          badgeText: `★ +%${volDiffPct} Hacim`,
          title: "Yüksek Arama Hacmi Uçurumu",
          explanation: `Bu kelimenin arama hacmi (${item.monthlyVolume}) tablodaki ortalama anahtar kelimelere göre %${volDiffPct} daha yüksek.`,
          rawValue: item.monthlyVolume,
          benchmarkValue: `${medianVolume.toLocaleString("tr-TR")}/ay`,
          isExtreme: volDiffPct >= 50
        });
      }
    }

    // Metric 7: PageSpeed & CWV Hız Farkı (User vs Comp 1, 2, 3)
    totalScannedPoints++;
    const avgCompSpeed = Math.round((comp1Speed + comp2Speed + comp3Speed) / 3);
    const speedAdvantagePct = Math.round(((userSpeed - avgCompSpeed) / avgCompSpeed) * 100);
    if (speedAdvantagePct >= threshold) {
      addDiscrepancy({
        itemId: item.id,
        metricKey: "speed",
        pctDiff: speedAdvantagePct,
        direction: "positive",
        badgeText: `⚡ +%${speedAdvantagePct} Hızlı`,
        title: "PageSpeed & CWV Üstünlüğü",
        explanation: `Sitenizin CWV skoru (${userSpeed}) rakiplerin ortalamasından (${avgCompSpeed}) %${speedAdvantagePct} daha yüksek.`,
        rawValue: `${userSpeed} Skor`,
        benchmarkValue: `${avgCompSpeed} Rakip Ort.`,
        isExtreme: speedAdvantagePct >= 30
      });
    }

    // Metric 8: SEO Zorluğu Fırsatı (KD vs Average)
    if (item.difficulty !== undefined && item.difficulty !== null && avgDifficulty > 0) {
      totalScannedPoints++;
      const diffDiffPct = Math.round(((avgDifficulty - item.difficulty) / avgDifficulty) * 100);
      if (diffDiffPct >= threshold) {
        addDiscrepancy({
          itemId: item.id,
          metricKey: "difficulty",
          pctDiff: diffDiffPct,
          direction: "opportunity",
          badgeText: `🎯 KD -%${diffDiffPct}`,
          title: "Düşük Rekabet Fırsatı",
          explanation: `Bu kelimenin zorluk skoru (KD: ${item.difficulty}) ortalamadan (KD: ${avgDifficulty}) %${diffDiffPct} daha düşük; hızlı yükseliş fırsatı sunar.`,
          rawValue: `KD ${item.difficulty}`,
          benchmarkValue: `KD ${avgDifficulty} Ort.`,
          isExtreme: diffDiffPct >= 40
        });
      }
    }

    rowDiscrepancies[item.id] = itemRowDiscrepancies;
  });

  const allDiscrepancies = Object.values(cellMap);
  const positiveList = allDiscrepancies.filter((d) => d.direction === "positive");
  const negativeList = allDiscrepancies.filter((d) => d.direction === "negative");
  const opportunityList = allDiscrepancies.filter((d) => d.direction === "opportunity");

  // Top gains & risks sorted by magnitude
  const topGains = [...positiveList].sort((a, b) => b.pctDiff - a.pctDiff).slice(0, 3);
  const topRisks = [...negativeList].sort((a, b) => a.pctDiff - b.pctDiff).slice(0, 3);

  return {
    cellMap,
    rowDiscrepancies,
    totalScannedPoints,
    highlightedCount: allDiscrepancies.length,
    positiveCount: positiveList.length,
    negativeCount: negativeList.length,
    opportunityCount: opportunityList.length,
    topGains,
    topRisks
  };
}

/**
 * Returns Tailwind classes for highlighting a cell based on detected discrepancy
 * adhering to the Heatmap Principle (Isı Haritası Prensibi: %20-35 Düşük Isı, %36-60 Orta Isı, %60+ Yüksek Isı)
 */
export function getDiscrepancyCellClasses(
  discrepancy: CellDiscrepancy | undefined,
  focusFilter: DiscrepancyFocusFilter = "all",
  isPulseEnabled: boolean = true
): string {
  if (!discrepancy) return "";

  // Apply focus filter
  if (focusFilter === "positive_only" && discrepancy.direction !== "positive") return "";
  if (focusFilter === "negative_only" && discrepancy.direction !== "negative") return "";
  if (focusFilter === "extreme_only" && !discrepancy.isExtreme) return "";

  const absDiff = Math.abs(discrepancy.pctDiff);
  const pulseClass = isPulseEnabled ? "transition-all duration-300" : "";

  // Isı Haritası Seviyeleri (Heatmap Intensity Tiers):
  // 1. Zümrüt Yeşil: Pozitif Üstünlük (Siteniz Rakiplerden Önde)
  if (discrepancy.direction === "positive") {
    if (absDiff >= 60 || discrepancy.isExtreme) {
      // Yüksek Isı (%60+)
      return `${pulseClass} bg-emerald-200/90 text-emerald-950 border-2 border-emerald-500 ring-2 ring-emerald-400/80 shadow-xs rounded-xl relative font-bold`;
    }
    if (absDiff >= 36) {
      // Orta Isı (%36 - %60)
      return `${pulseClass} bg-emerald-100/90 text-emerald-950 border-2 border-emerald-400 ring-1 ring-emerald-300 shadow-2xs rounded-xl relative font-semibold`;
    }
    // Düşük Isı (%20 - %35)
    return `${pulseClass} bg-emerald-50/90 text-emerald-950 border border-emerald-300/90 shadow-2xs rounded-xl relative`;
  }

  // 2. Gül Kırmızı: Negatif Açık (Rakip Önde / Risk / Boşluk)
  if (discrepancy.direction === "negative") {
    if (absDiff >= 60 || discrepancy.isExtreme) {
      // Yüksek Isı (%60+)
      return `${pulseClass} bg-rose-200/90 text-rose-950 border-2 border-rose-500 ring-2 ring-rose-400/80 shadow-xs rounded-xl relative font-bold`;
    }
    if (absDiff >= 36) {
      // Orta Isı (%36 - %60)
      return `${pulseClass} bg-rose-100/90 text-rose-950 border-2 border-rose-400 ring-1 ring-rose-300 shadow-2xs rounded-xl relative font-semibold`;
    }
    // Düşük Isı (%20 - %35)
    return `${pulseClass} bg-rose-50/90 text-rose-950 border border-rose-300/90 shadow-2xs rounded-xl relative`;
  }

  // 3. Kehribar / Altın: Hacim & Düşük KD Fırsatı
  if (discrepancy.direction === "opportunity") {
    if (absDiff >= 60 || discrepancy.isExtreme) {
      // Yüksek Isı (%60+)
      return `${pulseClass} bg-amber-200/90 text-amber-950 border-2 border-amber-500 ring-2 ring-amber-400/80 shadow-xs rounded-xl relative font-bold`;
    }
    if (absDiff >= 36) {
      // Orta Isı (%36 - %60)
      return `${pulseClass} bg-amber-100/90 text-amber-950 border-2 border-amber-400 ring-1 ring-amber-300 shadow-2xs rounded-xl relative font-semibold`;
    }
    // Düşük Isı (%20 - %35)
    return `${pulseClass} bg-amber-50/90 text-amber-950 border border-amber-300/90 shadow-2xs rounded-xl relative`;
  }

  return "";
}

/**
 * Renders the discrepancy badge inside a highlighted cell with Heatmap tooltip and pulse
 */
export const DiscrepancyBadge: React.FC<{
  discrepancy: CellDiscrepancy | undefined;
  focusFilter?: DiscrepancyFocusFilter;
  isPulseEnabled?: boolean;
}> = ({ discrepancy, focusFilter = "all", isPulseEnabled = true }) => {
  if (!discrepancy) return null;

  if (focusFilter === "positive_only" && discrepancy.direction !== "positive") return null;
  if (focusFilter === "negative_only" && discrepancy.direction !== "negative") return null;
  if (focusFilter === "extreme_only" && !discrepancy.isExtreme) return null;

  const absDiff = Math.abs(discrepancy.pctDiff);
  const heatLevel = absDiff >= 60 || discrepancy.isExtreme ? "Yüksek Isı (%60+)" : absDiff >= 36 ? "Orta Isı (%36-%60)" : "Düşük Isı (%20-%35)";

  const colorStyles =
    discrepancy.direction === "positive"
      ? absDiff >= 60
        ? "bg-emerald-700 text-white border-emerald-800 shadow-emerald-600/30"
        : absDiff >= 36
        ? "bg-emerald-600 text-white border-emerald-700 shadow-emerald-500/20"
        : "bg-emerald-500 text-white border-emerald-600 shadow-emerald-500/10"
      : discrepancy.direction === "negative"
      ? absDiff >= 60
        ? "bg-rose-700 text-white border-rose-800 shadow-rose-600/30"
        : absDiff >= 36
        ? "bg-rose-600 text-white border-rose-700 shadow-rose-500/20"
        : "bg-rose-500 text-white border-rose-600 shadow-rose-500/10"
      : absDiff >= 60
      ? "bg-amber-600 text-slate-950 border-amber-700 shadow-amber-600/30 font-black"
      : "bg-amber-500 text-slate-950 border-amber-600 shadow-amber-500/20 font-bold";

  return (
    <span
      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md font-mono text-[9px] font-black border shadow-2xs cursor-help select-none ${colorStyles} ${
        isPulseEnabled && discrepancy.isExtreme ? "animate-pulse" : ""
      }`}
      title={`[Isı Haritası Farkı: ${heatLevel}]\n${discrepancy.title}: ${discrepancy.badgeText}\n${discrepancy.explanation}\nDeğer: ${discrepancy.rawValue} | Kıyaslanan Benchmark: ${discrepancy.benchmarkValue}`}
    >
      <span>{discrepancy.badgeText}</span>
    </span>
  );
};

/**
 * Compact Heatmap Intensity Legend Component for the Table Header
 */
export const HeatmapMiniLegend: React.FC<{
  threshold: DiscrepancyThreshold;
  positiveCount: number;
  negativeCount: number;
  opportunityCount: number;
  onToggleSettings?: () => void;
}> = ({ threshold, positiveCount, negativeCount, opportunityCount, onToggleSettings }) => {
  return (
    <div
      id="seo-table-heatmap-mini-legend"
      data-testid="seo-table-heatmap-mini-legend"
      className="p-2.5 px-3 rounded-2xl bg-slate-900/90 border border-indigo-500/30 text-white flex flex-wrap items-center justify-between gap-2.5 text-xs shadow-md animate-in fade-in"
    >
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 font-bold text-amber-300">
          <Flame className="w-3.5 h-3.5 text-amber-400 stroke-[2.5]" />
          <span>Isı Haritası Lejantı (%{threshold}+ Fark):</span>
        </div>

        {/* Emerald scale */}
        <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded-lg border border-emerald-500/30 text-[11px]">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
          <span className="text-emerald-300 font-bold">Yeşil:</span>
          <span className="text-slate-300">Siteniz Önde (+%{threshold}+)</span>
          <span className="font-mono font-black text-emerald-400 ml-1">({positiveCount})</span>
        </div>

        {/* Rose scale */}
        <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded-lg border border-rose-500/30 text-[11px]">
          <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
          <span className="text-rose-300 font-bold">Kırmızı:</span>
          <span className="text-slate-300">Rakip Önde / Sıra Açığı</span>
          <span className="font-mono font-black text-rose-400 ml-1">({negativeCount})</span>
        </div>

        {/* Amber scale */}
        <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded-lg border border-amber-500/30 text-[11px]">
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
          <span className="text-amber-300 font-bold">Kehribar:</span>
          <span className="text-slate-300">Hacim & KD Fırsatı</span>
          <span className="font-mono font-black text-amber-400 ml-1">({opportunityCount})</span>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto text-[11px]">
        <div className="hidden sm:flex items-center gap-1 text-slate-400">
          <span>Yoğunluk:</span>
          <span className="text-slate-300">Açık (%20-35) &rarr; Koyu (%60+)</span>
        </div>
        {onToggleSettings && (
          <button
            type="button"
            onClick={onToggleSettings}
            className="text-amber-300 hover:text-white font-bold hover:underline cursor-pointer flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-950/80 border border-indigo-700/50"
            title="Isı Haritası ve Vurgulayıcı Ayarlarını Düzenle"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>Ayarlar</span>
          </button>
        )}
      </div>
    </div>
  );
};

export interface VisualDiscrepancyHighlighterPanelProps {
  isActive?: boolean;
  onToggleActive?: () => void;
  threshold: DiscrepancyThreshold;
  onChangeThreshold: (th: DiscrepancyThreshold) => void;
  focusFilter: DiscrepancyFocusFilter;
  onChangeFocusFilter: (f: DiscrepancyFocusFilter) => void;
  onlyShowDiscrepancyRows: boolean;
  onToggleOnlyDiscrepancyRows: () => void;
  isPulseEnabled: boolean;
  onTogglePulse: () => void;
  analysis: DiscrepancyAnalysisResult;
  onClose: () => void;
  onFocusRow?: (rowId: string) => void;
}

/**
 * Visual Discrepancy Highlighter Control & Analytics Banner Component
 */
export const VisualDiscrepancyHighlighterPanel: React.FC<VisualDiscrepancyHighlighterPanelProps> = ({
  isActive = true,
  onToggleActive,
  threshold,
  onChangeThreshold,
  focusFilter,
  onChangeFocusFilter,
  onlyShowDiscrepancyRows,
  onToggleOnlyDiscrepancyRows,
  isPulseEnabled,
  onTogglePulse,
  analysis,
  onClose,
  onFocusRow
}) => {
  if (!isActive) return null;

  return (
    <div
      id="visual-discrepancy-highlighter-panel"
      data-testid="visual-discrepancy-highlighter-panel"
      className="mb-4 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-400/60 p-4 sm:p-5 text-white shadow-xl shadow-indigo-950/40 relative overflow-hidden transition-all animate-fadeIn"
    >
      {/* Decorative Glow Elements */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex items-start sm:items-center justify-between gap-3 pb-3 border-b border-indigo-800/60 flex-wrap relative z-10">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-indigo-500 flex items-center justify-center text-slate-950 shadow-md shadow-amber-400/25">
            <Sparkles className="w-4 h-4 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-black text-white text-sm sm:text-base tracking-tight flex items-center gap-1.5">
                <span>Görsel Farklılık Vurgulayıcı</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-mono text-[10px] font-black border border-amber-300">
                  %{threshold}+ Değişim Modu
                </span>
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-mono border border-emerald-500/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Otomatik Tarama Aktif</span>
              </span>
            </div>
            <p className="text-xs text-indigo-200/90 mt-0.5">
              Tablodaki tüm hücreler tarandı; rakiplerle aranızdaki en büyük performans farkları (≥ %{threshold}) otomatik renklendirildi.
            </p>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
            title="Vurgulayıcı Modunu Kapat"
            aria-label="Vurgulayıcı Modunu Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3.5 relative z-10">
        <div className="p-2.5 rounded-2xl bg-white/5 border border-indigo-400/20 backdrop-blur-xs flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0">
            <Gauge className="w-3.5 h-3.5 text-indigo-300" />
          </div>
          <div>
            <div className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">Taranan Veri</div>
            <div className="text-sm sm:text-base font-black font-mono text-white">
              {analysis.totalScannedPoints} <span className="text-[10px] font-normal text-slate-400">nokta</span>
            </div>
          </div>
        </div>

        <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-xs flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
          </div>
          <div>
            <div className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">Pozitif Üstünlük</div>
            <div className="text-sm sm:text-base font-black font-mono text-emerald-300">
              {analysis.positiveCount} <span className="text-[10px] font-normal text-emerald-400/80">hücre (%{threshold}+)</span>
            </div>
          </div>
        </div>

        <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 backdrop-blur-xs flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center shrink-0">
            <TrendingDown className="w-3.5 h-3.5 text-rose-400 stroke-[2.5]" />
          </div>
          <div>
            <div className="text-[10px] text-rose-300 font-bold uppercase tracking-wider">Kritik Sıra Açığı</div>
            <div className="text-sm sm:text-base font-black font-mono text-rose-300">
              {analysis.negativeCount} <span className="text-[10px] font-normal text-rose-400/80">hücre (%{threshold}+)</span>
            </div>
          </div>
        </div>

        <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 backdrop-blur-xs flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0">
            <Flame className="w-3.5 h-3.5 text-amber-400 stroke-[2.5]" />
          </div>
          <div>
            <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">Hacim / Fırsat Uçurumu</div>
            <div className="text-sm sm:text-base font-black font-mono text-amber-300">
              {analysis.opportunityCount} <span className="text-[10px] font-normal text-amber-400/80">kelime</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Filters & Options */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-indigo-800/60 text-xs relative z-10">
        {/* Threshold Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-300 font-bold flex items-center gap-1">
            <Percent className="w-3.5 h-3.5 text-amber-300" />
            <span>Fark Eşiği:</span>
          </span>
          {([15, 20, 30, 50] as DiscrepancyThreshold[]).map((th) => (
            <button
              key={th}
              type="button"
              id={`btn-variance-th-${th}`}
              data-testid={`btn-variance-th-${th}`}
              onClick={() => onChangeThreshold(th)}
              className={`px-2.5 py-1 rounded-xl font-mono font-black transition-all cursor-pointer text-xs ${
                threshold === th
                  ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30 scale-105"
                  : "bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700"
              }`}
              title={`En az %${th} performans farkı gösteren metrikleri tara`}
            >
              %{th}+ {th === 20 && "(Önerilen)"}
            </button>
          ))}
        </div>

        {/* Focus Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-indigo-900/80 flex-wrap">
          <button
            type="button"
            onClick={() => onChangeFocusFilter("all")}
            className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
              focusFilter === "all" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
            }`}
          >
            Tümü ({analysis.highlightedCount})
          </button>
          <button
            type="button"
            onClick={() => onChangeFocusFilter("positive_only")}
            className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1 ${
              focusFilter === "positive_only" ? "bg-emerald-600 text-white shadow-xs" : "text-emerald-400 hover:text-emerald-300"
            }`}
          >
            <ArrowUpRight className="w-3 h-3" />
            <span>Avantajlar ({analysis.positiveCount})</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeFocusFilter("negative_only")}
            className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1 ${
              focusFilter === "negative_only" ? "bg-rose-600 text-white shadow-xs" : "text-rose-400 hover:text-rose-300"
            }`}
          >
            <ArrowDownRight className="w-3 h-3" />
            <span>Kritik Açıklar ({analysis.negativeCount})</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeFocusFilter("extreme_only")}
            className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1 ${
              focusFilter === "extreme_only" ? "bg-amber-500 text-slate-950 shadow-xs" : "text-amber-400 hover:text-amber-300"
            }`}
          >
            <Flame className="w-3 h-3" />
            <span>Ekstrem Uçurumlar</span>
          </button>
        </div>

        {/* Toggles: Only Rows with Discrepancy & Pulse Animation */}
        <div className="flex items-center gap-2 flex-wrap">
          <label className="flex items-center gap-1.5 cursor-pointer bg-slate-800/80 hover:bg-slate-700/80 px-2.5 py-1 rounded-xl border border-slate-700 text-slate-200 select-none">
            <input
              type="checkbox"
              checked={onlyShowDiscrepancyRows}
              onChange={onToggleOnlyDiscrepancyRows}
              className="w-3.5 h-3.5 text-amber-400 bg-slate-900 border-slate-600 rounded focus:ring-amber-400 cursor-pointer"
            />
            <span className="text-[11px] font-bold">Sadece Farklı Satırları Göster</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer bg-slate-800/80 hover:bg-slate-700/80 px-2.5 py-1 rounded-xl border border-slate-700 text-slate-200 select-none">
            <input
              type="checkbox"
              checked={isPulseEnabled}
              onChange={onTogglePulse}
              className="w-3.5 h-3.5 text-indigo-400 bg-slate-900 border-slate-600 rounded focus:ring-indigo-400 cursor-pointer"
            />
            <span className="text-[11px] font-bold">Parlama Efekti</span>
          </label>
        </div>
      </div>

      {/* Visual Legend Strip */}
      <div className="mt-3 pt-2.5 border-t border-indigo-900/60 flex items-center justify-between gap-2 flex-wrap text-[11px] text-slate-300">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-bold text-slate-400">Renk Lejantı:</span>
          <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-lg border border-emerald-500/40">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Zümrüt Yeşil: %{threshold}+ Pozitif Üstünlük (Siteniz Önde)</span>
          </span>
          <span className="inline-flex items-center gap-1 bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-lg border border-rose-500/40">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span>Gül Kırmızı: %{threshold}+ Negatif Açık (Rakip Önde / Risk)</span>
          </span>
          <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-lg border border-amber-500/40">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Kehribar: %{threshold}+ Hacim & Fırsat Uçurumu</span>
          </span>
        </div>

        {/* Quick jump to extreme risks */}
        {analysis.topRisks.length > 0 && onFocusRow && (
          <div className="flex items-center gap-1 text-[11px]">
            <span className="text-slate-400">En Büyük Açık:</span>
            <button
              type="button"
              onClick={() => onFocusRow(analysis.topRisks[0].itemId)}
              className="text-amber-300 hover:text-amber-200 font-bold hover:underline cursor-pointer flex items-center gap-0.5"
            >
              <span>{analysis.topRisks[0].title} ({analysis.topRisks[0].badgeText})</span>
              <ArrowDownRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
