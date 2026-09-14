import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import { 
  Flame, 
  Sparkles, 
  TrendingUp, 
  Compass, 
  Sliders, 
  Smartphone, 
  Monitor, 
  ExternalLink, 
  Search, 
  Layers, 
  BarChart3, 
  Grid3X3, 
  LayoutGrid, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Info, 
  Zap, 
  RefreshCw, 
  ArrowUpRight,
  Filter,
  Eye,
  MousePointerClick,
  Award
} from "lucide-react";
import { SiteConfig, CustomerPanelTab } from "../../types";
import { 
  generateSeoHeatmapData, 
  SeoHeatmapSectionData, 
  HeatMetricType, 
  SeoHeatmapSummary 
} from "../../utils/seoHeatmapEngine";

interface SeoHeatmapWidgetProps {
  config: SiteConfig;
  onNavigateTab?: (tab: CustomerPanelTab) => void;
  className?: string;
}

type HeatViewMode = "matrix" | "treemap" | "ranked";

export const SeoHeatmapWidget: React.FC<SeoHeatmapWidgetProps> = ({
  config,
  onNavigateTab,
  className = ""
}) => {
  const [activeMetric, setActiveMetric] = useState<HeatMetricType>("heatIndex");
  const [viewMode, setViewMode] = useState<HeatViewMode>("matrix");
  const [deviceFilter, setDeviceFilter] = useState<"all" | "mobile" | "desktop">("all");
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>("sec-services");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<"heat" | "traffic" | "potential">("heat");

  const matrixSvgRef = useRef<SVGSVGElement | null>(null);
  const treemapSvgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Compute heatmap data from current config
  const heatmapData: SeoHeatmapSummary = useMemo(() => {
    return generateSeoHeatmapData(config);
  }, [config]);

  // Sorted sections based on selection
  const displaySections = useMemo(() => {
    const list = [...heatmapData.sections];
    if (sortBy === "heat") {
      return list.sort((a, b) => b.heatIndex - a.heatIndex);
    }
    if (sortBy === "traffic") {
      return list.sort((a, b) => b.monthlyVisits - a.monthlyVisits);
    }
    if (sortBy === "potential") {
      return list.sort((a, b) => b.seoPotentialScore - a.seoPotentialScore);
    }
    return list;
  }, [heatmapData.sections, sortBy]);

  // Currently selected section for detail drawer
  const selectedSection = useMemo(() => {
    return displaySections.find(s => s.id === selectedSectionId) || displaySections[0] || null;
  }, [displaySections, selectedSectionId]);

  // Refresh animation simulation
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  // Matrix Heatmap Columns Definition
  const matrixColumns: Array<{
    key: HeatMetricType;
    label: string;
    shortLabel: string;
    unit: string;
    getValue: (s: SeoHeatmapSectionData) => number;
    formatValue: (s: SeoHeatmapSectionData) => string;
  }> = useMemo(() => [
    {
      key: "heatIndex",
      label: "Genel Isı Endeksi",
      shortLabel: "Isı Endeksi",
      unit: "Puan",
      getValue: (s) => s.heatIndex,
      formatValue: (s) => `${s.heatIndex}`
    },
    {
      key: "trafficShare",
      label: "Organik Trafik Hacmi",
      shortLabel: "Trafik Payı",
      unit: "%",
      getValue: (s) => deviceFilter === "mobile" ? Math.round(s.trafficShare * 0.71) : deviceFilter === "desktop" ? Math.round(s.trafficShare * 0.29) : s.trafficShare,
      formatValue: (s) => {
        const val = deviceFilter === "mobile" ? Math.round(s.trafficShare * 0.71) : deviceFilter === "desktop" ? Math.round(s.trafficShare * 0.29) : s.trafficShare;
        return `%${val}`;
      }
    },
    {
      key: "seoPotentialScore",
      label: "SEO Fırsat & Potansiyel",
      shortLabel: "SEO Fırsatı",
      unit: "Puan",
      getValue: (s) => s.seoPotentialScore,
      formatValue: (s) => `${s.seoPotentialScore}/100`
    },
    {
      key: "ctr",
      label: "SERP Tıklanma Oranı (CTR)",
      shortLabel: "CTR (%)",
      unit: "%",
      getValue: (s) => Math.round(s.ctr * 10),
      formatValue: (s) => `%${s.ctr.toFixed(1)}`
    },
    {
      key: "keywordCount",
      label: "İzlenen Anahtar Kelimeler",
      shortLabel: "Kelimeler",
      unit: "Adet",
      getValue: (s) => s.keywordCount,
      formatValue: (s) => `${s.keywordCount} kelime`
    },
    {
      key: "conversionRate",
      label: "Dönüşüm / Lead Üretimi",
      shortLabel: "Dönüşüm",
      unit: "%",
      getValue: (s) => Math.round(s.conversionRate * 10),
      formatValue: (s) => `%${s.conversionRate.toFixed(1)}`
    }
  ], [deviceFilter]);

  // 1. D3 MATRIX HEATMAP RENDER
  useEffect(() => {
    if (viewMode !== "matrix" || !matrixSvgRef.current) return;

    const svgEl = matrixSvgRef.current;
    const svg = d3.select(svgEl);
    svg.selectAll("*").remove(); // Clear previous render

    const sections = displaySections;
    const cols = matrixColumns;

    const margin = { top: 46, right: 24, bottom: 20, left: 160 };
    const width = 820;
    const height = sections.length * 44 + margin.top + margin.bottom;

    svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("width", "100%")
      .attr("height", height)
      .style("overflow", "visible");

    // Scales
    const x = d3.scaleBand()
      .domain(cols.map(c => c.key))
      .range([margin.left, width - margin.right])
      .padding(0.08);

    const y = d3.scaleBand()
      .domain(sections.map(s => s.id))
      .range([margin.top, height - margin.bottom])
      .padding(0.12);

    // Dynamic Heat Color Scale (Cool Slate/Blue -> Warm Amber -> Flame Orange -> Vivid Red)
    const colorScale = d3.scaleLinear<string>()
      .domain([0, 35, 65, 85, 100])
      .range(["#f1f5f9", "#93c5fd", "#f59e0b", "#f97316", "#ef4444"]);

    // Tooltip div (appended to container)
    let tooltip = d3.select(containerRef.current).select<HTMLDivElement>(".d3-seo-tooltip");
    if (tooltip.empty()) {
      tooltip = d3.select(containerRef.current)
        .append("div")
        .attr("class", "d3-seo-tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("pointer-events", "none")
        .style("z-index", "30");
    }

    // Top Column Headers (X Axis)
    const colHeaders = svg.append("g")
      .attr("class", "column-headers");

    cols.forEach(col => {
      const colX = (x(col.key) || 0) + x.bandwidth() / 2;
      const isSelectedMetric = col.key === activeMetric;

      const headerGroup = colHeaders.append("g")
        .attr("transform", `translate(${colX}, ${margin.top - 12})`)
        .style("cursor", "pointer")
        .on("click", () => setActiveMetric(col.key));

      headerGroup.append("rect")
        .attr("x", -x.bandwidth() / 2)
        .attr("y", -22)
        .attr("width", x.bandwidth())
        .attr("height", 24)
        .attr("rx", 6)
        .attr("fill", isSelectedMetric ? "#0f172a" : "#f8fafc")
        .attr("stroke", isSelectedMetric ? "#0f172a" : "#e2e8f0")
        .attr("stroke-width", 1);

      headerGroup.append("text")
        .attr("text-anchor", "middle")
        .attr("y", -6)
        .attr("font-size", "10px")
        .attr("font-weight", isSelectedMetric ? "bold" : "600")
        .attr("fill", isSelectedMetric ? "#ffffff" : "#475569")
        .text(col.shortLabel);
    });

    // Row Labels (Y Axis - Sections)
    const rowLabels = svg.append("g")
      .attr("class", "row-labels");

    sections.forEach(sec => {
      const secY = (y(sec.id) || 0) + y.bandwidth() / 2;
      const isSelected = sec.id === selectedSectionId;

      const rowGroup = rowLabels.append("g")
        .attr("transform", `translate(10, ${secY})`)
        .style("cursor", "pointer")
        .on("click", () => setSelectedSectionId(sec.id));

      // Row background hover highlight
      rowGroup.append("rect")
        .attr("x", -5)
        .attr("y", -y.bandwidth() / 2)
        .attr("width", margin.left - 15)
        .attr("height", y.bandwidth())
        .attr("rx", 8)
        .attr("fill", isSelected ? "#e0f2fe" : "transparent")
        .attr("stroke", isSelected ? "#38bdf8" : "transparent")
        .attr("stroke-width", 1.5);

      // Section short name
      rowGroup.append("text")
        .attr("x", 8)
        .attr("y", -2)
        .attr("font-size", "11px")
        .attr("font-weight", isSelected ? "800" : "700")
        .attr("fill", isSelected ? "#0369a1" : "#0f172a")
        .text(sec.shortName);

      // Section sub-indicator
      rowGroup.append("text")
        .attr("x", 8)
        .attr("y", 11)
        .attr("font-size", "9px")
        .attr("font-weight", "500")
        .attr("fill", "#64748b")
        .text(`${sec.monthlyVisits.toLocaleString("tr-TR")} tekil hit`);
    });

    // Grid Cells (Rectangles with interactive heat values)
    const cellsGroup = svg.append("g").attr("class", "matrix-cells");

    sections.forEach(sec => {
      cols.forEach(col => {
        const cellX = x(col.key) || 0;
        const cellY = y(sec.id) || 0;
        const cellW = x.bandwidth();
        const cellH = y.bandwidth();

        // Calculate normalized score for color (0-100)
        let normalizedScore = 0;
        if (col.key === "heatIndex") normalizedScore = sec.heatIndex;
        else if (col.key === "trafficShare") normalizedScore = Math.min(100, sec.trafficShare * 2.5);
        else if (col.key === "seoPotentialScore") normalizedScore = sec.seoPotentialScore;
        else if (col.key === "ctr") normalizedScore = Math.min(100, sec.ctr * 7.5);
        else if (col.key === "keywordCount") normalizedScore = Math.min(100, sec.keywordCount * 5);
        else if (col.key === "conversionRate") normalizedScore = Math.min(100, sec.conversionRate * 8.5);

        const bgColor = colorScale(normalizedScore);
        const isHighlightCell = col.key === activeMetric;
        const isSelectedRow = sec.id === selectedSectionId;

        const cellGroup = cellsGroup.append("g")
          .attr("class", `cell cell-${sec.id}-${col.key}`)
          .style("cursor", "pointer")
          .on("click", () => {
            setSelectedSectionId(sec.id);
            setActiveMetric(col.key);
          })
          .on("mouseenter", (event) => {
            const [mouseX, mouseY] = d3.pointer(event, containerRef.current);
            tooltip
              .html(`
                <div class="bg-slate-900/95 text-white p-2.5 rounded-xl text-xs shadow-xl border border-slate-700 max-w-xs backdrop-blur-xs">
                  <div class="flex items-center justify-between gap-2 pb-1 border-b border-slate-700">
                    <span class="font-bold text-amber-400">${sec.name}</span>
                    <span class="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] font-mono">${col.shortLabel}</span>
                  </div>
                  <div class="mt-1.5 flex items-baseline justify-between gap-3">
                    <span class="text-slate-300">Değer:</span>
                    <span class="font-mono font-black text-sm text-white">${col.formatValue(sec)}</span>
                  </div>
                  <div class="flex items-baseline justify-between gap-3 text-[11px] text-slate-400">
                    <span>Sıcaklık Derecesi:</span>
                    <span class="font-bold text-emerald-400">%${normalizedScore} Isı</span>
                  </div>
                  <div class="mt-1 pt-1 border-t border-slate-800 text-[10px] text-slate-400">
                    Detaylı incelemek için tıklayın.
                  </div>
                </div>
              `)
              .style("visibility", "visible")
              .style("left", `${mouseX + 15}px`)
              .style("top", `${mouseY - 20}px`);
          })
          .on("mousemove", (event) => {
            const [mouseX, mouseY] = d3.pointer(event, containerRef.current);
            tooltip
              .style("left", `${mouseX + 15}px`)
              .style("top", `${mouseY - 20}px`);
          })
          .on("mouseleave", () => {
            tooltip.style("visibility", "hidden");
          });

        // Heat rect
        cellGroup.append("rect")
          .attr("x", cellX)
          .attr("y", cellY)
          .attr("width", cellW)
          .attr("height", cellH)
          .attr("rx", 7)
          .attr("fill", bgColor)
          .attr("stroke", isSelectedRow && isHighlightCell ? "#0f172a" : isSelectedRow ? "#38bdf8" : "#ffffff")
          .attr("stroke-width", isSelectedRow && isHighlightCell ? 2.5 : isSelectedRow ? 1.5 : 1)
          .attr("opacity", 0.92)
          .transition()
          .duration(300)
          .attr("opacity", 1);

        // Value text inside cell
        const isDarkText = normalizedScore < 60;
        cellGroup.append("text")
          .attr("x", cellX + cellW / 2)
          .attr("y", cellY + cellH / 2 + 4)
          .attr("text-anchor", "middle")
          .attr("font-size", cellW < 90 ? "10px" : "11px")
          .attr("font-weight", isHighlightCell ? "900" : "700")
          .attr("font-family", "monospace")
          .attr("fill", isDarkText ? "#1e293b" : "#ffffff")
          .attr("pointer-events", "none")
          .text(col.formatValue(sec));
      });
    });

  }, [displaySections, matrixColumns, activeMetric, selectedSectionId, viewMode, deviceFilter]);

  // 2. D3 TREEMAP RENDER
  useEffect(() => {
    if (viewMode !== "treemap" || !treemapSvgRef.current) return;

    const svgEl = treemapSvgRef.current;
    const svg = d3.select(svgEl);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 360;

    svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("width", "100%")
      .attr("height", height);

    // Hierarchical structure for Treemap
    const hierarchyData = {
      name: "Site",
      children: displaySections.map(s => ({
        ...s,
        value: s.monthlyVisits
      }))
    };

    const root = d3.hierarchy(hierarchyData)
      .sum((d: any) => d.value)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    d3.treemap()
      .size([width, height])
      .paddingInner(6)
      .paddingOuter(4)
      .round(true)(root as any);

    // Heat scale for Treemap (Mapped to SEO Potential or Heat Index)
    const colorScale = d3.scaleLinear<string>()
      .domain([40, 65, 80, 95])
      .range(["#38bdf8", "#f59e0b", "#f97316", "#ef4444"]);

    let tooltip = d3.select(containerRef.current).select<HTMLDivElement>(".d3-seo-tooltip");

    const leafNodes = svg.selectAll("g")
      .data(root.leaves())
      .join("g")
      .attr("transform", (d: any) => `translate(${d.x0},${d.y0})`)
      .style("cursor", "pointer")
      .on("click", (event, d: any) => {
        setSelectedSectionId(d.data.id);
      })
      .on("mouseenter", (event, d: any) => {
        const [mouseX, mouseY] = d3.pointer(event, containerRef.current);
        const s: SeoHeatmapSectionData = d.data;
        tooltip
          .html(`
            <div class="bg-slate-900/95 text-white p-2.5 rounded-xl text-xs shadow-xl border border-slate-700 max-w-xs">
              <div class="font-bold text-amber-400 pb-1 border-b border-slate-700">${s.name}</div>
              <div class="mt-1.5 space-y-1 font-mono text-[11px]">
                <div class="flex justify-between"><span>Aylık Trafik:</span> <span class="text-emerald-400 font-bold">${s.monthlyVisits.toLocaleString()} Ziyaretçi</span></div>
                <div class="flex justify-between"><span>Trafik Payı:</span> <span>%${s.trafficShare}</span></div>
                <div class="flex justify-between"><span>SEO Fırsat Skoru:</span> <span class="text-amber-400 font-bold">${s.seoPotentialScore}/100</span></div>
                <div class="flex justify-between"><span>Dönüşüm Oranı:</span> <span>%${s.conversionRate}</span></div>
              </div>
            </div>
          `)
          .style("visibility", "visible")
          .style("left", `${mouseX + 15}px`)
          .style("top", `${mouseY - 20}px`);
      })
      .on("mousemove", (event) => {
        const [mouseX, mouseY] = d3.pointer(event, containerRef.current);
        tooltip.style("left", `${mouseX + 15}px`).style("top", `${mouseY - 20}px`);
      })
      .on("mouseleave", () => {
        tooltip.style("visibility", "hidden");
      });

    // Treemap Tile Rect
    leafNodes.append("rect")
      .attr("width", (d: any) => Math.max(0, d.x1 - d.x0))
      .attr("height", (d: any) => Math.max(0, d.y1 - d.y0))
      .attr("rx", 8)
      .attr("fill", (d: any) => colorScale(d.data.seoPotentialScore))
      .attr("stroke", (d: any) => d.data.id === selectedSectionId ? "#0f172a" : "#ffffff")
      .attr("stroke-width", (d: any) => d.data.id === selectedSectionId ? 3 : 1.5);

    // Title label
    leafNodes.append("text")
      .attr("x", 10)
      .attr("y", 22)
      .attr("font-size", "12px")
      .attr("font-weight", "800")
      .attr("fill", "#ffffff")
      .text((d: any) => {
        const w = d.x1 - d.x0;
        return w > 90 ? d.data.shortName : "";
      });

    // Metric detail
    leafNodes.append("text")
      .attr("x", 10)
      .attr("y", 40)
      .attr("font-size", "11px")
      .attr("font-weight", "700")
      .attr("font-family", "monospace")
      .attr("fill", "rgba(255,255,255,0.92)")
      .text((d: any) => {
        const w = d.x1 - d.x0;
        const h = d.y1 - d.y0;
        return w > 100 && h > 50 ? `${d.data.monthlyVisits.toLocaleString("tr-TR")} Hit • %${d.data.trafficShare}` : "";
      });

    // Score badge
    leafNodes.append("text")
      .attr("x", 10)
      .attr("y", 58)
      .attr("font-size", "10px")
      .attr("font-weight", "600")
      .attr("fill", "rgba(255,255,255,0.85)")
      .text((d: any) => {
        const w = d.x1 - d.x0;
        const h = d.y1 - d.y0;
        return w > 120 && h > 70 ? `SEO Potansiyeli: ${d.data.seoPotentialScore} Puan` : "";
      });

  }, [displaySections, selectedSectionId, viewMode]);

  return (
    <div 
      ref={containerRef}
      id="seo-heatmap-widget"
      className={`bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs relative overflow-hidden ${className}`}
    >
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-5 border-b border-slate-100 gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-orange-500 to-amber-400 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>SEO &amp; Trafik Isı Haritası</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 font-mono flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  D3.js Engine
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Sitenizin en çok organik trafik çeken ve Google sıralama potansiyeli en yüksek bölümlerinin görsel yoğunluk matrisi.
            </p>
          </div>
        </div>

        {/* Action Controls: View Switcher, Device, Refresh */}
        <div className="flex items-center gap-2 flex-wrap self-start lg:self-auto">
          {/* View Mode Toggle */}
          <div className="bg-slate-100 p-0.5 rounded-xl flex items-center border border-slate-200 text-xs font-bold">
            <button
              type="button"
              id="btn-view-matrix"
              onClick={() => setViewMode("matrix")}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "matrix" 
                  ? "bg-white text-slate-900 shadow-2xs" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="D3 Matris Isı Haritası Görünümü"
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span className="text-[11px] hidden sm:inline">Matris</span>
            </button>

            <button
              type="button"
              id="btn-view-treemap"
              onClick={() => setViewMode("treemap")}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "treemap" 
                  ? "bg-white text-slate-900 shadow-2xs" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="D3 Ağaç Haritası (Treemap) Hacim Dağılımı"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="text-[11px] hidden sm:inline">Ağaç Haritası</span>
            </button>

            <button
              type="button"
              id="btn-view-ranked"
              onClick={() => setViewMode("ranked")}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "ranked" 
                  ? "bg-white text-slate-900 shadow-2xs" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Bölüm Sıralama Tablosu"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="text-[11px] hidden sm:inline">Sıralama</span>
            </button>
          </div>

          {/* Device filter */}
          <div className="bg-slate-100 p-0.5 rounded-xl flex items-center border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setDeviceFilter("all")}
              className={`px-2 py-1.5 rounded-lg text-[11px] cursor-pointer transition-all ${
                deviceFilter === "all" ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-500"
              }`}
            >
              Tümü
            </button>
            <button
              type="button"
              onClick={() => setDeviceFilter("mobile")}
              className={`px-2 py-1.5 rounded-lg flex items-center gap-1 text-[11px] cursor-pointer transition-all ${
                deviceFilter === "mobile" ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-500"
              }`}
              title="Mobil Ziyaretçiler (%71)"
            >
              <Smartphone className="w-3 h-3" />
              <span>Mobil</span>
            </button>
            <button
              type="button"
              onClick={() => setDeviceFilter("desktop")}
              className={`px-2 py-1.5 rounded-lg flex items-center gap-1 text-[11px] cursor-pointer transition-all ${
                deviceFilter === "desktop" ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-500"
              }`}
              title="Masaüstü Ziyaretçiler (%29)"
            >
              <Monitor className="w-3 h-3" />
              <span>Masaüstü</span>
            </button>
          </div>

          {/* Refresh simulated data */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
            title="Telemetri Verilerini Yenile"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-amber-500" : ""}`} />
          </button>
        </div>
      </div>

      {/* Top Quick Stats Pill Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">En Sıcak Bölüm</span>
            <span className="text-xs font-black text-slate-900 truncate block">
              {heatmapData.hottestSection.shortName} (%{heatmapData.hottestSection.trafficShare})
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">En Büyük Fırsat</span>
            <span className="text-xs font-black text-slate-900 truncate block">
              {heatmapData.highestPotentialSection.shortName} ({heatmapData.highestPotentialSection.seoPotentialScore} Puan)
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Eye className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">Aylık Organik Hit</span>
            <span className="text-xs font-black text-slate-900 font-mono truncate block">
              {heatmapData.totalMonthlyOrganicVisits.toLocaleString("tr-TR")} Ziyaretçi
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">İzlenen Kelimeler</span>
            <span className="text-xs font-black text-slate-900 font-mono truncate block">
              {heatmapData.totalKeywordsTracked} Hedef Kelime
            </span>
          </div>
        </div>
      </div>

      {/* Metric filter toolbar and sorting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-100 gap-3 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 uppercase mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Metrik Filtresi:
          </span>
          {matrixColumns.map((col) => (
            <button
              key={col.key}
              type="button"
              onClick={() => setActiveMetric(col.key)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeMetric === col.key
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {col.shortLabel}
            </button>
          ))}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
          <span className="text-slate-400 font-medium">Sırala:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-800 outline-none cursor-pointer"
          >
            <option value="heat">🔥 Isı Derecesi (En Sıcak)</option>
            <option value="traffic">📊 Trafik Hacmine Göre</option>
            <option value="potential">🚀 SEO Potansiyeline Göre</option>
          </select>
        </div>
      </div>

      {/* VISUALIZATION CANVAS */}
      <div className="relative overflow-x-auto min-h-[360px] rounded-xl bg-slate-50/40 p-2 sm:p-4 border border-slate-100">
        
        {/* VIEW 1: D3 MATRIX HEATMAP */}
        {viewMode === "matrix" && (
          <div className="w-full flex justify-center">
            <svg 
              ref={matrixSvgRef} 
              id="d3-seo-heatmap-matrix" 
              className="w-full max-w-4xl"
            />
          </div>
        )}

        {/* VIEW 2: D3 TREEMAP (AREA = VISITS, COLOR = SEO POTENTIAL) */}
        {viewMode === "treemap" && (
          <div className="w-full flex flex-col items-center">
            <div className="w-full max-w-4xl mb-2 flex items-center justify-between text-xs text-slate-500">
              <span>Kutu Büyüklüğü: <strong>Aylık Trafik Hacmi</strong></span>
              <span>Kutu Sıcaklığı / Rengi: <strong>SEO Fırsat Skoru</strong></span>
            </div>
            <svg 
              ref={treemapSvgRef} 
              id="d3-seo-heatmap-treemap" 
              className="w-full max-w-4xl rounded-xl shadow-2xs"
            />
          </div>
        )}

        {/* VIEW 3: RANKED TABLE / COMPARATIVE BARS */}
        {viewMode === "ranked" && (
          <div className="space-y-2.5 max-w-4xl mx-auto py-2">
            {displaySections.map((sec, idx) => {
              const isSelected = sec.id === selectedSectionId;
              return (
                <div
                  key={sec.id}
                  onClick={() => setSelectedSectionId(sec.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected 
                      ? "bg-amber-50/60 border-amber-300 ring-1 ring-amber-300 shadow-xs" 
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-slate-900">{sec.name}</span>
                        <span 
                          className="px-2 py-0.2 rounded text-[10px] font-bold text-white uppercase font-mono"
                          style={{ backgroundColor: sec.heatColor }}
                        >
                          {sec.heatLevel.toUpperCase()} ISI
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                        <span>Aylık: <strong>{sec.monthlyVisits.toLocaleString("tr-TR")} Hit</strong></span>
                        <span>Pay: <strong>%{sec.trafficShare}</strong></span>
                        <span>Ort. SERP: <strong>#{sec.organicRank}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Horizontal visual progress bars */}
                  <div className="flex items-center gap-4 sm:w-72 shrink-0">
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>SEO Potansiyeli</span>
                        <span className="font-bold text-slate-800">%{sec.seoPotentialScore}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-500 transition-all duration-500"
                          style={{ width: `${sec.seoPotentialScore}%` }}
                        />
                      </div>
                    </div>

                    <div className="text-right font-mono shrink-0">
                      <span className="text-xs font-black text-slate-900 block">%{sec.conversionRate}</span>
                      <span className="text-[10px] text-slate-400">Dönüşüm</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* D3 Heatmap Color Scale Legend */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-600">Isı Skalası:</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400">Soğuk</span>
            <div className="w-32 h-2.5 rounded-full bg-gradient-to-r from-slate-200 via-blue-300 via-amber-400 via-orange-500 to-rose-600" />
            <span className="text-[10px] text-slate-900 font-bold">Çok Sıcak / Kritik Hit</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <MousePointerClick className="w-3.5 h-3.5 text-slate-400" />
            Bölüm veya hücreye tıklayarak detaylı SEO raporunu inceleyin
          </span>
        </div>
      </div>

      {/* SELECTED SECTION DETAIL INSPECTOR DRAWER */}
      {selectedSection && (
        <div 
          id={`seo-section-inspector-${selectedSection.id}`}
          className="mt-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white shadow-md animate-fade-in border border-slate-700"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-700/80 gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-500 fill-rose-500" />
                  <span>{selectedSection.name}</span>
                </h3>
                <span 
                  className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold text-white uppercase tracking-wider"
                  style={{ backgroundColor: selectedSection.heatColor }}
                >
                  {selectedSection.heatLevel} Isı Seviyesi (%{selectedSection.heatIndex})
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  {selectedSection.enabled ? "Yayında & Aktif" : "Pasif"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Bu bölüm, sitenizin toplam organik ziyaretçilerinin <strong className="text-emerald-400">%{selectedSection.trafficShare}'ini</strong> çekmektedir.
              </p>
            </div>

            {/* Quick action button to jump directly to this section's manager tab */}
            {onNavigateTab && (
              <button
                type="button"
                id="btn-inspect-quick-fix"
                onClick={() => onNavigateTab(selectedSection.quickFixAction.tab)}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer self-start sm:self-auto shrink-0"
              >
                <Zap className="w-3.5 h-3.5 fill-slate-950" />
                <span>{selectedSection.quickFixAction.label}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 4 Stats Grid for Selected Section */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Aylık Organik Hit</span>
              <span className="text-base font-black text-white font-mono mt-0.5 block">
                {selectedSection.monthlyVisits.toLocaleString("tr-TR")}
              </span>
              <span className="text-[10px] text-emerald-400 mt-0.5 block">
                {selectedSection.mobileVisits.toLocaleString()} Mobil / {selectedSection.desktopVisits.toLocaleString()} PC
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">SEO Fırsat Skoru</span>
              <span className="text-base font-black text-amber-400 font-mono mt-0.5 block">
                {selectedSection.seoPotentialScore} / 100
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Arama Hacmi: {selectedSection.searchDemand.toLocaleString()} / ay
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ortalama Google Sırası</span>
              <span className="text-base font-black text-white font-mono mt-0.5 block">
                #{selectedSection.organicRank}
              </span>
              <span className="text-[10px] text-cyan-400 mt-0.5 block">
                Tıklanma (CTR): %{selectedSection.ctr.toFixed(1)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Lead & Dönüşüm Gücü</span>
              <span className="text-base font-black text-rose-400 font-mono mt-0.5 block">
                %{selectedSection.conversionRate}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Ort. Kalış: {selectedSection.avgTimeOnSectionSeconds}sn
              </span>
            </div>
          </div>

          {/* Bottom Grid: Top Keywords on Left, Actionable Recommendations on Right */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Left: Top Keywords */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-amber-400" />
                <span>Bu Bölümün En Yüksek Trafik Getiren Anahtar Kelimeleri</span>
              </span>

              <div className="space-y-1.5">
                {selectedSection.topKeywords.map((kw, i) => (
                  <div 
                    key={i} 
                    className="px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-4 h-4 rounded-full bg-slate-700 text-slate-300 text-[10px] font-mono flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span className="font-bold text-white truncate">{kw.keyword}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 font-mono text-[11px]">
                      <span className="text-slate-400">{kw.monthlyVolume.toLocaleString()} arama</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-800/50">
                        Google #{kw.currentRank}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Actionable SEO Recommendations */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Bu Bölüm İçin SEO Sıralama Yükseltme Tavsiyeleri</span>
              </span>

              <div className="space-y-2">
                {selectedSection.actionableTips.map((tip, idx) => (
                  <div 
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/80 text-xs text-slate-300 leading-relaxed flex items-start gap-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
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
