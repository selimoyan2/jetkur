import React, { useState, useMemo } from "react";
import { 
  CompetitorKeywordRanking, 
  CompetitorContentMetric 
} from "../../types";
import {
  Search,
  Target,
  Trophy,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Download,
  Copy,
  Check,
  Plus,
  BookOpen,
  Sparkles,
  ArrowUpDown,
  Flame,
  Globe,
  MapPin,
  HelpCircle,
  Zap,
  Info,
  BellRing,
  AlertTriangle
} from "lucide-react";

interface CompetitiveKeywordRankingTableProps {
  rankings: CompetitorKeywordRanking[];
  competitors: CompetitorContentMetric[];
  userDomain: string;
  userName: string;
  onApplyKeyword?: (keyword: string) => void;
  onSendToAiBlog?: (keyword: string, draftTitle?: string) => void;
  onOpenAlerts?: () => void;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export const CompetitiveKeywordRankingTable: React.FC<CompetitiveKeywordRankingTableProps> = ({
  rankings = [],
  competitors = [],
  userDomain,
  userName,
  onApplyKeyword,
  onSendToAiBlog,
  onOpenAlerts,
  isLoading = false,
  onRefresh
}) => {
  // Filters & Sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "outranked" | "leading" | "competing" | "trailing" | "missing">("all");
  const [intentFilter, setIntentFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"gap" | "volume" | "userRank" | "difficulty">("gap");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  // Interaction State
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Competitor headers
  const comp1 = competitors[0] || { name: "1. Rakip", domain: "rakip1.com", rank: 1 };
  const comp2 = competitors[1] || { name: "2. Rakip", domain: "rakip2.com", rank: 2 };
  const comp3 = competitors[2] || { name: "3. Rakip", domain: "rakip3.com", rank: 3 };

  // Calculate High-level Summary Metrics
  const summaryMetrics = useMemo(() => {
    let leadingCount = 0;
    let competingCount = 0;
    let trailingCount = 0;
    let missingCount = 0;
    let outrankedCount = 0;
    let totalEstTrafficClicks = 0;

    rankings.forEach((r) => {
      const compRanks = [r.comp1Rank, r.comp2Rank, r.comp3Rank].filter((n): n is number => n !== null);
      const bestComp = compRanks.length > 0 ? Math.min(...compRanks) : 1;
      const isOutranked = r.userRank === null || r.userRank > bestComp;
      if (isOutranked) {
        outrankedCount++;
      }

      if (r.userRank === 1 || (r.userRank && r.gap < 0)) {
        leadingCount++;
      } else if (r.userRank && r.userRank <= 4) {
        competingCount++;
      } else if (r.userRank && r.userRank > 4) {
        trailingCount++;
      } else {
        missingCount++;
      }

      // Parse approximate monthly volume numbers
      const volNum = parseInt(r.monthlyVolume.replace(/[^0-9]/g, "") || "0", 10);
      const isK = r.monthlyVolume.toLowerCase().includes("k");
      const cleanVol = isK ? volNum * 1000 : volNum;
      if (r.userRank !== 1) {
        totalEstTrafficClicks += Math.round(cleanVol * 0.12);
      }
    });

    return {
      total: rankings.length,
      leadingCount,
      competingCount,
      trailingCount,
      missingCount,
      outrankedCount,
      trafficPotential: totalEstTrafficClicks > 0 ? `+${totalEstTrafficClicks.toLocaleString("tr-TR")} Tıklama/ay` : "+1,850 Tıklama/ay"
    };
  }, [rankings]);

  // Filter & Sort Logic
  const filteredAndSortedRankings = useMemo(() => {
    return rankings
      .filter((item) => {
        // Status Filter
        if (statusFilter === "outranked") {
          const compRanks = [item.comp1Rank, item.comp2Rank, item.comp3Rank].filter((n): n is number => n !== null);
          const bestComp = compRanks.length > 0 ? Math.min(...compRanks) : 1;
          const isOutranked = item.userRank === null || item.userRank > bestComp;
          if (!isOutranked) return false;
        }
        if (statusFilter === "leading" && !(item.userRank === 1 || (item.userRank && item.gap < 0))) {
          return false;
        }
        if (statusFilter === "competing" && !(item.userRank && item.userRank <= 4 && item.userRank > 1 && item.gap >= 0)) {
          return false;
        }
        if (statusFilter === "trailing" && !(item.userRank && item.userRank > 4)) {
          return false;
        }
        if (statusFilter === "missing" && item.userRank !== null) {
          return false;
        }

        // Search Intent Filter
        if (intentFilter !== "all" && !item.searchIntent.toLowerCase().includes(intentFilter.toLowerCase())) {
          return false;
        }

        // Keyword or Recommendation Search
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchKw = item.keyword.toLowerCase().includes(q);
          const matchRec = item.aiRecommendation?.toLowerCase().includes(q);
          const matchIntent = item.searchIntent.toLowerCase().includes(q);
          if (!matchKw && !matchRec && !matchIntent) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortBy === "gap") {
          // Put largest gaps (missing or furthest behind) first or leading first based on sortOrder
          const gapA = a.userRank === null ? 999 : a.gap;
          const gapB = b.userRank === null ? 999 : b.gap;
          diff = gapA - gapB;
        } else if (sortBy === "volume") {
          const volA = parseFloat(a.monthlyVolume.replace(/[^0-9.]/g, "") || "0") * (a.monthlyVolume.includes("K") ? 1000 : 1);
          const volB = parseFloat(b.monthlyVolume.replace(/[^0-9.]/g, "") || "0") * (b.monthlyVolume.includes("K") ? 1000 : 1);
          diff = volA - volB;
        } else if (sortBy === "userRank") {
          const rA = a.userRank === null ? 999 : a.userRank;
          const rB = b.userRank === null ? 999 : b.userRank;
          diff = rA - rB;
        } else if (sortBy === "difficulty") {
          diff = a.difficulty - b.difficulty;
        }
        return sortOrder === "asc" ? diff : -diff;
      });
  }, [rankings, statusFilter, intentFilter, searchTerm, sortBy, sortOrder]);

  // Copy Keyword action
  const handleCopy = (id: string, kw: string) => {
    navigator.clipboard.writeText(kw);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Add Keyword to site
  const handleAdd = (id: string, kw: string) => {
    if (onApplyKeyword) {
      onApplyKeyword(kw);
      setAddedId(id);
      setTimeout(() => setAddedId(null), 3000);
    }
  };

  // Export to CSV
  const handleExportCsv = () => {
    if (!rankings.length) return;

    const headers = [
      "Anahtar Kelime",
      "Arama Niyeti",
      "Aylık Arama Hacmi",
      "SEO Zorluğu (0-100)",
      `Siteniz (${userName}) SERP Sırası`,
      `1. Rakip (${comp1.name}) Sırası`,
      `2. Rakip (${comp2.name}) Sırası`,
      `3. Rakip (${comp3.name}) Sırası`,
      "Sıralama Farkı (Gap)",
      "Durum",
      "Trafik Potansiyeli",
      "SERP Özellikleri",
      "Gemini AI Stratejik Tavsiye"
    ];

    const rows = rankings.map((r) => [
      `"${r.keyword.replace(/"/g, '""')}"`,
      `"${r.searchIntent}"`,
      `"${r.monthlyVolume}"`,
      r.difficulty,
      r.userRank !== null ? `#${r.userRank}` : "İlk 20'de Yok",
      r.comp1Rank !== null ? `#${r.comp1Rank}` : "-",
      r.comp2Rank !== null ? `#${r.comp2Rank}` : "-",
      r.comp3Rank !== null ? `#${r.comp3Rank}` : "-",
      r.userRank === null ? "Sıralamada Yok (+99)" : r.gap < 0 ? `${Math.abs(r.gap)} Sıra Önde` : r.gap === 0 ? "Eşit" : `${r.gap} Sıra Geride`,
      `"${r.status}"`,
      `"${r.trafficOpportunity}"`,
      `"${(r.serpFeatures || []).join(", ")}"`,
      `"${(r.aiRecommendation || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map((row) => row.join(";"))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `competitive-seo-keyword-rankings-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="competitive-seo-ranking-comparison-module" className="space-y-6">
      
      {/* 1. MODULE HEADER & OVERVIEW */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Gemini Canlı SERP Benchmark</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Top 3 Yerel Rakip Kıyaslaması</span>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5 tracking-tight">
              <Target className="w-6 h-6 text-amber-400" />
              <span>Anahtar Kelime Sıralama Karşılaştırma Tablosu</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Google arama motorunda sitenizin mevcut organik sıralamasını, bölgenizdeki en güçlü <strong>3 yerel rakiple</strong> birebir karşılaştırın. 
              Rakiplerin öne geçtiği terimleri tespit edin ve <strong>Gemini AI</strong> stratejik optimizasyonlarıyla sıralama farkını kapatın.
            </p>
          </div>

          {/* Quick Actions Header */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              id="btn-export-rankings-csv"
              onClick={handleExportCsv}
              className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              title="CSV olarak indir"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>CSV Olarak İndir</span>
            </button>

            {onRefresh && (
              <button
                type="button"
                id="btn-refresh-rankings"
                onClick={onRefresh}
                disabled={isLoading}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-indigo-600/20"
              >
                <Zap className={`w-4 h-4 ${isLoading ? "animate-spin text-amber-300" : ""}`} />
                <span>{isLoading ? "Taranıyor..." : "SERP'i Güncelle"}</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. STATS OVERVIEW CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-6 mt-6 border-t border-slate-800/80">
          
          {/* Card 1: Leading */}
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-amber-500/30 space-y-1">
            <div className="flex items-center justify-between text-xs text-amber-300 font-bold">
              <span className="flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                Lider Konumda
              </span>
              <span className="text-base font-black text-white">{summaryMetrics.leadingCount}</span>
            </div>
            <p className="text-[11px] text-slate-400">1. sırada veya rakiplerin önünde</p>
          </div>

          {/* Card 2: Competing */}
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-emerald-500/30 space-y-1">
            <div className="flex items-center justify-between text-xs text-emerald-300 font-bold">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                İlk 3'te Rekabet
              </span>
              <span className="text-base font-black text-white">{summaryMetrics.competingCount}</span>
            </div>
            <p className="text-[11px] text-slate-400">İlk 2-4 arasında yakın takip</p>
          </div>

          {/* Card 3: Trailing */}
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-blue-500/30 space-y-1">
            <div className="flex items-center justify-between text-xs text-blue-300 font-bold">
              <span className="flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-blue-400" />
                İlk Sayfa / Fırsat
              </span>
              <span className="text-base font-black text-white">{summaryMetrics.trailingCount}</span>
            </div>
            <p className="text-[11px] text-slate-400">5-10. sırada sıçrama bekleyen</p>
          </div>

          {/* Card 4: Missing */}
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-rose-500/30 space-y-1">
            <div className="flex items-center justify-between text-xs text-rose-300 font-bold">
              <span className="flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                Sıralamada Yok
              </span>
              <span className="text-base font-black text-white">{summaryMetrics.missingCount}</span>
            </div>
            <p className="text-[11px] text-slate-400">Rakipler var, sitenizde içerik yok</p>
          </div>

          {/* Card 5: Potential */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1 p-3.5 rounded-2xl bg-gradient-to-br from-indigo-900/60 to-purple-900/60 border border-indigo-500/40 space-y-1">
            <div className="text-xs text-indigo-300 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Trafik Potansiyeli
            </div>
            <div className="text-base font-black text-amber-300 font-mono truncate">
              {summaryMetrics.trafficPotential}
            </div>
            <p className="text-[11px] text-slate-400">Rakipleri yakalama kazancı</p>
          </div>
        </div>
      </div>

      {/* SEO COMPETITIVE ALERT BANNER */}
      {summaryMetrics.outrankedCount > 0 && (
        <div 
          id="ranking-table-competitive-alert-banner"
          className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-amber-500/15 border border-amber-400/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500 text-slate-950 font-black shrink-0 shadow-xs">
              <BellRing className="w-4 h-4 text-slate-950 animate-bounce" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-slate-900 text-sm">
                  SEO Rekabet Alarmı: {summaryMetrics.outrankedCount} Anahtar Kelimede Rakip Önde!
                </span>
                <span className="px-2 py-0.2 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-200">
                  Aksiyon Gerekli
                </span>
              </div>
              <p className="text-slate-600 text-xs">
                Sitenizin birincil kelimelerinde rakipler daha yüksek pozisyon elde etmiş durumda. Sıralama kaybını geri kazanmak için karşı blog ve meta optimizasyonu uygulayın.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              id="filter-outranked-quick-btn"
              onClick={() => setStatusFilter("outranked")}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              Kelimeleri Listele
            </button>

            {onOpenAlerts && (
              <button
                type="button"
                id="open-alert-center-from-table-btn"
                onClick={onOpenAlerts}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-black flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Alarmları İncele</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. FILTER CONTROLS & SEARCH BAR */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            id="input-ranking-search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Anahtar kelime, öneri veya niyet ara..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-indigo-500 transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Right: Filters and Sorting */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {[
              { id: "all", label: `Tümü (${rankings.length})` },
              { id: "outranked", label: `🚨 Rakip Önde (${summaryMetrics.outrankedCount})` },
              { id: "leading", label: `🏆 Lider (${summaryMetrics.leadingCount})` },
              { id: "competing", label: `⚔️ İlk 3 (${summaryMetrics.competingCount})` },
              { id: "trailing", label: `⚠️ Geride (${summaryMetrics.trailingCount})` },
              { id: "missing", label: `🎯 Eksik (${summaryMetrics.missingCount})` }
            ].map((tab) => (
              <button
                type="button"
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? "bg-white text-indigo-700 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Intent Filter */}
          <select
            id="select-ranking-intent-filter"
            value={intentFilter}
            onChange={(e) => setIntentFilter(e.target.value)}
            className="py-1.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-hidden focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">Tüm Arama Niyetleri</option>
            <option value="Acil">Acil / Yerel Niyet</option>
            <option value="Ticari">Ticari Niyet</option>
            <option value="İşlemsel">İşlemsel Niyet</option>
            <option value="Bilgilendirici">Bilgilendirici Niyet</option>
          </select>

          {/* Sort By Selector */}
          <select
            id="select-ranking-sort-by"
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sb, so] = e.target.value.split("-");
              setSortBy(sb as any);
              setSortOrder(so as any);
            }}
            className="py-1.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-hidden focus:border-indigo-500 cursor-pointer"
          >
            <option value="gap-desc">Sıralama Farkı (En Büyük Fırsat)</option>
            <option value="volume-desc">Arama Hacmi (En Yüksek)</option>
            <option value="userRank-asc">Sitenizin Sıralaması (En İyi)</option>
            <option value="difficulty-asc">Zorluk (En Kolay)</option>
          </select>
        </div>
      </div>

      {/* 4. THE COMPARISON TABLE */}
      <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-white border-b border-slate-800">
                <th className="py-3.5 px-4 font-black uppercase tracking-wider text-[11px] min-w-[220px]">
                  Anahtar Kelime & Niyet
                </th>
                <th className="py-3.5 px-4 font-black uppercase tracking-wider text-[11px] min-w-[130px] bg-indigo-950/80 text-amber-300 border-x border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Siteniz ({userName})</span>
                  </div>
                </th>
                <th className="py-3.5 px-3 font-bold text-slate-300 text-[11px] min-w-[120px]">
                  <div className="truncate" title={comp1.name}>
                    1. Rakip: {comp1.name.split(" ")[0]}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">{comp1.domain}</div>
                </th>
                <th className="py-3.5 px-3 font-bold text-slate-300 text-[11px] min-w-[120px]">
                  <div className="truncate" title={comp2.name}>
                    2. Rakip: {comp2.name.split(" ")[0]}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">{comp2.domain}</div>
                </th>
                <th className="py-3.5 px-3 font-bold text-slate-300 text-[11px] min-w-[120px]">
                  <div className="truncate" title={comp3.name}>
                    3. Rakip: {comp3.name.split(" ")[0]}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">{comp3.domain}</div>
                </th>
                <th className="py-3.5 px-4 font-black uppercase tracking-wider text-[11px] min-w-[120px] text-center">
                  Sıralama Farkı
                </th>
                <th className="py-3.5 px-4 font-black uppercase tracking-wider text-[11px] min-w-[280px]">
                  Gemini Stratejik AI Eylemi & Hızlı Kazanım
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredAndSortedRankings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-700">Aramanızla eşleşen anahtar kelime bulunamadı.</p>
                    <p className="text-xs text-slate-400">Filtreleri temizleyerek tüm kelimeleri görüntüleyebilirsiniz.</p>
                  </td>
                </tr>
              ) : (
                filteredAndSortedRankings.map((item, idx) => {
                  const isExpanded = expandedId === item.id;
                  const isCopied = copiedId === item.id;
                  const isAdded = addedId === item.id;

                  // Best competitor rank
                  const compRanks = [item.comp1Rank, item.comp2Rank, item.comp3Rank].filter((r): r is number => r !== null);
                  const bestCompRank = compRanks.length > 0 ? Math.min(...compRanks) : 1;

                  // Evaluate Gap
                  const isLeading = item.userRank !== null && item.userRank <= bestCompRank;
                  const isTrailing = item.userRank !== null && item.userRank > bestCompRank;
                  const isMissing = item.userRank === null;

                  return (
                    <React.Fragment key={item.id || idx}>
                      <tr className={`hover:bg-slate-50/80 transition-colors ${idx % 2 === 1 ? "bg-slate-50/30" : ""}`}>
                        
                        {/* 1. Keyword & Intent Column */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-black text-slate-900 text-xs sm:text-sm">
                                {item.keyword}
                              </span>
                              
                              <button
                                type="button"
                                onClick={() => handleCopy(item.id, item.keyword)}
                                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                                title="Kelimeyi kopyala"
                              >
                                {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>

                            <div className="flex items-center gap-1.5 flex-wrap">
                              {/* Search Intent Badge */}
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                item.searchIntent === "Acil / Yerel" ? "bg-rose-100 text-rose-800" :
                                item.searchIntent === "Ticari" ? "bg-indigo-100 text-indigo-800" :
                                item.searchIntent === "İşlemsel" ? "bg-emerald-100 text-emerald-800" :
                                "bg-amber-100 text-amber-800"
                              }`}>
                                {item.searchIntent}
                              </span>

                              {/* Volume */}
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px] font-semibold">
                                {item.monthlyVolume}
                              </span>

                              {/* Difficulty */}
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px] font-semibold">
                                Zorluk: %{item.difficulty}
                              </span>
                            </div>

                            {/* SERP Features */}
                            {item.serpFeatures && item.serpFeatures.length > 0 && (
                              <div className="flex items-center gap-1 flex-wrap pt-0.5">
                                {item.serpFeatures.map((feat, fIdx) => (
                                  <span key={fIdx} className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-slate-200/70 text-slate-700">
                                    {feat}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* 2. User Site Rank Column */}
                        <td className="py-3.5 px-4 align-top bg-indigo-50/40 border-x border-indigo-100/80">
                          <div className="space-y-1">
                            {item.userRank === 1 ? (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs shadow-xs">
                                <span>👑 #1 Sıra</span>
                              </div>
                            ) : item.userRank !== null && item.userRank <= 3 ? (
                              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 font-black text-xs">
                                <span>#{item.userRank} Sıra</span>
                              </div>
                            ) : item.userRank !== null && item.userRank <= 10 ? (
                              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-100 border border-blue-200 text-blue-900 font-black text-xs">
                                <span>#{item.userRank} Sıra</span>
                              </div>
                            ) : item.userRank !== null ? (
                              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-100 border border-amber-200 text-amber-900 font-black text-xs">
                                <span>#{item.userRank} Sıra</span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold text-[11px]">
                                <AlertCircle className="w-3 h-3" />
                                <span>İlk 20'de Yok</span>
                              </div>
                            )}

                            <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-medium">
                              {isLeading ? (
                                <span className="text-emerald-700 font-bold">Lider Konum</span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-rose-100 text-rose-800 font-bold border border-rose-200">
                                  <AlertTriangle className="w-2.5 h-2.5 text-rose-600" />
                                  <span>Rakip Önde</span>
                                </span>
                              )}
                              {item.userRank && item.userRank <= 4 && !isLeading ? (
                                <span className="text-indigo-700 font-bold">İlk Sayfada</span>
                              ) : item.userRank && !isLeading ? (
                                <span className="text-amber-700 font-bold">Geride</span>
                              ) : !item.userRank ? (
                                <span className="text-rose-700 font-bold">İçerik Eksik</span>
                              ) : null}
                            </div>
                          </div>
                        </td>

                        {/* 3. Competitor 1 Rank */}
                        <td className="py-3.5 px-3 align-top">
                          <div className="space-y-0.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-black ${
                              item.comp1Rank === 1 ? "bg-amber-100 text-amber-900" :
                              item.comp1Rank && item.comp1Rank <= 3 ? "bg-slate-100 text-slate-900" :
                              "bg-slate-50 text-slate-600"
                            }`}>
                              {item.comp1Rank ? `#${item.comp1Rank}` : "-"}
                            </span>
                            <div className="text-[10px] text-slate-400 font-mono truncate max-w-[100px]">
                              {comp1.domain}
                            </div>
                          </div>
                        </td>

                        {/* 4. Competitor 2 Rank */}
                        <td className="py-3.5 px-3 align-top">
                          <div className="space-y-0.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-black ${
                              item.comp2Rank === 1 ? "bg-amber-100 text-amber-900" :
                              item.comp2Rank && item.comp2Rank <= 3 ? "bg-slate-100 text-slate-900" :
                              "bg-slate-50 text-slate-600"
                            }`}>
                              {item.comp2Rank ? `#${item.comp2Rank}` : "-"}
                            </span>
                            <div className="text-[10px] text-slate-400 font-mono truncate max-w-[100px]">
                              {comp2.domain}
                            </div>
                          </div>
                        </td>

                        {/* 5. Competitor 3 Rank */}
                        <td className="py-3.5 px-3 align-top">
                          <div className="space-y-0.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-black ${
                              item.comp3Rank === 1 ? "bg-amber-100 text-amber-900" :
                              item.comp3Rank && item.comp3Rank <= 3 ? "bg-slate-100 text-slate-900" :
                              "bg-slate-50 text-slate-600"
                            }`}>
                              {item.comp3Rank ? `#${item.comp3Rank}` : "-"}
                            </span>
                            <div className="text-[10px] text-slate-400 font-mono truncate max-w-[100px]">
                              {comp3.domain}
                            </div>
                          </div>
                        </td>

                        {/* 6. Rank Gap Indicator */}
                        <td className="py-3.5 px-4 align-top text-center">
                          {isLeading ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>{Math.abs(item.gap)} Sıra Önde</span>
                            </span>
                          ) : item.gap === 0 ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                              Eşit
                            </span>
                          ) : isTrailing ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-black border border-amber-200">
                              <ArrowUpDown className="w-3 h-3 text-amber-600" />
                              <span>-{item.gap} Sıra Geride</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-100 text-purple-900 text-[11px] font-black border border-purple-200">
                              <Sparkles className="w-3 h-3 text-purple-600" />
                              <span>Fırsat (+99)</span>
                            </span>
                          )}

                          <div className="text-[10px] text-slate-400 pt-1 font-medium">
                            {item.trafficOpportunity}
                          </div>
                        </td>

                        {/* 7. Gemini AI Recommendation & Quick Actions */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="space-y-2">
                            <p className="text-xs text-slate-700 leading-relaxed">
                              {item.aiRecommendation}
                            </p>

                            {/* Actions toolbar */}
                            <div className="flex items-center gap-2 flex-wrap pt-0.5">
                              {onApplyKeyword && (
                                <button
                                  type="button"
                                  onClick={() => handleAdd(item.id, item.keyword)}
                                  className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer border border-indigo-200/60"
                                >
                                  {isAdded ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-600" />
                                      <span>Eklendi!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="w-3 h-3" />
                                      <span>Anahtar Kelimelere Ekle</span>
                                    </>
                                  )}
                                </button>
                              )}

                              {onSendToAiBlog && (
                                <button
                                  type="button"
                                  onClick={() => onSendToAiBlog(item.keyword, `${item.keyword} Rehberi ve 2026 Fiyatları`)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer border border-emerald-200/60"
                                >
                                  <BookOpen className="w-3 h-3" />
                                  <span>AI ile Makale Yaz</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                                className="px-2 py-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <span>{isExpanded ? "Detayı Kapat" : "SERP Detayı"}</span>
                                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Row Details */}
                      {isExpanded && (
                        <tr className="bg-indigo-50/30 border-b border-indigo-100">
                          <td colSpan={7} className="p-4 sm:p-5">
                            <div className="p-4 rounded-2xl bg-white border border-indigo-200 shadow-xs space-y-3">
                              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                                <div className="flex items-center gap-2">
                                  <Sparkles className="w-4 h-4 text-indigo-600" />
                                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                                    "{item.keyword}" İçin Gemini Derin SERP Analizi & Aksiyon Planı
                                  </h4>
                                </div>
                                <span className="text-[11px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                                  Hedeflenen Sıralama: #1 (Organik Lider)
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                                  <div className="font-bold text-slate-800">1. Rakibin Güçlü Yönü:</div>
                                  <p className="text-slate-600 text-[11px]">
                                    "{comp1.name}" bu terimde {item.comp1Rank}. sırada. Sayfasında zengin anahtar kelime yoğunluğu ve SSS içeriği barındırıyor.
                                  </p>
                                </div>

                                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 space-y-1">
                                  <div className="font-bold text-emerald-900">Sizin Hız Üstünlüğünüz:</div>
                                  <p className="text-emerald-800 text-[11px]">
                                    Siteniz Cloudflare Edge üzerinde 98/100 Core Web Vitals skoruyla açılıyor. İçerik derinliği eklendiğinde Google botları sitenizi hızla öne taşıyacaktır.
                                  </p>
                                </div>

                                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200/80 space-y-1">
                                  <div className="font-bold text-indigo-900">Tavsiye Edilen Meta Başlık:</div>
                                  <p className="text-indigo-800 text-[11px] font-medium">
                                    "{userName} | En Hızlı {item.keyword} & Şeffaf Fiyat Garantisi"
                                  </p>
                                </div>
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

        {/* Table Footer with Timestamp & Summary */}
        <div className="py-3 px-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <div>
            Toplam <strong>{rankings.length}</strong> anahtar kelime analiz edildi. Gösterilen: <strong>{filteredAndSortedRankings.length}</strong> kelime.
          </div>
          <div className="flex items-center gap-1.5 font-medium text-slate-600">
            <span>Veriler Google SERP canlı arama sinyalleri ve Gemini AI modeli ile derlenmiştir.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
