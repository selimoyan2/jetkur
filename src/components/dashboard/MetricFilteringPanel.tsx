import React from "react";
import {
  SlidersHorizontal,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Target,
  Trophy,
  BarChart2,
  Filter,
  Eye,
  EyeOff,
  ChevronDown,
  Check,
  X,
  Zap,
  Layers,
  HelpCircle
} from "lucide-react";
import { CompetitorKeywordRanking, CompetitorContentMetric } from "../../types";
import { RankingSortField } from "./CompetitiveKeywordRankingTable";

export function parseVolumeNumber(val: string | number | undefined | null): number {
  if (val === undefined || val === null) return 0;
  if (typeof val === "number") return isNaN(val) ? 0 : val;
  const str = String(val).trim();
  const clean = str.replace(/[^0-9.]/g, "");
  const num = parseFloat(clean);
  if (isNaN(num)) return 0;
  if (str.toUpperCase().includes("K")) return num * 1000;
  if (str.toUpperCase().includes("M")) return num * 1000000;
  return num;
}

export function parseTrafficOpportunity(val: string | number | undefined | null): number {
  if (val === undefined || val === null) return 0;
  if (typeof val === "number") return isNaN(val) ? 0 : val;
  const str = String(val).trim();
  const clean = str.replace(/[^0-9.]/g, "");
  const num = parseFloat(clean);
  if (isNaN(num)) return 0;
  if (str.toUpperCase().includes("K")) return num * 1000;
  return num;
}

export interface MetricFilteringPanelProps {
  rankings: CompetitorKeywordRanking[];
  visibleCount: number;
  totalCount: number;
  hiddenCount: number;
  // Sort states
  sortBy: RankingSortField;
  onSortByChange: (field: RankingSortField) => void;
  sortOrder: "asc" | "desc";
  onSortOrderChange: (order: "asc" | "desc") => void;
  // Metric thresholds
  minVolume: number;
  onMinVolumeChange: (val: number) => void;
  minDifficulty: number;
  onMinDifficultyChange: (val: number) => void;
  minTrafficOpportunity: number;
  onMinTrafficOpportunityChange: (val: number) => void;
  maxRankLimit: number | null;
  onMaxRankLimitChange: (val: number | null) => void;
  // Quick Presets
  activePreset: string | null;
  onApplyPreset: (presetId: string) => void;
  onResetAllFilters: () => void;
  // Panel collapse
  isOpen: boolean;
  onToggleOpen: () => void;
  // Competitor info
  competitors: CompetitorContentMetric[];
  userName?: string;
}

export const MetricFilteringPanel: React.FC<MetricFilteringPanelProps> = ({
  rankings,
  visibleCount,
  totalCount,
  hiddenCount,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  minVolume,
  onMinVolumeChange,
  minDifficulty,
  onMinDifficultyChange,
  minTrafficOpportunity,
  onMinTrafficOpportunityChange,
  maxRankLimit,
  onMaxRankLimitChange,
  activePreset,
  onApplyPreset,
  onResetAllFilters,
  isOpen,
  onToggleOpen,
  competitors,
  userName = "Siteniz"
}) => {
  const comp1 = competitors[0] || { name: "1. Rakip" };
  const comp2 = competitors[1] || { name: "2. Rakip" };
  const comp3 = competitors[2] || { name: "3. Rakip" };

  // Calculate active filter count
  const activeFiltersCount = 
    (minVolume > 0 ? 1 : 0) +
    (minDifficulty > 0 ? 1 : 0) +
    (minTrafficOpportunity > 0 ? 1 : 0) +
    (maxRankLimit !== null ? 1 : 0);

  // Metric Sort Options
  const sortOptions: { id: RankingSortField; label: string; icon: React.ReactNode; descText: string }[] = [
    { 
      id: "volume", 
      label: "Arama Hacmi / Trafik", 
      icon: <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />,
      descText: "Aylık SERP hacmine göre" 
    },
    { 
      id: "difficulty", 
      label: "SEO Skoru (KD)", 
      icon: <Target className="w-3.5 h-3.5 text-amber-600" />,
      descText: "Kelime zorluk skoruna göre" 
    },
    { 
      id: "traffic", 
      label: "Trafik Fırsatı", 
      icon: <Zap className="w-3.5 h-3.5 text-emerald-600" />,
      descText: "Tahmini ziyaretçi artışına göre" 
    },
    { 
      id: "userRank", 
      label: "Sitenizin Sıralaması", 
      icon: <Trophy className="w-3.5 h-3.5 text-amber-500" />,
      descText: "Google SERP pozisyonuna göre" 
    },
    { 
      id: "gap", 
      label: "Sıralama Farkı (Gap)", 
      icon: <BarChart2 className="w-3.5 h-3.5 text-rose-500" />,
      descText: "Rakiple aradaki farka göre" 
    },
    { 
      id: "comp1Rank", 
      label: `1. Rakip (${comp1.name.split(" ")[0]})`, 
      icon: <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />,
      descText: "Lider rakip sıralaması" 
    },
    { 
      id: "comp2Rank", 
      label: `2. Rakip (${comp2.name.split(" ")[0]})`, 
      icon: <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />,
      descText: "2. rakip sıralaması" 
    },
    { 
      id: "comp3Rank", 
      label: `3. Rakip (${comp3.name.split(" ")[0]})`, 
      icon: <span className="w-2.5 h-2.5 rounded-full bg-violet-500 shrink-0" />,
      descText: "3. rakip sıralaması" 
    },
  ];

  return (
    <div
      id="metric-filtering-panel"
      data-testid="metric-filtering-panel"
      className="rounded-3xl bg-white border border-slate-200/90 shadow-md shadow-slate-200/50 overflow-hidden transition-all duration-200"
    >
      {/* 1. PANEL HEADER */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-md shadow-amber-400/20 shrink-0">
            <SlidersHorizontal className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-2">
                <span>Metrik Filtreleme Paneli</span>
              </h3>
              
              {/* Active Filter Badges */}
              <span
                id="badge-metric-active-count"
                data-testid="badge-metric-active-count"
                className={`px-2.5 py-0.5 rounded-full text-xs font-black tracking-tight ${
                  activeFiltersCount > 0 
                    ? "bg-amber-400 text-slate-950 shadow-xs" 
                    : "bg-slate-800 text-slate-300 border border-slate-700"
                }`}
              >
                {activeFiltersCount > 0 ? `${activeFiltersCount} Eşik Aktif` : "Tüm Veriler Açık"}
              </span>

              {hiddenCount > 0 && (
                <span
                  id="badge-metric-hidden-count"
                  data-testid="badge-metric-hidden-count"
                  className="px-2.5 py-0.5 rounded-full text-xs font-black tracking-tight bg-rose-500 text-white shadow-xs flex items-center gap-1"
                >
                  <EyeOff className="w-3 h-3" />
                  <span>{hiddenCount} Kayıt Gizlendi</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              Tüm rakip verilerini metrik tipine göre sıralayın veya belirlediğiniz eşiğin altında kalanları anlık olarak gizleyin.
            </p>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
          {/* Reset All Filters Button */}
          {(activeFiltersCount > 0 || sortBy !== "userRank" || sortOrder !== "asc") && (
            <button
              type="button"
              id="btn-metric-filter-reset"
              data-testid="btn-metric-filter-reset"
              onClick={onResetAllFilters}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
              title="Tüm metrik eşiklerini sıfırlayın ve sıralamayı varsayılana döndürün"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Filtreleri Sıfırla</span>
            </button>
          )}

          {/* Toggle Panel Expand/Collapse */}
          <button
            type="button"
            id="btn-toggle-metric-panel-visibility"
            data-testid="btn-toggle-metric-panel-visibility"
            onClick={onToggleOpen}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            <span>{isOpen ? "Paneli Daralt" : "Paneli Genişlet"}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* 2. PANEL BODY (ACCORDION CONTENT) */}
      {isOpen && (
        <div className="p-5 sm:p-6 space-y-6">
          {/* 2.1 QUICK PRESETS STRIP */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Hızlı Metrik Filtreleri:</span>
              </span>

              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: "high_volume", label: "🚀 Yüksek Hacim (≥1.000)", desc: "Aylık hacmi 1000'den büyük olanlar" },
                  { id: "quick_wins", label: "⚡ Hızlı Fırsatlar (KD ≤ 45)", desc: "Düşük zorluk skoruyla kolay kazanımlar" },
                  { id: "top_rankings", label: "🏆 İlk 10 Rekabeti", desc: "İlk 10'da yer alan kritik kelimeler" },
                  { id: "high_traffic_gain", label: "💎 Yüksek Trafik Getirisi (≥+200)", desc: "Trafik potansiyeli yüksek fırsatlar" },
                ].map((preset) => {
                  const isSelected = activePreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      id={`btn-metric-preset-${preset.id}`}
                      data-testid={`btn-metric-preset-${preset.id}`}
                      onClick={() => onApplyPreset(preset.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        isSelected
                          ? "bg-indigo-600 text-white border-indigo-700 shadow-xs ring-2 ring-indigo-500/20"
                          : "bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-2xs"
                      }`}
                      title={preset.desc}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Count Status */}
            <div className="text-xs text-slate-600 font-semibold flex items-center gap-1.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Gösterilen: <strong className="text-slate-900 font-mono">{visibleCount}</strong> / {totalCount}</span>
            </div>
          </div>

          {/* 2.2 TWO-COLUMN WORKSPACE: SORT BY METRICS vs HIDE BELOW THRESHOLD */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* COLUMN A: METRİK TİPİNE GÖRE SIRALAMA (5 Cols) */}
            <div className="lg:col-span-5 space-y-3.5 p-4 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100/60 border border-slate-200">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">
                      Metrik Tipine Göre Sıralama
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Tablodaki tüm rakip verilerini öncelikli metriğe göre dizin
                    </p>
                  </div>
                </div>

                {/* Sort Order Toggle */}
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                  <button
                    type="button"
                    id="btn-sort-order-desc"
                    data-testid="btn-sort-order-desc"
                    onClick={() => onSortOrderChange("desc")}
                    className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      sortOrder === "desc"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                    title="En yüksek/en iyi değerler en üstte"
                  >
                    <ArrowDown className="w-3 h-3 stroke-[2.5]" />
                    <span>Azalan</span>
                  </button>

                  <button
                    type="button"
                    id="btn-sort-order-asc"
                    data-testid="btn-sort-order-asc"
                    onClick={() => onSortOrderChange("asc")}
                    className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      sortOrder === "asc"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                    title="En düşük/başlangıç değerleri en üstte"
                  >
                    <ArrowUp className="w-3 h-3 stroke-[2.5]" />
                    <span>Artan</span>
                  </button>
                </div>
              </div>

              {/* Sort Field Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sortOptions.map((opt) => {
                  const isSelected = sortBy === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      id={`btn-select-sort-metric-${opt.id}`}
                      data-testid={`btn-select-sort-metric-${opt.id}`}
                      onClick={() => onSortByChange(opt.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "bg-indigo-50/80 border-indigo-500 shadow-xs ring-1 ring-indigo-500/20"
                          : "bg-white hover:bg-slate-100/70 border-slate-200/90 shadow-2xs"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-1.5">
                          {opt.icon}
                          <span className={`text-xs font-bold ${isSelected ? "text-indigo-950 font-black" : "text-slate-800"}`}>
                            {opt.label}
                          </span>
                        </div>
                        {isSelected && (
                          <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {opt.descText}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100 text-[11px] text-indigo-900 flex items-center justify-between">
                <span className="font-semibold">Aktif Sıralama:</span>
                <span className="font-black font-mono">
                  {sortOptions.find(o => o.id === sortBy)?.label || sortBy} ({sortOrder === "desc" ? "En Yüksek → En Düşük" : "En Düşük → En Yüksek"})
                </span>
              </div>
            </div>

            {/* COLUMN B: METRİK DEĞERİNDEN DÜŞÜK OLANLARI GİZLEME (7 Cols) */}
            <div className="lg:col-span-7 space-y-4 p-4 rounded-2xl bg-white border border-slate-200">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <Filter className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">
                      Metrik Değer Eşik Filtresi (Düşük Olanları Gizle)
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Belirlediğiniz eşik değerinin altında kalan tüm rakip ve anahtar kelimeleri tablodan dinamik olarak gizleyin
                    </p>
                  </div>
                </div>

                {activeFiltersCount > 0 && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-black">
                    {activeFiltersCount} Aktif Kural
                  </span>
                )}
              </div>

              {/* THRESHOLD 1: MINIMUM ARAMA HACMİ (TRAFİK) */}
              <div 
                id="metric-filter-group-volume"
                className={`p-3 rounded-2xl border transition-all ${
                  minVolume > 0 
                    ? "bg-indigo-50/40 border-indigo-300 ring-1 ring-indigo-500/10" 
                    : "bg-slate-50/70 border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                    <div>
                      <label htmlFor="slider-min-volume" className="text-xs font-bold text-slate-900 cursor-pointer">
                        Minimum Aylık Arama Hacmi:
                      </label>
                      <span className="ml-2 font-mono font-black text-xs text-indigo-700">
                        {minVolume > 0 ? `≥ ${minVolume.toLocaleString("tr-TR")} arama/ay` : "Sınırsız (Tümü)"}
                      </span>
                    </div>
                  </div>

                  {minVolume > 0 && (
                    <button
                      type="button"
                      onClick={() => onMinVolumeChange(0)}
                      className="text-[11px] text-indigo-700 hover:text-indigo-900 font-bold hover:underline cursor-pointer"
                    >
                      Sıfırla
                    </button>
                  )}
                </div>

                {/* Range Slider + Input */}
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    id="slider-min-volume"
                    data-testid="slider-min-volume"
                    min="0"
                    max="5000"
                    step="100"
                    value={minVolume}
                    onChange={(e) => onMinVolumeChange(Number(e.target.value))}
                    className="flex-1 accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[11px] text-slate-500 font-bold">Min:</span>
                    <input
                      type="number"
                      id="input-min-volume"
                      data-testid="input-min-volume"
                      value={minVolume}
                      min="0"
                      max="50000"
                      step="100"
                      onChange={(e) => onMinVolumeChange(Math.max(0, Number(e.target.value)))}
                      className="w-20 px-2 py-1 rounded-lg bg-white border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Preset Pills */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-medium">Hızlı Eşik:</span>
                  {[0, 500, 1000, 2500, 4000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => onMinVolumeChange(val)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                        minVolume === val
                          ? "bg-indigo-600 text-white shadow-2xs"
                          : "bg-white hover:bg-slate-200 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {val === 0 ? "Tümü" : `≥ ${val.toLocaleString("tr-TR")}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* THRESHOLD 2: MINIMUM SEO SKORU (KD / ZORLUK) */}
              <div 
                id="metric-filter-group-difficulty"
                className={`p-3 rounded-2xl border transition-all ${
                  minDifficulty > 0 
                    ? "bg-amber-50/40 border-amber-300 ring-1 ring-amber-500/10" 
                    : "bg-slate-50/70 border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-amber-600" />
                    <div>
                      <label htmlFor="slider-min-difficulty" className="text-xs font-bold text-slate-900 cursor-pointer">
                        Minimum SEO Skoru / Zorluk (KD):
                      </label>
                      <span className="ml-2 font-mono font-black text-xs text-amber-700">
                        {minDifficulty > 0 ? `≥ ${minDifficulty} / 100` : "Sınırsız (Tümü)"}
                      </span>
                    </div>
                  </div>

                  {minDifficulty > 0 && (
                    <button
                      type="button"
                      onClick={() => onMinDifficultyChange(0)}
                      className="text-[11px] text-amber-700 hover:text-amber-900 font-bold hover:underline cursor-pointer"
                    >
                      Sıfırla
                    </button>
                  )}
                </div>

                {/* Range Slider + Input */}
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    id="slider-min-difficulty"
                    data-testid="slider-min-difficulty"
                    min="0"
                    max="90"
                    step="5"
                    value={minDifficulty}
                    onChange={(e) => onMinDifficultyChange(Number(e.target.value))}
                    className="flex-1 accent-amber-500 cursor-pointer"
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[11px] text-slate-500 font-bold">Min KD:</span>
                    <input
                      type="number"
                      id="input-min-difficulty"
                      data-testid="input-min-difficulty"
                      value={minDifficulty}
                      min="0"
                      max="100"
                      step="5"
                      onChange={(e) => onMinDifficultyChange(Math.max(0, Math.min(100, Number(e.target.value))))}
                      className="w-16 px-2 py-1 rounded-lg bg-white border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Preset Pills */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-medium">Hızlı Eşik:</span>
                  {[0, 20, 40, 60, 80].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => onMinDifficultyChange(val)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                        minDifficulty === val
                          ? "bg-amber-500 text-slate-950 font-black shadow-2xs"
                          : "bg-white hover:bg-slate-200 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {val === 0 ? "Tümü" : `≥ ${val} KD`}
                    </button>
                  ))}
                </div>
              </div>

              {/* THRESHOLD 3: MINIMUM TRAFİK FIRSATI (+ZİYARETÇİ/AY) & MAKSİMUM SIRALAMA BARAJI */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Min Traffic Opportunity */}
                <div 
                  id="metric-filter-group-traffic-opp"
                  className={`p-3 rounded-2xl border transition-all ${
                    minTrafficOpportunity > 0 
                      ? "bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-500/10" 
                      : "bg-slate-50/70 border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Min. Trafik Fırsatı:</span>
                    </span>
                    <span className="font-mono font-black text-xs text-emerald-700">
                      {minTrafficOpportunity > 0 ? `≥ +${minTrafficOpportunity}` : "Tümü"}
                    </span>
                  </div>

                  <select
                    id="select-min-traffic-opportunity"
                    data-testid="select-min-traffic-opportunity"
                    value={minTrafficOpportunity}
                    onChange={(e) => onMinTrafficOpportunityChange(Number(e.target.value))}
                    className="w-full py-1.5 px-2.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="0">Tümü (Sınırsız)</option>
                    <option value="100">En az +100 Ziyaretçi/ay</option>
                    <option value="250">En az +250 Ziyaretçi/ay</option>
                    <option value="500">En az +500 Ziyaretçi/ay</option>
                    <option value="1000">En az +1.000 Ziyaretçi/ay</option>
                  </select>
                </div>

                {/* Max Rank Position Barajı */}
                <div 
                  id="metric-filter-group-rank-limit"
                  className={`p-3 rounded-2xl border transition-all ${
                    maxRankLimit !== null 
                      ? "bg-purple-50/40 border-purple-300 ring-1 ring-purple-500/10" 
                      : "bg-slate-50/70 border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-purple-600" />
                      <span>Sıralama Pozisyon Barajı:</span>
                    </span>
                    <span className="font-mono font-black text-xs text-purple-700">
                      {maxRankLimit !== null ? `İlk ${maxRankLimit}` : "Tümü"}
                    </span>
                  </div>

                  <select
                    id="select-max-rank-limit"
                    data-testid="select-max-rank-limit"
                    value={maxRankLimit === null ? "all" : maxRankLimit}
                    onChange={(e) => onMaxRankLimitChange(e.target.value === "all" ? null : Number(e.target.value))}
                    className="w-full py-1.5 px-2.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-purple-500 cursor-pointer"
                  >
                    <option value="all">Tüm Pozisyonlar (Sınırsız)</option>
                    <option value="3">Yalnızca İlk 3'tekiler (🏆 Podyum)</option>
                    <option value="10">Yalnızca İlk 10'dakiler (Sayfa 1)</option>
                    <option value="20">İlk 20'deki Kelimeler (Sayfa 1-2)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* 2.3 ACTIVE FILTER CHIPS & STATS FOOTER */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-500">Uygulanan Filtreler:</span>
              {activeFiltersCount === 0 && sortBy === "userRank" && sortOrder === "asc" ? (
                <span className="text-slate-400 italic">Varsayılan görünüm (Tüm veriler açık)</span>
              ) : (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {minVolume > 0 && (
                    <span 
                      id="chip-filter-volume"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-900 font-bold border border-indigo-200"
                    >
                      <span>Hacim ≥ {minVolume.toLocaleString("tr-TR")}</span>
                      <button 
                        type="button" 
                        onClick={() => onMinVolumeChange(0)} 
                        className="text-indigo-600 hover:text-indigo-950 cursor-pointer"
                        title="Hacim filtresini kaldır"
                      >
                        ✕
                      </button>
                    </span>
                  )}

                  {minDifficulty > 0 && (
                    <span 
                      id="chip-filter-difficulty"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-950 font-bold border border-amber-200"
                    >
                      <span>SEO Skoru ≥ {minDifficulty}</span>
                      <button 
                        type="button" 
                        onClick={() => onMinDifficultyChange(0)} 
                        className="text-amber-800 hover:text-amber-950 cursor-pointer"
                        title="SEO Skoru filtresini kaldır"
                      >
                        ✕
                      </button>
                    </span>
                  )}

                  {minTrafficOpportunity > 0 && (
                    <span 
                      id="chip-filter-traffic-opp"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-950 font-bold border border-emerald-200"
                    >
                      <span>Fırsat ≥ +{minTrafficOpportunity}</span>
                      <button 
                        type="button" 
                        onClick={() => onMinTrafficOpportunityChange(0)} 
                        className="text-emerald-700 hover:text-emerald-950 cursor-pointer"
                        title="Trafik fırsatı filtresini kaldır"
                      >
                        ✕
                      </button>
                    </span>
                  )}

                  {maxRankLimit !== null && (
                    <span 
                      id="chip-filter-rank-limit"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-100 text-purple-950 font-bold border border-purple-200"
                    >
                      <span>Pozisyon: İlk {maxRankLimit}</span>
                      <button 
                        type="button" 
                        onClick={() => onMaxRankLimitChange(null)} 
                        className="text-purple-700 hover:text-purple-950 cursor-pointer"
                        title="Sıralama filtresini kaldır"
                      >
                        ✕
                      </button>
                    </span>
                  )}

                  {(sortBy !== "userRank" || sortOrder !== "asc") && (
                    <span 
                      id="chip-filter-sort"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-200 text-slate-800 font-bold"
                    >
                      <span>Sıralama: {sortOptions.find(o => o.id === sortBy)?.label || sortBy} ({sortOrder.toUpperCase()})</span>
                      <button 
                        type="button" 
                        onClick={() => {
                          onSortByChange("userRank");
                          onSortOrderChange("asc");
                        }} 
                        className="text-slate-600 hover:text-slate-900 cursor-pointer"
                        title="Varsayılan sıralamaya dön"
                      >
                        ✕
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Hidden count alert + restore button */}
            {hiddenCount > 0 && (
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-rose-600 font-bold flex items-center gap-1">
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>{hiddenCount} satır eşiklerin altında kaldığı için gizlendi</span>
                </span>
                <button
                  type="button"
                  id="btn-restore-hidden-rows"
                  onClick={onResetAllFilters}
                  className="text-indigo-600 hover:text-indigo-800 font-black hover:underline cursor-pointer"
                >
                  Tümünü Göster
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
