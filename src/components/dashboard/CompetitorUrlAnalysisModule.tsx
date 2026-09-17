import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Globe,
  Search,
  Sparkles,
  Target,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
  FileText,
  Layers,
  Code2,
  ExternalLink,
  Plus,
  Sliders,
  TrendingUp,
  ShieldCheck,
  Award,
  BarChart2,
  ChevronDown,
  Info,
  Building2,
  Hash,
  Filter,
  CheckSquare
} from "lucide-react";
import { SiteConfig, CustomerPanelTab } from "../../types";
import {
  CompetitorUrlAnalysisResult,
  analyzeCompetitorUrlAgainstUser,
  SECTOR_COMPETITOR_PRESETS,
  cleanDomainFromUrl,
  KeywordGapComparisonItem
} from "../../utils/competitorUrlAnalyzerEngine";
import { CompetitorListManagerModal } from "./CompetitorListManagerModal";

export interface CompetitorUrlAnalysisModuleProps {
  siteConfig: SiteConfig;
  onUpdateSiteConfig?: (updated: SiteConfig) => void;
  onNavigateTab?: (tab: string) => void;
  initialCompetitorUrl?: string;
  className?: string;
}

type ActiveSubTab = "overview" | "content" | "keywords" | "features" | "action-plan";

export const CompetitorUrlAnalysisModule: React.FC<CompetitorUrlAnalysisModuleProps> = ({
  siteConfig,
  onUpdateSiteConfig,
  onNavigateTab,
  initialCompetitorUrl,
  className = ""
}) => {
  const activeSector = siteConfig.sector || "Oto Çekici & Kurtarıcı";
  const activeCity = siteConfig.city || "İstanbul";
  const userDomain = siteConfig.cloudflare?.customDomain || (siteConfig.cloudflare?.subdomain ? `${siteConfig.cloudflare?.subdomain}.hizliweb.site` : `${(siteConfig.companyName || "site").toLowerCase().replace(/[^a-z0-9]/g, "")}.com.tr`);

  // Initial competitor URL suggestion based on sector
  const defaultPreset = (SECTOR_COMPETITOR_PRESETS[activeSector] || SECTOR_COMPETITOR_PRESETS["Oto Çekici & Kurtarıcı"])[0];
  const startingUrl = initialCompetitorUrl || defaultPreset?.url || "https://istanbulotocekici.com.tr";
  
  const [competitorUrlInput, setCompetitorUrlInput] = useState<string>(startingUrl);
  const [activeUrl, setActiveUrl] = useState<string>(startingUrl);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<number>(0);
  const [activeSubTab, setActiveSubTab] = useState<ActiveSubTab>("overview");
  const [showCompetitorManagerModal, setShowCompetitorManagerModal] = useState<boolean>(false);
  
  // Keyword filtering & search
  const [keywordSearch, setKeywordSearch] = useState<string>("");
  const [intentFilter, setIntentFilter] = useState<string>("all");
  const [onlyGapsFilter, setOnlyGapsFilter] = useState<boolean>(true);

  // Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Analysis result state
  const [analysisResult, setAnalysisResult] = useState<CompetitorUrlAnalysisResult>(() => 
    analyzeCompetitorUrlAgainstUser(defaultPreset?.url || "https://istanbulotocekici.com.tr", siteConfig)
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Run analysis pipeline
  const runAnalysis = (urlToAnalyze: string) => {
    if (!urlToAnalyze.trim()) return;
    setIsScanning(true);
    setScanStep(1);

    const timer1 = setTimeout(() => setScanStep(2), 500);
    const timer2 = setTimeout(() => setScanStep(3), 1100);
    const timer3 = setTimeout(() => {
      const result = analyzeCompetitorUrlAgainstUser(urlToAnalyze, siteConfig);
      setAnalysisResult(result);
      setActiveUrl(urlToAnalyze);
      setIsScanning(false);
      setScanStep(0);
      showToast(`"${result.competitorProfile.name}" analizi tamamlandı!`);
    }, 1700);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  };

  // Re-run if siteConfig changes
  useEffect(() => {
    const updated = analyzeCompetitorUrlAgainstUser(activeUrl, siteConfig);
    setAnalysisResult(updated);
  }, [siteConfig]);

  // Handle single keyword addition to user's config
  const handleAddKeyword = (kw: string) => {
    if (!onUpdateSiteConfig) {
      navigator.clipboard?.writeText(kw);
      showToast(`"${kw}" panoya kopyalandı!`);
      return;
    }

    const currentKeywords = siteConfig.seo?.keywords || "";
    const list = currentKeywords.split(",").map(s => s.trim()).filter(Boolean);

    if (!list.some(k => k.toLowerCase() === kw.toLowerCase())) {
      list.unshift(kw);
      const updated: SiteConfig = {
        ...siteConfig,
        seo: {
          ...siteConfig.seo,
          keywords: list.join(", ")
        }
      };
      onUpdateSiteConfig(updated);
      showToast(`"${kw}" sitenizin SEO anahtar kelimelerine eklendi!`);
    } else {
      showToast(`"${kw}" zaten sitenizde mevcut.`);
    }
  };

  // Bulk add all keyword gaps
  const handleBulkAddGaps = () => {
    const gapsToAdd = analysisResult.keywordGaps.map(g => g.keyword);
    if (gapsToAdd.length === 0) {
      showToast("Eklenecek yeni anahtar kelime boşluğu bulunamadı.");
      return;
    }

    if (!onUpdateSiteConfig) {
      navigator.clipboard?.writeText(gapsToAdd.join(", "));
      showToast("Tüm eksik kelimeler panoya kopyalandı!");
      return;
    }

    const currentKeywords = siteConfig.seo?.keywords || "";
    const existingList = currentKeywords.split(",").map(s => s.trim()).filter(Boolean);
    const merged = Array.from(new Set([...gapsToAdd, ...existingList]));

    const updated: SiteConfig = {
      ...siteConfig,
      seo: {
        ...siteConfig.seo,
        keywords: merged.join(", ")
      }
    };

    onUpdateSiteConfig(updated);
    showToast(`${gapsToAdd.length} adet rakip anahtar kelimesi sitenize başarıyla aktarıldı!`);
  };

  // Copy full comparative report as markdown
  const handleCopyReport = () => {
    const r = analysisResult;
    const reportText = `
# RAKİP ANALİZ RAPORU: ${siteConfig.companyName} vs ${r.competitorProfile.name}
**Hedef URL:** ${r.analyzedUrl}
**Tarih:** ${r.analyzedAt}
**Sektör & Şehir:** ${activeCity} • ${activeSector}

## 1. GENEL METRİK KIYASLAMASI
- Sayfa Hızı: Siteniz (98/100) vs Rakip (${r.competitorProfile.scores.technicalSeoScore}/100)
- Tahmini Kelime Sayısı: Siteniz (${r.userProfile.estimatedWordCount}) vs Rakip (${r.competitorProfile.estimatedWordCount})
- Başlık Hiyerarşisi: Siteniz (%${r.userProfile.scores.headingHierarchyScore}) vs Rakip (%${r.competitorProfile.scores.headingHierarchyScore})
- Schema.org Yapısal Veri: Siteniz (LocalBusiness, AggregateRating) vs Rakip (${r.competitorProfile.schemaMarkup.hasFaqPage ? "LocalBusiness, FAQPage" : "Temel Şema"})

## 2. TESPİT EDİLEN ANAHTAR KELİME BOŞLUKLARI (GAP)
${r.keywordGaps.map((k, i) => `${i + 1}. ${k.keyword} [Hacim: ${k.monthlyVolume} | Niyet: ${k.searchIntent} | Fırsat Skoru: %${k.opportunityScore}]`).join("\n")}

## 3. STRATEJİK EYLEM ÖNERİLERİ
${r.strategicTakeaways.actionItems.map(a => `- [${a.priority}] ${a.title}: ${a.description}`).join("\n")}
    `.trim();

    navigator.clipboard?.writeText(reportText);
    setCopiedId("full-report");
    showToast("Kapsamlı kıyaslama raporu panoya kopyalandı!");
    setTimeout(() => setCopiedId(null), 3000);
  };

  // Filtered keywords list
  const displayKeywords = useMemo(() => {
    let list = onlyGapsFilter ? analysisResult.keywordGaps : [
      ...analysisResult.keywordGaps,
      ...analysisResult.sharedKeywords,
      ...analysisResult.userAdvantageKeywords
    ];

    if (keywordSearch.trim()) {
      const q = keywordSearch.toLowerCase();
      list = list.filter(k => k.keyword.toLowerCase().includes(q));
    }

    if (intentFilter !== "all") {
      list = list.filter(k => k.searchIntent === intentFilter);
    }

    return list;
  }, [analysisResult, onlyGapsFilter, keywordSearch, intentFilter]);

  const presetList = SECTOR_COMPETITOR_PRESETS[activeSector] || SECTOR_COMPETITOR_PRESETS["Oto Çekici & Kurtarıcı"];

  return (
    <div className={`space-y-6 ${className}`} id="competitor-url-analysis-module">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-cyan-500/40 flex items-center gap-3 text-sm font-semibold"
          >
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===================================================================== */}
      {/* 1. HERO CONTROLLER & DIRECT URL INPUT BAR */}
      {/* ===================================================================== */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 border border-indigo-900/60 shadow-2xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-black tracking-wide">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Canlı Rakip URL Ayrıştırıcı & Semantik Kıyaslama</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Doğrudan Rakip URL'si ile İçerik & Anahtar Kelime Kıyaslaması
            </h2>
            <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
              Herhangi bir rakip web sitesinin adresini girerek; sayfa meta etiketlerini, H1-H3 başlık hiyerarşisini,
              kelime yoğunluğunu ve sitenizde eksik olan <strong>yüksek hacimli anahtar kelime boşluklarını</strong> otomatik analiz edin.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              id="copy-comparison-report-btn"
              onClick={handleCopyReport}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              {copiedId === "full-report" ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Kopyalandı!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-400" />
                  <span>Raporu Kopyala (MD)</span>
                </>
              )}
            </button>

            <button
              type="button"
              id="bulk-add-gaps-header-btn"
              onClick={handleBulkAddGaps}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Eksik Kelimeleri Siteme Aktar ({analysisResult.keywordGaps.length})</span>
            </button>
          </div>
        </div>

        {/* URL Input Form */}
        <div className="bg-slate-900/90 p-4 sm:p-5 rounded-2xl border border-indigo-800/50 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Globe className="w-5 h-5 text-indigo-400" />
              </div>
              <input
                type="text"
                id="competitor-url-input"
                value={competitorUrlInput}
                onChange={(e) => setCompetitorUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    runAnalysis(competitorUrlInput);
                  }
                }}
                placeholder="https://rakip-web-sitesi.com veya rakipfirma.com.tr"
                className="w-full pl-12 pr-10 py-3.5 bg-slate-950 border-2 border-indigo-500/40 rounded-xl text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all"
              />
              {competitorUrlInput && (
                <button
                  type="button"
                  onClick={() => setCompetitorUrlInput("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="button"
              id="analyze-competitor-btn"
              onClick={() => runAnalysis(competitorUrlInput)}
              disabled={isScanning || !competitorUrlInput.trim()}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-sm font-black flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-200" />
                  <span>Sayfa Taranıyor...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 text-cyan-300" />
                  <span>Otomatik Analiz Et</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Preset Selector Chips for current sector */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{activeSector} Sektöründeki Örnek Rakipler:</span>
            </span>
            {presetList.map((preset) => {
              const isSelected = activeUrl === preset.url;
              return (
                <button
                  key={preset.url}
                  type="button"
                  onClick={() => {
                    setCompetitorUrlInput(preset.url);
                    runAnalysis(preset.url);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border cursor-pointer ${
                    isSelected
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/50 ring-1 ring-cyan-400/50"
                      : "bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white"
                  }`}
                  title={preset.note}
                >
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                  <span>{preset.name}</span>
                </button>
              );
            })}
          </div>

          {/* Live Scanning Visualizer */}
          {isScanning && (
            <div className="p-3 bg-slate-950/80 rounded-xl border border-cyan-500/30 text-xs space-y-2">
              <div className="flex items-center justify-between text-cyan-300 font-bold">
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  <span>{cleanDomainFromUrl(competitorUrlInput).hostname} taranıyor...</span>
                </span>
                <span>Adım {scanStep} / 3</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-full transition-all duration-500"
                  style={{ width: `${(scanStep / 3) * 100}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-400">
                {scanStep === 1 && "• DNS çözümlemesi yapılıyor ve SSL/TLS sertifikası doğrulanıyor..."}
                {scanStep === 2 && "• Title, Meta Description, H1/H2/H3 etiketleri ve sayfa kelime hacmi çıkarılıyor..."}
                {scanStep === 3 && "• Anahtar kelime boşlukları ve yapısal veri şeması sitenizle kıyaslanıyor..."}
              </div>
            </div>
          )}
        </div>

        {/* Top Head-to-Head Scoreboard Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* User Site Card */}
          <div className="bg-slate-900/90 border-2 border-emerald-500/40 rounded-2xl p-4 relative overflow-hidden">
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
              Sizin Siteniz
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mevcut Siteniz</div>
            <div className="text-lg font-black text-white truncate mt-1">{siteConfig.companyName || "Siteniz"}</div>
            <div className="text-xs text-slate-400 truncate font-mono">{userDomain}</div>

            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800 text-center">
              <div>
                <div className="text-[10px] text-slate-400 font-bold">Lighthouse Hız</div>
                <div className="text-base font-black text-emerald-400 font-mono">98/100</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold">Kelime Hacmi</div>
                <div className="text-base font-black text-slate-200 font-mono">~{analysisResult.userProfile.estimatedWordCount}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold">Teknik SEO</div>
                <div className="text-base font-black text-cyan-400 font-mono">%98</div>
              </div>
            </div>
          </div>

          {/* Versus Visual Center Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center font-black text-indigo-300 text-sm">
              VS
            </div>
            <div className="text-xs font-bold text-slate-300">
              {analysisResult.keywordGaps.length} Kritik Anahtar Kelime Boşluğu
            </div>
            <div className="text-[11px] text-slate-400 max-w-xs">
              Siteniz <span className="text-emerald-400 font-bold">hız ve teknik altyapıda</span> üstünken; rakip <span className="text-amber-400 font-bold">kelime derinliği</span> ile rekabet ediyor.
            </div>
          </div>

          {/* Analyzed Competitor Card */}
          <div className="bg-slate-900/90 border-2 border-indigo-500/40 rounded-2xl p-4 relative overflow-hidden">
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
              İncelenen Rakip
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Taranan Rakip</div>
            <div className="text-lg font-black text-white truncate mt-1">{analysisResult.competitorProfile.name}</div>
            <div className="text-xs text-slate-400 truncate font-mono">{analysisResult.competitorProfile.domain}</div>

            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800 text-center">
              <div>
                <div className="text-[10px] text-slate-400 font-bold">Lighthouse Hız</div>
                <div className="text-base font-black text-rose-400 font-mono">
                  {analysisResult.competitorProfile.scores.technicalSeoScore}/100
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold">Kelime Hacmi</div>
                <div className="text-base font-black text-slate-200 font-mono">~{analysisResult.competitorProfile.estimatedWordCount}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold">Genel Skor</div>
                <div className="text-base font-black text-amber-400 font-mono">
                  %{analysisResult.competitorProfile.scores.overallScore}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. SUB-NAVIGATION TABS */}
      {/* ===================================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            id="subtab-overview-btn"
            onClick={() => setActiveSubTab("overview")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === "overview"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Genel Kıyaslama Özeti</span>
          </button>

          <button
            type="button"
            id="subtab-keywords-btn"
            onClick={() => setActiveSubTab("keywords")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === "keywords"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-blue-700 hover:bg-blue-50"
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            <span>Anahtar Kelime Kıyaslaması ({analysisResult.keywordGaps.length} Fırsat)</span>
          </button>

          <button
            type="button"
            id="subtab-content-btn"
            onClick={() => setActiveSubTab("content")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === "content"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:text-indigo-700 hover:bg-indigo-50"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>İçerik & Başlık Hiyerarşisi (H1-H3)</span>
          </button>

          <button
            type="button"
            id="subtab-features-btn"
            onClick={() => setActiveSubTab("features")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === "features"
                ? "bg-teal-600 text-white shadow-xs"
                : "text-slate-600 hover:text-teal-700 hover:bg-teal-50"
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Sayfa Bölümleri & Özellik Matrisi</span>
          </button>

          <button
            type="button"
            id="subtab-action-plan-btn"
            onClick={() => setActiveSubTab("action-plan")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === "action-plan"
                ? "bg-amber-600 text-white shadow-xs"
                : "text-slate-600 hover:text-amber-700 hover:bg-amber-50"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Stratejik Eylem Planı</span>
          </button>
        </div>

        <div className="text-[11px] font-bold text-slate-500 hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-xl border border-slate-200">
          <Globe className="w-3 h-3 text-indigo-600" />
          <span>Analiz Edilen: {analysisResult.competitorProfile.domain}</span>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. SUBTAB: 1. OVERVIEW & METRIC MATRIX */}
      {/* ===================================================================== */}
      {activeSubTab === "overview" && (
        <div className="space-y-6">
          {/* Side-by-Side Metric Comparison Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-indigo-600" />
                  <span>Birebir Sayfa & Teknik Kıyaslama Matrisi</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Her iki sitenin Core Web Vitals açılış hızı, içerik uzunluğu ve yapısal veri optimizasyonu
                </p>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                Canlı Karşılaştırma
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <th className="p-3.5">Kıyaslanan Metrik</th>
                    <th className="p-3.5 text-emerald-800 bg-emerald-50/50">
                      Siteniz ({siteConfig.companyName || "Siteniz"})
                    </th>
                    <th className="p-3.5 text-indigo-800 bg-indigo-50/50">
                      Rakip ({analysisResult.competitorProfile.name})
                    </th>
                    <th className="p-3.5">Karşılaştırma Farkı & Avantaj</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {analysisResult.metricsComparison.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900">{m.metric}</td>
                      <td className="p-3.5 font-semibold text-emerald-700 bg-emerald-50/20">
                        {m.userValue}
                      </td>
                      <td className="p-3.5 font-semibold text-slate-700 bg-indigo-50/20">
                        {m.competitorValue}
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                          m.winner === "user"
                            ? "bg-emerald-100 text-emerald-800"
                            : m.winner === "competitor"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-700"
                        }`}>
                          {m.winner === "user" && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {m.winner === "competitor" && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                          <span>{m.diffText}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Two-Column Strength & Vulnerability Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Competitor Strengths (What they do well) */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">Rakibin Öne Çıkan Güçlü Yönleri</h4>
                  <p className="text-[11px] text-slate-500">Bu alanları sitenize uyarlayarak pazar payı kazanabilirsiniz</p>
                </div>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                {analysisResult.competitorProfile.keyStrengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/50">
                    <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Competitor Vulnerabilities (Where you can beat them) */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">Rakibin Zayıf Olduğu Noktalar (Açıklar)</h4>
                  <p className="text-[11px] text-slate-500">Google SERP'te bu zaaflardan faydalanarak öne geçebilirsiniz</p>
                </div>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                {analysisResult.competitorProfile.vulnerabilities.map((vuln, idx) => (
                  <li key={idx} className="flex items-start gap-2 p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/50">
                    <Zap className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{vuln}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. SUBTAB: 2. KEYWORD COMPARISON & GAP OPPORTUNITIES */}
      {/* ===================================================================== */}
      {activeSubTab === "keywords" && (
        <div className="space-y-5">
          {/* Filter & Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={keywordSearch}
                  onChange={(e) => setKeywordSearch(e.target.value)}
                  placeholder="Kelimelerde ara..."
                  className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <select
                value={intentFilter}
                onChange={(e) => setIntentFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
              >
                <option value="all">Tüm Arama Niyetleri</option>
                <option value="Acil / Yerel">Acil / Yerel Niyet</option>
                <option value="Ticari">Ticari Niyet</option>
                <option value="Fiyat">Fiyat Odaklı</option>
                <option value="Bilgi">Bilgilendirici</option>
              </select>

              <button
                type="button"
                onClick={() => setOnlyGapsFilter(!onlyGapsFilter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  onlyGapsFilter
                    ? "bg-rose-50 text-rose-700 border-rose-300"
                    : "bg-slate-100 text-slate-600 border-slate-200"
                }`}
              >
                {onlyGapsFilter ? "✓ Yalnızca Eksik Kelimeler (Boşluk)" : "Tüm Kelimeler (Ortak + Eksik)"}
              </button>
            </div>

            <button
              type="button"
              id="bulk-add-gaps-tab-btn"
              onClick={handleBulkAddGaps}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tüm Eksik Kelimeleri Siteme Ekle ({analysisResult.keywordGaps.length})</span>
            </button>
          </div>

          {/* Keywords Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <th className="p-3.5">Anahtar Kelime</th>
                    <th className="p-3.5">Arama Niyeti</th>
                    <th className="p-3.5">Aylık Aranma Hacmi</th>
                    <th className="p-3.5">SEO Zorluk</th>
                    <th className="p-3.5">Fırsat Skoru</th>
                    <th className="p-3.5">Durum (Siteniz vs Rakip)</th>
                    <th className="p-3.5 text-right">Eylem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {displayKeywords.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span>{item.keyword}</span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          item.searchIntent === "Acil / Yerel"
                            ? "bg-rose-100 text-rose-800"
                            : item.searchIntent === "Fiyat"
                            ? "bg-amber-100 text-amber-800"
                            : item.searchIntent === "Ticari"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-slate-100 text-slate-800"
                        }`}>
                          {item.searchIntent}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-600">{item.monthlyVolume}</td>
                      <td className="p-3.5">
                        <span className={`font-semibold ${
                          item.difficulty === "Kolay" ? "text-emerald-600" :
                          item.difficulty === "Orta" ? "text-amber-600" : "text-rose-600"
                        }`}>
                          {item.difficulty}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-indigo-700">%{item.opportunityScore}</span>
                          <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-indigo-600 h-full rounded-full"
                              style={{ width: `${item.opportunityScore}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        {item.isGap ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[11px]">
                            <AlertTriangle className="w-3 h-3 text-rose-500" />
                            <span>Rakipte Var, Sizde Eksik</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            <span>Sitenizde Mevcut</span>
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleAddKeyword(item.keyword)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all active:scale-95 cursor-pointer inline-flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Siteye Ekle</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {displayKeywords.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        Filtreye uygun anahtar kelime bulunamadı.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. SUBTAB: 3. CONTENT & HEADING HIERARCHY (H1-H3) */}
      {/* ===================================================================== */}
      {activeSubTab === "content" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Side */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">Sitenizin İçerik Yapısı</h4>
                  <div className="text-[11px] text-slate-500 font-mono">{userDomain}</div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Sizin Siteniz
              </span>
            </div>

            {/* Meta Title */}
            <div className="space-y-1">
              <div className="text-[11px] font-bold text-slate-500 flex items-center justify-between">
                <span>Sayfa Meta Başlığı (&lt;title&gt;)</span>
                <span className="text-emerald-600 font-mono">{analysisResult.userProfile.metaTitleLength} Karakter (İdeal)</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800">
                {analysisResult.userProfile.metaTitle}
              </div>
            </div>

            {/* Meta Description */}
            <div className="space-y-1">
              <div className="text-[11px] font-bold text-slate-500 flex items-center justify-between">
                <span>Meta Açıklaması (&lt;meta description&gt;)</span>
                <span className="text-emerald-600 font-mono">{analysisResult.userProfile.metaDescriptionLength} Karakter</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                {analysisResult.userProfile.metaDescription}
              </div>
            </div>

            {/* Headings Hierarchy */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-indigo-600" />
                <span>Başlık Hiyerarşisi (H1 - H3)</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-100">
                  <span className="px-1.5 py-0.5 rounded bg-indigo-600 text-white font-mono text-[10px] font-bold mr-2">H1</span>
                  <span className="font-bold text-indigo-950">{analysisResult.userProfile.headings.h1[0]}</span>
                </div>

                <div className="space-y-1 pl-3 border-l-2 border-slate-200">
                  {analysisResult.userProfile.headings.h2.map((h2, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-slate-50 text-slate-800">
                      <span className="font-mono text-[10px] text-slate-500 font-bold mr-1.5">H2:</span>
                      <span>{h2}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Competitor Side */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">{analysisResult.competitorProfile.name}</h4>
                  <div className="text-[11px] text-slate-500 font-mono">{analysisResult.competitorProfile.domain}</div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                İncelenen Rakip
              </span>
            </div>

            {/* Meta Title */}
            <div className="space-y-1">
              <div className="text-[11px] font-bold text-slate-500 flex items-center justify-between">
                <span>Sayfa Meta Başlığı (&lt;title&gt;)</span>
                <span className="font-mono text-slate-600">{analysisResult.competitorProfile.metaTitleLength} Karakter</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800">
                {analysisResult.competitorProfile.metaTitle}
              </div>
            </div>

            {/* Meta Description */}
            <div className="space-y-1">
              <div className="text-[11px] font-bold text-slate-500 flex items-center justify-between">
                <span>Meta Açıklaması (&lt;meta description&gt;)</span>
                <span className="font-mono text-slate-600">{analysisResult.competitorProfile.metaDescriptionLength} Karakter</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                {analysisResult.competitorProfile.metaDescription}
              </div>
            </div>

            {/* Headings Hierarchy */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-indigo-600" />
                <span>Rakibin Başlık Hiyerarşisi (H1 - H3)</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-100">
                  <span className="px-1.5 py-0.5 rounded bg-indigo-600 text-white font-mono text-[10px] font-bold mr-2">H1</span>
                  <span className="font-bold text-indigo-950">{analysisResult.competitorProfile.headings.h1[0]}</span>
                </div>

                <div className="space-y-1 pl-3 border-l-2 border-slate-200">
                  {analysisResult.competitorProfile.headings.h2.map((h2, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-slate-50 text-slate-800">
                      <span className="font-mono text-[10px] text-slate-500 font-bold mr-1.5">H2:</span>
                      <span>{h2}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 6. SUBTAB: 4. PAGE SECTIONS & FEATURE MATRIX */}
      {/* ===================================================================== */}
      {activeSubTab === "features" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-base font-black text-slate-900">
              Sayfa Bölümleri ve Dönüşüm Özellik Matrisi
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Rakip sitede yer alan fakat sitenizde eksik olabilecek kritik işlev ve bölümler
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {analysisResult.contentFeatureMatrix.map((feat, idx) => (
              <div key={idx} className="p-5 hover:bg-slate-50/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900">{feat.featureName}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                      {feat.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      feat.importance === "Kritik"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      {feat.importance} Öncelik
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{feat.description}</p>
                  <p className="text-xs font-semibold text-indigo-900 bg-indigo-50/80 p-2 rounded-lg">
                    💡 <strong>Öneri:</strong> {feat.recommendation}
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-center">
                    <div className="text-[10px] font-bold text-slate-400">Siteniz</div>
                    <div className={`mt-1 font-bold text-xs inline-flex items-center gap-1 ${
                      feat.userHas ? "text-emerald-600" : "text-slate-400"
                    }`}>
                      {feat.userHas ? <CheckCircle2 className="w-4 h-4" /> : "Yok"}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-[10px] font-bold text-slate-400">Rakip</div>
                    <div className={`mt-1 font-bold text-xs inline-flex items-center gap-1 ${
                      feat.competitorHas ? "text-indigo-600" : "text-slate-400"
                    }`}>
                      {feat.competitorHas ? <CheckCircle2 className="w-4 h-4" /> : "Yok"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 7. SUBTAB: 5. STRATEGIC ACTION PLAN & BRIEF */}
      {/* ===================================================================== */}
      {activeSubTab === "action-plan" && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white p-6 rounded-3xl border border-indigo-800/60 shadow-xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Rakibi Geçme Eylem Planı</span>
            </div>
            <h3 className="text-xl font-black text-white">{analysisResult.strategicTakeaways.headline}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {analysisResult.strategicTakeaways.actionItems.map((item, idx) => (
                <div key={idx} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                      {item.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      item.priority === "Kritik"
                        ? "bg-rose-500/20 text-rose-300"
                        : "bg-amber-500/20 text-amber-300"
                    }`}>
                      {item.priority}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white">{item.title}</div>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Headings to Add */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Sitenize Eklenmesi Tavsiye Edilen Odak H2 / H3 Başlıkları</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {analysisResult.strategicTakeaways.suggestedHeadingsToAdd.map((heading, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs">
                  <span className="font-semibold text-slate-800">"{heading}"</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(heading);
                      showToast(`"${heading}" panoya kopyalandı!`);
                    }}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-200/50 transition-colors"
                    title="Kopyala"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
