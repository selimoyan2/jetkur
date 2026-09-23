import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import { 
  KeywordBenchmarkItem, 
  KeywordBenchmarkCompetitor 
} from "../../utils/realtimeKeywordBenchmarkEngine";
import { 
  Download, 
  RotateCcw, 
  Layers, 
  Info, 
  Check, 
  TrendingUp, 
  Sparkles, 
  Target, 
  Award, 
  SlidersHorizontal,
  Eye,
  EyeOff
} from "lucide-react";

interface D3KeywordBenchmarkRadarChartProps {
  keywords: KeywordBenchmarkItem[];
  competitors: KeywordBenchmarkCompetitor[];
  userCompanyName: string;
  className?: string;
  onKeywordSelect?: (keyword: KeywordBenchmarkItem) => void;
  selectedKeywordId?: string | null;
}

type MetricMode = "score" | "rank" | "volume";

interface TooltipInfo {
  x: number;
  y: number;
  keyword: KeywordBenchmarkItem;
  userScore: number;
  leaderScore: number;
  userRank: number;
  leaderRank: number;
}

export const D3KeywordBenchmarkRadarChart: React.FC<D3KeywordBenchmarkRadarChartProps> = ({
  keywords,
  competitors,
  userCompanyName,
  className = "",
  onKeywordSelect,
  selectedKeywordId
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 640, height: 540 });
  const [metricMode, setMetricMode] = useState<MetricMode>("score");
  const [activeCompetitorIds, setActiveCompetitorIds] = useState<string[]>([
    "user",
    "comp-leader",
    "comp-regional",
    "comp-challenger",
    "industry-avg"
  ]);
  const [hoveredEntityId, setHoveredEntityId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);
  const [hoveredAxisIdx, setHoveredAxisIdx] = useState<number | null>(null);

  // ResizeObserver for responsive width & height
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width } = entry.contentRect;
        const boundedWidth = Math.max(320, width);
        const boundedHeight = Math.max(420, Math.min(560, boundedWidth * 0.85));
        setDimensions({ width: boundedWidth, height: boundedHeight });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const { width, height } = dimensions;
  const margin = 80;
  const radius = Math.max(90, Math.min((width - margin * 2) / 2, (height - margin * 2) / 2));
  const centerX = width / 2;
  const centerY = height / 2;

  const totalAxes = keywords.length;
  const angleSlice = totalAxes > 0 ? (Math.PI * 2) / totalAxes : 0;

  // Concentric polygon levels
  const levels = [20, 40, 60, 80, 100];

  // Helper to map metric values to 0-100 radar radius
  const getNormalizedValue = (kw: KeywordBenchmarkItem, entityId: string): number => {
    if (metricMode === "score") {
      if (entityId === "user") return kw.scores.user;
      if (entityId === "comp-leader") return kw.scores.competitor1;
      if (entityId === "comp-regional") return kw.scores.competitor2;
      if (entityId === "comp-challenger") return kw.scores.competitor3;
      return kw.scores.industryAvg;
    } else if (metricMode === "rank") {
      // Invert rank so rank #1 is 100%, rank #10 is 50%, rank #20 is 10%
      let rank = 10;
      if (entityId === "user") rank = kw.ranks.user;
      else if (entityId === "comp-leader") rank = kw.ranks.competitor1;
      else if (entityId === "comp-regional") rank = kw.ranks.competitor2;
      else if (entityId === "comp-challenger") rank = kw.ranks.competitor3;
      else rank = Math.round((kw.ranks.user + kw.ranks.competitor1 + kw.ranks.competitor2 + kw.ranks.competitor3) / 4);

      return Math.max(10, Math.min(100, Math.round(105 - rank * 4.5)));
    } else {
      // Volume potential based on score * volume
      const maxVol = Math.max(...keywords.map(k => k.searchVolume), 1000);
      const baseScore = entityId === "user" ? kw.scores.user : kw.scores.competitor1;
      return Math.max(15, Math.min(100, Math.round((kw.searchVolume / maxVol) * 60 + (baseScore / 100) * 40)));
    }
  };

  // D3 Rendering
  useEffect(() => {
    if (!svgRef.current || totalAxes < 3) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll(".radar-content-group").remove();

    const g = svg.append("g")
      .attr("class", "radar-content-group")
      .attr("transform", `translate(${centerX}, ${centerY})`);

    // Radius scale
    const rScale = d3.scaleLinear().domain([0, 100]).range([0, radius]);

    // 1. Concentric Background Polygons & Grid
    levels.forEach((lvl) => {
      const levelRadius = rScale(lvl);
      const points: [number, number][] = [];

      for (let i = 0; i < totalAxes; i++) {
        const angle = i * angleSlice - Math.PI / 2;
        points.push([levelRadius * Math.cos(angle), levelRadius * Math.sin(angle)]);
      }

      // Draw polygon outline
      const polygonPath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ") + " Z";

      g.append("path")
        .attr("d", polygonPath)
        .attr("fill", lvl === 100 ? "rgba(15, 23, 42, 0.4)" : "rgba(30, 41, 59, 0.12)")
        .attr("stroke", lvl === 100 ? "#475569" : "#334155")
        .attr("stroke-width", lvl === 100 ? 1.5 : 1)
        .attr("stroke-dasharray", lvl === 100 ? "none" : "3,3")
        .attr("opacity", 0.7);

      // Label on top axis for the level
      g.append("text")
        .attr("x", 4)
        .attr("y", -levelRadius + 10)
        .attr("font-size", "10px")
        .attr("font-family", "monospace")
        .attr("fill", "#64748b")
        .text(metricMode === "rank" ? `#${Math.round(21 - (lvl / 100) * 20)}` : `${lvl}%`);
    });

    // 2. Radial Axis Lines & Keyword Labels
    keywords.forEach((kw, i) => {
      const angle = i * angleSlice - Math.PI / 2;
      const x2 = rScale(100) * Math.cos(angle);
      const y2 = rScale(100) * Math.sin(angle);

      const isAxisHovered = hoveredAxisIdx === i || selectedKeywordId === kw.id;

      // Axis Line
      g.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", x2)
        .attr("y2", y2)
        .attr("stroke", isAxisHovered ? "#38bdf8" : "#334155")
        .attr("stroke-width", isAxisHovered ? 2 : 1)
        .attr("stroke-dasharray", isAxisHovered ? "none" : "2,2");

      // Label Positioning
      const labelDist = radius + 24;
      const labelX = labelDist * Math.cos(angle);
      const labelY = labelDist * Math.sin(angle);

      let textAnchor = "middle";
      if (Math.abs(Math.cos(angle)) > 0.3) {
        textAnchor = Math.cos(angle) > 0 ? "start" : "end";
      }

      const labelGroup = g.append("g")
        .attr("transform", `translate(${labelX}, ${labelY})`)
        .style("cursor", "pointer")
        .on("click", () => {
          if (onKeywordSelect) onKeywordSelect(kw);
        })
        .on("mouseenter", (event) => {
          setHoveredAxisIdx(i);
          const bbox = containerRef.current?.getBoundingClientRect();
          if (bbox) {
            setTooltip({
              x: event.clientX - bbox.left,
              y: event.clientY - bbox.top,
              keyword: kw,
              userScore: kw.scores.user,
              leaderScore: kw.scores.competitor1,
              userRank: kw.ranks.user,
              leaderRank: kw.ranks.competitor1
            });
          }
        })
        .on("mouseleave", () => {
          setHoveredAxisIdx(null);
          setTooltip(null);
        });

      // Keyword Name
      const shortKw = kw.keyword.length > 20 ? kw.keyword.slice(0, 19) + "…" : kw.keyword;
      labelGroup.append("text")
        .attr("x", 0)
        .attr("y", -2)
        .attr("text-anchor", textAnchor)
        .attr("font-size", isAxisHovered ? "12px" : "11px")
        .attr("font-weight", isAxisHovered ? "bold" : "600")
        .attr("fill", isAxisHovered ? "#38bdf8" : "#e2e8f0")
        .text(shortKw);

      // Volume Subtitle
      labelGroup.append("text")
        .attr("x", 0)
        .attr("y", 12)
        .attr("text-anchor", textAnchor)
        .attr("font-size", "9.5px")
        .attr("font-family", "monospace")
        .attr("fill", kw.contentGapStatus === "winning" ? "#10b981" : kw.contentGapStatus === "opportunity" ? "#38bdf8" : "#94a3b8")
        .text(`${kw.searchVolume.toLocaleString("tr-TR")}/ay • #${kw.ranks.user}`);
    });

    // 3. Render Polygons for Entities
    const entityList = [
      {
        id: "industry-avg",
        name: "Sektör Ortalaması",
        color: "#94a3b8",
        fillColor: "rgba(148, 163, 184, 0.08)",
        strokeDash: "4,4",
        strokeWidth: 1.5,
        fillOpacity: 0.1
      },
      {
        id: "comp-challenger",
        name: competitors[2]?.name || "Dinamik Rakip",
        color: competitors[2]?.color || "#f59e0b",
        fillColor: "rgba(245, 158, 11, 0.12)",
        strokeDash: "none",
        strokeWidth: 1.5,
        fillOpacity: 0.2
      },
      {
        id: "comp-regional",
        name: competitors[1]?.name || "Bölgesel Rakip",
        color: competitors[1]?.color || "#10b981",
        fillColor: "rgba(16, 185, 129, 0.12)",
        strokeDash: "none",
        strokeWidth: 1.5,
        fillOpacity: 0.2
      },
      {
        id: "comp-leader",
        name: competitors[0]?.name || "Pazar Lideri",
        color: competitors[0]?.color || "#8b5cf6",
        fillColor: "rgba(139, 92, 246, 0.15)",
        strokeDash: "none",
        strokeWidth: 2,
        fillOpacity: 0.25
      },
      {
        id: "user",
        name: userCompanyName,
        color: "#06b6d4", // Vivid Cyan
        fillColor: "rgba(6, 182, 212, 0.3)",
        strokeDash: "none",
        strokeWidth: 2.8,
        fillOpacity: 0.35
      }
    ];

    entityList.forEach((entity) => {
      const isVisible = activeCompetitorIds.includes(entity.id);
      if (!isVisible) return;

      const isHovered = hoveredEntityId === entity.id;
      const isAnyHovered = Boolean(hoveredEntityId);
      const dimmed = isAnyHovered && !isHovered;

      const points: [number, number][] = keywords.map((kw, idx) => {
        const val = getNormalizedValue(kw, entity.id);
        const angle = idx * angleSlice - Math.PI / 2;
        const r = rScale(val);
        return [r * Math.cos(angle), r * Math.sin(angle)];
      });

      const pathData = points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ") + " Z";

      // Radar Polygon Area
      g.append("path")
        .attr("d", pathData)
        .attr("fill", entity.fillColor)
        .attr("fill-opacity", dimmed ? 0.04 : isHovered ? 0.45 : entity.fillOpacity)
        .attr("stroke", entity.color)
        .attr("stroke-width", isHovered ? entity.strokeWidth + 1.5 : entity.strokeWidth)
        .attr("stroke-dasharray", entity.strokeDash)
        .attr("opacity", dimmed ? 0.25 : 1)
        .style("transition", "all 0.25s ease-out");

      // Vertex Circles (Data points)
      points.forEach(([px, py], pIdx) => {
        const kw = keywords[pIdx];
        const isSelected = selectedKeywordId === kw.id;
        const val = getNormalizedValue(kw, entity.id);

        const circle = g.append("circle")
          .attr("cx", px)
          .attr("cy", py)
          .attr("r", entity.id === "user" ? (isSelected ? 6 : 4.5) : (isHovered ? 4 : 3))
          .attr("fill", isSelected ? "#38bdf8" : entity.color)
          .attr("stroke", "#0f172a")
          .attr("stroke-width", 1.5)
          .attr("opacity", dimmed ? 0.2 : 1)
          .style("cursor", "pointer");

        // Interaction
        circle.on("mouseenter", (event) => {
          setHoveredAxisIdx(pIdx);
          const bbox = containerRef.current?.getBoundingClientRect();
          if (bbox) {
            setTooltip({
              x: event.clientX - bbox.left,
              y: event.clientY - bbox.top,
              keyword: kw,
              userScore: kw.scores.user,
              leaderScore: kw.scores.competitor1,
              userRank: kw.ranks.user,
              leaderRank: kw.ranks.competitor1
            });
          }
        });

        circle.on("mouseleave", () => {
          setHoveredAxisIdx(null);
          setTooltip(null);
        });

        circle.on("click", () => {
          if (onKeywordSelect) onKeywordSelect(kw);
        });
      });
    });

  }, [
    keywords,
    competitors,
    metricMode,
    activeCompetitorIds,
    hoveredEntityId,
    hoveredAxisIdx,
    selectedKeywordId,
    dimensions,
    radius,
    centerX,
    centerY,
    totalAxes,
    angleSlice
  ]);

  // Toggle Competitor Polygon
  const toggleCompetitor = (id: string) => {
    setActiveCompetitorIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 1) return prev; // Keep at least one
        return prev.filter((i) => i !== id);
      }
      return [...prev, id];
    });
  };

  // Export as High-Resolution PNG
  const handleExportPng = () => {
    if (!svgRef.current) return;
    const svgElement = svgRef.current;

    try {
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const blobURL = URL.createObjectURL(svgBlob);
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const exportW = width * 2;
        const exportH = height * 2;
        canvas.width = exportW;
        canvas.height = exportH;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          ctx.fillStyle = "#090d16";
          ctx.fillRect(0, 0, exportW, exportH);

          // Header
          ctx.fillStyle = "#f8fafc";
          ctx.font = "bold 24px sans-serif";
          ctx.fillText(`Sektörel SEO Anahtar Kelime Benchmark Radarı`, 30, 45);

          ctx.fillStyle = "#94a3b8";
          ctx.font = "14px sans-serif";
          ctx.fillText(`${userCompanyName} vs Sektör Rakipleri • D3.js Engine`, 30, 70);

          ctx.drawImage(img, 0, 40, exportW, exportH - 40);

          const pngUrl = canvas.toDataURL("image/png");
          const dlLink = document.createElement("a");
          dlLink.href = pngUrl;
          dlLink.download = `sektorel-anahtar-kelime-radar-${new Date().toISOString().slice(0, 10)}.png`;
          document.body.appendChild(dlLink);
          dlLink.click();
          document.body.removeChild(dlLink);
        }
        URL.revokeObjectURL(blobURL);
      };

      img.src = blobURL;
    } catch (err) {
      console.error("Radar image export failed:", err);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative bg-slate-950/80 border border-slate-800/90 rounded-2xl p-4 sm:p-5 text-slate-100 shadow-xl overflow-hidden ${className}`}
      id="keyword-benchmark-radar-chart-container"
    >
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Anahtar Kelime Kıyaslama Radarı
              <span className="px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 font-mono text-[10px] font-bold border border-violet-500/30">
                D3.js Radar
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Sektörün en kritik {keywords.length} anahtar kelimesinde Google SERP görünürlük kıyaslaması
            </p>
          </div>
        </div>

        {/* Metric Switcher & Export */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex p-0.5 bg-slate-900 border border-slate-800 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setMetricMode("score")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                metricMode === "score"
                  ? "bg-violet-600 text-white shadow-2xs font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Görünürlük (0-100)
            </button>
            <button
              type="button"
              onClick={() => setMetricMode("rank")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                metricMode === "rank"
                  ? "bg-violet-600 text-white shadow-2xs font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              SERP Sıralaması
            </button>
            <button
              type="button"
              onClick={() => setMetricMode("volume")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                metricMode === "volume"
                  ? "bg-violet-600 text-white shadow-2xs font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Trafik Ağırlığı
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportPng}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all cursor-pointer"
            title="Radar Grafiğini PNG Olarak İndir"
          >
            <Download className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* 2. Interactive Legend / Entity Toggles */}
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <button
          type="button"
          onClick={() => toggleCompetitor("user")}
          onMouseEnter={() => setHoveredEntityId("user")}
          onMouseLeave={() => setHoveredEntityId(null)}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
            activeCompetitorIds.includes("user")
              ? "bg-cyan-950/60 border-cyan-500/50 text-cyan-300"
              : "bg-slate-900/50 border-slate-800 text-slate-500 opacity-60"
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 ring-2 ring-cyan-500/40" />
          <span>{userCompanyName} (Siz)</span>
        </button>

        {competitors.map((c, i) => {
          const isActive = activeCompetitorIds.includes(c.id);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => toggleCompetitor(c.id)}
              onMouseEnter={() => setHoveredEntityId(c.id)}
              onMouseLeave={() => setHoveredEntityId(null)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                isActive
                  ? "bg-slate-900 border-slate-700 text-slate-200"
                  : "bg-slate-900/40 border-slate-800/80 text-slate-500 opacity-50"
              }`}
            >
              <span 
                className="w-2.5 h-2.5 rounded-full" 
                style={{ backgroundColor: c.color }} 
              />
              <span className="truncate max-w-[130px]">{c.name}</span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => toggleCompetitor("industry-avg")}
          onMouseEnter={() => setHoveredEntityId("industry-avg")}
          onMouseLeave={() => setHoveredEntityId(null)}
          className={`px-2 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer border ${
            activeCompetitorIds.includes("industry-avg")
              ? "bg-slate-900 border-slate-700 text-slate-400"
              : "bg-slate-900/40 border-slate-800 text-slate-600 opacity-40"
          }`}
        >
          <span className="w-2.5 h-0.5 bg-slate-400" />
          <span>Sektör Ort.</span>
        </button>
      </div>

      {/* 3. D3 SVG Radar Canvas */}
      <div className="flex justify-center items-center relative overflow-hidden select-none">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="overflow-visible"
        />

        {/* Floating Tooltip Card */}
        {tooltip && (
          <div
            className="absolute pointer-events-none z-30 p-3 rounded-xl bg-slate-900/95 border border-cyan-500/40 shadow-2xl backdrop-blur-md text-xs w-64 transform -translate-x-1/2 -translate-y-full transition-all"
            style={{
              left: `${tooltip.x}px`,
              top: `${tooltip.y - 12}px`
            }}
          >
            <div className="flex items-center justify-between gap-1 pb-1.5 border-b border-slate-800">
              <span className="font-bold text-cyan-300 truncate">{tooltip.keyword.keyword}</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 font-mono">
                {tooltip.keyword.category}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="p-1.5 rounded-lg bg-slate-950/70 border border-slate-800">
                <div className="text-[10px] text-slate-400">Siteniz</div>
                <div className="text-sm font-black text-cyan-400 font-mono">
                  #{tooltip.userRank} <span className="text-[10px] font-normal text-slate-400">({tooltip.userScore}p)</span>
                </div>
              </div>

              <div className="p-1.5 rounded-lg bg-slate-950/70 border border-slate-800">
                <div className="text-[10px] text-slate-400">Pazar Lideri</div>
                <div className="text-sm font-black text-purple-400 font-mono">
                  #{tooltip.leaderRank} <span className="text-[10px] font-normal text-slate-400">({tooltip.leaderScore}p)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-1.5 border-t border-slate-800">
              <span>Aylık Hacim: <b className="text-slate-200">{tooltip.keyword.searchVolume.toLocaleString("tr-TR")}</b></span>
              <span>Zorluk: <b className="text-amber-400">%{tooltip.keyword.difficulty}</b></span>
            </div>

            <div className="mt-2 text-[10px] text-slate-300 bg-cyan-950/40 p-1.5 rounded border border-cyan-800/50 leading-relaxed">
              💡 {tooltip.keyword.recommendedAction}
            </div>
          </div>
        )}
      </div>

      {/* 4. Mini Footer Indicator */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-900 mt-1">
        <span>* Radar eksenlerindeki noktalara tıklayarak anahtar kelimenin detaylı SEO reçetesini açabilirsiniz.</span>
        <span className="font-mono text-[10px]">Google Algoritma Standartları</span>
      </div>
    </div>
  );
};
