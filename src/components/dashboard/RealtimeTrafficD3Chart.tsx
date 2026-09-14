import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import { HourlyTrafficDataPoint } from "../../utils/realtimeTrafficEngine";
import { 
  Users, 
  TrendingUp, 
  Zap, 
  Clock, 
  Activity, 
  Smartphone, 
  Monitor, 
  ArrowUpRight,
  ShieldCheck,
  Sparkles
} from "lucide-react";

export type TrafficChartMetricView = "dual" | "visitors" | "bounce";

interface RealtimeTrafficD3ChartProps {
  data: HourlyTrafficDataPoint[];
  metricView?: TrafficChartMetricView;
  height?: number;
  highlightCurrentHour?: boolean;
  className?: string;
}

interface HoveredTooltipState {
  x: number;
  y: number;
  dataPoint: HourlyTrafficDataPoint;
  isNearRight: boolean;
}

export const RealtimeTrafficD3Chart: React.FC<RealtimeTrafficD3ChartProps> = ({
  data = [],
  metricView = "dual",
  height = 340,
  highlightCurrentHour = true,
  className = ""
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(800);
  const [hoveredPoint, setHoveredPoint] = useState<HoveredTooltipState | null>(null);

  // ResizeObserver for responsive width
  useEffect(() => {
    if (!containerRef.current) return;

    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        if (width > 150) {
          setContainerWidth(width);
        }
      }
    };

    handleResize();

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Main D3 Rendering
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    const isDual = metricView === "dual";
    const showVisitors = metricView === "dual" || metricView === "visitors";
    const showBounce = metricView === "dual" || metricView === "bounce";

    const margin = {
      top: 24,
      right: isDual || metricView === "bounce" ? 54 : 20,
      bottom: 38,
      left: showVisitors ? 52 : 36
    };

    const innerWidth = Math.max(100, containerWidth - margin.left - margin.right);
    const innerHeight = Math.max(100, height - margin.top - margin.bottom);

    // Defs for gradients and glow filters
    const defs = svg.append("defs");

    // Visitors Area Gradient (Indigo)
    const visitorGrad = defs
      .append("linearGradient")
      .attr("id", "trafficVisitorGradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    visitorGrad.append("stop").attr("offset", "0%").attr("stop-color", "#6366f1").attr("stop-opacity", 0.42);
    visitorGrad.append("stop").attr("offset", "75%").attr("stop-color", "#818cf8").attr("stop-opacity", 0.08);
    visitorGrad.append("stop").attr("offset", "100%").attr("stop-color", "#a5b4fc").attr("stop-opacity", 0.0);

    // Bounce Rate Area Gradient (Amber/Rose)
    const bounceGrad = defs
      .append("linearGradient")
      .attr("id", "trafficBounceGradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    bounceGrad.append("stop").attr("offset", "0%").attr("stop-color", "#f59e0b").attr("stop-opacity", 0.28);
    bounceGrad.append("stop").attr("offset", "100%").attr("stop-color", "#f59e0b").attr("stop-opacity", 0.0);

    // Main Chart Group
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // X Scale: Hour timeline
    const xScale = d3
      .scalePoint<string>()
      .domain(data.map((d) => d.hourLabel))
      .range([0, innerWidth])
      .padding(0.15);

    // Y Scales
    // Left Y Scale: Visitors
    const maxVisitors = d3.max(data, (d) => d.visitors) || 100;
    const yVisitorsScale = d3
      .scaleLinear()
      .domain([0, Math.ceil(maxVisitors * 1.18)])
      .range([innerHeight, 0])
      .nice();

    // Right Y Scale: Bounce Rate (%)
    const maxBounce = d3.max(data, (d) => d.bounceRate) || 60;
    const minBounce = Math.max(0, (d3.min(data, (d) => d.bounceRate) || 15) - 6);
    const yBounceScale = d3
      .scaleLinear()
      .domain([minBounce, Math.min(100, Math.ceil(maxBounce * 1.25))])
      .range([innerHeight, 0])
      .nice();

    // Horizontal Grid Lines
    const gridYScale = showVisitors ? yVisitorsScale : yBounceScale;
    const yTicks = gridYScale.ticks(5);

    g.append("g")
      .attr("class", "grid-lines")
      .selectAll("line")
      .data(yTicks)
      .enter()
      .append("line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", (d) => gridYScale(d))
      .attr("y2", (d) => gridYScale(d))
      .attr("stroke", "#e2e8f0")
      .attr("stroke-dasharray", "3,3")
      .attr("stroke-opacity", 0.7);

    // D3 Area & Line Generators
    const visitorArea = d3
      .area<HourlyTrafficDataPoint>()
      .curve(d3.curveMonotoneX)
      .x((d) => xScale(d.hourLabel) || 0)
      .y0(innerHeight)
      .y1((d) => yVisitorsScale(d.visitors));

    const visitorLine = d3
      .line<HourlyTrafficDataPoint>()
      .curve(d3.curveMonotoneX)
      .x((d) => xScale(d.hourLabel) || 0)
      .y((d) => yVisitorsScale(d.visitors));

    const bounceArea = d3
      .area<HourlyTrafficDataPoint>()
      .curve(d3.curveMonotoneX)
      .x((d) => xScale(d.hourLabel) || 0)
      .y0(innerHeight)
      .y1((d) => yBounceScale(d.bounceRate));

    const bounceLine = d3
      .line<HourlyTrafficDataPoint>()
      .curve(d3.curveMonotoneX)
      .x((d) => xScale(d.hourLabel) || 0)
      .y((d) => yBounceScale(d.bounceRate));

    // 1. Draw Visitor Area & Line
    if (showVisitors) {
      g.append("path")
        .datum(data)
        .attr("fill", "url(#trafficVisitorGradient)")
        .attr("d", visitorArea);

      g.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#4f46e5")
        .attr("stroke-width", 2.5)
        .attr("d", visitorLine);
    }

    // 2. Draw Bounce Rate Area (if bounce only) or Line (if dual)
    if (showBounce) {
      if (metricView === "bounce") {
        g.append("path")
          .datum(data)
          .attr("fill", "url(#trafficBounceGradient)")
          .attr("d", bounceArea);
      }

      g.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#d97706") // amber-600
        .attr("stroke-width", 2.2)
        .attr("stroke-dasharray", isDual ? "4,3" : "none")
        .attr("d", bounceLine);

      // Add small dots for bounce rate in dual mode
      g.selectAll(".bounce-dot")
        .data(data.filter((_, i) => i % (data.length > 14 ? 2 : 1) === 0))
        .enter()
        .append("circle")
        .attr("cx", (d) => xScale(d.hourLabel) || 0)
        .attr("cy", (d) => yBounceScale(d.bounceRate))
        .attr("r", 3)
        .attr("fill", "#ffffff")
        .attr("stroke", "#d97706")
        .attr("stroke-width", 1.8);
    }

    // 3. Highlight Current Live Hour
    if (highlightCurrentHour) {
      const currentPoint = data.find((d) => d.isCurrentHour);
      if (currentPoint) {
        const currentX = xScale(currentPoint.hourLabel) || 0;

        // Vertical Live Pulse Line
        g.append("line")
          .attr("x1", currentX)
          .attr("x2", currentX)
          .attr("y1", 0)
          .attr("y2", innerHeight)
          .attr("stroke", "#10b981") // emerald-500
          .attr("stroke-width", 1.8)
          .attr("stroke-dasharray", "3,3");

        // Live Pin Label at top
        const liveBadge = g.append("g").attr("transform", `translate(${currentX}, -14)`);

        liveBadge
          .append("rect")
          .attr("x", -24)
          .attr("y", -2)
          .attr("width", 48)
          .attr("height", 16)
          .attr("rx", 8)
          .attr("fill", "#10b981");

        liveBadge
          .append("text")
          .attr("x", 0)
          .attr("y", 9.5)
          .attr("text-anchor", "middle")
          .attr("fill", "#ffffff")
          .attr("font-size", "9px")
          .attr("font-weight", "bold")
          .text("ŞİMDİ");

        // Glowing dot on the primary line
        if (showVisitors) {
          const cy = yVisitorsScale(currentPoint.visitors);
          g.append("circle")
            .attr("cx", currentX)
            .attr("cy", cy)
            .attr("r", 6)
            .attr("fill", "#10b981")
            .attr("fill-opacity", 0.3)
            .attr("class", "animate-ping");

          g.append("circle")
            .attr("cx", currentX)
            .attr("cy", cy)
            .attr("r", 4.5)
            .attr("fill", "#10b981")
            .attr("stroke", "#ffffff")
            .attr("stroke-width", 1.5);
        }
      }
    }

    // 4. X Axis (Timeline)
    const xAxisGroup = g
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${innerHeight})`);

    // Only display label every 2nd or 3rd hour if width is constrained
    const stepInterval = containerWidth < 450 ? 4 : containerWidth < 680 ? 3 : 2;

    xAxisGroup
      .selectAll(".tick-label")
      .data(data.filter((_, i) => i % stepInterval === 0 || i === data.length - 1))
      .enter()
      .append("text")
      .attr("x", (d) => xScale(d.hourLabel) || 0)
      .attr("y", 22)
      .attr("text-anchor", "middle")
      .attr("fill", (d) => (d.isCurrentHour ? "#059669" : "#64748b"))
      .attr("font-size", (d) => (d.isCurrentHour ? "11px" : "10px"))
      .attr("font-weight", (d) => (d.isCurrentHour ? "bold" : "500"))
      .text((d) => d.hourLabel);

    // 5. Left Y Axis (Visitors)
    if (showVisitors) {
      const yAxisLeft = g.append("g").attr("class", "y-axis-left");

      yAxisLeft
        .selectAll(".tick-label-left")
        .data(yVisitorsScale.ticks(5))
        .enter()
        .append("text")
        .attr("x", -10)
        .attr("y", (d) => yVisitorsScale(d) + 3.5)
        .attr("text-anchor", "end")
        .attr("fill", "#4f46e5")
        .attr("font-size", "10px")
        .attr("font-weight", "600")
        .text((d) => d.toLocaleString("tr-TR"));

      // Left axis title
      yAxisLeft
        .append("text")
        .attr("x", 0)
        .attr("y", -10)
        .attr("text-anchor", "start")
        .attr("fill", "#4f46e5")
        .attr("font-size", "9.5px")
        .attr("font-weight", "bold")
        .text("Ziyaretçi");
    }

    // 6. Right Y Axis (Bounce Rate %)
    if (showBounce) {
      const yAxisRight = g
        .append("g")
        .attr("class", "y-axis-right")
        .attr("transform", `translate(${innerWidth}, 0)`);

      yAxisRight
        .selectAll(".tick-label-right")
        .data(yBounceScale.ticks(5))
        .enter()
        .append("text")
        .attr("x", 10)
        .attr("y", (d) => yBounceScale(d) + 3.5)
        .attr("text-anchor", "start")
        .attr("fill", "#d97706")
        .attr("font-size", "10px")
        .attr("font-weight", "600")
        .text((d) => `%${d}`);

      // Right axis title
      yAxisRight
        .append("text")
        .attr("x", 8)
        .attr("y", -10)
        .attr("text-anchor", "start")
        .attr("fill", "#d97706")
        .attr("font-size", "9.5px")
        .attr("font-weight", "bold")
        .text("Hemen Çıkma %");
    }

    // 7. Interactive Crosshair & Tooltip Overlay
    const crosshairGroup = g.append("g").attr("class", "crosshair").style("display", "none");

    const verticalLine = crosshairGroup
      .append("line")
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", "#334155")
      .attr("stroke-width", 1.2)
      .attr("stroke-dasharray", "4,3");

    const visitorDot = crosshairGroup
      .append("circle")
      .attr("r", 5)
      .attr("fill", "#4f46e5")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2);

    const bounceDot = crosshairGroup
      .append("circle")
      .attr("r", 5)
      .attr("fill", "#d97706")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2);

    // Overlay Rect capturing mouse & touch moves
    g.append("rect")
      .attr("class", "overlay")
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .attr("fill", "transparent")
      .style("cursor", "crosshair")
      .on("mouseenter", () => {
        crosshairGroup.style("display", null);
      })
      .on("mouseleave", () => {
        crosshairGroup.style("display", "none");
        setHoveredPoint(null);
      })
      .on("mousemove", function (event) {
        const [mx, my] = d3.pointer(event, this);

        // Find nearest data point based on x coordinate
        let nearestPoint = data[0];
        let minDistance = Infinity;

        data.forEach((d) => {
          const px = xScale(d.hourLabel) || 0;
          const dist = Math.abs(px - mx);
          if (dist < minDistance) {
            minDistance = dist;
            nearestPoint = d;
          }
        });

        if (nearestPoint) {
          const targetX = xScale(nearestPoint.hourLabel) || 0;
          verticalLine.attr("x1", targetX).attr("x2", targetX);

          if (showVisitors) {
            visitorDot.attr("cx", targetX).attr("cy", yVisitorsScale(nearestPoint.visitors)).style("display", null);
          } else {
            visitorDot.style("display", "none");
          }

          if (showBounce) {
            bounceDot.attr("cx", targetX).attr("cy", yBounceScale(nearestPoint.bounceRate)).style("display", null);
          } else {
            bounceDot.style("display", "none");
          }

          const isNearRight = targetX > innerWidth * 0.65;
          setHoveredPoint({
            x: targetX + margin.left,
            y: my + margin.top,
            dataPoint: nearestPoint,
            isNearRight
          });
        }
      });
  }, [data, metricView, height, containerWidth, highlightCurrentHour]);

  return (
    <div ref={containerRef} className={`relative w-full select-none ${className}`}>
      <svg
        ref={svgRef}
        width="100%"
        height={height}
        className="overflow-visible"
        aria-label="Gerçek zamanlı ziyaretçi ve hemen çıkma D3 grafiği"
      />

      {/* Floating Interactive Tooltip */}
      {hoveredPoint && (
        <div
          className="pointer-events-none absolute z-20 rounded-2xl bg-slate-900/95 p-3.5 text-white shadow-2xl backdrop-blur-md border border-slate-700/80 transition-transform duration-75 text-xs min-w-[240px]"
          style={{
            top: `${Math.max(10, Math.min(height - 180, hoveredPoint.y - 75))}px`,
            left: hoveredPoint.isNearRight
              ? `${Math.max(10, hoveredPoint.x - 260)}px`
              : `${hoveredPoint.x + 18}px`
          }}
        >
          {/* Tooltip Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <div className="flex items-center gap-1.5 font-black text-slate-200">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Saat: {hoveredPoint.dataPoint.hourLabel}</span>
              {hoveredPoint.dataPoint.isCurrentHour && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 text-[9px] font-bold border border-emerald-500/40 animate-pulse">
                  CANLI
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {hoveredPoint.dataPoint.topSource}
            </span>
          </div>

          {/* Metrics List */}
          <div className="space-y-2">
            {/* Visitors & Pageviews */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span>Saatlik Ziyaretçi:</span>
              </div>
              <div className="font-bold text-white font-mono">
                {hoveredPoint.dataPoint.visitors.toLocaleString("tr-TR")}{" "}
                <span className="text-[10px] font-normal text-slate-400">
                  ({hoveredPoint.dataPoint.uniqueVisitors} tekil)
                </span>
              </div>
            </div>

            {/* Bounce Rate & Benchmark */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-300">
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                <span>Hemen Çıkma Oranı:</span>
              </div>
              <div className="flex items-center gap-1 font-bold font-mono">
                <span
                  className={
                    hoveredPoint.dataPoint.bounceRate < 25
                      ? "text-emerald-400"
                      : hoveredPoint.dataPoint.bounceRate < 40
                      ? "text-amber-400"
                      : "text-rose-400"
                  }
                >
                  %{hoveredPoint.dataPoint.bounceRate}
                </span>
                <span className="text-[9px] px-1 rounded bg-slate-800 text-slate-300 font-sans">
                  {hoveredPoint.dataPoint.bounceRate < 25 ? "Mükemmel" : "Normal"}
                </span>
              </div>
            </div>

            {/* Simulated Speed correlation */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Zap className="w-3 h-3 text-emerald-400" />
                <span>Simüle LCP / Hız:</span>
              </div>
              <span className="font-mono text-emerald-300 font-bold">
                {hoveredPoint.dataPoint.lcpSec}s • {hoveredPoint.dataPoint.ttfbMs}ms
              </span>
            </div>

            {/* Device breakdown */}
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <Smartphone className="w-3 h-3 text-slate-400" />
                Mobil: {hoveredPoint.dataPoint.deviceSplit.mobile}
              </span>
              <span className="flex items-center gap-1">
                <Monitor className="w-3 h-3 text-slate-400" />
                Masaüstü: {hoveredPoint.dataPoint.deviceSplit.desktop}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
