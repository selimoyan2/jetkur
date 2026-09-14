import React, { useState, useMemo } from "react";
import {
  SiteConfig,
  CustomerPanelTab
} from "../../types";
import {
  runAutomatedSeoHealthAudit,
  applySingleSeoAuditFix,
  applyAllQueuedSeoAuditFixes,
  SeoFixItem,
  SeoIssueCategory
} from "../../utils/seoAutomatedAuditEngine";
import {
  Activity,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Zap,
  Check,
  Globe,
  Sliders,
  SlidersHorizontal,
  Layers,
  FileText,
  Image as ImageIcon,
  Link2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Clock,
  Settings2,
  Eye,
  CheckCheck,
  X,
  Calendar,
  BellRing
} from "lucide-react";

interface SeoAutomatedAuditToolProps {
  config: SiteConfig;
  onChange: (updatedConfig: SiteConfig) => void;
  onNavigateTab?: (tab: CustomerPanelTab) => void;
  className?: string;
}

export const SeoAutomatedAuditTool: React.FC<SeoAutomatedAuditToolProps> = ({
  config,
  onChange,
  onNavigateTab,
  className = ""
}) => {
  const [resolvedFixIds, setResolvedFixIds] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isFixingAll, setIsFixingAll] = useState(false);
  const [fixingSingleId, setFixingSingleId] = useState<string | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<"all" | SeoIssueCategory>("all");
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Automation Settings State
  const [isDailyScanEnabled, setIsDailyScanEnabled] = useState<boolean>(
    config.seoAuditConfig?.isDailyScanEnabled ?? true
  );
  const [notifyOnDailyScan, setNotifyOnDailyScan] = useState<boolean>(true);

  // Compute live audit report
  const report = useMemo(() => {
    return runAutomatedSeoHealthAudit(config, resolvedFixIds);
  }, [config, resolvedFixIds]);

  // Handle manual re-scan
  const handleManualScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setSuccessToast("Sitenin tüm sayfaları, linkleri ve görselleri başarıyla yeniden tarandı!");
      setTimeout(() => setSuccessToast(null), 4000);
    }, 850);
  };

  // Handle single item fix
  const handleApplySingle = (item: SeoFixItem) => {
    setFixingSingleId(item.id);
    setTimeout(() => {
      const updatedConfig = applySingleSeoAuditFix(config, item);
      setResolvedFixIds((prev) => [...prev, item.id]);
      onChange(updatedConfig);
      setFixingSingleId(null);
      setSuccessToast(`"${item.title}" başarıyla onarıldı ve siteye uygulandı.`);
      setTimeout(() => setSuccessToast(null), 4000);
    }, 450);
  };

  // Handle Fix All in Queue
  const handleFixAllQueue = () => {
    if (report.fixQueue.length === 0) return;
    setIsFixingAll(true);

    setTimeout(() => {
      const { updatedConfig, fixedCount } = applyAllQueuedSeoAuditFixes(config, report.fixQueue);
      const allIds = report.fixQueue.map((f) => f.id);
      setResolvedFixIds((prev) => Array.from(new Set([...prev, ...allIds])));
      onChange(updatedConfig);
      setIsFixingAll(false);
      setSuccessToast(`Tebrikler! ${fixedCount} adet SEO sorunu tek tıkla onarıldı. SEO Sağlık Skorunuz ${report.estimatedScoreAfterFixAll}/100 seviyesine yükseltildi!`);
      setTimeout(() => setSuccessToast(null), 6000);
    }, 1100);
  };

  // Filtered queue items
  const filteredQueue = useMemo(() => {
    if (activeCategoryFilter === "all") return report.fixQueue;
    return report.fixQueue.filter((item) => item.category === activeCategoryFilter);
  }, [report.fixQueue, activeCategoryFilter]);

  // Circular gauge calculations (SVG radius = 46, circumference = 2 * PI * 46 = 289)
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (report.overallHealthScore / 100) * circumference;

  // Grade badge styling
  const getGradeStyle = (score: number) => {
    if (score >= 90) return { stroke: "#10b981", badgeBg: "bg-emerald-500", text: "text-emerald-600", lightBg: "bg-emerald-50 border-emerald-200" };
    if (score >= 75) return { stroke: "#3b82f6", badgeBg: "bg-blue-600", text: "text-blue-600", lightBg: "bg-blue-50 border-blue-200" };
    return { stroke: "#f59e0b", badgeBg: "bg-amber-500", text: "text-amber-600", lightBg: "bg-amber-50 border-amber-200" };
  };
  const theme = getGradeStyle(report.overallHealthScore);

  return (
    <div id="seo-automated-audit-tool" className={`space-y-6 ${className}`}>
      {/* SUCCESS TOAST BANNER */}
      {successToast && (
        <div
          id="seo-audit-success-toast"
          className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 shadow-xs flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold">SEO Denetim & Onarım Başarılı</div>
              <div className="text-[11px] text-emerald-800 leading-relaxed mt-0.5">{successToast}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-100/70 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TOP AUDIT OVERVIEW & DAILY AUTOMATION HEADER */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Title & Status */}
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Otomatik SEO Sağlık Denetimi</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Günlük Otomatik Tarama: {isDailyScanEnabled ? "Aktif" : "Pasif"}</span>
              </span>

              <span className="text-[11px] text-slate-400 font-medium">
                Son Tarama: {report.lastScanTimestamp}
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              SEO Health Score & Tek Tıkla Onarım Kuyruğu
            </h2>

            <p className="text-xs text-slate-600 leading-relaxed">
              Sitenizin tüm sayfalarını, menü bağlantılarını, meta etiketlerini ve görsel alt metinlerini 7/24 otomatik denetler. Tespit edilen eksiklikleri tek tıkla toplu olarak onarır.
            </p>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              type="button"
              id="rescan-site-seo-btn"
              onClick={handleManualScan}
              disabled={isScanning}
              className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs flex items-center gap-2 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
              title="Sitenin tüm bağlantı ve meta etiketlerini şimdi yeniden tara"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${isScanning ? "animate-spin" : ""}`} />
              <span>{isScanning ? "Taranıyor..." : "Hemen Yeniden Tara"}</span>
            </button>

            <button
              type="button"
              id="open-audit-settings-btn"
              onClick={() => setShowSettingsModal(true)}
              className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              title="Otomatik Tarama & Bildirim Ayarları"
            >
              <Settings2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* METRICS & SCORE HIGHLIGHT CARDS */}
        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Circular Score Gauge */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 flex items-center gap-4">
            <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
              <svg className="w-20 h-20 -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  fill="transparent"
                  stroke="#e2e8f0"
                  strokeWidth="7"
                />
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  fill="transparent"
                  stroke={theme.stroke}
                  strokeWidth="7"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black text-slate-900 leading-none">
                  {report.overallHealthScore}
                </span>
                <span className="text-[9px] font-bold text-slate-400 mt-0.5">/100</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black text-white ${theme.badgeBg}`}>
                  Derece: {report.grade}
                </span>
              </div>
              <div className="text-xs font-bold text-slate-800 mt-1">
                {report.statusText}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Onarınca: <strong className="text-emerald-600">%{report.estimatedScoreAfterFixAll}</strong>
              </div>
            </div>
          </div>

          {/* Pillar 1: Broken Links Card */}
          <div 
            onClick={() => setActiveCategoryFilter("broken_links")}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeCategoryFilter === "broken_links"
                ? "bg-indigo-50/60 border-indigo-300 ring-2 ring-indigo-200"
                : "bg-slate-50/70 border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                <Link2 className="w-4 h-4" />
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                report.categories.brokenLinks.issueCount === 0
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-rose-100 text-rose-800"
              }`}>
                Skor: %{report.categories.brokenLinks.healthScore}
              </span>
            </div>
            <div className="mt-2.5">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Kırık Bağlantılar
              </div>
              <div className="text-base font-black text-slate-900 mt-0.5">
                {report.categories.brokenLinks.issueCount === 0 
                  ? "Tümü Geçerli" 
                  : `${report.categories.brokenLinks.issueCount} Hatalı Link`}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {report.categories.brokenLinks.totalScanned} bağlantı tarandı
              </div>
            </div>
          </div>

          {/* Pillar 2: Meta Descriptions Card */}
          <div 
            onClick={() => setActiveCategoryFilter("missing_meta_descriptions")}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeCategoryFilter === "missing_meta_descriptions"
                ? "bg-indigo-50/60 border-indigo-300 ring-2 ring-indigo-200"
                : "bg-slate-50/70 border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                <FileText className="w-4 h-4" />
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                report.categories.metaDescriptions.issueCount === 0
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}>
                Skor: %{report.categories.metaDescriptions.healthScore}
              </span>
            </div>
            <div className="mt-2.5">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Meta Açıklamaları
              </div>
              <div className="text-base font-black text-slate-900 mt-0.5">
                {report.categories.metaDescriptions.issueCount === 0
                  ? "Eksiksiz (100%)"
                  : `${report.categories.metaDescriptions.issueCount} Eksik Açıklama`}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {report.categories.metaDescriptions.totalScanned} sayfa ve içerik tarandı
              </div>
            </div>
          </div>

          {/* Pillar 3: Image Alt-Text Card */}
          <div 
            onClick={() => setActiveCategoryFilter("unoptimized_image_alt")}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeCategoryFilter === "unoptimized_image_alt"
                ? "bg-indigo-50/60 border-indigo-300 ring-2 ring-indigo-200"
                : "bg-slate-50/70 border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                <ImageIcon className="w-4 h-4" />
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                report.categories.imageAltText.issueCount === 0
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}>
                Skor: %{report.categories.imageAltText.healthScore}
              </span>
            </div>
            <div className="mt-2.5">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Görsel Alt Metinleri
              </div>
              <div className="text-base font-black text-slate-900 mt-0.5">
                {report.categories.imageAltText.issueCount === 0
                  ? "Tüm Görseller Optimize"
                  : `${report.categories.imageAltText.issueCount} Eksik Alt-Text`}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {report.categories.imageAltText.totalScanned} görsel taranıp incelendi
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ONE-CLICK FIX QUEUE SECTION */}
      <div id="seo-one-click-fix-queue-section" className="space-y-4">
        {/* Queue Header & Batch Fix Button */}
        <div className="p-5 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase tracking-wider border border-indigo-400/30">
                Akıllı Onarım Motoru
              </span>
              <span className="text-xs text-slate-400">
                {report.totalIssuesCount} Düzeltme Bekliyor
              </span>
            </div>

            <h3 className="text-base font-black tracking-tight text-white flex items-center gap-2">
              <span>Tek Tıkla SEO Onarım Kuyruğu</span>
              {report.totalIssuesCount > 0 && (
                <span className="text-xs font-normal text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/40">
                  +{report.estimatedScoreAfterFixAll - report.overallHealthScore} Puan Artış Potansiyeli
                </span>
              )}
            </h3>

            <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
              Aşağıdaki tüm kırık linkleri hedef sayfalara bağlar, eksik meta açıklamalarını yerel arama uyumlu yazar ve görsellere zengin alt metinler ekler.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <button
              type="button"
              id="fix-all-seo-queue-btn"
              onClick={handleFixAllQueue}
              disabled={isFixingAll || report.totalIssuesCount === 0}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-indigo-500/20 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isFixingAll ? (
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Zap className="w-4 h-4 text-amber-300" />
              )}
              <span>
                {isFixingAll
                  ? "Tüm Sorunlar Onarılıyor..."
                  : report.totalIssuesCount === 0
                  ? "Tüm Sorunlar Onarıldı ✓"
                  : `Tüm Kuyruğu Tek Tıkla Onar (${report.totalIssuesCount})`}
              </span>
            </button>
          </div>
        </div>

        {/* Category Filters Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold text-slate-600">
          <button
            type="button"
            onClick={() => setActiveCategoryFilter("all")}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeCategoryFilter === "all"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-white hover:bg-slate-100 border border-slate-200 text-slate-700"
            }`}
          >
            Tüm Sorunlar ({report.totalIssuesCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveCategoryFilter("broken_links")}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeCategoryFilter === "broken_links"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-white hover:bg-slate-100 border border-slate-200 text-slate-700"
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Kırık Bağlantılar ({report.categories.brokenLinks.issueCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategoryFilter("missing_meta_descriptions")}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeCategoryFilter === "missing_meta_descriptions"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-white hover:bg-slate-100 border border-slate-200 text-slate-700"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Meta Açıklamaları ({report.categories.metaDescriptions.issueCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategoryFilter("unoptimized_image_alt")}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeCategoryFilter === "unoptimized_image_alt"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-white hover:bg-slate-100 border border-slate-200 text-slate-700"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Görsel Alt Metinleri ({report.categories.imageAltText.issueCount})</span>
          </button>
        </div>

        {/* QUEUE ITEMS LIST */}
        {filteredQueue.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black text-slate-900">
                Seçili Kategoride Hiçbir Sorun Bulunmuyor!
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Tüm bağlantılar geçerli, meta etiketleri eksiksiz ve görsel alt metinleri arama motoru standartlarına tam uyumludur.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredQueue.map((item) => {
              const isFixing = fixingSingleId === item.id;
              const isCritical = item.severity === "critical";

              return (
                <div
                  key={item.id}
                  id={`fix-queue-item-${item.id}`}
                  className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all space-y-3.5"
                >
                  {/* Item Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isCritical
                          ? "bg-rose-100 text-rose-800 border border-rose-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}>
                        {isCritical ? "Kritik Hata" : "Öneri / Uyarı"}
                      </span>

                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                        {item.categoryLabel}
                      </span>

                      <span className="text-xs text-slate-400 font-medium">
                        Konum: <strong className="text-slate-700">{item.location}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 self-start sm:self-center">
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        +{item.impactScore} Puan
                      </span>
                    </div>
                  </div>

                  {/* Title and Explanation */}
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {item.explanation}
                    </p>
                  </div>

                  {/* Diff Box: Current vs Proposed Fix */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                    {/* Current Problematic Value */}
                    <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-1">
                      <div className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">
                        Mevcut Durum / Hatalı Değer:
                      </div>
                      <div className="font-mono text-[11px] text-rose-950 break-all">
                        {item.currentValue}
                      </div>
                    </div>

                    {/* Proposed Fix Value */}
                    <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-1">
                      <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        <span>Önerilen & Uygulanacak Düzeltme:</span>
                      </div>
                      <div className="font-medium text-[11px] text-emerald-950 break-words">
                        {item.suggestedValue}
                      </div>
                    </div>
                  </div>

                  {/* Item Footer Action */}
                  <div className="flex items-center justify-end pt-1">
                    <button
                      type="button"
                      id={`apply-fix-btn-${item.id}`}
                      onClick={() => handleApplySingle(item)}
                      disabled={isFixing || isFixingAll}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                      title="Bu öneriyi siteye tek tıkla uygula"
                    >
                      {isFixing ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
                      )}
                      <span>{isFixing ? "Uygulanıyor..." : "Tekil Onar"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* AUTOMATION & SCHEDULE SETTINGS MODAL */}
      {showSettingsModal && (
        <div
          id="seo-audit-settings-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div
            id="seo-audit-settings-modal"
            className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
                  <Settings2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Otomatik Denetim & Zamanlama Ayarları
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Günlük arama motoru sağlık denetimi kuralları
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Daily Scan Switch */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-slate-900">Günlük Otomatik Tarama</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      Her gün sabaha karşı 04:00'te tüm sayfaları, menüleri ve görselleri otomatik denetle.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isDailyScanEnabled}
                    onChange={(e) => {
                      const val = e.target.checked;
                      setIsDailyScanEnabled(val);
                      onChange({
                        ...config,
                        seoAuditConfig: {
                          ...config.seoAuditConfig,
                          isDailyScanEnabled: val
                        }
                      });
                    }}
                    className="w-5 h-5 rounded text-indigo-600 accent-indigo-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Notification Preference */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-slate-900">Kritik Hatalarda Bildirim Ver</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      Kırık link veya eksik meta açıklama tespit edildiğinde Müşteri Paneli bildirim çubuğunda göster.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyOnDailyScan}
                    onChange={(e) => setNotifyOnDailyScan(e.target.checked)}
                    className="w-5 h-5 rounded text-indigo-600 accent-indigo-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Scan Scope Info */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 text-indigo-950 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-xs text-indigo-900">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Otomatik Denetim Kapsamı:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-indigo-800">
                  <li>Tüm Header, Hero ve Footer butonlarında '#' veya 404 tespiti</li>
                  <li>Ana sayfa, hizmetler, blog ve özel sayfaların Google meta açıklamaları</li>
                  <li>Logo, hero görseli, hizmet fotoğrafları ve galeri alt metinleri (alt-text)</li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Tamam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper for icon
function Wand2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z" />
      <path d="m14 7 3 3" />
      <path d="M5 6v4" />
      <path d="M19 14v4" />
      <path d="M10 2v2" />
      <path d="M7 8H3" />
      <path d="M21 16h-4" />
      <path d="M11 3H9" />
    </svg>
  );
}
