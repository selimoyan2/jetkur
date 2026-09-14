import React, { useState, useEffect, useMemo } from "react";
import { SiteConfig } from "../../types";
import { 
  generateRealtimeTrafficData, 
  exportTrafficCsv, 
  TrafficSimulationSummary 
} from "../../utils/realtimeTrafficEngine";
import { RealtimeTrafficD3Chart, TrafficChartMetricView } from "./RealtimeTrafficD3Chart";
import {
  Activity,
  Users,
  TrendingDown,
  TrendingUp,
  Zap,
  Clock,
  Download,
  Play,
  Pause,
  RefreshCw,
  Smartphone,
  Monitor,
  Globe,
  Sliders,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Layers,
  HelpCircle,
  Maximize2
} from "lucide-react";

interface RealtimeTrafficOverviewWidgetProps {
  config: SiteConfig;
  onChange?: (updatedConfig: SiteConfig) => void;
  onNavigateTab?: (tab: string) => void;
  isCompactWidget?: boolean;
  onOpenFullView?: () => void;
  className?: string;
}

export const RealtimeTrafficOverviewWidget: React.FC<RealtimeTrafficOverviewWidgetProps> = ({
  config,
  onChange,
  onNavigateTab,
  isCompactWidget = false,
  onOpenFullView,
  className = ""
}) => {
  // Widget Filter & Simulation State
  const [deviceFilter, setDeviceFilter] = useState<"all" | "mobile" | "desktop">("all");
  const [timeWindow, setTimeWindow] = useState<"24h" | "12h" | "6h">("24h");
  const [metricView, setMetricView] = useState<TrafficChartMetricView>("dual");
  const [simulationMode, setSimulationMode] = useState<"optimized" | "degraded">("optimized");
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [jitterTick, setJitterTick] = useState(1);
  const [showSpeedExplainModal, setShowSpeedExplainModal] = useState(false);
  const [activeVisitorTab, setActiveVisitorTab] = useState<"chart" | "live-stream">("chart");

  // Real-time ticking interval (every 5 seconds when live streaming is on)
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      setJitterTick((prev) => (prev + 1) % 100);
    }, 5000);

    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  // Compute traffic and bounce rate pulling directly from simulated performance engine
  const trafficData: TrafficSimulationSummary = useMemo(() => {
    return generateRealtimeTrafficData(config, {
      deviceFilter,
      simulationMode,
      timeWindow,
      jitterSeed: jitterTick
    });
  }, [config, deviceFilter, simulationMode, timeWindow, jitterTick]);

  // Handle CSV Export
  const handleExportCsv = () => {
    exportTrafficCsv(trafficData.hourlyPoints, config.companyName || "Firma");
  };

  return (
    <div
      id="realtime-traffic-overview-widget"
      className={`rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-sm transition-all ${className}`}
    >
      {/* 1. TOP HEADER & LIVE BADGE */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-800 text-xs font-bold">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${!isLiveStreaming ? "hidden" : ""}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isLiveStreaming ? "bg-emerald-500" : "bg-slate-400"}`} />
              </span>
              <span>{isLiveStreaming ? "CANLI AKIŞ" : "DURAKLATILDI"}</span>
              <span className="text-[10px] text-emerald-600/80 font-normal">
                • Performans Motoru Senkronize
              </span>
            </div>

            {simulationMode === "degraded" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold animate-pulse">
                <AlertTriangle className="w-3 h-3 text-rose-500" />
                <span>Yavaş Mod Simülasyonu Aktif</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Gerçek Zamanlı Trafik &amp; Ziyaretçi Genel Bakışı
            </h2>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono text-[11px] font-bold border border-indigo-100">
              D3.js
            </span>
          </div>

          <p className="text-xs text-slate-500 max-w-2xl">
            Sitenizin saatlik ziyaretçi akışını ve sayfa açılış hızının (LCP/TTFB) hemen çıkma oranına (Bounce Rate) doğrudan etkisini canlı izleyin.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Live Pause / Resume Button */}
          <button
            type="button"
            id="traffic-live-toggle-btn"
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
              isLiveStreaming
                ? "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                : "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-600"
            }`}
            title={isLiveStreaming ? "Canlı akışı duraklat" : "Canlı akışı başlat"}
          >
            {isLiveStreaming ? (
              <>
                <Pause className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Akışı Duraklat</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Canlı Başlat</span>
              </>
            )}
          </button>

          {/* Quick Refresh */}
          <button
            type="button"
            id="traffic-refresh-tick-btn"
            onClick={() => setJitterTick((prev) => (prev + 1) % 100)}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs transition-colors cursor-pointer"
            title="Anlık verileri yeniden hesapla"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* CSV Export */}
          <button
            type="button"
            id="traffic-export-csv-btn"
            onClick={handleExportCsv}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            title="24 Saatlik Trafik Tablosunu CSV olarak indir"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>CSV İndir</span>
          </button>

          {/* Full View Navigation (if compact) */}
          {isCompactWidget && onOpenFullView && (
            <button
              type="button"
              id="traffic-open-full-view-btn"
              onClick={onOpenFullView}
              className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Genişlet</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. KEY METRICS KPI CARDS (4 CARDS) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 my-5">
        {/* Card 1: Live Concurrent Visitors */}
        <div className="rounded-2xl p-4 bg-gradient-to-br from-indigo-900 to-slate-900 text-white relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-indigo-200 font-medium">Anlık Ziyaretçi</span>
            <div className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black tracking-tight font-mono">
              {trafficData.currentLiveVisitors}
            </span>
            <span className="text-xs text-emerald-400 font-bold">Kullanıcı Sitede</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-300 flex items-center gap-1 truncate">
            <Activity className="w-3 h-3 text-indigo-300 shrink-0" />
            <span>{trafficData.liveVisitors.length} aktif sayfa oturumu</span>
          </div>
        </div>

        {/* Card 2: 24-Hour Total Visitors */}
        <div className="rounded-2xl p-4 bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">24 Saatlik Hacim</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
              {trafficData.totalVisitors24h.toLocaleString("tr-TR")}
            </span>
            <span className="text-[11px] text-slate-500">Ziyaret</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-600 flex items-center justify-between font-mono">
            <span>{trafficData.totalUniqueVisitors24h.toLocaleString("tr-TR")} tekil</span>
            <span className="text-slate-400">•</span>
            <span>{trafficData.totalPageviews24h.toLocaleString("tr-TR")} sayfa</span>
          </div>
        </div>

        {/* Card 3: Avg Bounce Rate */}
        <div className="rounded-2xl p-4 bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Ort. Hemen Çıkma</span>
            <TrendingDown className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-2xl sm:text-3xl font-black tracking-tight font-mono ${
                trafficData.avgBounceRate24h < 26
                  ? "text-emerald-700"
                  : trafficData.avgBounceRate24h < 40
                  ? "text-amber-700"
                  : "text-rose-700"
              }`}
            >
              %{trafficData.avgBounceRate24h}
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
              {trafficData.avgBounceRate24h < 26 ? "Mükemmel" : "Normal"}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-700 font-medium flex items-center gap-1 truncate">
            <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>Sektörden %{trafficData.bounceReductionVsBenchmark} daha düşük kayıp</span>
          </div>
        </div>

        {/* Card 4: Site Performance Engine Standing */}
        <div className="rounded-2xl p-4 bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Performans Etkisi</span>
            <Zap className="w-4 h-4 text-emerald-500 fill-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
              {trafficData.hourlyPoints[0]?.lcpSec || "0.82"}s
            </span>
            <span className="text-[11px] text-slate-500">Ort. LCP</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-600 flex items-center justify-between">
            <span className="font-mono text-emerald-700 font-bold">
              {trafficData.hourlyPoints[0]?.ttfbMs || 14}ms TTFB
            </span>
            <span className="text-slate-400">•</span>
            <span className="font-mono text-indigo-700 font-bold">
              {trafficData.overallPerformanceScore}/100 Puan
            </span>
          </div>
        </div>
      </div>

      {/* 3. FILTER & VIEW SELECTOR TOOLBAR */}
      <div className="p-3 rounded-2xl bg-slate-50/90 border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 mb-4">
        {/* Device Filter */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold shadow-2xs">
          <button
            type="button"
            id="traffic-device-all-btn"
            onClick={() => setDeviceFilter("all")}
            className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
              deviceFilter === "all" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Tüm Cihazlar
          </button>
          <button
            type="button"
            id="traffic-device-mobile-btn"
            onClick={() => setDeviceFilter("mobile")}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
              deviceFilter === "mobile" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Smartphone className="w-3 h-3" />
            <span>Mobil (%67)</span>
          </button>
          <button
            type="button"
            id="traffic-device-desktop-btn"
            onClick={() => setDeviceFilter("desktop")}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
              deviceFilter === "desktop" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Monitor className="w-3 h-3" />
            <span>Masaüstü (%33)</span>
          </button>
        </div>

        {/* Metric View Switcher */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold shadow-2xs">
          <button
            type="button"
            id="traffic-metric-dual-btn"
            onClick={() => setMetricView("dual")}
            className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
              metricView === "dual" ? "bg-indigo-600 text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            İkili Görünüm (Dual)
          </button>
          <button
            type="button"
            id="traffic-metric-visitors-btn"
            onClick={() => setMetricView("visitors")}
            className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
              metricView === "visitors" ? "bg-indigo-600 text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Sadece Ziyaretçiler
          </button>
          <button
            type="button"
            id="traffic-metric-bounce-btn"
            onClick={() => setMetricView("bounce")}
            className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
              metricView === "bounce" ? "bg-amber-600 text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Sadece Hemen Çıkma (%)
          </button>
        </div>

        {/* Time Window Switcher */}
        <div className="flex items-center gap-1.5 text-xs font-bold">
          <span className="text-slate-400 hidden sm:inline">Aralık:</span>
          {(["24h", "12h", "6h"] as const).map((win) => (
            <button
              key={win}
              type="button"
              onClick={() => setTimeWindow(win)}
              className={`px-2.5 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                timeWindow === win
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {win === "24h" ? "24 Saat" : win === "12h" ? "Son 12S" : "Son 6S"}
            </button>
          ))}
        </div>
      </div>

      {/* 4. D3.JS INTERACTIVE CHART CONTAINER */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/50 border border-slate-200/90 relative">
        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs mb-3 pb-2 border-b border-slate-200/60">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <span className="w-3.5 h-2.5 rounded-xs bg-indigo-500" />
              <span>Saatlik Ziyaretçi Hacmi</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <span className="w-3.5 h-0.5 border-t-2 border-dashed border-amber-600" />
              <span>Hemen Çıkma Oranı (%)</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Şu Anki Saat İndikatörü</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-medium">
            Pik Saat: <strong className="text-slate-800">{trafficData.peakHour.hourLabel}</strong> (
            {trafficData.peakHour.visitors} ziyaretçi) • En Düşük Kayıp:{" "}
            <strong className="text-emerald-700">%{trafficData.lowestBounceHour.bounceRate}</strong> (
            {trafficData.lowestBounceHour.hourLabel})
          </div>
        </div>

        {/* The D3.js Chart */}
        <RealtimeTrafficD3Chart
          data={trafficData.hourlyPoints}
          metricView={metricView}
          height={isCompactWidget ? 290 : 330}
          highlightCurrentHour={true}
        />
      </div>

      {/* 5. PERFORMANCE ENGINE IMPACT CORRELATION & WHAT-IF SIMULATOR */}
      <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Performans &amp; Hemen Çıkma Korelasyonu</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
              {trafficData.speedCorrelationInsight}
            </p>
          </div>

          {/* Interactive What-If Simulator Toggle */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            <div className="text-right hidden lg:block">
              <div className="text-[11px] text-slate-400 font-semibold">Simülatör Modu</div>
              <div className="text-xs font-bold text-white">
                {simulationMode === "optimized" ? "Lighthouse 100/100" : "Yavaş Mod (+3.2s LCP)"}
              </div>
            </div>

            <button
              type="button"
              id="toggle-traffic-simulation-mode-btn"
              onClick={() => setSimulationMode(simulationMode === "optimized" ? "degraded" : "optimized")}
              className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
                simulationMode === "optimized"
                  ? "bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700"
                  : "bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-300"
              }`}
              title="Sitenin yavaşlaması durumunda hemen çıkma oranının nasıl fırladığını test edin"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>
                {simulationMode === "optimized"
                  ? "Yavaşlık Etkisini Test Et"
                  : "Normal Hızlı Moda Dön"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 6. LIVE CONCURRENT VISITOR FEED DRAWER */}
      <div className="mt-5 border-t border-slate-100 pt-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-800">
              Anlık Ziyaretçi Oturumları ({trafficData.liveVisitors.length} Aktif Kullanıcı)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Cloudflare Edge Telemetrisi
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {trafficData.liveVisitors.map((v, i) => (
            <div
              key={v.id}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 hover:border-indigo-200 transition-colors text-xs flex flex-col justify-between space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 font-bold text-slate-800 truncate">
                  {v.device === "mobile" ? (
                    <Smartphone className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  ) : (
                    <Monitor className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  )}
                  <span className="truncate">{v.city}</span>
                </span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    v.status === "converted"
                      ? "bg-emerald-100 text-emerald-800"
                      : v.status === "engaged"
                      ? "bg-indigo-100 text-indigo-800"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {v.status === "converted" ? "Dönüşüm / Teklif" : v.status === "engaged" ? "İnceliyor" : "Aktif"}
                </span>
              </div>

              <div className="text-[11px] text-indigo-700 font-mono font-medium truncate">
                {v.page}
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-200/50 pt-1.5">
                <span className="truncate">{v.source}</span>
                <span>{v.durationSec}s sitede</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
