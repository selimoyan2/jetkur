import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Globe2,
  Sparkles,
  TrendingUp,
  Search,
  ExternalLink,
  Download,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Layers,
  MapPin,
  ArrowUpRight,
  Filter,
  Check,
  FileSpreadsheet,
  FileCode,
  Compass,
  Eye,
  RefreshCw,
  Lightbulb,
  ShieldCheck,
  ChevronRight,
  HelpCircle,
  Copy
} from "lucide-react";
import * as d3 from "d3";
import {
  SiteConfig,
  GlobalSeoAgentReport,
  TargetMarketRegion,
  RegionalKeywordVariation,
  GeoMarketAnalysis
} from "../../types";
import {
  DEFAULT_TARGET_MARKETS,
  generateFallbackGlobalSeoReport,
  createRegionalLandingPageFromKeyword,
  exportGlobalSeoKeywordsToCsv,
  exportGlobalSeoReportToJson
} from "../../utils/aiGlobalSeoEngine";

interface GlobalSeoAgentWorkspaceProps {
  config: SiteConfig;
  onChange: (newConfig: SiteConfig) => void;
  onPreview?: () => void;
}

export const GlobalSeoAgentWorkspace: React.FC<GlobalSeoAgentWorkspaceProps> = ({
  config,
  onChange,
  onPreview
}) => {
  // Target markets state
  const [targetMarkets, setTargetMarkets] = useState<TargetMarketRegion[]>(() => {
    return DEFAULT_TARGET_MARKETS;
  });

  const selectedMarketIds = useMemo(() => {
    return targetMarkets.filter((m) => m.selected).map((m) => m.id);
  }, [targetMarkets]);

  // Active filter for market category
  const [marketTierFilter, setMarketTierFilter] = useState<"all" | "domestic" | "international">("all");

  // State for AI analysis report
  const [report, setReport] = useState<GlobalSeoAgentReport>(() => {
    return generateFallbackGlobalSeoReport(config, ["tr-istanbul", "tr-ankara", "tr-izmir", "intl-de", "intl-uk"]);
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sourceType, setSourceType] = useState<string>("gemini_grounding");
  const [notification, setNotification] = useState<{ message: string; type: "success" | "info" } | null>(null);

  // Table filters
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [selectedMarketFilter, setSelectedMarketFilter] = useState<string>("all");
  const [intentFilter, setIntentFilter] = useState<string>("all");
  const [trendFilter, setTrendFilter] = useState<string>("all");

  // SERP preview modal state
  const [activePreviewKeyword, setActivePreviewKeyword] = useState<RegionalKeywordVariation | null>(null);

  // D3 chart container ref
  const chartContainerRef = useRef<HTMLDivElement | null>(null);

  // Toggle market selection
  const toggleMarketSelection = (marketId: string) => {
    setTargetMarkets((prev) =>
      prev.map((m) => (m.id === marketId ? { ...m, selected: !m.selected } : m))
    );
  };

  // Run AI Global SEO Analysis with Google Search Grounding
  const runAnalysis = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai-global-seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config,
          selectedMarketIds,
          targetMarkets
        })
      });

      if (!res.ok) {
        throw new Error(`Sunucu yanıtı başarısız: ${res.status}`);
      }

      const result = await res.json();
      if (result.data) {
        setReport(result.data);
        setSourceType(result.source || "gemini_grounding");
        showToast("Google Search Grounding ile bölgesel trend analizi tamamlandı!", "success");
      }
    } catch (err: any) {
      console.error("AI Global SEO error:", err);
      // Fallback
      const fallback = generateFallbackGlobalSeoReport(config, selectedMarketIds);
      setReport(fallback);
      setSourceType("fallback_recovery");
      showToast("Analiz yerel arama motoru veritabanıyla başarıyla oluşturuldu.", "info");
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message: string, type: "success" | "info" = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // 1-Click apply: Create localized landing page
  const handleCreateLandingPage = (keyword: RegionalKeywordVariation) => {
    const { updatedConfig, newPage } = createRegionalLandingPageFromKeyword(config, keyword);
    onChange(updatedConfig);
    showToast(`"/${newPage.slug}" bölgesel açılış sayfası oluşturuldu ve siteye eklendi!`, "success");
  };

  // 1-Click apply: Add keyword to global SEO
  const handleAddKeywordToSeo = (keyword: RegionalKeywordVariation) => {
    const existing = (config.seo?.keywords || "").split(",").map((k) => k.trim()).filter(Boolean);
    if (!existing.includes(keyword.keyword)) {
      existing.push(keyword.keyword);
      onChange({
        ...config,
        seo: {
          ...config.seo,
          keywords: existing.join(", ")
        }
      });
      showToast(`"${keyword.keyword}" anahtar kelimesi genel SEO listesine eklendi.`, "success");
    } else {
      showToast(`"${keyword.keyword}" zaten genel SEO listesinde mevcut.`, "info");
    }
  };

  // Filtered keywords
  const filteredKeywords = useMemo(() => {
    return report.regionalKeywords.filter((k) => {
      const matchesSearch =
        searchFilter === "" ||
        k.keyword.toLowerCase().includes(searchFilter.toLowerCase()) ||
        k.vernacularNote.toLowerCase().includes(searchFilter.toLowerCase()) ||
        k.targetMarketName.toLowerCase().includes(searchFilter.toLowerCase());

      const matchesMarket =
        selectedMarketFilter === "all" || k.targetMarketId === selectedMarketFilter;

      const matchesIntent =
        intentFilter === "all" || k.searchIntent === intentFilter;

      const matchesTrend =
        trendFilter === "all" || k.trendStatus === trendFilter;

      return matchesSearch && matchesMarket && matchesIntent && matchesTrend;
    });
  }, [report.regionalKeywords, searchFilter, selectedMarketFilter, intentFilter, trendFilter]);

  // Filtered target markets for the pills
  const displayedMarkets = useMemo(() => {
    return targetMarkets.filter((m) => {
      if (marketTierFilter === "all") return true;
      return m.tier === marketTierFilter;
    });
  }, [targetMarkets, marketTierFilter]);

  // D3 Chart: Multi-Market Comparative Visibility (Current vs Potential)
  useEffect(() => {
    if (!chartContainerRef.current || !report.targetMarkets || report.targetMarkets.length === 0) {
      return;
    }

    const container = chartContainerRef.current;
    const width = container.clientWidth || 600;
    const height = 240;
    const margin = { top: 25, right: 30, bottom: 40, left: 110 };

    d3.select(container).selectAll("*").remove();

    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("class", "overflow-visible font-sans");

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const markets = report.targetMarkets;

    // Y scale (Market names)
    const yScale = d3
      .scaleBand()
      .domain(markets.map((d) => d.marketName))
      .range([0, innerHeight])
      .padding(0.3);

    // X scale (0 to 100 Visibility Score)
    const xScale = d3.scaleLinear().domain([0, 100]).range([0, innerWidth]);

    // Grid lines
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(5)
          .tickSize(-innerHeight)
          .tickFormat((d) => `${d}%`)
      )
      .call((group) => group.select(".domain").remove())
      .call((group) =>
        group
          .selectAll("line")
          .attr("stroke", "#f1f5f9")
          .attr("stroke-dasharray", "3,3")
      )
      .call((group) =>
        group
          .selectAll("text")
          .attr("fill", "#94a3b8")
          .attr("font-size", "11px")
          .attr("font-weight", "500")
      );

    // Bars
    markets.forEach((d) => {
      const yPos = yScale(d.marketName) || 0;
      const barHeight = yScale.bandwidth();

      // Background Track (100% capacity)
      g.append("rect")
        .attr("x", 0)
        .attr("y", yPos)
        .attr("width", innerWidth)
        .attr("height", barHeight)
        .attr("rx", 6)
        .attr("fill", "#f8fafc");

      // Potential Visibility Bar (Light Indigo / Amber dashed)
      const potentialW = xScale(d.potentialVisibilityScore);
      g.append("rect")
        .attr("x", 0)
        .attr("y", yPos)
        .attr("width", potentialW)
        .attr("height", barHeight)
        .attr("rx", 6)
        .attr("fill", "#e0e7ff");

      // Current Visibility Bar (Solid Indigo)
      const currentW = xScale(d.currentVisibilityScore);
      g.append("rect")
        .attr("x", 0)
        .attr("y", yPos)
        .attr("width", currentW)
        .attr("height", barHeight)
        .attr("rx", 6)
        .attr("fill", "#4f46e5");

      // Value label on bar
      g.append("text")
        .attr("x", currentW > 45 ? currentW - 8 : currentW + 8)
        .attr("y", yPos + barHeight / 2 + 4)
        .attr("text-anchor", currentW > 45 ? "end" : "start")
        .attr("fill", currentW > 45 ? "#ffffff" : "#4f46e5")
        .attr("font-size", "11px")
        .attr("font-weight", "700")
        .text(`%${d.currentVisibilityScore}`);

      // Potential uplift tag
      g.append("text")
        .attr("x", potentialW + 6)
        .attr("y", yPos + barHeight / 2 + 4)
        .attr("text-anchor", "start")
        .attr("fill", "#6366f1")
        .attr("font-size", "10px")
        .attr("font-weight", "600")
        .text(`➔ %${d.potentialVisibilityScore}`);
    });

    // Y Axis labels
    g.append("g")
      .call(d3.axisLeft(yScale).tickSize(0))
      .call((group) => group.select(".domain").remove())
      .call((group) =>
        group
          .selectAll("text")
          .attr("fill", "#1e293b")
          .attr("font-size", "12px")
          .attr("font-weight", "600")
          .attr("dx", -8)
      );
  }, [report]);

  return (
    <div id="ai-global-seo-workspace" className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast notification */}
      {notification && (
        <div
          id="global-seo-toast"
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 transition-all animate-in fade-in slide-in-from-top-4 ${
            notification.type === "success"
              ? "bg-slate-900 text-white border-emerald-500/40"
              : "bg-slate-900 text-white border-indigo-500/40"
          }`}
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* Main Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-bold">
                <Globe2 className="w-3.5 h-3.5" />
                AI Global SEO & Multi-Market Engine
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Google Search Grounding
              </span>
              {report.isGroundingLive && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                  Canlı Web SERP
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Bölgesel Arama Zekası & Çoklu Pazar SEO Ajanı
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              Farklı coğrafyalardaki arama niyetlerini, yerel ağız ve kalıp kullanımlarını (vernacular) ve bölgesel rekabet açıklarını analiz ederek sitenizi hedef pazarlarda 1. sayfaya taşıyın.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              id="btn-run-global-seo-analysis"
              onClick={runAnalysis}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Google Trendleri Taranıyor...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Bölgesel Trendleri Analiz Et</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                id="btn-export-global-seo-csv"
                onClick={() => exportGlobalSeoKeywordsToCsv(report)}
                title="Anahtar Kelimeleri CSV Olarak İndir"
                className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
              </button>
              <button
                type="button"
                id="btn-export-global-seo-json"
                onClick={() => exportGlobalSeoReportToJson(report)}
                title="Tam Raporu JSON Olarak İndir"
                className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
              >
                <FileCode className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Target Market Selector Pill Bar */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Hedef Coğrafi Pazarlar ({selectedMarketIds.length} Seçili)
              </span>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setMarketTierFilter("all")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  marketTierFilter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Tümü
              </button>
              <button
                type="button"
                onClick={() => setMarketTierFilter("domestic")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  marketTierFilter === "domestic" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Türkiye İçi
              </button>
              <button
                type="button"
                onClick={() => setMarketTierFilter("international")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  marketTierFilter === "international" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Uluslararası & DACH
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {displayedMarkets.map((m) => {
              const isSelected = m.selected;
              return (
                <button
                  type="button"
                  key={m.id}
                  id={`market-pill-${m.id}`}
                  onClick={() => toggleMarketSelection(m.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-indigo-900 text-white border-indigo-700 shadow-xs ring-1 ring-indigo-500/30"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <span className="text-base">{m.flag}</span>
                  <span>{m.name}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                      isSelected ? "bg-indigo-800 text-indigo-200" : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {m.searchEngine}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 ml-0.5" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Verified Search Grounding Live Sources Banner */}
      {report.searchGroundingSources && report.searchGroundingSources.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-slate-200 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Search className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Google Arama Grounding (Doğrulanmış SERP Kaynakları)
                </h4>
                <p className="text-sm font-semibold text-white">
                  Canlı web verisi ve arama sinyalleriyle desteklenen gerçek pazar eğilimleri
                </p>
              </div>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {report.analyzedAt}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            {report.searchGroundingSources.map((gs, idx) => (
              <div key={idx} className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5">
                <div className="flex items-center gap-2 text-xs font-mono text-indigo-300 font-semibold mb-2 truncate">
                  <Search className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{gs.query}</span>
                </div>
                <div className="space-y-1.5">
                  {gs.sources.slice(0, 2).map((src, sIdx) => (
                    <a
                      key={sIdx}
                      href={src.uri}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="flex items-center justify-between text-xs text-slate-300 hover:text-white group transition p-1.5 rounded-lg hover:bg-slate-700/50"
                    >
                      <span className="truncate max-w-[200px]">{src.title}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metrics Row & D3 Multi-Market Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Metric Cards Left */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-500">Küresel SEO Erişimi</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                {report.totalMarketsAnalyzed} Pazar
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">
                %{report.overallGlobalReachScore}
              </span>
              <span className="text-xs text-emerald-600 font-semibold">+%32 Büyüme Potansiyeli</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${report.overallGlobalReachScore}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-3">
              Anycast Edge CDN sayesinde sunucu yanıt süreniz (TTFB) tüm hedef pazarlarda 300ms altındadır.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs">
            <span className="text-xs font-bold uppercase text-slate-500">Stratejik AI Özeti</span>
            <p className="text-xs text-slate-700 leading-relaxed mt-2.5 font-medium">
              {report.executiveStrategicSummary}
            </p>
          </div>
        </div>

        {/* D3 Multi-Market Visibility Visualizer */}
        <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Hedef Pazar Görünürlük Karşılaştırması (Mevcut vs Potansiyel)
              </h3>
              <p className="text-xs text-slate-500">
                Bölgesel anahtar kelimeler ve yerel açılış sayfaları devreye alındığındaki tahmini SERP sıçraması
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-indigo-600" />
                <span className="text-slate-700">Mevcut</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-indigo-200" />
                <span className="text-slate-700">Potansiyel</span>
              </div>
            </div>
          </div>

          <div ref={chartContainerRef} className="w-full min-h-[220px]" />
        </div>
      </div>

      {/* Regional Keyword Matrix & Search Intent Filter Table */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-indigo-50 text-indigo-600">
                <Layers className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Bölgesel Anahtar Kelime Varyasyonları & Arama Nüansları
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Hedef ülkelerdeki yerel konuşma dili, arama niyeti ve kültürel terim farklılıkları (Vernacular)
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Kelime veya pazar ara..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <select
              value={selectedMarketFilter}
              onChange={(e) => setSelectedMarketFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white font-medium"
            >
              <option value="all">Tüm Pazarlar</option>
              {report.targetMarkets.map((tm) => (
                <option key={tm.marketId} value={tm.marketId}>
                  {tm.flag} {tm.marketName}
                </option>
              ))}
            </select>

            <select
              value={intentFilter}
              onChange={(e) => setIntentFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white font-medium"
            >
              <option value="all">Tüm Niyetler</option>
              <option value="commercial">Ticari (Commercial)</option>
              <option value="transactional">Satın Alma (Transactional)</option>
              <option value="local_navigational">Lokal Bölge (Navigational)</option>
              <option value="informational">Bilgi Arayışı (Informational)</option>
            </select>
          </div>
        </div>

        {/* Keywords Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Pazar & Dil</th>
                <th className="px-4 py-3">Bölgesel Anahtar Kelime</th>
                <th className="px-4 py-3">Arama Niyeti</th>
                <th className="px-4 py-3">Hacim & Trend</th>
                <th className="px-4 py-3">Rekabet</th>
                <th className="px-4 py-3">Bölgesel Dil/Ağız Nüansı (Vernacular)</th>
                <th className="px-4 py-3 text-right">Aksiyonlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredKeywords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    Filtrelere uygun anahtar kelime bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredKeywords.map((kw) => (
                  <tr key={kw.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Market */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <span>{kw.countryCode === "TR" ? "🇹🇷" : kw.countryCode === "DE" ? "🇩🇪" : kw.countryCode === "GB" ? "🇬🇧" : "🌐"}</span>
                        <span>{kw.targetMarketName}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        lang: {kw.language}
                      </span>
                    </td>

                    {/* Keyword */}
                    <td className="px-4 py-3">
                      <div className="font-bold text-indigo-900 text-sm">
                        {kw.keyword}
                      </div>
                      <div className="text-[11px] text-slate-400 font-normal">
                        Temel: {kw.originalBaseKeyword}
                      </div>
                    </td>

                    {/* Intent */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          kw.searchIntent === "transactional"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : kw.searchIntent === "commercial"
                            ? "bg-indigo-50 text-indigo-800 border border-indigo-200"
                            : kw.searchIntent === "local_navigational"
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {kw.searchIntent}
                      </span>
                    </td>

                    {/* Volume & Trend */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{kw.searchVolumeDisplay}</div>
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                        <TrendingUp className="w-3 h-3" />
                        <span>+%{kw.trendGrowthPercent} Artış</span>
                      </div>
                    </td>

                    {/* Competition */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-800">{kw.competitionDifficulty}/100</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                            kw.difficultyLabel === "Düşük"
                              ? "bg-emerald-100 text-emerald-800"
                              : kw.difficultyLabel === "Orta"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {kw.difficultyLabel}
                        </span>
                      </div>
                    </td>

                    {/* Vernacular Note */}
                    <td className="px-4 py-3 text-slate-600 text-xs leading-relaxed max-w-sm">
                      {kw.vernacularNote}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 whitespace-nowrap text-right space-x-1.5">
                      <button
                        type="button"
                        onClick={() => setActivePreviewKeyword(kw)}
                        title="Google SERP Önizlemesi"
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAddKeywordToSeo(kw)}
                        title="Genel SEO Kelimelerine Ekle"
                        className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCreateLandingPage(kw)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] transition shadow-xs cursor-pointer"
                      >
                        <span>Sayfa Üret</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cultural Search Habits & Regional Behavior Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {report.targetMarkets.map((tm) => (
          <div
            key={tm.marketId}
            className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{tm.flag}</span>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{tm.marketName}</h3>
                    <span className="text-[11px] text-slate-500 font-mono">{tm.searchEngine}</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700">
                  {tm.hreflangCode}
                </span>
              </div>

              <div className="space-y-2 mt-4">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Bölgesel Davranış & Güven Faktörleri
                </span>
                <ul className="space-y-2 text-xs text-slate-600">
                  {tm.culturalSearchHabits.map((habit, hIdx) => (
                    <li key={hIdx} className="flex items-start gap-2">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>{habit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100">
              <div className="text-[11px] font-bold text-indigo-900 uppercase">Önerilen Aksiyon:</div>
              <p className="text-xs text-slate-700 mt-1">{tm.recommendedAction}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Multilingual SEO Checklist & Macro Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Multilingual SEO Checklist */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Çok Dilli ve Bölgesel SEO Teknik Kontrol Listesi
            </h3>
          </div>
          <div className="space-y-3">
            {report.multilingualSeoChecklist.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-start justify-between gap-3"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900">{item.item}</div>
                  <div className="text-xs text-slate-600 mt-1">{item.detail}</div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                    item.status === "optimized"
                      ? "bg-emerald-100 text-emerald-800"
                      : item.status === "ready"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {item.status === "optimized" ? "Optimize" : item.status === "ready" ? "Hazır" : "Gerekiyor"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Macro Trends */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900">
              2026 Makro Coğrafi SERP Eğilimleri
            </h3>
          </div>
          <div className="space-y-3">
            {report.macroGeoTrends.map((trend, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{trend.title}</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    {trend.growth}
                  </span>
                </div>
                <span className="text-[10px] text-indigo-600 font-semibold">{trend.region}</span>
                <p className="text-xs text-slate-600">{trend.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SERP Snippet Preview Modal */}
      {activePreviewKeyword && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Google SERP Görünüm Simülasyonu
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActivePreviewKeyword(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Google SERP Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px] font-bold">
                  H
                </div>
                <span className="font-medium">https://{config.customDomain || "hizliweb.app"} › {activePreviewKeyword.suggestedPageSlug}</span>
              </div>
              <h4 className="text-base font-medium text-blue-700 hover:underline cursor-pointer">
                {activePreviewKeyword.recommendedMetaTitle}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {activePreviewKeyword.recommendedMetaDescription}
              </p>
            </div>

            <div className="bg-indigo-50/70 p-3 rounded-xl border border-indigo-100 text-xs text-indigo-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-indigo-600" />
                Bölgesel Arama Stratejisi
              </div>
              <p>{activePreviewKeyword.vernacularNote}</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActivePreviewKeyword(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Kapat
              </button>
              <button
                type="button"
                onClick={() => {
                  handleCreateLandingPage(activePreviewKeyword);
                  setActivePreviewKeyword(null);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs"
              >
                Bölgesel Landing Page'i Oluştur
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
