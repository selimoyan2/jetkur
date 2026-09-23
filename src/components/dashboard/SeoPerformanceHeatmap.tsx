import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import { 
  Flame, 
  TrendingUp, 
  BarChart3, 
  Filter, 
  Search, 
  Download, 
  Sparkles, 
  MapPin, 
  RefreshCw, 
  CheckCircle2, 
  ArrowUpRight, 
  Eye, 
  MousePointerClick, 
  Target, 
  Award, 
  Copy, 
  Check, 
  Plus, 
  Grid3X3, 
  Globe,
  SlidersHorizontal,
  Info,
  Image as ImageIcon
} from "lucide-react";
import { SiteConfig } from "../../types";
import { 
  generateSeoPerformanceHeatmapData, 
  exportHeatmapDataToCsv,
  HeatmapMetricKey,
  HeatmapCellPerformance,
  SearchIntentType,
  SeoPerformanceHeatmapDataset,
  HeatmapRegion,
  HeatmapKeyword
} from "../../utils/seoPerformanceHeatmapData";

interface SeoPerformanceHeatmapProps {
  config: SiteConfig;
  className?: string;
  onOpenSettings?: () => void;
}

type ViewMode = "matrix" | "regional-bars" | "opportunities";

export const SeoPerformanceHeatmap: React.FC<SeoPerformanceHeatmapProps> = ({
  config,
  className = "",
  onOpenSettings
}) => {
  // State variables
  const [selectedMetric, setSelectedMetric] = useState<HeatmapMetricKey>("ctr");
  const [timeRange, setTimeRange] = useState<"7d" | "28d" | "90d">("28d");
  const [viewMode, setViewMode] = useState<ViewMode>("matrix");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedIntent, setSelectedIntent] = useState<SearchIntentType | "ALL">("ALL");
  const [selectedRegionId, setSelectedRegionId] = useState<string | "ALL">("ALL");
  const [selectedCell, setSelectedCell] = useState<HeatmapCellPerformance | null>(null);
  const [customKeywords, setCustomKeywords] = useState<string[]>([]);
  const [newKeywordInput, setNewKeywordInput] = useState<string>("");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [showAddKeyword, setShowAddKeyword] = useState<boolean>(false);

  // SVG Refs
  const matrixSvgRef = useRef<SVGSVGElement | null>(null);
  const regionalBarSvgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(900);

  // Responsive container observer
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 300) {
          setContainerWidth(Math.floor(entry.contentRect.width));
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Generate dataset based on active config & custom inputs
  const dataset: SeoPerformanceHeatmapDataset = useMemo(() => {
    return generateSeoPerformanceHeatmapData(config, timeRange, customKeywords);
  }, [config, timeRange, customKeywords, isRefreshing]);

  // Set default selected cell on load
  useEffect(() => {
    if (!selectedCell && dataset.cellList.length > 0) {
      // Pick top CTR cell as initial highlight
      const topCell = [...dataset.cellList].sort((a, b) => b.ctr - a.ctr)[0];
      setSelectedCell(topCell || dataset.cellList[0]);
    }
  }, [dataset]);

  // Filtered keywords based on search and intent filter
  const filteredKeywords = useMemo(() => {
    return dataset.keywords.filter((kw) => {
      const matchSearch = kw.term.toLowerCase().includes(searchQuery.toLowerCase());
      const matchIntent = selectedIntent === "ALL" || kw.intent === selectedIntent;
      return matchSearch && matchIntent;
    });
  }, [dataset.keywords, searchQuery, selectedIntent]);

  // Filtered regions
  const filteredRegions = useMemo(() => {
    if (selectedRegionId === "ALL") return dataset.regions;
    return dataset.regions.filter((r) => r.id === selectedRegionId);
  }, [dataset.regions, selectedRegionId]);

  // Refresh handler
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 450);
  };

  // Add custom keyword handler
  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeywordInput.trim()) return;
    if (customKeywords.includes(newKeywordInput.trim())) return;
    setCustomKeywords((prev) => [...prev, newKeywordInput.trim()]);
    setNewKeywordInput("");
    setShowAddKeyword(false);
  };

  // Copy helper
  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // CSV Export handler
  const handleExportCsv = () => {
    const csvContent = exportHeatmapDataToCsv(dataset);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `seo-performance-heatmap-${config.companyName || "site"}-${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // High-Resolution PNG Heatmap Image Export handler
  const handleExportHeatmapImage = () => {
    const targetSvg = viewMode === "matrix" ? matrixSvgRef.current : regionalBarSvgRef.current;
    if (!targetSvg) return;

    try {
      const svgString = new XMLSerializer().serializeToString(targetSvg);
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const blobURL = URL.createObjectURL(svgBlob);
      const img = new Image();

      img.onload = () => {
        const bbox = targetSvg.getBoundingClientRect();
        const width = Math.max(800, Math.round(bbox.width * 2));
        const height = Math.max(500, Math.round(bbox.height * 2));

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          ctx.fillStyle = "#0f172a"; // Match dashboard dark background
          ctx.fillRect(0, 0, width, height);

          // Watermark / title header on image
          ctx.fillStyle = "#f8fafc";
          ctx.font = "bold 20px sans-serif";
          ctx.fillText(`SEO Performans Isı Haritası - ${config.companyName || "Sitemiz"} (${timeRange.toUpperCase()})`, 30, 40);

          ctx.drawImage(img, 10, 50, width - 20, height - 70);

          const pngUrl = canvas.toDataURL("image/png");
          const dlLink = document.createElement("a");
          dlLink.href = pngUrl;
          dlLink.download = `seo-performance-heatmap-${(config.companyName || "site").replace(/[^a-zA-Z0-9]/g, "_")}-${timeRange}.png`;
          document.body.appendChild(dlLink);
          dlLink.click();
          document.body.removeChild(dlLink);
        }
        URL.revokeObjectURL(blobURL);
      };

      img.src = blobURL;
    } catch (err) {
      console.error("Heatmap image export failed:", err);
    }
  };

  // ==========================================================================
  // D3 HEATMAP MATRIX RENDERING
  // ==========================================================================
  useEffect(() => {
    if (viewMode !== "matrix" || !matrixSvgRef.current) return;

    const svg = d3.select(matrixSvgRef.current);
    svg.selectAll("*").remove();

    const keywords = filteredKeywords;
    const regions = filteredRegions;

    if (keywords.length === 0 || regions.length === 0) {
      svg
        .append("text")
        .attr("x", containerWidth / 2)
        .attr("y", 120)
        .attr("text-anchor", "middle")
        .attr("fill", "#94a3b8")
        .attr("font-size", "14px")
        .text("Arama kriterlerine uygun anahtar kelime veya bölge bulunamadı.");
      return;
    }

    // Dynamic sizing math
    const margin = { 
      top: 95, 
      right: 30, 
      bottom: 60, 
      left: Math.min(240, Math.max(160, containerWidth * 0.24)) 
    };

    const availableWidth = Math.max(480, containerWidth - margin.left - margin.right);
    const cellWidth = Math.max(72, availableWidth / regions.length);
    const cellHeight = 44;
    const totalSvgWidth = margin.left + (cellWidth * regions.length) + margin.right;
    const totalSvgHeight = margin.top + (cellHeight * keywords.length) + margin.bottom;

    svg
      .attr("width", totalSvgWidth)
      .attr("height", totalSvgHeight)
      .attr("viewBox", `0 0 ${totalSvgWidth} ${totalSvgHeight}`);

    // Main g container
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Gradient definitions for cell styling and legend
    const defs = svg.append("defs");

    // Metric values range calculation
    let minValue = 0;
    let maxValue = 1;

    if (selectedMetric === "ctr") {
      minValue = 0;
      maxValue = Math.max(18, d3.max(dataset.cellList, (d) => d.ctr) || 20);
    } else if (selectedMetric === "clicks") {
      minValue = 0;
      maxValue = Math.max(50, d3.max(dataset.cellList, (d) => d.clicks) || 100);
    } else if (selectedMetric === "impressions") {
      minValue = 0;
      maxValue = Math.max(500, d3.max(dataset.cellList, (d) => d.impressions) || 1000);
    } else if (selectedMetric === "rank") {
      minValue = 1;
      maxValue = 20;
    } else {
      minValue = 0;
      maxValue = 100;
    }

    // D3 Color Scales
    // For CTR: warm flame heat (Dark Slate -> Golden Yellow -> Vivid Orange -> Deep Crimson)
    const ctrColorScale = d3
      .scaleLinear<string>()
      .domain([0, 3.5, 7.5, 12, maxValue])
      .range(["#0f172a", "#1e293b", "#d97706", "#f97316", "#ef4444"])
      .clamp(true);

    // For Clicks: Emerald / Mint
    const clicksColorScale = d3
      .scaleLinear<string>()
      .domain([0, maxValue * 0.2, maxValue * 0.5, maxValue])
      .range(["#0f172a", "#064e3b", "#059669", "#10b981"])
      .clamp(true);

    // For Impressions: Purple / Indigo
    const impressionsColorScale = d3
      .scaleLinear<string>()
      .domain([0, maxValue * 0.25, maxValue * 0.6, maxValue])
      .range(["#0f172a", "#312e81", "#6366f1", "#a855f7"])
      .clamp(true);

    // For Rank: Inverted (1 is Emerald #10b981, 3 is #38bdf8, 10 is #f59e0b, 20 is #334155)
    const rankColorScale = d3
      .scaleLinear<string>()
      .domain([1, 2.5, 5.0, 10.0, 20.0])
      .range(["#10b981", "#06b6d4", "#3b82f6", "#f59e0b", "#1e293b"])
      .clamp(true);

    // For HeatIndex: Amber to Crimson
    const heatIndexColorScale = d3
      .scaleLinear<string>()
      .domain([0, 30, 60, 85, 100])
      .range(["#0f172a", "#451a03", "#b45309", "#ea580c", "#e11d48"])
      .clamp(true);

    const getColor = (cell: HeatmapCellPerformance): string => {
      if (selectedMetric === "ctr") return ctrColorScale(cell.ctr);
      if (selectedMetric === "clicks") return clicksColorScale(cell.clicks);
      if (selectedMetric === "impressions") return impressionsColorScale(cell.impressions);
      if (selectedMetric === "rank") return rankColorScale(cell.rank);
      return heatIndexColorScale(cell.heatIndex);
    };

    const getFormattedValue = (cell: HeatmapCellPerformance): string => {
      if (selectedMetric === "ctr") return `%${cell.ctr.toFixed(1)}`;
      if (selectedMetric === "clicks") return cell.clicks >= 1000 ? `${(cell.clicks / 1000).toFixed(1)}K` : `${cell.clicks}`;
      if (selectedMetric === "impressions") return cell.impressions >= 1000 ? `${(cell.impressions / 1000).toFixed(1)}K` : `${cell.impressions}`;
      if (selectedMetric === "rank") return `#${cell.rank.toFixed(1)}`;
      return `${cell.heatIndex}`;
    };

    // Tooltip div selection
    const tooltip = d3.select("#seo-heatmap-tooltip");

    // X Axis Headers (Regions)
    const regionHeaders = g
      .append("g")
      .attr("class", "x-axis-headers")
      .selectAll<SVGGElement, HeatmapRegion>("g.region-header")
      .data(regions)
      .enter()
      .append("g")
      .attr("class", "region-header")
      .attr("transform", (_, i) => `translate(${i * cellWidth + cellWidth / 2}, -14)`)
      .attr("cursor", "pointer")
      .on("click", (_, d: HeatmapRegion) => {
        setSelectedRegionId((prev) => (prev === d.id ? "ALL" : d.id));
      });

    // Region pill background
    regionHeaders
      .append("rect")
      .attr("x", -cellWidth / 2 + 3)
      .attr("y", -38)
      .attr("width", cellWidth - 6)
      .attr("height", 42)
      .attr("rx", 8)
      .attr("fill", (d: HeatmapRegion) => (d.isHomeRegion ? "#1e293b" : "#0f172a"))
      .attr("stroke", (d: HeatmapRegion) => (d.isHomeRegion ? "#3b82f6" : "#334155"))
      .attr("stroke-width", (d: HeatmapRegion) => (d.isHomeRegion ? 1.5 : 1))
      .attr("opacity", 0.9);

    // Region Flag / Icon
    regionHeaders
      .append("text")
      .attr("text-anchor", "middle")
      .attr("y", -20)
      .attr("font-size", "14px")
      .text((d: HeatmapRegion) => d.icon);

    // Region Name
    regionHeaders
      .append("text")
      .attr("text-anchor", "middle")
      .attr("y", -4)
      .attr("fill", (d: HeatmapRegion) => (d.isHomeRegion ? "#93c5fd" : "#cbd5e1"))
      .attr("font-size", "11px")
      .attr("font-weight", "700")
      .text((d: HeatmapRegion) => (cellWidth < 85 ? d.code : d.shortName));

    // Y Axis Headers (Keywords)
    const keywordHeaders = g
      .append("g")
      .attr("class", "y-axis-headers")
      .selectAll<SVGGElement, HeatmapKeyword>("g.keyword-header")
      .data(keywords)
      .enter()
      .append("g")
      .attr("class", "keyword-header")
      .attr("transform", (_, i) => `translate(-12, ${i * cellHeight + cellHeight / 2})`)
      .attr("cursor", "pointer")
      .on("click", (_, d: HeatmapKeyword) => {
        setSearchQuery(d.term);
      });

    // Intent Dot
    keywordHeaders
      .append("circle")
      .attr("cx", -8)
      .attr("cy", 0)
      .attr("r", 4)
      .attr("fill", (d: HeatmapKeyword) => d.intentColor);

    // Keyword Text label (truncated if necessary)
    keywordHeaders
      .append("text")
      .attr("text-anchor", "end")
      .attr("alignment-baseline", "middle")
      .attr("x", -18)
      .attr("y", 0)
      .attr("fill", "#e2e8f0")
      .attr("font-size", "12px")
      .attr("font-weight", "600")
      .text((d: HeatmapKeyword) => {
        const maxLen = margin.left > 200 ? 25 : 18;
        return d.term.length > maxLen ? `${d.term.slice(0, maxLen)}...` : d.term;
      })
      .append("title")
      .text((d: HeatmapKeyword) => `${d.term} (${d.intent} - ${d.category})`);

    // Rows and Cells
    const rows = g
      .append("g")
      .attr("class", "matrix-rows")
      .selectAll<SVGGElement, HeatmapKeyword>("g.matrix-row")
      .data(keywords)
      .enter()
      .append("g")
      .attr("class", "matrix-row")
      .attr("transform", (_, i) => `translate(0, ${i * cellHeight})`);

    // Render cells in each row
    rows.each(function(kwData: HeatmapKeyword) {
      const kw = kwData;
      const rowGroup = d3.select(this);

      regions.forEach((reg, colIndex) => {
        const cell = dataset.cells[kw.id]?.[reg.id];
        if (!cell) return;

        const cellGroup = rowGroup
          .append("g")
          .attr("transform", `translate(${colIndex * cellWidth}, 0)`)
          .attr("class", `cell-group kw-${kw.id} reg-${reg.id}`)
          .attr("cursor", "pointer");

        const isSelected = selectedCell?.keywordId === kw.id && selectedCell?.regionId === reg.id;
        const cellColor = getColor(cell);

        // Background rect
        const rect = cellGroup
          .append("rect")
          .attr("x", 2)
          .attr("y", 2)
          .attr("width", cellWidth - 4)
          .attr("height", cellHeight - 4)
          .attr("rx", 6)
          .attr("fill", cellColor)
          .attr("stroke", isSelected ? "#38bdf8" : "#334155")
          .attr("stroke-width", isSelected ? 2.5 : 0.8)
          .attr("stroke-opacity", isSelected ? 1 : 0.4)
          .style("transition", "all 0.15s ease-in-out");

        // Cell value text
        cellGroup
          .append("text")
          .attr("x", cellWidth / 2)
          .attr("y", cellHeight / 2 + 1)
          .attr("text-anchor", "middle")
          .attr("alignment-baseline", "middle")
          .attr("fill", () => {
            if (selectedMetric === "rank") return cell.rank <= 3 ? "#022c22" : "#ffffff";
            if (selectedMetric === "ctr") return cell.ctr >= 9.5 ? "#ffffff" : "#f1f5f9";
            return "#ffffff";
          })
          .attr("font-size", cellWidth < 80 ? "11px" : "12px")
          .attr("font-weight", "800")
          .attr("font-family", "ui-monospace, SFMono-Regular, monospace")
          .text(getFormattedValue(cell));

        // Sub-metric or badge indicator (e.g. SERP feature dot or rank)
        if (cellWidth >= 80 && selectedMetric === "ctr") {
          cellGroup
            .append("text")
            .attr("x", cellWidth - 8)
            .attr("y", cellHeight - 6)
            .attr("text-anchor", "end")
            .attr("fill", "rgba(255,255,255,0.65)")
            .attr("font-size", "9px")
            .attr("font-weight", "700")
            .text(`#${cell.rank}`);
        }

        // Interactivity: Hover & Click
        cellGroup
          .on("mouseenter", function(event) {
            // Elevation effect on hovered cell
            rect
              .attr("stroke", "#f59e0b")
              .attr("stroke-width", 2)
              .attr("stroke-opacity", 1);

            // Show interactive tooltip
            tooltip
              .style("opacity", "1")
              .style("left", `${event.pageX + 16}px`)
              .style("top", `${event.pageY - 28}px`).html(`
                <div class="p-3 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl text-xs space-y-1.5 min-w-[210px] text-white">
                  <div class="flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <span class="font-bold text-amber-400 flex items-center gap-1">${reg.icon} ${reg.shortName}</span>
                    <span class="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">${cell.serpFeature}</span>
                  </div>
                  <div class="font-semibold text-slate-200 text-sm">${kw.term}</div>
                  <div class="grid grid-cols-2 gap-2 pt-1">
                    <div class="bg-slate-800/80 p-1.5 rounded">
                      <div class="text-[10px] text-slate-400 font-medium">CTR (Tıklanma)</div>
                      <div class="text-sm font-black text-rose-400 font-mono">%${cell.ctr}</div>
                    </div>
                    <div class="bg-slate-800/80 p-1.5 rounded">
                      <div class="text-[10px] text-slate-400 font-medium">Ortalama Sıra</div>
                      <div class="text-sm font-black text-emerald-400 font-mono">#${cell.rank}</div>
                    </div>
                  </div>
                  <div class="flex items-center justify-between text-[11px] text-slate-300 pt-1">
                    <span>Aylık Tıklama: <strong class="text-white">${cell.clicks}</strong></span>
                    <span>Gösterim: <strong class="text-white">${cell.impressions}</strong></span>
                  </div>
                  <div class="text-[10px] text-amber-300/90 pt-1 border-t border-slate-800/60">
                    💡 İncelemek için tıklayın
                  </div>
                </div>
              `);
          })
          .on("mousemove", function(event) {
            tooltip
              .style("left", `${event.pageX + 16}px`)
              .style("top", `${event.pageY - 28}px`);
          })
          .on("mouseleave", function() {
            rect
              .attr("stroke", isSelected ? "#38bdf8" : "#334155")
              .attr("stroke-width", isSelected ? 2.5 : 0.8)
              .attr("stroke-opacity", isSelected ? 1 : 0.4);

            tooltip.style("opacity", "0");
          })
          .on("click", function() {
            setSelectedCell(cell);
          });
      });
    });

    // Horizontal Color Scale Legend at Bottom
    const legendWidth = Math.min(320, availableWidth * 0.7);
    const legendHeight = 10;
    const legendX = margin.left + (availableWidth - legendWidth) / 2;
    const legendY = totalSvgHeight - 32;

    const legendGradientId = "heatmap-legend-gradient";
    const legendGradient = defs
      .append("linearGradient")
      .attr("id", legendGradientId)
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");

    // Gradient stops based on selected metric
    if (selectedMetric === "ctr") {
      legendGradient.append("stop").attr("offset", "0%").attr("stop-color", "#0f172a");
      legendGradient.append("stop").attr("offset", "30%").attr("stop-color", "#d97706");
      legendGradient.append("stop").attr("offset", "70%").attr("stop-color", "#f97316");
      legendGradient.append("stop").attr("offset", "100%").attr("stop-color", "#ef4444");
    } else if (selectedMetric === "rank") {
      legendGradient.append("stop").attr("offset", "0%").attr("stop-color", "#10b981");
      legendGradient.append("stop").attr("offset", "40%").attr("stop-color", "#06b6d4");
      legendGradient.append("stop").attr("offset", "80%").attr("stop-color", "#f59e0b");
      legendGradient.append("stop").attr("offset", "100%").attr("stop-color", "#1e293b");
    } else {
      legendGradient.append("stop").attr("offset", "0%").attr("stop-color", "#0f172a");
      legendGradient.append("stop").attr("offset", "50%").attr("stop-color", "#059669");
      legendGradient.append("stop").attr("offset", "100%").attr("stop-color", "#10b981");
    }

    const legendGroup = svg.append("g").attr("transform", `translate(${legendX}, ${legendY})`);

    legendGroup
      .append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .attr("rx", 5)
      .attr("fill", `url(#${legendGradientId})`)
      .attr("stroke", "#334155")
      .attr("stroke-width", 1);

    // Legend Min & Max text
    legendGroup
      .append("text")
      .attr("x", 0)
      .attr("y", -5)
      .attr("font-size", "10px")
      .attr("fill", "#94a3b8")
      .text(selectedMetric === "rank" ? "1. Sıra (En İyi)" : `${minValue}${selectedMetric === "ctr" ? "%" : ""}`);

    legendGroup
      .append("text")
      .attr("x", legendWidth / 2)
      .attr("y", -5)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("fill", "#cbd5e1")
      .attr("font-weight", "600")
      .text(
        selectedMetric === "ctr"
          ? "Tıklanma Oranı (CTR %)"
          : selectedMetric === "rank"
          ? "Arama Sıralaması"
          : selectedMetric === "clicks"
          ? "Tıklama Dağılımı"
          : "Isı İndeksi"
      );

    legendGroup
      .append("text")
      .attr("x", legendWidth)
      .attr("y", -5)
      .attr("text-anchor", "end")
      .attr("font-size", "10px")
      .attr("fill", "#94a3b8")
      .text(selectedMetric === "rank" ? "20+ Sıra" : `${Math.round(maxValue)}${selectedMetric === "ctr" ? "%+" : ""}`);
  }, [viewMode, filteredKeywords, filteredRegions, selectedMetric, containerWidth, selectedCell, dataset]);

  // ==========================================================================
  // D3 REGIONAL BARS / COMPARISON CHART (VIEW 2)
  // ==========================================================================
  useEffect(() => {
    if (viewMode !== "regional-bars" || !regionalBarSvgRef.current) return;

    const svg = d3.select(regionalBarSvgRef.current);
    svg.selectAll("*").remove();

    const data = dataset.regionalSummaries;
    const margin = { top: 40, right: 30, bottom: 60, left: 140 };
    const width = Math.max(500, containerWidth - 40);
    const height = 360;

    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const yScale = d3
      .scaleBand()
      .domain(data.map((d) => d.region.name))
      .range([0, innerHeight])
      .padding(0.28);

    const maxCtr = d3.max(data, (d) => d.avgCtr) || 15;
    const xScale = d3
      .scaleLinear()
      .domain([0, maxCtr * 1.15])
      .range([0, innerWidth]);

    // Grid lines
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(5)
          .tickSize(-innerHeight)
          .tickFormat(() => "")
      )
      .attr("stroke-opacity", 0.1)
      .attr("color", "#64748b");

    // Bars
    g.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("y", (d) => yScale(d.region.name) || 0)
      .attr("height", yScale.bandwidth())
      .attr("x", 0)
      .attr("rx", 6)
      .attr("fill", (d) => (d.region.isHomeRegion ? "#3b82f6" : "#f59e0b"))
      .attr("width", 0)
      .transition()
      .duration(750)
      .attr("width", (d) => xScale(d.avgCtr));

    // Value Labels
    g.selectAll(".bar-label")
      .data(data)
      .enter()
      .append("text")
      .attr("y", (d) => (yScale(d.region.name) || 0) + yScale.bandwidth() / 2 + 4)
      .attr("x", (d) => xScale(d.avgCtr) + 8)
      .attr("fill", "#ffffff")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .attr("font-family", "monospace")
      .text((d) => `%${d.avgCtr} CTR • ${d.totalClicks} Tıklama`);

    // Y Axis labels
    g.append("g")
      .call(d3.axisLeft(yScale).tickSize(0))
      .selectAll("text")
      .attr("fill", "#cbd5e1")
      .attr("font-size", "11px")
      .attr("font-weight", "600");

    // X Axis labels
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat((d) => `%${d}`))
      .selectAll("text")
      .attr("fill", "#94a3b8")
      .attr("font-size", "11px");
  }, [viewMode, dataset, containerWidth]);

  return (
    <div
      ref={containerRef}
      className={`bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl text-slate-100 ${className}`}
      id="seo-performance-heatmap-root"
    >
      {/* ================================================================== */}
      {/* 1. HEADER & KPI SUMMARY BANNER */}
      {/* ================================================================== */}
      <div className="p-5 sm:p-6 border-b border-slate-800 bg-gradient-to-b from-slate-800/60 to-slate-900">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Flame className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  SEO Performans Isı Haritası
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30">
                    d3.js Engine
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  {config.companyName || "Aktif Site"} için bölgesel arama tıklanma oranları (CTR) ve anahtar kelime SERP dağılımı
                </p>
              </div>
            </div>
          </div>

          {/* Time Range & Export Actions */}
          <div className="flex items-center gap-2 self-start lg:self-auto flex-wrap">
            {/* Time range pills */}
            <div className="inline-flex p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold">
              {(["7d", "28d", "90d"] as const).map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    timeRange === range
                      ? "bg-amber-500 text-slate-950 shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {range === "7d" ? "Son 7 Gün" : range === "28d" ? "Son 28 Gün" : "Son 3 Ay"}
                </button>
              ))}
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={handleRefresh}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
              title="Verileri Güncelle"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-amber-400" : ""}`} />
            </button>

            {/* CSV Export */}
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
              title="CSV Raporunu İndir"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>CSV İndir</span>
            </button>

            {/* PNG Image Export */}
            <button
              type="button"
              onClick={handleExportHeatmapImage}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
              title="Isı Haritası Görselini (PNG) İndir"
            >
              <ImageIcon className="w-4 h-4 text-cyan-400" />
              <span>Görsel İndir (PNG)</span>
            </button>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5">
          {/* 1. Avg CTR */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Ortalama CTR</span>
              <MousePointerClick className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-xl font-black text-rose-400 font-mono mt-1">
              %{dataset.overallStats.avgCtr}
            </div>
            <div className="text-[10px] text-emerald-400 font-medium mt-0.5 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>+1.8% sektör ort. üstü</span>
            </div>
          </div>

          {/* 2. Total Clicks */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Aylık Tıklama</span>
              <Target className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-black text-emerald-400 font-mono mt-1">
              {dataset.overallStats.totalClicks.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {timeRange === "7d" ? "7 günlük toplam" : "Dönemsel hacim"}
            </div>
          </div>

          {/* 3. Total Impressions */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Toplam Gösterim</span>
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="text-xl font-black text-indigo-400 font-mono mt-1">
              {dataset.overallStats.totalImpressions >= 1000
                ? `${(dataset.overallStats.totalImpressions / 1000).toFixed(1)}K`
                : dataset.overallStats.totalImpressions}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">SERP Görüntülenme</div>
          </div>

          {/* 4. Top Region */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Lider Bölge</span>
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-base font-black text-amber-300 truncate mt-1">
              {dataset.overallStats.topPerformingRegion}
            </div>
            <div className="text-[10px] text-amber-400/80 font-mono mt-0.5">
              Zirve CTR: %{dataset.overallStats.topCtrValue}
            </div>
          </div>

          {/* 5. Page 1 Visibility */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 col-span-2 sm:col-span-1">
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>1. Sayfa Oranı</span>
              <Award className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-xl font-black text-cyan-400 font-mono mt-1">
              %{dataset.overallStats.pageOneKeywordPercentage}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Ortalama Sıra: #{dataset.overallStats.avgRank}
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* 2. VIEW SWITCHER & METRIC CONTROLLERS */}
      {/* ================================================================== */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => setViewMode("matrix")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === "matrix"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5" />
            <span>Isı Haritası Matrisi (D3)</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("regional-bars")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === "regional-bars"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Bölgesel Karşılaştırma</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("opportunities")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === "opportunities"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Fırsat &amp; Öneriler</span>
          </button>
        </div>

        {/* Metric Selector (for Matrix view) */}
        {viewMode === "matrix" && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <span>Görselleştirilen Metrik:</span>
            </span>
            <div className="inline-flex p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold">
              {[
                { key: "ctr", label: "CTR (%)", color: "rose" },
                { key: "clicks", label: "Tıklama", color: "emerald" },
                { key: "impressions", label: "Gösterim", color: "indigo" },
                { key: "rank", label: "SERP Sıra", color: "cyan" },
                { key: "heatIndex", label: "Isı İndeksi", color: "amber" }
              ].map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setSelectedMetric(m.key as HeatmapMetricKey)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    selectedMetric === m.key
                      ? "bg-slate-800 text-white font-black ring-1 ring-amber-500/40"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ================================================================== */}
      {/* 3. SEARCH & FILTERS BAR */}
      {/* ================================================================== */}
      <div className="p-4 border-b border-slate-800/60 bg-slate-900/50 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Anahtar kelime ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Intent & Region Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Niyet:</span>
          </span>

          {(["ALL", "Ticari", "İşlemsel", "Yerel", "Bilgi"] as const).map((intent) => (
            <button
              key={intent}
              type="button"
              onClick={() => setSelectedIntent(intent)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer ${
                selectedIntent === intent
                  ? "bg-slate-800 text-white border border-slate-700"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {intent === "ALL" ? "Tümü" : intent}
            </button>
          ))}

          {/* Add Custom Keyword Toggle */}
          <button
            type="button"
            onClick={() => setShowAddKeyword(!showAddKeyword)}
            className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1 shrink-0 transition-all cursor-pointer ml-auto md:ml-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Kelime Ekle</span>
          </button>
        </div>
      </div>

      {/* Add Keyword Form Inline Drawer */}
      {showAddKeyword && (
        <form
          onSubmit={handleAddKeyword}
          className="p-3 bg-slate-950 border-b border-slate-800 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Örn: 'Online Randevu', 'Bursa Servis Hizmeti'..."
            value={newKeywordInput}
            onChange={(e) => setNewKeywordInput(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
            autoFocus
          />
          <button
            type="submit"
            className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
          >
            Isı Haritasına Ekle
          </button>
          <button
            type="button"
            onClick={() => setShowAddKeyword(false)}
            className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-white cursor-pointer"
          >
            İptal
          </button>
        </form>
      )}

      {/* ================================================================== */}
      {/* 4. MAIN VISUALIZATION CONTENT AREA */}
      {/* ================================================================== */}
      <div className="p-4 sm:p-6 overflow-x-auto min-h-[420px]">
        {/* VIEW 1: D3 MATRIX HEATMAP */}
        {viewMode === "matrix" && (
          <div className="relative flex flex-col items-center">
            <svg
              ref={matrixSvgRef}
              className="max-w-full block overflow-visible select-none"
            />
          </div>
        )}

        {/* VIEW 2: D3 REGIONAL BARS */}
        {viewMode === "regional-bars" && (
          <div className="space-y-6">
            <div className="flex flex-col items-center">
              <svg
                ref={regionalBarSvgRef}
                className="max-w-full block select-none"
              />
            </div>

            {/* Regional Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-6">
              {dataset.regionalSummaries.map((summary) => (
                <div
                  key={summary.region.id}
                  className={`p-4 rounded-xl border transition-all ${
                    summary.region.isHomeRegion
                      ? "bg-slate-950 border-blue-500/40 ring-1 ring-blue-500/20"
                      : "bg-slate-950/60 border-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{summary.region.icon}</span>
                      <div>
                        <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                          {summary.region.name}
                          {summary.region.isHomeRegion && (
                            <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 text-[9px] font-bold">
                              Ana Merkez
                            </span>
                          )}
                        </h4>
                        <div className="text-[11px] text-slate-400">
                          {summary.region.majorCities.join(", ")}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-black text-rose-400 font-mono">
                        %{summary.avgCtr}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">Ort. CTR</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-center">
                    <div className="p-2 rounded-lg bg-slate-900/80">
                      <div className="text-[10px] text-slate-400">Tıklamalar</div>
                      <div className="text-xs font-bold text-emerald-400 font-mono">
                        {summary.totalClicks}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900/80">
                      <div className="text-[10px] text-slate-400">Gösterim</div>
                      <div className="text-xs font-bold text-indigo-400 font-mono">
                        {summary.totalImpressions >= 1000
                          ? `${(summary.totalImpressions / 1000).toFixed(1)}K`
                          : summary.totalImpressions}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900/80">
                      <div className="text-[10px] text-slate-400">Ort. Sıra</div>
                      <div className="text-xs font-bold text-cyan-400 font-mono">
                        #{summary.avgRank}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 text-[11px] text-slate-300 flex items-center justify-between">
                    <span className="text-slate-400">En Başarılı Kelime:</span>
                    <strong className="text-amber-300 truncate max-w-[150px]">
                      {summary.topKeyword} (%{summary.topKeywordCtr})
                    </strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 3: OPPORTUNITIES & RECOMMENDATIONS */}
        {viewMode === "opportunities" && (
          <div className="space-y-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-amber-300">
                  Algoritmik SEO Tıklanma (CTR) Sıçrama Fırsatları
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Bu sorgular halihazırda ilk sayfada (sıra 4-9 arası) yüksek gösterim alıyor. Başlık ve yerel zengin snippet optimizasyonu ile CTR 2x katlanabilir.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {dataset.priorityOpportunities.map((opp, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 hover:border-amber-500/40 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-amber-400 font-mono text-xs font-bold">
                      {opp.region}
                    </span>
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 font-mono">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      +{opp.potentialClicks} Ekstra Tıklama Potansiyeli
                    </span>
                  </div>

                  <h5 className="font-bold text-sm text-white">{opp.keyword}</h5>
                  <p className="text-xs text-slate-300 bg-slate-900 p-2.5 rounded-lg border border-slate-800 leading-relaxed">
                    {opp.action}
                  </p>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                    <span className="text-slate-400">
                      Mevcut CTR: <strong className="text-rose-400 font-mono">%{opp.currentCtr}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const matchedCell = dataset.cellList.find(
                          (c) => c.keywordTerm === opp.keyword && c.regionShortName === opp.region
                        );
                        if (matchedCell) setSelectedCell(matchedCell);
                        setViewMode("matrix");
                      }}
                      className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Matriste Gör</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ================================================================== */}
      {/* 5. INSPECTED CELL DETAILS DRAWER / ACCORDION */}
      {/* ================================================================== */}
      {selectedCell && (
        <div className="border-t border-slate-800 bg-slate-950 p-5 sm:p-6 space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-xs font-bold">
                  {selectedCell.regionName}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs font-mono">
                  {selectedCell.serpFeature}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                  Dönüşüm: {selectedCell.conversionPotential}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>{selectedCell.keywordTerm}</span>
                <span className="text-xs font-normal text-slate-400">Detaylı Performans Analizi</span>
              </h3>
            </div>

            {/* Cell Quick Stat Badges */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-slate-400">Tıklanma Oranı</div>
                <div className="text-lg font-black text-rose-400 font-mono">
                  %{selectedCell.ctr}
                </div>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div className="text-right">
                <div className="text-xs text-slate-400">Ortalama Sıra</div>
                <div className="text-lg font-black text-emerald-400 font-mono">
                  #{selectedCell.rank}
                </div>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div className="text-right">
                <div className="text-xs text-slate-400">Dönem Tıklaması</div>
                <div className="text-lg font-black text-cyan-400 font-mono">
                  {selectedCell.clicks}
                </div>
              </div>
            </div>
          </div>

          {/* Actionable Recommendations for this region & query */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left: Strategic Recommendation */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Target className="w-3.5 h-3.5 text-amber-400" />
                <span>Bölgesel SERP Optimizasyon Eylemi</span>
              </h4>
              <p className="text-xs text-slate-200 leading-relaxed">
                {selectedCell.recommendedAction}
              </p>
              <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-400">
                <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>
                  MoM Trendi:{" "}
                  <strong className={selectedCell.trendMoM >= 0 ? "text-emerald-400" : "text-rose-400"}>
                    {selectedCell.trendMoM >= 0 ? "+" : ""}{selectedCell.trendMoM}%
                  </strong>
                </span>
              </div>
            </div>

            {/* Right: Suggested Meta Title & H1 Copy Snippet */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-cyan-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>Önerilen Bölgesel Başlıklar</span>
              </h4>

              {/* Title tag */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Önerilen Meta Title:</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(selectedCell.suggestedTitle, "title")}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold cursor-pointer"
                  >
                    {copiedField === "title" ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Kopyalandı</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Kopyala</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-2 rounded bg-slate-950 font-mono text-xs text-slate-200 border border-slate-800 select-all truncate">
                  {selectedCell.suggestedTitle}
                </div>
              </div>

              {/* H1 tag */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Önerilen Sayfa H1:</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(selectedCell.suggestedH1, "h1")}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold cursor-pointer"
                  >
                    {copiedField === "h1" ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Kopyalandı</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Kopyala</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-2 rounded bg-slate-950 font-mono text-xs text-slate-200 border border-slate-800 select-all truncate">
                  {selectedCell.suggestedH1}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Tooltip Target */}
      <div
        id="seo-heatmap-tooltip"
        className="fixed pointer-events-none opacity-0 z-50 transition-opacity duration-150"
      />
    </div>
  );
};
