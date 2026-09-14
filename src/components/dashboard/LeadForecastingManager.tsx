import React, { useState, useMemo } from "react";
import { SiteConfig, FormLead, ForecastSimulationConfig } from "../../types";
import {
  calculateNext30DaysForecast,
  downloadForecastCsv
} from "../../utils/leadForecastingEngine";
import { LeadForecastingD3Chart } from "./LeadForecastingD3Chart";
import {
  TrendingUp,
  DollarSign,
  Users,
  CheckCircle2,
  Sparkles,
  Calendar,
  Download,
  Sliders,
  RotateCcw,
  ArrowRight,
  HelpCircle,
  BarChart3,
  Percent,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Target,
  Zap,
  Activity,
  Award
} from "lucide-react";

interface LeadForecastingManagerProps {
  config: SiteConfig;
  onNavigateTab?: (tab: string) => void;
  onSelectLeadForDetail?: (lead: FormLead) => void;
}

export const LeadForecastingManager: React.FC<LeadForecastingManagerProps> = ({
  config,
  onNavigateTab,
  onSelectLeadForDetail
}) => {
  const leads = config.leads || [];
  const companyName = config.companyName || "İşletmeniz";
  const currencySymbol = "₺";

  // Chart Controls State
  const [chartMetric, setChartMetric] = useState<"revenue" | "leads" | "dual">("revenue");
  const [viewType, setViewType] = useState<"cumulative" | "daily">("cumulative");
  const [showConfidenceInterval, setShowConfidenceInterval] = useState<boolean>(true);

  // Simulation State (What-If Analysis)
  const [simulation, setSimulation] = useState<ForecastSimulationConfig>({
    conversionRateModifier: 0,
    trafficMultiplier: 1.0,
    dealValueMultiplier: 1.0,
    scenario: "realistic"
  });

  const [isSimulationPanelOpen, setIsSimulationPanelOpen] = useState(false);

  // Calculate dynamic 30-day forecast based on current config & simulation
  const forecast = useMemo(() => {
    return calculateNext30DaysForecast(leads, simulation);
  }, [leads, simulation]);

  // Baseline forecast (without user slider modifications) to compute What-If deltas
  const baselineForecast = useMemo(() => {
    return calculateNext30DaysForecast(leads, {
      conversionRateModifier: 0,
      trafficMultiplier: 1.0,
      dealValueMultiplier: 1.0,
      scenario: "realistic"
    });
  }, [leads]);

  const revenueDelta = forecast.totalExpectedRevenue - baselineForecast.totalExpectedRevenue;
  const leadsDelta = forecast.totalExpectedLeads - baselineForecast.totalExpectedLeads;
  const wonDelta = forecast.totalExpectedWonDeals - baselineForecast.totalExpectedWonDeals;

  // Handler for quick scenario presets
  const handleSelectScenario = (sc: "realistic" | "optimistic" | "conservative") => {
    if (sc === "realistic") {
      setSimulation({
        conversionRateModifier: 0,
        trafficMultiplier: 1.0,
        dealValueMultiplier: 1.0,
        scenario: "realistic"
      });
    } else if (sc === "optimistic") {
      setSimulation({
        conversionRateModifier: 5,
        trafficMultiplier: 1.25,
        dealValueMultiplier: 1.1,
        scenario: "optimistic"
      });
    } else if (sc === "conservative") {
      setSimulation({
        conversionRateModifier: -5,
        trafficMultiplier: 0.8,
        dealValueMultiplier: 0.9,
        scenario: "conservative"
      });
    }
  };

  const handleResetSimulation = () => {
    setSimulation({
      conversionRateModifier: 0,
      trafficMultiplier: 1.0,
      dealValueMultiplier: 1.0,
      scenario: "realistic"
    });
  };

  return (
    <div id="lead-forecasting-panel" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 sm:p-7 text-white shadow-md border border-slate-700/60 relative overflow-hidden">
        {/* Background Decorative Pattern */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mb-20" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                <span>D3.js Vektörel Tahminleme Motoru</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold font-mono">
                Önümüzdeki 30 Gün
              </span>
              <span className="px-2.5 py-1 rounded-full bg-slate-700/60 text-slate-300 text-xs font-mono">
                {leads.length} Geçmiş Lead Baz Alındı
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Gelecek Ay Tahminleme &amp; Satış Projeksiyonu
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Mevcut CRM müşteri taleplerinin (lead) tarihsel dönüşüm oranlarını, ortalama sipariş tutarını ve
              haftalık talep mevsimselliğini modelleyerek önümüzdeki 30 günün beklenen satış hacmini ve potansiyel
              müşteri sayısını D3.js ile raporlar.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              id="btn-export-forecast-csv"
              onClick={() => downloadForecastCsv(forecast, companyName)}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              title="Tahminleme verilerini CSV formatında Excel için dışa aktar"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>CSV Rapor İndir</span>
            </button>

            <button
              type="button"
              id="btn-toggle-whatif-panel"
              onClick={() => setIsSimulationPanelOpen(!isSimulationPanelOpen)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs border ${
                isSimulationPanelOpen || simulation.scenario !== "realistic"
                  ? "bg-cyan-500 text-slate-950 border-cyan-400 font-extrabold"
                  : "bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border-cyan-500/40"
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>What-If Simülatörü {simulation.scenario !== "realistic" && "• Aktif"}</span>
            </button>

            {onNavigateTab && (
              <button
                type="button"
                id="btn-nav-leads-from-forecast"
                onClick={() => onNavigateTab("leads")}
                className="px-4 py-2.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Müşteri Talepleri →</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Scenario Selector Bar */}
        <div className="relative z-10 mt-6 pt-4 border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Hızlı Senaryo Seçimi:</span>
            <div className="inline-flex rounded-xl bg-slate-900/80 p-1 border border-slate-700">
              <button
                type="button"
                onClick={() => handleSelectScenario("realistic")}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  simulation.scenario === "realistic"
                    ? "bg-cyan-500 text-slate-950 shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Gerçekçi (Baz Model)
              </button>
              <button
                type="button"
                onClick={() => handleSelectScenario("optimistic")}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  simulation.scenario === "optimistic"
                    ? "bg-emerald-500 text-slate-950 shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                İyimser Büyüme (+%25)
              </button>
              <button
                type="button"
                onClick={() => handleSelectScenario("conservative")}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  simulation.scenario === "conservative"
                    ? "bg-amber-500 text-slate-950 shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Korumacı Beklenti (-%20)
              </button>
            </div>
          </div>

          {simulation.scenario !== "realistic" && (
            <button
              type="button"
              onClick={handleResetSimulation}
              className="text-cyan-300 hover:text-cyan-200 flex items-center gap-1 font-semibold underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Sıfırla (Baz Modele Dön)</span>
            </button>
          )}
        </div>
      </div>

      {/* Expandable What-If Interactive Simulator */}
      {isSimulationPanelOpen && (
        <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-cyan-500/40 shadow-lg space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-100">
                What-If Simülasyonu: Parametreleri Değiştirerek Gelecek Ayı Test Edin
              </h3>
            </div>
            <div className="text-xs font-mono text-cyan-300">
              {revenueDelta !== 0 && (
                <span className="px-2.5 py-1 rounded-full bg-cyan-950 border border-cyan-500/40 font-bold">
                  {revenueDelta > 0 ? "+" : ""}
                  {currencySymbol}
                  {revenueDelta.toLocaleString("tr-TR")} Fark Beklentisi
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Slider 1: Conversion Rate Modifier */}
            <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Dönüşüm Oranı Farkı</span>
                <span className="font-bold font-mono text-cyan-400">
                  {simulation.conversionRateModifier > 0 ? "+" : ""}
                  {simulation.conversionRateModifier}% (Efektif: %
                  {forecast.effectiveConversionRate})
                </span>
              </div>
              <input
                type="range"
                min="-15"
                max="25"
                step="1"
                value={simulation.conversionRateModifier}
                onChange={(e) =>
                  setSimulation((prev) => ({
                    ...prev,
                    conversionRateModifier: Number(e.target.value),
                    scenario: "custom"
                  }))
                }
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>-%15</span>
                <span>Baz ({forecast.historicalMetrics.actualConversionRate}%)</span>
                <span>+%25</span>
              </div>
            </div>

            {/* Slider 2: Traffic / Lead Flow Multiplier */}
            <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Lead Trafik Hacmi</span>
                <span className="font-bold font-mono text-indigo-400">
                  {simulation.trafficMultiplier.toFixed(2)}x ({Math.round((simulation.trafficMultiplier - 1) * 100)}%)
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.05"
                value={simulation.trafficMultiplier}
                onChange={(e) =>
                  setSimulation((prev) => ({
                    ...prev,
                    trafficMultiplier: Number(e.target.value),
                    scenario: "custom"
                  }))
                }
                className="w-full accent-indigo-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0.5x (-%50)</span>
                <span>1.0x (Normal)</span>
                <span>2.0x (+%100)</span>
              </div>
            </div>

            {/* Slider 3: Deal Value Multiplier */}
            <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Ortalama Sipariş Tutarı</span>
                <span className="font-bold font-mono text-emerald-400">
                  {currencySymbol}
                  {forecast.effectiveAvgDealValue.toLocaleString("tr-TR")}
                </span>
              </div>
              <input
                type="range"
                min="0.6"
                max="1.8"
                step="0.05"
                value={simulation.dealValueMultiplier}
                onChange={(e) =>
                  setSimulation((prev) => ({
                    ...prev,
                    dealValueMultiplier: Number(e.target.value),
                    scenario: "custom"
                  }))
                }
                className="w-full accent-emerald-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0.6x</span>
                <span>1.0x (Normal)</span>
                <span>1.8x</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4 Core Metric Cards (KPI Summary) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Expected Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              30 Günlük Beklenen Satış
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-2.5">
            <div className="text-2xl font-black text-slate-900 font-mono">
              {currencySymbol}
              {forecast.totalExpectedRevenue.toLocaleString("tr-TR")}
            </div>
            <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
              <span className="text-emerald-700 font-semibold">Güven Bandı:</span>
              <span className="font-mono">
                {currencySymbol}
                {Math.round(forecast.confidenceRange.minRevenue / 1000)}B - {currencySymbol}
                {Math.round(forecast.confidenceRange.maxRevenue / 1000)}B
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>Dönüşüm Kalibrasyonu:</span>
            <span className="font-bold text-emerald-600 font-mono">%95 Güvenilirlik</span>
          </div>
        </div>

        {/* Card 2: Expected Leads */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Beklenen Yeni Lead
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-2.5">
            <div className="text-2xl font-black text-slate-900 font-mono">
              ~{forecast.totalExpectedLeads} <span className="text-sm font-semibold font-sans text-slate-500">Talep</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
              <span>Günlük Ortalama:</span>
              <span className="font-bold text-indigo-600 font-mono">
                ~{(forecast.totalExpectedLeads / 30).toFixed(1)} Talep / Gün
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>Aralık:</span>
            <span className="font-mono text-slate-600">
              {forecast.confidenceRange.minLeads} - {forecast.confidenceRange.maxLeads} Potansiyel
            </span>
          </div>
        </div>

        {/* Card 3: Expected Deals Won */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Öngörülen Kapanacak Satış
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-2.5">
            <div className="text-2xl font-black text-slate-900 font-mono">
              ~{forecast.totalExpectedWonDeals} <span className="text-sm font-semibold font-sans text-slate-500">Müşteri</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
              <span>Efektif Dönüşüm:</span>
              <span className="font-bold text-amber-600 font-mono">
                %{forecast.effectiveConversionRate}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>Kazanım Aralığı:</span>
            <span className="font-mono text-slate-600">
              {forecast.confidenceRange.minWonDeals} - {forecast.confidenceRange.maxWonDeals} Sipariş
            </span>
          </div>
        </div>

        {/* Card 4: Historical Baseline & Deal Value */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Ortalama Anlaşma Değeri
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-2.5">
            <div className="text-2xl font-black text-slate-900 font-mono">
              {currencySymbol}
              {forecast.effectiveAvgDealValue.toLocaleString("tr-TR")}
            </div>
            <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
              <span>Tarihsel Dönüşüm Oranı:</span>
              <span className="font-bold text-cyan-700 font-mono">
                %{forecast.historicalMetrics.actualConversionRate}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>Kapalı İşlem:</span>
            <span className="font-mono text-slate-600">
              {forecast.historicalMetrics.closedLeads} / {forecast.historicalMetrics.totalLeads} Lead
            </span>
          </div>
        </div>
      </div>

      {/* D3.js Chart Card & Controls */}
      <div className="space-y-4">
        {/* Chart View Controls Toolbar */}
        <div className="bg-slate-100/80 rounded-2xl p-3 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
          {/* Metric Selector Buttons */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200/80 shadow-2xs">
            <button
              type="button"
              id="chart-metric-revenue-btn"
              onClick={() => setChartMetric("revenue")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                chartMetric === "revenue"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Satış Hacmi ({currencySymbol})</span>
            </button>

            <button
              type="button"
              id="chart-metric-leads-btn"
              onClick={() => setChartMetric("leads")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                chartMetric === "leads"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Potansiyel Müşteri (Lead)</span>
            </button>

            <button
              type="button"
              id="chart-metric-dual-btn"
              onClick={() => setChartMetric("dual")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                chartMetric === "dual"
                  ? "bg-slate-900 text-cyan-300 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Kombine (Çift Eksen)</span>
            </button>
          </div>

          {/* View Type: Cumulative vs Daily */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200/80 shadow-2xs text-xs">
              <button
                type="button"
                onClick={() => setViewType("cumulative")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  viewType === "cumulative"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Kümülatif Toplam
              </button>
              <button
                type="button"
                onClick={() => setViewType("daily")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  viewType === "daily"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Günlük Dağılım
              </button>
            </div>

            {/* Confidence Toggle */}
            {chartMetric !== "dual" && (
              <label className="flex items-center gap-1.5 text-xs text-slate-700 bg-white px-3 py-2 rounded-xl border border-slate-200/80 shadow-2xs cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showConfidenceInterval}
                  onChange={(e) => setShowConfidenceInterval(e.target.checked)}
                  className="rounded text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                />
                <span className="font-semibold text-slate-700">Güven Bandı (%95)</span>
              </label>
            )}
          </div>
        </div>

        {/* D3.js Chart Renderer */}
        <LeadForecastingD3Chart
          dailyPoints={forecast.dailyPoints}
          chartMetric={chartMetric}
          viewType={viewType}
          showConfidenceInterval={showConfidenceInterval}
          companyName={companyName}
          currencySymbol={currencySymbol}
        />
      </div>

      {/* 4-Week Milestone Breakdown & Channel Contribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 4-Week Progress Milestones */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Önümüzdeki 30 Günün Haftalık Hedef Dağılımı (4 Hafta Kırılımı)
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Toplam: {currencySymbol}
              {forecast.totalExpectedRevenue.toLocaleString("tr-TR")}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {forecast.weeklyMilestones.map((wm) => (
              <div
                key={wm.weekNumber}
                className="bg-slate-50/80 hover:bg-slate-50 rounded-xl p-4 border border-slate-200/80 transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">{wm.weekLabel}</span>
                    <span className="text-[11px] font-mono text-slate-500">{wm.dateRangeLabel}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold font-mono">
                    %{wm.shareOfTotalRevenue} Pay
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs font-mono pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 font-sans block">Beklenen Ciro</span>
                    <span className="font-bold text-emerald-700 text-sm">
                      {currencySymbol}
                      {wm.expectedRevenue.toLocaleString("tr-TR")}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-sans block">Yeni Lead</span>
                    <span className="font-bold text-indigo-700">{wm.expectedLeads} Talep</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-sans block">Kazanılacak</span>
                    <span className="font-bold text-amber-700">~{wm.expectedWonDeals} Satış</span>
                  </div>
                </div>

                {/* Progress bar of revenue */}
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full"
                    style={{ width: `${Math.min(100, wm.shareOfTotalRevenue * 3.5)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-cyan-50/60 border border-cyan-200/60 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-cyan-900">
            <Zap className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Haftalık Strateji İpucu:</strong> Hafta ortasında (Salı - Perşembe) gelen lead hacmi hafta
              sonuna göre %35 daha yoğundur. 2. ve 3. haftalardaki yoğunluğu karşılamak adına teklif şablonlarını ve
              otomatik SMS/WhatsApp yanıtlarını hazır tutun.
            </p>
          </div>
        </div>

        {/* Right 1 Col: Channel Forecast Contributions */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Kanal Bazlı Tahmini Katkı</h3>
            </div>
          </div>

          <div className="space-y-3">
            {forecast.channelContributions.map((ch) => (
              <div
                key={ch.channel}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: ch.color }}
                    />
                    <span>{ch.channelLabel}</span>
                  </div>
                  <span className="font-mono text-slate-500 font-bold">%{ch.sharePercentage}</span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-500 font-sans">Beklenen Hacim:</span>
                  <span className="font-bold text-slate-900">
                    {currencySymbol}
                    {ch.expectedRevenue.toLocaleString("tr-TR")}{" "}
                    <span className="text-slate-400 font-normal">({ch.expectedLeads} Lead)</span>
                  </span>
                </div>

                {/* Micro Bar */}
                <div className="w-full bg-slate-200 rounded-full h-1 overflow-hidden">
                  <div
                    className="h-1 rounded-full"
                    style={{
                      width: `${ch.sharePercentage}%`,
                      backgroundColor: ch.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* AI Strategic Recommendations Card */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Büyüme &amp; Optimizasyon Tavsiyesi</span>
            </span>
            <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
              {forecast.growthRecommendations.slice(0, 2).map((rec, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-cyan-500 font-bold">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
