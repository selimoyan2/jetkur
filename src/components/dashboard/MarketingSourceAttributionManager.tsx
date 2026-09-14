import React, { useState, useMemo } from "react";
import {
  SiteConfig,
  FormLead,
  MarketingSourceKey,
  ChannelAttributionData,
  MarketingAttributionConfig
} from "../../types";
import {
  computeMarketingAttribution,
  simulateBudgetReallocation,
  exportAttributionCsv,
  DEFAULT_MARKETING_ATTRIBUTION_CONFIG
} from "../../utils/marketingAttributionData";
import {
  MarketingAttributionD3Chart,
  ChartViewMode,
  BubbleSizeMode
} from "./MarketingAttributionD3Chart";
import {
  TrendingUp,
  Sparkles,
  DollarSign,
  Users,
  Target,
  Percent,
  Download,
  Filter,
  SlidersHorizontal,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Layers,
  ChevronRight,
  BarChart3,
  PieChart as PieIcon,
  Zap,
  ArrowRight,
  Save,
  RotateCcw,
  Sliders,
  Check,
  Award,
  Globe,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  MousePointerClick
} from "lucide-react";

interface MarketingSourceAttributionManagerProps {
  config: SiteConfig;
  onUpdateConfig?: (updatedConfig: SiteConfig) => void;
  onNavigateTab?: (tab: string) => void;
}

export const MarketingSourceAttributionManager: React.FC<MarketingSourceAttributionManagerProps> = ({
  config,
  onUpdateConfig,
  onNavigateTab
}) => {
  // Attribution Configuration from site config or fallback
  const attributionConfig: MarketingAttributionConfig = useMemo(() => {
    return config.marketingAttribution || DEFAULT_MARKETING_ATTRIBUTION_CONFIG;
  }, [config.marketingAttribution]);

  // View States
  const [viewMode, setViewMode] = useState<ChartViewMode>("quadrant");
  const [bubbleSizeMode, setBubbleSizeMode] = useState<BubbleSizeMode>("spend");
  const [selectedSourceId, setSelectedSourceId] = useState<MarketingSourceKey | "all">("all");
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">("30d");
  const [attributionModel, setAttributionModel] = useState<"last_touch" | "first_touch" | "linear">("last_touch");

  // Simulator States
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [budgetShifts, setBudgetShifts] = useState<Record<MarketingSourceKey, number>>({
    ads: 0,
    organic: 0,
    social: 0,
    direct: 0,
    referral: 0
  });
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Inline Spend Edit Modal State
  const [editingSpendKey, setEditingSpendKey] = useState<MarketingSourceKey | null>(null);
  const [editSpendValue, setEditSpendValue] = useState<string>("");

  // Compute live attribution data
  const { channels, summary } = useMemo(() => {
    return computeMarketingAttribution(config.leads || [], attributionConfig);
  }, [config.leads, attributionConfig]);

  // Compute simulated projections if budget simulator has non-zero shifts
  const simulationResult = useMemo(() => {
    const hasActiveShifts = Object.values(budgetShifts).some((v) => v !== 0);
    if (!hasActiveShifts) return null;
    return simulateBudgetReallocation(channels, budgetShifts);
  }, [channels, budgetShifts]);

  // Channels displayed in D3 chart (either live or simulated)
  const displayChannels = useMemo(() => {
    if (simulationResult) {
      return simulationResult.projectedChannels;
    }
    return channels;
  }, [simulationResult, channels]);

  // Handle Export CSV
  const handleExportCsv = () => {
    exportAttributionCsv(channels, summary, config.companyName || "HızlıWeb İşletmesi");
  };

  // Handle Simulator Preset
  const handleApplyPreset = (preset: "smart_ai" | "aggressive_ads" | "cost_saver") => {
    if (preset === "smart_ai") {
      // Shift ₺2,000 from Social to Ads (+₺1,500) and Organic (+₺500)
      setBudgetShifts({
        ads: 2500,
        organic: 600,
        social: -1800,
        direct: 0,
        referral: 0
      });
    } else if (preset === "aggressive_ads") {
      setBudgetShifts({
        ads: 5000,
        organic: 0,
        social: 0,
        direct: 0,
        referral: 0
      });
    } else if (preset === "cost_saver") {
      setBudgetShifts({
        ads: -2000,
        organic: 0,
        social: -2000,
        direct: 0,
        referral: 0
      });
    }
  };

  // Reset simulator
  const handleResetSimulator = () => {
    setBudgetShifts({
      ads: 0,
      organic: 0,
      social: 0,
      direct: 0,
      referral: 0
    });
  };

  // Save customized spend to SiteConfig
  const handleSaveSimulatedSpend = () => {
    if (!onUpdateConfig) return;

    const newSpend: Record<MarketingSourceKey, number> = {
      ...attributionConfig.customSpend
    };

    (Object.keys(budgetShifts) as MarketingSourceKey[]).forEach((k) => {
      newSpend[k] = Math.max(0, (newSpend[k] || 0) + (budgetShifts[k] || 0));
    });

    const updatedConfig: SiteConfig = {
      ...config,
      marketingAttribution: {
        ...attributionConfig,
        customSpend: newSpend
      }
    };

    onUpdateConfig(updatedConfig);
    setBudgetShifts({ ads: 0, organic: 0, social: 0, direct: 0, referral: 0 });
    setSaveSuccessMsg("Yeni pazarlama harcama dağılımı başarıyla kaydedildi!");
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  // Save inline spend edit
  const handleSaveInlineSpend = (key: MarketingSourceKey) => {
    if (!onUpdateConfig) return;
    const num = parseFloat(editSpendValue);
    if (isNaN(num) || num < 0) {
      setEditingSpendKey(null);
      return;
    }

    const newSpend: Record<MarketingSourceKey, number> = {
      ...attributionConfig.customSpend,
      [key]: num
    };

    const updatedConfig: SiteConfig = {
      ...config,
      marketingAttribution: {
        ...attributionConfig,
        customSpend: newSpend
      }
    };

    onUpdateConfig(updatedConfig);
    setEditingSpendKey(null);
    setSaveSuccessMsg(`${key.toUpperCase()} bütçesi ₺${num.toLocaleString("tr-TR")} olarak güncellendi!`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. HEADER & CONTROL TOOLBAR */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-mono font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-600" />
                D3.js Attribution
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-mono font-bold">
                ROI &amp; Dönüşüm Oranı
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-purple-50 border border-purple-200 text-purple-700 text-[11px] font-mono font-bold">
                Harcama Optimizasyonu
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Pazarlama Kaynak Dağılımı (Attribution)
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5 max-w-3xl">
              Sosyal medya, organik SEO ve ücretli reklam harcamalarınızın getirisini (ROI) ve dönüşüm
              oranını (CR) D3.js ile karşılaştırın; bütçenizi en karlı kanallara yönlendirin.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Attribution Model */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <span className="text-slate-400 pl-2 text-[11px]">Model:</span>
              <select
                value={attributionModel}
                onChange={(e) => setAttributionModel(e.target.value as any)}
                className="bg-transparent text-slate-800 text-xs font-bold outline-none cursor-pointer py-1 pr-1"
              >
                <option value="last_touch">Son Temas (Last Touch)</option>
                <option value="first_touch">İlk Temas (First Touch)</option>
                <option value="linear">Doğrusal (Linear)</option>
              </select>
            </div>

            {/* Time Range Selector */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              {(["7d", "30d", "90d", "all"] as const).map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setTimeRange(range)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    timeRange === range
                      ? "bg-white text-slate-900 shadow-xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {range === "7d" ? "Son 7G" : range === "30d" ? "Son 30G" : range === "90d" ? "Son 90G" : "Tümü"}
                </button>
              ))}
            </div>

            {/* Simulator Toggle Button */}
            <button
              type="button"
              onClick={() => setIsSimulatorOpen(!isSimulatorOpen)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isSimulatorOpen
                  ? "bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300"
                  : "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200"
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-600" />
              <span>Bütçe Simülatörü</span>
              {simulationResult && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>

            {/* Export CSV */}
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white transition-all cursor-pointer shadow-xs"
              title="Pazarlama Attribution ve ROI Raporunu CSV Olarak İndirin"
            >
              <Download className="w-3.5 h-3.5 text-slate-200" />
              <span>Rapor İndir (CSV)</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {saveSuccessMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 transition-all">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* 2. EXECUTIVE KPI CARDS (BENTO GRID) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total Spend */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Toplam Harcama
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            ₺{summary.totalSpend.toLocaleString("tr-TR")}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span>Aylık aktif reklam &amp; SEO bütçesi</span>
          </div>
        </div>

        {/* Attributed Revenue */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Atfedilen Ciro
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">
            ₺{summary.totalRevenue.toLocaleString("tr-TR")}
          </div>
          <div className="text-[11px] font-bold text-emerald-700 mt-1 flex items-center gap-1">
            <span>{summary.blendedRoas}x ROAS Getirisi</span>
          </div>
        </div>

        {/* Blended Conversion Rate */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Dönüşüm Oranı (CR)
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-600">
            %{summary.blendedConversionRate}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span>{summary.totalVisitors.toLocaleString("tr-TR")} ziyaretten {summary.totalLeads} lead</span>
          </div>
        </div>

        {/* Blended ROI */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Genel Yatırım Getirisi
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-600">
            +%{summary.blendedRoi} ROI
          </div>
          <div className="text-[11px] font-bold text-slate-600 mt-1 flex items-center gap-1">
            <span>Net Kâr: ₺{summary.totalProfit.toLocaleString("tr-TR")}</span>
          </div>
        </div>

        {/* Cost Per Lead (CPL) */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Lead Başı Maliyet
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600">
            ₺{summary.blendedCpl} CPL
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span>Ort. Tıklama: ₺{summary.blendedCpc} CPC</span>
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE SPEND OPTIMIZER SIMULATOR (WHAT-IF TOOL) */}
      {isSimulatorOpen && (
        <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 rounded-2xl p-5 sm:p-6 text-white border border-indigo-800/80 shadow-lg space-y-5 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-800/60 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-500/30 text-indigo-300">
                  <SlidersHorizontal className="w-4 h-4" />
                </span>
                <h3 className="text-base font-black text-white">
                  Pazarlama Harcama Optimizatörü &amp; &quot;Ne Olurdu?&quot; Simülatörü
                </h3>
              </div>
              <p className="text-xs text-indigo-200 mt-1">
                Farklı kanallar arasındaki bütçe kaydırmalarını test edin. D3 grafiği ve beklenen lead
                getirisi anında hesaplanır.
              </p>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-indigo-300 font-bold uppercase tracking-wider">
                Hazır Senaryo:
              </span>
              <button
                type="button"
                onClick={() => handleApplyPreset("smart_ai")}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-500 hover:bg-indigo-400 text-white transition-all cursor-pointer flex items-center gap-1 shadow-xs"
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>AI Akıllı Optimizasyon</span>
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset("aggressive_ads")}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-900/80 hover:bg-indigo-800 text-indigo-200 border border-indigo-700 transition-all cursor-pointer"
              >
                <span>Agresif Ads (+%40)</span>
              </button>
              <button
                type="button"
                onClick={handleResetSimulator}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3 text-slate-400" />
                <span>Sıfırla</span>
              </button>
            </div>
          </div>

          {/* Sliders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Paid Ads Slider */}
            <div className="p-3.5 bg-slate-900/80 rounded-xl border border-indigo-900/60">
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                <span className="text-blue-400">Google &amp; Meta Ads</span>
                <span className="font-mono text-white">
                  {budgetShifts.ads >= 0 ? `+₺${budgetShifts.ads}` : `-₺${Math.abs(budgetShifts.ads)}`}
                </span>
              </div>
              <input
                type="range"
                min="-6000"
                max="10000"
                step="500"
                value={budgetShifts.ads}
                onChange={(e) =>
                  setBudgetShifts((prev) => ({ ...prev, ads: parseInt(e.target.value) }))
                }
                className="w-full accent-blue-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>-₺6,000</span>
                <span>Mevcut: ₺{attributionConfig.customSpend.ads}</span>
                <span>+₺10,000</span>
              </div>
            </div>

            {/* Social Media Slider */}
            <div className="p-3.5 bg-slate-900/80 rounded-xl border border-indigo-900/60">
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                <span className="text-purple-400">Sosyal Medya (IG/FB)</span>
                <span className="font-mono text-white">
                  {budgetShifts.social >= 0 ? `+₺${budgetShifts.social}` : `-₺${Math.abs(budgetShifts.social)}`}
                </span>
              </div>
              <input
                type="range"
                min="-4000"
                max="6000"
                step="500"
                value={budgetShifts.social}
                onChange={(e) =>
                  setBudgetShifts((prev) => ({ ...prev, social: parseInt(e.target.value) }))
                }
                className="w-full accent-purple-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>-₺4,000</span>
                <span>Mevcut: ₺{attributionConfig.customSpend.social}</span>
                <span>+₺6,000</span>
              </div>
            </div>

            {/* Organic SEO Tools Slider */}
            <div className="p-3.5 bg-slate-900/80 rounded-xl border border-indigo-900/60">
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                <span className="text-emerald-400">Organik SEO Araçları &amp; İçerik</span>
                <span className="font-mono text-white">
                  {budgetShifts.organic >= 0 ? `+₺${budgetShifts.organic}` : `-₺${Math.abs(budgetShifts.organic)}`}
                </span>
              </div>
              <input
                type="range"
                min="-1500"
                max="4000"
                step="200"
                value={budgetShifts.organic}
                onChange={(e) =>
                  setBudgetShifts((prev) => ({ ...prev, organic: parseInt(e.target.value) }))
                }
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>-₺1,500</span>
                <span>Mevcut: ₺{attributionConfig.customSpend.organic}</span>
                <span>+₺4,000</span>
              </div>
            </div>
          </div>

          {/* Simulation Impact Banner */}
          {simulationResult && (
            <div className="p-4 rounded-xl bg-indigo-900/70 border border-indigo-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-indigo-300 block text-[10px] uppercase font-bold">
                    Yeni Toplam Bütçe
                  </span>
                  <span className="font-extrabold text-white text-sm">
                    ₺{simulationResult.newTotalSpend.toLocaleString("tr-TR")}
                  </span>
                </div>
                <div>
                  <span className="text-indigo-300 block text-[10px] uppercase font-bold">
                    Tahmini Ek Lead
                  </span>
                  <span
                    className={`font-extrabold text-sm ${
                      simulationResult.deltaLeads >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {simulationResult.deltaLeads >= 0 ? `+${simulationResult.deltaLeads}` : simulationResult.deltaLeads} Form
                  </span>
                </div>
                <div>
                  <span className="text-indigo-300 block text-[10px] uppercase font-bold">
                    Beklenen Ciro Farkı
                  </span>
                  <span
                    className={`font-extrabold text-sm ${
                      simulationResult.deltaRevenue >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {simulationResult.deltaRevenue >= 0
                      ? `+₺${simulationResult.deltaRevenue.toLocaleString("tr-TR")}`
                      : `-₺${Math.abs(simulationResult.deltaRevenue).toLocaleString("tr-TR")}`}
                  </span>
                </div>
                <div>
                  <span className="text-indigo-300 block text-[10px] uppercase font-bold">
                    Genel ROI Değişimi
                  </span>
                  <span
                    className={`font-extrabold text-sm ${
                      simulationResult.deltaRoi >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {simulationResult.deltaRoi >= 0 ? `+${simulationResult.deltaRoi}%` : `${simulationResult.deltaRoi}%`}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveSimulatedSpend}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all cursor-pointer flex items-center gap-1.5 shadow-md font-black"
                >
                  <Save className="w-3.5 h-3.5 text-slate-950" />
                  <span>Bu Dağılımı Uygula &amp; Kaydet</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. MAIN D3.JS INTERACTIVE VISUALIZATION CARD */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-slate-900">
              Pazarlama Kanalları Karşılaştırma Grafiği (D3.js)
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
              Canlı D3 Görselleştirme
            </span>
          </div>
          <span className="text-xs text-slate-500">
            Baloncuk üzerine gelerek kanal detaylarını inceleyin
          </span>
        </div>

        <MarketingAttributionD3Chart
          channels={displayChannels}
          selectedSourceId={selectedSourceId}
          onSelectSource={(src) => setSelectedSourceId(src)}
          viewMode={viewMode}
          bubbleSizeMode={bubbleSizeMode}
          onViewModeChange={(m) => setViewMode(m)}
          onBubbleSizeModeChange={(s) => setBubbleSizeMode(s)}
        />
      </div>

      {/* 5. DETAILED PERFORMANCE ATTRIBUTION MATRIX TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-black text-slate-900">
              Trafik Kaynakları Performans &amp; Harcama Tablosu
            </h3>
            <p className="text-xs text-slate-500">
              Her kanalın bütçe harcaması, form dönüşüm yüzdesi, birim lead maliyeti ve atfedilen cirosu.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-semibold">
            {channels.length} Kaynak Aktif
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/75 text-slate-600 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Pazarlama Kaynağı</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3 text-right">Aylık Harcama</th>
                <th className="px-4 py-3 text-center">Ziyaretçi</th>
                <th className="px-4 py-3 text-center">Lead / Satış</th>
                <th className="px-4 py-3 text-right">Dönüşüm (CR %)</th>
                <th className="px-4 py-3 text-right">Lead Başı (CPL)</th>
                <th className="px-4 py-3 text-right">Atfedilen Ciro</th>
                <th className="px-4 py-3 text-right">Yatırım Getirisi</th>
                <th className="px-4 py-3">Stratejik Aksiyon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70">
              {channels.map((channel) => {
                const isSelected = selectedSourceId === channel.id;
                const isEditing = editingSpendKey === channel.id;

                return (
                  <tr
                    key={channel.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isSelected ? "bg-indigo-50/40 font-semibold" : ""
                    }`}
                  >
                    {/* Channel Name */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: channel.color }}
                        />
                        <div>
                          <div className="font-black text-slate-900">{channel.shortName}</div>
                          <div className="text-[10px] text-slate-400 line-clamp-1">{channel.name}</div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          channel.category === "paid"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : channel.category === "earned"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {channel.category === "paid" ? "Ücretli" : channel.category === "earned" ? "Kazanılmış" : "Doğrudan"}
                      </span>
                    </td>

                    {/* Spend with inline edit */}
                    <td className="px-4 py-3.5 text-right font-mono font-bold">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <input
                            type="number"
                            value={editSpendValue}
                            onChange={(e) => setEditSpendValue(e.target.value)}
                            className="w-20 px-2 py-0.5 border border-indigo-400 rounded text-xs text-right outline-none"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveInlineSpend(channel.id)}
                            className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="group flex items-center justify-end gap-1.5">
                          <span>₺{channel.spend.toLocaleString("tr-TR")}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSpendKey(channel.id);
                              setEditSpendValue(channel.spend.toString());
                            }}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 cursor-pointer transition-opacity"
                            title="Bütçeyi Düzenle"
                          >
                            ✏️
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Visitors */}
                    <td className="px-4 py-3.5 text-center font-mono text-slate-600">
                      {channel.visitors.toLocaleString("tr-TR")}
                    </td>

                    {/* Leads / Deals */}
                    <td className="px-4 py-3.5 text-center">
                      <span className="font-bold text-slate-900">{channel.leads}</span>
                      <span className="text-slate-400 text-[10px]"> / {channel.closedDeals}</span>
                    </td>

                    {/* CR % */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="font-bold text-indigo-600 font-mono">%{channel.conversionRate}</div>
                      <div className="w-16 bg-slate-100 h-1.5 rounded-full ml-auto overflow-hidden mt-1">
                        <div
                          className="bg-indigo-600 h-full rounded-full"
                          style={{ width: `${Math.min(100, channel.conversionRate * 15)}%` }}
                        />
                      </div>
                    </td>

                    {/* CPL */}
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-amber-600">
                      ₺{channel.cpl}
                    </td>

                    {/* Revenue */}
                    <td className="px-4 py-3.5 text-right font-mono font-black text-emerald-700">
                      ₺{channel.revenue.toLocaleString("tr-TR")}
                    </td>

                    {/* ROI */}
                    <td className="px-4 py-3.5 text-right">
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 font-extrabold font-mono text-xs">
                        +%{channel.roi}
                      </span>
                    </td>

                    {/* Action Recommendation */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2 py-1 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 ${
                          channel.recommendation.action === "increase_budget"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : channel.recommendation.action === "optimize_bids"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : channel.recommendation.action === "reallocate"
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : "bg-slate-100 text-slate-700"
                        }`}
                        title={channel.recommendation.summary}
                      >
                        <Zap className="w-3 h-3 shrink-0" />
                        <span>{channel.recommendation.title}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. AI SPEND OPTIMIZATION ADVISOR CARDS */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-lg bg-indigo-50 text-indigo-600">
            <Sparkles className="w-4 h-4" />
          </span>
          <h3 className="text-sm font-black text-slate-900">
            Pazarlama Bütçesi İçin Akıllı Büyüme Tavsiyeleri
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Paid Ads Advice */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-blue-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Google &amp; Meta Ads
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">
                ROAS: 3.8x
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-900">
              Yüksek Niyetli Arama Kelimelerinde Bütçeyi Genişletin
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Google Ads kanalınız ₺95 CPL ile karlı dönüşüm üretiyor. &apos;En yakın çekici&apos;, &apos;acil yol yardım&apos;
              gibi yüksek niyetli kelimeler için teklifleri %15 artırarak ayda yaklaşık +12 ek sıcak lead
              elde edebilirsiniz.
            </p>
          </div>

          {/* Card 2: Organic SEO Advice */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-emerald-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Organik Arama (SEO)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">
                ROI: +%1,430
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-900">
              Semt &amp; Lokasyon Bazlı Açılış Sayfaları Oluşturun
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Doğrudan reklam maliyeti olmaksızın en yüksek net kâr marjını sağlayan kanalınızdır.
              Kadıköy, Ümraniye, Maltepe gibi ilçe odaklı rehber makaleler ve Google Maps optimizasyonu ile
              ücretsiz trafik akışını kalıcı hale getirin.
            </p>
          </div>

          {/* Card 3: Social Media Advice */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-purple-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                Sosyal Medya &amp; WhatsApp
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold">
                Dönüşüm: %2.8
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-900">
              Bütçenin %20&apos;sini Arama Kampanyalarına Kaydırın
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Sosyal medya genel marka bilinirliği için faydalı ancak form doldurma oranı arama reklamlarına
              göre daha düşük kalmaktadır. Sosyal bütçesinin bir kısmını doğrudan WhatsApp tıkla-konuş
              reklamlarına veya Google Arama&apos;ya aktararak birim lead maliyetini düşürün.
            </p>
          </div>
        </div>
      </div>

      {/* 7. QUICK INTEGRATION JUMPS */}
      <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-600 font-medium">
          <Layers className="w-4 h-4 text-indigo-500" />
          <span>Diğer analitik ve pazarlama modülleriyle entegre çalışır:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab("leads")}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 font-bold text-slate-700 cursor-pointer flex items-center gap-1"
          >
            <span>Leads Gelen Kutusu</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab("lead-mapping")}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 font-bold text-slate-700 cursor-pointer flex items-center gap-1"
          >
            <span>Lead Mapping (D3.js)</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab("lead-forecasting")}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 font-bold text-slate-700 cursor-pointer flex items-center gap-1"
          >
            <span>Gelecek Ay Tahminleme (D3.js)</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab("ab-testing")}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 font-bold text-slate-700 cursor-pointer flex items-center gap-1"
          >
            <span>A/B Testleri</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
