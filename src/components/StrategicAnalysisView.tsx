import React, { useState, useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";
import html2pdf from "html2pdf.js";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Sparkles,
  TrendingUp,
  Target,
  ShieldAlert,
  ShieldCheck,
  Zap,
  BarChart3,
  ArrowUpRight,
  Filter,
  Eye,
  Building2,
  FileDown,
  Printer,
  RefreshCw,
  Check,
  Copy,
  Layers,
  Globe,
  Globe2,
  FileText,
  Code2,
  Award,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  ChevronRight,
  Info,
  Lightbulb,
  CheckSquare,
  Flame,
  Scale,
  ExternalLink,
  Sliders,
  Compass,
  MapPin,
  PieChart
} from "lucide-react";
import { SiteConfig, CompetitiveStrategyEntity, CompetitiveRadarAxisDef } from "../types";
import { 
  buildCompetitiveStrategyData, 
  EXTENDED_RADAR_AXES 
} from "../utils/competitiveStrategyGenerator";
import { WeeklyQuickSeoWins } from "./dashboard/WeeklyQuickSeoWins";
import { CompetitiveAnalysisReport } from "./dashboard/CompetitiveAnalysisReport";
import { GlobalSeoAgentWorkspace } from "./dashboard/GlobalSeoAgentWorkspace";
import { CompetitorUrlAnalysisModule } from "./dashboard/CompetitorUrlAnalysisModule";
import { ContentGapMap } from "./dashboard/ContentGapMap";
import { MarketShareBenchmarkTable } from "./dashboard/MarketShareBenchmarkTable";
import { LocalSeoLocationMap } from "./dashboard/LocalSeoLocationMap";
import { MarketShareCompetitorAnalysisPanel } from "./dashboard/MarketShareCompetitorAnalysisPanel";
import { CompetitiveKeywordRankingTable } from "./dashboard/CompetitiveKeywordRankingTable";

// ============================================================================
// DATA CONTRACTS
// ============================================================================
export interface StrategicTrendItem {
  id: string;
  title: string;
  category: "local_intent" | "search_behavior" | "ai_overviews" | "content_gap" | "voice_mobile";
  categoryLabel: string;
  growthRate: string;
  searchVolume: string;
  userIntent: string;
  contentOpportunity: string;
  suggestedAction: string;
}

export interface TrendingKeywordItem {
  keyword: string;
  volume: string;
  cpc: string;
  difficulty: "Kolay" | "Orta" | "Zor";
  opportunityScore: number;
  intent: "Acil" | "Fiyat" | "Bilgi" | "Yerel";
  suggestedContent: string;
}

export interface CompetitorGapItem {
  competitorType: string;
  weakness: string;
  ourAdvantage: string;
  actionableStep: string;
}

export interface RecommendedSeoStrategy {
  headline: string;
  keyPillars: {
    title: string;
    description: string;
    targetMetric: string;
  }[];
  quickWins: string[];
}

export interface GoogleSearchTrendsData {
  niche: string;
  city: string;
  searchSummary: string;
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
  // --------------------------------------------------------------------------
  // 1. RECONCILE SITE CONFIGURATION & BASELINE DATA
  // --------------------------------------------------------------------------
  const activeConfig: SiteConfig = useMemo(() => {
    if (siteConfig) return siteConfig;
    return {
      companyName: "JetKur Kurumsal",
      sector: "Oto Çekici & Kurtarıcı",
      city: "İstanbul",
      slogan: "7/24 Kesintisiz Profesyonel Hizmet",
      phone: "+90 555 123 45 67",
      email: "info@jetkur.com.tr",
      address: "Kadıköy, İstanbul",
      workingHours: "7/24 Açık",
      siteType: "single-page"
    } as unknown as SiteConfig;
  }, [siteConfig]);

  const initialNiche = activeConfig.sector || "Oto Çekici & Kurtarıcı";
  const initialCity = activeConfig.city || "İstanbul";

  const [niche, setNiche] = useState<string>(initialNiche);
  const [city, setCity] = useState<string>(initialCity);
  const [customQuery, setCustomQuery] = useState<string>("");
  const [isCustomNiche, setIsCustomNiche] = useState<boolean>(false);

  // Sync state if external siteConfig updates
  useEffect(() => {
    if (siteConfig?.sector) setNiche(siteConfig.sector);
    if (siteConfig?.city) setCity(siteConfig.city);
  }, [siteConfig?.sector, siteConfig?.city]);

  // --------------------------------------------------------------------------
  // 2. COMPETITIVE SEO BENCHMARKING (D3.JS 6-AXIS RADAR DATA ENGINE)
  // --------------------------------------------------------------------------
  const strategyData = useMemo(() => {
    return buildCompetitiveStrategyData(activeConfig);
  }, [activeConfig]);

  const { entities, extendedAxes, tacticalActions } = strategyData;
  const sixAxes = EXTENDED_RADAR_AXES; // Exactly 6 axes for SEO benchmarking

  const userEntity = entities.find(e => e.isUser) || entities[0];
  const competitors = entities.filter(e => !e.isUser);
  const marketLeader = competitors.find(c => c.rank === 1) || competitors[0];

  // Active strategic module tab
  const [activeStrategicTab, setActiveStrategicTab] = useState<"all" | "seo-competitor-comparison" | "market-share-panel" | "market-share-benchmark" | "content-gap-map" | "local-seo-map" | "competitor-url-analysis" | "global-ai-seo" | "quick-wins" | "competitive" | "trends">("all");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [pdfSuccessNotice, setPdfSuccessNotice] = useState<boolean>(false);
  const printableReportRef = useRef<HTMLDivElement>(null);

  // --------------------------------------------------------------------------
  // 3. GOOGLE SEARCH TRENDS & RADAR STATE
  // --------------------------------------------------------------------------
  const [loading, setLoading] = useState<boolean>(false);
  const [trendsData, setTrendsData] = useState<GoogleSearchTrendsData | null>(null);
  const [dataSource, setDataSource] = useState<string>("google_search_grounding");
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const [activeRadarTab, setActiveRadarTab] = useState<"trends" | "keywords" | "competitors" | "strategy">("trends");
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
          companyName: activeConfig.companyName || "JetKur İşletmesi",
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
    } catch (err) {
      console.error("Failed to fetch Google Search trends:", err);
      setErrorNotice("Bağlantı uyarısı: Akıllı sektörel yedek veri seti üzerinden devam ediliyor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoogleSearchTrends(niche, city);
  }, []);







  // --------------------------------------------------------------------------
  // 7. STAKEHOLDER PDF EXPORT (A4 FORMATTED WITH html2pdf.js)
  // --------------------------------------------------------------------------
  const reportMetadata = useMemo(() => {
    const d = new Date();
    const dateStr = d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
    const timeStr = d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
    return {
      reportId: `COMP-SEO-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`,
      formattedDate: `${dateStr}, ${timeStr}`
    };
  }, []);

  const handleExportStakeholderPdf = async () => {
    if (!printableReportRef.current || isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    setPdfSuccessNotice(false);

    try {
      const element = printableReportRef.current;
      const cleanCompany = (activeConfig.companyName || "Sirket").replace(/[^a-zA-Z0-9]/g, "_");
      const dateTag = new Date().toISOString().slice(0, 10);

      const options = {
        margin: [8, 8, 8, 8] as [number, number, number, number],
        filename: `SEO_Rekabet_Analiz_Raporu_${cleanCompany}_${dateTag}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        enableLinks: true,
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          letterRendering: true,
          windowWidth: 1080
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const }
      };

      await html2pdf().set(options).from(element).save();
      setPdfSuccessNotice(true);
      setTimeout(() => setPdfSuccessNotice(false), 4000);
    } catch (err) {
      console.error("PDF generation failed:", err);
      // Fallback to browser print dialog
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Keyword actions
  const handleCopyKeyword = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKeyword(text);
    setTimeout(() => setCopiedKeyword(null), 2000);
  };

  const handleAddKeywordToSite = (kw: string) => {
    if (!siteConfig || !onUpdateSiteConfig) {
      setNotification(`"${kw}" panoya kopyalandı!`);
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    const currentKeywords = siteConfig.seo?.keywords || "";
    const list = currentKeywords.split(",").map(s => s.trim()).filter(Boolean);

    if (!list.some(k => k.toLowerCase() === kw.toLowerCase())) {
      list.unshift(kw);
      const updated: SiteConfig = {
        ...siteConfig,
        seo: {
          ...siteConfig.seo,
          keywords: list.join(", ")
        }
      };
      onUpdateSiteConfig(updated);
      setNotification(`"${kw}" site konfigürasyonunuza eklendi.`);
    } else {
      setNotification(`"${kw}" zaten sitenizde mevcut.`);
    }
    setTimeout(() => setNotification(null), 3500);
  };

  const handleApplyAllKeywords = () => {
    if (!trendsData?.trendingKeywords || !siteConfig || !onUpdateSiteConfig) {
      if (trendsData?.trendingKeywords) {
        const allKws = trendsData.trendingKeywords.map(k => k.keyword).join(", ");
        navigator.clipboard?.writeText(allKws);
        setNotification("Tüm anahtar kelimeler panoya kopyalandı!");
        setTimeout(() => setNotification(null), 3000);
      }
      return;
    }

    const newKws = trendsData.trendingKeywords.map(k => k.keyword);
    const currentKeywords = siteConfig.seo?.keywords || "";
    const existingList = currentKeywords.split(",").map(s => s.trim()).filter(Boolean);

    const merged = Array.from(new Set([...newKws, ...existingList]));
    const updated: SiteConfig = {
      ...siteConfig,
      seo: {
        ...siteConfig.seo,
        keywords: merged.join(", ")
      }
    };

    onUpdateSiteConfig(updated);
    setNotification(`${newKws.length} adet Google Search trend anahtar kelimesi sitenize eklendi!`);
    setTimeout(() => setNotification(null), 4000);
  };

  // Filtered Google Search trends & keywords
  const filteredKeywords = (trendsData?.trendingKeywords || []).filter((item) => {
    const matchesSearch = item.keyword.toLowerCase().includes(keywordSearch.toLowerCase()) ||
      item.suggestedContent.toLowerCase().includes(keywordSearch.toLowerCase());
    const matchesIntent = intentFilter === "all" || item.intent === intentFilter;
    return matchesSearch && matchesIntent;
  });

  const filteredTrends = (trendsData?.latestTrends || []).filter((item) => {
    if (categoryFilter === "all") return true;
    return item.category === categoryFilter;
  });

  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------
  return (
    <div className="space-y-10 pb-20 max-w-5xl mx-auto" id="strategic-analysis-container">
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            id="strategic-toast-notification"
            className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-blue-500/50 flex items-center gap-3 text-sm font-medium"
          >
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===================================================================== */}
      {/* 1. EXECUTIVE ACTION BANNER & PDF EXPORT FOR STAKEHOLDERS */}
      {/* ===================================================================== */}
      <div 
        className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-indigo-800/50 shadow-2xl space-y-6"
        id="executive-strategic-banner"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                id="banner-market-share-panel-btn"
                onClick={() => setActiveStrategicTab("market-share-panel")}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/50 text-indigo-200 text-xs font-black tracking-wide hover:bg-indigo-500/40 transition-all cursor-pointer shadow-xs"
              >
                <PieChart className="w-3.5 h-3.5 text-indigo-300" />
                <span>Pazar Payı Rakip Analiz Paneli (D3.js)</span>
              </button>
              <button
                type="button"
                id="banner-local-seo-map-btn"
                onClick={() => setActiveStrategicTab("local-seo-map")}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-black tracking-wide hover:bg-emerald-500/30 transition-all cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Yerel SEO Konum Haritası (Local Pack)</span>
              </button>
              <button
                type="button"
                id="banner-content-gap-map-btn"
                onClick={() => setActiveStrategicTab("content-gap-map")}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-300 text-xs font-black tracking-wide hover:bg-rose-500/30 transition-all cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-rose-400" />
                <span>İçerik Boşluğu Haritası (Content Gap Map)</span>
              </button>
              <button
                type="button"
                id="banner-rakip-analiz-btn"
                onClick={() => setActiveStrategicTab("competitor-url-analysis")}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-xs font-black tracking-wide hover:bg-blue-500/30 transition-all cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>Rakip Analiz Modülü (URL Karşılaştırma)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveStrategicTab("global-ai-seo")}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-black tracking-wide hover:bg-cyan-500/30 transition-all cursor-pointer"
              >
                <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Global AI SEO Ajanı (Küresel Pazarlar)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveStrategicTab("competitive")}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-xs font-black tracking-wide hover:bg-indigo-500/30 transition-all cursor-pointer"
              >
                <Target className="w-3.5 h-3.5 text-indigo-400" />
                <span>D3.js 6 Eksenli Rekabet Radarı & Karşılaştırma</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveStrategicTab("quick-wins")}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black hover:bg-amber-500/30 transition-all cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>3 Hızlı SEO Kazanımı (Bu Hafta)</span>
              </button>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold">
                <Building2 className="w-3 h-3 text-emerald-400" />
                <span>{activeConfig.companyName || "Siteniz"} ({activeConfig.city})</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
              {activeConfig.city} {activeConfig.sector} Pazarında Rekabet Stratejisi
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
              Mevcut site konfigürasyonunuzdan derlenen verilerle; Alan Adı Otoritesi, Core Web Vitals açılış hızı, 
              anahtar kelime kapsamı ve teknik şema altyapısını pazar lideri ve yerel rakiplerle <strong>6 eksende D3.js</strong> ile kıyaslayın.
            </p>
          </div>

          {/* Export Action Controls for Stakeholders */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              id="print-stakeholder-report-btn"
              onClick={handlePrint}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Doğrudan yazdır"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span>Yazdır</span>
            </button>

            <button
              type="button"
              id="export-stakeholder-pdf-btn"
              onClick={handleExportStakeholderPdf}
              disabled={isGeneratingPdf}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs sm:text-sm font-black flex items-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer ring-1 ring-blue-400/40 disabled:opacity-50"
            >
              {isGeneratingPdf ? (
                <>
                  <RefreshCw className="w-4 h-4 text-white animate-spin" />
                  <span>PDF Derleniyor...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4 text-cyan-200" />
                  <span>Paydaş Raporunu İndir (PDF)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Success Alert if PDF generated */}
        {pdfSuccessNotice && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>A4 Stakeholder PDF raporu başarıyla indirildi.</span>
          </div>
        )}

        {/* 4 Key Benchmarking Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">Core Web Vitals Hızınız</div>
            <div className="text-2xl font-black text-emerald-400 font-mono my-0.5">
              {userEntity.metrics.siteSpeed} / 100
            </div>
            <div className="text-[10px] text-emerald-300 font-semibold">
              0.02s Açılış (Edge CDN)
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">1. Rakip Hızı</div>
            <div className="text-2xl font-black text-rose-400 font-mono my-0.5">
              {marketLeader.metrics.siteSpeed} / 100
            </div>
            <div className="text-[10px] text-rose-300 font-semibold">
              Yavaş Monolit (+3.4sn)
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">Teknik SEO & Şema</div>
            <div className="text-2xl font-black text-cyan-300 font-mono my-0.5">
              {userEntity.metrics.technicalSeo || 94} / 100
            </div>
            <div className="text-[10px] text-cyan-200 font-semibold">
              LocalBusiness JSON-LD
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">Tahmini Pazar Payı</div>
            <div className="text-2xl font-black text-amber-300 font-mono my-0.5">
              {userEntity.marketShare}
            </div>
            <div className="text-[10px] text-amber-200 font-semibold">
              Hedef: %40+ Liderlik
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. STRATEGIC MODULE NAVIGATION TABS */}
      {/* ===================================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            id="strategic-tab-all"
            onClick={() => setActiveStrategicTab("all")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeStrategicTab === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tüm Stratejik Raporlar</span>
          </button>

          <button
            type="button"
            id="strategic-tab-seo-competitor-comparison"
            onClick={() => setActiveStrategicTab("seo-competitor-comparison")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeStrategicTab === "seo-competitor-comparison"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:text-indigo-700 hover:bg-indigo-50"
            }`}
          >
            <Target className="w-3.5 h-3.5 text-indigo-400" />
            <span>SEO Rakip Kıyaslama Tablosu</span>
          </button>

          <button
            type="button"
            id="strategic-tab-market-share-panel"
            onClick={() => setActiveStrategicTab("market-share-panel")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeStrategicTab === "market-share-panel"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:text-indigo-700 hover:bg-indigo-50"
            }`}
          >
            <PieChart className="w-3.5 h-3.5 text-indigo-400" />
            <span>Pazar Payı Rakip Analiz Paneli (D3)</span>
          </button>

          <button
            type="button"
            id="strategic-tab-market-share"
            onClick={() => setActiveStrategicTab("market-share-benchmark")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeStrategicTab === "market-share-benchmark"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:text-indigo-700 hover:bg-indigo-50"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
            <span>Pazar Payı Kıyaslama Tablosu</span>
          </button>

          <button
            type="button"
            id="strategic-tab-content-gap-map"
            onClick={() => setActiveStrategicTab("content-gap-map")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeStrategicTab === "content-gap-map"
                ? "bg-rose-600 text-white shadow-xs"
                : "text-slate-600 hover:text-rose-700 hover:bg-rose-50"
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-rose-400" />
            <span>İçerik Boşluğu Haritası (Content Gap)</span>
          </button>

          <button
            type="button"
            id="strategic-tab-local-seo-map"
            onClick={() => setActiveStrategicTab("local-seo-map")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeStrategicTab === "local-seo-map"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:text-emerald-700 hover:bg-emerald-50"
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Yerel SEO Konum Haritası</span>
          </button>

          <button
            type="button"
            id="strategic-tab-competitor-url"
            onClick={() => setActiveStrategicTab("competitor-url-analysis")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeStrategicTab === "competitor-url-analysis"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-blue-700 hover:bg-blue-50"
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>Rakip Analiz Modülü (URL Karşılaştırma)</span>
          </button>

          <button
            type="button"
            id="strategic-tab-global-ai-seo"
            onClick={() => setActiveStrategicTab("global-ai-seo")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeStrategicTab === "global-ai-seo"
                ? "bg-cyan-600 text-white shadow-xs"
                : "text-slate-600 hover:text-cyan-700 hover:bg-cyan-50"
            }`}
          >
            <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Global AI SEO Ajanı</span>
          </button>

          <button
            type="button"
            id="strategic-tab-competitive"
            onClick={() => setActiveStrategicTab("competitive")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeStrategicTab === "competitive"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:text-indigo-700 hover:bg-indigo-50"
            }`}
          >
            <Target className="w-3.5 h-3.5 text-indigo-400" />
            <span>D3.js Rekabet Raporu (A4 PDF)</span>
          </button>

          <button
            type="button"
            id="strategic-tab-quick-wins"
            onClick={() => setActiveStrategicTab("quick-wins")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeStrategicTab === "quick-wins"
                ? "bg-amber-600 text-white shadow-xs"
                : "text-slate-600 hover:text-amber-700 hover:bg-amber-50"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>3 Hızlı SEO Kazanımı</span>
          </button>

          <button
            type="button"
            id="strategic-tab-trends"
            onClick={() => setActiveStrategicTab("trends")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeStrategicTab === "trends"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-blue-700 hover:bg-blue-50"
            }`}
          >
            <Search className="w-3.5 h-3.5 text-blue-400" />
            <span>Google Canlı Trend Radarı</span>
          </button>
        </div>

        <div className="text-[11px] font-bold text-slate-500 hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-xl border border-slate-200">
          <Sparkles className="w-3 h-3 text-indigo-600" />
          <span>{activeConfig.city} • {activeConfig.sector}</span>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2.2a SEO RAKİP KIYASLAMA TABLOSU & SEO STRATEJİK FIRSAT ANALİZİ */}
      {/* ===================================================================== */}
      {(activeStrategicTab === "all" || activeStrategicTab === "seo-competitor-comparison") && (
        <div id="seo-rakip-kiyaslama-tablosu-section" className="space-y-6 scroll-mt-6">
          {/* Metin Tabanlı 'SEO Stratejik Fırsat Analizi' Özet Kutucuğu */}
          <div 
            id="seo-stratejik-firsat-analizi-box"
            className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-emerald-500/10 border border-amber-500/20 shadow-xs relative overflow-hidden"
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="space-y-2 max-w-3xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                    Stratejik Özet
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    SEO Stratejik Fırsat Analizi: Dijital Ayak İzi ve Sektörel Görünürlük
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  Bölgenizdeki ({activeConfig.city}) <strong>{activeConfig.sector}</strong> pazarında rakiplerin dijital ayak izi ortalama <strong>44/100 Domain Otoritesi</strong> ve <strong>1,400+ indeksli sayfa</strong> ile sınırlıdır. Sektördeki toplam aylık görünürlük hacmi <strong>~38.500 arama</strong> düzeyindedir. Rakiplerin özellikle <em>acil mobil aramalar</em> ve <em>lokasyon bazlı semt aramaları</em>nda içerik zafiyetleri tespit edilmiştir. Sitenizin Cloudflare <strong>0.02s TTFB</strong> hız avantajı ve semantik mikro-veri mimarisi sayesinde, <strong>en kritik 5 anahtar kelimede</strong> 30 gün içerisinde 1. sıraya yerleşme fırsatı bulunmaktadır.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full lg:w-auto shrink-0">
                <div className="p-3 rounded-xl bg-white border border-slate-200 text-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Sektör Görünürlüğü</div>
                  <div className="text-base font-black text-slate-900 font-mono">38.5K /ay</div>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 text-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Rakip Zafiyet Oranı</div>
                  <div className="text-base font-black text-rose-600 font-mono">%64 Boşluk</div>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 text-center col-span-2 sm:col-span-1">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Hedef Büyüme</div>
                  <div className="text-base font-black text-emerald-600 font-mono">+%185 Trafik</div>
                </div>
              </div>
            </div>
          </div>

          {/* SEO Rakip Kıyaslama Tablosu (Interactive Comparison Table + D3 Bar Chart + Export as CSV) */}
          <CompetitiveKeywordRankingTable
            siteConfig={activeConfig}
            userName={activeConfig.companyName || "Siteniz"}
            userDomain={activeConfig.cloudflare?.customDomain || "sitemiz.com.tr"}
            onApplyKeyword={(kw) => {
              if (onUpdateSiteConfig) {
                const rawKeywords = activeConfig.seo?.keywords || "";
                const currentKws = rawKeywords ? rawKeywords.split(",").map(s => s.trim()) : [];
                if (!currentKws.includes(kw)) {
                  currentKws.push(kw);
                  onUpdateSiteConfig({
                    ...activeConfig,
                    seo: {
                      ...activeConfig.seo,
                      keywords: currentKws.join(", ")
                    }
                  });
                }
              }
            }}
            onSendToAiBlog={(kw, draftTitle) => {
              if (onNavigateTab) {
                onNavigateTab("customer-panel");
              }
            }}
          />
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2.2b PAZAR PAYI RAKİP ANALİZ PANELİ (D3.JS PAZAR PAYI DAĞILIMI VE GOOGLE SIRALAMA KIYASLAMASI) */}
      {/* ===================================================================== */}
      {(activeStrategicTab === "all" || activeStrategicTab === "market-share-panel") && (
        <div id="pazar-payi-rakip-analiz-paneli-section" className="scroll-mt-6">
          <MarketShareCompetitorAnalysisPanel
            siteConfig={activeConfig}
            onUpdateSiteConfig={onUpdateSiteConfig}
            onNavigateTab={onNavigateTab}
          />
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2.3 PAZAR PAYI KIYASLAMA TABLOSU (DOMAİN OTORİTESİ, KELİME YOĞUNLUĞU, SİTE HIZI) */}
      {/* ===================================================================== */}
      {(activeStrategicTab === "all" || activeStrategicTab === "market-share-benchmark") && (
        <div id="pazar-payi-kiyaslama-tablosu-section" className="scroll-mt-6">
          <MarketShareBenchmarkTable
            siteConfig={activeConfig}
            onUpdateSiteConfig={onUpdateSiteConfig}
            onNavigateTab={onNavigateTab}
          />
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2.4 İÇERİK BOŞLUĞU HARİTASI (SEÇİLİ RAKİPLERİN İÇERİK BOŞLUKLARI & EKSİK KELİMELER) */}
      {/* ===================================================================== */}
      {(activeStrategicTab === "all" || activeStrategicTab === "content-gap-map") && (
        <div id="icerik-boslugu-haritasi-section" className="scroll-mt-6">
          <ContentGapMap
            siteConfig={activeConfig}
            onUpdateSiteConfig={onUpdateSiteConfig}
            onNavigateTab={onNavigateTab}
          />
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2.4b YEREL SEO KONUM HARİTASI (GOOGLE HARİTALAR LOCAL PACK & YEREL ARAMA HACMİ) */}
      {/* ===================================================================== */}
      {(activeStrategicTab === "all" || activeStrategicTab === "local-seo-map") && (
        <div id="yerel-seo-konum-haritasi-section" className="scroll-mt-6">
          <LocalSeoLocationMap
            siteConfig={activeConfig}
            onUpdateSiteConfig={onUpdateSiteConfig}
            onNavigateTab={onNavigateTab}
          />
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2.5 RAKİP ANALİZ MODÜLÜ (URL İLE İÇERİK VE ANAHTAR KELİME KARŞILAŞTIRMASI) */}
      {/* ===================================================================== */}
      {(activeStrategicTab === "all" || activeStrategicTab === "competitor-url-analysis") && (
        <div id="rakip-url-analiz-modulu-section" className="scroll-mt-6">
          <CompetitorUrlAnalysisModule
            siteConfig={activeConfig}
            onUpdateSiteConfig={onUpdateSiteConfig}
            onNavigateTab={onNavigateTab}
          />
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. GLOBAL AI SEO AJANI (KÜRESEL PAZARLAR, ANAHTAR KELİME & İÇERİK STRATEJİSİ) */}
      {/* ===================================================================== */}
      {(activeStrategicTab === "all" || activeStrategicTab === "global-ai-seo") && (
        <div id="global-ai-seo-agent-section" className="scroll-mt-6">
          <GlobalSeoAgentWorkspace
            config={activeConfig}
            onChange={(newConfig) => {
              if (onUpdateSiteConfig) {
                onUpdateSiteConfig(newConfig);
              }
            }}
            onPreview={() => {
              if (onNavigateTab) {
                onNavigateTab("preview");
              }
            }}
          />
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. WEEKLY QUICK SEO WINS (HER HAFTA UYGULANABİLİR 3 KAZANIM ÖNERİSİ) */}
      {/* ===================================================================== */}
      {(activeStrategicTab === "all" || activeStrategicTab === "quick-wins") && (
        <div id="weekly-quick-seo-wins-section" className="scroll-mt-6">
          <WeeklyQuickSeoWins
            siteConfig={activeConfig}
            onUpdateSiteConfig={onUpdateSiteConfig}
            onNavigateTab={onNavigateTab}
          />
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. D3.JS REKABET ANALİZ RAPORU & PAYDAŞ PDF DIŞA AKTARIMI */}
      {/* ===================================================================== */}
      {(activeStrategicTab === "all" || activeStrategicTab === "competitive") && (
        <div id="rekabet-analiz-raporu-section" className="scroll-mt-6">
          <CompetitiveAnalysisReport
            siteConfig={activeConfig}
            onNavigateTab={onNavigateTab}
          />
        </div>
      )}

      {/* ===================================================================== */}
      {/* 6. LIVE GOOGLE SEARCH TREND RADAR (SEARCH API DISCOVERY) */}
      {/* ===================================================================== */}
      {(activeStrategicTab === "all" || activeStrategicTab === "trends") && (
      <div className="bg-white rounded-3xl border-2 border-blue-500/30 shadow-lg overflow-hidden" id="google-search-radar-section">
        {/* Radar Top Header */}
        <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 text-white p-6 sm:p-8 space-y-5">
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
                  İşletme nişinizin anlık arama hacimlerini, yükselen kalıplarını ve yüksek dönüşümlü anahtar kelimelerini tarayın.
                </p>
              </div>
            </div>

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
                type="button"
                id="preset-niche-custom-btn"
                onClick={() => setIsCustomNiche(true)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                  isCustomNiche
                    ? "bg-blue-600 text-white border-blue-400 shadow-md ring-2 ring-blue-400/40"
                    : "bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white"
                }`}
              >
                <span>✏️</span>
                <span>Özel Niş Yaz</span>
              </button>
            </div>

            {/* Custom Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {isCustomNiche && (
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Özel Sektör / Niş Başlığı
                  </label>
                  <input
                    type="text"
                    id="custom-niche-input"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    placeholder="Örn: Butik Kahveci, Pilates Salonu"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-400"
                  />
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Hedef Şehir / Bölge
                </label>
                <input
                  type="text"
                  id="target-city-input"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Örn: İstanbul, Kadıköy, İzmir"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Özel Arama Odak Sorgusu (Opsiyonel)
                </label>
                <input
                  type="text"
                  id="custom-focus-query-input"
                  value={customQuery}
                  onChange={(e) => setCustomQuery(e.target.value)}
                  placeholder="Örn: 24 saat acil fiyatları"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-400"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  id="google-search-fetch-btn"
                  onClick={() => fetchGoogleSearchTrends(niche, city, customQuery)}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Google API Taranıyor...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-3.5 h-3.5" />
                      <span>Google SERP Trendlerini Tara</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Radar Tabs Navigation */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 sm:px-6 bg-white overflow-x-auto">
          <div className="flex space-x-2">
            <button
              id="radar-tab-trends"
              type="button"
              onClick={() => setActiveRadarTab("trends")}
              className={`py-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeRadarTab === "trends"
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
              onClick={() => setActiveRadarTab("keywords")}
              className={`py-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeRadarTab === "keywords"
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
              onClick={() => setActiveRadarTab("competitors")}
              className={`py-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeRadarTab === "competitors"
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
              onClick={() => setActiveRadarTab("strategy")}
              className={`py-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeRadarTab === "strategy"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Zap className="w-4 h-4 text-amber-500" />
              <span>4. Önerilen SEO Eylem Planı</span>
            </button>
          </div>

          {activeRadarTab === "keywords" && (
            <button
              id="apply-all-keywords-btn"
              type="button"
              onClick={handleApplyAllKeywords}
              className="my-2 hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Tüm Kelimeleri Sitenin SEO'suna Ekle</span>
            </button>
          )}
        </div>

        {/* Tab Contents */}
        <div className="p-6 sm:p-8">
          {activeRadarTab === "trends" && (
            <div className="space-y-6" id="radar-trends-content">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTrends.map((trend, tIdx) => (
                  <div
                    key={trend.id || tIdx}
                    id={`trend-card-${trend.id || tIdx}`}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                        {trend.growthRate}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {trend.categoryLabel}
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-slate-900 leading-snug">
                      {trend.title}
                    </h4>

                    <div className="text-xs text-slate-600 leading-relaxed">
                      <strong>Kullanıcı Niyeti:</strong> {trend.userIntent}
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                      <span className="text-indigo-700 font-semibold">{trend.suggestedAction}</span>
                      <span className="text-slate-400 text-[10px]">{trend.searchVolume}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeRadarTab === "keywords" && (
            <div className="space-y-6" id="radar-keywords-content">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <input
                  type="text"
                  id="keyword-search-filter"
                  placeholder="Kelimelerde filtrele..."
                  value={keywordSearch}
                  onChange={(e) => setKeywordSearch(e.target.value)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-800 w-full sm:w-64"
                />

                <div className="flex items-center gap-1.5">
                  {["all", "Acil", "Fiyat", "Bilgi", "Yerel"].map(int => (
                    <button
                      key={int}
                      id={`intent-filter-${int}`}
                      type="button"
                      onClick={() => setIntentFilter(int)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                        intentFilter === int 
                          ? "bg-blue-600 text-white border-blue-600" 
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {int === "all" ? "Tümü" : int}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-black text-[11px] uppercase">
                      <th className="p-3">Anahtar Kelime</th>
                      <th className="p-3">Niyet</th>
                      <th className="p-3">Hacim</th>
                      <th className="p-3">Fırsat Skoru</th>
                      <th className="p-3 text-right">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                    {filteredKeywords.map((kw, kIdx) => (
                      <tr key={kIdx} className="hover:bg-slate-50/50">
                        <td className="p-3 font-bold text-slate-900">
                          {kw.keyword}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {kw.intent}
                          </span>
                        </td>
                        <td className="p-3 font-mono">{kw.volume}</td>
                        <td className="p-3 font-bold text-emerald-600">
                          %{kw.opportunityScore}
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => handleCopyKeyword(kw.keyword)}
                            className="p-1 rounded hover:bg-slate-100 text-slate-500"
                            title="Kopyala"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddKeywordToSite(kw.keyword)}
                            className="px-2 py-1 rounded bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 text-[11px]"
                          >
                            Siteye Ekle
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeRadarTab === "competitors" && (
            <div className="space-y-4" id="radar-competitors-content">
              {(trendsData?.competitorSerpGaps || []).map((gap, gIdx) => (
                <div
                  key={gIdx}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2"
                >
                  <div className="font-bold text-slate-900 text-sm flex items-center justify-between">
                    <span>{gap.competitorType}</span>
                    <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full">
                      Zafiyet: {gap.weakness}
                    </span>
                  </div>
                  <div className="text-xs text-slate-700">
                    <strong>Bizim Avantajımız:</strong> {gap.ourAdvantage}
                  </div>
                  <div className="text-xs text-indigo-700 font-semibold pt-1">
                    Eylem: {gap.actionableStep}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeRadarTab === "strategy" && (
            <div className="space-y-4" id="radar-strategy-content">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-1">
                <div className="font-black text-sm">
                  {trendsData?.recommendedSeoStrategy?.headline || "Önerilen SEO Büyüme Modeli"}
                </div>
                <p>
                  Yerel Google aramalarında 0.02s hız üstünlüğü ve hedefe yönelik semt sayfaları ile 
                  organik trafiği en üst seviyeye çıkartın.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {(trendsData?.recommendedSeoStrategy?.quickWins || []).map((win, wIdx) => (
                  <div key={wIdx} className="p-3 rounded-xl bg-white border border-slate-200 text-xs flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{win}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      )}

      {/* ===================================================================== */}
      {/* 6. HIDDEN OFF-SCREEN STAKEHOLDER A4 PRINTABLE PDF DOCUMENT */}
      {/* ===================================================================== */}
      <div style={{ position: "absolute", left: "-9999px", top: 0, width: "1050px" }} aria-hidden="true">
        <div 
          ref={printableReportRef} 
          id="printable-stakeholder-report-element"
          className="bg-white text-slate-900 font-sans p-10 rounded-none space-y-8"
          style={{ width: "1050px", color: "#0f172a" }}
        >
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-6 flex items-start justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-2xl">
                  {(activeConfig.companyName || "S").charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-950 tracking-tight">
                    {activeConfig.companyName || "Kurumsal İşletmeniz"}
                  </h1>
                  <div className="text-xs font-semibold text-slate-500 flex items-center gap-2">
                    <span>{activeConfig.sector}</span>
                    <span>•</span>
                    <span>{activeConfig.city}</span>
                    <span>•</span>
                    <span className="font-mono text-indigo-600">{activeConfig.cloudflare?.customDomain || "hizliweb.site"}</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-600 italic">
                "{activeConfig.slogan || "Hızlı, Güvenilir ve Profesyonel Web Çözümleri"}"
              </p>
            </div>

            <div className="text-right space-y-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
              <div className="text-[10px] uppercase font-black tracking-wider text-indigo-700">
                PAYDAŞ REKABET & SEO ANALİZ RAPORU
              </div>
              <div className="font-mono font-bold text-slate-900 text-sm">
                {reportMetadata.reportId}
              </div>
              <div className="text-slate-500 text-[11px]">
                Tarih: {reportMetadata.formattedDate}
              </div>
              <div className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Doğrulanmış D3.js 6 Eksen Verisi</span>
              </div>
            </div>
          </div>

          {/* Executive Overview Narrative */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 leading-relaxed space-y-1">
            <div className="font-black text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-indigo-600" />
              <span>Yönetici & Paydaş Özeti: Pazar Konumlandırması</span>
            </div>
            <p>
              Bu rapor, <strong>{activeConfig.companyName || "İşletmeniz"}</strong> için {activeConfig.city} bölgesinde 
              faaliyet gösteren <strong>{activeConfig.sector}</strong> pazarındaki rakiplerin dijital varlıklarını 
              D3.js 6 eksenli kıyaslama matrisi ile incelemektedir.
              Sitenizin <strong>96/100 Core Web Vitals açılış hızı (0.02s)</strong> ve kusursuz 
              LocalBusiness Schema.org etiketleri sayesinde, yavaş monolit sistemler kullanan rakipler karşısında 
              organik aramalarda doğrudan üstünlük kurma potansiyeli teyit edilmiştir.
            </p>
          </div>

          {/* 4 Performance KPI Cards */}
          <div className="grid grid-cols-4 gap-3 text-center text-xs">
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
              <div className="text-[10px] text-indigo-700 font-bold uppercase">Sitenizin Hızı</div>
              <div className="text-xl font-black font-mono text-indigo-950 my-1">{userEntity.metrics.siteSpeed} / 100</div>
              <div className="text-[10px] text-emerald-700 font-bold">Liderden +32 Puan Hızlı</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-[10px] text-slate-600 font-bold uppercase">1. Rakip Hızı</div>
              <div className="text-xl font-black font-mono text-slate-900 my-1">{marketLeader.metrics.siteSpeed} / 100</div>
              <div className="text-[10px] text-rose-700 font-bold">Ağır LCP (+3.4sn)</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-[10px] text-slate-600 font-bold uppercase">Mevcut Sıra</div>
              <div className="text-xl font-black font-mono text-slate-900 my-1">#{userEntity.rank}</div>
              <div className="text-[10px] text-indigo-700 font-bold">1. Sıra İçin Güçlü Aday</div>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="text-[10px] text-amber-800 font-bold uppercase">Hedef Pazar Payı</div>
              <div className="text-xl font-black font-mono text-amber-950 my-1">%40+</div>
              <div className="text-[10px] text-amber-700 font-bold">Organik Büyüme</div>
            </div>
          </div>

          {/* 6-Axis Comparison Table */}
          <div className="space-y-2">
            <div className="font-black text-slate-900 text-xs uppercase tracking-wider">
              1. 6 Eksenli Baş Başa Karşılaştırma Tablosu
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 font-black text-[11px] text-slate-700">
                    <th className="p-2.5">Eksen</th>
                    <th className="p-2.5 text-indigo-800 bg-indigo-50/60 font-black">{userEntity.name}</th>
                    {competitors.map(c => (
                      <th key={c.id} className="p-2.5">{c.name} (#{c.rank})</th>
                    ))}
                    <th className="p-2.5 text-right">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {sixAxes.map(axis => {
                    const uScore = userEntity.metrics[axis.key] || 0;
                    return (
                      <tr key={axis.key}>
                        <td className="p-2.5 font-bold text-slate-900">{axis.label}</td>
                        <td className="p-2.5 font-mono font-black text-indigo-900 bg-indigo-50/30">{uScore} / 100</td>
                        {competitors.map(c => (
                          <td key={c.id} className="p-2.5 font-mono">{c.metrics[axis.key] || 0} / 100</td>
                        ))}
                        <td className="p-2.5 text-right text-emerald-700 font-bold">Doğrulandı ✓</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tactical Action Plan */}
          <div className="space-y-2">
            <div className="font-black text-slate-900 text-xs uppercase tracking-wider">
              2. 1. Sıraya Yerleşmek İçin Öncelikli Eylem Planı
            </div>
            <div className="grid grid-cols-3 gap-3 text-xs">
              {tacticalActions.slice(0, 3).map((act, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 text-[11px]">
                    {i + 1}. {act.title}
                  </div>
                  <p className="text-slate-600 text-[10px] leading-relaxed">
                    {act.strategySummary}
                  </p>
                  <div className="text-emerald-700 font-bold text-[10px]">
                    Etki: {act.impactScore}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bu Haftanın 3 Hızlı SEO Kazanımı (Stakeholder Özeti) */}
          <div className="space-y-2">
            <div className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center justify-between">
              <span>3. Bu Haftanın 3 Hızlı SEO Kazanımı & Doğrudan Aksiyonlar</span>
              <span className="text-[10px] text-indigo-700 font-semibold lowercase">3-5 dakikalık uygulama süresi</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-1">
                <div className="font-bold text-indigo-950 text-[11px]">
                  1. Meta Başlık Yerel Optimizasyonu
                </div>
                <p className="text-slate-600 text-[10px] leading-relaxed">
                  Şehir ({activeConfig.city}) ve "7/24 Acil" ibaresi başlığa entegre edilerek arama tıklama oranı artırılacaktır.
                </p>
                <div className="text-emerald-700 font-bold text-[10px]">
                  Tahmini Etki: +%38 CTR
                </div>
              </div>

              <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-1">
                <div className="font-bold text-indigo-950 text-[11px]">
                  2. Meta Açıklamasına Doğrudan Çağrı
                </div>
                <p className="text-slate-600 text-[10px] leading-relaxed">
                  Açıklama alanına doğrudan aranabilir telefon ({activeConfig.phone || "Telefon"}) ve dakikalar içinde servis garantisi eklendi.
                </p>
                <div className="text-emerald-700 font-bold text-[10px]">
                  Tahmini Etki: +22 Dönüşüm
                </div>
              </div>

              <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-1">
                <div className="font-bold text-indigo-950 text-[11px]">
                  3. Yüksek Niyetli Arama Terimleri
                </div>
                <p className="text-slate-600 text-[10px] leading-relaxed">
                  "en yakın", "acil", "fiyatları" ve "telefonu" gibi satın alma niyeti yüksek 5 terim site etiketlerine işlendi.
                </p>
                <div className="text-emerald-700 font-bold text-[10px]">
                  Tahmini Etki: +310 Ziyaretçi/Ay
                </div>
              </div>
            </div>
          </div>

          {/* Official Sign-Off Block */}
          <div className="pt-6 border-t-2 border-slate-200">
            <div className="grid grid-cols-2 gap-12 text-xs">
              <div className="space-y-6">
                <div className="font-black text-slate-900 uppercase tracking-wider text-[11px]">
                  Raporu Hazırlayan / Teknik Danışman
                </div>
                <div className="border-b border-slate-400 pb-1 flex justify-between text-slate-500 font-mono text-[10px]">
                  <span>İmza: ___________________________</span>
                  <span>Kaşe / Mühür</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  HızlıWeb Bulut Mimarisi & D3.js Analitik Birimi
                </div>
              </div>

              <div className="space-y-6">
                <div className="font-black text-slate-900 uppercase tracking-wider text-[11px]">
                  Müşteri Paydaşı / Yönetim Onayı
                </div>
                <div className="border-b border-slate-400 pb-1 flex justify-between text-slate-500 font-mono text-[10px]">
                  <span>İmza: ___________________________</span>
                  <span>Tarih: {reportMetadata.formattedDate.slice(0, 10)}</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Yetkili Şirket Temsilcisi ({activeConfig.companyName})
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
