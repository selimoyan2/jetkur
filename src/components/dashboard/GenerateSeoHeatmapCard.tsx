import React, { useState, useMemo, useEffect } from "react";
import { 
  SiteConfig, 
  CustomerPanelTab 
} from "../../types";
import { 
  generateSeoHeatmapData, 
  SeoHeatmapSectionData, 
  SeoHeatmapSummary 
} from "../../utils/seoHeatmapEngine";
import { 
  Flame, 
  Sparkles, 
  RefreshCw, 
  Layers, 
  Grid3X3, 
  LayoutGrid, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Eye, 
  MousePointerClick, 
  Target, 
  Search, 
  HelpCircle, 
  X, 
  Check, 
  Copy, 
  ExternalLink,
  Zap,
  Tag,
  FileText,
  Sliders,
  Award
} from "lucide-react";

export interface GenerateSeoHeatmapCardProps {
  config: SiteConfig;
  onNavigateTab?: (tab: CustomerPanelTab | string) => void;
  className?: string;
  initialViewMode?: "matrix" | "cards";
  defaultExpandedSectionId?: string;
}

type GridFilter = "all" | "high_impact" | "critical" | "needs_work";

export const GenerateSeoHeatmapCard: React.FC<GenerateSeoHeatmapCardProps> = ({
  config,
  onNavigateTab,
  className = "",
  initialViewMode = "matrix",
  defaultExpandedSectionId
}) => {
  const [viewMode, setViewMode] = useState<"matrix" | "cards">(initialViewMode);
  const [filter, setFilter] = useState<GridFilter>("all");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(100);
  const [lastGeneratedAt, setLastGeneratedAt] = useState<Date>(new Date());
  const [selectedSection, setSelectedSection] = useState<SeoHeatmapSectionData | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Compute heatmap data dynamically from current site configuration
  const heatmapData: SeoHeatmapSummary = useMemo(() => {
    return generateSeoHeatmapData(config);
  }, [config]);

  // Set default selected section
  useEffect(() => {
    if (!selectedSection && heatmapData.sections.length > 0) {
      if (defaultExpandedSectionId) {
        const found = heatmapData.sections.find(s => s.id === defaultExpandedSectionId);
        if (found) {
          setSelectedSection(found);
          return;
        }
      }
      // Pick the hottest section by default
      setSelectedSection(heatmapData.hottestSection || heatmapData.sections[0]);
    }
  }, [heatmapData, defaultExpandedSectionId, selectedSection]);

  // Handle "Generate SEO Heatmap" action
  const handleGenerateHeatmap = () => {
    setIsGenerating(true);
    setGenerationProgress(15);

    const step1 = setTimeout(() => setGenerationProgress(45), 200);
    const step2 = setTimeout(() => setGenerationProgress(80), 400);
    const step3 = setTimeout(() => {
      setGenerationProgress(100);
      setIsGenerating(false);
      setLastGeneratedAt(new Date());
      setToastMessage("SEO Isı Haritası güncel site yapılandırmasına göre başarıyla üretildi!");
      setTimeout(() => setToastMessage(null), 3500);
    }, 650);

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
    };
  };

  // Filter sections
  const filteredSections = useMemo(() => {
    return heatmapData.sections.filter(sec => {
      if (filter === "critical") return sec.heatIndex >= 90;
      if (filter === "high_impact") return sec.heatIndex >= 80;
      if (filter === "needs_work") return sec.heatIndex < 70 || !sec.enabled;
      return true;
    });
  }, [heatmapData.sections, filter]);

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Helper for color-coded badges and cells
  const getHeatBadgeStyle = (score: number) => {
    if (score >= 90) {
      return {
        bg: "bg-rose-500/10 text-rose-700 border-rose-200",
        cellBg: "bg-rose-50/70 border-rose-200 hover:bg-rose-100/70",
        barColor: "bg-rose-500",
        label: "Kritik Yüksek Etki",
        colorHex: "#f43f5e"
      };
    }
    if (score >= 80) {
      return {
        bg: "bg-orange-500/10 text-orange-700 border-orange-200",
        cellBg: "bg-orange-50/70 border-orange-200 hover:bg-orange-100/70",
        barColor: "bg-orange-500",
        label: "Yüksek Etki",
        colorHex: "#f97316"
      };
    }
    if (score >= 65) {
      return {
        bg: "bg-amber-500/10 text-amber-700 border-amber-200",
        cellBg: "bg-amber-50/70 border-amber-200 hover:bg-amber-100/70",
        barColor: "bg-amber-500",
        label: "Orta Etki",
        colorHex: "#f59e0b"
      };
    }
    return {
      bg: "bg-slate-500/10 text-slate-700 border-slate-200",
      cellBg: "bg-slate-50 border-slate-200 hover:bg-slate-100",
      barColor: "bg-slate-400",
      label: "Düşük / İyileştirilmeli",
      colorHex: "#94a3b8"
    };
  };

  return (
    <div className={`bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6 ${className}`} id="card-generate-seo-heatmap">
      {/* 1. Header & Generator Command Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
              <Flame className="w-5 h-5 fill-current animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Site İçi SEO Isı Haritası (SEO Heatmap)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
                  Renk Kodlu Izgara
                </span>
              </h3>
            </div>
          </div>
          <p className="text-xs text-slate-500 pl-11">
            Mevcut site konfigürasyonunun arama motorları için en yüksek trafik, tıklama ve dönüşüm üreten alanlarını tespit edin.
          </p>
        </div>

        {/* Action Button & View Toggles */}
        <div className="flex items-center gap-3 self-start lg:self-auto flex-wrap">
          {/* View Mode Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
            <button
              type="button"
              id="btn-view-matrix"
              onClick={() => setViewMode("matrix")}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "matrix"
                  ? "bg-white text-slate-950 shadow-xs"
                  : "text-slate-600 hover:text-slate-950"
              }`}
              title="Renk kodlu matris ızgara görünümü"
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>Matris Izgara</span>
            </button>
            <button
              type="button"
              id="btn-view-cards"
              onClick={() => setViewMode("cards")}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "cards"
                  ? "bg-white text-slate-950 shadow-xs"
                  : "text-slate-600 hover:text-slate-950"
              }`}
              title="Mimari alan kartları görünümü"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Alan Kartları</span>
            </button>
          </div>

          {/* GENERATE SEO HEATMAP PRIMARY ACTION BUTTON */}
          <button
            type="button"
            id="btn-generate-seo-heatmap"
            onClick={handleGenerateHeatmap}
            disabled={isGenerating}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-orange-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black text-xs shadow-md shadow-rose-500/20 flex items-center gap-2 transition-all active:scale-95 cursor-pointer disabled:opacity-60"
            title="Sitenin güncel yapılandırmasını tarayarak SEO Isı Haritasını yeniden hesapla"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
            <span>{isGenerating ? "Isı Haritası Hesaplanıyor..." : "Generate SEO Heatmap"}</span>
          </button>
        </div>
      </div>

      {/* Generation Progress Bar (when active) */}
      {isGenerating && (
        <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
              <span>Site Konfigürasyonu Taranıyor &amp; Etki Ağırlıkları Modelleniyor...</span>
            </span>
            <span className="font-mono text-amber-400 font-bold">%{generationProgress}</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-rose-500 to-amber-400 h-full transition-all duration-200"
              style={{ width: `${generationProgress}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Hizmetler, SSS Schema, Ürünler ve Yerel Anahtar Kelime Kümeleri Analiz Ediliyor</span>
            <span className="font-mono">Google SERP Algoritması</span>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 hover:text-emerald-950 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Executive KPI Highlights Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Card 1: Hottest Section */}
        <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-800 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-rose-600 fill-current" />
              <span>En Sıcak Alan</span>
            </span>
            <span className="text-[10px] font-mono font-black text-rose-700 px-1.5 py-0.2 rounded bg-rose-100 border border-rose-200">
              {heatmapData.hottestSection.heatIndex}/100
            </span>
          </div>
          <div className="text-sm font-black text-slate-900 truncate">
            {heatmapData.hottestSection.shortName}
          </div>
          <div className="text-[10px] text-slate-500">
            Aylık ~{heatmapData.hottestSection.monthlyVisits.toLocaleString("tr-TR")} Ziyaret
          </div>
        </div>

        {/* Card 2: Highest SEO Potential */}
        <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>En Yüksek Fırsat</span>
            </span>
            <span className="text-[10px] font-mono font-black text-amber-700 px-1.5 py-0.2 rounded bg-amber-100 border border-amber-200">
              {heatmapData.highestPotentialSection.seoPotentialScore}/100
            </span>
          </div>
          <div className="text-sm font-black text-slate-900 truncate">
            {heatmapData.highestPotentialSection.shortName}
          </div>
          <div className="text-[10px] text-slate-500">
            Hacim: {heatmapData.highestPotentialSection.searchDemand.toLocaleString("tr-TR")} arama
          </div>
        </div>

        {/* Card 3: Tracked Keywords */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-800 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-indigo-600" />
              <span>Taranan Kelimeler</span>
            </span>
            <span className="text-[10px] font-mono font-black text-indigo-700 px-1.5 py-0.2 rounded bg-indigo-100 border border-indigo-200">
              {heatmapData.totalKeywordsTracked} Adet
            </span>
          </div>
          <div className="text-sm font-black text-slate-900">
            {heatmapData.totalKeywordsTracked} Odak Kelime
          </div>
          <div className="text-[10px] text-slate-500">
            Sektörel &amp; Bölgesel Eşleşme
          </div>
        </div>

        {/* Card 4: Total Organic Search Traffic */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>Aylık Organik Trafik</span>
            </span>
            <span className="text-[10px] font-mono font-black text-emerald-700 px-1.5 py-0.2 rounded bg-emerald-100 border border-emerald-200">
              Tahmini
            </span>
          </div>
          <div className="text-sm font-black text-slate-900 font-mono">
            ~{heatmapData.totalMonthlyOrganicVisits.toLocaleString("tr-TR")}
          </div>
          <div className="text-[10px] text-slate-500">
            %{heatmapData.deviceBreakdown.mobilePercent} Mobil / %{heatmapData.deviceBreakdown.desktopPercent} Masaüstü
          </div>
        </div>
      </div>

      {/* Filter Tabs & Color Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-bold text-[11px] mr-1">Filtrele:</span>
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
              filter === "all"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Tümü ({heatmapData.sections.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("critical")}
            className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
              filter === "critical"
                ? "bg-rose-600 text-white"
                : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
            }`}
          >
            <Flame className="w-3 h-3 fill-current" />
            <span>Kritik Yüksek (≥90)</span>
          </button>
          <button
            type="button"
            onClick={() => setFilter("high_impact")}
            className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
              filter === "high_impact"
                ? "bg-orange-600 text-white"
                : "bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200"
            }`}
          >
            Yüksek Etki (≥80)
          </button>
          <button
            type="button"
            onClick={() => setFilter("needs_work")}
            className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
              filter === "needs_work"
                ? "bg-amber-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            İyileştirilmeli (&lt;70)
          </button>
        </div>

        {/* Heatmap Color Scale Legend */}
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 self-end sm:self-auto">
          <span className="text-slate-400">Renk Skalası:</span>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-rose-700">Kritik (90+)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span className="text-orange-700">Yüksek (80-89)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-amber-700">Orta (65-79)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <span className="text-slate-600">Düşük (&lt;65)</span>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3A. VIEW MODE 1: COLOR-CODED MATRIX GRID */}
      {/* ===================================================================== */}
      {viewMode === "matrix" && (
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full min-w-[760px] text-left border-collapse" id="table-seo-heatmap-matrix">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-3">Site Alanı / Bileşen</th>
                <th className="py-3 px-3 text-center">Genel Isı &amp; Etki</th>
                <th className="py-3 px-3 text-center">Arama Talebi</th>
                <th className="py-3 px-3 text-center">SERP Sıralaması</th>
                <th className="py-3 px-3 text-center">CTR Potansiyeli</th>
                <th className="py-3 px-3 text-center">Dönüşüm Ağırlığı</th>
                <th className="py-3 px-3 text-right">Eylem &amp; Düzenle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredSections.map((section) => {
                const badge = getHeatBadgeStyle(section.heatIndex);
                const isSelected = selectedSection?.id === section.id;

                return (
                  <tr
                    key={section.id}
                    id={`row-heatmap-${section.id}`}
                    onClick={() => setSelectedSection(section)}
                    className={`transition-colors cursor-pointer group ${
                      isSelected 
                        ? "bg-slate-100/90 font-medium" 
                        : "hover:bg-slate-50"
                    }`}
                  >
                    {/* 1. Section Title & Category */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div 
                          className="w-2.5 h-8 rounded-full shrink-0 transition-transform group-hover:scale-110" 
                          style={{ backgroundColor: badge.colorHex }}
                          title={`Isı Seviyesi: ${section.heatIndex}`}
                        />
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{section.name}</span>
                            {!section.enabled && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] bg-slate-200 text-slate-600 font-normal">
                                Pasif
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {section.topKeywords[0]?.keyword || "Genel Arama Odaklı"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. Composite Heat Index (Color-Coded Pill + Meter) */}
                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className={`px-2.5 py-1 rounded-xl text-xs font-mono font-black border ${badge.bg} flex items-center gap-1`}>
                          <Flame className="w-3 h-3 fill-current" />
                          <span>{section.heatIndex}</span>
                        </span>
                        <span className="text-[9px] text-slate-400 mt-0.5">{badge.label}</span>
                      </div>
                    </td>

                    {/* 3. Search Demand (Arama Talebi) */}
                    <td className="py-3 px-3 text-center">
                      <div className="font-mono font-bold text-slate-800">
                        {section.searchDemand.toLocaleString("tr-TR")}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {section.keywordCount} anahtar kelime
                      </span>
                    </td>

                    {/* 4. Organic SERP Rank */}
                    <td className="py-3 px-3 text-center">
                      <span className="font-mono font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                        #{section.organicRank.toFixed(1)}
                      </span>
                      <div className="text-[10px] text-emerald-600 font-bold mt-0.5">
                        Fırsat: {section.seoPotentialScore}/100
                      </div>
                    </td>

                    {/* 5. CTR Potential */}
                    <td className="py-3 px-3 text-center">
                      <div className="font-mono font-bold text-slate-900">
                        %{section.ctr.toFixed(1)}
                      </div>
                      <div className="w-16 mx-auto bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div 
                          className="bg-sky-500 h-full rounded-full" 
                          style={{ width: `${Math.min(100, section.ctr * 7)}%` }}
                        />
                      </div>
                    </td>

                    {/* 6. Conversion Rate Weight */}
                    <td className="py-3 px-3 text-center">
                      <div className="font-mono font-bold text-emerald-700">
                        %{section.conversionRate.toFixed(1)}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Süre: ~{section.avgTimeOnSectionSeconds}sn
                      </span>
                    </td>

                    {/* 7. Action Button */}
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onNavigateTab) onNavigateTab(section.quickFixAction.tab);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] inline-flex items-center gap-1 shadow-xs transition-transform active:scale-95 cursor-pointer"
                        title={section.quickFixAction.description}
                      >
                        <span>Optimize Et</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3B. VIEW MODE 2: SPATIAL BENTO CARDS GRID */}
      {/* ===================================================================== */}
      {viewMode === "cards" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredSections.map((section) => {
            const badge = getHeatBadgeStyle(section.heatIndex);
            const isSelected = selectedSection?.id === section.id;

            return (
              <div
                key={section.id}
                id={`card-heatmap-${section.id}`}
                onClick={() => setSelectedSection(section)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between gap-3 ${
                  isSelected
                    ? "border-slate-900 bg-slate-50/90 shadow-md ring-2 ring-slate-900/10"
                    : `${badge.cellBg}`
                }`}
              >
                {/* Top Heat Stripe */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1.5" 
                  style={{ backgroundColor: badge.colorHex }}
                />

                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-black text-slate-900 truncate">
                      {section.name}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black border ${badge.bg} flex items-center gap-1 shrink-0`}>
                      <Flame className="w-3 h-3 fill-current" />
                      <span>{section.heatIndex}</span>
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {section.actionableTips[0] || section.quickFixAction.description}
                  </p>
                </div>

                {/* Key Metrics row */}
                <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-200/80 text-[11px] font-mono">
                  <div className="bg-white/80 p-1.5 rounded-lg border border-slate-200/60 text-center">
                    <div className="text-[9px] text-slate-400 font-sans">Trafik</div>
                    <div className="font-bold text-slate-800">%{section.trafficShare}</div>
                  </div>
                  <div className="bg-white/80 p-1.5 rounded-lg border border-slate-200/60 text-center">
                    <div className="text-[9px] text-slate-400 font-sans">SERP Sıra</div>
                    <div className="font-bold text-indigo-700">#{section.organicRank.toFixed(1)}</div>
                  </div>
                  <div className="bg-white/80 p-1.5 rounded-lg border border-slate-200/60 text-center">
                    <div className="text-[9px] text-slate-400 font-sans">Dönüşüm</div>
                    <div className="font-bold text-emerald-700">%{section.conversionRate.toFixed(1)}</div>
                  </div>
                </div>

                {/* Bottom Quick Action */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400 truncate max-w-[150px]">
                    {section.topKeywords.length} Hedef Kelime
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onNavigateTab) onNavigateTab(section.quickFixAction.tab);
                    }}
                    className="text-xs font-bold text-slate-900 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Düzenle</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. SELECTED SECTION HIGH-IMPACT DEEP-DIVE INSPECTOR */}
      {/* ===================================================================== */}
      {selectedSection && (
        <div className="pt-4 border-t border-slate-200 space-y-4 animate-in fade-in" id="panel-heatmap-inspector">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="text-xs font-mono font-bold text-rose-700 uppercase tracking-wider">
                  Seçili Yüksek Etki Alanı İncelemesi
                </span>
              </div>
              <h4 className="text-base font-black text-slate-900">
                {selectedSection.name}
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (onNavigateTab) onNavigateTab(selectedSection.quickFixAction.tab);
                }}
                className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
              >
                <span>{selectedSection.quickFixAction.label}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left: Top Keywords & Search Volumes */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-indigo-600" />
                  <span>En Yüksek Hacimli Arama Terimleri ({selectedSection.topKeywords.length})</span>
                </span>
                <span className="text-[10px] text-slate-400">Google SERP</span>
              </div>

              <div className="space-y-2">
                {selectedSection.topKeywords.map((kw, idx) => (
                  <div 
                    key={idx} 
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50/40 border border-slate-200/80 transition-colors flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{kw.keyword}</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-slate-200 text-slate-700 font-mono">
                          {kw.intent}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Aylık Hacim: {kw.monthlyVolume.toLocaleString("tr-TR")} arama
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-2">
                      <div className="text-[11px] font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                        Sıra: #{kw.currentRank}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(kw.keyword, `kw-${idx}`)}
                        className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                        title="Anahtar kelimeyi kopyala"
                      >
                        {copiedKey === `kw-${idx}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Actionable SEO Recommendations */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Önerilen SEO &amp; Dönüşüm İyileştirmeleri</span>
                </span>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Öncelikli
                </span>
              </div>

              <div className="space-y-2.5">
                {selectedSection.actionableTips.map((tip, idx) => (
                  <div 
                    key={idx} 
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed"
                  >
                    <span className="w-5 h-5 rounded-lg bg-amber-100 text-amber-900 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
