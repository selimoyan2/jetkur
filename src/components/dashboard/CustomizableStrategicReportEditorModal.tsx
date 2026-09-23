import React, { useState, useEffect, useRef, useMemo } from "react";
import html2pdf from "html2pdf.js";
import {
  FileDown,
  Printer,
  X,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Globe,
  Award,
  TrendingUp,
  BarChart3,
  Layers,
  Sparkles,
  RefreshCw,
  Eye,
  Sliders,
  Settings2,
  MoveUp,
  MoveDown,
  Check,
  Flame,
  Target,
  ArrowUpRight,
  Palette,
  FileText,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Building2,
  Clock,
  Radio,
  SlidersHorizontal,
  ChevronRight,
  Search,
  ExternalLink,
  ChevronDown
} from "lucide-react";
import { SiteConfig, SeoCompetitiveAlert } from "../../types";
import { generateFallbackCompetitiveSeo } from "../../utils/competitiveSeoUtils";
import { generateFallbackKeywordBenchmark } from "../../utils/realtimeKeywordBenchmarkEngine";
import { 
  generateFallbackGlobalSeoHeatmap, 
  GlobalSeoHeatmapDataset,
  MarketHeatmapRegion 
} from "../../utils/globalSeoHeatmapEngine";
import { loadCompetitiveAlerts } from "../../utils/seoCompetitiveAlertEngine";

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export type ReportThemeColor = "indigo" | "emerald" | "slate" | "cyan";

export interface ReportSectionConfig {
  id: string;
  title: string;
  category: "overview" | "radar" | "heatmap" | "data" | "action";
  enabled: boolean;
  page: number; // approximate page assignment
  icon: string;
}

export interface CustomizableReportSettings {
  reportTitle: string;
  reportSubtitle: string;
  companyName: string;
  domain: string;
  sector: string;
  city: string;
  customConsultantNote: string;
  themeColor: ReportThemeColor;
  watermark: "GİZLİ & ŞİRKETE ÖZEL" | "YÖNETİM KURULU İÇİN HAZIRLANMIŞTIR" | "RESMİ SEO DENETİM RAPORU" | "STRATEJİK YATIRIM RAPORU" | "YOK";
  showLogo: boolean;
  showStamp: boolean;
  showPageNumbers: boolean;
  highContrastCharts: boolean;
  sections: ReportSectionConfig[];
}

const DEFAULT_SECTIONS: ReportSectionConfig[] = [
  { id: "header", title: "Kurumsal Başlık & Şirket Bilgisi", category: "overview", enabled: true, page: 1, icon: "Building2" },
  { id: "executiveSummary", title: "Yönetici & Paydaş Özeti (4 KPI)", category: "overview", enabled: true, page: 1, icon: "Award" },
  { id: "customNote", title: "Özel Danışman / Yönetici Değerlendirmesi", category: "overview", enabled: true, page: 1, icon: "FileText" },
  { id: "radarPerformance", title: "Vektörel Radar 1: Sektörel SEO Performans Radarı (D3 6-Eksen)", category: "radar", enabled: true, page: 1, icon: "Radar" },
  { id: "radarKeyword", title: "Vektörel Radar 2: Anahtar Kelime & SERP Rekabet Radarı (D3 5-Eksen)", category: "radar", enabled: true, page: 2, icon: "Target" },
  { id: "radarSpeedCWV", title: "Vektörel Radar 3: Core Web Vitals & Açılış Hızı Radarı", category: "radar", enabled: true, page: 2, icon: "Zap" },
  { id: "vectorHeatmap", title: "Global SEO Isı Haritası & Coğrafi Varlık Matrisi", category: "heatmap", enabled: true, page: 2, icon: "Globe" },
  { id: "heatmapFlanking", title: "Gemini Kuşatma (Flanking) & 3 Öncelikli Pazar Adımı", category: "heatmap", enabled: true, page: 3, icon: "TrendingUp" },
  { id: "swotMatrix", title: "Gemini AI SWOT Matrisi (Güçlü, Zayıf, Fırsat, Tehdit)", category: "data", enabled: true, page: 3, icon: "Sparkles" },
  { id: "contentStrategy", title: "İçerik Stratejisi Kıyaslayıcı (Başlık, Uzunluk, KW Yoğunluğu)", category: "data", enabled: true, page: 3, icon: "FileText" },
  { id: "contentExpansion", title: "İçerik Geliştirme Önerileri (Blog & Meta Taslakları)", category: "data", enabled: true, page: 3, icon: "MousePointerClick" },
  { id: "adEfficiency", title: "Reklam Verimliliği & CPC Arbitraj Analizi (Google Ads & ROAS)", category: "data", enabled: true, page: 3, icon: "Coins" },
  { id: "benchmarkTable", title: "Sektörel Rakip Metrikleri Karşılaştırma Matrisi", category: "data", enabled: true, page: 3, icon: "BarChart3" },
  { id: "alertsLogs", title: "Canlı SEO Rekabet Alarm Günlükleri & Tehdit Analizi", category: "data", enabled: true, page: 3, icon: "AlertTriangle" },
  { id: "actionPlan", title: "1. Sıraya Yerleşme Stratejik Yol Haritası (30-60-90 Gün)", category: "action", enabled: true, page: 3, icon: "CheckCircle2" },
  { id: "signOff", title: "Resmi Kaşe & Çift Yetkili İmza Onay Bloğu", category: "action", enabled: true, page: 3, icon: "ShieldCheck" }
];

const STORAGE_KEY = "customizable_strategic_report_settings_v1";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  siteConfig: SiteConfig;
}

export const CustomizableStrategicReportEditorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  siteConfig
}) => {
  // --------------------------------------------------------------------------
  // STATE MANAGEMENT
  // --------------------------------------------------------------------------
  const [activeEditorTab, setActiveEditorTab] = useState<"sections" | "content" | "theme">("sections");
  const [zoomScale, setZoomScale] = useState<number>(85); // percent
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const printableCanvasRef = useRef<HTMLDivElement>(null);

  // Initialize or load persisted settings
  const [settings, setSettings] = useState<CustomizableReportSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          companyName: parsed.companyName || siteConfig.companyName || "Kurumsal İşletmeniz",
          domain: parsed.domain || siteConfig.cloudflare?.customDomain || "sitemiz.com.tr",
          sector: parsed.sector || siteConfig.sector || "Hizmet Sektörü",
          city: parsed.city || siteConfig.city || "İstanbul"
        };
      }
    } catch {
      // fallback
    }

    return {
      reportTitle: `${siteConfig.companyName || "Şirketiniz"} Stratejik SEO Radar & Rakip Analiz Raporu`,
      reportSubtitle: `6 Eksenli Performans Radarı, Canlı Rekabet Alarmları ve Global SEO Isı Haritası`,
      companyName: siteConfig.companyName || "Kurumsal İşletmeniz",
      domain: siteConfig.cloudflare?.customDomain || "sitemiz.com.tr",
      sector: siteConfig.sector || "Oto Kurtarma & Çekici",
      city: siteConfig.city || "İstanbul",
      customConsultantNote: `0.02 saniyelik ultra-hızlı Edge mimarimiz ve kusursuz LocalBusiness yapısal veri entegrasyonumuz sayesinde arama motorlarında rakiplere karşı belirgin bir hız üstünlüğü sağlanmıştır. Önümüzdeki 60 günde hedeflenen semt sayfaları ve DACH bölgesindeki iki dilli açılım ile pazar payının %42 artırılması öngörülmektedir.`,
      themeColor: "indigo",
      watermark: "RESMİ SEO DENETİM RAPORU",
      showLogo: true,
      showStamp: true,
      showPageNumbers: true,
      highContrastCharts: true,
      sections: DEFAULT_SECTIONS
    };
  });

  // Sync when siteConfig changes
  useEffect(() => {
    if (siteConfig) {
      setSettings(prev => ({
        ...prev,
        companyName: prev.companyName || siteConfig.companyName || "Kurumsal İşletmeniz",
        sector: prev.sector || siteConfig.sector || "Hizmet Sektörü",
        city: prev.city || siteConfig.city || "İstanbul",
        domain: prev.domain || siteConfig.cloudflare?.customDomain || "sitemiz.com.tr"
      }));
    }
  }, [siteConfig]);

  // Persist to local storage
  const handleSaveSettings = (newSettings: CustomizableReportSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch {
      // ignore storage error
    }
  };

  const handleResetDefaults = () => {
    const defaultObj: CustomizableReportSettings = {
      reportTitle: `${siteConfig.companyName || "Şirketiniz"} Stratejik SEO Radar & Rakip Analiz Raporu`,
      reportSubtitle: `6 Eksenli Performans Radarı, Canlı Rekabet Alarmları ve Global SEO Isı Haritası`,
      companyName: siteConfig.companyName || "Kurumsal İşletmeniz",
      domain: siteConfig.cloudflare?.customDomain || "sitemiz.com.tr",
      sector: siteConfig.sector || "Oto Kurtarma & Çekici",
      city: siteConfig.city || "İstanbul",
      customConsultantNote: `0.02 saniyelik ultra-hızlı Edge mimarimiz ve kusursuz LocalBusiness yapısal veri entegrasyonumuz sayesinde arama motorlarında rakiplere karşı belirgin bir hız üstünlüğü sağlanmıştır. Önümüzdeki 60 günde hedeflenen semt sayfaları ve DACH bölgesindeki iki dilli açılım ile pazar payının %42 artırılması öngörülmektedir.`,
      themeColor: "indigo",
      watermark: "RESMİ SEO DENETİM RAPORU",
      showLogo: true,
      showStamp: true,
      showPageNumbers: true,
      highContrastCharts: true,
      sections: DEFAULT_SECTIONS
    };
    handleSaveSettings(defaultObj);
  };

  // Section Toggle & Move Handlers
  const toggleSection = (id: string) => {
    const updated = settings.sections.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s);
    handleSaveSettings({ ...settings, sections: updated });
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= settings.sections.length) return;
    const newSections = [...settings.sections];
    const [moved] = newSections.splice(index, 1);
    newSections.splice(targetIndex, 0, moved);
    handleSaveSettings({ ...settings, sections: newSections });
  };

  // Preset switchers
  const applyPreset = (preset: "compact" | "recommended" | "full") => {
    let updatedSections = [...settings.sections];
    if (preset === "compact") {
      updatedSections = updatedSections.map(s => ({
        ...s,
        enabled: ["header", "executiveSummary", "radarPerformance", "vectorHeatmap", "benchmarkTable", "signOff"].includes(s.id)
      }));
    } else if (preset === "recommended") {
      updatedSections = updatedSections.map(s => ({
        ...s,
        enabled: s.id !== "priceIntelligence"
      }));
    } else {
      updatedSections = updatedSections.map(s => ({ ...s, enabled: true }));
    }
    handleSaveSettings({ ...settings, sections: updatedSections });
  };

  // --------------------------------------------------------------------------
  // DATA PREPARATION FOR CHARTS & HEATMAP
  // --------------------------------------------------------------------------
  const competitiveData = useMemo(() => generateFallbackCompetitiveSeo(siteConfig), [siteConfig]);
  const keywordBenchmark = useMemo(() => generateFallbackKeywordBenchmark(siteConfig), [siteConfig]);
  const heatmapDataset = useMemo<GlobalSeoHeatmapDataset>(() => generateFallbackGlobalSeoHeatmap(siteConfig), [siteConfig]);
  const competitiveAlerts = useMemo<SeoCompetitiveAlert[]>(() => loadCompetitiveAlerts(siteConfig).slice(0, 4), [siteConfig]);

  const companyLogoUrl = siteConfig.logo || siteConfig.header?.logoImage;

  // Metadata
  const reportMeta = useMemo(() => {
    const d = new Date();
    return {
      reportId: `COMP-SEO-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`,
      formattedDate: d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }),
      formattedTime: d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
    };
  }, []);

  // --------------------------------------------------------------------------
  // THEME COLOR SCHEMES
  // --------------------------------------------------------------------------
  const themeStyles = useMemo(() => {
    switch (settings.themeColor) {
      case "emerald":
        return {
          primary: "text-emerald-700",
          primaryBg: "bg-emerald-700",
          badgeBg: "bg-emerald-50 text-emerald-800 border-emerald-200",
          gradientHeader: "from-slate-950 via-emerald-950 to-slate-950",
          accentBorder: "border-emerald-600",
          ringColor: "ring-emerald-500",
          radarUserFill: "rgba(16, 185, 129, 0.4)",
          radarUserStroke: "#059669",
          stampColor: "border-emerald-700 text-emerald-800"
        };
      case "cyan":
        return {
          primary: "text-cyan-700",
          primaryBg: "bg-cyan-700",
          badgeBg: "bg-cyan-50 text-cyan-800 border-cyan-200",
          gradientHeader: "from-slate-950 via-cyan-950 to-slate-950",
          accentBorder: "border-cyan-600",
          ringColor: "ring-cyan-500",
          radarUserFill: "rgba(6, 182, 212, 0.4)",
          radarUserStroke: "#0891b2",
          stampColor: "border-cyan-700 text-cyan-800"
        };
      case "slate":
        return {
          primary: "text-slate-800",
          primaryBg: "bg-slate-900",
          badgeBg: "bg-slate-100 text-slate-800 border-slate-300",
          gradientHeader: "from-slate-950 via-slate-900 to-slate-950",
          accentBorder: "border-slate-800",
          ringColor: "ring-slate-500",
          radarUserFill: "rgba(71, 85, 105, 0.4)",
          radarUserStroke: "#334155",
          stampColor: "border-slate-800 text-slate-900"
        };
      case "indigo":
      default:
        return {
          primary: "text-indigo-700",
          primaryBg: "bg-indigo-700",
          badgeBg: "bg-indigo-50 text-indigo-800 border-indigo-200",
          gradientHeader: "from-slate-950 via-indigo-950 to-slate-950",
          accentBorder: "border-indigo-600",
          ringColor: "ring-indigo-500",
          radarUserFill: "rgba(99, 102, 241, 0.4)",
          radarUserStroke: "#4f46e5",
          stampColor: "border-indigo-700 text-indigo-800"
        };
    }
  }, [settings.themeColor]);

  // --------------------------------------------------------------------------
  // HIGH-RESOLUTION VECTOR RADAR 1 (SECTORAL SEO PERFORMANCE 6-AXIS)
  // --------------------------------------------------------------------------
  const radar1Config = useMemo(() => {
    const cx = 200;
    const cy = 160;
    const radius = 105;
    const axes = [
      { key: "speed", label: "Site Hızı (CWV)", user: 96, leader: 64, regional: 72, challenger: 45 },
      { key: "backlink", label: "Backlink Kalitesi", user: 74, leader: 92, regional: 58, challenger: 40 },
      { key: "da", label: "Alan Adı Otoritesi", user: 68, leader: 88, regional: 55, challenger: 38 },
      { key: "content", label: "İçerik Zenginliği", user: 89, leader: 84, regional: 60, challenger: 52 },
      { key: "technical", label: "Teknik SEO & Şema", user: 98, leader: 70, regional: 64, challenger: 48 },
      { key: "mobile", label: "Mobil Kullanılabilirlik", user: 95, leader: 76, regional: 68, challenger: 55 }
    ];

    const count = axes.length;
    const getPolygonPoints = (valKey: "user" | "leader" | "regional" | "challenger") => {
      return axes.map((a, i) => {
        const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
        const val = a[valKey];
        const r = (val / 100) * radius;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(" ");
    };

    const webRings = [0.2, 0.4, 0.6, 0.8, 1.0].map(ratio => {
      const points = axes.map((_, i) => {
        const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
        const r = radius * ratio;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(" ");
      return { ratio, points, percentage: Math.round(ratio * 100) };
    });

    const axisLines = axes.map((axis, i) => {
      const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
      const xOuter = cx + radius * Math.cos(angle);
      const yOuter = cy + radius * Math.sin(angle);
      const xLabel = cx + (radius + 20) * Math.cos(angle);
      const yLabel = cy + (radius + 18) * Math.sin(angle);
      const cosA = Math.cos(angle);
      const textAnchor = cosA > 0.3 ? "start" : cosA < -0.3 ? "end" : "middle";
      return { label: axis.label, xOuter, yOuter, xLabel, yLabel, textAnchor };
    });

    return { cx, cy, radius, axes, getPolygonPoints, webRings, axisLines };
  }, []);

  // --------------------------------------------------------------------------
  // HIGH-RESOLUTION VECTOR RADAR 2 (KEYWORD BENCHMARK 5-AXIS)
  // --------------------------------------------------------------------------
  const radar2Config = useMemo(() => {
    const cx = 200;
    const cy = 160;
    const radius = 105;
    const axes = [
      { label: "Arama Hacmi", user: 82, leader: 94, avg: 50 },
      { label: "SERP Tıklama Payı", user: 88, leader: 80, avg: 45 },
      { label: "Anahtar Kelime Zorluğu", user: 65, leader: 85, avg: 55 },
      { label: "SERP Hakimiyeti", user: 78, leader: 90, avg: 42 },
      { label: "Dönüşüm Oranı", user: 94, leader: 68, avg: 52 }
    ];

    const count = axes.length;
    const getPolygonPoints = (valKey: "user" | "leader" | "avg") => {
      return axes.map((a, i) => {
        const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
        const val = a[valKey];
        const r = (val / 100) * radius;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(" ");
    };

    const webRings = [0.25, 0.5, 0.75, 1.0].map(ratio => {
      const points = axes.map((_, i) => {
        const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
        const r = radius * ratio;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(" ");
      return { ratio, points, percentage: Math.round(ratio * 100) };
    });

    const axisLines = axes.map((axis, i) => {
      const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
      const xOuter = cx + radius * Math.cos(angle);
      const yOuter = cy + radius * Math.sin(angle);
      const xLabel = cx + (radius + 20) * Math.cos(angle);
      const yLabel = cy + (radius + 18) * Math.sin(angle);
      const cosA = Math.cos(angle);
      const textAnchor = cosA > 0.3 ? "start" : cosA < -0.3 ? "end" : "middle";
      return { label: axis.label, xOuter, yOuter, xLabel, yLabel, textAnchor };
    });

    return { cx, cy, radius, axes, getPolygonPoints, webRings, axisLines };
  }, []);

  // --------------------------------------------------------------------------
  // HIGH-RESOLUTION VECTOR RADAR 3 (CORE WEB VITALS 6-AXIS)
  // --------------------------------------------------------------------------
  const radar3Config = useMemo(() => {
    const cx = 200;
    const cy = 160;
    const radius = 105;
    const axes = [
      { label: "LCP (Açılış Hızı)", user: 98, leader: 50, avg: 60 },
      { label: "INP (Etkileşim)", user: 95, leader: 62, avg: 65 },
      { label: "CLS (Düzen Kayması)", user: 100, leader: 55, avg: 70 },
      { label: "FCP (İlk Boyama)", user: 97, leader: 58, avg: 62 },
      { label: "TTFB (Sunucu Yanıtı)", user: 99, leader: 42, avg: 54 },
      { label: "TBT (Bloklanma)", user: 96, leader: 48, avg: 58 }
    ];

    const count = axes.length;
    const getPolygonPoints = (valKey: "user" | "leader" | "avg") => {
      return axes.map((a, i) => {
        const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
        const val = a[valKey];
        const r = (val / 100) * radius;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(" ");
    };

    const webRings = [0.25, 0.5, 0.75, 1.0].map(ratio => {
      const points = axes.map((_, i) => {
        const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
        const r = radius * ratio;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(" ");
      return { ratio, points, percentage: Math.round(ratio * 100) };
    });

    const axisLines = axes.map((axis, i) => {
      const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
      const xOuter = cx + radius * Math.cos(angle);
      const yOuter = cy + radius * Math.sin(angle);
      const xLabel = cx + (radius + 20) * Math.cos(angle);
      const yLabel = cy + (radius + 18) * Math.sin(angle);
      const cosA = Math.cos(angle);
      const textAnchor = cosA > 0.3 ? "start" : cosA < -0.3 ? "end" : "middle";
      return { label: axis.label, xOuter, yOuter, xLabel, yLabel, textAnchor };
    });

    return { cx, cy, radius, axes, getPolygonPoints, webRings, axisLines };
  }, []);

  // --------------------------------------------------------------------------
  // HIGH-RESOLUTION VECTOR HEATMAP PROJECTION (SVG MAP CANVAS)
  // --------------------------------------------------------------------------
  const vectorMapCoordinates: Record<string, { x: number; y: number; label: string }> = {
    "tr-marmara": { x: 260, y: 110, label: "İstanbul & Marmara" },
    "tr-ege": { x: 200, y: 180, label: "İzmir & Ege" },
    "tr-icanadolu": { x: 350, y: 140, label: "Ankara & İç And." },
    "tr-akdeniz": { x: 310, y: 220, label: "Antalya & Akdeniz" },
    "tr-guneymarmara": { x: 250, y: 145, label: "Bursa & G.Marmara" },
    "intl-de": { x: 120, y: 70, label: "Almanya (DACH)" },
    "intl-uk": { x: 80, y: 60, label: "İngiltere (UK)" },
    "intl-benelux": { x: 105, y: 75, label: "Hollanda (Benelux)" },
    "intl-gcc": { x: 440, y: 240, label: "Dubai & BAE (Körfez)" },
    "intl-az": { x: 460, y: 130, label: "Azerbaycan (Bakü)" }
  };

  // Helper color for heat
  const getHeatFill = (score: number) => {
    if (score >= 75) return "#10b981"; // emerald
    if (score >= 55) return "#06b6d4"; // cyan
    if (score >= 35) return "#f59e0b"; // amber
    return "#f43f5e"; // rose
  };

  // --------------------------------------------------------------------------
  // HIGH-RESOLUTION VECTOR PDF EXPORT ENGINE
  // --------------------------------------------------------------------------
  const handleExportPdf = async () => {
    if (!printableCanvasRef.current || isExportingPdf) return;
    setIsExportingPdf(true);
    setExportSuccess(false);
    setExportError(null);

    try {
      // Ensure browser layout has committed all custom settings
      await new Promise(resolve => setTimeout(resolve, 120));

      const element = printableCanvasRef.current;
      const cleanCompany = (settings.companyName || "Sirket").replace(/[^a-zA-Z0-9]/g, "_");
      const dateTag = new Date().toISOString().slice(0, 10);

      const options = {
        margin: [6, 6, 6, 6] as [number, number, number, number],
        filename: `${cleanCompany}_Stratejik_SEO_Radar_ve_Isi_Haritasi_${dateTag}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        enableLinks: true,
        html2canvas: {
          scale: 2, // 2x high resolution ensures vector sharpness
          useCORS: true,
          logging: false,
          letterRendering: true,
          windowWidth: 1050
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] }
      };

      await html2pdf().set(options).from(element).save();
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 5000);
    } catch (err: any) {
      console.error("Vector PDF Export failed:", err);
      setExportError("PDF oluşturulurken bir aksaklık meydana geldi. Doğrudan 'Yazdır' seçeneğini deneyebilirsiniz.");
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleNativePrint = () => {
    window.print();
  };

  // Check section visibility helper
  const isSectionActive = (id: string) => {
    const s = settings.sections.find(item => item.id === id);
    return s ? s.enabled : false;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 overflow-hidden animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col w-full h-[96vh] max-w-[1550px] overflow-hidden text-slate-100 ring-1 ring-white/10">
        
        {/* =================================================================== */}
        {/* TOP MODAL HEADER & ACTION CONTROLS */}
        {/* =================================================================== */}
        <div className="px-6 py-4 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-cyan-500 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-950/50">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Sliders className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Özelleştirilebilir Rapor Sayfası Düzenleyici
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[10px] font-black uppercase tracking-wider">
                  Vektörel Radar & Isı Haritası
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/40">
                  A4 Baskı Kalitesi
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {settings.companyName} için radar vektörlerini, ısı haritasını ve kurumsal bölümleri kişiselleştirip indirin.
              </p>
            </div>
          </div>

          {/* Quick Presets & Download Action Cluster */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Quick Layout Presets */}
            <div className="hidden xl:flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => applyPreset("compact")}
                className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-[11px] font-semibold transition-all cursor-pointer"
                title="Hızlı Yönetici Özeti (2 Sayfa)"
              >
                Kompakt (2 Syf)
              </button>
              <button
                type="button"
                onClick={() => applyPreset("recommended")}
                className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-bold text-[11px] transition-all cursor-pointer shadow-xs"
                title="Önerilen Vektörel Radar & Isı Haritası (3 Sayfa)"
              >
                Önerilen (3 Syf)
              </button>
              <button
                type="button"
                onClick={() => applyPreset("full")}
                className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-[11px] font-semibold transition-all cursor-pointer"
                title="Tüm Sayfalar & Veri Seti (Eksiksiz)"
              >
                Tam Kapsamlı
              </button>
            </div>

            {/* Native Print Button */}
            <button
              type="button"
              id="editor-native-print-btn"
              onClick={handleNativePrint}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="Sistem Yazdır / Saf Vektör PDF Kaydet diyaloğunu açar"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>Yazdır</span>
            </button>

            {/* High-Res Vector PDF Download */}
            <button
              type="button"
              id="editor-download-vector-pdf-btn"
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-teal-950/60 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {isExportingPdf ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Vektör PDF Derleniyor...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                  <span>Vektörel PDF İndir (A4)</span>
                </>
              )}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 border border-slate-700 transition-all cursor-pointer ml-1"
              title="Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications / Error Alert Banner */}
        {exportSuccess && (
          <div className="bg-emerald-950/90 border-b border-emerald-600/60 px-6 py-2.5 text-xs text-emerald-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                <strong>Tebrikler!</strong> Vektörel radar ve ısı haritasını içeren özelleştirilmiş PDF raporunuz başarıyla indirildi.
              </span>
            </div>
            <button onClick={() => setExportSuccess(false)} className="text-emerald-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {exportError && (
          <div className="bg-rose-950/90 border-b border-rose-600/60 px-6 py-2.5 text-xs text-rose-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>{exportError}</span>
            </div>
            <button onClick={() => setExportError(null)} className="text-rose-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* =================================================================== */}
        {/* MAIN SPLIT WORKSPACE: LEFT EDITOR PANEL vs. RIGHT LIVE CANVAS */}
        {/* =================================================================== */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* ----------------------------------------------------------------- */}
          {/* LEFT PANEL: REPORT CONTROLS & SECTION BUILDER */}
          {/* ----------------------------------------------------------------- */}
          <div className="w-full lg:w-[440px] xl:w-[480px] bg-slate-950 border-r border-slate-800 flex flex-col shrink-0 overflow-hidden">
            
            {/* Control Tabs */}
            <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-1 shrink-0">
              <div className="flex items-center gap-1 w-full">
                <button
                  type="button"
                  onClick={() => setActiveEditorTab("sections")}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeEditorTab === "sections"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Bölümler & Sıralama</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveEditorTab("content")}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeEditorTab === "content"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>İçerik & Notlar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveEditorTab("theme")}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeEditorTab === "theme"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>Tema & Stil</span>
                </button>
              </div>
            </div>

            {/* Scrollable Configuration Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 custom-scrollbar">
              
              {/* TAB 1: SECTIONS & REORDERING */}
              {activeEditorTab === "sections" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
                        Rapor Sayfa Bölümleri ({settings.sections.filter(s => s.enabled).length}/{settings.sections.length} Aktif)
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Raporda görünmesini istediğiniz bölümleri açın, kapatın veya sırasını değiştirin.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleResetDefaults}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Sıfırla</span>
                    </button>
                  </div>

                  {/* Section List Items */}
                  <div className="space-y-2">
                    {settings.sections.map((section, idx) => {
                      const isFirst = idx === 0;
                      const isLast = idx === settings.sections.length - 1;

                      return (
                        <div
                          key={section.id}
                          className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                            section.enabled
                              ? "bg-slate-900 border-slate-700/80 shadow-xs"
                              : "bg-slate-950/60 border-slate-800/60 opacity-60"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Checkbox Toggle */}
                            <button
                              type="button"
                              onClick={() => toggleSection(section.id)}
                              className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                                section.enabled
                                  ? "bg-indigo-600 border-indigo-500 text-white"
                                  : "border-slate-700 bg-slate-800 text-transparent"
                              }`}
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </button>

                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-200 truncate flex items-center gap-1.5">
                                <span>{section.title}</span>
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                                <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                                  {section.category === "radar" ? "Vektörel Grafik" : section.category === "heatmap" ? "Isı Haritası" : "Metin & Veri"}
                                </span>
                                <span>•</span>
                                <span>{section.enabled ? "Rapora Dahil" : "Gizlendi"}</span>
                              </div>
                            </div>
                          </div>

                          {/* Reorder Buttons */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              disabled={isFirst}
                              onClick={() => moveSection(idx, "up")}
                              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                              title="Yukarı Taşı"
                            >
                              <MoveUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={isLast}
                              onClick={() => moveSection(idx, "down")}
                              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                              title="Aşağı Taşı"
                            >
                              <MoveDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: CONTENT & NOTES */}
              {activeEditorTab === "content" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
                      Rapor Metinleri & Kurumsal Bilgiler
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Rapor başlığını, sloganı ve danışman değerlendirme notunu düzenleyin.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">Rapor Ana Başlığı</label>
                      <input
                        type="text"
                        value={settings.reportTitle}
                        onChange={(e) => handleSaveSettings({ ...settings, reportTitle: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-indigo-500 font-semibold"
                        placeholder="Rapor Başlığı..."
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">Rapor Alt Başlığı / Kapsam</label>
                      <input
                        type="text"
                        value={settings.reportSubtitle}
                        onChange={(e) => handleSaveSettings({ ...settings, reportSubtitle: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-indigo-500"
                        placeholder="Rapor Alt Başlığı..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-slate-400 block mb-1">Şirket Adı</label>
                        <input
                          type="text"
                          value={settings.companyName}
                          onChange={(e) => handleSaveSettings({ ...settings, companyName: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-400 block mb-1">Şehir / Lokasyon</label>
                        <input
                          type="text"
                          value={settings.city}
                          onChange={(e) => handleSaveSettings({ ...settings, city: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">
                        Özel Danışman / Yönetici Değerlendirme Notu
                      </label>
                      <textarea
                        rows={4}
                        value={settings.customConsultantNote}
                        onChange={(e) => handleSaveSettings({ ...settings, customConsultantNote: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-indigo-500 leading-relaxed custom-scrollbar"
                        placeholder="Bu alana raporu inceleyecek paydaş veya yönetim kurulu için özel değerlendirmenizi yazabilirsiniz..."
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">Gizlilik & Damga / Filigran</label>
                      <select
                        value={settings.watermark}
                        onChange={(e: any) => handleSaveSettings({ ...settings, watermark: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="RESMİ SEO DENETİM RAPORU">RESMİ SEO DENETİM RAPORU</option>
                        <option value="GİZLİ & ŞİRKETE ÖZEL">GİZLİ & ŞİRKETE ÖZEL</option>
                        <option value="YÖNETİM KURULU İÇİN HAZIRLANMIŞTIR">YÖNETİM KURULU İÇİN HAZIRLANMIŞTIR</option>
                        <option value="STRATEJİK YATIRIM RAPORU">STRATEJİK YATIRIM RAPORU</option>
                        <option value="YOK">YOK (Filigransız)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: THEME & STYLING */}
              {activeEditorTab === "theme" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
                      Görsel Tema & Renk Paleti
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Raporun kurumsal renk şemasını ve vektörel grafik kontrastını ayarlayın.
                    </p>
                  </div>

                  {/* Theme Selectors */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleSaveSettings({ ...settings, themeColor: "indigo" })}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        settings.themeColor === "indigo"
                          ? "bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-400/30"
                          : "bg-slate-900 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full bg-indigo-600 mb-2 border border-indigo-400" />
                      <div className="text-xs font-bold text-white">Kurumsal Lacivert</div>
                      <div className="text-[10px] text-slate-400">İndigo & Gece Mavisi</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSaveSettings({ ...settings, themeColor: "emerald" })}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        settings.themeColor === "emerald"
                          ? "bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-400/30"
                          : "bg-slate-900 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full bg-emerald-600 mb-2 border border-emerald-400" />
                      <div className="text-xs font-bold text-white">Zümrüt & Büyüme</div>
                      <div className="text-[10px] text-slate-400">Yeşil ROI Odaklı</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSaveSettings({ ...settings, themeColor: "cyan" })}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        settings.themeColor === "cyan"
                          ? "bg-cyan-950/60 border-cyan-500 ring-2 ring-cyan-400/30"
                          : "bg-slate-900 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full bg-cyan-600 mb-2 border border-cyan-400" />
                      <div className="text-xs font-bold text-white">Okyanus & Cyan</div>
                      <div className="text-[10px] text-slate-400">Dinamik Dijital</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSaveSettings({ ...settings, themeColor: "slate" })}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        settings.themeColor === "slate"
                          ? "bg-slate-800 border-slate-500 ring-2 ring-slate-400/30"
                          : "bg-slate-900 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full bg-slate-800 mb-2 border border-slate-500" />
                      <div className="text-xs font-bold text-white">Grafit Minimalist</div>
                      <div className="text-[10px] text-slate-400">High-End C-Level</div>
                    </button>
                  </div>

                  {/* Visual Element Toggles */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <div>
                        <div className="text-xs font-bold text-slate-200">Şirket Logosu Göster</div>
                        <div className="text-[10px] text-slate-500">Kapakta kurumsal logoyu gösterir</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.showLogo}
                        onChange={(e) => handleSaveSettings({ ...settings, showLogo: e.target.checked })}
                        className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <div>
                        <div className="text-xs font-bold text-slate-200">Resmi Kaşe & İmza Bloğu</div>
                        <div className="text-[10px] text-slate-500">Rapor sonunda resmi onay kaşesini gösterir</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.showStamp}
                        onChange={(e) => handleSaveSettings({ ...settings, showStamp: e.target.checked })}
                        className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <div>
                        <div className="text-xs font-bold text-slate-200">Sayfa Numaralandırması</div>
                        <div className="text-[10px] text-slate-500">Sayfa altlarında 'Sayfa X / Y' bilgisi</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.showPageNumbers}
                        onChange={(e) => handleSaveSettings({ ...settings, showPageNumbers: e.target.checked })}
                        className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <div>
                        <div className="text-xs font-bold text-slate-200">Yüksek Kontrastlı Vektör Grafikler</div>
                        <div className="text-[10px] text-slate-500">Baskı çıktısında renklerin solmasını önler</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.highContrastCharts}
                        onChange={(e) => handleSaveSettings({ ...settings, highContrastCharts: e.target.checked })}
                        className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Footer Tip */}
            <div className="p-3 bg-slate-950 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Değişiklikler önizlemeye anında yansır</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">1050px Vektörel A4</span>
            </div>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* RIGHT PANEL: INTERACTIVE LIVE MULTI-PAGE A4 PREVIEW CANVAS */}
          {/* ----------------------------------------------------------------- */}
          <div className="flex-1 bg-slate-900/90 flex flex-col overflow-hidden relative">
            
            {/* Canvas Zoom & View Controls Bar */}
            <div className="px-5 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between shrink-0 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Canlı A4 Vektör Önizleme</span>
                </span>
                <span className="text-[11px] text-slate-500">• 100% Vektörel SVG Grafikleri</span>
              </div>

              {/* Zoom Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setZoomScale(prev => Math.max(50, prev - 10))}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                  title="Uzaklaş"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[11px] font-bold text-slate-300 w-10 text-center">
                  %{zoomScale}
                </span>
                <button
                  type="button"
                  onClick={() => setZoomScale(prev => Math.min(130, prev + 10))}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                  title="Yakınlaş"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomScale(85)}
                  className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold cursor-pointer"
                >
                  Sığdır
                </button>
              </div>
            </div>

            {/* Scrollable Canvas Container */}
            <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center custom-scrollbar bg-slate-900/60">
              <div 
                style={{ 
                  transform: `scale(${zoomScale / 100})`, 
                  transformOrigin: "top center",
                  transition: "transform 0.15s ease-out" 
                }}
                className="shrink-0"
              >
                {/* ========================================================= */}
                {/* HIGH-RES A4 PRINTABLE DOCUMENT CONTAINER (1050px WIDTH) */}
                {/* ========================================================= */}
                <div
                  ref={printableCanvasRef}
                  id="customizable-report-printable-area"
                  className="bg-white text-slate-900 shadow-2xl rounded-xs p-10 font-sans space-y-7 relative select-none"
                  style={{ width: "1050px", minHeight: "1485px", color: "#0f172a" }}
                >
                  
                  {/* WATERMARK / FILIGRAN */}
                  {settings.watermark !== "YOK" && (
                    <div 
                      className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0"
                      aria-hidden="true"
                    >
                      <span 
                        className="text-slate-100 font-black text-6xl tracking-widest uppercase opacity-70 transform -rotate-30 border-8 border-slate-100 p-8 rounded-3xl"
                        style={{ userSelect: "none" }}
                      >
                        {settings.watermark}
                      </span>
                    </div>
                  )}

                  {/* ======================================================= */}
                  {/* SECTION 1: HEADER & CORPORATE IDENTITY */}
                  {/* ======================================================= */}
                  {isSectionActive("header") && (
                    <div className="border-b-2 border-slate-900 pb-5 flex items-start justify-between relative z-10">
                      <div className="space-y-1.5 max-w-xl">
                        <div className="flex items-center gap-3.5">
                          {settings.showLogo && companyLogoUrl ? (
                            <div className="w-16 h-16 rounded-2xl bg-white border-2 border-slate-300 p-1.5 flex items-center justify-center shadow-xs overflow-hidden shrink-0">
                              <img
                                src={companyLogoUrl}
                                alt={settings.companyName}
                                className="w-full h-full object-contain"
                                crossOrigin="anonymous"
                              />
                            </div>
                          ) : settings.showLogo ? (
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-700 via-blue-700 to-slate-900 text-white flex flex-col items-center justify-center font-black shadow-sm shrink-0">
                              <span className="text-2xl leading-none">{(settings.companyName || "S").charAt(0).toUpperCase()}</span>
                              <span className="text-[8px] tracking-widest uppercase opacity-80 mt-0.5">LOGO</span>
                            </div>
                          ) : null}

                          <div>
                            <div className="flex items-center gap-2">
                              <h1 className="text-2xl font-black text-slate-950 tracking-tight">
                                {settings.companyName}
                              </h1>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${themeStyles.badgeBg}`}>
                                Kurumsal Strateji Raporu
                              </span>
                            </div>
                            <div className="text-xs font-semibold text-slate-500 flex items-center gap-2 mt-0.5">
                              <span>{settings.sector}</span>
                              <span>•</span>
                              <span>{settings.city}</span>
                              <span>•</span>
                              <span className="font-mono text-indigo-700 font-bold">{settings.domain}</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 italic">
                          "{settings.reportSubtitle}"
                        </p>
                      </div>

                      {/* Header Meta Box */}
                      <div className="text-right space-y-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs shrink-0">
                        <div className="text-[10px] uppercase font-black tracking-wider text-indigo-700">
                          STRATEJİK SEO RADAR VE ISI HARİTASI
                        </div>
                        <div className="font-mono font-bold text-slate-900 text-sm">
                          {reportMeta.reportId}
                        </div>
                        <div className="text-slate-500 text-[11px]">
                          Tarih: {reportMeta.formattedDate} ({reportMeta.formattedTime})
                        </div>
                        <div className="flex items-center justify-end gap-1.5 pt-0.5">
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>Vektörel D3 Motoru</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ======================================================= */}
                  {/* SECTION 2: EXECUTIVE SUMMARY & 4 KPI CARDS */}
                  {/* ======================================================= */}
                  {isSectionActive("executiveSummary") && (
                    <div className="space-y-3 relative z-10" style={{ pageBreakInside: "avoid" }}>
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 leading-relaxed space-y-1">
                        <div className="font-black text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Yönetici & Paydaş Özeti: Pazar Konumlandırması & Tehdit Matrisi</span>
                        </div>
                        <p>
                          Bu rapor, <strong>{settings.companyName}</strong> için {settings.city} bölgesinde faaliyet gösteren 
                          <strong> {settings.sector}</strong> pazarındaki rakiplerin dijital varlıklarını 
                          <strong> 3 adet D3.js vektörel radar analizi</strong> (Sektörel SEO, Anahtar Kelime Kıyaslama ve Core Web Vitals) ve 
                          <strong> 10 hedef pazarı kapsayan Global SEO Isı Haritası</strong> ile sentezleyerek sunmaktadır.
                          Siteniz <strong>0.02s açılış hızı (96/100)</strong> ile pazar liderinden belirgin derecede hızlıdır.
                        </p>
                      </div>

                      {/* 4 Performance KPI Cards */}
                      <div className="grid grid-cols-4 gap-3 text-center text-xs">
                        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                          <div className="text-[10px] text-indigo-700 font-bold uppercase">Sitenizin Hızı</div>
                          <div className="text-xl font-black font-mono text-indigo-950 my-0.5">96 / 100</div>
                          <div className="text-[10px] text-emerald-700 font-bold">Liderden +32 Puan Hızlı</div>
                        </div>
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                          <div className="text-[10px] text-slate-600 font-bold uppercase">1. Rakip Hızı</div>
                          <div className="text-xl font-black font-mono text-slate-900 my-0.5">64 / 100</div>
                          <div className="text-[10px] text-rose-700 font-bold">Ağır LCP (+3.4sn)</div>
                        </div>
                        <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-xl">
                          <div className="text-[10px] text-cyan-800 font-bold uppercase">Global Ayak İzi</div>
                          <div className="text-xl font-black font-mono text-cyan-950 my-0.5">%82 Kapsama</div>
                          <div className="text-[10px] text-cyan-700 font-bold">10 Kritik Pazar</div>
                        </div>
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                          <div className="text-[10px] text-emerald-800 font-bold uppercase">Beyaz Boşluk / Fırsat</div>
                          <div className="text-xl font-black font-mono text-emerald-950 my-0.5">6 Bölge</div>
                          <div className="text-[10px] text-emerald-700 font-bold">Sıfır Rakip Varlığı</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ======================================================= */}
                  {/* SECTION 3: CUSTOM CONSULTANT / EXECUTIVE NOTE */}
                  {/* ======================================================= */}
                  {isSectionActive("customNote") && settings.customConsultantNote && (
                    <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950 space-y-1 relative z-10" style={{ pageBreakInside: "avoid" }}>
                      <div className="font-bold flex items-center gap-1.5 text-[11px] text-amber-900 uppercase tracking-wider">
                        <FileText className="w-3.5 h-3.5 text-amber-700" />
                        <span>Özel Danışman & Yönetim Kurulu Değerlendirme Notu</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-800">
                        {settings.customConsultantNote}
                      </p>
                    </div>
                  )}

                  {/* ======================================================= */}
                  {/* SECTION 4: VEKTÖREL RADAR 1 (SEKTÖREL SEO PERFORMANS RADARI) */}
                  {/* ======================================================= */}
                  {isSectionActive("radarPerformance") && (
                    <div className="space-y-3 pt-1 relative z-10" style={{ pageBreakInside: "avoid" }}>
                      <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                        <div className="font-black text-slate-950 text-sm uppercase tracking-wider flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-lg text-white flex items-center justify-center text-xs font-black ${themeStyles.primaryBg}`}>1</span>
                          <span>Vektörel Radar 1: Sektörel SEO Performans Radarı (D3 6-Eksen Vektör Verisi)</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                          {settings.sector} • %100 Vektör Kalitesi
                        </span>
                      </div>

                      <div className="grid grid-cols-12 gap-4 items-center bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
                        {/* High-Res SVG Radar 1 */}
                        <div className="col-span-6 flex justify-center">
                          <svg width="400" height="320" viewBox="0 0 400 320" className="overflow-visible">
                            {/* Web Rings */}
                            {radar1Config.webRings.map((ring, idx) => (
                              <g key={idx}>
                                <polygon
                                  points={ring.points}
                                  fill={idx === radar1Config.webRings.length - 1 ? "#ffffff" : "none"}
                                  stroke="#cbd5e1"
                                  strokeWidth="1"
                                  strokeDasharray={idx < radar1Config.webRings.length - 1 ? "3 3" : "none"}
                                />
                                <text
                                  x={radar1Config.cx + 4}
                                  y={radar1Config.cy - (radar1Config.radius * ring.ratio) + 11}
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
                            {radar1Config.axisLines.map((axis, idx) => (
                              <g key={idx}>
                                <line
                                  x1={radar1Config.cx}
                                  y1={radar1Config.cy}
                                  x2={axis.xOuter}
                                  y2={axis.yOuter}
                                  stroke="#e2e8f0"
                                  strokeWidth="1"
                                />
                                <text
                                  x={axis.xLabel}
                                  y={axis.yLabel}
                                  textAnchor={axis.textAnchor as any}
                                  dominantBaseline="central"
                                  fill="#334155"
                                  fontSize="10"
                                  fontWeight="700"
                                >
                                  {axis.label}
                                </text>
                              </g>
                            ))}

                            {/* Polygon 1: Pazar Lideri */}
                            <polygon
                              points={radar1Config.getPolygonPoints("leader")}
                              fill="rgba(249, 115, 22, 0.12)"
                              stroke="#ea580c"
                              strokeWidth="2"
                              strokeDasharray="4 2"
                            />

                            {/* Polygon 2: Siteniz (User Entity) */}
                            <polygon
                              points={radar1Config.getPolygonPoints("user")}
                              fill={themeStyles.radarUserFill}
                              stroke={themeStyles.radarUserStroke}
                              strokeWidth="3"
                            />

                            {/* Data points for user */}
                            {radar1Config.axes.map((a, i) => {
                              const angle = (i / radar1Config.axes.length) * 2 * Math.PI - Math.PI / 2;
                              const r = (a.user / 100) * radar1Config.radius;
                              const x = radar1Config.cx + r * Math.cos(angle);
                              const y = radar1Config.cy + r * Math.sin(angle);
                              return (
                                <circle
                                  key={i}
                                  cx={x}
                                  cy={y}
                                  r="4"
                                  fill={themeStyles.radarUserStroke}
                                  stroke="#ffffff"
                                  strokeWidth="1.5"
                                />
                              );
                            })}
                          </svg>
                        </div>

                        {/* Radar Legend & Metrics Breakdown */}
                        <div className="col-span-6 space-y-2.5 text-xs">
                          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold flex items-center gap-1.5">
                                <span className={`w-3.5 h-3.5 rounded-full ${themeStyles.primaryBg}`} />
                                <span className="text-slate-900">{settings.companyName} (Siz)</span>
                              </span>
                              <span className="font-mono font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[11px]">
                                Skor: 86.8 / 100
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-600">
                              Site Hızı (%96) ve Teknik SEO (%98) eksenlerinde pazar liderinin 30+ puan önündesiniz.
                            </div>
                          </div>

                          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold flex items-center gap-1.5">
                                <span className="w-3.5 h-3.5 rounded-full bg-amber-500" />
                                <span className="text-slate-900">Pazar Lideri (#1 Rakip)</span>
                              </span>
                              <span className="font-mono font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px]">
                                Skor: 74.0 / 100
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-600">
                              Backlink Kalitesi (%92) ve Alan Adı Otoritesinde (%88) üstünlüğünü korumaktadır.
                            </div>
                          </div>

                          <div className="p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-200/60 text-[11px] text-indigo-950 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                            <span>
                              <strong>Stratejik Fırsat:</strong> 0.02s hız avantajınızla yerel semt sayfalarında liderin önüne geçebilirsiniz.
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ======================================================= */}
                  {/* SECTION 5: VEKTÖREL RADAR 2 & RADAR 3 (ÇİFT RADAR GRID) */}
                  {/* ======================================================= */}
                  {(isSectionActive("radarKeyword") || isSectionActive("radarSpeedCWV")) && (
                    <div className="space-y-3 pt-2 relative z-10" style={{ pageBreakInside: "avoid" }}>
                      <div className="grid grid-cols-2 gap-4">
                        
                        {/* Radar 2: Keyword Benchmark */}
                        {isSectionActive("radarKeyword") && (
                          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200 space-y-2">
                            <div className="font-black text-slate-950 text-xs uppercase tracking-wider flex items-center justify-between border-b border-slate-200 pb-1.5">
                              <div className="flex items-center gap-1.5">
                                <span className="w-4 h-4 rounded bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">2</span>
                                <span>Anahtar Kelime SERP Radarı</span>
                              </div>
                              <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">5-Eksen D3</span>
                            </div>

                            <div className="flex justify-center py-1">
                              <svg width="260" height="210" viewBox="0 0 400 320" className="overflow-visible">
                                {radar2Config.webRings.map((ring, idx) => (
                                  <polygon
                                    key={idx}
                                    points={ring.points}
                                    fill="none"
                                    stroke="#cbd5e1"
                                    strokeWidth="1"
                                    strokeDasharray="2 2"
                                  />
                                ))}
                                {radar2Config.axisLines.map((axis, idx) => (
                                  <g key={idx}>
                                    <line x1={radar2Config.cx} y1={radar2Config.cy} x2={axis.xOuter} y2={axis.yOuter} stroke="#e2e8f0" strokeWidth="1" />
                                    <text x={axis.xLabel} y={axis.yLabel} textAnchor={axis.textAnchor as any} dominantBaseline="central" fill="#475569" fontSize="11" fontWeight="700">
                                      {axis.label}
                                    </text>
                                  </g>
                                ))}
                                <polygon points={radar2Config.getPolygonPoints("leader")} fill="rgba(59, 130, 246, 0.15)" stroke="#3b82f6" strokeWidth="2" strokeDasharray="3 2" />
                                <polygon points={radar2Config.getPolygonPoints("user")} fill="rgba(16, 185, 129, 0.3)" stroke="#10b981" strokeWidth="2.5" />
                              </svg>
                            </div>

                            <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-200">
                              <span className="text-emerald-700 font-bold flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                                <span>Siz: %88 Tıklama Payı</span>
                              </span>
                              <span className="text-blue-700 font-bold flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-blue-600" />
                                <span>Lider: %94 Hacim</span>
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Radar 3: Core Web Vitals */}
                        {isSectionActive("radarSpeedCWV") && (
                          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200 space-y-2">
                            <div className="font-black text-slate-950 text-xs uppercase tracking-wider flex items-center justify-between border-b border-slate-200 pb-1.5">
                              <div className="flex items-center gap-1.5">
                                <span className="w-4 h-4 rounded bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black">3</span>
                                <span>Core Web Vitals Hız Radarı</span>
                              </div>
                              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">CWV 6-Eksen</span>
                            </div>

                            <div className="flex justify-center py-1">
                              <svg width="260" height="210" viewBox="0 0 400 320" className="overflow-visible">
                                {radar3Config.webRings.map((ring, idx) => (
                                  <polygon
                                    key={idx}
                                    points={ring.points}
                                    fill="none"
                                    stroke="#cbd5e1"
                                    strokeWidth="1"
                                    strokeDasharray="2 2"
                                  />
                                ))}
                                {radar3Config.axisLines.map((axis, idx) => (
                                  <g key={idx}>
                                    <line x1={radar3Config.cx} y1={radar3Config.cy} x2={axis.xOuter} y2={axis.yOuter} stroke="#e2e8f0" strokeWidth="1" />
                                    <text x={axis.xLabel} y={axis.yLabel} textAnchor={axis.textAnchor as any} dominantBaseline="central" fill="#475569" fontSize="11" fontWeight="700">
                                      {axis.label}
                                    </text>
                                  </g>
                                ))}
                                <polygon points={radar3Config.getPolygonPoints("leader")} fill="rgba(244, 63, 94, 0.15)" stroke="#f43f5e" strokeWidth="2" strokeDasharray="3 2" />
                                <polygon points={radar3Config.getPolygonPoints("user")} fill="rgba(99, 102, 241, 0.35)" stroke="#4f46e5" strokeWidth="2.5" />
                              </svg>
                            </div>

                            <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-200">
                              <span className="text-indigo-700 font-bold flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-indigo-600" />
                                <span>Siz: 0.02s TTFB (Kusursuz)</span>
                              </span>
                              <span className="text-rose-700 font-bold flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-rose-600" />
                                <span>Lider: Ağır LCP (+3.4s)</span>
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ======================================================= */}
                  {/* SECTION 6: GLOBAL SEO ISI HARİTASI & COĞRAFİ AYAK İZİ (VEKTÖREL SVG MAP + MATRİS) */}
                  {/* ======================================================= */}
                  {isSectionActive("vectorHeatmap") && (
                    <div className="space-y-3 pt-3 relative z-10" style={{ pageBreakInside: "avoid" }}>
                      <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                        <div className="font-black text-slate-950 text-sm uppercase tracking-wider flex items-center gap-2">
                          <span className="w-5 h-5 rounded-lg bg-cyan-600 text-white flex items-center justify-center text-xs font-black">4</span>
                          <span>Global SEO Isı Haritası & Rakip Coğrafi Ayak İzi (10 Hedef Pazar)</span>
                        </div>
                        <span className="text-[10px] font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200">
                          Gemini 3.8 Flash • Canlı Isı Verisi
                        </span>
                      </div>

                      {/* Vector Map SVG Canvas */}
                      <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 text-xs">
                            <Globe className="w-4 h-4 text-cyan-400" />
                            <span className="font-bold text-cyan-200">Coğrafi Varlık & SERP Hakimiyet Isı Haritası</span>
                          </div>
                          <div className="flex items-center gap-3 text-[10px]">
                            <span className="flex items-center gap-1">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                              <span className="text-slate-300">Hakim (&gt;75)</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                              <span className="text-slate-300">Güçlü (55-74)</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                              <span className="text-slate-300">Çekişmeli</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                              <span className="text-slate-300">Soğuk/Fırsat</span>
                            </span>
                          </div>
                        </div>

                        {/* SVG Vector Map Rendering */}
                        <div className="w-full flex justify-center py-2">
                          <svg width="600" height="260" viewBox="0 0 600 260" className="w-full h-auto">
                            {/* Map Grid / Latitude Longitude Lines */}
                            <line x1="50" y1="80" x2="550" y2="80" stroke="#1e293b" strokeDasharray="4 4" strokeWidth="1" />
                            <line x1="50" y1="150" x2="550" y2="150" stroke="#1e293b" strokeDasharray="4 4" strokeWidth="1" />
                            <line x1="50" y1="210" x2="550" y2="210" stroke="#1e293b" strokeDasharray="4 4" strokeWidth="1" />
                            <line x1="200" y1="30" x2="200" y2="240" stroke="#1e293b" strokeDasharray="4 4" strokeWidth="1" />
                            <line x1="380" y1="30" x2="380" y2="240" stroke="#1e293b" strokeDasharray="4 4" strokeWidth="1" />

                            {/* Geographic Routes / Arcs */}
                            <path d="M 120 70 Q 190 85 260 110" fill="none" stroke="#0ea5e9" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
                            <path d="M 80 60 Q 170 80 260 110" fill="none" stroke="#0ea5e9" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
                            <path d="M 260 110 Q 350 175 440 240" fill="none" stroke="#0ea5e9" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
                            <path d="M 260 110 Q 360 120 460 130" fill="none" stroke="#0ea5e9" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />

                            {/* Hub Nodes (Cities & Regions) */}
                            {heatmapDataset.regions.map((region) => {
                              const coords = vectorMapCoordinates[region.id] || { x: 300, y: 130, label: region.name };
                              const heatColor = getHeatFill(region.userFootprint.heatScore);

                              return (
                                <g key={region.id}>
                                  {/* Pulsing Radial Heat Circle */}
                                  <circle cx={coords.x} cy={coords.y} r="18" fill={heatColor} opacity="0.15" />
                                  <circle cx={coords.x} cy={coords.y} r="10" fill={heatColor} opacity="0.3" />
                                  <circle cx={coords.x} cy={coords.y} r="5" fill={heatColor} stroke="#ffffff" strokeWidth="1.5" />
                                  
                                  {/* Label text */}
                                  <text
                                    x={coords.x}
                                    y={coords.y - 12}
                                    textAnchor="middle"
                                    fill="#f8fafc"
                                    fontSize="9"
                                    fontWeight="bold"
                                  >
                                    {coords.label}
                                  </text>

                                  {/* Share badge */}
                                  <text
                                    x={coords.x}
                                    y={coords.y + 16}
                                    textAnchor="middle"
                                    fill={heatColor}
                                    fontSize="8"
                                    fontFamily="monospace"
                                    fontWeight="bold"
                                  >
                                    %{region.userFootprint.marketSharePercent} Pay
                                  </text>
                                </g>
                              );
                            })}
                          </svg>
                        </div>
                      </div>

                      {/* 10 Regions Summary Table */}
                      <div className="overflow-hidden rounded-xl border border-slate-200">
                        <table className="w-full text-left border-collapse text-[10px]">
                          <thead>
                            <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                              <th className="py-1.5 px-2.5">Hedef Pazar Bölgesi</th>
                              <th className="py-1.5 px-2">Arama Hacmi</th>
                              <th className="py-1.5 px-2 text-center">Siteniz (Pay / Skor)</th>
                              <th className="py-1.5 px-2 text-center">Lider (#1)</th>
                              <th className="py-1.5 px-2 text-center">SERP Sıranız</th>
                              <th className="py-1.5 px-2 text-right">Durum</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium">
                            {heatmapDataset.regions.map((reg) => (
                              <tr key={reg.id} className="hover:bg-slate-50">
                                <td className="py-1.5 px-2.5 font-bold text-slate-900 flex items-center gap-1.5">
                                  <span>{reg.flag}</span>
                                  <span>{reg.name}</span>
                                </td>
                                <td className="py-1.5 px-2 font-mono text-slate-600">{reg.monthlySearchVolumeFormatted}</td>
                                <td className="py-1.5 px-2 text-center">
                                  <span className="font-mono font-bold text-indigo-700">
                                    %{reg.userFootprint.marketSharePercent} (Skor: {reg.userFootprint.heatScore})
                                  </span>
                                </td>
                                <td className="py-1.5 px-2 text-center font-mono text-slate-600">
                                  %{reg.compLeaderFootprint.marketSharePercent} (Skor: {reg.compLeaderFootprint.heatScore})
                                </td>
                                <td className="py-1.5 px-2 text-center font-mono font-bold text-slate-800">
                                  #{reg.userFootprint.averageRank}
                                </td>
                                <td className="py-1.5 px-2 text-right">
                                  {reg.whiteSpaceOpportunity ? (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      Beyaz Boşluk
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-600">
                                      {reg.userFootprint.status || "Aktif"}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* ======================================================= */}
                  {/* SECTION 7: GEMINI FLANKING & BÖLGESEL BÜYÜME DİREKTİFLERİ */}
                  {/* ======================================================= */}
                  {isSectionActive("heatmapFlanking") && (
                    <div className="space-y-2 pt-2 relative z-10" style={{ pageBreakInside: "avoid" }}>
                      <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-200 space-y-1.5 text-xs">
                        <div className="font-bold text-indigo-950 text-xs flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4 text-indigo-700" />
                          <span>Gemini AI Kuşatma (Flanking) & Çevre Pazarlardan Pazar Payı Kapma Direktifi</span>
                        </div>
                        <p className="text-[11px] text-slate-700 leading-relaxed">
                          Liderin yüksek backlink ve bütçe gücüyle kilitlediği ana metropolde doğrudan kaynak tüketmek yerine;
                          Ankara B2B sanayi aksı, Akdeniz turizm koridoru ve Almanya DACH gurbetçi pazarında "de-DE" hreflang mimarisiyle
                          çevreleme yapılarak organik pazar payı %42 genişletilmelidir.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ======================================================= */}
                  {/* SECTION: GEMINI SWOT MATRIX */}
                  {/* ======================================================= */}
                  {isSectionActive("swotMatrix") && (
                    <div className="space-y-2 pt-2 relative z-10" style={{ pageBreakInside: "avoid" }}>
                      <div className="font-black text-slate-950 text-sm uppercase tracking-wider flex items-center justify-between border-b border-slate-200 pb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-lg bg-purple-700 text-white flex items-center justify-center text-xs font-black">
                            <Sparkles className="w-3 h-3" />
                          </span>
                          <span>Gemini AI Rekabetçi SWOT Matrisi</span>
                        </div>
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          Google SERP & Pazar Analizi
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                          <div className="font-black text-emerald-800 uppercase flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>GÜÇLÜ YÖNLER (Strengths)</span>
                          </div>
                          <ul className="text-slate-700 space-y-0.5 pl-1">
                            <li>&bull; Cloudflare Edge CDN: 98/100 Hız ve 0.02s LCP avantajı</li>
                            <li>&bull; Modern LocalBusiness JSON-LD Yapılandırılmış Veri</li>
                            <li>&bull; 7/24 Doğrudan Çağrı ve WhatsApp Anlık Dönüşüm CTA</li>
                          </ul>
                        </div>

                        <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-200 space-y-1">
                          <div className="font-black text-rose-800 uppercase flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            <span>ZAYIF YÖNLER (Weaknesses)</span>
                          </div>
                          <ul className="text-slate-700 space-y-0.5 pl-1">
                            <li>&bull; İndeksli alt semt sayfası sayısı rakiplerin gerisinde (12 vs 42)</li>
                            <li>&bull; Blog ve derin teknik rehber içerik hacmi eksikliği</li>
                            <li>&bull; Organik arama kelime kapsamı geliştirilmeye açık</li>
                          </ul>
                        </div>

                        <div className="p-2.5 rounded-xl bg-cyan-50/70 border border-cyan-200 space-y-1">
                          <div className="font-black text-cyan-800 uppercase flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5 text-cyan-600" />
                            <span>FIRSATLAR (Opportunities)</span>
                          </div>
                          <ul className="text-slate-700 space-y-0.5 pl-1">
                            <li>&bull; Lider rakiplerin Core Web Vitals başarısızlığı (LCP &gt; 3.4s)</li>
                            <li>&bull; Google Haritalar Yerel 3-Pack ve FAQPage zengin sonuçları</li>
                            <li>&bull; Semt bazlı uzun kuyruklu anahtar kelimelerde boşluklar</li>
                          </ul>
                        </div>

                        <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
                          <div className="font-black text-amber-800 uppercase flex items-center gap-1">
                            <Flame className="w-3.5 h-3.5 text-amber-600" />
                            <span>TEHDİTLER (Threats)</span>
                          </div>
                          <ul className="text-slate-700 space-y-0.5 pl-1">
                            <li>&bull; Rakiplerin agresif Google Ads ve CPC reklam bütçeleri</li>
                            <li>&bull; 8+ yıllık köklü alan adı otoritesi ve kurumsal backlink ağları</li>
                            <li>&bull; Google çekirdek algoritma güncellemelerindeki dalgalanmalar</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ======================================================= */}
                  {/* SECTION: CONTENT STRATEGY COMPARISON */}
                  {/* ======================================================= */}
                  {isSectionActive("contentStrategy") && (
                    <div className="space-y-2 pt-2 relative z-10" style={{ pageBreakInside: "avoid" }}>
                      <div className="font-black text-slate-950 text-sm uppercase tracking-wider flex items-center justify-between border-b border-slate-200 pb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-lg bg-blue-700 text-white flex items-center justify-center text-xs font-black">
                            <FileText className="w-3 h-3" />
                          </span>
                          <span>İçerik Stratejisi Kıyaslayıcı: Rakiplerin En Çok Trafik Çeken Sayfaları</span>
                        </div>
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          Hiyerarşi &bull; Uzunluk &bull; KW Yoğunluğu
                        </span>
                      </div>

                      <div className="overflow-hidden rounded-xl border border-slate-200 text-[10px]">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                              <th className="py-2 px-3">Sayfa / Varlık</th>
                              <th className="py-2 px-2 text-center">Kelime Sayısı</th>
                              <th className="py-2 px-2 text-center">Başlık Hiyerarşisi</th>
                              <th className="py-2 px-2 text-center">SSS Soru Oranı</th>
                              <th className="py-2 px-2 text-center">KW Yoğunluğu</th>
                              <th className="py-2 px-3 text-right">Aylık Tahmini Trafik</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            <tr className="bg-blue-50/50 font-bold">
                              <td className="py-2 px-3 text-blue-950 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-blue-600" />
                                <span>{settings.companyName} (Mevcut Açılış Sayfası)</span>
                              </td>
                              <td className="py-2 px-2 text-center font-mono">1.150 kelime</td>
                              <td className="py-2 px-2 text-center font-mono text-indigo-700">1 H1 &bull; 5 H2 &bull; 8 H3</td>
                              <td className="py-2 px-2 text-center font-mono text-emerald-700 font-bold">%62 (PAA)</td>
                              <td className="py-2 px-2 text-center font-mono">%1.56</td>
                              <td className="py-2 px-3 text-right text-indigo-700 font-bold">Hedeflenen</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 text-slate-900 font-medium">Lider Rakip #1 (Hizmet Sayfası)</td>
                              <td className="py-2 px-2 text-center font-mono text-emerald-700 font-bold">2.350 kelime</td>
                              <td className="py-2 px-2 text-center font-mono">1 H1 &bull; 8 H2 &bull; 14 H3</td>
                              <td className="py-2 px-2 text-center font-mono text-purple-700 font-bold">%64</td>
                              <td className="py-2 px-2 text-center font-mono text-emerald-700 font-bold">%2.21</td>
                              <td className="py-2 px-3 text-right text-emerald-700 font-bold">18.450 / ay (%42)</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 text-slate-900 font-medium">Rakip #2 (Bilgi & Sütun Rehberi)</td>
                              <td className="py-2 px-2 text-center font-mono">1.890 kelime</td>
                              <td className="py-2 px-2 text-center font-mono">1 H1 &bull; 6 H2 &bull; 11 H3</td>
                              <td className="py-2 px-2 text-center font-mono">%58</td>
                              <td className="py-2 px-2 text-center font-mono">%1.69</td>
                              <td className="py-2 px-3 text-right text-slate-700">11.200 / ay (%26)</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 text-slate-900 font-medium">Rakip #3 (Semt & Bölge Hub Sayfası)</td>
                              <td className="py-2 px-2 text-center font-mono">1.650 kelime</td>
                              <td className="py-2 px-2 text-center font-mono">1 H1 &bull; 7 H2 &bull; 9 H3</td>
                              <td className="py-2 px-2 text-center font-mono">%45</td>
                              <td className="py-2 px-2 text-center font-mono">%2.18</td>
                              <td className="py-2 px-3 text-right text-slate-700">7.600 / ay (%18)</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* ======================================================= */}
                  {/* SECTION 7b: CONTENT EXPANSION (BLOG & META DRAFTS) */}
                  {/* ======================================================= */}
                  {isSectionActive("contentExpansion") && (
                    <div className="space-y-3 pt-2 relative z-10" style={{ pageBreakInside: "avoid" }}>
                      <div className="font-black text-slate-950 text-sm uppercase tracking-wider flex items-center justify-between border-b border-slate-200 pb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-lg bg-cyan-600 text-white flex items-center justify-center text-xs font-black">4b</span>
                          <span>İçerik Geliştirme Önerileri (Trafik Odaklı Blog & Meta Taslakları)</span>
                        </div>
                        <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                          Rakiplerden Alınan Veri &bull; Google SERP Önizleme
                        </span>
                      </div>

                      <div className="overflow-hidden rounded-xl border border-slate-200 text-[10px]">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                              <th className="py-2 px-3">Hedef Blog Başlığı (H1) & Format</th>
                              <th className="py-2 px-3">Google SERP Meta Title & Description Taslağı</th>
                              <th className="py-2 px-2 text-center">Niyet / Arama</th>
                              <th className="py-2 px-2 text-center">Hedeflenen Rakip Açığı</th>
                              <th className="py-2 px-3 text-right">Potansiyel</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            <tr>
                              <td className="py-2 px-3 text-slate-900 font-bold">
                                <div>2026 Çekici & Kurtarma Fiyat Tarifesi</div>
                                <span className="text-[9px] font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">Fiyat & Karşılaştırma</span>
                              </td>
                              <td className="py-2 px-3 text-slate-700">
                                <div className="font-bold text-blue-900">İstanbul Çekici Fiyatları 2026 | KM Başı Ücret Hesaplama</div>
                                <div className="text-[9px] text-slate-500">2026 yılı çekici km başı ücret hesaplama tablosuyla en uygun fiyatı hemen öğrenin. 7/24 arayın!</div>
                              </td>
                              <td className="py-2 px-2 text-center font-bold text-emerald-700">Ticari &bull; 18.4K/ay</td>
                              <td className="py-2 px-2 text-center text-slate-600">Liderin 2024 tarihli eskiyen fiyat rehberini güncel tavan/taban tablosuyla geçin</td>
                              <td className="py-2 px-3 text-right font-bold text-emerald-700">+3.200 / ay</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 text-slate-900 font-bold">
                                <div>Yolda Kaldım Ne Yapmalıyım? 7 Güvenli Adım</div>
                                <span className="text-[9px] font-mono text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">Acil / Nasıl Yapılır</span>
                              </td>
                              <td className="py-2 px-3 text-slate-700">
                                <div className="font-bold text-blue-900">Yolda Kalınca Ne Yapılır? Güvenli Çekici Çağırma Rehberi</div>
                                <div className="text-[9px] text-slate-500">Trafikte veya otobanda araba bozulunca ilk ne yapılır? Reflektör ve canlı konum gönderme adımları burada!</div>
                              </td>
                              <td className="py-2 px-2 text-center font-bold text-rose-700">Acil &bull; 14.6K/ay</td>
                              <td className="py-2 px-2 text-center text-slate-600">Rakipteki teorik yazıyı WhatsApp canlı konum ve acil güvenlik adımlarıyla ezin</td>
                              <td className="py-2 px-3 text-right font-bold text-emerald-700">+2.450 / ay</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 text-slate-900 font-bold">
                                <div>Kasko Çekici Hizmeti: 9 Soru & Cevap</div>
                                <span className="text-[9px] font-mono text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">Soru & Cevap (PAA)</span>
                              </td>
                              <td className="py-2 px-3 text-slate-700">
                                <div className="font-bold text-blue-900">Kasko Çekiciyi Karşılar mı? Yılda Kaç Kez Çağrılır? | Kılavuz</div>
                                <div className="text-[9px] text-slate-500">Kasko yılda kaç defa ücretsiz çekici hakkı verir? Şehirler arası KM sınırı ve acil çağırma şartları.</div>
                              </td>
                              <td className="py-2 px-2 text-center font-bold text-blue-700">Bilgi &bull; 11.8K/ay</td>
                              <td className="py-2 px-2 text-center text-slate-600">Sigorta şirketlerinin yetersiz sayfalarından Google PAA soru kutularını çekin</td>
                              <td className="py-2 px-3 text-right font-bold text-emerald-700">+1.950 / ay</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* ======================================================= */}
                  {/* SECTION 7c: AD SPEND EFFICIENCY & CPC ARBITRAGE */}
                  {/* ======================================================= */}
                  {isSectionActive("adEfficiency") && (
                    <div className="space-y-3 pt-2 relative z-10" style={{ pageBreakInside: "avoid" }}>
                      <div className="font-black text-slate-950 text-sm uppercase tracking-wider flex items-center justify-between border-b border-slate-200 pb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-black">4c</span>
                          <span>Reklam Harcama Verimliliği & CPC Arbitraj Analizi</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Google Ads & Harita Pin Verileri
                        </span>
                      </div>

                      <div className="overflow-hidden rounded-xl border border-slate-200 text-[10px]">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                              <th className="py-2 px-3">Firma / Model</th>
                              <th className="py-2 px-2 text-center">Tahmini Harcama</th>
                              <th className="py-2 px-2 text-center">Ort. CPC</th>
                              <th className="py-2 px-2 text-center">ROAS</th>
                              <th className="py-2 px-2 text-center">İsraf Tespiti</th>
                              <th className="py-2 px-3">Stratejik Açık & Arbitraj Taktik</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            <tr className="bg-emerald-50/50">
                              <td className="py-2 px-3 font-black text-emerald-900">
                                Sizin Modeliniz (Tasarruf Hedefli)
                              </td>
                              <td className="py-2 px-2 text-center font-bold text-emerald-700 font-mono">32.000 TL</td>
                              <td className="py-2 px-2 text-center font-bold text-emerald-700 font-mono">28.5 TL</td>
                              <td className="py-2 px-2 text-center font-black text-emerald-800">4.8x</td>
                              <td className="py-2 px-2 text-center font-bold text-emerald-700">Minimum (%10)</td>
                              <td className="py-2 px-3 text-slate-700">Kalite Skoru 9/10 ve Cloudflare 0.02s hız ile rakiplerden %40 daha ucuz tık maliyeti</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 font-bold text-slate-900">
                                Lider Rakip Portalı
                              </td>
                              <td className="py-2 px-2 text-center font-bold text-slate-700 font-mono">165.000 TL</td>
                              <td className="py-2 px-2 text-center font-bold text-blue-700 font-mono">48.5 TL</td>
                              <td className="py-2 px-2 text-center font-bold text-amber-700">2.8x</td>
                              <td className="py-2 px-2 text-center font-bold text-rose-700">42.000 TL (İsraf)</td>
                              <td className="py-2 px-3 text-slate-600">Geniş eşleme ile alakasız aramalara para kaptırıyor; negatif kelime kalkanı yok</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 font-bold text-slate-900">
                                Bölgesel Kurtarma Ağı
                              </td>
                              <td className="py-2 px-2 text-center font-bold text-slate-700 font-mono">95.000 TL</td>
                              <td className="py-2 px-2 text-center font-bold text-blue-700 font-mono">52.0 TL</td>
                              <td className="py-2 px-2 text-center font-bold text-blue-700">3.4x</td>
                              <td className="py-2 px-2 text-center font-bold text-rose-700">16.000 TL (İsraf)</td>
                              <td className="py-2 px-3 text-slate-600">Yavaş açılan iniş sayfası sebebiyle Kalite Skoru 6/10; gereksiz yüksek teklif veriyor</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* ======================================================= */}
                  {/* SECTION 8: BENCHMARK TABLE & ALERTS LOGS */}
                  {/* ======================================================= */}
                  {isSectionActive("benchmarkTable") && (
                    <div className="space-y-3 pt-2 relative z-10" style={{ pageBreakInside: "avoid" }}>
                      <div className="font-black text-slate-950 text-sm uppercase tracking-wider flex items-center justify-between border-b border-slate-200 pb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-lg bg-slate-800 text-white flex items-center justify-center text-xs font-black">5</span>
                          <span>Sektörel Rakip Metrikleri Karşılaştırma Matrisi</span>
                        </div>
                      </div>

                      <div className="overflow-hidden rounded-xl border border-slate-200 text-[10px]">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                              <th className="py-2 px-3">İşletme / Varlık</th>
                              <th className="py-2 px-2 text-center">Site Hızı</th>
                              <th className="py-2 px-2 text-center">CWV LCP</th>
                              <th className="py-2 px-2 text-center">Domain Otoritesi (DA)</th>
                              <th className="py-2 px-2 text-center">Backlink Gücü</th>
                              <th className="py-2 px-3 text-right">Zafiyet & Fırsat</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            <tr className="bg-indigo-50/40 font-bold">
                              <td className="py-2 px-3 text-indigo-950 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-indigo-600" />
                                <span>{settings.companyName} (Siz)</span>
                              </td>
                              <td className="py-2 px-2 text-center font-mono text-emerald-700 font-bold">96 / 100</td>
                              <td className="py-2 px-2 text-center font-mono text-emerald-700 font-bold">0.02s</td>
                              <td className="py-2 px-2 text-center font-mono">68 / 100</td>
                              <td className="py-2 px-2 text-center font-mono">74 / 100</td>
                              <td className="py-2 px-3 text-right text-emerald-700 font-bold">0.02s Hız Avantajı</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 text-slate-900 font-medium">Sektör Lideri A.Ş.</td>
                              <td className="py-2 px-2 text-center font-mono text-rose-700 font-bold">64 / 100</td>
                              <td className="py-2 px-2 text-center font-mono text-rose-700">3.4sn</td>
                              <td className="py-2 px-2 text-center font-mono">88 / 100</td>
                              <td className="py-2 px-2 text-center font-mono">92 / 100</td>
                              <td className="py-2 px-3 text-right text-rose-700 font-bold">Ağır LCP & Mobil Hata</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 text-slate-900 font-medium">Bölgesel Güçlü Rakip</td>
                              <td className="py-2 px-2 text-center font-mono text-amber-700 font-bold">72 / 100</td>
                              <td className="py-2 px-2 text-center font-mono">2.6sn</td>
                              <td className="py-2 px-2 text-center font-mono">55 / 100</td>
                              <td className="py-2 px-2 text-center font-mono">58 / 100</td>
                              <td className="py-2 px-3 text-right text-slate-600">Teknik Şema Eksikliği</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* ======================================================= */}
                  {/* SECTION 9: ACTION PLAN (30-60-90 GÜN) */}
                  {/* ======================================================= */}
                  {isSectionActive("actionPlan") && (
                    <div className="space-y-3 pt-2 relative z-10" style={{ pageBreakInside: "avoid" }}>
                      <div className="font-black text-slate-950 text-sm uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-1.5">
                        <span className="w-5 h-5 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-black">6</span>
                        <span>1. Sıraya Yerleşme Stratejik Yol Haritası (30 - 60 - 90 Gün)</span>
                      </div>

                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                          <div className="text-[10px] uppercase font-black text-indigo-700">Faz 1: Gün 1 - 30</div>
                          <div className="font-bold text-slate-900">Teknik & Hız İzolasyonu</div>
                          <p className="text-[10px] text-slate-600 leading-relaxed">
                            Cloudflare 0.02s Edge cache ile Googlebot tarama bütçesi %100'e çekilecek, Core Web Vitals skoru sabitlenecek.
                          </p>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                          <div className="text-[10px] uppercase font-black text-emerald-700">Faz 2: Gün 31 - 60</div>
                          <div className="font-bold text-slate-900">İçerik Derinliği & Semt Kuşatması</div>
                          <p className="text-[10px] text-slate-600 leading-relaxed">
                            2.400+ kelimelik Sütun Rehberi ve 12 ilçede LocalBusiness şema sayfaları devreye alınarak arama motoru harita 3-pack'i fethedilecek.
                          </p>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                          <div className="text-[10px] uppercase font-black text-cyan-700">Faz 3: Gün 61 - 90</div>
                          <div className="font-bold text-slate-900">Otorite & SERP #1 Sahiplenmesi</div>
                          <p className="text-[10px] text-slate-600 leading-relaxed">
                            15+ Sektörel backlink ve İnteraktif Fiyat/KM Hesaplayıcı aracı ile ortalama sayfada kalma süresi 3 katına çıkarılacak.
                          </p>
                        </div>
                      </div>

                      {/* Prioritized 3-Month Key Tasks Table */}
                      <div className="overflow-hidden rounded-xl border border-slate-200 text-[9px] mt-2">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                              <th className="py-1.5 px-2">Sprint</th>
                              <th className="py-1.5 px-2">Öncelikli Görev & Stratejik Gerekçe</th>
                              <th className="py-1.5 px-2">Kategori</th>
                              <th className="py-1.5 px-2 text-center">Öncelik / Etki</th>
                              <th className="py-1.5 px-2">Hedef KPI & Kapatılan Açık</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            <tr>
                              <td className="py-1.5 px-2 font-mono font-bold text-indigo-700">1. Ay (G1-30)</td>
                              <td className="py-1.5 px-2 font-medium text-slate-900">Cloudflare Edge Cache & CWV İzolasyonu (LCP &lt; 0.8s)</td>
                              <td className="py-1.5 px-2 text-slate-600">Teknik SEO</td>
                              <td className="py-1.5 px-2 text-center font-bold text-rose-700">Kritik &bull; Çok Yüksek</td>
                              <td className="py-1.5 px-2 text-slate-600">CWV 98/100, Lider rakibin 58 hız açığını kapatır</td>
                            </tr>
                            <tr>
                              <td className="py-1.5 px-2 font-mono font-bold text-indigo-700">1. Ay (G1-30)</td>
                              <td className="py-1.5 px-2 font-medium text-slate-900">LocalBusiness & FAQPage JSON-LD Şema Entegrasyonu</td>
                              <td className="py-1.5 px-2 text-slate-600">Teknik SEO</td>
                              <td className="py-1.5 px-2 text-center font-bold text-amber-700">Yüksek &bull; Yüksek</td>
                              <td className="py-1.5 px-2 text-slate-600">SERP zengin sonuçlarda yıldızlı/sorulu snippet görünümü</td>
                            </tr>
                            <tr>
                              <td className="py-1.5 px-2 font-mono font-bold text-emerald-700">2. Ay (G31-60)</td>
                              <td className="py-1.5 px-2 font-medium text-slate-900">2.400+ Kelimelik Kapsamlı Sütun Rehberi (Pillar Guide)</td>
                              <td className="py-1.5 px-2 text-slate-600">İçerik Stratejisi</td>
                              <td className="py-1.5 px-2 text-center font-bold text-rose-700">Kritik &bull; Çok Yüksek</td>
                              <td className="py-1.5 px-2 text-slate-600">-813 kelimelik derinlik açığını kapatır, 1. sırayı zorlar</td>
                            </tr>
                            <tr>
                              <td className="py-1.5 px-2 font-mono font-bold text-emerald-700">2. Ay (G31-60)</td>
                              <td className="py-1.5 px-2 font-medium text-slate-900">Hedef 12 İlçe İçin Semt Açılış Sayfaları (Local Hubs)</td>
                              <td className="py-1.5 px-2 text-slate-600">Yerel SEO & Harita</td>
                              <td className="py-1.5 px-2 text-center font-bold text-rose-700">Kritik &bull; Çok Yüksek</td>
                              <td className="py-1.5 px-2 text-slate-600">12 semt kelimesinde ilk sayfaya giriş, 3-pack hakimiyeti</td>
                            </tr>
                            <tr>
                              <td className="py-1.5 px-2 font-mono font-bold text-purple-700">3. Ay (G61-90)</td>
                              <td className="py-1.5 px-2 font-medium text-slate-900">Sektörel Portallardan 15+ Otoriter Backlink Edinimi</td>
                              <td className="py-1.5 px-2 text-slate-600">Otorite & Backlink</td>
                              <td className="py-1.5 px-2 text-center font-bold text-rose-700">Kritik &bull; Çok Yüksek</td>
                              <td className="py-1.5 px-2 text-slate-600">Domain Otoritesini (DA) 42'den 65+ seviyesine yükseltmek</td>
                            </tr>
                            <tr>
                              <td className="py-1.5 px-2 font-mono font-bold text-purple-700">3. Ay (G61-90)</td>
                              <td className="py-1.5 px-2 font-medium text-slate-900">İnteraktif Fiyat & KM Hesaplayıcı Dönüşüm Aracı</td>
                              <td className="py-1.5 px-2 text-slate-600">Dönüşüm (CRO)</td>
                              <td className="py-1.5 px-2 text-center font-bold text-amber-700">Yüksek &bull; Yüksek</td>
                              <td className="py-1.5 px-2 text-slate-600">Sayfada kalma süresini 3 katına çıkarma, CVR %14</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* ======================================================= */}
                  {/* SECTION 10: OFFICIAL STAMP & SIGN-OFF BLOCK */}
                  {/* ======================================================= */}
                  {isSectionActive("signOff") && settings.showStamp && (
                    <div className="pt-6 border-t-2 border-slate-200 relative z-10" style={{ pageBreakInside: "avoid" }}>
                      <div className="grid grid-cols-2 gap-12 text-xs">
                        <div className="space-y-2">
                          <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                            Raporu Onaylayan Baş SEO Mimarı
                          </div>
                          <div className="h-16 border-b border-dashed border-slate-300 flex items-end pb-1 font-serif text-slate-600 italic">
                            Dijital Strateji & SEO Danışmanlığı
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            Sistem Kimliği: RADAR-SYSTEM-V5 • Tarih: {reportMeta.formattedDate}
                          </div>
                        </div>

                        <div className="space-y-2 text-right">
                          <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                            Resmi Şirket Kaşesi & Yetkili İmzası
                          </div>
                          <div className="h-16 border-b border-dashed border-slate-300 flex items-center justify-end pb-1">
                            <div className={`px-4 py-1.5 border-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${themeStyles.stampColor} opacity-90 rotate-[-2deg]`}>
                              ✓ RESMİ PAYDAŞ ONAYI
                            </div>
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Yetkili Şirket Temsilcisi ({settings.companyName})
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FOOTER & PAGE NUMBERING */}
                  {settings.showPageNumbers && (
                    <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 relative z-10">
                      <span>{settings.companyName} • Stratejik SEO Radar Raporu</span>
                      <span className="font-mono">Sayfa 1 / 3 • Resmi Paydaş Çıktısı</span>
                    </div>
                  )}

                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
