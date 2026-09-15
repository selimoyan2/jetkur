import React, { useState, useEffect, useCallback } from "react";
import { 
  SiteConfig, 
  AiMetaOptimizerResult, 
  MetaOptimizationProposal,
  PageMetaOptimization 
} from "../../types";
import { 
  extractSiteKeywords, 
  generateFallbackMetaOptimization,
  applyOptimizationToSiteConfig,
  matchKeywordsInText 
} from "../../utils/aiMetaOptimizerEngine";
import { 
  Sparkles, 
  Check, 
  Copy, 
  RotateCcw, 
  Search, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  Eye, 
  Smartphone, 
  Monitor, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  RefreshCw, 
  Wand2, 
  Layers, 
  ArrowRight,
  Info,
  Tag,
  Building2,
  MapPin,
  CheckCheck,
  Edit3,
  SlidersHorizontal,
  ChevronDown
} from "lucide-react";

export interface AiMetaOptimizerProps {
  config: SiteConfig;
  onChange: (updatedConfig: SiteConfig) => void;
  onClose?: () => void;
  onNavigateTab?: (tab: string) => void;
  autoRunOnMount?: boolean;
  isModal?: boolean;
}

export const AiMetaOptimizer: React.FC<AiMetaOptimizerProps> = ({
  config,
  onChange,
  onClose,
  onNavigateTab,
  autoRunOnMount = false,
  isModal = false
}) => {
  const [result, setResult] = useState<AiMetaOptimizerResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [activeViewMode, setActiveViewMode] = useState<"desktop" | "mobile">("desktop");
  const [activeTab, setActiveTab] = useState<"proposals" | "pages" | "custom">("proposals");
  
  // Interactive preview state (defaults to current site config)
  const [previewTitle, setPreviewTitle] = useState<string>(config.seo?.metaTitle || `${config.companyName} | ${config.sector} - ${config.city}`);
  const [previewDesc, setPreviewDesc] = useState<string>(
    config.seo?.metaDescription || `${config.city} bölgesinde profesyonel ${config.sector} hizmetleri. Hızlı randevu ve uygun fiyat teklifi için hemen arayın.`
  );

  // Undo / Revert snapshot
  const [previousConfigSnapshot, setPreviousConfigSnapshot] = useState<{ title: string; desc: string } | null>(null);
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);
  const [copiedFieldId, setCopiedFieldId] = useState<string | null>(null);

  // Custom prompt / keyword adjustment
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [customKeywords, setCustomKeywords] = useState<string[]>(() => extractSiteKeywords(config));
  const [newKeywordInput, setNewKeywordInput] = useState<string>("");

  // Inline editing state for a proposal
  const [editingProposalId, setEditingProposalId] = useState<string | null>(null);
  const [editProposalTitle, setEditProposalTitle] = useState<string>("");
  const [editProposalDesc, setEditProposalDesc] = useState<string>("");

  // Run generation via Gemini backend endpoint (with graceful fallback)
  const handleGenerateOptimizedMetadata = useCallback(async (customPromptOverride?: string) => {
    setIsLoading(true);
    setErrorNotice(null);

    const promptToUse = customPromptOverride !== undefined ? customPromptOverride : customPrompt;

    try {
      const response = await fetch("/api/ai-meta-optimizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config,
          companyName: config.companyName,
          industry: config.sector,
          city: config.city,
          keywords: customKeywords,
          currentTitle: config.seo?.metaTitle,
          currentDescription: config.seo?.metaDescription,
          customPrompt: promptToUse
        })
      });

      if (!response.ok) {
        throw new Error(`API error (${response.status})`);
      }

      const resData = await response.json();
      if (resData.success && resData.data) {
        setResult(resData.data);
        // Default preview to the top high-ctr proposal
        if (resData.data.proposals && resData.data.proposals.length > 0) {
          setPreviewTitle(resData.data.proposals[0].title);
          setPreviewDesc(resData.data.proposals[0].description);
        }
      } else {
        throw new Error("Invalid payload format");
      }
    } catch (err: any) {
      console.warn("Falling back to local AI meta-optimizer engine:", err);
      // Fallback local engine
      const fallback = generateFallbackMetaOptimization(config, customKeywords, "all");
      setResult(fallback);
      if (fallback.proposals.length > 0) {
        setPreviewTitle(fallback.proposals[0].title);
        setPreviewDesc(fallback.proposals[0].description);
      }
    } finally {
      setIsLoading(false);
    }
  }, [config, customKeywords, customPrompt]);

  // Initial load
  useEffect(() => {
    if (!result) {
      handleGenerateOptimizedMetadata();
    }
  }, [handleGenerateOptimizedMetadata, result]);

  // Auto-run if requested
  useEffect(() => {
    if (autoRunOnMount && !isLoading) {
      handleGenerateOptimizedMetadata();
    }
  }, [autoRunOnMount]);

  // Apply selected metadata to site configuration
  const handleApplyToSite = (title: string, desc: string, proposalLabel?: string) => {
    // Save snapshot for undo
    setPreviousConfigSnapshot({
      title: config.seo?.metaTitle || "",
      desc: config.seo?.metaDescription || ""
    });

    const updated = applyOptimizationToSiteConfig(config, title, desc);
    onChange(updated);
    setPreviewTitle(title);
    setPreviewDesc(desc);

    setAppliedNotice(`"${proposalLabel || 'Seçilen'}" meta verileri başarıyla sitenize uygulandı.`);
    setTimeout(() => setAppliedNotice(null), 5000);
  };

  // Undo applied change
  const handleUndo = () => {
    if (!previousConfigSnapshot) return;
    const restored = applyOptimizationToSiteConfig(
      config,
      previousConfigSnapshot.title,
      previousConfigSnapshot.desc
    );
    onChange(restored);
    setPreviewTitle(previousConfigSnapshot.title);
    setPreviewDesc(previousConfigSnapshot.desc);
    setPreviousConfigSnapshot(null);
    setAppliedNotice("Değişiklikler geri alındı, eski meta verileriniz yüklendi.");
    setTimeout(() => setAppliedNotice(null), 4000);
  };

  // Copy to clipboard
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFieldId(id);
    setTimeout(() => setCopiedFieldId(null), 2000);
  };

  // Add custom keyword
  const handleAddKeyword = () => {
    if (!newKeywordInput.trim()) return;
    const trimmed = newKeywordInput.trim();
    if (!customKeywords.includes(trimmed)) {
      setCustomKeywords(prev => [...prev, trimmed]);
    }
    setNewKeywordInput("");
  };

  // Remove custom keyword
  const handleRemoveKeyword = (kwToRemove: string) => {
    setCustomKeywords(prev => prev.filter(k => k !== kwToRemove));
  };

  const domainDisplay = config.cloudflare?.customDomain || `${config.cloudflare?.subdomain || 'sirket'}.hizliweb.site`;
  const siteUrlDisplay = `https://${domainDisplay}`;

  const currentTitleLength = previewTitle.length;
  const currentDescLength = previewDesc.length;

  const currentTitleOptimal = currentTitleLength >= 45 && currentTitleLength <= 60;
  const currentDescOptimal = currentDescLength >= 135 && currentDescLength <= 160;

  const matchedInPreview = matchKeywordsInText(`${previewTitle} ${previewDesc}`, customKeywords);

  return (
    <div className={`space-y-6 ${isModal ? "p-4 sm:p-6" : ""}`} id="ai-meta-optimizer-container">
      {/* 1. TOP HEADER & CONTROLS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
              Gemini 3.8 Flash • AI Meta-Optimizer
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300 font-mono border border-slate-700">
              Google SERP Algorithm 2026
            </span>
            {previousConfigSnapshot && (
              <button
                type="button"
                id="meta-optimizer-undo-header-btn"
                onClick={handleUndo}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold cursor-pointer transition-all"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Son Değişikliği Geri Al</span>
              </button>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
            <span>AI Meta-Optimizer</span>
            <span className="text-slate-400 text-xs font-normal">
              ({config.sector} • {config.city})
            </span>
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            Sitenizin mevcut anahtar kelimeleri ve sektörel arama niyetine (Search Intent) göre Google SERP'te en yüksek tıklama (CTR) sağlayan 50-60 karakterlik başlık ve 140-160 karakterlik açıklamaları otomatik üretin.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {onClose && (
            <button
              type="button"
              id="ai-meta-optimizer-close-btn"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            id="generate-optimized-metadata-header-btn"
            onClick={() => handleGenerateOptimizedMetadata()}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Gemini AI ile sektörel anahtar kelimeleri kullanarak optimize edilmiş yeni meta verileri üretin"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>Gemini Analiz Ediyor...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-slate-950" />
                <span>Generate Optimized Metadata</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Applied Notice Banner */}
      {appliedNotice && (
        <div 
          id="meta-optimizer-applied-alert"
          className="p-3.5 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs font-medium flex items-center justify-between gap-3 animate-fadeIn"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{appliedNotice}</span>
          </div>
          {previousConfigSnapshot && (
            <button
              type="button"
              onClick={handleUndo}
              className="px-2.5 py-1 bg-emerald-800/80 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-all shrink-0"
            >
              Geri Al
            </button>
          )}
        </div>
      )}

      {/* 2. CONTEXT & KEYWORD TAGS BAR */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Tag className="w-4 h-4 text-amber-500" />
            <span>Optimizasyonda Kullanılan Sektörel Anahtar Kelimeler &amp; Konum</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-700">{config.sector}</span>
            <span>•</span>
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-700">{config.city}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {customKeywords.map((kw, i) => (
            <span 
              key={i} 
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium"
            >
              <span>{kw}</span>
              <button
                type="button"
                onClick={() => handleRemoveKeyword(kw)}
                className="text-amber-700 hover:text-rose-600 transition-colors"
                title="Kelimeyi kaldır"
              >
                ×
              </button>
            </span>
          ))}

          <div className="inline-flex items-center gap-1">
            <input
              type="text"
              id="new-keyword-input"
              value={newKeywordInput}
              onChange={(e) => setNewKeywordInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddKeyword();
                }
              }}
              placeholder="+ Anahtar kelime ekle..."
              className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-700 placeholder-slate-400 w-36 sm:w-44"
            />
            <button
              type="button"
              id="add-custom-keyword-btn"
              onClick={handleAddKeyword}
              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Ekle
            </button>
          </div>
        </div>
      </div>

      {/* 3. SERP SIMULATOR & CURRENT METRICS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 7 cols: Interactive Google SERP Simulator */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Google SERP Canlı Önizlemesi</h3>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                id="serp-preview-desktop-btn"
                onClick={() => setActiveViewMode("desktop")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  activeViewMode === "desktop"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Masaüstü</span>
              </button>
              <button
                type="button"
                id="serp-preview-mobile-btn"
                onClick={() => setActiveViewMode("mobile")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  activeViewMode === "mobile"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobil</span>
              </button>
            </div>
          </div>

          {/* Actual SERP Mockup Box */}
          <div className={`bg-[#f8f9fa] border border-slate-200 rounded-xl p-4 sm:p-5 transition-all ${
            activeViewMode === "mobile" ? "max-w-md mx-auto shadow-md" : ""
          }`}>
            <div className="space-y-1.5 font-sans">
              {/* Breadcrumb & Favicon */}
              <div className="flex items-center gap-2 text-xs text-[#202124]">
                <div className="w-5 h-5 rounded-full bg-white border border-slate-300 flex items-center justify-center overflow-hidden shrink-0">
                  <span className="text-[10px] font-black text-amber-600">
                    {config.companyName.charAt(0) || "J"}
                  </span>
                </div>
                <div className="truncate">
                  <span className="font-medium text-slate-800">{config.companyName}</span>
                  <span className="text-slate-500 ml-1.5 text-[11px] truncate">
                    {siteUrlDisplay}
                  </span>
                </div>
              </div>

              {/* Clickable Google Blue Title */}
              <h4 className="text-[#1a0dab] hover:underline text-base sm:text-lg font-medium leading-snug cursor-pointer line-clamp-2">
                {previewTitle.length > 60 ? (
                  <span>{previewTitle.substring(0, 58)}...</span>
                ) : (
                  <span>{previewTitle}</span>
                )}
              </h4>

              {/* Snippet Meta Description with bold keyword simulation */}
              <p className="text-xs sm:text-sm text-[#4d5156] leading-relaxed line-clamp-3">
                <span className="text-slate-400 mr-1 text-[11px]">2 saat önce —</span>
                {previewDesc.length > 160 ? (
                  <span>{previewDesc.substring(0, 156)}...</span>
                ) : (
                  <span>{previewDesc}</span>
                )}
              </p>

              {/* Google Sitelinks Simulation */}
              <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center gap-2 text-[11px] text-[#1a0dab]">
                <span className="hover:underline cursor-pointer">Hizmetlerimiz</span>
                <span>•</span>
                <span className="hover:underline cursor-pointer">Fiyat Teklifi Al</span>
                <span>•</span>
                <span className="hover:underline cursor-pointer">Hakkımızda</span>
                <span>•</span>
                <span className="hover:underline cursor-pointer">İletişim &amp; Konum</span>
              </div>
            </div>
          </div>

          {/* Quick Apply Button for Current Preview */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <div className="text-xs text-slate-500">
              {matchedInPreview.length > 0 ? (
                <span className="text-emerald-700 font-medium">
                  ✓ Önizlemede {matchedInPreview.length} anahtar kelime eşleşti
                </span>
              ) : (
                <span className="text-slate-400">Hedef kelimeler kontrol ediliyor...</span>
              )}
            </div>

            <button
              type="button"
              id="apply-current-preview-btn"
              onClick={() => handleApplyToSite(previewTitle, previewDesc, "Önizlemedeki")}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Bu Önizlemeyi Siteye Uygula</span>
            </button>
          </div>
        </div>

        {/* Right 5 cols: Length Gauges & Keyword Match Status */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Karakter &amp; SERP Uyumluluğu</span>
            </h3>
            {result?.score && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                result.score >= 80 
                  ? "bg-emerald-100 text-emerald-800" 
                  : result.score >= 60 
                  ? "bg-amber-100 text-amber-800" 
                  : "bg-rose-100 text-rose-800"
              }`}>
                Skor: {result.score}/100
              </span>
            )}
          </div>

          {/* Title Gauge */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Meta Title Uzunluğu:</span>
              <span className={`font-mono font-bold ${
                currentTitleOptimal ? "text-emerald-600" : currentTitleLength > 60 ? "text-rose-600" : "text-amber-600"
              }`}>
                {currentTitleLength} / 60 karakter
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
              <div 
                className={`h-full transition-all ${
                  currentTitleOptimal 
                    ? "bg-emerald-500" 
                    : currentTitleLength > 60 
                    ? "bg-rose-500" 
                    : "bg-amber-500"
                }`}
                style={{ width: `${Math.min(100, (currentTitleLength / 60) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              {currentTitleOptimal ? (
                <span className="text-emerald-700">✓ Google masaüstü ve mobil ekranlarda kesilmeden tam görünür.</span>
              ) : currentTitleLength > 60 ? (
                <span className="text-rose-600 font-medium">⚠️ 60 karakteri aşıyor. Google SERP'te son kelimeler kesilebilir.</span>
              ) : (
                <span className="text-amber-600 font-medium">ℹ️ İdeal uzunluk 50-60 karakterdir. Birincil anahtar kelimeyi ekleyin.</span>
              )}
            </p>
          </div>

          {/* Description Gauge */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Meta Description Uzunluğu:</span>
              <span className={`font-mono font-bold ${
                currentDescOptimal ? "text-emerald-600" : currentDescLength > 160 ? "text-rose-600" : "text-amber-600"
              }`}>
                {currentDescLength} / 160 karakter
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
              <div 
                className={`h-full transition-all ${
                  currentDescOptimal 
                    ? "bg-emerald-500" 
                    : currentDescLength > 160 
                    ? "bg-rose-500" 
                    : "bg-amber-500"
                }`}
                style={{ width: `${Math.min(100, (currentDescLength / 160) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              {currentDescOptimal ? (
                <span className="text-emerald-700">✓ İdeal aralıkta (140-160 karakter). Google snippet alanını tam doldurur.</span>
              ) : currentDescLength > 160 ? (
                <span className="text-rose-600 font-medium">⚠️ 160 karakteri aşıyor. Son cümleler arama ekranında görünmeyebilir.</span>
              ) : (
                <span className="text-amber-600 font-medium">ℹ️ 140 karakterin altında. Tıklama çağrısı ve konum detayı ekleyebilirsiniz.</span>
              )}
            </p>
          </div>

          {/* Gemini SERP Strategy Insights */}
          {result?.geminiInsights && result.geminiInsights.length > 0 && (
            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Gemini SERP İçgörüleri:</span>
              </span>
              <ul className="text-[11px] text-slate-600 space-y-1">
                {result.geminiInsights.slice(0, 2).map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* 4. TABS NAVIGATION: PROPOSALS / MULTI-PAGE / CUSTOM PROMPT */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          id="tab-meta-proposals-btn"
          onClick={() => setActiveTab("proposals")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "proposals"
              ? "bg-slate-900 text-amber-400 shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>4 Farklı Stratejik Öneri (Yüksek CTR)</span>
        </button>

        <button
          type="button"
          id="tab-meta-pages-btn"
          onClick={() => setActiveTab("pages")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "pages"
              ? "bg-slate-900 text-amber-400 shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Sayfa Bazlı Meta Veriler (Home, Hizmetler, İletişim)</span>
        </button>

        <button
          type="button"
          id="tab-meta-custom-prompt-btn"
          onClick={() => setActiveTab("custom")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "custom"
              ? "bg-slate-900 text-amber-400 shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Wand2 className="w-4 h-4" />
          <span>Özel İstek ile Yeniden Üret (Prompt)</span>
        </button>
      </div>

      {/* TAB 1: 4 STRATEGIC PROPOSAL CARDS */}
      {activeTab === "proposals" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              Sektör ve Anahtar Kelimelerinize Göre Üretilen Meta Veri Paketleri
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Her paket Google'ın farklı arama niyetine (Search Intent) göre modellenmiştir
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(result?.proposals || []).map((proposal) => {
              const isApplied = 
                config.seo?.metaTitle === proposal.title && 
                config.seo?.metaDescription === proposal.description;
              const isSelectedInPreview = 
                previewTitle === proposal.title && 
                previewDesc === proposal.description;

              const isEditing = editingProposalId === proposal.id;

              return (
                <div 
                  key={proposal.id}
                  id={`proposal-card-${proposal.id}`}
                  className={`bg-white border rounded-xl p-4 shadow-xs transition-all flex flex-col justify-between space-y-3 ${
                    isApplied 
                      ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20" 
                      : isSelectedInPreview
                      ? "border-amber-400 ring-2 ring-amber-400/20"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {/* Proposal Header */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-slate-900 text-amber-300 text-[10px] font-bold">
                          {proposal.label}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200">
                          {proposal.styleBadge}
                        </span>
                      </div>

                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                        CTR: {proposal.ctrPotential}
                      </span>
                    </div>

                    {/* Proposal Body */}
                    {isEditing ? (
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500">Başlık (Title):</label>
                          <input
                            type="text"
                            value={editProposalTitle}
                            onChange={(e) => setEditProposalTitle(e.target.value)}
                            className="w-full text-xs font-semibold p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500"
                          />
                          <span className="text-[10px] font-mono text-slate-400">{editProposalTitle.length} / 60 krkt</span>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500">Açıklama (Description):</label>
                          <textarea
                            rows={3}
                            value={editProposalDesc}
                            onChange={(e) => setEditProposalDesc(e.target.value)}
                            className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500"
                          />
                          <span className="text-[10px] font-mono text-slate-400">{editProposalDesc.length} / 160 krkt</span>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              handleApplyToSite(editProposalTitle, editProposalDesc, proposal.label);
                              setEditingProposalId(null);
                            }}
                            className="px-3 py-1 bg-emerald-600 text-white rounded-md text-xs font-bold"
                          >
                            Kaydet &amp; Uygula
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingProposalId(null)}
                            className="px-3 py-1 bg-slate-100 text-slate-600 rounded-md text-xs"
                          >
                            İptal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 pt-1">
                        {/* Title Display */}
                        <div className="group relative">
                          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                            <span>Title Tag ({proposal.titleLength} krkt)</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(proposal.title, `${proposal.id}-t`)}
                              className="text-slate-400 hover:text-slate-700 flex items-center gap-1"
                              title="Başlığı kopyala"
                            >
                              {copiedFieldId === `${proposal.id}-t` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              <span>Kopyala</span>
                            </button>
                          </div>
                          <p className="text-xs font-bold text-slate-900 bg-slate-50 p-2 rounded-lg border border-slate-100">
                            {proposal.title}
                          </p>
                        </div>

                        {/* Description Display */}
                        <div>
                          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                            <span>Meta Description ({proposal.descriptionLength} krkt)</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(proposal.description, `${proposal.id}-d`)}
                              className="text-slate-400 hover:text-slate-700 flex items-center gap-1"
                              title="Açıklamayı kopyala"
                            >
                              {copiedFieldId === `${proposal.id}-d` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              <span>Kopyala</span>
                            </button>
                          </div>
                          <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 leading-relaxed">
                            {proposal.description}
                          </p>
                        </div>

                        {/* Why It Works Box */}
                        <div className="p-2 rounded-lg bg-amber-50/60 border border-amber-200/50 text-[11px] text-amber-900 flex items-start gap-1.5">
                          <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span><strong>Neden Etkili:</strong> {proposal.whyItWorks}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        id={`preview-${proposal.id}-btn`}
                        onClick={() => {
                          setPreviewTitle(proposal.title);
                          setPreviewDesc(proposal.description);
                        }}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                          isSelectedInPreview
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                        }`}
                        title="Yukarıdaki SERP simülatöründe önizleyin"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Önizle</span>
                      </button>

                      <button
                        type="button"
                        id={`edit-${proposal.id}-btn`}
                        onClick={() => {
                          setEditingProposalId(proposal.id);
                          setEditProposalTitle(proposal.title);
                          setEditProposalDesc(proposal.description);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                        title="Özelleştir"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      id={`apply-${proposal.id}-btn`}
                      onClick={() => handleApplyToSite(proposal.title, proposal.description, proposal.label)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isApplied
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-slate-900 hover:bg-slate-800 text-white shadow-xs"
                      }`}
                    >
                      {isApplied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Sitede Yayında</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>Siteye Uygula</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: MULTI-PAGE METADATA */}
      {activeTab === "pages" && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Alt Sayfalar İçin Optimize Edilmiş Meta Veriler
              </h3>
              <p className="text-xs text-slate-500">
                Ana sayfa haricindeki Hizmetler, Hakkımızda ve İletişim sayfalarınızın arama motoru başlıkları
              </p>
            </div>
            <button
              type="button"
              id="apply-all-pages-meta-btn"
              onClick={() => {
                if (result?.pageMetas && result.pageMetas.length > 0) {
                  const homeMeta = result.pageMetas.find(p => p.pageId === "home");
                  if (homeMeta) {
                    handleApplyToSite(homeMeta.suggestedTitle, homeMeta.suggestedDescription, "Tüm Sayfalar");
                  }
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <CheckCheck className="w-4 h-4 text-amber-400" />
              <span>Ana Sayfaya Uygula</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(result?.pageMetas || []).map((page) => (
              <div 
                key={page.pageId}
                className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{page.pageName}</span>
                    <span className="font-mono text-[10px] text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {page.path}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewTitle(page.suggestedTitle);
                      setPreviewDesc(page.suggestedDescription);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Önizle</span>
                  </button>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="font-semibold text-slate-800 bg-white p-2 rounded border border-slate-200">
                    {page.suggestedTitle}
                  </div>
                  <div className="text-slate-600 bg-white p-2 rounded border border-slate-200 leading-relaxed">
                    {page.suggestedDescription}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex flex-wrap gap-1">
                    {page.targetedKeywords.map((kw, kIdx) => (
                      <span key={kIdx} className="text-[10px] bg-amber-100/60 text-amber-900 px-1.5 py-0.5 rounded">
                        #{kw}
                      </span>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleApplyToSite(page.suggestedTitle, page.suggestedDescription, page.pageName)}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Uygula
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOM PROMPT REGENERATION */}
      {activeTab === "custom" && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Gemini İçin Özel SEO Talimatı &amp; Odak Noktası
            </h3>
            <p className="text-xs text-slate-500">
              Özel kampanyalar, acil durum hatları veya öne çıkarmak istediğiniz hizmet bölgelerini belirterek meta verileri yeniden üretebilirsiniz.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">
              Özel Talimat veya Vurgu (İsteğe Bağlı):
            </label>
            <textarea
              id="custom-meta-prompt-input"
              rows={3}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Örn: 7/24 gece nöbetçi usta vurgusu yap, Kadıköy ve Üsküdar ilçelerini geçir, %20 indirimli fiyat teklifi ve WhatsApp butonunu öne çıkar."
              className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Preset Buttons for Quick Custom Prompts */}
          <div className="flex flex-wrap gap-2 items-center text-xs">
            <span className="text-slate-400 font-medium">Hızlı Şablonlar:</span>
            <button
              type="button"
              onClick={() => setCustomPrompt("7/24 Gece ve Gündüz Acil Müdahale Vurgusu Ekle")}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
            >
              🚨 7/24 Acil Müdahale
            </button>
            <button
              type="button"
              onClick={() => setCustomPrompt("Şeffaf Fiyat Garantisi ve Ücretsiz Keşif Fırsatını Vurgula")}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
            >
              💰 Şeffaf Fiyat &amp; Keşif
            </button>
            <button
              type="button"
              onClick={() => setCustomPrompt("15+ Yıllık Sektör Deneyimi, Garantili İşçilik ve Lisanslı Kadro")}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
            >
              ⭐ 15 Yıllık Deneyim &amp; Garanti
            </button>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              id="regenerate-with-custom-prompt-btn"
              onClick={() => {
                handleGenerateOptimizedMetadata(customPrompt);
                setActiveTab("proposals");
              }}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Yeniden Optimize Ediliyor...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Özel İstek ile Yeniden Üret</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
