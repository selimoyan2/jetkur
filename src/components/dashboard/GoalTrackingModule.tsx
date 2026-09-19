import React, { useState } from "react";
import { 
  Target, 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Zap, 
  Sparkles, 
  RotateCcw, 
  Check, 
  ChevronDown, 
  ArrowUpRight,
  Info,
  Sliders,
  Flame,
  Award
} from "lucide-react";

export interface KeywordGoalItem {
  targetRank: number; // e.g. 1, 2, 3, 5, 10
  targetNote?: string;
  assignedAt?: string;
  itemId?: string;
  updatedAt?: string;
}

export interface GoalProgressResult {
  currentRank: number | null;
  targetRank: number;
  bestCompRank: number;
  attainmentPercent: number; // 0 - 150%
  deviationPercent: number; // 0 = exactly on target, positive = ahead of target, negative = trailing target
  rankDifference: number; // current - target (negative = ahead, positive = trailing)
  status: "achieved" | "ahead" | "on_track" | "moderate_deviation" | "critical_deviation" | "unranked";
  statusLabel: string;
  badgeBg: string;
  badgeText: string;
  barColor: string;
  advice: string;
  gapToComp: number; // currentRank - bestCompRank
}

/**
 * Calculates goal progress and percentage deviation against target and best competitor
 */
export function calculateGoalProgress(
  currentRank: number | null,
  targetRank: number,
  bestCompRank: number = 1
): GoalProgressResult {
  const safeTarget = Math.max(1, targetRank || 1);

  // If user is unranked / >20
  if (currentRank === null || currentRank === undefined) {
    return {
      currentRank: null,
      targetRank: safeTarget,
      bestCompRank,
      attainmentPercent: 8,
      deviationPercent: -92,
      rankDifference: 99,
      status: "unranked",
      statusLabel: "Sıralama Dışı",
      badgeBg: "bg-rose-100 text-rose-800 border-rose-200",
      badgeText: "text-rose-700",
      barColor: "bg-rose-500",
      advice: `İlk 20'ye girip #${safeTarget} hedefine ulaşmak için teknik SEO ve hedeflenmiş içerik gerekiyor.`,
      gapToComp: 99,
    };
  }

  const rankDiff = currentRank - safeTarget; // e.g., 5 - 2 = 3 (trailing by 3)
  const gapToComp = currentRank - bestCompRank;

  // Case 1: Surpassed target (e.g. Target #3, current #1)
  if (currentRank < safeTarget) {
    const bonus = (safeTarget - currentRank) * 20;
    const attainment = Math.min(150, 100 + bonus);
    const deviation = Math.round(((safeTarget - currentRank) / safeTarget) * 100);

    return {
      currentRank,
      targetRank: safeTarget,
      bestCompRank,
      attainmentPercent: attainment,
      deviationPercent: deviation,
      rankDifference: rankDiff,
      status: "ahead",
      statusLabel: `Hedefin Üstünde (+%${deviation})`,
      badgeBg: "bg-emerald-100 text-emerald-900 border-emerald-300",
      badgeText: "text-emerald-700",
      barColor: "bg-emerald-500",
      advice: `Hedeflenen #${safeTarget} sırasının önündesiniz (#${currentRank}). Liderliği korumak için içerik güncelliğini koruyun.`,
      gapToComp,
    };
  }

  // Case 2: Exactly on target (e.g. Target #1, current #1)
  if (currentRank === safeTarget) {
    return {
      currentRank,
      targetRank: safeTarget,
      bestCompRank,
      attainmentPercent: 100,
      deviationPercent: 0,
      rankDifference: 0,
      status: "achieved",
      statusLabel: "%100 Hedefe Ulaşıldı",
      badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-300",
      badgeText: "text-emerald-700",
      barColor: "bg-emerald-500",
      advice: `Tam hedeflenen #${safeTarget} sırasındasınız. SERP dalgalanmalarına karşı backlink profilini güçlendirin.`,
      gapToComp,
    };
  }

  // Case 3: Trailing target (currentRank > safeTarget)
  // Calculate deviation percentage based on how far current rank is from target
  // e.g. current = 4, target = 2 => rankDiff = 2 => deviation = -50%, attainment = 50%
  // e.g. current = 12, target = 3 => rankDiff = 9 => deviation = -75%, attainment = 25%
  const devRatio = (currentRank - safeTarget) / currentRank;
  const devPercent = -Math.min(95, Math.max(5, Math.round(devRatio * 100)));
  const attainment = Math.max(5, 100 + devPercent);

  if (attainment >= 75) {
    return {
      currentRank,
      targetRank: safeTarget,
      bestCompRank,
      attainmentPercent: attainment,
      deviationPercent: devPercent,
      rankDifference: rankDiff,
      status: "on_track",
      statusLabel: `Hedefe Yakın (${devPercent}%)`,
      badgeBg: "bg-indigo-100 text-indigo-900 border-indigo-300",
      badgeText: "text-indigo-700",
      barColor: "bg-indigo-500",
      advice: `Hedefe sadece ${rankDiff} sıra kaldı. Başlık optimizasyonu ve iç linklemeyle hızlıca hedefe ulaşılabilir.`,
      gapToComp,
    };
  } else if (attainment >= 50) {
    return {
      currentRank,
      targetRank: safeTarget,
      bestCompRank,
      attainmentPercent: attainment,
      deviationPercent: devPercent,
      rankDifference: rankDiff,
      status: "moderate_deviation",
      statusLabel: `Sapma Var (${devPercent}%)`,
      badgeBg: "bg-amber-100 text-amber-900 border-amber-300",
      badgeText: "text-amber-700",
      barColor: "bg-amber-500",
      advice: `Hedeflenen #${safeTarget} sırasının ${rankDiff} sıra gerisindesiniz. Rakip içerik kelime sayısını analiz edin.`,
      gapToComp,
    };
  } else {
    return {
      currentRank,
      targetRank: safeTarget,
      bestCompRank,
      attainmentPercent: attainment,
      deviationPercent: devPercent,
      rankDifference: rankDiff,
      status: "critical_deviation",
      statusLabel: `Kritik Sapma (${devPercent}%)`,
      badgeBg: "bg-rose-100 text-rose-900 border-rose-300",
      badgeText: "text-rose-700",
      barColor: "bg-rose-500",
      advice: `Ciddi bir sapma mevcut (${rankDiff} sıra fark). Kapsamlı içerik zenginleştirmesi ve sayfa hızı optimizasyonu gerekir.`,
      gapToComp,
    };
  }
}

/**
 * Quick target preset presets
 */
export const TARGET_RANK_PRESETS = [
  { rank: 1, label: "#1 Liderlik", icon: "👑", desc: "SERP 1. Sıra (En yüksek organik CTR)" },
  { rank: 3, label: "#3 İlk 3", icon: "🥉", desc: "İlk 3 sonuç (Ortalama %18 CTR)" },
  { rank: 5, label: "#5 İlk 5", icon: "🎯", desc: "İlk 5 sonuç (Görünür alan garantisi)" },
  { rank: 10, label: "#10 İlk Sayfa", icon: "📄", desc: "Google 1. sayfa (Temel görünürlük eşiği)" },
];

interface GoalTrackingCellProps {
  itemId: string;
  keyword: string;
  currentRank: number | null;
  bestCompRank: number;
  bestCompName?: string;
  targetRank: number;
  onUpdateTarget: (itemId: string, newTargetRank: number) => void;
  compact?: boolean;
}

/**
 * Interactive cell in each table row displaying the target selector,
 * percentage deviation, progress bar, and competitor gap comparison.
 */
export const GoalTrackingCell: React.FC<GoalTrackingCellProps> = ({
  itemId,
  keyword,
  currentRank,
  bestCompRank,
  bestCompName = "Rakip",
  targetRank,
  onUpdateTarget,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customInput, setCustomInput] = useState<string>(String(targetRank || 1));

  const progress = calculateGoalProgress(currentRank, targetRank, bestCompRank);

  const handleSelectPreset = (rank: number) => {
    onUpdateTarget(itemId, rank);
    setCustomInput(String(rank));
    setIsOpen(false);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customInput, 10);
    if (!isNaN(val) && val >= 1 && val <= 100) {
      onUpdateTarget(itemId, val);
      setIsOpen(false);
    }
  };

  return (
    <div 
      className="space-y-1 relative" 
      id={`goal-cell-${itemId}`}
      data-testid={`goal-cell-${itemId}`}
    >
      {/* Target Selector & Current Status Header */}
      <div className="flex items-center justify-between gap-1.5">
        <button
          type="button"
          id={`btn-target-selector-${itemId}`}
          data-testid={`btn-target-selector-${itemId}`}
          onClick={() => setIsOpen((prev) => !prev)}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-bold transition-all cursor-pointer shadow-2xs group"
          title={`"${keyword}" için hedeflenen sırayı değiştirin (Mevcut: #${targetRank})`}
        >
          <Target className="w-3 h-3 text-indigo-600 group-hover:scale-110 transition-transform" />
          <span className="font-mono">Hedef: #{targetRank}</span>
          <ChevronDown className={`w-2.5 h-2.5 text-indigo-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {/* Attainment % Badge */}
        <span 
          className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-black border ${progress.badgeBg}`}
          title={`Hedef Başarımı: %${progress.attainmentPercent} • Sapma: ${progress.deviationPercent > 0 ? `+${progress.deviationPercent}%` : `${progress.deviationPercent}%`}`}
        >
          {progress.deviationPercent === 0 
            ? "%100 Hedefte" 
            : progress.deviationPercent > 0 
            ? `+${progress.deviationPercent}%` 
            : `${progress.deviationPercent}%`}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden p-0.2 border border-slate-200/80">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${progress.barColor}`}
          style={{ width: `${Math.min(100, Math.max(5, progress.attainmentPercent))}%` }}
        />
      </div>

      {/* Status & Competitor Gap Context */}
      <div className="flex items-center justify-between text-[10px] text-slate-500 gap-1">
        <span className={`font-semibold truncate max-w-[120px] ${progress.badgeText}`}>
          {progress.statusLabel}
        </span>
        
        {/* Gap to Top Competitor */}
        {bestCompRank && (
          <span className="text-slate-400 font-mono text-[9px] shrink-0" title={`En iyi rakip #${bestCompRank} konumunda`}>
            {progress.gapToComp <= 0 ? (
              <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                <Check className="w-2.5 h-2.5" /> Rakip Önünde
              </span>
            ) : (
              <span>Rakibe: {progress.gapToComp} sıra</span>
            )}
          </span>
        )}
      </div>

      {/* Dropdown Popover for Setting Target */}
      {isOpen && (
        <div 
          className="absolute z-40 left-0 top-full mt-1.5 w-56 p-2.5 rounded-xl bg-white border border-slate-200 shadow-xl text-xs space-y-2 animate-in fade-in zoom-in-95"
          id={`popover-target-${itemId}`}
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
            <span className="font-bold text-slate-800 flex items-center gap-1 text-[11px]">
              <Target className="w-3 h-3 text-indigo-600" />
              <span>Hedef Sıralama Belirle</span>
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 text-[10px] font-medium"
            >
              Kapat
            </button>
          </div>

          {/* Quick Presets */}
          <div className="grid grid-cols-2 gap-1">
            {TARGET_RANK_PRESETS.map((preset) => (
              <button
                key={preset.rank}
                type="button"
                id={`btn-preset-${preset.rank}-${itemId}`}
                onClick={() => handleSelectPreset(preset.rank)}
                className={`px-2 py-1 rounded-lg text-left text-[11px] font-bold border transition-all flex items-center justify-between ${
                  targetRank === preset.rank
                    ? "bg-indigo-600 text-white border-indigo-700 shadow-xs"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                <span>{preset.icon} {preset.label}</span>
                {targetRank === preset.rank && <Check className="w-3 h-3" />}
              </button>
            ))}
          </div>

          {/* Dynamic Best Competitor Target */}
          {bestCompRank && bestCompRank > 1 && (
            <button
              type="button"
              id={`btn-preset-beat-comp-${itemId}`}
              onClick={() => handleSelectPreset(Math.max(1, bestCompRank - 1))}
              className="w-full px-2 py-1 rounded-lg text-left text-[10px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 flex items-center justify-between"
              title={`En iyi rakip #${bestCompRank}. Onun 1 sıra önüne geçmek için #${Math.max(1, bestCompRank - 1)} hedeflenir.`}
            >
              <span className="truncate">⚔️ {bestCompName.split(" ")[0]} Önüne Geç (#{Math.max(1, bestCompRank - 1)})</span>
              <ArrowUpRight className="w-3 h-3 text-amber-600 shrink-0" />
            </button>
          )}

          {/* Custom Input */}
          <form onSubmit={handleCustomSubmit} className="pt-1 border-t border-slate-100 flex items-center gap-1.5">
            <span className="text-[10px] text-slate-500 font-medium">Özel Sıra:</span>
            <input
              type="number"
              min="1"
              max="100"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              className="w-14 py-1 px-1.5 rounded-md bg-slate-50 border border-slate-200 text-center font-mono font-bold text-xs focus:outline-hidden focus:border-indigo-500"
              placeholder="Sıra #"
            />
            <button
              type="submit"
              id={`btn-apply-custom-target-${itemId}`}
              className="px-2 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold cursor-pointer"
            >
              Ata
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

interface GoalTrackingSummaryPanelProps {
  totalItems: number;
  goals: Record<string, KeywordGoalItem>;
  rankings: Array<{
    id: string;
    keyword: string;
    userRank: number | null;
    comp1Rank: number | null;
    comp2Rank: number | null;
    comp3Rank: number | null;
  }>;
  onApplyBulkTarget: (targetRank: number) => void;
  onApplyDynamicBeatCompetitorTargets: () => void;
  onResetGoals: () => void;
  onClose: () => void;
}

/**
 * Summary Banner and Controls for Goal Tracking Mode
 */
export const GoalTrackingSummaryPanel: React.FC<GoalTrackingSummaryPanelProps> = ({
  totalItems,
  goals,
  rankings,
  onApplyBulkTarget,
  onApplyDynamicBeatCompetitorTargets,
  onResetGoals,
  onClose,
}) => {
  // Aggregate statistics
  const stats = React.useMemo(() => {
    let totalAttainment = 0;
    let achievedCount = 0;
    let onTrackCount = 0;
    let moderateDeviationCount = 0;
    let criticalDeviationCount = 0;

    rankings.forEach((item) => {
      const compRanks = [item.comp1Rank, item.comp2Rank, item.comp3Rank].filter((r): r is number => r !== null);
      const bestComp = compRanks.length > 0 ? Math.min(...compRanks) : 1;
      const targetRank = goals[item.id]?.targetRank || (item.userRank && item.userRank <= 3 ? 1 : 3);
      
      const p = calculateGoalProgress(item.userRank, targetRank, bestComp);
      totalAttainment += p.attainmentPercent;

      if (p.status === "achieved" || p.status === "ahead") {
        achievedCount++;
      } else if (p.status === "on_track") {
        onTrackCount++;
      } else if (p.status === "moderate_deviation") {
        moderateDeviationCount++;
      } else {
        criticalDeviationCount++;
      }
    });

    const averageAttainment = rankings.length > 0 ? Math.round(totalAttainment / rankings.length) : 0;
    const averageDeviation = averageAttainment >= 100 ? averageAttainment - 100 : -(100 - averageAttainment);

    return {
      averageAttainment,
      averageDeviation,
      achievedCount,
      onTrackCount,
      moderateDeviationCount,
      criticalDeviationCount,
    };
  }, [rankings, goals]);

  return (
    <div 
      id="seo-goal-tracking-summary-banner"
      data-testid="seo-goal-tracking-summary-banner"
      className="p-4 rounded-2xl bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white border border-indigo-700/50 shadow-lg space-y-3.5 animate-in fade-in slide-in-from-top-2"
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shadow-inner">
            <Target className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                🎯 Gelişim İzleme & Hedef Değer Paneli
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold font-mono">
                MOD AKTİF
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Rakiplerin SERP sıralamalarına göre özelleştirilmiş hedefler atayın; sapmaları yüzdesel olarak takip edin.
            </p>
          </div>
        </div>

        {/* Action Buttons: Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            id="btn-bulk-goal-first-place"
            data-testid="btn-bulk-goal-first-place"
            onClick={() => onApplyBulkTarget(1)}
            className="px-2.5 py-1 rounded-xl bg-indigo-800/80 hover:bg-indigo-700 text-indigo-100 text-xs font-bold border border-indigo-600/60 flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-xs"
            title="Tüm kelimeler için #1 Liderlik hedefini atar"
          >
            <span>👑 Tümüne #1 Hedef</span>
          </button>

          <button
            type="button"
            id="btn-bulk-goal-top-three"
            data-testid="btn-bulk-goal-top-three"
            onClick={() => onApplyBulkTarget(3)}
            className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-xs"
            title="Tüm kelimeler için İlk 3 (#3) hedefini atar"
          >
            <span>🥉 Tümüne #3 Hedef</span>
          </button>

          <button
            type="button"
            id="btn-bulk-goal-beat-competitors"
            data-testid="btn-bulk-goal-beat-competitors"
            onClick={onApplyDynamicBeatCompetitorTargets}
            className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black border border-amber-400 flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-xs"
            title="Her kelimede en iyi rakibin 1 sıra önüne geçecek dinamik hedef belirler"
          >
            <Sparkles className="w-3 h-3 text-slate-950" />
            <span>Rakipleri Geçecek Hedef Ata</span>
          </button>

          <button
            type="button"
            id="btn-reset-all-goals"
            data-testid="btn-reset-all-goals"
            onClick={onResetGoals}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white text-xs transition-colors"
            title="Tüm hedefleri varsayılana sıfırla"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white text-xs transition-colors ml-1"
            title="Gelişim İzleme Modunu Kapat"
          >
            ✕
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* KPI 1: Ortalama Hedef Başarımı */}
        <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-300">
            <span>Ortalama Başarım</span>
            <Award className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-mono font-black text-white">
              %{stats.averageAttainment}
            </span>
            <span className={`text-[10px] font-mono font-bold ${
              stats.averageDeviation >= 0 ? "text-emerald-400" : "text-amber-400"
            }`}>
              {stats.averageDeviation >= 0 ? `+${stats.averageDeviation}%` : `${stats.averageDeviation}% Sapma`}
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                stats.averageAttainment >= 80 ? "bg-emerald-500" : stats.averageAttainment >= 50 ? "bg-indigo-500" : "bg-rose-500"
              }`}
              style={{ width: `${Math.min(100, Math.max(5, stats.averageAttainment))}%` }}
            />
          </div>
        </div>

        {/* KPI 2: Hedefe Ulaşanlar */}
        <div className="p-3 rounded-xl bg-slate-800/80 border border-emerald-500/30 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-emerald-300">
            <span>Hedefe Ulaşıldı (≥%100)</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-mono font-black text-emerald-400">
              {stats.achievedCount}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              / {rankings.length}
            </span>
          </div>
          <div className="text-[10px] text-emerald-300/80">
            Kelimenin %{rankings.length > 0 ? Math.round((stats.achievedCount / rankings.length) * 100) : 0}'i hedefte
          </div>
        </div>

        {/* KPI 3: Hedefe Yakın */}
        <div className="p-3 rounded-xl bg-slate-800/80 border border-indigo-500/30 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-indigo-300">
            <span>Hedefe Yakın (%75-%99)</span>
            <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-mono font-black text-indigo-300">
              {stats.onTrackCount}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              / {rankings.length}
            </span>
          </div>
          <div className="text-[10px] text-indigo-300/80">
            1-2 sıra iyileştirmeyle hedefte
          </div>
        </div>

        {/* KPI 4: Kritik Sapma */}
        <div className="p-3 rounded-xl bg-slate-800/80 border border-rose-500/30 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-rose-300">
            <span>Kritik Sapma (&lt;%50)</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-mono font-black text-rose-400">
              {stats.criticalDeviationCount + stats.moderateDeviationCount}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              kelime
            </span>
          </div>
          <div className="text-[10px] text-rose-300/80">
            İçerik ve teknik öncelik gerektirir
          </div>
        </div>
      </div>
    </div>
  );
};
