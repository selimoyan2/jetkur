import React, { useState, useMemo } from "react";
import { SiteConfig, CustomerPanelTab } from "../../types";
import {
  compileBulkSeoPerformanceData,
  generateMasterBulkSeoCsv,
  generateMetaTagsOnlyCsv,
  generateContentGapsOnlyCsv,
  generateKeywordRankingsOnlyCsv,
  generateSeoHealthAuditOnlyCsv,
  downloadBulkSeoCsvFile,
  convertBulkSeoToTsv,
  BulkPageSeoPerformanceItem
} from "../../utils/bulkSeoPerformanceExporter";
import { slugify } from "../../utils/url";
import {
  FileSpreadsheet,
  Download,
  Copy,
  Check,
  Search,
  Filter,
  Layers,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Globe,
  Tag,
  FileText,
  Eye,
  Info,
  ArrowRight,
  HelpCircle
} from "lucide-react";

interface BulkSeoPerformanceExportWorkspaceProps {
  config: SiteConfig;
  onNavigateTab?: (tab: CustomerPanelTab) => void;
  onPreview?: () => void;
}

type ExportScope = "master" | "meta" | "content-gaps" | "rankings" | "audit";
type PageCategoryFilter = "all" | "home-about" | "service" | "product" | "blog" | "custom";
type GradeFilter = "all" | "aPlus" | "a" | "b" | "c";
type GapFilter = "all" | "has-gaps" | "optimized";

export const BulkSeoPerformanceExportWorkspace: React.FC<BulkSeoPerformanceExportWorkspaceProps> = ({
  config,
  onNavigateTab,
  onPreview
}) => {
  // 1. Data compilation
  const { items, summary } = useMemo(() => compileBulkSeoPerformanceData(config), [config]);

  // 2. State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<PageCategoryFilter>("all");
  const [selectedGrade, setSelectedGrade] = useState<GradeFilter>("all");
  const [selectedGap, setSelectedGap] = useState<GapFilter>("all");
  const [exportScope, setExportScope] = useState<ExportScope>("master");
  const [isExporting, setIsExporting] = useState(false);
  const [copiedTsv, setCopiedTsv] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [showDocumentation, setShowDocumentation] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 3. Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Category filter
      if (selectedCategory === "home-about" && !["home", "about", "contact", "services-index", "catalog-index", "blog-index"].includes(item.pageType)) {
        return false;
      }
      if (selectedCategory === "service" && item.pageType !== "service") return false;
      if (selectedCategory === "product" && item.pageType !== "product") return false;
      if (selectedCategory === "blog" && item.pageType !== "blog-post") return false;
      if (selectedCategory === "custom" && item.pageType !== "custom-page" && item.pageType !== "terms" && item.pageType !== "faq") return false;

      // Grade filter
      if (selectedGrade === "aPlus" && item.healthGrade !== "A+") return false;
      if (selectedGrade === "a" && item.healthGrade !== "A") return false;
      if (selectedGrade === "b" && item.healthGrade !== "B") return false;
      if (selectedGrade === "c" && item.healthGrade !== "C") return false;

      // Gap filter
      if (selectedGap === "has-gaps" && item.missingSections.length === 0 && item.competitorKeywordGaps.length === 0) return false;
      if (selectedGap === "optimized" && (item.missingSections.length > 0 || item.competitorKeywordGaps.length > 0)) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.pageTitle.toLowerCase().includes(q);
        const matchesMetaTitle = item.metaTitle.toLowerCase().includes(q);
        const matchesKeyword = item.primaryKeyword.toLowerCase().includes(q) || item.keywords.toLowerCase().includes(q);
        const matchesUrl = item.fullUrl.toLowerCase().includes(q) || item.slug.toLowerCase().includes(q);
        return matchesTitle || matchesMetaTitle || matchesKeyword || matchesUrl;
      }

      return true;
    });
  }, [items, selectedCategory, selectedGrade, selectedGap, searchQuery]);

  // 4. Download Trigger
  const handleTriggerDownload = (scopeToUse?: ExportScope) => {
    const scope = scopeToUse || exportScope;
    setIsExporting(true);

    setTimeout(() => {
      const companySlug = config.companyName ? slugify(config.companyName) : "site";
      const dateStr = new Date().toISOString().slice(0, 10);
      let csvContent = "";
      let filename = "";

      const itemsToExport = filteredItems.length > 0 ? filteredItems : items;

      switch (scope) {
        case "meta":
          csvContent = generateMetaTagsOnlyCsv(itemsToExport);
          filename = `${companySlug}-seo-meta-etiketleri-${dateStr}.csv`;
          break;
        case "content-gaps":
          csvContent = generateContentGapsOnlyCsv(itemsToExport);
          filename = `${companySlug}-seo-icerik-aciklari-content-gaps-${dateStr}.csv`;
          break;
        case "rankings":
          csvContent = generateKeywordRankingsOnlyCsv(itemsToExport);
          filename = `${companySlug}-seo-anahtar-kelime-siralamalari-${dateStr}.csv`;
          break;
        case "audit":
          csvContent = generateSeoHealthAuditOnlyCsv(itemsToExport);
          filename = `${companySlug}-seo-saglik-denetimi-hatalar-${dateStr}.csv`;
          break;
        case "master":
        default:
          csvContent = generateMasterBulkSeoCsv(itemsToExport, config);
          filename = `${companySlug}-toplu-seo-performans-master-rapor-${dateStr}.csv`;
          break;
      }

      downloadBulkSeoCsvFile(csvContent, filename);
      setIsExporting(false);
      showToast(`"${filename}" başarıyla oluşturuldu ve indirildi! 🚀`);
    }, 450);
  };

  // 5. Copy to Clipboard (TSV)
  const handleCopyClipboard = () => {
    const itemsToExport = filteredItems.length > 0 ? filteredItems : items;
    const tsv = convertBulkSeoToTsv(itemsToExport);
    navigator.clipboard.writeText(tsv);
    setCopiedTsv(true);
    setTimeout(() => setCopiedTsv(false), 2000);
    showToast(`${itemsToExport.length} sayfanın SEO performans verisi panoya kopyalandı! Excel veya Google E-Tablolar'a doğrudan yapıştırabilirsiniz (Ctrl+V). 📋`);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* TOAST FEEDBACK */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-xl shadow-2xl border border-slate-800 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. TOP HERO & VALUE PROPOSITION */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-7 shadow-xs relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-gradient-to-br from-emerald-100/40 via-blue-50/30 to-amber-50/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs font-bold">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Bulk SEO Performance Export</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200/70 text-blue-800 text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span>RFC 4180 & UTF-8 BOM</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200/70 text-amber-800 text-[11px] font-bold">
                <span>Excel & Google E-Tablolar Uyumlu</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              Toplu SEO Performans & Sağlık Dışa Aktarma Motoru
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Tüm site sayfalarınızın Meta etiketlerini (Title, Description, Canonical, OG), tespit edilen içerik açıklarını (Content Gaps), hedeflenen anahtar kelime Google sıralamalarını ve teknik SEO denetim sonuçlarını tek bir kapsamlı CSV raporunda dışa aktarın.
            </p>
          </div>

          {/* Quick Primary Actions */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
            <button
              type="button"
              id="bulk-seo-copy-clipboard-btn"
              onClick={handleCopyClipboard}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-all cursor-pointer border border-slate-200/60"
            >
              {copiedTsv ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
              <span>{copiedTsv ? "Kopyalandı!" : "E-Tabloya Kopyala (TSV)"}</span>
            </button>

            <button
              type="button"
              id="bulk-seo-master-download-btn"
              onClick={() => handleTriggerDownload("master")}
              disabled={isExporting}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-800 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-white" />
              <span>{isExporting ? "CSV Hazırlanıyor..." : "Kapsamlı Master CSV İndir"}</span>
            </button>
          </div>
        </div>

        {/* 2. EXECUTIVE METRICS CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 pt-6 border-t border-slate-100 text-xs">
          <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100/80 flex items-center justify-center text-blue-700 font-bold shrink-0">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500">Taranan Sayfalar</div>
              <div className="text-lg font-black text-slate-900">{summary.totalPages} Sayfa</div>
              <div className="text-[10px] text-slate-400">Tüm site rotaları</div>
            </div>
          </div>

          <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100/80 flex items-center justify-center text-emerald-700 font-bold shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500">Ortalama SEO Skoru</div>
              <div className="text-lg font-black text-emerald-700">%{summary.averageHealthScore} / 100</div>
              <div className="text-[10px] text-emerald-600 font-semibold">{summary.gradeBreakdown.aPlus + summary.gradeBreakdown.a} Sayfa A/A+</div>
            </div>
          </div>

          <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100/80 flex items-center justify-center text-amber-700 font-bold shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500">Tespit Edilen İçerik Açığı</div>
              <div className="text-lg font-black text-amber-800">{summary.totalContentGaps} Açık</div>
              <div className="text-[10px] text-amber-700 font-medium">Bölüm &amp; Kelime boşluğu</div>
            </div>
          </div>

          <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100/80 flex items-center justify-center text-purple-700 font-bold shrink-0">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500">Top 10 Google Kelime</div>
              <div className="text-lg font-black text-purple-900">{summary.top10RankedKeywordsCount} / {summary.totalPages} Sayfa</div>
              <div className="text-[10px] text-purple-600 font-medium">Ort. Pozisyon: #{summary.averageRank}</div>
            </div>
          </div>

          <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 flex items-center gap-3 col-span-2 sm:col-span-1">
            <div className="w-10 h-10 rounded-lg bg-indigo-100/80 flex items-center justify-center text-indigo-700 font-bold shrink-0">
              <Globe className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500">Aylık SERP Erişimi</div>
              <div className="text-lg font-black text-indigo-900">{summary.estimatedTotalMonthlySearchReach}</div>
              <div className="text-[10px] text-indigo-600 font-medium">Hedefli arama hacmi</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. EXPORT SCOPE SELECTOR & SPECIALIZED CSV DOWNLOADS */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Dışa Aktarma Kapsamı &amp; Özel CSV Dosyaları</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              İhtiyacınıza göre tüm parametreleri içeren ana raporu veya ilgili alt raporları indirebilirsiniz.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowDocumentation(!showDocumentation)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 self-start md:self-auto cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>{showDocumentation ? "Rehberi Gizle" : "CSV Sütun Açıklamaları Rehberi"}</span>
            {showDocumentation ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Documentation Drawer */}
        {showDocumentation && (
          <div className="mb-5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-3 animate-in fade-in duration-150">
            <div className="font-bold text-slate-900 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600" />
              <span>Bulk SEO Export CSV Dosyası Hangi Sütunları İçerir?</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-[11px] leading-relaxed">
              <div className="p-2.5 rounded-lg bg-white border border-slate-200/70">
                <div className="font-bold text-blue-900 mb-1">1. Meta Etiketleri &amp; Yapı</div>
                <p>Sayfa URL'si, Meta Title (uzunluk ve SERP uyum durumu), Meta Description, Hedef Anahtar Kelimeler, Canonical URL geçerliliği, Robots indeksleme izni, Open Graph (og:title, og:image) ve Schema.org JSON-LD türü.</p>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200/70">
                <div className="font-bold text-amber-900 mb-1">2. İçerik Açıkları (Content Gaps)</div>
                <p>Tahmini kelime sayısı, zayıf içerik tespiti (Thin Content &lt;300w), eksik SSS/yorum/CTA bölümleri, rakiplerin sıralandığı ancak sayfada olmayan kelimeler ve ilçe/bölge kalıp eksiklikleri.</p>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200/70">
                <div className="font-bold text-purple-900 mb-1">3. Anahtar Kelime &amp; Sıralama</div>
                <p>Sayfaya atanmış birincil anahtar kelime, güncel Google SERP sıralaması, önceki sıralama, sıralama yükseliş değişimi (+15 sıra), aylık arama hacmi, zorluk puanı ve kazanılan Google zengin snippet'ları.</p>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200/70">
                <div className="font-bold text-emerald-900 mb-1">4. SEO Sağlık Denetimi</div>
                <p>Sayfa bazlı SEO Sağlık Skoru (0-100), Denetim Notu (A+, A, B, C), başarıyla geçen kontroller listesi, tespit edilen kritik eksiklikler, uyarılar ve Anycast Edge/SSL teknik hız özeti.</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Cards for Scopes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Master */}
          <div
            onClick={() => setExportScope("master")}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
              exportScope === "master"
                ? "bg-emerald-50/50 border-emerald-500/80 shadow-xs ring-1 ring-emerald-500/20"
                : "bg-slate-50/60 border-slate-200 hover:border-slate-300"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Master Full Rapor</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  40+ Sütun
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Tüm meta etiketleri, içerik açıkları, sıralamalar ve denetim maddeleri tek tabloda.
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleTriggerDownload("master");
              }}
              className="mt-3 w-full py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>İndir (.csv)</span>
            </button>
          </div>

          {/* Meta Tags */}
          <div
            onClick={() => setExportScope("meta")}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
              exportScope === "meta"
                ? "bg-blue-50/50 border-blue-500/80 shadow-xs ring-1 ring-blue-500/20"
                : "bg-slate-50/60 border-slate-200 hover:border-slate-300"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-blue-600" />
                  <span>Meta &amp; Snippets</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                  15 Sütun
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Title, Description, Canonical URL, OG Social ve Robots direktifleri.
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleTriggerDownload("meta");
              }}
              className="mt-3 w-full py-1.5 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>İndir (.csv)</span>
            </button>
          </div>

          {/* Content Gaps */}
          <div
            onClick={() => setExportScope("content-gaps")}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
              exportScope === "content-gaps"
                ? "bg-amber-50/50 border-amber-500/80 shadow-xs ring-1 ring-amber-500/20"
                : "bg-slate-50/60 border-slate-200 hover:border-slate-300"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Content Gaps</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                  Fırsatlar
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Zayıf içerikler, eksik bölümler, rakip anahtar kelimeleri ve aksiyonlar.
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleTriggerDownload("content-gaps");
              }}
              className="mt-3 w-full py-1.5 px-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>İndir (.csv)</span>
            </button>
          </div>

          {/* Keyword Rankings */}
          <div
            onClick={() => setExportScope("rankings")}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
              exportScope === "rankings"
                ? "bg-purple-50/50 border-purple-500/80 shadow-xs ring-1 ring-purple-500/20"
                : "bg-slate-50/60 border-slate-200 hover:border-slate-300"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
                  <span>Sıralama (SERP)</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
                  Google Pos.
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Google sırası, aylık hacim, sıra hareketi (+/-) ve zengin sonuçlar.
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleTriggerDownload("rankings");
              }}
              className="mt-3 w-full py-1.5 px-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>İndir (.csv)</span>
            </button>
          </div>

          {/* SEO Health Audit */}
          <div
            onClick={() => setExportScope("audit")}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
              exportScope === "audit"
                ? "bg-teal-50/50 border-teal-500/80 shadow-xs ring-1 ring-teal-500/20"
                : "bg-slate-50/60 border-slate-200 hover:border-slate-300"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>Sağlık &amp; Hatalar</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-100 text-teal-800">
                  Teşhis
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Kritik hatalar, uyarılar, geçen kontroller ve teknik altyapı skoru.
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleTriggerDownload("audit");
              }}
              className="mt-3 w-full py-1.5 px-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>İndir (.csv)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. LIVE DATA MATRIX & INTERACTIVE PREVIEW TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        {/* Filter Controls Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="bulk-seo-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Sayfa adı, anahtar kelime, meta başlık veya URL ara..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-slate-50/50"
            />
          </div>

          {/* Filter Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as PageCategoryFilter)}
              className="text-xs px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">Tüm Sayfalar ({items.length})</option>
              <option value="home-about">Ana Sayfa &amp; Kurumsal</option>
              <option value="service">Hizmet Sayfaları</option>
              <option value="product">Ürün Kataloğu</option>
              <option value="blog">Blog Yazıları</option>
              <option value="custom">Özel Sayfalar</option>
            </select>

            {/* Health Grade Filter */}
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value as GradeFilter)}
              className="text-xs px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">Tüm Notlar</option>
              <option value="aPlus">Sadece A+ Notu</option>
              <option value="a">Sadece A Notu</option>
              <option value="b">Geliştirilmeli (B)</option>
              <option value="c">Kritik Eksik (C)</option>
            </select>

            {/* Gap Filter */}
            <select
              value={selectedGap}
              onChange={(e) => setSelectedGap(e.target.value as GapFilter)}
              className="text-xs px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="has-gaps">İçerik Açığı Olanlar</option>
              <option value="optimized">Tamamen Optimize Olanlar</option>
            </select>

            <span className="text-xs text-slate-500 font-medium px-1">
              Gösterilen: <strong className="text-slate-900 font-bold">{filteredItems.length}</strong> / {items.length}
            </span>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/90 text-slate-600 font-bold border-b border-slate-200">
                <th className="py-3 px-3.5 whitespace-nowrap">Sayfa &amp; URL</th>
                <th className="py-3 px-3.5 whitespace-nowrap min-w-[240px]">Meta Başlık &amp; Açıklama</th>
                <th className="py-3 px-3.5 whitespace-nowrap text-center">SEO Skoru</th>
                <th className="py-3 px-3.5 whitespace-nowrap min-w-[220px]">İçerik Açıkları (Content Gaps)</th>
                <th className="py-3 px-3.5 whitespace-nowrap min-w-[200px]">Hedef Kelime &amp; SERP Sırası</th>
                <th className="py-3 px-3.5 whitespace-nowrap text-right">Detay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <AlertTriangle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <div className="font-semibold text-slate-600">Aramanıza uygun sayfa bulunamadı.</div>
                    <div className="text-[11px] text-slate-400 mt-1">Filtreleri temizleyerek tekrar deneyin.</div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isExpanded = expandedRowId === item.pageId;

                  return (
                    <React.Fragment key={item.pageId}>
                      <tr className={`hover:bg-slate-50/60 transition-colors ${isExpanded ? "bg-emerald-50/30" : ""}`}>
                        {/* Page & URL */}
                        <td className="py-3 px-3.5 align-top">
                          <div className="font-bold text-slate-900 max-w-[190px] truncate" title={item.pageTitle}>
                            {item.pageTitle}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                              {item.pageTypeLabel}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 max-w-[120px] truncate" title={item.slug}>
                              {item.slug}
                            </span>
                          </div>
                        </td>

                        {/* Meta Tags */}
                        <td className="py-3 px-3.5 align-top">
                          <div className="space-y-1">
                            <div className="font-medium text-slate-800 line-clamp-1" title={item.metaTitle}>
                              {item.metaTitle}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                                item.metaTitleStatus.includes("Optimal")
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}>
                                {item.metaTitleLength} ch ({item.metaTitleStatus})
                              </span>
                              <span className="text-[10px] text-slate-400">
                                Canonical: {item.canonicalStatus}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 line-clamp-1" title={item.metaDescription}>
                              {item.metaDescription}
                            </div>
                          </div>
                        </td>

                        {/* SEO Health Score */}
                        <td className="py-3 px-3.5 align-top text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className={`text-sm font-black px-2 py-0.5 rounded-lg ${
                              item.healthScore >= 90
                                ? "bg-emerald-100 text-emerald-800"
                                : item.healthScore >= 75
                                ? "bg-blue-100 text-blue-800"
                                : item.healthScore >= 60
                                ? "bg-amber-100 text-amber-800"
                                : "bg-rose-100 text-rose-800"
                            }`}>
                              %{item.healthScore} ({item.healthGrade})
                            </span>
                            <span className="text-[10px] text-slate-400 mt-1">
                              {item.passedChecksCount} Başarılı / {item.criticalIssuesCount} Kritik
                            </span>
                          </div>
                        </td>

                        {/* Content Gaps */}
                        <td className="py-3 px-3.5 align-top">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                                ~{item.estimatedWordCount} Kelime
                              </span>
                              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                                item.contentDepthStatus.includes("İnce")
                                  ? "bg-rose-50 text-rose-700"
                                  : "bg-emerald-50 text-emerald-700"
                              }`}>
                                {item.contentDepthStatus}
                              </span>
                            </div>
                            {item.missingSections.length > 0 ? (
                              <div className="text-[11px] text-amber-800 font-medium line-clamp-1" title={item.missingSections.join(", ")}>
                                ⚠️ {item.missingSections[0]}
                              </div>
                            ) : (
                              <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                <span>İçerik bileşenleri tam</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Keyword Rankings */}
                        <td className="py-3 px-3.5 align-top">
                          <div className="space-y-1">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{item.primaryKeyword}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-black px-1.5 py-0.5 rounded bg-purple-100 text-purple-900">
                                #{item.currentRank}
                              </span>
                              <span className="text-[10px] font-bold text-emerald-600">
                                {item.rankMovement}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {item.searchVolume}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Detail Trigger */}
                        <td className="py-3 px-3.5 align-top text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setExpandedRowId(isExpanded ? null : item.pageId)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-all cursor-pointer"
                          >
                            <span>{isExpanded ? "Kapat" : "İncele"}</span>
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        </td>
                      </tr>

                      {/* EXPANDED ROW DETAIL DRAWER */}
                      {isExpanded && (
                        <tr className="bg-slate-50/70 border-b border-slate-200">
                          <td colSpan={6} className="p-4 sm:p-5">
                            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-xs">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                <div>
                                  <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                                    <span>{item.pageTitle} &mdash; Tam SEO Performans Matrisi</span>
                                  </div>
                                  <div className="text-[11px] text-slate-400 mt-0.5">
                                    URL: <a href={item.fullUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">{item.fullUrl} <ExternalLink className="w-2.5 h-2.5" /></a>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  {onNavigateTab && (
                                    <button
                                      type="button"
                                      onClick={() => onNavigateTab("page-seo")}
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-800 text-xs font-bold hover:bg-blue-100 transition-all cursor-pointer"
                                    >
                                      <span>Sayfa SEO Editöründe Düzenle</span>
                                      <ArrowRight className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                {/* Col 1: Meta Tags & Technical */}
                                <div className="space-y-2">
                                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                    <Tag className="w-3.5 h-3.5 text-blue-600" />
                                    <span>Meta &amp; Yapısal Direktifler</span>
                                  </div>
                                  <div className="space-y-1 text-[11px] text-slate-600">
                                    <div><strong>Meta Başlık:</strong> {item.metaTitle}</div>
                                    <div><strong>Meta Açıklama:</strong> {item.metaDescription}</div>
                                    <div><strong>Robots Direktifi:</strong> <code className="bg-slate-100 px-1 py-0.5 rounded">{item.robots}</code></div>
                                    <div><strong>Canonical Link:</strong> <code className="bg-slate-100 px-1 py-0.5 rounded break-all">{item.canonicalUrl}</code></div>
                                    <div><strong>Schema JSON-LD:</strong> <span className="font-semibold text-indigo-700">{item.schemaType}</span></div>
                                    <div><strong>OG Görseli:</strong> {item.ogImage ? <span className="text-emerald-700 font-semibold">Mevcut (Tanımlı)</span> : <span className="text-rose-600 font-semibold">Eksik</span>}</div>
                                  </div>
                                </div>

                                {/* Col 2: Content Gaps & Actions */}
                                <div className="space-y-2">
                                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                    <span>İçerik Açıkları &amp; Rakip Fırsatları</span>
                                  </div>
                                  <div className="space-y-1.5 text-[11px] text-slate-600">
                                    <div><strong>Tahmini Kelime Derinliği:</strong> ~{item.estimatedWordCount} Kelime</div>
                                    <div>
                                      <strong>Eksik Sayfa Bölümleri:</strong>
                                      <ul className="list-disc list-inside mt-0.5 text-amber-900">
                                        {item.missingSections.length > 0 ? (
                                          item.missingSections.map((s, i) => <li key={i}>{s}</li>)
                                        ) : (
                                          <li className="text-emerald-700 list-none">Kritik içerik bloğu eksiği yok.</li>
                                        )}
                                      </ul>
                                    </div>
                                    <div>
                                      <strong>Rakiplerde Olan Eksik Kelimeler:</strong>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {item.competitorKeywordGaps.map((k, i) => (
                                          <span key={i} className="px-1.5 py-0.5 bg-amber-50 text-amber-900 rounded border border-amber-200 text-[10px] font-medium">
                                            {k}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                    <div className="p-2 rounded bg-amber-50/60 border border-amber-200/80 text-[11px] text-amber-900">
                                      <strong>Öncelikli Aksiyon:</strong> {item.topContentAction}
                                    </div>
                                  </div>
                                </div>

                                {/* Col 3: Keyword Rankings & Health Checks */}
                                <div className="space-y-2">
                                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                    <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
                                    <span>Google Sıralama &amp; Denetim Raporu</span>
                                  </div>
                                  <div className="space-y-1.5 text-[11px] text-slate-600">
                                    <div><strong>Birincil Kelime:</strong> <span className="font-bold text-slate-900">{item.primaryKeyword}</span></div>
                                    <div><strong>Google Sırası:</strong> <span className="font-bold text-purple-900">#{item.currentRank}</span> (Önceki: #{item.previousRank} &rarr; {item.rankMovement})</div>
                                    <div><strong>Aylık Arama Hacmi:</strong> {item.searchVolume}</div>
                                    <div><strong>Kelime Zorluğu:</strong> {item.keywordDifficulty}</div>
                                    <div><strong>SERP Zengin Sonuçları:</strong> {item.serpFeatures.join(", ")}</div>
                                    <div>
                                      <strong>İkincil Sıralanan Kelimeler:</strong>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {item.secondaryKeywords.map((k, i) => (
                                          <span key={i} className="px-1.5 py-0.5 bg-purple-50 text-purple-900 rounded border border-purple-200 text-[10px] font-medium">
                                            {k}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Fast Action Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="text-xs text-slate-500">
            Toplam <strong>{filteredItems.length}</strong> sayfa filtrelendi. Dışa aktarma işlemi seçili sayfa kümesini otomatik olarak CSV formatına dönüştürür.
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => handleTriggerDownload(exportScope)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Seçili Listeyi İndir ({filteredItems.length} Sayfa)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
