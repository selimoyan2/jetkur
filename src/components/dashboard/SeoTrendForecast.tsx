import React, { useState, useEffect, useMemo } from "react";
import { 
  SiteConfig, 
  SeoTrendForecastResponse, 
  EmergingSeoTrend,
  CustomerPanelTab 
} from "../../types";
import { 
  generateFallbackSeoTrendForecast, 
  exportTrendsToCsv 
} from "../../utils/seoTrendForecastEngine";
import { SeoTrendForecastChart } from "./SeoTrendForecastChart";
import {
  TrendingUp,
  Sparkles,
  Search,
  Globe,
  RefreshCw,
  Download,
  Check,
  Copy,
  ExternalLink,
  Target,
  FileText,
  Calendar,
  Zap,
  ShieldCheck,
  Layers,
  ArrowUpRight,
  Flame,
  Info,
  MapPin,
  Building2,
  Sliders,
  ChevronRight,
  ChevronDown,
  Clock,
  BarChart3,
  HelpCircle,
  Share2,
  CheckCircle2,
  BookOpen
} from "lucide-react";

interface SeoTrendForecastProps {
  config: SiteConfig;
  onChange: (updated: SiteConfig) => void;
  onNavigateTab?: (tab: CustomerPanelTab | string, state?: any) => void;
  onSendToAiBlog?: (headline: string, keyword: string) => void;
}

export const SeoTrendForecast: React.FC<SeoTrendForecastProps> = ({
  config,
  onChange,
  onNavigateTab,
  onSendToAiBlog
}) => {
  // State
  const [data, setData] = useState<SeoTrendForecastResponse>(() => {
    return generateFallbackSeoTrendForecast(config);
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedTrendId, setSelectedTrendId] = useState<string>("trend-1");
  const [chartMode, setChartMode] = useState<"single" | "multi">("single");
  const [metricType, setMetricType] = useState<"index" | "volume">("index");
  
  // Custom query inputs
  const [customSector, setCustomSector] = useState<string>(config.sector || "Evden Eve Nakliyat & Taşımacılık");
  const [customCity, setCustomCity] = useState<string>(config.city || "İstanbul");
  const [customFocus, setCustomFocus] = useState<string>("");
  const [showCustomizer, setShowCustomizer] = useState<boolean>(false);

  // Copied states
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [expandedTrendIds, setExpandedTrendIds] = useState<Record<string, boolean>>({
    "trend-1": true,
    "trend-2": false,
    "trend-3": false,
    "trend-4": false,
    "trend-5": false
  });
  const [showGroundingSources, setShowGroundingSources] = useState<boolean>(false);

  // Fetch trend forecast from server endpoint
  const fetchTrendForecast = async (sectorParam?: string, cityParam?: string, focusParam?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/seo-trend-forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config,
          industry: sectorParam ?? customSector,
          city: cityParam ?? customCity,
          customQuery: focusParam ?? customFocus
        })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
          if (json.data.trends?.[0]?.id) {
            setSelectedTrendId(json.data.trends[0].id);
            setExpandedTrendIds({ [json.data.trends[0].id]: true });
          }
        }
      }
    } catch (err) {
      console.warn("Could not fetch SEO trend forecast from server, using local fallback:", err);
      const fallback = generateFallbackSeoTrendForecast(config, sectorParam ?? customSector, cityParam ?? customCity);
      setData(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchTrendForecast();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedTrend = useMemo(() => {
    return data.trends.find((t) => t.id === selectedTrendId) || data.trends[0];
  }, [data.trends, selectedTrendId]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const toggleExpand = (id: string) => {
    setExpandedTrendIds((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
    setSelectedTrendId(id);
  };

  const handleSendToBlog = (trend: EmergingSeoTrend) => {
    const headline = trend.actionPlan.recommendedHeadline || trend.trendTitle;
    const keyword = trend.primaryKeyword;
    if (onSendToAiBlog) {
      onSendToAiBlog(headline, keyword);
    } else {
      sessionStorage.setItem("ai_blog_prefill_topic", headline);
      sessionStorage.setItem("ai_blog_prefill_keyword", keyword);
      if (onNavigateTab) {
        onNavigateTab("ai-blog-engine");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/80 border border-indigo-900/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mb-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5 shadow-xs">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                Gemini 3.8 Flash ✦ Google Search Grounding
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                data.source === "gemini_grounding"
                  ? "bg-emerald-950/80 text-emerald-300 border-emerald-700/60"
                  : "bg-slate-800 text-slate-300 border-slate-700"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${data.source === "gemini_grounding" ? "bg-emerald-400 animate-pulse" : "bg-slate-400"}`} />
                {data.source === "gemini_grounding" ? "Canlı Google SERP Verisi" : "Yerel Algoritmik Analiz"}
              </span>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                {data.analyzedAt}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <TrendingUp className="w-7 h-7 text-indigo-400" />
              SEO Trend Tahmincisi
              <span className="text-xs font-normal px-2.5 py-1 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-800/50">
                12 Aylık Talep Projeksiyonu
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Google Search Grounding motoru ile <strong className="text-white font-semibold">{data.region}</strong> bölgesinde{" "}
              <strong className="text-indigo-300 font-semibold">{data.sector}</strong> sektöründeki yükselişe geçen ilk 5 arama trendi, kırılma yaşayan anahtar kelimeler ve gelecek 12 aylık talep projeksiyonu.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center shrink-0">
            <button
              type="button"
              id="btn-toggle-customizer"
              onClick={() => setShowCustomizer(!showCustomizer)}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>Sektör & Filtre</span>
            </button>

            <button
              type="button"
              id="btn-export-trends-csv"
              onClick={() => exportTrendsToCsv(data)}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Trend verilerini Excel / CSV olarak indir"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>CSV İndir</span>
            </button>

            <button
              type="button"
              id="btn-refresh-trends-forecast"
              onClick={() => fetchTrendForecast()}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>{isLoading ? "Google Taranıyor..." : "Canlı Yenile"}</span>
            </button>
          </div>
        </div>

        {/* Expandable Customizer Drawer */}
        {showCustomizer && (
          <div className="mt-5 pt-5 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                Sektör / Faaliyet Alanı
              </label>
              <input
                type="text"
                value={customSector}
                onChange={(e) => setCustomSector(e.target.value)}
                placeholder="Örn: Evden Eve Nakliyat, Diş Kliniği..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                Şehir / Hedef Bölge
              </label>
              <input
                type="text"
                value={customCity}
                onChange={(e) => setCustomCity(e.target.value)}
                placeholder="Örn: İstanbul, Ankara, İzmir..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                Özel Arama Odağı (Opsiyonel)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customFocus}
                  onChange={(e) => setCustomFocus(e.target.value)}
                  placeholder="Örn: asansörlü taşıma, parça eşya..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => fetchTrendForecast(customSector, customCity, customFocus)}
                  disabled={isLoading}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg cursor-pointer shrink-0"
                >
                  Ara
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Macro Summary & Market Shifts Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Strategic Narrative */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-indigo-400" />
                Makro Tüketici & Arama Motoru Dinamikleri
              </span>
              <button
                type="button"
                onClick={() => setShowGroundingSources(!showGroundingSources)}
                className="text-[11px] font-bold text-slate-400 hover:text-indigo-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                <span>{data.groundingCitations.length} Google SERP Kaynağı</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showGroundingSources ? "rotate-180" : ""}`} />
              </button>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {data.macroSummary}
            </p>
          </div>

          {/* Market Shift Highlights Chips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-4 border-t border-slate-800/80 mt-4">
            {data.marketShiftHighlights.map((shift, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 text-[11px] text-slate-300"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{shift}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Quick Insights Overview */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-3">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-2">
              <Flame className="w-3.5 h-3.5 text-emerald-400" />
              1 Numaralı Fırsat Trendi
            </span>
            <h3 className="text-sm font-black text-white line-clamp-2">
              {data.trends[0]?.trendTitle}
            </h3>
            <p className="text-xs text-indigo-300 font-mono mt-1">
              "{data.trends[0]?.primaryKeyword}"
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Yıllık Hız</span>
              <span className="text-base font-black text-emerald-400">
                {data.trends[0]?.growthLabel}
              </span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Fırsat Skoru</span>
              <span className="text-base font-black text-indigo-400">
                {data.trends[0]?.opportunityScore} / 100
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleSendToBlog(data.trends[0])}
            className="w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-600/90 hover:bg-indigo-600 text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Bu Trendle Hemen Makale Yaz</span>
          </button>
        </div>
      </div>

      {/* 2b. Grounding Sources Drawer (Transparent Search Citations) */}
      {showGroundingSources && (
        <div className="bg-slate-950 border border-indigo-950 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Google Search Grounding Canlı Arama Sorguları & Kaynaklar
              </h3>
            </div>
            <span className="text-[10px] text-slate-400">
              Gerçek zamanlı web doğrulama
            </span>
          </div>

          {/* Queries executed */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 block mb-2">
              Google Arama Motorunda Yürütülen Canlı Sorgular:
            </span>
            <div className="flex flex-wrap gap-2">
              {data.searchGroundingQueries.map((q, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-indigo-300 font-mono flex items-center gap-1.5"
                >
                  <Search className="w-3 h-3 text-slate-500" />
                  {q}
                </span>
              ))}
            </div>
          </div>

          {/* Web citations */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 block mb-2">
              Taranan SERP Kaynakları & Veri Tabanları:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {data.groundingCitations.map((cit, i) => (
                <a
                  key={i}
                  href={cit.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <span className="text-[9px] font-mono text-indigo-400 block mb-1">
                      {cit.sourceDomain || "Google SERP"}
                    </span>
                    <h4 className="text-xs font-bold text-slate-200 group-hover:text-white line-clamp-2">
                      {cit.title}
                    </h4>
                    {cit.snippet && (
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                        {cit.snippet}
                      </p>
                    )}
                  </div>
                  <div className="pt-2 mt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-indigo-400 font-bold">
                    <span>Kaynağı İncele</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. Interactive Trend Forecast Chart Component */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-black text-white uppercase tracking-wider">
              12 Aylık Trend Yörüngesi & Gelecek Projeksiyonu
            </h2>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Ayrıntılı güven aralığı ve canlı SERP dönüm noktaları
          </span>
        </div>

        <SeoTrendForecastChart
          trends={data.trends}
          selectedTrendId={selectedTrendId}
          onSelectTrend={(id) => setSelectedTrendId(id)}
          chartMode={chartMode}
          onChartModeChange={(m) => setChartMode(m)}
          metricType={metricType}
          onMetricTypeChange={(t) => setMetricType(t)}
        />
      </div>

      {/* 4. Top 5 Emerging Search Trends Detailed Breakdown */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-black text-white uppercase tracking-wider">
              İlk 5 Yükselen Arama Trendi (Detaylı Analiz & Aksiyon Planı)
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Rakiplerinizden önce Google'da ilk sırayı yakalamak için hazır stratejiler
          </span>
        </div>

        <div className="space-y-3">
          {data.trends.map((trend) => {
            const isExpanded = !!expandedTrendIds[trend.id];
            const isSelected = trend.id === selectedTrendId;

            return (
              <div
                key={trend.id}
                className={`bg-slate-900 border rounded-2xl transition-all overflow-hidden ${
                  isSelected
                    ? "border-indigo-500/80 shadow-xl shadow-indigo-950/40 ring-1 ring-indigo-500/40"
                    : "border-slate-800 hover:border-slate-700"
                }`}
              >
                {/* Trend Summary Header Bar */}
                <div
                  onClick={() => toggleExpand(trend.id)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    {/* Rank badge */}
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-sm shrink-0 shadow-sm"
                      style={{ backgroundColor: trend.color }}
                    >
                      #{trend.rank}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {trend.categoryLabel}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/40">
                          {trend.growthLabel}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-800/40">
                          {trend.velocityStatus}
                        </span>
                      </div>

                      <h3 className="text-base font-black text-white hover:text-indigo-300 transition-colors">
                        {trend.trendTitle}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span className="font-mono text-indigo-300 font-semibold flex items-center gap-1">
                          <Search className="w-3 h-3 text-slate-500" />
                          "{trend.primaryKeyword}"
                        </span>
                        <span>•</span>
                        <span>Mevcut: <strong className="text-slate-200">{trend.currentMonthlyVolume}</strong></span>
                        <span>•</span>
                        <span>Hedeflenen: <strong className="text-emerald-400">{trend.projectedMonthlyVolume}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Opportunity gauge & expand toggle */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-medium">Fırsat Skoru</span>
                      <span className="text-base font-black text-indigo-400">
                        {trend.opportunityScore} <span className="text-xs text-slate-400 font-normal">/100</span>
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-medium">Rekabet</span>
                      <span className={`text-xs font-bold ${
                        trend.competitionLevel === "Düşük" ? "text-emerald-400" : trend.competitionLevel === "Orta" ? "text-amber-400" : "text-rose-400"
                      }`}>
                        {trend.competitionLevel} ({trend.competitionScore}/100)
                      </span>
                    </div>

                    <div className={`p-2 rounded-xl bg-slate-800 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Expanded Action Plan & Deep Insights */}
                {isExpanded && (
                  <div className="px-4 pb-5 sm:px-5 sm:pb-6 pt-2 border-t border-slate-800/80 space-y-5">
                    {/* Why It Matters (Grounding Reason) */}
                    <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-black text-indigo-400 uppercase tracking-wider">
                        <Info className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Neden Yükseliyor? (Google Arama Verisi Analizi)</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {trend.whyItMatters}
                      </p>
                    </div>

                    {/* Action Plan Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: Metadata Recommendation */}
                      <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 space-y-3">
                        <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-emerald-400" />
                          Önerilen Açılış Sayfası / SERP Meta Bilgileri
                        </span>

                        <div>
                          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                            <span>Önerilen H1 / Sayfa Başlığı:</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(trend.actionPlan.recommendedHeadline, `head-${trend.id}`)}
                              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                            >
                              {copiedKey === `head-${trend.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedKey === `head-${trend.id}` ? "Kopyalandı" : "Kopyala"}</span>
                            </button>
                          </div>
                          <p className="text-xs font-bold text-slate-200 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                            {trend.actionPlan.recommendedHeadline}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                            <span>Önerilen Meta Açıklama:</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(trend.actionPlan.recommendedMetaDescription, `desc-${trend.id}`)}
                              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                            >
                              {copiedKey === `desc-${trend.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedKey === `desc-${trend.id}` ? "Kopyalandı" : "Kopyala"}</span>
                            </button>
                          </div>
                          <p className="text-xs text-slate-300 bg-slate-900 p-2.5 rounded-lg border border-slate-800 leading-relaxed">
                            {trend.actionPlan.recommendedMetaDescription}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-slate-400 border-t border-slate-800/80">
                          <span>Hedef Kitle: <strong className="text-slate-200">{trend.actionPlan.targetAudience}</strong></span>
                          <span>İlk Sıra Süresi: <strong className="text-emerald-400">{trend.actionPlan.estimatedTimeToRank}</strong></span>
                        </div>
                      </div>

                      {/* Right: Concrete Implementation Steps */}
                      <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 space-y-3 flex flex-col justify-between">
                        <div>
                          <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                            <Target className="w-3.5 h-3.5 text-indigo-400" />
                            3 Adımda İlk Sıraya Çıkma Stratejisi
                          </span>
                          <div className="space-y-2">
                            {trend.actionPlan.strategicNextSteps.map((step, idx) => (
                              <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                                <div className="w-4 h-4 rounded-full bg-indigo-950 border border-indigo-700 flex items-center justify-center text-[10px] font-black text-indigo-300 shrink-0 mt-0.5">
                                  {idx + 1}
                                </div>
                                <span className="leading-snug">{step}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* SERP Features & Search Intent */}
                        <div className="pt-3 border-t border-slate-800/80 space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Tetiklenen SERP Özellikleri & Arama Niyeti:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {trend.serpFeatures.map((feat, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-bold text-amber-300"
                              >
                                {feat}
                              </span>
                            ))}
                            <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-bold text-indigo-300">
                              {trend.searchIntent}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Related High-Velocity Keywords */}
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 block mb-2">
                        İlişkili Yüksek Hacimli Arama Sorguları:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {trend.relatedQueries.map((rq, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleCopy(rq, `rq-${trend.id}-${idx}`)}
                            className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 flex items-center gap-1.5 transition-all cursor-pointer"
                            title="Tıkla ve kopyala"
                          >
                            <Search className="w-3 h-3 text-slate-500" />
                            <span>{rq}</span>
                            {copiedKey === `rq-${trend.id}-${idx}` ? (
                              <Check className="w-3 h-3 text-emerald-400 ml-1" />
                            ) : null}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 1-Click Action Hub */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTrendId(trend.id);
                            setChartMode("single");
                            window.scrollTo({ top: 400, behavior: "smooth" });
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Grafikte İncele</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2.5">
                        {onNavigateTab && (
                          <button
                            type="button"
                            onClick={() => {
                              sessionStorage.setItem("ai_blog_prefill_topic", trend.actionPlan.recommendedHeadline || trend.trendTitle);
                              sessionStorage.setItem("ai_blog_prefill_keyword", trend.primaryKeyword);
                              onNavigateTab("ai-content-planner");
                            }}
                            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-900/60 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                            <span>30 Günlük AI Takvime Ekle</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleSendToBlog(trend)}
                          className="px-4 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-600/30"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>AI Blog Makalesi Üret</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
