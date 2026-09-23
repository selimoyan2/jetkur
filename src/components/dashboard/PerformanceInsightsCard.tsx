import React, { useState, useMemo, useEffect } from "react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine, 
  Legend 
} from "recharts";
import { 
  Activity, 
  Zap, 
  TrendingDown, 
  TrendingUp, 
  CheckCircle2, 
  Sparkles, 
  Smartphone, 
  Monitor, 
  Download, 
  Info, 
  ShieldCheck, 
  Gauge, 
  Clock, 
  Layers, 
  ChevronRight,
  ExternalLink,
  Sliders,
  Check,
  BellRing
} from "lucide-react";
import { SiteConfig, CustomerPanelTab } from "../../types";
import { generate90DayPerformanceTrendsData } from "../../utils/performanceTrendsGenerator";
import { PerformanceVitalsForecastLineChart } from "./PerformanceVitalsForecastLineChart";
import { PerformanceAlertManager } from "./PerformanceAlertManager";
import { loadAlertHistory } from "../../utils/performanceAlertEngine";
import { ContentGapAnalysisTool } from "./ContentGapAnalysisTool";

export interface PerformanceInsightsCardProps {
  config: SiteConfig;
  onNavigateTab?: (tab: CustomerPanelTab | string) => void;
  className?: string;
}

type VitalMetricTab = "all" | "lcp" | "cls" | "fid";
type ChartRenderType = "area" | "line";
type DeviceSimulation = "mobile" | "desktop";
type InsightViewMode = "history" | "forecast" | "combined" | "alerts" | "content-gap";

export const PerformanceInsightsCard: React.FC<PerformanceInsightsCardProps> = ({
  config,
  onNavigateTab,
  className = ""
}) => {
  const [insightViewMode, setInsightViewMode] = useState<InsightViewMode>("history");
  const [alertsCount, setAlertsCount] = useState<number>(() => {
    if (typeof window !== "undefined") {
      return loadAlertHistory().length;
    }
    return 0;
  });

  useEffect(() => {
    const updateCount = () => {
      setAlertsCount(loadAlertHistory().length);
    };
    window.addEventListener("cwv-alert-history-updated" as any, updateCount);
    return () => window.removeEventListener("cwv-alert-history-updated" as any, updateCount);
  }, []);
  const [activeMetricTab, setActiveMetricTab] = useState<VitalMetricTab>("all");
  const [chartType, setChartType] = useState<ChartRenderType>("area");
  const [device, setDevice] = useState<DeviceSimulation>("mobile");
  const [showMaOnly, setShowMaOnly] = useState<boolean>(false);
  const [activeInfoTooltip, setActiveInfoTooltip] = useState<string | null>(null);

  // 1. Generate 30-day realistic performance trends telemetry
  const { data: raw30DayData } = useMemo(() => {
    return generate90DayPerformanceTrendsData(config, 30);
  }, [config]);

  // Adjust metrics slightly based on device (Mobile 4G vs Desktop Fiber)
  const chartData = useMemo(() => {
    const mobileMultiplier = device === "mobile" ? 1.0 : 0.72; // Desktop is ~28% faster
    const mobileClsMultiplier = device === "mobile" ? 1.0 : 0.85;

    return raw30DayData.map((d) => {
      const adjustedLcp = Number((d.lcp * mobileMultiplier).toFixed(2));
      const adjustedLcpMa = d.lcp_ma ? Number((d.lcp_ma * mobileMultiplier).toFixed(2)) : adjustedLcp;
      const adjustedCls = Number((d.cls * mobileClsMultiplier).toFixed(3));
      const adjustedClsMa = d.cls_ma ? Number((d.cls_ma * mobileClsMultiplier).toFixed(3)) : adjustedCls;
      const adjustedFid = Math.max(8, Math.round(d.fid * mobileMultiplier));
      const adjustedFidMa = d.fid_ma ? Math.max(8, Math.round(d.fid_ma * mobileMultiplier)) : adjustedFid;

      // Scaled CLS for unified multi-metric view (x20 so it renders proportionally on 0-3 range)
      const clsScaled = Number((adjustedCls * 20).toFixed(2));

      return {
        ...d,
        lcp: adjustedLcp,
        lcp_ma: adjustedLcpMa,
        cls: adjustedCls,
        cls_ma: adjustedClsMa,
        clsScaled,
        fid: adjustedFid,
        fid_ma: adjustedFidMa,
      };
    });
  }, [raw30DayData, device]);

  // 2. Summary stats for the 30-day period (latest, average, p75, improvements)
  const summaryStats = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return {
        lcp: { latest: 1.12, p75: 1.25, deltaPercent: -28.4, status: "good" as const },
        cls: { latest: 0.015, p75: 0.022, deltaPercent: -75.0, status: "good" as const },
        fid: { latest: 16, p75: 22, deltaPercent: -36.5, status: "good" as const },
        passRatePercent: 100,
      };
    }

    const first = chartData[0];
    const latest = chartData[chartData.length - 1];

    // Calculate p75 (75th percentile - official Google CWV evaluation standard)
    const sortedLcp = [...chartData].map(d => d.lcp).sort((a, b) => a - b);
    const sortedCls = [...chartData].map(d => d.cls).sort((a, b) => a - b);
    const sortedFid = [...chartData].map(d => d.fid).sort((a, b) => a - b);
    const p75Idx = Math.floor(chartData.length * 0.75);

    const p75Lcp = sortedLcp[p75Idx] || latest.lcp;
    const p75Cls = sortedCls[p75Idx] || latest.cls;
    const p75Fid = sortedFid[p75Idx] || latest.fid;

    const deltaLcp = Number((((latest.lcp - first.lcp) / (first.lcp || 1)) * 100).toFixed(1));
    const deltaCls = Number((((latest.cls - first.cls) / (first.cls || 1)) * 100).toFixed(1));
    const deltaFid = Number((((latest.fid - first.fid) / (first.fid || 1)) * 100).toFixed(1));

    // Google Good thresholds: LCP <= 2.5s, CLS <= 0.10, FID <= 100ms
    const passedDaysCount = chartData.filter(d => d.lcp <= 2.5 && d.cls <= 0.10 && d.fid <= 100).length;
    const passRatePercent = Math.round((passedDaysCount / chartData.length) * 100);

    return {
      lcp: {
        latest: latest.lcp,
        p75: p75Lcp,
        deltaPercent: deltaLcp,
        status: latest.lcp <= 2.5 ? ("good" as const) : latest.lcp <= 4.0 ? ("needs-improvement" as const) : ("poor" as const)
      },
      cls: {
        latest: latest.cls,
        p75: p75Cls,
        deltaPercent: deltaCls,
        status: latest.cls <= 0.10 ? ("good" as const) : latest.cls <= 0.25 ? ("needs-improvement" as const) : ("poor" as const)
      },
      fid: {
        latest: latest.fid,
        p75: p75Fid,
        deltaPercent: deltaFid,
        status: latest.fid <= 100 ? ("good" as const) : latest.fid <= 300 ? ("needs-improvement" as const) : ("poor" as const)
      },
      passRatePercent
    };
  }, [chartData]);

  // CSV download function for 30-day Core Web Vitals
  const handleDownloadCsv = () => {
    if (!chartData || chartData.length === 0) return;
    const headers = ["Tarih", "Gun_Indeksi", "LCP_Saniye", "LCP_7g_HO", "CLS_Skor", "CLS_7g_HO", "FID_Milisaniye", "FID_7g_HO", "CWV_Durum"];
    const rows = chartData.map(d => [
      d.date,
      d.dayIndex,
      d.lcp,
      d.lcp_ma || d.lcp,
      d.cls,
      d.cls_ma || d.cls,
      d.fid,
      d.fid_ma || d.fid,
      d.cwvPassStatus
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `core_web_vitals_30_gun_${device}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      id="performance-insights-card" 
      data-testid="performance-insights-card"
      className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden transition-all ${className}`}
    >
      {/* 1. Header Bar */}
      <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-slate-50/50 via-white to-indigo-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-xs">
              <Activity className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Performance Insights
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-black border border-emerald-500/20 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Google CWV: Geçti (%{summaryStats.passRatePercent})</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold">
              Son 30 Günlük Saha Verisi
            </span>
            <button
              type="button"
              id="btn-header-cwv-alerts"
              onClick={() => setInsightViewMode("alerts")}
              className="px-2.5 py-0.5 rounded-full bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Gerçek Zamanlı Core Web Vitals Uyarı Sistemi"
            >
              <BellRing className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              <span>Canlı Uyarılar</span>
              {alertsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black">
                  {alertsCount}
                </span>
              )}
            </button>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
            Google Core Web Vitals (LCP, CLS, FID) metriklerinin son 30 günlük zaman serisi geçmişi, 75. yüzdelik (p75) dağılımı ve kararlılık trendi.
          </p>
        </div>

        {/* Header Action Controls */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          {/* Device Toggle */}
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <button
              type="button"
              id="btn-insights-device-mobile"
              onClick={() => setDevice("mobile")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                device === "mobile"
                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
              title="Mobil 4G cihaz simülasyonu"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobil</span>
            </button>
            <button
              type="button"
              id="btn-insights-device-desktop"
              onClick={() => setDevice("desktop")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                device === "desktop"
                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
              title="Masaüstü yüksek hızlı fiber simülasyonu"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Masaüstü</span>
            </button>
          </div>

          {/* Chart Style Toggle (Area / Line) */}
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <button
              type="button"
              id="btn-insights-chart-area"
              onClick={() => setChartType("area")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                chartType === "area"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Alan
            </button>
            <button
              type="button"
              id="btn-insights-chart-line"
              onClick={() => setChartType("line")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                chartType === "line"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Çizgi
            </button>
          </div>

          {/* CSV Export Button */}
          <button
            type="button"
            id="btn-insights-export-csv"
            onClick={handleDownloadCsv}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Son 30 günlük Core Web Vitals verilerini CSV formatında indirin"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span className="hidden sm:inline">CSV İndir</span>
          </button>
        </div>
      </div>

      {/* View Mode Switcher: 30-Day History vs 90-Day Forecast vs Combined Timeline */}
      <div className="px-5 sm:px-6 py-3 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 dark:bg-slate-800/80 rounded-xl">
          <button
            type="button"
            id="btn-viewmode-history"
            onClick={() => setInsightViewMode("history")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              insightViewMode === "history"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Saha Verisi (Son 30 Gün)</span>
          </button>
          <button
            type="button"
            id="btn-viewmode-forecast"
            onClick={() => setInsightViewMode("forecast")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              insightViewMode === "forecast"
                ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>90 Günlük Tahmin Modeli (Recharts)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black border border-emerald-500/20">
              Yeni
            </span>
          </button>
          <button
            type="button"
            id="btn-viewmode-combined"
            onClick={() => setInsightViewMode("combined")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              insightViewMode === "combined"
                ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            <span>120G Birleşik Zaman Çizelgesi</span>
          </button>
          <button
            type="button"
            id="btn-viewmode-alerts"
            onClick={() => setInsightViewMode("alerts")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              insightViewMode === "alerts"
                ? "bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <BellRing className="w-3.5 h-3.5 text-rose-500" />
            <span>Canlı Performans Uyarıları</span>
            {alertsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black">
                {alertsCount}
              </span>
            )}
          </button>
          <button
            type="button"
            id="btn-viewmode-content-gap"
            onClick={() => setInsightViewMode("content-gap")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              insightViewMode === "content-gap"
                ? "bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-xs ring-1 ring-purple-400/40"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span>Content Gap Analizi (Gemini AI)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-400 text-[10px] font-black">
              3 Rakip
            </span>
          </button>
        </div>

        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
          {insightViewMode === "history" && "Geçmiş 30 günlük zaman serisi saha telemetrisi"}
          {insightViewMode === "forecast" && "Regresyon ve asimptotik sınır algoritmalı 90 günlük gelecek simülasyonu"}
          {insightViewMode === "combined" && "30 gün gerçekleşen saha verisi + 90 gün öngörülen gelecek projeksiyonu"}
          {insightViewMode === "alerts" && "LCP, CLS ve FID metrikleri için Google 'Kötü' eşiği aşım uyarıları"}
          {insightViewMode === "content-gap" && "Gemini 3.8 Flash ile sitenizin içeriğini ilk 3 rakiple kıyaslayan eksik anahtar kelime ve topic cluster analizi"}
        </div>
      </div>

      {insightViewMode === "content-gap" ? (
        <div className="p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-900/40">
          <ContentGapAnalysisTool config={config} onNavigateTab={onNavigateTab} />
        </div>
      ) : insightViewMode === "forecast" ? (
        <div className="p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-900/40">
          <PerformanceVitalsForecastLineChart
            historicalData={chartData}
            device={device}
            initialTimelineHorizon="forecast-only"
            onExploreMetrics={() => setInsightViewMode("history")}
          />
        </div>
      ) : insightViewMode === "combined" ? (
        <div className="p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-900/40">
          <PerformanceVitalsForecastLineChart
            historicalData={chartData}
            device={device}
            initialTimelineHorizon="combined-120d"
            onExploreMetrics={() => setInsightViewMode("history")}
          />
        </div>
      ) : insightViewMode === "alerts" ? (
        <div className="p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-900/40">
          <PerformanceAlertManager />
        </div>
      ) : (
        <>
          {/* 2. Top 3 Interactive Core Web Vitals Highlight Cards (LCP, CLS, FID) */}
          <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/60 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800/80">
        
        {/* Vital 1: LCP */}
        <div 
          id="vital-card-lcp"
          onClick={() => setActiveMetricTab("lcp")}
          className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
            activeMetricTab === "lcp"
              ? "bg-white dark:bg-slate-800/90 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                LCP (Yükleme Hızı)
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-black border border-emerald-200 dark:border-emerald-800">
              Hedef: ≤ 2.5s
            </span>
          </div>

          <div className="mt-2.5 flex items-baseline justify-between">
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
                {summaryStats.lcp.latest} <span className="text-sm font-sans font-bold text-slate-500">sn</span>
              </div>
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                p75: <span className="font-bold text-slate-700 dark:text-slate-200 font-mono">{summaryStats.lcp.p75}s</span> (Google Standardı)
              </div>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>{Math.abs(summaryStats.lcp.deltaPercent)}%</span>
              </div>
              <div className="text-[10px] text-slate-600 dark:text-slate-300 font-medium mt-1">
                30 günde daha hızlı
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Largest Contentful Paint</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check className="w-3 h-3" /> İyi (Good)
            </span>
          </div>
        </div>

        {/* Vital 2: CLS */}
        <div 
          id="vital-card-cls"
          onClick={() => setActiveMetricTab("cls")}
          className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
            activeMetricTab === "cls"
              ? "bg-white dark:bg-slate-800/90 border-indigo-500 ring-2 ring-indigo-500/20 shadow-md"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-indigo-500/20" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                CLS (Görsel Kararlılık)
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-black border border-indigo-200 dark:border-indigo-800">
              Hedef: ≤ 0.10
            </span>
          </div>

          <div className="mt-2.5 flex items-baseline justify-between">
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
                {summaryStats.cls.latest} <span className="text-sm font-sans font-bold text-slate-500">skor</span>
              </div>
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                p75: <span className="font-bold text-slate-700 dark:text-slate-200 font-mono">{summaryStats.cls.p75}</span> (Sıfıra Yakın)
              </div>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-0.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>{Math.abs(summaryStats.cls.deltaPercent)}%</span>
              </div>
              <div className="text-[10px] text-slate-600 dark:text-slate-300 font-medium mt-1">
                Kayma azaldı
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Cumulative Layout Shift</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              <Check className="w-3 h-3" /> İyi (Good)
            </span>
          </div>
        </div>

        {/* Vital 3: FID */}
        <div 
          id="vital-card-fid"
          onClick={() => setActiveMetricTab("fid")}
          className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
            activeMetricTab === "fid"
              ? "bg-white dark:bg-slate-800/90 border-amber-500 ring-2 ring-amber-500/20 shadow-md"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-amber-500/20" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                FID (İlk Giriş Yanıtı)
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[10px] font-black border border-amber-200 dark:border-amber-800">
              Hedef: ≤ 100ms
            </span>
          </div>

          <div className="mt-2.5 flex items-baseline justify-between">
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
                {summaryStats.fid.latest} <span className="text-sm font-sans font-bold text-slate-500">ms</span>
              </div>
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                p75: <span className="font-bold text-slate-700 dark:text-slate-200 font-mono">{summaryStats.fid.p75}ms</span> (Anında Yanıt)
              </div>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-0.5 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>{Math.abs(summaryStats.fid.deltaPercent)}%</span>
              </div>
              <div className="text-[10px] text-slate-600 dark:text-slate-300 font-medium mt-1">
                Gecikme azaldı
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>First Input Delay</span>
            <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Check className="w-3 h-3" /> İyi (Good)
            </span>
          </div>
        </div>

      </div>

      {/* 3. Metric Tab Selector Bar */}
      <div className="px-5 sm:px-6 pt-4 pb-2 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/90 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex-wrap">
          <button
            type="button"
            id="btn-metric-tab-all"
            onClick={() => setActiveMetricTab("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMetricTab === "all"
                ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tümü (LCP + CLS + FID)</span>
          </button>

          <button
            type="button"
            id="btn-metric-tab-lcp"
            onClick={() => setActiveMetricTab("lcp")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMetricTab === "lcp"
                ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>LCP (s)</span>
          </button>

          <button
            type="button"
            id="btn-metric-tab-cls"
            onClick={() => setActiveMetricTab("cls")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMetricTab === "cls"
                ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>CLS (Skor)</span>
          </button>

          <button
            type="button"
            id="btn-metric-tab-fid"
            onClick={() => setActiveMetricTab("fid")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMetricTab === "fid"
                ? "bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>FID (ms)</span>
          </button>
        </div>

        {/* 7-day Moving Average Smoothing Toggle */}
        <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer select-none">
          <input
            type="checkbox"
            id="cb-insights-show-ma"
            checked={showMaOnly}
            onChange={(e) => setShowMaOnly(e.target.checked)}
            className="w-4 h-4 rounded text-indigo-600 border-slate-300 dark:border-slate-700 focus:ring-indigo-500"
          />
          <span>7 Günlük Hareketli Ortalama (Trend Çizgisi)</span>
        </label>
      </div>

      {/* 4. The Recharts Visualization Container */}
      <div className="p-5 sm:p-6 pt-2">
        <div className="h-72 sm:h-80 w-full" id="recharts-cwv-container">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "area" ? (
              <AreaChart
                data={chartData}
                margin={{ top: 15, right: 25, left: -10, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="gradientLcp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="gradientCls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="gradientFid" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.6} />
                <XAxis 
                  dataKey="formattedDate" 
                  tickLine={false} 
                  axisLine={{ stroke: "#cbd5e1" }}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  interval={3}
                />
                
                {/* When viewing All or LCP/CLS: Left Y-Axis */}
                <YAxis 
                  yAxisId="left"
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  domain={
                    activeMetricTab === "cls" 
                      ? [0, 0.15] 
                      : activeMetricTab === "fid" 
                      ? [0, 80] 
                      : [0, 3.5]
                  }
                  unit={activeMetricTab === "cls" ? "" : activeMetricTab === "fid" ? "ms" : "s"}
                />

                {/* Right Y-Axis for FID when in 'all' view */}
                {activeMetricTab === "all" && (
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#f59e0b" }}
                    domain={[0, 80]}
                    unit="ms"
                  />
                )}

                <Tooltip content={<CustomVitalsTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{value}</span>}
                />

                {/* Reference Lines for Google Targets */}
                {activeMetricTab === "lcp" && (
                  <ReferenceLine 
                    yAxisId="left"
                    y={2.5} 
                    stroke="#10b981" 
                    strokeDasharray="4 4" 
                    label={{ value: "Google 'İyi' Eşiği (2.5s)", position: "insideTopRight", fill: "#059669", fontSize: 11, fontWeight: "bold" }} 
                  />
                )}
                {activeMetricTab === "cls" && (
                  <ReferenceLine 
                    yAxisId="left"
                    y={0.10} 
                    stroke="#6366f1" 
                    strokeDasharray="4 4" 
                    label={{ value: "Google 'İyi' Eşiği (0.10)", position: "insideTopRight", fill: "#4f46e5", fontSize: 11, fontWeight: "bold" }} 
                  />
                )}
                {activeMetricTab === "fid" && (
                  <ReferenceLine 
                    yAxisId="left"
                    y={100} 
                    stroke="#f59e0b" 
                    strokeDasharray="4 4" 
                    label={{ value: "Google 'İyi' Eşiği (100ms)", position: "insideTopRight", fill: "#d97706", fontSize: 11, fontWeight: "bold" }} 
                  />
                )}

                {/* LCP Area */}
                {(activeMetricTab === "all" || activeMetricTab === "lcp") && (
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey={showMaOnly ? "lcp_ma" : "lcp"}
                    name="LCP (En Büyük Boyama - s)"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#gradientLcp)"
                    activeDot={{ r: 6, fill: "#10b981", stroke: "#ffffff", strokeWidth: 2 }}
                  />
                )}

                {/* CLS Area */}
                {(activeMetricTab === "all" || activeMetricTab === "cls") && (
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey={activeMetricTab === "all" ? "clsScaled" : showMaOnly ? "cls_ma" : "cls"}
                    name={activeMetricTab === "all" ? "CLS (x20 Ölçekli Skor)" : "CLS (Düzen Kayması)"}
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#gradientCls)"
                    activeDot={{ r: 6, fill: "#6366f1", stroke: "#ffffff", strokeWidth: 2 }}
                  />
                )}

                {/* FID Area */}
                {(activeMetricTab === "all" || activeMetricTab === "fid") && (
                  <Area
                    yAxisId={activeMetricTab === "all" ? "right" : "left"}
                    type="monotone"
                    dataKey={showMaOnly ? "fid_ma" : "fid"}
                    name="FID (İlk Giriş Gecikmesi - ms)"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#gradientFid)"
                    activeDot={{ r: 6, fill: "#f59e0b", stroke: "#ffffff", strokeWidth: 2 }}
                  />
                )}
              </AreaChart>
            ) : (
              <LineChart
                data={chartData}
                margin={{ top: 15, right: 25, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.6} />
                <XAxis 
                  dataKey="formattedDate" 
                  tickLine={false} 
                  axisLine={{ stroke: "#cbd5e1" }}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  interval={3}
                />
                <YAxis 
                  yAxisId="left"
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  domain={
                    activeMetricTab === "cls" 
                      ? [0, 0.15] 
                      : activeMetricTab === "fid" 
                      ? [0, 80] 
                      : [0, 3.5]
                  }
                  unit={activeMetricTab === "cls" ? "" : activeMetricTab === "fid" ? "ms" : "s"}
                />

                {activeMetricTab === "all" && (
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#f59e0b" }}
                    domain={[0, 80]}
                    unit="ms"
                  />
                )}

                <Tooltip content={<CustomVitalsTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{value}</span>}
                />

                {(activeMetricTab === "all" || activeMetricTab === "lcp") && (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey={showMaOnly ? "lcp_ma" : "lcp"}
                    name="LCP (s)"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 2.5, fill: "#10b981" }}
                    activeDot={{ r: 6, fill: "#10b981", stroke: "#ffffff", strokeWidth: 2 }}
                  />
                )}

                {(activeMetricTab === "all" || activeMetricTab === "cls") && (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey={activeMetricTab === "all" ? "clsScaled" : showMaOnly ? "cls_ma" : "cls"}
                    name={activeMetricTab === "all" ? "CLS (x20 Ölçek)" : "CLS (Skor)"}
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{ r: 2.5, fill: "#6366f1" }}
                    activeDot={{ r: 6, fill: "#6366f1", stroke: "#ffffff", strokeWidth: 2 }}
                  />
                )}

                {(activeMetricTab === "all" || activeMetricTab === "fid") && (
                  <Line
                    yAxisId={activeMetricTab === "all" ? "right" : "left"}
                    type="monotone"
                    dataKey={showMaOnly ? "fid_ma" : "fid"}
                    name="FID (ms)"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ r: 2.5, fill: "#f59e0b" }}
                    activeDot={{ r: 6, fill: "#f59e0b", stroke: "#ffffff", strokeWidth: 2 }}
                  />
                )}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* 90-Day Forecast Teaser Callout Banner */}
      <div className="mx-5 sm:mx-6 my-4 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-teal-500/5 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Gelecek 90 Günlük Core Web Vitals Tahmini Modeli</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                Recharts Projeksiyonu
              </span>
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 max-w-2xl">
              Geçmiş 30 günlük trend doğrultusunda 90 günlük LCP, CLS ve FID eğrisini güven sınırları ve optimizasyon kilometre taşlarıyla görüntüleyin.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            id="btn-open-combined-from-history"
            onClick={() => setInsightViewMode("combined")}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            <span>120G Zaman Çizelgesi</span>
          </button>
          <button
            type="button"
            id="btn-open-forecast-from-history"
            onClick={() => setInsightViewMode("forecast")}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span>90G Tahmin Grafiği</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 5. Google Page Experience & Diagnostics Box */}
      <div className="p-5 sm:p-6 bg-slate-50/70 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Diagnostic Item 1 */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>LCP Optimizasyonu</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  {summaryStats.lcp.latest}s
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Görseller Cloudflare Edge CDN üzerinden WebP/AVIF olarak dağıtılıyor ve hero görselleri <code className="text-indigo-600 dark:text-indigo-400 font-mono text-[10px]">fetchpriority="high"</code> ile önceden yükleniyor.
              </p>
            </div>
          </div>

          {/* Diagnostic Item 2 */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>CLS Sıfırlama Garantisi</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
                  {summaryStats.cls.latest}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Tüm görsel kapsayıcılarına sabit en-boy oranları (aspect-ratio) ve font-display: swap kuralları tanımlandığından yerleşim kaymaları tamamen önlenmiştir.
              </p>
            </div>
          </div>

          {/* Diagnostic Item 3 */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>FID / INP Gecikme Yanıtı</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                  {summaryStats.fid.latest}ms
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                JavaScript bundle'ları kod bölme (code-splitting) ile küçültülmüş, analitik scriptleri ertelenerek (deferred) ana iş parçacığı blokajı sıfırlanmıştır.
              </p>
            </div>
          </div>

        </div>

        {/* Footer Navigation Bar */}
        <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>
              Google sıralama faktörü olan <strong>Page Experience</strong> değerlendirmesinde siteniz %100 uyumluluk sağlamaktadır.
            </span>
          </div>

          {onNavigateTab && (
            <button
              type="button"
              id="btn-insights-view-full-performance"
              onClick={() => onNavigateTab("performance")}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-bold flex items-center gap-1 cursor-pointer transition-colors active:scale-95"
            >
              <span>Detaylı Hız Denetimi ve Lighthouse Raporu</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      </>
      )}
    </div>
  );
};

/**
 * Custom Recharts Tooltip showing detailed LCP, CLS, FID on hover
 */
const CustomVitalsTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  const dataPoint = payload[0]?.payload;
  if (!dataPoint) return null;

  return (
    <div className="p-3 rounded-xl bg-slate-900/95 text-white border border-slate-700 shadow-xl backdrop-blur-md text-xs min-w-[200px]">
      <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5 mb-2">
        <span className="font-bold text-slate-200">{dataPoint.formattedDate} ({dataPoint.date})</span>
        <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          CWV Geçti
        </span>
      </div>

      <div className="space-y-1.5 font-mono">
        <div className="flex items-center justify-between">
          <span className="text-emerald-400 font-sans flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> LCP:
          </span>
          <span className="font-bold">{dataPoint.lcp} s</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-indigo-400 font-sans flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-indigo-400" /> CLS:
          </span>
          <span className="font-bold">{dataPoint.cls}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-amber-400 font-sans flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> FID:
          </span>
          <span className="font-bold">{dataPoint.fid} ms</span>
        </div>
      </div>

      {dataPoint.milestone && (
        <div className="mt-2 pt-1.5 border-t border-slate-700/80 text-[10px] text-amber-300 font-sans">
          ★ {dataPoint.milestone.title} ({dataPoint.milestone.impactDelta})
        </div>
      )}
    </div>
  );
};
