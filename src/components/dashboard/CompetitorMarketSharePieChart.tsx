import React, { useState, useMemo, useRef, useEffect } from "react";
import * as d3 from "d3";
import { CompetitorKeywordRanking, CompetitorContentMetric } from "../../types";
import {
  PieChart,
  Target,
  Trophy,
  TrendingUp,
  Award,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Sparkles,
  Filter,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  FileDown,
  FileText,
  Layers,
  BarChart3,
  Check,
  Globe,
  Gauge,
  Palette,
  X,
  LayoutGrid,
  Table as TableIcon
} from "lucide-react";
import { CompetitorColorPalette } from "../../utils/competitorColorTheme";

export type MarketShareMetricType = "marketShare" | "traffic" | "top3" | "top10" | "visibilityScore";

export interface CompetitorMarketMetricProfile {
  id: string;
  key: "user" | "comp1" | "comp2" | "comp3";
  name: string;
  domain: string;
  color: string;
  strokeColor: string;
  badgeBg: string;
  isUser: boolean;
  marketSharePercent: number;
  estimatedOrganicTraffic: number;
  rank1Count: number;
  top3Count: number;
  top10Count: number;
  unrankedCount: number;
  avgRank: number;
  visibilityScore: number;
  speedScore: number;
  domainAuthority: number;
  strengths: string[];
  vulnerabilities: string[];
  competitiveStatus: string;
  standingRank: number;
}

export interface CompetitorMarketSharePieChartProps {
  rankings: CompetitorKeywordRanking[];
  filteredRankings?: CompetitorKeywordRanking[];
  competitors: CompetitorContentMetric[];
  userName?: string;
  userDomain?: string;
  colorPalette?: CompetitorColorPalette;
  onOpenColorThemeSelector?: () => void;
  onSelectCompetitorFilter?: (competitorFilter: "all" | "comp1" | "comp2" | "comp3" | "leading" | "outranked") => void;
  onExportMarketSharePdf?: () => void;
  onOpenReportBuilder?: () => void;
  onExportExcel?: () => void;
  onClose?: () => void;
  className?: string;
}

export const CompetitorMarketSharePieChart: React.FC<CompetitorMarketSharePieChartProps> = ({
  rankings,
  filteredRankings,
  competitors,
  userName = "Siteniz",
  userDomain = "sitemiz.com.tr",
  colorPalette,
  onOpenColorThemeSelector,
  onSelectCompetitorFilter,
  onExportMarketSharePdf,
  onOpenReportBuilder,
  onExportExcel,
  onClose,
  className = ""
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(440);
  const [activeMetric, setActiveMetric] = useState<MarketShareMetricType>("marketShare");
  const [chartStyle, setChartStyle] = useState<"donut" | "pie">("donut");
  const [selectedEntityKey, setSelectedEntityKey] = useState<string | null>(null);
  const [hoveredEntityKey, setHoveredEntityKey] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [dataScope, setDataScope] = useState<"all" | "filtered">("all");
  const [comparisonView, setComparisonView] = useState<"cards" | "matrix">("cards");

  const hasFilteredDiff = Boolean(
    filteredRankings && filteredRankings.length > 0 && filteredRankings.length !== rankings.length
  );

  const effectiveKeywords = useMemo(() => {
    if (dataScope === "filtered" && filteredRankings && filteredRankings.length > 0) {
      return filteredRankings;
    }
    return rankings;
  }, [dataScope, filteredRankings, rankings]);

  // ResizeObserver for responsive chart rendering
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0] && entries[0].contentRect.width > 200) {
        setContainerWidth(entries[0].contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // 1. Competitor Data Profiles & Dynamic Metric Aggregation
  const competitorProfiles = useMemo<CompetitorMarketMetricProfile[]>(() => {
    const comp1 = competitors[0] || {
      name: "1. Rakip",
      domain: "rakip1.com",
      visibilityScore: 92,
      speedScore: 78,
      keyStrengths: ["1500+ kelimelik rehberler", "Yüksek DA"]
    };
    const comp2 = competitors[1] || {
      name: "2. Rakip",
      domain: "rakip2.com",
      visibilityScore: 84,
      speedScore: 82,
      keyStrengths: ["Geniş anahtar kelime havuzu", "Backlink ağı"]
    };
    const comp3 = competitors[2] || {
      name: "3. Rakip",
      domain: "rakip3.com",
      visibilityScore: 76,
      speedScore: 74,
      keyStrengths: ["Sosyal sinyaller", "Hızlı yanıt süresi"]
    };

    // Parse volume helper
    const parseVolume = (volStr: string): number => {
      const num = parseFloat(volStr.replace(/[^0-9.]/g, "") || "0");
      return volStr.toLowerCase().includes("k") ? num * 1000 : num;
    };

    // Google CTR curve by rank
    const getCtr = (rank: number | null): number => {
      if (rank === null || rank <= 0) return 0;
      if (rank === 1) return 0.285;
      if (rank === 2) return 0.155;
      if (rank === 3) return 0.110;
      if (rank === 4) return 0.078;
      if (rank === 5) return 0.055;
      if (rank >= 6 && rank <= 10) return 0.028;
      if (rank >= 11 && rank <= 20) return 0.008;
      return 0.002;
    };

    let userTraffic = 0;
    let comp1Traffic = 0;
    let comp2Traffic = 0;
    let comp3Traffic = 0;

    let userR1 = 0;
    let userTop3 = 0;
    let userTop10 = 0;
    let userUnranked = 0;
    let userRankSum = 0;
    let userRankedCount = 0;

    let c1R1 = 0;
    let c1Top3 = 0;
    let c1Top10 = 0;
    let c1Unranked = 0;
    let c1RankSum = 0;
    let c1RankedCount = 0;

    let c2R1 = 0;
    let c2Top3 = 0;
    let c2Top10 = 0;
    let c2Unranked = 0;
    let c2RankSum = 0;
    let c2RankedCount = 0;

    let c3R1 = 0;
    let c3Top3 = 0;
    let c3Top10 = 0;
    let c3Unranked = 0;
    let c3RankSum = 0;
    let c3RankedCount = 0;

    effectiveKeywords.forEach((r) => {
      const vol = parseVolume(r.monthlyVolume);

      // User
      if (r.userRank !== null && r.userRank > 0) {
        userRankSum += r.userRank;
        userRankedCount++;
        userTraffic += vol * getCtr(r.userRank);
        if (r.userRank === 1) userR1++;
        if (r.userRank <= 3) userTop3++;
        if (r.userRank <= 10) userTop10++;
      } else {
        userUnranked++;
      }

      // Comp 1
      if (r.comp1Rank !== null && r.comp1Rank > 0) {
        c1RankSum += r.comp1Rank;
        c1RankedCount++;
        comp1Traffic += vol * getCtr(r.comp1Rank);
        if (r.comp1Rank === 1) c1R1++;
        if (r.comp1Rank <= 3) c1Top3++;
        if (r.comp1Rank <= 10) c1Top10++;
      } else {
        c1Unranked++;
      }

      // Comp 2
      if (r.comp2Rank !== null && r.comp2Rank > 0) {
        c2RankSum += r.comp2Rank;
        c2RankedCount++;
        comp2Traffic += vol * getCtr(r.comp2Rank);
        if (r.comp2Rank === 1) c2R1++;
        if (r.comp2Rank <= 3) c2Top3++;
        if (r.comp2Rank <= 10) c2Top10++;
      } else {
        c2Unranked++;
      }

      // Comp 3
      if (r.comp3Rank !== null && r.comp3Rank > 0) {
        c3RankSum += r.comp3Rank;
        c3RankedCount++;
        comp3Traffic += vol * getCtr(r.comp3Rank);
        if (r.comp3Rank === 1) c3R1++;
        if (r.comp3Rank <= 3) c3Top3++;
        if (r.comp3Rank <= 10) c3Top10++;
      } else {
        c3Unranked++;
      }
    });

    // Ensure baseline non-zero values for visual comparison
    userTraffic = Math.max(Math.round(userTraffic), 120);
    comp1Traffic = Math.max(Math.round(comp1Traffic), 240);
    comp2Traffic = Math.max(Math.round(comp2Traffic), 180);
    comp3Traffic = Math.max(Math.round(comp3Traffic), 110);

    const totalTraffic = userTraffic + comp1Traffic + comp2Traffic + comp3Traffic;

    const userShare = Math.round((userTraffic / totalTraffic) * 1000) / 10;
    const c1Share = Math.round((comp1Traffic / totalTraffic) * 1000) / 10;
    const c2Share = Math.round((comp2Traffic / totalTraffic) * 1000) / 10;
    const c3Share = Math.round((100 - userShare - c1Share - c2Share) * 10) / 10;

    const userColor = colorPalette?.user || "#6366f1";
    const c1Color = colorPalette?.comp1 || "#f59e0b";
    const c2Color = colorPalette?.comp2 || "#0ea5e9";
    const c3Color = colorPalette?.comp3 || "#10b981";

    const rawList: CompetitorMarketMetricProfile[] = [
      {
        id: "user-profile",
        key: "user",
        name: userName,
        domain: userDomain,
        color: userColor,
        strokeColor: userColor,
        badgeBg: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
        isUser: true,
        marketSharePercent: userShare,
        estimatedOrganicTraffic: userTraffic,
        rank1Count: userR1,
        top3Count: userTop3,
        top10Count: userTop10,
        unrankedCount: userUnranked,
        avgRank: userRankedCount > 0 ? Math.round((userRankSum / userRankedCount) * 10) / 10 : 12.4,
        visibilityScore: Math.min(Math.round(userTop3 * 14 + userTop10 * 4 + 40), 98),
        speedScore: 94,
        domainAuthority: 58,
        strengths: ["Yüksek Edge CDN Hızı (94/100)", "Bölgesel Lokalizasyon", "Dönüşüm Odaklı CTA"],
        vulnerabilities: ["İçerik derinliği rakiplerden düşük", "Backlink profili geliştirilmeli"],
        competitiveStatus: userShare >= 30 ? "Pazar Lideri" : "Hızlı Yükselen Takipçi",
        standingRank: 1
      },
      {
        id: "comp1-profile",
        key: "comp1",
        name: comp1.name,
        domain: comp1.domain || "rakip1.com",
        color: c1Color,
        strokeColor: c1Color,
        badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/40",
        isUser: false,
        marketSharePercent: c1Share,
        estimatedOrganicTraffic: comp1Traffic,
        rank1Count: c1R1,
        top3Count: c1Top3,
        top10Count: c1Top10,
        unrankedCount: c1Unranked,
        avgRank: c1RankedCount > 0 ? Math.round((c1RankSum / c1RankedCount) * 10) / 10 : 3.8,
        visibilityScore: comp1.visibilityScore || 92,
        speedScore: comp1.speedScore || 78,
        domainAuthority: 74,
        strengths: comp1.keyStrengths || ["1500+ kelimelik rehberler", "Yüksek DA Backlink"],
        vulnerabilities: ["Mobil sayfa hızı 78/100 (yavaş)", "Şema işaretlemesi eksik"],
        competitiveStatus: c1Share >= 35 ? "Yerel Pazar Hakimi" : "Güçlü Baş Rakip",
        standingRank: 2
      },
      {
        id: "comp2-profile",
        key: "comp2",
        name: comp2.name,
        domain: comp2.domain || "rakip2.com",
        color: c2Color,
        strokeColor: c2Color,
        badgeBg: "bg-sky-500/20 text-sky-300 border-sky-500/40",
        isUser: false,
        marketSharePercent: c2Share,
        estimatedOrganicTraffic: comp2Traffic,
        rank1Count: c2R1,
        top3Count: c2Top3,
        top10Count: c2Top10,
        unrankedCount: c2Unranked,
        avgRank: c2RankedCount > 0 ? Math.round((c2RankSum / c2RankedCount) * 10) / 10 : 5.4,
        visibilityScore: comp2.visibilityScore || 84,
        speedScore: comp2.speedScore || 82,
        domainAuthority: 66,
        strengths: comp2.keyStrengths || ["Geniş anahtar kelime havuzu", "Google Ads destekli"],
        vulnerabilities: ["Fiyat ve maliyet sayfaları güncel değil", "Zayıf teknik SEO"],
        competitiveStatus: "İkinci Sıra Rakip",
        standingRank: 3
      },
      {
        id: "comp3-profile",
        key: "comp3",
        name: comp3.name,
        domain: comp3.domain || "rakip3.com",
        color: c3Color,
        strokeColor: c3Color,
        badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
        isUser: false,
        marketSharePercent: Math.max(c3Share, 5.0),
        estimatedOrganicTraffic: comp3Traffic,
        rank1Count: c3R1,
        top3Count: c3Top3,
        top10Count: c3Top10,
        unrankedCount: c3Unranked,
        avgRank: c3RankedCount > 0 ? Math.round((c3RankSum / c3RankedCount) * 10) / 10 : 7.2,
        visibilityScore: comp3.visibilityScore || 76,
        speedScore: comp3.speedScore || 74,
        domainAuthority: 60,
        strengths: comp3.keyStrengths || ["Bölgesel şubeler", "Sosyal sinyaller"],
        vulnerabilities: ["Blog içerikleri 1 yılı aşkın süredir güncellenmemiş"],
        competitiveStatus: "Bölgesel Oyuncu",
        standingRank: 4
      }
    ];

    // Determine ranking standings based on market share
    const sorted = [...rawList].sort((a, b) => b.marketSharePercent - a.marketSharePercent);
    sorted.forEach((item, idx) => {
      item.standingRank = idx + 1;
    });

    return rawList;
  }, [effectiveKeywords, competitors, userName, userDomain]);

  // Active highlighted profile
  const activeProfile = useMemo(() => {
    if (hoveredEntityKey) {
      return competitorProfiles.find((c) => c.key === hoveredEntityKey) || competitorProfiles[0];
    }
    if (selectedEntityKey) {
      return competitorProfiles.find((c) => c.key === selectedEntityKey) || competitorProfiles[0];
    }
    // Default to user profile
    return competitorProfiles.find((c) => c.isUser) || competitorProfiles[0];
  }, [hoveredEntityKey, selectedEntityKey, competitorProfiles]);

  // Metric value getter for dynamic pie slices
  const getSliceValue = (profile: CompetitorMarketMetricProfile): number => {
    switch (activeMetric) {
      case "marketShare":
        return profile.marketSharePercent;
      case "traffic":
        return profile.estimatedOrganicTraffic;
      case "top3":
        return Math.max(profile.top3Count, 1);
      case "top10":
        return Math.max(profile.top10Count, 1);
      case "visibilityScore":
        return profile.visibilityScore;
      default:
        return profile.marketSharePercent;
    }
  };

  const getMetricLabel = (profile: CompetitorMarketMetricProfile): string => {
    switch (activeMetric) {
      case "marketShare":
        return `%${profile.marketSharePercent.toFixed(1)}`;
      case "traffic":
        return `${profile.estimatedOrganicTraffic.toLocaleString("tr-TR")} Ziyaret`;
      case "top3":
        return `${profile.top3Count} Kelime`;
      case "top10":
        return `${profile.top10Count} Kelime`;
      case "visibilityScore":
        return `${profile.visibilityScore} Puan`;
    }
  };

  // 2. D3 Pie / Donut Rendering
  useEffect(() => {
    if (!svgRef.current || competitorProfiles.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const chartWidth = Math.max(containerWidth > 768 ? Math.min(containerWidth * 0.42, 380) : Math.min(containerWidth - 32, 360), 280);
    const chartHeight = 310;
    const radius = Math.min(chartWidth, chartHeight) / 2 - 18;
    const innerRadius = chartStyle === "donut" ? radius * 0.58 : 0;

    svg
      .attr("width", chartWidth)
      .attr("height", chartHeight)
      .attr("viewBox", `0 0 ${chartWidth} ${chartHeight}`);

    // Drop shadow filter
    const defs = svg.append("defs");
    const filter = defs
      .append("filter")
      .attr("id", "pie-slice-glow")
      .attr("x", "-20%")
      .attr("y", "-20%")
      .attr("width", "140%")
      .attr("height", "140%");
    filter.append("feGaussianBlur").attr("stdDeviation", "4").attr("result", "blur");
    filter.append("feComposite").attr("in", "SourceGraphic").attr("in2", "blur").attr("operator", "over");

    const g = svg
      .append("g")
      .attr("transform", `translate(${chartWidth / 2}, ${chartHeight / 2})`);

    // D3 Pie Generator
    const pie = d3
      .pie<CompetitorMarketMetricProfile>()
      .value((d) => getSliceValue(d))
      .sort(null)
      .padAngle(chartStyle === "donut" ? 0.035 : 0.015);

    // D3 Arc Generator
    const arc = d3
      .arc<d3.PieArcDatum<CompetitorMarketMetricProfile>>()
      .innerRadius(innerRadius)
      .outerRadius(radius)
      .cornerRadius(chartStyle === "donut" ? 8 : 4);

    const hoverArc = d3
      .arc<d3.PieArcDatum<CompetitorMarketMetricProfile>>()
      .innerRadius(innerRadius > 0 ? innerRadius - 4 : 0)
      .outerRadius(radius + 8)
      .cornerRadius(chartStyle === "donut" ? 10 : 6);

    const arcs = g
      .selectAll(".slice")
      .data(pie(competitorProfiles))
      .enter()
      .append("g")
      .attr("class", "slice")
      .style("cursor", "pointer")
      .on("mouseenter", (_, d) => {
        setHoveredEntityKey(d.data.key);
      })
      .on("mouseleave", () => {
        setHoveredEntityKey(null);
      })
      .on("click", (_, d) => {
        setSelectedEntityKey((prev) => (prev === d.data.key ? null : d.data.key));
      });

    // Native browser tooltip
    arcs.append("title").text((d) => `${d.data.name} (${d.data.domain}) - ${getMetricLabel(d.data)} | Pazar Payı: %${d.data.marketSharePercent.toFixed(1)}`);

    // Draw Slices
    arcs
      .append("path")
      .attr("d", (d) => {
        const isTarget =
          (hoveredEntityKey && d.data.key === hoveredEntityKey) ||
          (selectedEntityKey && d.data.key === selectedEntityKey);
        return isTarget ? hoverArc(d) : arc(d);
      })
      .attr("fill", (d) => d.data.color)
      .attr("stroke", (d) => (d.data.isUser ? "#4338ca" : "#0f172a"))
      .attr("stroke-width", (d) => (d.data.isUser ? 2.5 : 1.5))
      .attr("filter", (d) => {
        const isTarget =
          (hoveredEntityKey && d.data.key === hoveredEntityKey) ||
          (selectedEntityKey && d.data.key === selectedEntityKey);
        return isTarget ? "url(#pie-slice-glow)" : "none";
      })
      .style("transition", "all 0.25s ease-out")
      .style("opacity", (d) => {
        if (!selectedEntityKey && !hoveredEntityKey) return 1;
        const isTarget =
          d.data.key === hoveredEntityKey || d.data.key === selectedEntityKey;
        return isTarget ? 1 : 0.45;
      });

    // Percentage Labels on Slices (for Pie mode or wide Donut slices)
    arcs
      .append("text")
      .attr("transform", (d) => {
        const centroid = arc.centroid(d);
        return `translate(${centroid[0]}, ${centroid[1]})`;
      })
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .style("font-size", "11px")
      .style("font-weight", "800")
      .style("fill", "#ffffff")
      .style("pointer-events", "none")
      .style("text-shadow", "0 1px 3px rgba(0,0,0,0.8)")
      .text((d) => {
        const share = d.data.marketSharePercent;
        return share >= 9 ? `%${Math.round(share)}` : "";
      });

  }, [competitorProfiles, activeMetric, chartStyle, containerWidth, hoveredEntityKey, selectedEntityKey]);

  return (
    <div
      id="seo-competitor-market-share-pie-chart-module"
      data-testid="seo-competitor-market-share-pie-chart-module"
      className={`p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/80 border border-slate-800 text-white shadow-2xl space-y-6 relative overflow-hidden transition-all ${className}`}
    >
      {/* Ambient background glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* 1. Header & Controls Bar */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
              <PieChart className="w-3.5 h-3.5 text-indigo-400" />
              <span>Pazar Payı Pasta Grafiği</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Tüm Rakipler Kıyaslaması</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {effectiveKeywords.length} Kelimelik Organik Havuz
            </span>

            {/* Scope toggle between full table keywords and filtered rows */}
            {hasFilteredDiff && (
              <div className="inline-flex items-center p-0.5 bg-slate-900 rounded-xl border border-slate-700 ml-1">
                <button
                  type="button"
                  id="btn-pie-scope-all"
                  onClick={() => setDataScope("all")}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    dataScope === "all"
                      ? "bg-amber-400 text-slate-950 shadow-xs"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="Tüm tablodaki anahtar kelimelere göre pazar payını hesapla"
                >
                  Tüm Tablo ({rankings.length})
                </button>
                <button
                  type="button"
                  id="btn-pie-scope-filtered"
                  onClick={() => setDataScope("filtered")}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    dataScope === "filtered"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="Şu an tabloda filtrelenmiş anahtar kelimelere göre pazar payını hesapla"
                >
                  Filtrelenen ({filteredRankings?.length})
                </button>
              </div>
            )}
          </div>

          <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2 tracking-tight">
            <Target className="w-5 h-5 text-amber-400" />
            <span>Pazar Payı Dağılımı ve Rakip Metrikleri Kıyaslaması</span>
          </h3>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Sitenizin ve bölgenizdeki en güçlü 3 rakibin Google organik arama trafiği, 
            SERP liderliği (#1-#3 sıra) ve görünürlük puanı üzerinden hesaplanan gerçek zamanlı pazar payı dağılımı.
          </p>
        </div>

        {/* Action Buttons & Style Toggles */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {/* Chart Style Toggle: Donut vs Filled Pie */}
          <div className="flex items-center p-1 bg-slate-900/90 rounded-2xl border border-slate-700 shadow-inner">
            <button
              type="button"
              id="btn-pie-style-donut"
              onClick={() => setChartStyle("donut")}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                chartStyle === "donut"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Halka Grafiği (Donut Chart) Görünümü"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Halka</span>
            </button>
            <button
              type="button"
              id="btn-pie-style-pie"
              onClick={() => setChartStyle("pie")}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                chartStyle === "pie"
                  ? "bg-amber-500 text-slate-950 font-black shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Dolu Pasta Grafiği (Pie Chart) Görünümü"
            >
              <PieChart className="w-3.5 h-3.5" />
              <span>Pasta</span>
            </button>
          </div>

          {/* Quick PDF Report Download Button */}
          {onExportMarketSharePdf && (
            <button
              type="button"
              id="btn-pie-module-export-pdf"
              data-testid="pie-module-export-pdf-btn"
              onClick={onExportMarketSharePdf}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-700 to-indigo-700 hover:from-rose-600 hover:to-indigo-600 text-white text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-rose-950/40 border border-rose-400/50 active:scale-95 group"
              title="Tüm rakip verilerini, pazar payı pasta grafiği analizlerini ve stratejik notları içeren marka logolu profesyonel raporu tek tıkla PDF olarak indirin"
            >
              <FileDown className="w-3.5 h-3.5 text-amber-300 group-hover:translate-y-0.5 transition-transform" />
              <span>Pazar Payı ve Rekabet Raporu</span>
              <span className="px-1.5 py-0.5 rounded-md bg-rose-950/80 text-rose-300 text-[10px] font-black border border-rose-400/40 flex items-center gap-1">
                <Award className="w-2.5 h-2.5 text-amber-400" />
                <span>Tek Tık PDF</span>
              </span>
            </button>
          )}

          {/* Professional Report Builder Modal Button */}
          {onOpenReportBuilder && (
            <button
              type="button"
              id="btn-pie-module-open-report-builder"
              data-testid="pie-module-open-report-builder-btn"
              onClick={onOpenReportBuilder}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs border border-indigo-400/40 active:scale-95"
              title="Marka logolu ve özel notlu kapsamlı PDF raporu oluşturma aracını açın"
            >
              <FileText className="w-3.5 h-3.5 text-amber-300" />
              <span>Özel Rapor Oluşturucu</span>
              <span className="px-1.5 py-0.2 rounded bg-indigo-950 text-amber-300 text-[10px] font-bold">
                Logo & Notlar
              </span>
            </button>
          )}

          {/* Quick Excel Download Button */}
          {onExportExcel && (
            <button
              type="button"
              id="btn-pie-module-export-excel"
              data-testid="pie-module-export-excel-btn"
              onClick={onExportExcel}
              className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs border border-emerald-400/40 active:scale-95"
              title="Tüm verileri ve yönetici özetini Microsoft Excel (.xlsx) olarak indirin"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Excel (.xlsx)</span>
            </button>
          )}

          {/* Color Theme Selector Trigger */}
          {onOpenColorThemeSelector && (
            <button
              type="button"
              id="btn-pie-module-color-theme"
              data-testid="pie-module-color-theme-btn"
              onClick={onOpenColorThemeSelector}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs border border-slate-700 hover:border-amber-400/40 active:scale-95"
              title="Pasta ve çubuk grafiklerdeki rakip renklerini özelleştirin"
            >
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              <span>Renk Teması</span>
            </button>
          )}

          {/* Minimize / Expand Toggle */}
          <button
            type="button"
            id="btn-pie-module-toggle-collapse"
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            title={isCollapsed ? "Modülü Genişlet" : "Modülü Daralt"}
            aria-label="Modülü Daralt/Genişlet"
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>

          {/* Close Panel Button */}
          {onClose && (
            <button
              type="button"
              id="btn-pie-module-close"
              data-testid="btn-pie-module-close"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-200 border border-slate-700 hover:border-rose-500/40 transition-colors cursor-pointer"
              title="Pazar Payı Modülünü Kapat"
              aria-label="Pazar Payı Modülünü Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {!isCollapsed && (
        <>
          {/* 2. Metric Dimension Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-slate-400 shrink-0 flex items-center gap-1">
              <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
              <span>Pasta Grafiği Metriği:</span>
            </span>

            {[
              { id: "marketShare", label: "Pazar Payı Dağılımı (%)", icon: PieChart },
              { id: "traffic", label: "Organik Ziyaretçi Hacmi", icon: TrendingUp },
              { id: "top3", label: "#1 - İlk 3 SERP Hakimiyeti", icon: Trophy },
              { id: "top10", label: "Sayfa 1 (İlk 10) Görünürlüğü", icon: Target },
              { id: "visibilityScore", label: "Görünürlük & Otorite Puanı", icon: ShieldCheck }
            ].map((m) => {
              const Icon = m.icon;
              const isActive = activeMetric === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  id={`btn-metric-tab-${m.id}`}
                  onClick={() => setActiveMetric(m.id as MarketShareMetricType)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer border ${
                    isActive
                      ? "bg-amber-400 text-slate-950 font-black border-amber-300 shadow-sm shadow-amber-500/20"
                      : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700/80 hover:text-white"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-slate-950" : "text-amber-400"}`} />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>

          {/* 3. Main Body: Left Side (Interactive Pie/Donut Chart) + Right Side (Active Highlight & Summary) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* 3.1 Pie Chart SVG Visualization & Donut Center Display (5 cols) */}
            <div
              ref={containerRef}
              className="lg:col-span-5 flex flex-col items-center justify-center p-4 rounded-3xl bg-slate-900/80 border border-slate-800/90 relative min-h-[340px]"
            >
              <svg ref={svgRef} className="overflow-visible" />

              {/* Donut Center Display Overlay */}
              {chartStyle === "donut" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    {activeProfile.isUser ? "SİTENİZ" : activeProfile.standingRank === 1 ? "PAZAR LİDERİ" : "RAKİP ANALİZİ"}
                  </span>
                  <span
                    className="text-2xl sm:text-3xl font-black transition-all"
                    style={{ color: activeProfile.color }}
                  >
                    %{activeProfile.marketSharePercent.toFixed(1)}
                  </span>
                  <span className="text-xs font-bold text-white max-w-[130px] truncate text-center">
                    {activeProfile.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {activeProfile.estimatedOrganicTraffic.toLocaleString("tr-TR")} Ziyaret/ay
                  </span>
                </div>
              )}

              {/* Interactive Hover / Click Helper Prompt */}
              <div className="mt-2 text-center">
                <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Grafik dilimlerine tıklayarak rakip detaylarını görüntüleyin</span>
                </p>
              </div>
            </div>

            {/* 3.2 Right Side: Active Selected Competitor Showcase Card (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div
                className="p-5 rounded-3xl border transition-all relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.85))`,
                  borderColor: activeProfile.color
                }}
              >
                {/* Header of Active Card */}
                <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full shadow-md shrink-0"
                      style={{ backgroundColor: activeProfile.color }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-black text-white">
                          {activeProfile.name}
                        </h4>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${activeProfile.badgeBg}`}>
                          {activeProfile.isUser ? "Sizin Siteniz" : `${activeProfile.standingRank}. Sırada`}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                        <Globe className="w-3 h-3 text-slate-400" />
                        <span>{activeProfile.domain}</span>
                      </p>
                    </div>
                  </div>

                  {/* Filter Main Table by this entity */}
                  {onSelectCompetitorFilter && (
                    <button
                      type="button"
                      id={`btn-filter-table-by-${activeProfile.key}`}
                      onClick={() => {
                        if (activeProfile.key === "user") {
                          onSelectCompetitorFilter("leading");
                        } else {
                          onSelectCompetitorFilter(activeProfile.key as any);
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                      title="Aşağıdaki anahtar kelime tablosunu bu rakibe göre filtreleyin"
                    >
                      <Filter className="w-3.5 h-3.5 text-amber-400" />
                      <span>Tabloda Filtrele</span>
                    </button>
                  )}
                </div>

                {/* 4 Metric Callout Blocks */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4">
                  {/* Metric 1: Market Share */}
                  <div className="p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Pazar Payı</span>
                    <div className="text-lg font-black text-amber-400">
                      %{activeProfile.marketSharePercent.toFixed(1)}
                    </div>
                    {/* Mini progress bar */}
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(activeProfile.marketSharePercent * 2, 100)}%`,
                          backgroundColor: activeProfile.color
                        }}
                      />
                    </div>
                  </div>

                  {/* Metric 2: Estimated Traffic */}
                  <div className="p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Organik Ziyaret</span>
                    <div className="text-lg font-black text-emerald-400">
                      {activeProfile.estimatedOrganicTraffic.toLocaleString("tr-TR")}
                    </div>
                    <span className="text-[10px] text-slate-400">Aylık Tıklama</span>
                  </div>

                  {/* Metric 3: Top 3 Positions */}
                  <div className="p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">#1 - İlk 3 SERP</span>
                    <div className="text-lg font-black text-indigo-300">
                      {activeProfile.top3Count} <span className="text-xs font-normal text-slate-400">/ {rankings.length}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">#{activeProfile.rank1Count} Adet #1 Lider</span>
                  </div>

                  {/* Metric 4: Avg Rank & Authority */}
                  <div className="p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Otorite & Hız</span>
                    <div className="text-lg font-black text-sky-400">
                      {activeProfile.domainAuthority} <span className="text-xs font-normal text-slate-400">DA</span>
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Gauge className="w-3 h-3 text-emerald-400" />
                      <span>Hız: {activeProfile.speedScore}/100</span>
                    </div>
                  </div>
                </div>

                {/* Strengths & Vulnerabilities summary for this competitor */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 mt-3 border-t border-slate-800/80 text-xs">
                  <div className="space-y-1">
                    <span className="font-bold text-emerald-300 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Güçlü Yönleri</span>
                    </span>
                    <ul className="space-y-0.5 text-[11px] text-slate-300">
                      {activeProfile.strengths.slice(0, 2).map((s, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <span className="text-emerald-400">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1">
                    <span className="font-bold text-rose-300 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>Fırsat / Açık Noktası</span>
                    </span>
                    <ul className="space-y-0.5 text-[11px] text-slate-300">
                      {activeProfile.vulnerabilities.slice(0, 2).map((v, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <span className="text-amber-400">•</span>
                          <span>{v}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. All Competitors Metrics Comparison Grid (Tüm Rakiplerin Metrikleri Karşılaştırma Matrisi) */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tüm Rakiplerin Karşılaştırmalı Metrik Tablosu</span>
                </h4>
                <span className="text-[11px] text-slate-400">
                  Pazar Lideri: <strong className="text-amber-300">{competitorProfiles.find(c => c.standingRank === 1)?.name}</strong>
                </span>
              </div>

              {/* Toggle Cards vs Matrix View */}
              <div className="flex items-center p-1 bg-slate-900 rounded-xl border border-slate-700 shadow-inner self-start sm:self-auto">
                <button
                  type="button"
                  id="btn-view-comparison-cards"
                  data-testid="btn-view-comparison-cards"
                  onClick={() => setComparisonView("cards")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    comparisonView === "cards"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="Kart Görünümü"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Kartlar</span>
                </button>
                <button
                  type="button"
                  id="btn-view-comparison-matrix"
                  data-testid="btn-view-comparison-matrix"
                  onClick={() => setComparisonView("matrix")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    comparisonView === "matrix"
                      ? "bg-amber-500 text-slate-950 font-black shadow-xs"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="Detaylı Karşılaştırma Matrisi Tablosu"
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span>Kıyaslama Matrisi</span>
                </button>
              </div>
            </div>

            {comparisonView === "cards" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {competitorProfiles.map((p) => {
                  const isCurrentActive =
                    p.key === activeProfile.key || (selectedEntityKey && p.key === selectedEntityKey);
                  return (
                    <div
                      key={p.id}
                      id={`competitor-card-${p.key}`}
                      onClick={() => setSelectedEntityKey(p.key === selectedEntityKey ? null : p.key)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left space-y-2.5 relative group ${
                        isCurrentActive
                          ? "bg-slate-800/95 border-amber-400/80 shadow-lg shadow-indigo-950/40 ring-1 ring-amber-400/50"
                          : "bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                            style={{ backgroundColor: p.color }}
                          />
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                              {p.name}
                            </h5>
                            <span className="text-[10px] text-slate-400 block truncate font-mono">
                              {p.domain}
                            </span>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black shrink-0 ${p.badgeBg}`}>
                          #{p.standingRank}
                        </span>
                      </div>

                      {/* Progress Bar of Market Share */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Pazar Payı</span>
                          <strong className="text-white font-mono">%{p.marketSharePercent.toFixed(1)}</strong>
                        </div>
                        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(p.marketSharePercent * 2, 100)}%`,
                              backgroundColor: p.color
                            }}
                          />
                        </div>
                      </div>

                      {/* Key Metrics Rows */}
                      <div className="grid grid-cols-2 gap-1.5 text-[11px] pt-1 border-t border-slate-800/80">
                        <div className="p-1.5 rounded-lg bg-slate-950/60">
                          <span className="text-[10px] text-slate-400 block">Trafik / Ay</span>
                          <strong className="text-emerald-400 font-mono">
                            {p.estimatedOrganicTraffic.toLocaleString("tr-TR")}
                          </strong>
                        </div>
                        <div className="p-1.5 rounded-lg bg-slate-950/60">
                          <span className="text-[10px] text-slate-400 block">İlk 3 Sıra</span>
                          <strong className="text-amber-300 font-mono">
                            {p.top3Count} Kelime
                          </strong>
                        </div>
                        <div className="p-1.5 rounded-lg bg-slate-950/60">
                          <span className="text-[10px] text-slate-400 block">Ort. Sıra</span>
                          <strong className="text-indigo-300 font-mono">
                            #{p.avgRank}
                          </strong>
                        </div>
                        <div className="p-1.5 rounded-lg bg-slate-950/60">
                          <span className="text-[10px] text-slate-400 block">Görünürlük</span>
                          <strong className="text-sky-300 font-mono">
                            {p.visibilityScore}/100
                          </strong>
                        </div>
                      </div>

                      {/* Filter Quick Action */}
                      {onSelectCompetitorFilter && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (p.key === "user") {
                              onSelectCompetitorFilter("leading");
                            } else {
                              onSelectCompetitorFilter(p.key as any);
                            }
                          }}
                          className="w-full py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-bold border border-slate-700/80 flex items-center justify-center gap-1 transition-all cursor-pointer"
                        >
                          <Filter className="w-3 h-3 text-amber-400" />
                          <span>Tabloyu Filtrele</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Detailed Multi-Metric Comparison Matrix Table */
              <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950/80">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-900 border-b border-slate-800 text-slate-300">
                        <th className="py-3 px-3.5 font-bold">Kıyaslanan Metrik</th>
                        {competitorProfiles.map((p) => (
                          <th key={p.id} className="py-3 px-3.5 font-bold min-w-[140px]">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                              <div className="truncate">
                                <span className="text-white block font-bold truncate">{p.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono block truncate">{p.domain}</span>
                              </div>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {/* Row 1: Pazar Payı */}
                      <tr className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-2.5 px-3.5 font-bold text-slate-300 flex items-center gap-1.5">
                          <PieChart className="w-3.5 h-3.5 text-amber-400" />
                          <span>Pazar Payı Dağılımı</span>
                        </td>
                        {competitorProfiles.map((p) => (
                          <td key={p.id} className="py-2.5 px-3.5 font-mono font-black text-amber-400">
                            %{p.marketSharePercent.toFixed(1)}
                          </td>
                        ))}
                      </tr>

                      {/* Row 2: Tahmini Trafik */}
                      <tr className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-2.5 px-3.5 font-bold text-slate-300 flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Tahmini Aylık Trafik</span>
                        </td>
                        {competitorProfiles.map((p) => (
                          <td key={p.id} className="py-2.5 px-3.5 font-mono font-bold text-emerald-300">
                            {p.estimatedOrganicTraffic.toLocaleString("tr-TR")} Ziyaret
                          </td>
                        ))}
                      </tr>

                      {/* Row 3: SERP #1 Liderliği */}
                      <tr className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-2.5 px-3.5 font-bold text-slate-300 flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-amber-300" />
                          <span>SERP #1 Sıra Sayısı</span>
                        </td>
                        {competitorProfiles.map((p) => (
                          <td key={p.id} className="py-2.5 px-3.5 font-mono font-bold text-white">
                            {p.rank1Count} Kelime
                          </td>
                        ))}
                      </tr>

                      {/* Row 4: Top 3 Hakimiyeti */}
                      <tr className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-2.5 px-3.5 font-bold text-slate-300 flex items-center gap-1.5">
                          <Trophy className="w-3.5 h-3.5 text-amber-400" />
                          <span>İlk 3 Sıra (#1 - #3)</span>
                        </td>
                        {competitorProfiles.map((p) => (
                          <td key={p.id} className="py-2.5 px-3.5 font-mono font-bold text-amber-200">
                            {p.top3Count} Kelime
                          </td>
                        ))}
                      </tr>

                      {/* Row 5: Top 10 Görünürlüğü */}
                      <tr className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-2.5 px-3.5 font-bold text-slate-300 flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5 text-indigo-400" />
                          <span>İlk Sayfa (#1 - #10)</span>
                        </td>
                        {competitorProfiles.map((p) => (
                          <td key={p.id} className="py-2.5 px-3.5 font-mono font-bold text-indigo-300">
                            {p.top10Count} Kelime
                          </td>
                        ))}
                      </tr>

                      {/* Row 6: Ortalama Sıralama */}
                      <tr className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-2.5 px-3.5 font-bold text-slate-300 flex items-center gap-1.5">
                          <BarChart3 className="w-3.5 h-3.5 text-sky-400" />
                          <span>Ortalama SERP Sırası</span>
                        </td>
                        {competitorProfiles.map((p) => (
                          <td key={p.id} className="py-2.5 px-3.5 font-mono font-bold text-slate-200">
                            #{p.avgRank}
                          </td>
                        ))}
                      </tr>

                      {/* Row 7: SEO Görünürlük Skoru */}
                      <tr className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-2.5 px-3.5 font-bold text-slate-300 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                          <span>Görünürlük Puanı</span>
                        </td>
                        {competitorProfiles.map((p) => (
                          <td key={p.id} className="py-2.5 px-3.5 font-mono font-bold text-teal-300">
                            {p.visibilityScore} / 100
                          </td>
                        ))}
                      </tr>

                      {/* Row 8: Sayfa Hızı (PSI) */}
                      <tr className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-2.5 px-3.5 font-bold text-slate-300 flex items-center gap-1.5">
                          <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Sayfa Hızı (Lighthouse)</span>
                        </td>
                        {competitorProfiles.map((p) => (
                          <td key={p.id} className="py-2.5 px-3.5 font-mono font-bold text-emerald-400">
                            {p.speedScore} / 100
                          </td>
                        ))}
                      </tr>

                      {/* Row 9: Domain Otoritesi */}
                      <tr className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-2.5 px-3.5 font-bold text-slate-300 flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          <span>Domain Authority (DA)</span>
                        </td>
                        {competitorProfiles.map((p) => (
                          <td key={p.id} className="py-2.5 px-3.5 font-mono font-bold text-sky-400">
                            {p.domainAuthority} DA
                          </td>
                        ))}
                      </tr>

                      {/* Row 10: Filtrele Aksiyonu */}
                      {onSelectCompetitorFilter && (
                        <tr className="bg-slate-900/40">
                          <td className="py-2.5 px-3.5 font-bold text-slate-400">Tablo Eylemi</td>
                          {competitorProfiles.map((p) => (
                            <td key={p.id} className="py-2.5 px-3.5">
                              <button
                                type="button"
                                onClick={() => {
                                  if (p.key === "user") {
                                    onSelectCompetitorFilter("leading");
                                  } else {
                                    onSelectCompetitorFilter(p.key as any);
                                  }
                                }}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-[10px] font-bold border border-slate-700 flex items-center gap-1 transition-all cursor-pointer"
                              >
                                <Filter className="w-3 h-3 text-amber-400" />
                                <span>Tabloda Filtrele</span>
                              </button>
                            </td>
                          ))}
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
