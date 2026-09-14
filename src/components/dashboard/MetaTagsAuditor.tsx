import React, { useState, useMemo } from "react";
import { SiteConfig, IndividualPageSeoMeta } from "../../types";
import { 
  auditAllSitePages, 
  auditMetaField, 
  autoFixAllMetaTags, 
  smartTrimText,
  generateOptimalTitle,
  generateOptimalDescription,
  AuditedPageMetaResult
} from "../../utils/metaAuditEngine";
import { updatePageSeoMeta } from "../../utils/pageSeoRegistry";
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Zap,
  Check,
  Globe,
  Smartphone,
  Monitor,
  ExternalLink,
  Tag,
  Wand2,
  Sliders,
  Maximize2,
  ArrowRight,
  Share2,
  FileText,
  RefreshCw,
  Copy,
  Info,
  ShieldCheck,
  ChevronRight,
  Link as LinkIcon
} from "lucide-react";

interface MetaTagsAuditorProps {
  config: SiteConfig;
  onChange: (updatedConfig: SiteConfig) => void;
  onPreview?: () => void;
  onOpenPageSeo?: () => void;
  onOpenGlobalSeo?: () => void;
}

type FilterTab = "all" | "missing" | "over_length" | "too_short" | "ideal";
type DevicePreview = "desktop" | "mobile" | "whatsapp";

export const MetaTagsAuditor: React.FC<MetaTagsAuditorProps> = ({
  config,
  onChange,
  onPreview,
  onOpenPageSeo,
  onOpenGlobalSeo
}) => {
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPageId, setSelectedPageId] = useState<string>("page-home");
  const [previewDevice, setPreviewDevice] = useState<DevicePreview>("desktop");
  const [notification, setNotification] = useState<string | null>(null);

  // Compute live site-wide audit
  const auditSummary = useMemo(() => auditAllSitePages(config), [config]);

  // Selected page audit
  const selectedAuditedPage: AuditedPageMetaResult | undefined = useMemo(() => {
    return auditSummary.pages.find(p => p.pageId === selectedPageId) || auditSummary.pages[0];
  }, [auditSummary.pages, selectedPageId]);

  // Live draft state for the selected page
  const [draftTitle, setDraftTitle] = useState<string>("");
  const [draftDesc, setDraftDesc] = useState<string>("");
  const [draftCanonical, setDraftCanonical] = useState<string>("");
  const [draftKeywords, setDraftKeywords] = useState<string>("");
  const [draftOgImage, setDraftOgImage] = useState<string>("");
  const [draftOgTitle, setDraftOgTitle] = useState<string>("");
  const [draftOgDesc, setDraftOgDesc] = useState<string>("");

  // Sync draft whenever selected page changes or config updates externally
  React.useEffect(() => {
    if (selectedAuditedPage) {
      setDraftTitle(selectedAuditedPage.rawMeta.metaTitle || "");
      setDraftDesc(selectedAuditedPage.rawMeta.metaDescription || "");
      setDraftCanonical(selectedAuditedPage.rawMeta.canonicalUrl || "");
      setDraftKeywords(selectedAuditedPage.rawMeta.keywords || "");
      setDraftOgImage(selectedAuditedPage.rawMeta.ogImage || "");
      setDraftOgTitle(selectedAuditedPage.rawMeta.ogTitle || "");
      setDraftOgDesc(selectedAuditedPage.rawMeta.ogDescription || "");
    }
  }, [selectedPageId, selectedAuditedPage]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Live audits for draft fields as user types
  const liveTitleAudit = useMemo(() => {
    return auditMetaField("title", draftTitle, {
      pageTitle: selectedAuditedPage?.pageTitle,
      companyName: config.companyName,
      city: config.city,
      sector: config.sector
    });
  }, [draftTitle, selectedAuditedPage, config]);

  const liveDescAudit = useMemo(() => {
    return auditMetaField("description", draftDesc, {
      pageTitle: selectedAuditedPage?.pageTitle,
      companyName: config.companyName,
      city: config.city,
      sector: config.sector,
      phone: config.phone
    });
  }, [draftDesc, selectedAuditedPage, config]);

  const liveCanonicalAudit = useMemo(() => {
    return auditMetaField("canonical", draftCanonical, {
      fullUrl: selectedAuditedPage?.fullUrl
    });
  }, [draftCanonical, selectedAuditedPage]);

  const liveKeywordsAudit = useMemo(() => {
    return auditMetaField("keywords", draftKeywords, {
      pageTitle: selectedAuditedPage?.pageTitle,
      companyName: config.companyName,
      city: config.city,
      sector: config.sector
    });
  }, [draftKeywords, selectedAuditedPage, config]);

  const liveOgTitleAudit = useMemo(() => {
    return auditMetaField("ogTitle", draftOgTitle || draftTitle);
  }, [draftOgTitle, draftTitle]);

  const liveOgDescAudit = useMemo(() => {
    return auditMetaField("ogDescription", draftOgDesc || draftDesc);
  }, [draftOgDesc, draftDesc]);

  // Filtered pages list
  const filteredPages = useMemo(() => {
    return auditSummary.pages.filter(page => {
      // Tab filter
      if (filterTab === "missing" && !page.hasMissing) return false;
      if (filterTab === "over_length" && !page.hasOverLength) return false;
      if (filterTab === "too_short" && !page.hasTooShort) return false;
      if (filterTab === "ideal" && (page.hasMissing || page.hasOverLength || page.hasTooShort)) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = page.pageTitle.toLowerCase().includes(q);
        const matchMeta = (page.rawMeta.metaTitle || "").toLowerCase().includes(q);
        const matchUrl = page.fullUrl.toLowerCase().includes(q);
        return matchTitle || matchMeta || matchUrl;
      }
      return true;
    });
  }, [auditSummary.pages, filterTab, searchQuery]);

  // Commit changes to selected page
  const handleSaveCurrentPage = () => {
    if (!selectedAuditedPage) return;
    const updated = updatePageSeoMeta(config, selectedAuditedPage.pageId, {
      metaTitle: draftTitle,
      metaDescription: draftDesc,
      canonicalUrl: draftCanonical,
      keywords: draftKeywords,
      ogImage: draftOgImage,
      ogTitle: draftOgTitle || draftTitle,
      ogDescription: draftOgDesc || draftDesc
    });
    onChange(updated);
    showToast(`✓ "${selectedAuditedPage.pageTitle}" meta etiketleri başarıyla kaydedildi!`);
  };

  // 1-Click Smart Trim for Title
  const handleSmartTrimTitle = () => {
    const trimmed = smartTrimText(draftTitle, 58);
    setDraftTitle(trimmed);
    showToast("Başlık önerilen 58 karakter sınırına akıllıca kırpıldı.");
  };

  // 1-Click Smart Trim for Description
  const handleSmartTrimDesc = () => {
    const trimmed = smartTrimText(draftDesc, 155);
    setDraftDesc(trimmed);
    showToast("Açıklama 155 karaktere kelime bölünmeden kırpıldı.");
  };

  // 1-Click AI Auto-Generate Title
  const handleGenerateTitle = () => {
    const newTitle = generateOptimalTitle(
      selectedAuditedPage?.pageTitle || "Sayfa",
      config.companyName || "İşletme",
      config.city || "İstanbul",
      config.sector || "Hizmet"
    );
    setDraftTitle(newTitle);
    showToast("İdeal uzunlukta SERP başlığı otomatik üretildi.");
  };

  // 1-Click AI Auto-Generate Description
  const handleGenerateDesc = () => {
    const newDesc = generateOptimalDescription(
      selectedAuditedPage?.pageTitle || "Sayfa",
      config.companyName || "İşletme",
      config.city || "İstanbul",
      config.sector || "Hizmet",
      config.phone
    );
    setDraftDesc(newDesc);
    showToast("140-155 karakterlik dönüşüm odaklı açıklama üretildi.");
  };

  // Bulk Auto-Fix All Pages
  const handleBulkAutoFix = () => {
    const { updatedConfig, fixedPagesCount } = autoFixAllMetaTags(config);
    onChange(updatedConfig);
    showToast(`🚀 ${fixedPagesCount} sayfadaki tüm aşırı uzun veya eksik meta etiketleri otomatik optimize edildi!`);
  };

  const domainDisplay = (selectedAuditedPage?.fullUrl || "https://siteniz.com").replace(/^https?:\/\//, "");

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12" id="meta-tags-auditor-root">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2.5 animate-in slide-in-from-bottom-5">
          <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* TOP HERO BANNER & REAL-TIME SUMMARY */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Canlı Meta Etiket Denetim &amp; Uzunluk Takip Aracı</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>Gerçek Zamanlı SEO Meta Denetleyicisi</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Tüm sayfalarınızdaki <strong>Title, Description, Canonical</strong> ve <strong>Open Graph</strong> alanlarını anlık olarak tarar; eksik veya Google sınırını (60 ve 160 karakter) aşan etiketleri tespit ederek canlı uyarılar üretir.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {(auditSummary.criticalMissingCount > 0 || auditSummary.overLengthCount > 0) && (
              <button
                type="button"
                id="btn-meta-auditor-bulk-fix"
                onClick={handleBulkAutoFix}
                className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>Tüm Aşım &amp; Eksikleri Otomatik Düzelt</span>
              </button>
            )}

            {onPreview && (
              <button
                type="button"
                onClick={onPreview}
                className="px-4 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ExternalLink className="w-4 h-4 text-slate-400" />
                <span>Önizleme</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Metric Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 mt-8 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-800/50 backdrop-blur-xs p-4 rounded-2xl border border-slate-700/60">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Meta Sağlık Puanı</span>
            <div className="text-2xl sm:text-3xl font-black mt-1 flex items-baseline gap-1">
              <span className={
                auditSummary.siteHealthScore >= 85 ? "text-emerald-400" :
                auditSummary.siteHealthScore >= 65 ? "text-amber-400" : "text-rose-400"
              }>
                {auditSummary.siteHealthScore}
              </span>
              <span className="text-xs text-slate-500 font-normal">/100</span>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xs p-4 rounded-2xl border border-slate-700/60">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Toplam Sayfa</span>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1">
              {auditSummary.totalPages}
            </div>
          </div>

          <div className={`p-4 rounded-2xl border transition-all ${
            auditSummary.criticalMissingCount > 0 
              ? "bg-rose-500/10 border-rose-500/30 text-rose-300" 
              : "bg-slate-800/50 border-slate-700/60 text-slate-400"
          }`}>
            <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Eksik Alanlar</span>
            </span>
            <div className="text-2xl sm:text-3xl font-black mt-1 text-rose-400">
              {auditSummary.criticalMissingCount}
            </div>
          </div>

          <div className={`p-4 rounded-2xl border transition-all ${
            auditSummary.overLengthCount > 0 
              ? "bg-amber-500/10 border-amber-500/30 text-amber-300" 
              : "bg-slate-800/50 border-slate-700/60 text-slate-400"
          }`}>
            <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Uzunluğu Aşanlar</span>
            </span>
            <div className="text-2xl sm:text-3xl font-black mt-1 text-amber-400">
              {auditSummary.overLengthCount}
            </div>
          </div>

          <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/30 text-emerald-300 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Kusursuz Sayfa</span>
            </span>
            <div className="text-2xl sm:text-3xl font-black mt-1 text-emerald-400">
              {auditSummary.idealCount}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN 2-COLUMN WORKSPACE: LEFT LIST & RIGHT LIVE AUDITOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: PAGE NAVIGATION & FILTER BAR (4 COLS) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-600" />
                <span>Taranan Sayfalar ({auditSummary.totalPages})</span>
              </h3>
              <span className="text-[11px] font-semibold text-slate-400">
                Canlı Denetim
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Sayfa veya URL'de ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-hidden bg-slate-50/50"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setFilterTab("all")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterTab === "all"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Tümü ({auditSummary.totalPages})
              </button>

              <button
                type="button"
                onClick={() => setFilterTab("over_length")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  filterTab === "over_length"
                    ? "bg-amber-500 text-white shadow-xs"
                    : "bg-amber-50 text-amber-800 hover:bg-amber-100"
                }`}
              >
                <AlertTriangle className="w-3 h-3" />
                <span>Aşanlar ({auditSummary.overLengthCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterTab("missing")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  filterTab === "missing"
                    ? "bg-rose-500 text-white shadow-xs"
                    : "bg-rose-50 text-rose-800 hover:bg-rose-100"
                }`}
              >
                <AlertCircle className="w-3 h-3" />
                <span>Eksikler ({auditSummary.criticalMissingCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterTab("ideal")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  filterTab === "ideal"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                }`}
              >
                <Check className="w-3 h-3" />
                <span>İdeal ({auditSummary.idealCount})</span>
              </button>
            </div>

            {/* Pages Scrollable List */}
            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {filteredPages.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">Filtreye uygun sayfa bulunamadı.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Tüm etiketler bu kategoride kusursuz durumda.</p>
                </div>
              ) : (
                filteredPages.map((page) => {
                  const isSelected = page.pageId === selectedPageId;
                  return (
                    <div
                      key={page.pageId}
                      id={`meta-audit-item-${page.pageId}`}
                      onClick={() => setSelectedPageId(page.pageId)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                        isSelected
                          ? "bg-indigo-50/80 border-indigo-400 shadow-xs ring-2 ring-indigo-500/20"
                          : "bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {page.pageTitle}
                            </span>
                            <span className="px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 text-[9px] font-mono shrink-0">
                              {page.pageType}
                            </span>
                          </div>

                          <div className="text-[10px] text-slate-400 truncate mt-0.5 font-mono">
                            {page.slug ? `/${page.slug}` : "/ (Ana Sayfa)"}
                          </div>
                        </div>

                        {/* Status Icon / Score */}
                        <div className="shrink-0 flex items-center gap-1.5">
                          {page.hasMissing ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              <span>Eksik</span>
                            </span>
                          ) : page.hasOverLength ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Aşıyor</span>
                            </span>
                          ) : page.hasTooShort ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              Kısa
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              <span>İdeal</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Mini Length Meters Preview */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[10px] font-mono">
                        <div>
                          <span className="text-slate-400 block">Başlık (Title):</span>
                          <span className={`font-bold ${
                            page.titleAudit.status === "ideal" ? "text-emerald-600" :
                            page.titleAudit.status === "over_length" ? "text-rose-600" : "text-amber-600"
                          }`}>
                            {page.titleAudit.charCount} / 60 krkt
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-400 block">Açıklama (Desc):</span>
                          <span className={`font-bold ${
                            page.descAudit.status === "ideal" ? "text-emerald-600" :
                            page.descAudit.status === "over_length" ? "text-rose-600" : "text-amber-600"
                          }`}>
                            {page.descAudit.charCount} / 155 krkt
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REAL-TIME AUDITOR, LIVE OVERFLOW HIGHLIGHT & SERP SIMULATOR (8 COLS) */}
        <div className="lg:col-span-8 space-y-6">
          {selectedAuditedPage && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-7">
              {/* Header of Active Inspected Page */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-lg bg-indigo-100 text-indigo-800 text-xs font-bold uppercase tracking-wider">
                      {selectedAuditedPage.pageType}
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 truncate">
                      {selectedAuditedPage.pageTitle}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 font-mono truncate">
                    {selectedAuditedPage.fullUrl}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    id="btn-meta-auditor-save-page"
                    onClick={handleSaveCurrentPage}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs flex items-center gap-2 transition-all cursor-pointer active:scale-95"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Değişiklikleri Kaydet</span>
                  </button>
                </div>
              </div>

              {/* 1. REAL-TIME META TITLE INSPECTION */}
              <div className="space-y-3 p-5 rounded-2xl bg-slate-50/70 border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-indigo-600" />
                      <span>1. Meta Başlığı (Title Tag)</span>
                    </label>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${liveTitleAudit.badgeBg} ${liveTitleAudit.badgeBorder}`}>
                      {liveTitleAudit.statusLabel}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-slate-500">Karakter:</span>
                    <span className={`font-bold px-2 py-0.5 rounded-md border ${
                      liveTitleAudit.status === "ideal" ? "bg-emerald-50 text-emerald-700 border-emerald-300" :
                      liveTitleAudit.status === "over_length" ? "bg-rose-50 text-rose-700 border-rose-300" :
                      "bg-amber-50 text-amber-700 border-amber-300"
                    }`}>
                      {draftTitle.length} / 60
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                      (~{liveTitleAudit.pixelWidthEst}px / 580px)
                    </span>
                  </div>
                </div>

                {/* Interactive Input */}
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={draftTitle}
                      onChange={(e) => setDraftTitle(e.target.value)}
                      placeholder="Örn: Kadıköy Evden Eve Nakliyat | 7/24 Kesintisiz Hizmet"
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all outline-hidden ${
                        liveTitleAudit.status === "over_length"
                          ? "border-rose-400 focus:ring-2 focus:ring-rose-400/30 bg-rose-50/20 text-slate-900"
                          : liveTitleAudit.status === "ideal"
                          ? "border-emerald-300 focus:ring-2 focus:ring-emerald-400/30 bg-white"
                          : "border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-white"
                      }`}
                    />
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        liveTitleAudit.status === "ideal" ? "bg-emerald-500" :
                        liveTitleAudit.status === "over_length" ? "bg-rose-500" : "bg-amber-500"
                      }`}
                      style={{ width: `${Math.min(100, (draftTitle.length / 60) * 100)}%` }}
                    />
                  </div>

                  {/* VISUAL OVERFLOW HIGHLIGHT (TAŞAN KARAKTERLERİN KIRMIZI GÖSTERİMİ) */}
                  {liveTitleAudit.overflowChars > 0 && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1 animate-in fade-in">
                      <div className="flex items-center gap-1.5 font-bold text-rose-800">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Google SERP Kesilme Simülasyonu (+{liveTitleAudit.overflowChars} karakter taşıyor):</span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-rose-200 font-mono text-xs leading-relaxed break-all">
                        <span className="text-slate-800">{liveTitleAudit.validPart}</span>
                        <span className="bg-rose-200 text-rose-900 px-1 py-0.5 rounded font-bold underline decoration-rose-500">
                          {liveTitleAudit.overflowPart}
                        </span>
                      </div>
                      <p className="text-[11px] text-rose-700">
                        * Kırmızı ile vurgulanan kısım Google arama sonuçlarında görünmeyecektir.
                      </p>
                    </div>
                  )}

                  {/* Live Issues or Missing Warnings */}
                  {liveTitleAudit.issues.length > 0 && (
                    <div className="text-xs space-y-1 text-slate-600">
                      {liveTitleAudit.issues.map((iss, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-rose-600 font-medium">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>{iss}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quick Fix Buttons for Title */}
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    {liveTitleAudit.overflowChars > 0 && (
                      <button
                        type="button"
                        onClick={handleSmartTrimTitle}
                        className="px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Zap className="w-3 h-3 text-rose-600" />
                        <span>Önerilen 58 Karaktere Akıllı Kırp</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleGenerateTitle}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Wand2 className="w-3 h-3 text-indigo-600" />
                      <span>İdeal Başlık Üret (AI Destekli)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. REAL-TIME META DESCRIPTION INSPECTION */}
              <div className="space-y-3 p-5 rounded-2xl bg-slate-50/70 border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      <span>2. Meta Açıklaması (Description Tag)</span>
                    </label>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${liveDescAudit.badgeBg} ${liveDescAudit.badgeBorder}`}>
                      {liveDescAudit.statusLabel}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-slate-500">Karakter:</span>
                    <span className={`font-bold px-2 py-0.5 rounded-md border ${
                      liveDescAudit.status === "ideal" ? "bg-emerald-50 text-emerald-700 border-emerald-300" :
                      liveDescAudit.status === "over_length" ? "bg-rose-50 text-rose-700 border-rose-300" :
                      "bg-amber-50 text-amber-700 border-amber-300"
                    }`}>
                      {draftDesc.length} / 155
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                      (İdeal: 120 - 155)
                    </span>
                  </div>
                </div>

                {/* Textarea */}
                <div className="space-y-2">
                  <textarea
                    rows={3}
                    value={draftDesc}
                    onChange={(e) => setDraftDesc(e.target.value)}
                    placeholder="Örn: İstanbul Kadıköy bölgesinde 7/24 profesyonel nakliyat hizmeti. 15 dakikada hızlı eksper ve uygun fiyat garantisi için hemen arayın."
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all outline-hidden resize-none ${
                      liveDescAudit.status === "over_length"
                        ? "border-rose-400 focus:ring-2 focus:ring-rose-400/30 bg-rose-50/20 text-slate-900"
                        : liveDescAudit.status === "ideal"
                        ? "border-emerald-300 focus:ring-2 focus:ring-emerald-400/30 bg-white"
                        : "border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-white"
                    }`}
                  />

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        liveDescAudit.status === "ideal" ? "bg-emerald-500" :
                        liveDescAudit.status === "over_length" ? "bg-rose-500" : "bg-amber-500"
                      }`}
                      style={{ width: `${Math.min(100, (draftDesc.length / 155) * 100)}%` }}
                    />
                  </div>

                  {/* VISUAL OVERFLOW HIGHLIGHT FOR DESCRIPTION */}
                  {liveDescAudit.overflowChars > 0 && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1 animate-in fade-in">
                      <div className="flex items-center gap-1.5 font-bold text-rose-800">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Açıklama Google Snippet Taşma Önizlemesi (+{liveDescAudit.overflowChars} karakter fazla):</span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-rose-200 font-mono text-xs leading-relaxed break-all">
                        <span className="text-slate-800">{liveDescAudit.validPart}</span>
                        <span className="bg-rose-200 text-rose-900 px-1 py-0.5 rounded font-bold underline decoration-rose-500">
                          {liveDescAudit.overflowPart}
                        </span>
                      </div>
                      <p className="text-[11px] text-rose-700">
                        * Özellikle mobil cihazlarda 155 karakterden sonrasına '...' eklenerek kesilir.
                      </p>
                    </div>
                  )}

                  {/* Issues warnings */}
                  {liveDescAudit.issues.length > 0 && (
                    <div className="text-xs space-y-1 text-slate-600">
                      {liveDescAudit.issues.map((iss, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-rose-600 font-medium">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>{iss}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quick Fix Buttons for Description */}
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    {liveDescAudit.overflowChars > 0 && (
                      <button
                        type="button"
                        onClick={handleSmartTrimDesc}
                        className="px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Zap className="w-3 h-3 text-rose-600" />
                        <span>155 Karakter Sınırına Akıllı Kırp</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleGenerateDesc}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Wand2 className="w-3 h-3 text-indigo-600" />
                      <span>Dönüşüm Açıklaması Üret (AI)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. CANONICAL & SOCIAL OPEN GRAPH INSPECTION */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Canonical URL Check */}
                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <LinkIcon className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Canonical URL</span>
                    </label>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${liveCanonicalAudit.badgeBg} ${liveCanonicalAudit.badgeBorder}`}>
                      {liveCanonicalAudit.statusLabel}
                    </span>
                  </div>

                  <input
                    type="text"
                    value={draftCanonical}
                    onChange={(e) => setDraftCanonical(e.target.value)}
                    placeholder="https://siteniz.com/sayfa.html"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-indigo-500 outline-hidden bg-white"
                  />

                  {liveCanonicalAudit.issues.length > 0 && (
                    <p className="text-[11px] text-rose-600 font-medium">
                      {liveCanonicalAudit.issues[0]}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => setDraftCanonical(selectedAuditedPage.fullUrl)}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    Varsayılan URL'i Otomatik Bağla
                  </button>
                </div>

                {/* Keywords Check */}
                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Hedef Anahtar Kelimeler</span>
                    </label>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${liveKeywordsAudit.badgeBg} ${liveKeywordsAudit.badgeBorder}`}>
                      {liveKeywordsAudit.statusLabel}
                    </span>
                  </div>

                  <input
                    type="text"
                    value={draftKeywords}
                    onChange={(e) => setDraftKeywords(e.target.value)}
                    placeholder="kelime 1, kelime 2, şehir hizmeti"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-hidden bg-white"
                  />

                  {liveKeywordsAudit.issues.length > 0 && (
                    <p className="text-[11px] text-amber-600 font-medium">
                      {liveKeywordsAudit.issues[0]}
                    </p>
                  )}
                </div>
              </div>

              {/* 4. REAL-TIME GOOGLE SERP PREVIEW BOX */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <Search className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Gerçek Zamanlı Google SERP Simülasyonu</span>
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      (Google arama sonuçlarında tam bu şekilde görünecektir)
                    </span>
                  </div>

                  <div className="flex items-center bg-slate-100 p-0.5 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setPreviewDevice("desktop")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        previewDevice === "desktop" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                      }`}
                    >
                      <Monitor className="w-3 h-3" />
                      <span>Masaüstü</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice("mobile")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        previewDevice === "mobile" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                      }`}
                    >
                      <Smartphone className="w-3 h-3" />
                      <span>Mobil</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice("whatsapp")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        previewDevice === "whatsapp" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-500"
                      }`}
                    >
                      <Share2 className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>

                {/* SERP Snippet Preview */}
                {previewDevice === "whatsapp" ? (
                  <div className="p-4 bg-[#efeae2] rounded-2xl border border-slate-200 max-w-sm">
                    <div className="bg-white rounded-xl overflow-hidden shadow-xs border border-slate-200/80">
                      <div className="h-36 bg-slate-100 relative overflow-hidden">
                        <img
                          src={draftOgImage || selectedAuditedPage.rawMeta.ogImage || config.hero?.bgImage || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80"}
                          alt="Social Share"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = "none";
                          }}
                        />
                      </div>
                      <div className="p-3 space-y-1">
                        <span className="text-[10px] text-slate-400 font-mono block uppercase">
                          {domainDisplay}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                          {draftOgTitle || draftTitle || "Başlık Girilmemiş"}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-2">
                          {draftOgDesc || draftDesc || "Açıklama girilmemiş."}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={`p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2 ${
                    previewDevice === "mobile" ? "max-w-md" : "w-full"
                  }`}>
                    {/* Google URL Row */}
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 text-[10px] font-bold text-slate-600">
                        G
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[12px] text-slate-800 font-medium truncate">
                          {config.companyName || "Siteniz"}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono truncate">
                          {selectedAuditedPage.fullUrl}
                        </div>
                      </div>
                    </div>

                    {/* Google Title Row with Real-Time Truncation Indicator */}
                    <h3 className="text-base sm:text-lg font-normal text-[#1a0dab] hover:underline cursor-pointer leading-snug break-words">
                      {liveTitleAudit.status === "over_length" ? (
                        <>
                          <span>{liveTitleAudit.validPart}</span>
                          <span className="text-slate-400">...</span>
                        </>
                      ) : (
                        draftTitle || "(Başlık Tanımlanmamış)"
                      )}
                    </h3>

                    {/* Google Snippet Description Row */}
                    <p className="text-xs sm:text-sm text-[#4d5156] leading-relaxed break-words">
                      {liveDescAudit.status === "over_length" ? (
                        <>
                          <span>{liveDescAudit.validPart}</span>
                          <span className="text-slate-400">...</span>
                        </>
                      ) : (
                        draftDesc || "(Açıklama tanımlanmamış. Google sayfa içeriğinden otomatik metin seçecektir.)"
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
