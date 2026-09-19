import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import { CompetitorKeywordRanking, CompetitorContentMetric } from "../../types";
import { 
  BarChart3, 
  Sparkles, 
  Trophy, 
  Layers, 
  TrendingUp, 
  Target, 
  CheckCircle2, 
  Info,
  Filter,
  ArrowRight
} from "lucide-react";
import { CompetitorColorPalette } from "../../utils/competitorColorTheme";

export type DistributionMode = "rankTier" | "searchIntent" | "gapStatus";

interface SelectedDataDistributionD3ChartProps {
  selectedRankings: CompetitorKeywordRanking[];
  allRankings: CompetitorKeywordRanking[];
  userName: string;
  competitors: CompetitorContentMetric[];
  colorPalette?: CompetitorColorPalette;
  onSelectAll?: () => void;
  onClearSelection?: () => void;
  className?: string;
}

export const SelectedDataDistributionD3Chart: React.FC<SelectedDataDistributionD3ChartProps> = ({
  selectedRankings,
  allRankings,
  userName,
  competitors,
  colorPalette,
  onSelectAll,
  onClearSelection,
  className = ""
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const [distributionMode, setDistributionMode] = useState<DistributionMode>("rankTier");
  const [activeEntityFilter, setActiveEntityFilter] = useState<string>("all");

  const comp1 = competitors[0] || { name: "1. Rakip", domain: "rakip1.com", rank: 1 };
  const comp2 = competitors[1] || { name: "2. Rakip", domain: "rakip2.com", rank: 2 };
  const comp3 = competitors[2] || { name: "3. Rakip", domain: "rakip3.com", rank: 3 };

  // If user has selected items via checkbox, use selectedRankings; otherwise fallback to all displayed rankings
  const isSelectionActive = selectedRankings.length > 0;
  const activeData = isSelectionActive ? selectedRankings : allRankings;

  // Key KPI calculations for selected data
  const summaryKpis = useMemo(() => {
    if (activeData.length === 0) {
      return { totalKeywords: 0, totalVolume: 0, avgUserRank: 0, avgComp1Rank: 0, leadingCount: 0, top3Count: 0 };
    }

    let volSum = 0;
    let userRankSum = 0;
    let userRankCount = 0;
    let comp1RankSum = 0;
    let comp1RankCount = 0;
    let leading = 0;
    let top3 = 0;

    activeData.forEach((item) => {
      const volNum = parseFloat(item.monthlyVolume.replace(/[^0-9.]/g, "") || "0") * 
        (item.monthlyVolume.includes("K") ? 1000 : 1);
      volSum += isNaN(volNum) ? 0 : volNum;

      if (item.userRank !== null && item.userRank !== undefined) {
        userRankSum += item.userRank;
        userRankCount++;
        if (item.userRank <= 3) top3++;
      }

      if (item.comp1Rank !== null && item.comp1Rank !== undefined) {
        comp1RankSum += item.comp1Rank;
        comp1RankCount++;
      }

      const bestComp = Math.min(
        item.comp1Rank ?? 999,
        item.comp2Rank ?? 999,
        item.comp3Rank ?? 999
      );
      if (item.userRank !== null && item.userRank !== undefined && item.userRank <= bestComp) {
        leading++;
      }
    });

    return {
      totalKeywords: activeData.length,
      totalVolume: volSum,
      avgUserRank: userRankCount > 0 ? (userRankSum / userRankCount).toFixed(1) : "-",
      avgComp1Rank: comp1RankCount > 0 ? (comp1RankSum / comp1RankCount).toFixed(1) : "-",
      leadingCount: leading,
      top3Count: top3
    };
  }, [activeData]);

  // Entities for Rank Tier Comparison
  const entities = useMemo(() => {
    const userColor = colorPalette?.user || "#f59e0b";
    const c1Color = colorPalette?.comp1 || "#f43f5e";
    const c2Color = colorPalette?.comp2 || "#0ea5e9";
    const c3Color = colorPalette?.comp3 || "#10b981";
    return [
      { key: "user", label: `Siteniz (${userName})`, shortName: "Siteniz", color: userColor, badgeClass: "bg-amber-400 text-slate-950 border-amber-300" },
      { key: "comp1", label: `1. Rakip (${comp1.name.split(" ")[0]})`, shortName: comp1.name.split(" ")[0], color: c1Color, badgeClass: "bg-rose-500 text-white border-rose-400" },
      { key: "comp2", label: `2. Rakip (${comp2.name.split(" ")[0]})`, shortName: comp2.name.split(" ")[0], color: c2Color, badgeClass: "bg-sky-500 text-white border-sky-400" },
      { key: "comp3", label: `3. Rakip (${comp3.name.split(" ")[0]})`, shortName: comp3.name.split(" ")[0], color: c3Color, badgeClass: "bg-emerald-500 text-white border-emerald-400" }
    ];
  }, [userName, comp1.name, comp2.name, comp3.name, colorPalette]);

  // Render D3 chart when activeData, mode, or window size changes
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || activeData.length === 0) return;

    const container = containerRef.current;
    const svg = d3.select(svgRef.current);
    const tooltip = d3.select(tooltipRef.current);
    svg.selectAll("*").remove();

    const width = container.clientWidth || 760;
    const height = 340;
    const margin = { top: 35, right: 30, bottom: 55, left: 60 };
    const innerWidth = Math.max(100, width - margin.left - margin.right);
    const innerHeight = Math.max(100, height - margin.top - margin.bottom);

    svg.attr("width", width).attr("height", height).attr("viewBox", `0 0 ${width} ${height}`);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // ==========================================
    // 1. MODE: SERP RANK TIER DISTRIBUTION
    // ==========================================
    if (distributionMode === "rankTier") {
      const tiers = [
        { id: "top3", label: "Top 3 (#1 - #3)", desc: "En yüksek tıklama alan lider pozisyonlar" },
        { id: "page1", label: "İlk Sayfa (#4 - #10)", desc: "Google 1. sayfa organik sonuçları" },
        { id: "page2", label: "2. Sayfa (#11 - #20)", desc: "1. sayfaya sıçrama fırsatı olan kelimeler" },
        { id: "unranked", label: "Sıralama Dışı (>#20)", desc: "İlk 20'de listelenmeyen kelimeler" }
      ];

      const calculateTierCount = (rank: number | null | undefined, tierId: string) => {
        if (tierId === "top3") return rank !== null && rank !== undefined && rank >= 1 && rank <= 3;
        if (tierId === "page1") return rank !== null && rank !== undefined && rank >= 4 && rank <= 10;
        if (tierId === "page2") return rank !== null && rank !== undefined && rank >= 11 && rank <= 20;
        if (tierId === "unranked") return rank === null || rank === undefined || rank > 20;
        return false;
      };

      const tierData = tiers.map((tier) => {
        const counts: Record<string, number> = {
          user: activeData.filter((d) => calculateTierCount(d.userRank, tier.id)).length,
          comp1: activeData.filter((d) => calculateTierCount(d.comp1Rank, tier.id)).length,
          comp2: activeData.filter((d) => calculateTierCount(d.comp2Rank, tier.id)).length,
          comp3: activeData.filter((d) => calculateTierCount(d.comp3Rank, tier.id)).length
        };
        return { tier, counts };
      });

      const x0Scale = d3.scaleBand()
        .domain(tiers.map((t) => t.label))
        .range([0, innerWidth])
        .paddingInner(0.24)
        .paddingOuter(0.1);

      const activeEntities = activeEntityFilter === "all" 
        ? entities 
        : entities.filter((e) => e.key === activeEntityFilter);

      const x1Scale = d3.scaleBand()
        .domain(activeEntities.map((e) => e.key))
        .range([0, x0Scale.bandwidth()])
        .padding(0.12);

      let maxCount = 1;
      tierData.forEach((d) => {
        activeEntities.forEach((e) => {
          const val = d.counts[e.key] || 0;
          if (val > maxCount) maxCount = val;
        });
      });

      const yScale = d3.scaleLinear()
        .domain([0, maxCount + (maxCount < 5 ? 1 : 2)])
        .nice()
        .range([innerHeight, 0]);

      // Grid Lines
      g.append("g")
        .attr("class", "grid")
        .call(
          d3.axisLeft(yScale)
            .ticks(5)
            .tickSize(-innerWidth)
            .tickFormat(() => "")
        )
        .selectAll("line")
        .attr("stroke", "#334155")
        .attr("stroke-opacity", 0.3)
        .attr("stroke-dasharray", "3,3");

      // X Axis
      const xAxis = g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x0Scale));

      xAxis.selectAll("text")
        .attr("fill", "#cbd5e1")
        .attr("font-size", "11px")
        .attr("font-weight", "700")
        .attr("dy", "1.2em");

      xAxis.select(".domain").attr("stroke", "#475569");

      // Y Axis
      const yAxis = g.append("g")
        .call(d3.axisLeft(yScale).ticks(Math.min(5, maxCount)).tickFormat(d3.format("d")));

      yAxis.selectAll("text")
        .attr("fill", "#94a3b8")
        .attr("font-size", "10px")
        .attr("font-weight", "600");

      yAxis.select(".domain").attr("stroke", "#475569");

      // Render Grouped Bars
      tierData.forEach((d) => {
        const groupG = g.append("g").attr("transform", `translate(${x0Scale(d.tier.label)},0)`);

        activeEntities.forEach((entity) => {
          const val = d.counts[entity.key] || 0;
          const barX = x1Scale(entity.key) || 0;
          const barY = yScale(val);
          const barHeight = Math.max(0, innerHeight - barY);
          const barWidth = x1Scale.bandwidth();

          // Bar Rectangle
          groupG.append("rect")
            .attr("x", barX)
            .attr("y", barY)
            .attr("width", barWidth)
            .attr("height", barHeight)
            .attr("fill", entity.color)
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("opacity", 0.9)
            .attr("cursor", "pointer")
            .on("mouseenter", (event) => {
              d3.select(event.currentTarget).attr("opacity", 1).attr("stroke", "#ffffff").attr("stroke-width", 1.5);
              const percent = activeData.length > 0 ? Math.round((val / activeData.length) * 100) : 0;
              tooltip
                .style("opacity", "1")
                .html(`
                  <div class="font-bold text-xs text-white border-b border-slate-700 pb-1 mb-1.5 flex items-center justify-between gap-2">
                    <span style="color:${entity.color}">${entity.label}</span>
                    <span class="font-mono text-amber-300 font-bold">${val} Kelime</span>
                  </div>
                  <div class="text-[11px] text-slate-300 space-y-1">
                    <div>Kademe: <strong class="text-white">${d.tier.label}</strong></div>
                    <div>Seçili Veri Oranı: <strong class="text-amber-400">${percent}%</strong> (${val}/${activeData.length})</div>
                    <div class="text-slate-400 text-[10px] italic">${d.tier.desc}</div>
                  </div>
                `)
                .style("left", `${event.pageX + 12}px`)
                .style("top", `${event.pageY - 35}px`);
            })
            .on("mousemove", (event) => {
              tooltip
                .style("left", `${event.pageX + 12}px`)
                .style("top", `${event.pageY - 35}px`);
            })
            .on("mouseleave", (event) => {
              d3.select(event.currentTarget).attr("opacity", 0.9).attr("stroke", "none");
              tooltip.style("opacity", "0");
            });

          // Value on top of bar
          if (val > 0) {
            groupG.append("text")
              .attr("x", barX + barWidth / 2)
              .attr("y", barY - 5)
              .attr("text-anchor", "middle")
              .attr("fill", "#f8fafc")
              .attr("font-size", "10px")
              .attr("font-weight", "800")
              .text(val);
          }
        });
      });
    }

    // ==========================================
    // 2. MODE: SEARCH INTENT DISTRIBUTION
    // ==========================================
    else if (distributionMode === "searchIntent") {
      const intentMap: Record<string, { count: number; volumeSum: number; color: string }> = {
        "Acil / Yerel": { count: 0, volumeSum: 0, color: "#f43f5e" },
        "Ticari": { count: 0, volumeSum: 0, color: "#6366f1" },
        "İşlemsel": { count: 0, volumeSum: 0, color: "#10b981" },
        "Bilgilendirici": { count: 0, volumeSum: 0, color: "#0ea5e9" },
        "Diğer": { count: 0, volumeSum: 0, color: "#94a3b8" }
      };

      activeData.forEach((d) => {
        const intent = d.searchIntent || "Diğer";
        const key = intentMap[intent] ? intent : "Diğer";
        const volNum = parseFloat(d.monthlyVolume.replace(/[^0-9.]/g, "") || "0") * 
          (d.monthlyVolume.includes("K") ? 1000 : 1);
        intentMap[key].count++;
        intentMap[key].volumeSum += isNaN(volNum) ? 0 : volNum;
      });

      const intentData = Object.entries(intentMap)
        .map(([intent, stats]) => ({ intent, ...stats }))
        .filter((d) => d.count > 0);

      const xScale = d3.scaleBand()
        .domain(intentData.map((d) => d.intent))
        .range([0, innerWidth])
        .padding(0.3);

      const maxCount = Math.max(1, d3.max(intentData, (d) => d.count) || 1);
      const yScale = d3.scaleLinear()
        .domain([0, maxCount + 1])
        .nice()
        .range([innerHeight, 0]);

      // Grid
      g.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(yScale).ticks(5).tickSize(-innerWidth).tickFormat(() => ""))
        .selectAll("line")
        .attr("stroke", "#334155")
        .attr("stroke-opacity", 0.3)
        .attr("stroke-dasharray", "3,3");

      // X Axis
      const xAxis = g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale));

      xAxis.selectAll("text")
        .attr("fill", "#cbd5e1")
        .attr("font-size", "11px")
        .attr("font-weight", "700")
        .attr("dy", "1.2em");

      // Y Axis
      g.append("g")
        .call(d3.axisLeft(yScale).ticks(Math.min(5, maxCount)).tickFormat(d3.format("d")))
        .selectAll("text")
        .attr("fill", "#94a3b8")
        .attr("font-size", "10px")
        .attr("font-weight", "600");

      // Bars
      intentData.forEach((d) => {
        const barX = xScale(d.intent) || 0;
        const barY = yScale(d.count);
        const barHeight = innerHeight - barY;
        const barWidth = xScale.bandwidth();

        g.append("rect")
          .attr("x", barX)
          .attr("y", barY)
          .attr("width", barWidth)
          .attr("height", barHeight)
          .attr("fill", d.color)
          .attr("rx", 6)
          .attr("ry", 6)
          .attr("opacity", 0.9)
          .attr("cursor", "pointer")
          .on("mouseenter", (event) => {
            d3.select(event.currentTarget).attr("opacity", 1).attr("stroke", "#ffffff").attr("stroke-width", 1.5);
            const percent = activeData.length > 0 ? Math.round((d.count / activeData.length) * 100) : 0;
            tooltip
              .style("opacity", "1")
              .html(`
                <div class="font-bold text-xs text-white border-b border-slate-700 pb-1 mb-1.5 flex items-center justify-between gap-2">
                  <span style="color:${d.color}">${d.intent} Arama Niyeti</span>
                  <span class="font-mono text-amber-300 font-bold">${d.count} Kelime</span>
                </div>
                <div class="text-[11px] text-slate-300 space-y-1">
                  <div>Seçili Kelimelerdeki Payı: <strong class="text-white">${percent}%</strong></div>
                  <div>Toplam Aylık Arama Hacmi: <strong class="text-emerald-400 font-mono">${d.volumeSum.toLocaleString()} arama/ay</strong></div>
                </div>
              `)
              .style("left", `${event.pageX + 12}px`)
              .style("top", `${event.pageY - 35}px`);
          })
          .on("mousemove", (event) => {
            tooltip.style("left", `${event.pageX + 12}px`).style("top", `${event.pageY - 35}px`);
          })
          .on("mouseleave", (event) => {
            d3.select(event.currentTarget).attr("opacity", 0.9).attr("stroke", "none");
            tooltip.style("opacity", "0");
          });

        // Value text
        g.append("text")
          .attr("x", barX + barWidth / 2)
          .attr("y", barY - 7)
          .attr("text-anchor", "middle")
          .attr("fill", "#f8fafc")
          .attr("font-size", "11px")
          .attr("font-weight", "800")
          .text(`${d.count} (${d.volumeSum > 1000 ? `${(d.volumeSum / 1000).toFixed(1)}k` : d.volumeSum})`);
      });
    }

    // ==========================================
    // 3. MODE: COMPETITIVE GAP / STATUS DISTRIBUTION
    // ==========================================
    else if (distributionMode === "gapStatus") {
      const gapCategories = [
        { id: "leader", label: "Lider (#1)", color: "#10b981", desc: "Rakiplerin önünde lider pozisyonda olduğunuz kelimeler" },
        { id: "top3", label: "İlk 3'te", color: "#f59e0b", desc: "1-3. sırada rekabetçi konumda olduğunuz kelimeler" },
        { id: "close", label: "Yakın Takip (1-3 Sıra Geride)", color: "#0ea5e9", desc: "Küçük bir SEO iyileştirmesiyle geçilebilecek rakipler" },
        { id: "opportunity", label: "Fırsat (4+ Sıra Geride)", color: "#f43f5e", desc: "Kapsamlı içerik ve sayfa hızı gerektiren anahtar kelimeler" }
      ];

      const gapData = gapCategories.map((cat) => {
        let count = 0;
        let volumeTotal = 0;

        activeData.forEach((item) => {
          const compRanks = [item.comp1Rank, item.comp2Rank, item.comp3Rank].filter((r): r is number => r !== null);
          const bestComp = compRanks.length > 0 ? Math.min(...compRanks) : 1;
          const uRank = item.userRank;
          const volNum = parseFloat(item.monthlyVolume.replace(/[^0-9.]/g, "") || "0") * 
            (item.monthlyVolume.includes("K") ? 1000 : 1);

          let matches = false;
          if (cat.id === "leader") {
            matches = uRank !== null && uRank !== undefined && uRank <= bestComp;
          } else if (cat.id === "top3") {
            matches = uRank !== null && uRank !== undefined && uRank <= 3 && uRank > bestComp;
          } else if (cat.id === "close") {
            matches = uRank !== null && uRank !== undefined && (uRank - bestComp) >= 1 && (uRank - bestComp) <= 3;
          } else if (cat.id === "opportunity") {
            matches = uRank === null || uRank === undefined || (uRank - bestComp) >= 4;
          }

          if (matches) {
            count++;
            volumeTotal += isNaN(volNum) ? 0 : volNum;
          }
        });

        return { ...cat, count, volumeTotal };
      });

      const xScale = d3.scaleBand()
        .domain(gapData.map((d) => d.label))
        .range([0, innerWidth])
        .padding(0.28);

      const maxCount = Math.max(1, d3.max(gapData, (d) => d.count) || 1);
      const yScale = d3.scaleLinear()
        .domain([0, maxCount + 1])
        .nice()
        .range([innerHeight, 0]);

      // Grid
      g.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(yScale).ticks(5).tickSize(-innerWidth).tickFormat(() => ""))
        .selectAll("line")
        .attr("stroke", "#334155")
        .attr("stroke-opacity", 0.3)
        .attr("stroke-dasharray", "3,3");

      // X Axis
      const xAxis = g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale));

      xAxis.selectAll("text")
        .attr("fill", "#cbd5e1")
        .attr("font-size", "10px")
        .attr("font-weight", "700")
        .attr("dy", "1.2em");

      // Y Axis
      g.append("g")
        .call(d3.axisLeft(yScale).ticks(Math.min(5, maxCount)).tickFormat(d3.format("d")))
        .selectAll("text")
        .attr("fill", "#94a3b8")
        .attr("font-size", "10px")
        .attr("font-weight", "600");

      // Bars
      gapData.forEach((d) => {
        const barX = xScale(d.label) || 0;
        const barY = yScale(d.count);
        const barHeight = innerHeight - barY;
        const barWidth = xScale.bandwidth();

        g.append("rect")
          .attr("x", barX)
          .attr("y", barY)
          .attr("width", barWidth)
          .attr("height", barHeight)
          .attr("fill", d.color)
          .attr("rx", 6)
          .attr("ry", 6)
          .attr("opacity", 0.9)
          .attr("cursor", "pointer")
          .on("mouseenter", (event) => {
            d3.select(event.currentTarget).attr("opacity", 1).attr("stroke", "#ffffff").attr("stroke-width", 1.5);
            const percent = activeData.length > 0 ? Math.round((d.count / activeData.length) * 100) : 0;
            tooltip
              .style("opacity", "1")
              .html(`
                <div class="font-bold text-xs text-white border-b border-slate-700 pb-1 mb-1.5 flex items-center justify-between gap-2">
                  <span style="color:${d.color}">${d.label}</span>
                  <span class="font-mono text-amber-300 font-bold">${d.count} Kelime</span>
                </div>
                <div class="text-[11px] text-slate-300 space-y-1">
                  <div>Seçili Kelimelerdeki Payı: <strong class="text-white">${percent}%</strong> (${d.count}/${activeData.length})</div>
                  <div>Potansiyel Hacim: <strong class="text-emerald-400 font-mono">${d.volumeTotal.toLocaleString()} / ay</strong></div>
                  <div class="text-slate-400 text-[10px] italic">${d.desc}</div>
                </div>
              `)
              .style("left", `${event.pageX + 12}px`)
              .style("top", `${event.pageY - 35}px`);
          })
          .on("mousemove", (event) => {
            tooltip.style("left", `${event.pageX + 12}px`).style("top", `${event.pageY - 35}px`);
          })
          .on("mouseleave", (event) => {
            d3.select(event.currentTarget).attr("opacity", 0.9).attr("stroke", "none");
            tooltip.style("opacity", "0");
          });

        // Value text
        g.append("text")
          .attr("x", barX + barWidth / 2)
          .attr("y", barY - 7)
          .attr("text-anchor", "middle")
          .attr("fill", "#f8fafc")
          .attr("font-size", "11px")
          .attr("font-weight", "800")
          .text(`${d.count}`);
      });
    }

  }, [activeData, distributionMode, activeEntityFilter, entities]);

  // Window resize observer to guarantee fluidity
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver(() => {
      // Re-trigger by forcing lightweight state or letting standard react render cycle pick it up
      setDistributionMode((prev) => prev);
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div 
      id="seo-selected-data-distribution-summary" 
      data-testid="selected-data-distribution-summary"
      className={`bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl text-slate-100 space-y-5 relative overflow-hidden ${className}`}
    >
      {/* Background glow accents */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* 1. Header Bar with Selection Status & Action Triggers */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>D3.js Dağılım Grafiği</span>
            </span>

            {isSelectionActive ? (
              <span 
                id="badge-selected-distribution-active" 
                data-testid="badge-selected-count"
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-600/30 text-indigo-300 text-xs font-bold border border-indigo-500/40 animate-pulse"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>{selectedRankings.length} Seçili Veri İnceleniyor</span>
              </span>
            ) : (
              <span 
                id="badge-selected-distribution-all"
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700"
              >
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span>Tüm Tablo ({allRankings.length} Kelime)</span>
              </span>
            )}
          </div>

          <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <span>Seçilen Verilerin Dağılım Özeti</span>
          </h3>
          <p className="text-xs text-slate-400">
            Tabloda seçtiğiniz anahtar kelimelerin SERP sıralama kademeleri, arama niyetleri ve lider rakiplere karşı dağılımı.
          </p>
        </div>

        {/* View Mode Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-2xl border border-slate-800 self-start md:self-auto flex-wrap">
          <button
            type="button"
            id="tab-dist-rank-tier"
            data-testid="tab-dist-rank-tier"
            onClick={() => setDistributionMode("rankTier")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              distributionMode === "rankTier"
                ? "bg-amber-500 text-slate-950 shadow-md font-black"
                : "text-slate-300 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Sıralama Kademesi</span>
          </button>

          <button
            type="button"
            id="tab-dist-intent"
            data-testid="tab-dist-intent"
            onClick={() => setDistributionMode("searchIntent")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              distributionMode === "searchIntent"
                ? "bg-indigo-600 text-white shadow-md font-black"
                : "text-slate-300 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Arama Niyeti</span>
          </button>

          <button
            type="button"
            id="tab-dist-gap"
            data-testid="tab-dist-gap"
            onClick={() => setDistributionMode("gapStatus")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              distributionMode === "gapStatus"
                ? "bg-emerald-600 text-white shadow-md font-black"
                : "text-slate-300 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Rekabet / Gap</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
          <div className="text-[11px] font-bold text-slate-400">İncelenen Kelime</div>
          <div className="text-lg font-black text-amber-400 font-mono">
            {summaryKpis.totalKeywords} <span className="text-xs font-normal text-slate-400">kelime</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
          <div className="text-[11px] font-bold text-slate-400">Toplam Arama Hacmi</div>
          <div className="text-lg font-black text-emerald-400 font-mono">
            {summaryKpis.totalVolume.toLocaleString()} <span className="text-xs font-normal text-slate-400">/ ay</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
          <div className="text-[11px] font-bold text-slate-400">Ortalama Siteniz Sırası</div>
          <div className="text-lg font-black text-indigo-400 font-mono">
            {summaryKpis.avgUserRank !== "-" ? `#${summaryKpis.avgUserRank}` : "-"}
            <span className="text-[10px] text-slate-400 ml-1">
              (1. Rakip: #{summaryKpis.avgComp1Rank})
            </span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
          <div className="text-[11px] font-bold text-slate-400">Lider / İlk 3 Pozisyon</div>
          <div className="text-lg font-black text-amber-300 font-mono">
            {summaryKpis.leadingCount} Lider <span className="text-xs text-slate-400 font-normal">({summaryKpis.top3Count} İlk 3)</span>
          </div>
        </div>
      </div>

      {/* 3. Entity Filter Buttons (Only in Rank Tier Mode) */}
      {distributionMode === "rankTier" && (
        <div className="flex items-center justify-between gap-2 flex-wrap text-xs pt-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
              <Filter className="w-3 h-3 text-slate-400" />
              <span>Görüntülenen Taraf:</span>
            </span>
            <button
              type="button"
              id="filter-entity-all"
              onClick={() => setActiveEntityFilter("all")}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeEntityFilter === "all"
                  ? "bg-slate-700 text-white border border-slate-600 shadow-xs"
                  : "bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              Tüm Rakipler (Kıyaslama)
            </button>
            {entities.map((e) => (
              <button
                key={e.key}
                type="button"
                id={`filter-entity-${e.key}`}
                onClick={() => setActiveEntityFilter(e.key)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeEntityFilter === e.key
                    ? `${e.badgeClass} shadow-xs font-black`
                    : "bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color }} />
                <span>{e.shortName}</span>
              </button>
            ))}
          </div>

          <div className="text-[11px] text-slate-400 font-medium">
            İpucu: Detaylar için sütunların üzerine gelin
          </div>
        </div>
      )}

      {/* 4. D3 Chart Container with SVG & Hover Tooltip */}
      <div 
        ref={containerRef} 
        id="d3-selected-distribution-container"
        data-testid="d3-distribution-chart-canvas"
        className="w-full relative min-h-[340px] bg-slate-950/60 rounded-2xl border border-slate-800 p-2 overflow-hidden flex items-center justify-center"
      >
        <svg ref={svgRef} className="w-full overflow-visible" />

        {/* Interactive Floating Tooltip */}
        <div
          ref={tooltipRef}
          id="d3-distribution-tooltip"
          data-testid="d3-distribution-tooltip"
          className="pointer-events-none fixed z-50 rounded-2xl bg-slate-950/95 border border-slate-700 p-3 shadow-2xl text-slate-200 max-w-xs transition-opacity duration-150 backdrop-blur-md opacity-0"
        />
      </div>

      {/* 5. Chart Legend & Helper Note */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
        <div className="flex items-center gap-3 flex-wrap font-medium">
          {distributionMode === "rankTier" ? (
            entities.map((e) => (
              <div key={e.key} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: e.color }} />
                <span className="text-slate-300 font-bold">{e.label}</span>
              </div>
            ))
          ) : distributionMode === "searchIntent" ? (
            <>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Acil / Yerel</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Ticari</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> İşlemsel</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> Bilgilendirici</span>
            </>
          ) : (
            <>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Lider (#1)</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> İlk 3'te</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> Yakın Takip (1-3 Sıra)</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Fırsat (4+ Sıra)</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isSelectionActive && onClearSelection && (
            <button
              type="button"
              id="btn-clear-chart-selection"
              onClick={onClearSelection}
              className="text-slate-400 hover:text-white font-bold underline cursor-pointer"
            >
              Seçimleri Temizle
            </button>
          )}
          {!isSelectionActive && onSelectAll && (
            <button
              type="button"
              id="btn-select-all-for-chart"
              onClick={onSelectAll}
              className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer flex items-center gap-1"
            >
              <span>Tablodaki Tümünü Seç</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
