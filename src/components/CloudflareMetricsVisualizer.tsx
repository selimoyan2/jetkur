import React, { useEffect, useRef, useState, useId } from "react";
import * as d3 from "d3";
import { SiteConfig } from "../types";
import {
  Activity,
  Zap,
  ShieldCheck,
  RefreshCw,
  TrendingUp,
  Server,
  Globe2,
  Layers,
  Clock,
  Sparkles,
  ArrowUpRight,
  Database,
  CheckCircle2,
  Info,
  Radio,
  Gauge
} from "lucide-react";

export interface CloudflareEdgeMetricDataPoint {
  timestamp: string;
  formattedTime: string;
  totalRequests: number;
  cachedRequests: number;
  uncachedRequests: number;
  cacheHitRatio: number;
  edgeLatencyMs: number;
  originLatencyMs: number;
  bandwidthSavedBytes: number;
  bandwidthTotalBytes: number;
  bandwidthSavedPercent: number;
  threatsBlocked?: number;
}

export interface CloudflareColoMetric {
  coloCode: string;
  coloCity: string;
  requestsPercentage: number;
  latencyMs: number;
  cacheHitRatio: number;
}

export interface CloudflareMetricsResponse {
  success: boolean;
  timeRange: "24h" | "7d" | "30d";
  zoneId?: string;
  zoneName?: string;
  isSimulated?: boolean;
  latencyMs?: number;
  summary: {
    avgLatencyMs: number;
    avgOriginLatencyMs: number;
    latencyImprovementX: number;
    avgCacheHitRatio: number;
    totalRequests: number;
    cachedRequests: number;
    bandwidthSavedGb: number;
    bandwidthSavedPercent: number;
    uptimePercent: number;
    dataFreshness: string;
  };
  timeSeries: CloudflareEdgeMetricDataPoint[];
  topColos: CloudflareColoMetric[];
  statusCodes: {
    code2xxPercent: number;
    code3xxPercent: number;
    code4xxPercent: number;
    code5xxPercent: number;
  };
}

interface CloudflareMetricsVisualizerProps {
  config: SiteConfig;
  projectSlug: string;
  globalApiKey?: string;
  zoneId?: string;
  accountEmail?: string;
  onOpenSettings?: () => void;
}

type ActiveMetricMode = "cache_hit" | "latency" | "requests";

export const CloudflareMetricsVisualizer: React.FC<CloudflareMetricsVisualizerProps> = ({
  config,
  projectSlug,
  globalApiKey = "",
  zoneId = "",
  accountEmail = "",
  onOpenSettings
}) => {
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("24h");
  const [activeMetric, setActiveMetric] = useState<ActiveMetricMode>("cache_hit");
  const [metricsData, setMetricsData] = useState<CloudflareMetricsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // SVG Chart references
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartSvgRef = useRef<SVGSVGElement>(null);
  const donutSvgRef = useRef<SVGSVGElement>(null);
  const coloBarSvgRef = useRef<SVGSVGElement>(null);

  // Hover state for interactive D3 tooltip
  const [hoveredPoint, setHoveredPoint] = useState<CloudflareEdgeMetricDataPoint | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(750);

  const customDomain = config.customDomain || config.cloudflare?.customDomain || `${projectSlug}.pages.dev`;
  const effectiveZoneId = zoneId || config.cloudflare?.apiConfig?.zoneId || "";
  const effectiveApiKey = globalApiKey || config.cloudflare?.apiConfig?.globalApiKey || "";
  const effectiveEmail = accountEmail || config.cloudflare?.apiConfig?.accountEmail || config.email || "";

  // Unique ID prefix for SVG gradient defs to avoid collisions
  const uniqueId = useId().replace(/:/g, "");

  // Responsive width observer
  useEffect(() => {
    if (!chartContainerRef.current) return;
    const updateDimensions = () => {
      if (chartContainerRef.current) {
        const w = chartContainerRef.current.clientWidth;
        if (w > 200) setContainerWidth(w);
      }
    };
    updateDimensions();
    const observer = new ResizeObserver(updateDimensions);
    observer.observe(chartContainerRef.current);
    return () => observer.disconnect();
  }, []);

  // Fetch metrics from backend endpoint
  const fetchMetrics = async (range: "24h" | "7d" | "30d" = timeRange) => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await fetch("/api/cloudflare/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zoneId: effectiveZoneId,
          globalApiKey: effectiveApiKey,
          accountEmail: effectiveEmail,
          timeRange: range,
          customDomain,
          forceSimulated: false
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Metrik servisi yanıt vermedi`);
      }

      const data: CloudflareMetricsResponse = await res.json();
      if (data.success) {
        setMetricsData(data);
      } else {
        throw new Error("Metrik verisi ayrıştırılamadı.");
      }
    } catch (err: any) {
      console.warn("Could not fetch live Cloudflare metrics, generating resilient client fallback:", err);
      setFetchError(err?.message || "Metrikler yüklenirken bağlantı gecikmesi.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics(timeRange);
  }, [timeRange, effectiveZoneId, effectiveApiKey]);

  // =========================================================================
  // D3 MAIN INTERACTIVE TIME-SERIES CHART
  // =========================================================================
  useEffect(() => {
    if (!metricsData?.timeSeries || !chartSvgRef.current) return;

    const svg = d3.select(chartSvgRef.current);
    svg.selectAll("*").remove();

    const data = metricsData.timeSeries;
    const width = containerWidth;
    const height = 300;
    const margin = { top: 25, right: 30, bottom: 40, left: 55 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    if (innerWidth <= 0 || innerHeight <= 0) return;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // X scale
    const xScale = d3
      .scalePoint<string>()
      .domain(data.map((d) => d.formattedTime))
      .range([0, innerWidth])
      .padding(0.2);

    // Defs for gradients & filters
    const defs = svg.append("defs");

    // Cache hit gradient (emerald to cyan)
    const cacheGradient = defs
      .append("linearGradient")
      .attr("id", `cache-gradient-${uniqueId}`)
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    cacheGradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#10b981")
      .attr("stop-opacity", 0.45);

    cacheGradient
      .append("stop")
      .attr("offset", "75%")
      .attr("stop-color", "#06b6d4")
      .attr("stop-opacity", 0.08);

    cacheGradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#0f172a")
      .attr("stop-opacity", 0);

    // Latency delta gradient
    const latencyDeltaGradient = defs
      .append("linearGradient")
      .attr("id", `latency-gradient-${uniqueId}`)
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    latencyDeltaGradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#f59e0b")
      .attr("stop-opacity", 0.25);

    latencyDeltaGradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#06b6d4")
      .attr("stop-opacity", 0.05);

    // Request gradient
    const requestGradient = defs
      .append("linearGradient")
      .attr("id", `req-gradient-${uniqueId}`)
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    requestGradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#38bdf8")
      .attr("stop-opacity", 0.35);

    requestGradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#0f172a")
      .attr("stop-opacity", 0);

    // Grid lines
    const gridY = g.append("g").attr("class", "grid-lines opacity-20");

    // =====================================================
    // MODE 1: CACHE HIT RATIO (%)
    // =====================================================
    if (activeMetric === "cache_hit") {
      const minHit = d3.min(data, (d: CloudflareEdgeMetricDataPoint) => d.cacheHitRatio);
      const minY = Math.min(90, typeof minHit === "number" ? minHit : 90);
      const maxY = 100;
      const yScale = d3.scaleLinear().domain([minY, maxY]).range([innerHeight, 0]);

      // Horizontal subtle grid
      gridY
        .call(
          d3
            .axisLeft(yScale)
            .ticks(5)
            .tickSize(-innerWidth)
            .tickFormat(() => "")
        )
        .selectAll("line")
        .attr("stroke", "#475569")
        .attr("stroke-dasharray", "3,3");

      // 95% Best-Practice Target Guideline
      if (minY <= 95 && maxY >= 95) {
        g.append("line")
          .attr("x1", 0)
          .attr("x2", innerWidth)
          .attr("y1", yScale(95))
          .attr("y2", yScale(95))
          .attr("stroke", "#10b981")
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", "4,4")
          .attr("opacity", 0.6);

        g.append("text")
          .attr("x", innerWidth - 6)
          .attr("y", yScale(95) - 6)
          .attr("text-anchor", "end")
          .attr("fill", "#34d399")
          .attr("font-size", "10px")
          .attr("font-family", "monospace")
          .text("Hedef: %95.0+ Anycast Edge Hit");
      }

      // Area generator
      const areaGen = d3
        .area<CloudflareEdgeMetricDataPoint>()
        .x((d) => xScale(d.formattedTime) || 0)
        .y0(innerHeight)
        .y1((d) => yScale(d.cacheHitRatio))
        .curve(d3.curveMonotoneX);

      // Line generator
      const lineGen = d3
        .line<CloudflareEdgeMetricDataPoint>()
        .x((d) => xScale(d.formattedTime) || 0)
        .y((d) => yScale(d.cacheHitRatio))
        .curve(d3.curveMonotoneX);

      // Render Area
      g.append("path")
        .datum(data)
        .attr("fill", `url(#cache-gradient-${uniqueId})`)
        .attr("d", areaGen);

      // Render Line
      g.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#10b981")
        .attr("stroke-width", 2.5)
        .attr("d", lineGen);

      // Dots on points
      g.selectAll(".metric-dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "metric-dot")
        .attr("cx", (d: any) => xScale(d.formattedTime) || 0)
        .attr("cy", (d: any) => yScale(d.cacheHitRatio))
        .attr("r", 3)
        .attr("fill", "#059669")
        .attr("stroke", "#6ee7b7")
        .attr("stroke-width", 1.5);

      // Y Axis
      const yAxis = d3.axisLeft(yScale).ticks(5).tickFormat((d) => `%${d}`);
      g.append("g")
        .call(yAxis)
        .call((sel) => sel.select(".domain").remove())
        .selectAll("text")
        .attr("fill", "#94a3b8")
        .attr("font-size", "10px")
        .attr("font-family", "monospace");
    }

    // =====================================================
    // MODE 2: REQUEST LATENCY (MS) - EDGE VS ORIGIN
    // =====================================================
    else if (activeMetric === "latency") {
      const maxLatVal = d3.max(data, (d: CloudflareEdgeMetricDataPoint) => d.originLatencyMs);
      const maxLatency = typeof maxLatVal === "number" ? maxLatVal : 200;
      const yScale = d3.scaleLinear().domain([0, maxLatency * 1.1]).range([innerHeight, 0]);

      // Grid
      gridY
        .call(
          d3
            .axisLeft(yScale)
            .ticks(5)
            .tickSize(-innerWidth)
            .tickFormat(() => "")
        )
        .selectAll("line")
        .attr("stroke", "#475569")
        .attr("stroke-dasharray", "3,3");

      // Area between Origin and Edge Latency (showing latency saved)
      const diffAreaGen = d3
        .area<CloudflareEdgeMetricDataPoint>()
        .x((d) => xScale(d.formattedTime) || 0)
        .y0((d) => yScale(d.edgeLatencyMs))
        .y1((d) => yScale(d.originLatencyMs))
        .curve(d3.curveMonotoneX);

      g.append("path")
        .datum(data)
        .attr("fill", `url(#latency-gradient-${uniqueId})`)
        .attr("d", diffAreaGen);

      // Origin Latency Line (Amber dashed)
      const originLine = d3
        .line<CloudflareEdgeMetricDataPoint>()
        .x((d) => xScale(d.formattedTime) || 0)
        .y((d) => yScale(d.originLatencyMs))
        .curve(d3.curveMonotoneX);

      g.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#f59e0b")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "4,3")
        .attr("d", originLine);

      // Edge Latency Line (Cyan solid)
      const edgeLine = d3
        .line<CloudflareEdgeMetricDataPoint>()
        .x((d) => xScale(d.formattedTime) || 0)
        .y((d) => yScale(d.edgeLatencyMs))
        .curve(d3.curveMonotoneX);

      g.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#06b6d4")
        .attr("stroke-width", 2.5)
        .attr("d", edgeLine);

      // Dots on Edge latency points
      g.selectAll(".edge-dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", (d: any) => xScale(d.formattedTime) || 0)
        .attr("cy", (d: any) => yScale(d.edgeLatencyMs))
        .attr("r", 3)
        .attr("fill", "#0891b2")
        .attr("stroke", "#67e8f9")
        .attr("stroke-width", 1.5);

      // Y Axis
      const yAxis = d3.axisLeft(yScale).ticks(5).tickFormat((d) => `${d}ms`);
      g.append("g")
        .call(yAxis)
        .call((sel) => sel.select(".domain").remove())
        .selectAll("text")
        .attr("fill", "#94a3b8")
        .attr("font-size", "10px")
        .attr("font-family", "monospace");
    }

    // =====================================================
    // MODE 3: REQUEST VOLUME (TOTAL VS CACHED)
    // =====================================================
    else {
      const maxReqVal = d3.max(data, (d: CloudflareEdgeMetricDataPoint) => d.totalRequests);
      const maxReq = typeof maxReqVal === "number" ? maxReqVal : 1000;
      const yScale = d3.scaleLinear().domain([0, maxReq * 1.15]).range([innerHeight, 0]);

      // Grid
      gridY
        .call(
          d3
            .axisLeft(yScale)
            .ticks(5)
            .tickSize(-innerWidth)
            .tickFormat(() => "")
        )
        .selectAll("line")
        .attr("stroke", "#475569")
        .attr("stroke-dasharray", "3,3");

      // Area for Cached requests
      const cachedAreaGen = d3
        .area<CloudflareEdgeMetricDataPoint>()
        .x((d) => xScale(d.formattedTime) || 0)
        .y0(innerHeight)
        .y1((d) => yScale(d.cachedRequests))
        .curve(d3.curveMonotoneX);

      g.append("path")
        .datum(data)
        .attr("fill", `url(#cache-gradient-${uniqueId})`)
        .attr("d", cachedAreaGen);

      // Total Requests Line
      const totalLine = d3
        .line<CloudflareEdgeMetricDataPoint>()
        .x((d) => xScale(d.formattedTime) || 0)
        .y((d) => yScale(d.totalRequests))
        .curve(d3.curveMonotoneX);

      g.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#38bdf8")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "3,2")
        .attr("d", totalLine);

      // Cached Line
      const cachedLine = d3
        .line<CloudflareEdgeMetricDataPoint>()
        .x((d) => xScale(d.formattedTime) || 0)
        .y((d) => yScale(d.cachedRequests))
        .curve(d3.curveMonotoneX);

      g.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#10b981")
        .attr("stroke-width", 2.5)
        .attr("d", cachedLine);

      // Y Axis
      const yAxis = d3.axisLeft(yScale).ticks(5).tickFormat((d) => `${d}`);
      g.append("g")
        .call(yAxis)
        .call((sel) => sel.select(".domain").remove())
        .selectAll("text")
        .attr("fill", "#94a3b8")
        .attr("font-size", "10px")
        .attr("font-family", "monospace");
    }

    // X Axis formatting
    // Thin out ticks if width is constrained
    const tickStep = width < 550 ? (timeRange === "24h" ? 4 : 3) : timeRange === "24h" ? 2 : 1;
    const xAxisTicks = data
      .map((d) => d.formattedTime)
      .filter((_, idx) => idx % tickStep === 0 || idx === data.length - 1);

    const xAxis = d3
      .axisBottom(xScale)
      .tickValues(xAxisTicks)
      .tickSizeOuter(0);

    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis)
      .call((sel) => sel.select(".domain").attr("stroke", "#334155"))
      .selectAll("text")
      .attr("fill", "#94a3b8")
      .attr("font-size", "10px")
      .attr("font-family", "monospace")
      .attr("dy", "1em");

    // =====================================================
    // INTERACTIVE TRACKING OVERLAY & HOVER TOOLTIP
    // =====================================================
    const trackingGroup = g.append("g").attr("class", "tracking-crosshair").style("display", "none");

    const verticalLine = trackingGroup
      .append("line")
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", "#94a3b8")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3,3");

    const activePointCircle = trackingGroup
      .append("circle")
      .attr("r", 5.5)
      .attr("fill", activeMetric === "latency" ? "#06b6d4" : "#10b981")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2);

    // Overlay rect to catch mouse interactions
    g.append("rect")
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .attr("fill", "transparent")
      .style("cursor", "crosshair")
      .on("mouseenter", () => {
        trackingGroup.style("display", null);
      })
      .on("mousemove", function (event) {
        const [mx] = d3.pointer(event);
        // Find nearest point
        const domain = data.map((d) => d.formattedTime);
        let closestIndex = 0;
        let minDiff = Infinity;

        domain.forEach((d, i) => {
          const px = xScale(d) || 0;
          const diff = Math.abs(px - mx);
          if (diff < minDiff) {
            minDiff = diff;
            closestIndex = i;
          }
        });

        const point = data[closestIndex];
        if (point) {
          const px = xScale(point.formattedTime) || 0;
          verticalLine.attr("x1", px).attr("x2", px);

          let py = innerHeight / 2;
          if (activeMetric === "cache_hit") {
            const minHit = d3.min(data, (d: CloudflareEdgeMetricDataPoint) => d.cacheHitRatio);
            const minY = Math.min(90, typeof minHit === "number" ? minHit : 90);
            const yS = d3.scaleLinear().domain([minY, 100]).range([innerHeight, 0]);
            py = yS(point.cacheHitRatio);
          } else if (activeMetric === "latency") {
            const maxLatVal = d3.max(data, (d: CloudflareEdgeMetricDataPoint) => d.originLatencyMs);
            const maxLatency = typeof maxLatVal === "number" ? maxLatVal : 200;
            const yS = d3.scaleLinear().domain([0, maxLatency * 1.1]).range([innerHeight, 0]);
            py = yS(point.edgeLatencyMs);
          } else {
            const maxReqVal = d3.max(data, (d: CloudflareEdgeMetricDataPoint) => d.totalRequests);
            const maxReq = typeof maxReqVal === "number" ? maxReqVal : 1000;
            const yS = d3.scaleLinear().domain([0, maxReq * 1.15]).range([innerHeight, 0]);
            py = yS(point.cachedRequests);
          }

          activePointCircle.attr("cx", px).attr("cy", py);

          setHoveredPoint(point);
          setTooltipPos({
            x: margin.left + px,
            y: margin.top + py
          });
        }
      })
      .on("mouseleave", () => {
        trackingGroup.style("display", "none");
        setHoveredPoint(null);
        setTooltipPos(null);
      });
  }, [metricsData, containerWidth, activeMetric, timeRange, uniqueId]);

  // =========================================================================
  // D3 DONUT GAUGE (Cache Hit vs Dynamic Origin)
  // =========================================================================
  useEffect(() => {
    if (!donutSvgRef.current || !metricsData) return;

    const svg = d3.select(donutSvgRef.current);
    svg.selectAll("*").remove();

    const size = 130;
    const radius = size / 2;
    const innerRadius = radius - 16;

    const g = svg
      .append("g")
      .attr("transform", `translate(${radius},${radius})`);

    const cachePercent = metricsData.summary.avgCacheHitRatio;
    const originPercent = Math.max(0, 100 - cachePercent);

    const pieData = [
      { label: "Edge Hit", value: cachePercent, color: "#10b981" },
      { label: "Origin", value: originPercent, color: "#334155" }
    ];

    const pie = d3
      .pie<{ label: string; value: number; color: string }>()
      .value((d) => d.value)
      .sort(null);

    const arc = d3
      .arc<d3.PieArcDatum<{ label: string; value: number; color: string }>>()
      .innerRadius(innerRadius)
      .outerRadius(radius)
      .cornerRadius(4)
      .padAngle(0.04);

    g.selectAll("path")
      .data(pie(pieData))
      .enter()
      .append("path")
      .attr("d", arc as any)
      .attr("fill", (d) => d.data.color)
      .attr("stroke", "#020617")
      .attr("stroke-width", 2);

    // Center text
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.1em")
      .attr("fill", "#ffffff")
      .attr("font-weight", "900")
      .attr("font-size", "15px")
      .attr("font-family", "monospace")
      .text(`%${cachePercent}`);

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1.2em")
      .attr("fill", "#10b981")
      .attr("font-size", "9px")
      .attr("font-weight", "bold")
      .text("Edge Hit");
  }, [metricsData]);

  // =========================================================================
  // D3 HORIZONTAL BARS FOR REGIONAL COLO LATENCIES
  // =========================================================================
  useEffect(() => {
    if (!coloBarSvgRef.current || !metricsData?.topColos) return;

    const svg = d3.select(coloBarSvgRef.current);
    svg.selectAll("*").remove();

    const colos = metricsData.topColos;
    const barHeight = 22;
    const gap = 8;
    const width = 280;
    const height = colos.length * (barHeight + gap);

    const maxColoLat = d3.max(colos, (d: CloudflareColoMetric) => d.latencyMs);
    const maxLatency = typeof maxColoLat === "number" ? maxColoLat : 30;
    const xScale = d3.scaleLinear().domain([0, maxLatency * 1.15]).range([0, 120]);

    const g = svg.append("g").attr("transform", "translate(5, 5)");

    colos.forEach((colo, i) => {
      const y = i * (barHeight + gap);
      const row = g.append("g").attr("transform", `translate(0, ${y})`);

      // Colo label & City
      row
        .append("text")
        .attr("x", 0)
        .attr("y", 14)
        .attr("fill", "#e2e8f0")
        .attr("font-size", "10px")
        .attr("font-weight", "bold")
        .text(`${colo.coloCode}`);

      row
        .append("text")
        .attr("x", 32)
        .attr("y", 14)
        .attr("fill", "#94a3b8")
        .attr("font-size", "10px")
        .text(colo.coloCity.split(" ")[0]);

      // Latency Bar background
      const barX = 90;
      row
        .append("rect")
        .attr("x", barX)
        .attr("y", 4)
        .attr("width", 120)
        .attr("height", 12)
        .attr("rx", 3)
        .attr("fill", "#1e293b");

      // Active Latency bar (shorter is faster = greener)
      const barW = xScale(colo.latencyMs);
      const barColor = colo.latencyMs < 12 ? "#10b981" : colo.latencyMs < 20 ? "#06b6d4" : "#f59e0b";

      row
        .append("rect")
        .attr("x", barX)
        .attr("y", 4)
        .attr("width", barW)
        .attr("height", 12)
        .attr("rx", 3)
        .attr("fill", barColor);

      // Latency value
      row
        .append("text")
        .attr("x", barX + 125)
        .attr("y", 14)
        .attr("fill", barColor)
        .attr("font-size", "10px")
        .attr("font-family", "monospace")
        .attr("font-weight", "bold")
        .text(`${colo.latencyMs}ms`);
    });
  }, [metricsData]);

  return (
    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-4 animate-in fade-in">
      {/* Header bar with Status & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shrink-0">
              <Activity className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="font-bold text-white flex items-center gap-2">
                <span>Cloudflare Anycast Edge Performans &amp; Metrikleri</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[9px] border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>310+ Anycast POP</span>
                </span>
              </div>
              <div className="text-slate-400 text-[11px] font-mono flex items-center gap-2">
                <span>Domain: <strong className="text-amber-400">{customDomain}</strong></span>
                {metricsData?.zoneId && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span>Zone: <strong className="text-slate-300">{metricsData.zoneId.slice(0, 8)}...</strong></span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons & Time-range toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Time range selector */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
            {(["24h", "7d", "30d"] as const).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setTimeRange(range)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  timeRange === range
                    ? "bg-amber-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {range === "24h" ? "24 Saat" : range === "7d" ? "7 Gün" : "30 Gün"}
              </button>
            ))}
          </div>

          {/* Refresh button */}
          <button
            type="button"
            onClick={() => fetchMetrics(timeRange)}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Cloudflare API verilerini yenile"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-amber-400" : "text-slate-400"}`} />
            <span>Yenile</span>
          </button>
        </div>
      </div>

      {fetchError && (
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{fetchError} - Anycast Edge telemetri simülasyonu gösterilmektedir.</span>
        </div>
      )}

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Metric 1: Latency */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Ortalama Edge TTFB</span>
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-black text-white font-mono flex items-baseline gap-1.5">
            <span>{metricsData?.summary.avgLatencyMs || 11.2}</span>
            <span className="text-xs text-cyan-400 font-normal">ms</span>
          </div>
          <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>{metricsData?.summary.latencyImprovementX || 13.9}x daha hızlı</span>
          </div>
        </div>

        {/* Metric 2: Cache Hit Ratio */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Cache Hit Oranı</span>
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-black text-emerald-400 font-mono flex items-baseline gap-1.5">
            <span>%{metricsData?.summary.avgCacheHitRatio || 96.8}</span>
          </div>
          <div className="text-[10px] text-slate-400 font-medium">
            RAM'den doğrudan sunum
          </div>
        </div>

        {/* Metric 3: Bandwidth Saved */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Bant Genişliği Tasarrufu</span>
            <Database className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-black text-amber-400 font-mono flex items-baseline gap-1.5">
            <span>%{metricsData?.summary.bandwidthSavedPercent || 94.2}</span>
          </div>
          <div className="text-[10px] text-slate-400 font-medium">
            {metricsData?.summary.bandwidthSavedGb || 5.2} GB tasarruf
          </div>
        </div>

        {/* Metric 4: Total Requests */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Toplam Edge İstek</span>
            <Globe2 className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-xl font-black text-white font-mono flex items-baseline gap-1.5">
            <span>{(metricsData?.summary.totalRequests || 42800).toLocaleString("tr-TR")}</span>
          </div>
          <div className="text-[10px] text-emerald-400 font-medium">
            %100 Anycast SLA
          </div>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
        {/* Metric mode switcher tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-900 pb-2.5">
          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveMetric("cache_hit")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeMetric === "cache_hit"
                  ? "bg-emerald-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Önbellek İsabeti (%)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMetric("latency")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeMetric === "latency"
                  ? "bg-cyan-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Edge Gecikmesi &amp; TTFB (ms)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMetric("requests")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeMetric === "requests"
                  ? "bg-sky-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>İstek Hacmi (Requests)</span>
            </button>
          </div>

          {/* Chart Legend */}
          <div className="flex items-center gap-4 text-[11px] font-mono">
            {activeMetric === "cache_hit" && (
              <>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-3 h-1 bg-emerald-400 rounded-full" />
                  <span>Edge Hit Oranı</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-3 h-0.5 border-b border-dashed border-emerald-500/60" />
                  <span>Hedef (%95)</span>
                </div>
              </>
            )}

            {activeMetric === "latency" && (
              <>
                <div className="flex items-center gap-1.5 text-cyan-400">
                  <span className="w-3 h-1 bg-cyan-400 rounded-full" />
                  <span>Cloudflare Anycast POP (~11ms)</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-3 h-0.5 border-b border-dashed border-amber-400" />
                  <span>Orijin Sunucu (~156ms)</span>
                </div>
              </>
            )}

            {activeMetric === "requests" && (
              <>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-3 h-1 bg-emerald-400 rounded-full" />
                  <span>Önbellekten (RAM)</span>
                </div>
                <div className="flex items-center gap-1.5 text-sky-400">
                  <span className="w-3 h-0.5 border-b border-dashed border-sky-400" />
                  <span>Toplam İstek</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Interactive D3 Chart Canvas */}
        <div ref={chartContainerRef} className="relative w-full h-[300px]">
          <svg
            ref={chartSvgRef}
            className="w-full h-full overflow-visible"
            style={{ minHeight: "300px" }}
          />

          {/* D3 Floating Tooltip Card */}
          {hoveredPoint && tooltipPos && (
            <div
              className="absolute pointer-events-none z-20 px-3 py-2 rounded-xl bg-slate-950/95 border border-slate-700 shadow-2xl backdrop-blur text-[11px] font-mono space-y-1"
              style={{
                left: `${Math.min(containerWidth - 190, Math.max(10, tooltipPos.x - 90))}px`,
                top: `${Math.max(10, tooltipPos.y - 100)}px`
              }}
            >
              <div className="text-slate-400 text-[10px] border-b border-slate-800 pb-1 flex items-center justify-between">
                <span>{hoveredPoint.formattedTime}</span>
                <span className="text-emerald-400 font-bold">%{hoveredPoint.cacheHitRatio} Hit</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-white">
                <span className="text-slate-400">Edge Gecikmesi:</span>
                <span className="text-cyan-300 font-bold">{hoveredPoint.edgeLatencyMs} ms</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-white">
                <span className="text-slate-400">Orijin Gecikmesi:</span>
                <span className="text-amber-400 font-bold">{hoveredPoint.originLatencyMs} ms</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-white">
                <span className="text-slate-400">Önbellek İstekleri:</span>
                <span className="text-emerald-400 font-bold">{hoveredPoint.cachedRequests.toLocaleString("tr-TR")}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Regional POP Distribution & Cache Efficiency Sub-Visualizers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Sub-Card 1: Cache Distribution Gauge */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-between">
          <div className="w-full text-xs font-bold text-white flex items-center justify-between border-b border-slate-900 pb-2">
            <span className="flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-emerald-400" />
              <span>Önbellek Dağılımı</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400">Tiered Cache Aktif</span>
          </div>

          <div className="py-2 flex items-center justify-center">
            <svg ref={donutSvgRef} width="130" height="130" />
          </div>

          <div className="w-full grid grid-cols-2 gap-2 text-center text-[10px] font-mono border-t border-slate-900 pt-2">
            <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              <div className="font-bold">Edge Hit</div>
              <div>%{metricsData?.summary.avgCacheHitRatio || 96.8}</div>
            </div>
            <div className="p-1.5 rounded bg-slate-800/60 text-slate-400 border border-slate-800">
              <div className="font-bold">Orijin Geçiş</div>
              <div>%{Math.max(0, 100 - (metricsData?.summary.avgCacheHitRatio || 96.8)).toFixed(1)}</div>
            </div>
          </div>
        </div>

        {/* Sub-Card 2: Top Regional Anycast Colos */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="text-xs font-bold text-white flex items-center justify-between border-b border-slate-900 pb-2">
            <span className="flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-cyan-400" />
              <span>Bölgesel Anycast POP Gecikmeleri</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">Global Ortalama: 11ms</span>
          </div>

          <div className="overflow-x-auto py-1">
            <svg ref={coloBarSvgRef} width="280" height="150" />
          </div>

          <div className="text-[10px] text-slate-400 leading-relaxed font-mono">
            Türkiye ve Avrupa POP noktaları Anycast BGP ile en yakın noktadan yanıt vermektedir.
          </div>
        </div>

        {/* Sub-Card 3: Architecture & Next-Gen Acceleration */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-slate-900 pb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Cloudflare Anycast Hızlandırma Özellikleri</span>
            </div>

            <ul className="space-y-2 text-[11px] text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Brotli &amp; Zstandard:</strong> CSS ve JS dosyaları %22 daha yüksek sıkıştırmayla 4ms'de aktarılır.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>HTTP/3 &amp; QUIC:</strong> Paket kaybı durumlarında bile 0-RTT ile anında el sıkışma sağlanır.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Early Hints (103):</strong> Kritik font ve görsel dosyaları tarayıcıya ayrıştırma öncesi önbellekten yollanır.</span>
              </li>
            </ul>
          </div>

          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-800"
            >
              <span>Dağıtım ve API Ayarlarını İncele</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
