import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import { CompetitorEntity, SeoPerformanceAxisDef } from "../../utils/competitorSeoPerformanceRadarEngine";
import { 
  Download, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Target, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  ShieldCheck,
  TrendingUp
} from "lucide-react";

interface D3CompetitorSeoPerformanceRadarProps {
  axes: SeoPerformanceAxisDef[];
  entities: CompetitorEntity[];
  activeEntityIds: string[];
  onToggleEntity: (id: string) => void;
  selectedAxisKey: string | null;
  onSelectAxis: (key: string | null) => void;
  simulatedBoosts?: {
    domainAuthority: number;
    keywordVisibility: number;
    contentDepth: number;
    backlinkProfile: number;
    siteSpeed: number;
    [key: string]: number;
  };
  isSimulating?: boolean;
}

interface TooltipData {
  x: number;
  y: number;
  axis: SeoPerformanceAxisDef;
  scores: Array<{
    entity: CompetitorEntity;
    score: number;
    isSimulated?: boolean;
  }>;
  leader: {
    entity: CompetitorEntity;
    score: number;
  };
  userAdvantage: number;
}

export const D3CompetitorSeoPerformanceRadar: React.FC<D3CompetitorSeoPerformanceRadarProps> = ({
  axes,
  entities,
  activeEntityIds,
  onToggleEntity,
  selectedAxisKey,
  onSelectAxis,
  simulatedBoosts = { domainAuthority: 0, keywordVisibility: 0, contentDepth: 0, backlinkProfile: 0, siteSpeed: 0 },
  isSimulating = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 560, height: 460 });
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [hoveredAxisKey, setHoveredAxisKey] = useState<string | null>(null);

  // Resize observer for responsive layout
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width } = entries[0].contentRect;
      if (width > 0) {
        const calculatedWidth = Math.min(width, 700);
        const calculatedHeight = Math.max(400, Math.min(Math.round(calculatedWidth * 0.8), 520));
        setDimensions({ width: calculatedWidth, height: calculatedHeight });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const userEntity = useMemo(() => entities.find(e => e.isUser) || entities[0], [entities]);
  const leaderEntity = useMemo(() => entities.find(e => e.rank === 1) || entities[1], [entities]);

  // Main D3 Rendering
  useEffect(() => {
    if (!svgRef.current || !axes || axes.length < 3 || !entities || entities.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = dimensions.width;
    const height = dimensions.height;
    const margin = 55;
    const radius = Math.min(width, height) / 2 - margin;
    const centerX = width / 2;
    const centerY = height / 2;
    const angleSlice = (Math.PI * 2) / axes.length;

    // Defs for gradients & shadow filters
    const defs = svg.append("defs");

    // Glow filter
    const filter = defs.append("filter")
      .attr("id", "radar-glow")
      .attr("x", "-20%")
      .attr("y", "-20%")
      .attr("width", "140%")
      .attr("height", "140%");
    filter.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "blur");
    filter.append("feComposite").attr("in", "SourceGraphic").attr("in2", "blur").attr("operator", "over");

    // Gradients for User site
    const userGrad = defs.append("radialGradient")
      .attr("id", "user-area-grad")
      .attr("cx", "50%").attr("cy", "50%").attr("r", "50%");
    userGrad.append("stop").attr("offset", "0%").attr("stop-color", "#06b6d4").attr("stop-opacity", 0.4);
    userGrad.append("stop").attr("offset", "100%").attr("stop-color", "#06b6d4").attr("stop-opacity", 0.1);

    const rootG = svg.append("g")
      .attr("transform", `translate(${centerX}, ${centerY})`);

    const rScale = d3.scaleLinear().domain([0, 100]).range([0, radius]);

    // Concentric Web Polygons (Levels 20%, 40%, 60%, 80%, 100%)
    const levels = [20, 40, 60, 80, 100];
    const gridG = rootG.append("g").attr("class", "grid-levels");

    levels.forEach((lvl) => {
      const levelPoints: [number, number][] = axes.map((_, i) => {
        const r = rScale(lvl);
        const angle = i * angleSlice - Math.PI / 2;
        return [r * Math.cos(angle), r * Math.sin(angle)];
      });

      // Polygon outline
      gridG.append("polygon")
        .attr("points", levelPoints.map(p => p.join(",")).join(" "))
        .attr("fill", lvl === 100 ? "rgba(15, 23, 42, 0.02)" : "none")
        .attr("stroke", lvl === 100 ? "rgba(148, 163, 184, 0.4)" : "rgba(148, 163, 184, 0.18)")
        .attr("stroke-dasharray", lvl === 100 ? "none" : "3,3")
        .attr("stroke-width", lvl === 100 ? 1.5 : 1);

      // Percentage Labels
      gridG.append("text")
        .attr("x", 4)
        .attr("y", -rScale(lvl) + 4)
        .attr("fill", "rgba(148, 163, 184, 0.8)")
        .attr("font-size", "9px")
        .attr("font-family", "ui-monospace, monospace")
        .attr("font-weight", "600")
        .text(`%${lvl}`);
    });

    // Radial Axes lines & Labels
    const axesG = rootG.append("g").attr("class", "axes");

    axes.forEach((axis, i) => {
      const angle = i * angleSlice - Math.PI / 2;
      const x2 = radius * Math.cos(angle);
      const y2 = radius * Math.sin(angle);
      const isSelected = selectedAxisKey === axis.key;
      const isHovered = hoveredAxisKey === axis.key;

      // Axis ray line
      axesG.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", x2)
        .attr("y2", y2)
        .attr("stroke", isSelected ? "#8b5cf6" : isHovered ? "#06b6d4" : "rgba(148, 163, 184, 0.25)")
        .attr("stroke-width", isSelected ? 2 : isHovered ? 1.8 : 1)
        .attr("stroke-dasharray", isSelected ? "none" : "2,2");

      // Outer label positioning
      const labelDistance = radius + 22;
      const lx = labelDistance * Math.cos(angle);
      const ly = labelDistance * Math.sin(angle);

      // Text Anchor logic
      let textAnchor = "middle";
      if (Math.abs(Math.cos(angle)) > 0.3) {
        textAnchor = Math.cos(angle) > 0 ? "start" : "end";
      }

      const labelG = axesG.append("g")
        .attr("transform", `translate(${lx}, ${ly})`)
        .attr("cursor", "pointer")
        .on("click", () => {
          onSelectAxis(isSelected ? null : axis.key);
        })
        .on("mouseenter", () => setHoveredAxisKey(axis.key))
        .on("mouseleave", () => setHoveredAxisKey(null));

      // Background pill for selected axis
      if (isSelected) {
        labelG.append("rect")
          .attr("x", textAnchor === "start" ? -4 : textAnchor === "end" ? -76 : -40)
          .attr("y", -11)
          .attr("width", 80)
          .attr("height", 20)
          .attr("rx", 6)
          .attr("fill", "rgba(139, 92, 246, 0.15)")
          .attr("stroke", "#8b5cf6")
          .attr("stroke-width", 1);
      }

      labelG.append("text")
        .attr("text-anchor", textAnchor)
        .attr("dy", "0.35em")
        .attr("fill", isSelected ? "#8b5cf6" : isHovered ? "#06b6d4" : "currentColor")
        .attr("font-size", isSelected ? "11px" : "10px")
        .attr("font-weight", isSelected || isHovered ? "700" : "600")
        .attr("class", "text-slate-700 dark:text-slate-200 transition-colors")
        .text(axis.shortLabel);
    });

    // Draw Entities Polygons
    const activeEntities = entities.filter(e => activeEntityIds.includes(e.id));
    const polygonsG = rootG.append("g").attr("class", "entity-polygons");

    // Render competitor polygons first (so user polygon sits on top)
    const sortedEntities = [...activeEntities].sort((a, b) => {
      if (a.isUser) return 1;
      if (b.isUser) return -1;
      return b.rank - a.rank;
    });

    sortedEntities.forEach(ent => {
      const points: [number, number][] = axes.map((axis, i) => {
        let val = ent.metrics[axis.key] || 50;
        // If simulated user
        if (ent.isUser && isSimulating && simulatedBoosts[axis.key]) {
          val = Math.min(100, val + (simulatedBoosts[axis.key] || 0));
        }
        val = Math.max(5, Math.min(100, val));
        const r = rScale(val);
        const angle = i * angleSlice - Math.PI / 2;
        return [r * Math.cos(angle), r * Math.sin(angle)];
      });

      const pathData = points.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ") + " Z";

      // Draw Polygon
      polygonsG.append("path")
        .attr("d", pathData)
        .attr("fill", ent.isUser ? "url(#user-area-grad)" : ent.color)
        .attr("fill-opacity", ent.isUser ? 0.35 : 0.12)
        .attr("stroke", ent.color)
        .attr("stroke-width", ent.isUser ? 2.5 : 1.8)
        .attr("stroke-dasharray", ent.isUser && isSimulating ? "4,3" : "none")
        .attr("filter", ent.isUser ? "url(#radar-glow)" : "none");

      // Draw Vertex Dots
      points.forEach((p, i) => {
        const axis = axes[i];
        const isSelected = selectedAxisKey === axis.key;
        let score = ent.metrics[axis.key] || 50;
        if (ent.isUser && isSimulating && simulatedBoosts[axis.key]) {
          score = Math.min(100, score + (simulatedBoosts[axis.key] || 0));
        }

        const dot = polygonsG.append("circle")
          .attr("cx", p[0])
          .attr("cy", p[1])
          .attr("r", ent.isUser ? (isSelected ? 5.5 : 4) : (isSelected ? 4 : 3))
          .attr("fill", ent.isUser ? "#06b6d4" : ent.color)
          .attr("stroke", "#ffffff")
          .attr("stroke-width", ent.isUser ? 1.8 : 1)
          .attr("cursor", "pointer");

        // Interaction
        dot.on("mouseenter", (event) => {
          const leaderScore = leaderEntity.metrics[axis.key] || 50;
          const userScore = ent.isUser ? score : (userEntity.metrics[axis.key] || 50);

          const allScores = entities.map(item => ({
            entity: item,
            score: item.isUser && isSimulating && simulatedBoosts[axis.key]
              ? Math.min(100, (item.metrics[axis.key] || 50) + (simulatedBoosts[axis.key] || 0))
              : (item.metrics[axis.key] || 50),
            isSimulated: item.isUser && isSimulating && !!simulatedBoosts[axis.key]
          }));

          setTooltip({
            x: event.clientX,
            y: event.clientY,
            axis,
            scores: allScores,
            leader: { entity: leaderEntity, score: leaderScore },
            userAdvantage: userScore - leaderScore
          });
          setHoveredAxisKey(axis.key);
        })
        .on("mouseleave", () => {
          setTooltip(null);
          setHoveredAxisKey(null);
        })
        .on("click", () => {
          onSelectAxis(axis.key);
        });
      });
    });

  }, [dimensions, axes, entities, activeEntityIds, selectedAxisKey, hoveredAxisKey, isSimulating, simulatedBoosts]);

  // Export as PNG
  const handleExportPng = () => {
    if (!svgRef.current) return;
    const svgEl = svgRef.current;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgEl);
    const canvas = document.createElement("canvas");
    canvas.width = dimensions.width * 2;
    canvas.height = dimensions.height * 2;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      const a = document.createElement("a");
      a.download = `sektorel-seo-performans-radari-${new Date().toISOString().slice(0, 10)}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = url;
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full flex flex-col items-center select-none"
      id="d3-competitor-seo-performance-radar"
    >
      {/* Chart Top Controls */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-3 px-1 text-xs">
        {/* Interactive Legend Toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          {entities.map(ent => {
            const isActive = activeEntityIds.includes(ent.id);
            return (
              <button
                key={ent.id}
                type="button"
                onClick={() => onToggleEntity(ent.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                  isActive
                    ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 shadow-2xs"
                    : "bg-slate-100 dark:bg-slate-900/60 text-slate-400 border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <span 
                  className="w-2.5 h-2.5 rounded-full shrink-0" 
                  style={{ backgroundColor: ent.color }} 
                />
                <span className="truncate max-w-[120px]">{ent.name}</span>
                {isActive ? (
                  <Eye className="w-3 h-3 text-slate-400 ml-0.5" />
                ) : (
                  <EyeOff className="w-3 h-3 text-slate-400 ml-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* Snapshot Download */}
        <button
          type="button"
          onClick={handleExportPng}
          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
          title="Radar Çizelgesini PNG Olarak İndir"
        >
          <Download className="w-3.5 h-3.5 text-cyan-500" />
          <span>Grafiği Kaydet</span>
        </button>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full flex justify-center overflow-visible">
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="overflow-visible"
        />
      </div>

      {/* Floating Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none p-3.5 rounded-xl bg-slate-900/95 text-white text-xs shadow-2xl border border-slate-700/80 backdrop-blur-md max-w-xs space-y-2 transform -translate-x-1/2 -translate-y-full mt-[-10px]"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 gap-2">
            <span className="font-bold text-cyan-400 flex items-center gap-1">
              <Target className="w-3.5 h-3.5" />
              {tooltip.axis.label}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Ağırlık: %{tooltip.axis.weight}
            </span>
          </div>

          {/* Scores list */}
          <div className="space-y-1">
            {tooltip.scores.map(({ entity, score, isSimulated }) => (
              <div key={entity.id} className="flex items-center justify-between gap-3 text-[11px]">
                <span className="flex items-center gap-1.5 truncate text-slate-300">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entity.color }} />
                  {entity.name}
                  {isSimulated && <span className="text-[9px] text-emerald-400 font-mono">(Simüle)</span>}
                </span>
                <span className="font-mono font-bold text-white">%{score}</span>
              </div>
            ))}
          </div>

          {/* Advantage Badge */}
          <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
            <span className="text-slate-400">Lidere Göre Durum:</span>
            <span className={`font-bold flex items-center gap-0.5 ${
              tooltip.userAdvantage >= 0 ? "text-emerald-400" : "text-amber-400"
            }`}>
              {tooltip.userAdvantage >= 0 ? `+${tooltip.userAdvantage} Puan Önde` : `${tooltip.userAdvantage} Puan Geride`}
            </span>
          </div>

          <div className="text-[10px] text-slate-400 italic bg-slate-950/60 p-1.5 rounded-lg border border-slate-800">
            {tooltip.axis.bestPractice}
          </div>
        </div>
      )}
    </div>
  );
};
