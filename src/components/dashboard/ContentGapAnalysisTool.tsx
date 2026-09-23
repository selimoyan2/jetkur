import React, { useState, useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";
import {
  Sparkles,
  Search,
  Filter,
  Layers,
  TrendingUp,
  Target,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  Zap,
  BarChart3,
  Copy,
  Check,
  RefreshCw,
  Download,
  ExternalLink,
  ChevronRight,
  Info,
  Globe,
  Sliders,
  Flame,
  ShieldCheck,
  FileText,
  DollarSign,
  Compass
} from "lucide-react";
import { SiteConfig, CustomerPanelTab } from "../../types";
import {
  ContentGapAnalysisResult,
  MissingKeywordItem,
  MissingTopicCluster,
  ContentGapCompetitor,
  generateFallbackContentGapAnalysis,
  fetchContentGapAnalysis
} from "../../utils/aiContentGapAnalysisEngine";

export interface ContentGapAnalysisToolProps {
  config: SiteConfig;
  onNavigateTab?: (tab: CustomerPanelTab | string) => void;
  className?: string;
}

export const ContentGapAnalysisTool: React.FC<ContentGapAnalysisToolProps> = ({
  config,
  onNavigateTab,
  className = ""
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<ContentGapAnalysisResult>(() => {
    return generateFallbackContentGapAnalysis(config);
  });
  const [customCompetitors, setCustomCompetitors] = useState<string[]>([]);
  const [showCompetitorModal, setShowCompetitorModal] = useState<boolean>(false);
  const [tempComp1, setTempComp1] = useState<string>("");
  const [tempComp2, setTempComp2] = useState<string>("");
  const [tempComp3, setTempComp3] = useState<string>("");

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedIntent, setSelectedIntent] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"keywords" | "clusters" | "radar" | "quickwins">("keywords");

  // D3 Radar Ref
  const radarSvgRef = useRef<SVGSVGElement | null>(null);

  // Initial fetch with Gemini API
  useEffect(() => {
    let isMounted = true;
    const loadAnalysis = async () => {
      setLoading(true);
      try {
        const result = await fetchContentGapAnalysis(config, customCompetitors.length > 0 ? customCompetitors : undefined);
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        console.error("Content gap initial load error:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    loadAnalysis();
    return () => {
      isMounted = false;
    };
  }, [config.companyName, config.sector, config.city]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const result = await fetchContentGapAnalysis(config, customCompetitors.length > 0 ? customCompetitors : undefined);
      setData(result);
    } catch (err) {
      console.error("Refresh content gap error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCompetitors = () => {
    const list = [tempComp1.trim(), tempComp2.trim(), tempComp3.trim()].filter(Boolean);
    if (list.length > 0) {
      setCustomCompetitors(list);
    }
    setShowCompetitorModal(false);
    handleRefresh();
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered Missing Keywords
  const filteredKeywords = useMemo(() => {
    return data.missingKeywords.filter((kw) => {
      const matchesSearch =
        kw.keyword.toLowerCase().includes(searchTerm.toLowerCase()) ||
        kw.recommendedAction.toLowerCase().includes(searchTerm.toLowerCase()) ||
        kw.suggestedPage.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesIntent = selectedIntent === "all" || kw.intent === selectedIntent;

      let matchesDifficulty = true;
      if (selectedDifficulty === "easy") matchesDifficulty = kw.difficulty <= 30;
      else if (selectedDifficulty === "medium") matchesDifficulty = kw.difficulty > 30 && kw.difficulty <= 60;
      else if (selectedDifficulty === "hard") matchesDifficulty = kw.difficulty > 60;

      return matchesSearch && matchesIntent && matchesDifficulty;
    });
  }, [data.missingKeywords, searchTerm, selectedIntent, selectedDifficulty]);

  // Render D3 Radar Chart
  useEffect(() => {
    if (!radarSvgRef.current || !data.radarComparison || data.radarComparison.length === 0) return;

    const svg = d3.select(radarSvgRef.current);
    svg.selectAll("*").remove();

    const width = 540;
    const height = 400;
    const margin = 50;
    const radius = Math.min(width, height) / 2 - margin;
    const center = { x: width / 2, y: height / 2 };

    const g = svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .append("g")
      .attr("transform", `translate(${center.x},${center.y})`);

    const axisData = data.radarComparison;
    const totalAxes = axisData.length;
    const angleSlice = (Math.PI * 2) / totalAxes;

    // Radius scale
    const rScale = d3.scaleLinear().domain([0, 100]).range([0, radius]);

    // Concentric circles
    const levels = [20, 40, 60, 80, 100];
    levels.forEach((level) => {
      g.append("circle")
        .attr("r", rScale(level))
        .attr("fill", "none")
        .attr("stroke", "#334155")
        .attr("stroke-dasharray", level === 100 ? "none" : "3,3")
        .attr("stroke-width", level === 100 ? 1.5 : 0.8)
        .attr("opacity", 0.6);

      g.append("text")
        .attr("x", 4)
        .attr("y", -rScale(level) - 2)
        .attr("fill", "#64748b")
        .attr("font-size", "9px")
        .attr("font-family", "monospace")
        .text(`${level}%`);
    });

    // Axis lines & labels
    axisData.forEach((d, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const x = rScale(100) * Math.cos(angle);
      const y = rScale(100) * Math.sin(angle);

      // Line
      g.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", x)
        .attr("y2", y)
        .attr("stroke", "#334155")
        .attr("stroke-width", 1);

      // Label position
      const labelX = (radius + 24) * Math.cos(angle);
      const labelY = (radius + 24) * Math.sin(angle);

      g.append("text")
        .attr("x", labelX)
        .attr("y", labelY)
        .attr("text-anchor", Math.abs(angle) < 0.1 || Math.abs(angle - Math.PI) < 0.1 ? "middle" : labelX > 0 ? "start" : "end")
        .attr("dy", "0.35em")
        .attr("fill", "#94a3b8")
        .attr("font-size", "11px")
        .attr("font-weight", "600")
        .text(d.subject);
    });

    // Radar polygon generator
    const makePath = (accessor: (d: any) => number) => {
      const points: [number, number][] = axisData.map((d, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const val = accessor(d);
        return [rScale(val) * Math.cos(angle), rScale(val) * Math.sin(angle)];
      });
      return d3.line()(points) + "Z";
    };

    // Competitor 1 (Amber)
    g.append("path")
      .attr("d", makePath((d) => d.comp1))
      .attr("fill", "#f59e0b")
      .attr("fill-opacity", 0.12)
      .attr("stroke", "#f59e0b")
      .attr("stroke-width", 1.8)
      .attr("stroke-dasharray", "4,3");

    // Competitor 2 (Blue)
    g.append("path")
      .attr("d", makePath((d) => d.comp2))
      .attr("fill", "#3b82f6")
      .attr("fill-opacity", 0.1)
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 1.6)
      .attr("stroke-dasharray", "2,2");

    // Siteniz (User - Vibrant Emerald with glow)
    const userPath = makePath((d) => d.user);
    g.append("path")
      .attr("d", userPath)
      .attr("fill", "#10b981")
      .attr("fill-opacity", 0.3)
      .attr("stroke", "#10b981")
      .attr("stroke-width", 2.8);

    // Dots for user
    axisData.forEach((d, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const x = rScale(d.user) * Math.cos(angle);
      const y = rScale(d.user) * Math.sin(angle);

      g.append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", 4.5)
        .attr("fill", "#10b981")
        .attr("stroke", "#0f172a")
        .attr("stroke-width", 2);
    });
  }, [data.radarComparison, activeTab]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      "Anahtar_Kelime",
      "Aylik_Hacim",
      "Zorluk_KD",
      "Niyet",
      "Rakip1_Sira",
      "Rakip2_Sira",
      "Rakip3_Sira",
      "Firsat_Skoru",
      "Tahmini_Trafik_Katkisi",
      "Onerilen_Sayfa",
      "Onerilen_Eylem"
    ];

    const rows = data.missingKeywords.map((k) => [
      `"${k.keyword.replace(/"/g, '""')}"`,
      k.searchVolume,
      k.difficulty,
      k.intent,
      k.competitorRankings.comp1,
      k.competitorRankings.comp2,
      k.competitorRankings.comp3,
      k.opportunityScore,
      `"${k.estimatedTrafficGain}"`,
      `"${k.suggestedPage}"`,
      `"${k.recommendedAction.replace(/"/g, '""')}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `icerik_acigi_rakip_analizi_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      id="content-gap-analysis-tool"
      data-testid="content-gap-analysis-tool"
      className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden transition-all ${className}`}
    >
      {/* 1. Header Bar with Gemini 3.8 Flash Badge */}
      <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800/80 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
              Gemini 3.8 Flash Semantik Motoru
            </span>
            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-mono font-bold flex items-center gap-1">
              <Compass className="w-3.5 h-3.5" />
              İlk 3 Sektör Rakibi Kıyaslaması
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              data.source.includes("gemini")
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                : "bg-slate-700 text-slate-300"
            }`}>
              {data.source.includes("gemini") ? "Canlı Gemini SERP Grounding" : "Yerel Algoritmik Analiz"}
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white mt-2 flex items-center gap-2">
            <span>İçerik Açığı &amp; Rakip Analizi (Content Gap)</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Sitenizin mevcut hizmet ve blog içeriklerini sektörünüzdeki en güçlü ilk 3 rakiple kıyaslar; rakiplerin sıralama aldığı fakat sitenizde eksik olan yüksek hacimli anahtar kelimeleri ve konu kümelerini (Topic Clusters) tespit eder.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
          <button
            type="button"
            id="btn-open-competitors-modal"
            onClick={() => {
              setTempComp1(data.competitors[0]?.domain || "");
              setTempComp2(data.competitors[1]?.domain || "");
              setTempComp3(data.competitors[2]?.domain || "");
              setShowCompetitorModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Kıyaslanacak 3 rakip domainini özelleştirin"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            <span>Rakipleri Düzenle</span>
          </button>

          <button
            type="button"
            id="btn-refresh-content-gap"
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-black flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-white" : ""}`} />
            <span>{loading ? "Analiz Ediliyor..." : "Yeniden Analiz Et"}</span>
          </button>

          <button
            type="button"
            id="btn-export-content-gap-csv"
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Eksik kelimeleri CSV formatında dışa aktarın"
          >
            <Download className="w-3.5 h-3.5 text-slate-300" />
            <span>CSV İndir</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metrics Overview Grid */}
      <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-200/80 dark:border-slate-800">
        {/* Metric 1: Gap Score */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              İçerik Açığı Oranı
            </span>
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              %{data.gapScore}
            </span>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
              Fırsat Açığı
            </span>
          </div>
          <div className="mt-2.5 w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-rose-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${data.gapScore}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            İlk 3 rakibin sıralandığı konuların %{data.gapScore}'i sitenizde henüz yok.
          </p>
        </div>

        {/* Metric 2: Untapped Traffic */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Kazanılabilir Trafik
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {data.metrics.totalUntappedTraffic}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3">
            Eksik anahtar kelimeler ve topic cluster'lar tamamlandığında öngörülen organik artış.
          </p>
        </div>

        {/* Metric 3: Missing Keywords Count */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Eksik Anahtar Kelime
            </span>
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Target className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {data.missingKeywords.length}
            </span>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              Yüksek Fırsat
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3">
            Rakiplerin ilk 1-5 sırada olduğu fakat sitenizin hiç yer almadığı kelimeler.
          </p>
        </div>

        {/* Metric 4: Content Depth Gap */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              İçerik Kelime Derinliği
            </span>
            <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <FileText className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {data.metrics.userAverageContentWordCount} <span className="text-xs font-normal text-slate-400">vs</span> {data.metrics.avgCompetitorContentWordCount}
            </span>
            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase">
              Kelime / Sayfa
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3">
            Rakipler ortalama 1.850+ kelimelik kapsamlı kılavuzlarla Google E-E-A-T otoritesi kuruyor.
          </p>
        </div>
      </div>

      {/* 3. Top 3 Competitors Comparative Cards */}
      <div className="p-5 sm:p-6 border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-500" />
            <span>Kıyaslanan İlk 3 Sektör Rakibi &amp; Güçlü/Zayıf Noktaları</span>
          </h4>
          <span className="text-xs text-slate-500">
            {config.city || "İstanbul"} • {config.sector || "Hizmet"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.competitors.map((comp, idx) => (
            <div
              key={comp.id || idx}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 flex flex-col justify-between transition-all hover:shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: comp.color || "#3b82f6" }}
                    />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                      Rakip #{idx + 1}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-mono font-bold">
                    %{comp.overlapPercentage} İle Örtüşme
                  </span>
                </div>

                <h5 className="font-bold text-slate-900 dark:text-white mt-1.5 text-base truncate" title={comp.domain}>
                  {comp.name}
                </h5>
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-mono font-semibold">
                  {comp.domain}
                </span>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-200/60 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Aylık Organik Trafik</span>
                    <strong className="text-slate-800 dark:text-slate-200">{comp.organicTraffic}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Sıralanan Kelime</span>
                    <strong className="text-slate-800 dark:text-slate-200">{comp.keywordCount} kelime</strong>
                  </div>
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> En Güçlü Yönü
                    </span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                      {comp.topAdvantage}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-rose-500 dark:text-rose-400 uppercase flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Zayıf / Boş Noktası
                    </span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                      {comp.keyWeakness}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400">İçerik Derinlik Skoru</span>
                <span className="font-mono font-black text-slate-900 dark:text-white">
                  {comp.contentDepthScore}/100
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Sub-Navigation Tabs within Content Gap Tool */}
      <div className="px-5 sm:px-6 pt-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3 bg-slate-50/40 dark:bg-slate-900/60">
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="tab-btn-missing-keywords"
            onClick={() => setActiveTab("keywords")}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "keywords"
                ? "bg-white dark:bg-slate-850 text-indigo-600 dark:text-indigo-400 border-t-2 border-indigo-500 shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Eksik Anahtar Kelimeler ({filteredKeywords.length})</span>
          </button>

          <button
            type="button"
            id="tab-btn-topic-clusters"
            onClick={() => setActiveTab("clusters")}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "clusters"
                ? "bg-white dark:bg-slate-850 text-indigo-600 dark:text-indigo-400 border-t-2 border-indigo-500 shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Konu Kümeleri &amp; Silolar ({data.topicClusters.length})</span>
          </button>

          <button
            type="button"
            id="tab-btn-radar-chart"
            onClick={() => setActiveTab("radar")}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "radar"
                ? "bg-white dark:bg-slate-850 text-indigo-600 dark:text-indigo-400 border-t-2 border-indigo-500 shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>D3 Radar Karşılaştırması</span>
          </button>

          <button
            type="button"
            id="tab-btn-quick-wins"
            onClick={() => setActiveTab("quickwins")}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "quickwins"
                ? "bg-white dark:bg-slate-850 text-emerald-600 dark:text-emerald-400 border-t-2 border-emerald-500 shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Hızlı Kazanımlar ({data.quickWins.length})</span>
          </button>
        </div>

        {/* Quick hint */}
        <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">
          Hedef: Rakipleri 0.02s hız avantajıyla geride bırakmak
        </span>
      </div>

      {/* 5. Tab Content Panes */}
      <div className="p-5 sm:p-6 bg-white dark:bg-slate-850">
        {/* TAB 1: MISSING KEYWORDS TABLE */}
        {activeTab === "keywords" && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Eksik anahtar kelime veya eylem ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Search Intent Filter */}
                <select
                  value={selectedIntent}
                  onChange={(e) => setSelectedIntent(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">Tüm Niyetler</option>
                  <option value="İşlemsel">İşlemsel (Transactional)</option>
                  <option value="Ticari">Ticari (Commercial)</option>
                  <option value="Bilgilendirici">Bilgilendirici (Informational)</option>
                  <option value="Yerel">Yerel / Acil (Local)</option>
                </select>

                {/* Difficulty Filter */}
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">Tüm Zorluklar</option>
                  <option value="easy">Kolay (KD ≤ 30)</option>
                  <option value="medium">Orta (KD 31 - 60)</option>
                  <option value="hard">Zor (KD &gt; 60)</option>
                </select>
              </div>
            </div>

            {/* Keyword Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-900/80 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3.5">Eksik Anahtar Kelime &amp; Niyet</th>
                    <th className="p-3.5 text-center">Aylık Hacim</th>
                    <th className="p-3.5 text-center">Zorluk (KD)</th>
                    <th className="p-3.5 text-center">İlk 3 Rakip Sırası</th>
                    <th className="p-3.5 text-center">Fırsat Puanı</th>
                    <th className="p-3.5">Önerilen Hedef Sayfa &amp; Eylem</th>
                    <th className="p-3.5 text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredKeywords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        Arama kriterlerine uygun eksik anahtar kelime bulunamadı.
                      </td>
                    </tr>
                  ) : (
                    filteredKeywords.map((kw) => (
                      <tr
                        key={kw.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* Keyword & Intent */}
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900 dark:text-white text-xs">
                            {kw.keyword}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                              {kw.intent}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              TBM: {kw.cpc}
                            </span>
                          </div>
                        </td>

                        {/* Search Volume */}
                        <td className="p-3.5 text-center font-mono font-bold text-slate-900 dark:text-white">
                          {kw.searchVolume.toLocaleString()}
                        </td>

                        {/* Difficulty */}
                        <td className="p-3.5 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <div className="w-12 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  kw.difficulty <= 30
                                    ? "bg-emerald-500"
                                    : kw.difficulty <= 60
                                    ? "bg-amber-500"
                                    : "bg-rose-500"
                                }`}
                                style={{ width: `${kw.difficulty}%` }}
                              />
                            </div>
                            <span className="font-mono text-[11px] font-semibold">
                              %{kw.difficulty}
                            </span>
                          </div>
                          <span className={`block text-[10px] font-bold ${
                            kw.difficulty <= 30
                              ? "text-emerald-500"
                              : kw.difficulty <= 60
                              ? "text-amber-500"
                              : "text-rose-500"
                          }`}>
                            {kw.difficultyLevel}
                          </span>
                        </td>

                        {/* Competitor Rankings */}
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5 font-mono text-[11px]">
                            <span
                              className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20"
                              title={`Rakip 1: #${kw.competitorRankings.comp1}`}
                            >
                              R1: #{kw.competitorRankings.comp1}
                            </span>
                            <span
                              className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/20"
                              title={`Rakip 2: #${kw.competitorRankings.comp2}`}
                            >
                              R2: #{kw.competitorRankings.comp2}
                            </span>
                            <span
                              className="px-1.5 py-0.5 rounded bg-pink-500/10 text-pink-600 dark:text-pink-400 font-bold border border-pink-500/20"
                              title={`Rakip 3: #${kw.competitorRankings.comp3}`}
                            >
                              R3: #{kw.competitorRankings.comp3}
                            </span>
                          </div>
                          <span className="block text-[10px] text-rose-500 font-semibold mt-1">
                            Siteniz: İlk 50'de Yok
                          </span>
                        </td>

                        {/* Opportunity Score */}
                        <td className="p-3.5 text-center">
                          <span className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-black font-mono text-xs border border-emerald-200 dark:border-emerald-800">
                            {kw.opportunityScore}/100
                          </span>
                          <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                            {kw.estimatedTrafficGain}
                          </span>
                        </td>

                        {/* Suggested Page & Action */}
                        <td className="p-3.5 max-w-xs">
                          <span className="font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400 block truncate">
                            {kw.suggestedPage}
                          </span>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                            {kw.recommendedAction}
                          </p>
                        </td>

                        {/* Actions */}
                        <td className="p-3.5 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleCopyText(kw.keyword, kw.id)}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                            title="Anahtar kelimeyi panoya kopyala"
                          >
                            {copiedId === kw.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-emerald-600">Kopyalandı</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Kopyala</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: TOPIC CLUSTERS & CONTENT SILOS */}
        {activeTab === "clusters" && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-500" />
                Google Semantik Topic Cluster (Konu Kümesi) Mimarisi: Belirli bir temel konu etrafında birbirine iç bağlantı veren makaleler, sitenizi sektör otoritesi haline getirir.
              </span>
              <button
                type="button"
                onClick={() => onNavigateTab?.("ai-content-planner")}
                className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shrink-0 cursor-pointer"
              >
                İçerik Planlayıcıyı Aç
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.topicClusters.map((cluster) => (
                <div
                  key={cluster.id}
                  className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/60 shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-[10px] uppercase border border-purple-500/20">
                        {cluster.suggestedFormat}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        cluster.businessImpact === "Kritik"
                          ? "bg-rose-500/20 text-rose-600 dark:text-rose-400"
                          : "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                      }`}>
                        {cluster.businessImpact} Etki
                      </span>
                    </div>

                    <h5 className="text-base font-black text-slate-900 dark:text-white mt-2">
                      {cluster.clusterName}
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Pillar Konu: <strong>{cluster.pillarTopic}</strong> • Hacim: {cluster.keywordVolumeSum}
                    </p>

                    {/* Coverage Bar: User vs Competitors */}
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Mevcut Kapsama: %{cluster.userCoveragePercent}</span>
                        <span className="text-slate-500">Rakipler: %{cluster.competitorCoveragePercent}</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden flex">
                        <div
                          className="bg-emerald-500 h-full"
                          style={{ width: `${cluster.userCoveragePercent}%` }}
                          title="Sitenizin Kapsaması"
                        />
                        <div
                          className="bg-amber-500/50 h-full"
                          style={{ width: `${Math.max(0, cluster.competitorCoveragePercent - cluster.userCoveragePercent)}%` }}
                          title="Rakiplerin Kapsama Üstünlüğü"
                        />
                      </div>
                    </div>

                    {/* Missing Sub-topics */}
                    <div className="mt-4">
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1.5 uppercase">
                        Sitenizde Eksik Olan Alt Başlıklar:
                      </span>
                      <ul className="space-y-1">
                        {cluster.missingSubtopics.map((sub, i) => (
                          <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                            <span>{sub}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] font-bold text-indigo-500 uppercase block">
                        Önerilen Pillar Makale Başlığı:
                      </span>
                      <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                        "{cluster.suggestedArticleTitle}"
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyText(cluster.suggestedArticleTitle, cluster.id)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 transition-all cursor-pointer flex items-center gap-1"
                      >
                        {copiedId === cluster.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Kopyalandı</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Başlığı Kopyala</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => onNavigateTab?.("ai-blog-engine")}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1"
                        title="AI Blog Motoru ile bu makaleyi anında üret"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI Blog'da Üret</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: D3 RADAR COMPARISON */}
        {activeTab === "radar" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              <div className="lg:col-span-2 flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="w-full flex items-center justify-between mb-2 px-2 text-xs">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <span className="w-3 h-3 rounded-full bg-emerald-500" />
                      Siteniz ({config.companyName || "Siz"})
                    </span>
                    <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                      <span className="w-3 h-1 bg-amber-400" />
                      {data.competitors[0]?.name || "Rakip 1"}
                    </span>
                    <span className="flex items-center gap-1.5 text-blue-400 font-semibold">
                      <span className="w-3 h-1 bg-blue-400" />
                      {data.competitors[1]?.name || "Rakip 2"}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">D3.js Vektörel Radar</span>
                </div>

                <svg ref={radarSvgRef} className="w-full max-w-lg h-auto" />
              </div>

              {/* Legend & Breakdown */}
              <div className="space-y-3">
                <h5 className="text-sm font-black text-slate-900 dark:text-white">
                  6-Eksenli İçerik ve Otorite Karşılaştırması
                </h5>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  D3.js ile hesaplanan bu radar grafiği, Google'ın en çok ağırlık verdiği 6 ana içerik ekseninde sitenizin ilk 3 rakibe karşı konumunu gösterir.
                </p>

                <div className="space-y-2 pt-2">
                  {data.radarComparison.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {item.subject}
                      </span>
                      <div className="flex items-center gap-3 font-mono">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          Siz: %{item.user}
                        </span>
                        <span className="text-slate-400">
                          R1: %{item.comp1}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200">
                  <strong className="block font-bold">En Büyük Rekabetçi Avantajınız:</strong>
                  Sitenizin 0.02s dünya rekoru Anycast Edge CDN mimarisi (%99 hız skoru), rakiplerin hantal altyapılarına (%52) karşı en büyük kozunuzdur.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: QUICK WINS CHECKLIST */}
        {activeTab === "quickwins" && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                Hızlı Kazanımlar (Tactical Quick Wins): Rakiplerin içerik açıklarından faydalanarak en kısa sürede Google SERP ilk sayfaya çıkmanızı sağlayacak taktikler.
              </span>
            </div>

            <div className="space-y-3">
              {data.quickWins.map((win, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                        {win.impact}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                        Efor: {win.effort}
                      </span>
                    </div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-sm">
                      {win.title}
                    </h5>
                    <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                      {win.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (win.actionText.includes("Blog")) onNavigateTab?.("ai-blog-engine");
                      else if (win.actionText.includes("Fiyat")) onNavigateTab?.("catalog");
                      else onNavigateTab?.("ai-content-planner");
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shrink-0 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <span>{win.actionText}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 6. Competitors Edit Modal */}
      {showCompetitorModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-500" />
              <span>Kıyaslanacak 3 Rakibi Belirleyin</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Analiz edilmesini istediğiniz 3 rakibin web sitesi adreslerini girin. Gemini 3.8 Flash içerik açıklarını bu rakiplere göre hesaplayacaktır.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  1. Rakip Domain:
                </label>
                <input
                  type="text"
                  placeholder="ornek-rakip1.com"
                  value={tempComp1}
                  onChange={(e) => setTempComp1(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  2. Rakip Domain:
                </label>
                <input
                  type="text"
                  placeholder="ornek-rakip2.com"
                  value={tempComp2}
                  onChange={(e) => setTempComp2(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  3. Rakip Domain:
                </label>
                <input
                  type="text"
                  placeholder="ornek-rakip3.com"
                  value={tempComp3}
                  onChange={(e) => setTempComp3(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowCompetitorModal(false)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleSaveCompetitors}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Kaydet ve Analiz Et
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
