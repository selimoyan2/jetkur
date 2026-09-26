import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
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
  PieChart,
  Radio,
  BellRing,
  Table,
  MousePointerClick,
  Activity,
  SlidersHorizontal,
  Coins
} from "lucide-react";
import { 
  SiteConfig, 
  CompetitiveStrategyEntity, 
  CompetitiveRadarAxisDef,
  SeoCompetitiveAlert,
  CompetitiveAlertSummary
} from "../types";
import { 
  buildCompetitiveStrategyData, 
  EXTENDED_RADAR_AXES 
} from "../utils/competitiveStrategyGenerator";
import { 
  loadCompetitiveAlerts, 
  calculateAlertSummary 
} from "../utils/seoCompetitiveAlertEngine";
import { WeeklyQuickSeoWins } from "./dashboard/WeeklyQuickSeoWins";
import { CompetitiveAnalysisReport } from "./dashboard/CompetitiveAnalysisReport";
import { GlobalSeoAgentWorkspace } from "./dashboard/GlobalSeoAgentWorkspace";
import { CompetitorUrlAnalysisModule } from "./dashboard/CompetitorUrlAnalysisModule";
import { ContentGapMap } from "./dashboard/ContentGapMap";
import { MarketShareBenchmarkTable } from "./dashboard/MarketShareBenchmarkTable";
import { LocalSeoLocationMap } from "./dashboard/LocalSeoLocationMap";
import { MarketShareCompetitorAnalysisPanel } from "./dashboard/MarketShareCompetitorAnalysisPanel";
import { CompetitiveKeywordRankingTable } from "./dashboard/CompetitiveKeywordRankingTable";
import { InteractiveCompetitorComparisonTable } from "./dashboard/InteractiveCompetitorComparisonTable";
import { generateFallbackCompetitiveSeo } from "../utils/competitiveSeoUtils";
import { StrategicPdfExportModal } from "./dashboard/StrategicPdfExportModal";
import { RealtimeCompetitorKeywordBenchmark } from "./dashboard/RealtimeCompetitorKeywordBenchmark";
import { CompetitorSeoPerformanceRadarModule } from "./dashboard/CompetitorSeoPerformanceRadarModule";
import { SeoCompetitiveAlertModule } from "./dashboard/SeoCompetitiveAlertModule";
import { SeoCompetitiveAlertWidget } from "./dashboard/SeoCompetitiveAlertWidget";
import { SeoCompetitiveAlertConfigPanel } from "./dashboard/SeoCompetitiveAlertConfigPanel";
import { CompetitiveAlertToast } from "./dashboard/CompetitiveAlertToast";
import { SectoralSeoStrategySummaryCard } from "./dashboard/SectoralSeoStrategySummaryCard";
import { D3FutureSeoPerformancePredictor } from "./dashboard/D3FutureSeoPerformancePredictor";
import { CompetitorPriceStrategyCard } from "./dashboard/CompetitorPriceStrategyCard";
import { GlobalSeoHeatmapWidget } from "./dashboard/GlobalSeoHeatmapWidget";
import { CustomizableStrategicReportEditorModal } from "./dashboard/CustomizableStrategicReportEditorModal";
import { CompetitorSeoScorecardWidget } from "./dashboard/CompetitorSeoScorecardWidget";
import { CompetitorSwotMatrixCard } from "./dashboard/CompetitorSwotMatrixCard";
import { CompetitorContentStrategyComparator } from "./dashboard/CompetitorContentStrategyComparator";
import { StrategicActionPlannerCard } from "./dashboard/StrategicActionPlannerCard";
import { CompetitorContentExpansionCard } from "./dashboard/CompetitorContentExpansionCard";
import { CompetitorAdEfficiencyCard } from "./dashboard/CompetitorAdEfficiencyCard";
import { SeoAuthorityMatrixModule } from "./dashboard/SeoAuthorityMatrixModule";

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

  // Recent SEO Competitive Alerts & Summary for the Comprehensive PDF
  const [recentAlerts, setRecentAlerts] = useState<SeoCompetitiveAlert[]>(() => {
    return loadCompetitiveAlerts(activeConfig);
  });

  // Active push-style notification toast state for Strategic Analysis view
  const [activePushAlert, setActivePushAlert] = useState<SeoCompetitiveAlert | null>(null);

  useEffect(() => {
    const loaded = loadCompetitiveAlerts(activeConfig);
    setRecentAlerts(loaded);
  }, [activeConfig]);

  const alertSummary = useMemo(() => {
    return calculateAlertSummary(recentAlerts, activeConfig);
  }, [recentAlerts, activeConfig]);

  // Handle incoming real-time alerts from the SEO Competitive Alert Widget
  const handleAlertTriggered = useCallback((alert: SeoCompetitiveAlert) => {
    setActivePushAlert(alert);
    setRecentAlerts(prev => [alert, ...prev.filter(a => a.id !== alert.id)]);
  }, []);

  // Handle one-click action from the floating push toast
  const handleToastAction = useCallback((alert: SeoCompetitiveAlert) => {
    setActivePushAlert(null);
    if (alert.recommendedAction.type === "blog") {
      if (onNavigateTab) {
        onNavigateTab("customer-panel");
        return;
      }
    }
    setActiveStrategicTab("seo-competitive-alert");
    setTimeout(() => {
      const el = document.getElementById("seo-rekabet-alarmi-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 150);
  }, [onNavigateTab]);

  // Competitor Keyword Rankings dataset for the view and the printable PDF report
  const pdfKeywordRankings = useMemo(() => {
    const compSeo = generateFallbackCompetitiveSeo(activeConfig);
    return compSeo.keywordRankings || [];
  }, [activeConfig]);

  // Radar SVG Math for Printable PDF
  const radarSvgConfig = useMemo(() => {
    const cx = 220;
    const cy = 175;
    const radius = 115;
    const count = sixAxes.length;

    const getPoints = (metrics: Record<string, number>) => {
      return sixAxes.map((axis, i) => {
        const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
        const val = Math.max(10, Math.min(100, metrics[axis.key] || 0));
        const r = (val / 100) * radius;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(" ");
    };

    const axisPoints = sixAxes.map((axis, i) => {
      const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
      const xOuter = cx + radius * Math.cos(angle);
      const yOuter = cy + radius * Math.sin(angle);
      const xLabel = cx + (radius + 24) * Math.cos(angle);
      const yLabel = cy + (radius + 24) * Math.sin(angle);
      const cosA = Math.cos(angle);
      const textAnchor = cosA > 0.3 ? "start" : cosA < -0.3 ? "end" : "middle";
      return {
        key: axis.key,
        label: axis.shortLabel || axis.label,
        xOuter,
        yOuter,
        xLabel,
        yLabel,
        textAnchor
      };
    });

    const webRings = [0.2, 0.4, 0.6, 0.8, 1.0].map(ratio => {
      const points = sixAxes.map((_, i) => {
        const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
        const r = radius * ratio;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(" ");
      return { ratio, points, percentage: Math.round(ratio * 100) };
    });

    return { cx, cy, radius, getPoints, axisPoints, webRings };
  }, [sixAxes]);

  // Active strategic module tab
  const [activeStrategicTab, setActiveStrategicTab] = useState<"all" | "seo-competitive-alert-config" | "seo-otorite-matrisi" | "seo-rakip-puan-karti" | "seo-swot-matrisi" | "icerik-stratejisi-kiyaslayici" | "stratejik-aksiyon-planlayici" | "icerik-gelistirme-onerileri" | "reklam-verimliligi-analiz" | "sektorel-seo-ozet" | "sektorel-rekabet-analiz" | "seo-competitive-alert" | "competitor-seo-performance-radar" | "keyword-benchmark-radar" | "rakip-kiyaslama-tablosu" | "seo-competitor-comparison" | "market-share-panel" | "market-share-benchmark" | "content-gap-map" | "local-seo-map" | "competitor-url-analysis" | "global-ai-seo" | "quick-wins" | "competitive" | "trends">("all");
  const [isAlertConfigModalOpen, setIsAlertConfigModalOpen] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [pdfSuccessNotice, setPdfSuccessNotice] = useState<boolean>(false);
  const [isAiPdfModalOpen, setIsAiPdfModalOpen] = useState<boolean>(false);
  const [isCustomReportModalOpen, setIsCustomReportModalOpen] = useState<boolean>(false);
  const printableReportRef = useRef<HTMLDivElement>(null);
  const companyLogoUrl = activeConfig.logo || activeConfig.header?.logoImage;

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
      // Refresh alert logs directly from storage to capture latest simulated/real events
      const freshAlerts = loadCompetitiveAlerts(activeConfig);
      setRecentAlerts(freshAlerts);

      // Brief delay to ensure React commits state to DOM
      await new Promise(r => setTimeout(r, 80));

      const element = printableReportRef.current;
      const cleanCompany = (activeConfig.companyName || "Sirket").replace(/[^a-zA-Z0-9]/g, "_");
      const dateTag = new Date().toISOString().slice(0, 10);

      const options = {
        margin: [8, 8, 8, 8] as [number, number, number, number],
        filename: `${cleanCompany}_Tum_Stratejik_Analiz_Raporu_${dateTag}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        enableLinks: true,
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          letterRendering: true,
          windowWidth: 1080
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] }
      };

      const exporter = (html2pdf as any).default || html2pdf;
      await exporter().set(options).from(element).save();
      setPdfSuccessNotice(true);
      setNotification("Stratejik Analiz görünümündeki tüm veriler (radar grafikleri, ısı haritası, kıyaslama tablosu ve stratejik öneriler) tek bir PDF raporu olarak başarıyla oluşturuldu ve indirildi!");
      setTimeout(() => setPdfSuccessNotice(false), 6000);
      setTimeout(() => setNotification(null), 6000);
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
                id="banner-sektorel-seo-ozet-btn"
                onClick={() => {
                  setActiveStrategicTab("sektorel-seo-ozet");
                  setTimeout(() => {
                    const el = document.getElementById("sektorel-seo-strateji-ozet-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/40 to-purple-500/40 border border-indigo-400/70 text-indigo-100 text-xs font-black tracking-wide hover:from-indigo-500/60 hover:to-purple-500/60 transition-all cursor-pointer shadow-xs ring-1 ring-white/10"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>Sektörel SEO Strateji Özet Kartı (Gemini AI)</span>
                <span className="px-1.5 py-0.2 rounded-full bg-indigo-500 text-white text-[10px] font-mono font-bold">
                  30 Gün
                </span>
              </button>
              <button
                type="button"
                id="banner-future-seo-predictor-btn"
                onClick={() => {
                  setActiveStrategicTab("gelecek-seo-tahmincisi");
                  setTimeout(() => {
                    const el = document.getElementById("gelecek-seo-performans-tahmincisi-container");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/30 border border-cyan-400/60 text-cyan-200 text-xs font-black tracking-wide hover:bg-cyan-500/40 transition-all cursor-pointer shadow-xs"
              >
                <TrendingUp className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
                <span>Gelecek SEO Tahmincisi (D3.js 6 Ay)</span>
                <span className="px-1.5 py-0.2 rounded-full bg-cyan-600 text-white text-[10px] font-mono font-bold">
                  D3.js
                </span>
              </button>
              <button
                type="button"
                id="banner-price-competitiveness-btn"
                onClick={() => {
                  setActiveStrategicTab("fiyat-rekabeti");
                  setTimeout(() => {
                    const el = document.getElementById("fiyat-rekabeti-strateji-karti-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/30 border border-emerald-400/60 text-emerald-200 text-xs font-black tracking-wide hover:bg-emerald-500/40 transition-all cursor-pointer shadow-xs"
              >
                <Scale className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
                <span>Fiyat Rekabeti (Gemini AI)</span>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-600 text-white text-[10px] font-mono font-bold">
                  Canlı Takip
                </span>
              </button>
              <button
                type="button"
                id="banner-global-heatmap-btn"
                onClick={() => {
                  setActiveStrategicTab("global-isi-haritasi");
                  setTimeout(() => {
                    const el = document.getElementById("global-seo-heatmap-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/30 border border-cyan-400/60 text-cyan-200 text-xs font-black tracking-wide hover:bg-cyan-500/40 transition-all cursor-pointer shadow-xs"
                title="Hedef pazarlarda rakip dijital ayak izi ve Global SEO Isı Haritası"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
                <span>Global SEO Isı Haritası (Gemini AI)</span>
                <span className="px-1.5 py-0.2 rounded-full bg-cyan-600 text-white text-[10px] font-mono font-bold">
                  Canlı Isı Haritası
                </span>
              </button>
              <button
                type="button"
                id="banner-seo-competitive-alert-btn"
                onClick={() => {
                  setActiveStrategicTab("seo-competitive-alert");
                  setTimeout(() => {
                    const el = document.getElementById("seo-rekabet-alarmi-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/30 border border-rose-400/60 text-rose-200 text-xs font-black tracking-wide hover:bg-rose-500/40 transition-all cursor-pointer shadow-xs"
              >
                <Flame className="w-3.5 h-3.5 text-rose-300 animate-pulse" />
                <span>SEO Rekabet Alarmı (Canlı Widget)</span>
                {alertSummary.unreadCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black">
                    {alertSummary.unreadCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                id="banner-seo-alert-config-btn"
                onClick={() => {
                  setActiveStrategicTab("seo-competitive-alert-config");
                  setTimeout(() => {
                    const el = document.getElementById("seo-alarm-yapilandirma-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/60 text-indigo-200 text-xs font-black tracking-wide hover:bg-indigo-500/40 transition-all cursor-pointer shadow-xs"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-300" />
                <span>SEO Rekabet Alarmı Yapılandırma</span>
                <span className="px-1.5 py-0.2 rounded-full bg-indigo-500 text-white text-[10px] font-black">
                  DA & Trafik Eşikleri
                </span>
              </button>
              <button
                type="button"
                id="banner-rakip-kiyaslama-tablosu-btn"
                onClick={() => setActiveStrategicTab("rakip-kiyaslama-tablosu")}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/50 text-indigo-200 text-xs font-black tracking-wide hover:bg-indigo-500/40 transition-all cursor-pointer shadow-xs"
              >
                <Table className="w-3.5 h-3.5 text-indigo-300" />
                <span>Rakip Kıyaslama Tablosu</span>
              </button>
              <button
                type="button"
                id="banner-sektorel-rekabet-analiz-btn"
                onClick={() => setActiveStrategicTab("sektorel-rekabet-analiz")}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/30 border border-violet-400/50 text-violet-200 text-xs font-black tracking-wide hover:bg-violet-500/40 transition-all cursor-pointer shadow-xs"
              >
                <Radio className="w-3.5 h-3.5 text-violet-300 animate-pulse" />
                <span>Sektörel Rekabet Analiz (D3.js Radar)</span>
              </button>
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
              id="open-strategic-ai-pdf-modal-btn"
              onClick={() => setIsAiPdfModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-xs sm:text-sm font-black flex items-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer ring-1 ring-indigo-400/40"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Stratejik PDF Raporu Oluştur (Gemini AI)</span>
            </button>

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
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs sm:text-sm font-black flex items-center gap-2.5 transition-all shadow-xl active:scale-95 cursor-pointer ring-2 ring-blue-400/50 hover:ring-blue-300 disabled:opacity-50"
              title="Tüm Rakip Kıyaslama Tablosu ve SEO Radar grafik verilerini tek tıkla şirket logolu profesyonel bir PDF raporu haline getir ve indir"
            >
              {isGeneratingPdf ? (
                <>
                  <RefreshCw className="w-4 h-4 text-white animate-spin" />
                  <span>PDF Raporu Oluşturuluyor...</span>
                </>
              ) : (
                <>
                  {companyLogoUrl ? (
                    <img 
                      src={companyLogoUrl} 
                      alt="" 
                      className="w-6 h-6 rounded-lg object-contain bg-white p-0.5 border border-white/40 shadow-xs shrink-0" 
                    />
                  ) : (
                    <span className="w-6 h-6 rounded-lg bg-white/20 text-white font-black text-xs flex items-center justify-center border border-white/40 shadow-xs shrink-0">
                      {(activeConfig.companyName || "S").charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="flex flex-col text-left leading-tight">
                    <span className="flex items-center gap-1.5 font-black text-xs sm:text-sm text-white">
                      <FileDown className="w-3.5 h-3.5 text-cyan-200" />
                      <span>PDF Raporu Oluştur</span>
                    </span>
                    <span className="text-[10px] text-blue-200/90 font-normal">
                      Şirket Logolu • Radar & Tablo
                    </span>
                  </div>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Success Alert if PDF generated */}
        {pdfSuccessNotice && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Tüm Rakip Kıyaslama Tablosu ve SEO Radar grafik verilerini içeren şirket logolu profesyonel PDF raporu başarıyla oluşturuldu ve indirildi.</span>
          </div>
        )}

        {/* Live Competitor Ranking Shift Ticker Ribbon */}
        <div 
          id="strategic-live-competitor-ticker"
          className="bg-slate-900/90 border border-indigo-700/50 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs shadow-lg"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="flex h-2.5 w-2.5 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
            </span>
            <span className="font-mono text-emerald-400 font-black uppercase tracking-wider text-[11px] shrink-0 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
              <span>Canlı SERP Radarı:</span>
            </span>
            <div className="text-slate-200 truncate text-xs">
              {recentAlerts[0] ? (
                <span className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-black text-amber-300">{recentAlerts[0].competitorName}</span>
                  <span className="text-slate-400">•</span>
                  <span className="font-bold text-white">"{recentAlerts[0].keyword}"</span>
                  <span className="text-slate-400">teriminde</span>
                  <span className="px-1.5 py-0.2 rounded bg-rose-500/30 text-rose-300 font-mono font-bold text-[11px] border border-rose-500/40">
                    #{recentAlerts[0].competitorRank} {recentAlerts[0].competitorRankChange ? `(+${recentAlerts[0].competitorRankChange})` : 'Önde'}
                  </span>
                  <span className="text-amber-400/90 font-medium">({recentAlerts[0].trafficLossEstimate})</span>
                </span>
              ) : (
                <span>Tüm kritik anahtar kelimeler taranıyor, sıralama hareketleri canlı izleniyor.</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              id="ticker-open-alerts-btn"
              onClick={() => {
                setActiveStrategicTab("seo-competitive-alert");
                setTimeout(() => {
                  const el = document.getElementById("seo-rekabet-alarmi-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }, 100);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <BellRing className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Alarmları İncele ({alertSummary.activeCount})</span>
            </button>
          </div>
        </div>

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
            id="strategic-tab-seo-rakip-puan-karti"
            onClick={() => setActiveStrategicTab("seo-rakip-puan-karti")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeStrategicTab === "seo-rakip-puan-karti"
                ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 text-white shadow-xs ring-2 ring-cyan-300"
                : "text-slate-600 hover:text-indigo-700 hover:bg-indigo-50"
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>SEO Rakip Puan Kartı</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-cyan-500/20 text-cyan-700 border border-cyan-500/30">
              Otorite & Backlink & Trafik
            </span>
          </button>

          <button
            type="button"
            id="strategic-tab-seo-otorite-matrisi"
            onClick={() => setActiveStrategicTab("seo-otorite-matrisi")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeStrategicTab === "seo-otorite-matrisi"
                ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 text-white shadow-xs ring-2 ring-indigo-300"
                : "text-slate-600 hover:text-indigo-700 hover:bg-indigo-50"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
            <span>SEO Otorite Matrisi</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-indigo-500/20 text-indigo-700 border border-indigo-500/30">
              D3 Çok Sütunlu
            </span>
          </button>

          <button
            type="button"
            id="strategic-tab-seo-swot-matrisi"
            onClick={() => setActiveStrategicTab("seo-swot-matrisi")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeStrategicTab === "seo-swot-matrisi"
                ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 text-white shadow-xs ring-2 ring-purple-300"
                : "text-slate-600 hover:text-purple-700 hover:bg-purple-50"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-500 animate-pulse" />
            <span>SEO & Pazar SWOT Matrisi</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-purple-500/20 text-purple-700 border border-purple-500/30">
              Gemini 3.8 Flash
            </span>
          </button>

          <button
            type="button"
            id="strategic-tab-icerik-stratejisi-kiyaslayici"
            onClick={() => setActiveStrategicTab("icerik-stratejisi-kiyaslayici")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeStrategicTab === "icerik-stratejisi-kiyaslayici"
                ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white shadow-xs ring-2 ring-blue-300"
                : "text-slate-600 hover:text-blue-700 hover:bg-blue-50"
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
            <span>İçerik Stratejisi Kıyaslayıcı</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-blue-500/20 text-blue-700 border border-blue-500/30">
              En Çok Trafik Çeken Sayfalar
            </span>
          </button>

          <button
            type="button"
            id="strategic-tab-stratejik-aksiyon-planlayici"
            onClick={() => setActiveStrategicTab("stratejik-aksiyon-planlayici")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeStrategicTab === "stratejik-aksiyon-planlayici"
                ? "bg-gradient-to-r from-indigo-600 via-blue-600 to-emerald-600 text-white shadow-xs ring-2 ring-indigo-300"
                : "text-slate-600 hover:text-indigo-700 hover:bg-indigo-50"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
            <span>Stratejik Aksiyon Planlayıcı</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-indigo-500/20 text-indigo-700 border border-indigo-500/30">
              3 Aylık Büyüme & Gemini
            </span>
          </button>

          <button
            type="button"
            id="strategic-tab-icerik-gelistirme-onerileri"
            onClick={() => setActiveStrategicTab("icerik-gelistirme-onerileri")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeStrategicTab === "icerik-gelistirme-onerileri"
                ? "bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white shadow-xs ring-2 ring-cyan-300"
                : "text-slate-600 hover:text-cyan-700 hover:bg-cyan-50"
            }`}
          >
            <MousePointerClick className="w-3.5 h-3.5 text-cyan-500 animate-pulse" />
            <span>İçerik Geliştirme Önerileri</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-cyan-500/20 text-cyan-700 border border-cyan-500/30">
              Blog & Meta Taslakları
            </span>
          </button>

          <button
            type="button"
            id="strategic-tab-reklam-verimliligi-analiz"
            onClick={() => setActiveStrategicTab("reklam-verimliligi-analiz")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeStrategicTab === "reklam-verimliligi-analiz"
                ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-xs ring-2 ring-emerald-300"
                : "text-slate-600 hover:text-emerald-700 hover:bg-emerald-50"
            }`}
          >
            <Coins className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span>Reklam Verimliliği Analizi</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-700 border border-emerald-500/30">
              Bütçe & ROAS
            </span>
          </button>

          <button
            type="button"
            id="strategic-tab-sektorel-seo-ozet"
            onClick={() => setActiveStrategicTab("sektorel-seo-ozet")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeStrategicTab === "sektorel-seo-ozet"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xs ring-2 ring-indigo-300"
                : "text-slate-600 hover:text-indigo-700 hover:bg-indigo-50"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>Sektörel SEO Strateji Özet Kartı</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-indigo-500/20 text-indigo-700 border border-indigo-500/30">
              Gemini + D3 Radar
            </span>
          </button>

          <button
            type="button"
            id="strategic-tab-future-seo-predictor"
            onClick={() => setActiveStrategicTab("gelecek-seo-tahmincisi")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeStrategicTab === "gelecek-seo-tahmincisi"
                ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-xs ring-2 ring-cyan-300"
                : "text-slate-600 hover:text-cyan-700 hover:bg-cyan-50"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-cyan-500 animate-pulse" />
            <span>Gelecek SEO Tahmincisi</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-cyan-500/20 text-cyan-700 border border-cyan-500/30">
              D3.js 6 Ay
            </span>
          </button>

          <button
            type="button"
            id="strategic-tab-price-competitiveness"
            onClick={() => setActiveStrategicTab("fiyat-rekabeti")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeStrategicTab === "fiyat-rekabeti"
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs ring-2 ring-emerald-300"
                : "text-slate-600 hover:text-emerald-700 hover:bg-emerald-50"
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span>Fiyat Rekabeti</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-700 border border-emerald-500/30">
              Gemini AI
            </span>
          </button>

          <button
            type="button"
            id="strategic-tab-global-seo-heatmap"
            onClick={() => setActiveStrategicTab("global-isi-haritasi")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeStrategicTab === "global-isi-haritasi" || activeStrategicTab === "global-seo-heatmap"
                ? "bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white shadow-xs ring-2 ring-cyan-300"
                : "text-slate-600 hover:text-cyan-700 hover:bg-cyan-50"
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-cyan-500 animate-pulse" />
            <span>Global SEO Isı Haritası</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-cyan-500/20 text-cyan-700 border border-cyan-500/30">
              Gemini + Ayak İzi
            </span>
          </button>

          <button
            type="button"
            id="strategic-tab-sektorel-rekabet-analiz"
            onClick={() => setActiveStrategicTab("sektorel-rekabet-analiz")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeStrategicTab === "sektorel-rekabet-analiz" || activeStrategicTab === "keyword-benchmark-radar"
                ? "bg-violet-600 text-white shadow-xs ring-2 ring-violet-300"
                : "text-slate-600 hover:text-violet-700 hover:bg-violet-50"
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
            <span>Sektörel Rekabet Analiz</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Canlı D3.js Radar
            </span>
          </button>

          <button
            type="button"
            id="strategic-tab-seo-competitive-alert"
            onClick={() => setActiveStrategicTab("seo-competitive-alert")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeStrategicTab === "seo-competitive-alert"
                ? "bg-amber-600 text-white shadow-xs"
                : "text-slate-600 hover:text-amber-700 hover:bg-amber-50"
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>SEO Rekabet Alarmı (Canlı)</span>
          </button>

          <button
            type="button"
            id="strategic-tab-seo-alert-config"
            onClick={() => setActiveStrategicTab("seo-competitive-alert-config")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeStrategicTab === "seo-competitive-alert-config"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:text-indigo-700 hover:bg-indigo-50"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" />
            <span>SEO Rekabet Alarmı Yapılandırma</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-indigo-500/20 text-indigo-700 border border-indigo-500/30">
              DA & Trafik Eşikleri
            </span>
          </button>

          <button
            type="button"
            id="strategic-tab-ai-pdf"
            onClick={() => setIsAiPdfModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
            <span>Stratejik PDF Raporu (Gemini AI)</span>
          </button>

          <button
            type="button"
            id="strategic-tab-competitor-seo-performance-radar"
            onClick={() => setActiveStrategicTab("competitor-seo-performance-radar")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeStrategicTab === "competitor-seo-performance-radar"
                ? "bg-cyan-600 text-white shadow-xs"
                : "text-slate-600 hover:text-cyan-700 hover:bg-cyan-50"
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>SEO Performans Radarı (D3.js)</span>
          </button>

          <button
            type="button"
            id="strategic-tab-rakip-kiyaslama-tablosu"
            onClick={() => setActiveStrategicTab("rakip-kiyaslama-tablosu")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeStrategicTab === "rakip-kiyaslama-tablosu" || activeStrategicTab === "seo-competitor-comparison"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:text-indigo-700 hover:bg-indigo-50"
            }`}
          >
            <Table className="w-3.5 h-3.5 text-indigo-400" />
            <span>Rakip Kıyaslama Tablosu</span>
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

        <div className="flex items-center gap-2">
          <div className="text-[11px] font-bold text-slate-500 hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-xl border border-slate-200">
            <Sparkles className="w-3 h-3 text-indigo-600" />
            <span>{activeConfig.city} • {activeConfig.sector}</span>
          </div>

          <button
            type="button"
            id="tab-bar-customize-report-btn"
            onClick={() => setIsCustomReportModalOpen(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-slate-900 hover:bg-slate-800 text-indigo-200 border border-indigo-400/40 shadow-xs"
            title="Radar grafiklerini ve ısı haritasını vektörel kalitede düzenleyip indirin"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
            <span>Raporu Özelleştir</span>
            <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-mono font-bold">
              Vektörel
            </span>
          </button>

          <button
            type="button"
            id="tab-bar-download-pdf-btn"
            onClick={handleExportStakeholderPdf}
            disabled={isGeneratingPdf}
            className="px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-sm active:scale-95 disabled:opacity-50 ring-1 ring-blue-400/30"
            title="Radar grafikleri, ısı haritası, kıyaslama tablosu ve stratejik öneriler dahil tüm verileri tek bir PDF raporu olarak indir"
          >
            {isGeneratingPdf ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-white animate-spin" />
                <span>PDF Oluşturuluyor...</span>
              </>
            ) : (
              <>
                {companyLogoUrl ? (
                  <img 
                    src={companyLogoUrl} 
                    alt="" 
                    className="w-4 h-4 rounded object-contain bg-white p-0.5" 
                  />
                ) : (
                  <span className="w-4 h-4 rounded bg-white/20 text-white font-black text-[9px] flex items-center justify-center">
                    {(activeConfig.companyName || "S").charAt(0).toUpperCase()}
                  </span>
                )}
                <FileDown className="w-3.5 h-3.5 text-cyan-200" />
                <span>PDF Raporu Oluştur</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* ŞİRKET LOGOLU STRATEJİK PDF RAPORU & RAKİP METRİKLERİ DIŞA AKTARMA MERKEZİ */}
      {/* ===================================================================== */}
      <div 
        id="gemini-ai-strategic-pdf-banner"
        className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/40 rounded-3xl p-5 sm:p-6 text-white shadow-2xl relative overflow-hidden ring-1 ring-indigo-400/20"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-500/20 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4 max-w-2xl">
            {/* Şirket Logosu Rozeti */}
            <div className="shrink-0 hidden sm:flex flex-col items-center">
              {companyLogoUrl ? (
                <div className="w-16 h-16 rounded-2xl bg-white/95 border-2 border-indigo-300/60 p-1.5 flex items-center justify-center shadow-lg shadow-indigo-950/60 overflow-hidden ring-2 ring-white/20">
                  <img
                    src={companyLogoUrl}
                    alt={activeConfig.companyName || "Şirket Logosu"}
                    className="w-full h-full object-contain"
                    crossOrigin="anonymous"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-blue-600 text-white flex flex-col items-center justify-center font-black shadow-lg shadow-indigo-950/60 ring-2 ring-white/20">
                  <span className="text-2xl leading-none">{(activeConfig.companyName || "S").charAt(0).toUpperCase()}</span>
                  <span className="text-[8px] tracking-widest uppercase opacity-80 mt-0.5">LOGO</span>
                </div>
              )}
              <span className="text-[9px] font-bold text-indigo-300 mt-1 uppercase tracking-wider">
                Şirket Logolu
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-xs">
                  <ShieldCheck className="w-3 h-3 text-white" />
                  <span>Resmi Paydaş Belgesi</span>
                </span>
                <span className="text-[10px] font-bold text-indigo-200 bg-indigo-900/60 px-2.5 py-0.5 rounded-full border border-indigo-400/40">
                  D3.js 6-Eksen Radar & Rakip Metrikleri
                </span>
                <span className="text-[10px] font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/40 font-mono">
                  A4 Vektörel PDF
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
                <span>{activeConfig.companyName || "Şirketiniz"} İçin Profesyonel Stratejik SEO & Radar Raporu</span>
              </h3>
              
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Rakiplerin <strong>Site Hızı (TTFB/LCP)</strong>, <strong>Domain Otoritesi (DA)</strong>, <strong>D3.js 6-Eksen Radar Verileri</strong>, <strong>Anahtar Kelime Kümeleri & Zorluk Seviyeleri</strong> ile <strong>Fiyat Rekabeti Direktiflerini</strong> içeren şirket logolu resmi A4 PDF raporu oluşturun.
              </p>

              {/* Rapor İçerik Kapsam Hapları */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-slate-300">
                <span className="px-2 py-0.5 rounded-md bg-white/10 text-white/90 border border-white/10 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Şirket Logosu & Başlık</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white/10 text-white/90 border border-white/10 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>D3.js Radar Çizelgesi</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white/10 text-white/90 border border-white/10 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Rakip Metrik Tablosu</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white/10 text-white/90 border border-white/10 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Kaşe & İmza Onayı</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch gap-3 w-full lg:w-auto shrink-0">
            {/* Primary Customizer: Özelleştirilebilir Rapor Düzenleyici */}
            <button
              type="button"
              id="btn-open-custom-report-editor"
              onClick={() => setIsCustomReportModalOpen(true)}
              className="px-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-indigo-950/70 hover:shadow-indigo-500/30 transition-all active:scale-95 cursor-pointer ring-2 ring-indigo-400/60"
              title="Rapor sayfalarını, tüm radar grafiklerini ve ısı haritasını vektörel kalitede düzenleyin"
            >
              <SlidersHorizontal className="w-4 h-4 text-cyan-200" />
              <span>Özelleştirilebilir Rapor Düzenleyici</span>
              <span className="px-1.5 py-0.5 rounded-full bg-cyan-400/30 text-cyan-100 text-[10px] font-bold border border-cyan-300/40">
                Vektörel
              </span>
            </button>

            {/* Şirket Logolu Profesyonel PDF Dışa Aktarma Düğmesi */}
            <button
              type="button"
              id="export-company-logo-stakeholder-pdf-btn"
              onClick={handleExportStakeholderPdf}
              disabled={isGeneratingPdf}
              className="px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-teal-950/60 hover:shadow-teal-500/30 transition-all active:scale-95 cursor-pointer ring-2 ring-emerald-300/60 disabled:opacity-50"
              title="Radar grafikleri, ısı haritası, kıyaslama tablosu ve stratejik öneriler dahil tüm analiz verilerini tek bir PDF raporu olarak indir"
            >
              {isGeneratingPdf ? (
                <>
                  <RefreshCw className="w-4 h-4 text-slate-950 animate-spin" />
                  <span>PDF Derleniyor & İndiriliyor...</span>
                </>
              ) : (
                <>
                  {companyLogoUrl ? (
                    <img
                      src={companyLogoUrl}
                      alt=""
                      className="w-5 h-5 rounded-md object-contain bg-white p-0.5 border border-slate-300 shadow-xs shrink-0"
                    />
                  ) : (
                    <span className="w-5 h-5 rounded-md bg-slate-900 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                      {(activeConfig.companyName || "S").charAt(0).toUpperCase()}
                    </span>
                  )}
                  <FileDown className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                  <span>Tüm Stratejik Analizi PDF Olarak Dışa Aktar</span>
                </>
              )}
            </button>

            {/* Secondary: Gemini AI Stratejik Rapor Önizleme & SWOT */}
            <button
              type="button"
              id="btn-generate-ai-pdf-banner"
              onClick={() => setIsAiPdfModalOpen(true)}
              className="px-4 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-indigo-200 border border-indigo-400/40 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Gemini AI Önizleme</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2.1-CONFIG SEO REKABET ALARMI YAPILANDIRMA PANELİ (DA & TRAFİK EŞİKLERİ) */}
      {/* ===================================================================== */}
      <div 
        id="seo-alarm-yapilandirma-section" 
        className={`space-y-6 scroll-mt-6 ${
          (activeStrategicTab === "all" || activeStrategicTab === "seo-competitive-alert-config") ? "block" : "hidden"
        }`}
      >
        <SeoCompetitiveAlertConfigPanel
          config={activeConfig}
          isOpen={true}
          mode="inline"
          onAlertTriggered={handleAlertTriggered}
        />
      </div>

      {/* ===================================================================== */}
      {/* 2.1a SEO REKABET ALARMI (ANİ HACİM DEĞİŞİMLERİ & ANLIK BİLDİRİM WIDGET) */}
      {/* ===================================================================== */}
      <div 
        id="seo-rekabet-alarmi-section" 
        className={`space-y-6 scroll-mt-6 ${
          (activeStrategicTab === "all" || activeStrategicTab === "seo-competitive-alert") ? "block" : "hidden"
        }`}
      >
        <SeoCompetitiveAlertWidget 
          config={activeConfig} 
          onNavigateTab={onNavigateTab} 
          onDownloadPdf={handleExportStakeholderPdf}
          onAlertTriggered={handleAlertTriggered}
        />
      </div>

      {/* ===================================================================== */}
      {/* 2.1b SEKTOREL SEO STRATEJİ ÖZET KARTI (GEMINI AI + D3 RADAR + 30-GÜNLÜK TRENDLER) */}
      {/* ===================================================================== */}
      {(activeStrategicTab === "all" || activeStrategicTab === "sektorel-seo-ozet") && (
        <div id="sektorel-seo-strateji-ozet-section" className="space-y-6 scroll-mt-6">
          <SectoralSeoStrategySummaryCard
            config={activeConfig}
            radarEntities={entities}
            onNavigateTab={onNavigateTab}
            onDownloadPdf={handleExportStakeholderPdf}
          />
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2.1b-2 SEO RAKİP PUAN KARTI (OTORİTE, BACKLİNK, TRAFİK TEK BAKIŞTA) */}
      {/* ===================================================================== */}
      {(activeStrategicTab === "all" || activeStrategicTab === "seo-rakip-puan-karti") && (
        <div id="seo-rakip-puan-karti-section" className="space-y-6 scroll-mt-6">
          <CompetitorSeoScorecardWidget
            config={activeConfig}
            onNavigateTab={(tab) => {
              if (tab === "rakip-kiyaslama-tablosu") {
                setActiveStrategicTab("rakip-kiyaslama-tablosu");
              } else if (onNavigateTab) {
                onNavigateTab(tab);
              }
            }}
            onDownloadPdf={handleExportStakeholderPdf}
            onOpenCustomReport={() => setIsCustomReportModalOpen(true)}
          />
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2.1b-2b SEO OTORİTE MATRİSİ (D3.JS ÇOK SÜTUNLU DA, BACKLINK & TRAFİK) */}
      {/* ===================================================================== */}
      {(activeStrategicTab === "all" || activeStrategicTab === "seo-otorite-matrisi") && (
        <div id="seo-otorite-matrisi-section" className="space-y-6 scroll-mt-6">
          <SeoAuthorityMatrixModule
            config={activeConfig}
            onNavigateTab={onNavigateTab}
            onOpenCustomReport={() => setIsCustomReportModalOpen(true)}
            onDownloadPdf={handleExportStakeholderPdf}
          />
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2.1b-3 GEMINI SEO & PAZAR SWOT MATRİSİ (GÜÇLÜ, ZAYIF, FIRSAT, TEHDİT) */}
      {/* ===================================================================== */}
      {(activeStrategicTab === "all" || activeStrategicTab === "seo-swot-matrisi") && (
        <div id="seo-swot-matrisi-section" className="space-y-6 scroll-mt-6">
          <CompetitorSwotMatrixCard
            config={activeConfig}
            onNavigateTab={(tab) => {
              if (tab === "rakip-kiyaslama-tablosu") {
                setActiveStrategicTab("rakip-kiyaslama-tablosu");
              } else if (tab === "seo-rakip-puan-karti") {
                setActiveStrategicTab("seo-rakip-puan-karti");
              } else if (tab === "icerik-stratejisi-kiyaslayici") {
                setActiveStrategicTab("icerik-stratejisi-kiyaslayici");
              } else if (onNavigateTab) {
                onNavigateTab(tab);
              }
            }}
            onDownloadPdf={handleExportStakeholderPdf}
            onOpenCustomReport={() => setIsCustomReportModalOpen(true)}
          />
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2.1b-4 İÇERİK STRATEJİSİ KIYASLAYICI (BAŞLIK, UZUNLUK, KW YOĞUNLUĞU) */}
      {/* ===================================================================== */}
      {(activeStrategicTab === "all" || activeStrategicTab === "icerik-stratejisi-kiyaslayici") && (
        <div id="icerik-stratejisi-kiyaslayici-section" className="space-y-6 scroll-mt-6">
          <CompetitorContentStrategyComparator
            config={activeConfig}
            onNavigateTab={(tab) => {
              if (tab === "rakip-kiyaslama-tablosu") {
                setActiveStrategicTab("rakip-kiyaslama-tablosu");
              } else if (tab === "seo-rakip-puan-karti") {
                setActiveStrategicTab("seo-rakip-puan-karti");
              } else if (tab === "seo-swot-matrisi") {
                setActiveStrategicTab("seo-swot-matrisi");
              } else if (onNavigateTab) {
                onNavigateTab(tab);
              }
            }}
            onOpenCustomReport={() => setIsCustomReportModalOpen(true)}
            onDownloadPdf={handleExportStakeholderPdf}
          />
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2.1b-5 STRATEJİK AKSİYON PLANLAYICI (GEMINI DESTEKLİ 3 AYLIK YOL HARİTASI) */}
      {/* ===================================================================== */}
      {(activeStrategicTab === "all" || activeStrategicTab === "stratejik-aksiyon-planlayici") && (
        <div id="stratejik-aksiyon-planlayici-section" className="space-y-6 scroll-mt-6">
          <StrategicActionPlannerCard
            config={activeConfig}
            onNavigateTab={(tab) => {
              if (tab === "customer-panel" || tab === "seo-automation") {
                if (onNavigateTab) onNavigateTab(tab);
              } else if (tab === "rakip-kiyaslama-tablosu") {
                setActiveStrategicTab("rakip-kiyaslama-tablosu");
              } else if (tab === "competitor-seo-performance-radar") {
                setActiveStrategicTab("competitor-seo-performance-radar");
              } else if (onNavigateTab) {
                onNavigateTab(tab);
              }
            }}
            onOpenCustomReport={() => setIsCustomReportModalOpen(true)}
            onDownloadPdf={handleExportStakeholderPdf}
          />
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2.1b-6 İÇERİK GELİŞTİRME ÖNERİLERİ (BLOG & META TASLAKLARI) */}
      {/* ===================================================================== */}
      {(activeStrategicTab === "all" || activeStrategicTab === "icerik-gelistirme-onerileri") && (
        <div id="icerik-gelistirme-onerileri-section" className="space-y-6 scroll-mt-6">
          <CompetitorContentExpansionCard
            config={activeConfig}
            onNavigateTab={(tab) => {
              if (tab === "customer-panel" || tab === "seo-automation") {
                if (onNavigateTab) onNavigateTab(tab);
              } else if (tab === "rakip-kiyaslama-tablosu") {
                setActiveStrategicTab("rakip-kiyaslama-tablosu");
              } else if (tab === "stratejik-aksiyon-planlayici") {
                setActiveStrategicTab("stratejik-aksiyon-planlayici");
              } else if (onNavigateTab) {
                onNavigateTab(tab);
              }
            }}
            onOpenCustomReport={() => setIsCustomReportModalOpen(true)}
            onDownloadPdf={handleExportStakeholderPdf}
          />
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2.1b-7 REKLAM VERİMLİLİĞİ ANALİZİ (BÜTÇE, CPC & ROAS ARBİTRAJI) */}
      {/* ===================================================================== */}
      {(activeStrategicTab === "all" || activeStrategicTab === "reklam-verimliligi-analiz") && (
        <div id="reklam-verimliligi-analiz-section" className="space-y-6 scroll-mt-6">
          <CompetitorAdEfficiencyCard
            config={activeConfig}
            onNavigateTab={(tab) => {
              if (tab === "customer-panel" || tab === "seo-automation") {
                if (onNavigateTab) onNavigateTab(tab);
              } else if (tab === "rakip-kiyaslama-tablosu") {
                setActiveStrategicTab("rakip-kiyaslama-tablosu");
              } else if (tab === "stratejik-aksiyon-planlayici") {
                setActiveStrategicTab("stratejik-aksiyon-planlayici");
              } else if (onNavigateTab) {
                onNavigateTab(tab);
              }
            }}
            onOpenCustomReport={() => setIsCustomReportModalOpen(true)}
            onDownloadPdf={handleExportStakeholderPdf}
          />
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2.1c REAL-TIME COMPETITOR SEO PERFORMANCE RADAR (D3.JS) */}
      {/* ===================================================================== */}
      {(activeStrategicTab === "all" || activeStrategicTab === "competitor-seo-performance-radar") && (
        <div id="sektorel-rakip-seo-performans-radari-section" className="space-y-6 scroll-mt-6">
          <CompetitorSeoPerformanceRadarModule 
            config={activeConfig} 
            onDownloadPdf={handleExportStakeholderPdf}
            onOpenCustomReport={() => setIsCustomReportModalOpen(true)}
          />
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2.1d GELECEK SEO PERFORMANS TAHMİNCİSİ (D3.JS 6 AYLIK PROJEKSİYON) */}
      {/* ===================================================================== */}
      {(activeStrategicTab === "all" || activeStrategicTab === "gelecek-seo-tahmincisi") && (
        <div id="gelecek-seo-performans-tahmincisi-container" className="space-y-6 scroll-mt-6">
          <D3FutureSeoPerformancePredictor
            config={activeConfig}
            customKeywordRankings={pdfKeywordRankings}
            onNavigateTab={(tab) => {
              if (tab === "rakip-kiyaslama-tablosu") {
                setActiveStrategicTab("rakip-kiyaslama-tablosu");
              } else if (onNavigateTab) {
                onNavigateTab(tab);
              }
            }}
            onDownloadPdf={handleExportStakeholderPdf}
          />
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2.1e RAKİPLERİN FİYATLANDIRMA STRATEJİLERİ & GEMINI FİYAT REKABETİ */}
      {/* ===================================================================== */}
      {(activeStrategicTab === "all" || activeStrategicTab === "fiyat-rekabeti") && (
        <div id="fiyat-rekabeti-strateji-section" className="space-y-6 scroll-mt-6">
          <CompetitorPriceStrategyCard
            config={activeConfig}
            onDownloadPdf={handleExportStakeholderPdf}
            onNavigateTab={onNavigateTab}
          />
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2.1f GLOBAL SEO ISI HARİTASI & RAKİP DİJİTAL AYAK İZİ (GEMINI 3.8 FLASH) */}
      {/* ===================================================================== */}
      {(activeStrategicTab === "all" || activeStrategicTab === "global-isi-haritasi" || activeStrategicTab === "global-seo-heatmap") && (
        <div id="global-seo-heatmap-section" className="space-y-6 scroll-mt-6">
          <GlobalSeoHeatmapWidget
            config={activeConfig}
            onDownloadPdf={handleExportStakeholderPdf}
            onOpenCustomReport={() => setIsCustomReportModalOpen(true)}
            onNavigateTab={onNavigateTab}
          />
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2.2 SEKTOREL REKABET ANALIZ: REAL-TIME COMPETITOR KEYWORD BENCHMARK RADAR (D3.JS) */}
      {/* ===================================================================== */}
      {(activeStrategicTab === "all" || activeStrategicTab === "sektorel-rekabet-analiz" || activeStrategicTab === "keyword-benchmark-radar") && (
        <div id="sektorel-rekabet-analiz-section" data-legacy-id="sektorel-keyword-benchmark-radar-section" className="space-y-6 scroll-mt-6">
          <RealtimeCompetitorKeywordBenchmark 
            config={activeConfig} 
            onDownloadPdf={handleExportStakeholderPdf}
          />
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2.2 RAKİP KIYASLAMA TABLOSU (ANAHTAR KELİME PERFORMANSLARI, HACİMLER & ZORLUK SEVİYELERİ) */}
      {/* ===================================================================== */}
      {(activeStrategicTab === "all" || activeStrategicTab === "rakip-kiyaslama-tablosu" || activeStrategicTab === "seo-competitor-comparison") && (
        <div id="seo-rakip-kiyaslama-tablosu-section" className="space-y-6 scroll-mt-6">
          {/* İnteraktif Rakip Kıyaslama Tablosu (Anahtar Kelime Performansları, Hacimler ve Zorluk Seviyeleri) */}
          <InteractiveCompetitorComparisonTable
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
            onDownloadPdf={handleExportStakeholderPdf}
          />

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
              <div className="flex items-center gap-3.5">
                {companyLogoUrl ? (
                  <div className="w-16 h-16 rounded-2xl bg-white border-2 border-slate-300 p-1.5 flex items-center justify-center shadow-xs overflow-hidden shrink-0">
                    <img
                      src={companyLogoUrl}
                      alt={activeConfig.companyName || "Şirket Logosu"}
                      className="w-full h-full object-contain"
                      crossOrigin="anonymous"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-slate-900 text-white flex flex-col items-center justify-center font-black shadow-sm border border-indigo-400/40 shrink-0">
                    <span className="text-2xl leading-none">{(activeConfig.companyName || "S").charAt(0).toUpperCase()}</span>
                    <span className="text-[8px] tracking-widest uppercase opacity-80 mt-0.5">LOGO</span>
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-black text-slate-950 tracking-tight">
                      {activeConfig.companyName || "Kurumsal İşletmeniz"}
                    </h1>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold">
                      Resmi Kurumsal Rapor
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-500 flex items-center gap-2 mt-0.5">
                    <span>{activeConfig.sector}</span>
                    <span>•</span>
                    <span>{activeConfig.city}</span>
                    <span>•</span>
                    <span className="font-mono text-indigo-600 font-bold">{activeConfig.cloudflare?.customDomain || "hizliweb.site"}</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-600 italic">
                "{activeConfig.slogan || "Hızlı, Güvenilir ve Profesyonel Web Çözümleri"}"
              </p>
            </div>

            <div className="text-right space-y-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
              <div className="text-[10px] uppercase font-black tracking-wider text-indigo-700">
                KAPSAMLI STRATEJİK ANALİZ & SEO RAPORU
              </div>
              <div className="font-mono font-bold text-slate-900 text-sm">
                {reportMetadata.reportId}
              </div>
              <div className="text-slate-500 text-[11px]">
                Tarih: {reportMetadata.formattedDate}
              </div>
              <div className="flex flex-wrap items-center justify-end gap-1 pt-0.5 max-w-[280px]">
                <span className="inline-flex items-center gap-1 text-[8px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                  <span>D3 Radar Grafikleri</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[8px] font-bold text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded-full border border-cyan-200">
                  <Globe className="w-2.5 h-2.5 text-cyan-600" />
                  <span>Isı Haritası & Boşluk</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[8px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-full border border-indigo-200">
                  <Table className="w-2.5 h-2.5 text-indigo-600" />
                  <span>Kıyaslama Tablosu</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[8px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200">
                  <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                  <span>Stratejik Öneriler</span>
                </span>
              </div>
            </div>
          </div>

          {/* Executive Overview Narrative */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 leading-relaxed space-y-1.5" style={{ pageBreakInside: "avoid" }}>
            <div className="font-black text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-indigo-600" />
              <span>Yönetici & Paydaş Özeti: Pazar Konumlandırması & Tehdit Matrisi</span>
            </div>
            <p>
              Bu resmi paydaş raporu; <strong>{activeConfig.companyName || "İşletmeniz"}</strong> için {activeConfig.city} bölgesinde 
              faaliyet gösteren <strong>{activeConfig.sector}</strong> pazarındaki rakiplerin dijital varlıklarını 
              <strong> D3.js 6-eksenli radar grafikleri</strong>, <strong>6 aylık gelecek büyüme projeksiyonu</strong>, 
              <strong> rakip kıyaslama tablosu</strong>, <strong>içerik stratejisi & SEO puan kartı</strong>, 
              <strong> bölgesel pazar payı ve içerik boşluğu ısı haritaları</strong> ile 
              <strong> Gemini destekli 3 aylık stratejik eylem önerilerini</strong> tek bir belgede sunmaktadır. 
              Siteniz <strong>96/100 Core Web Vitals (0.02s)</strong> hızı ile liderden +32 puan önde olup, 
              semantik mimari ve stratejik içerik hamleleriyle 90 gün içerisinde sektör 1.liğine yerleşme potansiyeline sahiptir.
            </p>
          </div>

          {/* 4 Performance KPI Cards */}
          <div className="grid grid-cols-4 gap-3 text-center text-xs" style={{ pageBreakInside: "avoid" }}>
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
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="text-[10px] text-amber-800 font-bold uppercase">Aktif Rekabet Alarmları</div>
              <div className="text-xl font-black font-mono text-amber-950 my-1">{alertSummary.totalAlerts} Alarm</div>
              <div className="text-[10px] text-amber-700 font-bold">{alertSummary.volumeSpikeAlerts} Ani Hacim Sıçraması</div>
            </div>
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
              <div className="text-[10px] text-rose-800 font-bold uppercase">Risk Altındaki Trafik</div>
              <div className="text-xl font-black font-mono text-rose-950 my-1">-{alertSummary.totalEstimatedTrafficLoss.toLocaleString()}</div>
              <div className="text-[10px] text-rose-700 font-bold">Ziyaretçi/Ay Tehdit</div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* SECTION 1: COMPETITOR SEO RADAR BENCHMARK (SVG VECTOR + TABLE) */}
          {/* ================================================================= */}
          <div className="space-y-4 pt-2" style={{ pageBreakInside: "avoid" }}>
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="font-black text-slate-950 text-sm uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-black">1</span>
                <span>Sektörel Rakip SEO Performans Radarı (D3.js 6-Eksen Vektör Verisi)</span>
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                {activeConfig.sector} • {activeConfig.city}
              </span>
            </div>

            {/* Radar SVG Visualizer + Legend Side-by-Side */}
            <div className="grid grid-cols-12 gap-4 items-center bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
              {/* Inline High-Res SVG Radar Chart */}
              <div className="col-span-6 flex justify-center">
                <svg 
                  width="440" 
                  height="350" 
                  viewBox="0 0 440 350" 
                  className="overflow-visible"
                >
                  {/* Concentric Web Rings */}
                  {radarSvgConfig.webRings.map((ring, idx) => (
                    <g key={idx}>
                      <polygon
                        points={ring.points}
                        fill={idx === radarSvgConfig.webRings.length - 1 ? "#ffffff" : "none"}
                        stroke="#cbd5e1"
                        strokeWidth="1"
                        strokeDasharray={idx < radarSvgConfig.webRings.length - 1 ? "3 3" : "none"}
                      />
                      <text
                        x={radarSvgConfig.cx + 4}
                        y={radarSvgConfig.cy - (radarSvgConfig.radius * ring.ratio) + 11}
                        fill="#94a3b8"
                        fontSize="9"
                        fontWeight="600"
                        fontFamily="monospace"
                      >
                        %{ring.percentage}
                      </text>
                    </g>
                  ))}

                  {/* Axis Spokes & Labels */}
                  {radarSvgConfig.axisPoints.map((axis, idx) => (
                    <g key={idx}>
                      <line
                        x1={radarSvgConfig.cx}
                        y1={radarSvgConfig.cy}
                        x2={axis.xOuter}
                        y2={axis.yOuter}
                        stroke="#cbd5e1"
                        strokeWidth="1.2"
                      />
                      <text
                        x={axis.xLabel}
                        y={axis.yLabel}
                        textAnchor={axis.textAnchor as any}
                        dominantBaseline="central"
                        fill="#1e293b"
                        fontSize="10"
                        fontWeight="800"
                        fontFamily="sans-serif"
                      >
                        {axis.label}
                      </text>
                    </g>
                  ))}

                  {/* 3. Rakip Polygon (Purple) */}
                  {competitors[1] && (
                    <polygon
                      points={radarSvgConfig.getPoints(competitors[1].metrics)}
                      fill="rgba(168, 85, 247, 0.08)"
                      stroke="#a855f7"
                      strokeWidth="1.5"
                    />
                  )}

                  {/* 2. Rakip Polygon (Amber) */}
                  {competitors[0] && competitors[0].id !== marketLeader.id && (
                    <polygon
                      points={radarSvgConfig.getPoints(competitors[0].metrics)}
                      fill="rgba(245, 158, 11, 0.1)"
                      stroke="#f59e0b"
                      strokeWidth="1.5"
                    />
                  )}

                  {/* 1. Rakip (Pazar Lideri) Polygon (Rose Dashed) */}
                  <polygon
                    points={radarSvgConfig.getPoints(marketLeader.metrics)}
                    fill="rgba(239, 68, 68, 0.12)"
                    stroke="#dc2626"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                  />

                  {/* Siteniz (User Entity) Polygon (Indigo Bold) */}
                  <polygon
                    points={radarSvgConfig.getPoints(userEntity.metrics)}
                    fill="rgba(79, 70, 229, 0.22)"
                    stroke="#4338ca"
                    strokeWidth="2.5"
                  />

                  {/* User Data Dots */}
                  {sixAxes.map((axis, i) => {
                    const angle = (i / sixAxes.length) * 2 * Math.PI - Math.PI / 2;
                    const val = Math.max(10, Math.min(100, userEntity.metrics[axis.key] || 0));
                    const r = (val / 100) * radarSvgConfig.radius;
                    const x = radarSvgConfig.cx + r * Math.cos(angle);
                    const y = radarSvgConfig.cy + r * Math.sin(angle);
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r="3.5"
                        fill="#4338ca"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                    );
                  })}
                </svg>
              </div>

              {/* Radar Legend & Key Findings */}
              <div className="col-span-6 space-y-3">
                {/* Entities Legend */}
                <div className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-200">
                  <div className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                    Radar Katmanları & Puan Ortalaması
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between p-1.5 rounded-lg bg-indigo-50/70 border border-indigo-100 font-bold text-indigo-950">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-indigo-600 ring-2 ring-indigo-200"></span>
                        <span>{userEntity.name} (Siteniz)</span>
                      </div>
                      <span className="font-mono text-indigo-700">#{userEntity.rank} Sıra • Puan: 84/100</span>
                    </div>

                    <div className="flex items-center justify-between p-1.5 rounded-lg bg-rose-50/70 border border-rose-100 font-bold text-rose-950">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-rose-600 ring-2 ring-rose-200"></span>
                        <span>{marketLeader.name} (Pazar Lideri)</span>
                      </div>
                      <span className="font-mono text-rose-700">#1 Sıra • Puan: 88/100</span>
                    </div>

                    {competitors.slice(1, 3).map((c, i) => (
                      <div key={c.id} className="flex items-center justify-between p-1 rounded-lg bg-slate-50 text-slate-700 text-[11px]">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${i === 0 ? "bg-amber-500" : "bg-purple-500"}`}></span>
                          <span>{c.name}</span>
                        </div>
                        <span className="font-mono text-slate-500">#{c.rank} Sıra</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Analytical Insights from Radar */}
                <div className="space-y-1 text-[11px] text-slate-700">
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                    <span className="font-bold text-emerald-900">✓ Sitenizin Liderlik Alanı: </span>
                    Sayfa Açılış Hızı (96/100, 0.02s Edge CDN) ve Teknik SEO & LocalBusiness Şema (94/100).
                  </div>
                  <div className="p-2 rounded-lg bg-amber-50 border border-amber-200">
                    <span className="font-bold text-amber-900">⚠ Kapatılması Gereken Açık: </span>
                    Backlink Kalitesi ve İçerik Rehberi Derinliği (rakip siteler blog kümesi ile otorite topluyor).
                  </div>
                  <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-200">
                    <span className="font-bold text-indigo-900">⚡ Stratejik Fırsat: </span>
                    Rakiplerin ağır LCP süreleri (+3.4sn) sayesinde, yeni arama trendlerinde hızlıca ilk sırayı alma potansiyeli.
                  </div>
                </div>
              </div>
            </div>

            {/* 6-Axis Comparative Benchmark Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 font-black text-[11px] text-slate-700">
                    <th className="p-2.5">Eksen / Boyut</th>
                    <th className="p-2.5 text-indigo-900 bg-indigo-50/70 font-black">{userEntity.name} (Siteniz)</th>
                    <th className="p-2.5 text-rose-900 bg-rose-50/50">{marketLeader.name} (#1)</th>
                    {competitors.slice(1, 3).map(c => (
                      <th key={c.id} className="p-2.5">{c.name} (#{c.rank})</th>
                    ))}
                    <th className="p-2.5">Sektör Ort.</th>
                    <th className="p-2.5 text-right">Rekabet Durumu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {sixAxes.map(axis => {
                    const uScore = userEntity.metrics[axis.key] || 0;
                    const lScore = marketLeader.metrics[axis.key] || 0;
                    const diff = uScore - lScore;
                    return (
                      <tr key={axis.key}>
                        <td className="p-2.5 font-bold text-slate-900">
                          <div>{axis.label}</div>
                          <div className="text-[9px] text-slate-400 font-normal">{axis.idealRange} ideal</div>
                        </td>
                        <td className="p-2.5 font-mono font-black text-indigo-950 bg-indigo-50/40">
                          {uScore} / 100
                        </td>
                        <td className="p-2.5 font-mono font-bold text-rose-900 bg-rose-50/20">
                          {lScore} / 100
                        </td>
                        {competitors.slice(1, 3).map(c => (
                          <td key={c.id} className="p-2.5 font-mono text-slate-600">
                            {c.metrics[axis.key] || 0} / 100
                          </td>
                        ))}
                        <td className="p-2.5 font-mono text-slate-500">72 / 100</td>
                        <td className="p-2.5 text-right font-bold">
                          {diff > 0 ? (
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              +{diff} Puan Üstün ✓
                            </span>
                          ) : diff === 0 ? (
                            <span className="text-slate-600">Baş Başa</span>
                          ) : (
                            <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              {diff} Puan Açık
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ================================================================= */}
          {/* SECTION 2: GELECEK SEO PERFORMANS TAHMİNCİSİ & 6 AYLIK BÜYÜME PROJEKSİYONU (D3.JS) */}
          {/* ================================================================= */}
          <div className="space-y-4 pt-4 border-t border-slate-200" style={{ pageBreakInside: "avoid" }}>
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="font-black text-slate-950 text-sm uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-black">2</span>
                <span>Gelecek SEO Performans Tahmincisi & Algoritma Güncelleme Simülasyonu (6 Aylık D3 Büyüme Projeksiyonu)</span>
              </div>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                Tahmini 6. Ay Sonu: +%126 Organik Trafik Sıçraması
              </span>
            </div>

            {/* Projected Curve SVG & Milestones */}
            <div className="grid grid-cols-12 gap-4 items-center bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
              <div className="col-span-7">
                <div className="text-[11px] font-bold text-slate-700 mb-2 flex items-center justify-between">
                  <span>6 Aylık Organik Trafik & Sıralama Simülasyon Eğrisi (Aylık Ziyaretçi)</span>
                  <div className="flex items-center gap-3 text-[9px]">
                    <span className="flex items-center gap-1 font-bold text-indigo-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block"></span> Siteniz (Tahmin)
                    </span>
                    <span className="flex items-center gap-1 text-slate-500 font-semibold">
                      <span className="w-2.5 h-0.5 bg-slate-400 inline-block"></span> 1. Rakip (Durağan)
                    </span>
                  </div>
                </div>

                {/* Inline SVG Chart */}
                <svg width="520" height="150" viewBox="0 0 520 150" className="overflow-visible w-full">
                  <defs>
                    <linearGradient id="curveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  {[30, 65, 100, 135].map((y, idx) => (
                    <line key={idx} x1="30" y1={y} x2="500" y2={y} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
                  ))}

                  {/* Y Axis Labels */}
                  <text x="5" y="34" fill="#94a3b8" fontSize="8" fontFamily="monospace">45K</text>
                  <text x="5" y="69" fill="#94a3b8" fontSize="8" fontFamily="monospace">30K</text>
                  <text x="5" y="104" fill="#94a3b8" fontSize="8" fontFamily="monospace">20K</text>
                  <text x="5" y="139" fill="#94a3b8" fontSize="8" fontFamily="monospace">10K</text>

                  {/* Competitor Flatline (dotted red/slate) */}
                  <path d="M 50 88 L 140 86 L 230 87 L 320 85 L 410 88 L 490 89" fill="none" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="4 4" />
                  
                  {/* User Site Projected Growth Area */}
                  <path d="M 50 105 L 140 92 L 230 76 L 320 58 L 410 42 L 490 28 L 490 135 L 50 135 Z" fill="url(#curveGradient)" />
                  
                  {/* User Site Projected Growth Line */}
                  <path d="M 50 105 L 140 92 L 230 76 L 320 58 L 410 42 L 490 28" fill="none" stroke="#4f46e5" strokeWidth="2.5" />

                  {/* Points & Month Markers */}
                  {[
                    { x: 50, y: 105, label: "1. Ay", val: "18.2K" },
                    { x: 140, y: 92, label: "2. Ay", val: "21.4K" },
                    { x: 230, y: 76, label: "3. Ay", val: "24.8K" },
                    { x: 320, y: 58, label: "4. Ay", val: "29.2K" },
                    { x: 410, y: 42, label: "5. Ay", val: "34.5K" },
                    { x: 490, y: 28, label: "6. Ay", val: "41.2K (Lider)" }
                  ].map((pt, idx) => (
                    <g key={idx}>
                      <circle cx={pt.x} cy={pt.y} r="3.5" fill="#4f46e5" stroke="#ffffff" strokeWidth="1.5" />
                      <text x={pt.x} y={pt.y - 7} fill="#1e1b4b" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                        {pt.val}
                      </text>
                      <text x={pt.x} y="148" fill="#64748b" fontSize="8" fontWeight="bold" textAnchor="middle">
                        {pt.label}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>

              {/* Simulation Insights & Milestone Cards */}
              <div className="col-span-5 space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200">
                  <div className="font-bold text-indigo-950 text-[10px] uppercase flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-600" />
                    <span>Algoritma Güncelleme Simülasyonu</span>
                  </div>
                  <p className="text-[10px] text-slate-700 mt-1 leading-snug">
                    Google Core Update ve Helpful Content yapay zeka güncellemesinde sitenizin temiz kod ve 0.02s CWV avantajı sayesinde <strong>+%24 organik sıçrama</strong>, monolit rakiplerde ise LCP cezası sebebiyle <strong>-%18 sıralama gerilemesi</strong> beklenmektedir.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg bg-white border border-slate-200 text-center">
                    <span className="text-[9px] text-slate-500 font-bold uppercase block">3. Ay Hedef Trafik</span>
                    <span className="text-xs font-black text-indigo-950 font-mono">24.800 / ay</span>
                    <span className="text-[8px] text-emerald-600 font-bold block">+%36 Artış</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-slate-200 text-center">
                    <span className="text-[9px] text-slate-500 font-bold uppercase block">6. Ay Hedef Trafik</span>
                    <span className="text-xs font-black text-emerald-950 font-mono">41.200 / ay</span>
                    <span className="text-[8px] text-emerald-700 font-bold block">Pazar Liderliği (#1)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* SECTION 3: RAKİP KIYASLAMA TABLOSU (ANAHTAR KELİME PERFORMANSLARI, HACİMLER & ZORLUK SEVİYELERİ) */}
          {/* ================================================================= */}
          <div className="space-y-4 pt-4 border-t border-slate-200" style={{ pageBreakInside: "avoid" }}>
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="font-black text-slate-950 text-sm uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-black">3</span>
                <span>Rakip Kıyaslama Tablosu (Anahtar Kelime Performansları, Arama Hacimleri ve Zorluk Seviyeleri)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                  {pdfKeywordRankings.length} Anahtar Kelime Kıyaslandı
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {pdfKeywordRankings.filter(k => k.status === "leading").length} Terimde Liderlik
                </span>
              </div>
            </div>

            {/* Keyword Comparison Quick Metric Highlights */}
            <div className="grid grid-cols-4 gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 font-bold block uppercase">Kıyaslanan Anahtar Kelime</span>
                <span className="text-sm font-black font-mono text-slate-900">{pdfKeywordRankings.length} Terim</span>
              </div>
              <div>
                <span className="text-[10px] text-cyan-700 font-bold block uppercase">Toplam Arama Hacmi</span>
                <span className="text-sm font-black font-mono text-cyan-900">
                  {(() => {
                    const totalVol = pdfKeywordRankings.reduce((acc, k) => {
                      const clean = (k.monthlyVolume || "").toLowerCase().replace(/[^0-9.k]/g, "");
                      if (clean.includes("k")) return acc + parseFloat(clean.replace("k", "")) * 1000;
                      return acc + (parseFloat(clean) || 0);
                    }, 0);
                    return totalVol > 1000 ? `${(totalVol / 1000).toFixed(1)}K / ay` : `${totalVol} / ay`;
                  })()}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-amber-700 font-bold block uppercase">Ortalama Zorluk Seviyesi</span>
                <span className="text-sm font-black font-mono text-amber-900">
                  %{Math.round(pdfKeywordRankings.reduce((acc, k) => acc + (k.difficulty || 0), 0) / (pdfKeywordRankings.length || 1))} (Orta)
                </span>
              </div>
              <div>
                <span className="text-[10px] text-indigo-700 font-bold block uppercase">Tahmini Trafik Kazancı</span>
                <span className="text-sm font-black font-mono text-indigo-950">+2.480 Ziyaretçi / ay</span>
              </div>
            </div>

            {/* Printable Comparison Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 font-black text-[10px] text-slate-700 uppercase tracking-wide">
                    <th className="p-2">Anahtar Kelime & Niyet</th>
                    <th className="p-2 text-right">Aylık Hacim</th>
                    <th className="p-2">Zorluk Seviyesi</th>
                    <th className="p-2 text-center bg-indigo-50/60 text-indigo-950 border-x border-indigo-200">
                      Siteniz ({userEntity.name})
                    </th>
                    <th className="p-2 text-center bg-rose-50/30 text-rose-900">
                      {marketLeader.name} (#1)
                    </th>
                    <th className="p-2 text-center bg-amber-50/30 text-amber-900">
                      {competitors[1]?.name || "2. Rakip"}
                    </th>
                    <th className="p-2 text-center">Fark & Durum</th>
                    <th className="p-2 text-right">Fırsat & Tavsiye</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {pdfKeywordRankings.map((kw) => {
                    const diffScore = kw.difficulty || 0;
                    const diffLabel = diffScore < 30 ? "Kolay" : diffScore <= 45 ? "Orta" : "Zor";
                    const diffColor = diffScore < 30 
                      ? "text-emerald-700 bg-emerald-50 border-emerald-200" 
                      : diffScore <= 45 
                      ? "text-amber-700 bg-amber-50 border-amber-200" 
                      : "text-rose-700 bg-rose-50 border-rose-200";

                    return (
                      <tr key={kw.id} className="hover:bg-slate-50/80">
                        <td className="p-2 font-bold text-slate-900">
                          <div className="flex items-center gap-1.5 font-mono text-[11px]">
                            <span>{kw.keyword}</span>
                            {kw.status === "leading" && (
                              <span className="text-[9px] px-1 rounded bg-amber-100 text-amber-800 font-bold">#1</span>
                            )}
                          </div>
                          <div className="text-[9px] text-slate-500 font-normal">
                            {kw.searchIntent} • {kw.serpFeatures?.[0] || "SERP Sonucu"}
                          </div>
                        </td>

                        <td className="p-2 text-right font-mono font-bold text-cyan-900">
                          {kw.monthlyVolume}
                        </td>

                        <td className="p-2">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${diffColor}`}>
                            %{diffScore} {diffLabel}
                          </span>
                        </td>

                        <td className="p-2 text-center font-mono font-black text-indigo-950 bg-indigo-50/30 border-x border-indigo-100">
                          {kw.userRank !== null ? (
                            <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-bold">
                              #{kw.userRank}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">&gt;20</span>
                          )}
                        </td>

                        <td className="p-2 text-center font-mono font-bold text-rose-800 bg-rose-50/20">
                          {kw.comp1Rank !== null ? `#${kw.comp1Rank}` : "-"}
                        </td>

                        <td className="p-2 text-center font-mono text-amber-800 bg-amber-50/20">
                          {kw.comp2Rank !== null ? `#${kw.comp2Rank}` : "-"}
                        </td>

                        <td className="p-2 text-center">
                          {kw.status === "leading" ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              Lider ✓
                            </span>
                          ) : kw.gap > 0 ? (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              {kw.gap} Sıra Açık
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              +{Math.abs(kw.gap)} Sıra Önde
                            </span>
                          )}
                        </td>

                        <td className="p-2 text-right">
                          <div className="font-mono font-bold text-emerald-700 text-[10px]">
                            {kw.trafficOpportunity}
                          </div>
                          <div className="text-[9px] text-slate-500 max-w-[220px] truncate ml-auto" title={kw.aiRecommendation}>
                            {kw.aiRecommendation}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ================================================================= */}
          {/* SECTION 4: SEO RAKİP PUAN KARTI (ALAN ADI OTORİTESİ, HIZ, BACKLİNK VE TRAFİK) */}
          {/* ================================================================= */}
          <div className="space-y-3 pt-4 border-t border-slate-200" style={{ pageBreakInside: "avoid" }}>
            <div className="font-black text-slate-950 text-sm uppercase tracking-wider flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-black">4</span>
                <span>SEO Rakip Puan Kartı (Domain Otoritesi, CWV Hız, Backlink ve Organik Trafik)</span>
              </div>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                4 İşletme Kıyaslandı
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 font-black text-[10px] text-slate-700 uppercase tracking-wide">
                    <th className="p-2">Kritik Sıralama Kriteri</th>
                    <th className="p-2 text-center bg-indigo-50/60 text-indigo-950 border-x border-indigo-200 font-bold">
                      Siteniz ({userEntity.name})
                    </th>
                    <th className="p-2 text-center bg-rose-50/30 text-rose-900 font-bold">
                      {marketLeader.name} (#1)
                    </th>
                    <th className="p-2 text-center bg-amber-50/30 text-amber-900 font-bold">
                      {competitors[1]?.name || "2. Rakip"}
                    </th>
                    <th className="p-2 text-center bg-slate-50 text-slate-700">
                      {competitors[2]?.name || "3. Rakip"}
                    </th>
                    <th className="p-2 text-center">Sektör Ortalaması</th>
                    <th className="p-2 text-right">Sitenizin Durumu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  <tr>
                    <td className="p-2 font-bold text-slate-900">Alan Adı Otoritesi (DA / Moz)</td>
                    <td className="p-2 text-center font-mono font-black text-indigo-950 bg-indigo-50/30 border-x border-indigo-100">48 / 100</td>
                    <td className="p-2 text-center font-mono text-rose-800">56 / 100</td>
                    <td className="p-2 text-center font-mono text-amber-800">42 / 100</td>
                    <td className="p-2 text-center font-mono text-slate-600">36 / 100</td>
                    <td className="p-2 text-center font-mono text-slate-500">44 / 100</td>
                    <td className="p-2 text-right font-bold text-indigo-700">Hızlı Yükselen</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-slate-900">Açılış Hızı (Core Web Vitals / LCP)</td>
                    <td className="p-2 text-center font-mono font-black text-emerald-700 bg-indigo-50/30 border-x border-indigo-100">0.02s (96 Puan)</td>
                    <td className="p-2 text-center font-mono text-rose-700">3.4s (64 Puan)</td>
                    <td className="p-2 text-center font-mono text-amber-700">2.8s (71 Puan)</td>
                    <td className="p-2 text-center font-mono text-slate-600">3.9s (58 Puan)</td>
                    <td className="p-2 text-center font-mono text-slate-500">2.9s (68 Puan)</td>
                    <td className="p-2 text-right font-bold text-emerald-700">+32 Puan Lider ✓</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-slate-900">Aylık Organik Trafik</td>
                    <td className="p-2 text-center font-mono font-black text-indigo-950 bg-indigo-50/30 border-x border-indigo-100">18.200 / ay</td>
                    <td className="p-2 text-center font-mono text-rose-800">24.500 / ay</td>
                    <td className="p-2 text-center font-mono text-amber-800">14.100 / ay</td>
                    <td className="p-2 text-center font-mono text-slate-600">9.800 / ay</td>
                    <td className="p-2 text-center font-mono text-slate-500">16.800 / ay</td>
                    <td className="p-2 text-right font-bold text-amber-700">-%25 Fark (Kapanabilir)</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-slate-900">Backlink Kalitesi & Referans Domain</td>
                    <td className="p-2 text-center font-mono font-black text-indigo-950 bg-indigo-50/30 border-x border-indigo-100">142 Ref (%94 DoFollow)</td>
                    <td className="p-2 text-center font-mono text-rose-800">310 Ref Domain</td>
                    <td className="p-2 text-center font-mono text-amber-800">118 Ref Domain</td>
                    <td className="p-2 text-center font-mono text-slate-600">76 Ref Domain</td>
                    <td className="p-2 text-center font-mono text-slate-500">180 Ref Domain</td>
                    <td className="p-2 text-right font-bold text-indigo-700">Yüksek Kalite Gücü</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-slate-900">İndekslenen Sayfa & Kapsam</td>
                    <td className="p-2 text-center font-mono font-black text-indigo-950 bg-indigo-50/30 border-x border-indigo-100">185 Sayfa</td>
                    <td className="p-2 text-center font-mono text-rose-800">420 Sayfa</td>
                    <td className="p-2 text-center font-mono text-amber-800">240 Sayfa</td>
                    <td className="p-2 text-center font-mono text-slate-600">110 Sayfa</td>
                    <td className="p-2 text-center font-mono text-slate-500">260 Sayfa</td>
                    <td className="p-2 text-right font-bold text-amber-700">İçerik Büyütme Fırsatı</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-slate-900">Mobil Deneyim Skoru</td>
                    <td className="p-2 text-center font-mono font-black text-emerald-700 bg-indigo-50/30 border-x border-indigo-100">98 / 100</td>
                    <td className="p-2 text-center font-mono text-rose-800">68 / 100</td>
                    <td className="p-2 text-center font-mono text-amber-800">74 / 100</td>
                    <td className="p-2 text-center font-mono text-slate-600">62 / 100</td>
                    <td className="p-2 text-center font-mono text-slate-500">72 / 100</td>
                    <td className="p-2 text-right font-bold text-emerald-700">Kusursuz Liderlik ✓</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ================================================================= */}
          {/* SECTION 4B: SEO OTORİTE MATRİSİ (D3 ÇOK SÜTUNLU ALAN ADI OTORİTESİ, BACKLİNK VE TRAFİK) */}
          {/* ================================================================= */}
          <div className="space-y-3 pt-4 border-t border-slate-200" style={{ pageBreakInside: "avoid" }}>
            <div className="font-black text-slate-950 text-sm uppercase tracking-wider flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-lg bg-indigo-700 text-white flex items-center justify-center text-xs font-black">4B</span>
                <span>SEO Otorite Matrisi (D3 Çok Sütunlu Alan Adı Otoritesi, Backlink Kalitesi & Aylık Trafik)</span>
              </div>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                Moz DA &bull; Ahrefs DR &bull; %94 DoFollow &bull; 18.2K Ziyaret
              </span>
            </div>

            <div className="grid grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Domain Otoritesi (DA)</div>
                <div className="font-mono text-sm font-black text-indigo-900 mt-0.5">DA 48 (DR 52)</div>
                <div className="text-[10px] text-emerald-600 font-semibold">Sektör Ortalaması Üstü (+2.5)</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Referans Domain & Kalite</div>
                <div className="font-mono text-sm font-black text-slate-900 mt-0.5">142 Ref Domain</div>
                <div className="text-[10px] text-emerald-700 font-bold">%94 DoFollow Kalitesi</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Aylık Organik Trafik</div>
                <div className="font-mono text-sm font-black text-slate-900 mt-0.5">18.200 / ay</div>
                <div className="text-[10px] text-slate-500">Tahmini Değer: $14.800</div>
              </div>
              <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200">
                <div className="text-[10px] text-indigo-700 font-bold uppercase">1. Sıraya Geçiş Süresi</div>
                <div className="font-mono text-sm font-black text-indigo-950 mt-0.5">~90 Gün</div>
                <div className="text-[10px] text-indigo-800 font-semibold">0.02s Hız Avantajı ile</div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 font-black text-[10px] text-slate-700 uppercase tracking-wide">
                    <th className="p-2">İşletme / Varlık</th>
                    <th className="p-2 text-center">Moz DA</th>
                    <th className="p-2 text-center">Ahrefs DR</th>
                    <th className="p-2 text-center">Ref Domain</th>
                    <th className="p-2 text-center">Toplam Backlink</th>
                    <th className="p-2 text-center">DoFollow Oranı</th>
                    <th className="p-2 text-center">Aylık Trafik</th>
                    <th className="p-2 text-right">Stratejik Hedef & Eylem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  <tr className="bg-indigo-50/60 font-semibold">
                    <td className="p-2 font-bold text-indigo-950">{activeConfig.companyName || "Siteniz"} (Siteniz)</td>
                    <td className="p-2 text-center font-mono font-black text-indigo-950">48 / 100</td>
                    <td className="p-2 text-center font-mono font-bold text-slate-700">52</td>
                    <td className="p-2 text-center font-mono font-bold text-cyan-800">142</td>
                    <td className="p-2 text-center font-mono text-slate-600">4.850</td>
                    <td className="p-2 text-center font-bold text-emerald-700">%94</td>
                    <td className="p-2 text-center font-mono font-bold text-slate-900">18.200</td>
                    <td className="p-2 text-right font-bold text-indigo-800">90 günde 8 DA farkını kapatıp liderliği devralma</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-slate-900">Pazar Lideri (#1)</td>
                    <td className="p-2 text-center font-mono text-rose-800 font-bold">56 / 100</td>
                    <td className="p-2 text-center font-mono text-slate-700">61</td>
                    <td className="p-2 text-center font-mono text-cyan-800">310</td>
                    <td className="p-2 text-center font-mono text-slate-600">19.400</td>
                    <td className="p-2 text-center text-slate-700">%81</td>
                    <td className="p-2 text-center font-mono text-slate-900">24.500</td>
                    <td className="p-2 text-right text-rose-700 font-medium">Zayıf LCP (3.4s) ve %4 spam skoru ile gerileme riski</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-slate-900">Bölgesel Meydan Okuyan</td>
                    <td className="p-2 text-center font-mono text-amber-800 font-bold">42 / 100</td>
                    <td className="p-2 text-center font-mono text-slate-700">44</td>
                    <td className="p-2 text-center font-mono text-cyan-800">118</td>
                    <td className="p-2 text-center font-mono text-slate-600">3.200</td>
                    <td className="p-2 text-center text-slate-700">%76</td>
                    <td className="p-2 text-center font-mono text-slate-900">14.100</td>
                    <td className="p-2 text-right text-amber-700 font-medium">Yerel harita odaklı, köşe taşı içerik derinliği eksik</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-slate-900">Niş Rakip Servis</td>
                    <td className="p-2 text-center font-mono text-slate-600">36 / 100</td>
                    <td className="p-2 text-center font-mono text-slate-700">38</td>
                    <td className="p-2 text-center font-mono text-cyan-800">76</td>
                    <td className="p-2 text-center font-mono text-slate-600">1.950</td>
                    <td className="p-2 text-center text-slate-700">%71</td>
                    <td className="p-2 text-center font-mono text-slate-900">9.800</td>
                    <td className="p-2 text-right text-slate-600 font-medium">Aşırı KW doldurma ve zayıf otorite nedeniyle düşüşte</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ================================================================= */}
          {/* SECTION 5: RAKİPLERİN İÇERİK STRATEJİSİ KIYASLAYICI */}
          {/* ================================================================= */}
          <div className="space-y-3 pt-4 border-t border-slate-200" style={{ pageBreakInside: "avoid" }}>
            <div className="font-black text-slate-950 text-sm uppercase tracking-wider flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-black">5</span>
                <span>Rakiplerin İçerik Stratejisi Kıyaslayıcı (Başlık Hiyerarşisi, İçerik Uzunluğu, Anahtar Kelime Yoğunluğu)</span>
              </div>
              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                En Çok Trafik Çeken 3 Sayfa Türü
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 font-black text-[10px] text-slate-700 uppercase tracking-wide">
                    <th className="p-2">Sayfa Türü & Kapsam</th>
                    <th className="p-2 text-center">Rakip Ort. Kelime</th>
                    <th className="p-2 text-center">Başlık Hiyerarşisi (H1-H3)</th>
                    <th className="p-2 text-center">Anahtar Kelime Yoğunluğu</th>
                    <th className="p-2 text-center bg-indigo-50/60 text-indigo-950 border-x border-indigo-200">Sitenizin Stratejisi</th>
                    <th className="p-2 text-right">Önerilen İçerik Hamlesi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  <tr>
                    <td className="p-2 font-bold text-slate-900">
                      <div>Ana Hizmet Sayfaları</div>
                      <div className="text-[9px] text-slate-500 font-normal">Ticari / Satın Alma Odaklı</div>
                    </td>
                    <td className="p-2 text-center font-mono text-slate-700">850 Kelime (Kısa)</td>
                    <td className="p-2 text-center font-mono text-slate-600">1x H1, 3x H2, 0x H3</td>
                    <td className="p-2 text-center font-mono text-amber-700">%1.2 (Yetersiz Semantik)</td>
                    <td className="p-2 text-center font-mono font-bold text-indigo-950 bg-indigo-50/30 border-x border-indigo-100">
                      1.450 Kelime + SSS Şeması
                    </td>
                    <td className="p-2 text-right font-semibold text-emerald-700">Semantik H2/H3 Kümeleme Yapın</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-slate-900">
                      <div>Fiyatlandırma & Maliyet Rehberleri</div>
                      <div className="text-[9px] text-slate-500 font-normal">Karar Verme & Fiyat Arayışı</div>
                    </td>
                    <td className="p-2 text-center font-mono text-slate-700">420 Kelime (Yüzeysel)</td>
                    <td className="p-2 text-center font-mono text-slate-600">1x H1, 2x H2</td>
                    <td className="p-2 text-center font-mono text-rose-700">%2.4 (Aşırı KW Yükleme)</td>
                    <td className="p-2 text-center font-mono font-bold text-indigo-950 bg-indigo-50/30 border-x border-indigo-100">
                      Şeffaf Fiyat Matrisi + Hesaplama
                    </td>
                    <td className="p-2 text-right font-semibold text-emerald-700">Doğrudan Fiyat Tablosu Sunun</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-slate-900">
                      <div>Bölgesel İlçe / Semt Açılış Sayfaları</div>
                      <div className="text-[9px] text-slate-500 font-normal">Yerel Hizmet Aramaları</div>
                    </td>
                    <td className="p-2 text-center font-mono text-slate-700">300 Kelime (Kopya Şablon)</td>
                    <td className="p-2 text-center font-mono text-slate-600">1x H1, 1x H2</td>
                    <td className="p-2 text-center font-mono text-slate-600">%1.0 (Düşük Alaka)</td>
                    <td className="p-2 text-center font-mono font-bold text-indigo-950 bg-indigo-50/30 border-x border-indigo-100">
                      Mahalle Referansları + Harita
                    </td>
                    <td className="p-2 text-right font-semibold text-emerald-700">Local 3-Pack Harita Entegrasyonu</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ================================================================= */}
          {/* SECTION 6: GLOBAL SEO ISI HARİTASI & BÖLGESEL PAZAR PAYI DAĞILIMI */}
          {/* ================================================================= */}
          <div className="space-y-3 pt-4 border-t border-slate-200" style={{ pageBreakInside: "avoid" }}>
            <div className="font-black text-slate-950 text-sm uppercase tracking-wider flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-lg bg-indigo-700 text-white flex items-center justify-center text-xs font-black">6</span>
                <span>Global SEO Isı Haritası & Bölgesel Pazar Payı Dağılımı (Gemini 3.8 Flash)</span>
              </div>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                10 Hedef Pazar • %76 Global Ayak İzi Endeksi
              </span>
            </div>

            <div className="grid grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500 font-bold uppercase">İstanbul & Marmara</div>
                <div className="font-mono text-xs font-black text-slate-900 mt-0.5">Siteniz: %28 Pay (Skor: 84)</div>
                <div className="text-[10px] text-slate-500">Lider: %42 (Skor: 94)</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500 font-bold uppercase">İzmir & Ege Bölgesi</div>
                <div className="font-mono text-xs font-black text-emerald-700 mt-0.5">Siteniz: %32 Pay (1. Sıra)</div>
                <div className="text-[10px] text-slate-500">Lider: %28 • Dominant</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Almanya / DACH (Gurbetçi)</div>
                <div className="font-mono text-xs font-black text-indigo-700 mt-0.5">Beyaz Boşluk / Fırsat</div>
                <div className="text-[10px] text-slate-500">74K Arama • Rakipler 0</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Körfez / BAE (Dubai Hub)</div>
                <div className="font-mono text-xs font-black text-amber-700 mt-0.5">Sıfır Rakip Varlığı</div>
                <div className="text-[10px] text-slate-500">Arapça/İngilizce Katalog</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs space-y-1">
              <div className="font-bold text-indigo-950 text-[11px] flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-700" />
                <span>Gemini Dijital Ayak İzi & Kuşatma (Flanking) Direktifi</span>
              </div>
              <p className="text-slate-700 text-[10px] leading-relaxed">
                Liderin yüksek backlink hacmiyle kilitlediği ana metropolde doğrudan kaynak tüketmek yerine; Ankara B2B sanayi koridoru, Akdeniz turizm rotaları ve Almanya DACH pazarında "de-DE" hreflang mimarisiyle çevreleme yapılarak organik pazar payı %42 genişletilmelidir.
              </p>
            </div>
          </div>

          {/* ================================================================= */}
          {/* SECTION 7: İÇERİK BOŞLUĞU ISI HARİTASI (CONTENT GAP MAP) */}
          {/* ================================================================= */}
          <div className="space-y-3 pt-4 border-t border-slate-200" style={{ pageBreakInside: "avoid" }}>
            <div className="font-black text-slate-950 text-sm uppercase tracking-wider flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-lg bg-rose-600 text-white flex items-center justify-center text-xs font-black">7</span>
                <span>İçerik Boşluğu Isı Haritası (Content Gap Map - Arama Niyeti Matrisi)</span>
              </div>
              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                4 Arama Niyetinde Penetrasyon Skoru
              </span>
            </div>

            <div className="grid grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-500">1. Bilgilendirici</span>
                  <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">%72 Kapsam</span>
                </div>
                <div className="text-xs font-bold text-slate-900 mt-1">"Nasıl Yapılır / Rehberler"</div>
                <p className="text-[10px] text-slate-600 leading-snug">
                  Rakipler %88 kapsama sahip. Siteniz 3 adet derinlemesine sektörel rehberle bu boşluğu kapatabilir.
                </p>
                <div className="text-[9px] text-rose-700 font-semibold pt-1">Kaçırılan Potansiyel: 6.400 / ay</div>
              </div>

              <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-indigo-700">2. Ticari Karşılaştırma</span>
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">%89 Kapsam</span>
                </div>
                <div className="text-xs font-bold text-indigo-950 mt-1">"En İyi / Fiyat Karşılaştırma"</div>
                <p className="text-[10px] text-slate-600 leading-snug">
                  Siteniz liderden (+%7) daha üstün. Şeffaf paket karşılaştırmaları yüksek dönüşüm getirmektedir.
                </p>
                <div className="text-[9px] text-emerald-700 font-semibold pt-1">Üstünlük: +%38 Dönüşüm</div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-emerald-800">3. İşlemsel / Dönüşüm</span>
                  <span className="text-[9px] font-bold text-emerald-700 bg-white px-1.5 py-0.5 rounded border border-emerald-300">%94 Kapsam</span>
                </div>
                <div className="text-xs font-bold text-emerald-950 mt-1">"Hemen Ara / Randevu / Sipariş"</div>
                <p className="text-[10px] text-slate-600 leading-snug">
                  0.02s hız ve tek tık WhatsApp/Telefon butonuyla rakiplerin ağır formlarına karşı mutlak üstünlük.
                </p>
                <div className="text-[9px] text-emerald-700 font-semibold pt-1">Sektör Lideri: 10/10 Skor</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-500">4. Gezinme / Marka</span>
                  <span className="text-[9px] font-bold text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded">%78 Kapsam</span>
                </div>
                <div className="text-xs font-bold text-slate-900 mt-1">"Şirket İsmi + Giriş"</div>
                <p className="text-[10px] text-slate-600 leading-snug">
                  Marka bilinirliği arttıkça doğrudan arama hacmi güçlenmektedir. Google İşletme Profili doğrulaması tamdır.
                </p>
                <div className="text-[9px] text-indigo-700 font-semibold pt-1">Güven Skoru: 9.8 / 10</div>
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* SECTION 8: STRATEJİK AKSİYON PLANLAYICI (GEMINI DESTEKLİ 3 AYLIK YOL HARİTASI) */}
          {/* ================================================================= */}
          <div className="space-y-3 pt-4 border-t border-slate-200" style={{ pageBreakInside: "avoid" }}>
            <div className="font-black text-slate-950 text-sm uppercase tracking-wider flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-black">8</span>
                <span>Stratejik Aksiyon Planlayıcı (Gemini Destekli 3 Aylık Öncelikli SEO Büyüme Görevleri)</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Hedef: 90 Günde Sektör 1. Sırası
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white font-black text-[10px] uppercase">
                    1. Ay: Teknik & Hız Temelleri
                  </span>
                  <span className="text-[9px] font-bold text-indigo-700">Öncelik: Kritik</span>
                </div>
                <ul className="space-y-1.5 text-[10px] text-slate-700">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-indigo-600 shrink-0 mt-0.5" />
                    <span>0.02s hız avantajını SERP meta başlığına yansıtın ("15 Dk Varış / Anında Yanıt").</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-indigo-600 shrink-0 mt-0.5" />
                    <span>LocalBusiness ve FAQPage zengin şemalarını Google Arama Konsolunda doğrulayın.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-indigo-600 shrink-0 mt-0.5" />
                    <span>Rakiplerin israf ettiği negatif reklam kelimelerini filtre kalkanına ekleyin.</span>
                  </li>
                </ul>
                <div className="pt-1 border-t border-slate-200 text-[10px] font-bold text-indigo-900 flex justify-between">
                  <span>KPI Hedefi:</span>
                  <span className="text-emerald-700 font-mono">+%22 SERP CTR</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-cyan-600 text-white font-black text-[10px] uppercase">
                    2. Ay: İçerik Kümeleme & Otorite
                  </span>
                  <span className="text-[9px] font-bold text-cyan-700">Öncelik: Yüksek</span>
                </div>
                <ul className="space-y-1.5 text-[10px] text-slate-700">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-cyan-600 shrink-0 mt-0.5" />
                    <span>Hacmi aniden sıçrayan terimler için AI Blog ile 3 adet köşe taşı rehber yayınlayın.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-cyan-600 shrink-0 mt-0.5" />
                    <span>Rakiplerin zayıf kaldığı semt/ilçe alt sayfalarını semantik içerikle güçlendirin.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-cyan-600 shrink-0 mt-0.5" />
                    <span>Yüksek otoriteye sahip 8 yerel rehber ve sektörel dizin backlinkini tamamlayın.</span>
                  </li>
                </ul>
                <div className="pt-1 border-t border-slate-200 text-[10px] font-bold text-indigo-900 flex justify-between">
                  <span>KPI Hedefi:</span>
                  <span className="text-emerald-700 font-mono">+3.200 Ziyaretçi / ay</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-black text-[10px] uppercase">
                    3. Ay: SERP Hakimiyeti & CRO
                  </span>
                  <span className="text-[9px] font-bold text-emerald-700">Öncelik: Stratejik</span>
                </div>
                <ul className="space-y-1.5 text-[10px] text-slate-700">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Google Haritalar Local 3-Pack paketinde 1. sıraya kalıcı yerleşim sağlayın.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                    <span>DACH gurbetçi pazarı için "de-DE" rehberlerini canlıya alarak yurtdışı trafiğini çekin.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Mobil dönüşüm hunisini (A/B Testi) optimize ederek çağrı dönüşümünü %4.8'e çıkarın.</span>
                  </li>
                </ul>
                <div className="pt-1 border-t border-slate-200 text-[10px] font-bold text-indigo-900 flex justify-between">
                  <span>KPI Hedefi:</span>
                  <span className="text-emerald-700 font-mono">1. Sıra & %4.8 CRO</span>
                </div>
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* SECTION 9: İÇERİK GELİŞTİRME ÖNERİLERİ (BLOG & META TASLAKLARI) */}
          {/* ================================================================= */}
          <div className="space-y-3 pt-4 border-t border-slate-200" style={{ pageBreakInside: "avoid" }}>
            <div className="font-black text-slate-950 text-sm uppercase tracking-wider flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-black">9</span>
                <span>İçerik Geliştirme Önerileri (Rakiplerin Açıklarına Karşı Trafik Odaklı Blog & Meta Taslakları)</span>
              </div>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                Gemini Destekli 3 Hazır Taslak
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-blue-700 uppercase bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">Taslak 1: Fiyat Rehberi</span>
                  <span className="text-[9px] font-mono text-slate-500 font-bold">4.8K Arama / ay</span>
                </div>
                <div className="font-bold text-slate-900 text-[11px] leading-snug">
                  2026 {activeConfig.city} {activeConfig.sector} Fiyatları: Süreç ve Dikkat Edilmesi Gerekenler
                </div>
                <p className="text-[10px] text-slate-600 leading-relaxed italic bg-white p-2 rounded-lg border border-slate-200">
                  "Meta Açıklaması: {activeConfig.city} genelinde güncel {activeConfig.sector.toLowerCase()} fiyatları, gizli masrafsız şeffaf tarife ve uzman desteği. 15 dakikada anında teklif alın!"
                </p>
                <div className="text-[9px] text-indigo-700 font-semibold">Hedef Terim: {activeConfig.city} {activeConfig.sector} fiyatları</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-rose-700 uppercase bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">Taslak 2: Acil Çözüm</span>
                  <span className="text-[9px] font-mono text-slate-500 font-bold">3.2K Arama / ay</span>
                </div>
                <div className="font-bold text-slate-900 text-[11px] leading-snug">
                  Acil {activeConfig.sector} İhtiyacında 15 Dakikada Varış ve Garantili Çözüm Rehberi
                </div>
                <p className="text-[10px] text-slate-600 leading-relaxed italic bg-white p-2 rounded-lg border border-slate-200">
                  "Meta Açıklaması: 7/24 {activeConfig.city} acil {activeConfig.sector.toLowerCase()} servisi. Hızlı ekip yönlendirme, sabit fiyat sözü ve kasko teminatı ile anında yanınızdayız."
                </p>
                <div className="text-[9px] text-indigo-700 font-semibold">Hedef Terim: acil {activeConfig.sector} {activeConfig.city}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-emerald-700 uppercase bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Taslak 3: Karşılaştırma</span>
                  <span className="text-[9px] font-mono text-slate-500 font-bold">1.9K Arama / ay</span>
                </div>
                <div className="font-bold text-slate-900 text-[11px] leading-snug">
                  Doğru {activeConfig.sector} Nasıl Seçilir? Rakiplerin Gizlediği 5 Ek Masraf
                </div>
                <p className="text-[10px] text-slate-600 leading-relaxed italic bg-white p-2 rounded-lg border border-slate-200">
                  "Meta Açıklaması: {activeConfig.sector} hizmeti alırken mağdur olmamak için bilmeniz gereken püf noktalar. Şeffaf fiyatlandırma kriterleri ve güvenilirlik kontrol listesi."
                </p>
                <div className="text-[9px] text-indigo-700 font-semibold">Hedef Terim: güvenilir {activeConfig.sector} tavsiye</div>
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* SECTION 10: SEO & PAZAR SWOT MATRİSİ */}
          {/* ================================================================= */}
          <div className="space-y-3 pt-4 border-t border-slate-200" style={{ pageBreakInside: "avoid" }}>
            <div className="font-black text-slate-950 text-sm uppercase tracking-wider flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-lg bg-indigo-900 text-white flex items-center justify-center text-xs font-black">10</span>
                <span>SEO & Dijital Pazar SWOT Matrisi (Güçlü, Zayıf, Fırsat, Tehdit)</span>
              </div>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                Stratejik Durum Değerlendirmesi
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                <div className="font-black text-emerald-950 text-[11px] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Güçlü Yönler (Strengths)</span>
                </div>
                <ul className="space-y-1 text-[10px] text-slate-700">
                  <li>• <strong>0.02s Cloudflare Edge Hızı:</strong> Liderden +32 puan üstün açılış hızı Sabırsız mobil kullanıcıları çeker.</li>
                  <li>• <strong>Temiz Şema Mimarisi:</strong> LocalBusiness ve FAQPage JSON-LD doğrulamaları ile SERP'te zengin görünüm.</li>
                  <li>• <strong>Modern UI / UX:</strong> Mobil uyumlu temiz tasarım ile %4.2 üzerinde form dönüşüm oranı.</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                <div className="font-black text-amber-950 text-[11px] flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Zayıf Yönler (Weaknesses)</span>
                </div>
                <ul className="space-y-1 text-[10px] text-slate-700">
                  <li>• <strong>Alan Adı Yaşı:</strong> Pazar liderinin 8 yıllık otoritesine karşılık daha genç domain geçmişi.</li>
                  <li>• <strong>Blog Makale Hacmi:</strong> Liderin 420 indeksli sayfasına kıyasla 185 sayfalık derinlik (Kapatılmalı).</li>
                  <li>• <strong>Yorum Sayısı:</strong> Google İşletme Profilinde rakibin 180+ yorumuna karşı 45 doğrulanmış değerlendirme.</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-1.5">
                <div className="font-black text-indigo-950 text-[11px] flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Pazar Fırsatları (Opportunities)</span>
                </div>
                <ul className="space-y-1 text-[10px] text-slate-700">
                  <li>• <strong>Rakiplerin Ağır LCP Hataları:</strong> Rakipler 3.4s yavaş kaldığı için sabırsız kullanıcıları yakalama şansı.</li>
                  <li>• <strong>DACH / Gurbetçi Pazarı:</strong> 74K arama hacimli Almanya pazarında rakiplerin sıfır varlığı.</li>
                  <li>• <strong>Google Ads Arbitrajı:</strong> Negatif anahtar kelimelerle rakiplerin yaktığı bütçeyi 0 TL SEO ile toplama.</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 space-y-1.5">
                <div className="font-black text-rose-950 text-[11px] flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-rose-600" />
                  <span>Tehditler & Karşı Hamleler (Threats)</span>
                </div>
                <ul className="space-y-1 text-[10px] text-slate-700">
                  <li>• <strong>Liderin Agresif Backlink Ağı:</strong> Liderin ayda 12-15 yeni dofollow backlink kazanımı (Düzenli takip).</li>
                  <li>• <strong>Ani Hacim Patlamaları:</strong> Trend aramalarda rakiplerin hızlı blog yayınlayarak sırayı ele geçirme riski.</li>
                  <li>• <strong>Geniş Eşlemeli Reklamlar:</strong> Rakiplerin yüksek CPC teklifleriyle organik ilk sırayı SERP'te aşağı itmesi.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* SECTION 11: REKLAM HARCAMA VERİMLİLİĞİ & ROAS ARBİTRAJ ANALİZİ */}
          {/* ================================================================= */}
          <div className="space-y-3 pt-4 border-t border-slate-200" style={{ pageBreakInside: "avoid" }}>
            <div className="font-black text-slate-950 text-sm uppercase tracking-wider flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-xs font-black">11</span>
                <span>Rakiplerin Reklam Harcama Verimliliği & SEO Arbitraj Analizi (Google Ads & ROAS)</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Aylık ~₺18.500 İsraf Önleme & 0 TL Arbitraj Potansiyeli
              </span>
            </div>

            <div className="grid grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Sektör Reklam Havuzu</div>
                <div className="font-mono text-xs font-black text-slate-900 mt-0.5">₺240.000 / ay</div>
                <div className="text-[10px] text-slate-500">Bölgesel 3 Ana Rakip</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Ortalama Tık Başı (CPC)</div>
                <div className="font-mono text-xs font-black text-indigo-700 mt-0.5">₺42.50 / tık</div>
                <div className="text-[10px] text-slate-500">Google Arama Ağı</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Rakiplerin İsraf Harcaması</div>
                <div className="font-mono text-xs font-black text-rose-700 mt-0.5">₺68.400 / ay (%28.5)</div>
                <div className="text-[10px] text-slate-500">Negatif Kelime Eksikliği</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Sitenizin SEO Arbitrajı</div>
                <div className="font-mono text-xs font-black text-emerald-700 mt-0.5">₺0 Reklam Maliyeti</div>
                <div className="text-[10px] text-emerald-700 font-semibold">Organik İlk Sıra Üstünlüğü</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-1">
              <div className="font-bold text-emerald-950 text-[11px] flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-emerald-700" />
                <span>Reklam Verimliliği & İsraf Önleme Direktifi</span>
              </div>
              <p className="text-slate-700 text-[10px] leading-relaxed">
                Rakipler "ücretsiz", "fiyatları nedir", "şikayet" gibi satın alma niyeti olmayan genel aramalarda geniş eşleme (broad match) kullanarak her ay bütçelerinin %28'ini yakmaktadır. Siteniz bu terimleri negatif kelime kalkanıyla engelleyip, yüksek CPC'li ticari aramalarda 0.02s hız avantajıyla 10/10 Google Kalite Skoru alarak tıklama maliyetlerini %45 düşürebilir.
              </p>
            </div>
          </div>

          {/* ================================================================= */}
          {/* SECTION 12: RAKİP FİYATLANDIRMA STRATEJİSİ & GEMINI FİYAT REKABETİ */}
          {/* ================================================================= */}
          <div className="space-y-3 pt-4 border-t border-slate-200" style={{ pageBreakInside: "avoid" }}>
            <div className="font-black text-slate-950 text-sm uppercase tracking-wider flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-lg bg-teal-600 text-white flex items-center justify-center text-xs font-black">12</span>
                <span>Rakiplerin Fiyatlandırma Stratejisi & Gemini Fiyat Rekabeti Yönetici Özeti</span>
              </div>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                Pazar Liderine Göre -%26 Daha Makul (Sweet Spot)
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-[10px] font-bold uppercase text-slate-500">Pazar Fiyat Endeksi</div>
                <div className="font-mono text-sm font-black text-slate-900">
                  Siteniz: 97 <span className="text-emerald-700 text-xs">(Optimum Değer)</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  Lider: 126 (+%26) • Bölgesel: 84 (-%16)
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-[10px] font-bold uppercase text-slate-500">Fiyat Rekabet Gücü</div>
                <div className="font-mono text-sm font-black text-teal-700">
                  %92 / 100
                </div>
                <div className="text-[10px] text-slate-500">
                  Kâr marjını kırmadan dönüşüm artışı
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-[10px] font-bold uppercase text-slate-500">Potansiyel Gelir Artışı</div>
                <div className="font-mono text-sm font-black text-indigo-700">
                  +%28 Ek Ciro
                </div>
                <div className="text-[10px] text-slate-500">
                  Çıpalama & Şeffaf Fiyat Vitrini ile
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-1">
              <div className="font-bold text-emerald-950 text-[11px] flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-emerald-700" />
                <span>Gemini Fiyat Rekabeti Stratejik Direktifi</span>
              </div>
              <p className="text-slate-700 text-[10px] leading-relaxed">
                Pazar lideri marka rantına güvenerek yüksek fiyat uygularken, bölgesel rakip ise sonradan gizli maliyet çıkararak müşteri güvenini kaybetmektedir. Siteniz "Her Şey Dahil Sabit Fiyat Sözü + 15 Dakikada Varış + Kasko Teminatı" güvencesiyle fiyat kırma savaşına girmeden en yüksek dönüşüm ve kârlılığı yakalayabilir.
              </p>
            </div>
          </div>

          {/* ================================================================= */}
          {/* SECTION 13: GÜNCEL SEO REKABET ALARM GÜNLÜKLERİ */}
          {/* ================================================================= */}
          <div className="space-y-4 pt-4 border-t border-slate-200" style={{ pageBreakInside: "avoid" }}>
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="font-black text-slate-950 text-sm uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-lg bg-amber-600 text-white flex items-center justify-center text-xs font-black">13</span>
                <span>Güncel SEO Rekabet Alarm Günlükleri (Ani Hacim & Sıralama Dalgalanmaları)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  {recentAlerts.length} Kayıtlı Olay
                </span>
                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  {alertSummary.volumeSpikeAlerts} Ani Hacim Patlaması
                </span>
              </div>
            </div>

            {/* Alert Summary Banner */}
            <div className="grid grid-cols-4 gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 font-bold block uppercase">Toplam Kayıtlı Alarm</span>
                <span className="text-sm font-black font-mono text-slate-900">{alertSummary.totalAlerts} Bildirim</span>
              </div>
              <div>
                <span className="text-[10px] text-amber-700 font-bold block uppercase">Kritik Hacim Patlaması</span>
                <span className="text-sm font-black font-mono text-amber-900">{alertSummary.volumeSpikeAlerts} Terim (+%35 Üstü)</span>
              </div>
              <div>
                <span className="text-[10px] text-rose-700 font-bold block uppercase">Aylık Trafik Riski</span>
                <span className="text-sm font-black font-mono text-rose-900">-{alertSummary.totalEstimatedTrafficLoss.toLocaleString()} Ziyaretçi</span>
              </div>
              <div>
                <span className="text-[10px] text-indigo-700 font-bold block uppercase">En Büyük Tehdit</span>
                <span className="text-sm font-black text-indigo-950 truncate block">{alertSummary.topThreatCompetitor || marketLeader.name}</span>
              </div>
            </div>

            {/* Comprehensive SEO Alert Logs Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 font-black text-[11px] text-slate-700">
                    <th className="p-2.5">Zaman & Seviye</th>
                    <th className="p-2.5">Anahtar Kelime & Niyet</th>
                    <th className="p-2.5">Arama Hacmi Değişimi</th>
                    <th className="p-2.5">Rakip & Sıralama</th>
                    <th className="p-2.5">Siteniz</th>
                    <th className="p-2.5">Trafik Etkisi</th>
                    <th className="p-2.5">Teşhis & Karşı Hamle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {recentAlerts.slice(0, 5).map((alert) => (
                    <tr key={alert.id} className={alert.severity === "critical" ? "bg-rose-50/20" : ""}>
                      <td className="p-2.5">
                        <div className="font-bold text-slate-900">{alert.detectedAtFormatted || "Bugün"}</div>
                        <span className={`inline-block text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase ${
                          alert.severity === "critical"
                            ? "bg-rose-100 text-rose-800"
                            : alert.severity === "warning"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {alert.severity === "critical" ? "Kritik" : alert.severity === "warning" ? "Uyarı" : "Fırsat"}
                        </span>
                      </td>
                      <td className="p-2.5 font-bold text-slate-900">
                        <div className="text-indigo-900 font-mono">{alert.keyword}</div>
                        <span className="text-[9px] text-slate-500 font-normal capitalize">
                          {alert.searchIntent || "Ticari Niyet"}
                        </span>
                      </td>
                      <td className="p-2.5">
                        <div className="font-mono text-slate-900">
                          {alert.previousSearchVolume?.toLocaleString() || "8,400"} ➜ <span className="font-bold text-amber-700">{alert.currentSearchVolume?.toLocaleString() || "19,500"}</span>
                        </div>
                        <span className="inline-block text-[10px] font-black text-amber-700 bg-amber-50 px-1 rounded border border-amber-200">
                          ⚡ +%{alert.volumeChangePercentage || 132} Sıçrama
                        </span>
                      </td>
                      <td className="p-2.5">
                        <div className="font-bold text-slate-800">{alert.competitorName}</div>
                        <div className="font-mono text-rose-700 font-bold">#{alert.competitorCurrentRank} (+{alert.competitorRankChange || 2} sıra yükseldi)</div>
                      </td>
                      <td className="p-2.5">
                        <div className="font-mono font-bold text-slate-700">#{alert.userCurrentRank}</div>
                        <div className="text-[10px] text-rose-600 font-semibold">-{alert.userRankChange || 1} geriledi</div>
                      </td>
                      <td className="p-2.5 font-mono font-bold text-rose-700">
                        -{alert.estimatedTrafficLoss || 420} /ay
                      </td>
                      <td className="p-2.5 text-[10px] text-slate-600 max-w-xs">
                        <p className="font-semibold text-slate-800">{alert.diagnosticAnalysis || "Rakip yeni H1 ve kapsamlı rehber yayınladı."}</p>
                        <p className="text-indigo-700 font-bold mt-0.5">{alert.recommendedAction || "Karşı blog makalesi ve yerel şema takviyesi yapın."}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ================================================================= */}
          {/* SECTION 14: 1. SIRAYA YERLEŞMEK İÇİN ÖNCELİKLİ TAKTİK EYLEM PLANI (QUICK WINS) */}
          {/* ================================================================= */}
          <div className="space-y-3 pt-4 border-t border-slate-200" style={{ pageBreakInside: "avoid" }}>
            <div className="font-black text-slate-950 text-sm uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-black">14</span>
              <span>1. Sıraya Yerleşmek İçin Hızlı SEO Kazanımları (Quick Wins) & Taktik Yol Haritası</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900 text-[11px] flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                  <span>Ani Hacim Kazanan Kelimelere Karşı Küme</span>
                </div>
                <p className="text-slate-600 text-[10px] leading-relaxed">
                  Son 48 saatte hacmi sıçrayan terimler ({recentAlerts[0]?.keyword || "yerel hizmet anahtarları"}) için 3 dakikada AI Blog ile karşı makale ve derinlemesine rehber yayınlayın.
                </p>
                <div className="text-emerald-700 font-bold text-[10px]">
                  Tahmini Etki: +450 Ziyaretçi/Ay
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900 text-[11px] flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">2</span>
                  <span>Sayfa Hızı (0.02s) Üstünlüğünü SERP'e Yansıtma</span>
                </div>
                <p className="text-slate-600 text-[10px] leading-relaxed">
                  Meta başlığa "Anında Yanıt & 7/24 Kesintisiz Hizmet" ekleyerek, yavaş monolit rakiplerden kaçan sabırsız mobil kullanıcıların tıklama oranını (CTR) %38 artırın.
                </p>
                <div className="text-emerald-700 font-bold text-[10px]">
                  Tahmini Etki: +%38 SERP CTR
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900 text-[11px] flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">3</span>
                  <span>LocalBusiness & FAQPage Şema Baskısı</span>
                </div>
                <p className="text-slate-600 text-[10px] leading-relaxed">
                  {activeConfig.city} ve {activeConfig.sector} sorgularında Google Haritalar yerel 3'lü paketinde (Local 3-Pack) en üst sırada yer almak için şema doğrulamalarını canlı tutun.
                </p>
                <div className="text-emerald-700 font-bold text-[10px]">
                  Tahmini Etki: +28 Doğrudan Arama
                </div>
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* SECTION 15: OFFICIAL SIGN-OFF BLOCK */}
          {/* ================================================================= */}
          <div className="pt-6 border-t-2 border-slate-200" style={{ pageBreakInside: "avoid" }}>
            <div className="grid grid-cols-2 gap-12 text-xs">
              <div className="space-y-6">
                <div className="font-black text-slate-900 uppercase tracking-wider text-[11px]">
                  Raporu Hazırlayan / Teknik SEO & Analitik Danışmanı
                </div>
                <div className="border-b border-slate-400 pb-1 flex justify-between text-slate-500 font-mono text-[10px]">
                  <span>İmza: ___________________________</span>
                  <span>Kaşe / Mühür</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  HızlıWeb Bulut Mimarisi & D3.js Vektörel SEO Analitik Birimi
                </div>
              </div>

              <div className="space-y-6">
                <div className="font-black text-slate-900 uppercase tracking-wider text-[11px]">
                  Müşteri Paydaşı / Şirket Yönetim Onayı
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

      {/* GEMINI AI STRATEGIC PDF REPORT MODAL */}
      <StrategicPdfExportModal
        isOpen={isAiPdfModalOpen}
        onClose={() => setIsAiPdfModalOpen(false)}
        siteConfig={activeConfig}
      />

      {/* CUSTOMIZABLE STRATEGIC REPORT & VECTOR RADAR / HEATMAP EDITOR MODAL */}
      <CustomizableStrategicReportEditorModal
        isOpen={isCustomReportModalOpen}
        onClose={() => setIsCustomReportModalOpen(false)}
        siteConfig={activeConfig}
      />

      {/* SEO COMPETITIVE ALERT CONFIGURATION MODAL */}
      {isAlertConfigModalOpen && (
        <SeoCompetitiveAlertConfigPanel
          config={activeConfig}
          isOpen={isAlertConfigModalOpen}
          onClose={() => setIsAlertConfigModalOpen(false)}
          mode="modal"
          onAlertTriggered={handleAlertTriggered}
        />
      )}

      {/* REAL-TIME PUSH-STYLE COMPETITIVE ALERT TOAST */}
      {activePushAlert && (
        <CompetitiveAlertToast
          alert={activePushAlert}
          onClose={() => setActivePushAlert(null)}
          onTakeAction={handleToastAction}
          onOpenAlertCenter={() => {
            setActiveStrategicTab("seo-competitive-alert");
            setTimeout(() => {
              const el = document.getElementById("seo-rekabet-alarmi-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }, 100);
          }}
        />
      )}
    </div>
  );
};
