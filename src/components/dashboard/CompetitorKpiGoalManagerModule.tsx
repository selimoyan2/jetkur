import React, { useState, useEffect, useMemo } from "react";
import {
  Target,
  Trophy,
  TrendingUp,
  Award,
  Zap,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sliders,
  BarChart3,
  Gauge,
  MousePointerClick,
  Users,
  ArrowUpRight,
  HelpCircle,
  Save,
  Download,
  Flame,
  Check
} from "lucide-react";
import { CompetitorKeywordRanking, CompetitorContentMetric } from "../../types";

export interface CustomKpiGoals {
  trafficGrowthPercent: number; // e.g. 25 for +25%
  targetSeoScore: number; // e.g. 92 out of 100
  top3CoveragePercent: number; // e.g. 60 for 60% of keywords in Top 3
  targetSpeedScore: number; // e.g. 95 out of 100
  targetRankGap: number; // e.g. 0 (even or ahead of competitor)
  targetOrganicCtr: number; // e.g. 7.5%
  timeframeMonths: number; // e.g. 3, 6, 12 months
  updatedAt: string;
}

export const DEFAULT_KPI_GOALS: CustomKpiGoals = {
  trafficGrowthPercent: 25,
  targetSeoScore: 92,
  top3CoveragePercent: 55,
  targetSpeedScore: 95,
  targetRankGap: 0,
  targetOrganicCtr: 7.0,
  timeframeMonths: 6,
  updatedAt: new Date().toISOString()
};

export interface KpiGoalPreset {
  id: string;
  name: string;
  description: string;
  badge: string;
  badgeColor: string;
  goals: Partial<CustomKpiGoals>;
}

export const KPI_GOAL_PRESETS: KpiGoalPreset[] = [
  {
    id: "market-leader",
    name: "🏆 Agresif Pazar Liderliği",
    description: "Sektördeki tüm rakipleri geçmek ve kategori liderliğini kalıcı hale getirmek için maksimum hedefler.",
    badge: "Maksimum Büyüme",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-400/40",
    goals: {
      trafficGrowthPercent: 45,
      targetSeoScore: 96,
      top3CoveragePercent: 70,
      targetSpeedScore: 98,
      targetRankGap: -1.5,
      targetOrganicCtr: 9.0,
      timeframeMonths: 6
    }
  },
  {
    id: "balanced-growth",
    name: "⚡ Dengeli Büyüme & Hız",
    description: "Kullanıcı deneyimi (Web Vitals) ile organik sıralama artışını dengeli şekilde ölçekleyen sürdürülebilir model.",
    badge: "Önerilen",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40",
    goals: {
      trafficGrowthPercent: 25,
      targetSeoScore: 90,
      top3CoveragePercent: 50,
      targetSpeedScore: 95,
      targetRankGap: 0,
      targetOrganicCtr: 7.2,
      timeframeMonths: 6
    }
  },
  {
    id: "beat-top-competitor",
    name: "⚔️ Lider Rakibi Geç (Beat #1)",
    description: "Kategorideki 1 numaralı lider rakibin mevcut görünürlük ve trafik puanının %15 üzerine çıkmayı hedefler.",
    badge: "Rakip Odaklı",
    badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-400/40",
    goals: {
      trafficGrowthPercent: 35,
      targetSeoScore: 94,
      top3CoveragePercent: 65,
      targetSpeedScore: 96,
      targetRankGap: -1.0,
      targetOrganicCtr: 8.5,
      timeframeMonths: 3
    }
  },
  {
    id: "quick-wins",
    name: "🎯 Hızlı Kazanım & Boşluk Doldurma",
    description: "Mevcut geride olunan sıralama farkını (gap) kapatarak düşük asılı meyveleri toplamaya odaklanır.",
    badge: "Hızlı Etki",
    badgeColor: "bg-sky-500/20 text-sky-300 border-sky-400/40",
    goals: {
      trafficGrowthPercent: 15,
      targetSeoScore: 88,
      top3CoveragePercent: 40,
      targetSpeedScore: 92,
      targetRankGap: 0.5,
      targetOrganicCtr: 6.5,
      timeframeMonths: 3
    }
  }
];

interface CompetitorKpiGoalManagerModuleProps {
  rankings: CompetitorKeywordRanking[];
  competitors: CompetitorContentMetric[];
  userName?: string;
  userDomain?: string;
  onClose: () => void;
  onGoalsUpdated?: (goals: CustomKpiGoals) => void;
  isCompactMode?: boolean;
}

export const CompetitorKpiGoalManagerModule: React.FC<CompetitorKpiGoalManagerModuleProps> = ({
  rankings,
  competitors,
  userName = "Siteniz",
  userDomain = "",
  onClose,
  onGoalsUpdated,
  isCompactMode = false
}) => {
  const storageKey = `seo_competitor_kpi_goals_${userDomain || "default"}`;

  // State: custom goals
  const [goals, setGoals] = useState<CustomKpiGoals>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_KPI_GOALS, ...parsed };
      }
    } catch (_) {}
    return DEFAULT_KPI_GOALS;
  });

  const [activeTab, setActiveTab] = useState<"customize" | "benchmark" | "action_plan">("customize");
  const [isSavedFeedback, setIsSavedFeedback] = useState<boolean>(false);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  // Save to localStorage whenever goals change
  const saveGoals = (newGoals: CustomKpiGoals) => {
    setGoals(newGoals);
    try {
      localStorage.setItem(storageKey, JSON.stringify(newGoals));
      setIsSavedFeedback(true);
      setTimeout(() => setIsSavedFeedback(false), 2500);
      if (onGoalsUpdated) onGoalsUpdated(newGoals);
    } catch (e) {
      console.error("Failed to save KPI goals:", e);
    }
  };

  // Derive Current Performance Metrics from real rankings & competitors
  const currentMetrics = useMemo(() => {
    const totalKeywords = rankings.length || 1;
    
    // User ranks
    const validUserRanks = rankings.map((r) => r.userRank).filter((r): r is number => r !== null);
    const top3Count = validUserRanks.filter((r) => r <= 3).length;
    const top3Percent = Math.round((top3Count / totalKeywords) * 100);
    const avgUserRank = validUserRanks.length > 0 
      ? Number((validUserRanks.reduce((a, b) => a + b, 0) / validUserRanks.length).toFixed(1))
      : 22.0;

    // Best Competitor ranks
    const bestCompRanks = rankings.map((r) => {
      const valid = [r.comp1Rank, r.comp2Rank, r.comp3Rank].filter((n): n is number => n !== null);
      return valid.length > 0 ? Math.min(...valid) : 20;
    });
    const avgBestCompRank = Number((bestCompRanks.reduce((a, b) => a + b, 0) / totalKeywords).toFixed(1));
    const avgRankGap = Number((avgUserRank - avgBestCompRank).toFixed(1));

    // Traffic volume estimation
    const totalMonthlyVolume = rankings.reduce((acc, r) => {
      const cleaned = typeof r.monthlyVolume === "string" ? r.monthlyVolume.replace(/[^0-9]/g, "") : "";
      return acc + (cleaned ? parseInt(cleaned, 10) : 0);
    }, 0);

    // Baseline estimated monthly visits (approximated based on current ranks)
    const baseTrafficOpportunity = rankings.reduce((acc, r) => {
      const opp = typeof r.trafficOpportunity === "string" ? r.trafficOpportunity.replace(/[^0-9]/g, "") : r.trafficOpportunity;
      return acc + (typeof opp === "number" ? opp : opp ? parseInt(opp, 10) : 0);
    }, 0);

    const currentEstimatedTraffic = Math.max(12450, baseTrafficOpportunity * 3.5);
    const targetTraffic = Math.round(currentEstimatedTraffic * (1 + goals.trafficGrowthPercent / 100));
    const trafficGap = targetTraffic - currentEstimatedTraffic;

    // SEO visibility score (user default 84)
    const currentSeoScore = 84;
    const topComp = competitors[0] || { name: "Rakip A", visibilityScore: 89, speedScore: 74, domain: "rakip-a.com" };
    const secondComp = competitors[1] || { name: "Rakip B", visibilityScore: 82, speedScore: 81, domain: "rakip-b.com" };
    const thirdComp = competitors[2] || { name: "Rakip C", visibilityScore: 71, speedScore: 62, domain: "rakip-c.com" };

    const highestCompScore = Math.max(
      ...competitors.map((c) => c.visibilityScore || 75),
      89
    );

    // Current Speed score (user 98)
    const currentSpeedScore = 98;
    const currentOrganicCtr = 5.6;

    // Attainment calculations
    const trafficAttainment = Math.min(150, Math.round((currentEstimatedTraffic / targetTraffic) * 100));
    const seoScoreAttainment = Math.min(150, Math.round((currentSeoScore / goals.targetSeoScore) * 100));
    const top3Attainment = goals.top3CoveragePercent > 0 
      ? Math.min(150, Math.round((top3Percent / goals.top3CoveragePercent) * 100))
      : 100;
    const speedAttainment = Math.min(150, Math.round((currentSpeedScore / goals.targetSpeedScore) * 100));
    const ctrAttainment = Math.min(150, Math.round((currentOrganicCtr / goals.targetOrganicCtr) * 100));

    const overallAttainment = Math.round(
      (trafficAttainment + seoScoreAttainment + top3Attainment + speedAttainment + ctrAttainment) / 5
    );

    return {
      totalKeywords,
      totalMonthlyVolume,
      currentEstimatedTraffic,
      targetTraffic,
      trafficGap,
      currentSeoScore,
      highestCompScore,
      topComp,
      secondComp,
      thirdComp,
      currentSpeedScore,
      currentOrganicCtr,
      top3Count,
      top3Percent,
      avgUserRank,
      avgBestCompRank,
      avgRankGap,
      trafficAttainment,
      seoScoreAttainment,
      top3Attainment,
      speedAttainment,
      ctrAttainment,
      overallAttainment
    };
  }, [rankings, competitors, goals]);

  // Handle Preset Selection
  const handleApplyPreset = (preset: KpiGoalPreset) => {
    setActivePresetId(preset.id);
    const updated: CustomKpiGoals = {
      ...goals,
      ...preset.goals,
      updatedAt: new Date().toISOString()
    };
    saveGoals(updated);
  };

  // Handle Reset to Defaults
  const handleResetDefaults = () => {
    setActivePresetId(null);
    saveGoals(DEFAULT_KPI_GOALS);
  };

  return (
    <div
      id="competitor-kpi-goal-manager-module"
      data-testid="competitor-kpi-goal-manager-module"
      className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white border border-indigo-500/40 shadow-2xl space-y-6 animate-in fade-in duration-300 relative overflow-hidden"
    >
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* Top Banner & Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/90 pb-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/25 shrink-0">
            <Target className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                <span>Hedef Belirleme & Özel KPI Karşılaştırma Modülü</span>
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 text-[10px] font-black uppercase tracking-wider">
                {goals.timeframeMonths} Aylık Ufuk
              </span>
              {isSavedFeedback && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-bold animate-pulse">
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>Kaydedildi</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-0.5 max-w-2xl leading-relaxed">
              Rakiplerinizin performansıyla kıyaslamak için özel KPI hedefleri (Trafik Artış %, SEO Skoru, Top 3 Kapsama ve Sayfa Hızı) belirleyin; hedefe ulaşma sapmalarını gerçek zamanlı izleyin.
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 self-end md:self-auto shrink-0 flex-wrap">
          {/* Preset trigger indicator */}
          {activePresetId && (
            <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{KPI_GOAL_PRESETS.find((p) => p.id === activePresetId)?.name.split(" ")[1] || "Şablon"}</span>
            </span>
          )}

          <button
            type="button"
            id="btn-reset-kpi-goals"
            data-testid="btn-reset-kpi-goals"
            onClick={handleResetDefaults}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
            title="Hedefleri varsayılan değerlere sıfırla"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Varsayılana Dön</span>
          </button>

          <button
            type="button"
            id="btn-close-kpi-goals-panel"
            data-testid="btn-close-kpi-goals-panel"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-all flex items-center justify-center cursor-pointer active:scale-95"
            title="Paneli Kapat"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="relative z-10 flex items-center gap-2 border-b border-slate-800/80 pb-3 overflow-x-auto">
        <button
          type="button"
          id="tab-kpi-customize"
          data-testid="tab-kpi-customize"
          onClick={() => setActiveTab("customize")}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "customize"
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/40"
              : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60"
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-amber-300" />
          <span>Hedefleri Özelleştir & Kaydırıcılar</span>
        </button>

        <button
          type="button"
          id="tab-kpi-benchmark"
          data-testid="tab-kpi-benchmark"
          onClick={() => setActiveTab("benchmark")}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "benchmark"
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/40"
              : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60"
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-emerald-300" />
          <span>Rakiplerle KPI Kıyaslama Matrisi</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-950/70 text-emerald-300 text-[10px] font-mono">
            {competitors.length} Rakip
          </span>
        </button>

        <button
          type="button"
          id="tab-kpi-action-plan"
          data-testid="tab-kpi-action-plan"
          onClick={() => setActiveTab("action_plan")}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "action_plan"
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/40"
              : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Stratejik Eylem & Yol Haritası</span>
        </button>
      </div>

      {/* KPI Highlight Summary Cards (Current vs Target Overview) */}
      <div className="relative z-10 grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* KPI 1: Trafik Artış Hedefi */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-indigo-500/30 space-y-2 hover:border-indigo-400/50 transition-colors">
          <div className="flex items-center justify-between text-xs text-indigo-200">
            <span className="font-bold flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-amber-300" />
              <span>Trafik Artış Hedefi</span>
            </span>
            <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold">
              +%{goals.trafficGrowthPercent}
            </span>
          </div>
          <div className="space-y-0.5">
            <div className="text-xl font-black font-mono text-white">
              {currentMetrics.targetTraffic.toLocaleString()} <span className="text-xs text-slate-400 font-normal">/ ay</span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Mevcut: {Math.round(currentMetrics.currentEstimatedTraffic).toLocaleString()}</span>
              <span className="text-emerald-400 font-bold">+{currentMetrics.trafficGap.toLocaleString()}</span>
            </div>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                currentMetrics.trafficAttainment >= 100 ? "bg-emerald-400" : "bg-gradient-to-r from-indigo-500 to-amber-400"
              }`}
              style={{ width: `${Math.min(100, Math.max(5, currentMetrics.trafficAttainment))}%` }}
            />
          </div>
        </div>

        {/* KPI 2: SEO Görünürlük Skoru */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-purple-500/30 space-y-2 hover:border-purple-400/50 transition-colors">
          <div className="flex items-center justify-between text-xs text-purple-200">
            <span className="font-bold flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>SEO Skor Hedefi</span>
            </span>
            <span className="px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold">
              {goals.targetSeoScore} Puan
            </span>
          </div>
          <div className="space-y-0.5">
            <div className="text-xl font-black font-mono text-white flex items-baseline gap-1.5">
              <span>{currentMetrics.currentSeoScore}</span>
              <span className="text-xs text-slate-400 font-normal">/ {goals.targetSeoScore} Hedef</span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Lider Rakip: {currentMetrics.highestCompScore}</span>
              <span className={currentMetrics.currentSeoScore >= goals.targetSeoScore ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                {goals.targetSeoScore - currentMetrics.currentSeoScore > 0 ? `-${goals.targetSeoScore - currentMetrics.currentSeoScore} pt` : "Hedefte"}
              </span>
            </div>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-400 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(5, currentMetrics.seoScoreAttainment))}%` }}
            />
          </div>
        </div>

        {/* KPI 3: İlk 3 (Top 3) Kapsama */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 space-y-2 hover:border-emerald-400/50 transition-colors">
          <div className="flex items-center justify-between text-xs text-emerald-200">
            <span className="font-bold flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>Top 3 Kapsama Hedefi</span>
            </span>
            <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
              %{goals.top3CoveragePercent}
            </span>
          </div>
          <div className="space-y-0.5">
            <div className="text-xl font-black font-mono text-white flex items-baseline gap-1.5">
              <span>%{currentMetrics.top3Percent}</span>
              <span className="text-xs text-slate-400 font-normal">({currentMetrics.top3Count} Kelime)</span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Hedef: %{goals.top3CoveragePercent}</span>
              <span className={currentMetrics.top3Percent >= goals.top3CoveragePercent ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                {currentMetrics.top3Percent >= goals.top3CoveragePercent ? "Ulaşıldı 🚀" : `%${goals.top3CoveragePercent - currentMetrics.top3Percent} Kaldı`}
              </span>
            </div>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(5, currentMetrics.top3Attainment))}%` }}
            />
          </div>
        </div>

        {/* KPI 4: Sayfa Hızı PSI */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-2 hover:border-amber-400/50 transition-colors">
          <div className="flex items-center justify-between text-xs text-amber-200">
            <span className="font-bold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Sayfa Hızı (PSI)</span>
            </span>
            <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">
              {goals.targetSpeedScore}+
            </span>
          </div>
          <div className="space-y-0.5">
            <div className="text-xl font-black font-mono text-white flex items-baseline gap-1.5">
              <span className="text-emerald-400">{currentMetrics.currentSpeedScore}</span>
              <span className="text-xs text-slate-400 font-normal">/ {goals.targetSpeedScore} Hedef</span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Lider Rakip: {currentMetrics.secondComp.speedScore || 81}</span>
              <span className="text-emerald-400 font-bold">Hedef Aşıldı ✨</span>
            </div>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: "100%" }}
            />
          </div>
        </div>

        {/* KPI 5: Genel Hedef Başarımı */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-900/80 to-purple-900/80 border border-indigo-400/50 space-y-2">
          <div className="flex items-center justify-between text-xs text-indigo-200">
            <span className="font-bold flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-amber-300" />
              <span>Genel Başarım</span>
            </span>
            <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-white text-[10px] font-mono font-black">
              ORTALAMA
            </span>
          </div>
          <div className="space-y-0.5">
            <div className="text-xl font-black font-mono text-amber-300">
              %{currentMetrics.overallAttainment}
            </div>
            <div className="text-[11px] text-slate-300">
              {currentMetrics.overallAttainment >= 90
                ? "🏆 Mükemmel İlerleme"
                : currentMetrics.overallAttainment >= 75
                ? "📈 İyi Durumda"
                : "⚠️ İyileştirme Gerekiyor"}
            </div>
          </div>
          <div className="w-full bg-slate-950/60 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                currentMetrics.overallAttainment >= 85 ? "bg-amber-400" : "bg-indigo-400"
              }`}
              style={{ width: `${Math.min(100, Math.max(5, currentMetrics.overallAttainment))}%` }}
            />
          </div>
        </div>
      </div>

      {/* TAB 1: Hedefleri Özelleştir & Kaydırıcılar */}
      {activeTab === "customize" && (
        <div className="relative z-10 space-y-6 animate-in fade-in">
          {/* Quick Preset Cards */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Hazır Stratejik Hedef Şablonları</span>
              </label>
              <span className="text-[11px] text-slate-400">Tek tıkla sektör standartlarına göre uygulayın</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {KPI_GOAL_PRESETS.map((preset) => {
                const isSelected = activePresetId === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => handleApplyPreset(preset)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 flex flex-col justify-between ${
                      isSelected
                        ? "bg-gradient-to-br from-indigo-950 to-purple-950 border-amber-400/80 ring-2 ring-amber-400/30 shadow-lg shadow-indigo-950/50 scale-[1.01]"
                        : "bg-slate-900/80 hover:bg-slate-800/90 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-black text-white">{preset.name}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-black border ${preset.badgeColor}`}>
                          {preset.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {preset.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-300 font-mono">
                      <span>Trafik: +%{preset.goals.trafficGrowthPercent}</span>
                      <span>SEO: {preset.goals.targetSeoScore} pt</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Sliders & Numeric Controls Grid */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>Özel KPI Parametreleri & Ayarlar</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Slider 1: Trafik Artış Hedefi % */}
              <div className="space-y-2 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                    <span>Trafik Artış Hedefi (%)</span>
                  </label>
                  <span className="text-xs font-mono font-black text-amber-300 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-400/30">
                    +%{goals.trafficGrowthPercent}
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="150"
                  step="5"
                  value={goals.trafficGrowthPercent}
                  onChange={(e) => {
                    setActivePresetId(null);
                    saveGoals({ ...goals, trafficGrowthPercent: parseInt(e.target.value, 10) });
                  }}
                  className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>+5% (Temkinli)</span>
                  <span>+50% (Agresif)</span>
                  <span>+150% (Maks)</span>
                </div>
                <div className="text-[11px] text-slate-400 pt-1">
                  Öngörülen Aylık Ziyaretçi: <strong className="text-white font-mono">{currentMetrics.targetTraffic.toLocaleString()}</strong>
                </div>
              </div>

              {/* Slider 2: Hedef SEO Görünürlük Skoru */}
              <div className="space-y-2 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-purple-400" />
                    <span>Hedef SEO Skoru (0-100)</span>
                  </label>
                  <span className="text-xs font-mono font-black text-purple-300 px-2 py-0.5 rounded-md bg-purple-500/15 border border-purple-400/30">
                    {goals.targetSeoScore} Puan
                  </span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="100"
                  step="1"
                  value={goals.targetSeoScore}
                  onChange={(e) => {
                    setActivePresetId(null);
                    saveGoals({ ...goals, targetSeoScore: parseInt(e.target.value, 10) });
                  }}
                  className="w-full accent-purple-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>70 pt</span>
                  <span>85 pt (Sektör Ort.)</span>
                  <span>100 pt</span>
                </div>
                <div className="text-[11px] text-slate-400 pt-1">
                  En Güçlü Rakip: <strong className="text-white font-mono">{currentMetrics.highestCompScore} pt</strong> ({currentMetrics.topComp.name})
                </div>
              </div>

              {/* Slider 3: İlk 3 (Top 3) Sıralama Kapsama Hedefi */}
              <div className="space-y-2 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Top 3 Kapsama Oranı (%)</span>
                  </label>
                  <span className="text-xs font-mono font-black text-emerald-300 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-400/30">
                    %{goals.top3CoveragePercent}
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={goals.top3CoveragePercent}
                  onChange={(e) => {
                    setActivePresetId(null);
                    saveGoals({ ...goals, top3CoveragePercent: parseInt(e.target.value, 10) });
                  }}
                  className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>%10</span>
                  <span>%50 (Liderlik)</span>
                  <span>%100</span>
                </div>
                <div className="text-[11px] text-slate-400 pt-1">
                  Gereken Kelime Sayısı: <strong className="text-white font-mono">{Math.round((goals.top3CoveragePercent / 100) * currentMetrics.totalKeywords)}</strong> / {currentMetrics.totalKeywords} kelime
                </div>
              </div>

              {/* Slider 4: Hedef Sayfa Hızı (PSI) */}
              <div className="space-y-2 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Sayfa Hızı Hedefi (PSI)</span>
                  </label>
                  <span className="text-xs font-mono font-black text-amber-300 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-400/30">
                    {goals.targetSpeedScore} Skor
                  </span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="100"
                  step="1"
                  value={goals.targetSpeedScore}
                  onChange={(e) => {
                    setActivePresetId(null);
                    saveGoals({ ...goals, targetSpeedScore: parseInt(e.target.value, 10) });
                  }}
                  className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>60 (Orta)</span>
                  <span>90 (İyi)</span>
                  <span>100 (Kusursuz)</span>
                </div>
                <div className="text-[11px] text-slate-400 pt-1">
                  Mevcut Siteniz: <strong className="text-emerald-400 font-mono">98/100</strong> (Yeşil Bölge)
                </div>
              </div>

              {/* Slider 5: Sıra Farkı (Rank Gap) Hedefi */}
              <div className="space-y-2 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-sky-400" />
                    <span>Lider Rakip Sıra Farkı (Gap)</span>
                  </label>
                  <span className="text-xs font-mono font-black text-sky-300 px-2 py-0.5 rounded-md bg-sky-500/15 border border-sky-400/30">
                    {goals.targetRankGap <= 0 ? `${Math.abs(goals.targetRankGap)} Sıra Önde` : `+${goals.targetRankGap} Geride`}
                  </span>
                </div>
                <input
                  type="range"
                  min="-3"
                  max="3"
                  step="0.5"
                  value={goals.targetRankGap}
                  onChange={(e) => {
                    setActivePresetId(null);
                    saveGoals({ ...goals, targetRankGap: parseFloat(e.target.value) });
                  }}
                  className="w-full accent-sky-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>-3 Sıra Önde</span>
                  <span>0 (Eşit Lider)</span>
                  <span>+3 Geride</span>
                </div>
                <div className="text-[11px] text-slate-400 pt-1">
                  Mevcut Gap: <strong className="text-amber-400 font-mono">+{currentMetrics.avgRankGap} Sıra Geride</strong>
                </div>
              </div>

              {/* Slider 6: Hedef Ufku (Zaman Çerçevesi) */}
              <div className="space-y-2 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Hedef Ulaşım Ufku</span>
                  </label>
                  <span className="text-xs font-mono font-black text-indigo-300 px-2 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-400/30">
                    {goals.timeframeMonths} Ay
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {[1, 3, 6, 12].map((months) => (
                    <button
                      key={months}
                      type="button"
                      onClick={() => saveGoals({ ...goals, timeframeMonths: months })}
                      className={`py-1.5 rounded-lg text-xs font-bold font-mono transition-colors ${
                        goals.timeframeMonths === months
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      {months} Ay
                    </button>
                  ))}
                </div>
                <div className="text-[11px] text-slate-400 pt-1">
                  Aylık Gereken Ortalama Büyüme: <strong className="text-white font-mono">+%{(goals.trafficGrowthPercent / goals.timeframeMonths).toFixed(1)} / ay</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Rakiplerle KPI Kıyaslama Matrisi */}
      {activeTab === "benchmark" && (
        <div className="relative z-10 space-y-4 animate-in fade-in">
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-slate-300 border-b border-slate-800 font-bold">
                  <th className="py-3 px-4">Metrik & Karşılaştırma Alanı</th>
                  <th className="py-3 px-4 bg-indigo-950/60 text-amber-300 border-x border-indigo-800/50">
                    🎯 Belirlenen Hedef
                  </th>
                  <th className="py-3 px-4 text-emerald-400">
                    ⭐ {userName} (Mevcut)
                  </th>
                  {competitors.slice(0, 3).map((comp, idx) => (
                    <th key={comp.domain || idx} className="py-3 px-4 text-slate-300">
                      {comp.name}
                    </th>
                  ))}
                  <th className="py-3 px-4 text-center">Hedef Durumu & Delta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {/* Row 1: SEO Görünürlük Skoru */}
                <tr className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-purple-400" />
                    <span>SEO Görünürlük Skoru</span>
                  </td>
                  <td className="py-3 px-4 font-mono font-black text-amber-300 bg-indigo-950/40 border-x border-indigo-800/50">
                    {goals.targetSeoScore} Puan
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                    {currentMetrics.currentSeoScore} Puan
                  </td>
                  {competitors.slice(0, 3).map((c, i) => (
                    <td key={i} className="py-3 px-4 font-mono text-slate-300">
                      {c.visibilityScore || 75} Puan
                    </td>
                  ))}
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold">
                      {goals.targetSeoScore - currentMetrics.currentSeoScore > 0 ? `-${goals.targetSeoScore - currentMetrics.currentSeoScore} pt Kaldı` : "Hedef Aşıldı"}
                    </span>
                  </td>
                </tr>

                {/* Row 2: Aylık Organik Trafik */}
                <tr className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                    <span>Aylık Organik Trafik</span>
                  </td>
                  <td className="py-3 px-4 font-mono font-black text-amber-300 bg-indigo-950/40 border-x border-indigo-800/50">
                    {currentMetrics.targetTraffic.toLocaleString()} (+%{goals.trafficGrowthPercent})
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                    {Math.round(currentMetrics.currentEstimatedTraffic).toLocaleString()}
                  </td>
                  {competitors.slice(0, 3).map((c, i) => {
                    const est = Math.round(currentMetrics.currentEstimatedTraffic * (0.85 + (i * 0.2)));
                    return (
                      <td key={i} className="py-3 px-4 font-mono text-slate-300">
                        {est.toLocaleString()}
                      </td>
                    );
                  })}
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[10px] font-bold">
                      +{currentMetrics.trafficGap.toLocaleString()} Ziyaretçi Gerekiyor
                    </span>
                  </td>
                </tr>

                {/* Row 3: İlk 3 (Top 3) Kapsama Oranı */}
                <tr className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-400" />
                    <span>Top 3 Sıralama Kapsama</span>
                  </td>
                  <td className="py-3 px-4 font-mono font-black text-amber-300 bg-indigo-950/40 border-x border-indigo-800/50">
                    %{goals.top3CoveragePercent}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                    %{currentMetrics.top3Percent}
                  </td>
                  {competitors.slice(0, 3).map((c, i) => (
                    <td key={i} className="py-3 px-4 font-mono text-slate-300">
                      %{Math.max(25, 45 - (i * 7))}
                    </td>
                  ))}
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      currentMetrics.top3Percent >= goals.top3CoveragePercent
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                    }`}>
                      {currentMetrics.top3Percent >= goals.top3CoveragePercent ? "Hedefte" : `%${goals.top3CoveragePercent - currentMetrics.top3Percent} Gelişim Lazım`}
                    </span>
                  </td>
                </tr>

                {/* Row 4: Core Web Vitals Hız Skoru */}
                <tr className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>PageSpeed (PSI) Hız Skoru</span>
                  </td>
                  <td className="py-3 px-4 font-mono font-black text-amber-300 bg-indigo-950/40 border-x border-indigo-800/50">
                    {goals.targetSpeedScore} Skor
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                    {currentMetrics.currentSpeedScore} Skor (Lider)
                  </td>
                  {competitors.slice(0, 3).map((c, i) => (
                    <td key={i} className="py-3 px-4 font-mono text-slate-300">
                      {c.speedScore || (70 + i * 5)} Skor
                    </td>
                  ))}
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold">
                      🚀 Lider & Hedef Üstü (+3 pt)
                    </span>
                  </td>
                </tr>

                {/* Row 5: Lider Rakip Sıra Farkı (Gap) */}
                <tr className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-sky-400" />
                    <span>Lider Rakip Sıralama Farkı (Gap)</span>
                  </td>
                  <td className="py-3 px-4 font-mono font-black text-amber-300 bg-indigo-950/40 border-x border-indigo-800/50">
                    {goals.targetRankGap <= 0 ? `${Math.abs(goals.targetRankGap)} Sıra Önde` : "0 (Eşit)"}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-amber-400">
                    +{currentMetrics.avgRankGap} Sıra Geride
                  </td>
                  {competitors.slice(0, 3).map((c, i) => (
                    <td key={i} className="py-3 px-4 font-mono text-slate-300">
                      #{i + 1} Sırada
                    </td>
                  ))}
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/30 text-[10px] font-bold">
                      {currentMetrics.avgRankGap > 0 ? `${currentMetrics.avgRankGap} Sıra Kapatılmalı` : "Önde"}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Stratejik Eylem & Yol Haritası */}
      {activeTab === "action_plan" && (
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in">
          {/* Eylem Kartı 1 */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30 space-y-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black text-white">Trafik Artış Hedefi İçin Öncelikli Aksiyon</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Belirlediğiniz <strong className="text-emerald-300 font-bold">+%{goals.trafficGrowthPercent}</strong> trafik artışına ulaşmak için arama hacmi yüksek ve zorluk derecesi 50'nin altındaki <strong>{Math.ceil(currentMetrics.totalKeywords * 0.3)}</strong> fırsat kelimesine odaklanın.
            </p>
            <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-[10px] text-emerald-300 font-mono">
              Gereken Aylık Büyüme: +%{(goals.trafficGrowthPercent / goals.timeframeMonths).toFixed(1)} / ay
            </div>
          </div>

          {/* Eylem Kartı 2 */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-purple-500/30 space-y-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/30 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black text-white">SEO Skorunu {goals.targetSeoScore} Seviyesine Çıkarma</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Mevcut <strong>{currentMetrics.currentSeoScore}</strong> olan SEO skorunuzu <strong>{goals.targetSeoScore}</strong> hedefine ulaştırmak için lider rakip <em>{currentMetrics.topComp.name}</em>'nin ilk 3'te olduğu ve sizin henüz yer almadığınız boşluk kelimelerini kapatın.
            </p>
            <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-[10px] text-purple-300 font-mono">
              Hedef Farkı: {goals.targetSeoScore - currentMetrics.currentSeoScore} Puan
            </div>
          </div>

          {/* Eylem Kartı 3 */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center justify-center">
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <h4 className="text-xs font-black text-white">Hız Üstünlüğünü Trafiğe Dönüştürün</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Sitenizin PageSpeed skoru <strong>{currentMetrics.currentSpeedScore}/100</strong> ile tüm rakiplerin oldukça üzerinde. Bu teknik üstünlüğü zengin snippet'lar (Rich Results) ve FAQ şemaları ile destekleyerek organik CTR'yi %{goals.targetOrganicCtr}'ye yükseltin.
            </p>
            <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-[10px] text-amber-300 font-mono">
              Rakip Hız Ortalaması: 72/100 (Siz: 98/100)
            </div>
          </div>
        </div>
      )}

      {/* Bottom Status Bar */}
      <div className="relative z-10 pt-4 border-t border-slate-800/90 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>
            Özel KPI hedefleriniz yerel tarayıcı önbelleğinde kaydedildi. Karşılaştırma tablosunda hedeflere göre analiz yapılabilir.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="btn-apply-kpi-goals-close"
            data-testid="btn-apply-kpi-goals-close"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs transition-all shadow-md shadow-indigo-600/30 cursor-pointer active:scale-95"
          >
            Hedefleri Uygula & Tabloya Dön
          </button>
        </div>
      </div>
    </div>
  );
};
export default CompetitorKpiGoalManagerModule;
