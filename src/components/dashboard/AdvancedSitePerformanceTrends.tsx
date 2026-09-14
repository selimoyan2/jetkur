import React, { useState, useMemo } from "react";
import { 
  SiteConfig, 
  CoreWebVitalMetricKey, 
  PerformanceTrendGranularity, 
  RollingWindowDays,
  PerformanceMilestoneEvent,
  CustomerPanelTab 
} from "../../types";
import { 
  generate90DayPerformanceTrendsData, 
  generatePerformanceTrendsCsv, 
  downloadPerformanceTrendsCsvFile 
} from "../../utils/performanceTrendsGenerator";
import { PerformanceTrendsD3Chart } from "./PerformanceTrendsD3Chart";
import { slugify } from "../../utils/url";
import { 
  TrendingDown, 
  TrendingUp, 
  Zap, 
  Gauge, 
  Server, 
  Activity, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  Layers, 
  RefreshCw, 
  Info, 
  HelpCircle,
  ExternalLink,
  Calendar,
  BarChart3,
  X
} from "lucide-react";

interface AdvancedSitePerformanceTrendsProps {
  config: SiteConfig;
  onNavigateTab?: (tab: CustomerPanelTab | string) => void;
  onPreview?: () => void;
}

export const AdvancedSitePerformanceTrends: React.FC<AdvancedSitePerformanceTrendsProps> = ({
  config,
  onNavigateTab,
  onPreview
}) => {
  // Configurable controls
  const [rollingDays, setRollingDays] = useState<RollingWindowDays>(90);
  const [selectedMetric, setSelectedMetric] = useState<CoreWebVitalMetricKey>("lcp");
  const [granularity, setGranularity] = useState<PerformanceTrendGranularity>("daily");
  const [isExporting, setIsExporting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshToast, setRefreshToast] = useState<string | null>(null);
  const [activeMilestoneModal, setActiveMilestoneModal] = useState<PerformanceMilestoneEvent | null>(null);

  // Compute dataset
  const { data, summary, correlationInsights, milestones } = useMemo(() => {
    return generate90DayPerformanceTrendsData(config, rollingDays);
  }, [config, rollingDays]);

  // Handle CSV Export
  const handleExportCsv = () => {
    setIsExporting(true);
    setTimeout(() => {
      const companySlug = config.companyName ? slugify(config.companyName) : "site";
      const dateStr = new Date().toISOString().slice(0, 10);
      const filename = `${companySlug}-90-gunluk-performans-trendleri-${dateStr}.csv`;
      const csvContent = generatePerformanceTrendsCsv(data, summary, config);
      
      downloadPerformanceTrendsCsvFile(csvContent, filename);
      setIsExporting(false);
      setRefreshToast("90 günlük performans ve çıkma oranı verileri CSV olarak indirildi.");
      setTimeout(() => setRefreshToast(null), 3500);
    }, 400);
  };

  // Simulate Telemetry Refresh
  const handleRefreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setRefreshToast("En son 24 saatlik CrUX ve Cloudflare Edge telemetrisi başarıyla senkronize edildi.");
      setTimeout(() => setRefreshToast(null), 3500);
    }, 600);
  };

  const metricTabs: Array<{
    key: CoreWebVitalMetricKey;
    label: string;
    sublabel: string;
    badge: string;
  }> = [
    { key: "lcp", label: "LCP vs Çıkma Oranı", sublabel: "En Büyük İçerikli Boyama", badge: "Birincil Sürücü" },
    { key: "ttfb", label: "TTFB vs Çıkma Oranı", sublabel: "İlk Bayt Yanıt Süresi", badge: "Sunucu Tepkisi" },
    { key: "inp", label: "INP vs Çıkma Oranı", sublabel: "Etkileşim Tepki Süresi", badge: "Arayüz Akıcılığı" },
    { key: "cls", label: "CLS vs Çıkma Oranı", sublabel: "Kümülatif Düzen Kayması", badge: "Görsel Kararlılık" },
    { key: "healthScore", label: "Genel Altyapı Sağlığı", sublabel: "0-100 Ağırlıklı İndeks", badge: "Makro Sağlık" }
  ];

  return (
    <div id="advanced-site-performance-trends-view" className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Toast feedback */}
      {refreshToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white text-xs font-semibold rounded-2xl shadow-xl border border-slate-700 animate-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{refreshToast}</span>
        </div>
      )}

      {/* 1. Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-800 relative overflow-hidden">
        {/* Background decorative circles */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-16 w-60 h-60 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
                <Activity className="w-3.5 h-3.5" />
                D3.js Veri Görselleştirme
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-semibold">
                {rollingDays} Günlük Yuvarlanan Pencere
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold">
                Google CrUX + Edge Telemetrisi
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Gelişmiş Site Performans Trendleri
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              Sayfa açılış hızları (Core Web Vitals) ile ziyaretçi hemen çıkma oranları (bounce rates) arasındaki 90 günlük doğrudan korelasyonu ve uzun vadeli altyapı dayanıklılığını inceleyin.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleRefreshData}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-emerald-400" : ""}`} />
              <span>{isRefreshing ? "Güncelleniyor..." : "Telemetriyi Yenile"}</span>
            </button>

            <button
              type="button"
              id="export-performance-trends-csv-btn"
              onClick={handleExportCsv}
              disabled={isExporting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? "Hazırlanıyor..." : "CSV Raporu İndir"}</span>
            </button>
          </div>
        </div>

        {/* Rolling Window & Granularity Selector Controls inside Header */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Zaman Aralığı:</span>
            <div className="inline-flex bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
              {([30, 60, 90] as RollingWindowDays[]).map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setRollingDays(days)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    rollingDays === days
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  {days} Gün
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Çizgi Eğrisi:</span>
            <div className="inline-flex bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
              <button
                type="button"
                onClick={() => setGranularity("daily")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  granularity === "daily"
                    ? "bg-slate-700 text-white shadow-xs"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Günlük Ham Veri
              </button>
              <button
                type="button"
                onClick={() => setGranularity("7d_ma")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  granularity === "7d_ma"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                7 Günlük Hareketli Ort. (Yumuşatılmış)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top 90-Day Delta KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: LCP */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">LCP (Açılış Hızı)</span>
                <span className="text-[10px] text-slate-400">Google Hedefi: ≤ 2.5s</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              Harika
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-black text-slate-900">
              {summary.lcpCurrent}s
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>%{Math.abs(summary.lcpDeltaPercent)} İyileşme</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {rollingDays} gün önce: <span className="font-semibold text-slate-700">{summary.lcpInitial}s</span>
          </div>
        </div>

        {/* KPI 2: Visitor Bounce Rate */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs hover:border-rose-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <TrendingDown className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">Çıkma Oranı (Bounce)</span>
                <span className="text-[10px] text-slate-400">Terk Eden Ziyaretçi</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-bold">
              Çok Düşük
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-black text-slate-900">
              %{summary.bounceRateCurrent}
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>%{Math.abs(summary.bounceRateDeltaPercent)} Düşüş</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {rollingDays} gün önce: <span className="font-semibold text-slate-700">%{summary.bounceRateInitial}</span>
          </div>
        </div>

        {/* KPI 3: TTFB */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">TTFB (Sunucu Tepkisi)</span>
                <span className="text-[10px] text-slate-400">Edge Yanıt Süresi</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
              0.02s
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-black text-slate-900">
              {summary.ttfbCurrent} ms
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>%{Math.abs(summary.ttfbDeltaPercent)} Hızlanma</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {rollingDays} gün önce: <span className="font-semibold text-slate-700">{summary.ttfbInitial} ms</span>
          </div>
        </div>

        {/* KPI 4: Infrastructure Health Score */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">Altyapı Sağlık Skoru</span>
                <span className="text-[10px] text-slate-400">Google CWV Geçerlilik</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-bold">
              %100 Passed
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-black text-slate-900">
              {summary.overallHealthScoreCurrent} <span className="text-sm font-semibold text-slate-400">/100</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{summary.healthDeltaPercent}% Artış</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {rollingDays} gün önce: <span className="font-semibold text-slate-700">{summary.overallHealthScoreInitial}/100</span>
          </div>
        </div>
      </div>

      {/* 3. Main Chart Controls & D3 Visualization */}
      <div className="space-y-3">
        {/* Metric Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80">
          {metricTabs.map((tab) => {
            const isActive = selectedMetric === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedMetric(tab.key)}
                className={`flex-1 min-w-[170px] text-left px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="text-xs font-bold">{tab.label}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                  }`}>
                    {tab.badge}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-medium truncate">
                  {tab.sublabel}
                </div>
              </button>
            );
          })}
        </div>

        {/* D3.js Chart Canvas */}
        <PerformanceTrendsD3Chart
          data={data}
          selectedMetric={selectedMetric}
          granularity={granularity}
          height={430}
          onSelectMilestone={(ms) => setActiveMilestoneModal(ms)}
        />
      </div>

      {/* 4. Correlation & Elasticity Analysis Engine */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200/60 flex items-center justify-center text-indigo-600">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Core Web Vitals &amp; Ziyaretçi Çıkma Oranı Korelasyon Analizi
              </h3>
              <p className="text-xs text-slate-500">
                İstatistiksel Pearson korelasyon katsayısı (r) ve elastikiyet modellemesi
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
            Kuvvetli Pozitif Korelasyon (r = +0.88)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {correlationInsights.map((insight) => (
            <div 
              key={insight.metricKey} 
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-all space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-800">{insight.metricLabel}</span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    Math.abs(insight.pearsonR) >= 0.7 
                      ? "bg-emerald-100 text-emerald-800" 
                      : "bg-blue-100 text-blue-800"
                  }`}>
                    r = {insight.pearsonR > 0 ? `+${insight.pearsonR}` : insight.pearsonR}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {insight.elasticityStatement}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Güncel: <strong className="text-slate-700">{insight.currentValue} {insight.unit}</strong></span>
                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Google Hedefi Geçti
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. 90-Day Infrastructure Milestones Timeline */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                90 Günlük Altyapı İyileştirme Kilometre Taşları
              </h3>
              <p className="text-xs text-slate-500">
                Performans sıçramalarını ve ziyaretçi tutundurma artışını tetikleyen teknik mühendislik adımları
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
            {milestones.length} Kritik Kilometre Taşı
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {milestones.map((ms, index) => (
            <div 
              key={ms.id} 
              onClick={() => setActiveMilestoneModal(ms)}
              className="py-3.5 px-3 -mx-3 rounded-xl hover:bg-slate-50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center text-xs font-black shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                  #{index + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {ms.title}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      {ms.date} ({Math.abs(ms.dayOffset)} gün önce)
                    </span>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {ms.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {ms.description}
                  </p>
                </div>
              </div>

              <div className="sm:text-right shrink-0">
                <div className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                  <span>Ölçülen Etki:</span>
                  <strong>{ms.impactMetric} ({ms.impactDelta})</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Deep Linking Navigation Footer */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
            <Gauge className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">
              Canlı Performans Denetimi ve Sayfa SEO Ayarları
            </div>
            <div className="text-xs text-slate-500">
              0.02s anlık test sonuçlarını inceleyin veya sayfa bazlı canonical ve meta etiketlerini optimize edin.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {onNavigateTab && (
            <>
              <button
                type="button"
                onClick={() => onNavigateTab("site-health")}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <span>Site Sağlığı &amp; Lighthouse</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab("page-seo")}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <span>Sayfa SEO Yöneticisi</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Milestone Modal */}
      {activeMilestoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 relative space-y-4 animate-in zoom-in-95">
            <button
              type="button"
              onClick={() => setActiveMilestoneModal(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                  Altyapı Kilometre Taşı Detayı
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  {activeMilestoneModal.title}
                </h3>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Uygulama Tarihi:</span>
                <strong className="text-slate-800">{activeMilestoneModal.date} ({Math.abs(activeMilestoneModal.dayOffset)} gün önce)</strong>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Mühendislik Kategorisi:</span>
                <span className="uppercase text-[10px] font-bold px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded">
                  {activeMilestoneModal.category}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Ölçülen Performans Sıçraması:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {activeMilestoneModal.impactMetric} ({activeMilestoneModal.impactDelta})
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {activeMilestoneModal.description}
            </p>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setActiveMilestoneModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
