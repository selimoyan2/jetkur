import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import { 
  CompetitiveRadarAxisDef, 
  CompetitiveStrategyEntity 
} from "../../types";
import { 
  ShieldCheck, 
  Target, 
  Zap, 
  Globe, 
  FileText, 
  Code2, 
  Download, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Sliders, 
  Info,
  Sparkles,
  Trophy,
  CheckCircle2,
  TrendingUp,
  AlertTriangle
} from "lucide-react";

interface D3CompetitiveRadarChartProps {
  entities: CompetitiveStrategyEntity[];
  axes: CompetitiveRadarAxisDef[];
  activeEntityIds: string[];
  onToggleEntity: (id: string) => void;
  hoveredEntityId: string | null;
  onHoverEntity: (id: string | null) => void;
  selectedAxisKey: string | null;
  onSelectAxis: (key: string | null) => void;
  simulatedUserMetrics?: {
    domainAuthority: number;
    keywordDensity: number;
    siteSpeed: number;
    [key: string]: number;
  };
  isSimulating?: boolean;
}

interface TooltipData {
  x: number;
  y: number;
  axis: CompetitiveRadarAxisDef;
  scores: Array<{
    entity: CompetitiveStrategyEntity;
    score: number;
    isSimulated?: boolean;
  }>;
  leader: {
    entity: CompetitiveStrategyEntity;
    score: number;
  };
  userAdvantage: number; // positive = user is ahead of best competitor
}

export const D3CompetitiveRadarChart: React.FC<D3CompetitiveRadarChartProps> = ({
  entities,
  axes,
  activeEntityIds,
  onToggleEntity,
  hoveredEntityId,
  onHoverEntity,
  selectedAxisKey,
  onSelectAxis,
  simulatedUserMetrics,
  isSimulating = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 620, height: 520 });
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [activeHoverAxis, setActiveHoverAxis] = useState<string | null>(null);

  // ResizeObserver for responsive width & height
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width } = entry.contentRect;
        const boundedWidth = Math.max(340, width);
        const boundedHeight = Math.max(440, Math.min(560, boundedWidth * 0.82));
        setDimensions({ width: boundedWidth, height: boundedHeight });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const { width, height } = dimensions;
  const margin = 80;
  const radius = Math.max(80, Math.min((width - margin * 2) / 2, (height - margin * 2) / 2));
  const centerX = width / 2;
  const centerY = height / 2;

  // Level steps for concentric webs
  const levels = [20, 40, 60, 80, 100];
  const angleSlice = (Math.PI * 2) / axes.length;

  const rScale = useMemo(() => {
    return d3.scaleLinear().domain([0, 100]).range([0, radius]);
  }, [radius]);

  // Render D3 SVG elements with smooth animations
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);

    // Clear previous dynamic content
    svg.selectAll(".radar-layer").remove();

    const g = svg.append("g")
      .attr("class", "radar-layer")
      .attr("transform", `translate(${centerX}, ${centerY})`);

    // 1. Concentric background polygon webs
    const gridGroup = g.append("g").attr("class", "radar-grid");

    levels.forEach((lvl) => {
      const r = rScale(lvl);
      const points = axes.map((_, i) => {
        const angle = i * angleSlice;
        const x = r * Math.sin(angle);
        const y = -r * Math.cos(angle);
        return `${x},${y}`;
      }).join(" ");

      gridGroup.append("polygon")
        .attr("points", points)
        .attr("fill", lvl % 40 === 0 ? "rgba(241, 245, 249, 0.45)" : "transparent")
        .attr("stroke", lvl === 100 ? "#cbd5e1" : "#e2e8f0")
        .attr("stroke-width", lvl === 100 ? 1.5 : 1)
        .attr("stroke-dasharray", lvl === 100 ? "none" : "3,3");

      // Level label at north
      gridGroup.append("text")
        .attr("x", 4)
        .attr("y", -r + 3)
        .attr("font-size", "10px")
        .attr("font-weight", "600")
        .attr("fill", "#94a3b8")
        .text(`${lvl}`);
    });

    // 2. Radial Axis Spokes & interactive hit-areas
    const axesGroup = g.append("g").attr("class", "radar-axes");

    axes.forEach((axis, i) => {
      const angle = i * angleSlice;
      const x = radius * Math.sin(angle);
      const y = -radius * Math.cos(angle);
      const isSelected = selectedAxisKey === axis.key || activeHoverAxis === axis.key;

      // Axis line
      axesGroup.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", x)
        .attr("y2", y)
        .attr("stroke", isSelected ? "#06b6d4" : "#cbd5e1")
        .attr("stroke-width", isSelected ? 2.5 : 1.2)
        .attr("stroke-dasharray", isSelected ? "none" : "2,2");

      // Label positions
      const labelDistance = radius + 28;
      const labelX = labelDistance * Math.sin(angle);
      const labelY = -labelDistance * Math.cos(angle);

      let textAnchor: "middle" | "start" | "end" = "middle";
      if (Math.abs(Math.sin(angle)) > 0.25) {
        textAnchor = Math.sin(angle) > 0 ? "start" : "end";
      }

      const labelG = axesGroup.append("g")
        .attr("class", "cursor-pointer group")
        .attr("transform", `translate(${labelX}, ${labelY})`)
        .on("click", () => {
          onSelectAxis(selectedAxisKey === axis.key ? null : axis.key);
        })
        .on("mouseenter", (event) => {
          setActiveHoverAxis(axis.key);
          showAxisTooltip(axis, event);
        })
        .on("mouseleave", () => {
          setActiveHoverAxis(null);
          setTooltip(null);
        });

      // Background pill for label
      labelG.append("rect")
        .attr("x", textAnchor === "middle" ? -55 : textAnchor === "start" ? -6 : -104)
        .attr("y", -13)
        .attr("width", 110)
        .attr("height", 24)
        .attr("rx", 6)
        .attr("fill", isSelected ? "#0f172a" : "rgba(255, 255, 255, 0.95)")
        .attr("stroke", isSelected ? "#06b6d4" : "#e2e8f0")
        .attr("stroke-width", isSelected ? 1.5 : 1)
        .attr("class", "transition-all shadow-xs");

      // Text label
      labelG.append("text")
        .attr("x", textAnchor === "middle" ? 0 : textAnchor === "start" ? 6 : -6)
        .attr("y", 3)
        .attr("text-anchor", textAnchor)
        .attr("font-size", "11px")
        .attr("font-weight", isSelected ? "800" : "600")
        .attr("fill", isSelected ? "#ffffff" : "#1e293b")
        .text(axis.shortLabel);
    });

    // 3. Competitor and User Radar Polygons
    const polygonGroup = g.append("g").attr("class", "radar-polygons");

    // Filter active entities
    const visibleEntities = entities.filter(e => activeEntityIds.includes(e.id));

    // Sort so user site is rendered last (on top) for high visibility
    const sortedEntities = [...visibleEntities].sort((a, b) => {
      if (a.isUser) return 1;
      if (b.isUser) return -1;
      return 0;
    });

    sortedEntities.forEach((entity) => {
      const isUser = entity.isUser;
      const isHovered = hoveredEntityId === entity.id;
      const hasAnyHover = hoveredEntityId !== null;
      const opacity = hasAnyHover ? (isHovered ? 0.95 : 0.18) : (isUser ? 0.85 : 0.45);
      const fillOpacity = hasAnyHover ? (isHovered ? 0.35 : 0.05) : (isUser ? 0.22 : 0.12);

      const metricCoords = axes.map((axis, i) => {
        let score = entity.metrics[axis.key] || 0;
        if (isUser && isSimulating && simulatedUserMetrics && simulatedUserMetrics[axis.key] !== undefined) {
          score = simulatedUserMetrics[axis.key];
        }
        const r = rScale(score);
        const angle = i * angleSlice;
        return {
          axis,
          score,
          x: r * Math.sin(angle),
          y: -r * Math.cos(angle)
        };
      });

      const pointsStr = metricCoords.map(p => `${p.x},${p.y}`).join(" ");

      // The filled polygon
      polygonGroup.append("polygon")
        .attr("points", pointsStr)
        .attr("fill", entity.color)
        .attr("fill-opacity", fillOpacity)
        .attr("stroke", entity.color)
        .attr("stroke-width", isUser ? 3 : (isHovered ? 2.5 : 1.8))
        .attr("stroke-dasharray", entity.strokeDash || "none")
        .attr("class", "transition-all duration-300 cursor-pointer")
        .style("opacity", opacity)
        .on("mouseenter", () => onHoverEntity(entity.id))
        .on("mouseleave", () => onHoverEntity(null));

      // Vertex dots
      metricCoords.forEach((pt) => {
        const isAxisActive = selectedAxisKey === pt.axis.key || activeHoverAxis === pt.axis.key;
        const dotRadius = isUser ? (isAxisActive ? 7.5 : 5.5) : (isAxisActive ? 6 : 4);

        const circle = polygonGroup.append("circle")
          .attr("cx", pt.x)
          .attr("cy", pt.y)
          .attr("r", dotRadius)
          .attr("fill", isUser ? "#ffffff" : entity.color)
          .attr("stroke", entity.color)
          .attr("stroke-width", isUser ? 2.5 : 1.5)
          .attr("class", "transition-all duration-200 cursor-pointer")
          .style("opacity", opacity)
          .on("mouseenter", (event) => {
            onHoverEntity(entity.id);
            setActiveHoverAxis(pt.axis.key);
            showAxisTooltip(pt.axis, event);
          })
          .on("mouseleave", () => {
            onHoverEntity(null);
            setActiveHoverAxis(null);
            setTooltip(null);
          });

        if (isUser) {
          circle.attr("filter", "drop-shadow(0 2px 4px rgba(6,182,212,0.4))");
        }
      });
    });

    // 4. Simulated Projection Overlay (If active & different from current)
    if (isSimulating && simulatedUserMetrics && activeEntityIds.includes("user-site")) {
      const userEntity = entities.find(e => e.isUser);
      if (userEntity) {
        const simCoords = axes.map((axis, i) => {
          const simScore = simulatedUserMetrics[axis.key] ?? userEntity.metrics[axis.key] ?? 50;
          const r = rScale(simScore);
          const angle = i * angleSlice;
          return {
            x: r * Math.sin(angle),
            y: -r * Math.cos(angle)
          };
        });
        const simPointsStr = simCoords.map(p => `${p.x},${p.y}`).join(" ");

        polygonGroup.append("polygon")
          .attr("points", simPointsStr)
          .attr("fill", "none")
          .attr("stroke", "#10b981") // Emerald 500
          .attr("stroke-width", 2.5)
          .attr("stroke-dasharray", "4,4")
          .attr("class", "animate-pulse");
      }
    }

    function showAxisTooltip(axis: CompetitiveRadarAxisDef, event: any) {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = event.clientX || (event.touches && event.touches[0]?.clientX);
      const clientY = event.clientY || (event.touches && event.touches[0]?.clientY);

      const x = clientX ? clientX - rect.left : centerX;
      const y = clientY ? clientY - rect.top : centerY;

      const userEntity = entities.find(e => e.isUser);
      const competitors = entities.filter(e => !e.isUser);

      const userScore = isSimulating && simulatedUserMetrics && simulatedUserMetrics[axis.key] !== undefined
        ? simulatedUserMetrics[axis.key]
        : (userEntity?.metrics[axis.key] || 0);

      const bestCompetitor = competitors.reduce((max, c) => {
        const s = c.metrics[axis.key] || 0;
        return s > max.score ? { entity: c, score: s } : max;
      }, { entity: competitors[0], score: competitors[0]?.metrics[axis.key] || 0 });

      const scores = visibleEntities.map(e => {
        let score = e.metrics[axis.key] || 0;
        if (e.isUser && isSimulating && simulatedUserMetrics && simulatedUserMetrics[axis.key] !== undefined) {
          score = simulatedUserMetrics[axis.key];
        }
        return {
          entity: e,
          score,
          isSimulated: e.isUser && isSimulating
        };
      }).sort((a, b) => b.score - a.score);

      setTooltip({
        x: Math.min(width - 240, Math.max(20, x)),
        y: Math.max(10, Math.min(height - 180, y - 90)),
        axis,
        scores,
        leader: scores[0],
        userAdvantage: userScore - bestCompetitor.score
      });
    }

  }, [
    dimensions, 
    axes, 
    entities, 
    activeEntityIds, 
    hoveredEntityId, 
    selectedAxisKey, 
    activeHoverAxis, 
    isSimulating, 
    simulatedUserMetrics
  ]);

  // Export SVG handler
  const handleExportSvg = () => {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgRef.current);
    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = "seo-competitive-radar-chart.svg";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div 
      id="d3-competitive-radar-container" 
      ref={containerRef} 
      className="relative w-full flex flex-col items-center bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-xl overflow-hidden select-none"
    >
      {/* Chart Top Header & Export Controls */}
      <div className="w-full flex items-center justify-between gap-2 mb-2 z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              D3.js Radar Analizi
              {isSimulating && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-black animate-pulse">
                  Simülasyon Modu
                </span>
              )}
            </h4>
            <span className="text-[10px] text-slate-400 font-medium">
              Çok Eksenli Polar Matris &amp; SERP Kıyaslaması
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            id="btn-export-radar-svg"
            onClick={handleExportSvg}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
            title="Radar Grafiğini SVG Formatında İndir"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline text-[11px]">SVG İndir</span>
          </button>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative w-full flex items-center justify-center overflow-hidden">
        <svg
          id="d3-radar-svg-stage"
          ref={svgRef}
          width={width}
          height={height}
          className="max-w-full overflow-visible"
        >
          <defs>
            <radialGradient id="radarRadialGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx={centerX} cy={centerY} r={radius} fill="url(#radarRadialGlow)" />
        </svg>

        {/* Interactive Floating Tooltip */}
        {tooltip && (
          <div
            id="radar-chart-tooltip"
            style={{
              left: `${tooltip.x}px`,
              top: `${tooltip.y}px`,
              pointerEvents: "none"
            }}
            className="absolute z-30 w-64 bg-slate-900/95 border border-cyan-500/40 backdrop-blur-md rounded-xl p-3 shadow-2xl transition-all duration-150 text-white"
          >
            <div className="flex items-center justify-between gap-1 border-b border-slate-800 pb-1.5 mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span className="text-xs font-bold text-slate-100">{tooltip.axis.label}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Hedef: {tooltip.axis.idealRange}</span>
            </div>

            <div className="space-y-1.5 mb-2">
              {tooltip.scores.map(({ entity, score, isSimulated }) => (
                <div key={entity.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entity.color }} />
                    <span className={`font-semibold ${entity.isUser ? "text-cyan-300 font-bold" : "text-slate-300"}`}>
                      {entity.name}
                      {isSimulated && <span className="text-emerald-400 text-[9px] ml-1">(Proje)</span>}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 font-mono">
                    <span className="font-black text-white">{score}</span>
                    <span className="text-[10px] text-slate-500">{tooltip.axis.unit}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Tactical Status Pill */}
            <div className="mt-1 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
              <span className="text-slate-400">Rekabet Durumu:</span>
              {tooltip.userAdvantage >= 0 ? (
                <span className="text-emerald-400 font-black flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  +{tooltip.userAdvantage} Puan Öndesiniz
                </span>
              ) : (
                <span className="text-rose-400 font-black flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {tooltip.userAdvantage} Puan Geridesiniz
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Interactive Legend with On/Off Toggles */}
      <div className="w-full flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-slate-800/80 z-10">
        {entities.map((entity) => {
          const isActive = activeEntityIds.includes(entity.id);
          const isHovered = hoveredEntityId === entity.id;

          return (
            <button
              key={entity.id}
              type="button"
              id={`toggle-radar-entity-${entity.id}`}
              onClick={() => onToggleEntity(entity.id)}
              onMouseEnter={() => onHoverEntity(entity.id)}
              onMouseLeave={() => onHoverEntity(null)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                isActive 
                  ? "bg-slate-800 text-white border-slate-700 shadow-xs" 
                  : "bg-slate-900/50 text-slate-500 border-slate-800 opacity-60 hover:opacity-100"
              } ${isHovered ? "ring-1 ring-cyan-400" : ""}`}
            >
              <div 
                className="w-3 h-3 rounded-full flex items-center justify-center text-[9px] font-black"
                style={{ backgroundColor: entity.color, color: "#fff" }}
              >
                {entity.rank}
              </div>
              <span className={entity.isUser ? "text-cyan-300 font-black" : ""}>
                {entity.name}
              </span>
              {isActive ? (
                <Eye className="w-3 h-3 text-slate-400" />
              ) : (
                <EyeOff className="w-3 h-3 text-slate-600" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
