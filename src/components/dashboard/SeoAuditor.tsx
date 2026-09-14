import React, { useState, useMemo } from "react";
import { SiteConfig } from "../../types";
import { MetaTagsAuditor } from "./MetaTagsAuditor";
import {
  generateSeoAuditorReport,
  updateSingleImageAltText,
  autoFixAllMissingAltTexts,
  applyMetaTitle,
  applyMetaDescription,
  addKeyword,
  autoFixAllMetaRecommendations,
  AuditedImageItem,
  MetaSuggestion
} from "../../utils/seoAuditorEngine";
import {
  Activity,
  Search,
  Image as ImageIcon,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  Zap,
  Eye,
  Check,
  Plus,
  ArrowRight,
  Sliders,
  Tag,
  Globe,
  Smartphone,
  Monitor,
  Info,
  ExternalLink,
  ShieldCheck,
  Filter,
  Layers,
  Wand2,
  FileText
} from "lucide-react";

interface SeoAuditorProps {
  config: SiteConfig;
  onChange: (updatedConfig: SiteConfig) => void;
  onPreview?: () => void;
  onOpenSeoTab?: () => void;
}

type AuditorTab = "images" | "meta" | "serp";
type ImageFilter = "all" | "missing" | "valid";

export const SeoAuditor: React.FC<SeoAuditorProps> = ({
  config,
  onChange,
  onPreview,
  onOpenSeoTab
}) => {
  const [activeTab, setActiveTab] = useState<AuditorTab>("images");
  const [imageFilter, setImageFilter] = useState<ImageFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [serpDevice, setSerpDevice] = useState<"desktop" | "mobile">("desktop");
  const [notification, setNotification] = useState<string | null>(null);

  // Local editing states for image alt texts
  const [editingAltMap, setEditingAltMap] = useState<Record<string, string>>({});

  // Local editing states for meta inputs
  const [customTitle, setCustomTitle] = useState(config.seo?.metaTitle || "");
  const [customDesc, setCustomDesc] = useState(config.seo?.metaDescription || "");
  const [customNewKeyword, setCustomNewKeyword] = useState("");

  // Compute live SEO audit report
  const report = useMemo(() => generateSeoAuditorReport(config), [config]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Filtered images list
  const filteredImages = useMemo(() => {
    return report.imageAudit.items.filter(item => {
      // Filter by status
      if (imageFilter === "missing" && item.hasAlt && !item.isGeneric) return false;
      if (imageFilter === "valid" && (!item.hasAlt || item.isGeneric)) return false;

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchSection = item.sectionLabel.toLowerCase().includes(query);
        const matchAlt = (item.currentAlt || "").toLowerCase().includes(query);
        return matchTitle || matchSection || matchAlt;
      }
      return true;
    });
  }, [report.imageAudit.items, imageFilter, searchQuery]);

  // Handle single image alt text change
  const handleApplySingleAlt = (item: AuditedImageItem, altText: string) => {
    const updated = updateSingleImageAltText(config, item, altText);
    onChange(updated);
    // Clear local edit state for this image
    setEditingAltMap(prev => {
      const next = { ...prev };
      delete next[item.id];
      return next;
    });
    showNotification(`"${item.sectionLabel}" için alt metni güncellendi.`);
  };

  // Handle master 1-click auto-fix all missing alt texts
  const handleAutoFixAllImages = () => {
    const { updatedConfig, fixedCount } = autoFixAllMissingAltTexts(config);
    onChange(updatedConfig);
    setEditingAltMap({});
    showNotification(`Tebrikler! ${fixedCount} adet görselin eksik alt metni akıllı SEO önerileriyle dolduruldu.`);
  };

  // Handle apply title suggestion
  const handleApplyTitleSuggestion = (suggestion: MetaSuggestion) => {
    const updated = applyMetaTitle(config, suggestion.value);
    setCustomTitle(suggestion.value);
    onChange(updated);
    showNotification("Önerilen Meta Başlığı başarıyla uygulandı.");
  };

  // Handle apply description suggestion
  const handleApplyDescSuggestion = (suggestion: MetaSuggestion) => {
    const updated = applyMetaDescription(config, suggestion.value);
    setCustomDesc(suggestion.value);
    onChange(updated);
    showNotification("Önerilen Meta Açıklaması başarıyla uygulandı.");
  };

  // Handle add keyword
  const handleAddKeyword = (kw: string) => {
    const updated = addKeyword(config, kw);
    onChange(updated);
    showNotification(`"${kw}" anahtar kelimelere eklendi.`);
  };

  // Handle master 1-click auto-fix all meta tags
  const handleAutoFixAllMeta = () => {
    const { updatedConfig, fixedCount } = autoFixAllMetaRecommendations(config);
    onChange(updatedConfig);
    setCustomTitle(updatedConfig.seo?.metaTitle || "");
    setCustomDesc(updatedConfig.seo?.metaDescription || "");
    showNotification(`Harika! ${fixedCount} adet meta etiket optimizasyonu otomatik olarak uygulandı.`);
  };

  return (
    <div id="seo-auditor-root" className="space-y-6 pb-12">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-xl border border-emerald-500/50 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{notification}</span>
        </div>
      )}

      {/* Top Banner & Title */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-500/20 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>SEO AUDITOR & HEALTH CHECK</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              SEO Denetçisi & Görsel Alt Metin Sağlığı
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Sitenizin meta etiketlerini denetleyin, görsellerdeki eksik alt (alt-text) etiketlerini tespit edin ve arama motorlarındaki görünürlüğünüzü en üst düzeye çıkarın.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {report.imageAudit.imagesMissingAlt > 0 && (
              <button
                type="button"
                id="btn-autofix-all-images"
                onClick={handleAutoFixAllImages}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-900/30 flex items-center gap-2 transition-all cursor-pointer"
                title="Tüm eksik görsel alt metinlerini akıllı yerel önerilerle doldur"
              >
                <Zap className="w-4 h-4 text-emerald-200 fill-emerald-200" />
                <span>Eksik Alt Metinleri Doldur ({report.imageAudit.imagesMissingAlt})</span>
              </button>
            )}

            <button
              type="button"
              id="btn-autofix-all-meta"
              onClick={handleAutoFixAllMeta}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-950/40 flex items-center gap-2 transition-all cursor-pointer"
              title="Meta başlık, açıklama ve anahtar kelimeleri tek tıkla iyileştir"
            >
              <Wand2 className="w-4 h-4 text-indigo-200" />
              <span>Meta Etiketleri İyileştir</span>
            </button>

            {onPreview && (
              <button
                type="button"
                id="btn-auditor-preview"
                onClick={onPreview}
                className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Eye className="w-4 h-4 text-slate-400" />
                <span>Önizle</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* HEALTH SCORE DASHBOARD CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Main Overall Health Score Card */}
        <div className="md:col-span-1 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Genel Sağlık Skoru</span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-black border ${report.gradeBg} ${report.gradeColor} ${report.gradeBorder}`}>
              {report.grade} {report.gradeLabel}
            </span>
          </div>

          <div className="my-4 flex items-baseline gap-2">
            <span className={`text-5xl sm:text-6xl font-black tracking-tight ${report.gradeColor}`}>
              {report.overallHealthScore}
            </span>
            <span className="text-lg font-bold text-slate-400">/ 100</span>
          </div>

          {/* Simple Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden mb-3">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                report.overallHealthScore >= 80 ? "bg-emerald-500" : report.overallHealthScore >= 60 ? "bg-amber-500" : "bg-rose-500"
              }`}
              style={{ width: `${report.overallHealthScore}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-3">
            {report.summary}
          </p>
        </div>

        {/* Sub-Score Card 1: Meta Tags */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-indigo-600" />
                <span>Meta Etiketleri</span>
              </span>
              <span className="text-xs font-bold font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                %{report.subScores.metaTags}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mb-3">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${report.subScores.metaTags}%` }}
              />
            </div>
            <div className="space-y-1.5 text-[11px] text-slate-600">
              <div className="flex items-center justify-between">
                <span>Başlık Durumu:</span>
                <span className={`font-semibold ${report.metaAudit.titleCheck.status === "success" ? "text-emerald-600" : "text-amber-600"}`}>
                  {report.metaAudit.titleCheck.status === "success" ? "İdeal (Tam)" : "İyileştirilmeli"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Açıklama Uzunluğu:</span>
                <span className="font-semibold text-slate-700">{report.metaAudit.descriptionCheck.charCount || 0} krkt</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Anahtar Kelimeler:</span>
                <span className="font-semibold text-slate-700">{config.seo?.keywords ? config.seo.keywords.split(",").length : 0} adet</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab("meta")}
            className="mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Önerileri İncele</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Sub-Score Card 2: Image Alt Texts */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <span>Görsel Alt Metinleri</span>
              </span>
              <span className="text-xs font-bold font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                %{report.subScores.imageAlt}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mb-3">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${report.subScores.imageAlt}%` }}
              />
            </div>
            <div className="space-y-1.5 text-[11px] text-slate-600">
              <div className="flex items-center justify-between">
                <span>Toplam Görsel:</span>
                <span className="font-semibold text-slate-700">{report.imageAudit.totalImages} adet</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Alt Metni Olan:</span>
                <span className="font-semibold text-emerald-600">{report.imageAudit.imagesWithAlt} adet</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Eksik / Boş:</span>
                <span className={`font-semibold ${report.imageAudit.imagesMissingAlt > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                  {report.imageAudit.imagesMissingAlt} adet
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setActiveTab("images");
              setImageFilter("missing");
            }}
            className="mt-3 text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Eksikleri Görüntüle</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Sub-Score Card 3: Technical & Local Signals */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-sky-600" />
                <span>Teknik & Yerel SEO</span>
              </span>
              <span className="text-xs font-bold font-mono text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md">
                %{report.subScores.technical}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mb-3">
              <div
                className="bg-sky-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${report.subScores.technical}%` }}
              />
            </div>
            <div className="space-y-1.5 text-[11px] text-slate-600">
              <div className="flex items-center justify-between">
                <span>İletişim & NAP:</span>
                <span className="font-semibold text-emerald-600">Telefon & Adres Var</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Harita Entegrasyonu:</span>
                <span className={`font-semibold ${config.googleMapsEmbed ? "text-emerald-600" : "text-amber-600"}`}>
                  {config.googleMapsEmbed ? "Aktif (Google Maps)" : "Eksik"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Robots Direktifi:</span>
                <span className="font-semibold text-emerald-600">index, follow</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab("serp")}
            className="mt-3 text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Google Önizlemesini Aç</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="tab-auditor-images"
            onClick={() => setActiveTab("images")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "images"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <ImageIcon className="w-4 h-4 text-emerald-400" />
            <span>Görsel Alt Metinleri Denetimi</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              report.imageAudit.imagesMissingAlt > 0 ? "bg-rose-500 text-white" : "bg-emerald-500 text-white"
            }`}>
              {report.imageAudit.imagesMissingAlt > 0 ? `${report.imageAudit.imagesMissingAlt} Eksik` : "Tam"}
            </span>
          </button>

          <button
            type="button"
            id="tab-auditor-meta"
            onClick={() => setActiveTab("meta")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "meta"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Tag className="w-4 h-4 text-indigo-400" />
            <span>Meta Etiket İyileştirmeleri</span>
            {report.metaAudit.checks.some(c => c.status !== "success") && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-amber-500 text-white">
                Öneri Var
              </span>
            )}
          </button>

          <button
            type="button"
            id="tab-auditor-serp"
            onClick={() => setActiveTab("serp")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "serp"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Search className="w-4 h-4 text-sky-400" />
            <span>Google Arama Önizlemesi</span>
          </button>
        </div>

        {onOpenSeoTab && (
          <button
            type="button"
            onClick={onOpenSeoTab}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer"
          >
            <span>Detaylı SEO Editörüne Git</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </button>
        )}
      </div>

      {/* TAB 1: GÖRSEL ALT METİN DENETİMİ (IMAGE ALT TEXTS) */}
      {activeTab === "images" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Sub-toolbar: Search & Status Filters */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Görsellerde ara (hizmet, galeri...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-hidden"
                />
              </div>

              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl">
                <button
                  type="button"
                  onClick={() => setImageFilter("all")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    imageFilter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Tümü ({report.imageAudit.totalImages})
                </button>
                <button
                  type="button"
                  onClick={() => setImageFilter("missing")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    imageFilter === "missing" ? "bg-rose-500 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Eksik ({report.imageAudit.imagesMissingAlt})
                </button>
                <button
                  type="button"
                  onClick={() => setImageFilter("valid")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    imageFilter === "valid" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Dolu ({report.imageAudit.imagesWithAlt})
                </button>
              </div>
            </div>

            {report.imageAudit.imagesMissingAlt > 0 && (
              <button
                type="button"
                id="btn-autofix-images-in-tab"
                onClick={handleAutoFixAllImages}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-200 fill-emerald-200" />
                <span>Tüm Eksik Alt Metinleri Tek Tıkla Doldur</span>
              </button>
            )}
          </div>

          {/* Images Grid / List */}
          {filteredImages.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">Filtreye Uygun Görsel Bulunamadı</h3>
              <p className="text-xs text-slate-500 mt-1">
                {imageFilter === "missing"
                  ? "Tebrikler! Sitedeki tüm görsellerin açıklayıcı alt metinleri tanımlanmış."
                  : "Arama teriminizi değiştirebilir veya filtreyi temizleyebilirsiniz."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredImages.map((item) => {
                const currentDraftAlt = editingAltMap[item.id] !== undefined ? editingAltMap[item.id] : item.currentAlt;
                const isSaved = (item.currentAlt === currentDraftAlt) && item.hasAlt && !item.isGeneric;

                return (
                  <div
                    key={item.id}
                    id={`audited-img-card-${item.id}`}
                    className={`bg-white rounded-2xl p-4 border transition-all ${
                      item.hasAlt && !item.isGeneric
                        ? "border-slate-200/80 hover:border-slate-300"
                        : "border-amber-300/80 bg-amber-50/20"
                    } shadow-xs flex flex-col justify-between gap-3`}
                  >
                    {/* Top Row: Thumbnail + Info */}
                    <div className="flex items-start gap-3.5">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative group">
                        <img
                          src={item.url}
                          alt={item.currentAlt || "Görsel"}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = "none";
                          }}
                        />
                      </div>

                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 truncate">
                            {item.sectionLabel}
                          </span>
                          {item.hasAlt && !item.isGeneric ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                              <Check className="w-3 h-3 text-emerald-700" />
                              <span>Alt Metni Var</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full shrink-0">
                              <AlertCircle className="w-3 h-3 text-rose-700" />
                              <span>Alt Metin Eksik</span>
                            </span>
                          )}
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 truncate" title={item.title}>
                          {item.title}
                        </h4>

                        <div className="text-[11px] text-slate-500 truncate" title={item.url}>
                          {item.url}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row: Editable Alt Input + AI Suggestion Pill */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Aktif Alt Metni (alt attribute)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Görseli tarif eden anahtar kelimeli metin girin..."
                            value={currentDraftAlt}
                            onChange={(e) => {
                              const val = e.target.value;
                              setEditingAltMap(prev => ({ ...prev, [item.id]: val }));
                            }}
                            className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-hidden bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => handleApplySingleAlt(item, currentDraftAlt)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer shrink-0"
                          >
                            Kaydet
                          </button>
                        </div>
                      </div>

                      {/* Smart Suggestion Pill */}
                      <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/60 flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600">
                            <Sparkles className="w-3 h-3 text-indigo-500" />
                            <span>Önerilen SEO Alt Metni:</span>
                          </div>
                          <p className="text-xs text-slate-700 font-medium italic">
                            "{item.suggestedAlt}"
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleApplySingleAlt(item, item.suggestedAlt)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 shrink-0 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Zap className="w-3 h-3 text-indigo-600" />
                          <span>Uygula</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: META ETİKET İYİLEŞTİRMELERİ & GERÇEK ZAMANLI DENETİM */}
      {activeTab === "meta" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <MetaTagsAuditor
            config={config}
            onChange={onChange}
            onPreview={onPreview}
            onOpenPageSeo={onOpenSeoTab}
            onOpenGlobalSeo={onOpenSeoTab}
          />
        </div>
      )}

      {/* TAB 3: GOOGLE SERP PREVIEW */}
      {activeTab === "serp" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Google Canlı Arama Sonucu Simülasyonu</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kullanıcılar Google'da sizi arattığında sitenizin tam olarak nasıl görüneceğini test edin.
                </p>
              </div>

              {/* Device switcher */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl">
                <button
                  type="button"
                  onClick={() => setSerpDevice("desktop")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    serpDevice === "desktop" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Masaüstü</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSerpDevice("mobile")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    serpDevice === "mobile" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobil</span>
                </button>
              </div>
            </div>

            {/* Google Search Snippet Card */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 max-w-2xl">
              <div className="space-y-1.5">
                {/* URL Breadcrumb */}
                <div className="flex items-center gap-2 text-[12px] text-slate-700 font-sans">
                  <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-600 shrink-0">
                    G
                  </div>
                  <div className="flex items-center gap-1 text-slate-600">
                    <span className="font-semibold">{config.companyName || "Firma"}</span>
                    <span className="text-slate-400">›</span>
                    <span className="text-slate-500">https://{config.cloudflare?.customDomain || `${config.companyName.toLowerCase().replace(/\s+/g, '')}.com`}</span>
                  </div>
                </div>

                {/* Title */}
                <h4 className="text-base sm:text-lg font-normal text-blue-800 hover:underline cursor-pointer font-sans leading-tight">
                  {config.seo?.metaTitle || `${config.companyName} | ${config.city} ${config.sector}`}
                </h4>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed line-clamp-2">
                  {config.seo?.metaDescription || `${config.city} bölgesinde profesyonel ${config.sector.toLowerCase()} hizmeti sunuyoruz. Hemen iletişime geçin.`}
                </p>

                {/* Rich Snippets preview */}
                <div className="flex items-center gap-3 pt-2 text-[11px] text-slate-500 font-sans border-t border-slate-200/60 mt-2">
                  <span className="flex items-center gap-1 text-amber-600 font-bold">
                    <span>★★★★★</span>
                    <span className="text-slate-700">5.0 (120+ Yorum)</span>
                  </span>
                  <span>•</span>
                  <span>{config.phone || "7/24 Kesintisiz"}</span>
                  <span>•</span>
                  <span>{config.city || "Türkiye"}</span>
                </div>
              </div>
            </div>

            {/* OpenGraph Social Card Preview */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp & Sosyal Medya Paylaşım Kartı (Open Graph)</span>
                </span>
                <span className="text-[11px] text-slate-500">og:image & og:title</span>
              </div>

              <div className="max-w-sm rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
                <div className="h-44 bg-slate-100 overflow-hidden relative">
                  {config.seo?.ogImage || config.hero?.bgImage ? (
                    <img
                      src={config.seo?.ogImage || config.hero?.bgImage}
                      alt="OpenGraph Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-1">
                      <ImageIcon className="w-8 h-8" />
                      <span className="text-xs font-medium">Paylaşım görseli atanmamış</span>
                    </div>
                  )}
                </div>
                <div className="p-3.5 space-y-1 bg-slate-50/80">
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    {config.cloudflare?.customDomain || "websitesi.com"}
                  </div>
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {config.seo?.metaTitle || config.companyName}
                  </div>
                  <div className="text-[11px] text-slate-600 line-clamp-2">
                    {config.seo?.metaDescription || config.slogan}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
