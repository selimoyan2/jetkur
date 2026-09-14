import React, { useState, useMemo } from "react";
import { 
  SiteConfig, 
  ForecastingScenario, 
  ForecastingSimulationParams,
  FuturePerformanceForecasterReport 
} from "../../types";
import { 
  generatePerformanceForecastReport, 
  DEFAULT_FORECAST_PARAMS 
} from "../../utils/performanceForecasterEngine";
import { 
  PerformanceForecasterD3Chart, 
  ForecastChartMetric 
} from "./PerformanceForecasterD3Chart";
import { 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  Users, 
  PhoneCall, 
  DollarSign, 
  ShieldCheck, 
  Sliders, 
  Calendar, 
  Download, 
  RefreshCw, 
  ArrowUpRight, 
  AlertCircle, 
  CheckCircle2, 
  Lightbulb, 
  Target, 
  BarChart3, 
  Layers, 
  HelpCircle,
  Clock,
  ArrowRight,
  ExternalLink
} from "lucide-react";

interface PerformanceForecasterProps {
  config: SiteConfig;
  onChange?: (newConfig: SiteConfig) => void;
  onPreview?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const PerformanceForecaster: React.FC<PerformanceForecasterProps> = ({
  config,
  onChange,
  onPreview,
  onNavigateTab
}) => {
  // Simulator parameters state
  const [params, setParams] = useState<ForecastingSimulationParams>(DEFAULT_FORECAST_PARAMS);
  const [activeMetric, setActiveMetric] = useState<ForecastChartMetric>("combined");
  const [showDataTable, setShowDataTable] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  // Generate real-time reactive report
  const report: FuturePerformanceForecasterReport = useMemo(() => {
    return generatePerformanceForecastReport(config, params);
  }, [config, params]);

  // Scenario change handler
  const handleScenarioChange = (scenario: ForecastingScenario) => {
    setParams(prev => ({
      ...prev,
      scenario
    }));
  };

  // Reset simulator to defaults
  const handleResetParams = () => {
    setParams(DEFAULT_FORECAST_PARAMS);
  };

  // Export report as CSV
  const handleExportCsv = () => {
    try {
      const headers = "Tarih,Durum,Gün,Ziyaretci,Ziyaretci_Min,Ziyaretci_Max,Donusum,Donusum_Orani,Ciro_TL\n";
      const rows = report.timeSeriesData.map(d => 
        `"${d.date}","${d.isForecast ? 'Tahmin' : 'Gerçek'}","${d.dayOfWeek}",${d.visitors},${d.visitorsLowerBound},${d.visitorsUpperBound},${d.conversions},"%${d.conversionRate}",${d.estimatedRevenue}`
      ).join("\n");

      const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Gelecek_Performans_Tahmini_30Gun_${params.scenario}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (e) {
      console.error("Export error", e);
    }
  };

  return (
    <div id="performance-forecaster-tab" className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner & Title */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>D3.js Zaman Serisi & Holt-Winters Büyüme Tahmincisi</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Gelecek Performans Tahmincisi
            </h1>
            
            <p className="text-slate-300 text-sm leading-relaxed">
              Tarihsel 30 günlük trafik dalgalanmalarını ve mevcut dönüşüm oranlarını analiz ederek önümüzdeki 30 günün ziyaretçi, potansiyel müşteri teklifleri ve ticari katkısını üç farklı büyüme senaryosuyla modeller.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              id="btn-export-forecast-csv"
              onClick={handleExportCsv}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/60 text-xs font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">İndirildi!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-slate-300" />
                  <span>Tahmin CSV İndir</span>
                </>
              )}
            </button>

            {onNavigateTab && (
              <button
                type="button"
                id="btn-nav-to-realtime-traffic"
                onClick={() => onNavigateTab("realtime-traffic")}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-indigo-500/20 cursor-pointer"
              >
                <Clock className="w-4 h-4 text-indigo-200" />
                <span>Canlı Ziyaretçiler</span>
              </button>
            )}
          </div>
        </div>

        {/* Scenario Selection Tabs */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Senaryo Seçimi:</span>
            <div className="flex bg-slate-950/60 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                id="scenario-btn-pessimistic"
                onClick={() => handleScenarioChange("pessimistic")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  params.scenario === "pessimistic"
                    ? "bg-slate-800 text-amber-300 shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🛡️ Muhafazakar (Baz)
              </button>
              <button
                type="button"
                id="scenario-btn-realistic"
                onClick={() => handleScenarioChange("realistic")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  params.scenario === "realistic"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🚀 Beklenen Büyüme (Önerilen)
              </button>
              <button
                type="button"
                id="scenario-btn-optimistic"
                onClick={() => handleScenarioChange("optimistic")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  params.scenario === "optimistic"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                ⚡ İyimser & Agresif
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Model Doğruluk Oranı:</span>
            <span className="text-emerald-300 font-bold">%{report.forecastConfidenceScore} (80% Güven Bandı)</span>
          </div>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Projected Visitors */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">30 Günlük Tahmini Ziyaretçi</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
              {report.projectedTotalVisitors30d.toLocaleString("tr-TR")}
            </div>
            <div className={`text-xs font-bold flex items-center gap-0.5 ${
              report.netVisitorGrowthPercent >= 0 ? "text-emerald-600" : "text-rose-600"
            }`}>
              {report.netVisitorGrowthPercent >= 0 ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              <span>%{Math.abs(report.netVisitorGrowthPercent)}</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Önceki 30 Gün: <strong className="text-slate-700">{report.historicalTotalVisitors30d.toLocaleString("tr-TR")}</strong> tekil oturum
          </div>
        </div>

        {/* Card 2: Projected Conversions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Tahmini Dönüşüm & Teklif</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <PhoneCall className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
              {report.projectedTotalConversions30d.toLocaleString("tr-TR")} <span className="text-sm font-semibold text-slate-500">adet</span>
            </div>
            <div className="text-xs font-bold text-amber-600 flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>%{report.netConversionGrowthPercent}</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Öngörülen Dönüşüm Oranı: <strong className="text-amber-700">%{report.projectedAvgConversionRate}</strong>
          </div>
        </div>

        {/* Card 3: Projected Revenue / Business Value */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Tahmini Katkı Değeri</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
              ₺{report.projectedTotalRevenue30d.toLocaleString("tr-TR")}
            </div>
            <div className="text-xs font-bold text-cyan-600 flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+₺{(report.projectedTotalRevenue30d - report.historicalTotalRevenue30d).toLocaleString("tr-TR")}</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Ort. Teklif Bedeli: <strong className="text-slate-700">₺{params.averageDealValue.toLocaleString("tr-TR")}</strong>
          </div>
        </div>

        {/* Card 4: Forecast Model Accuracy */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Model Güven Seviyesi</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black text-indigo-600 tracking-tight font-mono">
              %{report.forecastConfidenceScore}
            </div>
            <div className="text-xs font-bold text-indigo-700 px-2 py-0.5 rounded-full bg-indigo-50">
              Yüksek Kararlılık
            </div>
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Zaman Serisi: <strong className="text-slate-700">60 Günlük (30+30)</strong> trend simülasyonu
          </div>
        </div>
      </div>

      {/* Main D3.js Forecasting Chart Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <span>30 Günlük Performans & Büyüme Tahmin Grafiği</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Geçmiş 30 gün gerçekleşen veri (düz çizgi) ve önümüzdeki 30 günün tahmini güven aralığı (kesikli & gölgeli alan).
            </p>
          </div>

          {/* Metric View Toggles */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              id="chart-metric-combined"
              onClick={() => setActiveMetric("combined")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeMetric === "combined"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              👥+🎯 Birleşik
            </button>
            <button
              type="button"
              id="chart-metric-visitors"
              onClick={() => setActiveMetric("visitors")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeMetric === "visitors"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              👥 Ziyaretçi
            </button>
            <button
              type="button"
              id="chart-metric-conversions"
              onClick={() => setActiveMetric("conversions")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeMetric === "conversions"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🎯 Dönüşüm
            </button>
            <button
              type="button"
              id="chart-metric-revenue"
              onClick={() => setActiveMetric("revenue")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeMetric === "revenue"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              💰 Katkı (₺)
            </button>
          </div>
        </div>

        {/* Legend Indicators */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-4 h-1 rounded-full bg-indigo-600" />
            <span className="font-semibold text-slate-700">Geçmiş Gerçekleşen (Son 30 Gün)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-1 border-t-2 border-dashed border-emerald-600" />
            <span className="font-semibold text-slate-700">Öngörülen Projeksiyon (Gelecek 30 Gün)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-emerald-500/20 border border-emerald-500/40" />
            <span className="font-semibold text-slate-700">%80 Güven Aralığı (Alt & Üst Sınır)</span>
          </div>
          {activeMetric === "combined" && (
            <div className="flex items-center gap-2">
              <span className="w-4 h-1 rounded-full bg-amber-500" />
              <span className="font-semibold text-amber-700">Dönüşüm Adedi (Sağ Eksen)</span>
            </div>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900" />
            <span className="font-bold text-slate-900">Bugün (Eşik Çizgisi)</span>
          </div>
        </div>

        {/* D3.js Rendered Chart Canvas */}
        <div className="w-full bg-slate-50/50 rounded-2xl p-2 sm:p-4 border border-slate-100">
          <PerformanceForecasterD3Chart
            data={report.timeSeriesData}
            scenario={params.scenario}
            metric={activeMetric}
            height={360}
          />
        </div>
      </div>

      {/* Interactive Growth Simulator Controls */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-600" />
              <span>İnteraktif Büyüme & Dönüşüm Simülatörü</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Parametreleri kaydırarak sitenize yapılacak yatırımların veya trafik artışlarının sonuçlarını anında test edin.
            </p>
          </div>

          <button
            type="button"
            id="btn-reset-simulator"
            onClick={handleResetParams}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Varsayılanlara Sıfırla</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Slider 1: Traffic Growth */}
          <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                Trafik Büyüme Hızı
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-mono font-bold text-xs">
                {params.trafficGrowthRate >= 0 ? `+${params.trafficGrowthRate}%` : `${params.trafficGrowthRate}%`}
              </span>
            </div>
            
            <input
              type="range"
              id="slider-traffic-growth"
              min="-15"
              max="75"
              step="2.5"
              value={params.trafficGrowthRate}
              onChange={(e) => setParams(prev => ({ ...prev, trafficGrowthRate: parseFloat(e.target.value) }))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>-%15 (Yavaşlama)</span>
              <span>Baz (+%22.5)</span>
              <span>+%75 (Agresif Kampanya)</span>
            </div>
          </div>

          {/* Slider 2: Conversion Multiplier */}
          <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <PhoneCall className="w-4 h-4 text-amber-600" />
                Dönüşüm Oranı Çarpanı
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800 font-mono font-bold text-xs">
                {params.conversionMultiplier.toFixed(2)}x
              </span>
            </div>
            
            <input
              type="range"
              id="slider-conversion-multiplier"
              min="0.8"
              max="2.0"
              step="0.05"
              value={params.conversionMultiplier}
              onChange={(e) => setParams(prev => ({ ...prev, conversionMultiplier: parseFloat(e.target.value) }))}
              className="w-full accent-amber-600 cursor-pointer"
            />
            
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0.80x (Darboğaz)</span>
              <span>1.20x (Hız & SEO)</span>
              <span>2.00x (A/B Test Kazananı)</span>
            </div>
          </div>

          {/* Slider 3: Average Deal Value */}
          <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-cyan-600" />
                Ortalama Müşteri Değeri
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-cyan-100 text-cyan-800 font-mono font-bold text-xs">
                ₺{params.averageDealValue.toLocaleString("tr-TR")}
              </span>
            </div>
            
            <input
              type="range"
              id="slider-deal-value"
              min="500"
              max="8000"
              step="250"
              value={params.averageDealValue}
              onChange={(e) => setParams(prev => ({ ...prev, averageDealValue: parseInt(e.target.value, 10) }))}
              className="w-full accent-cyan-600 cursor-pointer"
            />
            
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>₺500</span>
              <span>₺1.850 (Ortalama)</span>
              <span>₺8.000</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Growth Insights & Channel Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: AI Growth Insights */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span>Gelecek Büyüme Fırsatları & Yapay Zeka İçgörüleri</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs">
              4 Kritik Öngörü
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {report.insights.map((insight) => (
              <div 
                key={insight.id}
                className={`rounded-2xl p-4.5 border space-y-2.5 transition-all ${
                  insight.type === "opportunity"
                    ? "bg-emerald-50/40 border-emerald-200/80 hover:border-emerald-300"
                    : insight.type === "warning"
                    ? "bg-amber-50/40 border-amber-200/80 hover:border-amber-300"
                    : "bg-indigo-50/40 border-indigo-200/80 hover:border-indigo-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {insight.type === "opportunity" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : insight.type === "warning" ? (
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                    ) : (
                      <Target className="w-4 h-4 text-indigo-600" />
                    )}
                    <span className="text-xs font-black text-slate-900 line-clamp-1">
                      {insight.title}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {insight.description}
                </p>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-700">Etki: {insight.potentialImpact}</span>
                  <span className="text-slate-500 font-medium line-clamp-1">
                    💡 {insight.actionRecommendation}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Channel-Based Growth Breakdown */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-xs">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              <span>Kanal Bazlı Büyüme Payı</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Önümüzdeki 30 gün içinde kanalların tahmini katkı dağılımı.
            </p>
          </div>

          <div className="space-y-4 pt-1">
            {report.channelBreakdown.map((ch) => (
              <div key={ch.channelKey} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{ch.channel}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-mono">
                      {ch.projectedMonthlyVisitors.toLocaleString("tr-TR")} ziyt.
                    </span>
                    <span className={`font-mono font-bold ${
                      ch.growthPercent >= 0 ? "text-emerald-600" : "text-slate-600"
                    }`}>
                      {ch.growthPercent >= 0 ? `+${ch.growthPercent}%` : `${ch.growthPercent}%`}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min(100, Math.max(10, (ch.projectedMonthlyVisitors / report.projectedTotalVisitors30d) * 100))}%`,
                      backgroundColor: ch.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100">
            <div className="p-3 rounded-xl bg-slate-50 text-[11px] text-slate-600 flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                Google Organik trafiğindeki %50'lik aslan payı, sitenin SEO meta ve JSON-LD schema yapılandırmalarıyla doğrudan korunmaktadır.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Toggleable Detailed Daily Projection Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 sm:p-6 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <span className="text-sm font-black text-slate-900">
              Günlük Projeksiyon ve Simülasyon Veri Tablosu (60 Gün)
            </span>
          </div>

          <button
            type="button"
            id="btn-toggle-data-table"
            onClick={() => setShowDataTable(!showDataTable)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            {showDataTable ? "Tabloyu Gizle ▲" : "Tabloyu Göster (Detaylı) ▼"}
          </button>
        </div>

        {showDataTable && (
          <div className="max-h-96 overflow-y-auto overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-500 sticky top-0 border-b border-slate-200 z-10 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Tarih</th>
                  <th className="py-2.5 px-4">Durum</th>
                  <th className="py-2.5 px-4">Gün</th>
                  <th className="py-2.5 px-4 text-right">Ziyaretçi</th>
                  <th className="py-2.5 px-4 text-right">Güven Bandı (Min-Max)</th>
                  <th className="py-2.5 px-4 text-right">Dönüşüm</th>
                  <th className="py-2.5 px-4 text-right">Dönüşüm %</th>
                  <th className="py-2.5 px-4 text-right">Tahmini Değer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {report.timeSeriesData.map((row) => (
                  <tr 
                    key={row.date} 
                    className={`hover:bg-slate-50/80 transition-colors ${
                      row.dayIndex === 0 ? "bg-indigo-50/60 font-bold" : ""
                    }`}
                  >
                    <td className="py-2 px-4 font-sans font-medium text-slate-900">
                      {row.formattedDate} {row.dayIndex === 0 && <span className="text-indigo-600 font-bold">(Bugün)</span>}
                    </td>
                    <td className="py-2 px-4 font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        row.isForecast
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-700"
                      }`}>
                        {row.isForecast ? "30g Tahmin" : "Gerçekleşen"}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-slate-500 font-sans">{row.dayOfWeek}</td>
                    <td className="py-2 px-4 text-right font-bold text-slate-900">
                      {row.visitors.toLocaleString("tr-TR")}
                    </td>
                    <td className="py-2 px-4 text-right text-slate-500">
                      {row.isForecast ? `${row.visitorsLowerBound} - ${row.visitorsUpperBound}` : "—"}
                    </td>
                    <td className="py-2 px-4 text-right font-bold text-amber-600">
                      {row.conversions} adet
                    </td>
                    <td className="py-2 px-4 text-right text-slate-700">
                      %{row.conversionRate}
                    </td>
                    <td className="py-2 px-4 text-right font-bold text-cyan-700">
                      ₺{row.estimatedRevenue.toLocaleString("tr-TR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
