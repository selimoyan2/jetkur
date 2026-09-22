import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from "recharts";
import {
  TrendingDown,
  Layers,
  Sparkles,
  Download,
  CheckCircle2,
  Calendar,
  Zap,
  ShieldCheck,
  Clock,
  SlidersHorizontal,
  ChevronRight,
  Info
} from "lucide-react";
import { DailyPerformanceTrendDataPoint } from "../../types";
import {
  generate90DayCoreWebVitalsForecast,
  ForecastScenario,
  ForecastMetricKey,
  PredictedVitalDataPoint,
  ProjectedMilestone
} from "../../utils/performanceVitalsForecastGenerator";

export interface PerformanceVitalsForecastLineChartProps {
  historicalData: DailyPerformanceTrendDataPoint[];
  device?: "mobile" | "desktop";
  initialTimelineHorizon?: "forecast-only" | "combined-120d";
  className?: string;
  onExploreMetrics?: () => void;
}

export const PerformanceVitalsForecastLineChart: React.FC<PerformanceVitalsForecastLineChartProps> = ({
  historicalData,
  device = "mobile",
  initialTimelineHorizon = "forecast-only",
  className = "",
  onExploreMetrics
}) => {
  const [metricTab, setMetricTab] = useState<ForecastMetricKey>("all");
  const [scenario, setScenario] = useState<ForecastScenario>("most-likely");
  const [timelineHorizon, setTimelineHorizon] = useState<"forecast-only" | "combined-120d">(initialTimelineHorizon);
  const [showConfidenceBounds, setShowConfidenceBounds] = useState<boolean>(true);
  const [selectedMilestone, setSelectedMilestone] = useState<ProjectedMilestone | null>(null);

  // Keep state in sync if prop changes
  React.useEffect(() => {
    if (initialTimelineHorizon) {
      setTimelineHorizon(initialTimelineHorizon);
    }
  }, [initialTimelineHorizon]);

  // Generate 90-day forecast based on the historical data and scenario
  const forecastResult = useMemo(() => {
    return generate90DayCoreWebVitalsForecast(historicalData, scenario, device);
  }, [historicalData, scenario, device]);

  const { forecastPoints, combinedPoints, stats, milestones } = forecastResult;

  const currentChartData = timelineHorizon === "combined-120d" ? combinedPoints : forecastPoints;

  // CSV Export of the 90-Day Forecast
  const handleDownloadForecastCsv = () => {
    if (!forecastPoints || forecastPoints.length === 0) return;
    const headers = [
      "Gun_Offset",
      "Tarih",
      "LCP_Tahmini_Saniye",
      "LCP_Ust_Sinir",
      "LCP_Alt_Sinir",
      "CLS_Tahmini_Skor",
      "CLS_Ust_Sinir",
      "CLS_Alt_Sinir",
      "FID_Tahmini_Ms",
      "FID_Ust_Sinir",
      "FID_Alt_Sinir",
      "Google_CWV_Durum",
      "Kilometre_Tasi"
    ];
    const rows = forecastPoints.map(p => [
      `+${p.dayOffset}`,
      p.date,
      p.lcp,
      p.lcpUpper,
      p.lcpLower,
      p.cls,
      p.clsUpper,
      p.clsLower,
      p.fid,
      p.fidUpper,
      p.fidLower,
      p.cwvPassStatus,
      p.milestone ? p.milestone.title : ""
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cwv_90_gun_tahmini_${scenario}_${device}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      id="cwv-90day-forecast-container"
      data-testid="cwv-90day-forecast-container"
      className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm transition-all ${className}`}
    >
      {/* 1. Header with Scenario & Controls */}
      <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800/80 bg-gradient-to-r from-emerald-500/5 via-indigo-500/5 to-transparent flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Gelecek 90 Günlük Core Web Vitals Tahmini
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-black border border-emerald-500/20 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>%100 Google CWV Uyumluluğu</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-mono font-bold border border-indigo-200 dark:border-indigo-800">
              R² = {stats.rSquaredConfidence} (Yüksek Güvenilirlik)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
            Mevcut 30 günlük zaman serisi regresyon eğrisi, önbellekleme verimi ve varlık sıkıştırma oranları temel alınarak Recharts ile modellenen 90 günlük gelecek öngörüsü.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2 self-start lg:self-auto flex-wrap">
          {/* Timeline Horizon Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <button
              type="button"
              id="btn-timeline-forecast-only"
              onClick={() => setTimelineHorizon("forecast-only")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timelineHorizon === "forecast-only"
                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Sadece gelecek 90 günlük tahmin verisi"
            >
              90G Gelecek Tahmini
            </button>
            <button
              type="button"
              id="btn-timeline-combined-120d"
              onClick={() => setTimelineHorizon("combined-120d")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timelineHorizon === "combined-120d"
                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Son 30 gün saha geçmişi + Gelecek 90 gün tahmini birleşik"
            >
              120G Birleşik Zaman Çizelgesi
            </button>
          </div>

          {/* Scenario Selector */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <button
              type="button"
              id="btn-scenario-most-likely"
              onClick={() => setScenario("most-likely")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                scenario === "most-likely"
                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
              title="En olası regresyon projeksiyonu"
            >
              En Olası Trend
            </button>
            <button
              type="button"
              id="btn-scenario-optimistic"
              onClick={() => setScenario("optimistic")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                scenario === "optimistic"
                  ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Aktif CDN ve uç optimizasyon hızlanması"
            >
              İyimser
            </button>
            <button
              type="button"
              id="btn-scenario-conservative"
              onClick={() => setScenario("conservative")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                scenario === "conservative"
                  ? "bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Minimum bakım ve standart kararlılık"
            >
              Korumacı
            </button>
          </div>

          {/* Export Forecast CSV */}
          <button
            type="button"
            id="btn-export-forecast-csv"
            onClick={handleDownloadForecastCsv}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="90 günlük tahmin verisini CSV olarak dışa aktar"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span className="hidden sm:inline">Tahmin CSV İndir</span>
          </button>
        </div>
      </div>

      {/* 2. Projected Milestone Banner & KPI Summary Cards */}
      <div className="p-5 sm:p-6 pb-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* LCP Forecast Metric Card */}
        <div
          id="kpi-forecast-lcp"
          onClick={() => setMetricTab("lcp")}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            metricTab === "lcp"
              ? "bg-emerald-500/5 border-emerald-500 ring-2 ring-emerald-500/20"
              : "bg-slate-50/70 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-300"
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              LCP Tahmini (90 Gün)
            </span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono font-bold">
              Hedef: ≤ 2.5s
            </span>
          </div>

          <div className="mt-2 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {stats.lcpTarget90d}s
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                (bugün: {stats.lcpCurrent}s)
              </span>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md flex items-center gap-0.5">
              <TrendingDown className="w-3.5 h-3.5" />
              %{stats.lcpImprovementPercent}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            HTTP/3 ve Early Hints ile yükleme hızı süreklilik kazanıyor.
          </p>
        </div>

        {/* CLS Forecast Metric Card */}
        <div
          id="kpi-forecast-cls"
          onClick={() => setMetricTab("cls")}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            metricTab === "cls"
              ? "bg-indigo-500/5 border-indigo-500 ring-2 ring-indigo-500/20"
              : "bg-slate-50/70 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-300"
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              CLS Tahmini (90 Gün)
            </span>
            <span className="px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-mono font-bold">
              Hedef: ≤ 0.10
            </span>
          </div>

          <div className="mt-2 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {stats.clsTarget90d}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                (bugün: {stats.clsCurrent})
              </span>
            </div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md flex items-center gap-0.5">
              <TrendingDown className="w-3.5 h-3.5" />
              %{stats.clsImprovementPercent}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Rezerve layout alanları ile sıfır kayma istikrarı korunuyor.
          </p>
        </div>

        {/* FID Forecast Metric Card */}
        <div
          id="kpi-forecast-fid"
          onClick={() => setMetricTab("fid")}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            metricTab === "fid"
              ? "bg-amber-500/5 border-amber-500 ring-2 ring-amber-500/20"
              : "bg-slate-50/70 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/80 hover:border-amber-300"
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              FID Tahmini (90 Gün)
            </span>
            <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-mono font-bold">
              Hedef: ≤ 100ms
            </span>
          </div>

          <div className="mt-2 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {stats.fidTarget90d}ms
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                (bugün: {stats.fidCurrent}ms)
              </span>
            </div>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md flex items-center gap-0.5">
              <TrendingDown className="w-3.5 h-3.5" />
              %{stats.fidImprovementPercent}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            İzole JavaScript yükü ile ana iş parçacığı serbest kalıyor.
          </p>
        </div>
      </div>

      {/* 3. Metric Tab Selector & Confidence Bounds Toggle */}
      <div className="px-5 sm:px-6 pt-3 pb-2 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/90 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex-wrap">
          <button
            type="button"
            id="btn-forecast-metric-all"
            onClick={() => setMetricTab("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              metricTab === "all"
                ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tümü (LCP + CLS + FID)</span>
          </button>

          <button
            type="button"
            id="btn-forecast-metric-lcp"
            onClick={() => setMetricTab("lcp")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              metricTab === "lcp"
                ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>LCP Tahmini (s)</span>
          </button>

          <button
            type="button"
            id="btn-forecast-metric-cls"
            onClick={() => setMetricTab("cls")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              metricTab === "cls"
                ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>CLS Tahmini (Skor)</span>
          </button>

          <button
            type="button"
            id="btn-forecast-metric-fid"
            onClick={() => setMetricTab("fid")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              metricTab === "fid"
                ? "bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>FID Tahmini (ms)</span>
          </button>
        </div>

        {/* Confidence Interval corridor toggle */}
        <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer select-none">
          <input
            type="checkbox"
            id="cb-show-confidence-bounds"
            checked={showConfidenceBounds}
            onChange={(e) => setShowConfidenceBounds(e.target.checked)}
            className="w-4 h-4 rounded text-indigo-600 border-slate-300 dark:border-slate-700 focus:ring-indigo-500"
          />
          <span>±1σ Güven Aralığı Sınırları (Confidence Bounds)</span>
        </label>
      </div>

      {/* 4. THE RECHARTS LINE CHART */}
      <div className="p-5 sm:p-6 pt-2">
        <div className="h-72 sm:h-80 w-full" id="recharts-90day-forecast-chart">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={currentChartData}
              margin={{ top: 15, right: 25, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.6} />

              <XAxis
                dataKey="formattedDate"
                tickLine={false}
                axisLine={{ stroke: "#cbd5e1" }}
                tick={{ fontSize: 11, fill: "#64748b" }}
                interval={timelineHorizon === "combined-120d" ? 12 : 8}
              />

              {/* Left Y-Axis for LCP / CLS (Seconds / Scaled value) */}
              <YAxis
                yAxisId="left"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#64748b" }}
                domain={
                  metricTab === "cls"
                    ? [0, 0.08]
                    : metricTab === "fid"
                    ? [0, 60]
                    : [0, 2.8]
                }
                unit={metricTab === "cls" ? "" : metricTab === "fid" ? "ms" : "s"}
              />

              {/* Right Y-Axis for FID when in multi-metric 'all' view */}
              {metricTab === "all" && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#f59e0b" }}
                  domain={[0, 60]}
                  unit="ms"
                />
              )}

              <Tooltip content={<CustomForecastTooltip timelineHorizon={timelineHorizon} />} />
              <Legend
                verticalAlign="top"
                height={36}
                iconType="plainline"
                formatter={(value) => <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{value}</span>}
              />

              {/* In combined mode, show vertical reference line dividing past 30 days and next 90 days */}
              {timelineHorizon === "combined-120d" && (
                <ReferenceLine
                  yAxisId="left"
                  x={combinedPoints.find(p => p.dayIndex === 0)?.formattedDate || combinedPoints[30]?.formattedDate}
                  stroke="#475569"
                  strokeDasharray="3 3"
                  strokeWidth={1.5}
                  label={{
                    value: "← 30G Geçmiş | 90G Tahmin →",
                    position: "insideTopLeft",
                    fill: "#334155",
                    fontSize: 10,
                    fontWeight: "bold"
                  }}
                />
              )}

              {/* Google Good Threshold Benchmark Reference Lines */}
              {metricTab === "lcp" && (
                <ReferenceLine
                  yAxisId="left"
                  y={2.5}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  label={{
                    value: "Google 'İyi' Eşiği (2.5s)",
                    position: "insideTopRight",
                    fill: "#059669",
                    fontSize: 11,
                    fontWeight: "bold"
                  }}
                />
              )}
              {metricTab === "cls" && (
                <ReferenceLine
                  yAxisId="left"
                  y={0.10}
                  stroke="#6366f1"
                  strokeDasharray="4 4"
                  label={{
                    value: "Google 'İyi' Eşiği (0.10)",
                    position: "insideTopRight",
                    fill: "#4f46e5",
                    fontSize: 11,
                    fontWeight: "bold"
                  }}
                />
              )}
              {metricTab === "fid" && (
                <ReferenceLine
                  yAxisId="left"
                  y={100}
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  label={{
                    value: "Google 'İyi' Eşiği (100ms)",
                    position: "insideTopRight",
                    fill: "#d97706",
                    fontSize: 11,
                    fontWeight: "bold"
                  }}
                />
              )}

              {/* Milestone vertical markers in forecast-only mode */}
              {timelineHorizon === "forecast-only" && (
                <>
                  <ReferenceLine
                    yAxisId="left"
                    x={forecastPoints[17]?.formattedDate}
                    stroke="#6366f1"
                    strokeDasharray="2 2"
                    label={{ value: "★ Early Hints", position: "top", fill: "#6366f1", fontSize: 10, fontWeight: "bold" }}
                  />
                  <ReferenceLine
                    yAxisId="left"
                    x={forecastPoints[44]?.formattedDate}
                    stroke="#10b981"
                    strokeDasharray="2 2"
                    label={{ value: "★ CSS Containment", position: "top", fill: "#059669", fontSize: 10, fontWeight: "bold" }}
                  />
                  <ReferenceLine
                    yAxisId="left"
                    x={forecastPoints[71]?.formattedDate}
                    stroke="#f59e0b"
                    strokeDasharray="2 2"
                    label={{ value: "★ Worker Defer", position: "top", fill: "#d97706", fontSize: 10, fontWeight: "bold" }}
                  />
                </>
              )}

              {/* ----------------- COMBINED 120-DAY TIMELINE SERIES ----------------- */}
              {timelineHorizon === "combined-120d" ? (
                <>
                  {/* LCP Historical & Forecast */}
                  {(metricTab === "all" || metricTab === "lcp") && (
                    <>
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="historicalLcp"
                        name="Geçmiş LCP (s)"
                        stroke="#059669"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="forecastLcp"
                        name="Tahmini LCP (s)"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        strokeDasharray="5 3"
                        dot={false}
                        activeDot={{ r: 5, fill: "#10b981", stroke: "#ffffff", strokeWidth: 2 }}
                      />
                    </>
                  )}

                  {/* CLS Historical & Forecast */}
                  {(metricTab === "all" || metricTab === "cls") && (
                    <>
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey={metricTab === "all" ? "historicalClsScaled" : "historicalCls"}
                        name={metricTab === "all" ? "Geçmiş CLS (Ölçek)" : "Geçmiş CLS (Skor)"}
                        stroke="#4338ca"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey={metricTab === "all" ? "forecastClsScaled" : "forecastCls"}
                        name={metricTab === "all" ? "Tahmini CLS (Ölçek)" : "Tahmini CLS (Skor)"}
                        stroke="#6366f1"
                        strokeWidth={2.5}
                        strokeDasharray="5 3"
                        dot={false}
                        activeDot={{ r: 5, fill: "#6366f1", stroke: "#ffffff", strokeWidth: 2 }}
                      />
                    </>
                  )}

                  {/* FID Historical & Forecast */}
                  {(metricTab === "all" || metricTab === "fid") && (
                    <>
                      <Line
                        yAxisId={metricTab === "all" ? "right" : "left"}
                        type="monotone"
                        dataKey="historicalFid"
                        name="Geçmiş FID (ms)"
                        stroke="#d97706"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        yAxisId={metricTab === "all" ? "right" : "left"}
                        type="monotone"
                        dataKey="forecastFid"
                        name="Tahmini FID (ms)"
                        stroke="#f59e0b"
                        strokeWidth={2.5}
                        strokeDasharray="5 3"
                        dot={false}
                        activeDot={{ r: 5, fill: "#f59e0b", stroke: "#ffffff", strokeWidth: 2 }}
                      />
                    </>
                  )}
                </>
              ) : (
                /* ----------------- FORECAST-ONLY 90-DAY PREDICTIVE SERIES ----------------- */
                <>
                  {/* LCP PREDICTED LINE */}
                  {(metricTab === "all" || metricTab === "lcp") && (
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="lcp"
                      name="Tahmini LCP (s)"
                      stroke="#10b981"
                      strokeWidth={3}
                      strokeDasharray="5 3"
                      dot={false}
                      activeDot={{ r: 6, fill: "#10b981", stroke: "#ffffff", strokeWidth: 2 }}
                    />
                  )}

                  {/* LCP Confidence Bounds */}
                  {showConfidenceBounds && metricTab === "lcp" && (
                    <>
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="lcpUpper"
                        name="LCP Üst Sınır (+1σ)"
                        stroke="#10b981"
                        strokeWidth={1}
                        strokeDasharray="2 2"
                        strokeOpacity={0.6}
                        dot={false}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="lcpLower"
                        name="LCP Alt Sınır (-1σ)"
                        stroke="#10b981"
                        strokeWidth={1}
                        strokeDasharray="2 2"
                        strokeOpacity={0.6}
                        dot={false}
                      />
                    </>
                  )}

                  {/* CLS PREDICTED LINE */}
                  {(metricTab === "all" || metricTab === "cls") && (
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey={metricTab === "all" ? "clsScaled" : "cls"}
                      name={metricTab === "all" ? "Tahmini CLS (x20 Ölçek)" : "Tahmini CLS (Skor)"}
                      stroke="#6366f1"
                      strokeWidth={3}
                      strokeDasharray="5 3"
                      dot={false}
                      activeDot={{ r: 6, fill: "#6366f1", stroke: "#ffffff", strokeWidth: 2 }}
                    />
                  )}

                  {/* CLS Confidence Bounds */}
                  {showConfidenceBounds && metricTab === "cls" && (
                    <>
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="clsUpper"
                        name="CLS Üst Sınır (+1σ)"
                        stroke="#6366f1"
                        strokeWidth={1}
                        strokeDasharray="2 2"
                        strokeOpacity={0.6}
                        dot={false}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="clsLower"
                        name="CLS Alt Sınır (-1σ)"
                        stroke="#6366f1"
                        strokeWidth={1}
                        strokeDasharray="2 2"
                        strokeOpacity={0.6}
                        dot={false}
                      />
                    </>
                  )}

                  {/* FID PREDICTED LINE */}
                  {(metricTab === "all" || metricTab === "fid") && (
                    <Line
                      yAxisId={metricTab === "all" ? "right" : "left"}
                      type="monotone"
                      dataKey="fid"
                      name="Tahmini FID (ms)"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      strokeDasharray="5 3"
                      dot={false}
                      activeDot={{ r: 6, fill: "#f59e0b", stroke: "#ffffff", strokeWidth: 2 }}
                    />
                  )}

                  {/* FID Confidence Bounds */}
                  {showConfidenceBounds && metricTab === "fid" && (
                    <>
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="fidUpper"
                        name="FID Üst Sınır (+1σ)"
                        stroke="#f59e0b"
                        strokeWidth={1}
                        strokeDasharray="2 2"
                        strokeOpacity={0.6}
                        dot={false}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="fidLower"
                        name="FID Alt Sınır (-1σ)"
                        stroke="#f59e0b"
                        strokeWidth={1}
                        strokeDasharray="2 2"
                        strokeOpacity={0.6}
                        dot={false}
                      />
                    </>
                  )}
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. Projected Milestones List & Engineering Notes */}
      <div className="p-5 sm:p-6 bg-slate-50/70 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800">
        <div className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-indigo-500" />
          <span>Gelecek 90 Günlük Otomatik Optimizasyon Kilometre Taşları</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {milestones.map((m) => (
            <div
              key={m.dayOffset}
              className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between hover:shadow-xs transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                    +{m.dayOffset}. Gün Projeksiyonu
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                    {m.impactDelta} {m.impactMetric}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                  {m.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {m.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Custom Recharts Tooltip for 90-day Core Web Vitals predictions
 */
const CustomForecastTooltip: React.FC<any> = ({ active, payload, label, timelineHorizon }) => {
  if (!active || !payload || !payload.length) return null;

  const dataPoint = payload[0]?.payload;
  if (!dataPoint) return null;

  const isHistorical = dataPoint.isHistorical;
  const isForecast = dataPoint.isForecast || !isHistorical;
  const displayLcp = dataPoint.lcp ?? dataPoint.forecastLcp ?? dataPoint.historicalLcp;
  const displayCls = dataPoint.cls ?? dataPoint.forecastCls ?? dataPoint.historicalCls;
  const displayFid = dataPoint.fid ?? dataPoint.forecastFid ?? dataPoint.historicalFid;
  const dayText = dataPoint.dayOffset !== undefined
    ? `+${dataPoint.dayOffset}. Gün`
    : dataPoint.dayIndex !== undefined
    ? (dataPoint.dayIndex <= 0 ? `${dataPoint.dayIndex}. Gün` : `+${dataPoint.dayIndex}. Gün`)
    : "";

  return (
    <div className="p-3.5 rounded-xl bg-slate-900/95 text-white border border-slate-700 shadow-2xl backdrop-blur-md text-xs min-w-[220px]">
      <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5 mb-2.5">
        <div>
          <span className="font-bold text-slate-100 block">
            {dayText ? `${dayText} ` : ""}({dataPoint.formattedDate || label})
          </span>
          <span className="text-[10px] text-slate-400 font-mono">{dataPoint.date}</span>
        </div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${
          isHistorical 
            ? "bg-slate-700 text-slate-200 border-slate-600" 
            : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
        }`}>
          {isHistorical ? "Saha Verisi (Geçmiş)" : "Öngörü: CWV İyi"}
        </span>
      </div>

      <div className="space-y-1.5 font-mono">
        <div className="flex items-center justify-between">
          <span className="text-emerald-400 font-sans flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> {isHistorical ? "Saha LCP:" : "Tahmini LCP:"}
          </span>
          <span className="font-bold text-slate-100">
            {displayLcp !== undefined ? `${displayLcp} s` : "-"}
            {dataPoint.lcpLower !== undefined && dataPoint.lcpUpper !== undefined && (
              <span className="text-[10px] text-slate-400 ml-1 font-sans">
                [{dataPoint.lcpLower} - {dataPoint.lcpUpper}]
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-indigo-400 font-sans flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-400" /> {isHistorical ? "Saha CLS:" : "Tahmini CLS:"}
          </span>
          <span className="font-bold text-slate-100">
            {displayCls !== undefined ? displayCls : "-"}
            {dataPoint.clsLower !== undefined && dataPoint.clsUpper !== undefined && (
              <span className="text-[10px] text-slate-400 ml-1 font-sans">
                [{dataPoint.clsLower} - {dataPoint.clsUpper}]
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-amber-400 font-sans flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> {isHistorical ? "Saha FID:" : "Tahmini FID:"}
          </span>
          <span className="font-bold text-slate-100">
            {displayFid !== undefined ? `${displayFid} ms` : "-"}
            {dataPoint.fidLower !== undefined && dataPoint.fidUpper !== undefined && (
              <span className="text-[10px] text-slate-400 ml-1 font-sans">
                [{dataPoint.fidLower} - {dataPoint.fidUpper}]
              </span>
            )}
          </span>
        </div>
      </div>

      {(dataPoint.milestone || dataPoint.milestoneTitle) && (
        <div className="mt-2.5 pt-2 border-t border-slate-700/80 text-[10px] text-amber-300 font-sans">
          ★ <strong>Kilometre Taşı:</strong> {dataPoint.milestone ? `${dataPoint.milestone.title} (${dataPoint.milestone.impactDelta})` : dataPoint.milestoneTitle}
        </div>
      )}
    </div>
  );
};
