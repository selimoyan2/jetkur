import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { 
  DailyPerformanceTrendDataPoint, 
  CoreWebVitalMetricKey, 
  PerformanceTrendGranularity,
  PerformanceMilestoneEvent 
} from "../../types";
import { 
  Activity, 
  Zap, 
  TrendingDown, 
  Info, 
  Sparkles, 
  Calendar, 
  Users, 
  CheckCircle2, 
  AlertTriangle 
} from "lucide-react";

interface PerformanceTrendsD3ChartProps {
  data: DailyPerformanceTrendDataPoint[];
  selectedMetric: CoreWebVitalMetricKey;
  granularity: PerformanceTrendGranularity;
  height?: number;
  onSelectMilestone?: (milestone: PerformanceMilestoneEvent) => void;
  className?: string;
}

interface HoverDetail {
  x: number;
  y: number;
  point: DailyPerformanceTrendDataPoint;
  isNearRight: boolean;
}

export const PerformanceTrendsD3Chart: React.FC<PerformanceTrendsD3ChartProps> = ({
  data = [],
  selectedMetric = "lcp",
  granularity = "daily",
  height = 420,
  onSelectMilestone,
  className = ""
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(850);
  const [hoverDetail, setHoverDetail] = useState<HoverDetail | null>(null);

  // Auto-resize on parent width changes
  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        if (w > 150) setContainerWidth(w);
      }
    };
    updateWidth();
    const observer = new ResizeObserver(() => updateWidth());
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Metric configuration map
  const metricConfigs: Record<CoreWebVitalMetricKey, {
    label: string;
    unit: string;
    color: string;
    areaColor: string;
    thresholdGood: number;
    thresholdNeedsImprovement: number;
    thresholdLabel: string;
    isHigherBetter: boolean;
    getValue: (d: DailyPerformanceTrendDataPoint) => number;
  }> = {
    lcp: {
      label: "En Büyük İçerikli Boyama (LCP)",
      unit: "sn",
      color: "#059669", // emerald-600
      areaColor: "#10b981",
      thresholdGood: 2.5,
      thresholdNeedsImprovement: 4.0,
      thresholdLabel: "Google İdeal LCP (≤ 2.5s)",
      isHigherBetter: false,
      getValue: (d) => (granularity === "7d_ma" && d.lcp_ma != null) ? d.lcp_ma : d.lcp
    },
    inp: {
      label: "Etkileşimden Sonraki Boyama (INP)",
      unit: "ms",
      color: "#0284c7", // sky-600
      areaColor: "#0ea5e9",
      thresholdGood: 200,
      thresholdNeedsImprovement: 500,
      thresholdLabel: "Google İdeal INP (≤ 200ms)",
      isHigherBetter: false,
      getValue: (d) => (granularity === "7d_ma" && d.inp_ma != null) ? d.inp_ma : d.inp
    },
    fid: {
      label: "İlk Giriş Gecikmesi (FID)",
      unit: "ms",
      color: "#f59e0b", // amber-500
      areaColor: "#fbbf24",
      thresholdGood: 100,
      thresholdNeedsImprovement: 300,
      thresholdLabel: "Google İdeal FID (≤ 100ms)",
      isHigherBetter: false,
      getValue: (d) => (granularity === "7d_ma" && d.fid_ma != null) ? d.fid_ma : d.fid
    },
    cls: {
      label: "Kümülatif Düzen Kayması (CLS)",
      unit: "",
      color: "#7c3aed", // violet-600
      areaColor: "#8b5cf6",
      thresholdGood: 0.1,
      thresholdNeedsImprovement: 0.25,
      thresholdLabel: "Google İdeal CLS (≤ 0.10)",
      isHigherBetter: false,
      getValue: (d) => (granularity === "7d_ma" && d.cls_ma != null) ? d.cls_ma : d.cls
    },
    ttfb: {
      label: "İlk Bayt Yanıt Süresi (TTFB)",
      unit: "ms",
      color: "#d97706", // amber-600
      areaColor: "#f59e0b",
      thresholdGood: 800,
      thresholdNeedsImprovement: 1800,
      thresholdLabel: "Google İdeal TTFB (≤ 800ms)",
      isHigherBetter: false,
      getValue: (d) => (granularity === "7d_ma" && d.ttfb_ma != null) ? d.ttfb_ma : d.ttfb
    },
    fcp: {
      label: "İlk İçerikli Boyama (FCP)",
      unit: "sn",
      color: "#0d9488", // teal-600
      areaColor: "#14b8a6",
      thresholdGood: 1.8,
      thresholdNeedsImprovement: 3.0,
      thresholdLabel: "Google İdeal FCP (≤ 1.8s)",
      isHigherBetter: false,
      getValue: (d) => (granularity === "7d_ma" && d.fcp_ma != null) ? d.fcp_ma : d.fcp
    },
    healthScore: {
      label: "Altyapı Sağlık Skoru",
      unit: "/100",
      color: "#16a34a", // green-600
      areaColor: "#22c55e",
      thresholdGood: 90,
      thresholdNeedsImprovement: 75,
      thresholdLabel: "Hedef Sağlık İndeksi (≥ 90/100)",
      isHigherBetter: true,
      getValue: (d) => (granularity === "7d_ma" && d.healthScore_ma != null) ? d.healthScore_ma : d.healthScore
    }
  };

  const currentMetric = metricConfigs[selectedMetric];

  // D3 Chart Drawing Effect
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = containerWidth;
    const margin = { top: 48, right: 62, bottom: 44, left: 58 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    if (innerWidth <= 0 || innerHeight <= 0) return;

    // Defs & Gradients
    const defs = svg.append("defs");

    // Left Vital Area Gradient
    const vitalGradient = defs.append("linearGradient")
      .attr("id", "vitalAreaGradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "0%").attr("y2", "100%");
    vitalGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", currentMetric.areaColor)
      .attr("stop-opacity", 0.35);
    vitalGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", currentMetric.areaColor)
      .attr("stop-opacity", 0.02);

    // Right Bounce Rate Area Gradient (Soft Rose)
    const bounceGradient = defs.append("linearGradient")
      .attr("id", "bounceAreaGradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "0%").attr("y2", "100%");
    bounceGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#f43f5e") // rose-500
      .attr("stop-opacity", 0.22);
    bounceGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#f43f5e")
      .attr("stop-opacity", 0.01);

    // X Scale: index based
    const minDay = d3.min(data, d => d.dayIndex) ?? -89;
    const maxDay = d3.max(data, d => d.dayIndex) ?? 0;
    const xScale = d3.scaleLinear()
      .domain([minDay, maxDay])
      .range([margin.left, width - margin.right]);

    // Left Y Scale (Vital)
    const vitalValues = data.map(d => currentMetric.getValue(d));
    let vitalMin = d3.min(vitalValues) ?? 0;
    let vitalMax = d3.max(vitalValues) ?? 10;
    
    // Expand bounds slightly for visual comfort
    const vitalPadding = (vitalMax - vitalMin) * 0.15 || 0.5;
    vitalMin = Math.max(0, vitalMin - vitalPadding);
    vitalMax = vitalMax + vitalPadding;

    const yScaleLeft = d3.scaleLinear()
      .domain([vitalMin, vitalMax])
      .range([height - margin.bottom, margin.top]);

    // Right Y Scale (Bounce Rate %)
    const bounceValues = data.map(d => (granularity === "7d_ma" && d.bounceRate_ma != null) ? d.bounceRate_ma : d.bounceRate);
    let bounceMin = d3.min(bounceValues) ?? 15;
    let bounceMax = d3.max(bounceValues) ?? 60;
    const bouncePadding = (bounceMax - bounceMin) * 0.18 || 5;
    bounceMin = Math.max(0, Math.floor(bounceMin - bouncePadding));
    bounceMax = Math.min(100, Math.ceil(bounceMax + bouncePadding));

    const yScaleRight = d3.scaleLinear()
      .domain([bounceMin, bounceMax])
      .range([height - margin.bottom, margin.top]);

    // Background threshold zone (if inside range)
    if (!currentMetric.isHigherBetter && currentMetric.thresholdGood >= vitalMin && currentMetric.thresholdGood <= vitalMax) {
      const goodY = yScaleLeft(currentMetric.thresholdGood);
      const bottomY = yScaleLeft(vitalMin);
      
      // Google "Good" region shaded green
      svg.append("rect")
        .attr("x", margin.left)
        .attr("y", goodY)
        .attr("width", innerWidth)
        .attr("height", Math.max(0, bottomY - goodY))
        .attr("fill", "#10b981")
        .attr("fill-opacity", 0.05);

      // Dashed Target Line
      svg.append("line")
        .attr("x1", margin.left)
        .attr("x2", width - margin.right)
        .attr("y1", goodY)
        .attr("y2", goodY)
        .attr("stroke", "#059669")
        .attr("stroke-width", 1.2)
        .attr("stroke-dasharray", "4,4")
        .attr("opacity", 0.7);

      // Target Label
      svg.append("text")
        .attr("x", width - margin.right - 8)
        .attr("y", goodY - 6)
        .attr("text-anchor", "end")
        .attr("font-size", "10px")
        .attr("font-family", "ui-sans-serif, system-ui")
        .attr("font-weight", "600")
        .attr("fill", "#059669")
        .text(currentMetric.thresholdLabel);
    }

    // Grid Lines (Horizontal)
    const yTicksLeft = yScaleLeft.ticks(5);
    yTicksLeft.forEach(tick => {
      svg.append("line")
        .attr("x1", margin.left)
        .attr("x2", width - margin.right)
        .attr("y1", yScaleLeft(tick))
        .attr("y2", yScaleLeft(tick))
        .attr("stroke", "#f1f5f9")
        .attr("stroke-width", 1);
    });

    // Area Generator (Vital)
    const vitalArea = d3.area<DailyPerformanceTrendDataPoint>()
      .x(d => xScale(d.dayIndex))
      .y0(height - margin.bottom)
      .y1(d => yScaleLeft(currentMetric.getValue(d)))
      .curve(d3.curveMonotoneX);

    svg.append("path")
      .datum(data)
      .attr("fill", "url(#vitalAreaGradient)")
      .attr("d", vitalArea);

    // Area Generator (Bounce Rate)
    const bounceArea = d3.area<DailyPerformanceTrendDataPoint>()
      .x(d => xScale(d.dayIndex))
      .y0(height - margin.bottom)
      .y1(d => yScaleRight((granularity === "7d_ma" && d.bounceRate_ma != null) ? d.bounceRate_ma : d.bounceRate))
      .curve(d3.curveMonotoneX);

    svg.append("path")
      .datum(data)
      .attr("fill", "url(#bounceAreaGradient)")
      .attr("d", bounceArea);

    // Line Generator (Bounce Rate - Rose)
    const bounceLine = d3.line<DailyPerformanceTrendDataPoint>()
      .x(d => xScale(d.dayIndex))
      .y(d => yScaleRight((granularity === "7d_ma" && d.bounceRate_ma != null) ? d.bounceRate_ma : d.bounceRate))
      .curve(d3.curveMonotoneX);

    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#e11d48") // rose-600
      .attr("stroke-width", 2.2)
      .attr("stroke-dasharray", granularity === "daily" ? "none" : "none")
      .attr("d", bounceLine);

    // Line Generator (Vital - Primary Metric)
    const vitalLine = d3.line<DailyPerformanceTrendDataPoint>()
      .x(d => xScale(d.dayIndex))
      .y(d => yScaleLeft(currentMetric.getValue(d)))
      .curve(d3.curveMonotoneX);

    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", currentMetric.color)
      .attr("stroke-width", 2.8)
      .attr("d", vitalLine);

    // Milestone Event Vertical Markers
    const milestonePoints = data.filter(d => d.milestone != null);
    milestonePoints.forEach(p => {
      if (!p.milestone) return;
      const xPos = xScale(p.dayIndex);
      const topY = margin.top - 18;

      // Vertical Marker Line
      svg.append("line")
        .attr("x1", xPos)
        .attr("x2", xPos)
        .attr("y1", topY + 20)
        .attr("y2", height - margin.bottom)
        .attr("stroke", "#6366f1") // indigo-500
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "3,3")
        .attr("opacity", 0.65);

      // Milestone Pin Group (Interactive)
      const pinGroup = svg.append("g")
        .attr("class", "milestone-pin cursor-pointer")
        .attr("transform", `translate(${xPos}, ${topY})`)
        .on("click", (e) => {
          e.stopPropagation();
          if (p.milestone && onSelectMilestone) {
            onSelectMilestone(p.milestone);
          }
        });

      pinGroup.append("circle")
        .attr("r", 9)
        .attr("fill", "#ffffff")
        .attr("stroke", "#6366f1")
        .attr("stroke-width", 2)
        .attr("filter", "drop-shadow(0 1px 2px rgba(0,0,0,0.1))");

      // Center dot
      pinGroup.append("circle")
        .attr("r", 3.5)
        .attr("fill", "#6366f1");

      // Short pill label above marker
      pinGroup.append("text")
        .attr("y", -12)
        .attr("text-anchor", "middle")
        .attr("font-size", "9px")
        .attr("font-weight", "700")
        .attr("font-family", "ui-sans-serif, system-ui")
        .attr("fill", "#4338ca")
        .text(p.milestone.impactMetric);
    });

    // X-Axis
    const xAxis = d3.axisBottom(xScale)
      .ticks(Math.min(7, Math.floor(innerWidth / 90)))
      .tickFormat(val => {
        const idx = Number(val);
        const match = data.find(d => d.dayIndex === idx);
        if (match) return match.formattedDate;
        return `${idx}G`;
      });

    const gX = svg.append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(xAxis);

    gX.select(".domain").attr("stroke", "#cbd5e1");
    gX.selectAll(".tick line").attr("stroke", "#cbd5e1");
    gX.selectAll(".tick text")
      .attr("fill", "#64748b")
      .attr("font-size", "11px")
      .attr("font-weight", "500");

    // Left Y-Axis (Vital)
    const yAxisLeft = d3.axisLeft(yScaleLeft)
      .ticks(5)
      .tickFormat(d => `${d}${currentMetric.unit}`);

    const gYLeft = svg.append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(yAxisLeft);

    gYLeft.select(".domain").remove();
    gYLeft.selectAll(".tick line").remove();
    gYLeft.selectAll(".tick text")
      .attr("fill", currentMetric.color)
      .attr("font-size", "11px")
      .attr("font-weight", "700");

    // Right Y-Axis (Bounce Rate %)
    const yAxisRight = d3.axisRight(yScaleRight)
      .ticks(5)
      .tickFormat(d => `%${d}`);

    const gYRight = svg.append("g")
      .attr("transform", `translate(${width - margin.right}, 0)`)
      .call(yAxisRight);

    gYRight.select(".domain").remove();
    gYRight.selectAll(".tick line").remove();
    gYRight.selectAll(".tick text")
      .attr("fill", "#e11d48") // rose-600
      .attr("font-size", "11px")
      .attr("font-weight", "700");

    // Crosshair Guide Line (hidden by default)
    const crosshair = svg.append("line")
      .attr("class", "crosshair-line")
      .attr("y1", margin.top)
      .attr("y2", height - margin.bottom)
      .attr("stroke", "#334155")
      .attr("stroke-width", 1.2)
      .attr("stroke-dasharray", "3,3")
      .style("display", "none");

    const vitalFocusCircle = svg.append("circle")
      .attr("r", 5)
      .attr("fill", currentMetric.color)
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2)
      .style("display", "none");

    const bounceFocusCircle = svg.append("circle")
      .attr("r", 5)
      .attr("fill", "#e11d48")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2)
      .style("display", "none");

    // Interactive Overlay for Tooltip Tracking
    const bisect = d3.bisector((d: DailyPerformanceTrendDataPoint) => d.dayIndex).center;

    svg.append("rect")
      .attr("x", margin.left)
      .attr("y", margin.top)
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .attr("fill", "transparent")
      .style("cursor", "crosshair")
      .on("mousemove", (event) => {
        const [mx] = d3.pointer(event);
        const dayVal = xScale.invert(mx);
        const index = bisect(data, dayVal);
        const point = data[index] || data[data.length - 1];

        if (!point) return;

        const px = xScale(point.dayIndex);
        const pyVital = yScaleLeft(currentMetric.getValue(point));
        const pyBounce = yScaleRight((granularity === "7d_ma" && point.bounceRate_ma != null) ? point.bounceRate_ma : point.bounceRate);

        crosshair
          .style("display", "block")
          .attr("x1", px)
          .attr("x2", px);

        vitalFocusCircle
          .style("display", "block")
          .attr("cx", px)
          .attr("cy", pyVital);

        bounceFocusCircle
          .style("display", "block")
          .attr("cx", px)
          .attr("cy", pyBounce);

        setHoverDetail({
          x: px,
          y: Math.min(pyVital, pyBounce),
          point,
          isNearRight: px > width - 260
        });
      })
      .on("mouseleave", () => {
        crosshair.style("display", "none");
        vitalFocusCircle.style("display", "none");
        bounceFocusCircle.style("display", "none");
        setHoverDetail(null);
      });

  }, [data, selectedMetric, granularity, containerWidth, height]);

  return (
    <div 
      ref={containerRef} 
      id="performance-trends-d3-container"
      className={`relative w-full bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs overflow-hidden ${className}`}
    >
      {/* Header Legends & Axis Summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2 px-2">
        <div className="flex items-center gap-4 text-xs font-semibold">
          {/* Metric 1 Legend */}
          <div className="flex items-center gap-2">
            <span 
              className="w-3.5 h-1 rounded-full inline-block" 
              style={{ backgroundColor: currentMetric.color }}
            />
            <span className="text-slate-800 font-bold">{currentMetric.label}</span>
            <span className="text-[11px] text-slate-400 font-mono">({currentMetric.unit || "Değer"})</span>
          </div>

          {/* Metric 2 Legend (Bounce Rate) */}
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-1 rounded-full bg-rose-600 inline-block" />
            <span className="text-rose-700 font-bold">Ziyaretçi Çıkma Oranı</span>
            <span className="text-[11px] text-rose-400 font-mono">(%)</span>
          </div>
        </div>

        {/* Milestone Indicator Info */}
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg">
          <Sparkles className="w-3 h-3 text-indigo-600" />
          <span>Mor Pinler: Kritik Altyapı İyileştirme Kilometre Taşları</span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative">
        <svg 
          ref={svgRef} 
          width={containerWidth} 
          height={height} 
          className="w-full select-none"
        />

        {/* Interactive Floating Tooltip */}
        {hoverDetail && (
          <div 
            className="absolute z-20 pointer-events-none transition-transform duration-75 shadow-xl rounded-xl border border-slate-200 bg-slate-900/95 backdrop-blur-md text-white p-3.5 text-xs min-w-[240px]"
            style={{
              top: Math.max(10, Math.min(height - 180, hoverDetail.y - 40)),
              left: hoverDetail.isNearRight 
                ? hoverDetail.x - 255 
                : hoverDetail.x + 18
            }}
          >
            {/* Header: Date */}
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-2 mb-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-200">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{hoverDetail.point.date}</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  ({hoverDetail.point.dayIndex === 0 ? "Bugün" : `${Math.abs(hoverDetail.point.dayIndex)} gün önce`})
                </span>
              </div>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                hoverDetail.point.cwvPassStatus === "pass" 
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              }`}>
                {hoverDetail.point.cwvPassStatus === "pass" ? "CWV Geçti" : "CWV Geliştirilmeli"}
              </span>
            </div>

            {/* Metrics Breakdown */}
            <div className="space-y-1.5">
              {/* Selected Vital */}
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-300">{currentMetric.label.split("(")[0]}:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {currentMetric.getValue(hoverDetail.point)} {currentMetric.unit}
                </span>
              </div>

              {/* Bounce Rate */}
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-300">Ziyaretçi Çıkma Oranı:</span>
                <span className="font-mono font-bold text-rose-400">
                  %{hoverDetail.point.bounceRate}
                </span>
              </div>

              {/* Daily Visitors */}
              <div className="flex items-center justify-between gap-4 text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-slate-400" />
                  <span>Günlük Ziyaretçi:</span>
                </span>
                <span className="font-mono font-semibold text-slate-200">
                  {hoverDetail.point.dailyVisitors.toLocaleString("tr-TR")} tekil
                </span>
              </div>

              {/* Session Duration */}
              <div className="flex items-center justify-between gap-4 text-[11px] text-slate-400">
                <span>Ortalama Oturum:</span>
                <span className="font-mono font-semibold text-slate-200">
                  {hoverDetail.point.avgSessionDurationSec} sn ({hoverDetail.point.pagesPerSession} sayfa)
                </span>
              </div>
            </div>

            {/* Milestone Event Callout in Tooltip */}
            {hoverDetail.point.milestone && (
              <div className="mt-2.5 pt-2 border-t border-indigo-500/40 bg-indigo-950/50 -mx-1 px-2.5 py-1.5 rounded-lg">
                <div className="flex items-center gap-1.5 text-indigo-300 font-bold text-[11px]">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  <span>{hoverDetail.point.milestone.title}</span>
                </div>
                <p className="text-[10px] text-slate-300 mt-0.5 line-clamp-2 leading-tight">
                  {hoverDetail.point.milestone.description}
                </p>
                <div className="mt-1 text-[10px] font-mono text-indigo-200 font-semibold">
                  Etki: {hoverDetail.point.milestone.impactMetric} ({hoverDetail.point.milestone.impactDelta})
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Explanatory Strip */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-slate-100 mt-1 gap-2">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>
            Veriler her 24 saatte bir Google Chrome User Experience Report (CrUX) ve Cloudflare Edge telemetrisi ile senkronize edilir.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Yeşil Alan: Google CWV Hedefi
          </span>
          <span className="inline-flex items-center gap-1 text-rose-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Kırmızı Çizgi: Çıkma Oranı (%)
          </span>
        </div>
      </div>
    </div>
  );
};
