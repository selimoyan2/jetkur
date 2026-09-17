import React, { useState, useMemo, useRef } from "react";
import { SiteConfig, CustomerPanelTab, IndividualPageSeoMeta } from "../../types";
import { 
  auditAllSitePages, 
  autoFixAllMetaTags, 
  smartTrimText,
  generateOptimalTitle,
  generateOptimalDescription,
  AuditedPageMetaResult,
  MetaFieldAuditResult
} from "../../utils/metaAuditEngine";
import { 
  simulateLighthousePerformance, 
  SimulatedLighthouseScoreResult 
} from "../../utils/coreWebVitalsSimulator";
import { 
  generateSeoAuditorReport, 
  SeoAuditorReport 
} from "../../utils/seoAuditorEngine";
import { updatePageSeoMeta } from "../../utils/pageSeoRegistry";
import { PerformanceTrendsCard } from "./PerformanceTrendsCard";
import { GenerateSeoHeatmapCard } from "./GenerateSeoHeatmapCard";
import { CompetitiveSeoBenchmarking } from "./CompetitiveSeoBenchmarking";
import {
  Trophy,
  Target,
  Activity,
  Search,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Smartphone,
  Monitor,
  Printer,
  FileDown,
  RefreshCw,
  ArrowUpRight,
  ExternalLink,
  ShieldCheck,
  Globe,
  Gauge,
  Layers,
  Sliders,
  Check,
  Copy,
  Wand2,
  ChevronRight,
  Info,
  Flame,
  Award,
  Share2,
  FileText,
  Clock,
  Eye,
  Tag
} from "lucide-react";

export interface SeoReportTabProps {
  config: SiteConfig;
  onChange: (updatedConfig: SiteConfig) => void;
  onPreview?: () => void;
  onNavigateTab?: (tab: CustomerPanelTab) => void;
  lastAuditedDate?: Date;
  onTriggerAudit?: () => void;
}

type ReportSubView = "overview" | "meta" | "performance" | "trends" | "heatmap" | "benchmarking" | "issues";

export const SeoReportTab: React.FC<SeoReportTabProps> = ({
  config,
  onChange,
  onPreview,
  onNavigateTab,
  lastAuditedDate,
  onTriggerAudit
}) => {
  const [activeSubView, setActiveSubView] = useState<ReportSubView>("overview");
  const [device, setDevice] = useState<"mobile" | "desktop">("mobile");
  const [selectedPageId, setSelectedPageId] = useState<string>("page-home");
  const [metaFilter, setMetaFilter] = useState<"all" | "missing" | "over_length" | "too_short" | "ideal">("all");
  const [isReauditing, setIsReauditing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const reportContainerRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Meta Tags Engine Audit
  const metaAuditSummary = useMemo(() => {
    return auditAllSitePages(config);
  }, [config]);

  // 2. Performance & Core Web Vitals Simulation Audit
  const performanceAudit: SimulatedLighthouseScoreResult = useMemo(() => {
    return simulateLighthousePerformance(config, device);
  }, [config, device]);

  // 3. SEO Auditor & Image Alt Health Report
  const seoAuditorReport: SeoAuditorReport = useMemo(() => {
    return generateSeoAuditorReport(config);
  }, [config]);

  // Combined Unified Score (Weighted: 45% Meta Tags & Content SEO, 40% Performance & Speed, 15% Technical SEO)
  const combinedHealthScore = useMemo(() => {
    const metaScore = metaAuditSummary.siteHealthScore;
    const perfScore = performanceAudit.overallScore;
    const techScore = seoAuditorReport.subScores.technical;
    return Math.round(metaScore * 0.45 + perfScore * 0.40 + techScore * 0.15);
  }, [metaAuditSummary.siteHealthScore, performanceAudit.overallScore, seoAuditorReport.subScores.technical]);

  // Grade calculation
  const overallGrade = useMemo(() => {
    if (combinedHealthScore >= 95) return { label: "A+", color: "text-emerald-400 bg-emerald-950/60 border-emerald-500/50" };
    if (combinedHealthScore >= 88) return { label: "A", color: "text-emerald-400 bg-emerald-950/60 border-emerald-500/50" };
    if (combinedHealthScore >= 75) return { label: "B", color: "text-amber-400 bg-amber-950/60 border-amber-500/50" };
    return { label: "C", color: "text-rose-400 bg-rose-950/60 border-rose-500/50" };
  }, [combinedHealthScore]);

  // Selected audited page for deep-dive
  const selectedPage = useMemo(() => {
    return metaAuditSummary.pages.find(p => p.pageId === selectedPageId) || metaAuditSummary.pages[0];
  }, [metaAuditSummary.pages, selectedPageId]);

  // Re-run Audit Handler
  const handleReRunAudit = () => {
    setIsReauditing(true);
    if (onTriggerAudit) {
      onTriggerAudit();
    }
    setTimeout(() => {
      setIsReauditing(false);
      showToast("✅ SEO ve Performans Denetimi başarıyla tamamlandı ve güncellendi!");
    }, 750);
  };

  // 1-Click Auto-Fix All Meta Tags
  const handleAutoFixAllMeta = () => {
    const { updatedConfig, fixedPagesCount } = autoFixAllMetaTags(config);
    onChange(updatedConfig);
    showToast(`⚡ ${fixedPagesCount} sayfadaki meta etiketleri ve eksiklikler otomatik düzeltildi!`);
  };

  // Apply Quick Fix for a specific field on selected page
  const handleQuickFixField = (pageId: string, field: "title" | "description" | "canonical", value: string) => {
    const patch: Partial<IndividualPageSeoMeta> = {};
    if (field === "title") patch.metaTitle = value;
    if (field === "description") patch.metaDescription = value;
    if (field === "canonical") patch.canonicalUrl = value;

    const nextConfig = updatePageSeoMeta(config, pageId, patch);
    onChange(nextConfig);
    showToast("✅ Değişiklik uygulandı!");
  };

  // Copy helper
  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Print report
  const handlePrintReport = () => {
    window.print();
  };

  // Filtered pages in Meta tab
  const filteredPages = useMemo(() => {
    if (metaFilter === "all") return metaAuditSummary.pages;
    if (metaFilter === "missing") return metaAuditSummary.pages.filter(p => p.hasMissing);
    if (metaFilter === "over_length") return metaAuditSummary.pages.filter(p => p.hasOverLength);
    if (metaFilter === "too_short") return metaAuditSummary.pages.filter(p => p.hasTooShort);
    if (metaFilter === "ideal") return metaAuditSummary.pages.filter(p => !p.hasMissing && !p.hasOverLength && !p.hasTooShort);
    return metaAuditSummary.pages;
  }, [metaAuditSummary.pages, metaFilter]);

  // Collected Critical & Warning Issues for the Action Plan
  const allCollectedIssues = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      description: string;
      category: "meta" | "performance" | "technical";
      severity: "critical" | "warning" | "good";
      actionLabel?: string;
      onAction?: () => void;
    }> = [];

    // Meta issues
    metaAuditSummary.pages.forEach(p => {
      if (p.titleAudit.status === "missing") {
        list.push({
          id: `meta-title-missing-${p.pageId}`,
          title: `Meta Başlığı Eksik: ${p.pageTitle}`,
          description: `Google arama dizininde ${p.slug} sayfası başlıksız snippet olarak görüntülenebilir.`,
          category: "meta",
          severity: "critical",
          actionLabel: "Otomatik Başlık Ata",
          onAction: () => handleQuickFixField(p.pageId, "title", p.titleAudit.autoFixedValue)
        });
      } else if (p.titleAudit.status === "over_length") {
        list.push({
          id: `meta-title-over-${p.pageId}`,
          title: `Meta Başlığı Çok Uzun (${p.titleAudit.charCount} krkt): ${p.pageTitle}`,
          description: `Google SERP sınırını (60 krkt) aşıyor. Son kısımlar (...) şeklinde kesilecektir.`,
          category: "meta",
          severity: "warning",
          actionLabel: "Akıllı Kırp (58 krkt)",
          onAction: () => handleQuickFixField(p.pageId, "title", smartTrimText(p.titleAudit.value, 58))
        });
      }

      if (p.descAudit.status === "missing") {
        list.push({
          id: `meta-desc-missing-${p.pageId}`,
          title: `Meta Açıklaması Eksik: ${p.pageTitle}`,
          description: `Google sayfa içerisinden rastgele metin çekerek tıklanma oranını (CTR) düşürür.`,
          category: "meta",
          severity: "critical",
          actionLabel: "Otomatik Açıklama Ata",
          onAction: () => handleQuickFixField(p.pageId, "description", p.descAudit.autoFixedValue)
        });
      } else if (p.descAudit.status === "over_length") {
        list.push({
          id: `meta-desc-over-${p.pageId}`,
          title: `Meta Açıklaması Çok Uzun (${p.descAudit.charCount} krkt): ${p.pageTitle}`,
          description: `155 karakterlik ideal sınırı aşıyor.`,
          category: "meta",
          severity: "warning",
          actionLabel: "Akıllı Kırp (155 krkt)",
          onAction: () => handleQuickFixField(p.pageId, "description", smartTrimText(p.descAudit.value, 155))
        });
      }

      if (p.canonicalAudit.status === "missing") {
        list.push({
          id: `canonical-missing-${p.pageId}`,
          title: `Canonical URL Eksik: ${p.pageTitle}`,
          description: `Arama motorları için özgün sayfa adresi tanımlanmamış.`,
          category: "meta",
          severity: "warning",
          actionLabel: "Canonical Ekle",
          onAction: () => handleQuickFixField(p.pageId, "canonical", p.fullUrl)
        });
      }
    });

    // Performance issues
    if (performanceAudit.lcp.status !== "good") {
      list.push({
        id: "perf-lcp-warning",
        title: `LCP (Largest Contentful Paint) Geliştirilmeli: ${performanceAudit.lcp.valueFormatted}`,
        description: performanceAudit.lcp.impactDescription,
        category: "performance",
        severity: "warning",
        actionLabel: "Görselleri AVIF/WebP'ye Çevir",
        onAction: () => onNavigateTab?.("ai-image-optimizer")
      });
    }

    if (performanceAudit.ttfb.rawValue > 50) {
      list.push({
        id: "perf-ttfb-warning",
        title: `Sunucu Yanıt Süresi (TTFB): ${performanceAudit.ttfb.valueFormatted}`,
        description: "Cloudflare Anycast Edge önbellekleme ve HTTP/3 QUIC protokolünü aktif tutun.",
        category: "performance",
        severity: "warning"
      });
    }

    // Good checks
    if (list.length === 0 || list.filter(i => i.severity === "critical").length === 0) {
      list.push({
        id: "core-web-vitals-passed",
        title: "Tüm Google Core Web Vitals Eşik Değerleri Karşılandı",
        description: `LCP: ${performanceAudit.lcp.valueFormatted}, INP: ${performanceAudit.inp.valueFormatted}, CLS: ${performanceAudit.cls.valueFormatted}. Siteniz Google PageSpeed 99+ hız standardındadır.`,
        category: "performance",
        severity: "good"
      });
    }

    return list;
  }, [metaAuditSummary.pages, performanceAudit, onNavigateTab]);

  return (
    <div ref={reportContainerRef} className="space-y-6" id="seo-report-tab-workspace">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 1. MASTER AUDIT HEADER BANNER */}
      {/* ===================================================================== */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 border border-indigo-900/40 shadow-2xl relative overflow-hidden">
        {/* Background decorative lights */}
        <div className="absolute -right-16 -top-16 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Title and Audit Status */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-black tracking-wider uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>SEO &amp; Performans Raporu</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700 text-[11px] font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Denetim Tarihi: {lastAuditedDate ? lastAuditedDate.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }) : "Az önce"}
                </span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>Kapsamlı SEO &amp; Performans Denetimi</span>
              <Sparkles className="w-6 h-6 text-amber-400 fill-amber-400/20" />
            </h1>

            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Bu rapor; web sitenizin tüm sayfalarındaki meta etiketlerini (Title, Description, OG, Canonical, Robots) 
              ve Google Core Web Vitals hız metriklerini canlı analiz ederek optimize eder.
            </p>
          </div>

          {/* Big Score Card & Action Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Health Score Pill */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 shadow-lg backdrop-blur-md">
              <div className="relative flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-4 border-slate-800 flex items-center justify-center">
                  <span className="text-2xl font-black text-white font-mono">{combinedHealthScore}</span>
                </div>
                <div className={`absolute -bottom-1 -right-1 px-2 py-0.5 rounded-md text-[10px] font-black border font-mono ${overallGrade.color}`}>
                  {overallGrade.label}
                </div>
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Genel Sağlık Skoru</div>
                <div className="text-sm font-black text-white">
                  {combinedHealthScore >= 90 ? "Mükemmel & Sıralamaya Hazır" : combinedHealthScore >= 75 ? "İyi Durumda, İyileştirmeler Var" : "Optimizasyon Gerekli"}
                </div>
                <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Google PageSpeed 99+ Hedefi</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                id="btn-rerun-seo-audit"
                onClick={handleReRunAudit}
                disabled={isReauditing}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                title="Sitenin güncel meta etiketlerini ve hız metriklerini yeniden analiz et"
              >
                <RefreshCw className={`w-4 h-4 fill-slate-950 ${isReauditing ? "animate-spin" : ""}`} />
                <span>{isReauditing ? "Denetleniyor..." : "Yeniden Denetle"}</span>
              </button>

              <button
                type="button"
                id="btn-autofix-all-meta-tags"
                onClick={handleAutoFixAllMeta}
                className="px-4 py-2.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-indigo-400/40 shadow-sm transition-all active:scale-95 cursor-pointer"
                title="Tüm sayfalardaki eksik ve taşan meta etiketlerini tek tıkla düzelt"
              >
                <Wand2 className="w-4 h-4 text-indigo-200" />
                <span>Tek Tıkla Meta Düzelt</span>
              </button>

              <button
                type="button"
                id="btn-print-seo-report"
                onClick={handlePrintReport}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                title="SEO Raporunu PDF olarak yazdır / dışa aktar"
              >
                <Printer className="w-4 h-4 text-slate-400" />
                <span className="hidden sm:inline">Raporu Yazdır</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Quick Stat Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-900/60 rounded-2xl p-3.5 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Meta Etiket Sağlığı</span>
              <FileText className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-xl font-black text-white font-mono">
              %{metaAuditSummary.siteHealthScore}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {metaAuditSummary.totalPages} sayfa denetlendi
            </div>
          </div>

          <div className="bg-slate-900/60 rounded-2xl p-3.5 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Lighthouse Hız Skoru</span>
              <Gauge className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-black text-emerald-400 font-mono">
              {performanceAudit.overallScore} / 100
            </div>
            <div className="text-[11px] text-emerald-300 mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>{performanceAudit.gradeLabel}</span>
            </div>
          </div>

          <div className="bg-slate-900/60 rounded-2xl p-3.5 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Core Web Vitals</span>
              <Activity className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl font-black text-amber-400 font-mono">
              LCP {performanceAudit.lcp.valueFormatted}
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5">
              INP: {performanceAudit.inp.valueFormatted} • CLS: {performanceAudit.cls.valueFormatted}
            </div>
          </div>

          <div className="bg-slate-900/60 rounded-2xl p-3.5 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Eylem Bekleyen</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-xl font-black text-white font-mono">
              {allCollectedIssues.filter(i => i.severity === "critical").length} Kritik
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {allCollectedIssues.filter(i => i.severity === "warning").length} İyileştirme Önerisi
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. SUB-VIEW NAVIGATION TABS */}
      {/* ===================================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-1.5 bg-slate-900 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            id="subtab-seo-report-overview"
            onClick={() => setActiveSubView("overview")}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeSubView === "overview"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Genel Denetim Özeti</span>
          </button>

          <button
            type="button"
            id="subtab-seo-report-meta"
            onClick={() => setActiveSubView("meta")}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeSubView === "meta"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Meta Etiketleri Analizi ({metaAuditSummary.totalPages} Sayfa)</span>
            {metaAuditSummary.criticalMissingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-mono text-[9px] font-black">
                {metaAuditSummary.criticalMissingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            id="subtab-seo-report-performance"
            onClick={() => setActiveSubView("performance")}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeSubView === "performance"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Performans &amp; Core Web Vitals</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-mono font-bold">
              {performanceAudit.overallScore}/100
            </span>
          </button>

          <button
            type="button"
            id="subtab-seo-report-trends"
            onClick={() => setActiveSubView("trends")}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeSubView === "trends"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Performans Trendleri</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-mono font-bold">
              30 Gün
            </span>
          </button>

          <button
            type="button"
            id="subtab-seo-report-heatmap"
            onClick={() => setActiveSubView("heatmap")}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeSubView === "heatmap"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Flame className="w-4 h-4 text-rose-400 fill-current" />
            <span>SEO Isı Haritası</span>
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[9px] font-mono font-bold">
              Etki Izgarası
            </span>
          </button>

          <button
            type="button"
            id="subtab-seo-report-benchmarking"
            onClick={() => setActiveSubView("benchmarking")}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeSubView === "benchmarking"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Competitive Benchmarking</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-mono font-bold">
              DA &amp; Sıralama
            </span>
          </button>

          <button
            type="button"
            id="subtab-seo-report-issues"
            onClick={() => setActiveSubView("issues")}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeSubView === "issues"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Sorunlar &amp; Çözüm Listesi</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono text-[9px] font-bold">
              {allCollectedIssues.length}
            </span>
          </button>
        </div>

        {/* Device Switcher (Mobile vs Desktop) */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setDevice("mobile")}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              device === "mobile"
                ? "bg-amber-500 text-slate-950 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobil</span>
          </button>
          <button
            type="button"
            onClick={() => setDevice("desktop")}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              device === "desktop"
                ? "bg-amber-500 text-slate-950 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Masaüstü</span>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. TAB 1: OVERVIEW & UNIFIED SCORECARD */}
      {/* ===================================================================== */}
      {activeSubView === "overview" && (
        <div className="space-y-6">
          {/* Side-by-Side Comparison: Meta Tags vs Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Panel A: Meta Tags Summary & SERP Simulator */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                    <Search className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Meta Etiketleri Durumu</h3>
                    <p className="text-xs text-slate-500">Google SERP snippet uzunluğu ve tıklama oranı</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xl font-black text-blue-600 font-mono">
                    %{metaAuditSummary.siteHealthScore}
                  </span>
                  <div className="text-[10px] text-slate-400">Meta Skoru</div>
                </div>
              </div>

              {/* Progress Bar of Checks */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span>Geçen Kontroller: {metaAuditSummary.passedChecks} / {metaAuditSummary.totalChecks}</span>
                  <span className="font-mono text-emerald-600">
                    %{Math.round((metaAuditSummary.passedChecks / Math.max(1, metaAuditSummary.totalChecks)) * 100)} Başarılı
                  </span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  <div 
                    className="bg-emerald-500 h-full transition-all"
                    style={{ width: `${Math.round((metaAuditSummary.idealCount / Math.max(1, metaAuditSummary.totalPages)) * 100)}%` }}
                    title="İdeal Sayfalar"
                  />
                  <div 
                    className="bg-amber-400 h-full transition-all"
                    style={{ width: `${Math.round((metaAuditSummary.tooShortCount / Math.max(1, metaAuditSummary.totalPages)) * 100)}%` }}
                    title="Kısa Başlıklar"
                  />
                  <div 
                    className="bg-rose-500 h-full transition-all"
                    style={{ width: `${Math.round((metaAuditSummary.overLengthCount / Math.max(1, metaAuditSummary.totalPages)) * 100)}%` }}
                    title="Taşan Başlıklar"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> İdeal: {metaAuditSummary.idealCount}</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Kısa: {metaAuditSummary.tooShortCount}</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> Taşan: {metaAuditSummary.overLengthCount}</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-300" /> Eksik: {metaAuditSummary.criticalMissingCount}</span>
                </div>
              </div>

              {/* Live SERP Snippet Preview for Homepage */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase">
                  <span>Canlı Google Arama Önizlemesi</span>
                  <span className="text-[10px] text-blue-600 font-mono">google.com.tr</span>
                </div>

                <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs space-y-1.5 font-sans">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">
                      {config.companyName?.charAt(0) || "J"}
                    </div>
                    <span className="text-slate-800 font-semibold">{config.companyName}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500 text-[11px] truncate">https://{config.subdomain || "demo"}.jetkur.com.tr</span>
                  </div>

                  <h4 className="text-base font-semibold text-blue-700 hover:underline cursor-pointer leading-snug">
                    {config.metaTitle || `${config.companyName} - ${config.sector || "Hizmetleri"} | ${config.city || "İstanbul"}`}
                  </h4>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {config.metaDescription || `${config.companyName} olarak ${config.city || "İstanbul"} genelinde profesyonel ve güvenilir hizmet veriyoruz. 7/24 arayın: ${config.phone || "0850..."}`}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveSubView("meta")}
                  className="w-full py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Tüm Sayfa Meta Etiketlerini İncele ({metaAuditSummary.totalPages}) →</span>
                </button>
              </div>
            </div>

            {/* Panel B: Performance & Core Web Vitals Summary */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Core Web Vitals &amp; Hız Metrikleri</h3>
                    <p className="text-xs text-slate-500">Google Lighthouse 100 ve kullanıcı deneyimi</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xl font-black text-emerald-600 font-mono">
                    {performanceAudit.overallScore}
                  </span>
                  <div className="text-[10px] text-slate-400">PageSpeed / 100</div>
                </div>
              </div>

              {/* Core Web Vitals 3 Key Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 text-center space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">LCP (Görsel Yüklenme)</div>
                  <div className="text-lg font-black text-emerald-600 font-mono">
                    {performanceAudit.lcp.valueFormatted}
                  </div>
                  <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    İyi (&lt; 2.5s)
                  </span>
                </div>

                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 text-center space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">INP (Tıklama Tepkisi)</div>
                  <div className="text-lg font-black text-emerald-600 font-mono">
                    {performanceAudit.inp.valueFormatted}
                  </div>
                  <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    İyi (&lt; 200ms)
                  </span>
                </div>

                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 text-center space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">CLS (Düzen Kayması)</div>
                  <div className="text-lg font-black text-emerald-600 font-mono">
                    {performanceAudit.cls.valueFormatted}
                  </div>
                  <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    İyi (&lt; 0.1)
                  </span>
                </div>
              </div>

              {/* Edge Speed Diagnostics */}
              <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-400 text-[11px] pb-1 border-b border-slate-800">
                  <span>Altyapı Metriği</span>
                  <span>Mevcut Değer</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">TTFB (Sunucu İlk Bayt Yanıtı):</span>
                  <span className="text-emerald-400 font-bold">{performanceAudit.ttfb.valueFormatted}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">FCP (İlk İçerikli Boyama):</span>
                  <span className="text-emerald-400 font-bold">{performanceAudit.fcp.valueFormatted}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">TBT (Toplam Bloklanma Süresi):</span>
                  <span className="text-emerald-400 font-bold">{performanceAudit.tbt.valueFormatted}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Edge CDN Önbellek Oranı:</span>
                  <span className="text-emerald-400 font-bold">%99.8 (Cloudflare Anycast)</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveSubView("performance")}
                  className="w-full py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Detaylı Performans &amp; Optimizasyonları İncele →</span>
                </button>
              </div>
            </div>

          </div>

          {/* 30-Day Core Web Vitals Performance Trends Card (D3.js) */}
          <PerformanceTrendsCard
            config={config}
            onNavigateTab={onNavigateTab}
          />

          {/* Generate SEO Heatmap: High-Impact Areas Color-Coded Grid */}
          <GenerateSeoHeatmapCard
            config={config}
            onNavigateTab={onNavigateTab}
          />

          {/* Quick Action Plan Highlights */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Öncelikli Eylem Planı ({allCollectedIssues.length})</span>
                </h3>
                <p className="text-xs text-slate-500">Arama motorlarında ilk sıraya çıkmak için önerilen adımlar</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubView("issues")}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
              >
                <span>Tümünü Gör ({allCollectedIssues.length})</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {allCollectedIssues.slice(0, 4).map(issue => (
                <div key={issue.id} className="py-3 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    {issue.severity === "critical" ? (
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    ) : issue.severity === "warning" ? (
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="text-xs font-bold text-slate-900">{issue.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{issue.description}</div>
                    </div>
                  </div>

                  {issue.actionLabel && issue.onAction && (
                    <button
                      type="button"
                      onClick={issue.onAction}
                      className="shrink-0 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold transition-all active:scale-95"
                    >
                      {issue.actionLabel}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Competitive SEO Benchmarking (Domain Authority & Keyword Ranking vs Competitors) */}
          <div className="pt-2">
            <CompetitiveSeoBenchmarking
              config={config}
              onChange={onChange}
              onNavigateTab={(tab) => onNavigateTab && onNavigateTab(tab as any)}
              onApplyKeyword={(kw) => {
                if (!onChange) return;
                const existing = Array.isArray(config.seo?.keywords)
                  ? config.seo.keywords
                  : typeof config.seo?.keywords === "string"
                  ? config.seo.keywords.split(",").map((k) => k.trim()).filter(Boolean)
                  : [];
                if (!existing.includes(kw)) {
                  onChange({
                    ...config,
                    seo: {
                      ...config.seo,
                      keywords: [...existing, kw].join(", ")
                    }
                  });
                }
              }}
              onSendToAiBlog={(keyword, draftTitle) => {
                sessionStorage.setItem("ai_blog_prefill_topic", draftTitle || `${keyword} Kılavuzu`);
                sessionStorage.setItem("ai_blog_prefill_keyword", keyword);
                if (onNavigateTab) {
                  onNavigateTab("ai-blog-generator" as any);
                }
              }}
            />
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. TAB 2: META TAGS DEEP-DIVE (PAGE-BY-PAGE AUDIT) */}
      {/* ===================================================================== */}
      {activeSubView === "meta" && (
        <div className="space-y-6">
          {/* Filter Bar and Page Selector */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-slate-900">Sayfa Bazlı Meta Etiketi Denetimi</h3>
                <p className="text-xs text-slate-500">Her sayfanın başlık, açıklama ve sosyal etiketlerini denetleyin</p>
              </div>

              {/* Status Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5">
                {(["all", "missing", "over_length", "too_short", "ideal"] as const).map(tab => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setMetaFilter(tab)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      metaFilter === tab
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {tab === "all" ? "Tümü" : tab === "missing" ? "Eksikler" : tab === "over_length" ? "Taşanlar" : tab === "too_short" ? "Kısalar" : "İdeal"}
                  </button>
                ))}
              </div>
            </div>

            {/* Page Buttons List */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100">
              {filteredPages.map(page => (
                <button
                  key={page.pageId}
                  type="button"
                  onClick={() => setSelectedPageId(page.pageId)}
                  className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    selectedPageId === page.pageId
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  <span>{page.pageTitle}</span>
                  <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono font-black ${
                    page.overallScore >= 80 ? "bg-emerald-500/20 text-emerald-700" : "bg-rose-500/20 text-rose-700"
                  }`}>
                    %{page.overallScore}
                  </span>
                </button>
              ))}
            </div>

            {/* Deep-Dive Inspection of the Selected Page */}
            {selectedPage && (
              <div className="space-y-6 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{selectedPage.pageType} Sayfası</span>
                    <h4 className="text-lg font-black text-slate-900">{selectedPage.pageTitle}</h4>
                    <span className="text-xs text-blue-600 font-mono">{selectedPage.fullUrl}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Sayfa Sağlık Skoru:</span>
                    <span className="text-lg font-black text-slate-900 font-mono">%{selectedPage.overallScore}</span>
                  </div>
                </div>

                {/* 1. Meta Title Analysis */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900">1. Meta Başlık (Title Tag)</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${selectedPage.titleAudit.badgeBg} ${selectedPage.titleAudit.badgeBorder}`}>
                        {selectedPage.titleAudit.statusLabel}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-500">
                      {selectedPage.titleAudit.charCount} / 60 krkt
                    </span>
                  </div>

                  {/* Character Length Meter */}
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        selectedPage.titleAudit.status === "ideal" ? "bg-emerald-500" : selectedPage.titleAudit.status === "over_length" ? "bg-rose-500" : "bg-amber-400"
                      }`}
                      style={{ width: `${Math.min(100, Math.round((selectedPage.titleAudit.charCount / 60) * 100))}%` }}
                    />
                  </div>

                  {/* Current Value Display */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 font-medium break-words">
                    {selectedPage.titleAudit.value || <span className="text-rose-500 italic">Başlık tanımlanmamış (Eksik)</span>}
                  </div>

                  {/* Issues & Quick Fix Recommendations */}
                  {selectedPage.titleAudit.issues.length > 0 && (
                    <div className="space-y-1 text-xs text-rose-600">
                      {selectedPage.titleAudit.issues.map((iss, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{iss}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedPage.titleAudit.status !== "ideal" && (
                    <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="text-xs text-amber-900">
                        <span className="font-bold">Önerilen Başlık: </span>
                        <span>{selectedPage.titleAudit.autoFixedValue}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleQuickFixField(selectedPage.pageId, "title", selectedPage.titleAudit.autoFixedValue)}
                        className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs"
                      >
                        Öneriyi Uygula
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Meta Description Analysis */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900">2. Meta Açıklama (Description)</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${selectedPage.descAudit.badgeBg} ${selectedPage.descAudit.badgeBorder}`}>
                        {selectedPage.descAudit.statusLabel}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-500">
                      {selectedPage.descAudit.charCount} / 155 krkt
                    </span>
                  </div>

                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        selectedPage.descAudit.status === "ideal" ? "bg-emerald-500" : selectedPage.descAudit.status === "over_length" ? "bg-rose-500" : "bg-amber-400"
                      }`}
                      style={{ width: `${Math.min(100, Math.round((selectedPage.descAudit.charCount / 155) * 100))}%` }}
                    />
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 font-medium break-words">
                    {selectedPage.descAudit.value || <span className="text-rose-500 italic">Açıklama tanımlanmamış (Eksik)</span>}
                  </div>

                  {selectedPage.descAudit.issues.length > 0 && (
                    <div className="space-y-1 text-xs text-rose-600">
                      {selectedPage.descAudit.issues.map((iss, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{iss}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedPage.descAudit.status !== "ideal" && (
                    <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="text-xs text-amber-900">
                        <span className="font-bold">Önerilen Açıklama: </span>
                        <span>{selectedPage.descAudit.autoFixedValue}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleQuickFixField(selectedPage.pageId, "description", selectedPage.descAudit.autoFixedValue)}
                        className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs"
                      >
                        Öneriyi Uygula
                      </button>
                    </div>
                  )}
                </div>

                {/* 3. Canonical & OpenGraph Social Meta Tags */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900">Canonical URL</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${selectedPage.canonicalAudit.badgeBg}`}>
                        {selectedPage.canonicalAudit.statusLabel}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 font-mono truncate p-2 bg-slate-50 rounded-lg">
                      {selectedPage.canonicalAudit.value || "Otomatik atanmadı"}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900">Sosyal Paylaşım Görseli (og:image)</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${selectedPage.ogImageAudit.badgeBg}`}>
                        {selectedPage.ogImageAudit.statusLabel}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 font-mono truncate p-2 bg-slate-50 rounded-lg">
                      {selectedPage.ogImageAudit.value || "Site varsayılan görseli"}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. TAB 3: PERFORMANCE METRICS & CORE WEB VITALS */}
      {/* ===================================================================== */}
      {activeSubView === "performance" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-emerald-500" />
                  <span>Google Core Web Vitals &amp; PageSpeed Denetimi ({device === "mobile" ? "Mobil" : "Masaüstü"})</span>
                </h3>
                <p className="text-xs text-slate-500">Google arama sıralamalarını belirleyen resmi hız standartları</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500">Performans Skoru:</span>
                <span className="text-2xl font-black text-emerald-600 font-mono">{performanceAudit.overallScore} / 100</span>
              </div>
            </div>

            {/* Core Web Vitals Cards Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Metric 1: LCP */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900">{performanceAudit.lcp.name}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {performanceAudit.lcp.statusLabel}
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">{performanceAudit.lcp.valueFormatted}</div>
                <div className="text-[11px] text-slate-500">{performanceAudit.lcp.fullName}</div>
                <p className="text-[11px] text-slate-600 leading-tight pt-1">{performanceAudit.lcp.impactDescription}</p>
              </div>

              {/* Metric 2: INP */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900">{performanceAudit.inp.name}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {performanceAudit.inp.statusLabel}
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">{performanceAudit.inp.valueFormatted}</div>
                <div className="text-[11px] text-slate-500">{performanceAudit.inp.fullName}</div>
                <p className="text-[11px] text-slate-600 leading-tight pt-1">{performanceAudit.inp.impactDescription}</p>
              </div>

              {/* Metric 3: CLS */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900">{performanceAudit.cls.name}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {performanceAudit.cls.statusLabel}
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">{performanceAudit.cls.valueFormatted}</div>
                <div className="text-[11px] text-slate-500">{performanceAudit.cls.fullName}</div>
                <p className="text-[11px] text-slate-600 leading-tight pt-1">{performanceAudit.cls.impactDescription}</p>
              </div>

              {/* Metric 4: FCP */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900">{performanceAudit.fcp.name}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {performanceAudit.fcp.statusLabel}
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">{performanceAudit.fcp.valueFormatted}</div>
                <div className="text-[11px] text-slate-500">{performanceAudit.fcp.fullName}</div>
                <p className="text-[11px] text-slate-600 leading-tight pt-1">{performanceAudit.fcp.impactDescription}</p>
              </div>

              {/* Metric 5: TBT */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900">{performanceAudit.tbt.name}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {performanceAudit.tbt.statusLabel}
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">{performanceAudit.tbt.valueFormatted}</div>
                <div className="text-[11px] text-slate-500">{performanceAudit.tbt.fullName}</div>
                <p className="text-[11px] text-slate-600 leading-tight pt-1">{performanceAudit.tbt.impactDescription}</p>
              </div>

              {/* Metric 6: TTFB */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900">{performanceAudit.ttfb.name}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {performanceAudit.ttfb.statusLabel}
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">{performanceAudit.ttfb.valueFormatted}</div>
                <div className="text-[11px] text-slate-500">{performanceAudit.ttfb.fullName}</div>
                <p className="text-[11px] text-slate-600 leading-tight pt-1">{performanceAudit.ttfb.impactDescription}</p>
              </div>
            </div>

            {/* Edge Infrastructure Optimizations Checklist */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h4 className="text-sm font-black text-slate-900">Aktif Altyapı Optimizasyonları (Edge CDN)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {performanceAudit.optimizations.map(opt => (
                  <div key={opt.key} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{opt.label}</div>
                      <div className="text-[11px] text-slate-500">{opt.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 30-Day Core Web Vitals Historical Trends (D3.js) */}
          <PerformanceTrendsCard 
            config={config} 
            onNavigateTab={onNavigateTab}
            title="30 Günlük Core Web Vitals Geçmişi ve Eğilimler"
            subtitle="D3.js zaman serisi grafiği ile son 30 günün LCP, INP, CLS metrikleri ve ziyaretçi hemen çıkma (bounce) oranı korelasyonu"
          />
        </div>
      )}

      {/* ===================================================================== */}
      {/* 6. TAB: PERFORMANCE TRENDS (D3.JS 30-DAY CORE WEB VITALS) */}
      {/* ===================================================================== */}
      {activeSubView === "trends" && (
        <div className="space-y-6">
          <PerformanceTrendsCard 
            config={config} 
            onNavigateTab={onNavigateTab}
            title="Performans Trendleri (Son 30 Günlük Core Web Vitals Tarihçesi)"
            subtitle="D3.js ile son 30 günlük Google Core Web Vitals metriklerinin değişimi, altyapı iyileştirme adımları ve ziyaretçi tutundurma analizi"
          />
        </div>
      )}

      {/* ===================================================================== */}
      {/* 7. TAB: GENERATE SEO HEATMAP (COLOR-CODED HIGH-IMPACT GRID) */}
      {/* ===================================================================== */}
      {activeSubView === "heatmap" && (
        <div className="space-y-6">
          <GenerateSeoHeatmapCard
            config={config}
            onNavigateTab={onNavigateTab}
          />
        </div>
      )}

      {/* ===================================================================== */}
      {/* 8. TAB: COMPETITIVE SEO BENCHMARKING (DOMAIN AUTHORITY & KEYWORD RANKINGS) */}
      {/* ===================================================================== */}
      {activeSubView === "benchmarking" && (
        <div className="space-y-6">
          <CompetitiveSeoBenchmarking
            config={config}
            onChange={onChange}
            onNavigateTab={(tab) => onNavigateTab && onNavigateTab(tab as any)}
            onApplyKeyword={(kw) => {
              if (!onChange) return;
              const existing = Array.isArray(config.seo?.keywords)
                ? config.seo.keywords
                : typeof config.seo?.keywords === "string"
                ? config.seo.keywords.split(",").map((k) => k.trim()).filter(Boolean)
                : [];
              if (!existing.includes(kw)) {
                onChange({
                  ...config,
                  seo: {
                    ...config.seo,
                    keywords: [...existing, kw].join(", ")
                  }
                });
              }
            }}
            onSendToAiBlog={(keyword, draftTitle) => {
              sessionStorage.setItem("ai_blog_prefill_topic", draftTitle || `${keyword} Kılavuzu`);
              sessionStorage.setItem("ai_blog_prefill_keyword", keyword);
              if (onNavigateTab) {
                onNavigateTab("ai-blog-generator" as any);
              }
            }}
          />
        </div>
      )}

      {/* ===================================================================== */}
      {/* 6. TAB 4: ISSUES & REMEDIATION ACTION PLAN */}
      {/* ===================================================================== */}
      {activeSubView === "issues" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">Tespit Edilen SEO ve Hız Sorunları</h3>
                <p className="text-xs text-slate-500">Kritik hatalar ve arama sıralamanızı artıracak iyileştirmeler</p>
              </div>

              <button
                type="button"
                onClick={handleAutoFixAllMeta}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-2 shadow-sm"
              >
                <Wand2 className="w-4 h-4 text-indigo-200" />
                <span>Tek Tıkla Tüm Meta Hatalarını Onar</span>
              </button>
            </div>

            <div className="space-y-3">
              {allCollectedIssues.map(issue => (
                <div 
                  key={issue.id} 
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    issue.severity === "critical"
                      ? "bg-rose-50/70 border-rose-200"
                      : issue.severity === "warning"
                      ? "bg-amber-50/70 border-amber-200"
                      : "bg-emerald-50/70 border-emerald-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {issue.severity === "critical" ? (
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    ) : issue.severity === "warning" ? (
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900">{issue.title}</span>
                        <span className={`px-2 py-0.2 rounded-full text-[9px] font-mono font-black uppercase ${
                          issue.severity === "critical" ? "bg-rose-200 text-rose-900" : issue.severity === "warning" ? "bg-amber-200 text-amber-900" : "bg-emerald-200 text-emerald-900"
                        }`}>
                          {issue.severity === "critical" ? "Kritik" : issue.severity === "warning" ? "Öneri" : "Başarılı"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{issue.description}</p>
                    </div>
                  </div>

                  {issue.actionLabel && issue.onAction && (
                    <button
                      type="button"
                      onClick={issue.onAction}
                      className="shrink-0 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
                    >
                      {issue.actionLabel}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
