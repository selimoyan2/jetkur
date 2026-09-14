import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { DailyForecastDataPoint, ForecastingScenario } from "../../types";
import { 
  TrendingUp, 
  Calendar, 
  Activity, 
  Sparkles, 
  Users, 
  PhoneCall, 
  ShieldCheck,
  Zap,
  DollarSign
} from "lucide-react";

export type ForecastChartMetric = "visitors" | "conversions" | "revenue" | "combined";

interface PerformanceForecasterD3ChartProps {
  data: DailyForecastDataPoint[];
  scenario?: ForecastingScenario;
  metric?: ForecastChartMetric;
  height?: number;
  className?: string;
}

interface HoverState {
  x: number;
  y: number;
  point: DailyForecastDataPoint;
  isNearRight: boolean;
}

export const PerformanceForecasterD3Chart: React.FC<PerformanceForecasterD3ChartProps> = ({
  data = [],
  scenario = "realistic",
  metric = "visitors",
  height = 360,
  className = ""
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(750);
  const [hoveredState, setHoveredState] = useState<HoverState | null>(null);

  // ResizeObserver for responsive width
  useEffect(() => {
    if (!containerRef.current) return;

    const updateWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        if (width > 120) {
          setContainerWidth(width);
        }
      }
    };

    updateWidth();
    const observer = new ResizeObserver(() => updateWidth());
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  // Main D3 Rendering
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous drawing

    const width = containerWidth;
    const margin = { 
      top: 32, 
      right: metric === "combined" ? 54 : 32, 
      bottom: 40, 
      left: 54 
    };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    if (innerWidth <= 0 || innerHeight <= 0) return;

    // Separate historical (-29 to 0) and forecast (0 to 30)
    // We include day 0 in both so the lines seamlessly connect
    const historicalPoints = data.filter(d => d.dayIndex <= 0);
    const forecastPoints = data.filter(d => d.dayIndex >= 0);

    // Scales
    const xScale = d3.scaleLinear()
      .domain([-29, 30])
      .range([margin.left, width - margin.right]);

    // Primary Y Scale
    let yMax = 100;
    if (metric === "visitors" || metric === "combined") {
      const maxVisUpper = d3.max(data, d => d.visitorsUpperBound) || 200;
      yMax = Math.ceil(maxVisUpper * 1.15);
    } else if (metric === "conversions") {
      const maxConvUpper = d3.max(data, d => d.conversionsUpperBound) || 20;
      yMax = Math.ceil(maxConvUpper * 1.25);
    } else if (metric === "revenue") {
      const maxRev = d3.max(data, d => d.estimatedRevenue) || 50000;
      yMax = Math.ceil(maxRev * 1.2);
    }

    const yScale = d3.scaleLinear()
      .domain([0, yMax])
      .range([height - margin.bottom, margin.top]);

    // Secondary Y Scale (only for combined: conversions)
    const maxConversions = (d3.max(data, d => d.conversionsUpperBound) || 15);
    const yScaleRight = d3.scaleLinear()
      .domain([0, Math.ceil(maxConversions * 1.3)])
      .range([height - margin.bottom, margin.top]);

    // Defs & Gradients
    const defs = svg.append("defs");

    // Historical Area Gradient (Indigo / Slate)
    const histGradient = defs.append("linearGradient")
      .attr("id", "hist-gradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "0%").attr("y2", "100%");
    histGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#6366f1")
      .attr("stop-opacity", 0.35);
    histGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#6366f1")
      .attr("stop-opacity", 0.02);

    // Forecast Confidence Interval Gradient (Emerald / Cyan)
    const ciGradient = defs.append("linearGradient")
      .attr("id", "ci-gradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "0%").attr("y2", "100%");
    ciGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#10b981")
      .attr("stop-opacity", 0.28);
    ciGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#06b6d4")
      .attr("stop-opacity", 0.08);

    // Forecast Area Gradient
    const forecastAreaGrad = defs.append("linearGradient")
      .attr("id", "forecast-area-grad")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "0%").attr("y2", "100%");
    forecastAreaGrad.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#10b981")
      .attr("stop-opacity", 0.20);
    forecastAreaGrad.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#10b981")
      .attr("stop-opacity", 0.01);

    // 1. Grid lines (Horizontal)
    const yTicks = yScale.ticks(6);
    svg.append("g")
      .attr("class", "grid-lines")
      .selectAll("line")
      .data(yTicks)
      .enter()
      .append("line")
      .attr("x1", margin.left)
      .attr("x2", width - margin.right)
      .attr("y1", d => yScale(d))
      .attr("y2", d => yScale(d))
      .attr("stroke", "#e2e8f0")
      .attr("stroke-dasharray", "3,3")
      .attr("stroke-width", 1);

    // 2. "Forecast Zone" Background Tint (Days 1 to 30)
    const todayX = xScale(0);
    svg.append("rect")
      .attr("x", todayX)
      .attr("y", margin.top)
      .attr("width", width - margin.right - todayX)
      .attr("height", innerHeight)
      .attr("fill", "#f0fdf4")
      .attr("opacity", 0.45);

    // 3. Confidence Interval Band (Only for Forecast Period & Visitors or Combined)
    if (metric === "visitors" || metric === "combined") {
      const ciArea = d3.area<DailyForecastDataPoint>()
        .curve(d3.curveMonotoneX)
        .x(d => xScale(d.dayIndex))
        .y0(d => yScale(d.visitorsLowerBound))
        .y1(d => yScale(d.visitorsUpperBound));

      svg.append("path")
        .datum(forecastPoints)
        .attr("class", "confidence-interval-area")
        .attr("fill", "url(#ci-gradient)")
        .attr("d", ciArea);

      // Border lines for CI band
      const upperLine = d3.line<DailyForecastDataPoint>()
        .curve(d3.curveMonotoneX)
        .x(d => xScale(d.dayIndex))
        .y(d => yScale(d.visitorsUpperBound));

      const lowerLine = d3.line<DailyForecastDataPoint>()
        .curve(d3.curveMonotoneX)
        .x(d => xScale(d.dayIndex))
        .y(d => yScale(d.visitorsLowerBound));

      svg.append("path")
        .datum(forecastPoints)
        .attr("fill", "none")
        .attr("stroke", "#10b981")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "2,2")
        .attr("opacity", 0.45)
        .attr("d", upperLine);

      svg.append("path")
        .datum(forecastPoints)
        .attr("fill", "none")
        .attr("stroke", "#10b981")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "2,2")
        .attr("opacity", 0.45)
        .attr("d", lowerLine);
    }

    // 4. Historical Area & Line
    let getMetricVal = (d: DailyForecastDataPoint) => d.visitors;
    if (metric === "conversions") getMetricVal = (d: DailyForecastDataPoint) => d.conversions;
    if (metric === "revenue") getMetricVal = (d: DailyForecastDataPoint) => d.estimatedRevenue;

    const histArea = d3.area<DailyForecastDataPoint>()
      .curve(d3.curveMonotoneX)
      .x(d => xScale(d.dayIndex))
      .y0(yScale(0))
      .y1(d => yScale(getMetricVal(d)));

    svg.append("path")
      .datum(historicalPoints)
      .attr("class", "hist-area")
      .attr("fill", "url(#hist-gradient)")
      .attr("d", histArea);

    const histLine = d3.line<DailyForecastDataPoint>()
      .curve(d3.curveMonotoneX)
      .x(d => xScale(d.dayIndex))
      .y(d => yScale(getMetricVal(d)));

    svg.append("path")
      .datum(historicalPoints)
      .attr("class", "hist-line")
      .attr("fill", "none")
      .attr("stroke", "#4f46e5") // indigo-600
      .attr("stroke-width", 2.5)
      .attr("d", histLine);

    // 5. Forecast Area & Glowing Dashed Line
    const forecastArea = d3.area<DailyForecastDataPoint>()
      .curve(d3.curveMonotoneX)
      .x(d => xScale(d.dayIndex))
      .y0(yScale(0))
      .y1(d => yScale(getMetricVal(d)));

    svg.append("path")
      .datum(forecastPoints)
      .attr("class", "forecast-area")
      .attr("fill", "url(#forecast-area-grad)")
      .attr("d", forecastArea);

    const forecastLine = d3.line<DailyForecastDataPoint>()
      .curve(d3.curveMonotoneX)
      .x(d => xScale(d.dayIndex))
      .y(d => yScale(getMetricVal(d)));

    svg.append("path")
      .datum(forecastPoints)
      .attr("class", "forecast-line")
      .attr("fill", "none")
      .attr("stroke", "#059669") // emerald-600
      .attr("stroke-width", 2.8)
      .attr("stroke-dasharray", "6,4")
      .attr("d", forecastLine);

    // 6. If Metric is Combined: Render Secondary Conversions Curve (Amber/Coral)
    if (metric === "combined") {
      const convHistLine = d3.line<DailyForecastDataPoint>()
        .curve(d3.curveMonotoneX)
        .x(d => xScale(d.dayIndex))
        .y(d => yScaleRight(d.conversions));

      svg.append("path")
        .datum(historicalPoints)
        .attr("fill", "none")
        .attr("stroke", "#f59e0b") // amber-500
        .attr("stroke-width", 2)
        .attr("d", convHistLine);

      const convForecastLine = d3.line<DailyForecastDataPoint>()
        .curve(d3.curveMonotoneX)
        .x(d => xScale(d.dayIndex))
        .y(d => yScaleRight(d.conversions));

      svg.append("path")
        .datum(forecastPoints)
        .attr("fill", "none")
        .attr("stroke", "#d97706") // amber-600
        .attr("stroke-width", 2.2)
        .attr("stroke-dasharray", "4,3")
        .attr("d", convForecastLine);
    }

    // 7. Dividing "BUGÜN (NOW)" Line & Badge
    svg.append("line")
      .attr("x1", todayX)
      .attr("x2", todayX)
      .attr("y1", margin.top - 8)
      .attr("y2", height - margin.bottom)
      .attr("stroke", "#0f172a")
      .attr("stroke-width", 1.8)
      .attr("stroke-dasharray", "4,4")
      .attr("opacity", 0.65);

    // Today Indicator Badge
    const badgeG = svg.append("g")
      .attr("transform", `translate(${todayX}, ${margin.top - 12})`);
    
    badgeG.append("rect")
      .attr("x", -28)
      .attr("y", -14)
      .attr("width", 56)
      .attr("height", 20)
      .attr("rx", 6)
      .attr("fill", "#0f172a")
      .attr("opacity", 0.9);

    badgeG.append("text")
      .attr("text-anchor", "middle")
      .attr("y", 0)
      .attr("fill", "#ffffff")
      .attr("font-size", "10px")
      .attr("font-weight", "700")
      .text("BUGÜN");

    // 8. X Axis (Dates)
    // Pick ~7-8 representative ticks
    const xTickIndices = [-28, -21, -14, -7, 0, 7, 14, 21, 28];
    const xAxisG = svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height - margin.bottom})`);

    xAxisG.selectAll(".tick-label")
      .data(xTickIndices)
      .enter()
      .append("text")
      .attr("x", d => xScale(d))
      .attr("y", 18)
      .attr("text-anchor", "middle")
      .attr("fill", d => d === 0 ? "#0f172a" : d > 0 ? "#059669" : "#64748b")
      .attr("font-size", "11px")
      .attr("font-weight", d => d === 0 ? "800" : "600")
      .text(d => {
        const pt = data.find(p => p.dayIndex === d);
        if (!pt) return "";
        return d === 0 ? "Bugün" : pt.formattedDate;
      });

    // 9. Y Axis (Left)
    const yAxisG = svg.append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${margin.left}, 0)`);

    yAxisG.selectAll(".y-label")
      .data(yTicks)
      .enter()
      .append("text")
      .attr("x", -10)
      .attr("y", d => yScale(d) + 4)
      .attr("text-anchor", "end")
      .attr("fill", "#64748b")
      .attr("font-size", "11px")
      .attr("font-weight", "600")
      .text(d => {
        if (metric === "revenue") {
          return d >= 1000 ? `₺${(d / 1000).toFixed(0)}k` : `₺${d}`;
        }
        return d.toLocaleString("tr-TR");
      });

    // 10. Y Axis (Right - if Combined)
    if (metric === "combined") {
      const rightTicks = yScaleRight.ticks(5);
      const rightAxisG = svg.append("g")
        .attr("class", "y-axis-right")
        .attr("transform", `translate(${width - margin.right}, 0)`);

      rightAxisG.selectAll(".y-right-label")
        .data(rightTicks)
        .enter()
        .append("text")
        .attr("x", 10)
        .attr("y", d => yScaleRight(d) + 4)
        .attr("text-anchor", "start")
        .attr("fill", "#d97706")
        .attr("font-size", "11px")
        .attr("font-weight", "700")
        .text(d => `${d} dön.`);
    }

    // 11. Interactive Mouse Tracking Overlay
    const overlay = svg.append("rect")
      .attr("class", "overlay")
      .attr("x", margin.left)
      .attr("y", margin.top)
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .attr("fill", "transparent")
      .attr("cursor", "crosshair");

    // Focus indicators (vertical line & dots)
    const focusLine = svg.append("line")
      .attr("class", "focus-line")
      .attr("stroke", "#334155")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "3,3")
      .attr("opacity", 0);

    const focusCircle = svg.append("circle")
      .attr("class", "focus-circle")
      .attr("r", 5.5)
      .attr("fill", "#ffffff")
      .attr("stroke", "#4f46e5")
      .attr("stroke-width", 2.5)
      .attr("opacity", 0);

    const focusSecondaryCircle = svg.append("circle")
      .attr("class", "focus-secondary-circle")
      .attr("r", 4.5)
      .attr("fill", "#ffffff")
      .attr("stroke", "#f59e0b")
      .attr("stroke-width", 2)
      .attr("opacity", 0);

    // Mouse events
    overlay.on("mousemove", (event) => {
      const [mouseX] = d3.pointer(event);
      // Invert linear scale to dayIndex
      const rawDay = xScale.invert(mouseX);
      const targetDay = Math.round(Math.max(-29, Math.min(30, rawDay)));
      
      const point = data.find(p => p.dayIndex === targetDay);
      if (!point) return;

      const px = xScale(point.dayIndex);
      const py = yScale(getMetricVal(point));

      focusLine
        .attr("x1", px)
        .attr("x2", px)
        .attr("y1", margin.top)
        .attr("y2", height - margin.bottom)
        .attr("opacity", 0.75);

      focusCircle
        .attr("cx", px)
        .attr("cy", py)
        .attr("stroke", point.isForecast ? "#059669" : "#4f46e5")
        .attr("opacity", 1);

      if (metric === "combined") {
        focusSecondaryCircle
          .attr("cx", px)
          .attr("cy", yScaleRight(point.conversions))
          .attr("opacity", 1);
      } else {
        focusSecondaryCircle.attr("opacity", 0);
      }

      setHoveredState({
        x: px,
        y: py,
        point,
        isNearRight: px > width - 240
      });
    });

    overlay.on("mouseleave", () => {
      focusLine.attr("opacity", 0);
      focusCircle.attr("opacity", 0);
      focusSecondaryCircle.attr("opacity", 0);
      setHoveredState(null);
    });

  }, [data, scenario, metric, height, containerWidth]);

  return (
    <div 
      ref={containerRef} 
      id="performance-forecaster-d3-container"
      className={`relative w-full select-none ${className}`}
    >
      <svg
        ref={svgRef}
        id="performance-forecaster-d3-svg"
        width="100%"
        height={height}
        className="overflow-visible block"
      />

      {/* Interactive Tooltip Card */}
      {hoveredState && (
        <div
          id="forecast-d3-tooltip"
          className="absolute pointer-events-none z-30 transition-all duration-75"
          style={{
            top: Math.max(10, Math.min(height - 180, hoveredState.y - 70)),
            left: hoveredState.isNearRight 
              ? Math.max(10, hoveredState.x - 240) 
              : hoveredState.x + 16,
            width: 220
          }}
        >
          <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 text-white shadow-2xl text-xs space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-200">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{hoveredState.point.formattedDate}</span>
                <span className="text-[10px] text-slate-400 font-normal">({hoveredState.point.dayOfWeek})</span>
              </div>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                hoveredState.point.isForecast
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
              }`}>
                {hoveredState.point.isForecast ? "Tahmini" : "Gerçek"}
              </span>
            </div>

            <div className="space-y-1 text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <Users className="w-3 h-3 text-emerald-400" />
                  Ziyaretçi:
                </span>
                <span className="font-bold text-white font-mono">
                  {hoveredState.point.visitors.toLocaleString("tr-TR")}
                </span>
              </div>

              {hoveredState.point.isForecast && (
                <div className="flex items-center justify-between text-[10px] text-slate-400 pl-4">
                  <span>Güven Aralığı:</span>
                  <span className="font-mono text-emerald-400">
                    {hoveredState.point.visitorsLowerBound} - {hoveredState.point.visitorsUpperBound}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <PhoneCall className="w-3 h-3 text-amber-400" />
                  Dönüşüm (Lead):
                </span>
                <span className="font-bold text-amber-300 font-mono">
                  {hoveredState.point.conversions} adet (%{hoveredState.point.conversionRate})
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800 pt-1">
                <span className="text-slate-400 flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-cyan-400" />
                  Katkı Değeri:
                </span>
                <span className="font-bold text-cyan-300 font-mono">
                  ₺{hoveredState.point.estimatedRevenue.toLocaleString("tr-TR")}
                </span>
              </div>
            </div>

            {hoveredState.point.notes && (
              <div className="text-[10px] text-emerald-400/90 font-medium italic pt-1 border-t border-slate-800/80">
                📌 {hoveredState.point.notes}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
