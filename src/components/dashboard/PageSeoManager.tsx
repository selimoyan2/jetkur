import React, { useState, useMemo, useRef } from "react";
import { 
  SiteConfig, 
  IndividualPageSeoMeta, 
  CustomerPanelTab 
} from "../../types";
import { 
  getAllPagesSeoMeta, 
  updatePageSeoMeta, 
  calculatePageSeoQuality, 
  generateAiPageSeoSuggestions, 
  batchApplySeoFixes,
  getSiteBaseUrl
} from "../../utils/pageSeoRegistry";
import { 
  Search, 
  Globe, 
  Share2, 
  Sparkles, 
  Link2, 
  Image as ImageIcon, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  Copy, 
  Check, 
  Smartphone, 
  Monitor, 
  Tag, 
  FileText, 
  Layers,
  ExternalLink, 
  Code2, 
  RefreshCw, 
  ShieldCheck, 
  Info, 
  Briefcase, 
  ShoppingBag, 
  BookOpen, 
  Phone, 
  ArrowRight, 
  ChevronRight, 
  Zap, 
  CheckCheck,
  MessageCircle,
  ThumbsUp,
  FileCode2,
  Filter,
  FileSpreadsheet,
  Download
} from "lucide-react";

interface PageSeoManagerProps {
  config: SiteConfig;
  onChange: (newConfig: SiteConfig) => void;
  onPreview?: () => void;
  onOpenGlobalSeo?: () => void;
  onOpenAuditor?: () => void;
  onOpenHealthCheck?: () => void;
  onOpenBulkExport?: () => void;
}

type PageCategoryFilter = "all" | "home-about" | "service" | "product" | "blog" | "custom";
type EditorActiveTab = "canonical" | "meta" | "opengraph" | "preview";

export const PageSeoManager: React.FC<PageSeoManagerProps> = ({
  config,
  onChange,
  onPreview,
  onOpenGlobalSeo,
  onOpenAuditor,
  onOpenHealthCheck,
  onOpenBulkExport
}) => {
  // 1. Pages Registry
  const allPages = useMemo(() => getAllPagesSeoMeta(config), [config]);

  // 2. State
  const [selectedPageId, setSelectedPageId] = useState<string>(allPages[0]?.pageId || "page-home");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<PageCategoryFilter>("all");
  const [editorTab, setEditorTab] = useState<EditorActiveTab>("canonical");
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCanonicalTag, setCopiedCanonicalTag] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [previewSocialPlatform, setPreviewSocialPlatform] = useState<"google" | "whatsapp" | "facebook" | "twitter">("google");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [newKeywordInput, setNewKeywordInput] = useState("");
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const baseUrl = getSiteBaseUrl(config);

  // Active Selected Page
  const activePage = useMemo(() => {
    return allPages.find(p => p.pageId === selectedPageId) || allPages[0];
  }, [allPages, selectedPageId]);

  const activePageQuality = useMemo(() => {
    if (!activePage) return null;
    return calculatePageSeoQuality(activePage);
  }, [activePage]);

  // Overall Inventory Stats
  const stats = useMemo(() => {
    const total = allPages.length;
    const optimized = allPages.filter(p => calculatePageSeoQuality(p).score >= 80).length;
    const customCanonicalCount = allPages.filter(p => p.isCustomCanonical).length;
    const missingOgImage = allPages.filter(p => !p.ogImage || p.ogImage.length < 10).length;
    const avgScore = total > 0 
      ? Math.round(allPages.reduce((acc, p) => acc + calculatePageSeoQuality(p).score, 0) / total) 
      : 0;

    return { total, optimized, customCanonicalCount, missingOgImage, avgScore };
  }, [allPages]);

  // Filtered list
  const filteredPages = useMemo(() => {
    return allPages.filter(page => {
      // Category filter
      if (categoryFilter === "home-about" && !["home", "about", "contact", "services-index", "catalog-index", "blog-index"].includes(page.pageType)) {
        return false;
      }
      if (categoryFilter === "service" && page.pageType !== "service") return false;
      if (categoryFilter === "product" && page.pageType !== "product") return false;
      if (categoryFilter === "blog" && page.pageType !== "blog-post") return false;
      if (categoryFilter === "custom" && page.pageType !== "custom-page") return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = page.pageTitle.toLowerCase().includes(q);
        const matchesSlug = page.slug.toLowerCase().includes(q);
        const matchesMeta = page.metaTitle.toLowerCase().includes(q);
        return matchesTitle || matchesSlug || matchesMeta;
      }

      return true;
    });
  }, [allPages, categoryFilter, searchQuery]);

  // Toast trigger
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Direct updater for active page
  const handleUpdateActivePage = (fields: Partial<IndividualPageSeoMeta>) => {
    if (!activePage) return;
    const updatedConfig = updatePageSeoMeta(config, activePage.pageId, fields);
    onChange(updatedConfig);
  };

  // AI Single Page Auto-Suggest
  const handleAiSuggestCurrentPage = () => {
    if (!activePage) return;
    setIsAiProcessing(true);
    setTimeout(() => {
      const suggestions = generateAiPageSeoSuggestions(config, activePage);
      handleUpdateActivePage(suggestions);
      setIsAiProcessing(false);
      showToast(`"${activePage.pageTitle}" sayfası için AI meta ve canonical etiketleri oluşturuldu! ✨`);
    }, 450);
  };

  // Batch Auto-Fix All Pages
  const handleBatchFixAll = () => {
    setIsAiProcessing(true);
    setTimeout(() => {
      const { updatedConfig, fixedCount } = batchApplySeoFixes(config);
      onChange(updatedConfig);
      setIsAiProcessing(false);
      showToast(`${fixedCount} adet sayfanın eksik SEO & Canonical verileri yapay zeka ile tamamlandı! 🚀`);
    }, 600);
  };

  // Copy canonical tag
  const handleCopyCanonicalTag = () => {
    if (!activePage?.canonicalUrl) return;
    const tag = `<link rel="canonical" href="${activePage.canonicalUrl}" />`;
    navigator.clipboard.writeText(tag);
    setCopiedCanonicalTag(true);
    setTimeout(() => setCopiedCanonicalTag(false), 2000);
    showToast("Canonical etiket kodu panoya kopyalandı!");
  };

  // Copy live page URL
  const handleCopyPageUrl = () => {
    if (!activePage?.fullUrl) return;
    navigator.clipboard.writeText(activePage.fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    showToast("Sayfa bağlantısı kopyalandı!");
  };

  // Handle OG Image File Upload
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Lütfen geçerli bir görsel dosyası seçin.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      handleUpdateActivePage({ ogImage: base64 });
      showToast("Open Graph görseli başarıyla güncellendi!");
    };
    reader.readAsDataURL(file);
  };

  // Add keyword chip
  const handleAddKeyword = () => {
    if (!newKeywordInput.trim() || !activePage) return;
    const currentList = activePage.keywords 
      ? activePage.keywords.split(",").map(k => k.trim()).filter(Boolean) 
      : [];
    if (!currentList.includes(newKeywordInput.trim())) {
      currentList.push(newKeywordInput.trim());
      handleUpdateActivePage({ keywords: currentList.join(", ") });
    }
    setNewKeywordInput("");
  };

  // Remove keyword chip
  const handleRemoveKeyword = (kwToRemove: string) => {
    if (!activePage?.keywords) return;
    const currentList = activePage.keywords
      .split(",")
      .map(k => k.trim())
      .filter(k => k && k.toLowerCase() !== kwToRemove.toLowerCase());
    handleUpdateActivePage({ keywords: currentList.join(", ") });
  };

  // Curated stock OG images for quick selection
  const curatedStockImages = [
    { label: "Çekici & Kurtarıcı", url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&h=630&q=80" },
    { label: "Yol Yardım & Akü", url: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&h=630&q=80" },
    { label: "Kurumsal Ofis & Ekip", url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&h=630&q=80" },
    { label: "Oto Servis & Bakım", url: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1200&h=630&q=80" },
    { label: "Lojistik & Taşıma", url: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1200&h=630&q=80" }
  ];

  // Helper for page type badges and icons
  const getPageTypeMeta = (type: IndividualPageSeoMeta["pageType"]) => {
    switch (type) {
      case "home":
        return { label: "Ana Sayfa", icon: Globe, color: "text-blue-600 bg-blue-50 border-blue-200" };
      case "about":
        return { label: "Hakkımızda", icon: Info, color: "text-purple-600 bg-purple-50 border-purple-200" };
      case "contact":
        return { label: "İletişim", icon: Phone, color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
      case "services-index":
        return { label: "Hizmetler Dizini", icon: Briefcase, color: "text-amber-600 bg-amber-50 border-amber-200" };
      case "service":
        return { label: "Hizmet Detayı", icon: Briefcase, color: "text-amber-600 bg-amber-50 border-amber-200" };
      case "catalog-index":
      case "product":
        return { label: "Ürün / Katalog", icon: ShoppingBag, color: "text-indigo-600 bg-indigo-50 border-indigo-200" };
      case "blog-index":
      case "blog-post":
        return { label: "Blog Yazısı", icon: BookOpen, color: "text-teal-600 bg-teal-50 border-teal-200" };
      case "custom-page":
      default:
        return { label: "Özel Sayfa", icon: FileText, color: "text-slate-600 bg-slate-50 border-slate-200" };
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. TOP HEADER & VALUE PROPOSITION */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-50 border border-amber-200/70 text-amber-900 text-xs font-bold">
                <FileCode2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Sayfa Başına SEO (Page-Level SEO)</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Canlı & Senkronize</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Bireysel Sayfa SEO, Canonical URL & Open Graph Yöneticisi
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Her bir sayfanız için bağımsız Google Meta başlığı, tıklama artıran açıklama, <code className="text-xs bg-slate-100 px-1 py-0.5 rounded text-amber-800 font-mono">&lt;link rel="canonical"&gt;</code> URL'si ve sosyal medya (WhatsApp, Facebook, LinkedIn) paylaşım görselini doğrudan yönetin.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 self-start lg:self-auto shrink-0">
            <button
              type="button"
              onClick={handleBatchFixAll}
              disabled={isAiProcessing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold shadow-xs hover:from-amber-600 hover:to-amber-700 transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>{isAiProcessing ? "İşleniyor..." : "Tüm Sayfaları AI ile Optimize Et"}</span>
            </button>

            {onOpenGlobalSeo && (
              <button
                type="button"
                onClick={onOpenGlobalSeo}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-all cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span>Genel SEO</span>
              </button>
            )}

            {onOpenAuditor && (
              <button
                type="button"
                onClick={onOpenAuditor}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                <span>SEO Denetçisi</span>
              </button>
            )}

            {onOpenBulkExport && (
              <button
                type="button"
                id="pageseo-bulk-export-btn"
                onClick={onOpenBulkExport}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs font-bold hover:bg-emerald-100 transition-all cursor-pointer shadow-xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Toplu SEO Performans CSV</span>
              </button>
            )}

            {onPreview && (
              <button
                type="button"
                onClick={onPreview}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 text-amber-400 text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Siteyi İncele</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. STATS OVERVIEW RIBBON */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-100 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500">Taranabilir Sayfalar</div>
              <div className="text-base font-black text-slate-900">{stats.total} Sayfa</div>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500">A+ / A Seviyesi Sayfalar</div>
              <div className="text-base font-black text-emerald-600">{stats.optimized} / {stats.total}</div>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
              <Link2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500">Özel Canonical URL</div>
              <div className="text-base font-black text-slate-900">{stats.customCanonicalCount} Özel / {stats.total} Auto</div>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 font-bold shrink-0">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500">Ortalama Sayfa Skoru</div>
              <div className="text-base font-black text-amber-700">%{stats.avgScore} Sağlık</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE: MASTER / DETAIL LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: PAGE INVENTORY & SEARCH (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <Layers className="w-4 h-4 text-amber-500" />
              <span>Sayfa Listesi</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                {filteredPages.length}
              </span>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Sayfa adı veya URL ara..."
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-amber-500 focus:outline-hidden transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1 pb-1">
            {[
              { id: "all", label: "Tümü" },
              { id: "home-about", label: "Kurumsal" },
              { id: "service", label: "Hizmetler" },
              { id: "product", label: "Ürünler" },
              { id: "blog", label: "Blog" },
              { id: "custom", label: "Özel Sayfalar" }
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryFilter(cat.id as PageCategoryFilter)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  categoryFilter === cat.id
                    ? "bg-slate-900 text-amber-400 shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Pages Scrollable List */}
          <div className="space-y-1.5 max-h-[620px] overflow-y-auto pr-1">
            {filteredPages.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs space-y-1">
                <AlertCircle className="w-6 h-6 mx-auto text-slate-300" />
                <p>Eşleşen sayfa bulunamadı.</p>
              </div>
            ) : (
              filteredPages.map((p) => {
                const isSelected = p.pageId === selectedPageId;
                const quality = calculatePageSeoQuality(p);
                const typeMeta = getPageTypeMeta(p.pageType);
                const TypeIcon = typeMeta.icon;

                return (
                  <button
                    key={p.pageId}
                    type="button"
                    onClick={() => setSelectedPageId(p.pageId)}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 relative ${
                      isSelected
                        ? "bg-amber-50/50 border-amber-400/80 shadow-xs ring-1 ring-amber-400/40"
                        : "bg-white hover:bg-slate-50 border-slate-200/80"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <TypeIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {p.pageTitle}
                        </span>
                      </div>
                      <span className={`text-[10px] font-black font-mono px-1.5 py-0.5 rounded-full border shrink-0 ${quality.badgeClass}`}>
                        %{quality.score}
                      </span>
                    </div>

                    {/* Path & status tags */}
                    <div className="text-[10px] font-mono text-slate-400 truncate">
                      {p.slug ? `/${p.slug}` : "/ (Ana Sayfa)"}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${typeMeta.color}`}>
                        {typeMeta.label}
                      </span>
                      {p.isCustomCanonical ? (
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Özel Canonical
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono text-slate-400">
                          Auto URL
                        </span>
                      )}
                      {p.ogImage && p.ogImage.length > 10 ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          OG Görseli Aktif
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200">
                          OG Eksik
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: INDIVIDUAL PAGE SEO EDITOR (8 Cols) */}
        {activePage && activePageQuality && (
          <div className="lg:col-span-8 space-y-5">
            {/* Active Page Card Header */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold border ${getPageTypeMeta(activePage.pageType).color}`}>
                      {getPageTypeMeta(activePage.pageType).label}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      ID: {activePage.pageId}
                    </span>
                    <span className={`text-xs font-black font-mono px-2 py-0.5 rounded-full border ${activePageQuality.badgeClass}`}>
                      SEO Skoru: %{activePageQuality.score} ({activePageQuality.grade})
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-slate-900">
                    {activePage.pageTitle}
                  </h2>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleAiSuggestCurrentPage}
                    disabled={isAiProcessing}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-300 text-xs font-bold hover:bg-amber-100 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>AI ile Sayfayı Doldur</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyPageUrl}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-all cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? "Kopyalandı" : "URL Kopyala"}</span>
                  </button>
                </div>
              </div>

              {/* Quality issues or congratulations ribbon */}
              {activePageQuality.issues.length > 0 ? (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1 text-xs">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Bu sayfa için önerilen iyileştirmeler:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-amber-800 pl-1 text-[11px]">
                    {activePageQuality.issues.map((iss, i) => (
                      <li key={i}>{iss}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold">Mükemmel! Bu sayfanın tüm Meta, Canonical ve Open Graph ayarları Google standartlarına uygun.</span>
                </div>
              )}

              {/* Editor Tabs Switcher */}
              <div className="flex border-b border-slate-200 -mb-5 pt-1">
                {[
                  { id: "canonical", label: "Canonical URL & İndeksleme", icon: Link2 },
                  { id: "meta", label: "Meta Etiketleri (Title & Desc)", icon: Tag },
                  { id: "opengraph", label: "Open Graph (Görsel & Paylaşım)", icon: Share2 },
                  { id: "preview", label: "Canlı SERP & Sosyal Önizleme", icon: Eye }
                ].map((t) => {
                  const Icon = t.icon;
                  const isActive = editorTab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setEditorTab(t.id as EditorActiveTab)}
                      className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                        isActive
                          ? "border-amber-500 text-amber-900 bg-amber-50/20"
                          : "border-transparent text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-600" : "text-slate-400"}`} />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TAB CONTENT 1: CANONICAL URL & ROBOTS */}
            {editorTab === "canonical" && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-6">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-amber-500" />
                    <span>Canonical URL Yönetimi (Yinelenen İçerik Koruması)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Googlebot'un arama dizininde hangi URL'yi birincil/orijinal sayfa olarak tanıyacağını belirler. UTM parametreleri veya benzer hizmet sayfaları nedeniyle yinelenen içerik (duplicate content) cezası almanızı engeller.
                  </p>
                </div>

                {/* Canonical Mode Toggle */}
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                  <div className="text-xs font-bold text-slate-800">Canonical Stratejisi:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                      !activePage.isCustomCanonical
                        ? "bg-white border-amber-500 shadow-xs ring-1 ring-amber-500/20"
                        : "bg-slate-100/50 border-slate-200 hover:bg-white"
                    }`}>
                      <input
                        type="radio"
                        name="canonicalStrategy"
                        checked={!activePage.isCustomCanonical}
                        onChange={() => {
                          handleUpdateActivePage({
                            isCustomCanonical: false,
                            canonicalUrl: activePage.fullUrl
                          });
                          showToast("Otomatik (Kendine Referanslı) Canonical aktif edildi.");
                        }}
                        className="mt-0.5 text-amber-600 focus:ring-amber-500"
                      />
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-slate-900">Otomatik (Kendine Referanslı)</div>
                        <div className="text-[11px] text-slate-500 leading-relaxed">
                          Google en iyi uygulaması. Sayfanın kendi temiz URL'sini referans gösterir.
                        </div>
                      </div>
                    </label>

                    <label className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                      activePage.isCustomCanonical
                        ? "bg-white border-amber-500 shadow-xs ring-1 ring-amber-500/20"
                        : "bg-slate-100/50 border-slate-200 hover:bg-white"
                    }`}>
                      <input
                        type="radio"
                        name="canonicalStrategy"
                        checked={activePage.isCustomCanonical}
                        onChange={() => {
                          handleUpdateActivePage({
                            isCustomCanonical: true
                          });
                          showToast("Özel Canonical URL modu aktif edildi.");
                        }}
                        className="mt-0.5 text-amber-600 focus:ring-amber-500"
                      />
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-slate-900">Özel (Custom) Canonical URL</div>
                        <div className="text-[11px] text-slate-500 leading-relaxed">
                          İçerik başka bir ana sayfadan veya harici kaynaktan geliyorsa farklı bir URL gösterin.
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Canonical URL Input Field */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>Hedef Canonical URL:</span>
                    <button
                      type="button"
                      onClick={() => handleUpdateActivePage({ canonicalUrl: activePage.fullUrl, isCustomCanonical: false })}
                      className="text-[11px] text-amber-700 font-semibold hover:underline"
                    >
                      Varsayılan Temiz URL'ye Sıfırla
                    </button>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={activePage.canonicalUrl}
                      onChange={(e) => handleUpdateActivePage({ 
                        canonicalUrl: e.target.value,
                        isCustomCanonical: true 
                      })}
                      placeholder="https://siteniz.com/hizmetler/kadikoy-oto-cekici"
                      className="flex-1 px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-300 bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-hidden transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleCopyCanonicalTag}
                      className="px-3 py-2 rounded-xl bg-slate-900 text-amber-400 text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      {copiedCanonicalTag ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Code2 className="w-3.5 h-3.5" />}
                      <span>{copiedCanonicalTag ? "Kopyalandı" : "Tag Kopyala"}</span>
                    </button>
                  </div>
                </div>

                {/* Rendered HTML Tag Preview Box */}
                <div className="bg-slate-900 rounded-xl p-3.5 text-xs font-mono text-slate-300 space-y-1">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    Sayfa &lt;head&gt; Koduna Eklenecek Canlı Etiket:
                  </div>
                  <div className="text-emerald-400 select-all break-all">
                    &lt;link rel="canonical" href="{activePage.canonicalUrl || activePage.fullUrl}" /&gt;
                  </div>
                </div>

                {/* Robots Crawl & Indexing Directives */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Googlebot Arama Dizini İzinleri (Robots Meta Tag)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        Robots Direktifi:
                      </label>
                      <select
                        value={activePage.robots || "index, follow"}
                        onChange={(e) => handleUpdateActivePage({ robots: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:border-amber-500 focus:outline-hidden"
                      >
                        <option value="index, follow">index, follow (Google'da Dizine Ekle ve Linkleri Takip Et - Önerilen)</option>
                        <option value="noindex, follow">noindex, follow (Google'da Arama Sonuçlarından Gizle, Linkleri Takip Et)</option>
                        <option value="index, nofollow">index, nofollow (Dizine Ekle, Sayfadaki Linkleri Takip Etme)</option>
                        <option value="noindex, nofollow">noindex, nofollow (Gizle ve Takip Etme - Özel / Gizli Sayfalar)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        Yapılandırılmış Veri / Schema.org Türü:
                      </label>
                      <select
                        value={activePage.schemaType || "WebPage"}
                        onChange={(e) => handleUpdateActivePage({ schemaType: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:border-amber-500 focus:outline-hidden"
                      >
                        <option value="LocalBusiness">LocalBusiness (Yerel İşletme)</option>
                        <option value="Service">Service (Hizmet & Servis)</option>
                        <option value="Product">Product (Ürün & Katalog)</option>
                        <option value="Article">Article (Blog & Makale)</option>
                        <option value="AboutPage">AboutPage (Kurumsal Profil)</option>
                        <option value="ContactPage">ContactPage (İletişim & Harita)</option>
                        <option value="WebPage">WebPage (Genel Web Sayfası)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: META TITLE, DESCRIPTION & KEYWORDS */}
            {editorTab === "meta" && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-6">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-amber-500" />
                    <span>Google Meta Başlığı & Açıklaması</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Google arama sonuçlarında (SERP) sitenizin başlığı ve tıklama çekici açıklama metni olarak görüntülenir.
                  </p>
                </div>

                {/* Meta Title */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <label>Sayfa Meta Başlığı (&lt;title&gt; & meta[name="title"]):</label>
                    <span className={`font-mono text-[11px] ${
                      (activePage.metaTitle?.length || 0) >= 45 && (activePage.metaTitle?.length || 0) <= 65
                        ? "text-emerald-600 font-bold"
                        : "text-amber-600 font-bold"
                    }`}>
                      {activePage.metaTitle?.length || 0} / 60 Karakter (50-60 Önerilen)
                    </span>
                  </div>
                  <input
                    type="text"
                    value={activePage.metaTitle}
                    onChange={(e) => handleUpdateActivePage({ 
                      metaTitle: e.target.value,
                      ogTitle: activePage.ogTitle === activePage.metaTitle ? e.target.value : activePage.ogTitle
                    })}
                    placeholder="Örn: Kadıköy Oto Çekici - Hızlı Servis 7/24"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-hidden transition-all font-medium"
                  />
                  {/* Title Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        (activePage.metaTitle?.length || 0) > 65
                          ? "bg-rose-500"
                          : (activePage.metaTitle?.length || 0) >= 45
                            ? "bg-emerald-500"
                            : "bg-amber-500"
                      }`}
                      style={{ width: `${Math.min(100, ((activePage.metaTitle?.length || 0) / 60) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Meta Description */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <label>Sayfa Meta Açıklaması (meta[name="description"]):</label>
                    <span className={`font-mono text-[11px] ${
                      (activePage.metaDescription?.length || 0) >= 120 && (activePage.metaDescription?.length || 0) <= 165
                        ? "text-emerald-600 font-bold"
                        : "text-amber-600 font-bold"
                    }`}>
                      {activePage.metaDescription?.length || 0} / 160 Karakter (140-160 Önerilen)
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={activePage.metaDescription}
                    onChange={(e) => handleUpdateActivePage({ 
                      metaDescription: e.target.value,
                      ogDescription: activePage.ogDescription === activePage.metaDescription ? e.target.value : activePage.ogDescription
                    })}
                    placeholder="Google arama sonuçlarında tıklama oranını artıran çekici açıklama yazın..."
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-hidden transition-all leading-relaxed"
                  />
                  {/* Description Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        (activePage.metaDescription?.length || 0) > 165
                          ? "bg-rose-500"
                          : (activePage.metaDescription?.length || 0) >= 120
                            ? "bg-emerald-500"
                            : "bg-amber-500"
                      }`}
                      style={{ width: `${Math.min(100, ((activePage.metaDescription?.length || 0) / 160) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Target Keywords */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>Hedeflenen Anahtar Kelimeler (Meta Keywords):</span>
                    <span className="text-[11px] text-slate-400">Enter ile ekleyin</span>
                  </div>

                  {/* Tag Chips */}
                  <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 min-h-[44px]">
                    {activePage.keywords ? (
                      activePage.keywords.split(",").map((kw, i) => {
                        const cleanKw = kw.trim();
                        if (!cleanKw) return null;
                        return (
                          <span 
                            key={i}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 shadow-2xs font-medium"
                          >
                            <span>{cleanKw}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveKeyword(cleanKw)}
                              className="text-slate-400 hover:text-rose-600 transition-colors ml-0.5"
                            >
                              ✕
                            </button>
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-xs text-slate-400 italic py-1">Henüz anahtar kelime eklenmedi.</span>
                    )}
                  </div>

                  {/* Add keyword input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newKeywordInput}
                      onChange={(e) => setNewKeywordInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddKeyword();
                        }
                      }}
                      placeholder="Yeni anahtar kelime yazıp Enter'a basın..."
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:border-amber-500 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={handleAddKeyword}
                      className="px-3.5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
                    >
                      Ekle
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: OPEN GRAPH & SOCIAL SHARE IMAGES */}
            {editorTab === "opengraph" && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-6">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-amber-500" />
                    <span>Open Graph & Sosyal Paylaşım Görselleri (og:image)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Bu sayfanın bağlantısı WhatsApp, Facebook, LinkedIn veya Twitter'da paylaşıldığında otomatik oluşturulan zengin önizleme kartının görselini ve başlığını yönetin.
                  </p>
                </div>

                {/* Visual OG Image Frame */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>Mevcut Open Graph Görseli (1200 x 630 px - 1.91:1):</span>
                    <span className="text-[11px] text-emerald-700 font-semibold">
                      WhatsApp & Facebook Uyumlu
                    </span>
                  </div>

                  <div className="relative aspect-[1.91/1] w-full max-w-xl rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 bg-slate-100 group shadow-inner">
                    {activePage.ogImage ? (
                      <img
                        src={activePage.ogImage}
                        alt={activePage.pageTitle}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                        <ImageIcon className="w-10 h-10 text-slate-300" />
                        <span className="text-xs font-medium">Görsel seçilmedi</span>
                      </div>
                    )}

                    {/* Floating Controls Overlay */}
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-2 rounded-xl bg-white text-slate-900 text-xs font-bold shadow-md hover:bg-slate-100 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Yeni Dosya Yükle</span>
                      </button>
                    </div>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                {/* Direct Image URL Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    Görsel URL Bağlantısı (og:image):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={activePage.ogImage}
                      onChange={(e) => handleUpdateActivePage({ ogImage: e.target.value })}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="flex-1 px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-300 bg-white focus:border-amber-500 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-slate-600" />
                      <span>Bilgisayardan Yükle</span>
                    </button>
                  </div>
                </div>

                {/* Quick Curated Stock Image Presets */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="text-xs font-bold text-slate-800">
                    Hızlı Hazır Görsel Seçenekleri:
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {curatedStockImages.map((stock, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          handleUpdateActivePage({ ogImage: stock.url });
                          showToast(`"${stock.label}" görseli uygulandı.`);
                        }}
                        className="group relative aspect-video rounded-xl overflow-hidden border border-slate-200 hover:border-amber-500 transition-all text-left cursor-pointer"
                      >
                        <img 
                          src={stock.url} 
                          alt={stock.label}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-1.5">
                          <span className="text-[10px] font-bold text-white leading-tight">
                            {stock.label}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom OG Title & Description Overrides */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">
                      Özel Open Graph Başlığı (og:title):
                    </label>
                    <input
                      type="text"
                      value={activePage.ogTitle}
                      onChange={(e) => handleUpdateActivePage({ ogTitle: e.target.value })}
                      placeholder={activePage.metaTitle}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:border-amber-500 focus:outline-hidden"
                    />
                    <span className="text-[10px] text-slate-400">Boş bırakılırsa Meta Başlığı kullanılır.</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">
                      Twitter Kart Biçimi (twitter:card):
                    </label>
                    <select
                      value={activePage.twitterCard || "summary_large_image"}
                      onChange={(e) => handleUpdateActivePage({ twitterCard: e.target.value as "summary_large_image" | "summary" })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:border-amber-500 focus:outline-hidden"
                    >
                      <option value="summary_large_image">summary_large_image (Büyük Manşet Görseli - Tavsiye Edilen)</option>
                      <option value="summary">summary (Küçük Kare Görsel)</option>
                    </select>
                    <span className="text-[10px] text-slate-400">Twitter (X) paylaşımları için kart görünümü.</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 4: LIVE SERP & SOCIAL SHARING PREVIEW */}
            {editorTab === "preview" && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <Eye className="w-4 h-4 text-amber-500" />
                      <span>Canlı Görünüm Simülatörü</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Sayfanızın Google arama motorunda ve sosyal ağlarda nasıl göründüğünü test edin.
                    </p>
                  </div>

                  {/* Simulator Platform Selector */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setPreviewSocialPlatform("google")}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                        previewSocialPlatform === "google"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5 text-blue-600" />
                      <span>Google SERP</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPreviewSocialPlatform("whatsapp")}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                        previewSocialPlatform === "whatsapp"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPreviewSocialPlatform("facebook")}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                        previewSocialPlatform === "facebook"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5 text-blue-600" />
                      <span>Facebook / LinkedIn</span>
                    </button>
                  </div>
                </div>

                {/* GOOGLE SERP SIMULATOR */}
                {previewSocialPlatform === "google" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Google Snippet Görünümü:</span>
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                        <button
                          type="button"
                          onClick={() => setPreviewDevice("desktop")}
                          className={`p-1.5 rounded transition-all cursor-pointer ${
                            previewDevice === "desktop" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
                          }`}
                          title="Masaüstü"
                        >
                          <Monitor className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewDevice("mobile")}
                          className={`p-1.5 rounded transition-all cursor-pointer ${
                            previewDevice === "mobile" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
                          }`}
                          title="Mobil"
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Google SERP Card */}
                    <div className={`p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1 font-sans ${
                      previewDevice === "mobile" ? "max-w-md mx-auto" : "max-w-2xl"
                    }`}>
                      {/* URL Breadcrumb */}
                      <div className="flex items-center gap-2 text-xs text-slate-700">
                        <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 border border-slate-200">
                          {config.companyName?.slice(0, 1) || "H"}
                        </div>
                        <div className="flex flex-col leading-tight">
                          <span className="text-xs font-semibold text-slate-800">{config.companyName || "HızlıWeb"}</span>
                          <span className="text-[11px] text-slate-500 font-mono truncate">
                            {activePage.canonicalUrl || activePage.fullUrl}
                          </span>
                        </div>
                      </div>

                      {/* Clickable Blue Title */}
                      <h4 className="text-base sm:text-lg font-medium text-[#1a0dab] hover:underline cursor-pointer pt-1 line-clamp-1 leading-snug">
                        {activePage.metaTitle || "Başlık girilmedi"}
                      </h4>

                      {/* Snippet Description */}
                      <p className="text-xs text-[#4d5156] leading-relaxed line-clamp-2">
                        {activePage.metaDescription || "Açıklama girilmedi."}
                      </p>

                      {/* Rich Snippet Ratings/Price if available */}
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1 font-medium">
                        <span className="text-amber-500">★★★★★</span>
                        <span>4.9 (124 yorum)</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-semibold">15 Dk Varış</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* WHATSAPP CARD SIMULATOR */}
                {previewSocialPlatform === "whatsapp" && (
                  <div className="space-y-4">
                    <span className="text-xs font-bold text-slate-700">WhatsApp Mesajlaşma Önizlemesi:</span>
                    <div className="max-w-md mx-auto p-4 rounded-2xl bg-[#e5ddd5] shadow-inner">
                      {/* Chat Bubble */}
                      <div className="bg-white rounded-2xl p-2 shadow-xs max-w-xs ml-auto space-y-2">
                        {/* Rich Preview Card */}
                        <div className="rounded-xl overflow-hidden bg-slate-50 border border-slate-200/80">
                          {activePage.ogImage && (
                            <img
                              src={activePage.ogImage}
                              alt={activePage.pageTitle}
                              referrerPolicy="no-referrer"
                              className="w-full aspect-[1.91/1] object-cover"
                            />
                          )}
                          <div className="p-2.5 space-y-1">
                            <div className="text-xs font-bold text-slate-900 line-clamp-1">
                              {activePage.ogTitle || activePage.metaTitle}
                            </div>
                            <div className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                              {activePage.ogDescription || activePage.metaDescription}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {baseUrl.replace(/^https?:\/\//, "")}
                            </div>
                          </div>
                        </div>

                        {/* WhatsApp text & timestamp */}
                        <div className="text-xs text-blue-600 underline break-all px-1">
                          {activePage.canonicalUrl || activePage.fullUrl}
                        </div>
                        <div className="text-[10px] text-slate-400 text-right pr-1">
                          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ✓✓
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* FACEBOOK / LINKEDIN CARD SIMULATOR */}
                {previewSocialPlatform === "facebook" && (
                  <div className="space-y-4">
                    <span className="text-xs font-bold text-slate-700">Facebook / LinkedIn Feed Kartı:</span>
                    <div className="max-w-lg mx-auto bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                      {/* Post Header */}
                      <div className="p-3.5 flex items-center gap-2.5 border-b border-slate-100">
                        <div className="w-9 h-9 rounded-full bg-slate-900 text-amber-400 font-black flex items-center justify-center text-xs">
                          {config.companyName?.slice(0, 1) || "H"}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">{config.companyName}</div>
                          <div className="text-[10px] text-slate-400">Şimdi • 🌐</div>
                        </div>
                      </div>

                      {/* Card Image */}
                      {activePage.ogImage && (
                        <img
                          src={activePage.ogImage}
                          alt={activePage.pageTitle}
                          referrerPolicy="no-referrer"
                          className="w-full aspect-[1.91/1] object-cover"
                        />
                      )}

                      {/* Card Content */}
                      <div className="p-3.5 bg-slate-50 space-y-1">
                        <div className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">
                          {baseUrl.replace(/^https?:\/\//, "")}
                        </div>
                        <div className="text-sm font-bold text-slate-900 line-clamp-1">
                          {activePage.ogTitle || activePage.metaTitle}
                        </div>
                        <div className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {activePage.ogDescription || activePage.metaDescription}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* FLOATING TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
