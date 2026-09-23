import React, { useState, useEffect, useMemo, useCallback } from "react";
import { SiteConfig } from "../../types";
import {
  SectoralSeoStrategySummaryDataset,
  SectoralCompetitorTrend,
  RadarAxisGap,
  fetchSectoralSeoStrategySummary,
  generateFallbackSectoralStrategySummary
} from "../../utils/sectoralSeoStrategySummaryEngine";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  ShieldCheck,
  ShieldAlert,
  Target,
  FileText,
  Code2,
  Globe,
  RefreshCw,
  Copy,
  Check,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowRight,
  Flame,
  Award,
  CheckCircle2,
  Info,
  Clock,
  ChevronRight,
  BarChart3,
  Building2,
  MapPin,
  FileDown
} from "lucide-react";

interface SectoralSeoStrategySummaryCardProps {
  config: SiteConfig;
  className?: string;
  radarEntities?: any[];
  onNavigateTab?: (tabId: string) => void;
  onDownloadPdf?: () => void;
}

export const SectoralSeoStrategySummaryCard: React.FC<SectoralSeoStrategySummaryCardProps> = ({
  config,
  className = "",
  radarEntities,
  onNavigateTab,
  onDownloadPdf
}) => {
  const [dataset, setDataset] = useState<SectoralSeoStrategySummaryDataset>(() => {
    return generateFallbackSectoralStrategySummary(config, radarEntities);
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"all" | "trends" | "radar_gaps" | "roadmap">("all");
  const [selectedEntityId, setSelectedEntityId] = useState<string>("user-site");

  // Load data via Gemini API with fallback
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchSectoralSeoStrategySummary(config, radarEntities);
      setDataset(data);
    } catch (err) {
      console.error("Sectoral SEO Strategy load error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [config, radarEntities]);

  useEffect(() => {
    loadData();
  }, [config.companyName, config.sector, config.city]);

  // Copy recommendations to clipboard
  const handleCopyRecommendations = () => {
    if (!dataset?.strategicPlan) return;
    const plan = dataset.strategicPlan;
    const textToCopy = `=== ${dataset.companyName} | ${dataset.city} ${dataset.industry} SEKTÖREL SEO STRATEJİ ÖZETİ ===
Kaynak: ${dataset.source === "gemini_3.8_flash" ? "Google Gemini 3.8 Flash AI" : "Sektörel Algoritma Motoru"} (${dataset.generatedAt})

[YÖNETİCİ SENTEZİ]
${plan.executiveSummary}

[EN GÜÇLÜ KOZ]: ${plan.keyCompetitiveLeverage}
[KRİTİK AÇIK]: ${plan.primaryVulnerability}

[30 GÜNLÜK STRATEJİK EYLEM PLANI]
1. ${plan.quickWinsPhase.title} (${plan.quickWinsPhase.duration}):
${plan.quickWinsPhase.actions.map(a => `  - ${a}`).join("\n")}
Beklenen Etki: ${plan.quickWinsPhase.expectedImpact}

2. ${plan.mediumTermPhase.title} (${plan.mediumTermPhase.duration}):
${plan.mediumTermPhase.actions.map(a => `  - ${a}`).join("\n")}
Beklenen Etki: ${plan.mediumTermPhase.expectedImpact}

3. ${plan.longTermDefensePhase.title} (${plan.longTermDefensePhase.duration}):
${plan.longTermDefensePhase.actions.map(a => `  - ${a}`).join("\n")}
Beklenen Etki: ${plan.longTermDefensePhase.expectedImpact}

[ÖNCELİKLİ ÖNERİLER]
${plan.recommendations.map(r => `* [${r.priority.toUpperCase()}] ${r.title} (${r.radarAxis})
  Gerekçe: ${r.rationale}
  Aksiyon: ${r.actionableTip}
  Öngörülen Kazanç: ${r.projectedGain} (Efor: ${r.effort})`).join("\n\n")}

[30 GÜNLÜK HEDEF TAHMİNİ]
- Organik Trafik Büyümesi: ${plan.thirtyDayTargetForecast.projectedTrafficGrowth}
- SERP Sıralama Kazanımları: ${plan.thirtyDayTargetForecast.projectedRankGains}
- CTR Artışı: ${plan.thirtyDayTargetForecast.estimatedCtrBoost}
- Model Güven Skoru: %${plan.thirtyDayTargetForecast.confidenceScore}`;

    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const selectedEntity = useMemo(() => {
    return dataset.competitors.find(c => c.id === selectedEntityId) || dataset.competitors[0];
  }, [dataset.competitors, selectedEntityId]);

  return (
    <div
      id="sektorel-seo-strateji-ozet-karti"
      className={`bg-slate-900 border border-indigo-900/60 rounded-3xl p-6 sm:p-8 text-white shadow-2xl space-y-8 relative overflow-hidden ${className}`}
    >
      {/* Background Ambient Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER SECTION */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 border-b border-slate-800/80 pb-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-xs font-black tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Sektörel SEO Strateji Özet Kartı</span>
            </span>

            {dataset.isGeminiLive ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Gemini 3.8 Flash Canlı Analiz</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-[11px] font-bold">
                <Activity className="w-3 h-3 text-cyan-400" />
                <span>D3.js Radar Algoritma Motoru</span>
              </span>
            )}

            <span className="text-slate-400 text-xs font-mono">
              Son Güncelleme: {dataset.generatedAt}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
            <span>{dataset.city} {dataset.industry} Rekabet & Trend Sentezi</span>
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
            D3.js 6-eksenli radar verileri, pazar liderinin son 30 günlük SERP hareketleri ve Core Web Vitals performans farkları sentezlenerek 
            <strong> Google Gemini AI</strong> destekli stratejik büyüme yol haritası üretilmiştir.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            id="btn-refresh-gemini-strategy"
            onClick={loadData}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-50 ring-1 ring-indigo-400/40"
            title="D3.js verilerini Gemini 3.8 Flash modeline göndererek önerileri yeniler"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-white" : "text-indigo-200"}`} />
            <span>{isLoading ? "Gemini Analiz Ediyor..." : "Stratejiyi Yenile (Gemini AI)"}</span>
          </button>

          <button
            type="button"
            id="btn-copy-strategy-plan"
            onClick={handleCopyRecommendations}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
            title="Tüm stratejik önerileri ve 30 günlük planı panoya kopyala"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Kopyalandı!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Panoya Kopyala</span>
              </>
            )}
          </button>

          {onNavigateTab && (
            <button
              type="button"
              id="btn-jump-to-content-planner"
              onClick={() => onNavigateTab("customer-panel")}
              className="px-3.5 py-2.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Önerileri 30 Günlük İçerik Planlayıcıya aktar"
            >
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>İçerik Planlayıcı</span>
            </button>
          )}

          {onDownloadPdf && (
            <button
              type="button"
              id="btn-export-pdf-strategy-card"
              onClick={onDownloadPdf}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Kapsamlı PDF Raporu İndir"
            >
              <FileDown className="w-3.5 h-3.5 text-cyan-300" />
              <span>PDF İndir</span>
            </button>
          )}
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex p-1 bg-slate-950/80 border border-slate-800 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === "all"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Tüm Görünüm
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("trends")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "trends"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span>30 Günlük Trendler ({dataset.competitors.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("radar_gaps")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "radar_gaps"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-3 h-3 text-cyan-400" />
            <span>D3 Radar Boşluk Analizi ({dataset.axisGaps.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("roadmap")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "roadmap"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Gemini Yol Haritası (3 Aşama)</span>
          </button>
        </div>

        {/* 30-Day Growth Highlight Banner */}
        <div className="flex items-center gap-3 bg-indigo-950/40 border border-indigo-700/40 rounded-2xl px-4 py-2 text-xs">
          <span className="text-slate-400 font-semibold">Öngörülen 30 Günlük Organik Büyüme:</span>
          <span className="font-mono font-black text-emerald-400 text-sm">
            {dataset.strategicPlan.thirtyDayTargetForecast.projectedTrafficGrowth}
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 font-semibold">Hedef Kelime Kazanımı:</span>
          <span className="font-mono font-bold text-cyan-300 text-xs">
            {dataset.strategicPlan.thirtyDayTargetForecast.projectedRankGains}
          </span>
        </div>
      </div>

      {/* EXECUTIVE SYNTHESIS HERO CARD */}
      <div 
        id="gemini-executive-synthesis-card"
        className="bg-gradient-to-r from-slate-950 via-indigo-950/70 to-slate-950 border border-indigo-500/40 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/30 border border-indigo-400/40 text-indigo-300">
              <Sparkles className="w-5 h-5 text-indigo-300 animate-pulse" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-indigo-300 font-bold">
                Yapay Zeka Stratejik Yönetici Sentezi
              </div>
              <h3 className="text-base sm:text-lg font-black text-white">
                D3.js Radar & 30 Günlük SERP İvme Değerlendirmesi
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Güven Skoru:</span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-black">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>%{dataset.strategicPlan.thirtyDayTargetForecast.confidenceScore} Yüksek Güven</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-200 leading-relaxed font-normal">
          {dataset.strategicPlan.executiveSummary}
        </p>

        {/* 2 Key Pillars: Leverage vs Vulnerability */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3.5 space-y-1">
            <div className="text-[11px] font-black text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>En Güçlü Rekabet Kozunuz (Kaldıraç)</span>
            </div>
            <p className="text-xs text-emerald-100/90 leading-relaxed">
              {dataset.strategicPlan.keyCompetitiveLeverage}
            </p>
          </div>

          <div className="bg-rose-950/30 border border-rose-500/30 rounded-xl p-3.5 space-y-1">
            <div className="text-[11px] font-black text-rose-400 uppercase tracking-wide flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Kapatılması Gereken Kritik Açık</span>
            </div>
            <p className="text-xs text-rose-100/90 leading-relaxed">
              {dataset.strategicPlan.primaryVulnerability}
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 1: 30-DAY COMPETITOR TRENDS & MOMENTUM */}
      {(activeTab === "all" || activeTab === "trends") && (
        <div className="space-y-4" id="sectoral-competitor-trends-subgrid">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Rakiplerin SEO Performansı & Son 30 Günlük SERP Trendleri</span>
              </h3>
              <p className="text-xs text-slate-400">
                Pazardaki ilk 4 oyuncunun organik trafik ivmesi, kelime kazanım/kayıpları ve Core Web Vitals hareketleri.
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-950/70 px-2.5 py-1 rounded-lg border border-slate-800">
              30 Günlük SERP Penceresi
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {dataset.competitors.map(competitor => {
              const trend = competitor.thirtyDayTrend;
              const isPositive = trend.trafficVelocityPercent >= 0;
              const isSelected = selectedEntityId === competitor.id;

              return (
                <div
                  key={competitor.id}
                  onClick={() => setSelectedEntityId(competitor.id)}
                  className={`rounded-2xl p-4 transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-slate-900 border-indigo-400 ring-2 ring-indigo-500/30 shadow-xl"
                      : "bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: competitor.color }}
                      />
                      <span className="font-black text-xs text-white truncate" title={competitor.name}>
                        {competitor.name}
                      </span>
                    </div>

                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                      Sıra #{competitor.rank}
                    </span>
                  </div>

                  {/* Domain & Speed */}
                  <div className="text-[11px] text-slate-400 font-mono truncate mb-3">
                    {competitor.domain}
                  </div>

                  {/* 30-Day Traffic Velocity Badge */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">30 Günlük Trafik:</div>
                    <div
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-black ${
                        isPositive
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-rose-400" />
                      )}
                      <span>{isPositive ? `+${trend.trafficVelocityPercent}%` : `${trend.trafficVelocityPercent}%`}</span>
                    </div>
                  </div>

                  {/* Mini Sparkline Visualization */}
                  <div className="bg-slate-950/80 rounded-xl p-2.5 border border-slate-800/80 my-2.5 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>30 Günlük Eğilim</span>
                      <span className={isPositive ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                        {trend.netKeywordsChange > 0 ? `+${trend.netKeywordsChange} Kelime` : `${trend.netKeywordsChange} Kelime`}
                      </span>
                    </div>
                    {/* SVG Sparkline */}
                    <div className="h-9 w-full flex items-end">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 120 30" preserveAspectRatio="none">
                        {/* Trend Area */}
                        <defs>
                          <linearGradient id={`grad-${competitor.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={isPositive ? "#10b981" : "#f43f5e"} stopOpacity="0.4" />
                            <stop offset="100%" stopColor={isPositive ? "#10b981" : "#f43f5e"} stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        {(() => {
                          const pts = trend.sparklinePoints;
                          const min = Math.min(...pts) * 0.9;
                          const max = Math.max(...pts) * 1.05;
                          const range = max - min || 1;
                          const coords = pts.map((val, idx) => {
                            const x = (idx / (pts.length - 1)) * 120;
                            const y = 28 - ((val - min) / range) * 24;
                            return `${x},${y}`;
                          });
                          const linePath = `M ${coords.join(" L ")}`;
                          const areaPath = `M ${coords[0]} L ${coords.join(" L ")} L 120,30 L 0,30 Z`;
                          return (
                            <>
                              <path d={areaPath} fill={`url(#grad-${competitor.id})`} />
                              <path
                                d={linePath}
                                fill="none"
                                stroke={isPositive ? "#10b981" : "#f43f5e"}
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                            </>
                          );
                        })()}
                      </svg>
                    </div>
                  </div>

                  {/* Core Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2 text-center text-xs pt-1 border-t border-slate-800/80">
                    <div className="bg-slate-900/60 p-1.5 rounded-lg">
                      <div className="text-[9px] text-slate-400 font-bold uppercase">DA Otorite</div>
                      <div className="font-mono font-black text-white text-xs">{competitor.metrics.domainAuthority}/100</div>
                    </div>
                    <div className="bg-slate-900/60 p-1.5 rounded-lg">
                      <div className="text-[9px] text-slate-400 font-bold uppercase">Hız Skoru</div>
                      <div className={`font-mono font-black text-xs ${competitor.metrics.siteSpeed >= 90 ? "text-emerald-400" : competitor.metrics.siteSpeed >= 70 ? "text-amber-400" : "text-rose-400"}`}>
                        {competitor.metrics.siteSpeed}/100
                      </div>
                    </div>
                  </div>

                  {/* Momentum Note */}
                  <div className="mt-2.5 text-[10px] text-slate-300 leading-tight line-clamp-2">
                    {trend.momentumSummary}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: D3.JS RADAR AXIS GAP ANALYSIS */}
      {(activeTab === "all" || activeTab === "radar_gaps") && (
        <div className="space-y-4" id="d3-radar-gap-matrix">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>D3.js Radar Verisi Sentezi & Eksenel Boşluk (Gap) Matrisi</span>
              </h3>
              <p className="text-xs text-slate-400">
                Sitenizin D3.js 6 radar boyutu üzerinden pazar liderine ve sektör ortalamasına karşı net puan farkları.
              </p>
            </div>
            <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/40 px-3 py-1 rounded-lg border border-cyan-800/50">
              6 Temel SEO Ekseni
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {dataset.axisGaps.map(gap => {
              const isSuperior = gap.advantageType === "superior";
              const isVulnerable = gap.advantageType === "vulnerable";

              return (
                <div
                  key={gap.axisKey}
                  className={`rounded-2xl p-4 border transition-all ${
                    isSuperior
                      ? "bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/50"
                      : isVulnerable
                      ? "bg-rose-950/20 border-rose-500/30 hover:border-rose-500/50"
                      : "bg-slate-950/70 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-black text-xs text-white">{gap.axisLabel}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black ${
                        isSuperior
                          ? "bg-emerald-500/30 text-emerald-300 border border-emerald-400/40"
                          : isVulnerable
                          ? "bg-rose-500/30 text-rose-300 border border-rose-400/40"
                          : "bg-amber-500/30 text-amber-300 border border-amber-400/40"
                      }`}
                    >
                      {gap.gap > 0 ? `+${gap.gap} Üstünlük` : `${gap.gap} Açık`}
                    </span>
                  </div>

                  {/* Comparative Progress Bars */}
                  <div className="space-y-1.5 my-3">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-cyan-300 font-bold">{dataset.companyName} (Siz)</span>
                      <span className="text-white font-black">{gap.userScore}/100</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${gap.userScore}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono pt-1">
                      <span className="text-violet-300 font-semibold">Pazar Lideri</span>
                      <span className="text-violet-300 font-bold">{gap.leaderScore}/100</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-violet-500 h-full rounded-full"
                        style={{ width: `${gap.leaderScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Strategic Note */}
                  <p className="text-[11px] text-slate-300 leading-snug pt-2 border-t border-slate-800/80">
                    {gap.strategicNote}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 3: GEMINI STRATEGIC 30-DAY ACTION ROADMAP */}
      {(activeTab === "all" || activeTab === "roadmap") && (
        <div className="space-y-6" id="gemini-strategic-roadmap">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>Gemini 3.8 Flash: 30 Günlük Sektörel Eylem Planı</span>
              </h3>
              <p className="text-xs text-slate-400">
                D3.js radar boşluklarını kapatmak ve liderin pazar payını devralmak için kademeli 3 aşamalı uygulama planı.
              </p>
            </div>
            <span className="text-[11px] font-mono text-amber-300 bg-amber-950/40 px-3 py-1 rounded-lg border border-amber-800/40">
              3 Kademeli Uygulama Takvimi
            </span>
          </div>

          {/* 3 Phases Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Phase 1 */}
            <div className="bg-slate-950/80 border border-amber-500/40 rounded-2xl p-5 space-y-3.5 relative overflow-hidden">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-400/40">
                  {dataset.strategicPlan.quickWinsPhase.tag}
                </span>
                <span className="text-xs font-mono text-slate-400 font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>{dataset.strategicPlan.quickWinsPhase.duration}</span>
                </span>
              </div>

              <h4 className="text-sm font-black text-white">
                {dataset.strategicPlan.quickWinsPhase.title}
              </h4>

              <ul className="space-y-2 text-xs text-slate-300">
                {dataset.strategicPlan.quickWinsPhase.actions.map((act, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{act}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-2 border-t border-slate-800 text-[11px] text-amber-300 font-semibold">
                Beklenen Etki: {dataset.strategicPlan.quickWinsPhase.expectedImpact}
              </div>
            </div>

            {/* Phase 2 */}
            <div className="bg-slate-950/80 border border-indigo-500/40 rounded-2xl p-5 space-y-3.5 relative overflow-hidden">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-400/40">
                  {dataset.strategicPlan.mediumTermPhase.tag}
                </span>
                <span className="text-xs font-mono text-slate-400 font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-indigo-400" />
                  <span>{dataset.strategicPlan.mediumTermPhase.duration}</span>
                </span>
              </div>

              <h4 className="text-sm font-black text-white">
                {dataset.strategicPlan.mediumTermPhase.title}
              </h4>

              <ul className="space-y-2 text-xs text-slate-300">
                {dataset.strategicPlan.mediumTermPhase.actions.map((act, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <span>{act}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-2 border-t border-slate-800 text-[11px] text-indigo-300 font-semibold">
                Beklenen Etki: {dataset.strategicPlan.mediumTermPhase.expectedImpact}
              </div>
            </div>

            {/* Phase 3 */}
            <div className="bg-slate-950/80 border border-emerald-500/40 rounded-2xl p-5 space-y-3.5 relative overflow-hidden">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                  {dataset.strategicPlan.longTermDefensePhase.tag}
                </span>
                <span className="text-xs font-mono text-slate-400 font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-400" />
                  <span>{dataset.strategicPlan.longTermDefensePhase.duration}</span>
                </span>
              </div>

              <h4 className="text-sm font-black text-white">
                {dataset.strategicPlan.longTermDefensePhase.title}
              </h4>

              <ul className="space-y-2 text-xs text-slate-300">
                {dataset.strategicPlan.longTermDefensePhase.actions.map((act, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{act}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-2 border-t border-slate-800 text-[11px] text-emerald-300 font-semibold">
                Beklenen Etki: {dataset.strategicPlan.longTermDefensePhase.expectedImpact}
              </div>
            </div>
          </div>

          {/* PRIORITIZED RECOMMENDATION TILES */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4 text-rose-400" />
              <span>Önceliklendirilmiş Stratejik Tavsiyeler & Aksiyon Adımları</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {dataset.strategicPlan.recommendations.map(rec => (
                <div
                  key={rec.id}
                  className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-2.5 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase font-mono ${
                          rec.priority === "high"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : rec.priority === "medium"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        }`}
                      >
                        {rec.priority === "high" ? "Yüksek Öncelik" : "Orta Öncelik"}
                      </span>
                      <span className="text-[11px] text-slate-400 font-semibold">
                        {rec.radarAxis}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      Efor: {rec.effort}
                    </span>
                  </div>

                  <h5 className="text-sm font-black text-white">{rec.title}</h5>
                  <p className="text-xs text-slate-300 leading-relaxed">{rec.rationale}</p>

                  <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-xl p-2.5 text-xs text-indigo-200 flex items-start gap-2">
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <span><strong>Aksiyon:</strong> {rec.actionableTip}</span>
                  </div>

                  <div className="text-[11px] font-mono text-emerald-400 font-bold">
                    Öngörülen Kazanç: {rec.projectedGain}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER METRICS SUMMARY BAR */}
      <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-slate-500" />
          <span>Analiz Edilen Şirket: <strong>{dataset.companyName}</strong> ({dataset.domain})</span>
          <span className="text-slate-600">•</span>
          <span>Sektör: <strong>{dataset.industry}</strong></span>
          <span className="text-slate-600">•</span>
          <span>Bölge: <strong>{dataset.city}</strong></span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-slate-500">
            D3.js Radar + Gemini 3.8 Flash Algoritması
          </span>
        </div>
      </div>
    </div>
  );
};
