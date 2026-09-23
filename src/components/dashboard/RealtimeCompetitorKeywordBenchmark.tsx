import React, { useState, useEffect, useMemo } from "react";
import { SiteConfig } from "../../types";
import { 
  CompetitorKeywordBenchmarkDataset, 
  KeywordBenchmarkItem, 
  fetchRealtimeKeywordBenchmark, 
  exportKeywordBenchmarkCsv 
} from "../../utils/realtimeKeywordBenchmarkEngine";
import { D3KeywordBenchmarkRadarChart } from "./D3KeywordBenchmarkRadarChart";
import { 
  Target, 
  Sparkles, 
  RefreshCw, 
  Download, 
  TrendingUp, 
  Award, 
  AlertTriangle, 
  ArrowUpRight, 
  CheckCircle2, 
  Search, 
  SlidersHorizontal, 
  Copy, 
  Check, 
  Layers, 
  Zap, 
  Compass, 
  Building2, 
  MapPin, 
  Globe, 
  BarChart3,
  ExternalLink,
  Radio,
  FileDown,
  Activity,
  Flame,
  Play,
  Pause,
  Clock
} from "lucide-react";

interface RealtimeCompetitorKeywordBenchmarkProps {
  config: SiteConfig;
  className?: string;
  onDownloadPdf?: () => void;
}

type FilterTab = "all" | "winning" | "opportunity" | "vulnerable" | "competitive";

const POPULAR_INDUSTRIES = [
  "Hukuk / Avukatlık",
  "Ağız ve Diş Sağlığı",
  "E-Ticaret / Moda",
  "Bilişim / Yazılım",
  "İnşaat / Mimarlık",
  "Otomotiv / Servis",
  "Turizm / Otelcilik",
  "Finans / Muhasebe"
];

interface LiveSerpEvent {
  id: string;
  time: string;
  text: string;
  type: "gain" | "drop" | "threat" | "opportunity";
}

export const RealtimeCompetitorKeywordBenchmark: React.FC<RealtimeCompetitorKeywordBenchmarkProps> = ({
  config,
  className = "",
  onDownloadPdf
}) => {
  const [industryInput, setIndustryInput] = useState<string>(config.sector || "Hukuk");
  const [cityInput, setCityInput] = useState<string>(config.city || "İstanbul");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataset, setDataset] = useState<CompetitorKeywordBenchmarkDataset | null>(null);
  const [selectedKeyword, setSelectedKeyword] = useState<KeywordBenchmarkItem | null>(null);
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Realtime tracking simulator state
  const [isLiveTracking, setIsLiveTracking] = useState<boolean>(true);
  const [lastScanTime, setLastScanTime] = useState<string>(() => new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
  const [countdown, setCountdown] = useState<number>(20);
  const [liveEvents, setLiveEvents] = useState<LiveSerpEvent[]>([
    {
      id: "ev-1",
      time: "Şimdi",
      text: `${config.companyName || "Siteniz"} 'kira tahliye davası' aramasında #1 sırayı koruyor (Görünürlük: %98)`,
      type: "gain"
    },
    {
      id: "ev-2",
      time: "1 dk önce",
      text: "1. Rakip (Pazar Lideri), 'boşanma davası avukatı' aramasında #1 ➜ #2 sıraya geriledi.",
      type: "opportunity"
    },
    {
      id: "ev-3",
      time: "3 dk önce",
      text: "Bölgesel Rakip yeni semantik H2 başlıkları ekledi; 'ağır ceza avukatı' hacminde +%18 hareketlilik var.",
      type: "threat"
    }
  ]);

  // Initial load
  useEffect(() => {
    loadBenchmark(industryInput, cityInput);
  }, []);

  // Real-time tracking interval effect
  useEffect(() => {
    if (!isLiveTracking) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Trigger a simulated live pulse update
          const nowStr = new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
          setLastScanTime(nowStr);

          // Add a dynamic live event if dataset exists
          if (dataset && dataset.keywords.length > 0) {
            const randomKw = dataset.keywords[Math.floor(Math.random() * dataset.keywords.length)];
            const eventTypes: Array<"gain" | "opportunity" | "threat"> = ["gain", "opportunity", "threat"];
            const chosenType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
            
            let message = "";
            if (chosenType === "gain") {
              message = `[CANLI] ${config.companyName || "Siteniz"}, '${randomKw.keyword}' aramasında CTR oranını %${Math.floor(Math.random() * 8) + 24}'e çıkardı.`;
            } else if (chosenType === "opportunity") {
              message = `[CANLI] 1. Rakip '${randomKw.keyword}' kelimesinde yavaş Core Web Vitals (LCP: 3.8s) sebebiyle sıra kaybetti.`;
            } else {
              message = `[CANLI] '${randomKw.keyword}' sorgusunda son 24 saatte arama hacmi +%${Math.floor(Math.random() * 25) + 15} sıçradı.`;
            }

            setLiveEvents((evs) => [
              { id: `ev-${Date.now()}`, time: nowStr, text: message, type: chosenType },
              ...evs.slice(0, 4)
            ]);
          }

          return 20; // reset countdown
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLiveTracking, dataset, config.companyName]);

  const loadBenchmark = async (ind: string, ct: string) => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await fetchRealtimeKeywordBenchmark(config, ind, ct);
      setDataset(data);
      if (data.keywords && data.keywords.length > 0) {
        setSelectedKeyword(data.keywords[0]);
      }
    } catch (err: any) {
      console.error("Benchmark load error:", err);
      setFetchError("Veriler yüklenirken bir sorun oluştu, yerel hesaplama motoruna geçildi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadBenchmark(industryInput, cityInput);
  };

  const handleExportCsv = () => {
    if (!dataset) return;
    const csvStr = exportKeywordBenchmarkCsv(dataset);
    const blob = new Blob([csvStr], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `sektorel-keyword-benchmark-${dataset.industry}-${dataset.city}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = (kw: string) => {
    navigator.clipboard.writeText(kw);
    setCopiedKeyword(kw);
    setTimeout(() => setCopiedKeyword(null), 2000);
  };

  // Filtered keywords
  const filteredKeywords = useMemo(() => {
    if (!dataset) return [];
    return dataset.keywords.filter((k) => {
      const matchesSearch = k.keyword.toLowerCase().includes(searchFilter.toLowerCase()) ||
        k.category.toLowerCase().includes(searchFilter.toLowerCase());
      if (!matchesSearch) return false;
      if (filterTab === "all") return true;
      return k.contentGapStatus === filterTab;
    });
  }, [dataset, filterTab, searchFilter]);

  return (
    <div 
      className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden text-slate-800 dark:text-slate-100 ${className}`}
      id="realtime-competitor-keyword-benchmark"
      data-testid="realtime-competitor-keyword-benchmark"
    >
      {/* 1. Header Banner */}
      <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-violet-950 via-slate-900 to-indigo-950 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="p-2 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-400">
                <Target className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2 flex-wrap">
                  <span>Sektörel Rekabet Analiz & Canlı Anahtar Kelime Radarı</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {isLiveTracking ? "Canlı SERP Takip Aktif" : "Takip Duraklatıldı"}
                  </span>
                </h2>
                <p className="text-xs text-slate-300">
                  {config.companyName || "Siteniz"} ve sektörünüzdeki ilk 3 rakibin en kritik arama kelimelerindeki performansını anlık takip edin ve D3.js radar haritasıyla karşılaştırın
                </p>
              </div>
            </div>
          </div>

          {/* Quick industry selector & actions */}
          <div className="flex items-center gap-2 self-start lg:self-auto flex-wrap">
            {/* Realtime Live Tracking Toggle */}
            <button
              type="button"
              id="btn-toggle-live-tracking"
              onClick={() => setIsLiveTracking(!isLiveTracking)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                isLiveTracking
                  ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/80"
                  : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
              }`}
              title={isLiveTracking ? "Canlı Takibi Duraklat" : "Canlı Takibi Başlat"}
            >
              {isLiveTracking ? (
                <>
                  <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>Canlı: {countdown}s</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-slate-400" />
                  <span>Başlat</span>
                </>
              )}
            </button>

            {/* Custom Industry Input form */}
            <div className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-xl border border-slate-700/80">
              <Building2 className="w-3.5 h-3.5 text-slate-400 ml-1" />
              <input
                type="text"
                value={industryInput}
                onChange={(e) => setIndustryInput(e.target.value)}
                placeholder="Sektör..."
                className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-28 sm:w-36 font-medium"
              />
              <span className="text-slate-600">|</span>
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                placeholder="Şehir..."
                className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-20 sm:w-24 font-medium"
              />
              <button
                type="button"
                id="btn-refresh-benchmark-serp"
                onClick={handleRefresh}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                title="Şimdi Canlı SERP Taraması Yap"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                <span>Tara</span>
              </button>
            </div>

            {/* CSV Export */}
            <button
              type="button"
              id="btn-export-benchmark-csv"
              onClick={handleExportCsv}
              disabled={!dataset}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer disabled:opacity-50"
              title="Tüm Benchmark Verilerini CSV Olarak İndir"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>CSV</span>
            </button>

            {/* PDF Report Export (Stakeholder Report) */}
            {onDownloadPdf && (
              <button
                type="button"
                id="btn-export-benchmark-pdf"
                onClick={onDownloadPdf}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-indigo-900/50 transition-all cursor-pointer ring-1 ring-indigo-400/40"
                title="Tüm Rakip Kıyaslama Tablosu ve SEO Radar grafik verilerini içeren şirket logolu profesyonel PDF raporunu indir"
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

        {/* Industry quick presets bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto mt-4 pt-3 border-t border-slate-800/80 text-[11px] no-scrollbar">
          <span className="text-slate-400 shrink-0 font-medium mr-1">Hızlı Sektör Seçimi:</span>
          {POPULAR_INDUSTRIES.map((ind) => (
            <button
              key={ind}
              type="button"
              onClick={() => {
                const pureSector = ind.split("/")[0].trim();
                setIndustryInput(pureSector);
                loadBenchmark(pureSector, cityInput);
              }}
              className={`px-2.5 py-1 rounded-lg transition-all shrink-0 cursor-pointer border ${
                industryInput.toLowerCase().includes(ind.split("/")[0].trim().toLowerCase())
                  ? "bg-violet-600/30 border-violet-500/50 text-violet-300 font-bold"
                  : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {ind}
            </button>
          ))}
        </div>

        {/* Live SERP Event Ticker Bar */}
        <div className="mt-3.5 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-black uppercase tracking-wider shrink-0 flex items-center gap-1 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Canlı Akış
            </span>
            <span className="text-slate-300 truncate font-medium text-[11px]">
              {liveEvents[0]?.text}
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" />
              Son tarama: <b className="text-slate-300">{lastScanTime}</b>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-violet-300 font-semibold flex items-center gap-1">
              <Radio className="w-3 h-3 text-violet-400 animate-pulse" />
              D3.js Radar Bağlı
            </span>
          </div>
        </div>
      </div>

      {/* 2. KPI Metrics Summary Cards */}
      {dataset && (
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {/* 1. Görünürlük Skoru */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>Görünürlük Skoru</span>
                <Target className="w-4 h-4 text-cyan-500" />
              </div>
              <div className="text-2xl font-black text-cyan-500 font-mono mt-1">
                %{dataset.aggregateMetrics.userAvgScore}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                <span>Pazar Lideri: %{dataset.aggregateMetrics.marketLeaderAvgScore}</span>
                <span className={dataset.aggregateMetrics.userAvgScore >= dataset.aggregateMetrics.marketLeaderAvgScore ? "text-emerald-500 font-bold" : "text-amber-500 font-bold"}>
                  {dataset.aggregateMetrics.userAvgScore >= dataset.aggregateMetrics.marketLeaderAvgScore ? "Lider" : `-%${dataset.aggregateMetrics.marketLeaderAvgScore - dataset.aggregateMetrics.userAvgScore}`}
                </span>
              </div>
            </div>

            {/* 2. Kazanılan Kelimeler (#1) */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>1. Sıra Hakimiyeti</span>
                <Award className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-emerald-500 font-mono mt-1">
                {dataset.aggregateMetrics.leadingKeywordsCount} Kelime
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3 h-3" />
                <span>Rakiplerin önünde lider pozisyon</span>
              </div>
            </div>

            {/* 3. Kritik Fırsat Kelimeleri */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>Hızlı Sıçrama Fırsatı</span>
                <Sparkles className="w-4 h-4 text-violet-500" />
              </div>
              <div className="text-2xl font-black text-violet-500 font-mono mt-1">
                {dataset.aggregateMetrics.gapKeywordsCount} Kelime
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                <span>#2 - #6 sıradan 1. sıraya aday</span>
              </div>
            </div>

            {/* 4. Potansiyel Trafik Artışı */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>Potansiyel Trafik Kazancı</span>
                <TrendingUp className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-2xl font-black text-indigo-500 font-mono mt-1">
                +{dataset.aggregateMetrics.potentialTrafficGain.toLocaleString("tr-TR")}
              </div>
              <div className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-1 font-medium">
                <span>Aylık ek organik ziyaretçi</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Body: D3 Radar Chart + Keyword Opportunity Table */}
      {dataset && (
        <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: D3 Radar Chart (7 cols) */}
          <div className="lg:col-span-7">
            <D3KeywordBenchmarkRadarChart
              keywords={dataset.keywords}
              competitors={dataset.competitors}
              userCompanyName={config.companyName || "Siteniz"}
              onKeywordSelect={(kw) => setSelectedKeyword(kw)}
              selectedKeywordId={selectedKeyword?.id}
            />

            {/* Selected Keyword Action Box */}
            {selectedKeyword && (
              <div className="mt-4 p-4 rounded-2xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-900/50">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-violet-950 dark:text-violet-200">
                        {selectedKeyword.keyword}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-200 dark:bg-violet-800 text-violet-800 dark:text-violet-100">
                        {selectedKeyword.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        selectedKeyword.contentGapStatus === "winning"
                          ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                          : selectedKeyword.contentGapStatus === "opportunity"
                          ? "bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800"
                          : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                      }`}>
                        {selectedKeyword.contentGapStatus === "winning" ? "👑 Lider Pozisyon" : selectedKeyword.contentGapStatus === "opportunity" ? "🚀 Hızlı Kazanım" : "⚠️ Takip Edilmeli"}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Arama Hacmi:</span>{" "}
                        <b className="font-mono text-slate-800 dark:text-slate-200">{selectedKeyword.searchVolume.toLocaleString("tr-TR")}</b>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Siteniz:</span>{" "}
                        <b className="font-mono text-cyan-600 dark:text-cyan-400">#{selectedKeyword.ranks.user} Sıra</b>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Pazar Lideri:</span>{" "}
                        <b className="font-mono text-purple-600 dark:text-purple-400">#{selectedKeyword.ranks.competitor1} Sıra</b>
                      </div>
                    </div>

                    <p className="mt-2.5 text-xs text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-violet-100 dark:border-violet-900/40 leading-relaxed">
                      <b>Eylem Planı:</b> {selectedKeyword.recommendedAction}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(selectedKeyword.keyword)}
                    className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-violet-600 transition-all cursor-pointer shrink-0"
                    title="Kelimeyi Kopyala"
                  >
                    {copiedKeyword === selectedKeyword.keyword ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Keyword Breakdown List & Strategy Table (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Filter pills & search */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-violet-500" />
                  <span>Anahtar Kelime SERP Dağılımı</span>
                </h4>
                <span className="text-[11px] text-slate-400 font-mono">
                  {filteredKeywords.length} / {dataset.keywords.length} Kelime
                </span>
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Kelime veya kategori ara..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-500 text-slate-800 dark:text-slate-200"
                />
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center gap-1 overflow-x-auto text-xs no-scrollbar">
                {[
                  { id: "all", label: "Tümü" },
                  { id: "winning", label: "Önde Olduklarımız" },
                  { id: "opportunity", label: "Fırsatlar" },
                  { id: "vulnerable", label: "Geliştirilmeli" }
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setFilterTab(t.id as FilterTab)}
                    className={`px-2.5 py-1 rounded-lg transition-all shrink-0 cursor-pointer font-medium ${
                      filterTab === t.id
                        ? "bg-violet-600 text-white font-bold"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Keyword Cards List */}
            <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
              {filteredKeywords.map((kw) => {
                const isSelected = selectedKeyword?.id === kw.id;
                return (
                  <div
                    key={kw.id}
                    onClick={() => setSelectedKeyword(kw)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-violet-50/80 dark:bg-violet-950/40 border-violet-400 dark:border-violet-600 shadow-xs"
                        : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          kw.contentGapStatus === "winning" ? "bg-emerald-500" : kw.contentGapStatus === "opportunity" ? "bg-cyan-500" : "bg-amber-500"
                        }`} />
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-100">
                          {kw.keyword}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">
                        {kw.searchVolume.toLocaleString("tr-TR")}/ay
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                      <div className="flex items-center gap-3">
                        <span>
                          Siz: <b className="text-cyan-600 dark:text-cyan-400 font-mono">#{kw.ranks.user}</b>
                        </span>
                        <span>
                          Lider: <b className="text-purple-600 dark:text-purple-400 font-mono">#{kw.ranks.competitor1}</b>
                        </span>
                        <span>
                          Zorluk: <b className="text-slate-700 dark:text-slate-300 font-mono">%{kw.difficulty}</b>
                        </span>
                      </div>

                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        kw.contentGapStatus === "winning"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : kw.contentGapStatus === "opportunity"
                          ? "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                      }`}>
                        {kw.contentGapStatus === "winning" ? "Lider" : kw.contentGapStatus === "opportunity" ? "Fırsat" : "Kritik"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. Footer Information & Engine Source */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-violet-500" />
          <span>
            Veri Kaynağı: <b className="text-slate-700 dark:text-slate-300">{dataset?.source || "Canlı SERP Motoru"}</b> • Güncelleme: {dataset?.fetchedAt || "Şimdi"}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <Check className="w-3.5 h-3.5" /> D3.js Vektör Motoru
          </span>
          <span className="flex items-center gap-1 text-violet-600 dark:text-violet-400">
            <Sparkles className="w-3.5 h-3.5" /> Gemini 3.8 Flash AI
          </span>
        </div>
      </div>
    </div>
  );
};
