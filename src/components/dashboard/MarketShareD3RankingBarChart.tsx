import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { MarketShareKeywordItem } from "../../utils/marketShareAnalysisEngine";
import { Target } from "lucide-react";

interface MarketShareD3RankingBarChartProps {
  keywords: MarketShareKeywordItem[];
  selectedKeywordId: string | null;
  onSelectKeyword: (id: string) => void;
  height?: number;
}

export const MarketShareD3RankingBarChart: React.FC<MarketShareD3RankingBarChartProps> = ({
  keywords,
  selectedKeywordId,
  onSelectKeyword,
  height = 360
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(640);
  const [hoveredKeyword, setHoveredKeyword] = useState<MarketShareKeywordItem | null>(null);

  // ResizeObserver for responsive width
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      if (entries[0] && entries[0].contentRect.width > 200) {
        setContainerWidth(entries[0].contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Top 8 keywords for clean readability
  const displayKeywords = keywords.slice(0, 8);

  useEffect(() => {
    if (!svgRef.current || displayKeywords.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 28, right: 30, bottom: 44, left: 160 };
    const width = containerWidth - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    if (width <= 0 || chartHeight <= 0) return;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Y Scale: Keyword names
    const y = d3
      .scaleBand()
      .domain(displayKeywords.map(d => d.keyword))
      .range([0, chartHeight])
      .padding(0.3);

    // X Scale: Inverted ranking position (Rank 1 is longest bar, Rank 10 is shorter)
    // Score = 11 - Rank (so Rank 1 = 10 points, Rank 10 = 1 point)
    const x = d3
      .scaleLinear()
      .domain([0, 10])
      .range([0, width]);

    // Gridlines (Vertical)
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(5)
          .tickSize(-chartHeight)
          .tickFormat(() => "")
      )
      .selectAll(".tick line")
      .attr("stroke", "#f1f5f9")
      .attr("stroke-dasharray", "3 3");

    // Background track bar (gray)
    g.selectAll(".track-bar")
      .data<MarketShareKeywordItem>(displayKeywords)
      .enter()
      .append("rect")
      .attr("class", "track-bar")
      .attr("y", (d: MarketShareKeywordItem) => y(d.keyword) || 0)
      .attr("height", y.bandwidth())
      .attr("x", 0)
      .attr("width", width)
      .attr("fill", "#f8fafc")
      .attr("rx", 5)
      .attr("ry", 5);

    // Leader Rank Marker (Competitor #1 position)
    g.selectAll(".leader-marker")
      .data<MarketShareKeywordItem>(displayKeywords)
      .enter()
      .append("line")
      .attr("class", "leader-marker")
      .attr("x1", (d: MarketShareKeywordItem) => {
        const leaderScore = Math.max(1, 11 - d.bestCompetitor.rank);
        return x(leaderScore);
      })
      .attr("x2", (d: MarketShareKeywordItem) => {
        const leaderScore = Math.max(1, 11 - d.bestCompetitor.rank);
        return x(leaderScore);
      })
      .attr("y1", (d: MarketShareKeywordItem) => (y(d.keyword) || 0) - 2)
      .attr("y2", (d: MarketShareKeywordItem) => (y(d.keyword) || 0) + y.bandwidth() + 2)
      .attr("stroke", "#f59e0b")
      .attr("stroke-width", 3)
      .attr("stroke-dasharray", "2 2")
      .attr("opacity", 0.85);

    // User Ranking Bar (Indigo gradient)
    const defs = svg.append("defs");
    const barGradient = defs
      .append("linearGradient")
      .attr("id", "user-bar-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");

    barGradient.append("stop").attr("offset", "0%").attr("stop-color", "#6366f1");
    barGradient.append("stop").attr("offset", "100%").attr("stop-color", "#4f46e5");

    const winGradient = defs
      .append("linearGradient")
      .attr("id", "win-bar-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");

    winGradient.append("stop").attr("offset", "0%").attr("stop-color", "#10b981");
    winGradient.append("stop").attr("offset", "100%").attr("stop-color", "#059669");

    const bars = g
      .selectAll(".user-bar")
      .data<MarketShareKeywordItem>(displayKeywords)
      .enter()
      .append("rect")
      .attr("class", "user-bar")
      .attr("y", (d: MarketShareKeywordItem) => y(d.keyword) || 0)
      .attr("height", y.bandwidth())
      .attr("x", 0)
      .attr("width", 0) // animate from 0
      .attr("fill", (d: MarketShareKeywordItem) => (d.userRank === 1 ? "url(#win-bar-gradient)" : "url(#user-bar-gradient)"))
      .attr("rx", 5)
      .attr("ry", 5)
      .style("cursor", "pointer")
      .attr("opacity", (d: MarketShareKeywordItem) => (selectedKeywordId && d.id !== selectedKeywordId ? 0.45 : 1));

    bars
      .transition()
      .duration(700)
      .ease(d3.easeCubicOut)
      .attr("width", (d: MarketShareKeywordItem) => {
        const userScore = Math.max(1, 11 - d.userRank);
        return x(userScore);
      });

    // Interactive events on bars
    bars
      .on("mouseenter", function (_event, d: MarketShareKeywordItem) {
        setHoveredKeyword(d);
        d3.select(this).attr("opacity", 1);
      })
      .on("mouseleave", function () {
        setHoveredKeyword(null);
      })
      .on("click", (_event, d: MarketShareKeywordItem) => {
        onSelectKeyword(d.id);
      });

    // Rank Number Labels inside or near the end of each bar
    g.selectAll(".rank-label")
      .data<MarketShareKeywordItem>(displayKeywords)
      .enter()
      .append("text")
      .attr("class", "rank-label")
      .attr("y", (d: MarketShareKeywordItem) => (y(d.keyword) || 0) + y.bandwidth() / 2 + 4)
      .attr("x", (d: MarketShareKeywordItem) => {
        const userScore = Math.max(1, 11 - d.userRank);
        return x(userScore) + 8;
      })
      .text((d: MarketShareKeywordItem) => `#${d.userRank} Sıra (${d.monthlyVolumeFormatted}/ay)`)
      .attr("fill", (d: MarketShareKeywordItem) => (d.userRank === 1 ? "#059669" : "#4338ca"))
      .attr("font-size", "11px")
      .attr("font-weight", "800")
      .style("cursor", "pointer")
      .on("click", (_event, d: MarketShareKeywordItem) => onSelectKeyword(d.id));

    // Y Axis (Keyword Names)
    const yAxis = g
      .append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y).tickSize(0));

    yAxis
      .selectAll(".tick text")
      .attr("fill", "#1e293b")
      .attr("font-size", "12px")
      .attr("font-weight", "700")
      .style("cursor", "pointer")
      .text(d => {
        const str = String(d);
        return str.length > 20 ? str.slice(0, 18) + "…" : str;
      })
      .on("click", (_event, kwName) => {
        const matched = displayKeywords.find(k => k.keyword === kwName);
        if (matched) onSelectKeyword(matched.id);
      });

    yAxis.select(".domain").remove();

    // X Axis (Position Guidance)
    const xAxis = g
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(
        d3
          .axisBottom(x)
          .tickValues([1, 3, 5, 8, 10])
          .tickFormat(val => {
            const v = Number(val);
            if (v === 10) return "#1 Sıra (Zirve)";
            if (v === 8) return "İlk 3";
            if (v === 6) return "İlk 5";
            if (v === 1) return "İlk 10";
            return "";
          })
      );

    xAxis.selectAll(".tick text").attr("fill", "#64748b").attr("font-size", "10px").attr("font-weight", "600");
    xAxis.select(".domain").attr("stroke", "#cbd5e1");
  }, [displayKeywords, containerWidth, height, selectedKeywordId, onSelectKeyword]);

  return (
    <div
      ref={containerRef}
      id="d3-market-share-ranking-chart"
      className="relative flex flex-col w-full p-2 select-none"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 px-2 pb-2 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-indigo-600 shrink-0" />
            <span className="font-bold text-slate-700">Sizin Sıranız</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-500 shrink-0" />
            <span className="font-bold text-slate-700">Google #1 Sıra (Lider)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t-2 border-dashed border-amber-500 shrink-0" />
            <span className="font-bold text-slate-700">Rakip Zirvesi</span>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-slate-600">
          Çubuk uzunluğu arama motoru sıralama üstünlüğünü gösterir
        </span>
      </div>

      <svg
        ref={svgRef}
        width={containerWidth}
        height={height}
        className="overflow-visible"
        aria-label="Google Sıralama Kıyaslama Grafiği"
      />

      {/* Hover info tooltip card */}
      {hoveredKeyword && (
        <div className="mt-2 p-3 rounded-xl bg-slate-900 text-white text-xs flex flex-wrap items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="font-bold text-white truncate max-w-[200px]">{hoveredKeyword.keyword}</span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-extrabold text-[10px]">
              Sıranız: #{hoveredKeyword.userRank}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-300">
              En İyi Rakip: <strong className="text-amber-400">{hoveredKeyword.bestCompetitor.name} (#{hoveredKeyword.bestCompetitor.rank})</strong>
            </span>
            <span className="text-emerald-400 font-extrabold">
              Potansiyel: {hoveredKeyword.trafficPotentialGain}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
