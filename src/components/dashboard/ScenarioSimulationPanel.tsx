import React from "react";
import { 
  TrendingUp, 
  Activity, 
  TrendingDown, 
  Sparkles, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sliders, 
  ChevronDown, 
  Target,
  Zap,
  Info
} from "lucide-react";
import { ForecastScenarioType, ForecastMetricType } from "./CompetitorGrowthForecastD3Chart";

export interface ScenarioDefinition {
  id: ForecastScenarioType;
  name: string;
  badge: string;
  defaultRate: number; // e.g. 0.185 for +18.5%
  rateLabel: string;
  projectedNetChange: string; // e.g. "+%172"
  description: string;
  crossoverExpectation: string;
  strategySummary: string;
  colorClass: {
    borderActive: string;
    bgActive: string;
    textTitle: string;
    badge: string;
    ring: string;
    gradient: string;
  };
}

export const SCENARIO_DEFINITIONS: Record<"aggressive" | "stable" | "decline", ScenarioDefinition> = {
  aggressive: {
    id: "aggressive",
    name: "Agresif Büyüme",
    badge: "🚀 Maksimum İvme",
    defaultRate: 0.185,
    rateLabel: "+%18.5 / Ay",
    projectedNetChange: "+%172",
    description: "Yüksek hacimli AI içerik üretimi, yoğun backlink kazanımı ve teknik Core Web Vitals optimizasyonu ile pazar liderliği atağı.",
    crossoverExpectation: "4. ayda 1. rakibi geride bırakarak sektörde lider organik pozisyona yükselme.",
    strategySummary: "Haftalık 8+ sektörel kılavuz, zengin snippet optimizasyonları ve otoriter basın bülteni backlinkleri.",
    colorClass: {
      borderActive: "border-emerald-500",
      bgActive: "bg-emerald-950/40",
      textTitle: "text-emerald-400",
      badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      ring: "ring-emerald-500/50",
      gradient: "from-emerald-950/60 to-slate-900"
    }
  },
  stable: {
    id: "stable",
    name: "Stabil",
    badge: "⚖️ Dengeli Koruma",
    defaultRate: 0.040,
    rateLabel: "+%4.0 / Ay",
    projectedNetChange: "+%26",
    description: "Mevcut SEO operasyonlarının, blog yayınlama temposunun ve organik indeksleme hızının standart düzeyde sürdürülmesi.",
    crossoverExpectation: "Mevcut SERP sıralamaları ve pazar payı dengesi istikrarlı biçimde korunur.",
    strategySummary: "Rutin içerik güncellemeleri, kırık link temizliği ve mevcut sıralamaların takibi.",
    colorClass: {
      borderActive: "border-sky-500",
      bgActive: "bg-sky-950/40",
      textTitle: "text-sky-400",
      badge: "bg-sky-500/20 text-sky-300 border-sky-500/30",
      ring: "ring-sky-500/50",
      gradient: "from-sky-950/60 to-slate-900"
    }
  },
  decline: {
    id: "decline",
    name: "Düşüş",
    badge: "⚠️ Risk Simülasyonu",
    defaultRate: -0.075,
    rateLabel: "-%7.5 / Ay",
    projectedNetChange: "-%37",
    description: "Google Core güncellemelerinde kayıp, zengin snippet erozyonu veya agresif rakip hamlelerine karşı önlem alınmaması senaryosu.",
    crossoverExpectation: "2. ve 3. rakiplerin öne geçme riski, ilk 3 sıralamada %40'a varan kan kaybı.",
    strategySummary: "Acil SEO denetimi, kaybolan zengin snippet'ların geri kazanımı ve zayıf sayfaların temizlenmesi gerekir.",
    colorClass: {
      borderActive: "border-rose-500",
      bgActive: "bg-rose-950/40",
      textTitle: "text-rose-400",
      badge: "bg-rose-500/20 text-rose-300 border-rose-500/30",
      ring: "ring-rose-500/50",
      gradient: "from-rose-950/60 to-slate-900"
    }
  }
};

interface ScenarioSimulationPanelProps {
  selectedScenario: ForecastScenarioType;
  onSelectScenario: (scenario: ForecastScenarioType) => void;
  customGrowthRate: number | null;
  onCustomGrowthRateChange: (rate: number | null) => void;
  selectedMetric: ForecastMetricType;
  baselineUserValue: number;
  projected6MonthUserValue: number;
  baselineComp1Value: number;
  projected6MonthComp1Value: number;
  userName: string;
  comp1Name: string;
  crossoverMonth: number | null;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const ScenarioSimulationPanel: React.FC<ScenarioSimulationPanelProps> = ({
  selectedScenario,
  onSelectScenario,
  customGrowthRate,
  onCustomGrowthRateChange,
  selectedMetric,
  baselineUserValue,
  projected6MonthUserValue,
  baselineComp1Value,
  projected6MonthComp1Value,
  userName,
  comp1Name,
  crossoverMonth,
  isOpen,
  onToggleOpen
}) => {
  const currentDef = (SCENARIO_DEFINITIONS as Record<string, ScenarioDefinition>)[selectedScenario] || SCENARIO_DEFINITIONS.stable;
  const activeRate = customGrowthRate !== null ? customGrowthRate : currentDef.defaultRate;
  const activeRatePct = Math.round(activeRate * 1000) / 10;

  // Calculate net absolute and percent change for user
  const diffVal = projected6MonthUserValue - baselineUserValue;
  const diffPct = baselineUserValue > 0 ? Math.round((diffVal / baselineUserValue) * 100) : 0;

  const metricLabel = 
    selectedMetric === "traffic" ? "Organik Ziyaretçi/Ay" : 
    selectedMetric === "visibility" ? "SERP Görünürlük Puanı" : 
    "Sıralama Kalite Skoru";

  const formatVal = (v: number) => {
    if (selectedMetric === "traffic") return v.toLocaleString("tr-TR");
    return `${v} pt`;
  };

  return (
    <div 
      id="seo-growth-scenario-simulation-panel"
      data-testid="seo-growth-scenario-simulation-panel"
      className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border border-slate-700/80 text-white shadow-xl space-y-4"
    >
      {/* Header & Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-900/30 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-black text-white tracking-tight flex items-center gap-1.5">
                <span>Senaryo Analizi Modu</span>
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                <span>Canlı 6 Aylık Simülasyon</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Farklı SEO büyüme hızlarını seçerek grafikteki 6 aylık eğrileri ve liderlik noktalarını anlık olarak test edin.
            </p>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {customGrowthRate !== null && (
            <button
              type="button"
              id="btn-reset-custom-growth-rate"
              data-testid="btn-reset-custom-growth-rate"
              onClick={() => onCustomGrowthRateChange(null)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
              title="Özel büyüme hızını sıfırla ve senaryo varsayılanına dön"
            >
              <RotateCcw className="w-3 h-3 text-amber-400" />
              <span>Varsayılana Dön</span>
            </button>
          )}

          <button
            type="button"
            id="btn-toggle-scenario-simulation-panel"
            data-testid="btn-toggle-scenario-simulation-panel"
            onClick={onToggleOpen}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer border border-slate-700"
            aria-expanded={isOpen}
          >
            <span>{isOpen ? "Paneli Daralt" : "Senaryo Detayları"}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* 3 Main Scenario Cards (Always Visible for Instant 1-Click Simulation) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {(["aggressive", "stable", "decline"] as ForecastScenarioType[]).map((scId) => {
          const def = SCENARIO_DEFINITIONS[scId];
          const isSelected = selectedScenario === scId;

          return (
            <button
              key={scId}
              type="button"
              id={`btn-scenario-${scId}`}
              data-testid={`btn-scenario-${scId}`}
              onClick={() => {
                onSelectScenario(scId);
                onCustomGrowthRateChange(null);
              }}
              className={`p-3.5 rounded-xl text-left transition-all duration-200 cursor-pointer border relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? `${def.colorClass.borderActive} ${def.colorClass.bgActive} shadow-lg ring-2 ${def.colorClass.ring}`
                  : "bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700 text-slate-300"
              }`}
            >
              {/* Active selection corner badge */}
              {isSelected && (
                <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none overflow-hidden">
                  <div className={`absolute transform rotate-45 bg-gradient-to-r from-indigo-500 to-emerald-500 text-[8px] font-black text-white text-center py-0.5 right-[-35px] top-[14px] w-[120px] shadow-xs`}>
                    AKTİF
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    {scId === "aggressive" ? (
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <TrendingUp className="w-3.5 h-3.5" />
                      </div>
                    ) : scId === "stable" ? (
                      <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                        <Activity className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                        <TrendingDown className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <span className={`text-sm font-black ${isSelected ? def.colorClass.textTitle : "text-white"}`}>
                      {def.name}
                    </span>
                  </div>

                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${def.colorClass.badge}`}>
                    {def.rateLabel}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 leading-snug line-clamp-2 mt-1">
                  {def.description}
                </p>
              </div>

              {/* 6-Month Projected Outcome Footer */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  6 Aylık Hedef:
                </span>
                <span className={`font-mono font-black ${
                  scId === "aggressive" ? "text-emerald-400" :
                  scId === "stable" ? "text-sky-300" : "text-rose-400"
                }`}>
                  {def.projectedNetChange} Net Değişim
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Expanded Simulation Details, Metrics & Fine-Tuning Slider */}
      {isOpen && (
        <div className="space-y-4 pt-2 border-t border-slate-800/90 animate-in fade-in duration-200">
          {/* Active Scenario Impact Summary Strip */}
          <div className={`p-4 rounded-xl bg-gradient-to-r ${currentDef.colorClass.gradient} border ${currentDef.colorClass.borderActive} border-opacity-40 space-y-3`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                    Aktif Simülasyon Analizi:
                  </span>
                  <span className={`px-2 py-0.5 rounded-md font-bold text-xs ${currentDef.colorClass.badge}`}>
                    {currentDef.name} ({activeRatePct > 0 ? `+${activeRatePct}%` : `${activeRatePct}%`}/ay)
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {currentDef.crossoverExpectation}
                </p>
              </div>

              {/* Crossover Milestone Pill */}
              {crossoverMonth !== null && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs shrink-0 self-start lg:self-center">
                  <Target className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Crossover (Başa-Baş) Noktası</div>
                    <div className="font-bold text-amber-300 font-mono">
                      +{crossoverMonth}. Ayda Gerçekleşir
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-white/10 text-xs">
              {/* Metric 1: Starting Value */}
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">0. Ay (Şu An)</div>
                <div className="text-base font-black text-white font-mono mt-0.5">
                  {formatVal(baselineUserValue)}
                </div>
                <div className="text-[10px] text-slate-500 truncate">{userName}</div>
              </div>

              {/* Metric 2: Projected 6th Month */}
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">+6. Ay Sonu (Tahmin)</div>
                <div className={`text-base font-black font-mono mt-0.5 ${diffPct >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {formatVal(projected6MonthUserValue)}
                </div>
                <div className="text-[10px] text-slate-400 truncate">{metricLabel}</div>
              </div>

              {/* Metric 3: Net Difference */}
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Net Fark (6 Ay)</div>
                <div className={`text-base font-black font-mono mt-0.5 flex items-center gap-1 ${diffPct >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {diffPct >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  <span>{diffPct >= 0 ? `+${diffPct}%` : `${diffPct}%`}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {diffVal >= 0 ? `+${formatVal(diffVal)}` : formatVal(diffVal)}
                </div>
              </div>

              {/* Metric 4: Competitor 1 Target */}
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase truncate">1. Rakip (+6. Ay)</div>
                <div className="text-base font-black text-slate-200 font-mono mt-0.5">
                  {formatVal(projected6MonthComp1Value)}
                </div>
                <div className="text-[10px] text-slate-400 truncate">{comp1Name}</div>
              </div>
            </div>
          </div>

          {/* Interactive Monthly Rate Fine-Tuning Slider */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-bold text-slate-200">
                  Aylık Büyüme Hızı İnce Ayarı:
                </span>
                <span className="text-slate-400 text-[11px]">
                  (Grafiği anında simüle etmek için kaydırın)
                </span>
              </div>

              <div className="flex items-center gap-2 font-mono">
                <span className="text-[11px] text-slate-400">Seçili Hız:</span>
                <span className={`px-2 py-0.5 rounded font-black text-xs ${
                  activeRatePct > 0 ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" :
                  activeRatePct === 0 ? "bg-slate-700 text-slate-300" :
                  "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                }`}>
                  {activeRatePct > 0 ? `+${activeRatePct}%` : `${activeRatePct}%`} / Ay
                </span>
              </div>
            </div>

            {/* Slider & Step Controls */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const newRate = Math.max(-0.25, Math.round((activeRate - 0.01) * 100) / 100);
                  onCustomGrowthRateChange(newRate);
                }}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 cursor-pointer transition-colors"
                title="Aylık hızı %1 düşür"
              >
                -1%
              </button>

              <input
                type="range"
                id="slider-growth-rate-fine-tune"
                data-testid="slider-growth-rate-fine-tune"
                min="-20"
                max="35"
                step="0.5"
                value={activeRatePct}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onCustomGrowthRateChange(val / 100);
                }}
                className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
              />

              <button
                type="button"
                onClick={() => {
                  const newRate = Math.min(0.40, Math.round((activeRate + 0.01) * 100) / 100);
                  onCustomGrowthRateChange(newRate);
                }}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 cursor-pointer transition-colors"
                title="Aylık hızı %1 artır"
              >
                +1%
              </button>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
              <span>-%20 (Ağır Düşüş)</span>
              <span>0% (Sıfır Büyüme)</span>
              <span>+%18.5 (Agresif)</span>
              <span>+%35 (Hiper Büyüme)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
