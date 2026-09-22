import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Zap, 
  Activity, 
  Calendar, 
  Download, 
  Eye, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  StickyNote, 
  ExternalLink,
  Sparkles,
  Award,
  Layers,
  BarChart3,
  HelpCircle
} from "lucide-react";

export interface MonthDataPoint {
  index: number;
  monthShort: string; // e.g. "Eki 25"
  monthFull: string; // e.g. "Ekim 2025"
  competitorRank: number; // 1-20
  userRank: number; // 1-20
  volume: number; // monthly search volume
  competitorTraffic: number; // estimated organic clicks
  userTraffic: number; // estimated organic clicks
  competitorPsi: number; // 0-100 PageSpeed score
  userPsi: number; // 0-100 PageSpeed score
  lcp: number; // seconds
  inp: number; // ms
  cls: number; // float
  cwvPassed: boolean;
  eventNote?: string;
  eventType?: "core_update" | "migration" | "content" | "cwv_boost" | "backlinks";
}

export interface Competitor12MonthD3ModalProps {
  isOpen: boolean;
  onClose: () => void;
  keyword: string;
  keywordId?: string;
  competitorName: string;
  competitorDomain?: string;
  competitorRank?: number | null;
  userRank?: number | null;
  searchVolume?: string;
  searchIntent?: string;
  difficulty?: number;
  speedScore?: number;
  userSpeedScore?: number;
  onOpenStrategicNote?: (keywordId: string) => void;
}

// Pseudo-random deterministic hash based on keyword + competitor
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Standard Google CTR curve based on SERP position
function getCtrForRank(rank: number): number {
  if (rank <= 0) return 0.005;
  if (rank === 1) return 0.325;
  if (rank === 2) return 0.168;
  if (rank === 3) return 0.102;
  if (rank === 4) return 0.071;
  if (rank === 5) return 0.052;
  if (rank === 6) return 0.038;
  if (rank === 7) return 0.029;
  if (rank === 8) return 0.021;
  if (rank === 9) return 0.016;
  if (rank === 10) return 0.012;
  if (rank <= 15) return 0.008;
  return 0.004;
}

// Generate realistic 12-month history
export function generate12MonthData(
  keyword: string,
  competitorName: string,
  currentCompRank: number = 3,
  currentUserRank: number = 1,
  baseVolumeStr: string = "8.400",
  basePsiScore: number = 74,
  userPsiScore: number = 98
): MonthDataPoint[] {
  const seed = hashString(`${keyword}_${competitorName}`);
  const baseVol = parseInt(baseVolumeStr.replace(/[^0-9]/g, "") || "8400", 10);

  const months = [
    { short: "Eki 25", full: "Ekim 2025" },
    { short: "Kas 25", full: "Kasım 2025" },
    { short: "Ara 25", full: "Aralık 2025" },
    { short: "Oca 26", full: "Ocak 2026" },
    { short: "Şub 26", full: "Şubat 2026" },
    { short: "Mar 26", full: "Mart 2026" },
    { short: "Nis 26", full: "Nisan 2026" },
    { short: "May 26", full: "Mayıs 2026" },
    { short: "Haz 26", full: "Haziran 2026" },
    { short: "Tem 26", full: "Temmuz 2026" },
    { short: "Ağu 26", full: "Ağustos 2026" },
    { short: "Eyl 26", full: "Eylül 2026 (Güncel)" },
  ];

  // Random walk path terminating at currentCompRank and currentUserRank
  const compRanks: number[] = [];
  const userRanks: number[] = [];
  const compPsiList: number[] = [];
  const userPsiList: number[] = [];

  let curComp = Math.min(18, Math.max(1, currentCompRank + ((seed % 5) - 2)));
  let curUser = Math.min(18, Math.max(1, currentUserRank + (((seed >> 2) % 3) - 1)));
  let curCompPsi = Math.min(95, Math.max(45, basePsiScore - 6));
  let curUserPsi = Math.min(100, Math.max(88, userPsiScore - 3));

  for (let i = 0; i < 12; i++) {
    if (i === 11) {
      // Anchored to current real values
      compRanks.push(currentCompRank);
      userRanks.push(currentUserRank);
      compPsiList.push(basePsiScore);
      userPsiList.push(userPsiScore);
    } else {
      const stepFactor = (11 - i) / 11;
      const noiseComp = ((hashString(`${seed}_c_${i}`) % 3) - 1);
      curComp = Math.round(curComp * 0.7 + currentCompRank * 0.3 + (noiseComp * stepFactor));
      curComp = Math.max(1, Math.min(20, curComp));
      compRanks.push(curComp);

      const noiseUser = ((hashString(`${seed}_u_${i}`) % 3) - 1);
      curUser = Math.round(curUser * 0.75 + currentUserRank * 0.25 + (noiseUser * stepFactor * 0.6));
      curUser = Math.max(1, Math.min(20, curUser));
      userRanks.push(curUser);

      const noisePsi = ((hashString(`${seed}_psi_${i}`) % 5) - 2);
      curCompPsi = Math.max(40, Math.min(96, Math.round(curCompPsi * 0.8 + basePsiScore * 0.2 + noisePsi)));
      compPsiList.push(curCompPsi);

      curUserPsi = Math.max(90, Math.min(100, Math.round(curUserPsi * 0.85 + userPsiScore * 0.15)));
      userPsiList.push(curUserPsi);
    }
  }

  // Pre-planned strategic industry events across the last 12 months
  const strategicEvents: Record<number, { note: string; type: MonthDataPoint["eventType"] }> = {
    2: { note: "Google Çekirdek Güncellemesi (HCU)", type: "core_update" },
    5: { note: "Rakip Yeni İçerik Hub'ı Yayınladı", type: "content" },
    8: { note: "Rakip Sunucu & CDN Geçişi", type: "migration" },
    10: { note: "CWV & Görsel Optimizasyonu", type: "cwv_boost" },
  };

  return months.map((m, idx) => {
    // Seasonal multiplier
    const seasonality = 1 + Math.sin((idx / 12) * Math.PI * 2) * 0.15;
    const vol = Math.round(baseVol * seasonality);

    const cRank = compRanks[idx];
    const uRank = userRanks[idx];
    const cPsi = compPsiList[idx];
    const uPsi = userPsiList[idx];

    const cCtr = getCtrForRank(cRank);
    const uCtr = getCtrForRank(uRank);

    const cTraffic = Math.round(vol * cCtr);
    const uTraffic = Math.round(vol * uCtr);

    // Realistic Web Vitals derived from PageSpeed score
    const lcp = +(4.8 - (cPsi / 100) * 3.2).toFixed(2);
    const inp = Math.round(380 - (cPsi / 100) * 260);
    const cls = +(0.25 - (cPsi / 100) * 0.22).toFixed(3);
    const cwvPassed = cPsi >= 80;

    const event = strategicEvents[idx];

    return {
      index: idx,
      monthShort: m.short,
      monthFull: m.full,
      competitorRank: cRank,
      userRank: uRank,
      volume: vol,
      competitorTraffic: cTraffic,
      userTraffic: uTraffic,
      competitorPsi: cPsi,
      userPsi: uPsi,
      lcp,
      inp,
      cls,
      cwvPassed,
      eventNote: event?.note,
      eventType: event?.type,
    };
  });
}

type MetricMode = "rank" | "traffic" | "psi" | "cwv";

export const Competitor12MonthD3Modal: React.FC<Competitor12MonthD3ModalProps> = ({
  isOpen,
  onClose,
  keyword,
  keywordId,
  competitorName,
  competitorDomain = "",
  competitorRank = 3,
  userRank = 1,
  searchVolume = "8.400",
  searchIntent = "İşlemsel",
  difficulty = 38,
  speedScore = 74,
  userSpeedScore = 98,
  onOpenStrategicNote,
}) => {
  const [activeMetric, setActiveMetric] = useState<MetricMode>("rank");
  const [showBenchmark, setShowBenchmark] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"chart" | "table">("chart");
  const [hoveredDataPoint, setHoveredDataPoint] = useState<MonthDataPoint | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(760);

  // Generate 12-month data series
  const data: MonthDataPoint[] = useMemo(() => {
    return generate12MonthData(
      keyword || "Anahtar Kelime",
      competitorName || "Rakip",
      competitorRank || 3,
      userRank || 1,
      searchVolume,
      speedScore || 74,
      userSpeedScore || 98
    );
  }, [keyword, competitorName, competitorRank, userRank, searchVolume, speedScore, userSpeedScore]);

  // Compute key summary metrics
  const stats = useMemo(() => {
    const compRanks = data.map((d) => d.competitorRank);
    const avgCompRank = (compRanks.reduce((a, b) => a + b, 0) / compRanks.length).toFixed(1);
    const bestCompRank = Math.min(...compRanks);
    const worstCompRank = Math.max(...compRanks);
    const firstRank = data[0].competitorRank;
    const lastRank = data[data.length - 1].competitorRank;
    const rankDelta = firstRank - lastRank; // positive means rank improved (#5 -> #2 = +3)

    const totalCompTraffic = data.reduce((acc, d) => acc + d.competitorTraffic, 0);
    const totalUserTraffic = data.reduce((acc, d) => acc + d.userTraffic, 0);

    const avgCompPsi = Math.round(data.reduce((acc, d) => acc + d.competitorPsi, 0) / data.length);
    const cwvPassRate = Math.round((data.filter((d) => d.cwvPassed).length / data.length) * 100);

    return {
      avgCompRank,
      bestCompRank,
      worstCompRank,
      rankDelta,
      totalCompTraffic,
      totalUserTraffic,
      avgCompPsi,
      cwvPassRate,
      latest: data[data.length - 1],
      first: data[0],
    };
  }, [data]);

  // Track container width dynamically using ResizeObserver
  useEffect(() => {
    if (!chartContainerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(Math.floor(entry.contentRect.width));
        }
      }
    });
    observer.observe(chartContainerRef.current);
    return () => observer.disconnect();
  }, [isOpen, activeTab]);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // ==========================================
  // D3.JS RENDERING ENGINE
  // ==========================================
  useEffect(() => {
    if (!isOpen || activeTab !== "chart" || !svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = Math.max(340, containerWidth);
    const height = 360;
    const margin = { top: 28, right: 32, bottom: 44, left: 54 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // X Scale: Point scale across 12 months
    const xScale = d3
      .scalePoint<string>()
      .domain(data.map((d) => d.monthShort))
      .range([0, innerWidth])
      .padding(0.25);

    // Y Scale depending on metric
    let yScale: d3.ScaleLinear<number, number>;
    let yDomain: [number, number];
    let yTickFormat: (d: d3.NumberValue) => string;

    if (activeMetric === "rank") {
      // Inverted Y scale: Rank 1 is top, Rank 20 is bottom
      const maxRank = Math.max(10, ...data.map((d) => Math.max(d.competitorRank, d.userRank))) + 2;
      yDomain = [1, Math.min(25, maxRank)];
      yScale = d3.scaleLinear().domain(yDomain).range([0, innerHeight]);
      yTickFormat = (d) => `#${d}`;
    } else if (activeMetric === "traffic") {
      const maxTraffic = Math.max(100, ...data.map((d) => Math.max(d.competitorTraffic, d.userTraffic))) * 1.25;
      yDomain = [0, maxTraffic];
      yScale = d3.scaleLinear().domain(yDomain).range([innerHeight, 0]);
      yTickFormat = (d) => d3.format("~s")(d);
    } else if (activeMetric === "psi") {
      yDomain = [0, 100];
      yScale = d3.scaleLinear().domain(yDomain).range([innerHeight, 0]);
      yTickFormat = (d) => `${d}`;
    } else {
      // CWV (LCP in seconds)
      const maxLcp = Math.max(4, ...data.map((d) => d.lcp)) * 1.2;
      yDomain = [0, maxLcp];
      yScale = d3.scaleLinear().domain(yDomain).range([innerHeight, 0]);
      yTickFormat = (d) => `${d}s`;
    }

    // Color definitions
    const compColor = "#f59e0b"; // Amber for competitor
    const compGradientId = "grad-competitor-12m";
    const userColor = "#6366f1"; // Indigo for User's site
    const userGradientId = "grad-user-12m";

    // Defs: Gradients & Filters
    const defs = svg.append("defs");

    // Competitor Gradient
    const compGrad = defs
      .append("linearGradient")
      .attr("id", compGradientId)
      .attr("x1", "0")
      .attr("y1", "0")
      .attr("x2", "0")
      .attr("y2", "1");
    compGrad.append("stop").attr("offset", "0%").attr("stop-color", compColor).attr("stop-opacity", 0.38);
    compGrad.append("stop").attr("offset", "100%").attr("stop-color", compColor).attr("stop-opacity", 0.02);

    // User Benchmark Gradient
    const userGrad = defs
      .append("linearGradient")
      .attr("id", userGradientId)
      .attr("x1", "0")
      .attr("y1", "0")
      .attr("x2", "0")
      .attr("y2", "1");
    userGrad.append("stop").attr("offset", "0%").attr("stop-color", userColor).attr("stop-opacity", 0.28);
    userGrad.append("stop").attr("offset", "100%").attr("stop-color", userColor).attr("stop-opacity", 0.01);

    // Subtle drop shadow filter for points
    const filter = defs.append("filter").attr("id", "d3-glow").attr("x", "-20%").attr("y", "-20%").attr("width", "140%").attr("height", "140%");
    filter.append("feDropShadow").attr("dx", 0).attr("dy", 1.5).attr("stdDeviation", 2).attr("flood-color", compColor).attr("flood-opacity", 0.4);

    // Horizontal Grid lines
    const yAxisGrid = d3
      .axisLeft(yScale)
      .ticks(activeMetric === "rank" ? 6 : 5)
      .tickSize(-innerWidth)
      .tickFormat(() => "");

    g.append("g")
      .attr("class", "grid-lines text-slate-200/80")
      .call(yAxisGrid)
      .selectAll("line")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-dasharray", "3,3")
      .attr("stroke-opacity", 0.8);

    g.select(".domain").remove();

    // PSI Reference Zones (Good >= 90, Needs Imp 50-89, Poor < 50)
    if (activeMetric === "psi") {
      // Good Zone (90 - 100)
      g.append("rect")
        .attr("x", 0)
        .attr("y", yScale(100))
        .attr("width", innerWidth)
        .attr("height", yScale(90) - yScale(100))
        .attr("fill", "#10b981")
        .attr("opacity", 0.07);

      // Needs Improvement Zone (50 - 90)
      g.append("rect")
        .attr("x", 0)
        .attr("y", yScale(90))
        .attr("width", innerWidth)
        .attr("height", yScale(50) - yScale(90))
        .attr("fill", "#f59e0b")
        .attr("opacity", 0.05);

      // Poor Zone (< 50)
      g.append("rect")
        .attr("x", 0)
        .attr("y", yScale(50))
        .attr("width", innerWidth)
        .attr("height", yScale(0) - yScale(50))
        .attr("fill", "#f43f5e")
        .attr("opacity", 0.05);
    }

    // Top 3 Rank Zone
    if (activeMetric === "rank") {
      g.append("rect")
        .attr("x", 0)
        .attr("y", yScale(1))
        .attr("width", innerWidth)
        .attr("height", Math.max(10, yScale(3) - yScale(1)))
        .attr("fill", "#6366f1")
        .attr("opacity", 0.06);

      g.append("text")
        .attr("x", innerWidth - 8)
        .attr("y", yScale(1.4))
        .attr("text-anchor", "end")
        .attr("font-size", "10px")
        .attr("font-family", "monospace")
        .attr("font-weight", "bold")
        .attr("fill", "#4f46e5")
        .text("★ İlk 3 SERP Liderlik Bandı");
    }

    // Line & Area Generators
    const getCompValue = (d: MonthDataPoint): number => {
      if (activeMetric === "rank") return d.competitorRank;
      if (activeMetric === "traffic") return d.competitorTraffic;
      if (activeMetric === "psi") return d.competitorPsi;
      return d.lcp;
    };

    const getUserValue = (d: MonthDataPoint): number => {
      if (activeMetric === "rank") return d.userRank;
      if (activeMetric === "traffic") return d.userTraffic;
      if (activeMetric === "psi") return d.userPsi;
      return +(4.8 - (d.userPsi / 100) * 3.2).toFixed(2);
    };

    // Competitor Line & Area
    const compLineGenerator = d3
      .line<MonthDataPoint>()
      .x((d) => xScale(d.monthShort) || 0)
      .y((d) => yScale(getCompValue(d)))
      .curve(d3.curveMonotoneX);

    const compAreaGenerator = d3
      .area<MonthDataPoint>()
      .x((d) => xScale(d.monthShort) || 0)
      .y0(activeMetric === "rank" ? innerHeight : innerHeight)
      .y1((d) => yScale(getCompValue(d)))
      .curve(d3.curveMonotoneX);

    // Draw Competitor Area
    g.append("path")
      .datum(data)
      .attr("fill", `url(#${compGradientId})`)
      .attr("d", compAreaGenerator);

    // Benchmark (Siteniz) Area & Line if enabled
    if (showBenchmark) {
      const userLineGenerator = d3
        .line<MonthDataPoint>()
        .x((d) => xScale(d.monthShort) || 0)
        .y((d) => yScale(getUserValue(d)))
        .curve(d3.curveMonotoneX);

      // User Line
      g.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", userColor)
        .attr("stroke-width", 2.25)
        .attr("stroke-dasharray", "5,4")
        .attr("d", userLineGenerator)
        .attr("stroke-linecap", "round");

      // User Points
      g.selectAll(".user-dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "user-dot")
        .attr("cx", (d) => xScale(d.monthShort) || 0)
        .attr("cy", (d) => yScale(getUserValue(d)))
        .attr("r", 3.5)
        .attr("fill", "#ffffff")
        .attr("stroke", userColor)
        .attr("stroke-width", 2);
    }

    // Competitor Main Line
    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", compColor)
      .attr("stroke-width", 3)
      .attr("d", compLineGenerator)
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round");

    // Competitor Points
    g.selectAll(".comp-dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "comp-dot")
      .attr("cx", (d) => xScale(d.monthShort) || 0)
      .attr("cy", (d) => yScale(getCompValue(d)))
      .attr("r", (d, idx) => (idx === data.length - 1 ? 5.5 : 4))
      .attr("fill", (d, idx) => (idx === data.length - 1 ? compColor : "#ffffff"))
      .attr("stroke", compColor)
      .attr("stroke-width", 2.5)
      .style("filter", "url(#d3-glow)");

    // Strategic Event Pins
    data.forEach((d) => {
      if (d.eventNote) {
        const cx = xScale(d.monthShort) || 0;
        const cy = yScale(getCompValue(d));

        // Pin stem
        g.append("line")
          .attr("x1", cx)
          .attr("y1", cy - 5)
          .attr("x2", cx)
          .attr("y2", cy - 20)
          .attr("stroke", "#475569")
          .attr("stroke-width", 1.25)
          .attr("stroke-dasharray", "2,2");

        // Pin badge circle
        const pinG = g
          .append("g")
          .attr("transform", `translate(${cx},${cy - 22})`)
          .style("cursor", "pointer");

        pinG
          .append("circle")
          .attr("r", 7)
          .attr("fill", "#1e293b")
          .attr("stroke", "#fbbf24")
          .attr("stroke-width", 1.5);

        pinG
          .append("text")
          .attr("text-anchor", "middle")
          .attr("dy", "3px")
          .attr("font-size", "9px")
          .attr("font-weight", "black")
          .attr("fill", "#fcd34d")
          .text("!");
      }
    });

    // X Axis
    const xAxis = d3.axisBottom(xScale);
    const xAxisG = g
      .append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis);

    xAxisG.select(".domain").attr("stroke", "#cbd5e1");
    xAxisG
      .selectAll(".tick text")
      .attr("font-size", "11px")
      .attr("font-family", "monospace")
      .attr("font-weight", "600")
      .attr("fill", "#64748b")
      .attr("dy", "10px");

    // Y Axis
    const yAxis = d3.axisLeft(yScale).ticks(6).tickFormat(yTickFormat);
    const yAxisG = g.append("g").call(yAxis);
    yAxisG.select(".domain").remove();
    yAxisG
      .selectAll(".tick text")
      .attr("font-size", "11px")
      .attr("font-family", "monospace")
      .attr("font-weight", "600")
      .attr("fill", "#64748b");

    // Interactive Crosshair & Hover Overlay
    const crosshairLine = g
      .append("line")
      .attr("class", "crosshair-line")
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", "#6366f1")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "4,4")
      .style("opacity", 0);

    const activeHoverCompDot = g
      .append("circle")
      .attr("r", 6.5)
      .attr("fill", compColor)
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2.5)
      .style("opacity", 0)
      .style("filter", "url(#d3-glow)");

    const activeHoverUserDot = g
      .append("circle")
      .attr("r", 6)
      .attr("fill", userColor)
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2.5)
      .style("opacity", 0);

    // Transparent overlay for scrubbing
    const stepWidth = innerWidth / 12;
    g.append("rect")
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .attr("fill", "transparent")
      .style("cursor", "crosshair")
      .on("mousemove", (event) => {
        const [mx] = d3.pointer(event);
        // Find closest point
        let closestPoint = data[0];
        let minDiff = Infinity;
        data.forEach((d) => {
          const px = xScale(d.monthShort) || 0;
          const diff = Math.abs(mx - px);
          if (diff < minDiff) {
            minDiff = diff;
            closestPoint = d;
          }
        });

        const targetX = xScale(closestPoint.monthShort) || 0;
        crosshairLine.attr("x1", targetX).attr("x2", targetX).style("opacity", 1);

        activeHoverCompDot
          .attr("cx", targetX)
          .attr("cy", yScale(getCompValue(closestPoint)))
          .style("opacity", 1);

        if (showBenchmark) {
          activeHoverUserDot
            .attr("cx", targetX)
            .attr("cy", yScale(getUserValue(closestPoint)))
            .style("opacity", 1);
        }

        setHoveredDataPoint(closestPoint);
      })
      .on("mouseleave", () => {
        crosshairLine.style("opacity", 0);
        activeHoverCompDot.style("opacity", 0);
        activeHoverUserDot.style("opacity", 0);
        setHoveredDataPoint(null);
      });
  }, [isOpen, activeTab, containerWidth, activeMetric, showBenchmark, data]);

  if (!isOpen) return null;

  // Export 12-Month Table as CSV
  const handleExportCsv = () => {
    const headers = [
      "Ay",
      "Tam_Donem",
      "Anahtar_Kelime",
      "Rakip_Adi",
      "Rakip_Domain",
      "Rakip_Sira",
      "Siteniz_Sira",
      "Aylik_Arama_Hacmi",
      "Rakip_Tahmini_Trafik",
      "Siteniz_Tahmini_Trafik",
      "Rakip_PSI_Skoru",
      "Siteniz_PSI_Skoru",
      "LCP_Saniye",
      "INP_ms",
      "CLS",
      "CWV_Gecti_Mi",
      "Stratejik_Olay",
    ];

    const rows = data.map((d) => [
      `"${d.monthShort}"`,
      `"${d.monthFull}"`,
      `"${keyword}"`,
      `"${competitorName}"`,
      `"${competitorDomain}"`,
      d.competitorRank,
      d.userRank,
      d.volume,
      d.competitorTraffic,
      d.userTraffic,
      d.competitorPsi,
      d.userPsi,
      d.lcp,
      d.inp,
      d.cls,
      d.cwvPassed ? "EVET" : "HAYIR",
      `"${d.eventNote || ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${competitorName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-12-aylik-d3-seo-analizi.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const latest = stats.latest;

  return (
    <div
      id="competitor-12month-d3-modal"
      data-testid="competitor-12month-d3-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-12m-title"
    >
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 sm:px-6 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 font-mono text-[11px] font-black uppercase tracking-wider">
                12 Aylık d3.js Analizi
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white/10 text-slate-300 font-mono text-xs">
                {keyword}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
                {searchIntent}
              </span>
            </div>

            <div className="flex items-baseline gap-3 flex-wrap pt-0.5">
              <h2 id="modal-12m-title" className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <span>{competitorName}</span>
                {competitorDomain && (
                  <span className="text-xs font-mono font-normal text-slate-400">
                    ({competitorDomain})
                  </span>
                )}
              </h2>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black">
                  Güncel: #{competitorRank || "-"}
                </span>
                <span className="text-slate-400">vs</span>
                <span className="px-2 py-0.5 rounded bg-indigo-500 text-white font-black">
                  Siteniz: #{userRank || "-"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              id="btn-export-12m-csv"
              data-testid="btn-export-12m-csv"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              title="12 Aylık Ham Verileri CSV Olarak İndir"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">CSV İndir</span>
            </button>

            {keywordId && onOpenStrategicNote && (
              <button
                type="button"
                id="btn-note-from-12m-modal"
                data-testid="btn-note-from-12m-modal"
                onClick={() => {
                  onClose();
                  onOpenStrategicNote(keywordId);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                title="Bu kelime ve rakip için stratejik not aç"
              >
                <StickyNote className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Not Al</span>
              </button>
            )}

            <button
              type="button"
              id="btn-close-12m-modal"
              data-testid="btn-close-12m-modal"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Modalı Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body with Scroll */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Top 4 KPI Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. 12-Month Average Rank */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1">
              <div className="flex items-center justify-between text-amber-800 text-[11px] font-bold">
                <span>12 Aylık Ort. Sıra</span>
                <Award className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-xl font-black font-mono text-amber-950">
                #{stats.avgCompRank}
              </div>
              <div className="text-[10px] text-amber-700 font-medium">
                En İyi: #{stats.bestCompRank} • En Düşük: #{stats.worstCompRank}
              </div>
            </div>

            {/* 2. 12-Month Net Rank Delta */}
            <div className={`p-3.5 rounded-2xl border space-y-1 ${
              stats.rankDelta > 0
                ? "bg-emerald-50/70 border-emerald-200/80 text-emerald-950"
                : stats.rankDelta < 0
                ? "bg-rose-50/70 border-rose-200/80 text-rose-950"
                : "bg-slate-50 border-slate-200 text-slate-900"
            }`}>
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span>12 Aylık Net Değişim</span>
                {stats.rankDelta > 0 ? (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                ) : stats.rankDelta < 0 ? (
                  <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                ) : (
                  <Minus className="w-3.5 h-3.5 text-slate-500" />
                )}
              </div>
              <div className="text-xl font-black font-mono flex items-center gap-1">
                <span>{stats.rankDelta > 0 ? `▲ +${stats.rankDelta} Sıra` : stats.rankDelta < 0 ? `▼ ${stats.rankDelta} Sıra` : "Eşit"}</span>
              </div>
              <div className="text-[10px] opacity-80 font-medium">
                Eki 25 (#{stats.first.competitorRank}) → Eyl 26 (#{stats.latest.competitorRank})
              </div>
            </div>

            {/* 3. Estimated Annual Traffic */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-1">
              <div className="flex items-center justify-between text-indigo-800 text-[11px] font-bold">
                <span>Tahmini 12 Ay Trafik</span>
                <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <div className="text-xl font-black font-mono text-indigo-950">
                ~{stats.totalCompTraffic.toLocaleString("tr-TR")}
              </div>
              <div className="text-[10px] text-indigo-700 font-medium">
                Siteniz: ~{stats.totalUserTraffic.toLocaleString("tr-TR")} tık
              </div>
            </div>

            {/* 4. PageSpeed & CWV Health */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-slate-700 text-[11px] font-bold">
                <span>PageSpeed & CWV</span>
                <Zap className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl font-black font-mono text-slate-900 flex items-center gap-1.5">
                <span>{stats.avgCompPsi} / 100</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                  stats.cwvPassRate >= 70 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                }`}>
                  CWV %{stats.cwvPassRate}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                LCP: {latest.lcp}s • INP: {latest.inp}ms • Siteniz: {userSpeedScore}/100
              </div>
            </div>
          </div>

          {/* Interactive Controls & Metric Selector Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-2.5 rounded-2xl bg-slate-100/80 border border-slate-200/80">
            {/* Metric Buttons */}
            <div className="flex items-center gap-1 flex-wrap" role="tablist" aria-label="Metrik Seçimi">
              <button
                type="button"
                id="tab-metric-rank"
                data-testid="tab-metric-rank"
                onClick={() => setActiveMetric("rank")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeMetric === "rank"
                    ? "bg-white text-slate-950 shadow-xs border border-slate-200 ring-1 ring-slate-300"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                SERP Sıralaması
              </button>

              <button
                type="button"
                id="tab-metric-traffic"
                data-testid="tab-metric-traffic"
                onClick={() => setActiveMetric("traffic")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeMetric === "traffic"
                    ? "bg-white text-slate-950 shadow-xs border border-slate-200 ring-1 ring-slate-300"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                Organik Trafik & Hacim
              </button>

              <button
                type="button"
                id="tab-metric-psi"
                data-testid="tab-metric-psi"
                onClick={() => setActiveMetric("psi")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeMetric === "psi"
                    ? "bg-white text-slate-950 shadow-xs border border-slate-200 ring-1 ring-slate-300"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                PageSpeed Insights (0-100)
              </button>

              <button
                type="button"
                id="tab-metric-cwv"
                data-testid="tab-metric-cwv"
                onClick={() => setActiveMetric("cwv")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeMetric === "cwv"
                    ? "bg-white text-slate-950 shadow-xs border border-slate-200 ring-1 ring-slate-300"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                Core Web Vitals (LCP)
              </button>
            </div>

            {/* Benchmark Toggle & View Tab */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="chk-toggle-benchmark"
                  data-testid="chk-toggle-benchmark"
                  checked={showBenchmark}
                  onChange={(e) => setShowBenchmark(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 bg-white border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                />
                <span className="flex items-center gap-1 text-indigo-950">
                  <span className="w-2.5 h-0.5 bg-indigo-600 border-b border-dashed inline-block" />
                  Sitenizle Kıyasla
                </span>
              </label>

              <div className="flex items-center p-0.5 rounded-xl bg-slate-200/80 border border-slate-300/60">
                <button
                  type="button"
                  id="view-toggle-chart"
                  data-testid="view-toggle-chart"
                  onClick={() => setActiveTab("chart")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "chart" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Grafik
                </button>
                <button
                  type="button"
                  id="view-toggle-table"
                  data-testid="view-toggle-table"
                  onClick={() => setActiveTab("table")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "table" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Tablo
                </button>
              </div>
            </div>
          </div>

          {/* Tab 1: D3.JS INTERACTIVE CHART VIEW */}
          {activeTab === "chart" && (
            <div className="space-y-3">
              {/* Active Scrubbing Tooltip / Hover Banner */}
              <div className="min-h-[50px] p-3 rounded-2xl bg-slate-900 text-white flex items-center justify-between flex-wrap gap-2 border border-slate-800 shadow-inner">
                {hoveredDataPoint ? (
                  <div className="flex items-center gap-4 flex-wrap text-xs font-mono w-full justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-amber-300 text-sm font-sans">
                        {hoveredDataPoint.monthFull}
                      </span>
                      {hoveredDataPoint.eventNote && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                          ⚡ {hoveredDataPoint.eventNote}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <span>{competitorName}:</span>
                        <span className="text-white text-sm">
                          {activeMetric === "rank" && `#${hoveredDataPoint.competitorRank}`}
                          {activeMetric === "traffic" && `${hoveredDataPoint.competitorTraffic.toLocaleString("tr-TR")} tık/ay`}
                          {activeMetric === "psi" && `${hoveredDataPoint.competitorPsi} / 100`}
                          {activeMetric === "cwv" && `${hoveredDataPoint.lcp}s LCP`}
                        </span>
                      </div>

                      {showBenchmark && (
                        <div className="flex items-center gap-1.5 text-indigo-300 font-bold">
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                          <span>Siteniz:</span>
                          <span className="text-white text-sm">
                            {activeMetric === "rank" && `#${hoveredDataPoint.userRank}`}
                            {activeMetric === "traffic" && `${hoveredDataPoint.userTraffic.toLocaleString("tr-TR")} tık/ay`}
                            {activeMetric === "psi" && `${hoveredDataPoint.userPsi} / 100`}
                            {activeMetric === "cwv" && `${+(4.8 - (hoveredDataPoint.userPsi / 100) * 3.2).toFixed(2)}s LCP`}
                          </span>
                        </div>
                      )}

                      {/* Delta */}
                      {activeMetric === "rank" && (
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          hoveredDataPoint.userRank < hoveredDataPoint.competitorRank
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : hoveredDataPoint.userRank > hoveredDataPoint.competitorRank
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : "bg-slate-700 text-slate-300"
                        }`}>
                          {hoveredDataPoint.userRank < hoveredDataPoint.competitorRank
                            ? `▲ Siteniz ${hoveredDataPoint.competitorRank - hoveredDataPoint.userRank} Sıra Önde`
                            : hoveredDataPoint.userRank > hoveredDataPoint.competitorRank
                            ? `▼ ${hoveredDataPoint.userRank - hoveredDataPoint.competitorRank} Sıra Geridesiniz`
                            : "Eşit Pozisyon"}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs text-slate-400 w-full">
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Grafik üzerinde imlecinizi gezdirerek 12 ayın her bir noktasındaki d3.js verilerini inceleyebilirsiniz.
                    </span>
                    <span className="text-slate-500 font-mono text-[11px] hidden sm:inline">
                      D3 Monotone Bezier Curve Engine
                    </span>
                  </div>
                )}
              </div>

              {/* D3 SVG Container */}
              <div 
                ref={chartContainerRef}
                className="w-full bg-white border border-slate-200 rounded-2xl p-2 pt-4 relative overflow-hidden shadow-xs"
              >
                <svg
                  ref={svgRef}
                  id="d3-competitor-12m-svg"
                  width={containerWidth}
                  height={360}
                  className="w-full overflow-visible"
                />

                {/* Graph Legend */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 px-3 text-xs text-slate-600 flex-wrap gap-2">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 font-bold text-amber-700">
                      <span className="w-3 h-1 bg-amber-500 rounded" />
                      <span>{competitorName} (Trend Eğrisi)</span>
                    </span>

                    {showBenchmark && (
                      <span className="flex items-center gap-1.5 font-bold text-indigo-700">
                        <span className="w-3 h-0.5 border-b-2 border-dashed border-indigo-600" />
                        <span>Siteniz (Referans Benchmark)</span>
                      </span>
                    )}

                    <span className="flex items-center gap-1.5 text-slate-500">
                      <span className="w-2 h-2 rounded-full bg-slate-900 ring-1 ring-amber-400 text-[8px] text-amber-300 font-bold flex items-center justify-center">!</span>
                      <span>Stratejik Sektör / SERP Olayı</span>
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono">
                    12 Aylık Tarih Aralığı: Ekim 2025 - Eylül 2026
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: 12-MONTH DATA TABLE VIEW */}
          {activeTab === "table" && (
            <div className="space-y-3">
              <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-xs">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-3.5">Dönem</th>
                      <th className="py-3 px-3">Rakip Sırası</th>
                      <th className="py-3 px-3">Siteniz Sırası</th>
                      <th className="py-3 px-3">SERP Farkı</th>
                      <th className="py-3 px-3">Arama Hacmi</th>
                      <th className="py-3 px-3">Rakip Trafik</th>
                      <th className="py-3 px-3">PageSpeed</th>
                      <th className="py-3 px-3">CWV Durumu</th>
                      <th className="py-3 px-3.5">Önemli Olay</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80 font-mono">
                    {data.map((row, idx) => {
                      const rankDiff = row.competitorRank - row.userRank; // >0 means user is ahead
                      return (
                        <tr 
                          key={idx}
                          className={`hover:bg-amber-50/40 transition-colors ${
                            idx === data.length - 1 ? "bg-amber-50/60 font-bold" : ""
                          }`}
                        >
                          <td className="py-2.5 px-3.5 font-sans font-semibold text-slate-900">
                            {row.monthFull}
                            {idx === data.length - 1 && (
                              <span className="ml-1.5 px-1.5 py-0.2 rounded text-[9px] bg-amber-400 text-slate-950 font-black">
                                GÜNCEL
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-black">
                              #{row.competitorRank}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 font-black">
                              #{row.userRank}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-bold">
                            {rankDiff > 0 ? (
                              <span className="text-emerald-700">▲ +{rankDiff} Siteniz Önde</span>
                            ) : rankDiff < 0 ? (
                              <span className="text-rose-700">▼ {rankDiff} Sıra Geride</span>
                            ) : (
                              <span className="text-slate-500">Eşit</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 font-sans">
                            {row.volume.toLocaleString("tr-TR")}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800">
                            ~{row.competitorTraffic.toLocaleString("tr-TR")}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`px-1.5 py-0.5 rounded font-bold ${
                              row.competitorPsi >= 90
                                ? "bg-emerald-100 text-emerald-800"
                                : row.competitorPsi >= 50
                                ? "bg-amber-100 text-amber-800"
                                : "bg-rose-100 text-rose-800"
                            }`}>
                              {row.competitorPsi}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            {row.cwvPassed ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-sans text-[11px] font-semibold">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Geçti
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-rose-700 font-sans text-[11px] font-semibold">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                İyileştirme
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3.5 font-sans text-slate-600">
                            {row.eventNote ? (
                              <span className="px-2 py-0.5 rounded bg-amber-100/80 text-amber-900 border border-amber-300/80 text-[10px] font-bold">
                                {row.eventNote}
                              </span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-slate-700">
              d3.js v7.9 destekli interaktif zaman serisi motoru aktiftir.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-footer-close-12m"
              data-testid="btn-footer-close-12m"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-colors cursor-pointer"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
