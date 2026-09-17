import React, { useState, useMemo } from "react";
import {
  PieChart,
  Target,
  TrendingUp,
  Download,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
  Award,
  ShieldCheck,
  Zap,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Copy,
  Check,
  BarChart3,
  Layers,
  ArrowUpDown,
  RefreshCw,
  Plus
} from "lucide-react";
import { SiteConfig, CustomerPanelTab } from "../../types";
import {
  generateMarketShareCompetitorData,
  exportMarketShareAnalysisCsv,
  MarketShareKeywordItem,
  MarketShareCompetitorProfile
} from "../../utils/marketShareAnalysisEngine";
import { MarketShareD3DonutChart } from "./MarketShareD3DonutChart";
import { MarketShareD3RankingBarChart } from "./MarketShareD3RankingBarChart";

export interface MarketShareCompetitorAnalysisPanelProps {
  siteConfig: SiteConfig;
  onUpdateSiteConfig?: (updated: SiteConfig) => void;
  onNavigateTab?: (tab: CustomerPanelTab | string) => void;
  className?: string;
}

type TabCategoryFilter = "all" | "Temel Hizmet" | "Acil & 7/24" | "Fiyat & Maliyet" | "Bölgesel / İlçe" | "Marka / Güven";
type RankingStatusFilter = "all" | "user-leading" | "competing" | "trailing";
type SortField = "opportunity" | "volume" | "rank" | "difficulty";
type SortOrder = "desc" | "asc";

export const MarketShareCompetitorAnalysisPanel: React.FC<MarketShareCompetitorAnalysisPanelProps> = ({
  siteConfig,
  onNavigateTab,
  className = ""
}) => {
  // Generate market share analysis data
  const data = useMemo(() => {
    return generateMarketShareCompetitorData(siteConfig);
  }, [siteConfig]);

  const {
    sector,
    city,
    totalMarketSearchVolumeFormatted,
    userMarketShare,
    userMarketRank,
    competitors,
    keywords,
    userProfile,
    leaderProfile,
    summary
  } = data;

  // State
  const [selectedCompetitorId, setSelectedCompetitorId] = useState<string | null>(null);
  const [selectedKeywordId, setSelectedKeywordId] = useState<string | null>(keywords[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<TabCategoryFilter>("all");
  const [statusFilter, setStatusFilter] = useState<RankingStatusFilter>("all");
  const [sortField, setSortField] = useState<SortField>("opportunity");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);
  const [activeVisualTab, setActiveVisualTab] = useState<"donut" | "ranking-bars" | "both">("both");

  // Selected keyword object
  const activeKeyword = useMemo(() => {
    return keywords.find(k => k.id === selectedKeywordId) || keywords[0];
  }, [keywords, selectedKeywordId]);

  // Filtered and sorted keywords
  const filteredKeywords = useMemo(() => {
    let list = [...keywords];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        k =>
          k.keyword.toLowerCase().includes(q) ||
          k.searchIntent.toLowerCase().includes(q) ||
          k.category.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      list = list.filter(k => k.category === categoryFilter);
    }

    // Status filter
    if (statusFilter === "user-leading") {
      list = list.filter(k => k.userRank === 1);
    } else if (statusFilter === "competing") {
      list = list.filter(k => k.gapToLeader <= 2 && k.userRank > 1);
    } else if (statusFilter === "trailing") {
      list = list.filter(k => k.gapToLeader >= 3);
    }

    // Sorting
    list.sort((a, b) => {
      let valA = 0;
      let valB = 0;
      if (sortField === "opportunity") {
        valA = a.opportunityScore;
        valB = b.opportunityScore;
      } else if (sortField === "volume") {
        valA = a.monthlySearchVolume;
        valB = b.monthlySearchVolume;
      } else if (sortField === "rank") {
        valA = a.userRank;
        valB = b.userRank;
      } else if (sortField === "difficulty") {
        valA = a.seoDifficulty;
        valB = b.seoDifficulty;
      }
      return sortOrder === "desc" ? valB - valA : valA - valB;
    });

    return list;
  }, [keywords, searchQuery, categoryFilter, statusFilter, sortField, sortOrder]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyword(text);
    setTimeout(() => setCopiedKeyword(null), 2000);
  };

  const handleSortToggle = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === "desc" ? "asc" : "desc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  return (
    <div
      id="pazar-payi-rakip-analiz-paneli"
      className={`bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden space-y-6 ${className}`}
    >
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-black tracking-wide">
                <PieChart className="w-3.5 h-3.5 text-indigo-400" />
                D3.js Pazar Payı & Sıralama Motoru
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-extrabold">
                {sector} • {city}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-extrabold">
                Pazar Sıralamanız: #{userMarketRank}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Pazar Payı Rakip Analiz Paneli
            </h2>
            <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
              Google sıralama verileri, anahtar kelime pazar payı pasta dağılımı ve rakiplerle doğrudan başa baş
              performans kıyaslaması. D3.js ile modellenen interaktif görselleştirmelerle liderliği yakalayacak stratejik adımlar.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              id="export-market-share-csv-btn"
              onClick={() => exportMarketShareAnalysisCsv(data)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>CSV Rapor İndir</span>
            </button>
            {onNavigateTab && (
              <button
                type="button"
                id="market-share-to-executive-btn"
                onClick={() => onNavigateTab("seo-executive-summary")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black transition-all shadow-md cursor-pointer active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Yönetici Özeti Raporu</span>
              </button>
            )}
          </div>
        </div>

        {/* Executive Takeaway Bar */}
        <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-start sm:items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-400/20 text-amber-300 shrink-0 mt-0.5 sm:mt-0">
              <Award className="w-4 h-4" />
            </span>
            <div className="space-y-0.5">
              <span className="font-extrabold text-amber-200 uppercase tracking-wider text-[10px]">
                Stratejik Pazar Hamlesi
              </span>
              <p className="text-slate-200 text-xs sm:text-sm font-medium">{summary.keyTakeaway}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0 pt-2 md:pt-0 border-t border-white/10 md:border-0">
            <span className="text-slate-300 font-bold">Hızlı Trafik Potansiyeli:</span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-black text-xs border border-emerald-400/30">
              {summary.immediateTrafficBoostOpportunity}
            </span>
          </div>
        </div>
      </div>

      <div className="px-6 sm:px-8 space-y-8">
        {/* 2. Key KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="market-share-kpi-cards">
          {/* Card 1: User Market Share */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-white to-white border border-indigo-100 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Pazar Payı Oranınız</span>
              <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                <PieChart className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">%{userMarketShare}</span>
              <span className="text-xs font-bold text-emerald-600 flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" />
                Pazar #{userMarketRank}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-600">
              Lider ({leaderProfile.name}): %{leaderProfile.marketSharePercent}
            </p>
          </div>

          {/* Card 2: Top Keyword Wins */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-white to-white border border-emerald-100 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">#1 Sıra Liderlikler</span>
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{summary.topKeywordWins} Sorgu</span>
              <span className="text-xs font-bold text-emerald-600">Google #1</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-600">Arama motorunda en tepede yer aldığınız sorgular</p>
          </div>

          {/* Card 3: Head to Head Battles */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/70 via-white to-white border border-amber-100 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Başa Baş Rekabet (±2 Sıra)</span>
              <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{summary.headToHeadBattles} Sorgu</span>
              <span className="text-xs font-bold text-amber-600">Kritik Fırsat</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-600">Küçük optimizasyonla #1 sıraya geçebileceğiniz kelimeler</p>
          </div>

          {/* Card 4: Total Search Pool */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Toplam Arama Havuzu</span>
              <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{totalMarketSearchVolumeFormatted}</span>
              <span className="text-xs font-bold text-slate-600">Arama/Ay</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-600">{city} geneli toplam sektörel arama hacmi</p>
          </div>
        </div>

        {/* 3. D3.js Visualizations Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                D3.js İnteraktif Pazar ve Sıralama Grafikleri
              </h3>
              <p className="text-xs text-slate-600">
                Pasta grafiği pazar payını, çubuk grafiği ise en kritik aramalardaki Google sıralama konumlarını gösterir.
              </p>
            </div>

            {/* Visual Tab Toggle */}
            <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200/80 shrink-0">
              <button
                type="button"
                onClick={() => setActiveVisualTab("both")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeVisualTab === "both" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                İkili Görünüm
              </button>
              <button
                type="button"
                onClick={() => setActiveVisualTab("donut")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeVisualTab === "donut" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Pazar Payı (Pasta)
              </button>
              <button
                type="button"
                onClick={() => setActiveVisualTab("ranking-bars")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeVisualTab === "ranking-bars" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Sıralama Karşılaştırma
              </button>
            </div>
          </div>

          {/* D3 Chart Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* D3 Donut Chart Card */}
            {(activeVisualTab === "both" || activeVisualTab === "donut") && (
              <div
                className={`p-6 rounded-3xl bg-slate-50/70 border border-slate-200/80 shadow-xs flex flex-col justify-between ${
                  activeVisualTab === "both" ? "lg:col-span-5" : "lg:col-span-12"
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Pazar Payı Dağılımı (D3 Donut)
                    </span>
                    <p className="text-[11px] text-slate-600">
                      Dilimlere tıklayarak rakip performansını inceleyebilirsiniz
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-extrabold">
                    %{userMarketShare} Pay
                  </span>
                </div>

                {/* Donut Component */}
                <MarketShareD3DonutChart
                  competitors={competitors}
                  userMarketShare={userMarketShare}
                  totalMarketVolumeFormatted={totalMarketSearchVolumeFormatted}
                  selectedCompetitorId={selectedCompetitorId}
                  onSelectCompetitor={setSelectedCompetitorId}
                  height={activeVisualTab === "both" ? 300 : 360}
                />

                {/* Selected Competitor Mini Inspector */}
                {selectedCompetitorId && (
                  <div className="mt-4 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs text-xs space-y-2">
                    {(() => {
                      const c = competitors.find(item => item.id === selectedCompetitorId);
                      if (!c) return null;
                      return (
                        <>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                              <strong className="text-slate-900 font-bold">{c.name}</strong>
                            </div>
                            <span className="font-extrabold text-indigo-600 text-sm">
                              %{c.marketSharePercent} Pazar Payı
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-100">
                            <div>
                              <span className="text-slate-600">Aylık Organik Trafik:</span>{" "}
                              <strong className="text-slate-800">~{c.estimatedOrganicTraffic.toLocaleString("tr-TR")}</strong>
                            </div>
                            <div>
                              <span className="text-slate-600">Ortalama Google Sırası:</span>{" "}
                              <strong className="text-slate-800">#{c.avgRanking}</strong>
                            </div>
                            <div>
                              <span className="text-slate-600">İlk 3 Sıradaki Kelimeler:</span>{" "}
                              <strong className="text-emerald-700">{c.top3Count} adet</strong>
                            </div>
                            <div>
                              <span className="text-slate-600">Site Hız Puanı:</span>{" "}
                              <strong className="text-slate-800">{c.siteSpeedScore}/100</strong>
                            </div>
                          </div>
                          <div className="pt-1.5 text-[11px] text-slate-700">
                            <strong>Zayıf Nokta:</strong> {c.vulnerabilities[0]}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* D3 Ranking Bar Chart Card */}
            {(activeVisualTab === "both" || activeVisualTab === "ranking-bars") && (
              <div
                className={`p-6 rounded-3xl bg-slate-50/70 border border-slate-200/80 shadow-xs flex flex-col justify-between ${
                  activeVisualTab === "both" ? "lg:col-span-7" : "lg:col-span-12"
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Google Sıralama Kıyaslaması (D3 Bar Chart)
                    </span>
                    <p className="text-[11px] text-slate-600">
                      Çubuklara tıklayarak detaylı anahtar kelime taktiklerini görebilirsiniz
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                    8 Temel Sorgu
                  </span>
                </div>

                {/* Horizontal Bar Component */}
                <MarketShareD3RankingBarChart
                  keywords={keywords}
                  selectedKeywordId={selectedKeywordId}
                  onSelectKeyword={setSelectedKeywordId}
                  height={activeVisualTab === "both" ? 340 : 380}
                />
              </div>
            )}
          </div>
        </div>

        {/* 4. Active Keyword Deep-Dive Action Card */}
        {activeKeyword && (
          <div
            id="active-keyword-tactic-card"
            className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white shadow-xl border border-indigo-700/50 space-y-4"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-extrabold">
                    {activeKeyword.category}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-slate-200 text-xs font-semibold">
                    {activeKeyword.searchIntent}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                    Fırsat Skoru: {activeKeyword.opportunityScore}/100
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <span>"{activeKeyword.keyword}"</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(activeKeyword.keyword)}
                    className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition-all cursor-pointer"
                    title="Anahtar kelimeyi kopyala"
                  >
                    {copiedKeyword === activeKeyword.keyword ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </h3>
              </div>

              {/* Head-to-Head Rank Badges */}
              <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl border border-white/10 shrink-0">
                <div className="text-center px-2">
                  <span className="block text-[10px] text-slate-300 font-bold uppercase">Sizin Sıranız</span>
                  <span className={`text-2xl font-black ${activeKeyword.userRank === 1 ? "text-emerald-400" : "text-indigo-300"}`}>
                    #{activeKeyword.userRank}
                  </span>
                </div>
                <div className="h-8 w-px bg-white/20" />
                <div className="text-center px-2">
                  <span className="block text-[10px] text-slate-300 font-bold uppercase">En İyi Rakip</span>
                  <span className="text-2xl font-black text-amber-400">
                    #{activeKeyword.bestCompetitor.rank}
                  </span>
                </div>
                <div className="h-8 w-px bg-white/20" />
                <div className="text-center px-2">
                  <span className="block text-[10px] text-slate-300 font-bold uppercase">Sıra Farkı</span>
                  <span className={`text-xl font-black ${activeKeyword.gapToLeader <= 0 ? "text-emerald-400" : "text-rose-300"}`}>
                    {activeKeyword.gapToLeader <= 0 ? "Lider Sizsiniz" : `-${activeKeyword.gapToLeader} Sıra`}
                  </span>
                </div>
              </div>
            </div>

            {/* Tactical Action Line */}
            <div className="p-4 rounded-2xl bg-white/10 border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-start gap-2.5">
                <span className="p-1.5 rounded-lg bg-amber-400/20 text-amber-300 shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div>
                  <strong className="text-amber-300 font-bold block">Önerilen Taktiksel Hamle:</strong>
                  <p className="text-slate-200 mt-0.5">{activeKeyword.actionableTactic}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {onNavigateTab && (
                  <button
                    type="button"
                    onClick={() => onNavigateTab("seo-content-assistant")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-slate-900 font-bold hover:bg-slate-100 transition-all shadow-xs cursor-pointer text-xs"
                  >
                    <span>Bu Kelime İçin Blog Üret</span>
                    <ChevronRight className="w-3.5 h-3.5 text-indigo-600" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 5. Comprehensive Comparative Keyword Matrix Table */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                Pazar Anahtar Kelime Sıralama Tablosu
              </h3>
              <p className="text-xs text-slate-600">
                Tüm odak kelimelerde rakiplerin sıralamaları, TBM değerleri ve anlık sıra farkı
              </p>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search input */}
              <div className="relative min-w-[200px]">
                <Search className="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Kelime filtrele..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-600 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as RankingStatusFilter)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-hidden"
              >
                <option value="all">Tüm Sıralamalar</option>
                <option value="user-leading">Yalnızca #1 Olduklarımız</option>
                <option value="competing">Başa Baş Rekabet (±2)</option>
                <option value="trailing">Takipte Olduklarımız</option>
              </select>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value as TabCategoryFilter)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-hidden"
              >
                <option value="all">Tüm Kategoriler</option>
                <option value="Temel Hizmet">Temel Hizmet</option>
                <option value="Acil & 7/24">Acil & 7/24</option>
                <option value="Fiyat & Maliyet">Fiyat & Maliyet</option>
                <option value="Bölgesel / İlçe">Bölgesel / İlçe</option>
                <option value="Marka / Güven">Marka / Güven</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
            <table className="w-full text-left text-xs text-slate-700 divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-700 uppercase font-black text-[11px] tracking-wider">
                <tr>
                  <th scope="col" className="py-3.5 px-4">
                    Anahtar Kelime & Niyet
                  </th>
                  <th
                    scope="col"
                    className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSortToggle("volume")}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Aylık Hacim</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-600" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSortToggle("rank")}
                  >
                    <div className="flex items-center gap-1.5 text-indigo-700">
                      <span>Sizin Sıranız</span>
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th scope="col" className="py-3.5 px-4">
                    {leaderProfile.name}
                  </th>
                  <th scope="col" className="py-3.5 px-4">
                    Sıra Farkı
                  </th>
                  <th
                    scope="col"
                    className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSortToggle("opportunity")}
                  >
                    <div className="flex items-center gap-1.5 text-amber-700">
                      <span>Fırsat Skoru</span>
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th scope="col" className="py-3.5 px-4 text-right">
                    Taktik & İncele
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredKeywords.map(item => {
                  const isSelected = item.id === selectedKeywordId;
                  const compLeaderRank = item.competitorRankings[0]?.rank || 1;
                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedKeywordId(item.id)}
                      className={`hover:bg-indigo-50/50 transition-colors cursor-pointer ${
                        isSelected ? "bg-indigo-50/80 ring-1 ring-indigo-300" : ""
                      }`}
                    >
                      {/* Keyword and Intent */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 text-sm">{item.keyword}</span>
                            {item.userRank === 1 && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                                #1 Zirve
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-600">
                            <span>{item.searchIntent}</span>
                            <span>•</span>
                            <span className="text-slate-600">{item.category}</span>
                            <span>•</span>
                            <span className="text-emerald-700 font-semibold">{item.cpcValue} TBM</span>
                          </div>
                        </div>
                      </td>

                      {/* Volume & Difficulty */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{item.monthlyVolumeFormatted}/ay</div>
                        <span
                          className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                            item.difficultyLabel === "Kolay"
                              ? "bg-emerald-50 text-emerald-700"
                              : item.difficultyLabel === "Orta"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {item.difficultyLabel} ({item.seoDifficulty})
                        </span>
                      </td>

                      {/* User Rank */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-base font-black px-2.5 py-1 rounded-xl ${
                              item.userRank === 1
                                ? "bg-emerald-100 text-emerald-800"
                                : item.userRank <= 3
                                ? "bg-indigo-100 text-indigo-800"
                                : "bg-slate-100 text-slate-800"
                            }`}
                          >
                            #{item.userRank}
                          </span>
                          {item.userRankChange > 0 && (
                            <span className="text-[10px] font-extrabold text-emerald-600 flex items-center">
                              <ArrowUpRight className="w-3 h-3" />+{item.userRankChange}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Competitor Rank */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                            #{compLeaderRank}
                          </span>
                          <span className="text-[11px] text-slate-600 truncate max-w-[120px]">
                            {item.bestCompetitor.name}
                          </span>
                        </div>
                      </td>

                      {/* Rank Gap */}
                      <td className="py-3 px-4">
                        {item.gapToLeader <= 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs">
                            <Check className="w-3.5 h-3.5" />
                            Öndesiniz (+{Math.abs(item.gapToLeader)})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-extrabold text-xs">
                            <ArrowDownRight className="w-3.5 h-3.5" />
                            -{item.gapToLeader} Sıra Geridesiniz
                          </span>
                        )}
                      </td>

                      {/* Opportunity Score */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                item.opportunityScore > 80
                                  ? "bg-emerald-500"
                                  : item.opportunityScore > 50
                                  ? "bg-indigo-500"
                                  : "bg-slate-400"
                              }`}
                              style={{ width: `${item.opportunityScore}%` }}
                            />
                          </div>
                          <span className="font-extrabold text-slate-800 text-xs">{item.opportunityScore}</span>
                        </div>
                        <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
                          {item.trafficPotentialGain}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedKeywordId(item.id);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 text-xs font-bold transition-all cursor-pointer"
                        >
                          Taktik Gör
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 6. Competitor Comparison Cards */}
        <div className="space-y-4 pb-4">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            Pazar Rakipleri Profil Kıyaslaması
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {competitors.map(c => (
              <div
                key={c.id}
                className={`p-5 rounded-3xl border transition-all ${
                  c.isUser
                    ? "bg-gradient-to-br from-indigo-50/80 via-white to-white border-indigo-200 shadow-md ring-1 ring-indigo-300"
                    : "bg-white border-slate-200 shadow-xs hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="font-black text-slate-900 text-sm truncate max-w-[150px]">{c.name}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                      c.isUser ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    %{c.marketSharePercent} Pay
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Aylık Organik Trafik:</span>
                    <strong className="text-slate-900">~{c.estimatedOrganicTraffic.toLocaleString("tr-TR")}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Toplam Sıralanan Kelime:</span>
                    <strong className="text-slate-900">{c.totalRankedKeywords}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Google İlk 3'teki Kelimeler:</span>
                    <strong className="text-emerald-700">{c.top3Count} sorgu</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Site Hızı Skoru:</span>
                    <strong className={c.siteSpeedScore >= 90 ? "text-emerald-600" : "text-amber-600"}>
                      {c.siteSpeedScore}/100
                    </strong>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] space-y-1">
                  <span className="font-extrabold text-slate-800 block">Kritik Avantaj:</span>
                  <p className="text-slate-600">{c.strengths[0]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
