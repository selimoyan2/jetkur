import React, { useState, useMemo } from "react";
import { SiteConfig } from "../types";
import {
  runAutomatedSeoHealthAudit,
  SeoAuditCategory,
  SeoAuditSeverity,
  SeoAuditCheckItem
} from "../utils/seoHealthAuditEngine";
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Globe,
  Gauge,
  Zap,
  Share2,
  Smartphone,
  Laptop,
  Check,
  Wrench,
  Eye,
  Info,
  Flame
} from "lucide-react";

interface SeoHealthAuditDashboardProps {
  config: SiteConfig;
  onConfigChange: (updatedConfig: SiteConfig) => void;
  onOpenSettings?: () => void;
  onOpenHeatmap?: () => void;
}

export const SeoHealthAuditDashboard: React.FC<SeoHealthAuditDashboardProps> = ({
  config,
  onConfigChange,
  onOpenHeatmap
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<"all" | SeoAuditCategory>("all");
  const [selectedSeverity, setSelectedSeverity] = useState<"all" | SeoAuditSeverity>("all");
  const [previewMode, setPreviewMode] = useState<"none" | "google" | "social">("none");
  const [serpDevice, setSerpDevice] = useState<"desktop" | "mobile">("desktop");
  const [lastFixMessage, setLastFixMessage] = useState<string | null>(null);

  // Compute the audit report based on live config
  const report = useMemo(() => {
    return runAutomatedSeoHealthAudit(config);
  }, [config]);

  const handleReScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 450);
  };

  const handleApplySingleFix = (item: SeoAuditCheckItem) => {
    if (!item.applyFix) return;
    const updated = item.applyFix(config);
    onConfigChange(updated);
    setLastFixMessage(`"${item.title}" başarıyla onarıldı ve uygulandı.`);
    setTimeout(() => setLastFixMessage(null), 3500);
  };

  const handleFixAll = () => {
    let updatedConfig = { ...config };
    let fixedCount = 0;

    for (const item of report.items) {
      if (item.canAutoFix && item.applyFix && item.severity !== "passed") {
        updatedConfig = item.applyFix(updatedConfig);
        fixedCount++;
      }
    }

    if (fixedCount > 0) {
      onConfigChange(updatedConfig);
      setLastFixMessage(`${fixedCount} adet SEO ve erişilebilirlik uyarısı tek tıkla otomatik onarıldı!`);
      setTimeout(() => setLastFixMessage(null), 4000);
    }
  };

  // Filtered audit items
  const filteredItems = useMemo(() => {
    return report.items.filter((item) => {
      if (selectedCategory !== "all" && item.category !== selectedCategory) return false;
      if (selectedSeverity !== "all" && item.severity !== selectedSeverity) return false;
      return true;
    });
  }, [report.items, selectedCategory, selectedSeverity]);

  const autoFixableCount = report.items.filter(
    (i) => i.canAutoFix && i.applyFix && i.severity !== "passed"
  ).length;

  const targetDomain = (
    config.customDomain ||
    config.cloudflare?.customDomain ||
    (config.cloudflare?.subdomain ? `${config.cloudflare.subdomain}.pages.dev` : "ornek-site.pages.dev")
  ).replace(/^https?:\/\//i, "").replace(/\/+$/, "");

  const displayTitle = config.seo?.metaTitle || `${config.companyName || 'Kurumsal Hizmetler'} | ${config.slogan || config.hero?.subtitle || 'Profesyonel Çözümler'}`;
  const displayDesc = config.seo?.metaDescription || config.slogan || config.hero?.subtitle || "En kaliteli hizmetler, şeffaf fiyatlar ve kurumsal destek ile 7/24 yanınızdayız.";
  const displayOgImage = config.seo?.ogImage || config.hero?.bgImage || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop";

  return (
    <div className="space-y-6 text-slate-200">
      {/* Top Banner with Re-Scan & Auto-Fix */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white tracking-tight">SEO Health &amp; Accessibility Audit</h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30">
                Otomatik Denetim
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Google arama motoru meta etiketleri, WCAG erişilebilirliği ve 0.02s TTFB hız sinyallerinin 360° analizi.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {autoFixableCount > 0 && (
            <button
              type="button"
              onClick={handleFixAll}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Tümünü Otomatik Onar ({autoFixableCount})</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleReScan}
            disabled={isScanning}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            title="Denetimi Tekrar Çalıştır"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin text-amber-400" : ""}`} />
            <span className="hidden sm:inline">Yeniden Tara</span>
          </button>

          {onOpenHeatmap && (
            <button
              type="button"
              onClick={onOpenHeatmap}
              className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
              title="D3.js Bölgesel Performans Isı Haritasını Aç"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">SEO Isı Haritası (D3)</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Notification */}
      {lastFixMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{lastFixMessage}</span>
        </div>
      )}

      {/* Executive Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Main Health Score Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 flex flex-col justify-between relative overflow-hidden group shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Genel Sağlık Skoru</span>
            <span
              className={`px-2 py-0.5 rounded-md font-mono text-xs font-black border ${
                report.grade === "A+" || report.grade === "A"
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                  : report.grade === "B+" || report.grade === "B"
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                  : "bg-rose-500/20 text-rose-300 border-rose-500/30"
              }`}
            >
              {report.grade}
            </span>
          </div>

          <div className="my-4 flex items-baseline gap-2">
            <span
              className={`text-5xl font-black tracking-tight ${
                report.overallScore >= 85
                  ? "text-emerald-400"
                  : report.overallScore >= 70
                  ? "text-amber-400"
                  : "text-rose-400"
              }`}
            >
              {report.overallScore}
            </span>
            <span className="text-slate-500 font-bold text-sm">/ 100</span>
          </div>

          <div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  report.overallScore >= 85
                    ? "bg-emerald-500"
                    : report.overallScore >= 70
                    ? "bg-amber-500"
                    : "bg-rose-500"
                }`}
                style={{ width: `${report.overallScore}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 font-medium leading-tight">{report.statusText}</p>
          </div>
        </div>

        {/* Pillar 1: Meta Tags */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-400">
              <Globe className="w-4 h-4" />
              <span className="text-xs font-bold text-white">Meta Etiketleri</span>
            </div>
            <span className="text-sm font-black text-cyan-400">{report.categoryScores.meta.score}%</span>
          </div>
          <div className="my-3">
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${report.categoryScores.meta.score}%` }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>{report.categoryScores.meta.passed} / {report.categoryScores.meta.total} Başarılı</span>
            <span className="text-slate-500 font-mono">SERP &amp; OpenGraph</span>
          </div>
        </div>

        {/* Pillar 2: Accessibility */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-400">
              <Gauge className="w-4 h-4" />
              <span className="text-xs font-bold text-white">Erişilebilirlik (A11y)</span>
            </div>
            <span className="text-sm font-black text-indigo-400">{report.categoryScores.accessibility.score}%</span>
          </div>
          <div className="my-3">
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-400 rounded-full transition-all duration-500"
                style={{ width: `${report.categoryScores.accessibility.score}%` }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>{report.categoryScores.accessibility.passed} / {report.categoryScores.accessibility.total} Başarılı</span>
            <span className="text-slate-500 font-mono">WCAG 2.1 AA</span>
          </div>
        </div>

        {/* Pillar 3: Performance & Edge */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-bold text-white">Performans &amp; Hız</span>
            </div>
            <span className="text-sm font-black text-emerald-400">{report.categoryScores.performance.score}%</span>
          </div>
          <div className="my-3">
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${report.categoryScores.performance.score}%` }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>{report.categoryScores.performance.passed} / {report.categoryScores.performance.total} Başarılı</span>
            <span className="text-slate-500 font-mono">0.02s TTFB</span>
          </div>
        </div>
      </div>

      {/* Interactive SERP and Social Card Previews Toggle */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-white">Canlı Önizleme Simülatörü</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPreviewMode(previewMode === "google" ? "none" : "google")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                previewMode === "google"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Google SERP Sonucu</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode(previewMode === "social" ? "none" : "social")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                previewMode === "social"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Sosyal Paylaşım Kartı (OpenGraph)</span>
            </button>
          </div>
        </div>

        {/* Google SERP Simulator */}
        {previewMode === "google" && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 mt-3 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <span className="text-[11px] text-slate-400 font-mono">Google Arama Sonucu Simülasyonu</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSerpDevice("desktop")}
                  className={`p-1.5 rounded-md text-xs cursor-pointer ${
                    serpDevice === "desktop" ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300"
                  }`}
                  title="Masaüstü Görünümü"
                >
                  <Laptop className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setSerpDevice("mobile")}
                  className={`p-1.5 rounded-md text-xs cursor-pointer ${
                    serpDevice === "mobile" ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300"
                  }`}
                  title="Mobil Görünüm"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className={serpDevice === "mobile" ? "max-w-sm mx-auto" : "max-w-2xl"}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-400 font-bold">
                  {targetDomain.charAt(0).toUpperCase()}
                </div>
                <div className="text-[11px] text-slate-300 flex items-center gap-1 truncate">
                  <span>{targetDomain}</span>
                  <span className="text-slate-600">›</span>
                  <span className="text-slate-400">ana-sayfa</span>
                </div>
              </div>
              <h4 className="text-base text-blue-400 hover:underline cursor-pointer font-medium leading-snug line-clamp-2">
                {displayTitle}
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed line-clamp-2">
                {displayDesc}
              </p>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
              <div>
                Başlık Uzunluğu:{" "}
                <span className={displayTitle.length > 60 ? "text-amber-400 font-bold" : "text-emerald-400 font-bold"}>
                  {displayTitle.length} / 60 kr.
                </span>
              </div>
              <div>
                Açıklama Uzunluğu:{" "}
                <span
                  className={
                    displayDesc.length < 120 || displayDesc.length > 160
                      ? "text-amber-400 font-bold"
                      : "text-emerald-400 font-bold"
                  }
                >
                  {displayDesc.length} / 160 kr.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* OpenGraph Social Card Simulator */}
        {previewMode === "social" && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 mt-3 animate-in fade-in">
            <div className="max-w-md mx-auto rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-2xl">
              <div className="relative aspect-[1.91/1] w-full bg-slate-800 overflow-hidden">
                <img
                  src={displayOgImage}
                  alt={displayTitle}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] font-mono text-slate-300">
                  1200 × 630 px
                </div>
              </div>
              <div className="p-3.5 space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  {targetDomain.toUpperCase()}
                </div>
                <div className="text-sm font-bold text-white line-clamp-1">{displayTitle}</div>
                <div className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{displayDesc}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Severity Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === "all" ? "bg-amber-500 text-slate-950 shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            Tüm Kategoriler ({report.totalChecks})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory("meta")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === "meta" ? "bg-amber-500 text-slate-950 shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            Meta Etiketleri ({report.categoryScores.meta.total})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory("accessibility")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === "accessibility"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Erişilebilirlik ({report.categoryScores.accessibility.total})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory("performance")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === "performance"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Performans ({report.categoryScores.performance.total})
          </button>
        </div>

        {/* Severity Filters */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedSeverity("all")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
              selectedSeverity === "all" ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Tümü
          </button>
          <button
            type="button"
            onClick={() => setSelectedSeverity("critical")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
              selectedSeverity === "critical"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                : "text-slate-500 hover:text-rose-400"
            }`}
          >
            <AlertCircle className="w-3 h-3 text-rose-400" />
            <span>Kritik ({report.criticalCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedSeverity("warning")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
              selectedSeverity === "warning"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : "text-slate-500 hover:text-amber-400"
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span>Uyarı ({report.warningCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedSeverity("passed")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
              selectedSeverity === "passed"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : "text-slate-500 hover:text-emerald-400"
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Başarılı ({report.passedCount})</span>
          </button>
        </div>
      </div>

      {/* Findings & Actionable Audit Items List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900/50 border border-slate-800 text-slate-400 text-xs">
            Seçilen filtre kriterlerine uygun denetim maddesi bulunamadı.
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all ${
                item.severity === "critical"
                  ? "bg-rose-950/20 border-rose-800/40 hover:border-rose-700/50"
                  : item.severity === "warning"
                  ? "bg-amber-950/20 border-amber-800/40 hover:border-amber-700/50"
                  : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700/80"
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="mt-0.5 shrink-0">
                    {item.severity === "critical" ? (
                      <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                    ) : item.severity === "warning" ? (
                      <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-white tracking-tight">{item.title}</h4>
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-mono">
                        {item.categoryLabel}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                          item.severity === "critical"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : item.severity === "warning"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        }`}
                      >
                        {item.severity === "critical" ? "Kritik" : item.severity === "warning" ? "Uyarı" : "Başarılı"}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 font-medium">{item.statusMessage}</p>

                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                      <span className="text-slate-500 font-mono">Mevcut Değer:</span>
                      <code className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 text-[10px] font-mono truncate max-w-md">
                        {item.currentValue}
                      </code>
                    </div>

                    <div className="pt-2 text-[11px] text-slate-400 flex items-start gap-1.5 leading-relaxed">
                      <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                      <span>{item.explanation}</span>
                    </div>

                    {/* Suggested Fix Section */}
                    {item.suggestedFix && item.severity !== "passed" && (
                      <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-amber-500/20 space-y-1.5">
                        <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                          <Wrench className="w-3 h-3" />
                          <span>Önerilen Düzeltme:</span>
                        </div>
                        <p className="text-xs text-slate-200 font-mono bg-slate-900 p-2 rounded-lg border border-slate-800 break-all">
                          {item.suggestedFix}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Single Fix Action Button */}
                {item.canAutoFix && item.applyFix && item.severity !== "passed" && (
                  <div className="w-full sm:w-auto shrink-0 self-start sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleApplySingleFix(item)}
                      className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-amber-500/10 active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Öneriyi Uygula</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
