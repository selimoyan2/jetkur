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
  Copy,
  Languages,
  BookOpen,
  ArrowRight,
  Code2,
  Target,
  SlidersHorizontal,
  FileText
} from "lucide-react";
import * as d3 from "d3";
import {
  SiteConfig,
  GlobalSeoAgentReport,
  TargetMarketRegion,
  RegionalKeywordVariation,
  GeoMarketAnalysis,
  RegionalContentTranslationStrategy
} from "../../types";
import {
  DEFAULT_TARGET_MARKETS,
  generateFallbackGlobalSeoReport,
  createRegionalLandingPageFromKeyword,
  exportGlobalSeoKeywordsToCsv,
  exportGlobalSeoReportToJson,
  exportTranslationStrategyBriefToMarkdown
} from "../../utils/aiGlobalSeoEngine";

interface AiGlobalSeoAgentProps {
  config: SiteConfig;
  onChange: (newConfig: SiteConfig) => void;
  onPreview?: () => void;
  onNavigateToTab?: (tab: string) => void;
}

type GlobalSeoActiveView = "trends" | "keywords" | "translation" | "technical";

export const AiGlobalSeoAgent: React.FC<AiGlobalSeoAgentProps> = ({
  config,
  onChange,
  onPreview,
  onNavigateToTab
}) => {
  // Target markets state
  const [targetMarkets, setTargetMarkets] = useState<TargetMarketRegion[]>(() => DEFAULT_TARGET_MARKETS);

  const selectedMarketIds = useMemo(() => {
    return targetMarkets.filter((m) => m.selected).map((m) => m.id);
  }, [targetMarkets]);

  // Main active view
  const [activeView, setActiveView] = useState<GlobalSeoActiveView>("trends");

  // Filter for market category
  const [marketTierFilter, setMarketTierFilter] = useState<"all" | "domestic" | "international">("all");

  // State for AI analysis report
  const [report, setReport] = useState<GlobalSeoAgentReport>(() => {
    return generateFallbackGlobalSeoReport(config, ["tr-istanbul", "tr-ankara", "tr-izmir", "intl-de", "intl-uk"]);
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sourceType, setSourceType] = useState<string>("gemini_grounding");
  const [notification, setNotification] = useState<{ message: string; type: "success" | "info" } | null>(null);

  // Selected region in translation tab
  const [selectedTranslationRegionId, setSelectedTranslationRegionId] = useState<string>("intl-de");

  // Selected country in trends tab
  const [selectedTrendsCountryFilter, setSelectedTrendsCountryFilter] = useState<string>("all");

  // Table filters for keywords
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [selectedMarketFilter, setSelectedMarketFilter] = useState<string>("all");
  const [intentFilter, setIntentFilter] = useState<string>("all");
  const [trendFilter, setTrendFilter] = useState<string>("all");

  // SERP preview modal state
  const [activePreviewKeyword, setActivePreviewKeyword] = useState<RegionalKeywordVariation | null>(null);

  // Copied state indicator
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // D3 chart container ref
  const chartContainerRef = useRef<HTMLDivElement | null>(null);

  // Toggle market selection
  const toggleMarketSelection = (marketId: string) => {
    setTargetMarkets((prev) =>
      prev.map((m) => (m.id === marketId ? { ...m, selected: !m.selected } : m))
    );
  };

  const showToast = (message: string, type: "success" | "info" = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const copyToClipboard = (text: string, key: string, label = "Kopyalandı") => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(`${label}!`, "success");
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Run AI Global SEO Analysis with Google Search Grounding via server
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
        showToast("Gemini 3.8 Flash ve Search Grounding ile trendler güncellendi!", "success");
      }
    } catch (err: any) {
      console.error("AI Global SEO error:", err);
      // Fallback
      const fallback = generateFallbackGlobalSeoReport(config, selectedMarketIds);
      setReport(fallback);
      setSourceType("fallback_recovery");
      showToast("Analiz bölgesel arama motoru veritabanıyla oluşturuldu.", "info");
    } finally {
      setIsLoading(false);
    }
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

  // Active translation strategy
  const activeTranslationStrategy = useMemo(() => {
    const strategies = report.translationStrategies || [];
    const found = strategies.find((s) => s.regionId === selectedTranslationRegionId);
    return found || strategies[0] || null;
  }, [report.translationStrategies, selectedTranslationRegionId]);

  // D3 Chart: Multi-Market Comparative Visibility (Current vs Potential)
  useEffect(() => {
    if (activeView !== "trends") return;
    if (!chartContainerRef.current || !report.targetMarkets || report.targetMarkets.length === 0) {
      return;
    }

    const container = chartContainerRef.current;
    const width = container.clientWidth || 600;
    const height = 250;
    const margin = { top: 25, right: 30, bottom: 40, left: 130 };

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
      .padding(0.35);

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
          .attr("fill", "#64748b")
          .attr("font-size", "10px")
          .attr("dy", "12px")
      );

    // Y Axis
    g.append("g")
      .call(d3.axisLeft(yScale).tickSize(0))
      .call((group) => group.select(".domain").remove())
      .call((group) =>
        group
          .selectAll("text")
          .attr("fill", "#1e293b")
          .attr("font-size", "11px")
          .attr("font-weight", "600")
          .attr("dx", "-8px")
      );

    // Background bars (Potential Visibility)
    g.selectAll(".bar-potential")
      .data(markets)
      .enter()
      .append("rect")
      .attr("class", "bar-potential")
      .attr("y", (d: GeoMarketAnalysis) => yScale(d.marketName) || 0)
      .attr("x", 0)
      .attr("height", yScale.bandwidth())
      .attr("width", (d: GeoMarketAnalysis) => xScale(d.potentialVisibilityScore))
      .attr("rx", 6)
      .attr("fill", "#e0e7ff")
      .attr("opacity", 0.85);

    // Foreground bars (Current Visibility)
    g.selectAll(".bar-current")
      .data(markets)
      .enter()
      .append("rect")
      .attr("class", "bar-current")
      .attr("y", (d: GeoMarketAnalysis) => yScale(d.marketName) || 0)
      .attr("x", 0)
      .attr("height", yScale.bandwidth())
      .attr("width", (d: GeoMarketAnalysis) => xScale(d.currentVisibilityScore))
      .attr("rx", 6)
      .attr("fill", "#4f46e5");

    // Labels at the end of bars
    g.selectAll(".bar-label")
      .data(markets)
      .enter()
      .append("text")
      .attr("class", "bar-label")
      .attr("y", (d: GeoMarketAnalysis) => (yScale(d.marketName) || 0) + yScale.bandwidth() / 2 + 3.5)
      .attr("x", (d: GeoMarketAnalysis) => xScale(d.potentialVisibilityScore) + 8)
      .attr("fill", "#475569")
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .text((d: GeoMarketAnalysis) => `Mevcut: %${d.currentVisibilityScore} ➔ Hedef: %${d.potentialVisibilityScore}`);
  }, [report.targetMarkets, activeView]);

  return (
    <div id="ai-global-seo-agent-container" className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200 ${
            notification.type === "success"
              ? "bg-emerald-900 text-emerald-100 border-emerald-700 shadow-emerald-950/20"
              : "bg-slate-900 text-slate-100 border-slate-700 shadow-black/30"
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Hero Header Card */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 rounded-3xl p-6 sm:p-8 text-white border border-indigo-900/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                <Globe2 className="w-3.5 h-3.5" />
                Gemini 3.8 Flash & Search Grounding
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Çoklu Bölge & Canlı Trend Monitörü
              </span>
              <span className="px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-300 text-xs font-mono">
                {report.analyzedAt}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              AI Global SEO Agent
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              Google Arama trendlerini uluslararası pazarlarda gerçek zamanlı izleyin. Hedef ülkelere özel yerel dilde arama varyasyonları (Vernacular) ve kültürel içerik transcreation stratejileri geliştirin.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-300">
              <div className="flex items-center gap-1 bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-700/60">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span>Merkez: <strong>{config.city || "İstanbul"}, Türkiye</strong></span>
              </div>
              <div className="flex items-center gap-1 bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-700/60">
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sektör: <strong>{config.sector || "Web Tasarım & Yazılım"}</strong></span>
              </div>
              <div className="flex items-center gap-1 bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-700/60">
                <Target className="w-3.5 h-3.5 text-amber-400" />
                <span>Analiz Edilen Pazar: <strong>{report.totalMarketsAnalyzed} Bölge</strong></span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <button
              type="button"
              id="global-seo-refresh-btn"
              onClick={runAnalysis}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              <span>{isLoading ? "Trendler Taranıyor..." : "Uluslararası Trendleri Tara"}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                id="global-seo-export-csv-btn"
                onClick={() => exportGlobalSeoKeywordsToCsv(report)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
                title="Anahtar Kelimeleri CSV olarak indir"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>CSV</span>
              </button>

              <button
                type="button"
                id="global-seo-export-brief-btn"
                onClick={() => exportTranslationStrategyBriefToMarkdown(report)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
                title="Çeviri ve Transcreation Strateji Kılavuzunu İndir (.md)"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>Strateji (.md)</span>
              </button>

              <button
                type="button"
                id="global-seo-export-json-btn"
                onClick={() => exportGlobalSeoReportToJson(report)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
                title="Raporu JSON olarak indir"
              >
                <FileCode className="w-3.5 h-3.5 text-blue-400" />
                <span>JSON</span>
              </button>
            </div>
          </div>
        </div>

        {/* Global Reach Score Banner */}
        <div className="mt-6 pt-6 border-t border-indigo-900/50 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-800/40 p-3.5 rounded-2xl border border-slate-700/50">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Uluslararası Görünürlük Skoru
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-white">%{report.overallGlobalReachScore}</span>
              <span className="text-xs text-emerald-400 font-semibold">+%28 Potansiyel Büyüme</span>
            </div>
          </div>

          <div className="bg-slate-800/40 p-3.5 rounded-2xl border border-slate-700/50">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Lokalize Anahtar Kelime Hacmi
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-indigo-300">{report.regionalKeywords.length} Varyasyon</span>
              <span className="text-xs text-slate-400 font-medium">Yerel Nüanslı</span>
            </div>
          </div>

          <div className="bg-slate-800/40 p-3.5 rounded-2xl border border-slate-700/50">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Bölgesel Çeviri Stratejisi
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-amber-300">
                {(report.translationStrategies || []).length} Hedef Pazar
              </span>
              <span className="text-xs text-emerald-400 font-medium">Transcreation Hazır</span>
            </div>
          </div>
        </div>
      </div>

      {/* Target Market Selector Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-slate-800">Hedef Pazar Seçimi & Kapsamı</span>
            <span className="text-[11px] text-slate-500 font-normal">
              (Analiz etmek istediğiniz coğrafi pazarları seçin)
            </span>
          </div>

          {/* Tier filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMarketTierFilter("all")}
              className={`px-3 py-1 rounded-lg transition ${
                marketTierFilter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Tümü ({targetMarkets.length})
            </button>
            <button
              type="button"
              onClick={() => setMarketTierFilter("international")}
              className={`px-3 py-1 rounded-lg transition ${
                marketTierFilter === "international" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Uluslararası
            </button>
            <button
              type="button"
              onClick={() => setMarketTierFilter("domestic")}
              className={`px-3 py-1 rounded-lg transition ${
                marketTierFilter === "domestic" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Yurtiçi Metropoller
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {displayedMarkets.map((market) => (
            <button
              key={market.id}
              type="button"
              onClick={() => toggleMarketSelection(market.id)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all flex items-center gap-2 cursor-pointer ${
                market.selected
                  ? "bg-indigo-50 border-indigo-300 text-indigo-950 font-bold shadow-xs ring-1 ring-indigo-500/20"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span className="text-base leading-none">{market.flag}</span>
              <span>{market.name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/80 font-mono text-slate-500 border border-slate-200/60">
                {market.languageLabel}
              </span>
              {market.selected ? (
                <Check className="w-3.5 h-3.5 text-indigo-600 ml-0.5" />
              ) : (
                <span className="w-3.5 h-3.5 rounded-full border border-slate-300" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Feature Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          id="global-seo-tab-trends-btn"
          onClick={() => setActiveView("trends")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeView === "trends"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Uluslararası Arama Trendleri</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeView === "trends" ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-700"}`}>
            Canlı Monitör
          </span>
        </button>

        <button
          type="button"
          id="global-seo-tab-keywords-btn"
          onClick={() => setActiveView("keywords")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeView === "keywords"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Lokalize Anahtar Kelimeler (Vernacular)</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeView === "keywords" ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-700"}`}>
            {report.regionalKeywords.length}
          </span>
        </button>

        <button
          type="button"
          id="global-seo-tab-translation-btn"
          onClick={() => setActiveView("translation")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeView === "translation"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Languages className="w-4 h-4" />
          <span>İçerik Çeviri & Transcreation Stratejisi</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeView === "translation" ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-700"}`}>
            Bölgesel Rehber
          </span>
        </button>

        <button
          type="button"
          id="global-seo-tab-technical-btn"
          onClick={() => setActiveView("technical")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeView === "technical"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Hreflang & Çok Dilli Mimarisi</span>
        </button>
      </div>

      {/* VIEW 1: INTERNATIONAL SEARCH TRENDS */}
      {activeView === "trends" && (
        <div className="space-y-6">
          {/* Executive Strategic Summary Box */}
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-3xl p-6 text-slate-800">
            <div className="flex items-center gap-2 mb-2 font-bold text-indigo-950 text-sm">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Gemini 3.8 Flash Uluslararası Arama Trendleri Değerlendirmesi</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
              {report.executiveStrategicSummary}
            </p>
          </div>

          {/* D3 Comparative Visibility Chart Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Pazarlar Arası Görünürlük & Büyüme Potansiyeli
                </h2>
                <p className="text-xs text-slate-500">
                  D3.js ile hesaplanan mevcut organik pazar payı ve yerel optimizasyonla ulaşılabilecek potansiyel
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-indigo-600" />
                  <span className="text-slate-700 font-semibold">Mevcut Görünürlük</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-indigo-200" />
                  <span className="text-slate-500 font-medium">Hedef Potansiyel</span>
                </div>
              </div>
            </div>

            <div ref={chartContainerRef} className="w-full overflow-x-auto" />
          </div>

          {/* International Search Trends Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>Ülke Bazlı Yükselen Arama Sorguları & Nedenleri</span>
              </h3>
              <span className="text-xs text-slate-500">
                Google Search Grounding ile doğrulanmış veriler
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {report.targetMarkets.map((market) => (
                <div
                  key={market.marketId}
                  className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{market.flag}</span>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{market.marketName}</h4>
                          <span className="text-[11px] text-slate-500 font-mono">{market.searchEngine}</span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700">
                        {market.hreflangCode}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Yükselen Sorgular & Trend Sebebi
                      </span>
                      <div className="space-y-2.5">
                        {market.topTrends.map((trend, tIdx) => (
                          <div
                            key={tIdx}
                            className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-xs text-indigo-950">{trend.query}</span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                                {trend.volumeEstimate}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-snug">{trend.spikeReason}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Bölgesel Arama Alışkanlıkları
                      </span>
                      <ul className="space-y-1 text-xs text-slate-600">
                        {market.culturalSearchHabits.map((habit, hIdx) => (
                          <li key={hIdx} className="flex items-start gap-1.5">
                            <span className="text-indigo-600 font-bold">•</span>
                            <span>{habit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <div className="text-[11px] font-bold text-indigo-900 uppercase">Önerilen Aksiyon:</div>
                    <p className="text-xs text-slate-700 mt-0.5">{market.recommendedAction}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: LOCALIZED KEYWORD VARIATIONS (VERNACULAR TABLE) */}
      {activeView === "keywords" && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-indigo-50 text-indigo-600">
                  <Layers className="w-4 h-4" />
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  Lokalize Anahtar Kelime Varyasyonları & Arama Nüansları
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Hedef ülkelerdeki yerel konuşma dili, arama niyeti ve kültürel terim farklılıkları (Vernacular Colloquial)
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
                          <span>{kw.countryCode === "TR" ? "🇹🇷" : kw.countryCode === "DE" ? "🇩🇪" : kw.countryCode === "GB" ? "🇬🇧" : kw.countryCode === "US" ? "🇺🇸" : "🌐"}</span>
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
      )}

      {/* VIEW 3: REGIONAL CONTENT TRANSLATION & TRANSCREATION STRATEGY */}
      {activeView === "translation" && (
        <div className="space-y-6">
          {/* Region Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {(report.translationStrategies || []).map((strat) => (
              <button
                key={strat.regionId}
                type="button"
                onClick={() => setSelectedTranslationRegionId(strat.regionId)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedTranslationRegionId === strat.regionId
                    ? "bg-indigo-600 text-white shadow-md ring-2 ring-indigo-400/40"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span className="text-base">{strat.flag}</span>
                <span>{strat.regionName.split("(")[0].trim()}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  selectedTranslationRegionId === strat.regionId ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-600"
                }`}>
                  {strat.languageLabel.split(" ")[0]}
                </span>
              </button>
            ))}
          </div>

          {activeTranslationStrategy ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Main Strategy Playbook */}
              <div className="lg:col-span-2 space-y-6">
                {/* Transcreation Overview Card */}
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{activeTranslationStrategy.flag}</span>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">
                          {activeTranslationStrategy.regionName}
                        </h3>
                        <span className="text-xs text-slate-500 font-mono">
                          Hedef Dil: {activeTranslationStrategy.languageLabel}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Transcreation İhtiyacı</div>
                      <div className="flex items-center gap-1.5 justify-end">
                        <span className="text-lg font-black text-indigo-600">
                          %{activeTranslationStrategy.transcreationScore}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800">
                          Yüksek Kültürel Adaptasyon
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Guidance */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Transcreation & İçerik Uyarlama Rehberi</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {activeTranslationStrategy.transcreationGuidance}
                    </p>
                  </div>

                  {/* Tone and Formality */}
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Üslup, Hitap ve Resmiyet Profili (Tone of Voice)
                    </div>
                    <p className="text-xs font-semibold text-slate-900 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                      {activeTranslationStrategy.toneAndFormality}
                    </p>
                  </div>

                  {/* Buyer Psychology */}
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Bölgesel Alıcı Psikolojisi & Satın Alma Tereddütleri
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {activeTranslationStrategy.buyerPsychologyNotes}
                    </p>
                  </div>
                </div>

                {/* Localized CTAs Dictionary */}
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-emerald-600" />
                      <h4 className="font-bold text-slate-900 text-sm">
                        Lokalize Eylem Çağrıları (Call to Actions - CTAs)
                      </h4>
                    </div>
                    <span className="text-xs text-slate-400 font-normal">Kültürel dönüşüm optimize</span>
                  </div>

                  <div className="space-y-2.5">
                    {activeTranslationStrategy.localizedCtas.map((cta, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div>
                          <span className="text-[10px] font-bold uppercase text-slate-400">{cta.context}</span>
                          <div className="text-xs text-slate-500">TR: "{cta.turkishOriginal}"</div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-bold text-indigo-900 text-xs bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                            {cta.localizedVersion}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(cta.localizedVersion, `cta-${idx}`, "CTA Kopyalandı")}
                            className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 transition cursor-pointer"
                            title="Kopyala"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Do's and Don'ts */}
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                    <span>Bölgesel İçerik Kuralları (Yapılması ve Kaçınılması Gerekenler)</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/60">
                      <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Mutlaka Yapın (Dos)</span>
                      </span>
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        {activeTranslationStrategy.contentDosAndDonts.dos.map((d, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2 p-4 rounded-2xl bg-rose-50/50 border border-rose-200/60">
                      <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Kaçının (Don'ts)</span>
                      </span>
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        {activeTranslationStrategy.contentDosAndDonts.donts.map((d, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-rose-600 font-bold">•</span>
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Col: Trust Anchors & Hreflang Tag Card */}
              <div className="space-y-6">
                {/* Cultural Trust Anchors */}
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    <h4 className="font-bold text-slate-900 text-sm">
                      Kültürel Güven Unsurları (Trust Anchors)
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500">
                    Yerel alıcıların satın alma kararını teyit etmek için web sitesinde aradığı zorunlu rozet ve unsurlar:
                  </p>
                  <ul className="space-y-2.5">
                    {activeTranslationStrategy.culturalTrustAnchors.map((anchor, aIdx) => (
                      <li
                        key={aIdx}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs font-medium text-slate-800 flex items-start gap-2"
                      >
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{anchor}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Hreflang & URL Recommendation */}
                <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md space-y-4 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                      Hreflang & URL Mimarisi
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                      Google SERP
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-[11px] text-slate-400">Önerilen Hreflang Etiketi:</div>
                    <div className="p-2.5 rounded-xl bg-slate-950 font-mono text-[11px] text-emerald-400 break-all border border-slate-800">
                      {activeTranslationStrategy.recommendedHreflangTag}
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(activeTranslationStrategy.recommendedHreflangTag, "hreflang-tag", "Hreflang etiketi kopyalandı")}
                      className="w-full mt-1.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Etiketi Kopyala</span>
                    </button>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <div className="text-[11px] text-slate-400">Önerilen URL Deseni:</div>
                    <div className="p-2.5 rounded-xl bg-slate-950 font-mono text-xs text-indigo-300 border border-slate-800">
                      {activeTranslationStrategy.localizedUrlPattern}
                    </div>
                  </div>
                </div>

                {/* Quick Action: Download Brief */}
                <button
                  type="button"
                  onClick={() => exportTranslationStrategyBriefToMarkdown(report)}
                  className="w-full py-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>Tüm Çeviri Stratejisini İndir (.md)</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
              Bu bölge için çeviri stratejisi bulunamadı.
            </div>
          )}
        </div>
      )}

      {/* VIEW 4: TECHNICAL MULTILINGUAL & HREFLANG ARCHITECTURE */}
      {activeView === "technical" && (
        <div className="space-y-6">
          {/* Multilingual Technical Checklist */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Çok Dilli ve Bölgesel SEO Teknik Kontrol Listesi
                </h3>
                <p className="text-xs text-slate-500">
                  Google uluslararası dizine ekleme yönergelerine tam uyumluluk kontrolü
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.multilingualSeoChecklist.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-slate-900">{item.item}</div>
                    <div className="text-xs text-slate-600">{item.detail}</div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase shrink-0 ${
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

          {/* Hreflang Code Generator Preview */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md space-y-4 border border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-emerald-400" />
                <h4 className="font-bold text-sm text-white">
                  Otomatik Üretilen HTML Hreflang & Canonical Etiket Bloğu
                </h4>
              </div>
              <button
                type="button"
                onClick={() => {
                  const hreflangCode = report.targetMarkets.map(m => `  <link rel="alternate" hreflang="${m.hreflangCode}" href="https://${config.customDomain || "example.com"}/${m.language}/" />`).join("\n");
                  copyToClipboard(hreflangCode, "all-hreflangs", "Tüm Hreflang etiketleri kopyalandı");
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Bloğu Kopyala</span>
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Google botlarının sayfayı doğru ülkedeki kullanıcılara sunması için HTML &lt;head&gt; içine yerleştirilmeye hazır kod bloğu:
            </p>

            <pre className="p-4 rounded-2xl bg-slate-950 font-mono text-xs text-emerald-300 overflow-x-auto border border-slate-800 leading-relaxed">
              {`<!-- Global Anycast Multi-Regional SEO Hreflang Architecture -->\n<link rel="alternate" hreflang="x-default" href="https://${config.customDomain || "example.com"}/" />\n` +
                report.targetMarkets
                  .map((m) => `<link rel="alternate" hreflang="${m.hreflangCode}" href="https://${config.customDomain || "example.com"}/${m.language}/" />`)
                  .join("\n")}
            </pre>
          </div>
        </div>
      )}

      {/* SERP Preview Simulation Modal */}
      {activePreviewKeyword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Globe2 className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Google SERP Canlı Arama Önizlemesi ({activePreviewKeyword.targetMarketName})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActivePreviewKeyword(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Google Result Preview Box */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-600">
                  G
                </div>
                <span className="text-slate-800 font-medium">https://{config.customDomain || "hizliweb.com"}/{activePreviewKeyword.suggestedPageSlug}</span>
              </div>

              <div className="text-blue-700 hover:underline text-base sm:text-lg font-medium cursor-pointer leading-snug">
                {activePreviewKeyword.recommendedMetaTitle}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {activePreviewKeyword.recommendedMetaDescription}
              </p>
            </div>

            {/* Keyword Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Aylık Hacim</span>
                <div className="font-bold text-slate-900 mt-0.5">{activePreviewKeyword.searchVolumeDisplay}</div>
              </div>
              <div>
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Büyüme Trendi</span>
                <div className="font-bold text-emerald-600 mt-0.5">+{activePreviewKeyword.trendGrowthPercent}%</div>
              </div>
              <div>
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Arama Niyeti</span>
                <div className="font-bold text-slate-900 mt-0.5 uppercase">{activePreviewKeyword.searchIntent}</div>
              </div>
              <div>
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Zorluk</span>
                <div className="font-bold text-slate-900 mt-0.5">{activePreviewKeyword.competitionDifficulty}/100</div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActivePreviewKeyword(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Kapat
              </button>
              <button
                type="button"
                onClick={() => {
                  handleCreateLandingPage(activePreviewKeyword);
                  setActivePreviewKeyword(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition cursor-pointer"
              >
                Bu Başlıkla Sayfa Üret
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
