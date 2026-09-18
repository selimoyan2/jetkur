import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { CompetitorKeywordRanking, CompetitorContentMetric } from "../../types";
import { Trophy, Info, Sparkles, SlidersHorizontal, BarChart3, ArrowUpDown } from "lucide-react";

interface CompetitorRankingD3BarChartProps {
  rankings: CompetitorKeywordRanking[];
  userName: string;
  competitors: CompetitorContentMetric[];
  className?: string;
}

export const CompetitorRankingD3BarChart: React.FC<CompetitorRankingD3BarChartProps> = ({
  rankings,
  userName,
  competitors,
  className = ""
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const [sortOption, setSortOption] = useState<"volume" | "userRank" | "gap">("volume");
  const [activeEntityFilter, setActiveEntityFilter] = useState<string>("all");
  const [selectedKeywordId, setSelectedKeywordId] = useState<string | null>(null);

  const comp1 = competitors[0] || { name: "1. Rakip", domain: "rakip1.com", rank: 1 };
  const comp2 = competitors[1] || { name: "2. Rakip", domain: "rakip2.com", rank: 2 };
  const comp3 = competitors[2] || { name: "3. Rakip", domain: "rakip3.com", rank: 3 };

  const entities = [
    { key: "user", label: `Siteniz (${userName})`, color: "#f59e0b", badgeColor: "bg-amber-400 text-slate-950" },
    { key: "comp1", label: `1. Rakip (${comp1.name.split(" ")[0]})`, color: "#ef4444", badgeColor: "bg-rose-500 text-white" },
    { key: "comp2", label: `2. Rakip (${comp2.name.split(" ")[0]})`, color: "#0ea5e9", badgeColor: "bg-sky-500 text-white" },
    { key: "comp3", label: `3. Rakip (${comp3.name.split(" ")[0]})`, color: "#10b981", badgeColor: "bg-emerald-500 text-white" }
  ];

  // Process data for D3 chart
  const chartData = React.useMemo(() => {
    const list = [...rankings];

    list.sort((a, b) => {
      if (sortOption === "volume") {
        const volA = parseFloat(a.monthlyVolume.replace(/[^0-9.]/g, "") || "0") * (a.monthlyVolume.includes("K") ? 1000 : 1);
        const volB = parseFloat(b.monthlyVolume.replace(/[^0-9.]/g, "") || "0") * (b.monthlyVolume.includes("K") ? 1000 : 1);
        return volB - volA;
      } else if (sortOption === "userRank") {
        const rA = a.userRank ?? 99;
        const rB = b.userRank ?? 99;
        return rA - rB;
      } else {
        return a.gap - b.gap;
      }
    });

    // Display top 10 keywords in chart for optimal visual clarity
    return list.slice(0, 10);
  }, [rankings, sortOption]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || chartData.length === 0) return;

    const container = containerRef.current;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = container.clientWidth || 800;
    const height = Math.max(450, chartData.length * 52 + 100);
    const margin = { top: 40, right: 30, bottom: 40, left: 180 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.attr("width", width).attr("height", height).attr("viewBox", `0 0 ${width} ${height}`);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Y scale for Keywords
    const yScale = d3
      .scaleBand()
      .domain(chartData.map((d) => d.keyword))
      .range([0, innerHeight])
      .padding(0.24);

    // Sub-scale for Entities (Grouped horizontal bar chart)
    const activeEntities = activeEntityFilter === "all" ? entities : entities.filter(e => e.key === activeEntityFilter);
    const ySubScale = d3
      .scaleBand()
      .domain(activeEntities.map((e) => e.key))
      .range([0, yScale.bandwidth()])
      .padding(0.12);

    // X scale for Rank Performance Score: 1st rank is 100 pts, 20th rank is 10 pts, unranked is 0 pts
    const getRankScore = (rank: number | null | undefined): number => {
      if (rank === null || rank === undefined || rank > 20) return 3;
      return Math.max(8, Math.round(100 - (rank - 1) * 4.8));
    };

    const xScale = d3.scaleLinear().domain([0, 100]).range([0, innerWidth]);

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
      .selectAll("line")
      .attr("stroke", "#334155")
      .attr("stroke-opacity", 0.3)
      .attr("stroke-dasharray", "3,3");

    // X-Axis
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(5)
      .tickFormat((d) => {
        const val = Number(d);
        if (val === 100) return "#1 Sıra (100p)";
        if (val === 75) return "İlk 5 (#5)";
        if (val === 50) return "İlk 10 (#10)";
        if (val === 25) return "İlk 15 (#15)";
        return "Sıralama Dışı";
      });

    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll("text")
      .attr("fill", "#94a3b8")
      .attr("font-size", "10px")
      .attr("font-weight", "600");

    // Y-Axis (Keyword Labels)
    const yAxis = d3.axisLeft(yScale);
    const yAxisGroup = g.append("g").call(yAxis);

    yAxisGroup.selectAll("text").remove(); // Custom render keywords with volume badges

    chartData.forEach((d) => {
      const yPos = (yScale(d.keyword) || 0) + yScale.bandwidth() / 2;

      const labelGroup = g
        .append("g")
        .attr("transform", `translate(-10, ${yPos})`)
        .attr("cursor", "pointer")
        .on("click", () => setSelectedKeywordId(d.id));

      labelGroup
        .append("text")
        .attr("text-anchor", "end")
        .attr("y", -3)
        .attr("fill", d.id === selectedKeywordId ? "#f59e0b" : "#f1f5f9")
        .attr("font-size", "11px")
        .attr("font-weight", "700")
        .text(() => {
          const maxLen = 22;
          return d.keyword.length > maxLen ? d.keyword.slice(0, maxLen) + "..." : d.keyword;
        });

      labelGroup
        .append("text")
        .attr("text-anchor", "end")
        .attr("y", 12)
        .attr("fill", "#94a3b8")
        .attr("font-size", "9px")
        .attr("font-family", "monospace")
        .text(`${d.monthlyVolume} • Zorluk: ${d.difficulty}`);
    });

    // Bars
    chartData.forEach((row) => {
      const kwY = yScale(row.keyword) || 0;

      activeEntities.forEach((entity) => {
        let rankVal: number | null = null;
        if (entity.key === "user") rankVal = row.userRank;
        else if (entity.key === "comp1") rankVal = row.comp1Rank;
        else if (entity.key === "comp2") rankVal = row.comp2Rank;
        else if (entity.key === "comp3") rankVal = row.comp3Rank;

        const score = getRankScore(rankVal);
        const barY = kwY + (ySubScale(entity.key) || 0);
        const barHeight = ySubScale.bandwidth();
        const barWidth = xScale(score);

        // Bar background track
        g.append("rect")
          .attr("x", 0)
          .attr("y", barY)
          .attr("width", innerWidth)
          .attr("height", barHeight)
          .attr("fill", "#1e293b")
          .attr("opacity", 0.4)
          .attr("rx", 3);

        // Value Bar
        const bar = g
          .append("rect")
          .attr("x", 0)
          .attr("y", barY)
          .attr("width", 0)
          .attr("height", barHeight)
          .attr("fill", entity.color)
          .attr("rx", 3)
          .attr("cursor", "pointer")
          .attr("opacity", 0.88);

        bar
          .transition()
          .duration(650)
          .attr("width", Math.max(16, barWidth));

        // Hover events
        bar
          .on("mouseenter", (event) => {
            bar.attr("opacity", 1).attr("stroke", "#ffffff").attr("stroke-width", 1.5);
            if (tooltipRef.current) {
              const tooltip = tooltipRef.current;
              tooltip.style.display = "block";
              tooltip.style.left = `${event.pageX + 12}px`;
              tooltip.style.top = `${event.pageY - 28}px`;
              tooltip.innerHTML = `
                <div class="font-black text-white text-xs border-b border-slate-700 pb-1 mb-1.5 flex items-center justify-between gap-2">
                  <span>${row.keyword}</span>
                  <span class="text-[10px] px-1.5 py-0.5 rounded ${entity.badgeColor}">${entity.label}</span>
                </div>
                <div class="space-y-1 text-[11px] text-slate-300">
                  <div class="flex justify-between">
                    <span class="text-slate-400">Google SERP Sırası:</span>
                    <strong class="${rankVal === 1 ? 'text-amber-400' : 'text-white'} font-mono">${rankVal !== null ? `#${rankVal}` : "İlk 20'de Yok"}</strong>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-400">Aylık Arama Hacmi:</span>
                    <span class="font-mono text-cyan-300">${row.monthlyVolume}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-400">SEO Zorluk Skoru:</span>
                    <span class="font-mono">${row.difficulty}/100</span>
                  </div>
                  <div class="mt-1 pt-1 border-t border-slate-700/60 text-[10px] text-amber-200/90 leading-tight">
                    💡 ${row.aiRecommendation}
                  </div>
                </div>
              `;
            }
          })
          .on("mouseleave", () => {
            bar.attr("opacity", 0.88).attr("stroke", "none");
            if (tooltipRef.current) {
              tooltipRef.current.style.display = "none";
            }
          })
          .on("click", () => {
            setSelectedKeywordId(row.id);
          });

        // Rank Badge Label inside/outside bar
        const labelText = rankVal !== null ? `#${rankVal}` : "Yok";
        g.append("text")
          .attr("x", Math.max(16, barWidth) + 6)
          .attr("y", barY + barHeight / 2 + 3.5)
          .attr("fill", rankVal === 1 ? "#fbbf24" : entity.color)
          .attr("font-size", "10px")
          .attr("font-weight", "800")
          .attr("font-family", "monospace")
          .text(labelText);
      });
    });
  }, [chartData, activeEntityFilter, sortOption, entities, selectedKeywordId]);

  return (
    <div className={`p-5 rounded-3xl bg-slate-950 border border-slate-800 text-white space-y-4 ${className}`}>
      
      {/* Chart Top Controls & Legends */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <BarChart3 className="w-4 h-4" />
            </span>
            <h3 className="text-base font-black text-white tracking-tight">
              D3.js Rakip Anahtar Kelime Sıralama Karşılaştırma Grafiği
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Her bir anahtar kelime için sitenizin ve 3 rakibin Google SERP pozisyonlarının görsel güç kıyaslaması. 
            (Çubuk ne kadar uzunsa, Google sıralaması #1'e o kadar yakındır).
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Entity Quick Filter */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setActiveEntityFilter("all")}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                activeEntityFilter === "all" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Tüm Rakipler
            </button>
            {entities.map((e) => (
              <button
                key={e.key}
                type="button"
                onClick={() => setActiveEntityFilter(e.key)}
                className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                  activeEntityFilter === e.key ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color }} />
                <span>{e.key === "user" ? "Siteniz" : e.label.split("(")[1]?.replace(")", "") || e.key}</span>
              </button>
            ))}
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
            <span>Sırala:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
            >
              <option value="volume" className="bg-slate-900">Aylık Arama Hacmi</option>
              <option value="userRank" className="bg-slate-900">Sitenizin Sırası</option>
              <option value="gap" className="bg-slate-900">Sıralama Farkı (Gap)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Legend Bar */}
      <div className="flex items-center gap-4 flex-wrap text-xs bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800/60">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Lejant:</span>
        {entities.map((e) => (
          <div key={e.key} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm shadow-xs" style={{ backgroundColor: e.color }} />
            <span className="text-slate-300 font-semibold">{e.label}</span>
          </div>
        ))}
        <span className="text-slate-500 ml-auto hidden sm:inline text-[11px]">
          * Detaylı SERP analizini görmek için çubukların üzerine gelin.
        </span>
      </div>

      {/* D3 SVG Container */}
      <div ref={containerRef} className="w-full relative overflow-x-auto min-h-[460px]">
        <svg ref={svgRef} className="w-full h-auto block" />
      </div>

      {/* Floating Tooltip Element */}
      <div
        ref={tooltipRef}
        className="fixed pointer-events-none z-50 p-3 rounded-xl bg-slate-900/95 border border-slate-700 shadow-2xl backdrop-blur-md text-xs max-w-xs transition-opacity duration-150"
        style={{ display: "none" }}
      />
    </div>
  );
};
