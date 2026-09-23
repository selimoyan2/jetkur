import React, { useState, useEffect, useMemo } from "react";
import { SiteConfig } from "../../types";
import { 
  CompetitorSeoPerformanceDataset, 
  SeoPerformanceAxisDef, 
  CompetitorEntity, 
  fetchCompetitorSeoPerformance, 
  exportPerformanceRadarCsv 
} from "../../utils/competitorSeoPerformanceRadarEngine";
import { D3CompetitorSeoPerformanceRadar } from "./D3CompetitorSeoPerformanceRadar";
import {
  Target,
  Sparkles,
  RefreshCw,
  Download,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Award,
  Zap,
  Building2,
  MapPin,
  Sliders,
  RotateCcw,
  CheckCircle2,
  Layers,
  BarChart3,
  Globe,
  ArrowUpRight,
  Info,
  Check,
  SlidersHorizontal
} from "lucide-react";

interface CompetitorSeoPerformanceRadarModuleProps {
  config: SiteConfig;
  className?: string;
  onDownloadPdf?: () => void;
  onOpenCustomReport?: () => void;
}

const POPULAR_INDUSTRIES = [
  "Hukuk / Avukatlık",
  "Ağız ve Diş Sağlığı",
  "E-Ticaret / Perakende",
  "Bilişim / Yazılım",
  "İnşaat / Mimarlık",
  "Otomotiv / Servis",
  "Turizm / Otelcilik",
  "Finans / Danışmanlık"
];

export const CompetitorSeoPerformanceRadarModule: React.FC<CompetitorSeoPerformanceRadarModuleProps> = ({
  config,
  className = "",
  onDownloadPdf,
  onOpenCustomReport
}) => {
  const [industryInput, setIndustryInput] = useState<string>(config.sector || "Hukuk");
  const [cityInput, setCityInput] = useState<string>(config.city || "İstanbul");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataset, setDataset] = useState<CompetitorSeoPerformanceDataset | null>(null);
  const [activeEntityIds, setActiveEntityIds] = useState<string[]>([]);
  const [selectedAxisKey, setSelectedAxisKey] = useState<string | null>("siteSpeed");

  // What-If Strategy Simulator State
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulatedBoosts, setSimulatedBoosts] = useState({
    domainAuthority: 0,
    backlinkProfile: 0,
    contentDepth: 0,
    keywordVisibility: 0,
    siteSpeed: 0
  });

  // Load dataset
  const loadData = async (ind: string, ct: string) => {
    setIsLoading(true);
    try {
      const data = await fetchCompetitorSeoPerformance(config, ind, ct);
      setDataset(data);
      setActiveEntityIds(data.entities.map(e => e.id));
    } catch (err) {
      console.error("Failed to load competitor SEO performance data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(industryInput, cityInput);
  }, []);

  const handleRefresh = () => {
    loadData(industryInput, cityInput);
  };

  const handleToggleEntity = (id: string) => {
    setActiveEntityIds(prev => {
      if (prev.includes(id)) {
        if (prev.length <= 1) return prev; // keep at least 1 active
        return prev.filter(item => item !== id);
      }
      return [...prev, id];
    });
  };

  const handleExportCsv = () => {
    if (!dataset) return;
    const csvStr = exportPerformanceRadarCsv(dataset);
    const blob = new Blob([csvStr], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `sektorel-rakip-seo-performans-radari-${dataset.industry}-${dataset.city}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Selected Axis Object
  const selectedAxis = useMemo(() => {
    if (!dataset || !selectedAxisKey) return null;
    return dataset.axes.find(a => a.key === selectedAxisKey) || dataset.axes[0];
  }, [dataset, selectedAxisKey]);

  // Entities shortcut
  const userEntity = useMemo(() => dataset?.entities.find(e => e.isUser) || dataset?.entities[0], [dataset]);
  const leaderEntity = useMemo(() => dataset?.entities.find(e => e.rank === 1) || dataset?.entities[1], [dataset]);

  // Simulated User Overall Score
  const simulatedOverallScore = useMemo(() => {
    if (!dataset || !userEntity) return 0;
    if (!isSimulating) return dataset.insights.userOverallScore;
    let total = 0;
    let weightSum = 0;
    dataset.axes.forEach(ax => {
      let val = userEntity.metrics[ax.key] || 50;
      if (simulatedBoosts[ax.key as keyof typeof simulatedBoosts]) {
        val = Math.min(100, val + simulatedBoosts[ax.key as keyof typeof simulatedBoosts]);
      }
      total += val * ax.weight;
      weightSum += ax.weight;
    });
    return Math.round(total / (weightSum || 100));
  }, [dataset, userEntity, isSimulating, simulatedBoosts]);

  return (
    <div
      className={`rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden text-slate-800 dark:text-slate-100 ${className}`}
      id="competitor-seo-performance-radar-module"
      data-testid="competitor-seo-performance-radar-module"
    >
      {/* 1. Header Banner */}
      <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400">
                <Target className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  Sektörel Rakip SEO Performans Radarı
                  <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    D3.js Vektör Motoru
                  </span>
                </h2>
                <p className="text-xs text-slate-300">
                  {config.companyName || "Siteniz"} ile pazar lideri ve bölgesel rakiplerin 8 temel SEO boyutundaki güç dengesini canlı olarak karşılaştırın
                </p>
              </div>
            </div>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-2 self-start lg:self-auto flex-wrap">
            {/* Custom Sector Input */}
            <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-700/80">
              <Building2 className="w-3.5 h-3.5 text-slate-400 ml-1" />
              <input
                type="text"
                value={industryInput}
                onChange={(e) => setIndustryInput(e.target.value)}
                placeholder="Sektör..."
                className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-28 sm:w-36 font-medium"
              />
              <span className="text-slate-600">|</span>
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                placeholder="Şehir..."
                className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-20 sm:w-24 font-medium"
              />
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                <span>Canlı Çek</span>
              </button>
            </div>

            {/* CSV Export */}
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={!dataset}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer disabled:opacity-50"
              title="Tüm Performans Verilerini CSV Olarak İndir"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>CSV İndir</span>
            </button>

            {/* Customizable Vector Report Editor */}
            {onOpenCustomReport && (
              <button
                type="button"
                id="radar-module-customize-report-btn"
                onClick={onOpenCustomReport}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-200 border border-indigo-400/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                title="Rapor sayfalarını, radar grafiklerini ve ısı haritasını vektörel kalitede düzenleyin"
              >
                <SlidersHorizontal className="w-4 h-4 text-cyan-300" />
                <span>Raporu Özelleştir</span>
              </button>
            )}

            {/* Comprehensive PDF Export */}
            {onDownloadPdf && (
              <button
                type="button"
                id="radar-module-download-pdf-btn"
                onClick={onDownloadPdf}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 ring-1 ring-blue-400/30"
                title="Download comprehensive PDF report of competitor SEO radar data and alert logs"
              >
                <Download className="w-4 h-4 text-cyan-200" />
                <span>Download PDF</span>
              </button>
            )}
          </div>
        </div>

        {/* Popular Sectors Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto mt-4 pt-3 border-t border-slate-800/80 text-[11px] no-scrollbar">
          <span className="text-slate-400 shrink-0 font-medium mr-1">Sektör Seçimi:</span>
          {POPULAR_INDUSTRIES.map((ind) => (
            <button
              key={ind}
              type="button"
              onClick={() => {
                const pureSector = ind.split("/")[0].trim();
                setIndustryInput(pureSector);
                loadData(pureSector, cityInput);
              }}
              className={`px-2.5 py-1 rounded-lg transition-all shrink-0 cursor-pointer border ${
                industryInput.toLowerCase().includes(ind.split("/")[0].trim().toLowerCase())
                  ? "bg-cyan-600/30 border-cyan-500/50 text-cyan-300 font-bold"
                  : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {ind}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Executive KPI Summary Cards */}
      {dataset && userEntity && leaderEntity && (
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {/* 1. Overall SEO Score */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>Genel SEO Performans Skoru</span>
                <Award className="w-4 h-4 text-cyan-500" />
              </div>
              <div className="text-2xl font-black text-cyan-500 font-mono mt-1 flex items-baseline gap-1.5">
                <span>%{isSimulating ? simulatedOverallScore : dataset.insights.userOverallScore}</span>
                {isSimulating && (
                  <span className="text-xs text-emerald-500 font-bold">
                    (+{simulatedOverallScore - dataset.insights.userOverallScore})
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                <span>Pazar Lideri: %{dataset.insights.leaderOverallScore}</span>
                <span className={simulatedOverallScore >= dataset.insights.leaderOverallScore ? "text-emerald-500 font-bold" : "text-amber-500 font-bold"}>
                  {simulatedOverallScore >= dataset.insights.leaderOverallScore ? "Pazar Lideri" : `-%${dataset.insights.leaderOverallScore - simulatedOverallScore}`}
                </span>
              </div>
            </div>

            {/* 2. Top Advantage */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>En Güçlü Boyut</span>
                <Zap className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1 truncate">
                Sayfa Hızı & Core Web Vitals
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>%{userEntity.metrics.siteSpeed} vs %{leaderEntity.metrics.siteSpeed} (+36 Fark)</span>
              </div>
            </div>

            {/* 3. Critical Gap */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>En Kritik Gelişim Alanı</span>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-base font-bold text-amber-600 dark:text-amber-400 mt-1 truncate">
                Backlink Otoritesi
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                <span>%{userEntity.metrics.backlinkProfile} vs %{leaderEntity.metrics.backlinkProfile} (-36 Fark)</span>
              </div>
            </div>

            {/* 4. Potential Opportunity */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>Stratejik Fırsat</span>
                <TrendingUp className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-base font-bold text-indigo-600 dark:text-indigo-400 mt-1 truncate">
                Pazar Liderliği Hedefi
              </div>
              <div className="text-[10px] text-indigo-500 dark:text-indigo-400 mt-1 font-medium">
                <span>30 Günde Lideri Geçme Şansı</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Split: Interactive D3 Radar Chart (7 cols) + Strategy Simulator (5 cols) */}
      {dataset && (
        <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: D3 Radar (7 cols) */}
          <div className="lg:col-span-7 bg-slate-50/50 dark:bg-slate-950/30 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-cyan-500" />
                <span>Çok Boyutlu SEO Performans Radarı</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">
                {dataset.axes.length} Boyut • {dataset.entities.length} Oyuncu
              </span>
            </div>

            <D3CompetitorSeoPerformanceRadar
              axes={dataset.axes}
              entities={dataset.entities}
              activeEntityIds={activeEntityIds}
              onToggleEntity={handleToggleEntity}
              selectedAxisKey={selectedAxisKey}
              onSelectAxis={(k) => setSelectedAxisKey(k)}
              simulatedBoosts={simulatedBoosts}
              isSimulating={isSimulating}
            />

            {/* Instruction Tip */}
            <div className="mt-3 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-500 shrink-0" />
              <span>
                Grafik üzerindeki eksen isimlerine tıklayarak o boyuta ait derinlemesine strateji analizini ve eylem planını görüntüleyebilirsiniz.
              </span>
            </div>
          </div>

          {/* Right Column: Selected Axis & What-If Strategy Simulator (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Selected Axis Strategy Card */}
            {selectedAxis && userEntity && leaderEntity && (
              <div className="p-4 rounded-2xl bg-cyan-50/70 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-900/60 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-300 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" />
                    Seçili Boyut İncelemesi
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-200 dark:bg-cyan-800 text-cyan-800 dark:text-cyan-100">
                    Ağırlık: %{selectedAxis.weight}
                  </span>
                </div>

                <h4 className="text-base font-black text-slate-900 dark:text-white mt-1.5">
                  {selectedAxis.label}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {selectedAxis.description}
                </p>

                {/* Score Comparison */}
                <div className="grid grid-cols-3 gap-2 mt-3 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-cyan-100 dark:border-cyan-900/40 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Siteniz</span>
                    <span className="text-lg font-black text-cyan-600 font-mono">
                      %{userEntity.metrics[selectedAxis.key] || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Pazar Lideri</span>
                    <span className="text-lg font-black text-purple-600 font-mono">
                      %{leaderEntity.metrics[selectedAxis.key] || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Fark Durumu</span>
                    <span className={`text-base font-black font-mono ${
                      (userEntity.metrics[selectedAxis.key] || 0) >= (leaderEntity.metrics[selectedAxis.key] || 0)
                        ? "text-emerald-500"
                        : "text-amber-500"
                    }`}>
                      {(userEntity.metrics[selectedAxis.key] || 0) >= (leaderEntity.metrics[selectedAxis.key] || 0)
                        ? `+${(userEntity.metrics[selectedAxis.key] || 0) - (leaderEntity.metrics[selectedAxis.key] || 0)}`
                        : `${(userEntity.metrics[selectedAxis.key] || 0) - (leaderEntity.metrics[selectedAxis.key] || 0)}`}
                    </span>
                  </div>
                </div>

                {/* Tactical Recommendation */}
                <div className="mt-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                    <span>Taktiksel Optimizasyon Reçetesi:</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                    {selectedAxis.bestPractice}
                  </p>
                </div>
              </div>
            )}

            {/* What-If Strategy Simulator */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    What-If Büyüme Simülatörü
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSimulating(!isSimulating);
                      if (!isSimulating) {
                        setSimulatedBoosts({
                          domainAuthority: 15,
                          backlinkProfile: 25,
                          contentDepth: 18,
                          keywordVisibility: 16,
                          siteSpeed: 0
                        });
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isSimulating
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300"
                    }`}
                  >
                    {isSimulating ? "Simülasyon Aktif" : "Simülasyonu Başlat"}
                  </button>

                  {isSimulating && (
                    <button
                      type="button"
                      onClick={() => setSimulatedBoosts({ domainAuthority: 0, backlinkProfile: 0, contentDepth: 0, keywordVisibility: 0, siteSpeed: 0 })}
                      className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-all cursor-pointer"
                      title="Sıfırla"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                SEO yatırımlarınızın radardaki etkisini ve pazar liderini nerede yakalayacağınızı gerçek zamanlı simüle edin:
              </p>

              {isSimulating ? (
                <div className="space-y-3 pt-1">
                  {/* Slider 1: Backlink & DA */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Dijital PR & Backlink Kampanyası:
                      </span>
                      <span className="font-mono font-bold text-indigo-500">
                        +{simulatedBoosts.backlinkProfile} Puan
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="35"
                      value={simulatedBoosts.backlinkProfile}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setSimulatedBoosts(prev => ({
                          ...prev,
                          backlinkProfile: val,
                          domainAuthority: Math.round(val * 0.7)
                        }));
                      }}
                      className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Slider 2: Content Depth */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Kapsamlı İçerik & Konu Kümeleri:
                      </span>
                      <span className="font-mono font-bold text-cyan-500">
                        +{simulatedBoosts.contentDepth} Puan
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      value={simulatedBoosts.contentDepth}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setSimulatedBoosts(prev => ({
                          ...prev,
                          contentDepth: val,
                          keywordVisibility: Math.round(val * 0.8)
                        }));
                      }}
                      className="w-full accent-cyan-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Simulation Result Box */}
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                    <span>Tahmini Yeni Pazar Pozisyonu:</span>
                    <b className="font-mono font-bold text-sm">
                      {simulatedOverallScore >= (dataset?.insights.leaderOverallScore || 80)
                        ? "🏆 Sektörün Yeni #1 Lideri"
                        : `#2 Sıra (%${simulatedOverallScore})`}
                    </b>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 text-center text-xs text-slate-400">
                  Simülatörü başlatarak potansiyel SEO hamlelerinizin radardaki izdüşümünü test edin.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Head-to-Head Comparative Scorecard Table */}
      {dataset && (
        <div className="p-5 sm:p-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-500" />
              <span>Detaylı Kıyaslama Karnesi (8 SEO Boyutu)</span>
            </h4>
            <span className="text-[11px] text-slate-400">Tüm değerler 100 üzerinden normalize edilmiştir</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 text-[11px]">
                  <th className="p-3 font-bold">SEO Boyutu</th>
                  <th className="p-3 font-bold">Ağırlık</th>
                  <th className="p-3 font-bold text-cyan-600 dark:text-cyan-400">{userEntity?.name || "Siteniz"}</th>
                  <th className="p-3 font-bold text-purple-600 dark:text-purple-400">{leaderEntity?.name || "Lider"}</th>
                  <th className="p-3 font-bold text-emerald-600 dark:text-emerald-400">Bölgesel Rakip</th>
                  <th className="p-3 font-bold text-amber-600 dark:text-amber-400">Meydan Okuyan</th>
                  <th className="p-3 font-bold">Fark (Siz vs Lider)</th>
                  <th className="p-3 font-bold">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                {dataset.axes.map((ax) => {
                  const uVal = userEntity?.metrics[ax.key] || 0;
                  const lVal = leaderEntity?.metrics[ax.key] || 0;
                  const comp2Val = dataset.entities[2]?.metrics[ax.key] || 0;
                  const comp3Val = dataset.entities[3]?.metrics[ax.key] || 0;
                  const gap = uVal - lVal;
                  const isSelected = selectedAxisKey === ax.key;

                  return (
                    <tr
                      key={ax.key}
                      onClick={() => setSelectedAxisKey(ax.key)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-cyan-50/50 dark:bg-cyan-950/20 font-bold"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      }`}
                    >
                      <td className="p-3 font-sans font-medium text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${isSelected ? "bg-cyan-500" : "bg-slate-300"}`} />
                        {ax.label}
                      </td>
                      <td className="p-3 text-slate-400 font-sans">%{ax.weight}</td>
                      <td className="p-3 font-bold text-cyan-600 dark:text-cyan-400">%{uVal}</td>
                      <td className="p-3 text-purple-600 dark:text-purple-400">%{lVal}</td>
                      <td className="p-3 text-emerald-600 dark:text-emerald-400">%{comp2Val}</td>
                      <td className="p-3 text-amber-600 dark:text-amber-400">%{comp3Val}</td>
                      <td className={`p-3 font-bold ${gap >= 0 ? "text-emerald-500" : "text-amber-500"}`}>
                        {gap >= 0 ? `+${gap}` : gap}
                      </td>
                      <td className="p-3 font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          gap >= 10
                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                            : gap <= -10
                            ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                            : "bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300"
                        }`}>
                          {gap >= 10 ? "Lider" : gap <= -10 ? "Açık Var" : "Rekabetçi"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Footer Details */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-500" />
          <span>
            Veri Altyapısı: <b className="text-slate-700 dark:text-slate-300">{dataset?.source || "Sektörel İstihbarat Motoru"}</b> • Güncellenme: {dataset?.fetchedAt || "Şimdi"}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400">
            <Check className="w-3.5 h-3.5" /> D3.js Vektörel Radar
          </span>
          <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-3.5 h-3.5" /> What-If Simülatörü
          </span>
        </div>
      </div>
    </div>
  );
};
