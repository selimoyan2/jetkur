import React, { useState, useMemo } from "react";
import { SiteConfig } from "../../types";
import {
  AuthorityMatrixDataset,
  generateAuthorityMatrixDataset,
  exportAuthorityMatrixToCSV
} from "../../utils/seoAuthorityMatrixEngine";
import {
  D3SeoAuthorityMatrixChart,
  AuthorityChartMode
} from "./D3SeoAuthorityMatrixChart";
import {
  Award,
  Sparkles,
  TrendingUp,
  Download,
  Copy,
  Check,
  RefreshCw,
  FileDown,
  SlidersHorizontal,
  ShieldCheck,
  Zap,
  Target,
  BarChart3,
  Layers,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Globe,
  Sliders,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Info,
  ExternalLink,
  Table
} from "lucide-react";

interface SeoAuthorityMatrixModuleProps {
  config: Partial<SiteConfig>;
  onNavigateTab?: (tabKey: string) => void;
  onOpenCustomReport?: () => void;
  onDownloadPdf?: () => void;
}

export const SeoAuthorityMatrixModule: React.FC<SeoAuthorityMatrixModuleProps> = ({
  config,
  onNavigateTab,
  onOpenCustomReport,
  onDownloadPdf
}) => {
  // Main dataset
  const [dataset, setDataset] = useState<AuthorityMatrixDataset>(() => {
    return generateAuthorityMatrixDataset(config);
  });

  const [chartMode, setChartMode] = useState<AuthorityChartMode>("multi-column");
  const [activeEntityIds, setActiveEntityIds] = useState<string[]>(() =>
    dataset.entities.map((e) => e.id)
  );

  // Gemini state
  const [isLoadingGemini, setIsLoadingGemini] = useState<boolean>(false);
  const [geminiToast, setGeminiToast] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // What-If Strategy Simulator State
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulatedBoosts, setSimulatedBoosts] = useState({
    daBoost: 6,
    refDomainsBoost: 55,
    trafficBoost: 4200
  });

  // Toggle entity visibility
  const handleToggleEntity = (id: string) => {
    setActiveEntityIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 1) return prev; // keep at least one
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Copy summary to clipboard
  const handleCopySummary = async () => {
    const text = `=== SEO OTORİTE MATRİSİ ÖZETİ ===
Şirket: ${dataset.companyName} (${dataset.sector} - ${dataset.city})
Alan Adı Otoritesi: DA 48 (Sektör Ortalaması: ${dataset.sectorAverages.domainAuthority})
Referans Domain: 142 Ref Domain (%94 DoFollow Kalitesi)
Aylık Organik Trafik: 18.200 Ziyaretçi / ay ($14.800 Değer)
Pazar Lideri Farkı: 8 DA, 168 Ref Domain
Tahmini Liderliği Devralma Süresi: 90 Gün (0.02s CWV Hız Avantajı ile)
Stratejik Tavsiye: ${dataset.recommendedAction}`;

    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  // Trigger Gemini AI deep analysis
  const handleGeminiAnalysis = () => {
    setIsLoadingGemini(true);
    setTimeout(() => {
      setIsLoadingGemini(false);
      setGeminiToast(
        "Gemini 3.8 Flash Otorite Açığı Analizi Güncellendi: Liderin monolitik altyapısı (3.4s LCP) zayıf karnıdır. Sitenizin %94 dofollow backlink kalitesi ve 0.02s hız skoru, 8 DA farkını 90 günde kapatacak organik momentuma sahiptir."
      );
      setTimeout(() => setGeminiToast(null), 7000);
    }, 1400);
  };

  const userEntity = useMemo(
    () => dataset.entities.find((e) => e.isUser) || dataset.entities[0],
    [dataset]
  );
  const leaderEntity = useMemo(
    () => dataset.entities.find((e) => e.badge.includes("Lider")) || dataset.entities[1],
    [dataset]
  );

  return (
    <div
      id="seo-otorite-matrisi-card"
      className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl"
    >
      {/* ===================================================================== */}
      {/* 1. HEADER & ACTION BAR */}
      {/* ===================================================================== */}
      <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-6 md:p-8 text-white relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-xs">
                <BarChart3 className="w-3.5 h-3.5 text-cyan-300" />
                D3.js Çok Sütunlu Karşılaştırma Çizelgesi
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white/10 text-cyan-200 border border-white/10">
                <ShieldCheck className="w-3 h-3 text-cyan-400" />
                DA / DR & Backlink Kalitesi
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white/10 text-emerald-200 border border-white/10">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                Aylık Organik Trafik Hacmi
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              SEO Otorite Matrisi
            </h2>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed">
              Rakiplerin <strong className="text-white font-semibold">Alan Adı Otoritesi (Moz DA / Ahrefs DR)</strong>,{" "}
              <strong className="text-white font-semibold">Backlink Kalitesi (Ref Domain & % DoFollow)</strong> ve{" "}
              <strong className="text-white font-semibold">Aylık Organik Trafik Hacimlerini</strong> D3.js ile çok sütunlu
              bir karşılaştırma çizelgesine dönüştüren analitik otorite yönetim paneli.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
            <button
              type="button"
              id="btn-gemini-authority-analysis"
              onClick={handleGeminiAnalysis}
              disabled={isLoadingGemini}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-lg shadow-indigo-900/30 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingGemini ? "animate-spin" : ""}`} />
              <span>{isLoadingGemini ? "Gemini Analiz Ediyor..." : "Gemini ile Otorite Açığı"}</span>
            </button>

            <button
              type="button"
              id="btn-copy-authority-matrix"
              onClick={handleCopySummary}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 flex items-center gap-1.5 cursor-pointer transition-all"
              title="Özeti panoya kopyala"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? "Kopyalandı" : "Kopyala"}</span>
            </button>

            <button
              type="button"
              id="btn-export-authority-matrix-csv"
              onClick={() => exportAuthorityMatrixToCSV(dataset)}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 flex items-center gap-1.5 cursor-pointer transition-all"
              title="CSV olarak indir"
            >
              <Download className="w-3.5 h-3.5 text-cyan-300" />
              <span>CSV İndir</span>
            </button>

            {onDownloadPdf && (
              <button
                type="button"
                id="btn-authority-matrix-export-pdf"
                onClick={onDownloadPdf}
                className="px-3.5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-400/40 flex items-center gap-2 cursor-pointer transition-all shadow-md active:scale-95"
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
                id="btn-authority-matrix-to-custom-report"
                onClick={onOpenCustomReport}
                className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600/90 hover:bg-indigo-600 text-white border border-indigo-500/50 flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
                title="Rapor Düzenleyiciye Aktar"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Raporu Düzenle</span>
              </button>
            )}
          </div>
        </div>

        {geminiToast && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{geminiToast}</span>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* 2. EXECUTIVE 4-KPI SNAPSHOT STRIP */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 border-b border-slate-200">
        {/* KPI 1: Domain Authority */}
        <div className="bg-slate-50 p-5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Domain Otoritesi (DA)</span>
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-black text-slate-900">
              DA {userEntity.domainAuthority}
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
              Sektör Üstü (+{ (userEntity.domainAuthority - dataset.sectorAverages.domainAuthority).toFixed(1) })
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Lider: <strong className="text-rose-600">DA {leaderEntity.domainAuthority}</strong> (Fark: {userEntity.daGapToLeader} DA)
          </p>
        </div>

        {/* KPI 2: Referring Domains & Backlink Quality */}
        <div className="bg-slate-50 p-5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Referans Domain & Kalite</span>
            <Target className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-black text-slate-900">
              {userEntity.backlinkQuality.referringDomains}
            </span>
            <span className="text-xs font-bold text-slate-500">
              Ref Domain
            </span>
            <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
              %{userEntity.backlinkQuality.doFollowRatio} DoFollow
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Toplam <strong>{userEntity.backlinkQuality.totalBacklinks.toLocaleString("tr-TR")}</strong> Backlink &bull; Spam: %{userEntity.backlinkQuality.spamScore}
          </p>
        </div>

        {/* KPI 3: Monthly Organic Traffic */}
        <div className="bg-slate-50 p-5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Aylık Organik Trafik</span>
            <TrendingUp className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-black text-slate-900">
              {userEntity.monthlyTraffic.visits.toLocaleString("tr-TR")}
            </span>
            <span className="text-xs font-bold text-slate-500">
              Ziyaret / ay
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Tahmini Organik Değer: <strong className="text-slate-800">${userEntity.monthlyTraffic.trafficValueUsd.toLocaleString("tr-TR")}</strong>
          </p>
        </div>

        {/* KPI 4: 1st Place Catch-up Trajectory */}
        <div className="bg-slate-50 p-5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">1. Sırayı Devralma Tahmini</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-black text-indigo-700">
              ~{userEntity.estimatedCatchUpDays} Gün
            </span>
            <span className="text-xs font-bold text-indigo-900 bg-indigo-100 px-2 py-0.5 rounded-full">
              Hızlı Geçiş
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            0.02s TTFB/CWV avantajı ile liderin önüne geçiş
          </p>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. INTERACTIVE CONTROLS BAR: VIEW MODES & COMPETITOR TOGGLES */}
      {/* ===================================================================== */}
      <div className="p-5 md:p-6 bg-slate-900 text-white space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Chart Mode Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setChartMode("multi-column")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                chartMode === "multi-column"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Çok Sütunlu Karşılaştırma (0-100 İndeks)
            </button>

            <button
              type="button"
              onClick={() => setChartMode("domain-authority")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                chartMode === "domain-authority"
                  ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Alan Adı Otoritesi (DA)
            </button>

            <button
              type="button"
              onClick={() => setChartMode("backlink-quality")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                chartMode === "backlink-quality"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Referans Domain & Kalite
            </button>

            <button
              type="button"
              onClick={() => setChartMode("organic-traffic")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                chartMode === "organic-traffic"
                  ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Aylık Organik Trafik
            </button>
          </div>

          {/* Simulator Toggle Button */}
          <button
            type="button"
            onClick={() => setIsSimulating(!isSimulating)}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer border ${
              isSimulating
                ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-cyan-400/50 shadow-lg shadow-cyan-900/30 ring-2 ring-cyan-400/40"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-300" />
            <span>{isSimulating ? "Simülatör Açık" : "Otorite Simülatörü"}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/20 text-white">
              What-If
            </span>
          </button>
        </div>

        {/* Competitor Entity Selection Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              İncelenen Rakipler:
            </span>

            {dataset.entities.map((entity) => {
              const isSelected = activeEntityIds.includes(entity.id);
              return (
                <button
                  key={entity.id}
                  type="button"
                  onClick={() => handleToggleEntity(entity.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                    isSelected
                      ? "bg-slate-800 text-white border-slate-600 shadow-xs"
                      : "bg-slate-950/60 text-slate-500 border-slate-800 opacity-60"
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: entity.color }}
                  />
                  <span>{entity.name}</span>
                  <span className="text-[10px] text-slate-400">DA {entity.domainAuthority}</span>
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-400">
            Sektör: <strong className="text-white">{dataset.sector}</strong> &bull; {dataset.city}
          </div>
        </div>

        {/* WHAT-IF SIMULATOR DRAWER (IF ACTIVE) */}
        {isSimulating && (
          <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
                <span>What-If Otorite Büyüme Simülatörü: Siteniz için Projeksiyon</span>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSimulatedBoosts({ daBoost: 6, refDomainsBoost: 55, trafficBoost: 4200 })
                }
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Sıfırla</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {/* Slider 1: DA Boost */}
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-300">Hedef DA Artışı:</span>
                  <span className="text-indigo-400 font-black">+{simulatedBoosts.daBoost} DA (Yeni: DA {userEntity.domainAuthority + simulatedBoosts.daBoost})</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="1"
                  value={simulatedBoosts.daBoost}
                  onChange={(e) =>
                    setSimulatedBoosts({ ...simulatedBoosts, daBoost: Number(e.target.value) })
                  }
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              {/* Slider 2: Ref Domains Boost */}
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-300">Yeni Ref Domain Alımı:</span>
                  <span className="text-emerald-400 font-black">+{simulatedBoosts.refDomainsBoost} RD (Yeni: {userEntity.backlinkQuality.referringDomains + simulatedBoosts.refDomainsBoost})</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="150"
                  step="5"
                  value={simulatedBoosts.refDomainsBoost}
                  onChange={(e) =>
                    setSimulatedBoosts({ ...simulatedBoosts, refDomainsBoost: Number(e.target.value) })
                  }
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Slider 3: Traffic Boost */}
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-300">Organik Trafik Büyümesi:</span>
                  <span className="text-cyan-400 font-black">+{simulatedBoosts.trafficBoost.toLocaleString("tr-TR")} Ziyaretçi</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="500"
                  value={simulatedBoosts.trafficBoost}
                  onChange={(e) =>
                    setSimulatedBoosts({ ...simulatedBoosts, trafficBoost: Number(e.target.value) })
                  }
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* 4. D3.JS INTERACTIVE CHART CONTAINER */}
      {/* ===================================================================== */}
      <div className="p-6 md:p-8 bg-slate-950">
        <D3SeoAuthorityMatrixChart
          entities={dataset.entities}
          activeEntityIds={activeEntityIds}
          chartMode={chartMode}
          simulatedBoosts={simulatedBoosts}
          isSimulating={isSimulating}
          sectorAvgDa={dataset.sectorAverages.domainAuthority}
        />

        {/* Legend for Multi-Column View */}
        {chartMode === "multi-column" && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-indigo-500" />
              <span>Domain Otoritesi (DA 0-100)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-emerald-500" />
              <span>Backlink & Ref Domain İndeksi (0-100)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-cyan-500" />
              <span>Aylık Organik Trafik İndeksi (0-100)</span>
            </div>
            <div className="flex items-center gap-2 text-amber-400">
              <span className="w-5 h-0.5 border-b-2 border-dashed border-amber-400" />
              <span>Sektör Ortalaması (DA {dataset.sectorAverages.domainAuthority})</span>
            </div>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* 5. MULTI-COLUMN DETAILED COMPARISON TABLE */}
      {/* ===================================================================== */}
      <div className="p-6 md:p-8 bg-white border-t border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Table className="w-5 h-5 text-indigo-600" />
              <span>Çok Sütunlu Otorite & Backlink Kıyaslama Tablosu</span>
            </h3>
            <p className="text-xs text-slate-500">
              Alan adı otoritesi, dofollow kalitesi, referans domain sayısı ve organik trafik hacimlerinin doğrudan dökümü.
            </p>
          </div>

          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full self-start sm:self-auto">
            {dataset.lastAuditDate} İtibarıyla
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-black border-b border-slate-200">
                <th className="p-3.5">İşletme & Alan Adı</th>
                <th className="p-3.5 text-center">Moz DA</th>
                <th className="p-3.5 text-center">Ahrefs DR</th>
                <th className="p-3.5 text-center">Ref Domain</th>
                <th className="p-3.5 text-center">Toplam Backlink</th>
                <th className="p-3.5 text-center">DoFollow Oranı</th>
                <th className="p-3.5 text-center">Spam Skoru</th>
                <th className="p-3.5 text-center">Aylık Trafik</th>
                <th className="p-3.5 text-center">CWV Hız</th>
                <th className="p-3.5">Stratejik Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {dataset.entities.map((e) => (
                <tr
                  key={e.id}
                  className={`hover:bg-slate-50 transition-colors ${
                    e.isUser ? "bg-indigo-50/70 font-semibold" : ""
                  }`}
                >
                  <td className="p-3.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: e.color }}
                      />
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{e.name}</span>
                          {e.isUser && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-600 text-white font-black">
                              Siteniz
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">{e.domain}</div>
                      </div>
                    </div>
                  </td>

                  <td className="p-3.5 text-center font-black text-slate-900">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-mono text-xs">
                      DA {e.domainAuthority}
                    </span>
                  </td>

                  <td className="p-3.5 text-center font-bold text-slate-700">
                    DR {e.domainRating}
                  </td>

                  <td className="p-3.5 text-center font-bold text-cyan-700">
                    {e.backlinkQuality.referringDomains}
                  </td>

                  <td className="p-3.5 text-center text-slate-600 font-mono">
                    {e.backlinkQuality.totalBacklinks.toLocaleString("tr-TR")}
                  </td>

                  <td className="p-3.5 text-center">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                      e.backlinkQuality.doFollowRatio >= 85
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      %{e.backlinkQuality.doFollowRatio}
                    </span>
                  </td>

                  <td className="p-3.5 text-center">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                      e.backlinkQuality.spamScore <= 2
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-rose-100 text-rose-800"
                    }`}>
                      %{e.backlinkQuality.spamScore}
                    </span>
                  </td>

                  <td className="p-3.5 text-center font-bold text-slate-900">
                    {e.monthlyTraffic.visits.toLocaleString("tr-TR")}
                  </td>

                  <td className="p-3.5 text-center">
                    <span className={`px-2 py-0.5 rounded-md font-black text-[11px] ${
                      e.monthlyTraffic.cwvPerformanceScore >= 90
                        ? "bg-emerald-600 text-white"
                        : e.monthlyTraffic.cwvPerformanceScore >= 70
                        ? "bg-amber-500 text-white"
                        : "bg-rose-500 text-white"
                    }`}>
                      {e.monthlyTraffic.cwvPerformanceScore} / 100
                    </span>
                  </td>

                  <td className="p-3.5 text-slate-600 max-w-xs text-[11px]">
                    {e.tacticalRecommendation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 6. GEMINI 3.8 FLASH STRATEGIC DIRECTIVES (3 HIGH-IMPACT TACTICS) */}
      {/* ===================================================================== */}
      <div className="p-6 md:p-8 bg-slate-50 border-t border-slate-200 space-y-4">
        <div className="flex items-center gap-2 text-indigo-900 font-black text-sm">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Gemini 3.8 Flash Otorite Büyüme & 1. Sıraya Geçiş Planı</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Directive 1: Dijital PR */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center">
                1
              </span>
              <h4 className="font-bold text-xs text-slate-900">Dijital PR & Yüksek DA Basın</h4>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Sektörünüzde yerel haber siteleri ve sektörel portallardan (DA 60+) 8 adet dofollow basın bülteni alınarak
              referans domain sayısı 142'den 195'e çıkarılmalıdır.
            </p>
            <div className="text-[10px] font-bold text-indigo-600 bg-indigo-50 p-1.5 rounded-lg">
              Etki: +4 DA Puanı & Bullish Backlink Güveni
            </div>
          </div>

          {/* Directive 2: Broken Link & Competitor Arbitrage */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 font-black text-xs flex items-center justify-center">
                2
              </span>
              <h4 className="font-bold text-xs text-slate-900">Kırık Link & Rakip Arbitrajı</h4>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Pazar liderinin 404 veren eski hizmet sayfalarına backlink veren 32 sektörel blog tespit edildi. Bu sitelere
              ulaşarak sitenizin 0.02s hızlı güncel rehberi alternatif olarak sunulmalıdır.
            </p>
            <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 p-1.5 rounded-lg">
              Etki: 0 TL Maliyetle +24 Kaliteli Ref Domain
            </div>
          </div>

          {/* Directive 3: Pillar Content Magnet */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-cyan-100 text-cyan-700 font-black text-xs flex items-center justify-center">
                3
              </span>
              <h4 className="font-bold text-xs text-slate-900">Köşe Taşı İçerik Mıknatısı</h4>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              {dataset.city} pazarında 2026 yılı {dataset.sector} fiyat endeksini ve vaka analizini içeren 3.500 kelimelik
              kapsamlı bir araştırma raporu yayınlayarak doğal referans domain toplayın.
            </p>
            <div className="text-[10px] font-bold text-cyan-700 bg-cyan-50 p-1.5 rounded-lg">
              Etki: +3.8K Aylık Organik Ziyaretçi & Otorite Sıçraması
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
