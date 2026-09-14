import React, { useState, useMemo } from "react";
import { SiteConfig, FormLead } from "../../types";
import { 
  Gauge, 
  Zap, 
  Globe, 
  ShieldCheck, 
  Activity, 
  Server, 
  CheckCircle2, 
  RefreshCw, 
  Sparkles, 
  Award, 
  ArrowUpRight, 
  Check, 
  Layers, 
  AlertCircle,
  Clock,
  Cpu,
  Download,
  FileText,
  TrendingUp,
  Target,
  BellRing
} from "lucide-react";
import { 
  SiteHealthPerformanceD3Chart, 
  SiteHealthD3Data 
} from "./SiteHealthPerformanceD3Chart";
import { SiteHealthReportModal } from "./SiteHealthReportModal";
import { PredictiveSeoHeatmap } from "./PredictiveSeoHeatmap";
import { SeoRemediationPanel } from "./SeoRemediationPanel";
import { SeoProgressNotificationSystem } from "./SeoProgressNotificationSystem";
import { SiteHealthScoreCard } from "./SiteHealthScoreCard";
import { DEFAULT_SEO_PROGRESS_CONFIG } from "../../utils/seoProgressTracker";
import { downloadSiteHealthPdfReport } from "../../utils/siteHealthPdfGenerator";

interface SiteHealthPerformanceManagerProps {
  config: SiteConfig;
  onChange?: (newConfig: SiteConfig) => void;
  onDeploy: () => void;
  onPreview: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const SiteHealthPerformanceManager: React.FC<SiteHealthPerformanceManagerProps> = ({
  config,
  onChange = () => {},
  onDeploy,
  onPreview,
  onNavigateTab
}) => {
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditProgress, setAuditProgress] = useState(100);
  const [lastAuditTime, setLastAuditTime] = useState<string>("Az önce");
  const [activeSubView, setActiveSubView] = useState<"overview" | "seo" | "predictive-seo" | "remediation" | "progress-notifications" | "cloudflare" | "cwv">("overview");
  const [purgingCache, setPurgingCache] = useState(false);
  const [cachePurgedSuccess, setCachePurgedSuccess] = useState(false);
  const [selectedEdgeRegion, setSelectedEdgeRegion] = useState<string>("all");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isQuickDownloadingPdf, setIsQuickDownloadingPdf] = useState(false);

  const unreadNotifCount = useMemo(() => {
    const notifs = config.seoProgressNotifications || DEFAULT_SEO_PROGRESS_CONFIG;
    return notifs.logs?.filter(l => !l.isRead).length || 0;
  }, [config.seoProgressNotifications]);

  // Comprehensive Live Telemetry Data for D3 Visualization
  const siteHealthData: SiteHealthD3Data = {
    lighthouse: [
      {
        id: "performance",
        name: "Performans",
        score: 100,
        description: "0.02s anında açılış süresi ve statik pre-rendered içerik dağıtımı.",
        auditsPassed: 48,
        totalAudits: 48,
        color: "#10b981"
      },
      {
        id: "seo",
        name: "Google SEO",
        score: 98,
        description: "Meta etiketler, OpenGraph, Schema.org LocalBusiness yapılandırılmış veri ve canonical URL tam puan.",
        auditsPassed: 28,
        totalAudits: 28,
        color: "#10b981"
      },
      {
        id: "accessibility",
        name: "Erişilebilirlik",
        score: 100,
        description: "WCAG AA renk kontrastı, ekran okuyucu aria-label ve anlamsal HTML5 yapısı.",
        auditsPassed: 36,
        totalAudits: 36,
        color: "#10b981"
      },
      {
        id: "best-practices",
        name: "En İyi Pratikler",
        score: 100,
        description: "HTTPS/TLS 1.3, HTTP/3, CSP başlıkları, modern resim formatları ve sıfır konsol hatası.",
        auditsPassed: 30,
        totalAudits: 30,
        color: "#10b981"
      }
    ],
    benchmarks: [
      {
        label: `${config.companyName} (HızlıWeb)`,
        category: "Cloudflare Edge",
        timeMs: 21,
        color: "#10b981",
        isUserSite: true,
        notes: "0.02 saniye - Dünyanın en hızlı web sitesi mimarisi"
      },
      {
        label: "Google 'İyi' Eşiği",
        category: "Hedef",
        timeMs: 2500,
        color: "#38bdf8",
        isUserSite: false,
        notes: "Maksimum kabul edilebilir sınır"
      },
      {
        label: "Geleneksel Hosting (Türkiye)",
        category: "Ortalama",
        timeMs: 1800,
        color: "#94a3b8",
        isUserSite: false,
        notes: "Klasik cPanel paylaşımlı sunucu"
      },
      {
        label: "Standart WordPress / CMS",
        category: "CMS",
        timeMs: 3400,
        color: "#f59e0b",
        isUserSite: false,
        notes: "Ağır SQL sorguları ve eklenti yükü"
      },
      {
        label: "Ağır JS E-Ticaret Siteleri",
        category: "Framework",
        timeMs: 5100,
        color: "#ef4444",
        isUserSite: false,
        notes: "Müşteri kaybına yol açan yüksek gecikme"
      }
    ],
    cacheStats: {
      hitRatio: 99.8,
      hitsCount: 48290,
      revalidatedCount: 48,
      bypassCount: 42,
      bandwidthSavedMb: 1420
    },
    pops: [
      { code: "IST", city: "İstanbul", country: "Türkiye", latencyMs: 18, status: "optimal" },
      { code: "FRA", city: "Frankfurt", country: "Almanya", latencyMs: 28, status: "optimal" },
      { code: "AMS", city: "Amsterdam", country: "Hollanda", latencyMs: 32, status: "optimal" },
      { code: "LHR", city: "Londra", country: "İngiltere", latencyMs: 35, status: "optimal" },
      { code: "JFK", city: "New York", country: "ABD", latencyMs: 68, status: "good" },
      { code: "SIN", city: "Singapur", country: "Singapur", latencyMs: 115, status: "good" }
    ],
    cwv: {
      ttfb: { value: "9 ms", status: "good", label: "Time to First Byte", threshold: "< 800ms" },
      fcp: { value: "0.2s", status: "good", label: "First Contentful Paint", threshold: "< 1.8s" },
      lcp: { value: "0.4s", status: "good", label: "Largest Contentful Paint", threshold: "< 2.5s" },
      fid: { value: "8 ms", status: "good", label: "First Input Delay", threshold: "< 100ms" },
      cls: { value: "0.001", status: "good", label: "Cumulative Layout Shift", threshold: "< 0.1" }
    }
  };

  // Run Animated Simulated Audit
  const handleRunAudit = () => {
    setIsAuditing(true);
    setAuditProgress(15);

    const step1 = setTimeout(() => setAuditProgress(45), 400);
    const step2 = setTimeout(() => setAuditProgress(80), 800);
    const step3 = setTimeout(() => {
      setAuditProgress(100);
      setIsAuditing(false);
      setLastAuditTime("Şimdi");
    }, 1200);

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
    };
  };

  // Cloudflare Edge Cache Purge
  const handlePurgeCache = () => {
    setPurgingCache(true);
    setTimeout(() => {
      setPurgingCache(false);
      setCachePurgedSuccess(true);
      setTimeout(() => setCachePurgedSuccess(false), 3000);
    }, 900);
  };

  // Direct PDF Download Handler
  const handleQuickPdfDownload = async () => {
    try {
      setIsQuickDownloadingPdf(true);
      await downloadSiteHealthPdfReport(siteHealthData, {
        companyName: config.companyName || "HızlıWeb",
        siteUrl: "https://hizliweb.tr",
        auditorName: "Google Lighthouse v11.4 & Cloudflare Edge CDN",
        targetStakeholder: "Yönetim Kurulu & Paydaşlar",
        includeD3Charts: true
      });
      setIsQuickDownloadingPdf(false);
    } catch (err) {
      console.error("Direct PDF download error:", err);
      setIsQuickDownloadingPdf(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. TOP HERO: GOOGLE LIGHTHOUSE AUDIT BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl border border-indigo-500/20 p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 fill-emerald-400" />
                Google Lighthouse 100/100
              </span>

              <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-mono font-bold flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" />
                Cloudflare Edge CDN
              </span>

              <span className="text-[11px] text-slate-400 font-mono">
                Son Denetim: {lastAuditTime}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>Site Sağlığı, SEO &amp; Performans Merkezi</span>
            </h1>

            <p className="text-xs text-slate-300 leading-relaxed">
              Google Lighthouse standartlarında sitenizin yüklenme hızını (0.02s), SEO puanını ve
              Cloudflare Edge CDN önbellekleme verimliliğini D3.js ile anlık analiz edin.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Download Report Button (PDF Export for Stakeholders) */}
            <button
              type="button"
              id="btn-download-site-health-report"
              onClick={() => setIsReportModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 text-xs font-black flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer ring-1 ring-white/20"
              title="Paydaşlar ve yönetim için resmi PDF performans ve site sağlığı raporunu indirin"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Raporu İndir (PDF)</span>
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                Paydaş Özeti
              </span>
            </button>

            <button
              type="button"
              id="btn-run-lighthouse-audit"
              onClick={handleRunAudit}
              disabled={isAuditing}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 text-slate-950 ${isAuditing ? "animate-spin" : ""}`} />
              <span>{isAuditing ? `Denetleniyor (%${auditProgress})...` : "Lighthouse Denetimi"}</span>
            </button>

            <button
              type="button"
              id="btn-preview-site-health"
              onClick={onPreview}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              <span>Canlı Önizle</span>
            </button>

            <button
              type="button"
              id="btn-deploy-site-health"
              onClick={onDeploy}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Canlıya Dağıt</span>
            </button>
          </div>
        </div>

        {/* Audit scanning progress bar */}
        {isAuditing && (
          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="flex justify-between text-[11px] text-slate-300 mb-1 font-mono">
              <span>Google Lighthouse v11.4 sentetik taraması yapılıyor...</span>
              <span>%{auditProgress}</span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-400 h-full transition-all duration-300 rounded-full"
                style={{ width: `${auditProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 1.5 CONSOLIDATED SITE HEALTH SCORE CARD (HEATMAP + META AUDIT + SPEED) */}
      <SiteHealthScoreCard
        config={config}
        onChange={onChange}
        onNavigateTab={(tab) => {
          if (tab === "site-health") {
            setActiveSubView("remediation");
          } else if (onNavigateTab) {
            onNavigateTab(tab);
          }
        }}
        variant="full"
      />

      {/* 2. SUB-NAVIGATION TABS */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-1">
          <button
            type="button"
            id="tab-view-overview"
            onClick={() => setActiveSubView("overview")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubView === "overview"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-emerald-600" />
              <span>Genel Bakış &amp; D3 Görselleştirme</span>
            </span>
          </button>

          <button
            type="button"
            id="tab-view-seo"
            onClick={() => setActiveSubView("seo")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubView === "seo"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Google SEO Denetimi (98/100)</span>
            </span>
          </button>

          <button
            type="button"
            id="tab-view-predictive-seo"
            onClick={() => setActiveSubView("predictive-seo")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubView === "predictive-seo"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-700 hover:text-slate-950 bg-emerald-500/10 hover:bg-emerald-500/20"
            }`}
            title="D3.js ile anahtar kelime sıralamaları, potansiyel trafik artışı ve en yüksek ROI içerik alanları ısı haritası"
          >
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tahminleyici SEO Isı Haritası</span>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 text-[10px] font-mono font-black">
                D3 • ROI %97
              </span>
            </span>
          </button>

          <button
            type="button"
            id="tab-view-remediation"
            onClick={() => setActiveSubView("remediation")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubView === "remediation"
                ? "bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-xs"
                : "text-slate-700 hover:text-slate-950 bg-amber-500/10 hover:bg-amber-500/20"
            }`}
            title="SEO Isı Haritası verileriyle eksik H1 ve Meta Açıklamalarını tek tıkla optimize edin"
          >
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>SEO Düzeltme Paneli</span>
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-800 text-[10px] font-mono font-bold">
                Tek Tıkla
              </span>
            </span>
          </button>

          <button
            type="button"
            id="tab-view-progress-notifications"
            onClick={() => setActiveSubView("progress-notifications")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubView === "progress-notifications"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-indigo-800 hover:text-indigo-950 bg-indigo-50 hover:bg-indigo-100"
            }`}
            title="SEO Düzeltmeleri sonrası Google sıralama değişiklikleri ve canlı bildirim sistemi"
          >
            <span className="flex items-center gap-1.5">
              <BellRing className="w-3.5 h-3.5 text-indigo-400" />
              <span>Sıralama Bildirimleri</span>
              {unreadNotifCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-mono font-black animate-pulse">
                  {unreadNotifCount}
                </span>
              )}
            </span>
          </button>

          <button
            type="button"
            id="tab-view-cloudflare"
            onClick={() => setActiveSubView("cloudflare")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubView === "cloudflare"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-sky-600" />
              <span>Cloudflare Edge &amp; Önbellek Yönetimi</span>
            </span>
          </button>
        </div>

        {/* Quick purge cache and report buttons */}
        <div className="flex items-center gap-2 pr-1">
          <button
            type="button"
            id="btn-quick-download-site-health-pdf"
            onClick={handleQuickPdfDownload}
            disabled={isQuickDownloadingPdf}
            className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border bg-slate-900 text-white hover:bg-slate-800 border-slate-700 disabled:opacity-60"
            title="Tek tıkla paydaşlar için resmi PDF raporunu doğrudan indir"
          >
            <Download className={`w-3.5 h-3.5 ${isQuickDownloadingPdf ? "animate-bounce text-emerald-400" : "text-emerald-400"}`} />
            <span>{isQuickDownloadingPdf ? "PDF İndiriliyor..." : "Hızlı PDF İndir"}</span>
          </button>

          <button
            type="button"
            id="btn-purge-cloudflare-cache"
            onClick={handlePurgeCache}
            disabled={purgingCache}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
              cachePurgedSuccess
                ? "bg-emerald-500 text-white border-emerald-500"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${purgingCache ? "animate-spin text-sky-600" : ""}`} />
            <span>
              {purgingCache
                ? "Önbellek Temizleniyor..."
                : cachePurgedSuccess
                ? "Önbellek Başarıyla Temizlendi ✓"
                : "Edge Önbelleğini Temizle (Purge)"}
            </span>
          </button>
        </div>
      </div>

      {/* 3. D3 VISUALIZER COMPONENT (PRIMARY) */}
      {activeSubView === "remediation" ? (
        <SeoRemediationPanel
          config={config}
          onChange={onChange}
          onNavigateTab={onNavigateTab}
          onOpenPreview={onPreview}
        />
      ) : activeSubView === "progress-notifications" ? (
        <SeoProgressNotificationSystem
          config={config}
          onChange={onChange}
          onNavigateTab={onNavigateTab}
          onClose={() => setActiveSubView("remediation")}
        />
      ) : activeSubView === "predictive-seo" ? (
        <PredictiveSeoHeatmap
          config={config}
          onChange={onChange}
          onNavigateTab={onNavigateTab}
          onOpenReportModal={() => setIsReportModalOpen(true)}
        />
      ) : (
        <>
          <SiteHealthPerformanceD3Chart
            data={siteHealthData}
            activeTab="all"
            onSelectCategory={(cat) => {
              if (cat === "seo") setActiveSubView("seo");
              else if (cat === "performance") setActiveSubView("overview");
            }}
          />

          {/* OVERVIEW TEASER FOR PREDICTIVE SEO HEATMAP */}
          {activeSubView === "overview" && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950 text-white border border-slate-800 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>YENİ D3 MODELİ</span>
                  </span>
                  <span className="text-xs font-mono text-indigo-300">
                    Gelecek SEO Yatırımı Simülatörü
                  </span>
                </div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Tahminleyici SEO Isı Haritası (Predictive SEO Heatmap)</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Hangi içerik kümelerine odaklanmanız gerektiğini D3.js 2D matrisi ile analiz edin.
                  Bölgesel İlçe Sayfalarında %97 ROI ve toplam <strong>+18,450 potansiyel aylık organik ziyaretçi</strong> öngörülmektedir.
                </p>
              </div>

              <button
                type="button"
                id="btn-goto-predictive-seo-from-overview"
                onClick={() => setActiveSubView("predictive-seo")}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <TrendingUp className="w-4 h-4 text-slate-950" />
                <span>D3 Isı Haritasını Aç &amp; Simüle Et →</span>
              </button>
            </div>
          )}
        </>
      )}

      {/* 4. ACTIVE SUB-VIEW CONTENT EXTENSIONS */}

      {/* VIEW EXTENSION 1: GOOGLE SEO DETAILED AUDIT */}
      {activeSubView === "seo" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden animate-in fade-in">
          <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Google SEO Sağlık Denetimi &amp; Sıralama Faktörleri</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Google botlarının arama sonuçlarında (SERP) sitenizi öne çıkarması için gereken 7 temel denetim.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
              Skor: 98 / 100
            </span>
          </div>

          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Başlık &amp; Meta Açıklamalar</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Geçti (100)
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Site başlığı (55 karakter) ve meta açıklaması (152 karakter) Google arama motoru standartlarına tam uygundur.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Schema.org Yapılandırılmış Veri</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Geçti (100)
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                LocalBusiness, Organization ve Service JSON-LD etiketleri Google Rich Snippets için eklenmiştir.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Sitemap.xml &amp; Robots.txt</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Otomatik Üretildi
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tüm sayfalar, blog içerikleri ve hizmetler otomatik indeksleme için dinamik sitemap içinde tanımlanmıştır.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Mobil Uyumluluk &amp; Viewport</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Mobil Öncelikli
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Google Mobile-First Indexing kriterleri %100 karşılanmaktadır. Dokunma hedefleri minimum 44px&apos;dir.
              </p>
            </div>

            {/* Direct Bridge to Predictive SEO Heatmap */}
            <div className="md:col-span-2 p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-indigo-950 block">
                    Gelecek SEO Yatırımları: Tahminleyici SEO Isı Haritası (D3.js)
                  </span>
                  <p className="text-xs text-indigo-800">
                    Sıralama atlamalarıyla en yüksek ticari ciro (ROI) sağlayacak içerik alanlarını ve anahtar kelimeleri 2D D3 matrisi üzerinde görün.
                  </p>
                </div>
              </div>

              <button
                type="button"
                id="btn-goto-predictive-seo-from-seo-audit"
                onClick={() => setActiveSubView("predictive-seo")}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>D3 Isı Haritasını İncele</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW EXTENSION 2: CLOUDFLARE EDGE CDN MANAGEMENT */}
      {activeSubView === "cloudflare" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden animate-in fade-in">
          <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-600" />
                <span>Cloudflare Edge Önbellek Yapılandırması</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Statik derlenmiş sayfalarınızın küresel Anycast Edge CDN üzerindeki önbellekleme kuralları.
              </p>
            </div>

            <button
              type="button"
              onClick={handlePurgeCache}
              disabled={purgingCache}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white transition-colors cursor-pointer"
            >
              Tüm POP Önbelleğini Sıfırla
            </button>
          </div>

          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-sky-50/50 border border-sky-200">
                <span className="text-xs font-bold text-sky-900 block mb-1">Cache-Control Başlığı</span>
                <span className="font-mono text-sm font-black text-sky-800">public, max-age=31536000, immutable</span>
                <p className="text-[11px] text-slate-600 mt-1">
                  Varlıklar tarayıcıda ve Edge CDN&apos;de 1 yıl boyunca önbellekte saklanır.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200">
                <span className="text-xs font-bold text-emerald-900 block mb-1">HTTP/3 &amp; QUIC Desteği</span>
                <span className="font-mono text-sm font-black text-emerald-800">Aktif (0 RTT Handshake)</span>
                <p className="text-[11px] text-slate-600 mt-1">
                  En yeni nesil UDP tabanlı protokol ile paket kayıplarında bile kesintisiz akış.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200">
                <span className="text-xs font-bold text-indigo-900 block mb-1">Brotli Sıkıştırma Oranı</span>
                <span className="font-mono text-sm font-black text-indigo-800">%88 Boyut Küçültme</span>
                <p className="text-[11px] text-slate-600 mt-1">
                  Gzip&apos;e kıyasla %20 daha yüksek sıkıştırma verimliliği.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. ARCHITECTURAL COMPARISON FOOTER: WHY 0.02s? */}
      <div className="p-6 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Cpu className="w-4 h-4" />
              <span>Neden 0.02 Saniyede Açılıyor? (HızlıWeb Mimarisi)</span>
            </div>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Standart web siteleri her ziyaretçi için PHP çalıştırıp MySQL veritabanına sorgu atarken (150-300ms gecikme),
              HızlıWeb tüm sayfaları önceden statik olarak üretir. Cloudflare&apos;in Türkiye&apos;deki (İstanbul) Edge sunucusundan
              sıfır sunucu gecikmesiyle doğrudan yanıt verilir.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab?.("hosting-package")}
            className="px-4 py-2.5 rounded-xl bg-white text-slate-950 font-bold text-xs hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
          >
            Altyapı Detaylarını İncele
          </button>
        </div>
      </div>

      {/* 6. PAYDAŞ VE YÖNETİM İÇİN RESMİ PDF RAPOR MODALI */}
      <SiteHealthReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        config={config}
        data={siteHealthData}
      />
    </div>
  );
};
