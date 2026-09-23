import React, { useState, useEffect, useMemo } from "react";
import { 
  Globe, 
  Sparkles, 
  RefreshCw, 
  Download, 
  FileDown, 
  MapPin, 
  Layers, 
  TrendingUp, 
  ShieldCheck, 
  Search, 
  Flame, 
  AlertCircle, 
  CheckCircle2, 
  Share2, 
  Copy, 
  Info,
  ChevronRight,
  ArrowUpRight,
  Target,
  Zap,
  BarChart2,
  SlidersHorizontal
} from "lucide-react";
import { SiteConfig } from "../../types";
import { 
  GlobalSeoHeatmapDataset, 
  MarketHeatmapRegion, 
  generateFallbackGlobalSeoHeatmap, 
  exportGlobalSeoHeatmapToCsv 
} from "../../utils/globalSeoHeatmapEngine";

interface GlobalSeoHeatmapWidgetProps {
  config: Partial<SiteConfig>;
  onDownloadPdf?: () => void;
  onOpenCustomReport?: () => void;
  onNavigateTab?: (tab: string) => void;
}

type HeatMetricType = "heatScore" | "marketShare" | "averageRank" | "indexedUrls" | "referringDomains";
type RegionFilterType = "all" | "domestic" | "international" | "whitespace";

export const GlobalSeoHeatmapWidget: React.FC<GlobalSeoHeatmapWidgetProps> = ({
  config,
  onDownloadPdf,
  onOpenCustomReport,
  onNavigateTab
}) => {
  const [dataset, setDataset] = useState<GlobalSeoHeatmapDataset>(() => generateFallbackGlobalSeoHeatmap(config));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedRegionId, setSelectedRegionId] = useState<string>("tr-marmara");
  const [activeMetric, setActiveMetric] = useState<HeatMetricType>("heatScore");
  const [activeFilter, setActiveFilter] = useState<RegionFilterType>("all");
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [isAiGrounding, setIsAiGrounding] = useState<boolean>(false);

  // Fetch or re-generate data with Gemini AI
  const fetchGlobalHeatmap = async (forceRefresh: boolean = false) => {
    setIsLoading(true);
    if (forceRefresh) setIsAiGrounding(true);

    try {
      const response = await fetch("/api/strategy/global-heatmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config,
          companyName: config.companyName || "Siteniz",
          sector: config.sector || "Oto Kurtarma & Çekici",
          city: config.city || "İstanbul"
        })
      });

      if (response.ok) {
        const json = await response.json();
        if (json.data) {
          setDataset(json.data);
        }
      }
    } catch (err) {
      console.warn("Global heatmap fetch fallback:", err);
    } finally {
      setIsLoading(false);
      setIsAiGrounding(false);
    }
  };

  useEffect(() => {
    fetchGlobalHeatmap(false);
  }, [config.companyName, config.sector, config.city]);

  // Filtered regions
  const filteredRegions = useMemo(() => {
    return dataset.regions.filter(r => {
      if (activeFilter === "domestic") return r.tier === "domestic";
      if (activeFilter === "international") return r.tier === "international";
      if (activeFilter === "whitespace") return r.whiteSpaceOpportunity;
      return true;
    });
  }, [dataset.regions, activeFilter]);

  const selectedRegion = useMemo(() => {
    return dataset.regions.find(r => r.id === selectedRegionId) || dataset.regions[0];
  }, [dataset.regions, selectedRegionId]);

  // Color generator based on metric & value
  const getHeatColor = (score: number) => {
    if (score >= 75) return { bg: "bg-emerald-500", text: "text-emerald-700", border: "border-emerald-500", light: "bg-emerald-50", fill: "#10b981" };
    if (score >= 55) return { bg: "bg-cyan-500", text: "text-cyan-700", border: "border-cyan-500", light: "bg-cyan-50", fill: "#06b6d4" };
    if (score >= 35) return { bg: "bg-amber-500", text: "text-amber-700", border: "border-amber-500", light: "bg-amber-50", fill: "#f59e0b" };
    return { bg: "bg-rose-500", text: "text-rose-700", border: "border-rose-500", light: "bg-rose-50", fill: "#f43f5e" };
  };

  const handleCopySummary = () => {
    const text = `Global SEO Isı Haritası ve Rakip Dijital Ayak İzi Özeti (${config.companyName || "Siteniz"}):
- Global Ayak İzi Endeksi: %${dataset.summary.overallGlobalFootprintScore}
- Pazar Kapsama Oranı: %${dataset.summary.marketCoveragePercent}
- Tespit Edilen Beyaz Boşluk (Fırsat) Pazarları: ${dataset.summary.whiteSpaceOpportunitiesCount} Bölge
- Aylık Toplam Arama Havuzu: ${dataset.summary.totalMonthlySearchVolume}
Gemini Direktifi: ${dataset.geminiFootprintAdvice.executiveBrief}`;
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  return (
    <div 
      id="global-seo-heatmap-widget-container"
      className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden transition-all duration-300 relative"
    >
      {/* ===================================================================== */}
      {/* 1. WIDGET HEADER */}
      {/* ===================================================================== */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 sm:p-7 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                <Globe className="w-3.5 h-3.5 text-cyan-200" />
                <span>Global SEO Isı Haritası</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-cyan-200 border border-white/15 text-[11px] font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Gemini 3.8 Flash Dijital Ayak İzi</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-900/60 text-indigo-300 border border-indigo-400/30 text-[10px] font-mono">
                10 Hedef Pazar &bull; 4 Rakip Karşılaştırmalı
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>Hedef Pazarlarda Rakip Dijital Ayak İzi & Varlık Haritası</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Rakiplerin Türkiye metropolleri ve sınır ötesi (DACH, UK, BAE, Benelux) hedef pazarlardaki 
              <strong> SERP Pazar Payı</strong>, <strong>Domain Otoritesi</strong>, <strong>Arama Hacmi Penetrasyonu</strong> ve 
              <strong> Beyaz Boşluk (White Space) Fırsatlarını</strong> ısı haritası üzerinde görselleştirin.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto shrink-0">
            <button
              type="button"
              id="btn-reanalyze-global-heatmap"
              onClick={() => fetchGlobalHeatmap(true)}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-indigo-900/40 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              title="Gemini 3.8 Flash ile tüm hedef pazarlardaki dijital ayak izi verilerini yeniden sentezle"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-amber-300" : ""}`} />
              <span>{isLoading ? "Gemini Analiz Ediyor..." : "Gemini ile Yeniden Analiz Et"}</span>
            </button>

            <button
              type="button"
              id="btn-export-heatmap-csv"
              onClick={() => exportGlobalSeoHeatmapToCsv(dataset, config.companyName || "Siteniz")}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 border border-white/20 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              title="Isı haritası ve rakip ayak izi verilerini CSV olarak indir"
            >
              <Download className="w-3.5 h-3.5 text-cyan-300" />
              <span>CSV İndir</span>
            </button>

            {onOpenCustomReport && (
              <button
                type="button"
                id="btn-customize-heatmap-report"
                onClick={onOpenCustomReport}
                className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md ring-1 ring-white/20"
                title="Rapor sayfalarını, radar grafiklerini ve ısı haritasını vektörel kalitede düzenleyin"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-300" />
                <span>Raporu Özelleştir</span>
              </button>
            )}

            {onDownloadPdf && (
              <button
                type="button"
                id="btn-export-heatmap-pdf"
                onClick={onDownloadPdf}
                className="px-3.5 py-2.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md"
                title="Şirket logolu resmi paydaş PDF raporunu indir"
              >
                <FileDown className="w-3.5 h-3.5 text-emerald-200" />
                <span>PDF Raporuna Aktar</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopySummary}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 border border-white/20 text-xs transition-all active:scale-95 cursor-pointer"
              title="Özet verileri panoya kopyala"
            >
              {copySuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* 2. TOP METRIC SCORE CARDS */}
        {/* ===================================================================== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-white/10">
          {/* Card 1: Global Footprint Index */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="font-semibold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Ayak İzi Endeksi</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">%+18 Büyüme</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-white">
                %{dataset.summary.overallGlobalFootprintScore}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">/ 100 Skoru</span>
            </div>
            <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Yurtiçi: %{dataset.summary.domesticFootprintScore} &bull; Global: %{dataset.summary.internationalFootprintScore}</span>
            </div>
          </div>

          {/* Card 2: Lider ile Fark */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                <span>Lider ile Fark</span>
              </span>
              <span className="text-[10px] text-cyan-400 font-bold">Kapanıyor</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-2xl sm:text-3xl font-black ${dataset.summary.leaderGapScore >= 0 ? "text-emerald-400" : "text-amber-400"}`}>
                {dataset.summary.leaderGapScore >= 0 ? `+${dataset.summary.leaderGapScore}` : dataset.summary.leaderGapScore}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Puan Fark</span>
            </div>
            <div className="text-[11px] text-slate-300 mt-1">
              <span>{dataset.summary.leaderGapScore >= 0 ? "Liderin önündesiniz!" : "3 Bölgede liderliği yakaladınız"}</span>
            </div>
          </div>

          {/* Card 3: Pazar Kapsama Oranı */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="font-semibold flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Pazar Kapsama</span>
              </span>
              <span className="text-[10px] text-indigo-300 font-mono">10 Bölge</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-white">
                %{dataset.summary.marketCoveragePercent}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Kapsama</span>
            </div>
            <div className="text-[11px] text-slate-300 mt-1 truncate">
              <span>Havuz: {dataset.summary.totalMonthlySearchVolume}</span>
            </div>
          </div>

          {/* Card 4: Beyaz Boşluk / Fırsat Pazarları */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="font-semibold flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-rose-400" />
                <span>Beyaz Boşluk</span>
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold">Bakir</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400">
                {dataset.summary.whiteSpaceOpportunitiesCount}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Bölgede Açık</span>
            </div>
            <div className="text-[11px] text-slate-300 mt-1 truncate">
              <span>Rakiplerin zayıf olduğu alanlar</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. INTERACTIVE CONTROLS BAR (METRIC SELECTOR & REGION FILTERS) */}
      {/* ===================================================================== */}
      <div className="p-5 sm:p-6 bg-slate-50/80 border-b border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Metric Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5 mr-1">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Isı Metriği:</span>
          </span>

          <button
            type="button"
            onClick={() => setActiveMetric("heatScore")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMetric === "heatScore"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-300"
            }`}
          >
            <span>Görünürlük Isı Skoru (0-100)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMetric("marketShare")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMetric === "marketShare"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-300"
            }`}
          >
            <span>SERP Pazar Payı (%)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMetric("averageRank")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMetric === "averageRank"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-300"
            }`}
          >
            <span>Ortalama SERP Sırası</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMetric("referringDomains")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMetric === "referringDomains"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-300"
            }`}
          >
            <span>Backlink Ayak İzi</span>
          </button>
        </div>

        {/* Region Filter */}
        <div className="flex flex-wrap items-center gap-1.5 self-start md:self-auto">
          <span className="text-xs font-bold text-slate-600 mr-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-indigo-500" />
            <span>Filtre:</span>
          </span>

          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === "all"
                ? "bg-indigo-600 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            Tümü ({dataset.regions.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("domestic")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === "domestic"
                ? "bg-indigo-600 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            🇹🇷 Türkiye ({dataset.regions.filter(r => r.tier === "domestic").length})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("international")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === "international"
                ? "bg-indigo-600 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            🌍 Global / İhracat ({dataset.regions.filter(r => r.tier === "international").length})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("whitespace")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              activeFilter === "whitespace"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300"
            }`}
          >
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>Fırsat / Boşluk ({dataset.summary.whiteSpaceOpportunitiesCount})</span>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 4. MAIN WORKSPACE: HEATMAP REGION MATRIX & COMPARISON DETAIL DRAWER */}
      {/* ===================================================================== */}
      <div className="p-6 sm:p-7 space-y-7">
        {/* Heat Legend Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>Dijital Ayak İzi Isı Skalası:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-emerald-500 border border-emerald-600 shadow-xs" />
              <span className="text-slate-700 font-semibold">Pazar Hakimi (75 - 100)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-cyan-500 border border-cyan-600 shadow-xs" />
              <span className="text-slate-700 font-semibold">Güçlü Varlık (55 - 74)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-amber-500 border border-amber-600 shadow-xs" />
              <span className="text-slate-700 font-semibold">Orta Isı / Çekişmeli (35 - 54)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-rose-500 border border-rose-600 shadow-xs" />
              <span className="text-slate-700 font-semibold">Zayıf / Soğuk (0 - 34)</span>
            </div>
          </div>
        </div>

        {/* Region Matrix Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredRegions.map((region) => {
            const isSelected = region.id === selectedRegion.id;
            const heat = getHeatColor(region.userFootprint.heatScore);

            return (
              <div
                key={region.id}
                onClick={() => setSelectedRegionId(region.id)}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isSelected 
                    ? "border-indigo-600 bg-indigo-50/40 shadow-lg ring-2 ring-indigo-200" 
                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
                }`}
              >
                {/* Top Badge & Flag */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl leading-none select-none">{region.flag}</span>
                      <div>
                        <h4 className="font-black text-slate-900 text-sm sm:text-base leading-tight">
                          {region.name}
                        </h4>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <span className="font-mono text-indigo-600 font-bold">{region.searchEngine}</span>
                          <span>&bull;</span>
                          <span>{region.language}</span>
                        </div>
                      </div>
                    </div>

                    {region.whiteSpaceOpportunity && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black uppercase tracking-wider shrink-0 flex items-center gap-1 shadow-xs">
                        <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                        <span>Fırsat</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 mb-4 line-clamp-1">
                    {region.subArea}
                  </p>

                  {/* Heat Intensity Metric Display */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 mb-4">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-600 flex items-center gap-1">
                        <span className={`w-2.5 h-2.5 rounded-full ${heat.bg}`} />
                        <span>Sitenizin Ayak İzi:</span>
                      </span>
                      <span className={`font-black text-xs ${heat.text}`}>
                        {activeMetric === "heatScore" && `Skor: %${region.userFootprint.heatScore}`}
                        {activeMetric === "marketShare" && `Pazar Payı: %${region.userFootprint.marketSharePercent}`}
                        {activeMetric === "averageRank" && `Ort. Pozisyon: #${region.userFootprint.averageRank}`}
                        {activeMetric === "referringDomains" && `${region.userFootprint.referringDomains} Backlink`}
                      </span>
                    </div>

                    {/* Comparative Mini Bar (User vs Leader) */}
                    <div className="space-y-1.5 pt-1">
                      <div>
                        <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                          <span className="font-bold text-slate-700">{config.companyName || "Siz"}</span>
                          <span className="font-mono font-bold">%{region.userFootprint.marketSharePercent} Pazar Payı</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div 
                            className={`h-full ${heat.bg} transition-all duration-500 rounded-full`}
                            style={{ width: `${Math.min(100, region.userFootprint.marketSharePercent * 2)}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                          <span>{region.compLeaderFootprint.name} (#1)</span>
                          <span className="font-mono">%{region.compLeaderFootprint.marketSharePercent}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                          <div 
                            className="h-full bg-slate-500 transition-all duration-500 rounded-full"
                            style={{ width: `${Math.min(100, region.compLeaderFootprint.marketSharePercent * 2)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Monthly Volume & Gemini Snippet */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">
                    Aylık Havuz: <strong className="text-slate-800">{region.monthlySearchVolumeFormatted}</strong>
                  </span>
                  <span className="text-indigo-600 font-bold flex items-center gap-0.5 group">
                    <span>Detay İncele</span>
                    <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ===================================================================== */}
        {/* 5. SELECTED REGION DEEP-DIVE FOOTPRINT DRAWER */}
        {/* ===================================================================== */}
        {selectedRegion && (
          <div 
            id="selected-region-deepdive-card"
            className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 sm:p-7 text-white shadow-xl border border-indigo-500/30"
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-5 border-b border-white/10">
              <div className="flex items-center gap-3.5">
                <span className="text-4xl leading-none">{selectedRegion.flag}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      {selectedRegion.name}
                    </h3>
                    {selectedRegion.whiteSpaceOpportunity && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-bold">
                        Öncelikli Pazar Fırsatı (Beyaz Boşluk)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {selectedRegion.subArea} &bull; Arama Motoru: <span className="font-mono text-cyan-300 font-bold">{selectedRegion.searchEngine}</span> &bull; Havuz: <strong>{selectedRegion.monthlySearchVolumeFormatted}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start lg:self-auto">
                <span className="text-xs text-slate-400">Rekabet Yoğunluğu:</span>
                <span className="px-3 py-1 rounded-xl bg-white/10 text-white font-bold text-xs border border-white/15">
                  {selectedRegion.competitionDensity}
                </span>
              </div>
            </div>

            {/* 4-Entity Digital Footprint Comparison Table */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">İşletme / Rakip</th>
                    <th className="py-2.5 px-3 text-center">Ayak İzi Skoru</th>
                    <th className="py-2.5 px-3 text-center">Pazar Payı (%)</th>
                    <th className="py-2.5 px-3 text-center">Ortalama SERP Sırası</th>
                    <th className="py-2.5 px-3 text-center">İndeksli Sayfa</th>
                    <th className="py-2.5 px-3 text-center">Coğrafi Backlink</th>
                    <th className="py-2.5 px-3 text-center">Harita / Local Pack</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {/* 1. Siteniz */}
                  <tr className="bg-indigo-500/15 text-white font-bold">
                    <td className="py-3 px-3 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-xs" />
                      <span>{selectedRegion.userFootprint.name}</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-cyan-500/30 text-cyan-200 border border-cyan-400/40">Siz</span>
                    </td>
                    <td className="py-3 px-3 text-center text-cyan-300 font-black text-sm">
                      %{selectedRegion.userFootprint.heatScore}
                    </td>
                    <td className="py-3 px-3 text-center font-bold">
                      %{selectedRegion.userFootprint.marketSharePercent}
                    </td>
                    <td className="py-3 px-3 text-center font-mono">
                      #{selectedRegion.userFootprint.averageRank}
                    </td>
                    <td className="py-3 px-3 text-center font-mono">
                      {selectedRegion.userFootprint.indexedUrls} URL
                    </td>
                    <td className="py-3 px-3 text-center font-mono">
                      {selectedRegion.userFootprint.referringDomains} Ref
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                        {selectedRegion.userFootprint.localPackPresence || "Dominant"}
                      </span>
                    </td>
                  </tr>

                  {/* 2. Pazar Lideri */}
                  <tr className="hover:bg-white/5">
                    <td className="py-3 px-3 flex items-center gap-2 text-slate-200">
                      <span className="w-2 h-2 rounded-full bg-purple-400" />
                      <span>{selectedRegion.compLeaderFootprint.name}</span>
                      <span className="text-[10px] text-slate-400">(Pazar Lideri #1)</span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-200">
                      %{selectedRegion.compLeaderFootprint.heatScore}
                    </td>
                    <td className="py-3 px-3 text-center font-mono">
                      %{selectedRegion.compLeaderFootprint.marketSharePercent}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-400">
                      #{selectedRegion.compLeaderFootprint.averageRank}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-400">
                      {selectedRegion.compLeaderFootprint.indexedUrls} URL
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-400">
                      {selectedRegion.compLeaderFootprint.referringDomains} Ref
                    </td>
                    <td className="py-3 px-3 text-center text-slate-400">
                      Dominant
                    </td>
                  </tr>

                  {/* 3. Bölgesel Güçlü Rakip */}
                  <tr className="hover:bg-white/5">
                    <td className="py-3 px-3 flex items-center gap-2 text-slate-300">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>{selectedRegion.compRegionalFootprint.name}</span>
                      <span className="text-[10px] text-slate-400">(Bölgesel #2)</span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-300">
                      %{selectedRegion.compRegionalFootprint.heatScore}
                    </td>
                    <td className="py-3 px-3 text-center font-mono">
                      %{selectedRegion.compRegionalFootprint.marketSharePercent}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-400">
                      #{selectedRegion.compRegionalFootprint.averageRank}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-400">
                      {selectedRegion.compRegionalFootprint.indexedUrls} URL
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-400">
                      {selectedRegion.compRegionalFootprint.referringDomains} Ref
                    </td>
                    <td className="py-3 px-3 text-center text-slate-400">
                      Orta
                    </td>
                  </tr>

                  {/* 4. Meydan Okuyan */}
                  <tr className="hover:bg-white/5">
                    <td className="py-3 px-3 flex items-center gap-2 text-slate-400">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span>{selectedRegion.compChallengerFootprint.name}</span>
                      <span className="text-[10px] text-slate-500">(Meydan Okuyan #3)</span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-400">
                      %{selectedRegion.compChallengerFootprint.heatScore}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-400">
                      %{selectedRegion.compChallengerFootprint.marketSharePercent}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-400">
                      #{selectedRegion.compChallengerFootprint.averageRank}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-400">
                      {selectedRegion.compChallengerFootprint.indexedUrls} URL
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-400">
                      {selectedRegion.compChallengerFootprint.referringDomains} Ref
                    </td>
                    <td className="py-3 px-3 text-center text-slate-500">
                      Zayıf
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Gemini Regional Tactic Box */}
            <div className="mt-5 p-4 rounded-2xl bg-indigo-950/70 border border-indigo-400/40 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-black text-amber-300 uppercase tracking-wider block mb-1">
                  Gemini AI Bölgesel Hamle & Ayak İzi Direktifi:
                </span>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                  {selectedRegion.geminiRegionalTactic}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* 6. GEMINI AI STRATEGIC FOOTPRINT DIRECTIVES & FLANKING STRATEGY */}
        {/* ===================================================================== */}
        <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-3xl p-6 sm:p-7 border border-indigo-200/80 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-xs">
              <Zap className="w-3 h-3 text-amber-300" />
              <span>Gemini 3.8 Flash Yönetici Direktifleri</span>
            </span>
            <span className="text-xs text-indigo-700 font-semibold font-mono">
              Küresel Büyüme & Lideri Çevreleme
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            {dataset.geminiFootprintAdvice.flankingStrategyTitle}
          </h3>

          <p className="text-xs sm:text-sm text-slate-700 mt-1 leading-relaxed">
            {dataset.geminiFootprintAdvice.executiveBrief}
          </p>

          <p className="text-xs text-indigo-950/80 bg-white/70 p-3 rounded-xl border border-indigo-200 mt-3 font-medium">
            <strong>Kuşatma Taktik Notu:</strong> {dataset.geminiFootprintAdvice.flankingStrategyDescription}
          </p>

          {/* 3 Action Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
            {dataset.geminiFootprintAdvice.expansionDirectives.map((directive, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-2xl p-4 border border-indigo-200/70 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                      {directive.badge}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 font-mono">
                      {directive.expectedTrafficUplift}
                    </span>
                  </div>

                  <h4 className="font-black text-slate-900 text-xs sm:text-sm mb-1">
                    {directive.title}
                  </h4>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {directive.rationale}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-indigo-700 font-bold">
                  <span>Hedef: {directive.targetRegion}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-indigo-600" />
                </div>
              </div>
            ))}
          </div>

          {/* White Space Highlights Grid */}
          <div className="mt-5 pt-4 border-t border-indigo-200/60">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Rakiplerin Boş Bıraktığı Bakir Alanlar (White Space Opportunities):</span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {dataset.geminiFootprintAdvice.whiteSpaceHighlights.map((ws, i) => (
                <div key={i} className="bg-white/80 p-3 rounded-xl border border-indigo-100 text-xs">
                  <div className="font-black text-slate-900 text-xs mb-1 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>{ws.regionName}</span>
                  </div>
                  <p className="text-slate-600 text-[11px] mb-1.5 leading-normal">
                    <strong className="text-slate-700">Açık:</strong> {ws.advantage}
                  </p>
                  <p className="text-indigo-900 text-[11px] font-medium leading-normal bg-indigo-50/80 p-1.5 rounded-lg border border-indigo-100">
                    <strong>Eylem:</strong> {ws.action}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
