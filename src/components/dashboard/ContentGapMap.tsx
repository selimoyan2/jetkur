import React, { useState, useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Sparkles,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Filter,
  Eye,
  Layers,
  FileText,
  Code2,
  Globe,
  ArrowUpRight,
  BarChart3,
  ChevronRight,
  Copy,
  Check,
  FileSpreadsheet,
  Download,
  RefreshCw,
  X,
  Plus,
  ExternalLink,
  Flame,
  ShieldAlert,
  Award,
  HelpCircle,
  MapPin,
  Sliders,
  DollarSign,
  Users,
  Compass
} from "lucide-react";
import { SiteConfig, BlogPostItem } from "../../types";
import {
  ContentGapCompetitor,
  ContentGapKeyword,
  ContentGapAnalysisReport,
  generateCompetitorsForSector,
  buildContentGapReport,
  generateBlogPostFromGap,
  exportContentGapToCSV
} from "../../utils/contentGapEngine";

export interface ContentGapMapProps {
  siteConfig: SiteConfig;
  onUpdateSiteConfig?: (updated: SiteConfig) => void;
  onNavigateTab?: (tab: string) => void;
  className?: string;
}

export const ContentGapMap: React.FC<ContentGapMapProps> = ({
  siteConfig,
  onUpdateSiteConfig,
  onNavigateTab,
  className = ""
}) => {
  const activeSector = siteConfig.sector || "Oto Çekici & Kurtarıcı";
  const activeCity = siteConfig.city || "İstanbul";
  const activeCompany = siteConfig.companyName || "Siteniz";

  // 1. Competitors state
  const [competitors, setCompetitors] = useState<ContentGapCompetitor[]>(() => {
    return generateCompetitorsForSector(activeSector, activeCity, activeCompany);
  });

  // Re-generate competitors if sector or city changes externally
  useEffect(() => {
    setCompetitors(prev => {
      const generated = generateCompetitorsForSector(activeSector, activeCity, activeCompany);
      // Keep selection state and custom competitors
      const customOnes = prev.filter(p => p.isCustom);
      return [
        ...generated.map(g => {
          const match = prev.find(p => p.id === g.id);
          return match ? { ...g, isSelected: match.isSelected } : g;
        }),
        ...customOnes
      ];
    });
  }, [activeSector, activeCity, activeCompany]);

  // 2. Build analysis report
  const report: ContentGapAnalysisReport = useMemo(() => {
    return buildContentGapReport(siteConfig, competitors);
  }, [siteConfig, competitors]);

  // 3. UI Filters & Selection States
  const [statusFilter, setStatusFilter] = useState<"all" | "critical" | "weak" | "opportunity" | "winning">("all");
  const [clusterFilter, setClusterFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"volume" | "difficulty" | "loss" | "potential">("loss");
  const [selectedKeywordId, setSelectedKeywordId] = useState<string | null>(null);

  // Modals & Popups
  const [briefModalKeyword, setBriefModalKeyword] = useState<ContentGapKeyword | null>(null);
  const [serpModalKeyword, setSerpModalKeyword] = useState<ContentGapKeyword | null>(null);
  const [showAddCompetitorModal, setShowAddCompetitorModal] = useState<boolean>(false);
  const [newCompetitorName, setNewCompetitorName] = useState<string>("");
  const [newCompetitorUrl, setNewCompetitorUrl] = useState<string>("");

  // Feedback notifications
  const [notification, setNotification] = useState<{ message: string; type: "success" | "info" } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const showToast = (message: string, type: "success" | "info" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Toggle competitor selection
  const handleToggleCompetitor = (id: string) => {
    setCompetitors(prev => {
      const activeCount = prev.filter(c => c.isSelected).length;
      const target = prev.find(c => c.id === id);
      if (target?.isSelected && activeCount <= 1) {
        showToast("En az 1 rakip seçili kalmalıdır.", "info");
        return prev;
      }
      return prev.map(c => c.id === id ? { ...c, isSelected: !c.isSelected } : c);
    });
  };

  // Add custom competitor
  const handleAddCustomCompetitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompetitorName.trim() || !newCompetitorUrl.trim()) return;

    let cleanUrl = newCompetitorUrl.trim();
    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      cleanUrl = `https://${cleanUrl}`;
    }

    let hostname = cleanUrl;
    try {
      hostname = new URL(cleanUrl).hostname;
    } catch {
      hostname = cleanUrl.replace(/^https?:\/\//, "").split("/")[0];
    }

    const newComp: ContentGapCompetitor = {
      id: `custom-comp-${Date.now()}`,
      name: newCompetitorName.trim(),
      domain: hostname,
      url: cleanUrl,
      color: "#0284c7",
      badgeBg: "bg-sky-500/10 text-sky-400 border-sky-500/30",
      borderColor: "border-sky-500",
      marketShare: "%12 Pazar Payı",
      domainAuthority: 52,
      isSelected: true,
      isCustom: true
    };

    setCompetitors(prev => [...prev, newComp]);
    setNewCompetitorName("");
    setNewCompetitorUrl("");
    setShowAddCompetitorModal(false);
    showToast(`"${newComp.name}" karşılaştırma haritasına eklendi!`);
  };

  // Keyword actions
  const handleAddKeywordToSite = (kw: ContentGapKeyword) => {
    if (!siteConfig || !onUpdateSiteConfig) {
      navigator.clipboard?.writeText(kw.keyword);
      showToast(`"${kw.keyword}" panoya kopyalandı!`);
      return;
    }

    const currentKeywords = siteConfig.seo?.keywords || "";
    const list = currentKeywords.split(",").map(s => s.trim()).filter(Boolean);

    if (!list.some(k => k.toLowerCase() === kw.keyword.toLowerCase())) {
      list.unshift(kw.keyword);
      const updated: SiteConfig = {
        ...siteConfig,
        seo: {
          ...siteConfig.seo,
          keywords: list.join(", ")
        }
      };
      onUpdateSiteConfig(updated);
      showToast(`"${kw.keyword}" site hedef anahtar kelimelerine eklendi!`);
    } else {
      showToast(`"${kw.keyword}" zaten sitenizde kayıtlı.`, "info");
    }
  };

  const handleApplyAllMissingKeywords = () => {
    if (!siteConfig || !onUpdateSiteConfig) {
      showToast("Site konfigürasyonu güncellenemedi.", "info");
      return;
    }

    const missingKws = report.keywords
      .filter(k => k.status === "critical" || k.status === "opportunity")
      .map(k => k.keyword);

    const currentKeywords = siteConfig.seo?.keywords || "";
    const existingList = currentKeywords.split(",").map(s => s.trim()).filter(Boolean);

    const merged = Array.from(new Set([...missingKws, ...existingList]));
    const updated: SiteConfig = {
      ...siteConfig,
      seo: {
        ...siteConfig.seo,
        keywords: merged.join(", ")
      }
    };

    onUpdateSiteConfig(updated);
    showToast(`${missingKws.length} adet eksik anahtar kelime sitenize topluca eklendi!`);
  };

  // Add blog post from gap
  const handlePublishBlogFromGap = (kw: ContentGapKeyword) => {
    if (!siteConfig || !onUpdateSiteConfig) {
      showToast("Blog güncellenemedi.", "info");
      return;
    }

    const newPost: BlogPostItem = generateBlogPostFromGap(kw, activeCompany);
    const existingPosts = siteConfig.blog?.items || [];

    const updated: SiteConfig = {
      ...siteConfig,
      blog: {
        ...siteConfig.blog,
        enabled: true,
        items: [newPost, ...existingPosts]
      }
    };

    onUpdateSiteConfig(updated);
    setBriefModalKeyword(null);
    showToast(`"${kw.suggestedTitle}" başlıklı blog içeriği sitenize eklendi!`);
  };

  // CSV Export
  const handleDownloadCsv = () => {
    const csvContent = exportContentGapToCSV(report);
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Icerik_Boslugu_Haritasi_${activeCompany.replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("İçerik Boşluğu Haritası CSV dosyası indirildi.");
  };

  // Filtered & Sorted Keywords
  const filteredKeywords = useMemo(() => {
    return report.keywords.filter(kw => {
      const matchesStatus = statusFilter === "all" || kw.status === statusFilter;
      const matchesCluster = clusterFilter === "all" || kw.cluster === clusterFilter;
      const matchesSearch = kw.keyword.toLowerCase().includes(searchQuery.toLowerCase()) ||
        kw.suggestedTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        kw.cluster.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesCluster && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === "volume") return b.monthlyVolume - a.monthlyVolume;
      if (sortBy === "difficulty") return a.difficulty - b.difficulty;
      if (sortBy === "loss") return b.estimatedTrafficLoss - a.estimatedTrafficLoss;
      return b.potentialTrafficGain - a.potentialTrafficGain;
    });
  }, [report.keywords, statusFilter, clusterFilter, searchQuery, sortBy]);

  // --------------------------------------------------------------------------
  // D3.JS INTERACTIVE CONTENT GAP SCATTER / BUBBLE MAP
  // --------------------------------------------------------------------------
  const d3ContainerRef = useRef<HTMLDivElement>(null);
  const [hoveredKeyword, setHoveredKeyword] = useState<ContentGapKeyword | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!d3ContainerRef.current) return;
    const container = d3ContainerRef.current;
    container.innerHTML = "";

    const width = container.clientWidth || 800;
    const height = 420;
    const margin = { top: 40, right: 35, bottom: 50, left: 65 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("class", "overflow-visible select-none");

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear()
      .domain([10, 55]) // Difficulty KD
      .range([0, innerWidth]);

    const maxVol = d3.max(report.keywords, d => d.monthlyVolume) || 10000;
    const yScale = d3.scaleLinear()
      .domain([0, maxVol * 1.15])
      .range([innerHeight, 0]);

    const radiusScale = d3.scaleSqrt()
      .domain([1000, maxVol])
      .range([12, 28]);

    // Strategic Quadrant Backgrounds
    const midX = xScale(32);
    const midY = yScale(maxVol * 0.45);

    // Top-Left Quadrant: Golden Opportunity
    g.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", midX)
      .attr("height", midY)
      .attr("fill", "#6366f1")
      .attr("opacity", 0.04)
      .attr("rx", 12);

    g.append("text")
      .attr("x", 12)
      .attr("y", 22)
      .attr("fill", "#6366f1")
      .attr("font-size", "11px")
      .attr("font-weight", "800")
      .text("🌟 Altın Fırsat Alanı (Düşük Rekabet & Yüksek Hacim)");

    // Top-Right Quadrant: Critical Battleground
    g.append("rect")
      .attr("x", midX)
      .attr("y", 0)
      .attr("width", innerWidth - midX)
      .attr("height", midY)
      .attr("fill", "#ef4444")
      .attr("opacity", 0.04)
      .attr("rx", 12);

    g.append("text")
      .attr("x", innerWidth - 12)
      .attr("y", 22)
      .attr("text-anchor", "end")
      .attr("fill", "#ef4444")
      .attr("font-size", "11px")
      .attr("font-weight", "800")
      .text("⚔️ Rakiplerin Hakimiyet Alanı (Kritik Eksikler)");

    // Grid lines
    g.append("g")
      .attr("class", "grid")
      .attr("opacity", 0.1)
      .call(
        d3.axisLeft(yScale)
          .ticks(5)
          .tickSize(-innerWidth)
          .tickFormat(() => "")
      );

    g.append("g")
      .attr("class", "grid")
      .attr("opacity", 0.1)
      .attr("transform", `translate(0,${innerHeight})`)
      .call(
        d3.axisBottom(xScale)
          .ticks(5)
          .tickSize(-innerHeight)
          .tickFormat(() => "")
      );

    // X Axis
    const xAxis = d3.axisBottom(xScale)
      .ticks(6)
      .tickFormat(d => `%${d} KD`);

    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis)
      .call(g => g.select(".domain").attr("stroke", "#cbd5e1"))
      .call(g => g.selectAll(".tick text").attr("fill", "#64748b").attr("font-size", "11px").attr("font-weight", "600"));

    // X Axis Label
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 40)
      .attr("text-anchor", "middle")
      .attr("fill", "#475569")
      .attr("font-size", "11px")
      .attr("font-weight", "700")
      .text("Anahtar Kelime Zorluğu (Keyword Difficulty KD %)");

    // Y Axis
    const yAxis = d3.axisLeft(yScale)
      .ticks(6)
      .tickFormat(d => `${d.valueOf().toLocaleString("tr-TR")}`);

    g.append("g")
      .call(yAxis)
      .call(g => g.select(".domain").attr("stroke", "#cbd5e1"))
      .call(g => g.selectAll(".tick text").attr("fill", "#64748b").attr("font-size", "11px").attr("font-weight", "600"));

    // Y Axis Label
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -48)
      .attr("text-anchor", "middle")
      .attr("fill", "#475569")
      .attr("font-size", "11px")
      .attr("font-weight", "700")
      .text("Aylık Tahmini Arama Hacmi (Google TR)");

    // Color mapper for status
    const getColor = (status: ContentGapKeyword["status"]) => {
      switch (status) {
        case "critical": return { fill: "#ef4444", stroke: "#b91c1c" };
        case "weak": return { fill: "#f59e0b", stroke: "#b45309" };
        case "opportunity": return { fill: "#6366f1", stroke: "#4338ca" };
        case "winning": return { fill: "#10b981", stroke: "#047857" };
      }
    };

    // Render Bubbles
    const nodes = g.selectAll(".bubble-node")
      .data(report.keywords)
      .enter()
      .append("g")
      .attr("class", "bubble-node cursor-pointer")
      .attr("transform", d => `translate(${xScale(d.difficulty)},${yScale(d.monthlyVolume)})`)
      .on("mouseenter", (event, d) => {
        setHoveredKeyword(d);
        const rect = container.getBoundingClientRect();
        setTooltipPos({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top
        });
      })
      .on("mousemove", (event) => {
        const rect = container.getBoundingClientRect();
        setTooltipPos({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top
        });
      })
      .on("mouseleave", () => {
        setHoveredKeyword(null);
        setTooltipPos(null);
      })
      .on("click", (_event, d) => {
        setSelectedKeywordId(d.id);
        setBriefModalKeyword(d);
      });

    // Outer glow / ripple circle
    nodes.append("circle")
      .attr("r", d => radiusScale(d.monthlyVolume) + 4)
      .attr("fill", d => getColor(d.status).fill)
      .attr("opacity", 0.15)
      .attr("class", "transition-all duration-300");

    // Main Circle
    nodes.append("circle")
      .attr("r", d => radiusScale(d.monthlyVolume))
      .attr("fill", d => getColor(d.status).fill)
      .attr("stroke", d => getColor(d.status).stroke)
      .attr("stroke-width", 2)
      .attr("opacity", d => (selectedKeywordId === d.id ? 1 : 0.85))
      .attr("filter", "drop-shadow(0 4px 6px rgba(0,0,0,0.1))")
      .attr("class", "transition-transform duration-200 hover:scale-110");

    // Inside text (Volume or rank)
    nodes.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", ".3em")
      .attr("fill", "#ffffff")
      .attr("font-size", d => (radiusScale(d.monthlyVolume) > 18 ? "10px" : "9px"))
      .attr("font-weight", "bold")
      .text(d => {
        if (d.monthlyVolume >= 1000) {
          return `${(d.monthlyVolume / 1000).toFixed(1)}k`;
        }
        return d.monthlyVolume;
      });

    // Label below circle for prominent keywords
    nodes.filter(d => d.monthlyVolume >= 4500 || d.status === "opportunity")
      .append("text")
      .attr("text-anchor", "middle")
      .attr("y", d => radiusScale(d.monthlyVolume) + 14)
      .attr("fill", "#1e293b")
      .attr("font-size", "10px")
      .attr("font-weight", "700")
      .attr("class", "pointer-events-none")
      .text(d => {
        const words = d.keyword.split(" ");
        return words.length > 3 ? `${words.slice(0, 3).join(" ")}...` : d.keyword;
      });

  }, [report.keywords, selectedKeywordId]);

  return (
    <div
      id="content-gap-map-component"
      className={`bg-white rounded-3xl border-2 border-indigo-500/30 shadow-xl overflow-hidden space-y-8 ${className}`}
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            id="content-gap-toast"
            className="fixed top-6 right-6 z-50 bg-slate-950 text-white px-5 py-3 rounded-2xl shadow-2xl border border-indigo-500/50 flex items-center gap-3 text-sm font-semibold backdrop-blur-md"
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <HelpCircle className="w-5 h-5 text-sky-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===================================================================== */}
      {/* 1. TOP EXECUTIVE BANNER & HIGH LEVEL METRICS */}
      {/* ===================================================================== */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-300 text-xs font-black tracking-wide">
                <Compass className="w-3.5 h-3.5 text-rose-400" />
                <span>İçerik Boşluğu Haritası (Content Gap Map)</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-bold">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>D3.js Kümeleme & Fırsat Radarı</span>
              </span>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                {activeCity} • {activeSector}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Seçili Rakiplerin İçerik Boşlukları ve Eksik Anahtar Kelimeler
            </h2>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Rakiplerinizin Google ilk sayfasında yer alıp sitenizin henüz içerik üretmediği yüksek arama hacimli kelimeleri keşfedin. 
              Eksik içerikleri tek tıkla blog veya açılış sayfası olarak üreterek kaçırılan organik trafiği sitenize çekin.
            </p>
          </div>

          {/* Quick Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              id="content-gap-apply-all-btn"
              onClick={handleApplyAllMissingKeywords}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs sm:text-sm font-black flex items-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer ring-1 ring-indigo-400/40"
            >
              <Plus className="w-4 h-4 text-cyan-200" />
              <span>Tüm Eksik Kelimeleri Siteye Ekle</span>
            </button>

            <button
              type="button"
              id="content-gap-download-csv-btn"
              onClick={handleDownloadCsv}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
              title="CSV olarak indir"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>CSV İndir</span>
            </button>
          </div>
        </div>

        {/* 4 Key Executive Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
          {/* Card 1: Content Coverage */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 relative overflow-hidden">
            <div className="text-[11px] uppercase font-bold text-slate-400 flex items-center justify-between">
              <span>İçerik Kapsam Skoru</span>
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="flex items-baseline gap-2 my-1">
              <span className="text-2xl sm:text-3xl font-black text-cyan-300 font-mono">
                %{report.overallStats.overallCoverageScore}
              </span>
              <span className="text-xs font-semibold text-rose-300">
                (%{report.overallStats.gapScore} Eksik Boşluk)
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500 rounded-full"
                style={{ width: `${report.overallStats.overallCoverageScore}%` }}
              />
            </div>
          </div>

          {/* Card 2: Missing Keywords Count */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
            <div className="text-[11px] uppercase font-bold text-slate-400 flex items-center justify-between">
              <span>Tespit Edilen Boşluk</span>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono my-1">
              {report.overallStats.missingKeywordsCount} Kritik
            </div>
            <div className="text-[11px] text-amber-300 font-medium">
              +{report.overallStats.weakKeywordsCount} zayıf sıralama, {report.overallStats.opportunityKeywordsCount} altın fırsat
            </div>
          </div>

          {/* Card 3: Missed Traffic */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
            <div className="text-[11px] uppercase font-bold text-slate-400 flex items-center justify-between">
              <span>Kaçırılan Aylık Ziyaret</span>
              <Users className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono my-1">
              {report.overallStats.totalMissedMonthlyTraffic.toLocaleString("tr-TR")}+
            </div>
            <div className="text-[11px] text-slate-300 font-medium">
              Doğrudan rakiplere giden organik arama
            </div>
          </div>

          {/* Card 4: Potential Revenue Loss */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
            <div className="text-[11px] uppercase font-bold text-slate-400 flex items-center justify-between">
              <span>Kaçırılan Potansiyel Ciro</span>
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono my-1">
              {report.overallStats.estimatedMonthlyRevenueLoss}
            </div>
            <div className="text-[11px] text-emerald-300/90 font-medium">
              Hedef ilk 3 içerik kapatıldığında
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. COMPETITOR SELECTOR & MULTI-COMPARATOR BAR */}
      {/* ===================================================================== */}
      <div className="px-6 sm:px-8 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <span>Karşılaştırılan Rakipleri Seçin (Çoklu Karşılaştırma):</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              İşaretli rakipler değiştikçe içerik boşlukları ve eksik kelimeler dinamik olarak anında güncellenir.
            </p>
          </div>

          <button
            type="button"
            id="add-custom-competitor-btn"
            onClick={() => setShowAddCompetitorModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-indigo-300 bg-indigo-50/70 hover:bg-indigo-100/70 text-indigo-700 text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Özel Rakip Ekle</span>
          </button>
        </div>

        {/* Competitor Chips */}
        <div className="flex flex-wrap items-center gap-3">
          {/* User's Site Anchor */}
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-cyan-50 border-2 border-cyan-400 text-cyan-950 text-xs font-bold shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 ring-2 ring-cyan-200 animate-pulse" />
            <span>Siteniz: <strong>{activeCompany}</strong> ({report.userDomain})</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-200/60 text-cyan-800 font-black">Referans</span>
          </div>

          {/* Competitor Toggle Chips */}
          {competitors.map(comp => (
            <button
              key={comp.id}
              type="button"
              id={`competitor-chip-${comp.id}`}
              onClick={() => handleToggleCompetitor(comp.id)}
              className={`inline-flex items-center gap-2.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
                comp.isSelected
                  ? `bg-white shadow-xs ${comp.borderColor} text-slate-900 ring-2 ring-indigo-500/20`
                  : "bg-slate-100/80 border-slate-200 text-slate-400 opacity-60 hover:opacity-90"
              }`}
            >
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: comp.isSelected ? comp.color : "#94a3b8" }}
              />
              <span className="font-extrabold">{comp.name}</span>
              <span className="text-[10px] font-mono opacity-75">({comp.domain})</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${comp.isSelected ? comp.badgeBg : "bg-slate-200 text-slate-600"}`}>
                DA: {comp.domainAuthority}
              </span>
              <div className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] ${comp.isSelected ? "bg-indigo-600 text-white" : "bg-slate-300 text-transparent"}`}>
                <Check className="w-3 h-3" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. INTERACTIVE D3.JS CONTENT GAP VISUALIZATION MAP */}
      {/* ===================================================================== */}
      <div className="px-6 sm:px-8 space-y-4">
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  İçerik Boşluğu Haritası (D3.js Arama Hacmi & Rekabet Zorluğu Dağılımı)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Her daire bir arama sorgusunu temsil eder. Daire boyutu aylık arama hacmini, dikey konum trafik potansiyelini, yatay konum ise rekabet zorluğunu gösterir.
              </p>
            </div>

            {/* Visual Legend */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span>Kritik Eksik (Rakiplerde Var)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span>Zayıf Kapsam</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-indigo-600" />
                <span>Altın Fırsat</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span>Kazanılmış</span>
              </div>
            </div>
          </div>

          {/* D3 Canvas Container */}
          <div className="relative bg-white rounded-2xl border border-slate-200 p-2 overflow-hidden shadow-inner">
            <div ref={d3ContainerRef} className="w-full min-h-[420px]" />

            {/* D3 Floating Tooltip */}
            {hoveredKeyword && tooltipPos && (
              <div
                className="absolute z-20 pointer-events-none bg-slate-950/95 text-white p-4 rounded-2xl shadow-2xl border border-indigo-500/50 w-72 backdrop-blur-md transition-all text-xs"
                style={{
                  left: Math.min(tooltipPos.x + 15, (d3ContainerRef.current?.clientWidth || 800) - 300),
                  top: Math.max(10, tooltipPos.y - 120)
                }}
              >
                <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
                  <span className="font-black text-cyan-300 text-sm">{hoveredKeyword.keyword}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-300">
                    {hoveredKeyword.searchIntent}
                  </span>
                </div>

                <div className="space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Aylık Arama:</span>
                    <strong className="text-white font-mono">{hoveredKeyword.monthlyVolume.toLocaleString("tr-TR")} arama/ay</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Zorluk Derecesi:</span>
                    <span className="font-bold text-amber-400">%{hoveredKeyword.difficulty} ({hoveredKeyword.difficultyLevel})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sitenizin Sıralaması:</span>
                    <span className="font-black text-rose-400">
                      {hoveredKeyword.userRank ? `#${hoveredKeyword.userRank}` : "❌ Eksik (Sıralama Yok)"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">En İyi Rakip:</span>
                    <span className="font-black text-emerald-400">#{hoveredKeyword.bestCompetitorRank}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800 pt-1.5 mt-1.5 text-amber-300 font-bold">
                    <span>Aylık Trafik Kaybı:</span>
                    <span>-{hoveredKeyword.estimatedTrafficLoss.toLocaleString("tr-TR")} ziyaretçi</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-cyan-200 font-semibold flex items-center justify-between">
                  <span>Taslak üretmek için tıklayın</span>
                  <ArrowUpRight className="w-3 h-3 text-cyan-400" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 4. TOPICAL CLUSTER GAP PROGRESS (İÇERİK KÜMELERİNE GÖRE KAPSAM) */}
      {/* ===================================================================== */}
      <div className="px-6 sm:px-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <span>Konu Kümelerine Göre İçerik Kapsamı (Siteniz vs. Rakipler)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Hangi konu başlığında rakiplerin ne kadar gerisinde olduğunuzu inceleyin; filtrelemek için ilgili kümeye tıklayın.
            </p>
          </div>

          {clusterFilter !== "all" && (
            <button
              type="button"
              onClick={() => setClusterFilter("all")}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Filtreyi Temizle</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {report.clusterSummaries.map((c) => {
            const isSelected = clusterFilter === c.cluster;
            return (
              <div
                key={c.cluster}
                onClick={() => setClusterFilter(isSelected ? "all" : c.cluster)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-indigo-50/80 border-indigo-400 shadow-md ring-2 ring-indigo-500/20"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="font-extrabold text-slate-900 text-sm">{c.cluster}</span>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                    {c.totalKeywords} Terim
                  </span>
                </div>

                <div className="space-y-2 mt-3 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-600 font-bold mb-1">
                      <span>Sitenizin Kapsamı</span>
                      <span className="text-indigo-700 font-black font-mono">%{c.userCoveragePercent}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                        style={{ width: `${c.userCoveragePercent}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-500 font-semibold mb-1 text-[11px]">
                      <span>Rakiplerin Kapsamı</span>
                      <span className="text-amber-700 font-black font-mono">%{c.competitorAverageCoveragePercent}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-300"
                        style={{ width: `${c.competitorAverageCoveragePercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-[11px]">
                  <span className="text-rose-600 font-bold">{c.missingCount} Kritik Boşluk</span>
                  <span className="text-slate-400 font-mono">{c.totalVolume.toLocaleString("tr-TR")} arama/ay</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 5. MISSING KEYWORDS GAP MATRIX TABLE */}
      {/* ===================================================================== */}
      <div className="px-6 sm:px-8 space-y-4" id="missing-keywords-table-section">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-rose-600" />
              <span>Eksik ve Fırsat Anahtar Kelimeler Matrisi</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono font-bold">
                {filteredKeywords.length} Sonuç
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Rakiplerin sıralamalarını, arama hacmini ve tek tıkla üretilebilecek içerik önerilerini inceleyin.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Kelime veya konu ara..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs">
              <Sliders className="w-3 h-3 text-slate-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent border-none text-xs font-bold text-slate-700 outline-hidden cursor-pointer"
              >
                <option value="loss">En Çok Trafik Kaybı</option>
                <option value="volume">En Yüksek Arama Hacmi</option>
                <option value="difficulty">En Kolay Zorluk (KD)</option>
                <option value="potential">En Yüksek Potansiyel</option>
              </select>
            </div>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span>Tüm Boşluklar</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
              {report.keywords.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("critical")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === "critical"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Kritik Eksikler (Sadece Rakiplerde Var)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-200 text-rose-900 font-mono">
              {report.keywords.filter(k => k.status === "critical").length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("weak")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === "weak"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Zayıf Kapsam (Rakipler İlk 3'te)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-900 font-mono">
              {report.keywords.filter(k => k.status === "weak").length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("opportunity")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === "opportunity"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>Altın Fırsatlar (Düşük KD & Kolay Sıralama)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-200 text-indigo-900 font-mono">
              {report.keywords.filter(k => k.status === "opportunity").length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("winning")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === "winning"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Kazanılanlar (İlk 3)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-200 text-emerald-900 font-mono">
              {report.keywords.filter(k => k.status === "winning").length}
            </span>
          </button>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-black">
                <th className="py-3 px-4">Anahtar Kelime & Niyet</th>
                <th className="py-3 px-3">Aylık Hacim</th>
                <th className="py-3 px-3">Zorluk (KD)</th>
                <th className="py-3 px-3">Seçili Rakiplerin Sıralaması</th>
                <th className="py-3 px-3">Sitenizin Durumu</th>
                <th className="py-3 px-3">Trafik Kaybı</th>
                <th className="py-3 px-4 text-right">Hızlı İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {filteredKeywords.map((kw) => {
                const isSelected = selectedKeywordId === kw.id;
                return (
                  <tr
                    key={kw.id}
                    id={`kw-row-${kw.id}`}
                    className={`transition-colors hover:bg-indigo-50/40 ${
                      isSelected ? "bg-indigo-50/70 font-medium" : "bg-white"
                    }`}
                  >
                    {/* Keyword & Cluster */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                          <span>{kw.keyword}</span>
                          {kw.status === "opportunity" && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-700 text-[10px] font-extrabold">
                              <Zap className="w-2.5 h-2.5" /> Fırsat
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                          <span
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold"
                            style={{ backgroundColor: `${kw.clusterColor}15`, color: kw.clusterColor }}
                          >
                            {kw.cluster}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold text-[10px]">
                            {kw.searchIntent}
                          </span>
                          <span className="text-slate-400 font-mono text-[10px]">
                            CPC: {kw.cpc}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Monthly Volume */}
                    <td className="py-3.5 px-3">
                      <div className="font-mono font-black text-slate-900 text-sm">
                        {kw.monthlyVolume.toLocaleString("tr-TR")}
                      </div>
                      <div className="text-[10px] text-slate-400">arama / ay</div>
                    </td>

                    {/* KD Difficulty */}
                    <td className="py-3.5 px-3">
                      <div className="inline-flex items-center gap-1">
                        <span className={`font-mono font-bold text-xs ${
                          kw.difficulty < 25 ? "text-emerald-600" : kw.difficulty < 40 ? "text-amber-600" : "text-rose-600"
                        }`}>
                          %{kw.difficulty}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
                          kw.difficultyLevel === "Kolay" ? "bg-emerald-100 text-emerald-800" :
                          kw.difficultyLevel === "Orta" ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"
                        }`}>
                          {kw.difficultyLevel}
                        </span>
                      </div>
                    </td>

                    {/* Competitors' Ranks */}
                    <td className="py-3.5 px-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {competitors.filter(c => c.isSelected).map((comp) => {
                          const rank = kw.competitorRanks[comp.id];
                          return (
                            <div
                              key={comp.id}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-bold"
                              style={{
                                borderColor: `${comp.color}50`,
                                backgroundColor: `${comp.color}10`,
                                color: comp.color
                              }}
                              title={`${comp.name}: Sıralama #${rank || "Yok"}`}
                            >
                              <span className="text-[10px] opacity-80">{comp.name.split(" ")[0]}:</span>
                              <strong className="font-mono">#{rank || "-"}</strong>
                            </div>
                          );
                        })}
                      </div>
                    </td>

                    {/* User's Rank Status */}
                    <td className="py-3.5 px-3">
                      {kw.userRank ? (
                        <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black ${
                          kw.userRank <= 3
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : "bg-amber-100 text-amber-800 border border-amber-300"
                        }`}>
                          {kw.userRank <= 3 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                          <span>Sıra #{kw.userRank}</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-100 text-rose-800 border border-rose-300 text-xs font-black">
                          <X className="w-3.5 h-3.5 text-rose-600" />
                          <span>❌ Eksik (İçerik Yok)</span>
                        </div>
                      )}
                    </td>

                    {/* Traffic Loss */}
                    <td className="py-3.5 px-3">
                      <div className="font-mono font-bold text-rose-600 text-xs">
                        -{kw.estimatedTrafficLoss.toLocaleString("tr-TR")}
                      </div>
                      <div className="text-[10px] text-slate-400">kaçırılan tık/ay</div>
                    </td>

                    {/* Quick Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          id={`draft-btn-${kw.id}`}
                          onClick={() => setBriefModalKeyword(kw)}
                          className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-all cursor-pointer active:scale-95"
                          title="İçerik taslağı ve blog rehberi üret"
                        >
                          <Sparkles className="w-3 h-3 text-cyan-200" />
                          <span>Taslak Üret</span>
                        </button>

                        <button
                          type="button"
                          id={`add-seo-btn-${kw.id}`}
                          onClick={() => handleAddKeywordToSite(kw)}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border border-slate-200 transition-all cursor-pointer"
                          title="Site hedef anahtar kelimelerine ekle"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          id={`serp-btn-${kw.id}`}
                          onClick={() => setSerpModalKeyword(kw)}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-all cursor-pointer"
                          title="Google SERP Simülasyonu"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 6. CONTENT BRIEF & AUTO-DRAFT BLOG MODAL */}
      {/* ===================================================================== */}
      <AnimatePresence>
        {briefModalKeyword && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-5 p-6 sm:p-7"
              id="content-brief-modal"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-black">
                      {briefModalKeyword.suggestedContentType}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">
                      Aylık {briefModalKeyword.monthlyVolume.toLocaleString("tr-TR")} Arama Hacmi
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900">
                    {briefModalKeyword.suggestedTitle}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setBriefModalKeyword(null)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Brief Details */}
              <div className="space-y-4 text-xs">
                {/* Meta details */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold">Hedef Anahtar Kelime:</span>
                    <strong className="text-indigo-600 font-black">{briefModalKeyword.keyword}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold">Önerilen URL Slug:</span>
                    <code className="text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 font-mono">
                      /{briefModalKeyword.suggestedSlug}
                    </code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold">Hedef Kelime Sayısı:</span>
                    <span className="font-bold text-slate-800">{briefModalKeyword.suggestedWordCount} kelime (Kapsamlı Rehber)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold">Tahmini Aylık Trafik Kazanımı:</span>
                    <span className="font-black text-emerald-600">+{briefModalKeyword.potentialTrafficGain.toLocaleString("tr-TR")} Ziyaretçi</span>
                  </div>
                </div>

                {/* Subheadings Outline */}
                <div className="space-y-2">
                  <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Önerilen H2 ve H3 Başlık Hiyerarşisi:</span>
                  </h4>
                  <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    {briefModalKeyword.keySubheadings.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-slate-700 font-semibold">
                        <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center font-mono font-bold text-[10px]">
                          H{i % 2 === 0 ? "2" : "3"}
                        </span>
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* LSI Keywords */}
                <div className="space-y-2">
                  <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px]">
                    İçerikte Mutlaka Geçmesi Gereken LSI Terimleri:
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {briefModalKeyword.lsiKeywords.map((l, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold text-[11px]">
                        #{l}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(
                      `${briefModalKeyword.suggestedTitle}\n\nHedef Kelime: ${briefModalKeyword.keyword}\n\nBaşlıklar:\n${briefModalKeyword.keySubheadings.map(s => `- ${s}`).join("\n")}`
                    );
                    setCopiedId(briefModalKeyword.id);
                    setTimeout(() => setCopiedId(null), 2000);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  {copiedId === briefModalKeyword.id ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Kopyalandı!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-500" />
                      <span>Taslağı Kopyala</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  id="publish-blog-from-gap-btn"
                  onClick={() => handlePublishBlogFromGap(briefModalKeyword)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-lg cursor-pointer active:scale-95 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                  <span>Bu İçeriği Sitenin Bloguna Ekle</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===================================================================== */}
      {/* 7. GOOGLE SERP PREVIEW SIMULATION MODAL */}
      {/* ===================================================================== */}
      <AnimatePresence>
        {serpModalKeyword && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4"
              id="serp-preview-modal"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  <h4 className="text-base font-black text-slate-900">
                    Google SERP Simülasyonu: "{serpModalKeyword.keyword}"
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setSerpModalKeyword(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Google Search Bar Mock */}
              <div className="bg-slate-100 p-3 rounded-2xl flex items-center gap-2 text-xs text-slate-700 font-semibold border border-slate-200">
                <Search className="w-4 h-4 text-slate-400" />
                <span>{serpModalKeyword.keyword}</span>
                <span className="ml-auto text-[10px] text-slate-400 font-mono">Google Türkiye</span>
              </div>

              {/* Competitors' Current Positions vs Potential */}
              <div className="space-y-3 pt-2 text-xs">
                {/* #1 Competitor Result */}
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
                  <div className="text-[10px] font-bold text-amber-700 flex items-center justify-between">
                    <span>#1 Sıradaki Rakip (Mevcut Lider)</span>
                    <span>DA: 78</span>
                  </div>
                  <div className="text-blue-700 font-bold text-sm hover:underline cursor-pointer">
                    {serpModalKeyword.suggestedTitle} - Lider Rakip
                  </div>
                  <div className="text-[11px] text-emerald-800 font-mono">
                    https://eniyisektor.com/{serpModalKeyword.suggestedSlug}
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {activeCity} bölgesinde 7/24 kesintisiz hizmet, uygun fiyat tarifesi ve profesyonel ekiplerle anında destek...
                  </p>
                </div>

                {/* Our Future Result */}
                <div className="p-3 bg-cyan-50/80 border-2 border-dashed border-cyan-400 rounded-xl space-y-1">
                  <div className="text-[10px] font-bold text-cyan-800 flex items-center justify-between">
                    <span>🌟 Hedeflenen Sıralamanız (#1 - #2)</span>
                    <span className="px-2 py-0.2 rounded-full bg-cyan-200 text-cyan-900 font-extrabold">Yeni İçerik</span>
                  </div>
                  <div className="text-indigo-700 font-bold text-sm">
                    {serpModalKeyword.suggestedTitle} - {activeCompany}
                  </div>
                  <div className="text-[11px] text-cyan-700 font-mono">
                    https://{report.userDomain}/{serpModalKeyword.suggestedSlug}
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {activeCompany} güvencesiyle {activeCity} {activeSector} hizmetlerinde şeffaf fiyatlar, kaskolu taşıma ve anında konum paylaşımı...
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setBriefModalKeyword(serpModalKeyword);
                    setSerpModalKeyword(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Bu İçerik İçin Taslak Üret
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===================================================================== */}
      {/* 8. ADD CUSTOM COMPETITOR MODAL */}
      {/* ===================================================================== */}
      <AnimatePresence>
        {showAddCompetitorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4"
              id="add-custom-competitor-modal"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-indigo-600" />
                  <span>Özel Rakip Ekle</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setShowAddCompetitorModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddCustomCompetitor} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Rakip İşletme / Firma Adı:</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Anadolu Yol Yardım A.Ş."
                    value={newCompetitorName}
                    onChange={(e) => setNewCompetitorName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Rakip Web Sitesi / Alan Adı (URL):</label>
                  <input
                    type="text"
                    required
                    placeholder="https://anadoluyolyardim.com.tr"
                    value={newCompetitorUrl}
                    onChange={(e) => setNewCompetitorUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddCompetitorModal(false)}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold cursor-pointer"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black cursor-pointer shadow-xs"
                  >
                    Haritaya Ekle & Tara
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
