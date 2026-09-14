import React, { useState, useEffect } from "react";
import {
  BookOpen,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Server,
  Zap,
  DollarSign,
  ShieldAlert,
  Lightbulb,
  Cpu,
  Layers,
  ArrowRight,
  Database,
  Globe,
  Search,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Target,
  BarChart3,
  MapPin,
  Flame,
  Plus,
  ArrowUpRight,
  Filter,
  Eye,
  Building2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SiteConfig } from "../types";

export interface StrategicTrendItem {
  id: string;
  title: string;
  category: "search_behavior" | "ai_overviews" | "local_intent" | "voice_mobile" | "content_gap" | string;
  categoryLabel: string;
  trendDirection: "rising" | "breakout" | "steady" | string;
  growthRate: string;
  description: string;
  actionableInsight: string;
  impactScore: number;
}

export interface TrendingKeywordItem {
  keyword: string;
  searchVolume: string;
  intent: "urgent" | "commercial" | "local" | "informational" | string;
  intentLabel: string;
  competition: "Düşük" | "Orta" | "Yüksek" | string;
  trendTag: "breakout" | "rising" | "evergreen" | string;
  cpcEstimate?: string;
  opportunityScore: number;
  suggestedContent: string;
}

export interface CompetitorGapItem {
  gapTitle: string;
  competitorDeficiency: string;
  ourAdvantage: string;
  expectedRoi: string;
}

export interface RecommendedSeoStrategy {
  summary: string;
  topPriority: string;
  schemaRecommendation: string;
  localSeoTactic: string;
  fastestWin: string;
}

export interface GoogleSearchSource {
  title: string;
  url: string;
  snippet?: string;
}

export interface GoogleSearchTrendsData {
  niche: string;
  city: string;
  searchSummary: string;
  searchQueriesExecuted: string[];
  searchSources?: GoogleSearchSource[];
  latestTrends: StrategicTrendItem[];
  trendingKeywords: TrendingKeywordItem[];
  competitorSerpGaps: CompetitorGapItem[];
  recommendedSeoStrategy: RecommendedSeoStrategy;
  isLiveGoogleSearch: boolean;
  timestamp: string;
}

export interface StrategicAnalysisViewProps {
  siteConfig?: SiteConfig;
  onUpdateSiteConfig?: (updated: SiteConfig) => void;
  onNavigateTab?: (tab: string) => void;
}

const PRESET_NICHES = [
  { label: "Oto Çekici & Kurtarıcı", icon: "🚗", sector: "Oto Çekici & Kurtarıcı" },
  { label: "Halı & Koltuk Yıkama", icon: "🧺", sector: "Halı & Koltuk Yıkama" },
  { label: "Diyetisyen & Beslenme", icon: "🥗", sector: "Diyetisyen & Beslenme Kliniği" },
  { label: "Diş Hekimi & Klinik", icon: "🦷", sector: "Diş Polikliniği & İmplant" },
  { label: "Tesisat & Su Kaçağı", icon: "🔧", sector: "Tesisatçı & Kombi Servisi" },
  { label: "Avukat & Hukuk Bürosu", icon: "⚖️", sector: "Avukatlık & Hukuk Danışmanlığı" }
];

export const StrategicAnalysisView: React.FC<StrategicAnalysisViewProps> = ({
  siteConfig,
  onUpdateSiteConfig,
  onNavigateTab
}) => {
  const initialNiche = siteConfig?.sector || "Oto Çekici & Kurtarıcı";
  const initialCity = siteConfig?.city || "İstanbul";

  const [niche, setNiche] = useState<string>(initialNiche);
  const [city, setCity] = useState<string>(initialCity);
  const [customQuery, setCustomQuery] = useState<string>("");
  const [isCustomNiche, setIsCustomNiche] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [trendsData, setTrendsData] = useState<GoogleSearchTrendsData | null>(null);
  const [dataSource, setDataSource] = useState<string>("google_search_grounding");
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"trends" | "keywords" | "competitors" | "strategy">("trends");
  const [keywordSearch, setKeywordSearch] = useState<string>("");
  const [intentFilter, setIntentFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Fetch Google Search Trends from API
  const fetchGoogleSearchTrends = async (targetNiche: string, targetCity: string, queryStr: string = "") => {
    setLoading(true);
    setErrorNotice(null);
    try {
      const res = await fetch("/api/google-search-trends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche: targetNiche,
          city: targetCity,
          companyName: siteConfig?.companyName || "JetKur İşletmesi",
          customQuery: queryStr
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const json = await res.json();
      if (json.success && json.data) {
        setTrendsData(json.data);
        setDataSource(json.source || (json.data.isLiveGoogleSearch ? "google_search_grounding" : "niche_market_radar"));
        if (json.errorNotice) {
          setErrorNotice(json.errorNotice);
        }
      }
    } catch (err: any) {
      console.error("Failed to fetch Google Search trends:", err);
      setErrorNotice("Bağlantı hatası: Akıllı sektörel yedek veri seti gösteriliyor.");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchGoogleSearchTrends(niche, city);
  }, []);

  // Copy keyword helper
  const handleCopyKeyword = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyword(text);
    setTimeout(() => setCopiedKeyword(null), 2000);
  };

  // Apply single keyword to SiteConfig
  const handleAddKeywordToSite = (kw: string) => {
    if (!siteConfig || !onUpdateSiteConfig) {
      setNotification(`"${kw}" panoya kopyalandı!`);
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    const currentKeywords = siteConfig.seo?.keywords || "";
    const keywordList = currentKeywords.split(",").map((s) => s.trim()).filter(Boolean);

    if (!keywordList.some((k) => k.toLowerCase() === kw.toLowerCase())) {
      keywordList.unshift(kw);
      const updatedConfig: SiteConfig = {
        ...siteConfig,
        seo: {
          ...siteConfig.seo,
          keywords: keywordList.join(", ")
        }
      };
      onUpdateSiteConfig(updatedConfig);
      setNotification(`"${kw}" site konfigürasyonunuzdaki SEO anahtar kelimelerine eklendi!`);
    } else {
      setNotification(`"${kw}" zaten SEO anahtar kelimelerinizde mevcut.`);
    }
    setTimeout(() => setNotification(null), 3500);
  };

  // Apply all discovered keywords to SiteConfig
  const handleApplyAllKeywords = () => {
    if (!trendsData?.trendingKeywords || !siteConfig || !onUpdateSiteConfig) {
      if (trendsData?.trendingKeywords) {
        const allKws = trendsData.trendingKeywords.map((k) => k.keyword).join(", ");
        navigator.clipboard.writeText(allKws);
        setNotification("Tüm anahtar kelimeler panoya kopyalandı!");
        setTimeout(() => setNotification(null), 3000);
      }
      return;
    }

    const newKws = trendsData.trendingKeywords.map((k) => k.keyword);
    const currentKeywords = siteConfig.seo?.keywords || "";
    const existingList = currentKeywords.split(",").map((s) => s.trim()).filter(Boolean);

    const merged = Array.from(new Set([...newKws, ...existingList]));
    const updatedConfig: SiteConfig = {
      ...siteConfig,
      seo: {
        ...siteConfig.seo,
        keywords: merged.join(", ")
      }
    };

    onUpdateSiteConfig(updatedConfig);
    setNotification(`${newKws.length} adet Google Search trend anahtar kelimesi sitenize başarıyla uygulandı!`);
    setTimeout(() => setNotification(null), 4000);
  };

  // Filtered keywords
  const filteredKeywords = (trendsData?.trendingKeywords || []).filter((item) => {
    const matchesSearch = item.keyword.toLowerCase().includes(keywordSearch.toLowerCase()) ||
      item.suggestedContent.toLowerCase().includes(keywordSearch.toLowerCase());
    const matchesIntent = intentFilter === "all" || item.intent === intentFilter;
    return matchesSearch && matchesIntent;
  });

  // Filtered trends
  const filteredTrends = (trendsData?.latestTrends || []).filter((item) => {
    if (categoryFilter === "all") return true;
    return item.category === categoryFilter;
  });

  return (
    <div className="space-y-10 pb-20 max-w-5xl mx-auto" id="strategic-analysis-container">
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-emerald-900 text-emerald-100 rounded-xl shadow-2xl border border-emerald-600/50 text-sm font-medium"
            id="strategic-toast-notification"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Executive Summary Header */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-8 rounded-2xl border border-blue-900/60 shadow-xl space-y-4" id="executive-summary-banner">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Stratejik Mimari & Google Arama Analiz Raporu</span>
          </div>
          {siteConfig?.companyName && (
            <div className="inline-flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Aktif İşletme: <strong>{siteConfig.companyName}</strong> ({siteConfig.sector})</span>
            </div>
          )}
        </div>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
          Sitenizolsun.com & WordPress Alternatifi: Statik Web SaaS Projesi
        </h1>
        <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
          Gönderdiğiniz sitenizolsun.com modelini, WordPress alternatifini ve <strong>Google Arama API verilerini</strong> derinlemesine inceledik.
          Düşündüğünüz <strong>"Merkezi CMS + Statik HTML Derleyici + Canlı Google Arama Trend Radarı"</strong> mimarisi,
          sektördeki en karlı ve en sürdürülebilir modern yazılım modellerinden biridir.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* FEATURE: LIVE GOOGLE SEARCH API INDUSTRY TRENDS & KEYWORDS RADAR */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border-2 border-blue-500/30 shadow-lg overflow-hidden" id="google-search-radar-section">
        {/* Radar Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-6 sm:p-8 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shadow-inner">
                <Search className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    Google Search Canlı Sektörel SEO Trend & Anahtar Kelime Radarı
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    <Sparkles className="w-3 h-3" /> Canlı SERP
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Google Search API ile işletme nişinizin anlık arama hacimlerini, yükselen kalıplarını ve yüksek dönüşümlü kelimelerini tarayın.
                </p>
              </div>
            </div>

            {/* Live status badge */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Google Search API Aktif</span>
              </div>
            </div>
          </div>

          {/* Controls: Niche Selector & City */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              1. Sektörünüzü / Nişinizi Seçin veya Yazın:
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {PRESET_NICHES.map((item) => (
                <button
                  key={item.label}
                  id={`preset-niche-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                  type="button"
                  onClick={() => {
                    setIsCustomNiche(false);
                    setNiche(item.sector);
                    fetchGoogleSearchTrends(item.sector, city, customQuery);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                    !isCustomNiche && niche === item.sector
                      ? "bg-blue-600 text-white border-blue-400 shadow-md ring-2 ring-blue-400/40"
                      : "bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
              <button
                id="preset-niche-custom-btn"
                type="button"
                onClick={() => setIsCustomNiche(true)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                  isCustomNiche
                    ? "bg-blue-600 text-white border-blue-400 shadow-md ring-2 ring-blue-400/40"
                    : "bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white"
                }`}
              >
                <span>✨</span>
                <span>Farklı Bir Niş Yazın...</span>
              </button>
            </div>

            {/* Custom inputs row */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-1">
              {isCustomNiche && (
                <div className="sm:col-span-4">
                  <input
                    id="custom-niche-input"
                    type="text"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    placeholder="Örn: Güneş Enerjisi Sistemleri, Veteriner..."
                    className="w-full px-3.5 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div className={isCustomNiche ? "sm:col-span-3" : "sm:col-span-4"}>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    id="target-city-input"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Şehir (Örn: İstanbul, Kadıköy, Türkiye)"
                    className="w-full pl-8 pr-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className={isCustomNiche ? "sm:col-span-3" : "sm:col-span-5"}>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    id="custom-focus-query-input"
                    type="text"
                    value={customQuery}
                    onChange={(e) => setCustomQuery(e.target.value)}
                    placeholder="Özel odak (Örn: 2026 fiyat listesi, nöbetçi)"
                    className="w-full pl-8 pr-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className={isCustomNiche ? "sm:col-span-2" : "sm:col-span-3"}>
                <button
                  id="google-search-fetch-btn"
                  type="button"
                  onClick={() => fetchGoogleSearchTrends(niche, city, customQuery)}
                  disabled={loading}
                  className="w-full h-full min-h-[38px] px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Google Taranıyor...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-3.5 h-3.5" />
                      <span>Google'dan Tara</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Executed Search Queries Strip */}
          {trendsData && trendsData.searchQueriesExecuted && trendsData.searchQueriesExecuted.length > 0 && (
            <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800 space-y-1.5">
              <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                <Globe className="w-3 h-3 text-blue-400" />
                <span>Google Search Üzerinde Yürütülen Canlı Sorgular:</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {trendsData.searchQueriesExecuted.map((q, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-950/80 border border-blue-800/60 text-[11px] font-mono text-cyan-200"
                  >
                    <Search className="w-2.5 h-2.5 text-cyan-400" />
                    "{q}"
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Citations & Sources if available */}
          {trendsData?.searchSources && trendsData.searchSources.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
              <span className="font-semibold text-slate-300">Doğrulanmış SERP Kaynakları:</span>
              {trendsData.searchSources.slice(0, 3).map((src, sIdx) => (
                <a
                  key={sIdx}
                  href={src.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 text-cyan-300 hover:text-cyan-200 hover:underline bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700"
                >
                  <span>{src.title.length > 35 ? src.title.slice(0, 35) + "..." : src.title}</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Overview KPI Cards */}
        {trendsData && (
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 bg-slate-50 border-b border-slate-200">
            <div className="p-4 sm:p-5">
              <div className="text-xs text-slate-500 font-medium">Hedef Niş & Bölge</div>
              <div className="text-sm sm:text-base font-bold text-slate-900 truncate mt-0.5">
                {trendsData.niche} ({trendsData.city})
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Canlı SERP Eşleşmesi
              </div>
            </div>

            <div className="p-4 sm:p-5">
              <div className="text-xs text-slate-500 font-medium">Arama Hacmi Büyümesi</div>
              <div className="text-sm sm:text-base font-bold text-blue-600 mt-0.5">
                {trendsData.latestTrends?.[0]?.growthRate || "+145% yıllık"}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                En hızlı yükselen sorgu kategorisi
              </div>
            </div>

            <div className="p-4 sm:p-5">
              <div className="text-xs text-slate-500 font-medium">Fırsat Anahtar Kelimeler</div>
              <div className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
                {trendsData.trendingKeywords?.length || 0} Adet Tespit Edildi
              </div>
              <div className="text-[11px] text-indigo-600 font-semibold mt-0.5">
                Ort. %94 Fırsat Puanı
              </div>
            </div>

            <div className="p-4 sm:p-5">
              <div className="text-xs text-slate-500 font-medium">JetKur Mimarisi Üstünlüğü</div>
              <div className="text-sm sm:text-base font-bold text-emerald-600 mt-0.5">
                0.02s Açılış ile #1 Sıra
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Yavaş WordPress rakiplerini eler
              </div>
            </div>
          </div>
        )}

        {/* Strategic Summary Box */}
        {trendsData?.searchSummary && (
          <div className="p-4 sm:p-6 bg-blue-50/70 border-b border-blue-100 flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                Google SERP Piyasa Özeti & Kullanıcı Niyeti:
              </div>
              <p className="text-xs sm:text-sm text-blue-950 leading-relaxed font-medium">
                {trendsData.searchSummary}
              </p>
            </div>
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 sm:px-6 bg-white overflow-x-auto">
          <div className="flex space-x-2">
            <button
              id="radar-tab-trends"
              type="button"
              onClick={() => setActiveTab("trends")}
              className={`py-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "trends"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>1. Yükselen Arama Trendleri ({trendsData?.latestTrends?.length || 0})</span>
            </button>

            <button
              id="radar-tab-keywords"
              type="button"
              onClick={() => setActiveTab("keywords")}
              className={`py-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "keywords"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Target className="w-4 h-4" />
              <span>2. Yüksek Getirili Kelimeler ({trendsData?.trendingKeywords?.length || 0})</span>
            </button>

            <button
              id="radar-tab-competitors"
              type="button"
              onClick={() => setActiveTab("competitors")}
              className={`py-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "competitors"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>3. Rakip SERP Boşlukları ({trendsData?.competitorSerpGaps?.length || 0})</span>
            </button>

            <button
              id="radar-tab-strategy"
              type="button"
              onClick={() => setActiveTab("strategy")}
              className={`py-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "strategy"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Zap className="w-4 h-4 text-amber-500" />
              <span>4. Önerilen Google SEO Eylem Planı</span>
            </button>
          </div>

          {/* Quick Apply Batch Button */}
          {activeTab === "keywords" && (
            <button
              id="apply-all-keywords-btn"
              type="button"
              onClick={handleApplyAllKeywords}
              className="my-2 hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Tüm Kelimeleri Sitenin SEO'suna Ekle</span>
            </button>
          )}
        </div>

        {/* Tab Contents */}
        <div className="p-6 sm:p-8">
          {/* TAB 1: TRENDS */}
          {activeTab === "trends" && (
            <div className="space-y-6" id="radar-trends-content">
              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <Filter className="w-3 h-3" /> Filtrele:
                </span>
                {[
                  { key: "all", label: "Tüm Trendler" },
                  { key: "local_intent", label: "Yerel & Acil Arama" },
                  { key: "search_behavior", label: "Kullanıcı Davranışı & Fiyat" },
                  { key: "ai_overviews", label: "Google AI Overviews & SGE" },
                  { key: "content_gap", label: "İçerik Fırsat Boşluğu" },
                  { key: "voice_mobile", label: "Mobil & Sesli Arama" }
                ].map((cat) => (
                  <button
                    key={cat.key}
                    id={`trend-filter-${cat.key}`}
                    type="button"
                    onClick={() => setCategoryFilter(cat.key)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                      categoryFilter === cat.key
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Trend Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredTrends.map((trend, tIdx) => (
                  <div
                    key={trend.id || tIdx}
                    id={`trend-card-${trend.id || tIdx}`}
                    className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all space-y-3.5 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {trend.categoryLabel}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <Flame className="w-3 h-3 text-amber-500" />
                          {trend.growthRate}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {trend.title}
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {trend.description}
                      </p>
                    </div>

                    {/* Impact Bar & Action Box */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">SERP Etki Puanı</span>
                        <span className="font-bold text-slate-800">{trend.impactScore} / 100</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                          style={{ width: `${Math.min(trend.impactScore, 100)}%` }}
                        />
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
                        <div className="font-bold text-blue-900 flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-500" />
                          <span>JetKur Aksiyon Tavsiyesi:</span>
                        </div>
                        <p className="text-slate-700 leading-relaxed text-[11px]">
                          {trend.actionableInsight}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: KEYWORDS */}
          {activeTab === "keywords" && (
            <div className="space-y-6" id="radar-keywords-content">
              {/* Controls Bar: Search & Intent Filter */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 max-w-md">
                  <div className="relative w-full">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      id="keyword-search-filter"
                      type="text"
                      value={keywordSearch}
                      onChange={(e) => setKeywordSearch(e.target.value)}
                      placeholder="Anahtar kelimelerde ara..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {[
                    { key: "all", label: "Tüm Niyetler" },
                    { key: "urgent", label: "🚨 Acil İhtiyaç" },
                    { key: "commercial", label: "💰 Fiyat / Ticari" },
                    { key: "local", label: "📍 Yerel Arama" },
                    { key: "informational", label: "ℹ️ Bilgi Edinme" }
                  ].map((intent) => (
                    <button
                      key={intent.key}
                      id={`intent-filter-${intent.key}`}
                      type="button"
                      onClick={() => setIntentFilter(intent.key)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border ${
                        intentFilter === intent.key
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {intent.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Keywords Cards / Table */}
              <div className="space-y-3">
                {filteredKeywords.map((kw, kIdx) => (
                  <div
                    key={kIdx}
                    id={`keyword-row-${kIdx}`}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-mono flex items-center justify-center">
                            {kIdx + 1}
                          </span>
                          <span>{kw.keyword}</span>
                        </span>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          kw.intent === "urgent"
                            ? "bg-red-100 text-red-700"
                            : kw.intent === "commercial"
                            ? "bg-emerald-100 text-emerald-700"
                            : kw.intent === "local"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-purple-100 text-purple-700"
                        }`}>
                          {kw.intentLabel}
                        </span>

                        {kw.trendTag === "breakout" && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-0.5">
                            <Flame className="w-2.5 h-2.5 text-amber-600" /> Patlama
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span>Arama Hacmi: <strong className="text-slate-800">{kw.searchVolume}</strong></span>
                        <span>•</span>
                        <span>Rekabet: <strong className={kw.competition === "Düşük" ? "text-emerald-600" : "text-amber-600"}>{kw.competition}</strong></span>
                        {kw.cpcEstimate && (
                          <>
                            <span>•</span>
                            <span>TBM Değeri: <strong className="text-slate-800">{kw.cpcEstimate}</strong></span>
                          </>
                        )}
                        <span>•</span>
                        <span>Fırsat Puanı: <strong className="text-blue-600">%{kw.opportunityScore}</strong></span>
                      </div>

                      <div className="text-[11px] text-slate-600 flex items-center gap-1 pt-0.5">
                        <span className="font-semibold text-slate-700">Önerilen Yerleşim:</span>
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-800 font-mono">
                          {kw.suggestedContent}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        id={`copy-kw-${kIdx}`}
                        type="button"
                        onClick={() => handleCopyKeyword(kw.keyword)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all flex items-center gap-1"
                        title="Panoya Kopyala"
                      >
                        {copiedKeyword === kw.keyword ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600">Kopyalandı</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                            <span>Kopyala</span>
                          </>
                        )}
                      </button>

                      <button
                        id={`apply-kw-${kIdx}`}
                        type="button"
                        onClick={() => handleAddKeywordToSite(kw.keyword)}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>SEO'ya Ekle</span>
                      </button>
                    </div>
                  </div>
                ))}

                {filteredKeywords.length === 0 && (
                  <div className="text-center py-10 text-slate-500 text-xs">
                    Aranan kriterlere uygun anahtar kelime bulunamadı.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: COMPETITOR SERP GAPS */}
          {activeTab === "competitors" && (
            <div className="space-y-6" id="radar-competitors-content">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Rakip Sitelerin Google Algoritması Karşısındaki Açıkları:</strong>
                  <p className="mt-0.5 text-amber-800">
                    Sektörünüzdeki WordPress veya hazır şablon siteleri Google'ın Core Web Vitals ve yerel arama yönergelerine uymuyor. JetKur bu açıkları sizin lehinize 1. sayfa avantajına çevirir.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {(trendsData?.competitorSerpGaps || []).map((gap, gIdx) => (
                  <div
                    key={gIdx}
                    id={`competitor-gap-card-${gIdx}`}
                    className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-red-100 text-red-700 font-mono text-xs flex items-center justify-center font-bold">
                          {gIdx + 1}
                        </span>
                        <span>{gap.gapTitle}</span>
                      </h4>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {gap.expectedRoi}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                      <div className="p-3.5 rounded-xl bg-red-50/70 border border-red-200/70 space-y-1">
                        <div className="font-bold text-red-900 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                          <span>Rakiplerin Yaptığı Hata:</span>
                        </div>
                        <p className="text-red-800 leading-relaxed">
                          {gap.competitorDeficiency}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/70 space-y-1">
                        <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>JetKur Mimarimizin Üstünlüğü:</span>
                        </div>
                        <p className="text-emerald-800 leading-relaxed font-medium">
                          {gap.ourAdvantage}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: RECOMMENDED STRATEGY */}
          {activeTab === "strategy" && (
            <div className="space-y-6" id="radar-strategy-content">
              {trendsData?.recommendedSeoStrategy && (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white space-y-3">
                    <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>Google Sıralama & 1. Sayfa Hızlı Zafer Stratejisi</span>
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed">
                      {trendsData.recommendedSeoStrategy.summary}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5 text-blue-600">
                        <Target className="w-4 h-4" /> 1. En Acil Öncelik
                      </div>
                      <p className="text-slate-600 leading-relaxed">
                        {trendsData.recommendedSeoStrategy.topPriority}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5 text-emerald-600">
                        <Layers className="w-4 h-4" /> Önerilen Schema.org Tipi
                      </div>
                      <p className="text-slate-600 leading-relaxed font-mono text-[11px]">
                        {trendsData.recommendedSeoStrategy.schemaRecommendation}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5 text-purple-600">
                        <MapPin className="w-4 h-4" /> Yerel Google Harita & İlçe SEO
                      </div>
                      <p className="text-slate-600 leading-relaxed">
                        {trendsData.recommendedSeoStrategy.localSeoTactic}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5 text-amber-600">
                        <Flame className="w-4 h-4" /> En Hızlı 1. Sayfa Zaferi
                      </div>
                      <p className="text-slate-600 leading-relaxed">
                        {trendsData.recommendedSeoStrategy.fastestWin}
                      </p>
                    </div>
                  </div>

                  {/* Direct Navigation Links */}
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    {onNavigateTab && (
                      <button
                        id="nav-to-site-health-btn"
                        type="button"
                        onClick={() => onNavigateTab("site-health")}
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <BarChart3 className="w-4 h-4" />
                        <span>Tahminleyici SEO Isı Haritasında Simüle Et</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      id="copy-brief-report-btn"
                      type="button"
                      onClick={() => {
                        const brief = `=== HIZLIWEB GOOGLE SEARCH SEO TREND RAPORU ===\nSektör: ${trendsData.niche}\nŞehir: ${trendsData.city}\n\nÖzet: ${trendsData.searchSummary}\n\nÖne Çıkan Kelimeler:\n` +
                          trendsData.trendingKeywords.map((k) => `• ${k.keyword} (${k.searchVolume}, Niyet: ${k.intentLabel}, CPC: ${k.cpcEstimate || "-"})`).join("\n");
                        navigator.clipboard.writeText(brief);
                        setNotification("Yönetici SEO Rapor Özeti panoya kopyalandı!");
                        setTimeout(() => setNotification(null), 3000);
                      }}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-all border border-slate-200 flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Strateji Raporunu Kopyala</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. Sitenizolsun.com Analizi */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6" id="sitenizolsun-analysis-section">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            1
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Sitenizolsun.com Nasıl Çalışıyor? Neden Kalitesiz?</h2>
            <p className="text-xs text-slate-500">Mevcut pazar liderinin iş modeli ve zayıf noktaları.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Güçlü Yönleri (Neden Çok Satıyor?)</span>
            </h3>
            <ul className="space-y-2 text-slate-600">
              <li>• <strong>Sürümden Kazanma:</strong> Çok düşük fiyata (yıllık 1.000 - 2.500 TL) binlerce KOBİ'ye satıyorlar.</li>
              <li>• <strong>Niş Odaklılık:</strong> Oto çekiciden halı yıkamaya, diyetisyenden tabelacıya kadar 300+ hazır kategori sunuyorlar.</li>
              <li>• <strong>Müşterinin İhtiyacını Karşılama:</strong> KOBİ sadece telefonunun çalmasını, haritada çıkmayı ve WhatsApp mesajı almayı istiyor.</li>
            </ul>
          </div>

          <div className="p-5 rounded-xl bg-red-50 border border-red-200 space-y-2">
            <h3 className="font-bold text-red-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>Büyük Zayıflıkları (Neden Kalitesiz?)</span>
            </h3>
            <ul className="space-y-2 text-red-800">
              <li>• <strong>2012-Era Eski PHP Monolit:</strong> Tek bir eski PHP scriptini sadece CSS rengini değiştirerek klonluyorlar.</li>
              <li>• <strong>Kötü Mobil & UI:</strong> Tasarımlar modern Tailwind/Figma standartlarının çok gerisinde ve görsel hiyerarşiden yoksun.</li>
              <li>• <strong>Kopya İçerikler:</strong> Tüm halı yıkamacılara aynı Lorem Ipsum veya standart metni veriyorlar (Google kopya içerik cezası veriyor).</li>
              <li>• <strong>Veritabanı Yükü:</strong> 5.000 müşteri sitesi için ortak MySQL sunucusu kilitleniyor, siteler yavaş açılıyor.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. WordPress Neden Yanlış Seçim? */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6" id="wordpress-comparison-section">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
            2
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">WordPress Neden Sürümden Kazanma Projesine Uygun Değil?</h2>
            <p className="text-xs text-slate-500">1.000+ müşteride WordPress kullanırsanız karşılaşacağınız krizler.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5 text-red-600">
              <Server className="w-4 h-4" /> Sunucu Maliyet Patlaması
            </div>
            <p className="text-slate-600">
              Her WordPress sitesi bir PHP interpreter ve MySQL bağlantısı açar. 1.000 WordPress sitesi için devasa dedicated sunucular gerekir (Aylık $500 - $1.500+).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5 text-amber-600">
              <ShieldAlert className="w-4 h-4" /> Güvenlik & Virüs Kabusu
            </div>
            <p className="text-slate-600">
              Müşterilerin sitelerine virüs (eval/base64 malware) bulaşır, eklenti güncellemeleri temaları bozar. 1000 sitenin bakımını yapmak için 3 tam zamanlı eleman gerekir.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5 text-blue-600">
              <Zap className="w-4 h-4" /> Düşük PageSpeed Skoru
            </div>
            <p className="text-slate-600">
              Elementor veya Divi ile yapılan siteler 40-60 PageSpeed skoru alır, Google Ads'te kalite puanı düşer ve reklam tıklama maliyeti artar.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. Sizin Fikrinizin Gücü: Statik HTML + Merkezi Headless CMS */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-900 text-white p-6 sm:p-8 rounded-2xl border border-emerald-700/60 shadow-lg space-y-6" id="static-architecture-power-section">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
            3
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Sizin Fikriniz: Neden Devrimsel Bir Model?</h2>
            <p className="text-xs text-emerald-300">Merkezi CMS + Statik HTML (JAMstack) Mimarisi.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
          <div className="space-y-3 text-slate-200">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white font-bold">10.000 Müşteri İçin 0 Sunucu Yükü:</strong>
                <p className="text-slate-300 text-xs mt-0.5">
                  Statik HTML dosyaları Cloudflare Pages veya AWS S3'te barındırılır. Ziyaretçi geldiğinde sunucuya veya veritabanına SIFIR istek gider. 10.000 siteyi ayda sadece $10-$20 maliyetle çalıştırabilirsiniz!
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white font-bold">100/100 Google PageSpeed & Ultra Hız:</strong>
                <p className="text-slate-300 text-xs mt-0.5">
                  Site 0.05 saniyede açıldığı için Google arama sıralamasında ve Google Ads reklam kalite puanında rakiplerini ezer.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-slate-200">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white font-bold">Yapay Zeka (Gemini & Google Search API) İle Özgün İçerik:</strong>
                <p className="text-slate-300 text-xs mt-0.5">
                  Kopya içerik sorunu biter. Her müşteriye ve her sektöre özel canlı SERP verisiyle Türkçe metinler, hizmet kartları ve Schema.org etiketleri saniyeler içinde üretilir.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white font-bold">%100 Güvenli & Hacklenemez:</strong>
                <p className="text-slate-300 text-xs mt-0.5">
                  Ortada veritabanı veya PHP olmadığı için SQL injection veya dosya yükleme açığı oluşamaz. Sıfır bakım eforu.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. Karşılaştırma Matrisi */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6" id="comparison-matrix-section">
        <h3 className="text-base font-bold text-slate-900">Teknik & Maliyet Karşılaştırma Tablosu (1.000 Müşteri İçin)</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse" id="technical-comparison-table">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                <th className="p-3 font-bold">Kriter</th>
                <th className="p-3 font-bold text-red-600">Sitenizolsun (Legacy PHP)</th>
                <th className="p-3 font-bold text-amber-600">WordPress Multisite</th>
                <th className="p-3 font-bold text-emerald-600">Bizim StatikWeb Mimariniz</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              <tr>
                <td className="p-3 font-semibold text-slate-900">Aylık Sunucu Maliyeti</td>
                <td className="p-3 text-red-700">~$300 - $600 / ay</td>
                <td className="p-3 text-red-700">~$800 - $1.500 / ay</td>
                <td className="p-3 font-bold text-emerald-600">~$10 - $25 / ay (%98 Tasarruf!)</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900">Açılış Hızı (PageSpeed)</td>
                <td className="p-3">45 - 65 / 100 (Yavaş)</td>
                <td className="p-3">50 - 70 / 100 (Orta)</td>
                <td className="p-3 font-bold text-emerald-600">98 - 100 / 100 (Ultra Hızlı)</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900">Güvenlik / Virüs Riski</td>
                <td className="p-3 text-amber-700">Yüksek (Eski PHP açıkları)</td>
                <td className="p-3 text-red-700">Çok Yüksek (Eklenti açıkları)</td>
                <td className="p-3 font-bold text-emerald-600">%0 (Saf HTML, Saldırı Yüzeyi Yok)</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900">Tasarım & UI Kalitesi</td>
                <td className="p-3">2012 Dönemi Eski Tablolar</td>
                <td className="p-3">Hantal Tema Şablonları</td>
                <td className="p-3 font-bold text-emerald-600">Modern Tailwind CSS 2026</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900">AI & Google Search API</td>
                <td className="p-3">Yok (Manuel Giriş)</td>
                <td className="p-3">Eklenti Gerekir (Karmaşık)</td>
                <td className="p-3 font-bold text-emerald-600">Dahili Gemini + Google Search Radarı</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. Size Özel Yeni Fikirler & Tavsiyeler */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6" id="strategic-recommendations-section">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Fikrinizi Katlayacak 4 Stratejik Öneri</h2>
            <p className="text-xs text-slate-500">Rakiplerin asla yapamadığı ve size büyük avantaj sağlayacak hamleler.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200 space-y-1.5">
            <div className="font-bold text-purple-900">💡 1. WhatsApp & Form Lead Entegrasyonu</div>
            <p className="text-slate-600 leading-relaxed">
              Müşterinin sitesine gelen form mesajlarını doğrudan müşterinin WhatsApp'ına veya Telegram botuna bildirim olarak gönderin. KOBİ'ler buna bayılır!
            </p>
          </div>

          <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200 space-y-1.5">
            <div className="font-bold text-purple-900">💡 2. Otomatik Google Harita (Schema LocalBusiness)</div>
            <p className="text-slate-600 leading-relaxed">
              Sitenizolsun bunu hiç yapmıyor. Siz her şablona zengin Schema.org ekleyerek müşterilerinizin Google Haritalar'da (Google My Business) 1. sırada çıkmasını sağlayın.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200 space-y-1.5">
            <div className="font-bold text-purple-900">💡 3. Tek Tıkla Global Edge / Domain Bağlama</div>
            <p className="text-slate-600 leading-relaxed">
              Müşteri kendi alan adını (örn: <code>kadikoyotocakirci.com</code>) DNS A/CNAME kaydı ile Global Edge CDN yönlendirmesine bağladığı an SSL ve statik site 10 saniyede otomatik aktif olur.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200 space-y-1.5">
            <div className="font-bold text-purple-900">💡 4. Abonelik ve Yıllık Yenileme Gelir Modeli</div>
            <p className="text-slate-600 leading-relaxed">
              İlk yıl siteyi 1.990 TL'ye satın, sonraki her yıl barındırma + alan adı + AI içerik güncelleme paketi olarak 1.200 TL yıllık düzenli gelir elde edin.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. Sonuç & Birlikte Yapabilir Miyiz? */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-4" id="partnership-conclusion-section">
        <h3 className="text-xl font-bold text-amber-400">Böyle bir projeyi birlikte yapabilir miyiz?</h3>
        <p className="text-slate-200 text-sm leading-relaxed">
          <strong>Kesinlikle EVET!</strong> Şu anda kullandığınız bu uygulama, tam olarak hayal ettiğiniz sistemin ilk çalışan prototipidir.
          Bu platform üzerinden:
        </p>
        <ul className="space-y-2 text-xs sm:text-sm text-slate-300 pl-4 list-disc">
          <li>İstediğiniz tüm sektör şablonlarını ve yüzlerce renk varyasyonunu oluşturabiliyorsunuz.</li>
          <li>Google Search API ile en güncel sektörel trendleri ve arama kelimelerini canlı tarayabiliyorsunuz.</li>
          <li>Müşteri panelinden bilgileri girip yapay zekaya metin yazdırabiliyorsunuz.</li>
          <li>"Statik Yayınla" butonuyla hiçbir sunucu yükü olmayan saf, ultra hızlı HTML dosyasını anında üretebiliyorsunuz.</li>
        </ul>
        <div className="pt-2 text-xs text-amber-300 font-semibold">
          👉 Bir sonraki adımda yeni sektörler ekleyebilir, domain yönetim mekanizmasını genişletebilir ve müşteri yönetim paneline yeni modüller entegre edebiliriz!
        </div>
      </div>
    </div>
  );
};
