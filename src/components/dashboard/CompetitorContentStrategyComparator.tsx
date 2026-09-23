import React, { useState, useMemo } from "react";
import {
  FileText,
  BarChart3,
  Layers,
  Sparkles,
  Target,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Download,
  Filter,
  Eye,
  ArrowRight,
  ShieldCheck,
  Zap,
  HelpCircle,
  Hash,
  Scale,
  Compass,
  Building2,
  PieChart,
  SlidersHorizontal,
  RefreshCw,
  Search,
  FileDown
} from "lucide-react";
import { SiteConfig } from "../../types";
import {
  generateCompetitorContentStrategyData,
  exportContentStrategyToCSV,
  CompetitorContentStrategyReport,
  TopTrafficPage,
  ContentPageType
} from "../../utils/competitorContentStrategyEngine";

export interface CompetitorContentStrategyComparatorProps {
  config: Partial<SiteConfig>;
  initialKeyword?: string;
  onNavigateTab?: (tab: string) => void;
  onOpenCustomReport?: () => void;
  onDownloadPdf?: () => void;
  className?: string;
}

export const CompetitorContentStrategyComparator: React.FC<CompetitorContentStrategyComparatorProps> = ({
  config,
  initialKeyword,
  onNavigateTab,
  onOpenCustomReport,
  onDownloadPdf,
  className = ""
}) => {
  const companyName = config.companyName || "Siteniz";
  const sector = config.sector || "Genel Hizmet";
  const city = config.city || "İstanbul";

  // Parse keywords from config
  const parsedKeywords = useMemo<string[]>(() => {
    const raw = config.seo?.keywords;
    let list: string[] = [];
    if (Array.isArray(raw)) {
      list = raw.map(k => String(k).trim()).filter(Boolean);
    } else if (typeof raw === "string" && raw.trim().length > 0) {
      list = raw.split(",").map(k => k.trim()).filter(Boolean);
    }
    if (list.length === 0) {
      list = [
        `${city} ${sector}`,
        `en yakın acil ${sector.toLowerCase()}`,
        `7/24 ${sector.toLowerCase()} fiyatları`
      ];
    }
    return list;
  }, [config.seo?.keywords, city, sector]);

  // Selected Target Keyword
  const [selectedKeyword, setSelectedKeyword] = useState<string>(
    initialKeyword || parsedKeywords[0] || `${city} ${sector}`
  );

  // Active View Tab
  const [activeTab, setActiveTab] = useState<"head_to_head" | "headings_tree" | "keyword_density" | "action_blueprint">("head_to_head");

  // Selected Page Type Filter
  const [selectedPageType, setSelectedPageType] = useState<"all" | ContentPageType>("all");

  // Expanded Page Accordion
  const [expandedPageId, setExpandedPageId] = useState<string | null>("comp-page-1");

  // Copied state
  const [copiedStatus, setCopiedStatus] = useState<string | null>(null);

  // Report Data generated from engine
  const report: CompetitorContentStrategyReport = useMemo(() => {
    return generateCompetitorContentStrategyData(config, selectedKeyword);
  }, [config, selectedKeyword]);

  // Filtered Top Pages
  const filteredPages = useMemo(() => {
    if (selectedPageType === "all") return report.topPages;
    return report.topPages.filter(p => p.pageType === selectedPageType);
  }, [report.topPages, selectedPageType]);

  // Copy Summary to Clipboard
  const handleCopySummary = () => {
    const summaryText = `=== ${companyName} - RAKİP İÇERİK STRATEJİSİ KIYASLAMA RAPORU ===
Hedef Kelime: ${report.activeKeyword} (${report.city} / ${report.sector})
Tarih: ${report.analyzedAt}

[1] GENEL METRİKLER:
- Toplam İncelenen Rakip Trafiği: ${report.executiveSummary.totalCompetitorTrafficAnalyzed.toLocaleString("tr-TR")} tekil ziyaretçi/ay
- Rakipler Ortalama Kelime Sayısı: ${report.executiveSummary.averageWordCount} kelime
- Sitenizin Kelime Sayısı: ${report.userSiteBenchmark.contentStructure.wordCount} kelime
- İçerik Derinliği Açığınız: ${report.executiveSummary.userWordCountGap} kelime
- Rakipler Ortalama H2 Başlık: ${report.executiveSummary.averageH2Count} adet
- Rakipler Ortalama Birincil KW Yoğunluğu: %${report.executiveSummary.averageKeywordDensityPct}

[2] EN ÇOK TRAFİK ÇEKEN RAKİP SAYFALARI:
${report.topPages.map((p, idx) => `${idx + 1}. [${p.pageTypeLabel}] ${p.pageTitle}
   Domain: ${p.domain} | Aylık Trafik: ${p.monthlyTraffic.toLocaleString("tr-TR")} (%${p.trafficSharePct})
   Kelime: ${p.contentStructure.wordCount} | H1: ${p.contentStructure.headings.h1Count} | H2: ${p.contentStructure.headings.h2Count} | H3: ${p.contentStructure.headings.h3Count}
   Soru Başlık Oranı: %${p.contentStructure.headings.questionHeadingsRatio} | KW Yoğunluğu: %${p.contentStructure.keywordDensity[0]?.densityPct || 2.0}
   Taktiksel Özet: ${p.tacticalSummary}`).join("\n\n")}

[3] STRATEJİK HEDEF REÇETESİ:
- Önerilen İdeal Kelime Sayısı: ${report.strategyBlueprint.recommendedWordCount.ideal} kelime
- Hedef H1: ${report.strategyBlueprint.recommendedHeadingHierarchy.targetH1}
- Zorunlu LSI Kavramlar: ${report.strategyBlueprint.targetKeywordDensityRules.mustIncludeConcepts.join(", ")}
- Zafer Fırsatı: ${report.strategyBlueprint.tacticalWinOpportunity}`;

    navigator.clipboard.writeText(summaryText);
    setCopiedStatus("Özet Panoya Kopyalandı!");
    setTimeout(() => setCopiedStatus(null), 3000);
  };

  // Export to CSV
  const handleExportCsv = () => {
    exportContentStrategyToCSV(report);
  };

  return (
    <div 
      id="competitor-content-strategy-comparator"
      className={`rounded-3xl bg-slate-900/95 border border-slate-800 shadow-2xl p-5 sm:p-7 text-white backdrop-blur-xl relative overflow-hidden transition-all ${className}`}
    >
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-600/10 via-indigo-600/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-cyan-600/10 via-purple-600/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* ===================================================================== */}
      {/* 1. HEADER & ACTION CONTROLS */}
      {/* ===================================================================== */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
              <FileText className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
                  İçerik Stratejisi Kıyaslayıcı
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                  <BarChart3 className="w-3 h-3 text-cyan-400" />
                  Rakiplerin En Çok Trafik Çeken Sayfaları
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Hiyerarşi &bull; Kelime Uzunluğu &bull; Anahtar Kelime Yoğunluğu
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Google arama motorunda en çok organik trafik çeken lider rakip sayfalarını tarar; <strong className="text-slate-200">başlık mimarisi (H1-H4)</strong>, <strong className="text-slate-200">içerik derinliği</strong> ve <strong className="text-slate-200">LSI anahtar kelime sıklığını</strong> sitenizle kafa kafaya kıyaslar.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {copiedStatus && (
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30 flex items-center gap-1.5 animate-fade-in">
              <Check className="w-3.5 h-3.5" />
              {copiedStatus}
            </span>
          )}

          <button
            type="button"
            onClick={handleCopySummary}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
            title="İçerik stratejisi özetini panoya kopyala"
          >
            <Copy className="w-3.5 h-3.5 text-cyan-400" />
            <span>Özeti Kopyala</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
            title="Kıyaslama verilerini CSV olarak indir"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>CSV İndir</span>
          </button>

          {onDownloadPdf && (
            <button
              type="button"
              id="btn-comparator-export-pdf"
              onClick={onDownloadPdf}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95 border border-emerald-400/30"
              title="Tüm Stratejik Analiz Raporunu Şirket Logolu PDF Olarak İndir"
            >
              <FileDown className="w-3.5 h-3.5 text-emerald-200" />
              <span>PDF Raporu Oluştur</span>
              <span className="hidden sm:inline-block text-[9px] px-1.5 py-0.5 rounded-full bg-white/20 text-white font-extrabold uppercase tracking-wider">
                Şirket Logolu
              </span>
            </button>
          )}

          {onOpenCustomReport && (
            <button
              type="button"
              onClick={onOpenCustomReport}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md ring-1 ring-white/20 active:scale-95"
              title="Özelleştirilebilir PDF Rapor Editörünü Aç"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-200" />
              <span>Raporu Özelleştir</span>
            </button>
          )}

          {onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab("ai-seo-content-assistant")}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 ring-2 ring-purple-400/30"
              title="AI SEO İçerik Asistanını Aç"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
              <span>AI İçerik Üret</span>
            </button>
          )}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. KEYWORD SELECTOR & EXECUTIVE 4-KPI SUMMARY */}
      {/* ===================================================================== */}
      <div className="relative z-10 my-5 space-y-4">
        {/* Keyword Switcher Pill Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/80">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-indigo-400" />
              Hedef Anahtar Kelime:
            </span>

            {parsedKeywords.map((kw) => {
              const isSelected = selectedKeyword === kw;
              return (
                <button
                  key={kw}
                  type="button"
                  onClick={() => setSelectedKeyword(kw)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm ring-1 ring-blue-300"
                      : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-700/70"
                  }`}
                >
                  {kw}
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-400 font-medium">
            Analiz: <strong className="text-slate-200">{report.city} &bull; {report.sector}</strong>
          </div>
        </div>

        {/* 4 Executive KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* KPI 1: Kelime Uzunluğu Farkı */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-blue-500/30 space-y-1">
            <div className="flex items-center justify-between text-xs text-blue-400 font-bold">
              <span className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-400" />
                İçerik Uzunluğu Açığı
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {report.executiveSummary.userWordCountGap} Kelime
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-black text-white">{report.userSiteBenchmark.contentStructure.wordCount}</span>
              <span className="text-xs text-slate-400">/ Rakip Ort. {report.executiveSummary.averageWordCount} kelime</span>
            </div>
            {/* Progress bar comparing user word count vs competitor average */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div 
                className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, Math.round((report.userSiteBenchmark.contentStructure.wordCount / report.executiveSummary.averageWordCount) * 100))}%` }}
              />
            </div>
          </div>

          {/* KPI 2: Başlık Hiyerarşisi & Soru Oranı */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-purple-500/30 space-y-1">
            <div className="flex items-center justify-between text-xs text-purple-400 font-bold">
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-400" />
                Hiyerarşi & Soru Oranı
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
                %64 Soru (PAA)
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-black text-white">{report.executiveSummary.averageH2Count}</span>
              <span className="text-xs text-slate-400">Ort. H2 Başlık / 12 H3 Soru</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Liderler soru-cevap formatıyla Google sıfırıncı sırayı fethediyor.
            </p>
          </div>

          {/* KPI 3: Anahtar Kelime Yoğunluğu */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 space-y-1">
            <div className="flex items-center justify-between text-xs text-cyan-400 font-bold">
              <span className="flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-cyan-400" />
                Anahtar Kelime Yoğunluğu
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                İdeal Aralık
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-black text-white">%{report.executiveSummary.averageKeywordDensityPct}</span>
              <span className="text-xs text-slate-400">/ Siteniz: %{report.userSiteBenchmark.contentStructure.keywordDensity[0]?.densityPct || 1.56}</span>
            </div>
            <p className="text-[10px] text-slate-400">
              %1.8 - %2.5 arası cezasız maksimum SERP sinyali sağlıyor.
            </p>
          </div>

          {/* KPI 4: Analiz Edilen Toplam Trafik */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 space-y-1">
            <div className="flex items-center justify-between text-xs text-emerald-400 font-bold">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Hedeflenen Pazar Trafiği
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Aylık Ziyaret
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-black text-white">{report.executiveSummary.totalCompetitorTrafficAnalyzed.toLocaleString("tr-TR")}</span>
              <span className="text-xs text-slate-400">İlk 3 Rakip Sayfası</span>
            </div>
            <p className="text-[10px] text-slate-400">
              İçerik açığı kapatıldığında kapılabilecek pazar payı: %42+.
            </p>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. MULTI-VIEW NAVIGATION BAR */}
      {/* ===================================================================== */}
      <div className="relative z-10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-2 rounded-2xl bg-slate-950/70 border border-slate-800/90 mb-5">
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("head_to_head")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "head_to_head"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-blue-300" />
            <span>Sayfa Röntgeni & Kafa Kafaya Kıyaslama</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("headings_tree")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "headings_tree"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-purple-300" />
            <span>Başlık Hiyerarşisi Ağacı (H1-H4)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("keyword_density")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "keyword_density"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Hash className="w-3.5 h-3.5 text-cyan-300" />
            <span>Kelime Yoğunluğu & Semantik LSI</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("action_blueprint")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "action_blueprint"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Trafiği Kapma Reçetesi (Blueprint)</span>
          </button>
        </div>

        {/* Filter by Page Type */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-bold whitespace-nowrap">Sayfa Türü:</span>
          <select
            value={selectedPageType}
            onChange={(e) => setSelectedPageType(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-300 font-bold focus:outline-none cursor-pointer"
          >
            <option value="all">Tüm Sayfalar ({report.topPages.length})</option>
            <option value="service_landing">Hizmet Açılış Sayfaları</option>
            <option value="pillar_guide">Sütun İçerik / Rehberler</option>
            <option value="local_hub">Semt / İlçe Hub Sayfaları</option>
          </select>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 4. TAB 1: HEAD-TO-HEAD TOP PAGES VIEW */}
      {/* ===================================================================== */}
      {activeTab === "head_to_head" && (
        <div className="relative z-10 space-y-5">
          {/* User Site Current Page Benchmark Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border-2 border-indigo-500/40 shadow-lg space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-indigo-500/20">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 text-xs font-black border border-indigo-500/40">
                  MEVCUT DURUMUNUZ
                </span>
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-400" />
                  {report.userSiteBenchmark.pageTitle}
                </h4>
              </div>
              <span className="text-xs font-mono text-cyan-400">{report.userSiteBenchmark.domain}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Kelime Sayısı</span>
                <span className="text-base font-black text-white">{report.userSiteBenchmark.contentStructure.wordCount} kelime</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Başlık Hiyerarşisi</span>
                <span className="text-base font-black text-indigo-300">
                  H1: {report.userSiteBenchmark.contentStructure.headings.h1Count} &bull; H2: {report.userSiteBenchmark.contentStructure.headings.h2Count} &bull; H3: {report.userSiteBenchmark.contentStructure.headings.h3Count}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Birincil KW Yoğunluğu</span>
                <span className="text-base font-black text-cyan-300">
                  %{report.userSiteBenchmark.contentStructure.keywordDensity[0]?.densityPct || 1.56}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">LSI Kapsam Oranı</span>
                <span className="text-base font-black text-emerald-300">
                  {report.userSiteBenchmark.contentStructure.lsiCoverage.filter(l => l.presentInUserSite).length} / {report.userSiteBenchmark.contentStructure.lsiCoverage.length} (%50)
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Okunabilirlik / CWV</span>
                <span className="text-base font-black text-emerald-400 font-mono">98/100 (Hızlı)</span>
              </div>
            </div>
          </div>

          {/* Competitor Top Performing Pages Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                Rakiplerin En Çok Trafik Çeken Sayfaları ({filteredPages.length})
              </h4>
              <span className="text-[11px] text-slate-400">
                Detayları görmek için kartı genişletin
              </span>
            </div>

            {filteredPages.map((page, idx) => {
              const isExpanded = expandedPageId === page.id;
              const primaryKw = page.contentStructure.keywordDensity.find(k => k.isPrimary);

              return (
                <div
                  key={page.id}
                  className={`rounded-2xl bg-slate-900/90 border transition-all ${
                    isExpanded
                      ? "border-blue-500/50 shadow-xl shadow-blue-950/30"
                      : "border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {/* Card Header (Clickable Accordion) */}
                  <div
                    onClick={() => setExpandedPageId(isExpanded ? null : page.id)}
                    className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                        idx === 0
                          ? "bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20"
                          : idx === 1
                          ? "bg-slate-300 text-slate-950 font-bold"
                          : "bg-amber-700 text-white font-bold"
                      }`}>
                        #{page.serpRank}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h5 className="text-sm font-black text-white hover:text-blue-300 transition-colors">
                            {page.pageTitle}
                          </h5>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            {page.pageTypeLabel}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                          <span className="font-bold text-slate-300">{page.competitorName}</span>
                          <span className="font-mono text-cyan-400 text-[11px]">{page.domain}</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Metric Pills & Expand Icon */}
                    <div className="flex flex-wrap items-center gap-3 self-end lg:self-center">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Aylık Trafik</span>
                        <span className="text-sm font-black text-emerald-400 font-mono">
                          {page.monthlyTraffic.toLocaleString("tr-TR")} (%{page.trafficSharePct})
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Kelime Derinliği</span>
                        <span className="text-sm font-black text-white">
                          {page.contentStructure.wordCount} kelime
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Hiyerarşi</span>
                        <span className="text-xs font-bold text-purple-300 font-mono">
                          {page.contentStructure.headings.h2Count} H2 / {page.contentStructure.headings.h3Count} H3
                        </span>
                      </div>

                      <div className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content Details */}
                  {isExpanded && (
                    <div className="px-4 pb-5 sm:px-5 border-t border-slate-800/80 pt-4 space-y-4">
                      {/* Tactical Summary */}
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-blue-500/20 text-xs text-slate-300 flex items-start gap-2">
                        <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-amber-200">Sayfa Taktik Analizi: </strong>
                          <span>{page.tacticalSummary}</span>
                        </div>
                      </div>

                      {/* 3 Columns: Heading Structure / Keyword Density / Media & CTA */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        {/* 1. Heading Hierarchy Tree */}
                        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                          <span className="text-[11px] font-black text-purple-400 uppercase tracking-wider block">
                            Başlık Hiyerarşisi (Hierarchy: {page.contentStructure.headings.hierarchyScore}/100)
                          </span>
                          <div className="space-y-1.5 text-[11px]">
                            <div className="p-1.5 rounded bg-slate-900 border border-purple-500/20 text-slate-200">
                              <span className="font-bold text-purple-400 mr-1.5">H1 (1 Adet):</span>
                              {page.contentStructure.headings.h1List[0]}
                            </div>
                            <div className="text-slate-300 space-y-1">
                              <span className="font-bold text-slate-400 block text-[10px]">Örnek H2 Başlıkları ({page.contentStructure.headings.h2Count} adet):</span>
                              {page.contentStructure.headings.h2List.slice(0, 3).map((h2, i) => (
                                <div key={i} className="pl-2 border-l-2 border-purple-500/40 text-slate-300">
                                  &bull; {h2}
                                </div>
                              ))}
                            </div>
                            <div className="pt-1 text-[10px] text-cyan-300 flex items-center justify-between">
                              <span>Soru / SSS Başlık Oranı:</span>
                              <span className="font-bold font-mono">%{page.contentStructure.headings.questionHeadingsRatio}</span>
                            </div>
                          </div>
                        </div>

                        {/* 2. Keyword Density & Semantics */}
                        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                          <span className="text-[11px] font-black text-cyan-400 uppercase tracking-wider block">
                            Anahtar Kelime Yoğunluğu
                          </span>
                          <div className="space-y-1.5 text-[11px]">
                            {page.contentStructure.keywordDensity.slice(0, 4).map((kw, i) => (
                              <div key={i} className="flex items-center justify-between p-1.5 rounded bg-slate-900 border border-slate-800">
                                <span className="text-slate-200 font-medium">{kw.term}</span>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-cyan-300 font-bold">%{kw.densityPct}</span>
                                  <span className="text-[9px] px-1 rounded bg-slate-800 text-slate-400">
                                    {kw.count} kez
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 3. Rich Media & Conversion CTAs */}
                        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                          <span className="text-[11px] font-black text-emerald-400 uppercase tracking-wider block">
                            Zengin Medya & Dönüşüm
                          </span>
                          <div className="space-y-1.5 text-[11px]">
                            <div className="flex items-center justify-between text-slate-300">
                              <span>Görsel Sayısı:</span>
                              <span className="font-bold text-white">{page.contentStructure.mediaMetrics.imageCount} adet</span>
                            </div>
                            <div className="flex items-center justify-between text-slate-300">
                              <span>Kıyaslama / Fiyat Tablosu:</span>
                              <span className="font-bold text-emerald-400">
                                {page.contentStructure.mediaMetrics.hasComparisonTable ? "Mevcut (Tablo Var)" : "Yok"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-slate-300">
                              <span>İnfografik / Video:</span>
                              <span className="font-bold text-cyan-300">
                                {page.contentStructure.mediaMetrics.hasInfographic ? "İnfografik Var" : "Yalnızca Görsel"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-slate-300">
                              <span>Dönüşüm CTA Butonları:</span>
                              <span className="font-bold text-amber-300">{page.contentStructure.conversionCta.ctaCount} adet</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. TAB 2: HEADING HIERARCHY TREE DEEP DIVE */}
      {/* ===================================================================== */}
      {activeTab === "headings_tree" && (
        <div className="relative z-10 space-y-4">
          <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                Başlık Hiyerarşisi (Heading Hierarchy) ve Semantik Mimari
              </h4>
              <p className="text-xs text-slate-300">
                Google algoritmaları için doğru başlık hiyerarşisi: Yalnızca tek 1 adet H1, bölüm başlıklarında 6-8 adet H2 ve Google PAA (Kullanıcılar Bunları da Sordu) sorularını karşılayan H3 alt başlıkları.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-purple-500/20 text-purple-300 text-xs font-black border border-purple-500/30 whitespace-nowrap">
              H1 &rarr; H2 &rarr; H3
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {report.topPages.map((page, idx) => (
              <div 
                key={page.id}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-black text-white">{page.competitorName}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-800 text-cyan-300 font-mono">
                      #{page.serpRank} Sıra
                    </span>
                  </div>

                  {/* H1 Tag */}
                  <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 space-y-1">
                    <span className="text-[10px] font-black text-purple-300 uppercase">H1 (Tekil Sayfa Başlığı)</span>
                    <p className="text-xs font-bold text-white leading-snug">{page.contentStructure.headings.h1List[0]}</p>
                  </div>

                  {/* H2 Tags */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      H2 Bölüm Başlıkları ({page.contentStructure.headings.h2Count} Adet):
                    </span>
                    <ul className="space-y-1 text-[11px] text-slate-300">
                      {page.contentStructure.headings.h2List.map((h2, i) => (
                        <li key={i} className="p-1.5 rounded bg-slate-950/80 border border-slate-800/80 flex items-start gap-1.5">
                          <span className="text-purple-400 font-bold shrink-0">{i + 1}.</span>
                          <span>{h2}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* H3 FAQ Questions */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                      H3 Soru & PAA Başlıkları ({page.contentStructure.headings.h3Count} Adet):
                    </span>
                    <ul className="space-y-1 text-[11px] text-slate-300">
                      {page.contentStructure.headings.h3List.map((h3, i) => (
                        <li key={i} className="text-[11px] text-slate-400 flex items-start gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                          <span>{h3}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Hiyerarşi Skoru:</span>
                  <span className="font-bold text-emerald-400">{page.contentStructure.headings.hierarchyScore} / 100</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 6. TAB 3: KEYWORD DENSITY & SEMANTIC LSI MATRIX */}
      {/* ===================================================================== */}
      {activeTab === "keyword_density" && (
        <div className="relative z-10 space-y-4">
          <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <Hash className="w-4 h-4 text-cyan-400" />
                Anahtar Kelime Yoğunluğu & Semantik LSI Kapsam Matrisi
              </h4>
              <p className="text-xs text-slate-300">
                Google, metin içindeki birincil anahtar kelimelerin aşırı kullanılmasını (keyword stuffing) cezalandırırken, konuyu derinlemesine kapsayan yan semantik kavramları (LSI) ödüllendirir.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 text-xs font-black border border-cyan-500/30">
              LSI Kapsamı
            </span>
          </div>

          {/* LSI Comparison Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">Semantik Konsept (LSI Terimi)</th>
                  <th className="p-3">SERP Önemi</th>
                  <th className="p-3 text-indigo-300">Sitenizde Var mı?</th>
                  <th className="p-3 text-slate-300">Lider Rakip (1. Sıra)</th>
                  <th className="p-3 text-slate-300">2. Rakip</th>
                  <th className="p-3 text-slate-300">3. Rakip</th>
                  <th className="p-3">Taktiksel Eylem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {report.strategyBlueprint.targetKeywordDensityRules.mustIncludeConcepts.map((concept, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-3 font-bold text-white flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      {concept}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        Kritik (%90+)
                      </span>
                    </td>
                    <td className="p-3 font-bold">
                      {idx < 2 ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Mevcut
                        </span>
                      ) : (
                        <span className="text-rose-400 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Eksik (Açık)
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-emerald-400 font-bold">✓ Mevcut</td>
                    <td className="p-3 text-emerald-400 font-bold">✓ Mevcut</td>
                    <td className="p-3 text-slate-400">{idx % 2 === 0 ? "✓ Mevcut" : "✕ Yok"}</td>
                    <td className="p-3 text-slate-300 text-[11px]">
                      {idx >= 2 ? "Sayfaya özel alt başlık ve paragraf eklenmeli." : "Mevcut konum korunmalı."}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 7. TAB 4: ACTION BLUEPRINT - RECOMMENDED CONTENT RECIPE */}
      {/* ===================================================================== */}
      {activeTab === "action_blueprint" && (
        <div className="relative z-10 space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-950/60 via-indigo-950/50 to-purple-950/60 border border-blue-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Lider Rakibin Trafiğini Kapma Reçetesi (Content Blueprint)
              </h4>
              <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-black border border-amber-500/30">
                #1 Sıra Hedefi
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {report.strategyBlueprint.tacticalWinOpportunity}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: Recommended Architecture */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-blue-500/30 space-y-3">
              <span className="text-xs font-black text-blue-300 uppercase tracking-wider block pb-2 border-b border-slate-800">
                1. Önerilen Sayfa Başlık & İçerik Mimarisi
              </span>

              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-blue-500/20 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block">Önerilen Hedef H1:</span>
                <p className="text-xs font-black text-white">{report.strategyBlueprint.recommendedHeadingHierarchy.targetH1}</p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 block">Önerilen 6 Adet H2 Bölümü:</span>
                <ul className="space-y-1 text-[11px] text-slate-300">
                  {report.strategyBlueprint.recommendedHeadingHierarchy.suggestedH2s.map((h2, i) => (
                    <li key={i} className="p-1.5 rounded bg-slate-950/60 border border-slate-800/80 flex items-start gap-1.5">
                      <span className="text-blue-400 font-bold shrink-0">{i + 1}.</span>
                      <span>{h2}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <span className="text-[10px] font-bold text-cyan-400 block">Önerilen 4 Adet H3 SSS (Sıkça Sorulan Sorular):</span>
                <ul className="space-y-1 text-[11px] text-slate-300">
                  {report.strategyBlueprint.recommendedHeadingHierarchy.suggestedH3Faqs.map((faq, i) => (
                    <li key={i} className="text-slate-400 flex items-start gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{faq}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right: Technical Specifications & Actions */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-indigo-500/30 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-xs font-black text-indigo-300 uppercase tracking-wider block pb-2 border-b border-slate-800">
                  2. İçerik Derinliği & Zengin Medya Kuralları
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Hedef Kelime Hacmi</span>
                    <span className="text-sm font-black text-emerald-400">{report.strategyBlueprint.recommendedWordCount.ideal} kelime</span>
                    <span className="text-[10px] text-slate-500 block">Min: {report.strategyBlueprint.recommendedWordCount.min} - Max: {report.strategyBlueprint.recommendedWordCount.max}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Birincil KW Yoğunluğu</span>
                    <span className="text-sm font-black text-cyan-400 font-mono">%{report.strategyBlueprint.targetKeywordDensityRules.primaryDensityTargetPct}</span>
                    <span className="text-[10px] text-slate-500 block">İdeal aralık: %1.8 - %2.3</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">En Az Görsel Adedi</span>
                    <span className="text-sm font-black text-white">{report.strategyBlueprint.mediaPlan.minimumImages}+ Görsel</span>
                    <span className="text-[10px] text-slate-500 block">WebP / Alt Etiketli</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Yapılandırılmış Veri</span>
                    <span className="text-sm font-black text-purple-400">FAQPage JSON-LD</span>
                    <span className="text-[10px] text-slate-500 block">Zengin Sonuç Desteği</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/20 space-y-1 text-xs">
                  <span className="text-[10px] font-black text-emerald-300 uppercase">Zorunlu Semantik Terimler:</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {report.strategyBlueprint.targetKeywordDensityRules.mustIncludeConcepts.map((c, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px]">
                        ✓ {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {onNavigateTab && (
                <div className="pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => onNavigateTab("ai-seo-content-assistant")}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all active:scale-98"
                  >
                    <Sparkles className="w-4 h-4 text-cyan-200" />
                    <span>Bu Reçete ile AI İçerik Asistanında Taslak Oluştur &rarr;</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
