import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { FunnelStageWithDropOff, JourneyDropOffPoint } from "../../types";
import {
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  DollarSign,
  Users,
  Sparkles,
  Info,
  ExternalLink,
  ChevronRight,
  RotateCcw
} from "lucide-react";

interface CustomerJourneyDropOffChartProps {
  stages: FunnelStageWithDropOff[];
  commonDropOffPoints: JourneyDropOffPoint[];
  onSelectDropOffPoint?: (point: JourneyDropOffPoint) => void;
  onNavigateTab?: (tab: string) => void;
}

export const CustomerJourneyDropOffChart: React.FC<CustomerJourneyDropOffChartProps> = ({
  stages,
  commonDropOffPoints,
  onSelectDropOffPoint,
  onNavigateTab
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedStageKey, setSelectedStageKey] = useState<string | null>(null);
  const [metricMode, setMetricMode] = useState<"visitors" | "dropoff_rate" | "lost_revenue">("visitors");
  const [hoveredData, setHoveredData] = useState<{
    stage: FunnelStageWithDropOff;
    x: number;
    y: number;
    isDropOffLeak?: boolean;
  } | null>(null);

  // Main D3 Rendering
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = Math.max(container.clientWidth || 980, 840);
    const height = 480;
    const margin = { top: 50, right: 40, bottom: 60, left: 40 };

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg
      .attr("width", "100%")
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("style", "max-width: 100%; height: auto; font-family: inherit;");

    const defs = svg.append("defs");

    // Drop Shadow Filter
    const filter = defs
      .append("filter")
      .attr("id", "funnel-glow")
      .attr("x", "-20%")
      .attr("y", "-20%")
      .attr("width", "140%")
      .attr("height", "140%");
    filter.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "blur");
    filter.append("feComposite").attr("in", "SourceGraphic").attr("in2", "blur").attr("operator", "over");

    // Red Gradient for Drop-off Leaks
    const leakGrad = defs
      .append("linearGradient")
      .attr("id", "dropoff-leak-grad")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
    leakGrad.append("stop").attr("offset", "0%").attr("stop-color", "#f43f5e").attr("stop-opacity", 0.75);
    leakGrad.append("stop").attr("offset", "100%").attr("stop-color", "#fda4af").attr("stop-opacity", 0.2);

    const usableWidth = width - margin.left - margin.right;
    const numStages = stages.length;
    const stageWidth = Math.min(136, (usableWidth - (numStages - 1) * 36) / numStages);
    const gap = (usableWidth - numStages * stageWidth) / (numStages - 1);

    const initialVisitors = stages[0]?.visitors || 2480;
    const maxBarHeight = 220;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Draw Connectors between stages (Waterfalls / Funnel Bands)
    stages.forEach((stage, i) => {
      if (i >= stages.length - 1) return;
      const nextStage = stages[i + 1];

      const x0 = i * (stageWidth + gap) + stageWidth;
      const x1 = (i + 1) * (stageWidth + gap);

      const h0 = (stage.visitors / initialVisitors) * maxBarHeight;
      const h1 = (nextStage.visitors / initialVisitors) * maxBarHeight;

      const y0Top = (maxBarHeight - h0) / 2;
      const y0Bottom = y0Top + h0;
      const y1Top = (maxBarHeight - h1) / 2;
      const y1Bottom = y1Top + h1;

      // Retention flow path
      const connectorPath = `
        M ${x0} ${y0Top}
        C ${x0 + gap * 0.5} ${y0Top}, ${x1 - gap * 0.5} ${y1Top}, ${x1} ${y1Top}
        L ${x1} ${y1Bottom}
        C ${x1 - gap * 0.5} ${y1Bottom}, ${x0 + gap * 0.5} ${y0Bottom}, ${x0} ${y0Bottom}
        Z
      `;

      // Flow band gradient
      const flowGradId = `flow-grad-${i}`;
      const flowGrad = defs
        .append("linearGradient")
        .attr("id", flowGradId)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%");
      flowGrad.append("stop").attr("offset", "0%").attr("stop-color", stage.color).attr("stop-opacity", 0.35);
      flowGrad.append("stop").attr("offset", "100%").attr("stop-color", nextStage.color).attr("stop-opacity", 0.45);

      g.append("path")
        .attr("d", connectorPath)
        .attr("fill", `url(#${flowGradId})`)
        .attr("stroke", "none");

      // Draw Drop-off Leakage Branch (Ayrılan Ziyaretçi Kolu)
      if (stage.dropOffCount > 0) {
        const leakX0 = x0 + gap * 0.38;
        const leakY0 = y0Bottom;
        const leakX1 = leakX0;
        const leakY1 = maxBarHeight + 90;

        // Curved fall-off path
        const leakPathData = `
          M ${x0} ${y0Bottom}
          Q ${leakX0} ${y0Bottom + 35}, ${leakX1} ${leakY1}
        `;

        const leakStrokeWidth = Math.max(3, (stage.dropOffCount / initialVisitors) * 38);

        const leakG = g.append("g").attr("class", "dropoff-leak-branch").style("cursor", "pointer");

        leakG
          .append("path")
          .attr("d", leakPathData)
          .attr("fill", "none")
          .attr("stroke", "#f43f5e")
          .attr("stroke-width", leakStrokeWidth)
          .attr("stroke-dasharray", "6,4")
          .attr("stroke-linecap", "round")
          .attr("opacity", 0.85);

        // Leak Exit Pill
        const pillW = 88;
        const pillH = 24;
        const pillX = leakX1 - pillW / 2;
        const pillY = leakY1;

        const pillG = leakG.append("g").attr("transform", `translate(${pillX}, ${pillY})`);

        pillG
          .append("rect")
          .attr("width", pillW)
          .attr("height", pillH)
          .attr("rx", 12)
          .attr("fill", "#fff1f2")
          .attr("stroke", "#f43f5e")
          .attr("stroke-width", 1.5)
          .attr("filter", "url(#funnel-glow)");

        pillG
          .append("text")
          .attr("x", pillW / 2)
          .attr("y", 15)
          .attr("text-anchor", "middle")
          .attr("font-size", "10px")
          .attr("font-weight", "800")
          .attr("fill", "#e11d48")
          .text(`-${stage.dropOffCount} Terk (%${stage.dropOffRate})`);

        // Leak interactions
        leakG
          .on("mouseenter", function (event) {
            d3.select(this).select("path").attr("stroke-width", leakStrokeWidth + 3);
            const [mx, my] = d3.pointer(event, container);
            setHoveredData({
              stage,
              x: mx,
              y: my,
              isDropOffLeak: true
            });
          })
          .on("mousemove", function (event) {
            const [mx, my] = d3.pointer(event, container);
            setHoveredData((prev) => (prev ? { ...prev, x: mx, y: my } : null));
          })
          .on("mouseleave", function () {
            d3.select(this).select("path").attr("stroke-width", leakStrokeWidth);
            setHoveredData(null);
          })
          .on("click", function () {
            setSelectedStageKey(stage.stageKey);
            const matchingPoint = commonDropOffPoints.find((p) => p.stage === stage.stageKey);
            if (matchingPoint && onSelectDropOffPoint) {
              onSelectDropOffPoint(matchingPoint);
            }
          });
      }
    });

    // Draw Main Stage Pillars
    stages.forEach((stage, i) => {
      const x = i * (stageWidth + gap);
      const h = (stage.visitors / initialVisitors) * maxBarHeight;
      const y = (maxBarHeight - h) / 2;

      const isSelected = selectedStageKey === stage.stageKey;

      const stageG = g
        .append("g")
        .attr("class", `funnel-stage-${stage.stageKey}`)
        .attr("transform", `translate(${x}, 0)`)
        .style("cursor", "pointer");

      // Stage Header Label
      stageG
        .append("text")
        .attr("x", stageWidth / 2)
        .attr("y", -24)
        .attr("text-anchor", "middle")
        .attr("font-size", "11px")
        .attr("font-weight", "700")
        .attr("fill", "#1e293b")
        .text(`Adım ${stage.stageOrder}`);

      stageG
        .append("text")
        .attr("x", stageWidth / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .attr("font-size", "10px")
        .attr("font-weight", "600")
        .attr("fill", "#64748b")
        .text(stage.stageName.split(". ")[1] || stage.stageName);

      // Background Track
      stageG
        .append("rect")
        .attr("y", 0)
        .attr("width", stageWidth)
        .attr("height", maxBarHeight)
        .attr("rx", 10)
        .attr("fill", "#f8fafc")
        .attr("stroke", "#e2e8f0")
        .attr("stroke-width", 1);

      // Filled Stage Retention Bar
      const barRect = stageG
        .append("rect")
        .attr("y", y)
        .attr("width", stageWidth)
        .attr("height", h)
        .attr("rx", 8)
        .attr("fill", stage.color)
        .attr("opacity", isSelected ? 1 : 0.9)
        .attr("stroke", isSelected ? "#0f172a" : "none")
        .attr("stroke-width", isSelected ? 2.5 : 0)
        .style("transition", "all 0.25s ease");

      // Main Metric Text inside Bar
      stageG
        .append("text")
        .attr("x", stageWidth / 2)
        .attr("y", y + h / 2 - 4)
        .attr("text-anchor", "middle")
        .attr("font-size", "13px")
        .attr("font-weight", "800")
        .attr("fill", "#ffffff")
        .text(
          metricMode === "visitors"
            ? `${stage.visitors.toLocaleString("tr-TR")}`
            : metricMode === "dropoff_rate"
            ? `%${stage.retentionRate.toFixed(1)} Koruma`
            : stage.lostRevenueEstimate > 0
            ? `₺${(stage.lostRevenueEstimate / 1000).toFixed(0)}k Kayıp`
            : "Hedef Lead"
        );

      stageG
        .append("text")
        .attr("x", stageWidth / 2)
        .attr("y", y + h / 2 + 12)
        .attr("text-anchor", "middle")
        .attr("font-size", "10px")
        .attr("font-weight", "600")
        .attr("fill", "#ffffff")
        .attr("opacity", 0.9)
        .text(`%${stage.retentionRate.toFixed(1)} Ziyaretçi`);

      // Bottom Status Indicator
      const statusY = maxBarHeight + 16;
      if (stage.dropOffRate > 0) {
        stageG
          .append("text")
          .attr("x", stageWidth / 2)
          .attr("y", statusY)
          .attr("text-anchor", "middle")
          .attr("font-size", "9.5px")
          .attr("font-weight", "700")
          .attr("fill", stage.dropOffRate >= 35 ? "#dc2626" : "#d97706")
          .text(`🚨 %${stage.dropOffRate} Terk`);
      } else {
        stageG
          .append("text")
          .attr("x", stageWidth / 2)
          .attr("y", statusY)
          .attr("text-anchor", "middle")
          .attr("font-size", "9.5px")
          .attr("font-weight", "700")
          .attr("fill", "#059669")
          .text("✅ %22.5 Nihai Lead");
      }

      // Pillar Hover Interactions
      stageG
        .on("mouseenter", function (event) {
          barRect.attr("opacity", 1).attr("stroke", "#0f172a").attr("stroke-width", 2);
          const [mx, my] = d3.pointer(event, container);
          setHoveredData({
            stage,
            x: mx,
            y: my,
            isDropOffLeak: false
          });
        })
        .on("mousemove", function (event) {
          const [mx, my] = d3.pointer(event, container);
          setHoveredData((prev) => (prev ? { ...prev, x: mx, y: my } : null));
        })
        .on("mouseleave", function () {
          barRect
            .attr("opacity", isSelected ? 1 : 0.9)
            .attr("stroke", isSelected ? "#0f172a" : "none")
            .attr("stroke-width", isSelected ? 2.5 : 0);
          setHoveredData(null);
        })
        .on("click", function () {
          setSelectedStageKey(stage.stageKey);
          const matchingPoint = commonDropOffPoints.find((p) => p.stage === stage.stageKey);
          if (matchingPoint && onSelectDropOffPoint) {
            onSelectDropOffPoint(matchingPoint);
          }
        });
    });
  }, [stages, metricMode, selectedStageKey, commonDropOffPoints, onSelectDropOffPoint]);

  // Selected Stage Diagnostics
  const activeStage = stages.find((s) => s.stageKey === selectedStageKey) || stages[1]; // Default to landing dropoff
  const matchingDropOffPoint = commonDropOffPoints.find((p) => p.stage === activeStage.stageKey);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Top Header & Metric View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-200">
              <TrendingDown className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-slate-900">
              D3.js Funnel &amp; Terk (Drop-off) Şelale Görselleştirici
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
              5 Aşamalı Kayıp Akışı
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Siteye ilk girişten lead dönüşümüne kadar her aşamadaki ziyaretçi koruma ve terk oranlarını canlı inceleyin.
          </p>
        </div>

        {/* View Metric Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setMetricMode("visitors")}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              metricMode === "visitors"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Ziyaretçi Sayısı
          </button>
          <button
            type="button"
            onClick={() => setMetricMode("dropoff_rate")}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              metricMode === "dropoff_rate"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Koruma &amp; Terk %
          </button>
          <button
            type="button"
            onClick={() => setMetricMode("lost_revenue")}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              metricMode === "lost_revenue"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            ₺ Kayıp Gelir
          </button>
        </div>
      </div>

      {/* D3 Canvas Container */}
      <div ref={containerRef} className="relative w-full p-4 bg-slate-50/50">
        <svg ref={svgRef} className="w-full" />

        {/* Rich Interactive D3 Tooltip */}
        {hoveredData && (
          <div
            className="pointer-events-none absolute z-50 transform -translate-x-1/2 -translate-y-full mb-3 w-72 bg-slate-900/95 text-white p-3.5 rounded-xl shadow-xl border border-slate-700 backdrop-blur-xs text-xs"
            style={{
              left: Math.min(Math.max(hoveredData.x, 150), (containerRef.current?.clientWidth || 800) - 150),
              top: hoveredData.y - 12
            }}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold text-white flex items-center gap-1.5">
                {hoveredData.isDropOffLeak ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span className="text-rose-300">Terk Kolu (Kayıp Noktası)</span>
                  </>
                ) : (
                  <>
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: hoveredData.stage.color }}
                    />
                    <span>{hoveredData.stage.stageName}</span>
                  </>
                )}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                Adım {hoveredData.stage.stageOrder} / 5
              </span>
            </div>

            <div className="mt-2 space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Bu Aşamaya Ulaşan:</span>
                <span className="font-semibold text-white">
                  {hoveredData.stage.visitors.toLocaleString("tr-TR")} kişi (%{hoveredData.stage.retentionRate} genel)
                </span>
              </div>

              {hoveredData.stage.dropOffCount > 0 && (
                <>
                  <div className="flex justify-between text-rose-300">
                    <span>Ayrılan Ziyaretçi (Terk):</span>
                    <span className="font-bold">
                      {hoveredData.stage.dropOffCount} kişi (%{hoveredData.stage.dropOffRate})
                    </span>
                  </div>
                  <div className="flex justify-between text-amber-300">
                    <span>Tahmini Kayıp Ciro:</span>
                    <span className="font-bold">
                      ₺{hoveredData.stage.lostRevenueEstimate.toLocaleString("tr-TR")}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="mt-2.5 pt-2 border-t border-slate-800 text-[10px] text-slate-300 leading-relaxed">
              <span className="font-bold text-slate-200">🔍 Temel Sürtünme Sebebi: </span>
              {hoveredData.stage.primaryDropOffReason}
            </div>

            <div className="mt-2 text-[10px] text-emerald-300 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>{hoveredData.stage.topDropOffAction}</span>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Detail Box for Selected Stage */}
      <div className="p-4 bg-white border-t border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-indigo-50/40 border border-slate-200">
          <div className="flex items-start gap-3">
            <div
              className="p-2.5 rounded-xl text-white font-bold text-sm shadow-xs flex-shrink-0"
              style={{ backgroundColor: activeStage.color }}
            >
              {activeStage.stageOrder}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900">{activeStage.stageName}</h4>
                {activeStage.dropOffRate > 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                    % {activeStage.dropOffRate} Terk Oranı
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Tamamlanan Dönüşüm
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                <strong>Neden Ayrılıyorlar:</strong> {activeStage.primaryDropOffReason}
              </p>
              <p className="text-xs text-indigo-700 font-semibold mt-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Çözüm: {activeStage.topDropOffAction}</span>
              </p>
            </div>
          </div>

          {/* Quick Action Button for Remediation */}
          {matchingDropOffPoint?.quickActionTab && onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab(matchingDropOffPoint.quickActionTab!)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs cursor-pointer flex-shrink-0"
            >
              <span>{matchingDropOffPoint.quickActionLabel || "Bu Terk Noktasını İyileştir"}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
