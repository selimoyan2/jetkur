import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import { AuthorityCompetitorEntity } from "../../utils/seoAuthorityMatrixEngine";
import {
  TrendingUp,
  Award,
  Globe,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Info
} from "lucide-react";

export type AuthorityChartMode = "multi-column" | "domain-authority" | "backlink-quality" | "organic-traffic";

interface D3SeoAuthorityMatrixChartProps {
  entities: AuthorityCompetitorEntity[];
  activeEntityIds: string[];
  chartMode: AuthorityChartMode;
  simulatedBoosts?: {
    daBoost: number;
    refDomainsBoost: number;
    trafficBoost: number;
  };
  isSimulating?: boolean;
  sectorAvgDa?: number;
}

interface TooltipData {
  x: number;
  y: number;
  entity: AuthorityCompetitorEntity;
  metricLabel: string;
  metricValue: string;
  rawDetails: {
    da: number;
    refDomains: number;
    backlinks: number;
    doFollowPct: number;
    monthlyVisits: number;
    trafficValueUsd: number;
    cwvScore: number;
  };
}

export const D3SeoAuthorityMatrixChart: React.FC<D3SeoAuthorityMatrixChartProps> = ({
  entities,
  activeEntityIds,
  chartMode,
  simulatedBoosts = { daBoost: 0, refDomainsBoost: 0, trafficBoost: 0 },
  isSimulating = false,
  sectorAvgDa = 45.5
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 720, height: 420 });
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  // ResizeObserver for responsive SVG dimensions
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width } = entries[0].contentRect;
      if (width > 0) {
        setDimensions({
          width: Math.max(340, Math.floor(width)),
          height: width < 640 ? 360 : 420
        });
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Filtered active entities
  const visibleEntities = useMemo(() => {
    return entities.filter((e) => activeEntityIds.includes(e.id));
  }, [entities, activeEntityIds]);

  // Max traffic for scaling in multi-column normalized mode
  const maxTraffic = useMemo(() => {
    return Math.max(...entities.map((e) => e.monthlyTraffic.visits), 28000);
  }, [entities]);

  // Max referring domains
  const maxRefDomains = useMemo(() => {
    return Math.max(...entities.map((e) => e.backlinkQuality.referringDomains), 350);
  }, [entities]);

  // Main D3 Render logic
  useEffect(() => {
    if (!svgRef.current || visibleEntities.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // clear prior elements

    const { width, height } = dimensions;
    const margin = {
      top: 45,
      right: width < 600 ? 20 : 35,
      bottom: width < 600 ? 80 : 65,
      left: width < 600 ? 45 : 55
    };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    if (innerWidth <= 0 || innerHeight <= 0) return;

    // Define gradients in defs
    const defs = svg.append("defs");

    // Gradients for each entity
    entities.forEach((entity) => {
      const grad = defs
        .append("linearGradient")
        .attr("id", `auth-grad-${entity.id}`)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%");

      grad
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", entity.color)
        .attr("stop-opacity", 0.95);

      grad
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", entity.secondaryColor || entity.color)
        .attr("stop-opacity", 0.75);

      // Simulation ghost gradient
      const simGrad = defs
        .append("linearGradient")
        .attr("id", `auth-sim-grad-${entity.id}`)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%");

      simGrad
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#38bdf8")
        .attr("stop-opacity", 0.85);

      simGrad
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#0284c7")
        .attr("stop-opacity", 0.4);
    });

    // Main chart group
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Gridlines (horizontal)
    const yGrid = d3.axisLeft(d3.scaleLinear().domain([0, 100]).range([innerHeight, 0]))
      .ticks(5)
      .tickSize(-innerWidth)
      .tickFormat(() => "");

    g.append("g")
      .attr("class", "grid")
      .call(yGrid)
      .selectAll("line")
      .attr("stroke", "#334155")
      .attr("stroke-dasharray", "3 3")
      .attr("stroke-opacity", 0.35);

    g.select(".domain").remove(); // remove axis line for grid

    // X Scale for Entities (Group Band)
    const x0 = d3
      .scaleBand()
      .domain(visibleEntities.map((d) => d.id))
      .rangeRound([0, innerWidth])
      .paddingInner(0.24)
      .paddingOuter(0.12);

    // =========================================================================
    // RENDER BY CHART MODE
    // =========================================================================
    if (chartMode === "multi-column") {
      // 3 clustered sub-bars per entity: [DA (0-100), Backlink Index (0-100), Traffic Index (0-100)]
      const subMetrics = [
        { key: "da", label: "Domain Otoritesi (DA)", color: "#818cf8" },
        { key: "backlink", label: "Backlink Kalite İndeksi", color: "#34d399" },
        { key: "traffic", label: "Aylık Trafik İndeksi", color: "#38bdf8" }
      ];

      const x1 = d3
        .scaleBand()
        .domain(subMetrics.map((m) => m.key))
        .rangeRound([0, x0.bandwidth()])
        .padding(0.15);

      const y = d3.scaleLinear().domain([0, 100]).nice().range([innerHeight, 0]);

      // Y Axis
      const yAxis = d3.axisLeft(y).ticks(5).tickFormat((d) => `${d}`);
      g.append("g")
        .call(yAxis)
        .selectAll("text")
        .attr("fill", "#94a3b8")
        .attr("font-size", "11px")
        .attr("font-weight", "600");

      g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -35)
        .attr("x", -innerHeight / 2)
        .attr("text-anchor", "middle")
        .attr("fill", "#94a3b8")
        .attr("font-size", "11px")
        .attr("font-weight", "700")
        .text("Normalize Edilmiş Otorite Skoru (0 - 100)");

      // Sektör Ortalaması Çizgisi
      const avgY = y(sectorAvgDa);
      g.append("line")
        .attr("x1", 0)
        .attr("x2", innerWidth)
        .attr("y1", avgY)
        .attr("y2", avgY)
        .attr("stroke", "#f59e0b")
        .attr("stroke-width", 1.8)
        .attr("stroke-dasharray", "5 4");

      g.append("text")
        .attr("x", innerWidth - 5)
        .attr("y", avgY - 6)
        .attr("text-anchor", "end")
        .attr("fill", "#f59e0b")
        .attr("font-size", "10px")
        .attr("font-weight", "800")
        .text(`Sektör DA Ortalaması: ${sectorAvgDa}`);

      // Entity Groups
      const entityGroups = g
        .selectAll(".entity-group")
        .data(visibleEntities)
        .enter()
        .append("g")
        .attr("class", "entity-group")
        .attr("transform", (d: AuthorityCompetitorEntity) => `translate(${x0(d.id)},0)`);

      // Sub-bars for each metric
      entityGroups.each(function (this: SVGGElement, entity: AuthorityCompetitorEntity) {
        const group = d3.select(this);

        // Normalize values
        let daVal = entity.domainAuthority;
        let blVal = Math.min(100, Math.round((entity.backlinkQuality.referringDomains / maxRefDomains) * 100));
        let trVal = Math.min(100, Math.round((entity.monthlyTraffic.visits / maxTraffic) * 100));

        // Simulated boosts if user entity
        if (entity.isUser && isSimulating) {
          daVal = Math.min(100, daVal + simulatedBoosts.daBoost);
          const simRefDomains = entity.backlinkQuality.referringDomains + simulatedBoosts.refDomainsBoost;
          blVal = Math.min(100, Math.round((simRefDomains / maxRefDomains) * 100));
          const simVisits = entity.monthlyTraffic.visits + simulatedBoosts.trafficBoost;
          trVal = Math.min(100, Math.round((simVisits / maxTraffic) * 100));
        }

        const metricData = [
          {
            key: "da",
            label: "Domain Otoritesi (DA)",
            val: daVal,
            rawVal: entity.domainAuthority,
            simulatedVal: entity.isUser && isSimulating ? daVal : undefined,
            color: entity.isUser ? "#6366f1" : entity.color
          },
          {
            key: "backlink",
            label: "Referans Domain İndeksi",
            val: blVal,
            rawVal: entity.backlinkQuality.referringDomains,
            simulatedVal: entity.isUser && isSimulating ? blVal : undefined,
            color: "#10b981"
          },
          {
            key: "traffic",
            label: "Aylık Organik Trafik İndeksi",
            val: trVal,
            rawVal: entity.monthlyTraffic.visits,
            simulatedVal: entity.isUser && isSimulating ? trVal : undefined,
            color: "#06b6d4"
          }
        ];

        // Draw sub-bars with animated transition
        group
          .selectAll(".sub-bar")
          .data(metricData)
          .enter()
          .append("rect")
          .attr("class", "sub-bar")
          .attr("x", (m: any) => x1(m.key) || 0)
          .attr("width", x1.bandwidth())
          .attr("y", innerHeight)
          .attr("height", 0)
          .attr("rx", 4)
          .attr("ry", 4)
          .attr("fill", (m: any) => m.color)
          .attr("cursor", "pointer")
          .attr("opacity", entity.isUser ? 1 : 0.85)
          .attr("stroke", entity.isUser ? "#c7d2fe" : "none")
          .attr("stroke-width", entity.isUser ? 1.5 : 0)
          .on("mouseenter", (event: MouseEvent, m: any) => {
            const rect = containerRef.current?.getBoundingClientRect();
            const posX = event.clientX - (rect?.left || 0);
            const posY = event.clientY - (rect?.top || 0);

            let valueStr = "";
            if (m.key === "da") valueStr = `DA ${m.simulatedVal || m.rawVal} / 100`;
            else if (m.key === "backlink") valueStr = `${m.rawVal} Ref Domain (${entity.backlinkQuality.totalBacklinks.toLocaleString("tr-TR")} Backlink)`;
            else valueStr = `${entity.monthlyTraffic.visits.toLocaleString("tr-TR")} Ziyaretçi / ay`;

            setTooltip({
              x: posX,
              y: posY,
              entity,
              metricLabel: m.label,
              metricValue: valueStr,
              rawDetails: {
                da: entity.domainAuthority,
                refDomains: entity.backlinkQuality.referringDomains,
                backlinks: entity.backlinkQuality.totalBacklinks,
                doFollowPct: entity.backlinkQuality.doFollowRatio,
                monthlyVisits: entity.monthlyTraffic.visits,
                trafficValueUsd: entity.monthlyTraffic.trafficValueUsd,
                cwvScore: entity.monthlyTraffic.cwvPerformanceScore
              }
            });
          })
          .on("mouseleave", () => setTooltip(null))
          .transition()
          .duration(750)
          .ease(d3.easeCubicOut)
          .attr("y", (m: any) => y(m.val))
          .attr("height", (m: any) => innerHeight - y(m.val));

        // Value text labels above sub-bars
        group
          .selectAll(".sub-bar-label")
          .data(metricData)
          .enter()
          .append("text")
          .attr("class", "sub-bar-label")
          .attr("x", (m: any) => (x1(m.key) || 0) + x1.bandwidth() / 2)
          .attr("y", (m: any) => y(m.val) - 5)
          .attr("text-anchor", "middle")
          .attr("fill", "#cbd5e1")
          .attr("font-size", width < 600 ? "9px" : "10px")
          .attr("font-weight", "700")
          .text((m: any) => Math.round(m.val));
      });
    } else if (chartMode === "domain-authority") {
      // Single focused DA comparison
      const y = d3.scaleLinear().domain([0, 80]).nice().range([innerHeight, 0]);

      // Y Axis
      const yAxis = d3.axisLeft(y).ticks(5).tickFormat((d) => `DA ${d}`);
      g.append("g")
        .call(yAxis)
        .selectAll("text")
        .attr("fill", "#94a3b8")
        .attr("font-size", "11px")
        .attr("font-weight", "600");

      // Sektör Ortalaması Çizgisi
      const avgY = y(sectorAvgDa);
      g.append("line")
        .attr("x1", 0)
        .attr("x2", innerWidth)
        .attr("y1", avgY)
        .attr("y2", avgY)
        .attr("stroke", "#f59e0b")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "4 4");

      g.append("text")
        .attr("x", innerWidth - 5)
        .attr("y", avgY - 6)
        .attr("text-anchor", "end")
        .attr("fill", "#f59e0b")
        .attr("font-size", "10px")
        .attr("font-weight", "800")
        .text(`Sektör Ortalaması: DA ${sectorAvgDa}`);

      // Bars
      g.selectAll<SVGRectElement, AuthorityCompetitorEntity>(".bar-da")
        .data(visibleEntities)
        .enter()
        .append("rect")
        .attr("class", "bar-da")
        .attr("x", (d: AuthorityCompetitorEntity) => x0(d.id) || 0)
        .attr("width", x0.bandwidth())
        .attr("y", innerHeight)
        .attr("height", 0)
        .attr("rx", 6)
        .attr("ry", 6)
        .attr("fill", (d: AuthorityCompetitorEntity) => `url(#auth-grad-${d.id})`)
        .attr("stroke", (d: AuthorityCompetitorEntity) => (d.isUser ? "#a5b4fc" : "none"))
        .attr("stroke-width", (d: AuthorityCompetitorEntity) => (d.isUser ? 2 : 0))
        .attr("cursor", "pointer")
        .on("mouseenter", (event: MouseEvent, d: AuthorityCompetitorEntity) => {
          const rect = containerRef.current?.getBoundingClientRect();
          setTooltip({
            x: event.clientX - (rect?.left || 0),
            y: event.clientY - (rect?.top || 0),
            entity: d,
            metricLabel: "Alan Adı Otoritesi (Moz DA)",
            metricValue: `DA ${d.domainAuthority} (DR ${d.domainRating})`,
            rawDetails: {
              da: d.domainAuthority,
              refDomains: d.backlinkQuality.referringDomains,
              backlinks: d.backlinkQuality.totalBacklinks,
              doFollowPct: d.backlinkQuality.doFollowRatio,
              monthlyVisits: d.monthlyTraffic.visits,
              trafficValueUsd: d.monthlyTraffic.trafficValueUsd,
              cwvScore: d.monthlyTraffic.cwvPerformanceScore
            }
          });
        })
        .on("mouseleave", () => setTooltip(null))
        .transition()
        .duration(700)
        .ease(d3.easeCubicOut)
        .attr("y", (d: AuthorityCompetitorEntity) => y(d.domainAuthority))
        .attr("height", (d: AuthorityCompetitorEntity) => innerHeight - y(d.domainAuthority));

      // Value label
      g.selectAll<SVGTextElement, AuthorityCompetitorEntity>(".bar-label-da")
        .data(visibleEntities)
        .enter()
        .append("text")
        .attr("class", "bar-label-da")
        .attr("x", (d: AuthorityCompetitorEntity) => (x0(d.id) || 0) + x0.bandwidth() / 2)
        .attr("y", (d: AuthorityCompetitorEntity) => y(d.domainAuthority) - 8)
        .attr("text-anchor", "middle")
        .attr("fill", "#f8fafc")
        .attr("font-size", "12px")
        .attr("font-weight", "800")
        .text((d: AuthorityCompetitorEntity) => `DA ${d.domainAuthority}`);
    } else if (chartMode === "backlink-quality") {
      // Referring Domains comparison
      const y = d3.scaleLinear().domain([0, maxRefDomains * 1.15]).nice().range([innerHeight, 0]);

      // Y Axis
      const yAxis = d3.axisLeft(y).ticks(5).tickFormat((d) => `${d} Ref`);
      g.append("g")
        .call(yAxis)
        .selectAll("text")
        .attr("fill", "#94a3b8")
        .attr("font-size", "11px")
        .attr("font-weight", "600");

      g.selectAll<SVGRectElement, AuthorityCompetitorEntity>(".bar-bl")
        .data(visibleEntities)
        .enter()
        .append("rect")
        .attr("class", "bar-bl")
        .attr("x", (d: AuthorityCompetitorEntity) => x0(d.id) || 0)
        .attr("width", x0.bandwidth())
        .attr("y", innerHeight)
        .attr("height", 0)
        .attr("rx", 6)
        .attr("ry", 6)
        .attr("fill", (d: AuthorityCompetitorEntity) => d.color)
        .attr("cursor", "pointer")
        .on("mouseenter", (event: MouseEvent, d: AuthorityCompetitorEntity) => {
          const rect = containerRef.current?.getBoundingClientRect();
          setTooltip({
            x: event.clientX - (rect?.left || 0),
            y: event.clientY - (rect?.top || 0),
            entity: d,
            metricLabel: "Referans Domain & Backlinkler",
            metricValue: `${d.backlinkQuality.referringDomains} Ref Domain / ${d.backlinkQuality.totalBacklinks.toLocaleString("tr-TR")} Backlink (%${d.backlinkQuality.doFollowRatio} DoFollow)`,
            rawDetails: {
              da: d.domainAuthority,
              refDomains: d.backlinkQuality.referringDomains,
              backlinks: d.backlinkQuality.totalBacklinks,
              doFollowPct: d.backlinkQuality.doFollowRatio,
              monthlyVisits: d.monthlyTraffic.visits,
              trafficValueUsd: d.monthlyTraffic.trafficValueUsd,
              cwvScore: d.monthlyTraffic.cwvPerformanceScore
            }
          });
        })
        .on("mouseleave", () => setTooltip(null))
        .transition()
        .duration(700)
        .ease(d3.easeCubicOut)
        .attr("y", (d: AuthorityCompetitorEntity) => y(d.backlinkQuality.referringDomains))
        .attr("height", (d: AuthorityCompetitorEntity) => innerHeight - y(d.backlinkQuality.referringDomains));

      // Value label
      g.selectAll<SVGTextElement, AuthorityCompetitorEntity>(".bar-label-bl")
        .data(visibleEntities)
        .enter()
        .append("text")
        .attr("class", "bar-label-bl")
        .attr("x", (d: AuthorityCompetitorEntity) => (x0(d.id) || 0) + x0.bandwidth() / 2)
        .attr("y", (d: AuthorityCompetitorEntity) => y(d.backlinkQuality.referringDomains) - 8)
        .attr("text-anchor", "middle")
        .attr("fill", "#f8fafc")
        .attr("font-size", "11px")
        .attr("font-weight", "800")
        .text((d: AuthorityCompetitorEntity) => `${d.backlinkQuality.referringDomains} RD`);
    } else if (chartMode === "organic-traffic") {
      // Monthly organic visits comparison
      const y = d3.scaleLinear().domain([0, maxTraffic * 1.15]).nice().range([innerHeight, 0]);

      // Y Axis
      const yAxis = d3.axisLeft(y).ticks(5).tickFormat((d) => `${Math.round(Number(d) / 1000)}K`);
      g.append("g")
        .call(yAxis)
        .selectAll("text")
        .attr("fill", "#94a3b8")
        .attr("font-size", "11px")
        .attr("font-weight", "600");

      g.selectAll<SVGRectElement, AuthorityCompetitorEntity>(".bar-traffic")
        .data(visibleEntities)
        .enter()
        .append("rect")
        .attr("class", "bar-traffic")
        .attr("x", (d: AuthorityCompetitorEntity) => x0(d.id) || 0)
        .attr("width", x0.bandwidth())
        .attr("y", innerHeight)
        .attr("height", 0)
        .attr("rx", 6)
        .attr("ry", 6)
        .attr("fill", (d: AuthorityCompetitorEntity) => d.color)
        .attr("cursor", "pointer")
        .on("mouseenter", (event: MouseEvent, d: AuthorityCompetitorEntity) => {
          const rect = containerRef.current?.getBoundingClientRect();
          setTooltip({
            x: event.clientX - (rect?.left || 0),
            y: event.clientY - (rect?.top || 0),
            entity: d,
            metricLabel: "Aylık Organik Ziyaretçi",
            metricValue: `${d.monthlyTraffic.visits.toLocaleString("tr-TR")} Ziyaretçi (Değer: $${d.monthlyTraffic.trafficValueUsd.toLocaleString("tr-TR")})`,
            rawDetails: {
              da: d.domainAuthority,
              refDomains: d.backlinkQuality.referringDomains,
              backlinks: d.backlinkQuality.totalBacklinks,
              doFollowPct: d.backlinkQuality.doFollowRatio,
              monthlyVisits: d.monthlyTraffic.visits,
              trafficValueUsd: d.monthlyTraffic.trafficValueUsd,
              cwvScore: d.monthlyTraffic.cwvPerformanceScore
            }
          });
        })
        .on("mouseleave", () => setTooltip(null))
        .transition()
        .duration(700)
        .ease(d3.easeCubicOut)
        .attr("y", (d: AuthorityCompetitorEntity) => y(d.monthlyTraffic.visits))
        .attr("height", (d: AuthorityCompetitorEntity) => innerHeight - y(d.monthlyTraffic.visits));

      // Value label
      g.selectAll<SVGTextElement, AuthorityCompetitorEntity>(".bar-label-traffic")
        .data(visibleEntities)
        .enter()
        .append("text")
        .attr("class", "bar-label-traffic")
        .attr("x", (d: AuthorityCompetitorEntity) => (x0(d.id) || 0) + x0.bandwidth() / 2)
        .attr("y", (d: AuthorityCompetitorEntity) => y(d.monthlyTraffic.visits) - 8)
        .attr("text-anchor", "middle")
        .attr("fill", "#f8fafc")
        .attr("font-size", "11px")
        .attr("font-weight", "800")
        .text((d: AuthorityCompetitorEntity) => `${(d.monthlyTraffic.visits / 1000).toFixed(1)}K`);
    }

    // =========================================================================
    // X AXIS LABELS (Company names & badges)
    // =========================================================================
    const xAxisGroup = g
      .append("g")
      .attr("transform", `translate(0,${innerHeight})`);

    visibleEntities.forEach((entity) => {
      const xPos = (x0(entity.id) || 0) + x0.bandwidth() / 2;
      const textGroup = xAxisGroup.append("g").attr("transform", `translate(${xPos}, 15)`);

      // Indicator circle / dot
      textGroup
        .append("circle")
        .attr("cx", 0)
        .attr("cy", 4)
        .attr("r", 4)
        .attr("fill", entity.color);

      // Name label
      textGroup
        .append("text")
        .attr("x", 0)
        .attr("y", 18)
        .attr("text-anchor", "middle")
        .attr("fill", entity.isUser ? "#a5b4fc" : "#e2e8f0")
        .attr("font-size", width < 600 ? "10px" : "11px")
        .attr("font-weight", entity.isUser ? "800" : "600")
        .text(entity.name.length > 18 ? entity.name.slice(0, 16) + "..." : entity.name);

      // Badge / Domain label
      textGroup
        .append("text")
        .attr("x", 0)
        .attr("y", 32)
        .attr("text-anchor", "middle")
        .attr("fill", "#64748b")
        .attr("font-size", "9px")
        .attr("font-weight", "500")
        .text(entity.domain);
    });

  }, [visibleEntities, chartMode, dimensions, isSimulating, simulatedBoosts, sectorAvgDa, maxTraffic, maxRefDomains, entities]);

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden select-none">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        className="w-full h-auto"
        style={{ minHeight: dimensions.height }}
      />

      {/* Interactive Tooltip Overlay */}
      {tooltip && (
        <div
          className="absolute z-30 pointer-events-none transition-all duration-150 transform -translate-x-1/2 -translate-y-full"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y - 12}px`
          }}
        >
          <div className="bg-slate-950/95 text-white border border-slate-700/80 rounded-2xl p-4 shadow-2xl backdrop-blur-md min-w-[280px] space-y-2.5">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: tooltip.entity.color }}
                />
                <span className="font-black text-xs text-white">
                  {tooltip.entity.name}
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                {tooltip.entity.badge}
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-bold text-slate-400">
                {tooltip.metricLabel}
              </div>
              <div className="text-sm font-black text-emerald-400">
                {tooltip.metricValue}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800 text-[11px]">
              <div>
                <span className="text-slate-400">Alan Adı Otoritesi:</span>
                <span className="font-bold text-white ml-1">DA {tooltip.rawDetails.da}</span>
              </div>
              <div>
                <span className="text-slate-400">Ref Domain:</span>
                <span className="font-bold text-cyan-300 ml-1">{tooltip.rawDetails.refDomains}</span>
              </div>
              <div>
                <span className="text-slate-400">DoFollow Oranı:</span>
                <span className="font-bold text-emerald-400 ml-1">%{tooltip.rawDetails.doFollowPct}</span>
              </div>
              <div>
                <span className="text-slate-400">Aylık Ziyaret:</span>
                <span className="font-bold text-amber-300 ml-1">{tooltip.rawDetails.monthlyVisits.toLocaleString("tr-TR")}</span>
              </div>
            </div>

            {tooltip.entity.isUser && (
              <div className="p-2 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-[10px] text-indigo-200">
                <span className="font-bold text-indigo-300">Stratejik Hedef:</span> 0.02s hız avantajıyla 90 günde pazar liderini yakalama potansiyeli.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
