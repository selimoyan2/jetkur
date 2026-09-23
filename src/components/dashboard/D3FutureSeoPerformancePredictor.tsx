import React, { useState, useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";
import { SiteConfig, CompetitorKeywordRanking } from "../../types";
import {
  FutureSeoPredictorDataset,
  FutureMonthlyDataPoint,
  PredictorKeywordItem,
  calculateFutureSeoPredictions,
  exportPredictorDataToCsv
} from "../../utils/d3FutureSeoPredictorEngine";
import {
  TrendingUp,
  Sparkles,
  Target,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Download,
  Copy,
  Check,
  Sliders,
  Flame,
  Award,
  ChevronRight,
  Activity,
  Info,
  Clock,
  ArrowUpRight,
  BarChart3,
  Search,
  Filter,
  FileDown
} from "lucide-react";

interface D3FutureSeoPerformancePredictorProps {
  config: SiteConfig;
  className?: string;
  customKeywordRankings?: CompetitorKeywordRanking[];
  onNavigateTab?: (tabId: string) => void;
  onDownloadPdf?: () => void;
}

export const D3FutureSeoPerformancePredictor: React.FC<D3FutureSeoPerformancePredictorProps> = ({
  config,
  className = "",
  customKeywordRankings,
  onNavigateTab,
  onDownloadPdf
}) => {
  const [scenario, setScenario] = useState<"aggressive" | "balanced" | "conservative">("balanced");
  const [kdFilter, setKdFilter] = useState<"all" | "easy" | "medium" | "hard">("all");
  const [metricMode, setMetricMode] = useState<"traffic" | "visibility">("traffic");
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(4); // default 4th month (crossover)
  const [hoveredPoint, setHoveredPoint] = useState<FutureMonthlyDataPoint | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Compute dataset based on scenario and KD filter
  const dataset: FutureSeoPredictorDataset = useMemo(() => {
    return calculateFutureSeoPredictions(config, scenario, kdFilter, customKeywordRankings);
  }, [config, scenario, kdFilter, customKeywordRankings]);

  // Filtered keywords by search query
  const displayedKeywords = useMemo(() => {
    if (!searchTerm.trim()) return dataset.filteredKeywords;
    const term = searchTerm.toLowerCase();
    return dataset.filteredKeywords.filter(
      k => k.keyword.toLowerCase().includes(term) || k.difficultyCategory.toLowerCase().includes(term)
    );
  }, [dataset.filteredKeywords, searchTerm]);

  // Selected month data
  const activeMonth = useMemo(() => {
    return dataset.timeline.find(t => t.monthIndex === selectedMonthIndex) || dataset.timeline[3];
  }, [dataset.timeline, selectedMonthIndex]);

  // Render D3 Interactive Chart
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    const width = 920;
    const height = 360;
    const margin = { top: 35, right: 35, bottom: 50, left: 65 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const timeline = dataset.timeline;

    // X Scale: Point scale along the 6 months
    const xScale = d3
      .scalePoint<string>()
      .domain(timeline.map(d => d.shortMonth))
      .range([margin.left, width - margin.right])
      .padding(0.25);

    // Y Scale: Linear scale based on metric mode
    const maxY =
      metricMode === "traffic"
        ? Math.max(
            ...timeline.map(d => Math.max(d.userTrafficUpper, d.comp1Traffic, d.comp2Traffic, d.comp3Traffic))
          ) * 1.12
        : 100;

    const yScale = d3
      .scaleLinear()
      .domain([0, maxY])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Defs for Gradients & Glow Filters
    const defs = svg.append("defs");

    // Glow filter for User Site line
    const filter = defs.append("filter").attr("id", "neon-cyan-glow").attr("x", "-20%").attr("y", "-20%").attr("width", "140%").attr("height", "140%");
    filter.append("feGaussianBlur").attr("stdDeviation", "4").attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Shaded confidence interval gradient
    const areaGradient = defs
      .append("linearGradient")
      .attr("id", "confidence-band-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
    areaGradient.append("stop").attr("offset", "0%").attr("stop-color", "#06b6d4").attr("stop-opacity", 0.35);
    areaGradient.append("stop").attr("offset", "100%").attr("stop-color", "#06b6d4").attr("stop-opacity", 0.02);

    // Background horizontal grid lines
    const yTicks = yScale.ticks(6);
    svg
      .append("g")
      .attr("class", "grid-lines")
      .selectAll("line")
      .data(yTicks)
      .enter()
      .append("line")
      .attr("x1", margin.left)
      .attr("x2", width - margin.right)
      .attr("y1", d => yScale(d))
      .attr("y2", d => yScale(d))
      .attr("stroke", "#1e293b")
      .attr("stroke-dasharray", "4,4")
      .attr("stroke-width", 1);

    // Confidence Interval Area (for User line)
    if (metricMode === "traffic") {
      const areaGen = d3
        .area<FutureMonthlyDataPoint>()
        .curve(d3.curveMonotoneX)
        .x(d => xScale(d.shortMonth)!)
        .y0(d => yScale(d.userTrafficLower))
        .y1(d => yScale(d.userTrafficUpper));

      svg
        .append("path")
        .datum(timeline)
        .attr("fill", "url(#confidence-band-gradient)")
        .attr("d", areaGen);
    }

    // Line Generators
    const userLineGen = d3
      .line<FutureMonthlyDataPoint>()
      .curve(d3.curveMonotoneX)
      .x(d => xScale(d.shortMonth)!)
      .y(d => yScale(metricMode === "traffic" ? d.userTraffic : d.userVisibilityScore));

    const comp1LineGen = d3
      .line<FutureMonthlyDataPoint>()
      .curve(d3.curveMonotoneX)
      .x(d => xScale(d.shortMonth)!)
      .y(d => yScale(metricMode === "traffic" ? d.comp1Traffic : d.comp1VisibilityScore));

    const comp2LineGen = d3
      .line<FutureMonthlyDataPoint>()
      .curve(d3.curveMonotoneX)
      .x(d => xScale(d.shortMonth)!)
      .y(d => yScale(metricMode === "traffic" ? d.comp2Traffic : d.comp2VisibilityScore));

    const comp3LineGen = d3
      .line<FutureMonthlyDataPoint>()
      .curve(d3.curveMonotoneX)
      .x(d => xScale(d.shortMonth)!)
      .y(d => yScale(metricMode === "traffic" ? d.comp3Traffic : d.comp3VisibilityScore));

    // Competitor 3 line (Amber - Challenger)
    svg
      .append("path")
      .datum(timeline)
      .attr("fill", "none")
      .attr("stroke", "#f59e0b")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "4,3")
      .attr("d", comp3LineGen);

    // Competitor 2 line (Emerald - Regional)
    svg
      .append("path")
      .datum(timeline)
      .attr("fill", "none")
      .attr("stroke", "#10b981")
      .attr("stroke-width", 2)
      .attr("d", comp2LineGen);

    // Competitor 1 line (Violet - Market Leader)
    svg
      .append("path")
      .datum(timeline)
      .attr("fill", "none")
      .attr("stroke", "#8b5cf6")
      .attr("stroke-width", 2.5)
      .attr("stroke-dasharray", "6,3")
      .attr("d", comp1LineGen);

    // User Site line (Cyan - Siteniz - Glow)
    svg
      .append("path")
      .datum(timeline)
      .attr("fill", "none")
      .attr("stroke", "#06b6d4")
      .attr("stroke-width", 3.5)
      .attr("filter", "url(#neon-cyan-glow)")
      .attr("d", userLineGen);

    // Leader Crossover Month Vertical Marker
    if (dataset.summary.leaderCrossoverMonth) {
      const crossMonth = timeline[dataset.summary.leaderCrossoverMonth - 1];
      if (crossMonth) {
        const cx = xScale(crossMonth.shortMonth)!;
        svg
          .append("line")
          .attr("x1", cx)
          .attr("x2", cx)
          .attr("y1", margin.top)
          .attr("y2", height - margin.bottom)
          .attr("stroke", "#ec4899")
          .attr("stroke-width", 1.5)
          .attr("stroke-dasharray", "3,3");

        // Crossover Badge Pill
        const pillGroup = svg.append("g").attr("transform", `translate(${cx}, ${margin.top - 12})`);
        pillGroup
          .append("rect")
          .attr("x", -65)
          .attr("y", -12)
          .attr("width", 130)
          .attr("height", 22)
          .attr("rx", 11)
          .attr("fill", "#831843")
          .attr("stroke", "#f472b6")
          .attr("stroke-width", 1);

        pillGroup
          .append("text")
          .attr("text-anchor", "middle")
          .attr("y", 3)
          .attr("fill", "#fdf2f8")
          .attr("font-size", "10px")
          .attr("font-weight", "bold")
          .text("🎯 Lideri Geçme Eşiği");
      }
    }

    // Circles for Data Points
    timeline.forEach(d => {
      const cx = xScale(d.shortMonth)!;
      const cy = yScale(metricMode === "traffic" ? d.userTraffic : d.userVisibilityScore);
      const isSelected = d.monthIndex === selectedMonthIndex;

      // Outer pulse ring for selected
      if (isSelected) {
        svg
          .append("circle")
          .attr("cx", cx)
          .attr("cy", cy)
          .attr("r", 12)
          .attr("fill", "none")
          .attr("stroke", "#06b6d4")
          .attr("stroke-width", 1.5)
          .attr("opacity", 0.6);
      }

      // Main node circle
      svg
        .append("circle")
        .attr("cx", cx)
        .attr("cy", cy)
        .attr("r", isSelected ? 6.5 : 4.5)
        .attr("fill", "#06b6d4")
        .attr("stroke", "#0f172a")
        .attr("stroke-width", 2)
        .style("cursor", "pointer")
        .on("click", () => setSelectedMonthIndex(d.monthIndex));

      // Leader node circle
      const cyLeader = yScale(metricMode === "traffic" ? d.comp1Traffic : d.comp1VisibilityScore);
      svg
        .append("circle")
        .attr("cx", cx)
        .attr("cy", cyLeader)
        .attr("r", 3.5)
        .attr("fill", "#8b5cf6")
        .attr("stroke", "#0f172a")
        .attr("stroke-width", 1.5);
    });

    // X-Axis Labels (Months)
    timeline.forEach(d => {
      const x = xScale(d.shortMonth)!;
      const isSelected = d.monthIndex === selectedMonthIndex;

      const text = svg
        .append("text")
        .attr("x", x)
        .attr("y", height - margin.bottom + 22)
        .attr("text-anchor", "middle")
        .attr("font-size", isSelected ? "12px" : "11px")
        .attr("font-weight", isSelected ? "bold" : "normal")
        .attr("fill", isSelected ? "#06b6d4" : "#94a3b8")
        .style("cursor", "pointer")
        .text(d.shortMonth)
        .on("click", () => setSelectedMonthIndex(d.monthIndex));

      // Month index sub-label (e.g. 1. Ay)
      svg
        .append("text")
        .attr("x", x)
        .attr("y", height - margin.bottom + 36)
        .attr("text-anchor", "middle")
        .attr("font-size", "9px")
        .attr("fill", "#64748b")
        .text(`${d.monthIndex}. Ay`);
    });

    // Y-Axis Labels
    yTicks.forEach(tick => {
      const y = yScale(tick);
      svg
        .append("text")
        .attr("x", margin.left - 12)
        .attr("y", y + 4)
        .attr("text-anchor", "end")
        .attr("font-size", "10px")
        .attr("font-mono", "true")
        .attr("fill", "#64748b")
        .text(metricMode === "traffic" ? tick.toLocaleString("tr-TR") : `${tick}%`);
    });

    // Interactive Hover Tracking Plane
    const overlay = svg
      .append("rect")
      .attr("x", margin.left)
      .attr("y", margin.top)
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .attr("fill", "transparent")
      .style("cursor", "crosshair");

    // Guide cursor line
    const hoverLine = svg
      .append("line")
      .attr("stroke", "#38bdf8")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4,4")
      .style("opacity", 0)
      .attr("y1", margin.top)
      .attr("y2", height - margin.bottom);

    overlay
      .on("mousemove", (event: MouseEvent) => {
        const [mx, my] = d3.pointer(event);
        // Find closest month
        let closest = timeline[0];
        let minDist = Infinity;
        timeline.forEach(d => {
          const x = xScale(d.shortMonth)!;
          const dist = Math.abs(x - mx);
          if (dist < minDist) {
            minDist = dist;
            closest = d;
          }
        });

        const snapX = xScale(closest.shortMonth)!;
        hoverLine.attr("x1", snapX).attr("x2", snapX).style("opacity", 1);
        setHoveredPoint(closest);

        // Tooltip position relative to container
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          setTooltipPos({
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
          });
        }
      })
      .on("mouseleave", () => {
        hoverLine.style("opacity", 0);
        setHoveredPoint(null);
        setTooltipPos(null);
      })
      .on("click", (event: MouseEvent) => {
        const [mx] = d3.pointer(event);
        let closest = timeline[0];
        let minDist = Infinity;
        timeline.forEach(d => {
          const x = xScale(d.shortMonth)!;
          const dist = Math.abs(x - mx);
          if (dist < minDist) {
            minDist = dist;
            closest = d;
          }
        });
        setSelectedMonthIndex(closest.monthIndex);
      });
  }, [dataset, metricMode, selectedMonthIndex]);

  // Copy forecast summary
  const handleCopySummary = () => {
    const summary = dataset.summary;
    const text = `=== ${dataset.companyName} | 6 AYLIK GELECEK SEO PERFORMANS TAHMİNİ ===
Sektör: ${dataset.industry} | Şehir: ${dataset.city}
Senaryo Modeli: ${dataset.scenario.toUpperCase()} | Güven Skoru: %${summary.confidenceScore}
Başlangıç Trafiği: ${summary.startTraffic.toLocaleString("tr-TR")} /ay -> 6. Ay Hedefi: ${summary.endTraffic.toLocaleString("tr-TR")} /ay
Öngörülen Büyüme: +%${summary.totalTrafficGrowthPercent}
Pazar Liderini Geçme Tahmini: ${summary.leaderCrossoverMonth}. Ay
Kazanılacak Yeni İlk 10 Anahtar Kelime: +${summary.newTop10KeywordsCount}
Kazanılacak Yeni İlk 3 Anahtar Kelime: +${summary.newTop3KeywordsCount}

[6 AYLIK KİLOMETRE TAŞLARI]
${dataset.timeline
  .map(
    t =>
      `${t.monthIndex}. Ay (${t.monthLabel}): ${t.userTraffic.toLocaleString("tr-TR")} Trafik | ${t.milestoneTitle} (${t.dominantKdTier})`
  )
  .join("\n")}`;

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div
      id="gelecek-seo-performans-tahmincisi-section"
      ref={containerRef}
      className={`bg-slate-900 border border-indigo-900/60 rounded-3xl p-6 sm:p-8 text-white shadow-2xl space-y-8 relative overflow-hidden ${className}`}
    >
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER SECTION */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 border-b border-slate-800/80 pb-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-black tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Gelecek SEO Performans Tahmincisi</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-[11px] font-bold">
              <Calendar className="w-3 h-3 text-indigo-400" />
              <span>6 Aylık İleriye Dönük D3.js Modeli</span>
            </span>

            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-mono font-bold">
              Güven Skoru: %{dataset.summary.confidenceScore}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
            <span>Önümüzdeki 6 Ay: Rekabet & KD Zorluk Tahmini</span>
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
            Rakiplerin mevcut 30 günlük erozyon/ivme eğilimleri ve hedeflenen anahtar kelimelerin 
            <strong> Zorluk Seviyeleri (KD%)</strong> matematiksel olarak simüle edilerek önümüzdeki 6 ayın organik büyüme ve liderliği devralma projeksiyonu çıkarılmıştır.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            id="btn-copy-future-predictor"
            onClick={handleCopySummary}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
            title="6 Aylık tahmin özetini panoya kopyala"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Kopyalandı!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Özeti Kopyala</span>
              </>
            )}
          </button>

          <button
            type="button"
            id="btn-export-csv-future-predictor"
            onClick={() => exportPredictorDataToCsv(dataset)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
            title="6 Aylık simülasyon verisini CSV olarak indir"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>CSV İndir</span>
          </button>

          {onDownloadPdf && (
            <button
              type="button"
              id="btn-pdf-future-predictor"
              onClick={onDownloadPdf}
              className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg transition-all active:scale-95 cursor-pointer ring-1 ring-white/10"
              title="Gelecek Tahmin Verilerini PDF Raporuna Aktar"
            >
              <FileDown className="w-3.5 h-3.5 text-cyan-200" />
              <span>PDF Raporuna Aktar</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* KPI 1: Projected Traffic Growth */}
        <div className="bg-slate-950/80 border border-cyan-500/30 rounded-2xl p-4 space-y-1">
          <div className="text-[10px] uppercase font-mono font-bold text-cyan-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            <span>6 Aylık Net Büyüme</span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-white">
            +{dataset.summary.totalTrafficGrowthPercent}%
          </div>
          <div className="text-[11px] text-slate-400">
            {dataset.summary.startTraffic.toLocaleString("tr-TR")} ➔{" "}
            <span className="text-cyan-300 font-bold">
              {dataset.summary.endTraffic.toLocaleString("tr-TR")}
            </span>{" "}
            Ziyaretçi/ay
          </div>
        </div>

        {/* KPI 2: Leader Crossover Month */}
        <div className="bg-slate-950/80 border border-purple-500/30 rounded-2xl p-4 space-y-1">
          <div className="text-[10px] uppercase font-mono font-bold text-purple-400 flex items-center gap-1">
            <Target className="w-3.5 h-3.5 text-purple-400" />
            <span>Liderliği Devralma</span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-purple-200">
            {dataset.summary.leaderCrossoverMonth}. Ayda
          </div>
          <div className="text-[11px] text-slate-400">
            {dataset.timeline[dataset.summary.leaderCrossoverMonth! - 1]?.monthLabel || "Ocak 2027"} Eşiği
          </div>
        </div>

        {/* KPI 3: New Keywords in Top 10 */}
        <div className="bg-slate-950/80 border border-emerald-500/30 rounded-2xl p-4 space-y-1">
          <div className="text-[10px] uppercase font-mono font-bold text-emerald-400 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Yeni Top 10 Kelime</span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-emerald-300">
            +{dataset.summary.newTop10KeywordsCount} Kelime
          </div>
          <div className="text-[11px] text-slate-400">
            +{dataset.summary.newTop3KeywordsCount} Adet İlk 3 Sırada
          </div>
        </div>

        {/* KPI 4: Targeted KD Average */}
        <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-4 space-y-1">
          <div className="text-[10px] uppercase font-mono font-bold text-amber-400 flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Ortalama Hedef Zorluk</span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-amber-300">
            {dataset.summary.averageKdTarget} / 100 KD
          </div>
          <div className="text-[11px] text-slate-400">Dengeli Rekabet Seviyesi</div>
        </div>
      </div>

      {/* FILTER & SCENARIO TOOLBAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
        {/* Scenario Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Büyüme Senaryosu:</span>
          </span>

          <button
            type="button"
            onClick={() => setScenario("aggressive")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              scenario === "aggressive"
                ? "bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md ring-1 ring-rose-400"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            🚀 Agresif Büyüme (+%132 Hız)
          </button>

          <button
            type="button"
            onClick={() => setScenario("balanced")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              scenario === "balanced"
                ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md ring-1 ring-cyan-400"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            ⚖️ Dengeli Organik (Varsayılan)
          </button>

          <button
            type="button"
            onClick={() => setScenario("conservative")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              scenario === "conservative"
                ? "bg-slate-800 text-white shadow-md ring-1 ring-slate-600"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            🛡️ Muhafazakar Model
          </button>
        </div>

        {/* KD Filter & Metric Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          {/* KD Difficulty Filter */}
          <div className="inline-flex p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setKdFilter("all")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                kdFilter === "all" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Tüm KD (0-100)
            </button>
            <button
              type="button"
              onClick={() => setKdFilter("easy")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                kdFilter === "easy" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Kolay (KD &lt; 35)
            </button>
            <button
              type="button"
              onClick={() => setKdFilter("medium")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                kdFilter === "medium" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Orta (KD 36-65)
            </button>
            <button
              type="button"
              onClick={() => setKdFilter("hard")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                kdFilter === "hard" ? "bg-rose-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Zor (KD 66+)
            </button>
          </div>

          {/* Metric Toggle */}
          <div className="inline-flex p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setMetricMode("traffic")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                metricMode === "traffic" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Organik Trafik
            </button>
            <button
              type="button"
              onClick={() => setMetricMode("visibility")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                metricMode === "visibility" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Görünürlük (%)
            </button>
          </div>
        </div>
      </div>

      {/* D3.JS INTERACTIVE VISUALIZATION CARD */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-3xl p-4 sm:p-6 space-y-4 relative shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-400/30 text-cyan-300">
              <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-bold">
                D3.js Dinamik Çoklu Seri Projeksiyonu
              </div>
              <h3 className="text-base font-black text-white">
                6 Aylık Organik Trafik Yörüngesi & %95 Güven Aralığı
              </h3>
            </div>
          </div>

          {/* Legend Items */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-1 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
              <span className="text-cyan-300 font-bold">{dataset.companyName} (Siz)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-1 rounded-full bg-purple-500 border border-dashed border-purple-300" />
              <span className="text-purple-300">Pazar Lideri</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-1 rounded-full bg-emerald-500" />
              <span className="text-emerald-300">Yerel Güçlü</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-1 rounded-full bg-amber-500" />
              <span className="text-amber-300">Meydan Okuyan</span>
            </div>
          </div>
        </div>

        {/* SVG Container */}
        <div className="relative w-full overflow-x-auto">
          <svg
            ref={svgRef}
            viewBox="0 0 920 360"
            className="w-full h-auto min-w-[720px] select-none"
          />

          {/* Floating Crosshair Tooltip */}
          {hoveredPoint && tooltipPos && (
            <div
              className="absolute z-30 pointer-events-none bg-slate-900/95 border border-cyan-500/50 rounded-2xl p-4 shadow-2xl backdrop-blur-md text-xs space-y-2.5 w-64 transform -translate-x-1/2 -translate-y-full"
              style={{
                left: `${Math.max(130, Math.min(790, tooltipPos.x))}px`,
                top: `${Math.max(120, tooltipPos.y - 12)}px`
              }}
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span className="font-black text-cyan-300">{hoveredPoint.monthLabel}</span>
                <span className="text-[10px] font-mono text-slate-400 font-bold">
                  {hoveredPoint.monthIndex}. Ay
                </span>
              </div>

              <div className="space-y-1 font-mono">
                <div className="flex items-center justify-between text-white font-bold">
                  <span className="text-cyan-400">{dataset.companyName}:</span>
                  <span>{hoveredPoint.userTraffic.toLocaleString("tr-TR")} /ay</span>
                </div>
                <div className="text-[10px] text-slate-400 pl-2">
                  Güven Aralığı: {hoveredPoint.userTrafficLower.toLocaleString("tr-TR")} - {hoveredPoint.userTrafficUpper.toLocaleString("tr-TR")}
                </div>

                <div className="flex items-center justify-between text-purple-300 pt-1">
                  <span>Pazar Lideri:</span>
                  <span>{hoveredPoint.comp1Traffic.toLocaleString("tr-TR")} /ay</span>
                </div>

                <div className="flex items-center justify-between text-emerald-300">
                  <span>Yerel Rakip:</span>
                  <span>{hoveredPoint.comp2Traffic.toLocaleString("tr-TR")} /ay</span>
                </div>

                <div className="flex items-center justify-between text-amber-300">
                  <span>Meydan Okuyan:</span>
                  <span>{hoveredPoint.comp3Traffic.toLocaleString("tr-TR")} /ay</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-300 leading-tight">
                <strong className="text-cyan-400">Kilometre Taşı:</strong> {hoveredPoint.milestoneTitle}
              </div>
            </div>
          )}
        </div>

        <div className="text-center text-[11px] text-slate-500 font-mono">
          Grafik üzerindeki herhangi bir aya tıklayarak veya fareyi gezdirerek o ayın detaylı öngörülerini inceleyebilirsiniz.
        </div>
      </div>

      {/* 6-MONTH MILESTONE CARDS (INTERACTIVE) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>6 Aylık Kademeli Başarı Takvimi & Kilometre Taşları</span>
          </h4>
          <span className="text-xs text-slate-400 font-mono">
            Seçili Ay: <strong className="text-cyan-300">{activeMonth.monthLabel}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {dataset.timeline.map(m => {
            const isSelected = m.monthIndex === selectedMonthIndex;
            const isCrossover = m.monthIndex === dataset.summary.leaderCrossoverMonth;

            return (
              <div
                key={m.monthIndex}
                onClick={() => setSelectedMonthIndex(m.monthIndex)}
                className={`rounded-2xl p-3.5 transition-all cursor-pointer border space-y-2 ${
                  isSelected
                    ? "bg-slate-900 border-cyan-400 ring-2 ring-cyan-500/40 shadow-xl"
                    : isCrossover
                    ? "bg-slate-950/90 border-purple-500/50 hover:border-purple-400"
                    : "bg-slate-950/70 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    {m.monthIndex}. Ay
                  </span>
                  {isCrossover && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-pink-500/30 text-pink-300 border border-pink-400/40">
                      Liderlik
                    </span>
                  )}
                </div>

                <div className="font-black text-xs text-white truncate">{m.shortMonth}</div>

                <div className="font-mono font-black text-sm text-cyan-300">
                  {m.userTraffic.toLocaleString("tr-TR")}
                  <span className="text-[10px] font-normal text-slate-400 block font-sans">
                    ziyaret/ay
                  </span>
                </div>

                <div className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                  {m.milestoneTitle}
                </div>

                <div className="pt-1.5 border-t border-slate-800/80 text-[9px] font-mono text-emerald-400">
                  +{m.unlockedKeywordsCount} Yeni Kelime
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SELECTED MONTH SPOTLIGHT EXPANSION */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border border-cyan-500/40 rounded-2xl p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
              {activeMonth.monthIndex}. Ay Odak Analizi ({activeMonth.monthLabel})
            </span>
            <span className="text-xs font-mono text-slate-400">
              Baskın Zorluk Kümeleri: <strong>{activeMonth.dominantKdTier}</strong>
            </span>
          </div>

          <div className="text-xs font-mono text-cyan-300">
            Tahmini SERP Sıralama Ortalaması: <strong>#{activeMonth.userAvgRank}</strong>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
          {activeMonth.milestoneDesc}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-mono">
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Siteniz Trafik</div>
            <div className="text-cyan-400 font-black text-sm">
              {activeMonth.userTraffic.toLocaleString("tr-TR")}
            </div>
          </div>
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Pazar Lideri</div>
            <div className="text-purple-300 font-black text-sm">
              {activeMonth.comp1Traffic.toLocaleString("tr-TR")}
            </div>
          </div>
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Top 10 Kelimeler</div>
            <div className="text-emerald-300 font-black text-sm">
              {activeMonth.userTop10Count} Adet
            </div>
          </div>
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Top 3 Kelimeler</div>
            <div className="text-amber-300 font-black text-sm">
              {activeMonth.userTop3Count} Adet
            </div>
          </div>
        </div>
      </div>

      {/* KEYWORD DIFFICULTY (KD%) TARGET BREAKDOWN TABLE */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-400" />
              <span>Anahtar Kelime Zorluk Seviyeleri (KD%) & SERP Tırmanış Tahmini</span>
            </h4>
            <p className="text-xs text-slate-400">
              Hedef anahtar kelimelerin zorluk seviyelerine göre 3. ve 6. aydaki tahmini sıralama sıçramaları.
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Anahtar kelime ara..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Hedef Anahtar Kelime</th>
                <th className="py-3 px-3">Hacim</th>
                <th className="py-3 px-3">Zorluk (KD)</th>
                <th className="py-3 px-3 text-center">Mevcut Sıra</th>
                <th className="py-3 px-3 text-center">3. Ay Tahmin</th>
                <th className="py-3 px-3 text-center">6. Ay Tahmin</th>
                <th className="py-3 px-3 text-right">Tahmini Tıklama</th>
                <th className="py-3 px-4">Stratejik Not</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {displayedKeywords.map(kw => {
                const isEasy = kw.difficulty <= 35;
                const isMedium = kw.difficulty > 35 && kw.difficulty <= 65;

                return (
                  <tr key={kw.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">
                      <div className="flex items-center gap-2">
                        <span>{kw.keyword}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                            kw.actionPriority === "Acil Fırsat"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : kw.actionPriority === "Orta Vade"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          }`}
                        >
                          {kw.actionPriority}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-300">
                      {kw.monthlyVolumeFormatted}
                    </td>

                    {/* KD Badge with mini bar */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono font-black text-xs ${
                            isEasy
                              ? "text-emerald-400"
                              : isMedium
                              ? "text-amber-400"
                              : "text-rose-400"
                          }`}
                        >
                          {kw.difficulty}%
                        </span>
                        <div className="w-12 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isEasy ? "bg-emerald-500" : isMedium ? "bg-amber-500" : "bg-rose-500"
                            }`}
                            style={{ width: `${kw.difficulty}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center font-mono">
                      {kw.currentRank ? (
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                          #{kw.currentRank}
                        </span>
                      ) : (
                        <span className="text-slate-500">&gt;20</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center font-mono">
                      <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                        #{kw.projected3MonthRank}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center font-mono">
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 font-black">
                        #{kw.projected6MonthRank}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-cyan-300">
                      +{kw.expectedMonthlyClicks.toLocaleString("tr-TR")} /ay
                    </td>

                    <td className="py-3 px-4 text-xs text-slate-400">
                      {kw.growthNote}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* FOOTER SUMMARY & NAVIGATION BUTTONS */}
      <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-500 shrink-0" />
          <span>
            Tahmin algoritması; sitenizin <strong>Cloudflare 0.02s TTFB</strong> hızını, rakiplerin 30 günlük erozyon oranlarını ve Google INP güncellemesini baz alır.
          </span>
        </div>

        {onNavigateTab && (
          <button
            type="button"
            id="btn-navigate-to-keywords"
            onClick={() => onNavigateTab("rakip-kiyaslama-tablosu")}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <span>Rakip Kıyaslama Tablosuna Git</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
          </button>
        )}
      </div>
    </div>
  );
};
