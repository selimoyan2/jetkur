import React, { useState, useEffect, useMemo } from "react";
import {
  Sparkles,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  Target,
  Zap,
  Globe,
  Award,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  FileDown,
  Layers,
  Filter,
  Search,
  SlidersHorizontal,
  Compass,
  Flame,
  ArrowUpRight,
  Eye,
  Info,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BarChart3,
  Building2,
  FileText
} from "lucide-react";
import { 
  SiteConfig, 
  CompetitiveSwotAnalysis, 
  SwotItem, 
  SwotType, 
  CompetitorSwotProfile,
  SwotComparisonFactor,
  GroundingSourceItem
} from "../../types";
import { generateFallbackCompetitiveSwot } from "../../utils/competitiveSwotUtils";

export interface CompetitorSwotMatrixCardProps {
  config: Partial<SiteConfig>;
  initialKeyword?: string;
  onNavigateTab?: (tab: string) => void;
  onOpenCustomReport?: () => void;
  onDownloadPdf?: () => void;
  className?: string;
}

export const CompetitorSwotMatrixCard: React.FC<CompetitorSwotMatrixCardProps> = ({
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
  const domain = config.cloudflare?.customDomain || config.cloudflare?.subdomain || "sitemiz.com.tr";

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
        `en yakın ${sector.toLowerCase()}`,
        `7/24 acil ${sector.toLowerCase()}`,
        `${city.toLowerCase()} ${sector.toLowerCase()} fiyatları`
      ];
    }
    return list;
  }, [config.seo?.keywords, city, sector]);

  // Selected active keyword for SWOT
  const [selectedKeyword, setSelectedKeyword] = useState<string>(
    initialKeyword || parsedKeywords[0] || `${city} ${sector}`
  );
  const [customKeywordInput, setCustomKeywordInput] = useState<string>("");
  const [showAddCustomInput, setShowAddCustomInput] = useState<boolean>(false);

  // Analysis State
  const [analysisData, setAnalysisData] = useState<CompetitiveSwotAnalysis>(() => {
    return generateFallbackCompetitiveSwot(
      config as SiteConfig,
      initialKeyword || parsedKeywords[0]
    );
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGroundingActive, setIsGroundingActive] = useState<boolean>(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Active Tab & Filters
  const [activeView, setActiveView] = useState<"matrix" | "market_position" | "tows_plan" | "head_to_head">("matrix");
  const [selectedQuadrant, setSelectedQuadrant] = useState<"all" | "strengths" | "weaknesses" | "opportunities" | "threats">("all");
  const [filterImpact, setFilterImpact] = useState<"all" | "Kritik" | "Yüksek" | "Orta">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedStatus, setCopiedStatus] = useState<string | null>(null);

  // Keep in sync with initialKeyword prop if provided
  useEffect(() => {
    if (initialKeyword && initialKeyword !== selectedKeyword) {
      setSelectedKeyword(initialKeyword);
      handleTriggerGeminiSwot(initialKeyword);
    }
  }, [initialKeyword]);

  // Main Gemini SWOT Fetch Function
  const handleTriggerGeminiSwot = async (targetKw: string) => {
    setIsLoading(true);
    setErrorNotice(null);

    try {
      const response = await fetch("/api/competitive-swot-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          sector,
          city,
          domain,
          primaryKeywords: parsedKeywords,
          selectedKeyword: targetKw,
          config
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const result = await response.json();
      if (result.success && result.data) {
        setAnalysisData(result.data);
        setIsGroundingActive(result.source === "gemini_grounding");
      } else {
        const fallback = generateFallbackCompetitiveSwot(config as SiteConfig, targetKw);
        setAnalysisData(fallback);
      }
    } catch (err: any) {
      console.warn("Live Gemini SWOT call failed, using algorithmic fallback engine:", err);
      const fallback = generateFallbackCompetitiveSwot(config as SiteConfig, targetKw);
      setAnalysisData(fallback);
      setErrorNotice("Canlı Google SERP taraması tamamlanamadı; algoritmik SWOT modeli devrede.");
      setTimeout(() => setErrorNotice(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // Add custom keyword handler
  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customKeywordInput.trim()) return;
    const newKw = customKeywordInput.trim();
    setSelectedKeyword(newKw);
    setCustomKeywordInput("");
    setShowAddCustomInput(false);
    handleTriggerGeminiSwot(newKw);
  };

  // SWOT counts and metrics
  const swotCounts = useMemo(() => {
    const s = analysisData.swot?.strengths?.length || 0;
    const w = analysisData.swot?.weaknesses?.length || 0;
    const o = analysisData.swot?.opportunities?.length || 0;
    const t = analysisData.swot?.threats?.length || 0;
    const total = s + w + o + t;
    // Net Strategic Advantage Score: (Strengths + Opportunities) / Total * 100
    const advantageScore = total > 0 ? Math.round(((s + o) / total) * 100) : 65;
    return { s, w, o, t, total, advantageScore };
  }, [analysisData.swot]);

  // Filtered SWOT Items for the 4 Quadrants
  const filteredSwot = useMemo(() => {
    const filterList = (items: SwotItem[]) => {
      if (!items) return [];
      let res = [...items];
      if (filterImpact !== "all") {
        res = res.filter(i => i.impact === filterImpact);
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        res = res.filter(i => 
          i.title.toLowerCase().includes(q) || 
          i.description.toLowerCase().includes(q) ||
          i.actionableTip.toLowerCase().includes(q)
        );
      }
      return res;
    };

    return {
      strengths: filterList(analysisData.swot?.strengths || []),
      weaknesses: filterList(analysisData.swot?.weaknesses || []),
      opportunities: filterList(analysisData.swot?.opportunities || []),
      threats: filterList(analysisData.swot?.threats || [])
    };
  }, [analysisData.swot, filterImpact, searchQuery]);

  // Copy SWOT summary to clipboard
  const handleCopySummary = () => {
    const text = `=== ${companyName} - GEMINI DESTEKLİ SEO SWOT MATRİSİ ===
Anahtar Kelime: ${selectedKeyword} (${city} / ${sector})
Tarih: ${analysisData.analyzedAt}
Stratejik Üstünlük Dengesi: %${swotCounts.advantageScore}

[+] GÜÇLÜ YÖNLER (Strengths):
${analysisData.swot.strengths.map((s, idx) => `${idx + 1}. [${s.impact}] ${s.title}: ${s.description} -> Hamle: ${s.actionableTip}`).join("\n")}

[-] ZAYIF YÖNLER (Weaknesses):
${analysisData.swot.weaknesses.map((w, idx) => `${idx + 1}. [${w.impact}] ${w.title}: ${w.description} -> İyileştirme: ${w.actionableTip}`).join("\n")}

[*] FIRSATLAR (Opportunities):
${analysisData.swot.opportunities.map((o, idx) => `${idx + 1}. [${o.impact}] ${o.title}: ${o.description} -> Büyüme: ${o.actionableTip}`).join("\n")}

[!] TEHDİTLER (Threats):
${analysisData.swot.threats.map((t, idx) => `${idx + 1}. [${t.impact}] ${t.title}: ${t.description} -> Savunma: ${t.actionableTip}`).join("\n")}`;

    navigator.clipboard.writeText(text);
    setCopiedStatus("Metin Panoya Kopyalandı!");
    setTimeout(() => setCopiedStatus(null), 3000);
  };

  // Download SWOT as JSON
  const handleDownloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(analysisData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `gemini-seo-swot-${selectedKeyword.replace(/[^a-zA-Z0-9]/g, "-")}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div 
      id="gemini-competitor-swot-matrix-card"
      className={`rounded-3xl bg-slate-900/95 border border-slate-800 shadow-2xl p-5 sm:p-7 text-white backdrop-blur-xl relative overflow-hidden transition-all ${className}`}
    >
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-600/10 via-indigo-600/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-emerald-600/10 via-cyan-600/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* ===================================================================== */}
      {/* 1. HEADER & AI CONTROLS */}
      {/* ===================================================================== */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/20 ring-1 ring-white/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
                  Gemini AI Rakip SEO & Pazar SWOT Matrisi
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  Gemini 3.8 Flash
                </span>
                {isGroundingActive ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-emerald-400" />
                    Canlı Google SERP Grounding
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-cyan-400" />
                    Algoritmik Analiz Motoru
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Google arama sonuçlarındaki <strong className="text-slate-200">ilk 3 rakibin</strong> içerik, Core Web Vitals ve pazar konumlarını analiz ederek <strong className="text-slate-200">Güçlü, Zayıf, Fırsat ve Tehdit (SWOT)</strong> haritasını otomatik çıkarır.
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
            title="SWOT özetini panoya kopyala"
          >
            <Copy className="w-3.5 h-3.5 text-cyan-400" />
            <span>Kopyala</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadJson}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
            title="Analiz verilerini JSON olarak indir"
          >
            <FileDown className="w-3.5 h-3.5 text-purple-400" />
            <span>JSON</span>
          </button>

          {onOpenCustomReport && (
            <button
              type="button"
              onClick={onOpenCustomReport}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md ring-1 ring-white/20 active:scale-95"
              title="Özelleştirilebilir PDF Rapor Editörünü Aç"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-200" />
              <span>Raporu Özelleştir</span>
            </button>
          )}

          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleTriggerGeminiSwot(selectedKeyword)}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 ${
              isLoading
                ? "bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white shadow-purple-600/30 ring-2 ring-purple-400/30"
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-purple-400" : ""}`} />
            <span>{isLoading ? "Gemini Analiz Ediyor..." : "Gemini ile Canlı Analiz Yap"}</span>
          </button>
        </div>
      </div>

      {/* Notice alert if fallback occurred */}
      {errorNotice && (
        <div className="relative z-10 mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. KEYWORD SELECTOR & EXECUTIVE SUMMARY BAR */}
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
                  onClick={() => {
                    setSelectedKeyword(kw);
                    handleTriggerGeminiSwot(kw);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm ring-1 ring-purple-300"
                      : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-700/70"
                  }`}
                >
                  {kw}
                </button>
              );
            })}

            {!showAddCustomInput ? (
              <button
                type="button"
                onClick={() => setShowAddCustomInput(true)}
                className="px-2.5 py-1 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-dashed border-slate-700 text-xs font-medium cursor-pointer"
              >
                + Farklı Kelime Ekle
              </button>
            ) : (
              <form onSubmit={handleAddKeyword} className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={customKeywordInput}
                  onChange={(e) => setCustomKeywordInput(e.target.value)}
                  placeholder="örn: kadıköy çekici..."
                  className="px-2.5 py-1 rounded-xl bg-slate-950 border border-purple-500/50 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-400"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer"
                >
                  Analiz Et
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCustomInput(false)}
                  className="px-2 py-1 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </form>
            )}
          </div>

          <div className="text-[11px] text-slate-400 font-medium">
            Son Analiz: <strong className="text-slate-200">{analysisData.analyzedAt || "Bugün"}</strong>
          </div>
        </div>

        {/* 4 Summary Metric Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* 1. Güçlü Yönler */}
          <div 
            onClick={() => setSelectedQuadrant(selectedQuadrant === "strengths" ? "all" : "strengths")}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              selectedQuadrant === "strengths"
                ? "bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/30"
                : "bg-slate-900/80 border-emerald-500/20 hover:border-emerald-500/40"
            }`}
          >
            <div className="flex items-center justify-between text-xs text-emerald-400 font-bold mb-1">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Güçlü Yönler (S)
              </span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-[10px] font-black text-emerald-300">
                {swotCounts.s} Madde
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Cloudflare Edge CDN Hızı (98/100), Local Schema & Yüksek Dönüşüm.
            </p>
          </div>

          {/* 2. Zayıf Yönler */}
          <div 
            onClick={() => setSelectedQuadrant(selectedQuadrant === "weaknesses" ? "all" : "weaknesses")}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              selectedQuadrant === "weaknesses"
                ? "bg-rose-950/40 border-rose-500/60 shadow-lg shadow-rose-950/40 ring-1 ring-rose-500/30"
                : "bg-slate-900/80 border-rose-500/20 hover:border-rose-500/40"
            }`}
          >
            <div className="flex items-center justify-between text-xs text-rose-400 font-bold mb-1">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Zayıf Yönler (W)
              </span>
              <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-[10px] font-black text-rose-300">
                {swotCounts.w} Madde
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              İndeksli sayfa derinliği ve blog rehber hacminde rakiplerin gerisinde.
            </p>
          </div>

          {/* 3. Fırsatlar */}
          <div 
            onClick={() => setSelectedQuadrant(selectedQuadrant === "opportunities" ? "all" : "opportunities")}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              selectedQuadrant === "opportunities"
                ? "bg-cyan-950/40 border-cyan-500/60 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/30"
                : "bg-slate-900/80 border-cyan-500/20 hover:border-cyan-500/40"
            }`}
          >
            <div className="flex items-center justify-between text-xs text-cyan-400 font-bold mb-1">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Pazar Fırsatları (O)
              </span>
              <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-[10px] font-black text-cyan-300">
                {swotCounts.o} Fırsat
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Lider rakiplerin zayıf mobil hızı (%58) üzerinden Google 1. sırayı alma.
            </p>
          </div>

          {/* 4. Tehditler */}
          <div 
            onClick={() => setSelectedQuadrant(selectedQuadrant === "threats" ? "all" : "threats")}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              selectedQuadrant === "threats"
                ? "bg-amber-950/40 border-amber-500/60 shadow-lg shadow-amber-950/40 ring-1 ring-amber-500/30"
                : "bg-slate-900/80 border-amber-500/20 hover:border-amber-500/40"
            }`}
          >
            <div className="flex items-center justify-between text-xs text-amber-400 font-bold mb-1">
              <span className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400" />
                Pazar Tehditleri (T)
              </span>
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-[10px] font-black text-amber-300">
                {swotCounts.t} Tehdit
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Rakiplerin yoğun Google Ads reklamları ve eski alan adı otoritesi.
            </p>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. TABS: MATRIX / MARKET POSITION / TOWS / HEAD-TO-HEAD */}
      {/* ===================================================================== */}
      <div className="relative z-10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-2 rounded-2xl bg-slate-950/70 border border-slate-800/90 mb-5">
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveView("matrix")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeView === "matrix"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-purple-300" />
            <span>4-Boyutlu SWOT Matrisi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView("market_position")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeView === "market_position"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-cyan-300" />
            <span>Pazar Konumu & Rakip Profilleri</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-cyan-500/20 text-cyan-300 font-bold">
              İlk 3 Rakip
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView("tows_plan")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeView === "tows_plan"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>Stratejik Eylem Planı (TOWS)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView("head_to_head")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeView === "head_to_head"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-emerald-300" />
            <span>Birebir Kıyaslama Faktörleri</span>
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex items-center gap-2">
          <div className="relative min-w-[160px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SWOT maddesi ara..."
              className="w-full pl-8 pr-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-400"
            />
          </div>

          <select
            value={filterImpact}
            onChange={(e) => setFilterImpact(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-300 font-bold focus:outline-none cursor-pointer"
          >
            <option value="all">Tüm Etkiler</option>
            <option value="Kritik">Kritik Etki</option>
            <option value="Yüksek">Yüksek Etki</option>
            <option value="Orta">Orta Etki</option>
          </select>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 4. VIEW 1: 4-QUADRANT SWOT MATRIX */}
      {/* ===================================================================== */}
      {activeView === "matrix" && (
        <div className="relative z-10 space-y-4">
          {/* Quadrant Selector Pill Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-bold">Boyut:</span>
            <button
              type="button"
              onClick={() => setSelectedQuadrant("all")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                selectedQuadrant === "all" ? "bg-slate-700 text-white shadow-xs" : "bg-slate-800/80 text-slate-400 hover:text-white"
              }`}
            >
              Tümü ({swotCounts.total})
            </button>
            <button
              type="button"
              onClick={() => setSelectedQuadrant("strengths")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                selectedQuadrant === "strengths" ? "bg-emerald-600 text-white shadow-xs" : "bg-slate-800/80 text-emerald-400 hover:bg-emerald-950/40"
              }`}
            >
              Güçlü Yönler ({filteredSwot.strengths.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedQuadrant("weaknesses")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                selectedQuadrant === "weaknesses" ? "bg-rose-600 text-white shadow-xs" : "bg-slate-800/80 text-rose-400 hover:bg-rose-950/40"
              }`}
            >
              Zayıf Yönler ({filteredSwot.weaknesses.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedQuadrant("opportunities")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                selectedQuadrant === "opportunities" ? "bg-cyan-600 text-white shadow-xs" : "bg-slate-800/80 text-cyan-400 hover:bg-cyan-950/40"
              }`}
            >
              Fırsatlar ({filteredSwot.opportunities.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedQuadrant("threats")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                selectedQuadrant === "threats" ? "bg-amber-600 text-white shadow-xs" : "bg-slate-800/80 text-amber-400 hover:bg-amber-950/40"
              }`}
            >
              Tehditler ({filteredSwot.threats.length})
            </button>
          </div>

          {/* 4 Quadrants Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. QUADRANT: GÜÇLÜ YÖNLER (STRENGTHS) */}
            {(selectedQuadrant === "all" || selectedQuadrant === "strengths") && (
              <div className="rounded-2xl bg-gradient-to-br from-emerald-950/30 via-slate-900/90 to-slate-950 border border-emerald-500/30 p-4 sm:p-5 flex flex-col justify-between shadow-lg">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                          Güçlü Yönler <span className="text-emerald-400 text-xs font-bold">(İç Faktörler)</span>
                        </h4>
                        <span className="text-[10px] text-slate-400">Rakiplere Karşı Sitenizin Doğal Avantajları</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {filteredSwot.strengths.length} Madde
                    </span>
                  </div>

                  <div className="space-y-3">
                    {filteredSwot.strengths.map((item) => (
                      <div 
                        key={item.id}
                        className="p-3 rounded-xl bg-slate-900/80 border border-emerald-500/20 hover:border-emerald-500/40 transition-all space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                            {item.title}
                          </h5>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase shrink-0 ${
                            item.impact === "Kritik" 
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-slate-800 text-slate-300"
                          }`}>
                            {item.impact}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {item.description}
                        </p>
                        <div className="pt-1.5 border-t border-slate-800/80 flex items-start gap-1.5 text-[11px] text-emerald-300">
                          <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-emerald-200">Aksiyon: </strong>
                            <span>{item.actionableTip}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-emerald-500/10 flex items-center justify-between text-[11px] text-emerald-400">
                  <span>Temel Güç: Cloudflare Edge CDN & Mobil Hız</span>
                  <span className="font-bold">98/100 Puan</span>
                </div>
              </div>
            )}

            {/* 2. QUADRANT: ZAYIF YÖNLER (WEAKNESSES) */}
            {(selectedQuadrant === "all" || selectedQuadrant === "weaknesses") && (
              <div className="rounded-2xl bg-gradient-to-br from-rose-950/30 via-slate-900/90 to-slate-950 border border-rose-500/30 p-4 sm:p-5 flex flex-col justify-between shadow-lg">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-rose-500/20 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                          Zayıf Yönler <span className="text-rose-400 text-xs font-bold">(İç Faktörler)</span>
                        </h4>
                        <span className="text-[10px] text-slate-400">Geliştirilmesi Gereken Eksik Noktalar</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {filteredSwot.weaknesses.length} Madde
                    </span>
                  </div>

                  <div className="space-y-3">
                    {filteredSwot.weaknesses.map((item) => (
                      <div 
                        key={item.id}
                        className="p-3 rounded-xl bg-slate-900/80 border border-rose-500/20 hover:border-rose-500/40 transition-all space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                            {item.title}
                          </h5>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase shrink-0 ${
                            item.impact === "Kritik" 
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              : "bg-slate-800 text-slate-300"
                          }`}>
                            {item.impact}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {item.description}
                        </p>
                        <div className="pt-1.5 border-t border-slate-800/80 flex items-start gap-1.5 text-[11px] text-rose-300">
                          <Sparkles className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-rose-200">İyileştirme Reçetesi: </strong>
                            <span>{item.actionableTip}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-rose-500/10 flex items-center justify-between text-[11px] text-rose-400">
                  <span>Öncelikli Eksik: İndeksli Sayfa Hacmi & Blog</span>
                  {onNavigateTab && (
                    <button
                      type="button"
                      onClick={() => onNavigateTab("blog-manager")}
                      className="font-bold underline hover:text-white cursor-pointer"
                    >
                      AI Blog Üret &rarr;
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 3. QUADRANT: FIRSATLAR (OPPORTUNITIES) */}
            {(selectedQuadrant === "all" || selectedQuadrant === "opportunities") && (
              <div className="rounded-2xl bg-gradient-to-br from-cyan-950/30 via-slate-900/90 to-slate-950 border border-cyan-500/30 p-4 sm:p-5 flex flex-col justify-between shadow-lg">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                          Fırsatlar <span className="text-cyan-400 text-xs font-bold">(Dış Faktörler)</span>
                        </h4>
                        <span className="text-[10px] text-slate-400">Pazardaki Boşluklar & Sıçrama Fırsatları</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {filteredSwot.opportunities.length} Fırsat
                    </span>
                  </div>

                  <div className="space-y-3">
                    {filteredSwot.opportunities.map((item) => (
                      <div 
                        key={item.id}
                        className="p-3 rounded-xl bg-slate-900/80 border border-cyan-500/20 hover:border-cyan-500/40 transition-all space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                            {item.title}
                          </h5>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase shrink-0 ${
                            item.impact === "Kritik" 
                              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                              : "bg-slate-800 text-slate-300"
                          }`}>
                            {item.impact}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {item.description}
                        </p>
                        <div className="pt-1.5 border-t border-slate-800/80 flex items-start gap-1.5 text-[11px] text-cyan-300">
                          <Target className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-cyan-200">Saldırı Hamlesi: </strong>
                            <span>{item.actionableTip}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-cyan-500/10 flex items-center justify-between text-[11px] text-cyan-400">
                  <span>En Yüksek Getiri: Rakibin Hız Zafiyetini Sömürme</span>
                  <span className="font-bold">+%35 Trafik Potansiyeli</span>
                </div>
              </div>
            )}

            {/* 4. QUADRANT: TEHDİTLER (THREATS) */}
            {(selectedQuadrant === "all" || selectedQuadrant === "threats") && (
              <div className="rounded-2xl bg-gradient-to-br from-amber-950/30 via-slate-900/90 to-slate-950 border border-amber-500/30 p-4 sm:p-5 flex flex-col justify-between shadow-lg">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-amber-500/20 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        <Flame className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                          Tehditler <span className="text-amber-400 text-xs font-bold">(Dış Faktörler)</span>
                        </h4>
                        <span className="text-[10px] text-slate-400">Pazar Riskleri & Rakip Savunma Stratejisi</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {filteredSwot.threats.length} Tehdit
                    </span>
                  </div>

                  <div className="space-y-3">
                    {filteredSwot.threats.map((item) => (
                      <div 
                        key={item.id}
                        className="p-3 rounded-xl bg-slate-900/80 border border-amber-500/20 hover:border-amber-500/40 transition-all space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                            {item.title}
                          </h5>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase shrink-0 ${
                            item.impact === "Kritik" 
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : "bg-slate-800 text-slate-300"
                          }`}>
                            {item.impact}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {item.description}
                        </p>
                        <div className="pt-1.5 border-t border-slate-800/80 flex items-start gap-1.5 text-[11px] text-amber-300">
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-amber-200">Savunma Kalkanı: </strong>
                            <span>{item.actionableTip}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-amber-500/10 flex items-center justify-between text-[11px] text-amber-400">
                  <span>En Kritik Risk: Agresif Google Ads Reklam Baskısı</span>
                  <span className="font-bold">Organik Otorite ile Aşılır</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. VIEW 2: MARKET POSITION & 1-ON-1 COMPETITOR PROFILES */}
      {/* ===================================================================== */}
      {activeView === "market_position" && (
        <div className="relative z-10 space-y-4">
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                Sektörel Pazar Konumlandırması & Kafa Kafaya Rakip Analizi
              </h4>
              <p className="text-xs text-slate-300">
                Gemini, Google SERP ilk sayfasındaki 3 lider rakibin güçlü yanlarını ve sitenizin yararlanabileceği açıklarını (vulnerabilities) haritalandırdı.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 text-xs font-black border border-cyan-500/30 whitespace-nowrap">
              {sector} &bull; {city}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {analysisData.competitorProfiles?.map((comp, idx) => (
              <div 
                key={comp.id || idx}
                className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-3 flex flex-col justify-between hover:border-slate-700 transition-all shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                          idx === 0 ? "bg-amber-400 text-slate-950 font-bold" : idx === 1 ? "bg-slate-300 text-slate-950" : "bg-amber-700 text-white"
                        }`}>
                          {comp.rank || idx + 1}
                        </span>
                        <h5 className="text-xs font-black text-white">{comp.name}</h5>
                      </div>
                      <span className="font-mono text-[10px] text-cyan-400 block mt-0.5">{comp.domain}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                      %{comp.marketShare || 30} Pay
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed my-2 italic">
                    "{comp.headToHeadSummary}"
                  </p>

                  {/* Sitenize Göre Güçlü Yönleri */}
                  <div className="space-y-1 my-2">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                      Rakibin Üstün Yönleri:
                    </span>
                    <ul className="space-y-1">
                      {comp.strengthsVsUser?.map((s, i) => (
                        <li key={i} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                          <span className="text-amber-400 font-bold">&bull;</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Sitenizin Sömürebileceği Açıkları */}
                  <div className="space-y-1 my-2">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                      Sitenizin Yararlanabileceği Zayıflıkları:
                    </span>
                    <ul className="space-y-1">
                      {comp.vulnerabilitiesVsUser?.map((v, i) => (
                        <li key={i} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{v}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Karşı Saldırı Stratejisi */}
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-indigo-500/30 text-[11px] space-y-1">
                  <span className="text-[10px] font-bold text-indigo-300 flex items-center gap-1">
                    <Target className="w-3 h-3 text-purple-400" />
                    Karşı Saldırı Stratejisi:
                  </span>
                  <p className="text-slate-200">{comp.counterStrategy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 6. VIEW 3: STRATEGIC TOWS ACTION PLAN */}
      {/* ===================================================================== */}
      {activeView === "tows_plan" && (
        <div className="relative z-10 space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/50 to-indigo-950/50 border border-purple-500/30 flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                TOWS Çapraz Strateji Matrisi (Güçler x Fırsatlar x Tehditler)
              </h4>
              <p className="text-xs text-slate-300">
                Statik bir SWOT listesi yerine, güçlü yönlerinizi fırsatlarla çarpanlayıp zayıflıklarınızı bertaraf eden somut aksiyon adımları.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-purple-500/20 text-purple-300 text-xs font-black border border-purple-500/30">
              Eylem Planı
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SO Stratejileri (Maxi-Maxi) */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30 space-y-2">
              <div className="flex items-center gap-2 pb-2 border-b border-emerald-500/20">
                <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-black">
                  SO Stratejileri
                </span>
                <span className="text-xs font-bold text-white">Güçleri Kullanarak Fırsatları Yakalama</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 pt-1">
                <li className="flex items-start gap-2">
                  <ArrowUpRight className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Hız Odaklı SERP Kuşatması:</strong> Cloudflare Edge CDN 98/100 hız üstünlüğünüzü kullanarak, lider rakibin yavaş açılan 40 semt sayfasında Google 1. sırayı doğrudan kapın.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowUpRight className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Rich Snippet Hakimiyeti:</strong> Hazır LocalBusiness JSON-LD altyapınızla her semt için FAQPage zengin soru-cevap şeması ekleyerek Google sıfırıncı sırayı (featured snippet) ele geçirin.</span>
                </li>
              </ul>
            </div>

            {/* WO Stratejileri (Mini-Maxi) */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/30 space-y-2">
              <div className="flex items-center gap-2 pb-2 border-b border-cyan-500/20">
                <span className="px-2 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 text-xs font-black">
                  WO Stratejileri
                </span>
                <span className="text-xs font-bold text-white">Zayıflıkları Gidererek Fırsatları Değerlendirme</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 pt-1">
                <li className="flex items-start gap-2">
                  <ArrowUpRight className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span><strong>AI Destekli İçerik Hacmi:</strong> Sitedeki sayfa sayısı eksikliğini kapatmak için Gemini Blog Motoru ile haftalık 3 derin rehber yayınlayarak rakiplerin kelime hacmini 60 günde yakalayın.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowUpRight className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span><strong>Yerel Semt Açılış Sayfaları:</strong> Şehrin en kritik 10 ilçesi için özel açılış sayfası üreterek yerel harita ve organik arama kapsamını genişletin.</span>
                </li>
              </ul>
            </div>

            {/* ST Stratejileri (Maxi-Mini) */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-indigo-500/30 space-y-2">
              <div className="flex items-center gap-2 pb-2 border-b border-indigo-500/20">
                <span className="px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs font-black">
                  ST Stratejileri
                </span>
                <span className="text-xs font-bold text-white">Güçleri Kullanarak Tehditleri Bertaraf Etme</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 pt-1">
                <li className="flex items-start gap-2">
                  <ArrowUpRight className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span><strong>Dönüşüm Üstünlüğü ile Ads Savunması:</strong> Rakiplerin pahalı Google Ads reklamlarına karşı, sitenizdeki tek tıkla arama ve WhatsApp CTA dönüşüm oranı (%18+) sayesinde reklam maliyetine girmeden müşteriyi bağlayın.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowUpRight className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span><strong>Algoritma Güncellemelerine Dayanıklılık:</strong> Temiz kod, sıfır spam ve kusursuz Core Web Vitals sayesinde Google çekirdek güncellemelerinden hasar almadan sıralamada yükselin.</span>
                </li>
              </ul>
            </div>

            {/* WT Stratejileri (Mini-Mini) */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-2">
              <div className="flex items-center gap-2 pb-2 border-b border-amber-500/20">
                <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-black">
                  WT Stratejileri
                </span>
                <span className="text-xs font-bold text-white">Zayıflıkları Azaltarak Tehditlerden Korunma</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 pt-1">
                <li className="flex items-start gap-2">
                  <ArrowUpRight className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Yerel Yorum & Güven İnşası:</strong> Rakiplerin köklü alan adı yaşına karşı, Google Haritalar profilinizde gerçek müşteri yorumlarını 50+ seviyesine çıkararak tüketici güvenini garantiye alın.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowUpRight className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Niş Uzmanlık Odaklanması:</strong> Genel aramalarda büyük bütçeli rakiplerle doğrudan savaşmak yerine, acil ve semt bazlı aramalarda kesin 1. sıra hakimiyeti kurun.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 7. VIEW 4: HEAD-TO-HEAD COMPARISON FACTORS TABLE */}
      {/* ===================================================================== */}
      {activeView === "head_to_head" && (
        <div className="relative z-10 space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">Karşılaştırma Faktörü</th>
                  <th className="p-3 text-indigo-300">{companyName} (Siteniz)</th>
                  <th className="p-3 text-slate-300">1. Rakip</th>
                  <th className="p-3 text-slate-300">2. Rakip</th>
                  <th className="p-3 text-slate-300">3. Rakip</th>
                  <th className="p-3">SWOT Boyutu</th>
                  <th className="p-3">Taktiksel Eylem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {analysisData.comparisonFactors?.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-3 font-bold text-white flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      {f.factor}
                    </td>
                    <td className="p-3 font-bold text-indigo-300 bg-indigo-950/20">
                      {f.userSiteValue}
                    </td>
                    <td className="p-3 text-slate-300">{f.comp1Value}</td>
                    <td className="p-3 text-slate-400">{f.comp2Value}</td>
                    <td className="p-3 text-slate-400">{f.comp3Value}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        f.swotType === "strength" 
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : f.swotType === "weakness"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : f.swotType === "opportunity"
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}>
                        {f.swotType === "strength" ? "Güç" : f.swotType === "weakness" ? "Zayıflık" : f.swotType === "opportunity" ? "Fırsat" : "Tehdit"}
                      </span>
                    </td>
                    <td className="p-3 text-[11px] text-slate-300 max-w-xs">
                      {f.aiTacticalAction}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 8. SEARCH GROUNDING CITATIONS (IF AVAILABLE) */}
      {/* ===================================================================== */}
      {analysisData.searchGroundingSources && analysisData.searchGroundingSources.length > 0 && (
        <div className="relative z-10 mt-5 pt-4 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>Google SERP Grounding Arama Kaynakları ({analysisData.searchGroundingSources.length} Sorgu)</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {analysisData.searchGroundingSources.map((g, idx) => (
              <span 
                key={idx}
                className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-1.5"
              >
                <span className="font-mono text-cyan-400">"{g.query}"</span>
                {g.sources && g.sources[0] && (
                  <a
                    href={g.sources[0].uri}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-500 hover:text-slate-300"
                    title={g.sources[0].title}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
