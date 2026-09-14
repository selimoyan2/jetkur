import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import { SiteConfig } from "../../types";
import {
  getAbTestConversionAnalysis,
  applyWinningVariantToLiveHero,
  recordSimulatedAbLead,
  AbConversionAnalysis,
  FunnelStageData
} from "../../utils/abTestConversionUtils";
import {
  Trophy,
  Sparkles,
  TrendingUp,
  MousePointerClick,
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  Split,
  Layers,
  BarChart3,
  LineChart,
  RefreshCw,
  Zap,
  Download,
  Check,
  ChevronRight,
  Filter,
  Eye,
  Sliders,
  ExternalLink,
  ShieldCheck,
  Flame,
  Award
} from "lucide-react";

interface AbTestConversionFunnelWidgetProps {
  config: SiteConfig;
  onChange?: (newConfig: SiteConfig) => void;
  isCompactWidget?: boolean;
  onOpenFullView?: () => void;
  onNavigateTab?: (tab: string) => void;
}

type FunnelViewMode = "funnel" | "efficiency" | "trend";

export const AbTestConversionFunnelWidget: React.FC<AbTestConversionFunnelWidgetProps> = ({
  config,
  onChange,
  isCompactWidget = false,
  onOpenFullView,
  onNavigateTab
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [viewMode, setViewMode] = useState<FunnelViewMode>("funnel");
  const [activeStageId, setActiveStageId] = useState<"views" | "clicks" | "leads" | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isLiveApplied, setIsLiveApplied] = useState(false);

  // Compute live analysis based on siteConfig
  const analysis: AbConversionAnalysis = useMemo(() => {
    return getAbTestConversionAnalysis(config);
  }, [config]);

  const {
    variantA,
    variantB,
    viewsA,
    viewsB,
    clicksA,
    clicksB,
    leadsA,
    leadsB,
    ctrA,
    ctrB,
    leadRateA,
    leadRateB,
    clickToLeadA,
    clickToLeadB,
    winnerVariant,
    leadDifference,
    leadLiftPercent,
    confidencePercent,
    isStatisticallySignificant,
    funnelStages,
    history,
    summaryInsights
  } = analysis;

  // Handle applying the winner to live hero
  const handleApplyWinner = (winnerId: "A" | "B") => {
    if (!onChange) return;
    const updated = applyWinningVariantToLiveHero(config, winnerId);
    onChange(updated);
    setIsLiveApplied(true);
    setSuccessToast(
      `Varyasyon ${winnerId} başarıyla ana sayfa canlı yayınına aktarıldı ve trafik %100 bu varyanta kilitlendi.`
    );
    setTimeout(() => {
      setSuccessToast(null);
    }, 4500);
  };

  // Handle simulated lead
  const handleSimulateLead = (variantId: "A" | "B") => {
    if (!onChange) return;
    const updated = recordSimulatedAbLead(config, variantId);
    onChange(updated);
    setSuccessToast(
      `Varyasyon ${variantId}'ye +1 yeni potansiyel müşteri talebi (Lead) kaydedildi.`
    );
    setTimeout(() => {
      setSuccessToast(null);
    }, 3000);
  };

  // Export JSON summary
  const handleExportData = () => {
    const exportPayload = {
      testName: analysis.experiment.testName,
      status: analysis.experiment.status,
      winnerBasedOnLeads: winnerVariant,
      leadDifference,
      leadLiftPercent,
      confidencePercent,
      stats: {
        variantA: {
          label: variantA.label,
          views: viewsA,
          clicks: clicksA,
          leads: leadsA,
          ctr: `${ctrA.toFixed(1)}%`,
          overallLeadRate: `${leadRateA.toFixed(1)}%`
        },
        variantB: {
          label: variantB.label,
          views: viewsB,
          clicks: clicksB,
          leads: leadsB,
          ctr: `${ctrB.toFixed(1)}%`,
          overallLeadRate: `${leadRateB.toFixed(1)}%`
        }
      },
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ab-test-funnel-analysis-${winnerVariant.toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ==========================================
  // D3.JS RENDERING ENGINE
  // ==========================================
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svgEl = svgRef.current;
    const svg = d3.select(svgEl);
    svg.selectAll("*").remove(); // Clear previous render

    // Dimensions
    const containerWidth = containerRef.current.clientWidth || 820;
    const width = Math.max(680, containerWidth);
    const height = viewMode === "funnel" ? 370 : viewMode === "efficiency" ? 340 : 340;

    svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("width", "100%")
      .attr("height", height)
      .style("overflow", "visible");

    // Defs for gradients & shadow filters
    const defs = svg.append("defs");

    // Variant A Gradient (Indigo/Slate)
    const gradA = defs
      .append("linearGradient")
      .attr("id", "gradVariantA")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%");
    gradA.append("stop").attr("offset", "0%").attr("stop-color", "#6366f1").attr("stop-opacity", 0.95);
    gradA.append("stop").attr("offset", "100%").attr("stop-color", "#4f46e5").attr("stop-opacity", 0.85);

    // Variant B Gradient (Emerald if Winner, else Indigo)
    const gradB = defs
      .append("linearGradient")
      .attr("id", "gradVariantB")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%");
    gradB.append("stop").attr("offset", "0%").attr("stop-color", "#10b981").attr("stop-opacity", 0.95);
    gradB.append("stop").attr("offset", "100%").attr("stop-color", "#059669").attr("stop-opacity", 0.9);

    // Winner Highlight Gradient
    const gradWinner = defs
      .append("linearGradient")
      .attr("id", "gradWinnerAura")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
    gradWinner.append("stop").attr("offset", "0%").attr("stop-color", "#fef3c7").attr("stop-opacity", 0.45);
    gradWinner.append("stop").attr("offset", "100%").attr("stop-color", "#d1fae5").attr("stop-opacity", 0.1);

    // Filter for drop-shadow
    const filter = defs.append("filter").attr("id", "d3-glow").attr("x", "-20%").attr("y", "-20%").attr("width", "140%").attr("height", "140%");
    filter.append("feGaussianBlur").attr("stdDeviation", "4").attr("result", "blur");
    filter.append("feComposite").attr("in", "SourceGraphic").attr("in2", "blur").attr("operator", "over");

    // Tooltip div
    let tooltip = d3.select(containerRef.current).select<HTMLDivElement>(".d3-funnel-tooltip");
    if (tooltip.empty()) {
      tooltip = d3
        .select(containerRef.current)
        .append("div")
        .attr("class", "d3-funnel-tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("pointer-events", "none")
        .style("z-index", "40")
        .style("transition", "opacity 0.15s ease-out");
    }

    // ----------------------------------------------------
    // VIEW 1: DUAL CONVERSION FUNNEL (A vs B)
    // ----------------------------------------------------
    if (viewMode === "funnel") {
      const margin = { top: 48, right: 36, bottom: 28, left: 36 };
      const contentWidth = width - margin.left - margin.right;
      const colWidth = (contentWidth - 70) / 2;
      const colAX = margin.left;
      const colBX = margin.left + colWidth + 70;

      const stageHeights = [76, 76, 76];
      const stageGap = 24;
      const maxVal = Math.max(viewsA, viewsB, 1);

      // Width scale for funnel trapezoids
      const minStageWidth = 80;
      const maxStageWidth = colWidth - 24;
      const scaleWidth = (count: number) => {
        const ratio = count / maxVal;
        return minStageWidth + (maxStageWidth - minStageWidth) * ratio;
      };

      // Background cards for columns
      // Variant A Card
      svg
        .append("rect")
        .attr("x", colAX)
        .attr("y", 12)
        .attr("width", colWidth)
        .attr("height", height - 24)
        .attr("rx", 16)
        .attr("fill", winnerVariant === "A" ? "url(#gradWinnerAura)" : "#f8fafc")
        .attr("stroke", winnerVariant === "A" ? "#f59e0b" : "#e2e8f0")
        .attr("stroke-width", winnerVariant === "A" ? 2 : 1)
        .attr("stroke-dasharray", winnerVariant === "A" ? "none" : "none");

      // Variant B Card
      svg
        .append("rect")
        .attr("x", colBX)
        .attr("y", 12)
        .attr("width", colWidth)
        .attr("height", height - 24)
        .attr("rx", 16)
        .attr("fill", winnerVariant === "B" ? "url(#gradWinnerAura)" : "#f8fafc")
        .attr("stroke", winnerVariant === "B" ? "#10b981" : "#e2e8f0")
        .attr("stroke-width", winnerVariant === "B" ? 2 : 1);

      // Headers for columns
      // A Header
      const headerA = svg.append("g").attr("transform", `translate(${colAX + 16}, 32)`);
      headerA
        .append("text")
        .attr("font-size", 13)
        .attr("font-weight", "800")
        .attr("fill", "#1e293b")
        .text("Varyasyon A (Kontrol)");

      headerA
        .append("text")
        .attr("y", 16)
        .attr("font-size", 10.5)
        .attr("font-weight", "600")
        .attr("fill", "#64748b")
        .text(`Hero: "${variantA.title?.slice(0, 32)}..."`);

      if (winnerVariant === "A") {
        const winBadge = headerA.append("g").attr("transform", `translate(${colWidth - 110}, -4)`);
        winBadge
          .append("rect")
          .attr("width", 80)
          .attr("height", 22)
          .attr("rx", 11)
          .attr("fill", "#fef3c7")
          .attr("stroke", "#f59e0b");
        winBadge
          .append("text")
          .attr("x", 40)
          .attr("y", 15)
          .attr("text-anchor", "middle")
          .attr("font-size", 10)
          .attr("font-weight", "800")
          .attr("fill", "#92400e")
          .text("🏆 KAZANAN");
      }

      // B Header
      const headerB = svg.append("g").attr("transform", `translate(${colBX + 16}, 32)`);
      headerB
        .append("text")
        .attr("font-size", 13)
        .attr("font-weight", "800")
        .attr("fill", "#1e293b")
        .text("Varyasyon B (Challenger)");

      headerB
        .append("text")
        .attr("y", 16)
        .attr("font-size", 10.5)
        .attr("font-weight", "600")
        .attr("fill", "#64748b")
        .text(`Hero: "${variantB.title?.slice(0, 32)}..."`);

      if (winnerVariant === "B") {
        const winBadge = headerB.append("g").attr("transform", `translate(${colWidth - 120}, -4)`);
        winBadge
          .append("rect")
          .attr("width", 90)
          .attr("height", 22)
          .attr("rx", 11)
          .attr("fill", "#d1fae5")
          .attr("stroke", "#10b981");
        winBadge
          .append("text")
          .attr("x", 45)
          .attr("y", 15)
          .attr("text-anchor", "middle")
          .attr("font-size", 10)
          .attr("font-weight", "800")
          .attr("fill", "#065f46")
          .text("🏆 KAZANAN (+%64)");
      }

      // Center Divider & Comparison Bridge
      const centerBridgeX = margin.left + colWidth + 35;
      svg
        .append("line")
        .attr("x1", centerBridgeX)
        .attr("y1", 60)
        .attr("x2", centerBridgeX)
        .attr("y2", height - 35)
        .attr("stroke", "#cbd5e1")
        .attr("stroke-dasharray", "4,4")
        .attr("stroke-width", 1);

      // Draw Funnel Stages
      const stageYPositions = [
        margin.top + 24,
        margin.top + 24 + stageHeights[0] + stageGap,
        margin.top + 24 + (stageHeights[0] + stageGap) * 2
      ];

      funnelStages.forEach((stage, idx) => {
        const stageY = stageYPositions[idx];
        const stageH = stageHeights[idx];

        const wA = scaleWidth(stage.countA);
        const wB = scaleWidth(stage.countB);

        const aLeft = colAX + (colWidth - wA) / 2;
        const bLeft = colBX + (colWidth - wB) / 2;

        // --- Trapezoid / Rounded Stage Box for Variant A ---
        const stageAGroup = svg
          .append("g")
          .attr("class", "stage-a-box")
          .style("cursor", "pointer")
          .on("mouseenter", (event) => {
            const [mx, my] = d3.pointer(event, containerRef.current);
            tooltip
              .html(`
                <div class="bg-slate-900 text-white p-3 rounded-xl shadow-2xl border border-slate-700 text-xs w-64 backdrop-blur-md">
                  <div class="flex items-center justify-between border-b border-slate-700 pb-1.5 mb-1.5">
                    <span class="font-bold text-indigo-400">Varyasyon A (Kontrol)</span>
                    <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">${stage.label.split(" ")[0]}</span>
                  </div>
                  <div class="text-sm font-black text-white mb-1">${stage.countA} Adet</div>
                  <div class="space-y-1 text-[11px] text-slate-300">
                    <div class="flex justify-between">
                      <span>Gösterime Göre Oran:</span>
                      <strong class="text-indigo-300">%${stage.rateA}</strong>
                    </div>
                    ${
                      idx > 0
                        ? `<div class="flex justify-between text-rose-300">
                            <span>Adım Kaybı (Drop-off):</span>
                            <strong>-${stage.dropoffA} (%${stage.dropoffRateA})</strong>
                          </div>`
                        : ""
                    }
                  </div>
                </div>
              `)
              .style("visibility", "visible")
              .style("left", `${mx + 15}px`)
              .style("top", `${my - 20}px`);
          })
          .on("mousemove", (event) => {
            const [mx, my] = d3.pointer(event, containerRef.current);
            tooltip.style("left", `${mx + 15}px`).style("top", `${my - 20}px`);
          })
          .on("mouseleave", () => {
            tooltip.style("visibility", "hidden");
          });

        stageAGroup
          .append("rect")
          .attr("x", aLeft)
          .attr("y", stageY)
          .attr("width", wA)
          .attr("height", stageH)
          .attr("rx", 10)
          .attr("fill", idx === 2 && winnerVariant === "A" ? "#f59e0b" : "url(#gradVariantA)")
          .attr("stroke", idx === 2 && winnerVariant === "A" ? "#d97706" : "#4338ca")
          .attr("stroke-width", 1.5)
          .attr("opacity", 0.92);

        // Text inside Stage A
        stageAGroup
          .append("text")
          .attr("x", aLeft + wA / 2)
          .attr("y", stageY + 24)
          .attr("text-anchor", "middle")
          .attr("font-size", 10.5)
          .attr("font-weight", "600")
          .attr("fill", "#ffffff")
          .text(stage.label.split("(")[0]);

        stageAGroup
          .append("text")
          .attr("x", aLeft + wA / 2)
          .attr("y", stageY + 48)
          .attr("text-anchor", "middle")
          .attr("font-size", 17)
          .attr("font-weight", "900")
          .attr("fill", "#ffffff")
          .text(stage.countA.toLocaleString());

        stageAGroup
          .append("text")
          .attr("x", aLeft + wA / 2)
          .attr("y", stageY + 65)
          .attr("text-anchor", "middle")
          .attr("font-size", 9.5)
          .attr("font-weight", "700")
          .attr("fill", "#e0e7ff")
          .text(`%${stage.rateA} Gösterim Oranı`);

        // --- Trapezoid / Rounded Stage Box for Variant B ---
        const stageBGroup = svg
          .append("g")
          .attr("class", "stage-b-box")
          .style("cursor", "pointer")
          .on("mouseenter", (event) => {
            const [mx, my] = d3.pointer(event, containerRef.current);
            tooltip
              .html(`
                <div class="bg-slate-900 text-white p-3 rounded-xl shadow-2xl border border-slate-700 text-xs w-64 backdrop-blur-md">
                  <div class="flex items-center justify-between border-b border-slate-700 pb-1.5 mb-1.5">
                    <span class="font-bold text-emerald-400">Varyasyon B (Challenger)</span>
                    <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">${stage.label.split(" ")[0]}</span>
                  </div>
                  <div class="text-sm font-black text-white mb-1">${stage.countB} Adet</div>
                  <div class="space-y-1 text-[11px] text-slate-300">
                    <div class="flex justify-between">
                      <span>Gösterime Göre Oran:</span>
                      <strong class="text-emerald-300">%${stage.rateB}</strong>
                    </div>
                    ${
                      idx > 0
                        ? `<div class="flex justify-between text-rose-300">
                            <span>Adım Kaybı (Drop-off):</span>
                            <strong>-${stage.dropoffB} (%${stage.dropoffRateB})</strong>
                          </div>`
                        : ""
                    }
                  </div>
                </div>
              `)
              .style("visibility", "visible")
              .style("left", `${mx + 15}px`)
              .style("top", `${my - 20}px`);
          })
          .on("mousemove", (event) => {
            const [mx, my] = d3.pointer(event, containerRef.current);
            tooltip.style("left", `${mx + 15}px`).style("top", `${my - 20}px`);
          })
          .on("mouseleave", () => {
            tooltip.style("visibility", "hidden");
          });

        stageBGroup
          .append("rect")
          .attr("x", bLeft)
          .attr("y", stageY)
          .attr("width", wB)
          .attr("height", stageH)
          .attr("rx", 10)
          .attr("fill", "url(#gradVariantB)")
          .attr("stroke", idx === 2 && winnerVariant === "B" ? "#10b981" : "#047857")
          .attr("stroke-width", idx === 2 && winnerVariant === "B" ? 2.5 : 1.5)
          .attr("opacity", 0.95);

        // Text inside Stage B
        stageBGroup
          .append("text")
          .attr("x", bLeft + wB / 2)
          .attr("y", stageY + 24)
          .attr("text-anchor", "middle")
          .attr("font-size", 10.5)
          .attr("font-weight", "600")
          .attr("fill", "#ffffff")
          .text(stage.label.split("(")[0]);

        stageBGroup
          .append("text")
          .attr("x", bLeft + wB / 2)
          .attr("y", stageY + 48)
          .attr("text-anchor", "middle")
          .attr("font-size", 17)
          .attr("font-weight", "900")
          .attr("fill", "#ffffff")
          .text(stage.countB.toLocaleString());

        stageBGroup
          .append("text")
          .attr("x", bLeft + wB / 2)
          .attr("y", stageY + 65)
          .attr("text-anchor", "middle")
          .attr("font-size", 9.5)
          .attr("font-weight", "700")
          .attr("fill", "#d1fae5")
          .text(`%${stage.rateB} Gösterim Oranı`);

        // Center Differential Badge
        const diffCount = stage.countB - stage.countA;
        const diffPct =
          stage.countA > 0 ? Number(((diffCount / stage.countA) * 100).toFixed(1)) : 0;

        const centerBadge = svg.append("g").attr("transform", `translate(${centerBridgeX}, ${stageY + stageH / 2})`);

        centerBadge
          .append("rect")
          .attr("x", -32)
          .attr("y", -13)
          .attr("width", 64)
          .attr("height", 26)
          .attr("rx", 13)
          .attr("fill", diffCount > 0 ? "#ecfdf5" : diffCount < 0 ? "#eef2ff" : "#f1f5f9")
          .attr("stroke", diffCount > 0 ? "#10b981" : diffCount < 0 ? "#6366f1" : "#cbd5e1")
          .attr("stroke-width", 1);

        centerBadge
          .append("text")
          .attr("text-anchor", "middle")
          .attr("y", 4)
          .attr("font-size", 10)
          .attr("font-weight", "900")
          .attr("fill", diffCount > 0 ? "#065f46" : diffCount < 0 ? "#3730a3" : "#475569")
          .text(`${diffCount > 0 ? "+" : ""}${diffCount}`);

        // Connecting Funnel Tapers (Draw between Stage 0->1 and Stage 1->2)
        if (idx < 2) {
          const nextIdx = idx + 1;
          const nextStageY = stageYPositions[nextIdx];
          const nextWA = scaleWidth(funnelStages[nextIdx].countA);
          const nextWB = scaleWidth(funnelStages[nextIdx].countB);
          const nextALeft = colAX + (colWidth - nextWA) / 2;
          const nextBLeft = colBX + (colWidth - nextWB) / 2;

          // Connecting path A
          const pathA = d3.path();
          pathA.moveTo(aLeft, stageY + stageH);
          pathA.lineTo(aLeft + wA, stageY + stageH);
          pathA.lineTo(nextALeft + nextWA, nextStageY);
          pathA.lineTo(nextALeft, nextStageY);
          pathA.closePath();

          svg
            .append("path")
            .attr("d", pathA.toString())
            .attr("fill", "#6366f1")
            .attr("opacity", 0.16);

          // Connecting path B
          const pathB = d3.path();
          pathB.moveTo(bLeft, stageY + stageH);
          pathB.lineTo(bLeft + wB, stageY + stageH);
          pathB.lineTo(nextBLeft + nextWB, nextStageY);
          pathB.lineTo(nextBLeft, nextStageY);
          pathB.closePath();

          svg
            .append("path")
            .attr("d", pathB.toString())
            .attr("fill", "#10b981")
            .attr("opacity", 0.16);
        }
      });
    }

    // ----------------------------------------------------
    // VIEW 2: FUNNEL STAGE EFFICIENCY BARS (D3)
    // ----------------------------------------------------
    else if (viewMode === "efficiency") {
      const margin = { top: 40, right: 90, bottom: 25, left: 160 };
      const contentWidth = width - margin.left - margin.right;
      const contentHeight = height - margin.top - margin.bottom;

      const metrics = [
        {
          label: "1. CTR (Tıklama Oranı)",
          valA: ctrA,
          valB: ctrB,
          unit: "%",
          leadNote: "CTA & Buton Çekiciliği"
        },
        {
          label: "2. Tıklamadan Talebe Dönüşüm",
          valA: clickToLeadA,
          valB: clickToLeadB,
          unit: "%",
          leadNote: "Form & Arama İkna Gücü"
        },
        {
          label: "3. Toplam Ziyaretçi Lead Oranı",
          valA: leadRateA,
          valB: leadRateB,
          unit: "%",
          leadNote: "Genel Funnel Verimliliği"
        }
      ];

      const y = d3
        .scaleBand()
        .domain(metrics.map((m) => m.label))
        .range([margin.top, height - margin.bottom])
        .padding(0.3);

      const maxPct = Math.max(d3.max(metrics, (m) => Math.max(m.valA, m.valB)) || 10, 15) * 1.15;
      const x = d3.scaleLinear().domain([0, maxPct]).range([margin.left, width - margin.right]);

      // Grid lines
      svg
        .append("g")
        .attr("class", "grid")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(
          d3
            .axisBottom(x)
            .ticks(5)
            .tickFormat((d) => `%${d}`)
            .tickSize(-contentHeight)
        )
        .call((g) => g.select(".domain").remove())
        .call((g) => g.selectAll(".tick line").attr("stroke", "#e2e8f0").attr("stroke-dasharray", "3,3"))
        .call((g) => g.selectAll(".tick text").attr("fill", "#64748b").attr("font-size", 10));

      // Draw bars for each metric
      metrics.forEach((m) => {
        const barY = y(m.label) || 0;
        const barH = y.bandwidth() / 2 - 3;

        // Bar A (Indigo)
        svg
          .append("rect")
          .attr("x", margin.left)
          .attr("y", barY)
          .attr("width", x(m.valA) - margin.left)
          .attr("height", barH)
          .attr("rx", 5)
          .attr("fill", "#6366f1")
          .attr("opacity", 0.9);

        svg
          .append("text")
          .attr("x", x(m.valA) + 8)
          .attr("y", barY + barH / 2 + 4)
          .attr("font-size", 11)
          .attr("font-weight", "800")
          .attr("fill", "#4338ca")
          .text(`%${m.valA.toFixed(1)}`);

        // Bar B (Emerald)
        svg
          .append("rect")
          .attr("x", margin.left)
          .attr("y", barY + barH + 5)
          .attr("width", x(m.valB) - margin.left)
          .attr("height", barH)
          .attr("rx", 5)
          .attr("fill", "#10b981")
          .attr("opacity", 0.95);

        svg
          .append("text")
          .attr("x", x(m.valB) + 8)
          .attr("y", barY + barH + 5 + barH / 2 + 4)
          .attr("font-size", 11)
          .attr("font-weight", "900")
          .attr("fill", "#065f46")
          .text(`%${m.valB.toFixed(1)} (${m.valB > m.valA ? "+" : ""}${(((m.valB - m.valA) / m.valA) * 100).toFixed(0)}%)`);

        // Metric Label Y-Axis
        svg
          .append("text")
          .attr("x", margin.left - 12)
          .attr("y", barY + y.bandwidth() / 2 - 2)
          .attr("text-anchor", "end")
          .attr("font-size", 11.5)
          .attr("font-weight", "700")
          .attr("fill", "#1e293b")
          .text(m.label);

        svg
          .append("text")
          .attr("x", margin.left - 12)
          .attr("y", barY + y.bandwidth() / 2 + 13)
          .attr("text-anchor", "end")
          .attr("font-size", 9.5)
          .attr("font-weight", "500")
          .attr("fill", "#64748b")
          .text(m.leadNote);
      });

      // Legend
      const legend = svg.append("g").attr("transform", `translate(${margin.left}, 16)`);
      legend.append("rect").attr("width", 12).attr("height", 12).attr("rx", 3).attr("fill", "#6366f1");
      legend.append("text").attr("x", 18).attr("y", 10).attr("font-size", 11).attr("font-weight", "700").attr("fill", "#334155").text("Varyasyon A (Kontrol)");

      legend.append("rect").attr("x", 170).attr("width", 12).attr("height", 12).attr("rx", 3).attr("fill", "#10b981");
      legend.append("text").attr("x", 188).attr("y", 10).attr("font-size", 11).attr("font-weight", "700").attr("fill", "#065f46").text("Varyasyon B (Challenger - Kazanan)");
    }

    // ----------------------------------------------------
    // VIEW 3: CUMULATIVE LEAD TREND TIME-SERIES (D3)
    // ----------------------------------------------------
    else if (viewMode === "trend") {
      const margin = { top: 40, right: 35, bottom: 35, left: 45 };
      const contentWidth = width - margin.left - margin.right;
      const contentHeight = height - margin.top - margin.bottom;

      const x = d3
        .scalePoint()
        .domain(history.map((h) => h.date))
        .range([margin.left, width - margin.right])
        .padding(0.3);

      const maxLeads = Math.max(d3.max(history, (h) => Math.max(h.cumLeadsA, h.cumLeadsB)) || 10, 15) * 1.15;
      const y = d3.scaleLinear().domain([0, maxLeads]).range([height - margin.bottom, margin.top]);

      // Grid
      svg
        .append("g")
        .attr("class", "grid")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickSize(-contentHeight))
        .call((g) => g.select(".domain").remove())
        .call((g) => g.selectAll(".tick line").attr("stroke", "#f1f5f9"))
        .call((g) => g.selectAll(".tick text").attr("fill", "#64748b").attr("font-size", 10.5).attr("font-weight", "600"));

      svg
        .append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(y).ticks(5).tickSize(-contentWidth))
        .call((g) => g.select(".domain").remove())
        .call((g) => g.selectAll(".tick line").attr("stroke", "#f1f5f9"))
        .call((g) => g.selectAll(".tick text").attr("fill", "#64748b").attr("font-size", 10));

      // Area under B
      const areaB = d3
        .area<any>()
        .x((d) => x(d.date) || 0)
        .y0(height - margin.bottom)
        .y1((d) => y(d.cumLeadsB))
        .curve(d3.curveMonotoneX);

      svg.append("path").datum(history).attr("fill", "#10b981").attr("opacity", 0.12).attr("d", areaB);

      // Line A
      const lineA = d3
        .line<any>()
        .x((d) => x(d.date) || 0)
        .y((d) => y(d.cumLeadsA))
        .curve(d3.curveMonotoneX);

      svg
        .append("path")
        .datum(history)
        .attr("fill", "none")
        .attr("stroke", "#6366f1")
        .attr("stroke-width", 2.5)
        .attr("stroke-dasharray", "4,4")
        .attr("d", lineA);

      // Line B (Winner Solid)
      const lineB = d3
        .line<any>()
        .x((d) => x(d.date) || 0)
        .y((d) => y(d.cumLeadsB))
        .curve(d3.curveMonotoneX);

      svg
        .append("path")
        .datum(history)
        .attr("fill", "none")
        .attr("stroke", "#10b981")
        .attr("stroke-width", 3)
        .attr("d", lineB);

      // Dots on points
      history.forEach((pt) => {
        const ptX = x(pt.date) || 0;

        // Dot A
        svg
          .append("circle")
          .attr("cx", ptX)
          .attr("cy", y(pt.cumLeadsA))
          .attr("r", 4.5)
          .attr("fill", "#6366f1")
          .attr("stroke", "#ffffff")
          .attr("stroke-width", 2);

        // Dot B
        svg
          .append("circle")
          .attr("cx", ptX)
          .attr("cy", y(pt.cumLeadsB))
          .attr("r", 5.5)
          .attr("fill", "#10b981")
          .attr("stroke", "#ffffff")
          .attr("stroke-width", 2)
          .style("cursor", "pointer")
          .on("mouseenter", (event) => {
            const [mx, my] = d3.pointer(event, containerRef.current);
            tooltip
              .html(`
                <div class="bg-slate-900 text-white p-2.5 rounded-xl text-xs border border-slate-700 shadow-xl">
                  <div class="font-bold text-amber-400 pb-1 border-b border-slate-700 mb-1">${pt.date} Kümülatif Lead</div>
                  <div class="text-emerald-400 font-bold">Varyasyon B: ${pt.cumLeadsB} Talep (+${pt.leadsB} günlük)</div>
                  <div class="text-indigo-300">Varyasyon A: ${pt.cumLeadsA} Talep (+${pt.leadsA} günlük)</div>
                </div>
              `)
              .style("visibility", "visible")
              .style("left", `${mx + 15}px`)
              .style("top", `${my - 20}px`);
          })
          .on("mousemove", (event) => {
            const [mx, my] = d3.pointer(event, containerRef.current);
            tooltip.style("left", `${mx + 15}px`).style("top", `${my - 20}px`);
          })
          .on("mouseleave", () => {
            tooltip.style("visibility", "hidden");
          });
      });

      // Legend
      const legend = svg.append("g").attr("transform", `translate(${margin.left}, 14)`);
      legend.append("line").attr("x1", 0).attr("y1", 6).attr("x2", 18).attr("y2", 6).attr("stroke", "#6366f1").attr("stroke-width", 2).attr("stroke-dasharray", "4,4");
      legend.append("text").attr("x", 24).attr("y", 10).attr("font-size", 11).attr("font-weight", "700").attr("fill", "#334155").text(`Varyasyon A Toplam (${leadsA} Lead)`);

      legend.append("line").attr("x1", 200).attr("y1", 6).attr("x2", 218).attr("y2", 6).attr("stroke", "#10b981").attr("stroke-width", 3);
      legend.append("text").attr("x", 224).attr("y", 10).attr("font-size", 11).attr("font-weight", "800").attr("fill", "#065f46").text(`Varyasyon B Toplam (${leadsB} Lead) - 🏆 Kazanan`);
    }

    // Clean-up tooltip on unmount
    return () => {
      if (containerRef.current) {
        d3.select(containerRef.current).selectAll(".d3-funnel-tooltip").remove();
      }
    };
  }, [viewMode, viewsA, viewsB, clicksA, clicksB, leadsA, leadsB, ctrA, ctrB, leadRateA, leadRateB, clickToLeadA, clickToLeadB, winnerVariant, history, funnelStages]);

  return (
    <div
      ref={containerRef}
      id="ab-test-conversion-funnel-widget"
      className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all duration-200 relative"
    >
      {/* Toast Notification */}
      {successToast && (
        <div className="absolute top-4 right-4 z-50 bg-emerald-900 text-emerald-100 text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl border border-emerald-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <Split className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              A/B Test Dönüşüm Hunisi Analizi
            </h2>
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200 uppercase tracking-wider">
              D3.js Interactive Funnel
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
              Trafik: %{analysis.experiment.trafficSplit} / %{100 - (analysis.experiment.trafficSplit || 50)}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Hero Varyasyon A (Kontrol) ve Varyasyon B (Challenger) arasındaki sayfa gösterimi, CTA tıklaması ve müşteri talebi (Lead) hunisinin D3.js ile karşılaştırmalı analizi.
          </p>
        </div>

        {/* View Mode Controls & Actions */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <div className="bg-slate-200/70 p-1 rounded-xl flex items-center gap-1 border border-slate-300/60">
            <button
              type="button"
              id="funnel-view-mode-dual-btn"
              onClick={() => setViewMode("funnel")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "funnel"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-purple-600" />
              <span>İkili Huni</span>
            </button>

            <button
              type="button"
              id="funnel-view-mode-efficiency-btn"
              onClick={() => setViewMode("efficiency")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "efficiency"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verimlilik Barları</span>
            </button>

            <button
              type="button"
              id="funnel-view-mode-trend-btn"
              onClick={() => setViewMode("trend")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "trend"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LineChart className="w-3.5 h-3.5 text-indigo-600" />
              <span>Zaman Serisi</span>
            </button>
          </div>

          <button
            type="button"
            id="funnel-export-json-btn"
            onClick={handleExportData}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            title="A/B Test Analiz Verilerini İndir (JSON)"
          >
            <Download className="w-4 h-4" />
          </button>

          {onNavigateTab && (
            <button
              type="button"
              id="funnel-navigate-ab-center-btn"
              onClick={() => onNavigateTab("ab-testing")}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>A/B Yönetim Merkezi</span>
            </button>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 🏆 PROMINENT WINNER HIGHLIGHT BANNER (BASED ON LEAD COUNT) */}
      {/* ======================================================== */}
      <div className="p-5 sm:p-6 bg-linear-to-r from-emerald-500/10 via-amber-500/10 to-teal-500/10 border-b border-emerald-100/80">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-black shadow-xs tracking-wide">
                <Trophy className="w-3.5 h-3.5 text-amber-300" />
                <span>KAZANAN VARYANT: VARYASYON {winnerVariant}</span>
              </span>

              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200">
                +{leadDifference} Müşteri Talebi Farkı (%{leadLiftPercent} Daha Fazla Lead)
              </span>

              <span className="text-xs font-bold text-slate-700 bg-white/80 px-2.5 py-1 rounded-full border border-slate-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>%{confidencePercent} Güven Seviyesi {isStatisticallySignificant ? "(Kesin Sonuç)" : "(Eğilim)"}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="bg-white/90 p-3 rounded-xl border border-slate-200 shadow-2xs text-xs">
                <span className="font-extrabold text-slate-500 block mb-0.5">Varyasyon A (Kontrol)</span>
                <div className="font-bold text-slate-800 truncate mb-1">"{variantA.title}"</div>
                <div className="flex items-center gap-3 text-slate-600 font-semibold text-[11px]">
                  <span>{viewsA} Gösterim</span>
                  <span>•</span>
                  <span>{clicksA} Tıklama (%{ctrA.toFixed(1)})</span>
                  <span>•</span>
                  <span className="font-bold text-slate-900">{leadsA} Lead (%{leadRateA.toFixed(1)})</span>
                </div>
              </div>

              <div className="bg-emerald-50/90 p-3 rounded-xl border border-emerald-300 shadow-2xs text-xs ring-1 ring-emerald-400/30">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-extrabold text-emerald-900">Varyasyon B (Challenger) — 🏆 Kazanan</span>
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-200/70 px-1.5 py-0.2 rounded">
                    Lead Lideri
                  </span>
                </div>
                <div className="font-bold text-emerald-950 truncate mb-1">"{variantB.title}"</div>
                <div className="flex items-center gap-3 text-emerald-900 font-semibold text-[11px]">
                  <span>{viewsB} Gösterim</span>
                  <span>•</span>
                  <span>{clicksB} Tıklama (%{ctrB.toFixed(1)})</span>
                  <span>•</span>
                  <span className="font-black text-emerald-800">{leadsB} Lead (%{leadRateB.toFixed(1)})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons for the Winning Variant */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
            <button
              type="button"
              id="apply-winner-to-hero-btn"
              onClick={() => handleApplyWinner(winnerVariant !== "tie" ? winnerVariant : "B")}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span>Kazananı Canlı Hero Yap</span>
            </button>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                id="simulate-lead-a-btn"
                onClick={() => handleSimulateLead("A")}
                className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 hover:bg-white text-slate-700 text-[11px] font-bold transition-colors cursor-pointer text-center"
                title="Varyasyon A'ya 1 test talebi ekle"
              >
                +1 Lead (A)
              </button>
              <button
                type="button"
                id="simulate-lead-b-btn"
                onClick={() => handleSimulateLead("B")}
                className="flex-1 px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-emerald-100/60 hover:bg-emerald-100 text-emerald-900 text-[11px] font-black transition-colors cursor-pointer text-center"
                title="Varyasyon B'ye 1 test talebi ekle"
              >
                +1 Lead (B)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 📊 D3.JS SVG VISUALIZATION CANVAS */}
      {/* ======================================================== */}
      <div className="p-4 sm:p-6">
        <div className="w-full flex justify-center overflow-x-auto">
          <svg
            ref={svgRef}
            id="d3-ab-conversion-funnel-svg"
            className="w-full max-w-4xl select-none"
          />
        </div>
      </div>

      {/* ======================================================== */}
      {/* 💡 STRATEGIC FINDINGS & TACTICAL TAKEAWAYS */}
      {/* ======================================================== */}
      <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
        {summaryInsights.map((insight, idx) => (
          <div
            key={idx}
            className="bg-white p-3.5 rounded-xl border border-slate-200/80 text-xs text-slate-700 leading-relaxed shadow-2xs"
          >
            <p className="font-medium">{insight}</p>
          </div>
        ))}
      </div>

      {/* Footer Navigation Bar */}
      <div className="px-6 py-3 bg-white border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-semibold text-slate-700">A/B Test Motoru Cloudflare Edge ile Aktif</span>
          <span>•</span>
          <span>Son 7 günlük veriler gösterilmektedir</span>
        </div>

        {onNavigateTab && (
          <button
            type="button"
            onClick={() => onNavigateTab("ab-testing")}
            className="text-purple-600 hover:text-purple-700 font-bold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Tüm A/B Test Raporları & Varyasyon Düzenleyici</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
