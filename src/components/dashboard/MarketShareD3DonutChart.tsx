import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import { MarketShareCompetitorProfile } from "../../utils/marketShareAnalysisEngine";
import { Award, TrendingUp, Users, Target, ShieldCheck } from "lucide-react";

interface MarketShareD3DonutChartProps {
  competitors: MarketShareCompetitorProfile[];
  userMarketShare: number;
  totalMarketVolumeFormatted: string;
  selectedCompetitorId: string | null;
  onSelectCompetitor: (id: string | null) => void;
  height?: number;
}

export const MarketShareD3DonutChart: React.FC<MarketShareD3DonutChartProps> = ({
  competitors,
  userMarketShare,
  totalMarketVolumeFormatted,
  selectedCompetitorId,
  onSelectCompetitor,
  height = 320
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(360);
  const [hoveredData, setHoveredData] = useState<MarketShareCompetitorProfile | null>(null);

  // ResizeObserver for responsive sizing
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      if (entries[0] && entries[0].contentRect.width > 120) {
        setContainerWidth(entries[0].contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Active highlighted profile
  const activeProfile = useMemo(() => {
    if (hoveredData) return hoveredData;
    if (selectedCompetitorId) {
      return competitors.find(c => c.id === selectedCompetitorId) || null;
    }
    return competitors.find(c => c.isUser) || competitors[0];
  }, [hoveredData, selectedCompetitorId, competitors]);

  // Render D3 Donut Chart
  useEffect(() => {
    if (!svgRef.current || competitors.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = containerWidth;
    const chartHeight = height;
    const radius = Math.min(width, chartHeight) / 2 - 16;
    const innerRadius = radius * 0.62;

    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2}, ${chartHeight / 2})`);

    // D3 Pie Generator
    const pie = d3
      .pie<MarketShareCompetitorProfile>()
      .value(d => d.marketSharePercent)
      .sort(null)
      .padAngle(0.03);

    // D3 Arc Generator
    const arc = d3
      .arc<d3.PieArcDatum<MarketShareCompetitorProfile>>()
      .innerRadius(innerRadius)
      .outerRadius(radius)
      .cornerRadius(6);

    const hoverArc = d3
      .arc<d3.PieArcDatum<MarketShareCompetitorProfile>>()
      .innerRadius(innerRadius - 4)
      .outerRadius(radius + 7)
      .cornerRadius(8);

    // Add subtle glow drop shadow filter
    const defs = svg.append("defs");
    const filter = defs
      .append("filter")
      .attr("id", "donut-glow")
      .attr("x", "-20%")
      .attr("y", "-20%")
      .attr("width", "140%")
      .attr("height", "140%");

    filter.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "blur");
    filter.append("feComposite").attr("in", "SourceGraphic").attr("in2", "blur").attr("operator", "over");

    // Draw Slices
    const arcs = g
      .selectAll(".arc")
      .data(pie(competitors))
      .enter()
      .append("g")
      .attr("class", "arc")
      .style("cursor", "pointer");

    arcs
      .append("path")
      .attr("d", d => {
        const isCurrentSelected =
          (selectedCompetitorId && d.data.id === selectedCompetitorId) ||
          (hoveredData && d.data.id === hoveredData.id);
        return isCurrentSelected ? hoverArc(d) : arc(d);
      })
      .attr("fill", d => d.data.color)
      .attr("stroke", d => (d.data.isUser ? "#4338ca" : "#ffffff"))
      .attr("stroke-width", d => (d.data.isUser ? 2.5 : 1.5))
      .style("opacity", d => {
        if (!selectedCompetitorId && !hoveredData) return 1;
        const isMatched =
          (hoveredData && d.data.id === hoveredData.id) ||
          (selectedCompetitorId && d.data.id === selectedCompetitorId);
        return isMatched ? 1 : 0.55;
      })
      .style("transition", "all 0.25s ease")
      .on("mouseenter", function (_event, d) {
        setHoveredData(d.data);
        d3.select(this)
          .transition()
          .duration(150)
          .attr("d", hoverArc as any)
          .style("opacity", 1);
      })
      .on("mouseleave", function () {
        setHoveredData(null);
      })
      .on("click", (_event, d) => {
        if (selectedCompetitorId === d.data.id) {
          onSelectCompetitor(null);
        } else {
          onSelectCompetitor(d.data.id);
        }
      });
  }, [competitors, containerWidth, height, selectedCompetitorId, hoveredData, onSelectCompetitor]);

  return (
    <div
      ref={containerRef}
      id="d3-market-share-donut-container"
      className="relative flex flex-col items-center justify-center p-3 select-none"
    >
      <svg
        ref={svgRef}
        width={containerWidth}
        height={height}
        className="overflow-visible"
        aria-label="Pazar Payı Pasta Grafiği"
      />

      {/* Central Interactive Label Inside Donut */}
      <div
        className="absolute flex flex-col items-center justify-center text-center pointer-events-none transition-all duration-300"
        style={{
          width: containerWidth < 300 ? "130px" : "150px",
          height: containerWidth < 300 ? "130px" : "150px"
        }}
      >
        {activeProfile ? (
          <>
            <span
              className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full mb-1"
              style={{
                backgroundColor: `${activeProfile.color}25`,
                color: activeProfile.color
              }}
            >
              {activeProfile.isUser ? "Sizin Siteniz" : "Rakip Firma"}
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 leading-none tracking-tight">
              %{activeProfile.marketSharePercent}
            </span>
            <span className="text-[11px] font-bold text-slate-600 truncate max-w-[130px] mt-0.5">
              {activeProfile.name}
            </span>
            <span className="text-[9px] text-slate-600 font-medium">
              ~{activeProfile.estimatedOrganicTraffic.toLocaleString("tr-TR")} Ziyaret/Ay
            </span>
          </>
        ) : (
          <>
            <span className="text-xs font-bold text-slate-600">Pazar Havuzu</span>
            <span className="text-2xl font-black text-slate-900 leading-none tracking-tight">
              {totalMarketVolumeFormatted}
            </span>
            <span className="text-[10px] text-slate-600 mt-1">Aylık Toplam Arama</span>
          </>
        )}
      </div>

      {/* Quick Legend Pills Below Donut */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-2 w-full max-w-sm">
        {competitors.map(c => {
          const isSelected = selectedCompetitorId === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelectCompetitor(isSelected ? null : c.id)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: c.color }}
              />
              <span className="truncate max-w-[110px]">{c.name}</span>
              <span className="text-[10px] opacity-80">%{c.marketSharePercent}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
