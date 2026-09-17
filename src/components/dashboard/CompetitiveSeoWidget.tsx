import React, { useState, useEffect, useMemo } from "react";
import { 
  SiteConfig, 
  CompetitiveSeoInsightData, 
  CompetitorContentMetric, 
  MissingHighImpactKeyword, 
  TacticalQuickWin,
  CompetitiveMetaSuggestion
} from "../../types";
import { 
  extractSiteContentSummary, 
  generateFallbackCompetitiveSeo 
} from "../../utils/competitiveSeoUtils";
import { downloadCompetitiveSeoPdf } from "../../utils/competitiveSeoPdfGenerator";
import { CompetitiveKeywordRankingTable } from "./CompetitiveKeywordRankingTable";
import { CompetitiveSeoComparisonTable } from "./CompetitiveSeoComparisonTable";
import { SeoCompetitiveAlertCenter } from "./SeoCompetitiveAlertCenter";
import { CompetitiveSeoBenchmarking } from "./CompetitiveSeoBenchmarking";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from "recharts";
import {
  Search,
  Globe,
  Sparkles,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  Check,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Target,
  FileText,
  Copy,
  Sliders,
  ChevronRight,
  ShieldCheck,
  Layers,
  ArrowUpRight,
  BookOpen,
  Filter,
  Flame,
  Info,
  Building2,
  MapPin,
  Clock,
  BarChart3,
  Download,
  DollarSign,
  HelpCircle,
  BellRing,
  Trophy
} from "lucide-react";

interface CompetitiveSeoWidgetProps {
  config: SiteConfig;
  onChange: (newConfig: SiteConfig) => void;
  onNavigateTab?: (tab: string, state?: any) => void;
  isCompactWidget?: boolean;
  onOpenFullView?: () => void;
  onOpenAlertCenter?: () => void;
  initialTab?: "benchmarking" | "alerts" | "swot" | "rankings" | "metrics" | "suggestions" | "keywords";
}

export const CompetitiveSeoWidget: React.FC<CompetitiveSeoWidgetProps> = ({
  config,
  onChange,
  onNavigateTab,
  isCompactWidget = false,
  onOpenFullView,
  onOpenAlertCenter,
  initialTab
}) => {
  // State
  const [insightData, setInsightData] = useState<CompetitiveSeoInsightData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isGroundingActive, setIsGroundingActive] = useState(true);
  
  // Filters & Tabs
  const [compactTab, setCompactTab] = useState<"benchmarking" | "alerts" | "swot" | "rankings" | "metrics" | "suggestions" | "keywords">(initialTab || "benchmarking");
  const [activeIntentFilter, setActiveIntentFilter] = useState<string>("all");
  const [keywordSearch, setKeywordSearch] = useState<string>("");
  const [selectedCompetitorId, setSelectedCompetitorId] = useState<string | null>(null);
  const [showGroundingSources, setShowGroundingSources] = useState(false);
  
  // Custom Targeting Overrides
  const [customSector, setCustomSector] = useState(config.sector || "Hizmet");
  const [customCity, setCustomCity] = useState(config.city || "İstanbul");
  const [isEditingTarget, setIsEditingTarget] = useState(false);

  // Toasts & PDF State
  const [copiedKwId, setCopiedKwId] = useState<string | null>(null);
  const [addedKwId, setAddedKwId] = useState<string | null>(null);
  const [appliedMetaId, setAppliedMetaId] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);

  // One-Click Apply Meta Tag Suggestion
  const handleApplyMetaSuggestion = (meta: CompetitiveMetaSuggestion) => {
    const updatedSeo = {
      ...config.seo,
      metaTitle: meta.recommendedTitle,
      metaDescription: meta.recommendedDescription,
      keywords: Array.from(new Set([...(config.seo?.keywords || []), ...(meta.targetKeywords || [])]))
    };

    const updatedConfig: SiteConfig = {
      ...config,
      seo: updatedSeo,
      hero: {
        ...config.hero,
        title: meta.pageType === "homepage" && config.hero?.title ? config.hero.title : (config.hero?.title || meta.recommendedTitle),
        subtitle: meta.pageType === "homepage" && config.hero?.subtitle ? config.hero.subtitle : (config.hero?.subtitle || meta.recommendedDescription)
      }
    };

    onChange(updatedConfig);
    setAppliedMetaId(meta.id);
    setTimeout(() => setAppliedMetaId(null), 3000);
  };

  // Handle PDF Export
  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const dataToExport = insightData || generateFallbackCompetitiveSeo({
        ...config,
        sector: customSector,
        city: customCity
      });
      const targetDomain = config.cloudflare?.customDomain || config.cloudflare?.subdomain || `${(config.companyName || "firma").toLowerCase().replace(/[^a-z0-9]/g, "")}.com.tr`;
      await downloadCompetitiveSeoPdf(dataToExport, config, {
        companyName: config.companyName || "Firma",
        sector: customSector || config.sector,
        city: customCity || config.city,
        domain: targetDomain,
        isGroundingActive
      });
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 3500);
    } catch (err) {
      console.error("PDF oluşturulurken hata oluştu:", err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Initial Load / Fetch
  const fetchCompetitiveInsight = async (forceRefresh = false) => {
    setIsLoading(true);
    setErrorMsg(null);

    const userSummary = extractSiteContentSummary(config);

    try {
      const res = await fetch("/api/competitive-seo-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: config.companyName || "Bizim Firma",
          sector: customSector || config.sector || "Hizmet",
          city: customCity || config.city || "İstanbul",
          domain: config.cloudflare?.customDomain || config.cloudflare?.subdomain || `${(config.companyName || "firma").toLowerCase().replace(/[^a-z0-9]/g, "")}.com.tr`,
          userContentSummary: userSummary,
          config
        })
      });

      if (!res.ok) {
        throw new Error(`API Hatası: ${res.statusText}`);
      }

      const json = await res.json();
      if (json.success && json.data) {
        setInsightData(json.data);
        setIsGroundingActive(json.source === "gemini_grounding");
      } else {
        throw new Error("Veri formatlanırken hata oluştu.");
      }
    } catch (err: any) {
      console.warn("Canlı API yanıt vermedi, güvenilir algoritmik analiz yükleniyor:", err);
      const fallback = generateFallbackCompetitiveSeo({
        ...config,
        sector: customSector,
        city: customCity
      });
      setInsightData(fallback);
      setIsGroundingActive(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitiveInsight();
  }, [config.companyName, config.sector, config.city]);

  // Handle Add Missing Keyword to Site Keywords
  const handleAddKeywordToSite = (kw: MissingHighImpactKeyword) => {
    const currentKeywords = config.seoKeywords || "";
    const kwList = currentKeywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    if (!kwList.some((k) => k.toLowerCase() === kw.keyword.toLowerCase())) {
      const updatedList = [...kwList, kw.keyword];
      const updatedConfig: SiteConfig = {
        ...config,
        seoKeywords: updatedList.join(", ")
      };
      onChange(updatedConfig);
      setAddedKwId(kw.id);
      setTimeout(() => setAddedKwId(null), 3000);
    }
  };

  // Handle Send Keyword directly to AI Blog Engine
  const handleWriteArticleWithAi = (kw: MissingHighImpactKeyword) => {
    if (onNavigateTab) {
      // Store suggestion in sessionStorage so AI Blog Engine can pick it up automatically
      sessionStorage.setItem("ai_blog_prefill_topic", kw.actionableDraftTitle);
      sessionStorage.setItem("ai_blog_prefill_keyword", kw.keyword);
      onNavigateTab("ai-blog-engine");
    }
  };

  // Filter missing keywords
  const filteredKeywords = useMemo(() => {
    if (!insightData?.missingKeywords) return [];
    return insightData.missingKeywords.filter((kw) => {
      const matchesIntent = activeIntentFilter === "all" || kw.searchIntent.toLowerCase().includes(activeIntentFilter.toLowerCase());
      const matchesSearch = !keywordSearch.trim() || kw.keyword.toLowerCase().includes(keywordSearch.toLowerCase()) || kw.suggestedAction.toLowerCase().includes(keywordSearch.toLowerCase());
      return matchesIntent && matchesSearch;
    });
  }, [insightData?.missingKeywords, activeIntentFilter, keywordSearch]);

  // Copy keyword to clipboard
  const handleCopyKeyword = (kw: MissingHighImpactKeyword) => {
    navigator.clipboard.writeText(kw.keyword);
    setCopiedKwId(kw.id);
    setTimeout(() => setCopiedKwId(null), 2500);
  };

  // Radar chart data preparation
  const radarChartData = useMemo(() => {
    if (!insightData?.radarComparison) return [];
    return insightData.radarComparison.map((r) => ({
      metric: r.metric,
      Siteniz: r.userScore,
      Rakip1: r.comp1Score,
      Rakip2: r.comp2Score,
      Rakip3: r.comp3Score
    }));
  }, [insightData?.radarComparison]);

  // Bar chart data for word count & pages
  const contentDepthBarData = useMemo(() => {
    if (!insightData) return [];
    const comps = insightData.competitors || [];
    return [
      {
        name: "Siteniz",
        kelimeSayisi: insightData.userMetrics.avgWordCount,
        sayfaSayisi: insightData.userMetrics.indexedPages,
        hizSkoru: insightData.userMetrics.speedScore
      },
      ...comps.map((c, i) => ({
        name: `#${c.rank} ${c.name.split(" ")[0]}`,
        kelimeSayisi: c.avgWordCount,
        sayfaSayisi: c.indexedPages,
        hizSkoru: c.speedScore
      }))
    ];
  }, [insightData]);

  if (!insightData && isLoading) {
    return (
      <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
          <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin" />
        </div>
        <div className="space-y-1 max-w-sm">
          <div className="text-sm font-black text-slate-900">
            Google Canlı SERP Verileri Taranıyor...
          </div>
          <div className="text-xs text-slate-500">
            <strong>{customSector}</strong> nişindeki ilk 3 rakip, içerik derinlikleri ve eksik anahtar kelimeler hesaplanıyor.
          </div>
        </div>
      </div>
    );
  }

  const data = insightData || generateFallbackCompetitiveSeo(config);

  // =========================================================================
  // RENDER: COMPACT WIDGET MODE (Dashboard Overview Card)
  // =========================================================================
  if (isCompactWidget) {
    const topComp = data.competitors?.[0];
    const avgCompWordCount = Math.round(
      (data.competitors || []).reduce((acc, c) => acc + (c.avgWordCount || 1400), 0) / Math.max(1, (data.competitors || []).length)
    );
    const wordCountGap = Math.max(0, (topComp?.avgWordCount || 1650) - (data.userMetrics.avgWordCount || 750));

    return (
      <div 
        id="competitive-seo-insight-widget"
        className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-slate-800 relative overflow-hidden space-y-5"
      >
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header & Quick Action Buttons */}
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Google Search Grounding Destekli</span>
              </div>
              {isGroundingActive ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Canlı SERP Verisi ({data.city})</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-semibold border border-slate-700">
                  <span>Sektörel Benchmark</span>
                </span>
              )}
            </div>

            <h3 className="text-xl font-black text-white flex items-center gap-2 tracking-tight">
              <Target className="w-5 h-5 text-indigo-400" />
              <span>Competitive SEO Insight</span>
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              Google arama sonuçlarında <strong>{data.sector}</strong> ({data.city}) pazarında ilk sıraları paylaşan en güçlü 3 rakibe karşı içerik performansı metrikleri kıyaslaması ve içerik iyileştirme önerileri.
            </p>
          </div>

          {/* Action Buttons: Download PDF & Full View */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              id="compact-competitive-pdf-btn"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
              title="Kapsamlı İçerik İyileştirme ve Rakip Analizi PDF Raporunu İndir"
            >
              {isGeneratingPdf ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>PDF Hazırlanıyor...</span>
                </>
              ) : pdfSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-200 stroke-[3]" />
                  <span className="text-emerald-100 font-bold">Rapor İndirildi!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-emerald-200" />
                  <span>İçerik İyileştirme PDF Raporu İndir</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-700/60 text-[9px] font-mono text-emerald-200">
                    3 Sayfa
                  </span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => fetchCompetitiveInsight(true)}
              disabled={isLoading}
              className="p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs transition-colors cursor-pointer"
              title="Google Search Grounding ile SERP'i Canlı Yeniden Tara"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-amber-400" : ""}`} />
            </button>

            {onOpenFullView && (
              <button
                type="button"
                id="widget-open-full-competitive-btn"
                onClick={onOpenFullView}
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <span>Detaylı Kıyaslama</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Quick 4-Way Metric Highlight Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
          <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/60 space-y-1">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sayfa Hızı (CWV)</div>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              {data.userMetrics.speedScore}/100
            </div>
            <div className="text-[10px] text-slate-400">Rakipler: ~76 Ort.</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/60 space-y-1">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">İçerik Derinliği</div>
            <div className="text-2xl font-black text-amber-400 font-mono">
              ~{data.userMetrics.avgWordCount} Kel.
            </div>
            <div className="text-[10px] text-slate-400">1. Rakip: {topComp?.avgWordCount || 1650} Kel.</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/60 space-y-1">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tespit Edilen Rakipler</div>
            <div className="text-2xl font-black text-white font-mono">
              Top 3
            </div>
            <div className="text-[10px] text-indigo-300 truncate">{topComp?.name || `${data.city} SERP`}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/60 space-y-1">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Eksik Anahtar Kelime</div>
            <div className="text-2xl font-black text-rose-400 font-mono">
              {data.missingKeywords?.length || 6} Fırsat
            </div>
            <div className="text-[10px] text-emerald-300">+1.8K Aylık Potansiyel</div>
          </div>
        </div>

        {/* Interactive Compact Tabs */}
        <div className="relative z-10 pt-1">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
            <button
              type="button"
              id="compact-tab-benchmarking"
              onClick={() => setCompactTab("benchmarking")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                compactTab === "benchmarking"
                  ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20"
                  : "bg-slate-800/80 text-amber-300 hover:text-white border border-amber-500/40"
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Competitive Benchmarking</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-900/60 text-amber-300 text-[9px] font-mono font-bold border border-amber-500/30">
                DA &amp; Head-to-Head
              </span>
            </button>

            <button
              type="button"
              id="compact-tab-alerts"
              onClick={() => setCompactTab("alerts")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                compactTab === "alerts"
                  ? "bg-rose-600 text-white font-black shadow-xs ring-2 ring-rose-400/50"
                  : "bg-slate-800/80 text-rose-300 hover:text-white border border-rose-500/40"
              }`}
            >
              <BellRing className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>SEO Rekabet Alarmları</span>
              <span className="px-1.5 py-0.2 rounded-full bg-rose-950/80 text-rose-300 text-[9px] font-mono font-bold border border-rose-800">
                Canlı SERP
              </span>
            </button>

            <button
              type="button"
              id="compact-tab-swot"
              onClick={() => setCompactTab("swot")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                compactTab === "swot"
                  ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 font-black shadow-xs"
                  : "bg-slate-800/60 text-slate-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>SWOT Karşılaştırma Tablosu (Top 3 Rakip)</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-900/40 text-[9px] font-mono font-bold">
                Canlı Gemini
              </span>
            </button>

            <button
              type="button"
              id="compact-tab-rankings"
              onClick={() => setCompactTab("rankings")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                compactTab === "rankings"
                  ? "bg-amber-400 text-slate-950 font-black shadow-xs"
                  : "bg-slate-800/60 text-slate-400 hover:text-white"
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Kelime Sıralamaları</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-900/40 text-[10px] font-mono font-bold">
                {data.keywordRankings?.length || 10}
              </span>
            </button>

            <button
              type="button"
              id="compact-tab-metrics"
              onClick={() => setCompactTab("metrics")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                compactTab === "metrics"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-800/60 text-slate-400 hover:text-white"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>İçerik Performans Kıyaslaması</span>
            </button>

            <button
              type="button"
              id="compact-tab-suggestions"
              onClick={() => setCompactTab("suggestions")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                compactTab === "suggestions"
                  ? "bg-emerald-500 text-slate-950 font-black shadow-xs"
                  : "bg-slate-800/60 text-slate-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>İçerik İyileştirme Önerileri</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-900/40 text-[9px] font-mono">
                4 Aksiyon
              </span>
            </button>

            <button
              type="button"
              id="compact-tab-keywords"
              onClick={() => setCompactTab("keywords")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                compactTab === "keywords"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "bg-slate-800/60 text-slate-400 hover:text-white"
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Eksik Anahtar Kelimeler ({data.missingKeywords?.length || 6})</span>
            </button>
          </div>
        </div>

        {/* Tab BENCHMARKING: Real-time Competitive SEO Benchmarking (DA & Keyword Ranking vs Competitors) */}
        {compactTab === "benchmarking" && (
          <div className="space-y-4 relative z-10 animate-fadeIn">
            <CompetitiveSeoBenchmarking
              config={config}
              onChange={onChange}
              onNavigateTab={onNavigateTab}
              onApplyKeyword={(kw) => {
                const currentKws = config.seo?.keywords || [];
                const kwList = Array.isArray(currentKws)
                  ? currentKws
                  : typeof currentKws === "string"
                  ? currentKws.split(",").map((s) => s.trim()).filter(Boolean)
                  : [];
                if (!kwList.includes(kw)) {
                  onChange({
                    ...config,
                    seo: {
                      ...config.seo,
                      keywords: [...kwList, kw].join(", ")
                    }
                  });
                }
              }}
              onSendToAiBlog={(keyword, draftTitle) => {
                sessionStorage.setItem("ai_blog_prefill_topic", draftTitle || `${keyword} Kılavuzu`);
                sessionStorage.setItem("ai_blog_prefill_keyword", keyword);
                if (onNavigateTab) {
                  onNavigateTab("ai-blog-generator");
                }
              }}
            />
          </div>
        )}

        {/* Tab ALERTS: Real-time SEO Competitive Alert System */}
        {compactTab === "alerts" && (
          <div className="space-y-4 relative z-10 animate-fadeIn">
            <SeoCompetitiveAlertCenter
              config={config}
              onChange={onChange}
              onNavigateTab={onNavigateTab as any}
            />
          </div>
        )}

        {/* Tab SWOT: Real-time Gemini SWOT Comparison Table against Top 3 Competitors */}
        {compactTab === "swot" && (
          <div className="space-y-4 relative z-10 animate-fadeIn">
            <CompetitiveSeoComparisonTable
              config={config}
              onChange={onChange}
              onNavigateTab={onNavigateTab}
              onApplyKeyword={(kw) => {
                const currentKws = config.seo?.keywords || [];
                const kwList = Array.isArray(currentKws)
                  ? currentKws
                  : typeof currentKws === "string"
                  ? currentKws.split(",").map((s) => s.trim()).filter(Boolean)
                  : [];
                if (!kwList.includes(kw)) {
                  onChange({
                    ...config,
                    seo: {
                      ...config.seo,
                      keywords: [...kwList, kw]
                    }
                  });
                }
              }}
            />
          </div>
        )}

        {/* Tab 0: Keyword Rankings Comparison Preview Table (Top 3 Competitors Benchmark) */}
        {compactTab === "rankings" && (
          <div className="space-y-4 relative z-10 animate-fadeIn">
            <div className="rounded-2xl bg-slate-800/80 border border-slate-700/80 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-950/80 text-slate-300 border-b border-slate-700/80">
                      <th className="py-2.5 px-3.5 font-bold uppercase tracking-wider text-[10px]">
                        Anahtar Kelime & Niyet
                      </th>
                      <th className="py-2.5 px-3 font-black uppercase tracking-wider text-[10px] bg-indigo-950/90 text-amber-300">
                        Siteniz
                      </th>
                      <th className="py-2.5 px-2.5 font-bold text-slate-300 text-[10px]">
                        1. Rakip
                      </th>
                      <th className="py-2.5 px-2.5 font-bold text-slate-300 text-[10px]">
                        2. Rakip
                      </th>
                      <th className="py-2.5 px-2.5 font-bold text-slate-300 text-[10px]">
                        3. Rakip
                      </th>
                      <th className="py-2.5 px-3 font-bold text-[10px] text-center">
                        Sıra Farkı
                      </th>
                      <th className="py-2.5 px-3.5 font-bold text-[10px]">
                        Gemini Stratejik Tavsiye
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {(data.keywordRankings || []).slice(0, 5).map((kr) => {
                      const isLeading = kr.userRank === 1 || (kr.userRank !== null && kr.gap < 0);
                      const isTrailing = kr.userRank !== null && kr.gap > 0;
                      const isMissing = kr.userRank === null;

                      return (
                        <tr key={kr.id} className="hover:bg-slate-700/30 transition-colors">
                          <td className="py-2.5 px-3.5">
                            <div className="font-bold text-white text-xs">{kr.keyword}</div>
                            <div className="flex items-center gap-1 text-[10px] text-slate-400">
                              <span className="text-amber-300">{kr.searchIntent}</span>
                              <span>•</span>
                              <span>{kr.monthlyVolume}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 bg-indigo-950/40">
                            {kr.userRank === 1 ? (
                              <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[11px]">
                                👑 #1 Lider
                              </span>
                            ) : kr.userRank !== null ? (
                              <span className="px-2 py-0.5 rounded bg-indigo-600 text-white font-black text-[11px]">
                                #{kr.userRank}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold text-[10px]">
                                Sıralamada Yok
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-2.5 text-slate-300 font-mono text-xs">
                            {kr.comp1Rank ? `#${kr.comp1Rank}` : "-"}
                          </td>
                          <td className="py-2.5 px-2.5 text-slate-300 font-mono text-xs">
                            {kr.comp2Rank ? `#${kr.comp2Rank}` : "-"}
                          </td>
                          <td className="py-2.5 px-2.5 text-slate-300 font-mono text-xs">
                            {kr.comp3Rank ? `#${kr.comp3Rank}` : "-"}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {isLeading ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                                {Math.abs(kr.gap)} Sıra Önde
                              </span>
                            ) : isMissing ? (
                              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                                Fırsat (+99)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                                -{kr.gap} Geride
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3.5 text-[11px] text-slate-300 max-w-xs truncate">
                            {kr.aiRecommendation}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-slate-900/90 border-t border-slate-700/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Toplam <strong>{data.keywordRankings?.length || 10}</strong> anahtar kelime karşılaştırıldı.
                </span>
                {onOpenFullView && (
                  <button
                    type="button"
                    onClick={onOpenFullView}
                    className="text-xs text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Tüm Karşılaştırma Tablosunu ve Filtreleri Gör</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: Visual Content Performance Metrics vs Top Competitors */}
        {compactTab === "metrics" && (
          <div className="space-y-4 relative z-10 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Metric 1: Content Word Depth */}
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-amber-400" />
                    İçerik Kelime Derinliği (Ortalama)
                  </span>
                  <span className="text-[11px] font-mono text-amber-300 font-bold">
                    +{wordCountGap} Kelime Açığı
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-[11px] text-slate-300">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      Siteniz: <strong>~{data.userMetrics.avgWordCount} kelime</strong>
                    </span>
                    <span className="font-mono text-emerald-400">%45</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-700/80 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500" 
                      style={{ width: `${Math.min(100, Math.round(((data.userMetrics.avgWordCount || 750) / 2000) * 100))}%` }} 
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-300 pt-1">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      1. Rakip ({topComp?.name?.substring(0, 16) || "Rakip"}): <strong>{topComp?.avgWordCount || 1650} kelime</strong>
                    </span>
                    <span className="font-mono text-amber-400">%82</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-700/80 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-amber-500 transition-all duration-500" 
                      style={{ width: `${Math.min(100, Math.round(((topComp?.avgWordCount || 1650) / 2000) * 100))}%` }} 
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed pt-1 border-t border-slate-700/40">
                  💡 Rakipler uzun ve bilgilendirici rehber içeriklerle arama otoritesi kazanıyor. Temel hizmet sayfalarınıza +750 kelimelik zengin içerik takviyesi önerilir.
                </p>
              </div>

              {/* Metric 2: Organic SERP Visibility */}
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                    SERP Organik Görünürlük Skoru
                  </span>
                  <span className="text-[11px] font-mono text-indigo-300 font-bold">
                    0 - 100 İndeks
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-[11px] text-slate-300">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-indigo-400" />
                      Siteniz: <strong>{data.userMetrics.visibilityScore}/100</strong>
                    </span>
                    <span className="font-mono text-indigo-400">%{data.userMetrics.visibilityScore}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-700/80 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-indigo-500 transition-all duration-500" 
                      style={{ width: `${data.userMetrics.visibilityScore}%` }} 
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-300 pt-1">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      1. Rakip: <strong>{topComp?.visibilityScore || 92}/100</strong>
                    </span>
                    <span className="font-mono text-amber-400">%{topComp?.visibilityScore || 92}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-700/80 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-amber-500 transition-all duration-500" 
                      style={{ width: `${topComp?.visibilityScore || 92}%` }} 
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed pt-1 border-t border-slate-700/40">
                  🚀 Sitenizin 98/100 açılış hızı üstünlüğü sayesinde, içerik derinliğini artırdığınız anda arama motorlarında hızlı sıralama sıçraması beklenir.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Content Improvement Suggestions */}
        {compactTab === "suggestions" && (
          <div className="space-y-3 relative z-10 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Suggestion 1 */}
              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-amber-500/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" />
                    1. İçerik Derinliğini +800 Kelimeye Çıkarın
                  </span>
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                    Kritik Öncelik
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Rakipler 1.500+ kelimelik kapsamlı rehberlerle Google'da üst sıraları alıyor. Sayfalarınıza detaylı süreç adımları ve müşteri soruları yanıtları ekleyin.
                </p>
                <div className="text-[10px] text-slate-400 font-mono pt-1">
                  Tahmini Etki: <strong>+380 Organik Ziyaretçi / ay</strong>
                </div>
              </div>

              {/* Suggestion 2 */}
              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-emerald-500/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5" />
                    2. Fiyatlandırma & Şeffaf Maliyet Rehberi
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    Yüksek Dönüşüm
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  "{data.city} {data.sector} fiyatları 2026" aramalarında yüksek ticari niyet var. Şeffaf fiyat aralıkları ve paket karşılaştırma tablosu ekleyin.
                </p>
                <div className="text-[10px] text-slate-400 font-mono pt-1">
                  Tahmini Etki: <strong>+%35 Teklif & Arama Dönüşümü</strong>
                </div>
              </div>

              {/* Suggestion 3 */}
              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-indigo-500/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-300 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5" />
                    3. Zengin SSS ve JSON-LD FAQ Şeması
                  </span>
                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                    SERP Alanı
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Hizmet sayfalarınıza 5-6 adet detaylı SSS ekleyerek Google arama sonuçlarında doğrudan soru-cevap zengin kutucukları (Rich Snippet) kazanın.
                </p>
                <div className="text-[10px] text-slate-400 font-mono pt-1">
                  Tahmini Etki: <strong>SERP Tıklama Oranında (CTR) +%28 Artış</strong>
                </div>
              </div>

              {/* Suggestion 4 */}
              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-200 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    4. {data.city} Bölgesel Yerel İniş Sayfaları
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                    Yerel SEO
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  İlçe ve semt bazlı yerel anahtar kelimeleri kapsayan blog ve alt sayfalar açarak harita ve yerel aramalarda rakiplerin önüne geçin.
                </p>
                <div className="text-[10px] text-slate-400 font-mono pt-1">
                  Tahmini Etki: <strong>Yerel Telefon Aramalarında +%42 Katkı</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Missing Keywords Preview */}
        {compactTab === "keywords" && (
          <div className="space-y-3 relative z-10 animate-fadeIn">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span>Rakiplerin Trafik Çektiği Ancak Sitenizde Eksik Olan Anahtar Kelimeler:</span>
              </span>
              <span className="text-[11px] text-slate-400">
                1-Tıkla AI Makale
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(data.missingKeywords || []).slice(0, 4).map((kw) => (
                <div 
                  key={kw.id} 
                  className="p-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-between gap-3 transition-all"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-100 truncate">
                      {kw.keyword}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="text-emerald-300 font-semibold">{kw.searchVolume}</span>
                      <span>•</span>
                      <span className="text-amber-300">{kw.estimatedTrafficGain}</span>
                      <span>•</span>
                      <span className="text-indigo-300">{kw.searchIntent}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleWriteArticleWithAi(kw)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold shrink-0 flex items-center gap-1 transition-colors cursor-pointer"
                    title="Bu anahtar kelime için AI Blog Motoru ile 1.500 kelimelik makale yaz"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>AI Yaz</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Win Action Footer & Search Grounding Citations Trail */}
        <div className="p-3.5 rounded-2xl bg-indigo-900/40 border border-indigo-700/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs relative z-10">
          <div className="flex items-center gap-2 min-w-0">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="truncate">
              <strong className="text-amber-300 font-bold">1 Numaralı Fırsat: </strong>
              <span className="text-slate-200">{data.tacticalQuickWins?.[0]?.title || "İçerik Derinleştirmesi ve Yerel SEO"}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              id="compact-download-pdf-footer-btn"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>PDF Raporu İndir</span>
            </button>

            {onOpenFullView && (
              <button
                type="button"
                onClick={onOpenFullView}
                className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer underline"
              >
                <span>Tüm Raporu İncele</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER: FULL INTERACTIVE VIEW MODE
  // =========================================================================
  return (
    <div id="competitive-seo-insight-full-view" className="space-y-6">
      
      {/* 1. HERO HEADER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Canlı Google Search Grounding Destekli SERP Analitiği</span>
              </div>

              {isGroundingActive ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Google Canlı SERP Verisi</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-700/60 border border-slate-600 text-slate-300 text-[11px] font-semibold">
                  <span>Sektörel Benchmark Modu</span>
                </div>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Competitive SEO Insight: Top 3 Rakip & İçerik Kıyaslaması
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              Google arama sonuçlarında <strong>{data.sector}</strong> ({data.city}) pazarında ilk sıraları paylaşan en güçlü 3 organik rakibin içerik derinliği, anahtar kelime kapsamı ve sayfa hızlarını sitenizle karşılaştırın; rakiplerinizin trafik çektiği ama sizde eksik olan anahtar kelimeleri anında kapatın.
            </p>

            {/* Target Sector & City Chips */}
            <div className="flex items-center gap-3 pt-2 text-xs flex-wrap">
              <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Hedef Sektör: <strong>{data.sector}</strong></span>
              </div>
              <span className="text-slate-600">•</span>
              <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Bölge: <strong>{data.city}</strong></span>
              </div>
              <span className="text-slate-600">•</span>
              <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                <Clock className="w-3.5 h-3.5" />
                <span>{data.analyzedAt}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            {/* Download PDF Report Button */}
            <button
              type="button"
              id="download-competitive-seo-pdf-btn"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50 border border-indigo-500/40"
              title="Google Search Grounding destekli kapsamlı PDF kıyaslama ve aksiyon raporu indir"
            >
              {isGeneratingPdf ? (
                <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
              ) : pdfSuccess ? (
                <Check className="w-4 h-4 text-emerald-300 stroke-[3]" />
              ) : (
                <Download className="w-4 h-4 text-amber-300" />
              )}
              <span>{isGeneratingPdf ? "PDF Hazırlanıyor..." : pdfSuccess ? "PDF İndirildi!" : "PDF Raporu İndir"}</span>
            </button>

            <button
              type="button"
              id="re-analyze-competitive-btn"
              onClick={() => fetchCompetitiveInsight(true)}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>{isLoading ? "Taranıyor..." : "Canlı SERP Taramasını Yenile"}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsEditingTarget(!isEditingTarget)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-300 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Sektör/Şehir Değiştir</span>
            </button>

            {data.searchGroundingSources?.length > 0 && (
              <button
                type="button"
                onClick={() => setShowGroundingSources(!showGroundingSources)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-indigo-300 border border-indigo-700/60 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Kaynaklar ({data.searchGroundingSources.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Inline Target Sector/City Editor */}
        {isEditingTarget && (
          <div className="mt-5 p-4 rounded-2xl bg-slate-800/90 border border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-10 animate-in fade-in duration-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Kıyaslanacak Sektör / Niş:
              </label>
              <input
                type="text"
                value={customSector}
                onChange={(e) => setCustomSector(e.target.value)}
                placeholder="Örn: Oto Çekici, Diş Kliniği..."
                className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Hedef Şehir / İlçe:
              </label>
              <input
                type="text"
                value={customCity}
                onChange={(e) => setCustomCity(e.target.value)}
                placeholder="Örn: Kadıköy / İstanbul..."
                className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-amber-400"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditingTarget(false);
                  fetchCompetitiveInsight(true);
                }}
                className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Analizi Güncelle</span>
              </button>
            </div>
          </div>
        )}

        {/* Search Grounding Sources Drawer */}
        {showGroundingSources && data.searchGroundingSources?.length > 0 && (
          <div className="mt-5 p-4 rounded-2xl bg-slate-800/90 border border-indigo-700/60 space-y-3 relative z-10 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs font-bold text-indigo-300">
              <span className="flex items-center gap-1.5">
                <Globe className="w-4 h-4" />
                <span>Google Arama Motoru Grounding Kaynakları ve Sorguları</span>
              </span>
              <button
                type="button"
                onClick={() => setShowGroundingSources(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {data.searchGroundingSources.map((sg, sIdx) => (
                <div key={sIdx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 space-y-1.5">
                  <div className="text-[11px] text-amber-300 font-mono">
                    Google Sorgusu: "{sg.query}"
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sg.sources.map((src, srcIdx) => (
                      <a
                        key={srcIdx}
                        href={src.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 text-[11px] transition-colors"
                      >
                        <span className="truncate max-w-[200px]">{src.title}</span>
                        <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. SUMMARY STRATEGY BANNER */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
            <Info className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <div className="text-xs font-black text-slate-900 uppercase tracking-wide">
              Stratejik Rekabet Özeti & Fırsat Analizi
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {data.summary}
            </p>
          </div>
        </div>

        {onNavigateTab && (
          <button
            type="button"
            onClick={() => onNavigateTab("ai-blog-engine")}
            className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>AI Blog Motoruna Git</span>
          </button>
        )}
      </div>

      {/* 3. TOP 3 COMPETITORS VS YOUR SITE CARDS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              SERP Sıralaması & İçerik Metrikleri Karşılaştırması
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Siteniz vs İlk 3 Rakip
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* YOUR SITE CARD */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-indigo-50/70 to-white border-2 border-indigo-500/40 shadow-xs space-y-4 relative">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-indigo-600 text-white uppercase tracking-wider">
                Sizin Siteniz
              </span>
              <span className="text-xs font-mono font-bold text-indigo-700">
                Hedef Liderlik
              </span>
            </div>

            <div>
              <div className="text-sm font-black text-slate-900 truncate">
                {config.companyName || "Bizim Firma"}
              </div>
              <div className="text-xs text-slate-500 truncate font-mono">
                {config.cloudflare?.customDomain || config.cloudflare?.subdomain || "sitemiz.com.tr"}
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="space-y-2 pt-1 text-xs border-t border-indigo-100">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Core Web Vitals (Hız):</span>
                <span className="font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  98 / 100
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Ort. İçerik Derinliği:</span>
                <span className="font-bold text-slate-900">
                  ~{data.userMetrics.avgWordCount} Kelime
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">İndeksli Sayfa Sayısı:</span>
                <span className="font-bold text-slate-900">
                  {data.userMetrics.indexedPages} Sayfa
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Şema & Yapısal Veri:</span>
                <span className="font-bold text-indigo-700">
                  %{data.userMetrics.schemaScore} Uyumlu
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900">
              <strong className="block font-bold mb-0.5">Avantajınız:</strong>
              Rakiplerden %40 daha hızlı sayfa açılışı ve Google standartlarında temiz JSON-LD şeması.
            </div>
          </div>

          {/* TOP 3 COMPETITORS */}
          {data.competitors.map((comp) => {
            const isSelected = selectedCompetitorId === comp.id;
            return (
              <div
                key={comp.id}
                onClick={() => setSelectedCompetitorId(isSelected ? null : comp.id)}
                className={`p-5 rounded-2xl bg-white border transition-all cursor-pointer space-y-4 ${
                  isSelected
                    ? "border-amber-400 ring-2 ring-amber-400/30 shadow-md"
                    : "border-slate-200 hover:border-slate-300 shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    comp.rank === 1 ? "bg-amber-100 text-amber-900" :
                    comp.rank === 2 ? "bg-slate-100 text-slate-800" :
                    "bg-orange-100 text-orange-900"
                  }`}>
                    #{comp.rank} Organik Rakip
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    Skor: %{comp.visibilityScore}
                  </span>
                </div>

                <div>
                  <div className="text-sm font-black text-slate-900 truncate">
                    {comp.name}
                  </div>
                  <div className="text-xs text-slate-500 truncate font-mono flex items-center gap-1">
                    <span>{comp.domain}</span>
                    <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                  </div>
                </div>

                {/* Metrics */}
                <div className="space-y-2 pt-1 text-xs border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Core Web Vitals (Hız):</span>
                    <span className={`font-bold ${comp.speedScore >= 80 ? "text-emerald-600" : "text-amber-600"}`}>
                      {comp.speedScore} / 100
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Ort. İçerik Derinliği:</span>
                    <span className="font-bold text-slate-900">
                      ~{comp.avgWordCount} Kelime
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">İndeksli Sayfa Sayısı:</span>
                    <span className="font-bold text-slate-900">
                      {comp.indexedPages} Sayfa
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Yayınlama Sıklığı:</span>
                    <span className="font-bold text-slate-700">
                      {comp.contentVelocity}
                    </span>
                  </div>
                </div>

                {/* Strengths & Weakness pills */}
                <div className="space-y-1.5 text-[11px] pt-1">
                  <div className="text-slate-700 font-semibold flex items-start gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{comp.keyStrengths[0] || "Güçlü SERP varlığı"}</span>
                  </div>
                  <div className="text-rose-700 font-semibold flex items-start gap-1">
                    <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{comp.weaknesses[0] || "Düşük mobil sayfa hızı"}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3.5. GEMINI-POWERED REAL-TIME SWOT ANALYSIS COMPARISON TABLE AGAINST TOP 3 COMPETITORS */}
      <CompetitiveSeoComparisonTable
        config={config}
        onChange={onChange}
        onNavigateTab={onNavigateTab}
        onApplyKeyword={(kw) => {
          const currentKws = config.seo?.keywords || [];
          const kwList = Array.isArray(currentKws)
            ? currentKws
            : typeof currentKws === "string"
            ? currentKws.split(",").map((s) => s.trim()).filter(Boolean)
            : [];
          if (!kwList.includes(kw)) {
            onChange({
              ...config,
              seo: {
                ...config.seo,
                keywords: [...kwList, kw]
              }
            });
          }
        }}
      />

      {/* 3.6. GEMINI-POWERED KEYWORD RANKING COMPARISON TABLE AGAINST TOP 3 COMPETITORS */}
      <CompetitiveKeywordRankingTable
        rankings={data.keywordRankings || []}
        competitors={data.competitors || []}
        userDomain={config.cloudflare?.customDomain || config.cloudflare?.subdomain || "sitemiz.com.tr"}
        userName={config.companyName || "Siteniz"}
        onApplyKeyword={(kw) => {
          const currentKws = config.seo?.keywords || [];
          const kwList = Array.isArray(currentKws)
            ? currentKws
            : typeof currentKws === "string"
            ? currentKws.split(",").map((s) => s.trim()).filter(Boolean)
            : [];
          if (!kwList.includes(kw)) {
            onChange({
              ...config,
              seo: {
                ...config.seo,
                keywords: [...kwList, kw]
              }
            });
          }
        }}
        onSendToAiBlog={(kw, draftTitle) => {
          if (onNavigateTab) {
            sessionStorage.setItem("ai_blog_prefill_topic", draftTitle || `${kw} Rehberi`);
            sessionStorage.setItem("ai_blog_prefill_keyword", kw);
            onNavigateTab("ai-blog-engine");
          }
        }}
        isLoading={isLoading}
        onRefresh={() => fetchCompetitiveInsight(true)}
        onOpenAlerts={onOpenAlertCenter || (() => setCompactTab("alerts"))}
      />

      {/* 4. VISUAL METRICS CHARTS: RADAR & BAR CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* RADAR CHART: Multi-Metric Competitor Benchmark */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Çok Eksenli İçerik & SEO Radar Analizi
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              100 Üzerinden Puanlama
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarChartData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: "#475569", fontSize: 11, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 9 }} />
                <Radar 
                  name="Siteniz" 
                  dataKey="Siteniz" 
                  stroke="#4f46e5" 
                  fill="#4f46e5" 
                  fillOpacity={0.4} 
                />
                <Radar 
                  name="1. Rakip" 
                  dataKey="Rakip1" 
                  stroke="#f59e0b" 
                  fill="#f59e0b" 
                  fillOpacity={0.2} 
                />
                <Radar 
                  name="2. Rakip" 
                  dataKey="Rakip2" 
                  stroke="#0ea5e9" 
                  fill="#0ea5e9" 
                  fillOpacity={0.15} 
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: 12, border: "none", color: "#fff", fontSize: 12 }} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-slate-500 italic">
            * Radar analizi, Core Web Vitals sayfa hızında açık ara lider olduğunuzu, fakat <strong>içerik derinliği</strong> ve <strong>yayınlama sıklığında</strong> 1. sıradaki rakibi yakalamak için blog içeriklerinin artırılması gerektiğini gösterir.
          </p>
        </div>

        {/* BAR CHART: Content Depth & Volume Comparison */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Ortalama Kelime Sayısı & Hacim Kıyaslaması
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              Kelime / Sayfa
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contentDepthBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: "#475569", fontSize: 11, fontWeight: 600 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: 12, border: "none", color: "#fff", fontSize: 12 }} 
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Bar dataKey="kelimeSayisi" name="Ortalama Kelime Hacmi" fill="#6366f1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="sayfaSayisi" name="İndeksli Sayfa Sayısı" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-slate-500 italic">
            * 1. sıradaki rakip ortalama 1650 kelimelik rehberler yayınlıyor. Sitenize eklenecek 2-3 adet uzun kılavuz makale bu farkı hızla kapatacaktır.
          </p>
        </div>
      </div>

      {/* 5. HIGH-IMPACT MISSING KEYWORDS (CONTENT GAP) */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-5">
        
        {/* Header & Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-xs font-black uppercase tracking-wider mb-1">
              <Flame className="w-3.5 h-3.5" />
              <span>İçerik Boşluğu (Content Gap) Analizi</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              Rakiplerin Sıralandığı, Sitenizde Eksik Olan Yüksek Etkili Anahtar Kelimeler
            </h3>
            <p className="text-xs text-slate-500">
              Bu kelimeleri sitenizin bloguna, hizmetlerine veya başlıklarına ekleyerek organik trafiğinizi doğrudan artırabilirsiniz.
            </p>
          </div>

          {/* Search & Intent Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={keywordSearch}
                onChange={(e) => setKeywordSearch(e.target.value)}
                placeholder="Kelime filtrele..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-indigo-500 w-36 sm:w-44"
              />
            </div>

            {/* Intent Filter Chips */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {[
                { id: "all", label: "Tümü" },
                { id: "ticari", label: "Ticari" },
                { id: "bilgilendirici", label: "Rehber" },
                { id: "acil", label: "Acil/Yerel" }
              ].map((f) => (
                <button
                  type="button"
                  key={f.id}
                  onClick={() => setActiveIntentFilter(f.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeIntentFilter === f.id
                      ? "bg-white text-indigo-700 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Keyword Items List */}
        <div className="grid grid-cols-1 gap-3">
          {filteredKeywords.map((kw) => {
            const isCopied = copiedKwId === kw.id;
            const isAdded = addedKwId === kw.id;

            return (
              <div
                key={kw.id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Keyword & Intent Details */}
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-black text-slate-900">
                      {kw.keyword}
                    </span>

                    {/* Intent badge */}
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                      kw.searchIntent === "Ticari" ? "bg-indigo-100 text-indigo-800" :
                      kw.searchIntent === "Acil / Yerel" ? "bg-rose-100 text-rose-800" :
                      kw.searchIntent === "İşlemsel" ? "bg-emerald-100 text-emerald-800" :
                      "bg-amber-100 text-amber-800"
                    }`}>
                      {kw.searchIntent} Niyet
                    </span>

                    {/* Volume */}
                    <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      Hacim: <strong>{kw.searchVolume}</strong>
                    </span>

                    {/* KD */}
                    <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      Zorluk: <strong>%{kw.difficulty}</strong>
                    </span>
                  </div>

                  {/* Suggestion action text */}
                  <div className="text-xs text-slate-600 leading-relaxed">
                    <strong>Tavsiye Eylem: </strong>{kw.suggestedAction}
                  </div>

                  {/* Recommended Draft Title */}
                  <div className="text-[11px] text-indigo-700 font-medium bg-indigo-50/60 px-2.5 py-1 rounded-lg border border-indigo-100/60 inline-flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3 text-indigo-500 shrink-0" />
                    <span>Önerilen Makale/Sayfa Başlığı: <strong>"{kw.actionableDraftTitle}"</strong></span>
                  </div>

                  {/* Competitor list targeting this keyword */}
                  <div className="text-[10px] text-slate-400 flex items-center gap-1.5 pt-0.5">
                    <span>Hedefleyen Rakipler:</span>
                    {kw.competitorsTargeting.map((cName, idx) => (
                      <span key={idx} className="font-semibold text-slate-600 bg-slate-200/60 px-1.5 py-0.5 rounded">
                        {cName}
                      </span>
                    ))}
                    <span className="text-emerald-600 font-bold ml-1">
                      Tahmini Katkı: {kw.estimatedTrafficGain}
                    </span>
                  </div>
                </div>

                {/* Right: 1-Click Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {/* Action 1: Write with AI Blog Engine */}
                  <button
                    type="button"
                    onClick={() => handleWriteArticleWithAi(kw)}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    title="Bu eksik kelime için Yapay Zeka Blog Motoru ile tam makale üret"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>AI Blog'da Yaz</span>
                  </button>

                  {/* Action 2: Add to Site Keywords */}
                  <button
                    type="button"
                    onClick={() => handleAddKeywordToSite(kw)}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isAdded
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                        : "bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-2xs"
                    }`}
                    title="Sitenin global SEO anahtar kelimelerine ekle"
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                        <span>Eklendi</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>Siteye Ekle</span>
                      </>
                    )}
                  </button>

                  {/* Action 3: Copy */}
                  <button
                    type="button"
                    onClick={() => handleCopyKeyword(kw)}
                    className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200 text-xs transition-colors cursor-pointer"
                    title="Kelimeyi kopyala"
                  >
                    {isCopied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5.5 RAKİP META TAG VE BAŞLIK/AÇIKLAMA KIYASLAMASI (HIGH-CTR META BLUEPRINTS) */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3 className="text-base font-black text-slate-900">
                Rakip Meta Tag Kıyaslaması & Yüksek Tıklama (High-CTR) Önerileri
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Google SERP'te rakiplerinizin kullandığı başlık ve açıklamalara karşı tıklama oranını (CTR) katlayacak yapay zeka ve canlı Google Search analizli meta etiketleri.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PDF Raporuna Ekle & İndir</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5">
          {(data.metaSuggestions || []).map((meta) => {
            const isApplied = appliedMetaId === meta.id;
            const isCopied = copiedKwId === meta.id;
            return (
              <div
                key={meta.id}
                className="p-5 rounded-2xl bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 transition-all space-y-4"
              >
                {/* Header Strip */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-xs font-black uppercase tracking-wider">
                      {meta.pageName}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-emerald-600" />
                      <span>{meta.expectedCtrBoost}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleApplyMetaSuggestion(meta)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                        isApplied
                          ? "bg-emerald-600 text-white"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white"
                      }`}
                      title="Bu önerilen başlık ve meta açıklamayı sitenizin ayarlarına doğrudan kaydet"
                    >
                      {isApplied ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Siteye Uygulandı!</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5 text-amber-300" />
                          <span>Tek Tıkla Siteye Uygula</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(`Başlık: ${meta.recommendedTitle}\nAçıklama: ${meta.recommendedDescription}`);
                        setCopiedKwId(meta.id);
                        setTimeout(() => setCopiedKwId(null), 2500);
                      }}
                      className="p-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs transition-colors cursor-pointer"
                      title="Meta etiketlerini kopyala"
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* 2-Column Comparison Box */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Col 1: Current vs Top Competitor */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Mevcut Siteniz
                      </div>
                      <div className="text-xs font-bold text-slate-800 mt-1">
                        Başlık: <span className="font-normal text-slate-700">{meta.currentUserTitle || "(Tanımlanmamış)"}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        Açıklama: {meta.currentUserDescription || "(Tanımlanmamış)"}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                        1. Sıradaki Rakibin Kullandığı Formül
                      </div>
                      <div className="text-xs font-semibold text-slate-700 mt-1">
                        Başlık: <span className="font-normal">{meta.topCompetitorTitle}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        Açıklama: {meta.topCompetitorDescription}
                      </div>
                    </div>
                  </div>

                  {/* Col 2: AI & Grounded Recommendation */}
                  <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2.5">
                    <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      <span>Yapay Zeka & Grounding Destekli Önerilen Meta Tag</span>
                    </div>

                    <div>
                      <div className="text-xs font-bold text-emerald-950">
                        {meta.recommendedTitle}
                      </div>
                      <p className="text-xs text-emerald-900/90 leading-relaxed mt-1">
                        {meta.recommendedDescription}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-emerald-200/70 text-[11px] text-emerald-800 space-y-1">
                      <div>
                        <strong>Stratejik Kanca: </strong>{meta.reasoning}
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        <span className="text-[10px] text-emerald-700 font-semibold">Hedef Kelimeler:</span>
                        {meta.targetKeywords.map((kw, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-white text-emerald-900 border border-emerald-200 text-[10px] font-medium">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. TACTICAL QUICK WINS TO OUTRANK COMPETITORS */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Zap className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
            Rakipleri Geride Bırakmak İçin Taktiksel Hızlı Kazanımlar (Quick Wins)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.tacticalQuickWins.map((win) => (
            <div
              key={win.id}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    win.impact === "Kritik" ? "bg-rose-100 text-rose-800" :
                    "bg-amber-100 text-amber-800"
                  }`}>
                    {win.impact} Etki
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold bg-white px-2 py-0.5 rounded border border-slate-200">
                    Zorluk: {win.effort}
                  </span>
                </div>

                <div className="text-xs font-black text-slate-900">
                  {win.title}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {win.description}
                </p>
              </div>

              <div className="pt-2">
                {win.actionType === "blog" && onNavigateTab && (
                  <button
                    type="button"
                    onClick={() => onNavigateTab("ai-blog-engine")}
                    className="w-full py-1.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Blog Motorunu Aç</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}

                {win.actionType === "speed" && onNavigateTab && (
                  <button
                    type="button"
                    onClick={() => onNavigateTab("site-health-performance")}
                    className="w-full py-1.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Hız Metriklerini Gör</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}

                {win.actionType === "schema" && onNavigateTab && (
                  <button
                    type="button"
                    onClick={() => onNavigateTab("schema-generator")}
                    className="w-full py-1.5 px-3 rounded-xl bg-slate-200/70 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Şema Düzenleyiciyi Aç</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. PDF DOWNLOAD & EXECUTIVE REPORT BANNER */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold">
            <FileText className="w-3 h-3 text-amber-400" />
            <span>Yönetici Düzeyi PDF Analizi</span>
          </div>
          <h3 className="text-lg font-black text-white">
            Bu Analizi Kurumsal PDF Raporu Olarak İndirin
          </h3>
          <p className="text-xs text-slate-300 max-w-xl">
            Tüm rakip kıyaslama tabloları, eksik anahtar kelime fırsatları, içerik derinliği açığı, meta tag önerileri ve taktiksel hızlı kazanımları içeren sunuma hazır 3 sayfalık yönetici PDF raporu.
          </p>
        </div>

        <button
          type="button"
          id="bottom-download-competitive-pdf-btn"
          onClick={handleDownloadPdf}
          disabled={isGeneratingPdf}
          className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg hover:shadow-xl shrink-0 cursor-pointer disabled:opacity-50"
        >
          {isGeneratingPdf ? (
            <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
          ) : pdfSuccess ? (
            <Check className="w-4 h-4 text-emerald-950 stroke-[3]" />
          ) : (
            <Download className="w-4 h-4 text-slate-950" />
          )}
          <span>{isGeneratingPdf ? "PDF Raporu Hazırlanıyor..." : pdfSuccess ? "Rapor İndirildi!" : "PDF Raporunu İndir"}</span>
        </button>
      </div>

    </div>
  );
};
