import React, { useState, useMemo } from "react";
import { SiteConfig, ForecastingScenario } from "../../types";
import { generatePerformanceForecastReport } from "../../utils/performanceForecasterEngine";
import { PerformanceForecasterD3Chart } from "./PerformanceForecasterD3Chart";
import { 
  TrendingUp, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  PhoneCall, 
  Users, 
  DollarSign,
  Calendar,
  Layers
} from "lucide-react";

interface PerformanceForecasterQuickCardProps {
  config: SiteConfig;
  onOpenFullView: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const PerformanceForecasterQuickCard: React.FC<PerformanceForecasterQuickCardProps> = ({
  config,
  onOpenFullView,
  onNavigateTab
}) => {
  const [scenario, setScenario] = useState<ForecastingScenario>("realistic");

  const report = useMemo(() => {
    return generatePerformanceForecastReport(config, { scenario });
  }, [config, scenario]);

  return (
    <div 
      id="performance-forecaster-quick-card"
      className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 space-y-6 shadow-xs hover:border-slate-300 transition-all relative overflow-hidden"
    >
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200/80 flex items-center gap-1 font-mono">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              <span>D3.js 30 GÜNLÜK PROJEKSİYON</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              %80 Güven Bandı
            </span>
          </div>

          <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Gelecek Performans Tahmincisi</span>
          </h3>
          <p className="text-xs text-slate-500">
            Tarihsel trafik ve dönüşüm oranlarına göre önümüzdeki 30 günün muhtemel büyüme grafiği.
          </p>
        </div>

        {/* Action Button */}
        <button
          type="button"
          id="btn-goto-full-forecaster"
          onClick={onOpenFullView}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer self-start sm:self-auto group"
        >
          <span>Detaylı Simülatörü Aç</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Metric Highlights & Scenario Selector Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1 */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Tahmini Ziyaretçi</span>
            <Users className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-xl font-black text-slate-900 font-mono">
              {report.projectedTotalVisitors30d.toLocaleString("tr-TR")}
            </div>
            <div className="text-xs font-bold text-emerald-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" />
              <span>+%{report.netVisitorGrowthPercent}</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400">
            Son 30 gün: {report.historicalTotalVisitors30d.toLocaleString("tr-TR")}
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Tahmini Dönüşüm & Lead</span>
            <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-xl font-black text-slate-900 font-mono">
              {report.projectedTotalConversions30d} <span className="text-xs text-slate-500">adet</span>
            </div>
            <div className="text-xs font-bold text-amber-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" />
              <span>+%{report.netConversionGrowthPercent}</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400">
            Beklenen Oran: %{report.projectedAvgConversionRate}
          </div>
        </div>

        {/* Scenario Switcher Buttons */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col justify-between">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Senaryo Simülasyonu
          </div>
          <div className="grid grid-cols-3 gap-1 mt-2">
            <button
              type="button"
              id="quick-scenario-pessimistic"
              onClick={() => setScenario("pessimistic")}
              className={`py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                scenario === "pessimistic"
                  ? "bg-slate-800 text-amber-300 shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              🛡️ Baz
            </button>
            <button
              type="button"
              id="quick-scenario-realistic"
              onClick={() => setScenario("realistic")}
              className={`py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                scenario === "realistic"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              🚀 Muhtemel
            </button>
            <button
              type="button"
              id="quick-scenario-optimistic"
              onClick={() => setScenario("optimistic")}
              className={`py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                scenario === "optimistic"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              ⚡ İyimser
            </button>
          </div>
        </div>
      </div>

      {/* D3.js Chart preview */}
      <div className="bg-slate-50/50 rounded-2xl p-3 border border-slate-100">
        <PerformanceForecasterD3Chart
          data={report.timeSeriesData}
          scenario={scenario}
          metric="combined"
          height={240}
        />
      </div>

      {/* Footer Insight Snippet */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-500 border-t border-slate-100 pt-3">
        <div className="flex items-center gap-1.5 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          <span>
            {report.insights[0]?.title}: <strong className="text-slate-800">{report.insights[0]?.potentialImpact}</strong>
          </span>
        </div>

        <button
          type="button"
          onClick={onOpenFullView}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
        >
          <span>Tüm 4 Öngörüyü Gör</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
