import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { MarketShareCompetitorData } from "../../types";
import { ShieldCheck, Info } from "lucide-react";

interface D3DomainAuthorityChartProps {
  profiles: MarketShareCompetitorData[];
  selectedId: string | null;
  onSelectProfile: (id: string | null) => void;
  height?: number;
}

export const D3DomainAuthorityChart: React.FC<D3DomainAuthorityChartProps> = ({
  profiles,
  selectedId,
  onSelectProfile,
  height = 360
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(540);
  const [hoveredProfile, setHoveredProfile] = useState<MarketShareCompetitorData | null>(null);

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

    const margin = { top: 32, right: 36, bottom: 48, left: 140 };
    const width = containerWidth;
    const chartHeight = height;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = chartHeight - margin.top - margin.bottom;

    if (innerWidth <= 40 || innerHeight <= 40) return;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Y Scale: Competitor names
    const yScale = d3
      .scaleBand()
      .domain(profiles.map(d => d.id))
      .range([0, innerHeight])
      .padding(0.28);

    // X Scale: Domain Authority (0 to 100)
    const xScale = d3
      .scaleLinear()
      .domain([0, 100])
      .nice()
      .range([0, innerWidth]);

    // Grid lines
    g.append("g")
      .attr("class", "grid")
      .attr("opacity", 0.08)
      .call(
        d3
          .axisBottom(xScale)
          .tickValues([20, 40, 60, 80, 100])
          .tickSize(innerHeight)
          .tickFormat(() => "")
      )
      .call(g => g.select(".domain").remove());

    // Reference benchmark lines (DA 40 & DA 70)
    [40, 70].forEach(val => {
      const xPos = xScale(val);
      g.append("line")
        .attr("x1", xPos)
        .attr("x2", xPos)
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", val === 70 ? "#ef4444" : "#f59e0b")
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "4,4")
        .attr("opacity", 0.45);

      g.append("text")
        .attr("x", xPos)
        .attr("y", -8)
        .attr("text-anchor", "middle")
        .attr("fill", val === 70 ? "#ef4444" : "#f59e0b")
        .attr("font-size", "10px")
        .attr("font-weight", "600")
        .text(val === 70 ? "DA 70 (Ulusal Lider)" : "DA 40 (Güçlü)");
    });

    // Horizontal Bars for DA
    const barGroups = g
      .selectAll(".da-bar-group")
      .data(profiles)
      .enter()
      .append("g")
      .attr("class", "da-bar-group")
      .attr("cursor", "pointer")
      .on("mouseenter", (event, d) => {
        setHoveredProfile(d as MarketShareCompetitorData);
      })
      .on("mouseleave", () => {
        setHoveredProfile(null);
      })
      .on("click", (event, d) => {
        const item = d as MarketShareCompetitorData;
        onSelectProfile(selectedId === item.id ? null : item.id);
      });

    // Background track (gray 0-100)
    barGroups
      .append("rect")
      .attr("x", 0)
      .attr("y", (d: any) => (yScale(d.id) || 0))
      .attr("width", innerWidth)
      .attr("height", yScale.bandwidth())
      .attr("rx", 6)
      .attr("fill", "#f1f5f9");

    // DA Bar fill
    barGroups
      .append("rect")
      .attr("x", 0)
      .attr("y", (d: any) => (yScale(d.id) || 0))
      .attr("width", 0) // start at 0 for animation
      .attr("height", yScale.bandwidth())
      .attr("rx", 6)
      .attr("fill", (d: any) => {
        if (d.isUser) return "#3b82f6"; // Vibrant primary blue
        if (d.rank === 1) return "#6366f1"; // Leader Indigo
        if (d.rank === 2) return "#06b6d4"; // Specialist Cyan
        return "#64748b"; // Challenger Slate
      })
      .attr("opacity", (d: any) => (selectedId && selectedId !== d.id ? 0.45 : 1))
      .transition()
      .duration(750)
      .ease(d3.easeCubicOut)
      .attr("width", (d: any) => xScale(d.domainAuthority));

    // Page Authority marker / bullet
    barGroups
      .append("line")
      .attr("x1", (d: any) => xScale(d.pageAuthority))
      .attr("x2", (d: any) => xScale(d.pageAuthority))
      .attr("y1", (d: any) => (yScale(d.id) || 0) + 2)
      .attr("y2", (d: any) => (yScale(d.id) || 0) + yScale.bandwidth() - 2)
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 3)
      .attr("stroke-dasharray", "3,2");

    // Value Labels inside or next to bars
    barGroups
      .append("text")
      .attr("x", (d: any) => Math.max(12, xScale(d.domainAuthority) - 10))
      .attr("y", (d: any) => (yScale(d.id) || 0) + yScale.bandwidth() / 2 + 4)
      .attr("text-anchor", "end")
      .attr("fill", "#ffffff")
      .attr("font-size", "12px")
      .attr("font-weight", "700")
      .text((d: any) => `${d.domainAuthority} DA`);

    // Secondary metrics (Referring domains count & Spam)
    barGroups
      .append("text")
      .attr("x", innerWidth - 8)
      .attr("y", (d: any) => (yScale(d.id) || 0) + yScale.bandwidth() / 2 + 4)
      .attr("text-anchor", "end")
      .attr("fill", "#64748b")
      .attr("font-size", "11px")
      .attr("font-weight", "500")
      .text((d: any) => `${d.referringDomains} Kök RD • %${d.spamScore} Spam`);

    // Y Axis Labels (Competitor Names & Badges)
    const yAxis = g
      .append("g")
      .call(
        d3.axisLeft(yScale).tickFormat(id => {
          const p = profiles.find(item => item.id === id);
          if (!p) return "";
          return p.isUser ? `★ ${p.name}` : p.name;
        })
      );

    yAxis.select(".domain").remove();
    yAxis.selectAll(".tick line").remove();
    yAxis
      .selectAll(".tick text")
      .attr("font-size", "12px")
      .attr("font-weight", (id: any) => {
        const p = profiles.find(item => item.id === id);
        return p?.isUser ? "700" : "500";
      })
      .attr("fill", (id: any) => {
        const p = profiles.find(item => item.id === id);
        return p?.isUser ? "#1d4ed8" : "#334155";
      });

    // X Axis
    const xAxis = g
      .append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickValues([0, 20, 40, 60, 80, 100])
          .tickFormat(d => `${d} DA`)
      );

    xAxis.select(".domain").attr("stroke", "#cbd5e1");
    xAxis.selectAll(".tick line").attr("stroke", "#cbd5e1");
    xAxis.selectAll(".tick text").attr("fill", "#64748b").attr("font-size", "11px");
  }, [profiles, containerWidth, height, selectedId, onSelectProfile]);

  return (
    <div ref={containerRef} className="w-full relative flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
            Siteniz
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" />
            Pazar Lideri
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block" />
            Diğer Rakipler
          </span>
        </div>
        <div className="text-xs text-slate-500 flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Kesikli beyaz çizgiler: <strong>Page Authority (PA)</strong></span>
        </div>
      </div>

      <svg ref={svgRef} width={containerWidth} height={height} className="overflow-visible" />

      {/* Floating Hover Tooltip */}
      {hoveredProfile && (
        <div className="absolute top-2 right-2 bg-slate-900/95 text-white text-xs p-3 rounded-lg shadow-xl pointer-events-none z-20 backdrop-blur-sm max-w-xs border border-slate-700">
          <div className="flex items-center justify-between gap-3 mb-1.5 border-b border-slate-800 pb-1">
            <span className="font-bold text-slate-100 flex items-center gap-1">
              {hoveredProfile.isUser ? "★ Siteniz:" : "Rakip:"} {hoveredProfile.name}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded font-mono">
              {hoveredProfile.domain}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-slate-300">
            <div>Domain Otoritesi (DA): <strong className="text-white">{hoveredProfile.domainAuthority}/100</strong></div>
            <div>Sayfa Otoritesi (PA): <strong className="text-white">{hoveredProfile.pageAuthority}/100</strong></div>
            <div>Kök Domain (RD): <strong className="text-white">{hoveredProfile.referringDomains}</strong></div>
            <div>Toplam Backlink: <strong className="text-white">{hoveredProfile.backlinksCount.toLocaleString("tr-TR")}</strong></div>
            <div>Spam Skoru: <strong className={hoveredProfile.spamScore > 5 ? "text-rose-400" : "text-emerald-400"}>%{hoveredProfile.spamScore}</strong></div>
            <div>Pazar Payı: <strong className="text-blue-400">{hoveredProfile.marketShareLabel}</strong></div>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 bg-slate-800/60 p-1.5 rounded">
            {hoveredProfile.keyAdvantage}
          </div>
        </div>
      )}
    </div>
  );
};
