import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import { ChannelAttributionData, MarketingSourceKey } from "../../types";
import {
  TrendingUp,
  Sparkles,
  Info,
  DollarSign,
  Users,
  Target,
  Percent,
  CheckCircle2,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  BarChart3,
  PieChart as PieIcon,
  Maximize2
} from "lucide-react";

export type ChartViewMode = "quadrant" | "bars" | "allocation";
export type BubbleSizeMode = "spend" | "revenue" | "leads";

interface MarketingAttributionD3ChartProps {
  channels: ChannelAttributionData[];
  selectedSourceId: MarketingSourceKey | "all";
  onSelectSource: (sourceId: MarketingSourceKey | "all") => void;
  viewMode: ChartViewMode;
  bubbleSizeMode: BubbleSizeMode;
  onViewModeChange?: (mode: ChartViewMode) => void;
  onBubbleSizeModeChange?: (mode: BubbleSizeMode) => void;
}

interface TooltipInfo {
  x: number;
  y: number;
  channel: ChannelAttributionData;
}

export const MarketingAttributionD3Chart: React.FC<MarketingAttributionD3ChartProps> = ({
  channels,
  selectedSourceId,
  onSelectSource,
  viewMode,
  bubbleSizeMode,
  onViewModeChange,
  onBubbleSizeModeChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 480 });
  const [hoveredChannel, setHoveredChannel] = useState<ChannelAttributionData | null>(null);
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);

  // ResizeObserver for dynamic, responsive width
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const entry = entries[0];
      const { width } = entry.contentRect;
      if (width > 200) {
        // dynamic height based on aspect ratio
        const newHeight = Math.max(380, Math.min(520, Math.round(width * 0.52)));
        setDimensions({ width, height: newHeight });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Filter channels if specific source is filtered
  const activeChannels = useMemo(() => {
    if (selectedSourceId === "all") return channels;
    return channels.filter((c) => c.id === selectedSourceId);
  }, [channels, selectedSourceId]);

  // Main D3 Drawing Hook
  useEffect(() => {
    if (!svgRef.current || activeChannels.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { width, height } = dimensions;

    // Filter defs for drop shadow and glowing gradients
    const defs = svg.append("defs");

    // Glow filter
    const filter = defs.append("filter").attr("id", "bubble-glow").attr("x", "-30%").attr("y", "-30%").attr("width", "160%").attr("height", "160%");
    filter.append("feGaussianBlur").attr("stdDeviation", "4").attr("result", "blur");
    filter.append("feComposite").attr("in", "SourceGraphic").attr("in2", "blur").attr("operator", "over");

    // Define linear gradients for each channel
    activeChannels.forEach((c) => {
      const grad = defs
        .append("linearGradient")
        .attr("id", `grad-${c.id}`)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%");
      grad.append("stop").attr("offset", "0%").attr("stop-color", c.gradientColors[0]).attr("stop-opacity", 0.9);
      grad.append("stop").attr("offset", "100%").attr("stop-color", c.gradientColors[1]).attr("stop-opacity", 0.95);
    });

    if (viewMode === "quadrant") {
      drawQuadrantMatrix(svg, activeChannels, width, height);
    } else if (viewMode === "bars") {
      drawComparativeBars(svg, activeChannels, width, height);
    } else if (viewMode === "allocation") {
      drawAllocationDonuts(svg, activeChannels, width, height);
    }
  }, [activeChannels, dimensions, viewMode, bubbleSizeMode, selectedSourceId]);

  // -----------------------------------------------------------------
  // 1. D3 QUADRANT SCATTER / BUBBLE MATRIX (ROI vs Conversion Rate)
  // -----------------------------------------------------------------
  const drawQuadrantMatrix = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    data: ChannelAttributionData[],
    width: number,
    height: number
  ) => {
    const margin = { top: 40, right: 45, bottom: 65, left: 75 };
    const innerWidth = Math.max(200, width - margin.left - margin.right);
    const innerHeight = Math.max(180, height - margin.top - margin.bottom);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Domains
    const maxCr = Math.max(6.5, d3.max(data, (d) => d.conversionRate) || 6.5);
    const maxRoi = Math.max(500, d3.max(data, (d) => d.roi) || 500);

    // Scales
    const xScale = d3
      .scaleLinear()
      .domain([0, maxCr * 1.15])
      .range([0, innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([-30, maxRoi * 1.15])
      .range([innerHeight, 0])
      .nice();

    // Bubble radius scale (spend, revenue, or leads)
    const radiusMetric = (d: ChannelAttributionData) => {
      if (bubbleSizeMode === "revenue") return d.revenue;
      if (bubbleSizeMode === "leads") return d.leads;
      return d.spend;
    };
    const maxRadiusValue = d3.max(data, radiusMetric) || 10000;
    const rScale = d3.scaleSqrt().domain([0, maxRadiusValue]).range([14, 42]);

    // Benchmark Thresholds for Quadrants
    const midCr = maxCr * 0.45; // ~3.0%
    const midRoi = 200; // 200% ROI standard benchmark

    // Draw Subtle Quadrant Background Tints
    // Top-Right: Scale / High ROI & High CR (Emerald tint)
    g.append("rect")
      .attr("x", xScale(midCr))
      .attr("y", 0)
      .attr("width", innerWidth - xScale(midCr))
      .attr("height", yScale(midRoi))
      .attr("fill", "#10b981")
      .attr("fill-opacity", 0.04)
      .attr("rx", 8);

    // Top-Left: High ROI, Lower CR (Sky tint - Grow volume)
    g.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", xScale(midCr))
      .attr("height", yScale(midRoi))
      .attr("fill", "#0284c7")
      .attr("fill-opacity", 0.03)
      .attr("rx", 8);

    // Bottom-Right: High CR, Lower ROI (Amber tint - Optimize cost)
    g.append("rect")
      .attr("x", xScale(midCr))
      .attr("y", yScale(midRoi))
      .attr("width", innerWidth - xScale(midCr))
      .attr("height", innerHeight - yScale(midRoi))
      .attr("fill", "#f59e0b")
      .attr("fill-opacity", 0.03)
      .attr("rx", 8);

    // Bottom-Left: Low CR & Low ROI (Slate tint - Review/Reduce)
    g.append("rect")
      .attr("x", 0)
      .attr("y", yScale(midRoi))
      .attr("width", xScale(midCr))
      .attr("height", innerHeight - yScale(midRoi))
      .attr("fill", "#64748b")
      .attr("fill-opacity", 0.02)
      .attr("rx", 8);

    // Quadrant Labels (Watermarks)
    const watermarkGroup = g.append("g").attr("class", "watermarks").attr("font-family", "sans-serif");

    watermarkGroup
      .append("text")
      .attr("x", innerWidth - 12)
      .attr("y", 22)
      .attr("text-anchor", "end")
      .attr("fill", "#059669")
      .attr("font-size", "11px")
      .attr("font-weight", "800")
      .text("🚀 ÖLÇEKLENDİR (Yüksek ROI & Yüksek CR)");

    watermarkGroup
      .append("text")
      .attr("x", 12)
      .attr("y", 22)
      .attr("text-anchor", "start")
      .attr("fill", "#0284c7")
      .attr("font-size", "11px")
      .attr("font-weight", "800")
      .text("💡 TRAFİK BÜYÜT (Yüksek ROI, Düşük Hacim)");

    watermarkGroup
      .append("text")
      .attr("x", innerWidth - 12)
      .attr("y", innerHeight - 12)
      .attr("text-anchor", "end")
      .attr("fill", "#d97706")
      .attr("font-size", "11px")
      .attr("font-weight", "800")
      .text("🎯 MALİYETİ DÜŞÜR (Yüksek CR, Yüksek Bütçe)");

    watermarkGroup
      .append("text")
      .attr("x", 12)
      .attr("y", innerHeight - 12)
      .attr("text-anchor", "start")
      .attr("fill", "#64748b")
      .attr("font-size", "11px")
      .attr("font-weight", "700")
      .text("⚠️ REVİZE ET (Düşük ROI & CR)");

    // Grid Lines
    const xGrid = d3.axisBottom(xScale).ticks(6).tickSize(-innerHeight).tickFormat(() => "");
    const yGrid = d3.axisLeft(yScale).ticks(6).tickSize(-innerWidth).tickFormat(() => "");

    g.append("g")
      .attr("class", "grid x-grid")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xGrid)
      .selectAll("line")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-dasharray", "3,3");

    g.append("g")
      .attr("class", "grid y-grid")
      .call(yGrid)
      .selectAll("line")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-dasharray", "3,3");

    // Quadrant Crosshair Separator Lines
    g.append("line")
      .attr("x1", xScale(midCr))
      .attr("x2", xScale(midCr))
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", "#cbd5e1")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "4,4");

    g.append("line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", yScale(midRoi))
      .attr("y2", yScale(midRoi))
      .attr("stroke", "#cbd5e1")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "4,4");

    // Zero Breakeven Line (0% ROI)
    if (yScale(0) <= innerHeight) {
      g.append("line")
        .attr("x1", 0)
        .attr("x2", innerWidth)
        .attr("y1", yScale(0))
        .attr("y2", yScale(0))
        .attr("stroke", "#ef4444")
        .attr("stroke-width", 1.2)
        .attr("stroke-opacity", 0.6);

      g.append("text")
        .attr("x", innerWidth - 6)
        .attr("y", yScale(0) - 4)
        .attr("text-anchor", "end")
        .attr("fill", "#ef4444")
        .attr("font-size", "10px")
        .attr("font-weight", "bold")
        .text("0% Başa Baş (Breakeven)");
    }

    // Axes
    const xAxis = d3.axisBottom(xScale).ticks(6).tickFormat((d) => `%${d}`);
    const yAxis = d3.axisLeft(yScale).ticks(6).tickFormat((d) => `%${d}`);

    g.append("g")
      .attr("class", "axis x-axis")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis)
      .call((ax) => ax.select(".domain").attr("stroke", "#94a3b8"))
      .selectAll("text")
      .attr("fill", "#475569")
      .attr("font-size", "11px")
      .attr("font-weight", "600");

    g.append("g")
      .attr("class", "axis y-axis")
      .call(yAxis)
      .call((ax) => ax.select(".domain").attr("stroke", "#94a3b8"))
      .selectAll("text")
      .attr("fill", "#475569")
      .attr("font-size", "11px")
      .attr("font-weight", "600");

    // Axis Labels
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 46)
      .attr("text-anchor", "middle")
      .attr("fill", "#1e293b")
      .attr("font-size", "12px")
      .attr("font-weight", "700")
      .text("Dönüşüm Oranı (Conversion Rate %) ➔");

    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -54)
      .attr("text-anchor", "middle")
      .attr("fill", "#1e293b")
      .attr("font-size", "12px")
      .attr("font-weight", "700")
      .text("Yatırım Getirisi (ROI %) ➔");

    // Draw Bubbles Group
    const bubblesGroup = g.append("g").attr("class", "bubbles");

    const bubbleNodes = bubblesGroup
      .selectAll<SVGGElement, ChannelAttributionData>("g.bubble-node")
      .data(data, (d) => d.id)
      .enter()
      .append("g")
      .attr("class", "bubble-node")
      .attr("cursor", "pointer")
      .attr("transform", (d) => `translate(${xScale(d.conversionRate)},${yScale(d.roi)})`)
      .on("mouseenter", function (event, d) {
        setHoveredChannel(d);
        const [mx, my] = d3.pointer(event, containerRef.current);
        setTooltip({ x: mx, y: my, channel: d });

        d3.select(this)
          .select(".main-circle")
          .transition()
          .duration(200)
          .attr("r", rScale(radiusMetric(d)) + 6)
          .attr("filter", "url(#bubble-glow)");
      })
      .on("mousemove", function (event, d) {
        const [mx, my] = d3.pointer(event, containerRef.current);
        setTooltip({ x: mx, y: my, channel: d });
      })
      .on("mouseleave", function (event, d) {
        setHoveredChannel(null);
        setTooltip(null);

        d3.select(this)
          .select(".main-circle")
          .transition()
          .duration(200)
          .attr("r", rScale(radiusMetric(d)))
          .attr("filter", null);
      })
      .on("click", (event, d) => {
        onSelectSource(selectedSourceId === d.id ? "all" : d.id);
      });

    // Outer Halo Pulse Ring on Champion channel
    const championChannel = [...data].sort((a, b) => b.roi - a.roi)[0];
    if (championChannel) {
      const champNode = bubbleNodes.filter((d) => d.id === championChannel.id);
      champNode
        .append("circle")
        .attr("r", (d) => rScale(radiusMetric(d)) + 8)
        .attr("fill", "none")
        .attr("stroke", championChannel.color)
        .attr("stroke-width", 2)
        .attr("stroke-opacity", 0.5)
        .attr("stroke-dasharray", "4,3")
        .append("animateTransform")
        .attr("attributeName", "transform")
        .attr("type", "rotate")
        .attr("from", "0")
        .attr("to", "360")
        .attr("dur", "12s")
        .attr("repeatCount", "indefinite");
    }

    // Main Bubble Circles
    bubbleNodes
      .append("circle")
      .attr("class", "main-circle")
      .attr("r", 0)
      .attr("fill", (d) => `url(#grad-${d.id})`)
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2.5)
      .transition()
      .duration(750)
      .ease(d3.easeBackOut.overshoot(1.2))
      .attr("r", (d) => rScale(radiusMetric(d)));

    // Channel Icon / Short Text inside Bubble
    bubbleNodes
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("fill", "#ffffff")
      .attr("font-size", (d) => {
        const r = rScale(radiusMetric(d));
        return r < 20 ? "9px" : r < 30 ? "11px" : "13px";
      })
      .attr("font-weight", "800")
      .attr("pointer-events", "none")
      .text((d) => d.shortName);

    // Channel Label Pill Under Bubble
    bubbleNodes
      .append("text")
      .attr("text-anchor", "middle")
      .attr("y", (d) => rScale(radiusMetric(d)) + 15)
      .attr("fill", "#1e293b")
      .attr("font-size", "10.5px")
      .attr("font-weight", "700")
      .text((d) => `+%${d.roi} ROI • %${d.conversionRate} CR`);
  };

  // -----------------------------------------------------------------
  // 2. D3 COMPARATIVE DUAL-METRIC BARS (Spend vs Revenue vs ROI)
  // -----------------------------------------------------------------
  const drawComparativeBars = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    data: ChannelAttributionData[],
    width: number,
    height: number
  ) => {
    const margin = { top: 35, right: 35, bottom: 45, left: 130 };
    const innerWidth = Math.max(200, width - margin.left - margin.right);
    const innerHeight = Math.max(180, height - margin.top - margin.bottom);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const yScale = d3
      .scaleBand()
      .domain(data.map((d) => d.name))
      .range([0, innerHeight])
      .padding(0.35);

    const maxVal = d3.max(data, (d) => Math.max(d.spend, d.revenue)) || 50000;
    const xScale = d3
      .scaleLinear()
      .domain([0, maxVal * 1.15])
      .range([0, innerWidth])
      .nice();

    // Horizontal Grid
    const xGrid = d3.axisBottom(xScale).ticks(6).tickSize(-innerHeight).tickFormat(() => "");
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xGrid)
      .selectAll("line")
      .attr("stroke", "#f1f5f9");

    // Y Axis (Channels)
    g.append("g")
      .call(d3.axisLeft(yScale))
      .call((ax) => ax.select(".domain").remove())
      .selectAll("text")
      .attr("fill", "#1e293b")
      .attr("font-size", "11px")
      .attr("font-weight", "700");

    // X Axis (₺ Value)
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(6)
          .tickFormat((d) => `₺${(Number(d) / 1000).toFixed(0)}k`)
      )
      .call((ax) => ax.select(".domain").attr("stroke", "#cbd5e1"))
      .selectAll("text")
      .attr("fill", "#64748b")
      .attr("font-size", "11px")
      .attr("font-weight", "600");

    const channelGroups = g
      .selectAll("g.channel-bar-group")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "channel-bar-group")
      .attr("transform", (d) => `translate(0,${yScale(d.name)})`)
      .attr("cursor", "pointer")
      .on("mouseenter", function (event, d) {
        setHoveredChannel(d);
        const [mx, my] = d3.pointer(event, containerRef.current);
        setTooltip({ x: mx, y: my, channel: d });
      })
      .on("mousemove", function (event, d) {
        const [mx, my] = d3.pointer(event, containerRef.current);
        setTooltip({ x: mx, y: my, channel: d });
      })
      .on("mouseleave", () => {
        setHoveredChannel(null);
        setTooltip(null);
      })
      .on("click", (e, d) => onSelectSource(selectedSourceId === d.id ? "all" : d.id));

    const barHeight = (yScale.bandwidth() || 30) / 2.2;

    // Bar 1: Revenue (Emerald)
    channelGroups
      .append("rect")
      .attr("y", 0)
      .attr("x", 0)
      .attr("height", barHeight)
      .attr("rx", 4)
      .attr("fill", "#10b981")
      .attr("width", 0)
      .transition()
      .duration(600)
      .attr("width", (d) => xScale(d.revenue));

    // Revenue Value Label
    channelGroups
      .append("text")
      .attr("y", barHeight / 2)
      .attr("dy", "0.35em")
      .attr("x", (d) => xScale(d.revenue) + 8)
      .attr("fill", "#047857")
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .text((d) => `₺${d.revenue.toLocaleString("tr-TR")} Ciro (+%${d.roi} ROI)`);

    // Bar 2: Spend (Blue)
    channelGroups
      .append("rect")
      .attr("y", barHeight + 3)
      .attr("x", 0)
      .attr("height", barHeight)
      .attr("rx", 4)
      .attr("fill", "#3b82f6")
      .attr("width", 0)
      .transition()
      .duration(600)
      .attr("width", (d) => xScale(d.spend));

    // Spend Value Label
    channelGroups
      .append("text")
      .attr("y", barHeight + 3 + barHeight / 2)
      .attr("dy", "0.35em")
      .attr("x", (d) => xScale(d.spend) + 8)
      .attr("fill", "#1d4ed8")
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .text((d) => `₺${d.spend.toLocaleString("tr-TR")} Harcama (${d.leads} lead)`);
  };

  // -----------------------------------------------------------------
  // 3. D3 ALLOCATION DONUTS (Spend Share % vs Revenue Share %)
  // -----------------------------------------------------------------
  const drawAllocationDonuts = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    data: ChannelAttributionData[],
    width: number,
    height: number
  ) => {
    const radius = Math.min(width / 4 - 30, height / 2 - 40);
    const centerX1 = width * 0.28;
    const centerX2 = width * 0.72;
    const centerY = height / 2;

    const g = svg.append("g");

    // Donut 1: Spend Distribution
    const gSpend = g.append("g").attr("transform", `translate(${centerX1},${centerY})`);
    // Donut 2: Revenue Distribution
    const gRev = g.append("g").attr("transform", `translate(${centerX2},${centerY})`);

    const pieSpend = d3
      .pie<ChannelAttributionData>()
      .value((d) => Math.max(d.spend, 100))
      .sort(null);

    const pieRev = d3
      .pie<ChannelAttributionData>()
      .value((d) => Math.max(d.revenue, 100))
      .sort(null);

    const arc = d3
      .arc<d3.PieArcDatum<ChannelAttributionData>>()
      .innerRadius(radius * 0.55)
      .outerRadius(radius)
      .cornerRadius(4)
      .padAngle(0.03);

    // Draw Spend Donut
    gSpend
      .selectAll("path")
      .data(pieSpend(data))
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", (d) => d.data.color)
      .attr("cursor", "pointer")
      .on("mouseenter", (event, d) => {
        setHoveredChannel(d.data);
        const [mx, my] = d3.pointer(event, containerRef.current);
        setTooltip({ x: mx, y: my, channel: d.data });
      })
      .on("mouseleave", () => {
        setHoveredChannel(null);
        setTooltip(null);
      })
      .on("click", (e, d) => onSelectSource(selectedSourceId === d.data.id ? "all" : d.data.id));

    gSpend
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.2em")
      .attr("font-size", "14px")
      .attr("font-weight", "800")
      .attr("fill", "#0f172a")
      .text("Bütçe Dağılımı");
    gSpend
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1.2em")
      .attr("font-size", "11px")
      .attr("font-weight", "600")
      .attr("fill", "#64748b")
      .text("Pazarlama Harcaması");

    // Draw Revenue Donut
    gRev
      .selectAll("path")
      .data(pieRev(data))
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", (d) => d.data.color)
      .attr("cursor", "pointer")
      .on("mouseenter", (event, d) => {
        setHoveredChannel(d.data);
        const [mx, my] = d3.pointer(event, containerRef.current);
        setTooltip({ x: mx, y: my, channel: d.data });
      })
      .on("mouseleave", () => {
        setHoveredChannel(null);
        setTooltip(null);
      })
      .on("click", (e, d) => onSelectSource(selectedSourceId === d.data.id ? "all" : d.data.id));

    gRev
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.2em")
      .attr("font-size", "14px")
      .attr("font-weight", "800")
      .attr("fill", "#0f172a")
      .text("Ciro Getirisi");
    gRev
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1.2em")
      .attr("font-size", "11px")
      .attr("font-weight", "600")
      .attr("fill", "#64748b")
      .text("Atfedilen Satışlar");
  };

  return (
    <div className="relative w-full bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Chart Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-slate-50 border-b border-slate-200/80">
        {/* Left: View Mode Switches */}
        <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => onViewModeChange && onViewModeChange("quadrant")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === "quadrant"
                ? "bg-white text-slate-900 shadow-xs font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
            title="D3.js ROI vs Dönüşüm Oranı Dağılım Matrisi"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>ROI &amp; CR Matrisi (D3)</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange && onViewModeChange("bars")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === "bars"
                ? "bg-white text-slate-900 shadow-xs font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
            title="Harcama ve Ciro Çubuk Karşılaştırması"
          >
            <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Harcama vs Getiri</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange && onViewModeChange("allocation")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === "allocation"
                ? "bg-white text-slate-900 shadow-xs font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
            title="Bütçe Payı vs Ciro Payı Karşılaştırması"
          >
            <PieIcon className="w-3.5 h-3.5 text-purple-600" />
            <span>Bütçe Dağılım Payı</span>
          </button>
        </div>

        {/* Right: Bubble Sizing Selector for Quadrant View */}
        {viewMode === "quadrant" && (
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <span className="text-slate-500 font-semibold">Baloncuk Boyutu:</span>
            <div className="flex items-center gap-1 bg-slate-200/70 p-0.5 rounded-lg">
              <button
                type="button"
                onClick={() => onBubbleSizeModeChange && onBubbleSizeModeChange("spend")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-all ${
                  bubbleSizeMode === "spend"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Harcama (₺)
              </button>
              <button
                type="button"
                onClick={() => onBubbleSizeModeChange && onBubbleSizeModeChange("revenue")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-all ${
                  bubbleSizeMode === "revenue"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Ciro (₺)
              </button>
              <button
                type="button"
                onClick={() => onBubbleSizeModeChange && onBubbleSizeModeChange("leads")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-all ${
                  bubbleSizeMode === "leads"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Lead Sayısı
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SVG Canvas Container */}
      <div ref={containerRef} className="relative w-full overflow-hidden select-none">
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-auto block"
        />

        {/* Interactive Floating Tooltip */}
        {tooltip && (
          <div
            className="absolute z-30 pointer-events-none p-3.5 bg-slate-950/95 backdrop-blur-md text-white rounded-xl shadow-xl border border-slate-700/80 text-xs w-72 transition-all duration-75 ease-out"
            style={{
              left: Math.min(tooltip.x + 15, dimensions.width - 300),
              top: Math.max(10, Math.min(tooltip.y - 70, dimensions.height - 200))
            }}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: tooltip.channel.color }}
                />
                <span className="font-bold text-white text-sm">{tooltip.channel.shortName}</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide ${
                  tooltip.channel.efficiencyTier === "scale"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : tooltip.channel.efficiencyTier === "leader"
                    ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                    : tooltip.channel.efficiencyTier === "optimize"
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    : "bg-slate-700 text-slate-300"
                }`}
              >
                {tooltip.channel.efficiencyTier === "scale"
                  ? "Lider Büyüme"
                  : tooltip.channel.efficiencyTier === "leader"
                  ? "Yüksek ROI"
                  : tooltip.channel.efficiencyTier === "optimize"
                  ? "Birim Maliyet"
                  : "Revize Edilmeli"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 my-2.5 text-[11px]">
              <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Yatırım Getirisi</span>
                <span className="font-extrabold text-emerald-400 text-sm">
                  +%{tooltip.channel.roi} ROI
                </span>
              </div>
              <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Dönüşüm Oranı</span>
                <span className="font-extrabold text-indigo-400 text-sm">
                  %{tooltip.channel.conversionRate} CR
                </span>
              </div>
              <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Aylık Harcama</span>
                <span className="font-bold text-slate-200">
                  ₺{tooltip.channel.spend.toLocaleString("tr-TR")}
                </span>
              </div>
              <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Atfedilen Ciro</span>
                <span className="font-bold text-slate-200">
                  ₺{tooltip.channel.revenue.toLocaleString("tr-TR")}
                </span>
              </div>
              <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Lead Başı Maliyet</span>
                <span className="font-bold text-amber-300">
                  ₺{tooltip.channel.cpl} CPL
                </span>
              </div>
              <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Toplam Lead / Satış</span>
                <span className="font-bold text-slate-200">
                  {tooltip.channel.leads} lead / {tooltip.channel.closedDeals} anlaşma
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300">
              <div className="flex items-start gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">{tooltip.channel.recommendation.title}:</strong>{" "}
                  {tooltip.channel.recommendation.summary}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Legend & Source Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 bg-slate-50/80 border-t border-slate-200/80 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-500 font-bold text-[11px] uppercase tracking-wider mr-1">
            Filtrele:
          </span>
          <button
            type="button"
            onClick={() => onSelectSource("all")}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedSourceId === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-200/80 text-slate-700 hover:bg-slate-300"
            }`}
          >
            Tüm Kanallar ({channels.length})
          </button>
          {channels.map((c) => {
            const isSelected = selectedSourceId === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelectSource(isSelected ? "all" : c.id)}
                className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-white text-slate-700 border-slate-300 hover:border-slate-400"
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                <span>{c.shortName}</span>
                <span className="opacity-80 font-mono text-[10px]">+{c.roi}%</span>
              </button>
            );
          })}
        </div>

        <div className="text-[11px] text-slate-500 flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>D3.js ile gerçek zamanlı dinamik render</span>
        </div>
      </div>
    </div>
  );
};
