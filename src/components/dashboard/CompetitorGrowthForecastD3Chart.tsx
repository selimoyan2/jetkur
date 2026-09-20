import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import { CompetitorKeywordRanking, CompetitorContentMetric } from "../../types";
import { 
  TrendingUp, 
  Sparkles, 
  Activity, 
  Layers, 
  ChevronDown, 
  ArrowUpRight, 
  Trophy, 
  Info,
  Calendar,
  Zap,
  Target,
  BarChart2,
  Check,
  Eye,
  EyeOff,
  RotateCcw,
  CheckSquare,
  Square,
  SlidersHorizontal,
  Download,
  Image as ImageIcon,
  FileCode,
  FileImage,
  StickyNote
} from "lucide-react";
import { CompetitorColorPalette } from "../../utils/competitorColorTheme";
import { 
  ForecastMonthAnnotationBox, 
  MonthForecastAnnotation, 
  DEFAULT_MONTH_PRESETS 
} from "./ForecastMonthAnnotationBox";
import { ForecastMonthInsightPopover } from "./ForecastMonthInsightPopover";
import { 
  ScenarioSimulationPanel, 
  SCENARIO_DEFINITIONS 
} from "./ScenarioSimulationPanel";

export type ForecastMetricType = "traffic" | "visibility" | "rankingScore";
export type ForecastScenarioType = "aggressive" | "stable" | "decline" | "realistic" | "conservative";

interface CompetitorGrowthForecastD3ChartProps {
  rankings: CompetitorKeywordRanking[];
  competitors: CompetitorContentMetric[];
  userName: string;
  userDomain?: string;
  colorPalette?: CompetitorColorPalette;
  className?: string;
}

export interface MonthlyDataPoint {
  monthIndex: number;
  monthLabel: string;
  monthName: string;
  values: {
    user: number;
    comp1: number;
    comp2: number;
    comp3: number;
  };
}

interface EntityConfig {
  id: "user" | "comp1" | "comp2" | "comp3";
  name: string;
  domain?: string;
  color: string;
  strokeDash?: string;
  isUser?: boolean;
}

export const CompetitorGrowthForecastD3Chart: React.FC<CompetitorGrowthForecastD3ChartProps> = ({
  rankings = [],
  competitors = [],
  userName = "Siteniz",
  userDomain = "sitemiz.com.tr",
  colorPalette,
  className = ""
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(850);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Filter & Control States
  const [selectedMetric, setSelectedMetric] = useState<ForecastMetricType>("traffic");
  const [selectedScenario, setSelectedScenario] = useState<ForecastScenarioType>("stable");
  const [customGrowthRate, setCustomGrowthRate] = useState<number | null>(null);
  const [isScenarioPanelOpen, setIsScenarioPanelOpen] = useState<boolean>(true);
  const [visibleEntities, setVisibleEntities] = useState<Record<string, boolean>>({
    user: true,
    comp1: true,
    comp2: true,
    comp3: true
  });

  // Hover Tooltip State
  const [hoveredPoint, setHoveredPoint] = useState<MonthlyDataPoint | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // High-Resolution Export States
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);
  const [isSaveMenuOpen, setIsSaveMenuOpen] = useState<boolean>(false);
  const saveMenuRef = useRef<HTMLDivElement>(null);

  // Interactive Monthly Forecast Notes (Annotation Box) States
  const [selectedAnnotationMonth, setSelectedAnnotationMonth] = useState<number>(1);
  const [isAnnotationBoxOpen, setIsAnnotationBoxOpen] = useState<boolean>(true);
  const [monthNotes, setMonthNotes] = useState<Record<number, MonthForecastAnnotation>>(() => {
    try {
      const saved = localStorage.getItem("seo_d3_monthly_forecast_notes_v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to read forecast notes from localStorage:", e);
    }
    // Seed initial strategic notes from presets
    const initialNotes: Record<number, MonthForecastAnnotation> = {};
    const date = new Date();
    const monthNames = [
      "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", 
      "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
    ];
    for (let m = 0; m <= 6; m++) {
      const futureDate = new Date(date.getFullYear(), date.getMonth() + m, 1);
      const mName = `${monthNames[futureDate.getMonth()]} ${futureDate.getFullYear()}`;
      const preset = DEFAULT_MONTH_PRESETS[m];
      if (preset) {
        initialNotes[m] = {
          monthIndex: m,
          monthLabel: m === 0 ? "Şu An (0. Ay)" : `+${m}. Ay`,
          monthName: mName,
          text: preset.text,
          category: preset.category,
          updatedAt: new Date().toLocaleDateString("tr-TR")
        };
      }
    }
    return initialNotes;
  });

  // Interactive Insight Popover on Data Point Click States
  const [activeInsightMonth, setActiveInsightMonth] = useState<number | null>(null);
  const [insightPopoverPos, setInsightPopoverPos] = useState<{ x: number; y: number } | null>(null);
  const [isInsightPopoverOpen, setIsInsightPopoverOpen] = useState<boolean>(false);
  const [insightEntityContext, setInsightEntityContext] = useState<{
    id: "user" | "comp1" | "comp2" | "comp3";
    name: string;
    color: string;
    value: number;
  } | null>(null);

  const handleOpenInsightPopover = (
    monthIndex: number,
    pos: { x: number; y: number },
    entityContext?: { id: "user" | "comp1" | "comp2" | "comp3"; name: string; color: string; value: number } | null
  ) => {
    setActiveInsightMonth(monthIndex);
    setSelectedAnnotationMonth(monthIndex);
    setInsightPopoverPos(pos);
    setInsightEntityContext(entityContext || null);
    setIsInsightPopoverOpen(true);
  };

  const handleCloseInsightPopover = () => {
    setIsInsightPopoverOpen(false);
    setActiveInsightMonth(null);
    setInsightPopoverPos(null);
    setInsightEntityContext(null);
  };

  // Close Save Menu on Click Outside or Escape
  useEffect(() => {
    if (!isSaveMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (saveMenuRef.current && !saveMenuRef.current.contains(e.target as Node)) {
        setIsSaveMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSaveMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSaveMenuOpen]);

  const comp1 = competitors[0] || { name: "1. Rakip", domain: "rakip1.com", rank: 1 };
  const comp2 = competitors[1] || { name: "2. Rakip", domain: "rakip2.com", rank: 2 };
  const comp3 = competitors[2] || { name: "3. Rakip", domain: "rakip3.com", rank: 3 };

  const entityConfigs: EntityConfig[] = useMemo(() => [
    {
      id: "user",
      name: userName,
      domain: userDomain,
      color: colorPalette?.user 
        ? colorPalette.user 
        : (selectedScenario === "decline" ? "#f43f5e" : selectedScenario === "aggressive" ? "#059669" : "#0d9488"),
      isUser: true
    },
    {
      id: "comp1",
      name: comp1.name,
      domain: comp1.domain,
      color: colorPalette?.comp1 || "#e11d48" // Rose-600 / dynamic
    },
    {
      id: "comp2",
      name: comp2.name,
      domain: comp2.domain,
      color: colorPalette?.comp2 || "#d97706" // Amber-600 / dynamic
    },
    {
      id: "comp3",
      name: comp3.name,
      domain: comp3.domain,
      color: colorPalette?.comp3 || "#7c3aed" // Violet-600 / dynamic
    }
  ], [userName, userDomain, comp1, comp2, comp3, colorPalette, selectedScenario]);

  // Responsive ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        if (w > 100) setContainerWidth(w);
      }
    };
    updateWidth();
    const ro = new ResizeObserver(() => updateWidth());
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Compute Baseline Metrics from Table Data
  const baselineStats = useMemo(() => {
    if (!rankings || rankings.length === 0) {
      return {
        userTraffic: 2400,
        comp1Traffic: 8200,
        comp2Traffic: 5100,
        comp3Traffic: 3900,
        userVisibility: 38,
        comp1Visibility: 86,
        comp2Visibility: 62,
        comp3Visibility: 51,
        userScore: 42,
        comp1Score: 89,
        comp2Score: 68,
        comp3Score: 54
      };
    }

    // CTR curve model by SERP rank
    const getCtr = (rank: number | null): number => {
      if (rank === null || rank <= 0) return 0.005;
      if (rank === 1) return 0.32;
      if (rank === 2) return 0.17;
      if (rank === 3) return 0.11;
      if (rank <= 5) return 0.07;
      if (rank <= 10) return 0.035;
      if (rank <= 20) return 0.012;
      return 0.004;
    };

    const getVisibilityPoints = (rank: number | null): number => {
      if (rank === null || rank <= 0) return 2;
      if (rank === 1) return 100;
      if (rank === 2) return 85;
      if (rank === 3) return 70;
      if (rank <= 5) return 55;
      if (rank <= 10) return 35;
      if (rank <= 20) return 15;
      return 5;
    };

    let userTraffic = 0;
    let comp1Traffic = 0;
    let comp2Traffic = 0;
    let comp3Traffic = 0;

    let userVisSum = 0;
    let comp1VisSum = 0;
    let comp2VisSum = 0;
    let comp3VisSum = 0;

    rankings.forEach((r) => {
      const volNum = parseFloat(r.monthlyVolume.replace(/[^0-9.]/g, "") || "0") * 
        (r.monthlyVolume.includes("K") ? 1000 : 1);
      const volume = isNaN(volNum) || volNum === 0 ? 1000 : volNum;

      userTraffic += Math.round(volume * getCtr(r.userRank));
      comp1Traffic += Math.round(volume * getCtr(r.comp1Rank));
      comp2Traffic += Math.round(volume * getCtr(r.comp2Rank));
      comp3Traffic += Math.round(volume * getCtr(r.comp3Rank));

      userVisSum += getVisibilityPoints(r.userRank);
      comp1VisSum += getVisibilityPoints(r.comp1Rank);
      comp2VisSum += getVisibilityPoints(r.comp2Rank);
      comp3VisSum += getVisibilityPoints(r.comp3Rank);
    });

    const count = rankings.length || 1;
    const userVisibility = Math.min(100, Math.round(userVisSum / count));
    const comp1Visibility = Math.min(100, Math.round(comp1VisSum / count));
    const comp2Visibility = Math.min(100, Math.round(comp2VisSum / count));
    const comp3Visibility = Math.min(100, Math.round(comp3VisSum / count));

    return {
      userTraffic: Math.max(1200, userTraffic),
      comp1Traffic: Math.max(2500, comp1Traffic),
      comp2Traffic: Math.max(1800, comp2Traffic),
      comp3Traffic: Math.max(1400, comp3Traffic),
      userVisibility,
      comp1Visibility,
      comp2Visibility,
      comp3Visibility,
      userScore: Math.round(userVisibility * 0.9 + 5),
      comp1Score: Math.round(comp1Visibility * 0.95 + 3),
      comp2Score: Math.round(comp2Visibility * 0.92 + 4),
      comp3Score: Math.round(comp3Visibility * 0.9 + 4)
    };
  }, [rankings]);

  // Generate 6-Month Projection Series
  const forecastData: MonthlyDataPoint[] = useMemo(() => {
    // Current date and 6 future months
    const date = new Date();
    const monthNames = [
      "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", 
      "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
    ];

    // Scenario multipliers for 6 months (Agresif Büyüme / Stabil / Düşüş)
    let userMonthlyGrowth = 0.040; // Default: Stabil (~+26.5% net over 6 months)
    let comp1MonthlyGrowth = 0.024;
    let comp2MonthlyGrowth = 0.028;
    let comp3MonthlyGrowth = 0.020;

    if (selectedScenario === "aggressive") {
      userMonthlyGrowth = customGrowthRate !== null ? customGrowthRate : 0.185; // ~+172% over 6 months
      comp1MonthlyGrowth = 0.012;
      comp2MonthlyGrowth = 0.015;
      comp3MonthlyGrowth = 0.010;
    } else if (selectedScenario === "decline") {
      userMonthlyGrowth = customGrowthRate !== null ? customGrowthRate : -0.075; // ~-37.4% over 6 months
      comp1MonthlyGrowth = 0.052;
      comp2MonthlyGrowth = 0.058;
      comp3MonthlyGrowth = 0.045;
    } else {
      // "stable" (and legacy "realistic" / "conservative")
      userMonthlyGrowth = customGrowthRate !== null ? customGrowthRate : 0.040;
      comp1MonthlyGrowth = 0.024;
      comp2MonthlyGrowth = 0.028;
      comp3MonthlyGrowth = 0.020;
    }

    let baseUser = baselineStats.userTraffic;
    let baseComp1 = baselineStats.comp1Traffic;
    let baseComp2 = baselineStats.comp2Traffic;
    let baseComp3 = baselineStats.comp3Traffic;

    if (selectedMetric === "visibility") {
      baseUser = baselineStats.userVisibility;
      baseComp1 = baselineStats.comp1Visibility;
      baseComp2 = baselineStats.comp2Visibility;
      baseComp3 = baselineStats.comp3Visibility;
    } else if (selectedMetric === "rankingScore") {
      baseUser = baselineStats.userScore;
      baseComp1 = baselineStats.comp1Score;
      baseComp2 = baselineStats.comp2Score;
      baseComp3 = baselineStats.comp3Score;
    }

    const points: MonthlyDataPoint[] = [];

    for (let m = 0; m <= 6; m++) {
      const futureDate = new Date(date.getFullYear(), date.getMonth() + m, 1);
      const mName = `${monthNames[futureDate.getMonth()]} ${futureDate.getFullYear()}`;
      const mLabel = m === 0 ? "Şu An (0. Ay)" : `+${m}. Ay`;

      let valUser = Math.round(baseUser * Math.pow(1 + userMonthlyGrowth, m));
      let valComp1 = Math.round(baseComp1 * Math.pow(1 + comp1MonthlyGrowth, m));
      let valComp2 = Math.round(baseComp2 * Math.pow(1 + comp2MonthlyGrowth, m));
      let valComp3 = Math.round(baseComp3 * Math.pow(1 + comp3MonthlyGrowth, m));

      // S-curve realism smoothing & minimum thresholds
      if (selectedMetric === "traffic") {
        valUser = Math.max(100, valUser);
        valComp1 = Math.max(100, valComp1);
        valComp2 = Math.max(100, valComp2);
        valComp3 = Math.max(100, valComp3);
      } else if (selectedMetric === "visibility") {
        valUser = Math.max(5, Math.min(96, valUser));
        valComp1 = Math.max(5, Math.min(99, valComp1));
        valComp2 = Math.max(5, Math.min(92, valComp2));
        valComp3 = Math.max(5, Math.min(88, valComp3));
      } else if (selectedMetric === "rankingScore") {
        valUser = Math.max(5, Math.min(98, valUser));
        valComp1 = Math.max(5, Math.min(99, valComp1));
        valComp2 = Math.max(5, Math.min(94, valComp2));
        valComp3 = Math.max(5, Math.min(90, valComp3));
      }

      points.push({
        monthIndex: m,
        monthLabel: mLabel,
        monthName: mName,
        values: {
          user: valUser,
          comp1: valComp1,
          comp2: valComp2,
          comp3: valComp3
        }
      });
    }

    return points;
  }, [baselineStats, selectedMetric, selectedScenario, customGrowthRate]);

  // Dynamic Crossover Detection (First month where user exceeds comp1 or is overtaken)
  const simulationCrossoverMonth = useMemo(() => {
    if (!forecastData || forecastData.length < 2) return null;
    const baseUser = forecastData[0].values.user;
    const baseComp1 = forecastData[0].values.comp1;
    
    if (selectedScenario === "aggressive" && baseUser <= baseComp1) {
      for (let m = 1; m <= 6; m++) {
        if (forecastData[m].values.user >= forecastData[m].values.comp1) {
          return m;
        }
      }
    } else if (selectedScenario === "decline") {
      const baseComp2 = forecastData[0].values.comp2;
      for (let m = 1; m <= 6; m++) {
        if (forecastData[m].values.user <= forecastData[m].values.comp2) {
          return m;
        }
      }
    }
    return null;
  }, [forecastData, selectedScenario]);

  // D3 Rendering
  useEffect(() => {
    if (!svgRef.current || forecastData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = containerWidth;
    const height = 350;
    const margin = { top: 32, right: 36, bottom: 44, left: 62 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    if (innerWidth <= 0 || innerHeight <= 0) return;

    // Defs for gradients & shadow filters
    const defs = svg.append("defs");

    // Glow filter for user line
    const glowFilter = defs.append("filter")
      .attr("id", "forecast-user-glow")
      .attr("x", "-20%")
      .attr("y", "-20%")
      .attr("width", "140%")
      .attr("height", "140%");

    glowFilter.append("feGaussianBlur")
      .attr("stdDeviation", "2.5")
      .attr("result", "blur");

    const feMerge = glowFilter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "blur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Gradients for area fills under lines
    entityConfigs.forEach((cfg) => {
      const grad = defs.append("linearGradient")
        .attr("id", `grad-${cfg.id}`)
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "0%").attr("y2", "100%");

      grad.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", cfg.color)
        .attr("stop-opacity", cfg.isUser ? 0.28 : 0.12);

      grad.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", cfg.color)
        .attr("stop-opacity", 0.0);
    });

    // Main Chart Group
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // X Scale
    const xScale = d3.scaleLinear()
      .domain([0, 6])
      .range([0, innerWidth]);

    // Find min and max across all active entities
    const activeConfigs = entityConfigs.filter(cfg => visibleEntities[cfg.id]);
    let allVals: number[] = [];
    forecastData.forEach(d => {
      activeConfigs.forEach(cfg => {
        allVals.push(d.values[cfg.id]);
      });
    });

    if (allVals.length === 0) allVals = [0, 100];
    const yMin = Math.max(0, Math.floor((d3.min(allVals) || 0) * 0.85));
    const yMax = Math.ceil((d3.max(allVals) || 100) * 1.12);

    // Y Scale
    const yScale = d3.scaleLinear()
      .domain([yMin, yMax])
      .range([innerHeight, 0])
      .nice();

    // Horizontal Grid Lines
    g.append("g")
      .attr("class", "grid")
      .call(
        d3.axisLeft(yScale)
          .ticks(5)
          .tickSize(-innerWidth)
          .tickFormat(() => "")
      )
      .selectAll("line")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-dasharray", "3 3")
      .attr("stroke-opacity", 0.7);

    g.select(".grid .domain").remove();

    // Vertical Month Separators
    forecastData.forEach((d) => {
      const xPos = xScale(d.monthIndex);
      g.append("line")
        .attr("x1", xPos)
        .attr("x2", xPos)
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", d.monthIndex === 0 ? "#94a3b8" : "#f1f5f9")
        .attr("stroke-dasharray", d.monthIndex === 0 ? "none" : "2 2")
        .attr("stroke-width", d.monthIndex === 0 ? 1.5 : 1);
    });

    // Draw Areas First (Behind Lines)
    entityConfigs.forEach((cfg) => {
      if (!visibleEntities[cfg.id]) return;

      const areaPath = d3.area<MonthlyDataPoint>()
        .x(d => xScale(d.monthIndex))
        .y0(innerHeight)
        .y1(d => yScale(d.values[cfg.id]))
        .curve(d3.curveMonotoneX);

      g.append("path")
        .datum(forecastData)
        .attr("fill", `url(#grad-${cfg.id})`)
        .attr("d", areaPath)
        .attr("pointer-events", "none");
    });

    // Draw Competitor Lines (Competitors first, User on top)
    const sortedConfigs = [...entityConfigs].sort((a, b) => (a.isUser ? 1 : 0) - (b.isUser ? 1 : 0));

    sortedConfigs.forEach((cfg) => {
      if (!visibleEntities[cfg.id]) return;

      const linePath = d3.line<MonthlyDataPoint>()
        .x(d => xScale(d.monthIndex))
        .y(d => yScale(d.values[cfg.id]))
        .curve(d3.curveMonotoneX);

      // Line path
      const pathEl = g.append("path")
        .datum(forecastData)
        .attr("fill", "none")
        .attr("stroke", cfg.color)
        .attr("stroke-width", cfg.isUser ? 3.5 : 2)
        .attr("stroke-dasharray", cfg.strokeDash || "none")
        .attr("filter", cfg.isUser ? "url(#forecast-user-glow)" : "none")
        .attr("d", linePath);

      // Animation: stroke-dashoffset transition
      const totalLen = (pathEl.node() as SVGPathElement)?.getTotalLength() || 1000;
      pathEl
        .attr("stroke-dasharray", `${totalLen} ${totalLen}`)
        .attr("stroke-dashoffset", totalLen)
        .transition()
        .duration(850)
        .ease(d3.easeCubicOut)
        .attr("stroke-dashoffset", 0);

      // Month Dots
      forecastData.forEach((d) => {
        const cx = xScale(d.monthIndex);
        const cy = yScale(d.values[cfg.id]);

        // User latest month pulse marker
        if (cfg.isUser && d.monthIndex === 6) {
          g.append("circle")
            .attr("cx", cx)
            .attr("cy", cy)
            .attr("r", 9)
            .attr("fill", cfg.color)
            .attr("fill-opacity", 0.25)
            .attr("class", "animate-ping pointer-events-none");
        }

        const dotG = g.append("g")
          .attr("class", `d3-dot-group cursor-pointer`)
          .attr("id", `d3-dot-${cfg.id}-m${d.monthIndex}`)
          .attr("data-testid", `d3-dot-${cfg.id}-m${d.monthIndex}`);

        // Transparent hit-target for easy clicking
        dotG.append("circle")
          .attr("cx", cx)
          .attr("cy", cy)
          .attr("r", 14)
          .attr("fill", "transparent")
          .attr("cursor", "pointer");

        // Visible circle dot
        dotG.append("circle")
          .attr("cx", cx)
          .attr("cy", cy)
          .attr("r", cfg.isUser ? 5 : 3.8)
          .attr("fill", "#ffffff")
          .attr("stroke", cfg.color)
          .attr("stroke-width", cfg.isUser ? 3 : 2)
          .attr("class", "transition-all duration-200 hover:scale-150 cursor-pointer");

        // Active halo ring if this month is active in Insight Popover
        if (activeInsightMonth === d.monthIndex && cfg.isUser) {
          dotG.append("circle")
            .attr("cx", cx)
            .attr("cy", cy)
            .attr("r", 9.5)
            .attr("fill", "none")
            .attr("stroke", "#f59e0b")
            .attr("stroke-width", 2.5)
            .attr("class", "animate-pulse pointer-events-none");
        }

        // Direct click on dot triggers Insight Popover
        dotG.on("click", (event) => {
          event.stopPropagation();
          handleOpenInsightPopover(
            d.monthIndex,
            { x: cx + margin.left, y: cy + margin.top },
            {
              id: cfg.id,
              name: cfg.name,
              color: cfg.color,
              value: d.values[cfg.id]
            }
          );
        });
      });
    });

    // X Axis
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(
        d3.axisBottom(xScale)
          .ticks(6)
          .tickFormat((d) => {
            const idx = Math.round(Number(d));
            return forecastData[idx]?.monthLabel || "";
          })
      );

    xAxis.select(".domain").attr("stroke", "#cbd5e1");
    xAxis.selectAll("text")
      .attr("fill", "#475569")
      .attr("font-size", "11px")
      .attr("font-weight", (d) => (d === 0 ? "700" : "500"))
      .attr("dy", "12px");

    // Y Axis with formatting
    const formatY = (v: d3.NumberValue) => {
      const val = Number(v);
      if (selectedMetric === "visibility" || selectedMetric === "rankingScore") {
        return `${val} pt`;
      }
      if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
      if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
      return `${val}`;
    };

    const yAxis = g.append("g")
      .call(
        d3.axisLeft(yScale)
          .ticks(5)
          .tickFormat(formatY)
      );

    yAxis.select(".domain").remove();
    yAxis.selectAll("text")
      .attr("fill", "#64748b")
      .attr("font-size", "11px")
      .attr("font-weight", "500");

    // Crosshair & Hover Overlay
    const crosshair = g.append("line")
      .attr("class", "crosshair")
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", "#0f172a")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "4 4")
      .attr("opacity", 0)
      .attr("pointer-events", "none");

    const overlay = g.append("rect")
      .attr("class", "overlay")
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .attr("fill", "transparent")
      .attr("cursor", "crosshair");

    overlay
      .on("mousemove", function (event) {
        const [mx] = d3.pointer(event);
        const monthFrac = xScale.invert(mx);
        const nearestMonth = Math.max(0, Math.min(6, Math.round(monthFrac)));
        const point = forecastData[nearestMonth];

        if (point) {
          const snappedX = xScale(nearestMonth);
          crosshair
            .attr("x1", snappedX)
            .attr("x2", snappedX)
            .attr("opacity", 1);

          setHoveredPoint(point);
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) {
            setTooltipPos({
              x: snappedX + margin.left,
              y: margin.top + 20
            });
          }
        }
      })
      .on("mouseleave", function () {
        crosshair.attr("opacity", 0);
        setHoveredPoint(null);
        setTooltipPos(null);
      })
      .on("click", function (event) {
        const [mx] = d3.pointer(event);
        const monthFrac = xScale.invert(mx);
        const nearestMonth = Math.max(0, Math.min(6, Math.round(monthFrac)));
        const snappedX = xScale(nearestMonth);
        const userVal = forecastData[nearestMonth]?.values.user || 0;
        const userY = yScale(userVal);
        handleOpenInsightPopover(
          nearestMonth,
          { x: snappedX + margin.left, y: userY + margin.top },
          {
            id: "user",
            name: userName,
            color: "#059669",
            value: userVal
          }
        );
      });

    // Month Interactive Annotation Pins / Badges above each month column
    const annotationPinsGroup = g.append("g")
      .attr("class", "annotation-pins-layer");

    forecastData.forEach((d) => {
      const xPos = xScale(d.monthIndex);
      const note = monthNotes[d.monthIndex];
      const hasNote = Boolean(note && note.text && note.text.trim());
      const isCurrentSelected = d.monthIndex === selectedAnnotationMonth || d.monthIndex === activeInsightMonth;

      const pinG = annotationPinsGroup.append("g")
        .attr("class", "month-annotation-pin cursor-pointer")
        .attr("transform", `translate(${xPos}, -14)`)
        .on("click", (event) => {
          event.stopPropagation();
          setSelectedAnnotationMonth(d.monthIndex);
          setIsAnnotationBoxOpen(true);
          setTimeout(() => {
            const box = document.getElementById("d3-monthly-forecast-annotation-box");
            if (box) {
              box.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }
          }, 60);
          const userVal = d.values.user;
          const userY = yScale(userVal);
          handleOpenInsightPopover(
            d.monthIndex,
            { x: xPos + margin.left, y: userY + margin.top },
            {
              id: "user",
              name: userName,
              color: "#059669",
              value: userVal
            }
          );
        });

      // Pin background pill
      pinG.append("rect")
        .attr("x", -23)
        .attr("y", -10)
        .attr("width", 46)
        .attr("height", 20)
        .attr("rx", 10)
        .attr("fill", isCurrentSelected ? "#f59e0b" : hasNote ? "#0f172a" : "#f8fafc")
        .attr("stroke", isCurrentSelected ? "#b45309" : hasNote ? "#f59e0b" : "#cbd5e1")
        .attr("stroke-width", isCurrentSelected ? 2 : hasNote ? 1.5 : 1)
        .attr("cursor", "pointer")
        .attr("opacity", 0.95);

      // Pin text
      pinG.append("text")
        .attr("text-anchor", "middle")
        .attr("y", 3.5)
        .attr("font-size", "9.5px")
        .attr("font-weight", "800")
        .attr("fill", isCurrentSelected ? "#0f172a" : hasNote ? "#fbbf24" : "#64748b")
        .attr("cursor", "pointer")
        .text(hasNote ? `📝 M${d.monthIndex}` : `+ Not`);
    });

  }, [forecastData, containerWidth, visibleEntities, selectedMetric, monthNotes, selectedAnnotationMonth, activeInsightMonth]);

  // Strategic Insights Calculations
  const userStart = forecastData[0]?.values.user || 1;
  const userEnd = forecastData[6]?.values.user || 1;
  const userGrowthPct = Math.round(((userEnd - userStart) / userStart) * 100);

  const comp1Start = forecastData[0]?.values.comp1 || 1;
  const comp1End = forecastData[6]?.values.comp1 || 1;
  const comp1GrowthPct = Math.round(((comp1End - comp1Start) / comp1Start) * 100);

  const comp2Start = forecastData[0]?.values.comp2 || 1;
  const comp2End = forecastData[6]?.values.comp2 || 1;
  const comp2GrowthPct = Math.round(((comp2End - comp2Start) / comp2Start) * 100);

  const comp3Start = forecastData[0]?.values.comp3 || 1;
  const comp3End = forecastData[6]?.values.comp3 || 1;
  const comp3GrowthPct = Math.round(((comp3End - comp3Start) / comp3Start) * 100);

  // Check crossover: at which month does user exceed any competitor?
  const crossoverMonth = useMemo(() => {
    for (let m = 1; m <= 6; m++) {
      const pt = forecastData[m];
      if (pt.values.user > pt.values.comp2) return { month: m, comp: comp2.name };
      if (pt.values.user > pt.values.comp3) return { month: m, comp: comp3.name };
    }
    return null;
  }, [forecastData, comp2.name, comp3.name]);

  const toggleEntityVisibility = (id: string) => {
    setVisibleEntities(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const showOnlyEntity = (id: string) => {
    const isCurrentlySolo = Object.keys(visibleEntities).every(k => (k === id ? visibleEntities[k] : !visibleEntities[k]));
    if (isCurrentlySolo) {
      setVisibleEntities({ user: true, comp1: true, comp2: true, comp3: true });
    } else {
      setVisibleEntities({
        user: id === "user",
        comp1: id === "comp1",
        comp2: id === "comp2",
        comp3: id === "comp3"
      });
    }
  };

  const showAllEntities = () => {
    setVisibleEntities({ user: true, comp1: true, comp2: true, comp3: true });
  };

  const showOnlyUser = () => {
    setVisibleEntities({ user: true, comp1: false, comp2: false, comp3: false });
  };

  const hideAllCompetitors = () => {
    setVisibleEntities(prev => ({
      ...prev,
      comp1: false,
      comp2: false,
      comp3: false
    }));
  };

  const activeEntitiesCount = Object.values(visibleEntities).filter(Boolean).length;

  // High-Resolution Chart Export Handler (PNG @2x / SVG)
  const handleSaveChart = async (format: "png" | "svg" = "png") => {
    if (!svgRef.current) return;
    setIsExporting(true);

    try {
      const svgEl = svgRef.current;
      const bbox = svgEl.getBoundingClientRect();
      const width = bbox.width > 0 ? Math.round(bbox.width) : (containerWidth || 850);
      const height = bbox.height > 0 ? Math.round(bbox.height) : 340;

      // Clone SVG element to manipulate without affecting live view
      const clone = svgEl.cloneNode(true) as SVGSVGElement;
      clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
      clone.setAttribute("width", String(width));
      clone.setAttribute("height", String(height));
      clone.setAttribute("viewBox", `0 0 ${width} ${height}`);

      // Insert clean white background card behind everything so transparent dark doesn't black out
      const bgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      bgRect.setAttribute("width", "100%");
      bgRect.setAttribute("height", "100%");
      bgRect.setAttribute("fill", "#ffffff");
      bgRect.setAttribute("rx", "16");
      clone.insertBefore(bgRect, clone.firstChild);

      // Embedded styles for self-contained rendering
      const styleEl = document.createElementNS("http://www.w3.org/2000/svg", "style");
      styleEl.textContent = `
        text { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
        .grid line { stroke: #e2e8f0; stroke-opacity: 0.8; }
        .crosshair, .overlay { display: none !important; }
      `;
      clone.appendChild(styleEl);

      // Remove crosshair & overlay from clone
      const crosshair = clone.querySelector(".crosshair");
      if (crosshair) crosshair.remove();
      const overlay = clone.querySelector(".overlay");
      if (overlay) overlay.remove();

      // Filename with timestamp and selected metric
      const timestamp = new Date().toISOString().slice(0, 10);
      const metricLabel = selectedMetric === "traffic" ? "organik-trafik" : selectedMetric === "visibility" ? "gorunurluk" : "siralama-skoru";
      const filename = `seo-6-aylik-buyume-grafigi-${metricLabel}-${timestamp}.${format}`;

      if (format === "svg") {
        const serializer = new XMLSerializer();
        let source = serializer.serializeToString(clone);
        if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
          source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
        const svgUrl = URL.createObjectURL(svgBlob);
        const downloadLink = document.createElement("a");
        downloadLink.href = svgUrl;
        downloadLink.download = filename;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(svgUrl);

        setExportSuccessMessage("Vektörel SVG Grafiği Başarıyla İndirildi!");
      } else {
        // High-resolution PNG (2x scale for crystal clear Retina resolution)
        const scale = 2;
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(clone);
        const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
        const blobUrl = URL.createObjectURL(svgBlob);

        await new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            try {
              const canvas = document.createElement("canvas");
              canvas.width = width * scale;
              canvas.height = height * scale;
              const ctx = canvas.getContext("2d");
              if (!ctx) {
                URL.revokeObjectURL(blobUrl);
                reject(new Error("Canvas context oluşturulamadı"));
                return;
              }

              // Smooth anti-aliased rendering
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = "high";

              // Clean white background
              ctx.fillStyle = "#ffffff";
              ctx.fillRect(0, 0, canvas.width, canvas.height);

              // Draw image scaled up
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              URL.revokeObjectURL(blobUrl);

              const pngDataUrl = canvas.toDataURL("image/png", 1.0);
              const downloadLink = document.createElement("a");
              downloadLink.href = pngDataUrl;
              downloadLink.download = filename;
              document.body.appendChild(downloadLink);
              downloadLink.click();
              document.body.removeChild(downloadLink);

              setExportSuccessMessage("Yüksek Çözünürlüklü (2x HD) PNG Grafiği İndirildi!");
              resolve();
            } catch (err) {
              URL.revokeObjectURL(blobUrl);
              reject(err);
            }
          };
          img.onerror = (e) => {
            console.error("Image loading error during export:", e);
            URL.revokeObjectURL(blobUrl);
            reject(new Error("Görsel işlenirken hata oluştu"));
          };
          img.src = blobUrl;
        });
      }
    } catch (err) {
      console.error("Grafik kaydedilirken hata oluştu:", err);
      setExportSuccessMessage("Kayıt sırasında bir hata oluştu");
    } finally {
      setIsExporting(false);
      setIsSaveMenuOpen(false);
      setTimeout(() => {
        setExportSuccessMessage(null);
      }, 3500);
    }
  };

  // Monthly Strategic Forecast Note Handlers
  const handleSaveNote = (
    monthIndex: number, 
    text: string, 
    category: MonthForecastAnnotation["category"]
  ) => {
    const point = forecastData[monthIndex] || forecastData[0];
    const newNote: MonthForecastAnnotation = {
      monthIndex,
      monthLabel: point?.monthLabel || (monthIndex === 0 ? "Şu An (0. Ay)" : `+${monthIndex}. Ay`),
      monthName: point?.monthName || "",
      text,
      category,
      updatedAt: new Date().toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
      })
    };

    setMonthNotes((prev) => {
      const updated = { ...prev, [monthIndex]: newNote };
      try {
        localStorage.setItem("seo_d3_monthly_forecast_notes_v1", JSON.stringify(updated));
      } catch (e) {
        console.error("Failed saving note to localStorage:", e);
      }
      return updated;
    });
  };

  const handleDeleteNote = (monthIndex: number) => {
    setMonthNotes((prev) => {
      const updated = { ...prev };
      delete updated[monthIndex];
      try {
        localStorage.setItem("seo_d3_monthly_forecast_notes_v1", JSON.stringify(updated));
      } catch (e) {
        console.error("Failed deleting note from localStorage:", e);
      }
      return updated;
    });
  };

  const handleResetNotesToDefaults = () => {
    const resetNotes: Record<number, MonthForecastAnnotation> = {};
    forecastData.forEach((pt) => {
      const preset = DEFAULT_MONTH_PRESETS[pt.monthIndex];
      if (preset) {
        resetNotes[pt.monthIndex] = {
          monthIndex: pt.monthIndex,
          monthLabel: pt.monthLabel,
          monthName: pt.monthName,
          text: preset.text,
          category: preset.category,
          updatedAt: new Date().toLocaleDateString("tr-TR")
        };
      }
    });
    setMonthNotes(resetNotes);
    try {
      localStorage.setItem("seo_d3_monthly_forecast_notes_v1", JSON.stringify(resetNotes));
    } catch (e) {
      console.error("Failed resetting notes in localStorage:", e);
    }
  };

  return (
    <div 
      id="seo-competitor-growth-forecast-d3-chart"
      data-testid="seo-competitor-growth-forecast-d3-chart"
      className={`rounded-3xl border border-indigo-200/90 bg-white shadow-sm overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* 1. Header with Controls */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-950">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-900/40 shrink-0 mt-0.5">
              <TrendingUp className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                  <span>6 Aylık Tahmini Rakip Performans Büyümesi</span>
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>D3.js Çizgi Grafik Modülü</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                Tablodaki {rankings.length} anahtar kelimenin hacmi, SERP sıralamaları ve SEO zorluk derecelerini baz alan 6 aylık organik büyüme tahmini.
              </p>
            </div>
          </div>

          {/* Right Action & Expand/Collapse Toggle */}
          <div className="flex items-center gap-2.5 self-end lg:self-center">
            {/* Grafiği Kaydet (Save Chart - PNG / SVG) Action Button & Dropdown */}
            <div ref={saveMenuRef} className="relative inline-flex items-center shadow-xs">
              <button
                type="button"
                id="btn-save-growth-chart"
                data-testid="btn-save-growth-chart"
                onClick={() => handleSaveChart("png")}
                disabled={isExporting}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-l-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold transition-all cursor-pointer border border-emerald-500 disabled:opacity-50"
                title="6 Aylık Büyüme Grafiğini Yüksek Çözünürlüklü (2x HD) PNG formatında kaydedin"
              >
                {isExporting ? (
                  <RotateCcw className="w-3.5 h-3.5 animate-spin text-white" />
                ) : exportSuccessMessage ? (
                  <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                ) : (
                  <Download className="w-3.5 h-3.5 text-white" />
                )}
                <span>{exportSuccessMessage ? "Kaydedildi!" : "Grafiği Kaydet"}</span>
                <span className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-emerald-700/80 text-emerald-100 text-[10px] font-black tracking-wider">
                  PNG
                </span>
              </button>

              <button
                type="button"
                id="btn-save-growth-chart-dropdown"
                data-testid="btn-save-growth-chart-dropdown"
                onClick={() => setIsSaveMenuOpen(prev => !prev)}
                className="p-1.5 rounded-r-xl bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white text-xs font-bold transition-all cursor-pointer border-y border-r border-emerald-500"
                title="Kayıt Formatı Seçenekleri (Yüksek Çözünürlüklü PNG veya Vektörel SVG)"
                aria-label="Format Seçenekleri Menüsü"
                aria-expanded={isSaveMenuOpen}
              >
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isSaveMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Format Options Dropdown Menu */}
              {isSaveMenuOpen && (
                <div
                  id="save-chart-format-menu"
                  data-testid="save-chart-format-menu"
                  className="absolute right-0 top-full mt-2 z-50 w-64 p-2 rounded-2xl bg-slate-900 border border-slate-700 text-white shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-800 mb-1 flex items-center justify-between">
                    <span>Görsel Formatı Seçin</span>
                    <span className="text-emerald-400 font-mono">D3.js HD</span>
                  </div>

                  {/* Option 1: PNG (2x HD) */}
                  <button
                    type="button"
                    id="btn-export-chart-png"
                    data-testid="btn-export-chart-png"
                    onClick={() => handleSaveChart("png")}
                    disabled={isExporting}
                    className="w-full flex items-center justify-between p-2 rounded-xl text-left text-xs font-semibold hover:bg-slate-800 cursor-pointer transition-colors text-slate-200 hover:text-white"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <FileImage className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>PNG Görseli</span>
                          <span className="text-[10px] px-1 py-0.2 rounded bg-emerald-500/30 text-emerald-300 font-mono">2x HD</span>
                        </div>
                        <div className="text-[10px] text-slate-400">Sunum, PDF ve raporlar için 300 DPI netlik</div>
                      </div>
                    </div>
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Option 2: SVG (Vector) */}
                  <button
                    type="button"
                    id="btn-export-chart-svg"
                    data-testid="btn-export-chart-svg"
                    onClick={() => handleSaveChart("svg")}
                    disabled={isExporting}
                    className="w-full flex items-center justify-between p-2 rounded-xl text-left text-xs font-semibold hover:bg-slate-800 cursor-pointer transition-colors text-slate-200 hover:text-white mt-1"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                        <FileCode className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>Vektörel SVG</span>
                          <span className="text-[10px] px-1 py-0.2 rounded bg-indigo-500/30 text-indigo-300 font-mono">Vector</span>
                        </div>
                        <div className="text-[10px] text-slate-400">Kayıpsız büyütülebilir vektör çizim dosyası</div>
                      </div>
                    </div>
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              )}
            </div>

            {/* Tahmin Notları Toggle Button */}
            <button
              type="button"
              id="btn-toggle-forecast-notes-box"
              data-testid="btn-toggle-forecast-notes-box"
              onClick={() => {
                setIsAnnotationBoxOpen(prev => !prev);
                if (!isAnnotationBoxOpen) {
                  setTimeout(() => {
                    const box = document.getElementById("d3-monthly-forecast-annotation-box");
                    if (box) box.scrollIntoView({ behavior: "smooth", block: "nearest" });
                  }, 60);
                }
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                isAnnotationBoxOpen
                  ? "bg-amber-500 text-slate-950 border-amber-400 shadow-xs"
                  : "bg-white/10 hover:bg-white/20 text-white border-white/15"
              }`}
              title="Her ay için özel tahmin notu ve stratejik kilometre taşları açıklama kutusunu aç/kapat"
              aria-expanded={isAnnotationBoxOpen}
            >
              <StickyNote className="w-3.5 h-3.5 text-amber-300" />
              <span>Tahmin Notları</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-black ${
                isAnnotationBoxOpen ? "bg-slate-900 text-amber-300" : "bg-white/20 text-white"
              }`}>
                {Object.keys(monthNotes).filter(k => monthNotes[Number(k)]?.text?.trim()).length}/7
              </span>
            </button>

            <button
              type="button"
              id="btn-toggle-growth-forecast-chart"
              data-testid="btn-toggle-growth-forecast-chart"
              onClick={() => setIsExpanded(prev => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer border border-white/15"
              aria-expanded={isExpanded}
            >
              <span>{isExpanded ? "Grafiği Gizle" : "Grafiği Göster"}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>

        {/* Metric & Scenario Selectors Bar */}
        {isExpanded && (
          <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Metric Mode Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-400 font-bold mr-1">Metrik:</span>
              {[
                { id: "traffic", label: "📈 Tahmini Organik Trafik", title: "Aylık tahmini organik ziyaretçi projeksiyonu" },
                { id: "visibility", label: "🎯 SERP Görünürlük (0-100)", title: "Arama motoru görünürlük skoru" },
                { id: "rankingScore", label: "⭐ Sıralama Kalite Skoru", title: "Anahtar kelimeler genel rekabet puanı" }
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  id={`btn-metric-${m.id}`}
                  onClick={() => setSelectedMetric(m.id as ForecastMetricType)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    selectedMetric === m.id
                      ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-xs shadow-emerald-500/30"
                      : "bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700"
                  }`}
                  title={m.title}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Scenario Analysis Mode Controls */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-400 font-bold mr-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Senaryo Analizi:</span>
              </span>
              
              <div className="inline-flex items-center p-0.5 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-xs">
                {[
                  { id: "aggressive", label: "🚀 Agresif Büyüme", rate: "+%18.5", color: "bg-emerald-500 text-slate-950 border-emerald-400 font-black" },
                  { id: "stable", label: "⚖️ Stabil", rate: "+%4.0", color: "bg-sky-500 text-slate-950 border-sky-400 font-black" },
                  { id: "decline", label: "⚠️ Düşüş", rate: "-%7.5", color: "bg-rose-500 text-white border-rose-400 font-black" }
                ].map((sc) => {
                  const isSelected = selectedScenario === sc.id;
                  return (
                    <button
                      key={sc.id}
                      type="button"
                      id={`btn-header-scenario-${sc.id}`}
                      data-testid={`btn-header-scenario-${sc.id}`}
                      onClick={() => {
                        setSelectedScenario(sc.id as ForecastScenarioType);
                        setCustomGrowthRate(null);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer border flex items-center gap-1 ${
                        isSelected
                          ? `${sc.color} shadow-xs`
                          : "border-transparent text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                      title={`${sc.label} senaryosu ile 6 aylık grafiği simüle edin (${sc.rate}/ay)`}
                    >
                      <span>{sc.label}</span>
                      <span className={`text-[10px] px-1 py-0.2 rounded font-mono ${
                        isSelected ? "bg-black/20 text-current" : "text-slate-500"
                      }`}>
                        {sc.rate}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Accessible Dropdown Fallback */}
              <select
                id="select-growth-scenario"
                data-testid="select-growth-scenario"
                value={selectedScenario}
                onChange={(e) => {
                  setSelectedScenario(e.target.value as ForecastScenarioType);
                  setCustomGrowthRate(null);
                }}
                className="py-1 px-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-amber-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer hidden lg:inline-block"
                aria-label="Senaryo Seçimi"
              >
                <option value="aggressive">Agresif Büyüme (+%18.5/ay)</option>
                <option value="stable">Stabil / Dengeli (+%4.0/ay)</option>
                <option value="decline">Düşüş / Risk (-%7.5/ay)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 2. Chart Body */}
      {isExpanded && (
        <div className="p-5 sm:p-6 space-y-6">
          {/* 2.0 SENARYO ANALİZİ & ETKİ SİMÜLASYONU MODÜLÜ */}
          <ScenarioSimulationPanel
            selectedScenario={selectedScenario}
            onSelectScenario={(sc) => {
              setSelectedScenario(sc);
              setCustomGrowthRate(null);
            }}
            customGrowthRate={customGrowthRate}
            onCustomGrowthRateChange={setCustomGrowthRate}
            selectedMetric={selectedMetric}
            baselineUserValue={forecastData[0]?.values.user || 0}
            projected6MonthUserValue={forecastData[6]?.values.user || 0}
            baselineComp1Value={forecastData[0]?.values.comp1 || 0}
            projected6MonthComp1Value={forecastData[6]?.values.comp1 || 0}
            userName={userName}
            comp1Name={comp1.name}
            crossoverMonth={simulationCrossoverMonth}
            isOpen={isScenarioPanelOpen}
            onToggleOpen={() => setIsScenarioPanelOpen(prev => !prev)}
          />

          {/* 2.1 RAKİP SERİSİ SEÇİCİ (LEGEND CHECKBOX PANEL) */}
          <div 
            id="competitor-series-selector"
            data-testid="competitor-series-selector"
            className="p-4 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100/60 border border-slate-200/90 shadow-2xs space-y-3.5"
          >
            {/* Header & Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-200/80">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
                  <Layers className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black text-slate-900 tracking-tight uppercase flex items-center gap-1.5">
                      <span>Rakip Serisi Seçici</span>
                    </h4>
                    <span 
                      id="badge-active-series-count"
                      data-testid="badge-active-series-count"
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-tight ${
                        activeEntitiesCount === 0
                          ? "bg-rose-100 text-rose-800 border border-rose-200"
                          : activeEntitiesCount === 4
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-indigo-100 text-indigo-800 border border-indigo-200"
                      }`}
                    >
                      {activeEntitiesCount}/4 Seri Aktif
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Grafikte görmek istediğiniz rakipleri tek tek veya toplu olarak seçip gizleyin.
                  </p>
                </div>
              </div>

              {/* Bulk Quick Actions */}
              <div className="flex items-center gap-1.5 flex-wrap self-start sm:self-auto">
                <button
                  type="button"
                  id="btn-series-show-all"
                  data-testid="btn-series-show-all"
                  onClick={showAllEntities}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold shadow-2xs cursor-pointer transition-all active:scale-95"
                  title="Tüm rakipleri ve sitenizi grafikte göster"
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tümünü Göster</span>
                </button>

                <button
                  type="button"
                  id="btn-series-only-user"
                  data-testid="btn-series-only-user"
                  onClick={showOnlyUser}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold shadow-2xs cursor-pointer transition-all active:scale-95"
                  title="Yalnızca kendi sitenizin grafiğini görüntüleyin (rakipleri gizler)"
                >
                  <Target className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Sadece Sitemiz</span>
                </button>

                <button
                  type="button"
                  id="btn-series-hide-all-competitors"
                  data-testid="btn-series-hide-all-competitors"
                  onClick={hideAllCompetitors}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold shadow-2xs cursor-pointer transition-all active:scale-95"
                  title="Tüm rakip çizgilerini gizle"
                >
                  <EyeOff className="w-3.5 h-3.5 text-rose-500" />
                  <span>Rakipleri Gizle</span>
                </button>
              </div>
            </div>

            {/* Checkbox Series Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {entityConfigs.map((cfg) => {
                const isVisible = !!visibleEntities[cfg.id];
                return (
                  <div
                    key={cfg.id}
                    id={`series-card-${cfg.id}`}
                    data-testid={`series-card-${cfg.id}`}
                    className={`group relative flex flex-col justify-between p-3 rounded-2xl border transition-all duration-200 ${
                      isVisible
                        ? "bg-white border-slate-300/90 shadow-2xs ring-1 ring-slate-900/5 hover:border-indigo-400"
                        : "bg-slate-100/80 border-slate-200/80 opacity-60 hover:opacity-85"
                    }`}
                  >
                    {/* Top Row: Checkbox + Series Color Bar + Name */}
                    <div className="flex items-start gap-2.5">
                      {/* Real & Styled Checkbox Control */}
                      <label 
                        htmlFor={`legend-checkbox-${cfg.id}`}
                        className="relative flex items-center justify-center shrink-0 cursor-pointer pt-0.5 select-none"
                        title={isVisible ? `${cfg.name} serisini gizlemek için tıklayın` : `${cfg.name} serisini göstermek için tıklayın`}
                      >
                        <input
                          type="checkbox"
                          id={`legend-checkbox-${cfg.id}`}
                          data-testid={`legend-checkbox-${cfg.id}`}
                          checked={isVisible}
                          onChange={() => toggleEntityVisibility(cfg.id)}
                          className="sr-only peer"
                          aria-label={`${cfg.name} serisini grafikte göster/gizle`}
                        />
                        <div 
                          className={`w-4 h-4 rounded-md flex items-center justify-center transition-all ${
                            isVisible 
                              ? "text-white shadow-xs" 
                              : "border-2 border-slate-300 bg-white group-hover:border-slate-400"
                          }`}
                          style={{ backgroundColor: isVisible ? cfg.color : undefined }}
                        >
                          {isVisible && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </label>

                      {/* Series Color & Identity Info */}
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          {/* D3 Line Sample Swatch */}
                          <div 
                            className="w-4 h-1 rounded-full shrink-0" 
                            style={{ 
                              backgroundColor: cfg.color, 
                              opacity: isVisible ? 1 : 0.4 
                            }} 
                            title={`${cfg.color} renkli grafik çizgisi`}
                          />
                          <label
                            htmlFor={`legend-checkbox-${cfg.id}`}
                            className={`text-xs font-bold truncate cursor-pointer transition-colors ${
                              isVisible 
                                ? "text-slate-900 group-hover:text-indigo-950" 
                                : "text-slate-500 line-through"
                            }`}
                          >
                            {cfg.name}
                          </label>
                        </div>

                        <div className="flex items-center justify-between gap-1 text-[10px]">
                          <span className="text-slate-400 font-mono truncate max-w-[110px]" title={cfg.domain}>
                            {cfg.domain || "-"}
                          </span>
                          {cfg.isUser ? (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-black text-[9px] shrink-0">
                              SİZ
                            </span>
                          ) : (
                            <span className="text-[9px] font-semibold text-slate-500 shrink-0">
                              {cfg.id === "comp1" ? "1. Lider" : cfg.id === "comp2" ? "2. Rakip" : "3. Rakip"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row: Status Indicator & Solo Button */}
                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 text-[10px]">
                      <div className="flex items-center gap-1">
                        <span 
                          className={`w-1.5 h-1.5 rounded-full ${isVisible ? "animate-pulse" : ""}`}
                          style={{ backgroundColor: isVisible ? cfg.color : "#94a3b8" }}
                        />
                        <span className={isVisible ? "font-bold text-slate-700" : "text-slate-400"}>
                          {isVisible ? "Grafikte Açık" : "Gizlendi"}
                        </span>
                      </div>

                      <button
                        type="button"
                        id={`btn-solo-series-${cfg.id}`}
                        data-testid={`btn-solo-series-${cfg.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          showOnlyEntity(cfg.id);
                        }}
                        className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer transition-colors"
                        title={`Yalnızca ${cfg.name} serisini görüntüle (diğerlerini gizler)`}
                      >
                        Yalnızca Bu Seri
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions & Metric Status Bar */}
          <div className="flex items-center justify-between gap-3 px-1 py-1 text-xs">
            <div className="flex items-center gap-2 text-slate-500 font-medium text-[11px]">
              <span className="inline-flex items-center gap-1 text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                <BarChart2 className="w-3 h-3" />
                <span>
                  {selectedMetric === "traffic" ? "Tahmini Organik Trafik" : selectedMetric === "visibility" ? "SERP Görünürlük" : "Sıralama Kalite Skoru"}
                </span>
              </span>
              <span className="hidden sm:inline text-slate-400">•</span>
              <span className="hidden sm:inline text-slate-700 font-bold">
                {selectedScenario === "aggressive" 
                  ? "🚀 Agresif Büyüme (+%18.5/ay)" 
                  : selectedScenario === "decline" 
                    ? "⚠️ Düşüş Riski (-%7.5/ay)" 
                    : "⚖️ Stabil Trend (+%4.0/ay)"}
              </span>
            </div>

            {/* Quick Export & Quick Note Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Quick Button to Jump / Edit Selected Month Note */}
              <button
                type="button"
                id="btn-quick-open-forecast-notes"
                data-testid="btn-quick-open-forecast-notes"
                onClick={() => {
                  setIsAnnotationBoxOpen(prev => !prev);
                  if (!isAnnotationBoxOpen) {
                    setTimeout(() => {
                      const box = document.getElementById("d3-monthly-forecast-annotation-box");
                      if (box) {
                        box.scrollIntoView({ behavior: "smooth", block: "nearest" });
                      }
                    }, 60);
                  }
                }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer shadow-2xs border ${
                  isAnnotationBoxOpen
                    ? "bg-amber-500 text-slate-950 border-amber-400 font-black"
                    : "bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900"
                }`}
                title="6 aylık grafik için her ay özel tahmin notu ekleme kutusunu aç/kapat"
              >
                <StickyNote className={`w-3 h-3 ${isAnnotationBoxOpen ? "text-slate-950" : "text-amber-600"}`} />
                <span>Tahmin Notu Açıklama Kutusu ({selectedAnnotationMonth === 0 ? "0. Ay" : `+${selectedAnnotationMonth}. Ay`})</span>
                <span className={`px-1 py-0.2 rounded text-[9px] font-mono font-black ${
                  isAnnotationBoxOpen ? "bg-slate-900 text-amber-300" : "bg-amber-200/90 text-amber-900"
                }`}>
                  {monthNotes[selectedAnnotationMonth]?.text ? "Dolu" : "+Ekle"}
                </span>
              </button>

              <div className="h-3 w-px bg-slate-200 hidden sm:block" />

              <span className="text-[11px] text-slate-400 font-bold hidden md:inline">Dışa Aktar:</span>
              <button
                type="button"
                id="btn-quick-export-png"
                data-testid="btn-quick-export-png"
                onClick={() => handleSaveChart("png")}
                disabled={isExporting}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-slate-200 text-slate-700 text-[11px] font-bold transition-all cursor-pointer disabled:opacity-50"
                title="Grafiği yüksek çözünürlüklü (2x HD) PNG görseli olarak kaydedin"
              >
                <ImageIcon className="w-3 h-3 text-emerald-600" />
                <span>PNG (2x HD)</span>
              </button>

              <button
                type="button"
                id="btn-quick-export-svg"
                data-testid="btn-quick-export-svg"
                onClick={() => handleSaveChart("svg")}
                disabled={isExporting}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 text-slate-700 text-[11px] font-bold transition-all cursor-pointer disabled:opacity-50"
                title="Grafiği kayıpsız vektörel SVG dosyası olarak kaydedin"
              >
                <FileCode className="w-3 h-3 text-indigo-600" />
                <span>SVG Vektör</span>
              </button>
            </div>
          </div>

          {/* 2.2 İnteraktif Aylık Tahmin Notu Açıklama Kutusu (Grafiğin Doğrudan Üzerinde) */}
          {isAnnotationBoxOpen && (
            <ForecastMonthAnnotationBox
              months={forecastData}
              selectedMonthIndex={selectedAnnotationMonth}
              onSelectMonth={(idx) => setSelectedAnnotationMonth(idx)}
              notes={monthNotes}
              onSaveNote={handleSaveNote}
              onDeleteNote={handleDeleteNote}
              onResetDefaults={handleResetNotesToDefaults}
              selectedMetric={selectedMetric}
              userName={userName}
              competitors={competitors}
            />
          )}

          {/* D3 SVG Container with Relative Positioning for Tooltip */}
          <div 
            ref={containerRef} 
            className="w-full relative bg-slate-50/50 rounded-2xl p-2 border border-slate-100 overflow-hidden"
          >
            {/* Empty State Overlay if All Series Hidden */}
            {activeEntitiesCount === 0 && (
              <div 
                id="forecast-no-series-overlay"
                data-testid="forecast-no-series-overlay"
                className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/90 backdrop-blur-2xs p-6 text-center rounded-2xl"
              >
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-2 shadow-2xs">
                  <EyeOff className="w-6 h-6" />
                </div>
                <h5 className="text-sm font-black text-slate-800">Tüm Rakip ve Seri Çizgileri Gizlendi</h5>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Grafikte tahmin trendlerini ve performans çizgilerini görüntülemek için yukarıdaki "Rakip Serisi Seçici" kontrolünden en az bir seriyi işaretleyin.
                </p>
                <button
                  type="button"
                  id="btn-overlay-restore-all"
                  onClick={showAllEntities}
                  className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-all active:scale-95"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Tüm Serileri Göster</span>
                </button>
              </div>
            )}

            <svg
              ref={svgRef}
              width="100%"
              height="340"
              className="overflow-visible"
              aria-label="6 Aylık Tahmini Rakip Performans Büyümesi Çizgi Grafiği"
            />

            {/* Custom Interactive Tooltip */}
            {hoveredPoint && tooltipPos && (
              <div
                className="absolute z-20 pointer-events-none p-3 rounded-xl bg-slate-900/95 text-white shadow-xl border border-slate-700 text-xs backdrop-blur-md transition-all transform -translate-x-1/2 min-w-[220px]"
                style={{
                  left: `${Math.max(120, Math.min(containerWidth - 120, tooltipPos.x))}px`,
                  top: `18px`
                }}
              >
                <div className="font-black text-amber-400 border-b border-slate-700 pb-1.5 mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span>{hoveredPoint.monthLabel}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                      selectedScenario === "aggressive" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" :
                      selectedScenario === "decline" ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" :
                      "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                    }`}>
                      {selectedScenario === "aggressive" ? "🚀 Agresif" : selectedScenario === "decline" ? "⚠️ Düşüş" : "⚖️ Stabil"}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-300 font-normal">{hoveredPoint.monthName}</span>
                </div>

                <div className="space-y-1.5">
                  {entityConfigs
                    .filter(c => visibleEntities[c.id])
                    .map(c => {
                      const val = hoveredPoint.values[c.id];
                      const baselineVal = forecastData[0]?.values[c.id] || 1;
                      const diffPct = Math.round(((val - baselineVal) / baselineVal) * 100);
                      const isUser = c.isUser;

                      return (
                        <div 
                          key={c.id} 
                          className={`flex items-center justify-between gap-2 p-1 rounded ${
                            isUser ? "bg-emerald-950/70 border border-emerald-500/40" : ""
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate max-w-[130px]">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                            <span className={`truncate ${isUser ? "font-bold text-emerald-300" : "text-slate-200"}`}>
                              {c.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 font-mono text-right">
                            <span className="font-bold">
                              {selectedMetric === "traffic" ? val.toLocaleString("tr-TR") : `${val} pt`}
                            </span>
                            {hoveredPoint.monthIndex > 0 && (
                              <span className={`text-[10px] font-black ${diffPct >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                {diffPct >= 0 ? `+${diffPct}%` : `${diffPct}%`}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Custom Monthly Forecast Note Preview in Tooltip */}
                {monthNotes[hoveredPoint.monthIndex]?.text && (
                  <div className="mt-2.5 pt-2 border-t border-slate-700/80">
                    <div className="flex items-center justify-between text-[10px] font-bold text-amber-300 pb-1">
                      <span className="flex items-center gap-1">
                        <StickyNote className="w-3 h-3 text-amber-400" />
                        <span>Aylık Tahmin Notu ({hoveredPoint.monthLabel})</span>
                      </span>
                      <span className="text-[9px] font-mono text-slate-400 px-1 py-0.2 rounded bg-slate-800">
                        Tıkla & Düzenle
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-200 leading-snug bg-slate-800/90 p-1.5 rounded-lg border border-slate-700/70 line-clamp-2">
                      {monthNotes[hoveredPoint.monthIndex].text}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Interactive Strategic Insight Popover on Data Point Click */}
            {isInsightPopoverOpen && activeInsightMonth !== null && insightPopoverPos && (
              <ForecastMonthInsightPopover
                isOpen={isInsightPopoverOpen}
                onClose={handleCloseInsightPopover}
                monthData={forecastData[activeInsightMonth] || forecastData[0]}
                monthIndex={activeInsightMonth}
                currentNote={monthNotes[activeInsightMonth]}
                onSaveNote={handleSaveNote}
                onDeleteNote={handleDeleteNote}
                position={insightPopoverPos}
                containerWidth={containerWidth}
                selectedMetric={selectedMetric}
                userName={userName}
                competitors={competitors}
                entityContext={insightEntityContext}
              />
            )}
          </div>

          {/* 3. 6-Month Projected Growth Rate Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* User Card */}
            <div 
              id="summary-card-user"
              data-testid="summary-card-user"
              onClick={() => toggleEntityVisibility("user")}
              className={`p-4 rounded-2xl border shadow-2xs space-y-1.5 transition-all cursor-pointer ${
                visibleEntities.user 
                  ? "bg-gradient-to-br from-emerald-50 to-teal-50/60 border-emerald-200 ring-1 ring-emerald-500/20" 
                  : "bg-slate-100/70 border-slate-200 opacity-55 hover:opacity-85"
              }`}
              title={visibleEntities.user ? "Grafikte gizlemek için tıklayın" : "Grafikte göstermek için tıklayın"}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-900 flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${visibleEntities.user ? "bg-emerald-600" : "bg-slate-400"}`} />
                  <span className={visibleEntities.user ? "" : "line-through text-slate-500"}>{userName} (Siz)</span>
                </span>
                <span className={`px-1.5 py-0.5 rounded font-black text-[10px] ${
                  visibleEntities.user ? "bg-emerald-600 text-white" : "bg-slate-300 text-slate-700"
                }`}>
                  {visibleEntities.user ? "Hedef" : "Gizlendi"}
                </span>
              </div>
              <div className="text-2xl font-black text-emerald-950 font-mono tracking-tight flex items-baseline gap-1">
                <span>+{userGrowthPct}%</span>
                <span className="text-xs text-emerald-700 font-semibold font-sans">büyüme</span>
              </div>
              <div className="text-[11px] text-emerald-800 flex items-center justify-between pt-1 border-t border-emerald-200/60">
                <span>0. Ay: <strong>{selectedMetric === "traffic" ? userStart.toLocaleString("tr-TR") : userStart}</strong></span>
                <span>&rarr;</span>
                <span>6. Ay: <strong>{selectedMetric === "traffic" ? userEnd.toLocaleString("tr-TR") : userEnd}</strong></span>
              </div>
            </div>

            {/* Comp 1 Card */}
            <div 
              id="summary-card-comp1"
              data-testid="summary-card-comp1"
              onClick={() => toggleEntityVisibility("comp1")}
              className={`p-4 rounded-2xl border shadow-2xs space-y-1.5 transition-all cursor-pointer ${
                visibleEntities.comp1 
                  ? "bg-slate-50 border-slate-200 ring-1 ring-slate-900/5 hover:border-rose-300" 
                  : "bg-slate-100/70 border-slate-200 opacity-55 hover:opacity-85"
              }`}
              title={visibleEntities.comp1 ? "Grafikte gizlemek için tıklayın" : "Grafikte göstermek için tıklayın"}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${visibleEntities.comp1 ? "bg-rose-600" : "bg-slate-400"}`} />
                  <span className={visibleEntities.comp1 ? "" : "line-through text-slate-500"}>1. {comp1.name.split(" ")[0]}</span>
                </span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  visibleEntities.comp1 ? "text-slate-500 bg-slate-100" : "text-slate-400 bg-slate-200"
                }`}>
                  {visibleEntities.comp1 ? "Pazar Lideri" : "Gizlendi"}
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono tracking-tight flex items-baseline gap-1">
                <span>+{comp1GrowthPct}%</span>
                <span className="text-xs text-slate-500 font-semibold font-sans">büyüme</span>
              </div>
              <div className="text-[11px] text-slate-600 flex items-center justify-between pt-1 border-t border-slate-200/60">
                <span>0. Ay: <strong>{selectedMetric === "traffic" ? comp1Start.toLocaleString("tr-TR") : comp1Start}</strong></span>
                <span>&rarr;</span>
                <span>6. Ay: <strong>{selectedMetric === "traffic" ? comp1End.toLocaleString("tr-TR") : comp1End}</strong></span>
              </div>
            </div>

            {/* Comp 2 Card */}
            <div 
              id="summary-card-comp2"
              data-testid="summary-card-comp2"
              onClick={() => toggleEntityVisibility("comp2")}
              className={`p-4 rounded-2xl border shadow-2xs space-y-1.5 transition-all cursor-pointer ${
                visibleEntities.comp2 
                  ? "bg-slate-50 border-slate-200 ring-1 ring-slate-900/5 hover:border-amber-300" 
                  : "bg-slate-100/70 border-slate-200 opacity-55 hover:opacity-85"
              }`}
              title={visibleEntities.comp2 ? "Grafikte gizlemek için tıklayın" : "Grafikte göstermek için tıklayın"}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${visibleEntities.comp2 ? "bg-amber-600" : "bg-slate-400"}`} />
                  <span className={visibleEntities.comp2 ? "" : "line-through text-slate-500"}>2. {comp2.name.split(" ")[0]}</span>
                </span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  visibleEntities.comp2 ? "text-slate-500 bg-slate-100" : "text-slate-400 bg-slate-200"
                }`}>
                  {visibleEntities.comp2 ? "2. Rakip" : "Gizlendi"}
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono tracking-tight flex items-baseline gap-1">
                <span>+{comp2GrowthPct}%</span>
                <span className="text-xs text-slate-500 font-semibold font-sans">büyüme</span>
              </div>
              <div className="text-[11px] text-slate-600 flex items-center justify-between pt-1 border-t border-slate-200/60">
                <span>0. Ay: <strong>{selectedMetric === "traffic" ? comp2Start.toLocaleString("tr-TR") : comp2Start}</strong></span>
                <span>&rarr;</span>
                <span>6. Ay: <strong>{selectedMetric === "traffic" ? comp2End.toLocaleString("tr-TR") : comp2End}</strong></span>
              </div>
            </div>

            {/* Comp 3 Card */}
            <div 
              id="summary-card-comp3"
              data-testid="summary-card-comp3"
              onClick={() => toggleEntityVisibility("comp3")}
              className={`p-4 rounded-2xl border shadow-2xs space-y-1.5 transition-all cursor-pointer ${
                visibleEntities.comp3 
                  ? "bg-slate-50 border-slate-200 ring-1 ring-slate-900/5 hover:border-violet-300" 
                  : "bg-slate-100/70 border-slate-200 opacity-55 hover:opacity-85"
              }`}
              title={visibleEntities.comp3 ? "Grafikte gizlemek için tıklayın" : "Grafikte göstermek için tıklayın"}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${visibleEntities.comp3 ? "bg-violet-600" : "bg-slate-400"}`} />
                  <span className={visibleEntities.comp3 ? "" : "line-through text-slate-500"}>3. {comp3.name.split(" ")[0]}</span>
                </span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  visibleEntities.comp3 ? "text-slate-500 bg-slate-100" : "text-slate-400 bg-slate-200"
                }`}>
                  {visibleEntities.comp3 ? "3. Rakip" : "Gizlendi"}
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono tracking-tight flex items-baseline gap-1">
                <span>+{comp3GrowthPct}%</span>
                <span className="text-xs text-slate-500 font-semibold font-sans">büyüme</span>
              </div>
              <div className="text-[11px] text-slate-600 flex items-center justify-between pt-1 border-t border-slate-200/60">
                <span>0. Ay: <strong>{selectedMetric === "traffic" ? comp3Start.toLocaleString("tr-TR") : comp3Start}</strong></span>
                <span>&rarr;</span>
                <span>6. Ay: <strong>{selectedMetric === "traffic" ? comp3End.toLocaleString("tr-TR") : comp3End}</strong></span>
              </div>
            </div>
          </div>

          {/* 4. Strategic Growth Insight Banner */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Target className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <div className="font-black text-indigo-950">
                  🎯 Projeksiyon Analiz Sonucu:
                </div>
                <div className="text-indigo-900 text-[11px] mt-0.5">
                  {crossoverMonth ? (
                    <span>
                      Tablodaki anahtar kelimelere odaklanıldığında, siteniz <strong>{crossoverMonth.month}. Ayda</strong> {crossoverMonth.comp} rakibinin organik performansını geride bırakma potansiyeline sahiptir.
                    </span>
                  ) : (
                    <span>
                      6 aylık süre boyunca siteniz <strong>+{userGrowthPct}%</strong> büyüme ivmesiyle rakipleriyle arasındaki sıralama farkını (gap) kapatmaktadır.
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
              <span className="px-2.5 py-1 rounded-xl bg-indigo-100 text-indigo-800 font-black text-[11px] border border-indigo-200">
                Tahmini Net Artış: +{(userEnd - userStart).toLocaleString("tr-TR")}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Export Success Toast Notification */}
      {exportSuccessMessage && (
        <div
          id="growth-chart-export-toast"
          data-testid="growth-chart-export-toast"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 text-white shadow-2xl border border-emerald-500/50 animate-in fade-in slide-in-from-bottom-4 duration-200"
          role="status"
          aria-live="polite"
        >
          <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <div className="text-xs font-bold">{exportSuccessMessage}</div>
        </div>
      )}
    </div>
  );
};
