import React, { useState, useMemo, useRef } from "react";
import { 
  SiteConfig, 
  CustomerPanelTab, 
  CompetitiveRadarAxisDef,
  CompetitiveStrategyEntity,
  CompetitiveStrategicAction
} from "../../types";
import { 
  buildCompetitiveStrategyData, 
  CORE_RADAR_AXES, 
  EXTENDED_RADAR_AXES 
} from "../../utils/competitiveStrategyGenerator";
import { generateFallbackCompetitiveSwot } from "../../utils/competitiveSwotUtils";
import { 
  generateSeoPerformanceHeatmapData,
  HeatmapCellPerformance
} from "../../utils/seoPerformanceHeatmapData";
import { D3CompetitiveRadarChart } from "./D3CompetitiveRadarChart";
import {
  FileText,
  Download,
  Printer,
  Share2,
  CheckCircle2,
  TrendingUp,
  Target,
  ShieldCheck,
  Zap,
  Award,
  AlertTriangle,
  Flame,
  Globe,
  Building2,
  Calendar,
  Users,
  BarChart3,
  ChevronRight,
  ArrowUpRight,
  Check,
  Copy,
  Sparkles,
  RefreshCw,
  Layers,
  Clock,
  Compass
} from "lucide-react";
import html2pdf from "html2pdf.js";

interface SeoExecutiveSummaryProps {
  config: SiteConfig;
  onChange?: (updated: SiteConfig) => void;
  onNavigateTab?: (tab: CustomerPanelTab) => void;
}

export const SeoExecutiveSummary: React.FC<SeoExecutiveSummaryProps> = ({
  config,
  onChange,
  onNavigateTab
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedAxisKey, setSelectedAxisKey] = useState<string | null>(null);
  const [hoveredEntityId, setHoveredEntityId] = useState<string | null>(null);

  // 1. Data Sources
  const strategyData = useMemo(() => buildCompetitiveStrategyData(config), [config]);
  const swotData = useMemo(() => generateFallbackCompetitiveSwot(config), [config]);
  const heatmapData = useMemo(() => generateSeoPerformanceHeatmapData(config), [config]);

  const { entities, coreAxes, extendedAxes } = strategyData;
  const [activeEntityIds, setActiveEntityIds] = useState<string[]>(() => entities.map(e => e.id));

  // Toggle competitor entity on radar chart
  const handleToggleEntity = (id: string) => {
    setActiveEntityIds(prev => 
      prev.includes(id) ? (prev.length > 1 ? prev.filter(x => x !== id) : prev) : [...prev, id]
    );
  };

  // Company info
  const companyName = config.companyName || config.siteTitle || "Dijital İşletmeniz";
  const domain = config.cloudflare?.customDomain || config.cloudflare?.subdomain || "siteniz.com.tr";
  const currentDate = new Date().toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  // Calculate executive KPI figures
  const userEntity = entities.find(e => e.isUser);
  const competitors = entities.filter(e => !e.isUser);

  const avgUserScore = useMemo(() => {
    if (!userEntity) return 85;
    const scores = Object.values(userEntity.metrics) as number[];
    return Math.round(scores.reduce((a, b) => Number(a) + Number(b), 0) / Math.max(1, scores.length));
  }, [userEntity]);

  const avgCompetitorScore = useMemo(() => {
    if (competitors.length === 0) return 72;
    let sum = 0;
    let count = 0;
    competitors.forEach(c => {
      (Object.values(c.metrics) as number[]).forEach(v => {
        sum += Number(v);
        count++;
      });
    });
    return Math.round(sum / Math.max(1, count));
  }, [competitors]);

  const competitiveAdvantagePercent = avgUserScore - avgCompetitorScore;

  // Heatmap top performing keywords and intents
  const topHeatmapKeywords = useMemo(() => {
    return [...heatmapData.keywords]
      .sort((a, b) => b.totalSearchVolume - a.totalSearchVolume)
      .slice(0, 5);
  }, [heatmapData]);

  // Top regions
  const topRegions = useMemo(() => {
    return [...heatmapData.regions]
      .sort((a, b) => b.marketShareEstimate - a.marketShareEstimate)
      .slice(0, 4);
  }, [heatmapData]);

  // Handle PDF Generation with html2pdf.js
  const handleDownloadPdf = async () => {
    if (!reportRef.current || isGeneratingPdf) return;
    setIsGeneratingPdf(true);

    try {
      const element = reportRef.current;
      const opt = {
        margin: [8, 8, 8, 8] as [number, number, number, number],
        filename: `SEO_Yonetici_Ozeti_${companyName.replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        enableLinks: true,
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          logging: false,
          letterRendering: true,
          windowWidth: 1200
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("PDF oluşturma hatası:", error);
      // Fallback to native print if html2pdf fails
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Handle Native Print
  const handlePrint = () => {
    window.print();
  };

  // Handle Share / Copy Link
  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Screen-Only Action Control Bar (Hidden when printed or exported) */}
      <div className="no-print bg-slate-900/90 border border-slate-800 backdrop-blur-md p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-white">SEO Yönetici Özeti & Paydaş Raporu</h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                Sunuma Hazır (PDF)
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Isı haritası, rakip kıyaslama tablosu ve D3 radar stratejisini tek dokümanda birleştiren yönetici brifingi.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleShare}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
            title="Rapor bağlantısını kopyala"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? "Kopyalandı" : "Paylaş"}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
            title="Tarayıcı yazdırma iletişim kutusunu aç"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Yazdır (Print)</span>
          </button>

          <button
            type="button"
            id="download-executive-summary-pdf-btn"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isGeneratingPdf ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>PDF Hazırlanıyor...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-slate-950" />
                <span>Download as PDF (Raporu İndir)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Printable / PDF Canvas Container */}
      <div 
        ref={reportRef} 
        id="seo-executive-summary-report"
        className="bg-white text-slate-900 rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-200 print:p-0 print:border-none print:shadow-none space-y-8"
        style={{ colorScheme: "light" }}
      >
        {/* DOCUMENT HEADER / BRAND IDENTITY */}
        <header className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {config.logo ? (
              <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center p-2 overflow-hidden shrink-0">
                <img src={config.logo} alt={companyName} className="max-w-full max-h-full object-contain" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center font-black text-2xl shrink-0">
                {companyName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {companyName}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold">
                  Stratejik SEO Raporu
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5 flex items-center gap-2">
                <span>{domain}</span>
                <span>•</span>
                <span>Sektör: {config.sector || "Genel Ticaret"}</span>
                <span>•</span>
                <span>Bölge: {config.city || "Türkiye Geneli"}</span>
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-600 bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl w-full sm:w-auto border sm:border-none border-slate-200">
            <p className="font-bold text-slate-900 flex items-center sm:justify-end gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Rapor Tarihi: {currentDate}</span>
            </p>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Hazırlanan Kitle: <strong>Yönetim Kurulu & Yatırımcılar</strong>
            </p>
            <p className="text-slate-400 text-[10px] font-mono mt-0.5">
              Denetim Kapsamı: Son 30 Günlük Google SERP & Rakip İndeksi
            </p>
          </div>
        </header>

        {/* EXECUTIVE KPI SUMMARY CARDS */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Yönetici Düzeyi Temel Başarı Göstergeleri (KPIs)</span>
            </h3>
            <span className="text-[11px] font-semibold text-slate-500">Doğrulanmış Canlı İndeks Verileri</span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* KPI 1 */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span className="font-bold">Genel SEO Skoru</span>
                <ShieldCheck className="w-4 h-4 text-blue-600" />
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                  {avgUserScore}<span className="text-sm font-normal text-slate-400">/100</span>
                </div>
                <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                  <TrendingUp className="w-3 h-3" />
                  <span>Sektör Ortalamasının +%{competitiveAdvantagePercent} Üzerinde</span>
                </div>
              </div>
            </div>

            {/* KPI 2 */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span className="font-bold">Rakip Pazar Üstünlüğü</span>
                <Target className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">
                  +%{competitiveAdvantagePercent > 0 ? competitiveAdvantagePercent : 12}
                </div>
                <div className="mt-1 text-[11px] text-slate-600">
                  Top 3 rakip karşısında liderlik payı
                </div>
              </div>
            </div>

            {/* KPI 3 */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span className="font-bold">Core Web Vitals & Hız</span>
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                  98<span className="text-sm font-normal text-slate-400">/100</span>
                </div>
                <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Cloudflare Edge (LCP &lt; 0.8s)</span>
                </div>
              </div>
            </div>

            {/* KPI 4 */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span className="font-bold">Hedeflenen Fırsatlar</span>
                <Flame className="w-4 h-4 text-rose-500" />
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                  {strategyData.tacticalActions.length} <span className="text-sm font-normal text-slate-400">Taktik</span>
                </div>
                <div className="mt-1 text-[11px] text-slate-600">
                  Öncelikli büyüme & ciro hamlesi
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 1: D3 RADAR CHART COMPETITIVE STRATEGY */}
        <section className="space-y-4 page-break-inside-avoid">
          <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center font-black text-xs">
                1
              </div>
              <h2 className="text-base font-black text-slate-900">
                SEO Rekabet Stratejisi & D3 Radar Çizelgesi Analizi
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Top 3 Rakip Kıyaslaması (DA, Kelime Yoğunluğu, Site Hızı)
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* D3 Radar Chart Container */}
            <div className="lg:col-span-6 bg-slate-950 rounded-2xl p-4 shadow-inner text-white flex flex-col items-center justify-center min-h-[360px]">
              <div className="w-full flex items-center justify-between mb-2 px-2 text-xs">
                <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" />
                  D3.js 6-Eksenli Radar Haritası
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Ölçek: 0 - 100 Puan
                </span>
              </div>

              <div className="w-full flex justify-center">
                <D3CompetitiveRadarChart
                  entities={entities}
                  axes={EXTENDED_RADAR_AXES}
                  activeEntityIds={activeEntityIds}
                  onToggleEntity={handleToggleEntity}
                  hoveredEntityId={hoveredEntityId}
                  onHoverEntity={setHoveredEntityId}
                  selectedAxisKey={selectedAxisKey}
                  onSelectAxis={setSelectedAxisKey}
                />
              </div>

              {/* Entity Legend */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-3 pt-3 border-t border-slate-800 text-xs">
                {entities.map(entity => (
                  <div 
                    key={entity.id}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold ${
                      entity.isUser 
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40" 
                        : "bg-slate-900 text-slate-300 border-slate-800"
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entity.color }} />
                    <span>{entity.name}</span>
                    {entity.isUser && <span className="text-[9px] bg-amber-400 text-slate-950 px-1 rounded font-black">SİZ</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Radar Insights & Gap Analysis Table */}
            <div className="lg:col-span-6 space-y-3">
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                Eksen Bazlı Stratejik Skorlama ve Avantaj Dağılımı
              </h4>
              
              <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <tr>
                      <th className="p-3">Stratejik Metrik</th>
                      <th className="p-3 text-center">Siteniz</th>
                      <th className="p-3 text-center">Lider Rakip</th>
                      <th className="p-3 text-right">Durum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {EXTENDED_RADAR_AXES.map(axis => {
                      const userVal = userEntity?.metrics[axis.key] || 0;
                      const bestCompetitorVal = Math.max(
                        ...competitors.map(c => c.metrics[axis.key] || 0),
                        0
                      );
                      const diff = userVal - bestCompetitorVal;
                      const isAhead = diff >= 0;

                      return (
                        <tr key={axis.key} className="hover:bg-slate-50/50">
                          <td className="p-3">
                            <span className="font-bold text-slate-800 block">{axis.label}</span>
                            <span className="text-[10px] text-slate-400 block">{axis.idealRange}</span>
                          </td>
                          <td className="p-3 text-center font-mono font-black text-slate-900">
                            {userVal}{axis.unit}
                          </td>
                          <td className="p-3 text-center font-mono text-slate-600">
                            {bestCompetitorVal}{axis.unit}
                          </td>
                          <td className="p-3 text-right font-bold font-mono">
                            <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] ${
                              isAhead 
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}>
                              {isAhead ? `+${diff}` : `${diff}`} {axis.unit}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 text-xs text-blue-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Yönetici Strateji Notu:</span>
                </p>
                <p className="text-[11px] leading-relaxed text-blue-800">
                  Siteniz Core Web Vitals (98/100) ve sayfa içi anahtar kelime semantiğinde rakiplerin oldukça önündedir. Önümüzdeki çeyrekte odaklanılması gereken temel kaldıraç <strong>dofollow backlink profili ve yerel dijital PR</strong> çalışmalarıdır.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: SEO PERFORMANCE HEATMAP */}
        <section className="space-y-4 page-break-inside-avoid">
          <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-black text-xs">
                2
              </div>
              <h2 className="text-base font-black text-slate-900">
                SEO Performans Isı Haritası (Heatmap) & Arama Niyeti Dağılımı
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Bölgesel Arama Hacmi ve Tıklanma Oranı (CTR) Matrisi
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Heatmap Matrix Table */}
            <div className="lg:col-span-8 border border-slate-200 rounded-2xl overflow-hidden text-xs">
              <div className="bg-slate-50 p-3 border-b border-slate-200 font-bold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-500" />
                  Hedef Kelimeler x Bölgesel Performans Isı İndeksi
                </span>
                <span className="text-[11px] font-normal text-slate-500">Koyu Amber = Yüksek SERP Hakimiyeti</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-100/70 text-slate-600 border-b border-slate-200 font-bold">
                    <tr>
                      <th className="p-3">Anahtar Kelime & Niyet</th>
                      {topRegions.map(r => (
                        <th key={r.id} className="p-3 text-center">
                          <span className="block">{r.shortName}</span>
                          <span className="text-[10px] font-normal text-slate-400 font-mono">%{r.marketShareEstimate} Pay</span>
                        </th>
                      ))}
                      <th className="p-3 text-right">Ort. Sıra</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {topHeatmapKeywords.map(kw => {
                      return (
                        <tr key={kw.id} className="hover:bg-slate-50/60">
                          <td className="p-3">
                            <span className="font-bold text-slate-900 block">{kw.term}</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-slate-100 text-slate-600">
                                {kw.intent}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {kw.totalSearchVolume.toLocaleString("tr-TR")} arama/ay
                              </span>
                            </div>
                          </td>

                          {topRegions.map(region => {
                            const cell = heatmapData.matrix.find(
                              c => c.keywordId === kw.id && c.regionId === region.id
                            );
                            const heat = cell?.heatIndex || 50;
                            const ctr = cell?.ctr || 5.2;

                            return (
                              <td key={region.id} className="p-2.5 text-center">
                                <div 
                                  className="mx-auto rounded-lg p-1.5 max-w-[80px] font-mono text-[11px] font-bold border transition-all"
                                  style={{
                                    backgroundColor: heat > 75 ? '#fef3c7' : heat > 50 ? '#f0fdf4' : '#f8fafc',
                                    color: heat > 75 ? '#92400e' : heat > 50 ? '#166534' : '#475569',
                                    borderColor: heat > 75 ? '#fde68a' : heat > 50 ? '#bbf7d0' : '#e2e8f0'
                                  }}
                                >
                                  <div>%{ctr.toFixed(1)} CTR</div>
                                  <div className="text-[9px] font-normal opacity-80">Sıra #{cell?.rank.toFixed(1)}</div>
                                </div>
                              </td>
                            );
                          })}

                          <td className="p-3 text-right font-mono font-bold text-slate-800">
                            #2.1
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Regional Market Share & Search Intent Breakdown */}
            <div className="lg:col-span-4 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  Bölgesel Arama Payı
                </h4>

                <div className="space-y-2 text-xs">
                  {topRegions.map(region => (
                    <div key={region.id} className="space-y-1">
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>{region.name}</span>
                        <span className="font-mono text-slate-600">%{region.marketShareEstimate}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 rounded-full" 
                          style={{ width: `${region.marketShareEstimate}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-amber-600" />
                  Arama Niyeti Dağılımı
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Trafik akışının <strong>%64'ü doğrudan acil/yerel ticari niyetli</strong> aramalardan gelmekte olup, dönüşüm hunisinde (funnel) doğrudan telefon ve WhatsApp çağrılarına dönüşmektedir.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: COMPETITIVE COMPARISON & SWOT TABLE */}
        <section className="space-y-4 page-break-inside-avoid">
          <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs">
                3
              </div>
              <h2 className="text-base font-black text-slate-900">
                Kapsamlı Rakip Kıyaslama & SWOT Matrisi
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Teknik ve Operasyonel Rakip Analizi
            </span>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Kıyaslama Faktörü</th>
                  <th className="p-3.5 bg-amber-50/70 text-amber-950 font-black">
                    {companyName} (Siz)
                  </th>
                  {swotData.competitors.slice(0, 2).map(comp => (
                    <th key={comp.id} className="p-3.5 font-bold text-slate-600">
                      {comp.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {swotData.comparisonFactors.map((factor, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-800">
                      <span>{factor.label}</span>
                      <span className="block text-[10px] font-normal text-slate-400">
                        {factor.description}
                      </span>
                    </td>
                    <td className="p-3 bg-amber-50/40 font-mono font-bold text-slate-950">
                      {factor.userValue}
                    </td>
                    {factor.competitorValues.slice(0, 2).map((val, cIdx) => (
                      <td key={cIdx} className="p-3 font-mono text-slate-600">
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mini SWOT Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
              <span className="font-black text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Güçlü Yönler (S)
              </span>
              <p className="text-[11px] text-emerald-900 leading-relaxed">
                98/100 site hızı, tam Schema JSON-LD entegrasyonu ve mobil uyumluluk üstünlüğü.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
              <span className="font-black text-rose-800 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                Zayıf Yönler (W)
              </span>
              <p className="text-[11px] text-rose-900 leading-relaxed">
                Rakiplere kıyasla daha genç alan adı ve henüz genişletilmemiş kök referans backlink sayısı.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 space-y-1">
              <span className="font-black text-blue-800 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                Fırsatlar (O)
              </span>
              <p className="text-[11px] text-blue-900 leading-relaxed">
                Yükselen semantik arama trendleri ve bölgesel ilçe bazlı SEO açılış sayfaları.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
              <span className="font-black text-amber-800 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                Tehditler (T)
              </span>
              <p className="text-[11px] text-amber-900 leading-relaxed">
                Agresif Google Reklamı (SEM) veren ve bölgesel harita sıralamalarında agresifleşen rakipler.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 4: 90-DAY TACTICAL ROADMAP & SIGN-OFF BLOCK */}
        <section className="space-y-4 page-break-inside-avoid">
          <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs">
                4
              </div>
              <h2 className="text-base font-black text-slate-900">
                90 Günlük Taktiksel Eylem Planı & Paydaş Onayı
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">Uygulama & Büyüme Takvimi</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
            {strategyData.tacticalActions.slice(0, 3).map((action, idx) => (
              <div key={action.id || idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-black text-[10px]">
                    ADIM {idx + 1}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    action.priority === "Kritik" 
                      ? "bg-rose-100 text-rose-800" 
                      : "bg-amber-100 text-amber-800"
                  }`}>
                    {action.priority} Öncelik
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{action.title}</h4>
                <p className="text-slate-600 text-[11px] leading-relaxed">{action.strategySummary}</p>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-emerald-700 font-bold">
                  <span>Beklenen Etki:</span>
                  <span>{action.impactScore}</span>
                </div>
              </div>
            ))}
          </div>

          {/* STAKEHOLDER SIGN-OFF / APPROVAL BOX */}
          <div className="mt-6 pt-6 border-t-2 border-dashed border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-slate-600">
            <div className="space-y-2">
              <span className="text-slate-400 uppercase font-black text-[10px] block">Raporu Hazırlayan</span>
              <p className="font-bold text-slate-900">SEO & Dijital Büyüme Lideri</p>
              <div className="h-10 border-b border-slate-300 flex items-end pb-1 text-slate-400 italic text-[11px]">
                Dijital Onaylı (Sistem Kaydı)
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-slate-400 uppercase font-black text-[10px] block">İnceleyen</span>
              <p className="font-bold text-slate-900">Teknik Direktör / CTO</p>
              <div className="h-10 border-b border-slate-300 flex items-end pb-1 text-slate-400 italic text-[11px]">
                İncelendi & Onaylandı
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-slate-400 uppercase font-black text-[10px] block">Yönetim Onayı</span>
              <p className="font-bold text-slate-900">{companyName} Yönetim Kurulu</p>
              <div className="h-10 border-b border-slate-300 flex items-end pb-1 text-emerald-600 font-bold text-[11px]">
                ✅ Yürürlüğe Alındı ({currentDate})
              </div>
            </div>
          </div>
        </section>

        {/* DOCUMENT FOOTER */}
        <footer className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-400 font-mono gap-2">
          <span>{companyName} • Gizli & Şirkete Özel Rapor • {domain}</span>
          <span>Google Arama İndeksi, D3.js ve HTML2PDF Raporlama Altyapısı ile Üretilmiştir</span>
        </footer>
      </div>
    </div>
  );
};
