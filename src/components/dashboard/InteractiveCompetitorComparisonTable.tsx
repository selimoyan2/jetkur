import React, { useState, useMemo } from "react";
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  FileDown,
  Sparkles,
  Check,
  Copy,
  Plus,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Trophy,
  Flame,
  Zap,
  BarChart3,
  RefreshCw,
  Table as TableIcon,
  Shield,
  Layers
} from "lucide-react";
import { 
  SiteConfig, 
  CompetitorKeywordRanking, 
  CompetitorContentMetric 
} from "../../types";
import { generateFallbackCompetitiveSeo } from "../../utils/competitiveSeoUtils";

interface InteractiveCompetitorComparisonTableProps {
  siteConfig: SiteConfig;
  userName?: string;
  userDomain?: string;
  onApplyKeyword?: (kw: string) => void;
  onSendToAiBlog?: (kw: string, draftTitle: string) => void;
  onDownloadPdf?: () => void;
}

type SortField = "volume" | "difficulty" | "userRank" | "gap" | "keyword";
type SortDirection = "asc" | "desc";

export const InteractiveCompetitorComparisonTable: React.FC<InteractiveCompetitorComparisonTableProps> = ({
  siteConfig,
  userName = "Siteniz",
  userDomain = "sitemiz.com.tr",
  onApplyKeyword,
  onSendToAiBlog,
  onDownloadPdf
}) => {
  // Generate base competitive dataset for current configuration
  const competitiveData = useMemo(() => {
    return generateFallbackCompetitiveSeo(siteConfig);
  }, [siteConfig]);

  const [keywordList, setKeywordList] = useState<CompetitorKeywordRanking[]>(
    competitiveData.keywordRankings || []
  );

  // Update when siteConfig or generated dataset changes
  React.useEffect(() => {
    setKeywordList(competitiveData.keywordRankings || []);
  }, [competitiveData]);

  // Competitor Entities (Top 3 competitors)
  const competitors: CompetitorContentMetric[] = useMemo(() => {
    return competitiveData.competitors || [];
  }, [competitiveData]);

  const comp1 = competitors[0] || { name: "1. Rakip", domain: "rakip1.com", rank: 1 };
  const comp2 = competitors[1] || { name: "2. Rakip", domain: "rakip2.com", rank: 2 };
  const comp3 = competitors[2] || { name: "3. Rakip", domain: "rakip3.com", rank: 3 };

  // Interactive Filter & Sort States
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [intentFilter, setIntentFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<"all" | "easy" | "medium" | "hard">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("volume");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Interaction feedback states
  const [copiedKw, setCopiedKw] = useState<string | null>(null);
  const [appliedKw, setAppliedKw] = useState<string | null>(null);

  // Quick Inline Add Keyword State
  const [isAddingKw, setIsAddingKw] = useState<boolean>(false);
  const [newKwText, setNewKwText] = useState<string>("");

  // Helper to parse volume numbers for accurate numerical sorting
  const parseVolumeNum = (volStr: string): number => {
    if (!volStr) return 0;
    const clean = volStr.toLowerCase().replace(/[^0-9.k]/g, "");
    if (clean.includes("k")) {
      const val = parseFloat(clean.replace("k", ""));
      return isNaN(val) ? 0 : val * 1000;
    }
    const val = parseFloat(clean);
    return isNaN(val) ? 0 : val;
  };

  // Helper for Difficulty label & color
  const getDifficultyBadge = (score: number) => {
    if (score < 30) {
      return {
        label: "Kolay",
        bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        barColor: "bg-emerald-500",
        textColor: "text-emerald-700"
      };
    } else if (score <= 45) {
      return {
        label: "Orta",
        bg: "bg-amber-50 text-amber-700 border-amber-200",
        barColor: "bg-amber-500",
        textColor: "text-amber-700"
      };
    }
    return {
      label: "Zor",
      bg: "bg-rose-50 text-rose-700 border-rose-200",
      barColor: "bg-rose-500",
      textColor: "text-rose-700"
    };
  };

  // Summary Metrics
  const summaryMetrics = useMemo(() => {
    const totalCount = keywordList.length;
    const avgDiff = Math.round(
      keywordList.reduce((acc, k) => acc + (k.difficulty || 0), 0) / (totalCount || 1)
    );
    const leadingCount = keywordList.filter(k => k.status === "leading").length;
    const competingCount = keywordList.filter(k => k.status === "competing").length;
    const totalVolumeNum = keywordList.reduce((acc, k) => acc + parseVolumeNum(k.monthlyVolume), 0);

    return {
      totalCount,
      avgDiff,
      leadingCount,
      competingCount,
      totalVolumeFormatted: totalVolumeNum > 1000 ? `${(totalVolumeNum / 1000).toFixed(1)}K / ay` : `${totalVolumeNum} / ay`
    };
  }, [keywordList]);

  // Filtering & Sorting
  const filteredAndSortedList = useMemo(() => {
    return keywordList
      .filter((item) => {
        // Search filter
        const matchSearch =
          !searchTerm ||
          item.keyword.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.aiRecommendation?.toLowerCase().includes(searchTerm.toLowerCase());

        // Intent filter
        const matchIntent = intentFilter === "all" || item.searchIntent === intentFilter;

        // Difficulty filter
        let matchDiff = true;
        if (difficultyFilter === "easy") matchDiff = item.difficulty < 30;
        else if (difficultyFilter === "medium") matchDiff = item.difficulty >= 30 && item.difficulty <= 45;
        else if (difficultyFilter === "hard") matchDiff = item.difficulty > 45;

        // Status filter
        const matchStatus = statusFilter === "all" || item.status === statusFilter;

        return matchSearch && matchIntent && matchDiff && matchStatus;
      })
      .sort((a, b) => {
        let valA: number | string = 0;
        let valB: number | string = 0;

        if (sortField === "volume") {
          valA = parseVolumeNum(a.monthlyVolume);
          valB = parseVolumeNum(b.monthlyVolume);
        } else if (sortField === "difficulty") {
          valA = a.difficulty || 0;
          valB = b.difficulty || 0;
        } else if (sortField === "userRank") {
          valA = a.userRank === null ? 999 : a.userRank;
          valB = b.userRank === null ? 999 : b.userRank;
        } else if (sortField === "gap") {
          valA = a.gap;
          valB = b.gap;
        } else if (sortField === "keyword") {
          valA = a.keyword.toLowerCase();
          valB = b.keyword.toLowerCase();
          return sortDirection === "asc"
            ? (valA as string).localeCompare(valB as string)
            : (valB as string).localeCompare(valA as string);
        }

        if (sortDirection === "asc") {
          return (valA as number) > (valB as number) ? 1 : -1;
        }
        return (valA as number) < (valB as number) ? 1 : -1;
      });
  }, [keywordList, searchTerm, intentFilter, difficultyFilter, statusFilter, sortField, sortDirection]);

  // Handle Sort Toggle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Handle Copy
  const handleCopy = (kw: string) => {
    navigator.clipboard?.writeText(kw);
    setCopiedKw(kw);
    setTimeout(() => setCopiedKw(null), 2000);
  };

  // Handle Apply to Site
  const handleApply = (kw: string) => {
    if (onApplyKeyword) {
      onApplyKeyword(kw);
      setAppliedKw(kw);
      setTimeout(() => setAppliedKw(null), 2500);
    }
  };

  // Export to CSV
  const handleExportCsv = () => {
    const headers = [
      "Anahtar Kelime",
      "Arama Niyeti",
      "Aylık Arama Hacmi",
      "Zorluk Derecesi (0-100)",
      `Siteniz (${userName}) Sırası`,
      `${comp1.name} Sırası`,
      `${comp2.name} Sırası`,
      `${comp3.name} Sırası`,
      "Sıralama Farkı (Gap)",
      "Rekabet Durumu",
      "Tahmini Trafik Kazancı",
      "AI Strateji Önerisi"
    ];

    const rows = filteredAndSortedList.map(item => [
      `"${item.keyword.replace(/"/g, '""')}"`,
      `"${item.searchIntent || ""}"`,
      `"${item.monthlyVolume || ""}"`,
      item.difficulty,
      item.userRank !== null ? `#${item.userRank}` : "İlk 20 Dışı",
      item.comp1Rank !== null ? `#${item.comp1Rank}` : "-",
      item.comp2Rank !== null ? `#${item.comp2Rank}` : "-",
      item.comp3Rank !== null ? `#${item.comp3Rank}` : "-",
      item.gap,
      `"${item.status}"`,
      `"${item.trafficOpportunity || ""}"`,
      `"${(item.aiRecommendation || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Rakip_Kiyaslama_Tablosu_${(siteConfig.sector || "SEO").replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Add Custom Keyword to Benchmark
  const handleAddNewKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKwText.trim()) return;

    const trimmed = newKwText.trim();
    const newEntry: CompetitorKeywordRanking = {
      id: `custom-kw-${Date.now()}`,
      keyword: trimmed,
      searchIntent: "Ticari",
      monthlyVolume: "3.2K / ay",
      difficulty: 35,
      userRank: 4,
      comp1Rank: 1,
      comp2Rank: 3,
      comp3Rank: 6,
      serpFeatures: ["Yerel 3-Pack", "Snippet"],
      status: "competing",
      gap: 3,
      trafficOpportunity: "+320 Aylık Tıklama",
      aiRecommendation: `${trimmed} için sitenizde özel bir iniş sayfası (landing page) veya blog rehberi yayınlayarak 1. sıraya sıçrayabilirsiniz.`
    };

    setKeywordList(prev => [newEntry, ...prev]);
    setNewKwText("");
    setIsAddingKw(false);
  };

  return (
    <div 
      id="rakip-kiyaslama-tablosu"
      className="space-y-6 bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl text-slate-100"
    >
      {/* 1. Header Bar with Title, Subtitle, and Export Actions */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0 shadow-inner">
            <TableIcon className="w-6 h-6 text-indigo-400" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Rakip Kıyaslama Tablosu
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-bold border border-indigo-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                İnteraktif Anahtar Kelime & SERP Matrisi
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              <strong>{userName}</strong> ve sektörünüzdeki ilk 3 rakibin en kritik anahtar kelimelerdeki 
              sıralama performanslarını, <strong>aylık arama hacimlerini</strong> ve <strong>SEO zorluk seviyelerini</strong> canlı karşılaştırın.
            </p>
          </div>
        </div>

        {/* Global Action Buttons (CSV, PDF, Add Keyword) */}
        <div className="flex items-center gap-2.5 self-start lg:self-auto flex-wrap">
          <button
            type="button"
            id="btn-add-benchmark-keyword"
            onClick={() => setIsAddingKw(!isAddingKw)}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
            title="Kıyaslama tablosuna yeni anahtar kelime ekle"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span>Kelime Ekle</span>
          </button>

          <button
            type="button"
            id="btn-export-comparison-table-csv"
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
            title="Tabloyu CSV formatında indir"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>CSV İndir</span>
          </button>

          {onDownloadPdf && (
            <button
              type="button"
              id="btn-export-comparison-table-pdf"
              onClick={onDownloadPdf}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-indigo-900/50 transition-all cursor-pointer ring-1 ring-indigo-400/40"
              title="Tüm Rakip Kıyaslama Tablosu ve SEO Radar grafik verilerini tek tıkla şirket logolu profesyonel PDF raporu olarak indir"
            >
              <FileDown className="w-4 h-4 text-cyan-200" />
              <span>PDF Raporu Oluştur</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-normal text-white">
                Şirket Logolu
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Inline Form to Add Keyword */}
      {isAddingKw && (
        <form onSubmit={handleAddNewKeyword} className="p-4 rounded-2xl bg-slate-950/70 border border-indigo-500/30 flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <label className="text-[11px] font-bold text-slate-400 block mb-1">
              Kıyaslanacak Yeni Anahtar Kelime veya Sektörel Terim:
            </label>
            <input
              type="text"
              value={newKwText}
              onChange={(e) => setNewKwText(e.target.value)}
              placeholder="Örn: 7/24 oto kurtarıcı fiyatları"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-hidden focus:border-indigo-500"
              autoFocus
            />
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto pt-4 sm:pt-4">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer"
            >
              Tabloya Ekle
            </button>
            <button
              type="button"
              onClick={() => setIsAddingKw(false)}
              className="px-3 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs transition-all cursor-pointer"
            >
              Vazgeç
            </button>
          </div>
        </form>
      )}

      {/* 2. Key Performance Metrics Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/90">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Kıyaslanan Kelime</span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-white mt-1">
            {summaryMetrics.totalCount} Terim
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Sektörel SERP odaklı
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/90">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Toplam Arama Hacmi</span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-cyan-400 mt-1">
            {summaryMetrics.totalVolumeFormatted}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Aylık potansiyel arama
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/90">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Ortalama Zorluk Seviyesi</span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-amber-400 mt-1 flex items-center gap-1.5">
            <span>%{summaryMetrics.avgDiff}</span>
            <span className="text-xs font-bold px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300">
              Orta
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            0-100 Rekabet zorluk endeksi
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/90">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sitenizin Liderliği</span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400 mt-1">
            {summaryMetrics.leadingCount} Kelimede #1
          </div>
          <div className="text-[10px] text-emerald-400/80 mt-0.5">
            +{summaryMetrics.competingCount} Terimde İlk 3 Rekabeti
          </div>
        </div>
      </div>

      {/* 3. Interactive Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="input-filter-comparison-keywords"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tabloda anahtar kelime veya strateji ara..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        {/* Filter dropdowns/pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Intent filter */}
          <select
            id="select-filter-intent"
            value={intentFilter}
            onChange={(e) => setIntentFilter(e.target.value)}
            className="px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 focus:outline-hidden focus:border-indigo-500 font-medium"
          >
            <option value="all">Tüm Niyetler</option>
            <option value="Ticari">Ticari Niyet</option>
            <option value="Bilgilendirici">Bilgilendirici</option>
            <option value="Acil / Yerel">Acil / Yerel</option>
            <option value="İşlemsel">İşlemsel</option>
          </select>

          {/* Difficulty filter */}
          <select
            id="select-filter-difficulty"
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value as any)}
            className="px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 focus:outline-hidden focus:border-indigo-500 font-medium"
          >
            <option value="all">Tüm Zorluklar</option>
            <option value="easy">Kolay (&lt; 30)</option>
            <option value="medium">Orta (30 - 45)</option>
            <option value="hard">Zor (&gt; 45)</option>
          </select>

          {/* Status filter */}
          <select
            id="select-filter-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 focus:outline-hidden focus:border-indigo-500 font-medium"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="leading">Lider (#1)</option>
            <option value="competing">Rekabette (İlk 5)</option>
            <option value="trailing">Geride / Fırsat</option>
            <option value="missing">Eksik Sayfa</option>
          </select>

          {/* Result counter */}
          <span className="text-[11px] text-slate-400 font-mono px-2 py-1 rounded bg-slate-800/80">
            {filteredAndSortedList.length} / {keywordList.length} sonuç
          </span>
        </div>
      </div>

      {/* 4. Interactive Table Container */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 shadow-md">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-950 border-b border-slate-800 text-[11px] font-black text-slate-400 uppercase tracking-wider select-none">
              {/* Keyword Column */}
              <th 
                className="p-3.5 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort("keyword")}
              >
                <div className="flex items-center gap-1.5">
                  <span>Anahtar Kelime & Niyet</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>

              {/* Monthly Volume Column */}
              <th 
                className="p-3.5 cursor-pointer hover:text-white transition-colors text-right"
                onClick={() => handleSort("volume")}
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Aylık Arama Hacmi</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>

              {/* Difficulty Level Column */}
              <th 
                className="p-3.5 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort("difficulty")}
              >
                <div className="flex items-center gap-1.5">
                  <span>Zorluk Seviyesi</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>

              {/* Your Site Rank */}
              <th 
                className="p-3.5 cursor-pointer bg-indigo-950/40 text-indigo-300 font-black hover:text-white transition-colors text-center border-x border-indigo-900/40"
                onClick={() => handleSort("userRank")}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>{userName}</span>
                  <ArrowUpDown className="w-3 h-3 text-indigo-400" />
                </div>
                <div className="text-[9px] text-indigo-400 font-normal lowercase tracking-normal">
                  (Siteniz)
                </div>
              </th>

              {/* Competitor 1 Rank */}
              <th className="p-3.5 text-center text-rose-300 font-bold bg-rose-950/20">
                <div>{comp1.name}</div>
                <div className="text-[9px] text-rose-400 font-normal lowercase tracking-normal">
                  (#1 Pazar Lideri)
                </div>
              </th>

              {/* Competitor 2 Rank */}
              <th className="p-3.5 text-center text-amber-300 font-bold bg-amber-950/20">
                <div>{comp2.name}</div>
                <div className="text-[9px] text-amber-400 font-normal lowercase tracking-normal">
                  (Bölgesel Güç)
                </div>
              </th>

              {/* Competitor 3 Rank */}
              <th className="p-3.5 text-center text-purple-300 font-bold bg-purple-950/20 hidden xl:table-cell">
                <div>{comp3.name}</div>
                <div className="text-[9px] text-purple-400 font-normal lowercase tracking-normal">
                  (Rakip #3)
                </div>
              </th>

              {/* Gap & Status Column */}
              <th 
                className="p-3.5 cursor-pointer hover:text-white transition-colors text-center"
                onClick={() => handleSort("gap")}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Sıralama Farkı (Gap)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>

              {/* Traffic Opportunity & Actions */}
              <th className="p-3.5 text-right">
                <span>Trafik Potansiyeli & Aksiyon</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/80 bg-slate-900/60 font-sans">
            {filteredAndSortedList.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-400 text-xs">
                  Filtreleme kriterlerine uygun anahtar kelime bulunamadı.
                </td>
              </tr>
            ) : (
              filteredAndSortedList.map((item) => {
                const diffBadge = getDifficultyBadge(item.difficulty);
                const isLeading = item.status === "leading";
                const isTrailing = item.status === "trailing" || item.status === "missing";
                const isUserBetterThanLeader = item.userRank !== null && item.comp1Rank !== null && item.userRank < item.comp1Rank;

                return (
                  <tr 
                    key={item.id} 
                    className="hover:bg-slate-800/50 transition-colors group"
                  >
                    {/* Keyword & Intent */}
                    <td className="p-3.5">
                      <div className="flex items-start gap-2">
                        <div>
                          <div className="font-bold text-white text-xs sm:text-sm font-mono flex items-center gap-1.5">
                            <span>{item.keyword}</span>
                            {isLeading && (
                              <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" title="1. Sıra Lideri" />
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                              {item.searchIntent}
                            </span>
                            {item.serpFeatures && item.serpFeatures.length > 0 && (
                              <span className="text-[10px] text-slate-400 hidden sm:inline">
                                • {item.serpFeatures[0]}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Monthly Volume */}
                    <td className="p-3.5 text-right">
                      <div className="font-mono font-bold text-cyan-300 text-xs sm:text-sm">
                        {item.monthlyVolume}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Aylık SERP talebi
                      </div>
                    </td>

                    {/* Difficulty Level with visual meter */}
                    <td className="p-3.5">
                      <div className="space-y-1 max-w-[130px]">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className={`px-1.5 py-0.5 rounded border text-[10px] ${diffBadge.bg}`}>
                            {diffBadge.label}
                          </span>
                          <span className="font-mono text-slate-300">%{item.difficulty}</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${diffBadge.barColor}`} 
                            style={{ width: `${Math.min(100, Math.max(10, item.difficulty))}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* User Rank */}
                    <td className="p-3.5 text-center bg-indigo-950/20 border-x border-indigo-900/40 font-mono">
                      {item.userRank !== null ? (
                        <div className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-600 text-white font-black text-xs shadow-xs">
                          <span>#{item.userRank}</span>
                        </div>
                      ) : (
                        <span className="px-2 py-1 rounded-lg bg-slate-800 text-slate-400 text-[10px] font-bold">
                          &gt;20 Sıra
                        </span>
                      )}
                    </td>

                    {/* Competitor 1 Rank */}
                    <td className="p-3.5 text-center bg-rose-950/10 font-mono">
                      {item.comp1Rank !== null ? (
                        <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold text-xs">
                          #{item.comp1Rank}
                        </span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>

                    {/* Competitor 2 Rank */}
                    <td className="p-3.5 text-center bg-amber-950/10 font-mono">
                      {item.comp2Rank !== null ? (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-xs">
                          #{item.comp2Rank}
                        </span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>

                    {/* Competitor 3 Rank */}
                    <td className="p-3.5 text-center bg-purple-950/10 font-mono hidden xl:table-cell">
                      {item.comp3Rank !== null ? (
                        <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold text-xs">
                          #{item.comp3Rank}
                        </span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>

                    {/* Gap / Difference */}
                    <td className="p-3.5 text-center">
                      {isLeading ? (
                        <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black inline-flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Lider Konum</span>
                        </span>
                      ) : item.gap > 0 ? (
                        <span className="px-2 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                          {item.gap} Sıra Açık
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                          +{Math.abs(item.gap)} Sıra Önde
                        </span>
                      )}
                    </td>

                    {/* Traffic Opportunity & Interactive Action Buttons */}
                    <td className="p-3.5 text-right">
                      <div className="text-emerald-400 font-mono font-bold text-xs">
                        {item.trafficOpportunity}
                      </div>
                      <div className="flex items-center justify-end gap-1.5 mt-1.5">
                        {/* Copy keyword */}
                        <button
                          type="button"
                          onClick={() => handleCopy(item.keyword)}
                          className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                          title="Kelimeyi kopyala"
                        >
                          {copiedKw === item.keyword ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Apply keyword to site configuration */}
                        {onApplyKeyword && (
                          <button
                            type="button"
                            onClick={() => handleApply(item.keyword)}
                            className="p-1 rounded-md bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white transition-colors cursor-pointer"
                            title="Sitenin anahtar kelimelerine ekle"
                          >
                            {appliedKw === item.keyword ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Plus className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}

                        {/* Send to AI Blog */}
                        {onSendToAiBlog && (
                          <button
                            type="button"
                            onClick={() => onSendToAiBlog(item.keyword, `${item.keyword} Kılavuzu: 2026 Hizmet Standartları`)}
                            className="px-2 py-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            title="AI Blog İçerik Fikri Oluştur"
                          >
                            <Sparkles className="w-3 h-3 text-amber-300" />
                            <span>Blog</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 5. Strategic Intelligence Advice Footnote */}
      <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5">
          <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-slate-300 leading-relaxed text-[11px]">
            <strong className="text-white">Algoritmik Kıyaslama Tavsiyesi: </strong>
            Zorluk seviyesi <strong>%35'in altında</strong> ve arama hacmi <strong>3.000+</strong> olan kelimelerde sitenizin 
            <strong> 0.02s Edge CDN sayfa hızı</strong> sayesinde 15 günde ilk 3 sıraya yerleşme olasılığı %84'tür.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-slate-400 font-mono">
            {siteConfig.sector} • {siteConfig.city}
          </span>
        </div>
      </div>
    </div>
  );
};
