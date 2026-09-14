import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import {
  JourneyNode,
  JourneyLink,
  JourneyStageKey,
  TopJourneyPath
} from "../../types";
import { JOURNEY_STAGES, CHANNEL_COLORS } from "../../utils/leadMappingData";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Info,
  TrendingUp,
  Percent,
  CheckCircle2,
  Users,
  Eye,
  Search,
  DollarSign,
  AlertTriangle
} from "lucide-react";

interface LeadJourneyD3VisualizerProps {
  nodes: JourneyNode[];
  links: JourneyLink[];
  highlightEffectiveOnly: boolean;
  highlightDropOffs?: boolean;
  onToggleDropOffs?: (val: boolean) => void;
  selectedChannel: string; // "all" | "ads" | "organic" | "social" | "direct" | "referral"
  selectedPathId: string | null;
  topPaths: TopJourneyPath[];
  onSelectNode: (node: JourneyNode) => void;
  onSelectLink?: (link: JourneyLink) => void;
}

export const LeadJourneyD3Visualizer: React.FC<LeadJourneyD3VisualizerProps> = ({
  nodes,
  links,
  highlightEffectiveOnly,
  highlightDropOffs = false,
  onToggleDropOffs,
  selectedChannel,
  selectedPathId,
  topPaths,
  onSelectNode,
  onSelectLink
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [internalDropOffMode, setInternalDropOffMode] = useState<boolean>(highlightDropOffs);

  // Synchronize internal and prop state
  const isDropOffActive = highlightDropOffs || internalDropOffMode;

  const toggleDropOffMode = () => {
    const next = !isDropOffActive;
    setInternalDropOffMode(next);
    if (onToggleDropOffs) onToggleDropOffs(next);
  };

  // Tooltip state
  const [tooltipData, setTooltipData] = useState<{
    x: number;
    y: number;
    title: string;
    stageTitle: string;
    visitors: number;
    conversions: number;
    conversionRate: number;
    avgDealValue?: number;
    dropOffRate?: number;
    isTop?: boolean;
    channelName?: string;
  } | null>(null);

  // Zoom controls helper
  const handleZoomIn = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(300)
        .call(zoomBehaviorRef.current.scaleBy, 1.25);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(300)
        .call(zoomBehaviorRef.current.scaleBy, 0.8);
    }
  };

  const handleResetZoom = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(450)
        .call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
    }
  };

  // Identify active nodes in selected path if any
  const activePathNodeIds = useMemo(() => {
    if (!selectedPathId) return new Set<string>();
    const path = topPaths.find((p) => p.id === selectedPathId);
    if (!path) return new Set<string>();
    // Collect matching nodes across stages
    const matched = new Set<string>();
    nodes.forEach((n) => {
      const match = path.steps.some(
        (s) =>
          s.stage === n.stage &&
          (n.name.toLowerCase().includes(s.name.toLowerCase()) ||
            s.name.toLowerCase().includes(n.shortName.toLowerCase()) ||
            (n.channel && n.channel === path.channel))
      );
      if (match) matched.add(n.id);
    });
    return matched;
  }, [selectedPathId, topPaths, nodes]);

  // Main D3 Rendering Effect
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = Math.max(container.clientWidth || 1080, 980);
    const height = 660;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous drawing

    svg
      .attr("width", "100%")
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("style", "max-width: 100%; height: auto; font-family: inherit;");

    // Definitions for gradients & glowing drop shadow filters
    const defs = svg.append("defs");

    // Drop shadow filter for active nodes & high-converting cards
    const filter = defs
      .append("filter")
      .attr("id", "glow-shadow")
      .attr("x", "-20%")
      .attr("y", "-20%")
      .attr("width", "140%")
      .attr("height", "140%");
    filter
      .append("feGaussianBlur")
      .attr("stdDeviation", "4")
      .attr("result", "blur");
    filter
      .append("feComposite")
      .attr("in", "SourceGraphic")
      .attr("in2", "blur")
      .attr("operator", "over");

    // Stage order mapping
    const stageOrder: Record<JourneyStageKey, number> = {
      touchpoint: 0,
      landing: 1,
      engagement: 2,
      intent: 3,
      conversion: 4
    };

    // Distribute columns evenly across width
    const margin = { top: 60, right: 30, bottom: 40, left: 30 };
    const usableWidth = width - margin.left - margin.right;
    const usableHeight = height - margin.top - margin.bottom;

    const columnWidth = 175;
    const numColumns = 5;
    const columnSpacing = (usableWidth - numColumns * columnWidth) / (numColumns - 1);

    // Group nodes by stage
    const nodesByStage: Record<JourneyStageKey, JourneyNode[]> = {
      touchpoint: [],
      landing: [],
      engagement: [],
      intent: [],
      conversion: []
    };

    nodes.forEach((node) => {
      if (nodesByStage[node.stage]) {
        nodesByStage[node.stage].push(node);
      }
    });

    // Layout node coordinates (x, y, width, height)
    interface LayoutNode extends JourneyNode {
      x: number;
      y: number;
      w: number;
      h: number;
      colIndex: number;
    }

    const layoutNodes: LayoutNode[] = [];
    const nodeMap = new Map<string, LayoutNode>();

    Object.entries(nodesByStage).forEach(([stageKey, stageNodes]) => {
      const colIdx = stageOrder[stageKey as JourneyStageKey];
      const colX = margin.left + colIdx * (columnWidth + columnSpacing);

      const count = stageNodes.length;
      const nodeH = 76;
      const gap = Math.min(22, (usableHeight - count * nodeH) / Math.max(1, count - 1));
      const totalColHeight = count * nodeH + (count - 1) * gap;
      const startY = margin.top + (usableHeight - totalColHeight) / 2;

      stageNodes.forEach((node, rowIdx) => {
        const nodeY = startY + rowIdx * (nodeH + gap);
        const lNode: LayoutNode = {
          ...node,
          x: colX,
          y: nodeY,
          w: columnWidth,
          h: nodeH,
          colIndex: colIdx
        };
        layoutNodes.push(lNode);
        nodeMap.set(node.id, lNode);
      });
    });

    // Create Main Zoom Container Group
    const g = svg.append("g").attr("class", "main-journey-group");

    // Initialize D3 Zoom
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.65, 2.2])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom);

    // --- DRAW STAGE COLUMN HEADERS ---
    JOURNEY_STAGES.forEach((stage, idx) => {
      const colX = margin.left + idx * (columnWidth + columnSpacing);

      const headerG = g
        .append("g")
        .attr("class", `stage-header-${stage.key}`)
        .attr("transform", `translate(${colX}, 14)`);

      // Column stage pill background
      headerG
        .append("rect")
        .attr("width", columnWidth)
        .attr("height", 34)
        .attr("rx", 10)
        .attr("fill", "#ffffff")
        .attr("stroke", "#e2e8f0")
        .attr("stroke-width", 1.2)
        .attr("class", "shadow-xs");

      // Column accent bar on top
      headerG
        .append("rect")
        .attr("x", 4)
        .attr("y", 4)
        .attr("width", 4)
        .attr("height", 26)
        .attr("rx", 2)
        .attr("fill", stage.color);

      // Title
      headerG
        .append("text")
        .attr("x", 14)
        .attr("y", 16)
        .attr("font-size", "11px")
        .attr("font-weight", "700")
        .attr("fill", "#1e293b")
        .text(stage.title);

      // Subtitle
      headerG
        .append("text")
        .attr("x", 14)
        .attr("y", 28)
        .attr("font-size", "9px")
        .attr("font-weight", "500")
        .attr("fill", "#64748b")
        .text(
          idx === 0
            ? "Reklam & Arama Tıklamaları"
            : idx === 1
            ? "Karşılama Sayfaları"
            : idx === 2
            ? "Etkileşim & Güven"
            : idx === 3
            ? "Form & İletişim Niyeti"
            : "Nihai Dönüşüm (Leads)"
        );
    });

    // --- DRAW FLOW PATH LINKS (BEZIER RIBBONS) ---
    const linkGroup = g.append("g").attr("class", "journey-links");

    // Max visitors for stroke scale
    const maxVisitors = Math.max(...links.map((d) => d.visitors), 400);
    const strokeScale = d3.scaleLinear().domain([10, maxVisitors]).range([3.5, 18]);

    // Create unique gradients for links
    links.forEach((link) => {
      const source = nodeMap.get(link.source);
      const target = nodeMap.get(link.target);
      if (!source || !target) return;

      const gradId = `grad-${link.id}`;
      const grad = defs
        .append("linearGradient")
        .attr("id", gradId)
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", source.x + source.w)
        .attr("y1", source.y + source.h / 2)
        .attr("x2", target.x)
        .attr("y2", target.y + target.h / 2);

      grad
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", source.color || "#3b82f6");

      grad
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", target.color || "#10b981");
    });

    // Helper to render smooth S-curve link path
    const linkGenerator = (source: LayoutNode, target: LayoutNode) => {
      const x0 = source.x + source.w;
      const y0 = source.y + source.h / 2;
      const x1 = target.x;
      const y1 = target.y + target.h / 2;
      const xi = d3.interpolateNumber(x0, x1);
      const x2 = xi(0.5);
      const x3 = xi(0.5);

      return `M${x0},${y0}C${x2},${y0} ${x3},${y1} ${x1},${y1}`;
    };

    // Render each link
    links.forEach((link) => {
      const source = nodeMap.get(link.source);
      const target = nodeMap.get(link.target);
      if (!source || !target) return;

      // Determine highlight status
      const isChannelMatch =
        selectedChannel === "all" || link.channel === selectedChannel;
      const isPathMatch =
        selectedPathId !== null
          ? activePathNodeIds.has(source.id) && activePathNodeIds.has(target.id)
          : false;
      const isEffectivenessHighlight =
        highlightEffectiveOnly && (link.isHighConverting || link.conversionRate >= 35);

      const isHighlighted =
        (selectedPathId ? isPathMatch : true) &&
        isChannelMatch &&
        (!highlightEffectiveOnly || isEffectivenessHighlight);

      const pathData = linkGenerator(source, target);
      const strokeW = strokeScale(link.visitors);

      const linkPath = linkGroup
        .append("path")
        .attr("d", pathData)
        .attr("fill", "none")
        .attr("stroke", `url(#grad-${link.id})`)
        .attr("stroke-width", isHighlighted ? strokeW : Math.max(1.8, strokeW * 0.45))
        .attr(
          "opacity",
          isHighlighted ? (link.isHighConverting ? 0.88 : 0.65) : 0.08
        )
        .attr("stroke-linecap", "round")
        .style("cursor", "pointer")
        .style("transition", "all 0.3s ease");

      // Pulsing dash animation on high-converting routes
      if (link.isHighConverting && isHighlighted) {
        linkPath
          .attr("stroke-dasharray", "8, 5")
          .attr("class", "high-converting-pulse");
      }

      // Hover interactions on links
      linkPath
        .on("mouseenter", function (event) {
          d3.select(this)
            .attr("opacity", 1)
            .attr("stroke-width", strokeW + 4);

          const [mx, my] = d3.pointer(event, container);
          setTooltipData({
            x: mx,
            y: my,
            title: `${source.shortName} ➔ ${target.shortName}`,
            stageTitle: `${source.name} adımından ${target.name} adımına geçiş`,
            visitors: link.visitors,
            conversions: link.conversions,
            conversionRate: link.conversionRate,
            isTop: link.isHighConverting,
            channelName:
              link.channel === "ads"
                ? "Google Reklamları (Ads)"
                : link.channel === "organic"
                ? "Organik SEO"
                : link.channel === "social"
                ? "Sosyal Medya"
                : "Doğrudan / Tavsiye"
          });
        })
        .on("mousemove", function (event) {
          const [mx, my] = d3.pointer(event, container);
          setTooltipData((prev) => (prev ? { ...prev, x: mx, y: my } : null));
        })
        .on("mouseleave", function () {
          d3.select(this)
            .attr(
              "opacity",
              isHighlighted ? (link.isHighConverting ? 0.88 : 0.65) : 0.08
            )
            .attr("stroke-width", isHighlighted ? strokeW : Math.max(1.8, strokeW * 0.45));
          setTooltipData(null);
        })
        .on("click", function () {
          if (onSelectLink) onSelectLink(link);
        });
    });

    // --- DRAW NODES ---
    const nodeGroup = g.append("g").attr("class", "journey-nodes");

    layoutNodes.forEach((node) => {
      const isChannelMatch =
        selectedChannel === "all" || !node.channel || node.channel === selectedChannel;
      const isPathMatch =
        selectedPathId !== null ? activePathNodeIds.has(node.id) : true;
      const isEffectivenessHighlight =
        !highlightEffectiveOnly || node.isTopChannel || node.conversionRate >= 32;

      const isNodeActive = isChannelMatch && isPathMatch && isEffectivenessHighlight;
      const isHighDropOff = isDropOffActive && (node.dropOffRate >= 20);

      const nodeG = nodeGroup
        .append("g")
        .attr("class", `journey-node-${node.id}`)
        .attr("transform", `translate(${node.x}, ${node.y})`)
        .attr("opacity", isNodeActive ? 1 : 0.22)
        .style("cursor", "pointer");

      // Node Card Background
      const rect = nodeG
        .append("rect")
        .attr("width", node.w)
        .attr("height", node.h)
        .attr("rx", 12)
        .attr("fill", "#ffffff")
        .attr(
          "stroke",
          isHighDropOff
            ? "#f43f5e"
            : node.isTopChannel
            ? "#f59e0b"
            : isNodeActive
            ? "#cbd5e1"
            : "#e2e8f0"
        )
        .attr("stroke-width", isHighDropOff ? 2.2 : node.isTopChannel ? 2 : 1.2)
        .attr("class", "transition-all duration-200 shadow-sm");

      // Pulsing Drop-off Warning Ring when active
      if (isHighDropOff) {
        nodeG
          .append("rect")
          .attr("x", -3)
          .attr("y", -3)
          .attr("width", node.w + 6)
          .attr("height", node.h + 6)
          .attr("rx", 15)
          .attr("fill", "none")
          .attr("stroke", "#f43f5e")
          .attr("stroke-width", 1.2)
          .attr("stroke-dasharray", "4, 3")
          .attr("opacity", 0.7);
      }

      // Left Accent Color Bar
      nodeG
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 5)
        .attr("height", node.h)
        .attr("rx", 3)
        .attr("fill", node.color);

      // Top badge icon / Star for Top Channel
      if (node.isTopChannel) {
        nodeG
          .append("circle")
          .attr("cx", node.w - 12)
          .attr("cy", 12)
          .attr("r", 7)
          .attr("fill", "#fef3c7")
          .attr("stroke", "#f59e0b")
          .attr("stroke-width", 1);

        nodeG
          .append("text")
          .attr("x", node.w - 12)
          .attr("y", 15)
          .attr("font-size", "9px")
          .attr("text-anchor", "middle")
          .text("★");
      }

      // Title text (Truncated with ellipsis if needed)
      nodeG
        .append("text")
        .attr("x", 12)
        .attr("y", 21)
        .attr("font-size", "11px")
        .attr("font-weight", "700")
        .attr("fill", "#0f172a")
        .text(() => {
          if (node.name.length > 21) {
            return node.name.slice(0, 19) + "...";
          }
          return node.name;
        });

      // Volume metric (Ziyaretçi & Akış)
      const statG = nodeG.append("g").attr("transform", "translate(12, 38)");

      statG
        .append("text")
        .attr("font-size", "10px")
        .attr("font-weight", "500")
        .attr("fill", "#64748b")
        .text(`${node.visitors} ziyaretçi`);

      // Conversion Rate Pill or Drop-Off Warning Pill
      const convPill = nodeG
        .append("g")
        .attr("transform", `translate(12, 50)`);

      if (isHighDropOff) {
        const droppedCount = Math.round(node.visitors * (node.dropOffRate / 100));
        convPill
          .append("rect")
          .attr("width", 112)
          .attr("height", 18)
          .attr("rx", 5)
          .attr("fill", "#fff1f2")
          .attr("stroke", "#f43f5e")
          .attr("stroke-width", 1);

        convPill
          .append("text")
          .attr("x", 6)
          .attr("y", 12)
          .attr("font-size", "9px")
          .attr("font-weight", "800")
          .attr("fill", "#e11d48")
          .text(`🚨 -${droppedCount} Terk (%${node.dropOffRate.toFixed(1)})`);

        // Downward leak indicator dot
        const leakG = nodeG.append("g").attr("transform", `translate(${node.w / 2}, ${node.h})`);
        leakG
          .append("path")
          .attr("d", "M 0 0 L 0 14")
          .attr("stroke", "#f43f5e")
          .attr("stroke-width", 1.8)
          .attr("stroke-dasharray", "3, 2");
        leakG
          .append("circle")
          .attr("cx", 0)
          .attr("cy", 14)
          .attr("r", 3.5)
          .attr("fill", "#e11d48");
      } else {
        const convColor =
          node.conversionRate >= 35
            ? "#059669"
            : node.conversionRate >= 25
            ? "#2563eb"
            : "#64748b";

        const convBg =
          node.conversionRate >= 35
            ? "#ecfdf5"
            : node.conversionRate >= 25
            ? "#eff6ff"
            : "#f8fafc";

        convPill
          .append("rect")
          .attr("width", 86)
          .attr("height", 18)
          .attr("rx", 5)
          .attr("fill", convBg)
          .attr("stroke", convColor)
          .attr("stroke-width", 0.7);

        convPill
          .append("text")
          .attr("x", 6)
          .attr("y", 12)
          .attr("font-size", "9.5px")
          .attr("font-weight", "700")
          .attr("fill", convColor)
          .text(`%${node.conversionRate.toFixed(1)} Dönüşüm`);
      }

      // Node Hover Interactions
      nodeG
        .on("mouseenter", function (event) {
          rect
            .attr("stroke", node.color)
            .attr("stroke-width", 2.2)
            .attr("filter", "url(#glow-shadow)");

          const [mx, my] = d3.pointer(event, container);
          setTooltipData({
            x: mx,
            y: my,
            title: node.name,
            stageTitle: JOURNEY_STAGES.find((s) => s.key === node.stage)?.title || "",
            visitors: node.visitors,
            conversions: node.conversions,
            conversionRate: node.conversionRate,
            avgDealValue: node.avgDealValue,
            dropOffRate: node.dropOffRate,
            isTop: node.isTopChannel,
            channelName: node.channel ? CHANNEL_COLORS[node.channel] : undefined
          });
        })
        .on("mousemove", function (event) {
          const [mx, my] = d3.pointer(event, container);
          setTooltipData((prev) => (prev ? { ...prev, x: mx, y: my } : null));
        })
        .on("mouseleave", function () {
          rect
            .attr(
              "stroke",
              node.isTopChannel
                ? "#f59e0b"
                : isNodeActive
                ? "#cbd5e1"
                : "#e2e8f0"
            )
            .attr("stroke-width", node.isTopChannel ? 2 : 1.2)
            .attr("filter", null);
          setTooltipData(null);
        })
        .on("click", function () {
          onSelectNode(node);
        });
    });
  }, [
    nodes,
    links,
    highlightEffectiveOnly,
    isDropOffActive,
    selectedChannel,
    selectedPathId,
    activePathNodeIds,
    onSelectNode,
    onSelectLink
  ]);

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-200 shadow-xs">
      {/* Visualizer Top Bar Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-white/80 backdrop-blur-xs border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 font-bold text-xs">
            D3
          </span>
          <span className="text-xs font-semibold text-slate-800">
            D3.js Müşteri Yolculuk Akışı (Tıklamadan Forma)
          </span>
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
            5 Aşamalı Çok Temaslı Akış
          </span>
        </div>

        {/* Mode & Zoom Actions */}
        <div className="flex items-center gap-2">
          {/* Drop-off Highlight Mode Button */}
          <button
            type="button"
            id="toggle-dropoff-points-btn"
            onClick={toggleDropOffMode}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isDropOffActive
                ? "bg-rose-600 text-white shadow-xs ring-2 ring-rose-300"
                : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
            }`}
            title="En çok ziyaretçi kaybı yaşanan (drop-off) adımları haritada vurgulayın"
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${isDropOffActive ? "text-white" : "text-rose-500"}`} />
            <span>🚨 Terk / Drop-off Vurgula</span>
            {isDropOffActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            )}
          </button>

          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            <button
              type="button"
              onClick={handleZoomIn}
              title="Yakınlaştır (+)"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-md transition-colors cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              title="Uzaklaştır (-)"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-md transition-colors cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              title="Görünümü Sıfırla"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-md transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* D3 Canvas Container */}
      <div
        ref={containerRef}
        className="relative w-full h-[620px] cursor-grab active:cursor-grabbing select-none"
      >
        <svg ref={svgRef} className="w-full h-full block" />

        {/* Interactive Floating HTML Tooltip */}
        {tooltipData && (
          <div
            className="pointer-events-none absolute z-50 rounded-xl bg-slate-900/95 text-white p-3 text-xs shadow-xl backdrop-blur-md border border-slate-700 max-w-xs transition-transform duration-75"
            style={{
              left: `${Math.min(tooltipData.x + 16, (containerRef.current?.clientWidth || 900) - 260)}px`,
              top: `${Math.max(16, tooltipData.y - 40)}px`
            }}
          >
            <div className="flex items-center justify-between gap-2 border-b border-slate-700 pb-1.5 mb-2">
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                {tooltipData.stageTitle}
              </span>
              {tooltipData.isTop && (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  ★ En Yüksek Getiri
                </span>
              )}
            </div>

            <div className="font-bold text-sm text-white mb-2 leading-tight">
              {tooltipData.title}
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-800/80 p-2 rounded-lg border border-slate-700/60 mb-2">
              <div>
                <span className="text-slate-400 block text-[10px]">Trafik / Ziyaret:</span>
                <span className="font-semibold text-white">
                  {tooltipData.visitors.toLocaleString("tr-TR")} kişi
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Form Başvurusu:</span>
                <span className="font-semibold text-emerald-400">
                  {tooltipData.conversions.toLocaleString("tr-TR")} adet
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Dönüşüm Oranı:</span>
                <span className="font-bold text-indigo-300">
                  %{tooltipData.conversionRate.toFixed(1)}
                </span>
              </div>
              {tooltipData.avgDealValue ? (
                <div>
                  <span className="text-slate-400 block text-[10px]">Ort. Değer:</span>
                  <span className="font-bold text-amber-400">
                    {tooltipData.avgDealValue.toLocaleString("tr-TR")} ₺
                  </span>
                </div>
              ) : tooltipData.dropOffRate !== undefined ? (
                <div>
                  <span className="text-slate-400 block text-[10px]">Terk Oranı:</span>
                  <span className="font-semibold text-rose-400">
                    %{tooltipData.dropOffRate.toFixed(1)}
                  </span>
                </div>
              ) : null}
            </div>

            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Info className="w-3 h-3 text-indigo-400 shrink-0" />
              <span>Detaylı lead listesi ve filtreleme için tıklayın.</span>
            </div>
          </div>
        )}
      </div>

      {/* Visualizer Legend Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-semibold text-slate-700">Kanal Renkleri:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-[11px]">Google Ads</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-[11px]">Organik SEO</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
            <span className="text-[11px]">Sosyal Medya / Meta</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-[11px]">Doğrudan Erişim</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <span className="flex items-center gap-1 text-emerald-600 font-medium">
            <Sparkles className="w-3 h-3" />
            Şerit kalınlığı trafik hacmini temsil eder
          </span>
        </div>
      </div>
    </div>
  );
};
