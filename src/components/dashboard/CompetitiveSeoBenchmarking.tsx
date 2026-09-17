import React, { useState, useEffect, useMemo } from "react";
import {
  SiteConfig,
  CompetitiveBenchmarkingData,
  CompetitorDomainAuthority,
  CompetitorKeywordRanking,
  GroundingSourceItem
} from "../../types";
import { generateFallbackBenchmarkingData } from "../../utils/competitiveSeoUtils";
import {
  Trophy,
  Target,
  ShieldCheck,
  Zap,
  Globe,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Search,
  Filter,
  Download,
  Plus,
  Check,
  Award,
  AlertTriangle,
  Flame,
  Layers,
  BarChart3,
  HelpCircle,
  ChevronRight,
  Copy,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sliders,
  Info,
  Clock,
  Building2,
  Compass,
  FileText
} from "lucide-react";

export interface CompetitiveSeoBenchmarkingProps {
  config: SiteConfig;
  onChange?: (newConfig: SiteConfig) => void;
  onNavigateTab?: (tab: string, state?: any) => void;
  onApplyKeyword?: (keyword: string) => void;
  onSendToAiBlog?: (keyword: string, draftTitle?: string) => void;
  className?: string;
}

export const CompetitiveSeoBenchmarking: React.FC<CompetitiveSeoBenchmarkingProps> = ({
  config,
  onChange,
  onNavigateTab,
  onApplyKeyword,
  onSendToAiBlog,
  className = ""
}) => {
  // 1. Core State
  const [data, setData] = useState<CompetitiveBenchmarkingData>(() =>
    generateFallbackBenchmarkingData(config)
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLiveGrounding, setIsLiveGrounding] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"authority" | "rankings" | "all">("all");
  
  // Custom Competitor Adders
  const [customCompetitors, setCustomCompetitors] = useState<{ name: string; domain: string }[]>([
    { name: "1. Lider Rakip", domain: "otokurtarmacim.com" },
    { name: "2. Yerel Rakip", domain: "istanbulyolyardim.com.tr" },
    { name: "3. Bölgesel Rakip", domain: "turkiyecekici.com" }
  ]);
  const [showAddCompetitorModal, setShowAddCompetitorModal] = useState<boolean>(false);
  const [newCompName, setNewCompName] = useState<string>("");
  const [newCompDomain, setNewCompDomain] = useState<string>("");

  // Keyword Table Filter & Sort
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [rankingFilter, setRankingFilter] = useState<"all" | "leading" | "competing" | "trailing" | "missing">("all");
  const [intentFilter, setIntentFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"gap" | "volume" | "difficulty" | "userRank">("gap");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [expandedKeywordId, setExpandedKeywordId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [addedKeyword, setAddedKeyword] = useState<string | null>(null);

  // Sync initial state if config changes
  useEffect(() => {
    setData((prev) => {
      // If we don't have fresh custom data, re-evaluate with current config
      if (!isLiveGrounding) {
        return generateFallbackBenchmarkingData(config, customCompetitors);
      }
      return prev;
    });
  }, [config.companyName, config.sector, config.city]);

  // 2. Live Fetch Function: calls /api/competitive-benchmarking
  const fetchLiveBenchmarking = async (comps = customCompetitors) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/competitive-benchmarking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: config.companyName || "Siteniz",
          sector: config.sector || "Oto Çekici & Yol Yardım",
          city: config.city || "İstanbul",
          domain: config.cloudflare?.customDomain || config.cloudflare?.subdomain || "sitemiz.com.tr",
          customCompetitors: comps,
          config
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success && result.data) {
        setData(result.data);
        setIsLiveGrounding(result.source === "gemini_grounding");
      } else {
        const fallback = generateFallbackBenchmarkingData(config, comps);
        setData(fallback);
        setIsLiveGrounding(false);
      }
    } catch (err) {
      console.warn("Live benchmarking failed, serving local fallback model:", err);
      const fallback = generateFallbackBenchmarkingData(config, comps);
      setData(fallback);
      setIsLiveGrounding(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Add Custom Competitor Handler
  const handleAddCompetitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompDomain.trim()) return;
    const cleanDomain = newCompDomain.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
    const cleanName = newCompName.trim() || cleanDomain;

    const updated = [
      ...customCompetitors.slice(0, 2),
      { name: cleanName, domain: cleanDomain }
    ];
    setCustomCompetitors(updated);
    setNewCompName("");
    setNewCompDomain("");
    setShowAddCompetitorModal(false);

    // Trigger instant live fetch with updated competitor list
    fetchLiveBenchmarking(updated);
  };

  // 3. Filtered & Sorted Keywords
  const filteredKeywords = useMemo(() => {
    return (data.keywordRankings || [])
      .filter((k) => {
        // Search Filter
        if (searchTerm.trim()) {
          const s = searchTerm.toLowerCase();
          const matchKw = k.keyword.toLowerCase().includes(s);
          const matchIntent = k.searchIntent.toLowerCase().includes(s);
          if (!matchKw && !matchIntent) return false;
        }
        // Status Filter
        if (rankingFilter === "leading" && k.status !== "leading") return false;
        if (rankingFilter === "competing" && k.status !== "competing") return false;
        if (rankingFilter === "trailing" && k.status !== "trailing") return false;
        if (rankingFilter === "missing" && k.status !== "missing") return false;
        // Intent Filter
        if (intentFilter !== "all" && k.searchIntent !== intentFilter) return false;
        return true;
      })
      .sort((a, b) => {
        let valA = 0;
        let valB = 0;

        if (sortBy === "gap") {
          valA = a.gap;
          valB = b.gap;
        } else if (sortBy === "volume") {
          valA = parseFloat(a.monthlyVolume) || 0;
          valB = parseFloat(b.monthlyVolume) || 0;
        } else if (sortBy === "difficulty") {
          valA = a.difficulty;
          valB = b.difficulty;
        } else if (sortBy === "userRank") {
          valA = a.userRank || 99;
          valB = b.userRank || 99;
        }

        return sortOrder === "asc" ? valA - valB : valB - valA;
      });
  }, [data.keywordRankings, searchTerm, rankingFilter, intentFilter, sortBy, sortOrder]);

  // Copy keyword helper
  const handleCopyKeyword = (kw: string, id: string) => {
    navigator.clipboard?.writeText(kw);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Add to Config Meta Keywords helper
  const handleAddToKeywords = (kw: string) => {
    if (!onChange) return;
    const existing = Array.isArray(config.seo?.keywords)
      ? config.seo.keywords
      : typeof config.seo?.keywords === "string"
      ? config.seo.keywords.split(",").map((k) => k.trim()).filter(Boolean)
      : [];

    if (!existing.includes(kw)) {
      const updated = [...existing, kw];
      onChange({
        ...config,
        seo: {
          ...config.seo,
          keywords: updated.join(", ")
        }
      });
      setAddedKeyword(kw);
      setTimeout(() => setAddedKeyword(null), 2500);
    }
  };

  // CSV Export
  const handleExportCsv = () => {
    const headers = [
      "Anahtar Kelime",
      "Arama Niyeti",
      "Aylık Hacim",
      "Zorluk",
      "Siteniz Sırası",
      "1. Rakip Sırası",
      "2. Rakip Sırası",
      "3. Rakip Sırası",
      "Sıralama Farkı (Gap)",
      "Trafik Potansiyeli",
      "Yapay Zeka Strateji Önerisi"
    ];

    const rows = (data.keywordRankings || []).map((k) => [
      `"${k.keyword}"`,
      `"${k.searchIntent}"`,
      `"${k.monthlyVolume}"`,
      k.difficulty,
      k.userRank || "20+",
      k.comp1Rank || "-",
      k.comp2Rank || "-",
      k.comp3Rank || "-",
      k.gap,
      `"${k.trafficOpportunity}"`,
      `"${k.aiRecommendation?.replace(/"/g, '""') || ""}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `competitive-seo-benchmarking-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const userAuthority = data.domainAuthorities.find((d) => d.isUser) || data.domainAuthorities[0];
  const competitorsAuthority = data.domainAuthorities.filter((d) => !d.isUser);

  return (
    <div
      id="competitive-seo-benchmarking-container"
      className={`bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-8 text-slate-100 shadow-xl relative overflow-hidden ${className}`}
    >
      {/* Background Decorative Blur */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* ===================================================================== */}
      {/* 1. HEADER SECTION & LIVE BENCHMARKING CONTROLS */}
      {/* ===================================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10 border-b border-slate-800/80 pb-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              Competitive SEO Benchmarking
            </span>

            {isLiveGrounding ? (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Google SERP Canlı Grounding
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-400" />
                Sektörel Standart Model
              </span>
            )}

            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {data.analyzedAt}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Rakip SEO Kıyaslama &amp; Otorite Matrisi
          </h2>
          <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
            Sitenizin <span className="text-amber-400 font-semibold">{data.city} {data.sector}</span> pazarındaki
            en güçlü 3 organik rakibine karşı <span className="text-white font-medium">Domain Authority (DA)</span>,
            backlink hacmi ve <span className="text-white font-medium">anahtar kelime sıralama (head-to-head)</span> pozisyonlarını
            canlı verilerle kıyaslayın.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            id="btn-add-competitor-modal"
            onClick={() => setShowAddCompetitorModal(true)}
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-2 cursor-pointer shadow-sm hover:text-white"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Özel Rakip Ekle</span>
          </button>

          <button
            type="button"
            id="btn-export-benchmarking-csv"
            onClick={handleExportCsv}
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-2 cursor-pointer shadow-sm hover:text-white"
            title="Kıyaslama verilerini CSV olarak indir"
          >
            <Download className="w-4 h-4 text-blue-400" />
            <span>CSV İndir</span>
          </button>

          <button
            type="button"
            id="btn-fetch-live-competitor-benchmarking"
            disabled={isLoading}
            onClick={() => fetchLiveBenchmarking()}
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-slate-950" : ""}`} />
            <span>{isLoading ? "Canlı Taranıyor..." : "Canlı Veri Çek & Kıyasla"}</span>
          </button>
        </div>
      </div>

      {/* Loading Banner Notification */}
      {isLoading && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center gap-3 animate-pulse">
          <RefreshCw className="w-5 h-5 text-amber-400 animate-spin shrink-0" />
          <div className="text-xs text-amber-200">
            <span className="font-bold text-amber-300">Canlı Arama Motoru Verileri Çekiliyor:</span> Google SERP,
            rakip domain otorite göstergeleri (DA/PA), backlink tahminleri ve anahtar kelime sıralama farkları inceleniyor...
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. EXECUTIVE KPI BENCHMARKING SUMMARY */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {/* KPI 1: Domain Authority (DA) Comparison */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Domain Authority (DA)
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              data.summary.daGap >= 0
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
            }`}>
              {data.summary.daGap >= 0 ? `+${data.summary.daGap} DA Önde` : `${data.summary.daGap} DA Geride`}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{data.summary.userDa}</span>
            <span className="text-xs text-slate-400">/ 100 DA</span>
            <span className="text-xs text-slate-500 ml-auto">
              Rakip Ort: <span className="text-slate-300 font-bold">{data.summary.avgCompetitorDa}</span>
            </span>
          </div>

          {/* Dual comparison bar */}
          <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden flex">
            <div
              className="bg-amber-400 h-full rounded-full transition-all"
              style={{ width: `${data.summary.userDa}%` }}
              title={`Siteniz: ${data.summary.userDa} DA`}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
            <span>Siteniz: <strong className="text-amber-300">{data.summary.userDa} DA</strong></span>
            <span>Rakipler: <strong className="text-slate-300">{data.summary.avgCompetitorDa} DA</strong></span>
          </div>
        </div>

        {/* KPI 2: Keyword Ranking Leadership */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Trophy className="w-4 h-4 text-emerald-400" />
              Sıralama Liderliği
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {data.summary.leadingKeywordsCount} Kelimede 1.
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400">
              {data.summary.leadingKeywordsCount}
            </span>
            <span className="text-xs text-slate-400">Önde</span>
            <span className="text-xs text-slate-500 ml-auto">
              Toplam: <strong className="text-slate-300">{data.keywordRankings.length} Anahtar Kelime</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-1">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              {data.summary.leadingKeywordsCount} Önde
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              {data.summary.competingKeywordsCount} Yarışta
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              {data.summary.trailingKeywordsCount} Geride
            </span>
          </div>
        </div>

        {/* KPI 3: Organic Traffic Opportunity */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              Organik Trafik Fırsatı
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              SERP Açığı
            </span>
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-blue-400">
              {data.summary.totalTrafficOpportunity.split(" ")[0]}
            </span>
            <span className="text-xs text-slate-400 font-medium">Aylık Tıklama</span>
          </div>

          <p className="text-[11px] text-slate-400 line-clamp-2">
            Rakiplerin önünüzde olduğu ticari anahtar kelimeleri yakalayarak kazanılabilecek tahmini organik hacim.
          </p>
        </div>

        {/* KPI 4: Technical & Speed Advantage */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Zap className="w-4 h-4 text-amber-400" />
              Teknik Hız Üstünlüğü
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Core Web Vitals
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-400">
              {userAuthority?.speedScore || 98}
            </span>
            <span className="text-xs text-slate-400">/ 100 Hız</span>
            <span className="text-xs text-slate-500 ml-auto">
              Rakip Ort: <strong className="text-slate-300">{Math.round(competitorsAuthority.reduce((a, b) => a + b.speedScore, 0) / competitorsAuthority.length) || 74}</strong>
            </span>
          </div>

          <p className="text-[11px] text-slate-300 line-clamp-2">
            {data.summary.keyCompetitiveAdvantage}
          </p>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. VIEW SUBTABS TOGGLE */}
      {/* ===================================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-2xl border border-slate-800">
          <button
            type="button"
            id="benchmarking-tab-all"
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "all"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Tüm Kıyaslama Görünümü
          </button>

          <button
            type="button"
            id="benchmarking-tab-authority"
            onClick={() => setActiveTab("authority")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "authority"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>1. Domain Authority Tablosu</span>
          </button>

          <button
            type="button"
            id="benchmarking-tab-rankings"
            onClick={() => setActiveTab("rankings")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "rankings"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>2. Keyword Rankings Tablosu</span>
          </button>
        </div>

        {/* Feedback notification when keyword added */}
        {addedKeyword && (
          <div className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>&ldquo;{addedKeyword}&rdquo; site SEO anahtar kelimelerinize eklendi!</span>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* 4. TABLE 1: DOMAIN AUTHORITY (DA) COMPARISON TABLE */}
      {/* ===================================================================== */}
      {(activeTab === "all" || activeTab === "authority") && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <span>Domain Authority (DA) &amp; Otorite Metrikleri Kıyaslaması</span>
              </h3>
              <p className="text-xs text-slate-400">
                Sitenizin ve competing sitelerin Moz/Ahrefs tarzı Domain Authority (DA: 0-100), tahmini backlink profili,
                yönlendiren domainleri ve teknik indeks derinliği.
              </p>
            </div>
            <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-xl border border-slate-700 w-fit">
              Ölçek: 0 - 100 Logaritmik Otorite Skoru
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60 shadow-inner">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Web Sitesi / Domain</th>
                  <th className="py-3.5 px-3">Domain Authority (DA)</th>
                  <th className="py-3.5 px-3">Page Auth (PA)</th>
                  <th className="py-3.5 px-3">Backlink &amp; RD</th>
                  <th className="py-3.5 px-3">Organik Görünürlük</th>
                  <th className="py-3.5 px-3">İndeksli Sayfa</th>
                  <th className="py-3.5 px-3">Mobil Hız</th>
                  <th className="py-3.5 px-3">Spam Skoru</th>
                  <th className="py-3.5 px-3">Otorite Durumu</th>
                  <th className="py-3.5 px-4">Ana Otorite Sinyali</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {data.domainAuthorities.map((item, idx) => {
                  const isUser = item.isUser;
                  const daDelta = isUser ? 0 : item.domainAuthority - userAuthority.domainAuthority;

                  return (
                    <tr
                      key={item.id || idx}
                      className={`transition-colors ${
                        isUser
                          ? "bg-amber-500/10 hover:bg-amber-500/15 border-l-4 border-l-amber-400 font-semibold"
                          : "hover:bg-slate-800/40"
                      }`}
                    >
                      {/* Domain & Brand */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            isUser ? "bg-amber-500 text-slate-950 font-black shadow-md" : "bg-slate-800 text-slate-300"
                          }`}>
                            {isUser ? <Award className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`font-bold ${isUser ? "text-amber-300 text-sm" : "text-white"}`}>
                                {item.name}
                              </span>
                              {isUser && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-400 text-slate-950">
                                  Siteniz
                                </span>
                              )}
                            </div>
                            <div className="text-slate-400 text-[11px] font-mono flex items-center gap-1">
                              <span>{item.domain}</span>
                              <a
                                href={`https://${item.domain}`}
                                target="_blank"
                                rel="noreferrer noopener"
                                className="text-slate-500 hover:text-slate-300 inline-flex items-center"
                                title="Siteyi yeni sekmede aç"
                              >
                                <ExternalLink className="w-3 h-3 ml-0.5" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Domain Authority (DA) */}
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-2">
                          <div className="space-y-1">
                            <div className="flex items-baseline gap-1.5">
                              <span className={`text-base font-black ${
                                isUser
                                  ? "text-amber-400"
                                  : item.domainAuthority > userAuthority.domainAuthority
                                  ? "text-rose-400"
                                  : "text-emerald-400"
                              }`}>
                                {item.domainAuthority}
                              </span>
                              <span className="text-[10px] text-slate-500">/100</span>

                              {!isUser && (
                                <span className={`text-[10px] font-bold ${
                                  daDelta > 0 ? "text-rose-400" : "text-emerald-400"
                                }`}>
                                  ({daDelta > 0 ? `+${daDelta} DA` : `${daDelta} DA`})
                                </span>
                              )}
                            </div>

                            {/* Mini bar */}
                            <div className="w-20 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  isUser
                                    ? "bg-amber-400"
                                    : item.domainAuthority > 65
                                    ? "bg-rose-400"
                                    : "bg-blue-400"
                                }`}
                                style={{ width: `${item.domainAuthority}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Page Authority (PA) */}
                      <td className="py-4 px-3">
                        <span className="text-slate-200 font-bold">{item.pageAuthority}</span>
                        <span className="text-[10px] text-slate-500"> /100</span>
                      </td>

                      {/* Backlinks & Referring Domains */}
                      <td className="py-4 px-3">
                        <div>
                          <div className="text-slate-200 font-bold">
                            {item.backlinksCount > 1000
                              ? `${(item.backlinksCount / 1000).toFixed(1)}K`
                              : item.backlinksCount}
                            <span className="text-[10px] text-slate-400 font-normal"> backlink</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {item.referringDomains} RD (Domain)
                          </div>
                        </div>
                      </td>

                      {/* Organic Visibility Score */}
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-1.5">
                          <div className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                            item.organicVisibility >= 85
                              ? "bg-emerald-500/20 text-emerald-300"
                              : item.organicVisibility >= 70
                              ? "bg-blue-500/20 text-blue-300"
                              : "bg-slate-800 text-slate-300"
                          }`}>
                            {item.organicVisibility}%
                          </div>
                        </div>
                      </td>

                      {/* Indexed Pages */}
                      <td className="py-4 px-3 text-slate-300 font-mono">
                        {item.indexedPages} sayfa
                      </td>

                      {/* Speed Score */}
                      <td className="py-4 px-3">
                        <span className={`px-2 py-0.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 ${
                          item.speedScore >= 90
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : item.speedScore >= 75
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        }`}>
                          <Zap className="w-3 h-3" />
                          {item.speedScore}
                        </span>
                      </td>

                      {/* Spam Score */}
                      <td className="py-4 px-3">
                        <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold ${
                          item.spamScore <= 2
                            ? "bg-emerald-500/10 text-emerald-400"
                            : item.spamScore <= 5
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-rose-500/10 text-rose-400"
                        }`}>
                          %{item.spamScore} {item.spamScore <= 2 ? "Temiz" : "Orta"}
                        </span>
                      </td>

                      {/* Authority Status */}
                      <td className="py-4 px-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.authorityStatus === "superior"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : item.authorityStatus === "competitive"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        }`}>
                          {item.authorityStatus === "superior"
                            ? "Lider"
                            : item.authorityStatus === "competitive"
                            ? "Rekabetçi"
                            : "Takipte"}
                        </span>
                      </td>

                      {/* Key Signal */}
                      <td className="py-4 px-4 max-w-xs truncate text-[11px] text-slate-300" title={item.keyAuthoritySignal}>
                        {item.keyAuthoritySignal}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. TABLE 2: KEYWORD RANKING (HEAD-TO-HEAD) COMPARISON TABLE */}
      {/* ===================================================================== */}
      {(activeTab === "all" || activeTab === "rankings") && (
        <div className="space-y-4 pt-4 border-t border-slate-800">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-400" />
                <span>Anahtar Kelime Sıralama (Keyword Ranking) Kıyaslama Tablosu</span>
              </h3>
              <p className="text-xs text-slate-400">
                Sitenizin ve ilk 3 rakibin Google SERP pozisyonları (#1, #2, #3, vb.), sıralama farkı (gap) ve eyleme dönüştürülebilir taktikler.
              </p>
            </div>

            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span className="font-semibold text-slate-300">{filteredKeywords.length}</span> kelime listeleniyor
            </div>
          </div>

          {/* Keyword Search & Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Anahtar kelime veya arama niyeti ara..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Quick Status Filters */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setRankingFilter("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  rankingFilter === "all" ? "bg-amber-500 text-slate-950" : "bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                Tümü
              </button>
              <button
                type="button"
                onClick={() => setRankingFilter("leading")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  rankingFilter === "leading" ? "bg-emerald-500 text-slate-950" : "bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                <Trophy className="w-3 h-3" />
                Önde Olduklarımız
              </button>
              <button
                type="button"
                onClick={() => setRankingFilter("competing")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  rankingFilter === "competing" ? "bg-blue-500 text-slate-950" : "bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                İlk 5&apos;te Yarışan
              </button>
              <button
                type="button"
                onClick={() => setRankingFilter("trailing")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  rankingFilter === "trailing" ? "bg-rose-500 text-white" : "bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                <AlertTriangle className="w-3 h-3" />
                Geride Kaldıklarımız
              </button>
            </div>

            {/* Sort Switcher */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="text-[11px]">Sırala:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="gap">Sıralama Farkı (Gap)</option>
                <option value="volume">Aylık Aranma Hacmi</option>
                <option value="difficulty">SEO Zorluk Derecesi</option>
                <option value="userRank">Sitenizin Sırası</option>
              </select>
              <button
                type="button"
                onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
                className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 cursor-pointer"
                title={sortOrder === "asc" ? "Artan Sıralama" : "Azalan Sıralama"}
              >
                {sortOrder === "asc" ? "▲" : "▼"}
              </button>
            </div>
          </div>

          {/* Head-to-Head Keyword Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60 shadow-inner">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Anahtar Kelime &amp; Niyet</th>
                  <th className="py-3.5 px-3">Hacim</th>
                  <th className="py-3.5 px-3">Zorluk</th>
                  <th className="py-3.5 px-3 text-center bg-amber-500/10 text-amber-300 border-x border-amber-500/20">
                    Siteniz
                  </th>
                  <th className="py-3.5 px-3 text-center">
                    {competitorsAuthority[0]?.name || "1. Rakip"}
                  </th>
                  <th className="py-3.5 px-3 text-center">
                    {competitorsAuthority[1]?.name || "2. Rakip"}
                  </th>
                  <th className="py-3.5 px-3 text-center">
                    {competitorsAuthority[2]?.name || "3. Rakip"}
                  </th>
                  <th className="py-3.5 px-3">Sıralama Farkı (Gap)</th>
                  <th className="py-3.5 px-3">Trafik Kazancı</th>
                  <th className="py-3.5 px-4 text-right">Eylem / Öneri</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredKeywords.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-500 text-xs">
                      Arama kriterlerinize uygun anahtar kelime bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filteredKeywords.map((item) => {
                    const isExpanded = expandedKeywordId === item.id;
                    const isLeading = item.status === "leading";
                    const isTrailing = item.status === "trailing" || item.status === "missing";

                    return (
                      <React.Fragment key={item.id}>
                        <tr
                          className={`hover:bg-slate-800/40 transition-colors cursor-pointer ${
                            isLeading ? "bg-emerald-500/5" : isTrailing ? "bg-rose-500/5" : ""
                          }`}
                          onClick={() => setExpandedKeywordId(isExpanded ? null : item.id)}
                        >
                          {/* Keyword & Intent */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm">
                                {item.keyword}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                item.searchIntent === "Acil / Yerel"
                                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                  : item.searchIntent === "Ticari"
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                  : item.searchIntent === "İşlemsel"
                                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                  : "bg-slate-800 text-slate-300"
                              }`}>
                                {item.searchIntent}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                              {item.serpFeatures.slice(0, 2).map((feat, fidx) => (
                                <span key={fidx} className="bg-slate-800/70 px-1.5 py-0.2 rounded text-slate-400">
                                  {feat}
                                </span>
                              ))}
                            </div>
                          </td>

                          {/* Monthly Volume */}
                          <td className="py-3.5 px-3 text-slate-200 font-bold font-mono">
                            {item.monthlyVolume}
                          </td>

                          {/* Difficulty Meter */}
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-mono text-slate-300">{item.difficulty}</span>
                              <div className="w-12 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    item.difficulty > 50
                                      ? "bg-rose-400"
                                      : item.difficulty > 35
                                      ? "bg-amber-400"
                                      : "bg-emerald-400"
                                  }`}
                                  style={{ width: `${item.difficulty}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* User Site Rank (Highlighted Column) */}
                          <td className="py-3.5 px-3 text-center bg-amber-500/10 border-x border-amber-500/20">
                            {item.userRank ? (
                              <span className={`px-2.5 py-1 rounded-xl font-black text-sm inline-flex items-center gap-1 ${
                                item.userRank === 1
                                  ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20"
                                  : item.userRank <= 3
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                  : "bg-slate-800 text-slate-200"
                              }`}>
                                {item.userRank === 1 && <Trophy className="w-3.5 h-3.5 text-slate-950" />}
                                #{item.userRank}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-800 text-slate-400">
                                &gt;20 (Yok)
                              </span>
                            )}
                          </td>

                          {/* Competitor 1 Rank */}
                          <td className="py-3.5 px-3 text-center">
                            {item.comp1Rank ? (
                              <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                                item.comp1Rank === 1 ? "bg-slate-800 text-amber-300 border border-amber-500/30" : "text-slate-300"
                              }`}>
                                #{item.comp1Rank}
                              </span>
                            ) : (
                              <span className="text-slate-600">-</span>
                            )}
                          </td>

                          {/* Competitor 2 Rank */}
                          <td className="py-3.5 px-3 text-center">
                            {item.comp2Rank ? (
                              <span className="px-2 py-0.5 rounded-lg text-xs font-bold text-slate-300">
                                #{item.comp2Rank}
                              </span>
                            ) : (
                              <span className="text-slate-600">-</span>
                            )}
                          </td>

                          {/* Competitor 3 Rank */}
                          <td className="py-3.5 px-3 text-center">
                            {item.comp3Rank ? (
                              <span className="px-2 py-0.5 rounded-lg text-xs font-bold text-slate-300">
                                #{item.comp3Rank}
                              </span>
                            ) : (
                              <span className="text-slate-600">-</span>
                            )}
                          </td>

                          {/* Ranking Gap */}
                          <td className="py-3.5 px-3">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
                              item.gap < 0
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : item.gap === 0
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            }`}>
                              {item.gap < 0 ? (
                                <>
                                  <Trophy className="w-3 h-3 text-emerald-400" />
                                  <span>{Math.abs(item.gap)} Sıra Önde</span>
                                </>
                              ) : item.gap === 0 ? (
                                <span>Başa Baş</span>
                              ) : (
                                <>
                                  <AlertTriangle className="w-3 h-3 text-rose-400" />
                                  <span>{item.gap} Sıra Geride</span>
                                </>
                              )}
                            </span>
                          </td>

                          {/* Traffic Opportunity */}
                          <td className="py-3.5 px-3 text-xs text-blue-300 font-bold font-mono">
                            {item.trafficOpportunity}
                          </td>

                          {/* Quick Actions & Accordion Toggle */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => handleCopyKeyword(item.keyword, item.id)}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
                                title="Kelimeyi Kopyala"
                              >
                                {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>

                              {onApplyKeyword && (
                                <button
                                  type="button"
                                  onClick={() => handleAddToKeywords(item.keyword)}
                                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg transition-colors cursor-pointer"
                                  title="Meta Anahtar Kelimelere Ekle"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => setExpandedKeywordId(isExpanded ? null : item.id)}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                                title="Tavsiye & Detay"
                              >
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Accordion AI Recommendation Row */}
                        {isExpanded && (
                          <tr className="bg-slate-900/90 border-b border-slate-800">
                            <td colSpan={10} className="p-4">
                              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                                    <Sparkles className="w-4 h-4 text-amber-400" />
                                    <span>Yapay Zeka Sıralama Geliştirme Stratejisi:</span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {onSendToAiBlog && (
                                      <button
                                        type="button"
                                        onClick={() => onSendToAiBlog(item.keyword, `${config.city || "İstanbul"} ${item.keyword} Rehberi`)}
                                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                                      >
                                        <FileText className="w-3.5 h-3.5 text-amber-400" />
                                        <span>AI Blog Yazısı Üret</span>
                                      </button>
                                    )}

                                    {onNavigateTab && (
                                      <button
                                        type="button"
                                        onClick={() => onNavigateTab("seo-editor")}
                                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all flex items-center gap-1 cursor-pointer"
                                      >
                                        <span>SEO Ayarlarını Aç</span>
                                        <ChevronRight className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>

                                <p className="text-xs text-slate-300 leading-relaxed">
                                  {item.aiRecommendation}
                                </p>

                                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                                  <span className="font-semibold text-slate-300">Bu Kelimedeki SERP Kartları:</span>
                                  {item.serpFeatures.map((feat, fidx) => (
                                    <span key={fidx} className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700">
                                      {feat}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 6. SEARCH GROUNDING METADATA FOOTER */}
      {/* ===================================================================== */}
      {data.groundingSources && data.groundingSources.length > 0 && (
        <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>Doğrulanan Google SERP Kaynakları:</span>
            <div className="flex flex-wrap items-center gap-2">
              {data.groundingSources.slice(0, 3).map((src, sidx) => (
                <a
                  key={sidx}
                  href={src.uri}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-amber-400 hover:underline inline-flex items-center gap-0.5 text-[11px]"
                >
                  {src.title}
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              ))}
            </div>
          </div>
          <span className="text-[11px] text-slate-500">
            Veriler Google Search canlı dizini ve Moz/Ahrefs otorite modelleme motoru ile hesaplanmaktadır.
          </span>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 7. CUSTOM COMPETITOR ADD MODAL */}
      {/* ===================================================================== */}
      {showAddCompetitorModal && (
        <div
          id="modal-add-competitor-backdrop"
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowAddCompetitorModal(false)}
        >
          <div
            id="modal-add-competitor-card"
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 text-slate-100 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Globe className="w-4 h-4" />
                <span>Özel Rakip Ekleme</span>
              </div>
              <h3 className="text-xl font-black text-white">
                Yeni Rakip Web Sitesini Canlı Tara
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                İncelemek istediğiniz rakip firmanın web sitesi adresini girin. Sistem otomatik olarak canlı
                Domain Authority (DA) ve anahtar kelime sıralamalarını kıyaslama tablosuna ekleyecektir.
              </p>
            </div>

            <form onSubmit={handleAddCompetitor} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Rakip Domain / Web Adresi (Zorunlu)
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={newCompDomain}
                    onChange={(e) => setNewCompDomain(e.target.value)}
                    placeholder="Örn: rakipcekici.com veya www.ornek.com.tr"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Firma / Marka Adı (Opsiyonel)
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={newCompName}
                    onChange={(e) => setNewCompName(e.target.value)}
                    placeholder="Örn: Anadolu Yol Yardım A.Ş."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              {/* Current Active Competitors preview */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Mevcut İncelenen Rakipler:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {customCompetitors.map((c, i) => (
                    <span key={i} className="text-[11px] bg-slate-800 px-2 py-0.5 rounded-lg text-slate-300 font-mono">
                      {c.domain}
                    </span>
                  ))}
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCompetitorModal(false)}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  <Plus className="w-4 h-4 text-slate-950" />
                  <span>Rakibi Ekle &amp; Canlı Tara</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
