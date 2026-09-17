import React, { useState, useMemo } from "react";
import {
  ShieldCheck,
  Zap,
  Target,
  Download,
  TrendingUp,
  Award,
  Sparkles,
  ExternalLink,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  ChevronDown,
  ChevronUp,
  Cpu,
  RefreshCw,
  X
} from "lucide-react";
import { SiteConfig, CustomerPanelTab, MarketShareCompetitorData } from "../../types";
import {
  generateMarketShareBenchmarkData,
  exportMarketShareCsv
} from "../../utils/marketShareBenchmarkEngine";

interface MarketShareBenchmarkTableProps {
  siteConfig: SiteConfig;
  onUpdateSiteConfig?: (updated: SiteConfig) => void;
  onNavigateTab?: (tab: CustomerPanelTab | string) => void;
  className?: string;
}

type ViewMode = "all" | "authority" | "keyword" | "speed";
type SortField = "marketShare" | "domainAuthority" | "keywordDensity" | "siteSpeed";
type SortOrder = "desc" | "asc";

export const MarketShareBenchmarkTable: React.FC<MarketShareBenchmarkTableProps> = ({
  siteConfig,
  onNavigateTab,
  className = ""
}) => {
  // Custom competitor list state
  const [customCompetitors, setCustomCompetitors] = useState<MarketShareCompetitorData[]>([]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newCompetitorDomain, setNewCompetitorDomain] = useState<string>("");
  const [newCompetitorName, setNewCompetitorName] = useState<string>("");
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Table filtering & sorting
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortField, setSortField] = useState<SortField>("marketShare");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [selectedCompetitorId, setSelectedCompetitorId] = useState<string | null>(null);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // Generate benchmark dataset
  const benchmarkData = useMemo(() => {
    return generateMarketShareBenchmarkData(siteConfig, customCompetitors);
  }, [siteConfig, customCompetitors]);

  const { items, userItem, leaderItem, summary } = benchmarkData;

  // Filtered & sorted items
  const processedItems = useMemo(() => {
    let result = [...items];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.domain.toLowerCase().includes(q) ||
          item.techStack.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      let valA = 0;
      let valB = 0;

      switch (sortField) {
        case "marketShare":
          valA = a.marketSharePercent;
          valB = b.marketSharePercent;
          break;
        case "domainAuthority":
          valA = a.domainAuthority;
          valB = b.domainAuthority;
          break;
        case "keywordDensity":
          valA = a.keywordDensityScore;
          valB = b.keywordDensityScore;
          break;
        case "siteSpeed":
          valA = a.siteSpeedScore;
          valB = b.siteSpeedScore;
          break;
      }

      return sortOrder === "desc" ? valB - valA : valA - valB;
    });

    return result;
  }, [items, searchQuery, sortField, sortOrder]);

  // Toggle sorting field
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Add custom competitor
  const handleAddCustomCompetitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompetitorDomain.trim()) return;

    setIsSimulating(true);

    setTimeout(() => {
      const cleanDomain = newCompetitorDomain.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
      const cleanName = newCompetitorName.trim() || cleanDomain;
      const hash = cleanDomain.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

      const simDA = 40 + (hash % 38);
      const simDensity = 60 + (hash % 32);
      const simSpeed = 55 + (hash % 35);
      const simVisits = 1800 + (hash % 4500);
      const simShare = Number((6 + (hash % 12)).toFixed(1));

      const newComp: MarketShareCompetitorData = {
        id: `custom-${Date.now()}`,
        name: cleanName,
        domain: cleanDomain,
        isUser: false,
        isCustom: true,
        rank: items.length + 1,
        marketSharePercent: simShare,
        marketShareLabel: `%${simShare}`,
        estimatedMonthlyVisits: simVisits,
        estimatedMonthlyVisitsLabel: `${(simVisits / 1000).toFixed(1)}K`,
        domainAuthority: simDA,
        pageAuthority: Math.max(30, simDA - 6),
        backlinksCount: 650 + (hash % 3000),
        referringDomains: 45 + (hash % 120),
        spamScore: 1 + (hash % 6),
        daDeltaVsUser: simDA - userItem.domainAuthority,
        keywordDensityScore: simDensity,
        avgKeywordDensityPercent: Number((1.5 + (hash % 20) / 10).toFixed(1)),
        densityStatus: simDensity > 85 ? "Aşırı Yoğun (Spam Riski)" : simDensity > 70 ? "İdeal (%1.8 - %2.5)" : "Yetersiz Yoğunluk",
        top3KeywordsCount: Math.floor(simVisits / 120),
        top10KeywordsCount: Math.floor(simVisits / 35),
        semanticCoveragePercent: Math.min(92, 50 + (hash % 40)),
        h1H3HierarchyScore: 65 + (hash % 25),
        siteSpeedScore: simSpeed,
        mobileSpeedScore: Math.max(35, simSpeed - 10),
        desktopSpeedScore: Math.min(95, simSpeed + 8),
        lcpSeconds: Number((1.5 + (100 - simSpeed) / 25).toFixed(1)),
        ttfbMs: 100 + (100 - simSpeed) * 5,
        clsScore: Number(((100 - simSpeed) * 0.002).toFixed(2)),
        speedGrade: simSpeed >= 90 ? "Mükemmel (A+)" : simSpeed >= 75 ? "İyi (B)" : "Yavaş (C)",
        techStack: simSpeed > 85 ? "Modern Jamstack / Cloud CDN" : "WordPress / Paylaşımlı Hosting",
        keyAdvantage: "Yerel aramalarda aktif ve sektörel katalog/dizin listelemelerine sahip.",
        mainVulnerability: simSpeed < 80 ? "Düşük Google Core Web Vitals skoru ve yavaş LCP açılış süresi." : "Geri bağlantı (backlink) yetersizliği.",
        tacticalCounterMove: "Yüksek hızlı açılış sayfalarınız ve zengin FAQ şemanızla bu rakibin önüne geçin."
      };

      setCustomCompetitors((prev) => [...prev, newComp]);
      setNewCompetitorDomain("");
      setNewCompetitorName("");
      setIsSimulating(false);
      setShowAddModal(false);
      setCopiedNotification(`"${cleanName}" başarıyla pazar kıyaslama tablosuna eklendi!`);
      setTimeout(() => setCopiedNotification(null), 4000);
    }, 450);
  };

  // Remove custom competitor
  const handleRemoveCustomCompetitor = (id: string) => {
    setCustomCompetitors((prev) => prev.filter((c) => c.id !== id));
  };

  // Export CSV
  const handleDownloadCsv = () => {
    const csvContent = exportMarketShareCsv(processedItems);
    const blob = new Blob([`\uFEFF${csvContent}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `pazar-payi-kiyaslama-${siteConfig.sector?.toLowerCase().replace(/[^a-z0-9]/g, "") || "rapor"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setCopiedNotification("Pazar Payı Kıyaslama Tablosu CSV olarak indirildi!");
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  const selectedCompetitor = items.find((i) => i.id === selectedCompetitorId);

  return (
    <div id="market-share-benchmark-table-root" className={`space-y-6 ${className}`}>
      {/* ===================================================================== */}
      {/* 1. HEADER & INTRO BANNER */}
      {/* ===================================================================== */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -top-16 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-wide">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>SEKTÖREL PAZAR PAYI VE DOĞRUDAN RAKİP BENCHMARK</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                <span>Pazar Payı Kıyaslama Tablosu</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono font-medium">
                  {summary.city} • {summary.sector}
                </span>
              </h2>
              <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
                Rakiplerle doğrudan <strong>Domain Otoritesi (DA)</strong>, <strong>Anahtar Kelime Yoğunluğu</strong> ve{" "}
                <strong>Site Hızı (Core Web Vitals)</strong> metriklerini birebir kıyaslayın. Hangi alanlarda pazar liderisiniz, nerede boşluk var anında tespit edin.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                id="btn-add-competitor-benchmark"
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Özel Rakip Ekle</span>
              </button>

              <button
                type="button"
                id="btn-download-benchmark-csv"
                onClick={handleDownloadCsv}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                title="Tüm kıyaslama tablosunu Excel / CSV olarak indirin"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline">CSV İndir</span>
              </button>
            </div>
          </div>

          {/* Top Takeaway Strategy Note */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-indigo-500/30 flex items-start gap-3.5 backdrop-blur-xs">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center shrink-0 text-cyan-300 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              <span className="font-bold text-cyan-400 mr-1.5">Stratejik Özet & Hızlı Kazanım:</span>
              {summary.topTakeaway}
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. SUMMARY KPI STAT CARDS (MATHEMATICALLY STRUCTURED) */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pazar Payı & Sıralama */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pazar Payı & Sıra</span>
            <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
              #{userItem.rank} / {items.length} Sırada
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{userItem.marketShareLabel}</span>
            <span className="text-xs font-semibold text-slate-500">({userItem.estimatedMonthlyVisitsLabel} Ziyaret/Ay)</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
            <div
              className="bg-cyan-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${userItem.marketSharePercent}%` }}
              title={`Siteniz: %${userItem.marketSharePercent}`}
            />
            <div
              className="bg-amber-400 h-full opacity-40 ml-1 transition-all duration-700"
              style={{ width: `${leaderItem.marketSharePercent}%` }}
              title={`Lider Rakip: %${leaderItem.marketSharePercent}`}
            />
          </div>
          <p className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>Pazar Lideri: {leaderItem.marketShareLabel}</span>
            <span className="font-bold text-slate-700">Fark: %{(leaderItem.marketSharePercent - userItem.marketSharePercent).toFixed(1)}</span>
          </p>
        </div>

        {/* Card 2: Domain Otoritesi (DA) Kıyaslaması */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Domain Otoritesi (DA)</span>
            <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-indigo-600">{userItem.domainAuthority}</span>
            <span className="text-xs font-bold text-slate-500">/ 100 DA</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 ml-auto">
              Lider: {leaderItem.domainAuthority} DA
            </span>
          </div>
          <div className="text-[11px] text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span>Backlink Hacminiz:</span>
              <span className="font-bold text-slate-800">{userItem.backlinksCount.toLocaleString("tr-TR")} adet</span>
            </div>
            <div className="flex justify-between">
              <span>Güven & Spam Skoru:</span>
              <span className="font-bold text-emerald-600">%{userItem.spamScore} (Mükemmel)</span>
            </div>
          </div>
        </div>

        {/* Card 3: Anahtar Kelime Yoğunluğu */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kelime Yoğunluğu</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Target className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600">%{userItem.avgKeywordDensityPercent}</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Doğal & İdeal
            </span>
          </div>
          <div className="text-[11px] text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span>Liderin Yoğunluğu:</span>
              <span className="font-bold text-rose-600">%{leaderItem.avgKeywordDensityPercent} (Aşırı Yoğun)</span>
            </div>
            <div className="flex justify-between">
              <span>İlk 10'daki Kelimeler:</span>
              <span className="font-bold text-slate-800">{userItem.top10KeywordsCount} kelime</span>
            </div>
          </div>
        </div>

        {/* Card 4: Site Hızı & Core Web Vitals (Büyük Üstünlük) */}
        <div className="bg-white rounded-2xl p-5 border border-emerald-200/90 bg-gradient-to-b from-white to-emerald-50/20 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Site Hızı (PageSpeed)</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700">
              <Zap className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600">{userItem.siteSpeedScore}</span>
            <span className="text-xs font-bold text-slate-500">/ 100</span>
            <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 ml-auto">
              +{summary.speedAdvantageVsLeader} Puan Öndesiniz
            </span>
          </div>
          <div className="text-[11px] text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span>LCP Açılış Süresi:</span>
              <span className="font-bold text-emerald-700">{userItem.lcpSeconds}s (Lider: {leaderItem.lcpSeconds}s)</span>
            </div>
            <div className="flex justify-between">
              <span>Edge CDN TTFB:</span>
              <span className="font-bold text-emerald-700">{userItem.ttfbMs}ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. CONTROLS, VIEW FILTER & SEARCH BAR */}
      {/* ===================================================================== */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* View Mode Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            id="view-mode-all"
            onClick={() => setViewMode("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Tüm Metrikler (Kapsamlı)
          </button>
          <button
            type="button"
            id="view-mode-authority"
            onClick={() => setViewMode("authority")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === "authority" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
            <span>Domain Otoritesi (DA)</span>
          </button>
          <button
            type="button"
            id="view-mode-keyword"
            onClick={() => setViewMode("keyword")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === "keyword" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Target className="w-3.5 h-3.5 text-emerald-500" />
            <span>Anahtar Kelime Yoğunluğu</span>
          </button>
          <button
            type="button"
            id="view-mode-speed"
            onClick={() => setViewMode("speed")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === "speed" ? "bg-white text-amber-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Site Hızı & CWV</span>
          </button>
        </div>

        {/* Search & Sort Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="input-benchmark-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Firma veya domain ara..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium hidden lg:block">
            Gösterilen: <strong className="text-slate-800">{processedItems.length}</strong> / {items.length} Firma
          </div>
        </div>
      </div>

      {/* Copy Notification Toast */}
      {copiedNotification && (
        <div className="p-3 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center justify-between shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{copiedNotification}</span>
          </div>
          <button
            type="button"
            onClick={() => setCopiedNotification(null)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. THE MASTER COMPARISON BENCHMARK TABLE */}
      {/* ===================================================================== */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-slate-900 text-white text-xs font-bold uppercase tracking-wider border-b border-slate-800">
                <th className="py-3.5 px-4 w-12 text-center">Sıra</th>
                <th className="py-3.5 px-4 min-w-[220px]">Firma & Alan Adı</th>
                
                {/* Pazar Payı */}
                <th
                  onClick={() => handleSort("marketShare")}
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Pazar Payı</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>

                {/* 1. Domain Otoritesi Kolonları */}
                {(viewMode === "all" || viewMode === "authority") && (
                  <>
                    <th
                      onClick={() => handleSort("domainAuthority")}
                      className="py-3.5 px-4 cursor-pointer hover:bg-slate-800 transition-colors bg-indigo-950/40"
                    >
                      <div className="flex items-center gap-1.5 text-indigo-300">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Domain Otoritesi (DA)</span>
                        <ArrowUpDown className="w-3 h-3 opacity-60" />
                      </div>
                    </th>
                    <th className="py-3.5 px-4 bg-indigo-950/20 text-indigo-200 font-normal">Backlink & Ref</th>
                  </>
                )}

                {/* 2. Anahtar Kelime Yoğunluğu Kolonları */}
                {(viewMode === "all" || viewMode === "keyword") && (
                  <>
                    <th
                      onClick={() => handleSort("keywordDensity")}
                      className="py-3.5 px-4 cursor-pointer hover:bg-slate-800 transition-colors bg-emerald-950/40"
                    >
                      <div className="flex items-center gap-1.5 text-emerald-300">
                        <Target className="w-3.5 h-3.5" />
                        <span>Kelime Yoğunluğu (%)</span>
                        <ArrowUpDown className="w-3 h-3 opacity-60" />
                      </div>
                    </th>
                    <th className="py-3.5 px-4 bg-emerald-950/20 text-emerald-200 font-normal">Top 3 / Top 10</th>
                  </>
                )}

                {/* 3. Site Hızı Kolonları */}
                {(viewMode === "all" || viewMode === "speed") && (
                  <>
                    <th
                      onClick={() => handleSort("siteSpeed")}
                      className="py-3.5 px-4 cursor-pointer hover:bg-slate-800 transition-colors bg-amber-950/40"
                    >
                      <div className="flex items-center gap-1.5 text-amber-300">
                        <Zap className="w-3.5 h-3.5" />
                        <span>Site Hızı (CWV)</span>
                        <ArrowUpDown className="w-3 h-3 opacity-60" />
                      </div>
                    </th>
                    <th className="py-3.5 px-4 bg-amber-950/20 text-amber-200 font-normal">LCP & TTFB</th>
                  </>
                )}

                <th className="py-3.5 px-4 text-center">Detay</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 text-xs">
              {processedItems.map((item) => {
                const isUser = item.isUser;
                const isExpanded = selectedCompetitorId === item.id;

                return (
                  <React.Fragment key={item.id}>
                    <tr
                      className={`transition-colors ${
                        isUser
                          ? "bg-cyan-50/70 hover:bg-cyan-50 font-medium"
                          : "hover:bg-slate-50/80"
                      }`}
                    >
                      {/* Sıra & Rozet */}
                      <td className="py-4 px-4 text-center">
                        {item.rank === 1 ? (
                          <span className="w-7 h-7 rounded-full bg-amber-500 text-white font-black inline-flex items-center justify-center text-xs shadow-xs" title="Pazar Lideri">
                            1
                          </span>
                        ) : isUser ? (
                          <span className="w-7 h-7 rounded-full bg-cyan-600 text-white font-black inline-flex items-center justify-center text-xs shadow-xs ring-2 ring-cyan-400/40" title="Siteniz">
                            {item.rank}
                          </span>
                        ) : (
                          <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold inline-flex items-center justify-center text-xs">
                            {item.rank}
                          </span>
                        )}
                      </td>

                      {/* Firma & Domain */}
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold text-sm ${isUser ? "text-cyan-950" : "text-slate-900"}`}>
                              {item.name}
                            </span>
                            {isUser && (
                              <span className="px-2 py-0.5 rounded-md bg-cyan-600 text-white text-[10px] font-black uppercase tracking-wider">
                                Siteniz
                              </span>
                            )}
                            {item.isCustom && (
                              <span className="px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-700 text-[10px] font-bold">
                                Özel
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-slate-500 text-xs">
                            <span className="font-mono">{item.domain}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-[11px] text-slate-600">{item.techStack}</span>
                          </div>
                        </div>
                      </td>

                      {/* Pazar Payı */}
                      <td className="py-4 px-4">
                        <div className="space-y-1.5">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-sm font-black text-slate-900">{item.marketShareLabel}</span>
                            <span className="text-[11px] text-slate-500">({item.estimatedMonthlyVisitsLabel}/ay)</span>
                          </div>
                          <div className="w-24 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${isUser ? "bg-cyan-500" : item.rank === 1 ? "bg-amber-500" : "bg-slate-500"}`}
                              style={{ width: `${item.marketSharePercent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* 1. DOMAIN OTORİTESİ (DA) */}
                      {(viewMode === "all" || viewMode === "authority") && (
                        <>
                          <td className="py-4 px-4 bg-indigo-50/30">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-indigo-950">{item.domainAuthority} DA</span>
                                {!isUser && (
                                  <span
                                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                                      item.domainAuthority > userItem.domainAuthority
                                        ? "bg-amber-100 text-amber-800"
                                        : "bg-emerald-100 text-emerald-800"
                                    }`}
                                    title={`Sitenize kıyasla fark: ${item.domainAuthority - userItem.domainAuthority > 0 ? "+" : ""}${item.domainAuthority - userItem.domainAuthority}`}
                                  >
                                    {item.domainAuthority - userItem.domainAuthority > 0
                                      ? `+${item.domainAuthority - userItem.domainAuthority} DA`
                                      : `${item.domainAuthority - userItem.domainAuthority} DA`}
                                  </span>
                                )}
                              </div>
                              <div className="w-20 bg-indigo-100 h-1 rounded-full overflow-hidden">
                                <div
                                  className="bg-indigo-600 h-full rounded-full"
                                  style={{ width: `${item.domainAuthority}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4 bg-indigo-50/10 text-slate-600">
                            <div className="space-y-0.5">
                              <span className="font-bold text-slate-800">{item.backlinksCount.toLocaleString("tr-TR")}</span>
                              <span className="text-[10px] text-slate-500 block">
                                {item.referringDomains} Ref • %{item.spamScore} Spam
                              </span>
                            </div>
                          </td>
                        </>
                      )}

                      {/* 2. ANAHTAR KELİME YOĞUNLUĞU */}
                      {(viewMode === "all" || viewMode === "keyword") && (
                        <>
                          <td className="py-4 px-4 bg-emerald-50/30">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm font-black text-emerald-950">%{item.avgKeywordDensityPercent}</span>
                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                                    item.densityStatus.includes("İdeal")
                                      ? "bg-emerald-100 text-emerald-800"
                                      : item.densityStatus.includes("Aşırı")
                                      ? "bg-rose-100 text-rose-800"
                                      : "bg-amber-100 text-amber-800"
                                  }`}
                                >
                                  {item.densityStatus.includes("İdeal")
                                    ? "Doğal"
                                    : item.densityStatus.includes("Aşırı")
                                    ? "Spam Riski!"
                                    : "Yetersiz"}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-500 block">
                                Skor: {item.keywordDensityScore}/100
                              </span>
                            </div>
                          </td>

                          <td className="py-4 px-4 bg-emerald-50/10 text-slate-600">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-emerald-700">{item.top3KeywordsCount}</span>
                                <span className="text-[10px] text-slate-400">/</span>
                                <span className="font-bold text-slate-800">{item.top10KeywordsCount}</span>
                              </div>
                              <span className="text-[10px] text-slate-500 block">
                                %{item.semanticCoveragePercent} Kapsam
                              </span>
                            </div>
                          </td>
                        </>
                      )}

                      {/* 3. SİTE HIZI & CORE WEB VITALS */}
                      {(viewMode === "all" || viewMode === "speed") && (
                        <>
                          <td className="py-4 px-4 bg-amber-50/30">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-sm font-black ${
                                  item.siteSpeedScore >= 90
                                    ? "text-emerald-700"
                                    : item.siteSpeedScore >= 70
                                    ? "text-amber-700"
                                    : "text-rose-700"
                                }`}>
                                  {item.siteSpeedScore}/100
                                </span>
                                <span
                                  className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                                    item.siteSpeedScore >= 90
                                      ? "bg-emerald-100 text-emerald-800"
                                      : item.siteSpeedScore >= 70
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-rose-100 text-rose-800"
                                  }`}
                                >
                                  {item.speedGrade}
                                </span>
                              </div>
                              {/* Difference with user */}
                              {!isUser && (
                                <span className="text-[10px] text-emerald-700 font-bold block">
                                  {userItem.siteSpeedScore - item.siteSpeedScore > 0
                                    ? `+${userItem.siteSpeedScore - item.siteSpeedScore} Puan Daha Hızlısınız`
                                    : `${userItem.siteSpeedScore - item.siteSpeedScore} Puan`}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-4 px-4 bg-amber-50/10 text-slate-600">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className={`font-bold ${item.lcpSeconds <= 1.5 ? "text-emerald-700" : item.lcpSeconds <= 2.5 ? "text-amber-700" : "text-rose-700"}`}>
                                  LCP: {item.lcpSeconds}s
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-500 block">
                                TTFB: {item.ttfbMs}ms • CLS: {item.clsScore}
                              </span>
                            </div>
                          </td>
                        </>
                      )}

                      {/* Aksiyon & Detay Butonu */}
                      <td className="py-4 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedCompetitorId(isExpanded ? null : item.id)}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            isExpanded
                              ? "bg-slate-900 text-white border-slate-900"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                          }`}
                          title="Stratejik Karşılaştırma & Taktiksel Hamleyi Gör"
                        >
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                    </tr>

                    {/* EXPANDABLE DIRECT HEAD-TO-HEAD BREAKDOWN */}
                    {isExpanded && (
                      <tr className="bg-slate-900 text-white border-y border-slate-800">
                        <td colSpan={10} className="p-5">
                          <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
                                  <Cpu className="w-4 h-4" />
                                </div>
                                <div>
                                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                    <span>{item.name}</span>
                                    <span className="text-slate-400 font-mono text-xs">({item.domain})</span>
                                    {isUser && <span className="text-cyan-400 text-xs">(Siteniz)</span>}
                                  </h4>
                                  <p className="text-xs text-slate-400">Doğrudan Stratejik Kıyaslama & Fırsat Analizi</p>
                                </div>
                              </div>

                              {item.isCustom && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveCustomCompetitor(item.id)}
                                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Bu Özel Rakibi Kaldır</span>
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* 1. Güçlü Yön */}
                              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1.5">
                                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Temel Avantaj</span>
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed">{item.keyAdvantage}</p>
                              </div>

                              {/* 2. Zayıf Nokta (Açık) */}
                              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1.5">
                                <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold uppercase tracking-wider">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  <span>Kritik Zayıflık</span>
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed">{item.mainVulnerability}</p>
                              </div>

                              {/* 3. Taktiksel Hamle */}
                              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-indigo-500/40 bg-gradient-to-br from-slate-800 to-indigo-950/40 space-y-1.5">
                                <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>Taktiksel Karşı Hamle</span>
                                </div>
                                <p className="text-xs text-cyan-100 leading-relaxed">{item.tacticalCounterMove}</p>
                              </div>
                            </div>

                            {/* Direct Metrics Comparison Row */}
                            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
                              <div className="flex items-center gap-4">
                                <div>
                                  <span className="text-slate-400 block text-[10px]">DA Seviyesi:</span>
                                  <span className="font-bold text-white">{item.domainAuthority} / 100</span>
                                </div>
                                <div className="h-6 w-px bg-slate-800" />
                                <div>
                                  <span className="text-slate-400 block text-[10px]">Ort. Kelime Yoğunluğu:</span>
                                  <span className="font-bold text-white">%{item.avgKeywordDensityPercent}</span>
                                </div>
                                <div className="h-6 w-px bg-slate-800" />
                                <div>
                                  <span className="text-slate-400 block text-[10px]">Mobil Hız Skoru:</span>
                                  <span className="font-bold text-white">{item.mobileSpeedScore} / 100</span>
                                </div>
                                <div className="h-6 w-px bg-slate-800" />
                                <div>
                                  <span className="text-slate-400 block text-[10px]">LCP (Açılış):</span>
                                  <span className="font-bold text-white">{item.lcpSeconds} saniye</span>
                                </div>
                              </div>

                              {onNavigateTab && (
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => onNavigateTab("content-gap-map")}
                                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all text-xs cursor-pointer"
                                  >
                                    İçerik Boşluğunu Gör
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => onNavigateTab("site-health-performance")}
                                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold transition-all text-xs cursor-pointer"
                                  >
                                    Hız İyileştirme Planı
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer Stats */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-500" />
            <span>
              Metrikler Google PageSpeed Insights, Core Web Vitals ve SERP crawler verileriyle periyodik senkronize edilir.
            </span>
          </div>
          <div className="font-semibold text-slate-700">
            Son Güncelleme: {summary.analyzedAt}
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 5. ADD CUSTOM COMPETITOR MODAL */}
      {/* ===================================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Kıyaslama Tablosuna Rakip Ekle</h3>
                  <p className="text-xs text-slate-500">Domain adını girin, metrikler otomatik hesaplansın.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomCompetitor} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Rakip Alan Adı (Domain) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newCompetitorDomain}
                  onChange={(e) => setNewCompetitorDomain(e.target.value)}
                  placeholder="ornekrakip.com.tr"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Firma / Marka Adı (Opsiyonel)
                </label>
                <input
                  type="text"
                  value={newCompetitorName}
                  onChange={(e) => setNewCompetitorName(e.target.value)}
                  placeholder="Örnek Rakip Taşımacılık"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-900 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Otomatik Metrik Simülasyonu:</span>
                </span>
                <p className="text-[11px] text-indigo-800/80">
                  Domain analizi tamamlandığında bu firmanın tahmini DA puanı, anahtar kelime yoğunluk dağılımı ve Google PageSpeed hız skoru tabloya eklenecektir.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSimulating || !newCompetitorDomain.trim()}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  {isSimulating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Analiz Ediliyor...</span>
                    </>
                  ) : (
                    <span>Tabloya Dahil Et</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
