import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import { CompetitorKeywordRanking } from "../../types";
import { CompetitorColorPalette, DEFAULT_COMPETITOR_PALETTE } from "../../utils/competitorColorTheme";
import { 
  calculateKeywordTrendProjection, 
  CompetitorGrowthProfile, 
  KeywordTrendProjection,
  FORECAST_MONTHS 
} from "../../utils/competitorGrowthEngine";
import { TrendingUp, TrendingDown, Minus, Sparkles, ChevronRight } from "lucide-react";

interface CompetitorKeywordRowTrendSparklineProps {
  item: CompetitorKeywordRanking;
  profiles: CompetitorGrowthProfile[];
  colorPalette?: CompetitorColorPalette;
  width?: number;
  height?: number;
  onInspectKeyword?: (keywordId: string) => void;
}

export const CompetitorKeywordRowTrendSparkline: React.FC<CompetitorKeywordRowTrendSparklineProps> = ({
  item,
  profiles,
  colorPalette = DEFAULT_COMPETITOR_PALETTE,
  width = 135,
  height = 36,
  onInspectKeyword
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);

  const projection: KeywordTrendProjection = useMemo(() => {
    return calculateKeywordTrendProjection(item, profiles);
  }, [item, profiles]);

  // Render D3 Sparkline
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 4, right: 6, bottom: 4, left: 6 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // X scale: 0 to 6
    const xScale = d3.scaleLinear()
      .domain([0, 6])
      .range([0, innerWidth]);

    // Y scale: Invert so rank #1 is at top (high), rank #20 is at bottom (low)
    // Gather all rank points
    let allRanks: number[] = [];
    projection.points.forEach((pt) => {
      allRanks.push(pt.userRank, pt.comp1Rank, pt.comp2Rank, pt.comp3Rank);
    });
    const minRank = Math.max(1, d3.min(allRanks) ?? 1);
    const maxRank = Math.max(15, d3.max(allRanks) ?? 20);

    const yScale = d3.scaleLinear()
      .domain([maxRank + 1, Math.max(1, minRank - 0.5)]) // inverted
      .range([innerHeight, 0]);

    // Competitor 3 line (faded)
    const lineComp3 = d3.line<(typeof projection.points)[0]>()
      .x((d) => xScale(d.monthIndex))
      .y((d) => yScale(d.comp3Rank))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(projection.points)
      .attr("fill", "none")
      .attr("stroke", colorPalette.comp3)
      .attr("stroke-width", 1.2)
      .attr("stroke-opacity", 0.45)
      .attr("stroke-dasharray", "2,2")
      .attr("d", lineComp3);

    // Competitor 2 line (faded)
    const lineComp2 = d3.line<(typeof projection.points)[0]>()
      .x((d) => xScale(d.monthIndex))
      .y((d) => yScale(d.comp2Rank))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(projection.points)
      .attr("fill", "none")
      .attr("stroke", colorPalette.comp2)
      .attr("stroke-width", 1.2)
      .attr("stroke-opacity", 0.5)
      .attr("d", lineComp2);

    // Competitor 1 line
    const lineComp1 = d3.line<(typeof projection.points)[0]>()
      .x((d) => xScale(d.monthIndex))
      .y((d) => yScale(d.comp1Rank))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(projection.points)
      .attr("fill", "none")
      .attr("stroke", colorPalette.comp1)
      .attr("stroke-width", 1.5)
      .attr("stroke-opacity", 0.75)
      .attr("d", lineComp1);

    // Shaded Confidence Interval Cone for User Site (expanding uncertainty over 6 months)
    const confAreaUser = d3.area<(typeof projection.points)[0]>()
      .x((d) => xScale(d.monthIndex))
      .y0((d) => yScale(d.lowerUserRank))
      .y1((d) => yScale(d.upperUserRank))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(projection.points)
      .attr("fill", colorPalette.user)
      .attr("fill-opacity", 0.16)
      .attr("d", confAreaUser)
      .attr("pointer-events", "none");

    // User Site line (Prominent, colored, with gradient shadow)
    const lineUser = d3.line<(typeof projection.points)[0]>()
      .x((d) => xScale(d.monthIndex))
      .y((d) => yScale(d.userRank))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(projection.points)
      .attr("fill", "none")
      .attr("stroke", colorPalette.user)
      .attr("stroke-width", 2.4)
      .attr("stroke-linecap", "round")
      .attr("d", lineUser);

    // End points for user
    const startPt = projection.points[0];
    const endPt = projection.points[6];

    g.append("circle")
      .attr("cx", xScale(startPt.monthIndex))
      .attr("cy", yScale(startPt.userRank))
      .attr("r", 2.5)
      .attr("fill", colorPalette.user)
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 1);

    g.append("circle")
      .attr("cx", xScale(endPt.monthIndex))
      .attr("cy", yScale(endPt.userRank))
      .attr("r", 3.2)
      .attr("fill", colorPalette.user)
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 1.5);

    // Hover Scrub Line
    const hoverGuide = g.append("line")
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", "#475569")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "2,2")
      .style("opacity", 0)
      .attr("pointer-events", "none");

    // Overlay for scrub
    g.append("rect")
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .attr("fill", "transparent")
      .attr("cursor", "crosshair")
      .on("mousemove", (event) => {
        const [mx] = d3.pointer(event);
        const approx = Math.round(xScale.invert(mx));
        const clamped = Math.max(0, Math.min(6, approx));
        setHoveredIndex(clamped);
        hoverGuide
          .attr("x1", xScale(clamped))
          .attr("x2", xScale(clamped))
          .style("opacity", 0.8);
      })
      .on("mouseleave", () => {
        setHoveredIndex(null);
        hoverGuide.style("opacity", 0);
      });

  }, [projection, width, height, colorPalette]);

  const userRankStart = item.userRank ?? 20;
  const userRankEnd = projection.projectedUserRankM6;
  const rankDelta = userRankStart - userRankEnd; // positive means improved rank

  const currentHoverPoint = hoveredIndex !== null ? projection.points[hoveredIndex] : null;

  return (
    <div
      id={`trend-sparkline-wrap-${item.id}`}
      data-testid={`trend-sparkline-wrap-${item.id}`}
      className="relative group inline-block font-sans select-none"
      onMouseEnter={() => setIsPopoverOpen(true)}
      onMouseLeave={() => {
        setIsPopoverOpen(false);
        setHoveredIndex(null);
      }}
    >
      <div className="flex items-center gap-2">
        {/* D3 SVG Sparkline */}
        <div className="p-1 rounded-lg bg-slate-50 border border-slate-200/80 hover:border-indigo-300 transition-colors cursor-pointer shadow-2xs">
          <svg
            ref={svgRef}
            width={width}
            height={height}
            className="overflow-visible block"
          />
        </div>

        {/* Mini Delta Badge */}
        <div className="flex flex-col text-[10px] font-mono leading-tight">
          <div className="flex items-center gap-1 font-bold">
            {rankDelta > 0 ? (
              <span className="text-emerald-700 flex items-center gap-0.5 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                <TrendingUp className="w-2.5 h-2.5" />
                <span>+{rankDelta} sıra</span>
              </span>
            ) : rankDelta < 0 ? (
              <span className="text-rose-700 flex items-center gap-0.5 bg-rose-50 px-1 py-0.2 rounded border border-rose-200">
                <TrendingDown className="w-2.5 h-2.5" />
                <span>{rankDelta} sıra</span>
              </span>
            ) : (
              <span className="text-slate-600 flex items-center gap-0.5 bg-slate-100 px-1 py-0.2 rounded border border-slate-200">
                <Minus className="w-2.5 h-2.5" />
                <span>Sabit</span>
              </span>
            )}
          </div>

          <span className="text-[9px] text-slate-500 font-sans mt-0.5">
            #{userRankStart} ➔ #{userRankEnd}
          </span>
        </div>
      </div>

      {/* Interactive Hover Popover */}
      {isPopoverOpen && (
        <div
          id={`trend-sparkline-popover-${item.id}`}
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-700 p-3 text-xs pointer-events-none animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Popover Arrow */}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 border-r border-b border-slate-700 rotate-45" />

          {/* Header */}
          <div className="flex items-center justify-between gap-1 border-b border-slate-800 pb-1.5 mb-2">
            <span className="font-bold text-amber-300 truncate font-sans">
              {item.keyword}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              6 Aylık Trend
            </span>
          </div>

          {/* Scrubbed Month or Summary */}
          {currentHoverPoint ? (
            <div className="space-y-1.5 font-mono">
              <div className="text-[11px] text-amber-400 font-black flex items-center justify-between">
                <span>{FORECAST_MONTHS[currentHoverPoint.monthIndex]?.full}</span>
                <span className="text-[10px] text-slate-400">
                  ~{currentHoverPoint.userEstClicks} tık/ay
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[11px] pt-1 border-t border-slate-800">
                <div className="flex items-center justify-between text-amber-300">
                  <span>Siteniz:</span>
                  <span className="font-bold">#{currentHoverPoint.userRank}</span>
                </div>
                <div className="flex items-center justify-between text-blue-300">
                  <span>1. Rakip:</span>
                  <span className="font-bold">#{currentHoverPoint.comp1Rank}</span>
                </div>
                <div className="flex items-center justify-between text-emerald-300">
                  <span>2. Rakip:</span>
                  <span className="font-bold">#{currentHoverPoint.comp2Rank}</span>
                </div>
                <div className="flex items-center justify-between text-rose-300">
                  <span>3. Rakip:</span>
                  <span className="font-bold">#{currentHoverPoint.comp3Rank}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-1 text-[11px] font-mono">
              <div className="flex items-center justify-between text-slate-300">
                <span>Mevcut Sıralama:</span>
                <span className="font-bold text-white">#{userRankStart}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>6. Ay Tahmini (Mart 2027):</span>
                <span className="font-bold text-amber-300">#{userRankEnd}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300 text-[10px]">
                <span className="text-slate-400">95% Güven Aralığı (GA):</span>
                <span className="font-bold text-indigo-300">
                  #{projection.points[6].lowerUserRank} – #{projection.points[6].upperUserRank}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Tahmini Organik Büyüme:</span>
                <span className="font-bold text-emerald-400">
                  {projection.projectedUserGrowthPct > 0
                    ? `+${projection.projectedUserGrowthPct}%`
                    : `${projection.projectedUserGrowthPct}%`}
                </span>
              </div>
              <div className="text-[9px] text-slate-400 font-sans pt-1 border-t border-slate-800 flex items-center justify-between">
                <span>░░ Gölgeli Alan: Oynaklık Bandı</span>
                <span>±{((projection.points[6].upperUserRank - projection.points[6].lowerUserRank) / 2).toFixed(1)} sıra</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
