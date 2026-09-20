import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Zap, 
  Sparkles, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Info, 
  Download, 
  Layers, 
  Activity, 
  ChevronDown, 
  ChevronUp, 
  BarChart3, 
  SlidersHorizontal,
  FileSpreadsheet,
  Check,
  RotateCcw,
  Bookmark
} from "lucide-react";
import { CompetitorKeywordRanking, CompetitorContentMetric } from "../../types";
import { CompetitorColorPalette, DEFAULT_COMPETITOR_PALETTE } from "../../utils/competitorColorTheme";
import { 
  calculateCompetitorGrowthProfiles, 
  CompetitorGrowthProfile, 
  CompetitorGrowthPoint,
  FORECAST_MONTHS 
} from "../../utils/competitorGrowthEngine";
import {
  StrategicForecastNotesBox,
  StrategicForecastNote,
  DEFAULT_STRATEGIC_FORECAST_NOTES
} from "./StrategicForecastNotesBox";

export type TrendMetricType = "traffic" | "visibility" | "avgRank";
export type TrendScenarioType = "realistic" | "aggressive" | "conservative";

interface CompetitorTrendForecastModuleProps {
  rankings: CompetitorKeywordRanking[];
  competitors: CompetitorContentMetric[];
  userName?: string;
  userDomain?: string;
  colorPalette?: CompetitorColorPalette;
  onToggleColumnVisibility?: () => void;
  isColumnVisible?: boolean;
  onClose?: () => void;
  className?: string;
}

export const CompetitorTrendForecastModule: React.FC<CompetitorTrendForecastModuleProps> = ({
  rankings = [],
  competitors = [],
  userName = "Siteniz (Siz)",
  userDomain = "sitemiz.com.tr",
  colorPalette = DEFAULT_COMPETITOR_PALETTE,
  onToggleColumnVisibility,
  isColumnVisible = true,
  onClose,
  className = ""
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // States
  const [selectedMetric, setSelectedMetric] = useState<TrendMetricType>("traffic");
  const [selectedScenario, setSelectedScenario] = useState<TrendScenarioType>("realistic");
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  
  // Confidence Interval (Güven Aralığı) States
  const [showConfidenceBand, setShowConfidenceBand] = useState<boolean>(true);
  const [confidenceLevel, setConfidenceLevel] = useState<"90" | "95" | "99">("95");
  const [confidenceScope, setConfidenceScope] = useState<"all" | "user">("all");
  const [showVolatilityInfo, setShowVolatilityInfo] = useState<boolean>(false);

  const [showTableBreakdown, setShowTableBreakdown] = useState<boolean>(false);
  const [isolatedCompetitorId, setIsolatedCompetitorId] = useState<string | null>(null);
  const [visibleEntities, setVisibleEntities] = useState<Record<string, boolean>>({
    user: true,
    comp1: true,
    comp2: true,
    comp3: true
  });
  const [hoveredMonthIndex, setHoveredMonthIndex] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(820);

  // Strategic Forecast Notes State & Persistence
  const storageKey = `seo_strategic_forecast_notes_${userDomain || "default"}`;
  const [strategicNotes, setStrategicNotes] = useState<Record<number, StrategicForecastNote>>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return DEFAULT_STRATEGIC_FORECAST_NOTES;
  });

  const [selectedNoteMonthIndex, setSelectedNoteMonthIndex] = useState<number>(1);
  const [isStrategicNotesBoxOpen, setIsStrategicNotesBoxOpen] = useState<boolean>(true);

  const handleSaveStrategicNote = (newNote: StrategicForecastNote) => {
    setStrategicNotes((prev) => {
      const updated = {
        ...prev,
        [newNote.monthIndex]: newNote
      };
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to save strategic forecast notes:", err);
      }
      return updated;
    });
  };

  const handleDeleteStrategicNote = (monthIndex: number) => {
    setStrategicNotes((prev) => {
      const updated = { ...prev };
      delete updated[monthIndex];
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to delete strategic forecast note:", err);
      }
      return updated;
    });
  };

  const handleResetStrategicNotes = () => {
    setStrategicNotes({});
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  };

  const handlePopulateDefaultNotes = () => {
    setStrategicNotes(DEFAULT_STRATEGIC_FORECAST_NOTES);
    try {
      localStorage.setItem(storageKey, JSON.stringify(DEFAULT_STRATEGIC_FORECAST_NOTES));
    } catch {
      // ignore
    }
  };

  // Scenario Multipliers
  const scenarioMultiplier = useMemo(() => {
    switch (selectedScenario) {
      case "aggressive": return 1.30;
      case "conservative": return 0.75;
      default: return 1.0;
    }
  }, [selectedScenario]);

  // Confidence Multiplier (Z-score scaling: 90% = 0.82, 95% = 1.0, 99% = 1.35)
  const confidenceMultiplier = useMemo(() => {
    switch (confidenceLevel) {
      case "90": return 0.82;
      case "99": return 1.35;
      default: return 1.0;
    }
  }, [confidenceLevel]);

  // Profiles calculated from engine
  const profiles = useMemo(() => {
    return calculateCompetitorGrowthProfiles(
      rankings,
      competitors,
      userName,
      userDomain,
      colorPalette,
      scenarioMultiplier
    );
  }, [rankings, competitors, userName, userDomain, colorPalette, scenarioMultiplier]);

  // Average Volatility across active profiles
  const avgVolatilityScore = useMemo(() => {
    const sum = profiles.reduce((acc, p) => acc + p.volatilityScore, 0);
    return +(sum / Math.max(1, profiles.length)).toFixed(1);
  }, [profiles]);

  // Metric Bounds Extractor with Confidence Multiplier
  const getMetricBounds = (pt: CompetitorGrowthPoint, metric: TrendMetricType, mult: number) => {
    if (metric === "traffic") {
      const delta = (pt.upperTraffic - pt.traffic) * mult;
      return {
        lower: Math.max(0, Math.round(pt.traffic - delta)),
        upper: Math.round(pt.traffic + delta),
        uncertaintyPct: +(pt.uncertaintyPct * mult).toFixed(1)
      };
    }
    if (metric === "visibility") {
      const delta = (pt.upperVisibility - pt.visibility) * mult;
      return {
        lower: Math.max(5, Math.round(pt.visibility - delta)),
        upper: Math.min(100, Math.round(pt.visibility + delta)),
        uncertaintyPct: +((pt.upperVisibility - pt.lowerVisibility) / 2 * mult).toFixed(1)
      };
    }
    // avgRank: lowerAvgRank is best case (smaller rank number), upperAvgRank is worst case (larger rank number)
    const delta = (pt.upperAvgRank - pt.avgRank) * mult;
    return {
      lower: Math.max(1, +(pt.avgRank - delta).toFixed(1)),
      upper: +(pt.avgRank + delta).toFixed(1),
      uncertaintyPct: +(delta).toFixed(1)
    };
  };

  // Responsive Width Observer
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 200) {
          setContainerWidth(Math.round(entry.contentRect.width));
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Render D3 Interactive Chart
  useEffect(() => {
    if (!svgRef.current || !isExpanded) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = Math.max(500, containerWidth);
    const height = 300;
    const margin = { top: 25, right: 35, bottom: 40, left: 55 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Defs for gradients & drop shadows
    const defs = svg.append("defs");

    // Glow filter
    const filter = defs.append("filter")
      .attr("id", "d3-forecast-glow")
      .attr("x", "-20%")
      .attr("y", "-20%")
      .attr("width", "140%")
      .attr("height", "140%");
    filter.append("feGaussianBlur")
      .attr("stdDeviation", "2.5")
      .attr("result", "blur");
    filter.append("feComposite")
      .attr("in", "SourceGraphic")
      .attr("in2", "blur")
      .attr("operator", "over");

    // Entity gradients
    profiles.forEach((p) => {
      const grad = defs.append("linearGradient")
        .attr("id", `area-grad-${p.id}`)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%");
      grad.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", p.color)
        .attr("stop-opacity", p.id === "user" ? 0.30 : 0.12);
      grad.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", p.color)
        .attr("stop-opacity", 0.0);
    });

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // X Scale (Month 0 to 6)
    const xScale = d3.scaleLinear()
      .domain([0, 6])
      .range([0, innerWidth]);

    // Value Extractor based on selectedMetric
    const getMetricValue = (pt: CompetitorGrowthPoint) => {
      if (selectedMetric === "traffic") return pt.traffic;
      if (selectedMetric === "visibility") return pt.visibility;
      return pt.avgRank; // lower is better
    };

    // Active profiles filter
    const activeProfiles = profiles.filter((p) => {
      if (isolatedCompetitorId) return p.id === isolatedCompetitorId;
      return visibleEntities[p.id];
    });

    // Y Domain calculation taking into account Confidence Bands
    let allValues: number[] = [];
    activeProfiles.forEach((p) => {
      const shouldIncludeBand = showConfidenceBand && (confidenceScope === "all" || p.id === "user" || isolatedCompetitorId === p.id);
      p.points.forEach((pt) => {
        allValues.push(getMetricValue(pt));
        if (shouldIncludeBand) {
          const b = getMetricBounds(pt, selectedMetric, confidenceMultiplier);
          allValues.push(b.lower, b.upper);
        }
      });
    });

    if (allValues.length === 0) allValues = [0, 100];

    const minVal = d3.min(allValues) ?? 0;
    const maxVal = d3.max(allValues) ?? 100;

    const yScale = d3.scaleLinear()
      .domain(
        selectedMetric === "avgRank"
          ? [Math.max(20, maxVal + 1.2), Math.max(1, minVal - 0.6)] // Inverted: #1 at top
          : [Math.max(0, minVal * 0.85), maxVal * 1.12]
      )
      .range([innerHeight, 0])
      .nice();

    // Subtle Gridlines
    const yGrid = d3.axisLeft(yScale)
      .ticks(5)
      .tickSize(-innerWidth)
      .tickFormat(() => "");

    g.append("g")
      .attr("class", "grid y-grid")
      .call(yGrid)
      .selectAll("line")
      .attr("stroke", "#f1f5f9")
      .attr("stroke-dasharray", "3,3");

    // X-Axis
    const xAxis = d3.axisBottom(xScale)
      .ticks(6)
      .tickFormat((d) => {
        const month = FORECAST_MONTHS[d as number];
        return month ? month.short : `M${d}`;
      });

    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .attr("class", "x-axis text-slate-500 font-mono text-[10px] font-bold")
      .call(xAxis)
      .select(".domain")
      .attr("stroke", "#cbd5e1");

    // Y-Axis
    const yAxis = d3.axisLeft(yScale)
      .ticks(5)
      .tickFormat((d) => {
        const num = d as number;
        if (selectedMetric === "avgRank") return `#${Math.round(num)}`;
        if (selectedMetric === "visibility") return `${Math.round(num)}%`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
        return `${num}`;
      });

    g.append("g")
      .attr("class", "y-axis text-slate-500 font-mono text-[10px] font-bold")
      .call(yAxis)
      .select(".domain")
      .remove();

    // D3.JS CONFIDENCE INTERVAL (GÜVEN ARALIĞI) SHADED LAYER
    if (showConfidenceBand) {
      const bandProfiles = activeProfiles.filter((p) => {
        if (isolatedCompetitorId) return p.id === isolatedCompetitorId;
        if (confidenceScope === "all") return true;
        return p.id === "user";
      });

      bandProfiles.forEach((profile) => {
        // Area generator for confidence band (Cone of uncertainty expanding over time)
        const confArea = d3.area<CompetitorGrowthPoint>()
          .x((d) => xScale(d.monthIndex))
          .y0((d) => {
            const b = getMetricBounds(d, selectedMetric, confidenceMultiplier);
            return yScale(b.lower);
          })
          .y1((d) => {
            const b = getMetricBounds(d, selectedMetric, confidenceMultiplier);
            return yScale(b.upper);
          })
          .curve(d3.curveMonotoneX);

        // 1. Shaded area
        g.append("path")
          .datum(profile.points)
          .attr("id", `d3-confidence-area-${profile.id}`)
          .attr("data-testid", `d3-confidence-area-${profile.id}`)
          .attr("class", `confidence-interval-area conf-area-${profile.id}`)
          .attr("fill", profile.color)
          .attr("fill-opacity", profile.isUser ? 0.18 : 0.10)
          .attr("d", confArea)
          .attr("pointer-events", "none");

        // 2. Upper boundary dashed line
        const upperLine = d3.line<CompetitorGrowthPoint>()
          .x((d) => xScale(d.monthIndex))
          .y((d) => yScale(getMetricBounds(d, selectedMetric, confidenceMultiplier).upper))
          .curve(d3.curveMonotoneX);

        g.append("path")
          .datum(profile.points)
          .attr("class", `confidence-boundary-upper conf-line-${profile.id}`)
          .attr("fill", "none")
          .attr("stroke", profile.color)
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", "3,3")
          .attr("stroke-opacity", profile.isUser ? 0.55 : 0.35)
          .attr("d", upperLine)
          .attr("pointer-events", "none");

        // 3. Lower boundary dashed line
        const lowerLine = d3.line<CompetitorGrowthPoint>()
          .x((d) => xScale(d.monthIndex))
          .y((d) => yScale(getMetricBounds(d, selectedMetric, confidenceMultiplier).lower))
          .curve(d3.curveMonotoneX);

        g.append("path")
          .datum(profile.points)
          .attr("class", `confidence-boundary-lower conf-line-${profile.id}`)
          .attr("fill", "none")
          .attr("stroke", profile.color)
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", "3,3")
          .attr("stroke-opacity", profile.isUser ? 0.55 : 0.35)
          .attr("d", lowerLine)
          .attr("pointer-events", "none");
      });
    }

    // Baseline Area Generator (under main line)
    const areaGenerator = d3.area<CompetitorGrowthPoint>()
      .x((d) => xScale(d.monthIndex))
      .y0(innerHeight)
      .y1((d) => yScale(getMetricValue(d)))
      .curve(d3.curveMonotoneX);

    // Line Generator
    const lineGenerator = d3.line<CompetitorGrowthPoint>()
      .x((d) => xScale(d.monthIndex))
      .y((d) => yScale(getMetricValue(d)))
      .curve(d3.curveMonotoneX);

    // Render Areas & Lines for each active profile
    activeProfiles.forEach((profile) => {
      // Shaded area
      g.append("path")
        .datum(profile.points)
        .attr("fill", `url(#area-grad-${profile.id})`)
        .attr("d", areaGenerator)
        .attr("pointer-events", "none");

      // Main Trend Line
      const path = g.append("path")
        .datum(profile.points)
        .attr("fill", "none")
        .attr("stroke", profile.color)
        .attr("stroke-width", profile.isUser ? 3.5 : 2.2)
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round")
        .attr("stroke-dasharray", profile.id === "comp3" ? "4,3" : profile.id === "comp2" ? "6,2" : "none")
        .attr("d", lineGenerator);

      if (profile.isUser) {
        path.attr("filter", "url(#d3-forecast-glow)");
      }

      // Add circle points on each month
      profile.points.forEach((pt) => {
        g.append("circle")
          .attr("cx", xScale(pt.monthIndex))
          .attr("cy", yScale(getMetricValue(pt)))
          .attr("r", profile.isUser ? 4.5 : 3.2)
          .attr("fill", profile.color)
          .attr("stroke", "#ffffff")
          .attr("stroke-width", 2)
          .attr("class", `dot-${profile.id} transition-transform duration-200`)
          .style("filter", "drop-shadow(0px 1px 2px rgba(0,0,0,0.15))");
      });
    });

    // Strategic Note Indicator Pins on Chart
    FORECAST_MONTHS.forEach((m) => {
      const note = strategicNotes[m.index];
      if (note) {
        const pinX = xScale(m.index);
        
        // Vertical dashed guideline for strategic note
        g.append("line")
          .attr("class", `strategic-note-line-${m.index}`)
          .attr("x1", pinX)
          .attr("x2", pinX)
          .attr("y1", -8)
          .attr("y2", innerHeight)
          .attr("stroke", "#6366f1")
          .attr("stroke-width", 1.2)
          .attr("stroke-dasharray", "3,3")
          .attr("stroke-opacity", 0.4)
          .attr("pointer-events", "none");

        // Pin Bookmark Badge Group
        const pinG = g.append("g")
          .attr("class", `strategic-pin-group cursor-pointer pin-month-${m.index}`)
          .attr("transform", `translate(${pinX}, -10)`)
          .style("cursor", "pointer")
          .on("click", (e) => {
            e.stopPropagation();
            setSelectedNoteMonthIndex(m.index);
            setIsStrategicNotesBoxOpen(true);
          });

        pinG.append("circle")
          .attr("r", 8.5)
          .attr("fill", m.index === selectedNoteMonthIndex ? "#4f46e5" : "#6366f1")
          .attr("stroke", "#ffffff")
          .attr("stroke-width", 1.5)
          .style("filter", "drop-shadow(0 1px 2px rgba(0,0,0,0.25))");

        pinG.append("text")
          .attr("text-anchor", "middle")
          .attr("dy", "3px")
          .attr("fill", "#fcd34d")
          .attr("font-size", "9px")
          .attr("font-weight", "bold")
          .text("★");

        pinG.append("title")
          .text(`📌 ${m.label} Stratejik Tahmin Notu: "${note.note}" (Tıklayarak inceleyin/düzenleyin)`);
      }
    });

    // Vertical Hover Indicator Line
    const crosshair = g.append("line")
      .attr("class", "crosshair-line")
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", "#475569")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "4,4")
      .style("opacity", 0)
      .attr("pointer-events", "none");

    // Vertical Error Range / Bracket on Hovered Month
    const hoverErrorBracket = g.append("line")
      .attr("class", "hover-error-bracket")
      .attr("stroke", "#6366f1")
      .attr("stroke-width", 3)
      .attr("stroke-linecap", "round")
      .style("opacity", 0)
      .attr("pointer-events", "none");

    // Invisible Overlay for Scrub Interaction
    const overlay = g.append("rect")
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .attr("fill", "transparent")
      .attr("cursor", "crosshair")
      .on("click", (event) => {
        const [mx] = d3.pointer(event);
        const approxMonth = Math.round(xScale.invert(mx));
        const clampedMonth = Math.max(0, Math.min(6, approxMonth));
        setSelectedNoteMonthIndex(clampedMonth);
        setIsStrategicNotesBoxOpen(true);
      })
      .on("mousemove", (event) => {
        const [mx] = d3.pointer(event);
        const approxMonth = Math.round(xScale.invert(mx));
        const clampedMonth = Math.max(0, Math.min(6, approxMonth));

        setHoveredMonthIndex(clampedMonth);
        crosshair
          .attr("x1", xScale(clampedMonth))
          .attr("x2", xScale(clampedMonth))
          .style("opacity", 0.9);

        // Highlight confidence error bracket on user profile
        if (showConfidenceBand) {
          const targetProfile = profiles.find((p) => p.id === (isolatedCompetitorId || "user")) || profiles[0];
          const pt = targetProfile.points[clampedMonth];
          if (pt) {
            const b = getMetricBounds(pt, selectedMetric, confidenceMultiplier);
            hoverErrorBracket
              .attr("x1", xScale(clampedMonth))
              .attr("x2", xScale(clampedMonth))
              .attr("y1", yScale(b.lower))
              .attr("y2", yScale(b.upper))
              .attr("stroke", targetProfile.color)
              .style("opacity", 0.85);
          }
        }

        // Highlight dots
        g.selectAll("circle").attr("r", (d, i, nodes) => {
          const circle = d3.select(nodes[i]);
          const isCurrentMonth = Math.abs(parseFloat(circle.attr("cx")) - xScale(clampedMonth)) < 2;
          return isCurrentMonth ? 6.5 : 3.5;
        });
      })
      .on("mouseleave", () => {
        setHoveredMonthIndex(null);
        crosshair.style("opacity", 0);
        hoverErrorBracket.style("opacity", 0);
        g.selectAll("circle").attr("r", (d, i, nodes) => {
          const circle = d3.select(nodes[i]);
          return circle.classed("dot-user") ? 4.5 : 3.2;
        });
      });

  }, [
    isExpanded, 
    containerWidth, 
    profiles, 
    selectedMetric, 
    isolatedCompetitorId, 
    visibleEntities, 
    showConfidenceBand,
    confidenceLevel,
    confidenceScope,
    confidenceMultiplier,
    strategicNotes,
    selectedNoteMonthIndex
  ]);

  const toggleEntity = (id: string) => {
    setVisibleEntities((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleExportSvg = () => {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgRef.current);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rakip-trend-tahmini-6-ay-${selectedMetric}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentHoverData = hoveredMonthIndex !== null ? FORECAST_MONTHS[hoveredMonthIndex] : null;

  return (
    <div
      id="seo-competitor-trend-forecast-module"
      data-testid="seo-competitor-trend-forecast-module"
      ref={containerRef}
      className={`rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* 1. Header Bar */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0 shadow-inner">
            <TrendingUp className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                <span>6 Aylık Rakip Trend Tahmin Çizgisi</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider font-mono">
                  d3.js Engine
                </span>
              </h3>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 max-w-2xl leading-relaxed">
              Mevcut SERP sıralamaları, mobil PageSpeed skoru (PSI), backlink otoritesi ve içerik üretim hızı kullanılarak hesaplanan 6 aylık dinamik büyüme projeksiyonu.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {/* Table Column Toggle Button */}
          {onToggleColumnVisibility && (
            <button
              type="button"
              id="btn-toggle-table-trend-col"
              data-testid="btn-toggle-table-trend-col"
              onClick={onToggleColumnVisibility}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                isColumnVisible 
                  ? "bg-amber-400 hover:bg-amber-300 text-slate-950 border-amber-300 shadow-amber-400/20 shadow-xs" 
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
              }`}
              title="Tablo gridi içerisindeki her anahtar kelime için '6 Aylık Trend Tahmini' kolonunu göster veya gizle"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{isColumnVisible ? "Tablo Kolonu Açık" : "Tablo Kolonunu Ekle"}</span>
            </button>
          )}

          {/* Export SVG */}
          <button
            type="button"
            id="btn-export-forecast-svg"
            onClick={handleExportSvg}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            title="D3.js Trend Grafiğini SVG Olarak İndir"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Expand/Collapse */}
          <button
            type="button"
            id="btn-collapse-trend-forecast-module"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            title={isExpanded ? "Paneli Daralt" : "Paneli Genişlet"}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 border border-slate-700 transition-colors cursor-pointer text-xs"
              title="Modülü Kapat"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 sm:p-6 space-y-6">
          {/* 2. Control Toolbar (Metric, Scenario, Filters) */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            {/* Metric Switcher */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200/80 shrink-0">
              <button
                type="button"
                id="btn-forecast-metric-traffic"
                data-testid="forecast-metric-traffic"
                onClick={() => setSelectedMetric("traffic")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedMetric === "traffic"
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/60 font-black"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                <span>Organik Hacim (SERP Tıklama)</span>
              </button>

              <button
                type="button"
                id="btn-forecast-metric-visibility"
                data-testid="forecast-metric-visibility"
                onClick={() => setSelectedMetric("visibility")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedMetric === "visibility"
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/60 font-black"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                <span>Görünürlük Skoru (0-100)</span>
              </button>

              <button
                type="button"
                id="btn-forecast-metric-rank"
                data-testid="forecast-metric-rank"
                onClick={() => setSelectedMetric("avgRank")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedMetric === "avgRank"
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/60 font-black"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-amber-600" />
                <span>Ortalama SERP Pozisyonu</span>
              </button>
            </div>

            {/* Scenario & Confidence Band Controls */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Scenario selector */}
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-[11px] text-slate-500">Senaryo:</span>
                <select
                  id="select-forecast-scenario"
                  data-testid="select-forecast-scenario"
                  value={selectedScenario}
                  onChange={(e) => setSelectedScenario(e.target.value as TrendScenarioType)}
                  className="bg-transparent font-black text-slate-900 text-xs focus:outline-hidden cursor-pointer"
                >
                  <option value="realistic">Gerçekçi (Mevcut Trendler 1.0x)</option>
                  <option value="aggressive">Agresif Büyüme (İçerik +%30)</option>
                  <option value="conservative">Muhafazakar / Durgunluk (-%25)</option>
                </select>
              </div>

              {/* Confidence Band (Güven Aralığı) Master Toggle */}
              <button
                type="button"
                id="btn-toggle-confidence-band"
                data-testid="btn-toggle-confidence-band"
                onClick={() => setShowConfidenceBand((prev) => !prev)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                  showConfidenceBand
                    ? "bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-200"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
                title="D3.js Veri Oynaklığına Dayalı Güven Aralığı ve Belirsizlik Gölgeli Alan Katmanını Aç/Kapat"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Güven Aralığı (%{confidenceLevel} GA)</span>
                <span className={`w-1.5 h-1.5 rounded-full ${showConfidenceBand ? "bg-amber-300 animate-ping" : "bg-slate-300"}`} />
              </button>

              {/* Extended Confidence Controls (Level & Scope) when active */}
              {showConfidenceBand && (
                <div className="flex items-center gap-1.5 bg-indigo-50/80 p-1 rounded-xl border border-indigo-200 text-xs">
                  {/* Confidence Levels */}
                  <div className="flex items-center gap-0.5">
                    {(["90", "95", "99"] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        id={`btn-confidence-level-${lvl}`}
                        onClick={() => setConfidenceLevel(lvl)}
                        className={`px-1.5 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                          confidenceLevel === lvl
                            ? "bg-indigo-600 text-white shadow-xs"
                            : "text-indigo-800 hover:bg-indigo-100"
                        }`}
                        title={`%${lvl} İstatistiki Güven Aralığı`}
                      >
                        %{lvl}
                      </button>
                    ))}
                  </div>

                  <span className="w-px h-3.5 bg-indigo-200" />

                  {/* Scope: All vs User only */}
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      id="btn-confidence-scope-all"
                      onClick={() => setConfidenceScope("all")}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        confidenceScope === "all"
                          ? "bg-white text-indigo-950 font-black shadow-2xs border border-indigo-200"
                          : "text-indigo-700 hover:bg-indigo-100/70"
                      }`}
                      title="Tüm rakipler için oynaklık aralığını göster"
                    >
                      Tüm Rakipler
                    </button>
                    <button
                      type="button"
                      id="btn-confidence-scope-user"
                      onClick={() => setConfidenceScope("user")}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        confidenceScope === "user"
                          ? "bg-white text-indigo-950 font-black shadow-2xs border border-indigo-200"
                          : "text-indigo-700 hover:bg-indigo-100/70"
                      }`}
                      title="Yalnızca siteniz için oynaklık aralığını göster"
                    >
                      Yalnızca Siz
                    </button>
                  </div>
                </div>
              )}

              {/* Volatility Indicator Badge & Info Button */}
              <div className="flex items-center gap-1.5 bg-amber-50/70 px-2.5 py-1.5 rounded-xl border border-amber-200 text-xs">
                <Activity className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-[11px] font-mono text-amber-900 font-bold">
                  SERP Oynaklığı: ±%{avgVolatilityScore}
                </span>
                <button
                  type="button"
                  id="btn-toggle-volatility-info"
                  onClick={() => setShowVolatilityInfo((prev) => !prev)}
                  className="p-0.5 rounded hover:bg-amber-100 text-amber-700 transition-colors cursor-pointer"
                  title="Güven Aralığı ve Oynaklık Hesaplama Modeli Hakkında Bilgi"
                >
                  <Info className="w-3 h-3" />
                </button>
              </div>

              {/* Strategic Notes Master Toggle Button */}
              <button
                type="button"
                id="btn-toolbar-strategic-notes"
                data-testid="btn-toolbar-strategic-notes"
                onClick={() => setIsStrategicNotesBoxOpen((prev) => !prev)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                  isStrategicNotesBoxOpen
                    ? "bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-200"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
                title="Aylık Stratejik Tahmin Notları & Eylem Planı Açıklama Kutusunu Aç/Kapat"
              >
                <Bookmark className={`w-3.5 h-3.5 ${isStrategicNotesBoxOpen ? "text-amber-300 fill-amber-300/30" : "text-indigo-600"}`} />
                <span>Stratejik Tahmin Notları</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                  isStrategicNotesBoxOpen ? "bg-amber-400 text-slate-950" : "bg-indigo-100 text-indigo-800"
                }`}>
                  {Object.keys(strategicNotes).length}/7
                </span>
              </button>

              {/* Table breakdown toggle */}
              <button
                type="button"
                id="btn-toggle-table-breakdown"
                onClick={() => setShowTableBreakdown((prev) => !prev)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                  showTableBreakdown
                    ? "bg-amber-50 text-amber-800 border-amber-300"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Aylık Detay Tablosu</span>
              </button>
            </div>
          </div>

          {/* Volatility & Confidence Model Educational Banner */}
          {showVolatilityInfo && (
            <div className="bg-gradient-to-r from-indigo-50 via-white to-amber-50 rounded-2xl border border-indigo-100 p-4 text-xs text-slate-700 animate-in fade-in duration-200">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h5 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      D3.js Güven Aralığı ve Veri Oynaklığı Modeli
                      <span className="px-2 py-0.2 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-mono font-bold">
                        Cone of Uncertainty
                      </span>
                    </h5>
                    <p className="text-slate-600 leading-relaxed">
                      Bu katman, her rakibin SERP pozisyon standart sapması (sıralama dalgalanması), PageSpeed/Core Web Vitals puanı ve içerik üretim kararlılığını analiz ederek <strong>Oynaklık Skoru (Volatility Index)</strong> türetir.
                      Zaman ilerledikçe geleceğe yönelik belirsizlik artar (<code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">σ · √(ay)</code>). 
                      D3.js ile çizilen gölgeli alan, tahmin edilen büyümenin en olası alt ve üst sınırlarını görselleştirir.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowVolatilityInfo(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold px-2 py-1 rounded"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* 2.5 INTERACTIVE STRATEGIC FORECAST NOTES EXPLANATORY BOX */}
          <StrategicForecastNotesBox
            notes={strategicNotes}
            selectedMonthIndex={selectedNoteMonthIndex}
            onSelectMonth={(m) => {
              setSelectedNoteMonthIndex(m);
              setIsStrategicNotesBoxOpen(true);
            }}
            onSaveNote={handleSaveStrategicNote}
            onDeleteNote={handleDeleteStrategicNote}
            onResetNotes={handleResetStrategicNotes}
            onPopulateDefaults={handlePopulateDefaultNotes}
            userProfile={profiles.find((p) => p.isUser)}
            isOpen={isStrategicNotesBoxOpen}
            onToggleOpen={() => setIsStrategicNotesBoxOpen((prev) => !prev)}
            selectedMetric={selectedMetric}
          />

          {/* 3. Interactive D3.js Chart Stage */}
          <div className="relative bg-slate-50/60 rounded-2xl border border-slate-200/80 p-3 sm:p-4 overflow-hidden">
            {/* Live Hover Info Header */}
            <div className="flex flex-col gap-2 mb-2 px-1 text-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold text-slate-700">
                    {currentHoverData ? `${currentHoverData.full}` : "Grafik üzerinde gezinin (Ay bazlı canlı öngörü & tıklayarak not seçimi)"}
                  </span>
                </div>

                {hoveredMonthIndex !== null && (
                  <div className="flex items-center gap-3 font-mono font-bold text-[11px] text-slate-600 flex-wrap">
                    {profiles.map((p) => {
                      const pt = p.points[hoveredMonthIndex];
                      if (!pt) return null;
                      const val = selectedMetric === "traffic" ? `${pt.traffic.toLocaleString("tr-TR")} tık`
                                : selectedMetric === "visibility" ? `%${pt.visibility}`
                                : `#${pt.avgRank}`;
                      
                      const bounds = getMetricBounds(pt, selectedMetric, confidenceMultiplier);
                      const boundsStr = selectedMetric === "traffic" ? `[${bounds.lower.toLocaleString("tr-TR")} – ${bounds.upper.toLocaleString("tr-TR")}]`
                                      : selectedMetric === "visibility" ? `[%${bounds.lower} – %${bounds.upper}]`
                                      : `[#${bounds.lower} – #${bounds.upper}]`;

                      return (
                        <div key={p.id} className="flex items-center gap-1 bg-white/80 px-2 py-0.5 rounded-lg border border-slate-200/60 shadow-2xs">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                          <span className="font-bold text-slate-900">{p.name.split(" ")[0]}:</span>
                          <span className="text-slate-700">{val}</span>
                          {showConfidenceBand && (confidenceScope === "all" || p.id === "user" || isolatedCompetitorId === p.id) && (
                            <span className="text-[10px] text-indigo-700 font-mono" title={`%${confidenceLevel} Güven Aralığı Sınırları`}>
                              GA: {boundsStr}
                            </span>
                          )}
                          {pt.growthPct !== 0 && (
                            <span className={`text-[10px] ${pt.growthPct > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                              ({pt.growthPct > 0 ? `+${pt.growthPct}%` : `${pt.growthPct}%`})
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Strategic Note Preview for Hovered Month */}
              {hoveredMonthIndex !== null && strategicNotes[hoveredMonthIndex] && (
                <div className="w-full flex items-center gap-2 bg-indigo-50/90 text-indigo-950 px-3 py-1.5 rounded-xl border border-indigo-200/80 text-xs">
                  <Bookmark className="w-3.5 h-3.5 text-indigo-600 shrink-0 fill-indigo-600/20" />
                  <span className="font-black text-indigo-900 shrink-0">
                    {FORECAST_MONTHS[hoveredMonthIndex]?.label} Stratejik Not:
                  </span>
                  <span className="text-slate-700 italic truncate max-w-xl">
                    "{strategicNotes[hoveredMonthIndex].note}"
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedNoteMonthIndex(hoveredMonthIndex);
                      setIsStrategicNotesBoxOpen(true);
                    }}
                    className="ml-auto text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer shrink-0"
                  >
                    Düzenle ➔
                  </button>
                </div>
              )}
            </div>

            {/* D3 SVG Container */}
            <div className="w-full overflow-x-auto">
              <svg
                id="svg-competitor-trend-forecast-d3"
                data-testid="svg-competitor-trend-forecast-d3"
                ref={svgRef}
                className="w-full overflow-visible"
                style={{ height: 300, minWidth: 500 }}
              />
            </div>

            {/* Interactive Entity Legend Filters & Confidence Interval Indicator */}
            <div className="flex items-center justify-between gap-3 pt-3 mt-2 border-t border-slate-200/80 flex-wrap text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-500 font-bold text-[11px] mr-1">Rakipler:</span>
                {profiles.map((profile) => {
                  const isVisible = visibleEntities[profile.id];
                  const isIsolated = isolatedCompetitorId === profile.id;
                  return (
                    <div
                      key={profile.id}
                      className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs"
                    >
                      <button
                        type="button"
                        onClick={() => toggleEntity(profile.id)}
                        className="flex items-center gap-1.5 cursor-pointer"
                        title={isVisible ? "Gizle" : "Göster"}
                      >
                        <span
                          className="w-3 h-3 rounded-full shrink-0 border border-white shadow-xs"
                          style={{ backgroundColor: isVisible ? profile.color : "#cbd5e1" }}
                        />
                        <span className={`font-bold ${isVisible ? "text-slate-900" : "text-slate-400 line-through"}`}>
                          {profile.name}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsolatedCompetitorId(isIsolated ? null : profile.id)}
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded transition-colors cursor-pointer ${
                          isIsolated
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                        }`}
                        title={isIsolated ? "İzolasyonu kaldır" : "Yalnızca bu rakibi incele"}
                      >
                        {isIsolated ? "İzole Edildi" : "İzole"}
                      </button>
                    </div>
                  );
                })}

                {isolatedCompetitorId && (
                  <button
                    type="button"
                    onClick={() => setIsolatedCompetitorId(null)}
                    className="text-xs text-indigo-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Tümünü Göster</span>
                  </button>
                )}
              </div>

              {/* Confidence Legend Chip & Projection Timeline */}
              <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                {showConfidenceBand && (
                  <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded-lg border border-indigo-200 font-bold">
                    <span className="inline-block w-3 h-2 bg-indigo-400/40 rounded-xs border border-dashed border-indigo-500" />
                    <span>%{confidenceLevel} Güven Aralığı (Oynaklık Alanı)</span>
                  </div>
                )}
                <span>Projeksiyon: Eylül 2026 ➔ Mart 2027 (6 Ay)</span>
              </div>
            </div>
          </div>

          {/* 4. Competitor Growth Forecast Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {profiles.map((p) => {
              const startVal = p.points[0];
              const endVal = p.points[6];
              const isPositive = p.sixMonthGrowthRate >= 0;

              return (
                <div
                  key={p.id}
                  id={`card-forecast-${p.id}`}
                  data-testid={`card-forecast-${p.id}`}
                  className={`p-4 rounded-2xl border transition-all ${
                    p.isUser
                      ? "bg-gradient-to-br from-indigo-50/70 via-white to-amber-50/50 border-indigo-200 shadow-xs ring-1 ring-indigo-200"
                      : "bg-white border-slate-200/90 shadow-xs hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                      <span className="font-black text-slate-900 text-xs truncate" title={p.name}>
                        {p.name}
                      </span>
                    </div>
                    {p.isUser && (
                      <span className="px-1.5 py-0.5 rounded bg-indigo-600 text-white text-[9px] font-black uppercase font-mono">
                        Siz
                      </span>
                    )}
                  </div>

                  {/* 6-Month Projected Growth Rate & Volatility */}
                  <div className="flex items-baseline justify-between gap-2 my-1">
                    <div className="text-[10px] text-slate-500 font-medium">6 Aylık Büyüme:</div>
                    <div className={`font-mono font-black text-base flex items-center gap-1 ${
                      isPositive ? "text-emerald-600" : "text-rose-600"
                    }`}>
                      {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      <span>{isPositive ? `+${p.sixMonthGrowthRate}%` : `${p.sixMonthGrowthRate}%`}</span>
                    </div>
                  </div>

                  {/* Volatility & Uncertainty Badge */}
                  <div className="flex items-center justify-between gap-1 py-1 px-2 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-mono my-1.5">
                    <span className="text-slate-500 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-indigo-500" />
                      <span>Belirsizlik (GA):</span>
                    </span>
                    <span className="font-bold text-indigo-950">
                      ±%{p.confidenceIntervalPct} ({p.volatilityLevel})
                    </span>
                  </div>

                  {/* Current vs 6th Month Metric */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-[11px] font-mono">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Organik Hacim:</span>
                      <span className="font-bold text-slate-900">
                        {startVal.traffic.toLocaleString("tr-TR")} ➔ {endVal.traffic.toLocaleString("tr-TR")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Ort. Sıralama:</span>
                      <span className="font-bold text-slate-900">
                        #{startVal.avgRank} ➔ #{endVal.avgRank}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Görünürlük:</span>
                      <span className="font-bold text-slate-900">
                        %{startVal.visibility} ➔ %{endVal.visibility}
                      </span>
                    </div>
                    {showConfidenceBand && (
                      <div className="flex items-center justify-between text-[10px] text-indigo-700 bg-indigo-50/50 px-1.5 py-0.5 rounded font-mono">
                        <span>6. Ay %{confidenceLevel} GA:</span>
                        <span className="font-bold">
                          {selectedMetric === "traffic" 
                            ? `${endVal.lowerTraffic.toLocaleString("tr-TR")} – ${endVal.upperTraffic.toLocaleString("tr-TR")}`
                            : selectedMetric === "visibility"
                            ? `%${endVal.lowerVisibility} – %${endVal.upperVisibility}`
                            : `#${endVal.lowerAvgRank} – #${endVal.upperAvgRank}`}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Growth Engine Driver Badges */}
                  <div className="mt-3 pt-2 border-t border-slate-100/90 flex flex-wrap gap-1">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[9px] font-bold font-mono">
                      ⚡ PSI {p.currentMetrics.speedScore}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[9px] font-bold font-mono">
                      📝 {p.currentMetrics.contentVelocity}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[9px] font-bold font-mono">
                      🔗 {p.currentMetrics.backlinkSignals}
                    </span>
                  </div>

                  {/* Driver summary snippet */}
                  <div className="mt-1 text-[10px] text-slate-500 truncate" title={p.growthDrivers.summaryText}>
                    {p.growthDrivers.summaryText}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 5. Collapsible Month-by-Month Projection Breakdown Table */}
          {showTableBreakdown && (
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900">
                  Ay Bazında Detaylı Büyüme ve Sıralama Tablosu (Projeksiyon Matrisi)
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  Birim: {selectedMetric === "traffic" ? "Tahmini Tıklama" : selectedMetric === "visibility" ? "Görünürlük Skoru" : "Ortalama SERP Sırası"}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                      <th className="py-2.5 px-3 font-black">Ay</th>
                      {profiles.map((p) => (
                        <th key={p.id} className="py-2.5 px-3 font-black">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                            <span>{p.name}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {FORECAST_MONTHS.map((m) => (
                      <tr key={m.index} className={m.index === 0 ? "bg-amber-50/40 font-bold" : "hover:bg-slate-50/70"}>
                        <td className="py-2.5 px-3 font-sans font-bold text-slate-900">
                          {m.full}
                        </td>
                        {profiles.map((p) => {
                          const pt = p.points[m.index];
                          if (!pt) return <td key={p.id}>-</td>;
                          const val = selectedMetric === "traffic" ? pt.traffic.toLocaleString("tr-TR")
                                    : selectedMetric === "visibility" ? `%${pt.visibility}`
                                    : `#${pt.avgRank}`;

                          const bounds = getMetricBounds(pt, selectedMetric, confidenceMultiplier);
                          const boundsText = selectedMetric === "traffic" 
                            ? `${bounds.lower.toLocaleString("tr-TR")} – ${bounds.upper.toLocaleString("tr-TR")}`
                            : selectedMetric === "visibility"
                            ? `%${bounds.lower} – %${bounds.upper}`
                            : `#${bounds.lower} – #${bounds.upper}`;

                          return (
                            <td key={p.id} className="py-2.5 px-3 text-slate-800">
                              <div className="flex items-center gap-2">
                                <span className="font-bold">{val}</span>
                                {m.index > 0 && (
                                  <span className={`text-[10px] ${pt.growthPct >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                                    ({pt.growthPct >= 0 ? `+${pt.growthPct}%` : `${pt.growthPct}%`})
                                  </span>
                                )}
                              </div>
                              {showConfidenceBand && m.index > 0 && (
                                <div className="text-[9px] text-indigo-700/80 font-mono mt-0.5">
                                  GA: {boundsText}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
