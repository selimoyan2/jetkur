import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { DailyForecastPoint } from "../../types";
import {
  TrendingUp,
  DollarSign,
  Users,
  Eye,
  Info,
  Layers,
  Sparkles,
  Calendar,
  CheckCircle2
} from "lucide-react";

interface LeadForecastingD3ChartProps {
  dailyPoints: DailyForecastPoint[];
  chartMetric: "revenue" | "leads" | "dual";
  viewType: "cumulative" | "daily";
  showConfidenceInterval: boolean;
  companyName?: string;
  currencySymbol?: string;
}

interface HoveredTooltipData {
  x: number;
  y: number;
  point: DailyForecastPoint;
  isNearRightEdge: boolean;
}

export const LeadForecastingD3Chart: React.FC<LeadForecastingD3ChartProps> = ({
  dailyPoints = [],
  chartMetric = "revenue",
  viewType = "cumulative",
  showConfidenceInterval = true,
  companyName = "İşletmeniz",
  currencySymbol = "₺"
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredData, setHoveredData] = useState<HoveredTooltipData | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(850);

  // ResizeObserver for dynamic width adaptation
  useEffect(() => {
    if (!containerRef.current) return;
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        if (width > 200) {
          setContainerWidth(width);
        }
      }
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Main D3 Drawing Effect
  useEffect(() => {
    if (!svgRef.current || dailyPoints.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous drawing

    const height = 380;
    const isDual = chartMetric === "dual";
    const margin = {
      top: 35,
      right: isDual ? 65 : 35,
      bottom: 45,
      left: chartMetric === "leads" ? 50 : 75
    };

    const innerWidth = Math.max(100, containerWidth - margin.left - margin.right);
    const innerHeight = Math.max(100, height - margin.top - margin.bottom);

    // Defs & Gradients
    const defs = svg.append("defs");

    // Emerald / Cyan gradient for Revenue
    const revenueGradient = defs
      .append("linearGradient")
      .attr("id", "forecast-revenue-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    revenueGradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#059669")
      .attr("stop-opacity", 0.35);

    revenueGradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#059669")
      .attr("stop-opacity", 0.02);

    // Indigo / Violet gradient for Leads
    const leadsGradient = defs
      .append("linearGradient")
      .attr("id", "forecast-leads-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    leadsGradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#6366f1")
      .attr("stop-opacity", 0.32);

    leadsGradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#6366f1")
      .attr("stop-opacity", 0.02);

    // Confidence Band subtle gradient
    const confidenceGradient = defs
      .append("linearGradient")
      .attr("id", "forecast-confidence-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    confidenceGradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#38bdf8")
      .attr("stop-opacity", 0.16);

    confidenceGradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#38bdf8")
      .attr("stop-opacity", 0.05);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xExtent = d3.extent(dailyPoints, (d) => d.date) as [Date, Date];
    const xScale = d3.scaleTime().domain(xExtent).range([0, innerWidth]);

    // Value extractors based on viewType
    const getRevenueValue = (d: DailyForecastPoint) =>
      viewType === "cumulative" ? d.cumulativeRevenue : d.expectedDailyRevenue;
    const getMinRevenueValue = (d: DailyForecastPoint) =>
      viewType === "cumulative" ? d.minCumulativeRevenue : d.minRevenue;
    const getMaxRevenueValue = (d: DailyForecastPoint) =>
      viewType === "cumulative" ? d.maxCumulativeRevenue : d.maxRevenue;

    const getLeadsValue = (d: DailyForecastPoint) =>
      viewType === "cumulative" ? d.cumulativeLeads : d.expectedDailyLeads;
    const getMinLeadsValue = (d: DailyForecastPoint) =>
      viewType === "cumulative" ? d.minCumulativeLeads : d.minLeads;
    const getMaxLeadsValue = (d: DailyForecastPoint) =>
      viewType === "cumulative" ? d.maxCumulativeLeads : d.maxLeads;

    // Y Scales
    let yScaleLeft: d3.ScaleLinear<number, number>;
    let yScaleRight: d3.ScaleLinear<number, number> | null = null;

    if (chartMetric === "revenue") {
      const maxRev = d3.max(dailyPoints, (d) => getMaxRevenueValue(d)) || 10000;
      yScaleLeft = d3.scaleLinear().domain([0, maxRev * 1.1]).range([innerHeight, 0]).nice();
    } else if (chartMetric === "leads") {
      const maxL = d3.max(dailyPoints, (d) => getMaxLeadsValue(d)) || 20;
      yScaleLeft = d3.scaleLinear().domain([0, maxL * 1.15]).range([innerHeight, 0]).nice();
    } else {
      // Dual mode: Left = Revenue, Right = Leads
      const maxRev = d3.max(dailyPoints, (d) => getRevenueValue(d)) || 10000;
      yScaleLeft = d3.scaleLinear().domain([0, maxRev * 1.15]).range([innerHeight, 0]).nice();

      const maxL = d3.max(dailyPoints, (d) => getLeadsValue(d)) || 20;
      yScaleRight = d3.scaleLinear().domain([0, maxL * 1.2]).range([innerHeight, 0]).nice();
    }

    // Grid lines (horizontal)
    const yGrid = d3
      .axisLeft(yScaleLeft)
      .ticks(5)
      .tickSize(-innerWidth)
      .tickFormat(() => "");

    g.append("g")
      .attr("class", "grid-lines")
      .call(yGrid)
      .selectAll("line")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-dasharray", "3,3")
      .attr("stroke-opacity", 0.7);

    g.select(".grid-lines .domain").remove();

    // 1. Confidence Band Area (if enabled and not dual mode)
    if (showConfidenceInterval && !isDual) {
      const isRev = chartMetric === "revenue";
      const confidenceArea = d3
        .area<DailyForecastPoint>()
        .curve(d3.curveMonotoneX)
        .x((d) => xScale(d.date))
        .y0((d) => (isRev ? yScaleLeft(getMinRevenueValue(d)) : yScaleLeft(getMinLeadsValue(d))))
        .y1((d) => (isRev ? yScaleLeft(getMaxRevenueValue(d)) : yScaleLeft(getMaxLeadsValue(d))));

      g.append("path")
        .datum(dailyPoints)
        .attr("fill", "url(#forecast-confidence-gradient)")
        .attr("stroke", "#38bdf8")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4,4")
        .attr("stroke-opacity", 0.4)
        .attr("d", confidenceArea);
    }

    // 2. Main Area fill
    if (chartMetric === "revenue" || isDual) {
      const revenueArea = d3
        .area<DailyForecastPoint>()
        .curve(d3.curveMonotoneX)
        .x((d) => xScale(d.date))
        .y0(innerHeight)
        .y1((d) => yScaleLeft(getRevenueValue(d)));

      g.append("path")
        .datum(dailyPoints)
        .attr("fill", "url(#forecast-revenue-gradient)")
        .attr("d", revenueArea);
    }

    if (chartMetric === "leads") {
      const leadsArea = d3
        .area<DailyForecastPoint>()
        .curve(d3.curveMonotoneX)
        .x((d) => xScale(d.date))
        .y0(innerHeight)
        .y1((d) => yScaleLeft(getLeadsValue(d)));

      g.append("path")
        .datum(dailyPoints)
        .attr("fill", "url(#forecast-leads-gradient)")
        .attr("d", leadsArea);
    }

    // 3. Primary Curve Line
    if (chartMetric === "revenue" || isDual) {
      const revenueLine = d3
        .line<DailyForecastPoint>()
        .curve(d3.curveMonotoneX)
        .x((d) => xScale(d.date))
        .y((d) => yScaleLeft(getRevenueValue(d)));

      const path = g
        .append("path")
        .datum(dailyPoints)
        .attr("fill", "none")
        .attr("stroke", "#059669")
        .attr("stroke-width", 2.8)
        .attr("stroke-linecap", "round")
        .attr("d", revenueLine);

      // Animate line entrance
      const totalLength = path.node()?.getTotalLength() || 1000;
      path
        .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(800)
        .ease(d3.easeCubicOut)
        .attr("stroke-dashoffset", 0);
    }

    // 4. Secondary Curve Line for Leads (when metric is leads OR dual)
    if (chartMetric === "leads" || isDual) {
      const targetYScale = isDual && yScaleRight ? yScaleRight : yScaleLeft;
      const leadsLine = d3
        .line<DailyForecastPoint>()
        .curve(d3.curveMonotoneX)
        .x((d) => xScale(d.date))
        .y((d) => targetYScale(getLeadsValue(d)));

      const path = g
        .append("path")
        .datum(dailyPoints)
        .attr("fill", "none")
        .attr("stroke", isDual ? "#6366f1" : "#4f46e5")
        .attr("stroke-width", isDual ? 2.4 : 2.8)
        .attr(isDual ? "stroke-dasharray" : "stroke-dashoffset", isDual ? "5,3" : "0")
        .attr("stroke-linecap", "round")
        .attr("d", leadsLine);

      if (!isDual) {
        const totalLength = path.node()?.getTotalLength() || 1000;
        path
          .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
          .attr("stroke-dashoffset", totalLength)
          .transition()
          .duration(800)
          .ease(d3.easeCubicOut)
          .attr("stroke-dashoffset", 0);
      }
    }

    // 5. Milestone Dots at weekly intervals (Day 7, 14, 21, 30)
    const milestoneIndices = [6, 13, 20, 29];
    const milestonePoints = dailyPoints.filter((_, idx) => milestoneIndices.includes(idx));

    milestonePoints.forEach((pt) => {
      const cx = xScale(pt.date);
      const cy =
        chartMetric === "revenue" || isDual
          ? yScaleLeft(getRevenueValue(pt))
          : yScaleLeft(getLeadsValue(pt));

      // Outer glow pulse circle
      g.append("circle")
        .attr("cx", cx)
        .attr("cy", cy)
        .attr("r", 7)
        .attr("fill", chartMetric === "leads" ? "#818cf8" : "#34d399")
        .attr("fill-opacity", 0.3)
        .attr("stroke", "none");

      // Core dot
      g.append("circle")
        .attr("cx", cx)
        .attr("cy", cy)
        .attr("r", 4)
        .attr("fill", "#ffffff")
        .attr("stroke", chartMetric === "leads" ? "#4f46e5" : "#059669")
        .attr("stroke-width", 2.5);
    });

    // 6. X-Axis with Turkish dates
    const xAxis = d3
      .axisBottom<Date>(xScale)
      .ticks(d3.timeDay.every(containerWidth < 600 ? 6 : 3))
      .tickFormat((d) => {
        const dateObj = d as Date;
        const turkishMonths = [
          "Oca", "Şub", "Mar", "Nis", "May", "Haz",
          "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"
        ];
        return `${dateObj.getDate()} ${turkishMonths[dateObj.getMonth()]}`;
      });

    const xAxisGroup = g
      .append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis);

    xAxisGroup.select(".domain").attr("stroke", "#cbd5e1");
    xAxisGroup
      .selectAll("text")
      .attr("fill", "#64748b")
      .attr("font-size", "11px")
      .attr("font-weight", "500")
      .attr("dy", "1em");
    xAxisGroup.selectAll("line").attr("stroke", "#cbd5e1");

    // 7. Left Y-Axis
    const yAxisLeft = d3
      .axisLeft(yScaleLeft)
      .ticks(5)
      .tickFormat((d) => {
        const val = d as number;
        if (chartMetric === "leads") {
          return `${val}`;
        }
        if (val >= 1000000) {
          return `${currencySymbol}${(val / 1000000).toFixed(1)}M`;
        }
        if (val >= 1000) {
          return `${currencySymbol}${Math.round(val / 1000)}B`;
        }
        return `${currencySymbol}${val}`;
      });

    const yAxisLeftGroup = g.append("g").call(yAxisLeft);
    yAxisLeftGroup.select(".domain").remove();
    yAxisLeftGroup
      .selectAll("text")
      .attr("fill", chartMetric === "leads" ? "#4f46e5" : "#059669")
      .attr("font-size", "11px")
      .attr("font-weight", "600");
    yAxisLeftGroup.selectAll("line").remove();

    // 8. Right Y-Axis (Dual mode only)
    if (isDual && yScaleRight) {
      const yAxisRight = d3
        .axisRight(yScaleRight)
        .ticks(5)
        .tickFormat((d) => `${d} L`);

      const yAxisRightGroup = g
        .append("g")
        .attr("transform", `translate(${innerWidth},0)`)
        .call(yAxisRight);

      yAxisRightGroup.select(".domain").remove();
      yAxisRightGroup
        .selectAll("text")
        .attr("fill", "#6366f1")
        .attr("font-size", "11px")
        .attr("font-weight", "600");
      yAxisRightGroup.selectAll("line").remove();
    }

    // 9. Interactive Crosshair & Tooltip Overlay
    const focusGroup = g.append("g").attr("class", "focus-group").style("display", "none");

    // Vertical dashed guideline
    const verticalLine = focusGroup
      .append("line")
      .attr("class", "crosshair-vertical")
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", "#0284c7")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "4,3")
      .attr("opacity", 0.7);

    // Dynamic focus circles
    const focusDotRevenue = focusGroup
      .append("circle")
      .attr("r", 5.5)
      .attr("fill", "#059669")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2);

    const focusDotLeads = isDual
      ? focusGroup
          .append("circle")
          .attr("r", 5.5)
          .attr("fill", "#6366f1")
          .attr("stroke", "#ffffff")
          .attr("stroke-width", 2)
      : null;

    // Transparent overlay rectangle to capture pointer events
    const bisectDate = d3.bisector<DailyForecastPoint, Date>((d) => d.date).center;

    svg
      .append("rect")
      .attr("transform", `translate(${margin.left},${margin.top})`)
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .attr("fill", "transparent")
      .attr("cursor", "crosshair")
      .on("mouseenter", () => {
        focusGroup.style("display", null);
      })
      .on("mouseleave", () => {
        focusGroup.style("display", "none");
        setHoveredData(null);
      })
      .on("mousemove", (event: MouseEvent) => {
        const [pointerX] = d3.pointer(event, g.node());
        const clampedX = Math.max(0, Math.min(innerWidth, pointerX));
        const hoveredDate = xScale.invert(clampedX);
        const index = bisectDate(dailyPoints, hoveredDate);
        const point = dailyPoints[index] || dailyPoints[0];

        if (point) {
          const cx = xScale(point.date);
          verticalLine.attr("x1", cx).attr("x2", cx);

          if (chartMetric === "revenue" || isDual) {
            focusDotRevenue.attr("cx", cx).attr("cy", yScaleLeft(getRevenueValue(point)));
          } else {
            focusDotRevenue.attr("cx", cx).attr("cy", yScaleLeft(getLeadsValue(point)));
          }

          if (isDual && focusDotLeads && yScaleRight) {
            focusDotLeads.attr("cx", cx).attr("cy", yScaleRight(getLeadsValue(point)));
          }

          // Calculate tooltip coordinates relative to svg container
          const svgRect = svgRef.current?.getBoundingClientRect();
          if (svgRect) {
            const pageX = margin.left + cx;
            const pageY =
              margin.top +
              (chartMetric === "revenue" || isDual
                ? yScaleLeft(getRevenueValue(point))
                : yScaleLeft(getLeadsValue(point)));

            setHoveredData({
              x: pageX,
              y: pageY,
              point,
              isNearRightEdge: cx > innerWidth * 0.65
            });
          }
        }
      });
  }, [dailyPoints, chartMetric, viewType, showConfidenceInterval, containerWidth, currencySymbol]);

  return (
    <div
      ref={containerRef}
      id="d3-lead-forecasting-chart-container"
      className="relative w-full bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs"
    >
      {/* Top Chart Header / Status Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-800">
            D3.js 30 Günlük Tahmin &amp; Projeksiyon Eğrisi
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
            {viewType === "cumulative" ? "Birikimli Toplam" : "Günlük Hacim"}
          </span>
        </div>

        {/* Legend Indicators */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
          {(chartMetric === "revenue" || chartMetric === "dual") && (
            <div className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-3 h-0.5 bg-emerald-600 rounded-full" />
              <span>Beklenen Satış Hacmi ({currencySymbol})</span>
            </div>
          )}

          {(chartMetric === "leads" || chartMetric === "dual") && (
            <div className="flex items-center gap-1.5 text-indigo-700">
              <span
                className={`w-3 h-0.5 bg-indigo-600 rounded-full ${
                  chartMetric === "dual" ? "border-t border-dashed border-indigo-600" : ""
                }`}
              />
              <span>Potansiyel Müşteri (Lead)</span>
            </div>
          )}

          {showConfidenceInterval && chartMetric !== "dual" && (
            <div className="flex items-center gap-1.5 text-sky-700">
              <span className="w-3 h-2 bg-sky-200/80 border border-sky-400/50 rounded-xs" />
              <span>%95 Güven Aralığı</span>
            </div>
          )}
        </div>
      </div>

      {/* SVG Canvas for D3 */}
      <div className="w-full overflow-hidden">
        <svg
          ref={svgRef}
          width="100%"
          height="380"
          className="overflow-visible block select-none"
        />
      </div>

      {/* Interactive Tooltip Card */}
      {hoveredData && (
        <div
          className="absolute z-30 pointer-events-none transition-all duration-75 bg-slate-900/95 backdrop-blur-md text-white px-3.5 py-3 rounded-xl shadow-xl border border-slate-700/80 text-xs min-w-[240px]"
          style={{
            top: Math.max(10, hoveredData.y - 120),
            left: hoveredData.isNearRightEdge
              ? Math.max(10, hoveredData.x - 260)
              : Math.min(containerWidth - 260, hoveredData.x + 18)
          }}
        >
          {/* Tooltip Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <div className="font-bold text-slate-100 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>{hoveredData.point.fullDisplayDate}</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold">
              {hoveredData.point.dayIndex}. Gün
            </span>
          </div>

          {/* Metrics List */}
          <div className="space-y-1.5 font-mono">
            {/* Revenue */}
            <div className="flex items-center justify-between text-emerald-400">
              <span className="text-slate-400 text-[11px] font-sans">
                {viewType === "cumulative" ? "Kümülatif Satış:" : "Günlük Satış:"}
              </span>
              <span className="font-bold text-sm">
                {currencySymbol}
                {(viewType === "cumulative"
                  ? hoveredData.point.cumulativeRevenue
                  : hoveredData.point.expectedDailyRevenue
                ).toLocaleString("tr-TR")}
              </span>
            </div>

            {/* Leads */}
            <div className="flex items-center justify-between text-indigo-300">
              <span className="text-slate-400 text-[11px] font-sans">
                {viewType === "cumulative" ? "Kümülatif Lead:" : "Günlük Lead:"}
              </span>
              <span className="font-bold">
                {(viewType === "cumulative"
                  ? hoveredData.point.cumulativeLeads
                  : hoveredData.point.expectedDailyLeads
                ).toFixed(1)}{" "}
                Talep
              </span>
            </div>

            {/* Won Deals */}
            <div className="flex items-center justify-between text-amber-300">
              <span className="text-slate-400 text-[11px] font-sans">
                {viewType === "cumulative" ? "Kazanılan Anlaşma:" : "Kazanılan Sipariş:"}
              </span>
              <span className="font-bold">
                ~
                {(viewType === "cumulative"
                  ? hoveredData.point.cumulativeWonDeals
                  : hoveredData.point.expectedDailyWonDeals
                ).toFixed(1)}{" "}
                Müşteri
              </span>
            </div>

            {/* Confidence Interval info */}
            {showConfidenceInterval && (
              <div className="pt-1.5 border-t border-slate-800/80 text-[10px] text-slate-400 font-sans">
                <span className="text-sky-300 font-semibold">Güven Sınırı:</span>{" "}
                {currencySymbol}
                {(viewType === "cumulative"
                  ? hoveredData.point.minCumulativeRevenue
                  : hoveredData.point.minRevenue
                ).toLocaleString("tr-TR")}{" "}
                - {currencySymbol}
                {(viewType === "cumulative"
                  ? hoveredData.point.maxCumulativeRevenue
                  : hoveredData.point.maxRevenue
                ).toLocaleString("tr-TR")}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer Notes */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>
            Model, geçmiş lead kazanım oranlarını ve haftalık talep mevsimselliğini ağırlıklandırarak D3.js ile
            çizdirilmektedir.
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
          <span>İmleci grafikte gezdirerek günlük tahmin detaylarını inceleyebilirsiniz</span>
        </div>
      </div>
    </div>
  );
};
