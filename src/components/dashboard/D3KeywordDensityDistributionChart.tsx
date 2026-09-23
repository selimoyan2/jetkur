import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { MarketShareCompetitorData } from "../../types";
import { CompetitorContentCluster } from "../../utils/competitorComparisonEngine";
import { AlertTriangle, CheckCircle2, HelpCircle } from "lucide-react";

interface D3KeywordDensityDistributionChartProps {
  profiles: MarketShareCompetitorData[];
  clusters: CompetitorContentCluster[];
  viewMode?: "scatter" | "clusters";
  height?: number;
}

export const D3KeywordDensityDistributionChart: React.FC<D3KeywordDensityDistributionChartProps> = ({
  profiles,
  clusters,
  viewMode = "scatter",
  height = 360
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(540);
  const [hoveredPoint, setHoveredPoint] = useState<any>(null);

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

  useEffect(() => {
    if (!svgRef.current || profiles.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = containerWidth;
    const chartHeight = height;

    if (viewMode === "scatter") {
      renderScatterPlot(svg, width, chartHeight);
    } else {
      renderClustersChart(svg, width, chartHeight);
    }
  }, [profiles, clusters, viewMode, containerWidth, height]);

  // 1. RENDER KEYWORD DENSITY SCATTER PLOT
  const renderScatterPlot = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    width: number,
    chartHeight: number
  ) => {
    const margin = { top: 32, right: 36, bottom: 48, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = chartHeight - margin.top - margin.bottom;

    if (innerWidth <= 40 || innerHeight <= 40) return;

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // X Scale: Keyword Density % (0% to 5%)
    const xScale = d3.scaleLinear().domain([0.5, 4.8]).range([0, innerWidth]);

    // Y Scale: Top 10 Keywords Count
    const maxKeywords = d3.max(profiles, (d: MarketShareCompetitorData) => d.top10KeywordsCount) ?? 500;
    const yScale = d3
      .scaleLinear()
      .domain([0, Math.ceil(Number(maxKeywords) * 1.25)])
      .nice()
      .range([innerHeight, 0]);

    // Background Shaded Zones:
    // 1) Under-optimized: 0.5% - 1.5%
    g.append("rect")
      .attr("x", xScale(0.5))
      .attr("y", 0)
      .attr("width", xScale(1.5) - xScale(0.5))
      .attr("height", innerHeight)
      .attr("fill", "#fef3c7")
      .attr("opacity", 0.4);

    g.append("text")
      .attr("x", (xScale(0.5) + xScale(1.5)) / 2)
      .attr("y", 16)
      .attr("text-anchor", "middle")
      .attr("fill", "#b45309")
      .attr("font-size", "10px")
      .attr("font-weight", "600")
      .text("Düşük Yoğunluk (<%1.5)");

    // 2) Optimal Zone: 1.5% - 2.6%
    g.append("rect")
      .attr("x", xScale(1.5))
      .attr("y", 0)
      .attr("width", xScale(2.6) - xScale(1.5))
      .attr("height", innerHeight)
      .attr("fill", "#dcfce7")
      .attr("opacity", 0.55);

    g.append("text")
      .attr("x", (xScale(1.5) + xScale(2.6)) / 2)
      .attr("y", 16)
      .attr("text-anchor", "middle")
      .attr("fill", "#15803d")
      .attr("font-size", "10px")
      .attr("font-weight", "700")
      .text("★ İDEAL YOĞUNLUK ALANI (%1.5 - %2.6)");

    // 3) Over-optimized / Keyword Stuffing Risk: > 3.0%
    g.append("rect")
      .attr("x", xScale(3.0))
      .attr("y", 0)
      .attr("width", xScale(4.8) - xScale(3.0))
      .attr("height", innerHeight)
      .attr("fill", "#ffe4e6")
      .attr("opacity", 0.5);

    g.append("text")
      .attr("x", (xScale(3.0) + xScale(4.8)) / 2)
      .attr("y", 16)
      .attr("text-anchor", "middle")
      .attr("fill", "#be123c")
      .attr("font-size", "10px")
      .attr("font-weight", "600")
      .text("Aşırı Yoğunluk (Google Ceza Riski)");

    // Horizontal & Vertical Grid lines
    g.append("g")
      .attr("class", "grid")
      .attr("opacity", 0.08)
      .call(
        d3
          .axisLeft(yScale)
          .ticks(5)
          .tickSize(-innerWidth)
          .tickFormat(() => "")
      )
      .call(g => g.select(".domain").remove());

    // X Axis
    const xAxis = g
      .append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(8)
          .tickFormat(d => `%${d}`)
      );
    xAxis.select(".domain").attr("stroke", "#cbd5e1");
    xAxis.selectAll(".tick line").attr("stroke", "#cbd5e1");
    xAxis.selectAll(".tick text").attr("fill", "#64748b").attr("font-size", "11px");

    // X Axis Title
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 38)
      .attr("text-anchor", "middle")
      .attr("fill", "#475569")
      .attr("font-size", "11px")
      .attr("font-weight", "600")
      .text("Ortalama Anahtar Kelime Yoğunluğu (%)");

    // Y Axis
    const yAxis = g
      .append("g")
      .call(
        d3
          .axisLeft(yScale)
          .ticks(5)
          .tickFormat(d => `${d} kelime`)
      );
    yAxis.select(".domain").attr("stroke", "#cbd5e1");
    yAxis.selectAll(".tick line").attr("stroke", "#cbd5e1");
    yAxis.selectAll(".tick text").attr("fill", "#64748b").attr("font-size", "11px");

    // Bubbles for profiles
    const bubbles = g
      .selectAll(".profile-bubble")
      .data(profiles)
      .enter()
      .append("g")
      .attr("class", "profile-bubble")
      .attr("cursor", "pointer")
      .on("mouseenter", (event, d) => setHoveredPoint(d))
      .on("mouseleave", () => setHoveredPoint(null));

    // Outer glow ring for user site
    bubbles
      .filter((d: any) => Boolean(d.isUser))
      .append("circle")
      .attr("cx", (d: any) => xScale(d.avgKeywordDensityPercent))
      .attr("cy", (d: any) => yScale(d.top10KeywordsCount))
      .attr("r", 28)
      .attr("fill", "#3b82f6")
      .attr("opacity", 0.15);

    // Inner Circle
    bubbles
      .append("circle")
      .attr("cx", (d: any) => xScale(d.avgKeywordDensityPercent))
      .attr("cy", (d: any) => yScale(d.top10KeywordsCount))
      .attr("r", (d: any) => (d.isUser ? 18 : 15))
      .attr("fill", (d: any) => {
        if (d.isUser) return "#2563eb";
        if (d.avgKeywordDensityPercent > 3.0) return "#e11d48"; // risky red
        if (d.rank === 1) return "#4f46e5";
        return "#0284c7";
      })
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2.5);

    // Label on / beside circle
    bubbles
      .append("text")
      .attr("x", (d: any) => xScale(d.avgKeywordDensityPercent))
      .attr("y", (d: any) => yScale(d.top10KeywordsCount) - 22)
      .attr("text-anchor", "middle")
      .attr("fill", (d: any) => (d.isUser ? "#1d4ed8" : "#334155"))
      .attr("font-size", "11px")
      .attr("font-weight", "700")
      .text((d: any) => (d.isUser ? `★ Siteniz (%${d.avgKeywordDensityPercent})` : `${d.name} (%${d.avgKeywordDensityPercent})`));
  };

  // 2. RENDER CLUSTERS DISTRIBUTION CHART
  const renderClustersChart = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    width: number,
    chartHeight: number
  ) => {
    const margin = { top: 24, right: 24, bottom: 64, left: 140 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = chartHeight - margin.top - margin.bottom;

    if (innerWidth <= 40 || innerHeight <= 40) return;

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const yScale = d3
      .scaleBand()
      .domain(clusters.map(c => c.name))
      .range([0, innerHeight])
      .padding(0.3);

    const maxKeywords = d3.max(clusters, (c: CompetitorContentCluster) => Math.max(c.userKeywordCount, c.comp1KeywordCount, c.comp2KeywordCount)) ?? 100;
    const xScale = d3.scaleLinear().domain([0, Number(maxKeywords) * 1.15]).range([0, innerWidth]);

    // Sub-scale for grouped bars (User vs Comp 1 vs Comp 2 vs Comp 3)
    const subGroups = ["user", "comp1", "comp2", "comp3"];
    const ySubScale = d3.scaleBand().domain(subGroups).range([0, yScale.bandwidth()]).padding(0.1);

    clusters.forEach(c => {
      const clusterY = yScale(c.name) || 0;

      // User Bar
      g.append("rect")
        .attr("x", 0)
        .attr("y", clusterY + (ySubScale("user") || 0))
        .attr("width", xScale(c.userKeywordCount))
        .attr("height", ySubScale.bandwidth())
        .attr("rx", 3)
        .attr("fill", "#2563eb")
        .attr("cursor", "pointer")
        .on("mouseenter", () => setHoveredPoint({ cluster: c, role: "user", val: c.userKeywordCount, density: c.userAvgDensity }))
        .on("mouseleave", () => setHoveredPoint(null));

      // Comp 1 (Leader) Bar
      g.append("rect")
        .attr("x", 0)
        .attr("y", clusterY + (ySubScale("comp1") || 0))
        .attr("width", xScale(c.comp1KeywordCount))
        .attr("height", ySubScale.bandwidth())
        .attr("rx", 3)
        .attr("fill", "#6366f1")
        .attr("cursor", "pointer")
        .on("mouseenter", () => setHoveredPoint({ cluster: c, role: "comp1", val: c.comp1KeywordCount, density: c.comp1AvgDensity }))
        .on("mouseleave", () => setHoveredPoint(null));

      // Comp 2 (Specialist) Bar
      g.append("rect")
        .attr("x", 0)
        .attr("y", clusterY + (ySubScale("comp2") || 0))
        .attr("width", xScale(c.comp2KeywordCount))
        .attr("height", ySubScale.bandwidth())
        .attr("rx", 3)
        .attr("fill", "#06b6d4")
        .attr("cursor", "pointer")
        .on("mouseenter", () => setHoveredPoint({ cluster: c, role: "comp2", val: c.comp2KeywordCount, density: c.comp2AvgDensity }))
        .on("mouseleave", () => setHoveredPoint(null));

      // Comp 3 (Challenger) Bar
      g.append("rect")
        .attr("x", 0)
        .attr("y", clusterY + (ySubScale("comp3") || 0))
        .attr("width", xScale(c.comp3KeywordCount))
        .attr("height", ySubScale.bandwidth())
        .attr("rx", 3)
        .attr("fill", "#94a3b8")
        .attr("cursor", "pointer")
        .on("mouseenter", () => setHoveredPoint({ cluster: c, role: "comp3", val: c.comp3KeywordCount, density: c.comp3AvgDensity }))
        .on("mouseleave", () => setHoveredPoint(null));
    });

    // Y Axis (Cluster names)
    const yAxis = g.append("g").call(d3.axisLeft(yScale));
    yAxis.select(".domain").remove();
    yAxis.selectAll(".tick line").remove();
    yAxis.selectAll(".tick text").attr("font-size", "11px").attr("font-weight", "600").attr("fill", "#334155");

    // X Axis
    const xAxis = g
      .append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(6).tickFormat(d => `${d} kelime`));
    xAxis.select(".domain").attr("stroke", "#cbd5e1");
    xAxis.selectAll(".tick text").attr("fill", "#64748b").attr("font-size", "11px");

    // Legend at bottom
    const legend = g.append("g").attr("transform", `translate(0, ${innerHeight + 36})`);
    const legendItems = [
      { label: "Siteniz (Optimal)", color: "#2563eb" },
      { label: "Pazar Lideri", color: "#6366f1" },
      { label: "Uzman Rakip", color: "#06b6d4" },
      { label: "Meydan Okuyan", color: "#94a3b8" }
    ];

    legendItems.forEach((item, i) => {
      const legG = legend.append("g").attr("transform", `translate(${i * 125}, 0)`);
      legG.append("rect").attr("width", 12).attr("height", 12).attr("rx", 3).attr("fill", item.color);
      legG.append("text").attr("x", 16).attr("y", 10).attr("fill", "#475569").attr("font-size", "11px").text(item.label);
    });
  };

  return (
    <div ref={containerRef} className="w-full relative flex flex-col items-center">
      <svg ref={svgRef} width={containerWidth} height={height} className="overflow-visible" />

      {/* Floating Tooltip */}
      {hoveredPoint && (
        <div className="absolute top-2 right-2 bg-slate-900/95 text-white text-xs p-3 rounded-lg shadow-xl pointer-events-none z-20 backdrop-blur-sm max-w-xs border border-slate-700">
          {hoveredPoint.domain ? (
            // Scatter profile hover
            <div>
              <div className="font-bold text-slate-100 mb-1 flex items-center justify-between">
                <span>{hoveredPoint.isUser ? "★ Siteniz:" : "Rakip:"} {hoveredPoint.name}</span>
                <span className="font-mono text-[10px] text-blue-300">{hoveredPoint.domain}</span>
              </div>
              <div className="space-y-1 text-slate-300 text-[11px]">
                <div>Ortalama Yoğunluk: <strong className={hoveredPoint.avgKeywordDensityPercent > 3.0 ? "text-rose-400" : "text-emerald-400"}>%{hoveredPoint.avgKeywordDensityPercent}</strong></div>
                <div>Durum: <strong className="text-white">{hoveredPoint.densityStatus}</strong></div>
                <div>İlk 10'daki Kelimeler: <strong className="text-white">{hoveredPoint.top10KeywordsCount}</strong></div>
                <div>İlk 3'teki Kelimeler: <strong className="text-white">{hoveredPoint.top3KeywordsCount}</strong></div>
                <div>Semantik Kapsama: <strong className="text-white">%{hoveredPoint.semanticCoveragePercent}</strong></div>
              </div>
            </div>
          ) : (
            // Cluster hover
            <div>
              <div className="font-bold text-slate-100 mb-1">{hoveredPoint.cluster?.name}</div>
              <div className="text-slate-300 text-[11px]">
                Hedeflenen Kelime: <strong className="text-white">{hoveredPoint.val} adet</strong>
              </div>
              <div className="text-slate-300 text-[11px]">
                Ort. Yoğunluk: <strong className="text-emerald-400">%{hoveredPoint.density}</strong>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                {hoveredPoint.cluster?.description}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
