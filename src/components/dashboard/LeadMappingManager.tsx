import React, { useState, useMemo } from "react";
import {
  SiteConfig,
  FormLead,
  JourneyNode,
  JourneyLink,
  TopJourneyPath,
  ChannelEffectiveness,
  IndividualLeadJourney,
  JourneyDropOffPoint,
  FunnelStageWithDropOff
} from "../../types";
import {
  getJourneyNodes,
  getJourneyLinks,
  getTopJourneyPaths,
  getChannelEffectivenessList,
  getIndividualLeadJourneys,
  getJourneyDropOffPoints,
  getFunnelStagesWithDropOffs,
  JOURNEY_STAGES,
  CHANNEL_COLORS,
  CHANNEL_NAMES
} from "../../utils/leadMappingData";
import { LeadJourneyD3Visualizer } from "./LeadJourneyD3Visualizer";
import { CustomerJourneyDropOffChart } from "./CustomerJourneyDropOffChart";
import {
  Sparkles,
  TrendingUp,
  Award,
  Filter,
  Search,
  Download,
  Calendar,
  Layers,
  ArrowUpRight,
  HelpCircle,
  Users,
  Target,
  Phone,
  MessageCircle,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sliders,
  DollarSign,
  Compass,
  Globe,
  Share2,
  RefreshCw,
  Eye,
  Route,
  Zap,
  Clock,
  ArrowRight,
  X,
  PlusCircle,
  SlidersHorizontal,
  FileSpreadsheet,
  MousePointerClick,
  Check,
  Maximize2,
  AlertTriangle,
  TrendingDown
} from "lucide-react";

interface LeadMappingManagerProps {
  config: SiteConfig;
  onNavigateTab?: (tab: string) => void;
  onSelectLeadForDetail?: (lead: FormLead) => void;
}

export const LeadMappingManager: React.FC<LeadMappingManagerProps> = ({
  config,
  onNavigateTab,
  onSelectLeadForDetail
}) => {
  // Navigation & View Mode
  const [activeViewTab, setActiveViewTab] = useState<
    "d3-flow" | "drop-offs" | "effectiveness" | "top-paths" | "lead-timelines" | "simulator"
  >("d3-flow");

  // Filters & Toggles
  const [selectedChannel, setSelectedChannel] = useState<string>("all");
  const [highlightEffectiveOnly, setHighlightEffectiveOnly] = useState<boolean>(true);
  const [highlightDropOffs, setHighlightDropOffs] = useState<boolean>(false);
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null);
  const [searchLeadQuery, setSearchLeadQuery] = useState<string>("");

  // Modal / Detail drawer for clicked node & dropoff point
  const [selectedNodeDetail, setSelectedNodeDetail] = useState<JourneyNode | null>(null);
  const [selectedDropOffDetail, setSelectedDropOffDetail] = useState<JourneyDropOffPoint | null>(null);

  // Journey Simulator State
  const [simChannel, setSimChannel] = useState<string>("ads");
  const [simLanding, setSimLanding] = useState<string>("emergency");
  const [simEngagement, setSimEngagement] = useState<string>("price-calc");
  const [simForm, setSimForm] = useState<string>("quick-form");
  const [dropOffReductionPercent, setDropOffReductionPercent] = useState<number>(15);

  // Data memoization
  const nodes = useMemo(() => getJourneyNodes(), []);
  const links = useMemo(() => getJourneyLinks(), []);
  const topPaths = useMemo(() => getTopJourneyPaths(), []);
  const dropOffPoints = useMemo(() => getJourneyDropOffPoints(), []);
  const funnelStages = useMemo(() => getFunnelStagesWithDropOffs(), []);
  const channelEffectiveness = useMemo(
    () => getChannelEffectivenessList(config.leads || []),
    [config.leads]
  );
  const individualJourneys = useMemo(
    () => getIndividualLeadJourneys(config.leads || []),
    [config.leads]
  );

  // Top Channel Winner
  const winnerChannel = useMemo(() => {
    return (
      channelEffectiveness.find((c) => c.isWinner) || channelEffectiveness[0]
    );
  }, [channelEffectiveness]);

  // Filtered Lead Journeys
  const filteredIndividualJourneys = useMemo(() => {
    return individualJourneys.filter((j) => {
      const matchesChannel =
        selectedChannel === "all" || j.channel === selectedChannel;
      const matchesSearch =
        !searchLeadQuery ||
        j.leadName.toLowerCase().includes(searchLeadQuery.toLowerCase()) ||
        j.serviceOrProduct.toLowerCase().includes(searchLeadQuery.toLowerCase());
      return matchesChannel && matchesSearch;
    });
  }, [individualJourneys, selectedChannel, searchLeadQuery]);

  // Simulator Calculation
  const simulatorResult = useMemo(() => {
    let baseRate = 20;
    let expectedValue = 2500;
    const recommendations: string[] = [];

    // Channel weight
    if (simChannel === "ads") {
      baseRate += 9;
      expectedValue += 700;
      recommendations.push(
        "Google Ads aramalarında acil niyet yüksektir. Negatif anahtar kelimeleri düzenli temizleyin."
      );
    } else if (simChannel === "organic") {
      baseRate += 7;
      expectedValue += 600;
      recommendations.push(
        "Organik arama güven katsayısı yüksektir. Şehir bazlı yerel anahtar kelimeleri destekleyin."
      );
    } else if (simChannel === "social") {
      baseRate += 2;
      expectedValue -= 400;
      recommendations.push(
        "Sosyal medya ziyaretçileri mobil ağırlıklıdır; hızlı WhatsApp iletişim butonu dönüşümü %35 artırır."
      );
    } else if (simChannel === "direct") {
      baseRate += 10;
      expectedValue += 1100;
      recommendations.push(
        "Doğrudan gelen kullanıcılar markanızı tanır; doğrudan rezervasyon avantajı sunun."
      );
    }

    // Landing Page weight
    if (simLanding === "emergency") {
      baseRate += 8;
      recommendations.push(
        "Acil Çekici karşılama sayfası 15 dk varış garantisi ile en yüksek dönüşümü sağlar."
      );
    } else if (simLanding === "pricing") {
      baseRate += 11;
      expectedValue += 500;
      recommendations.push(
        "Fiyat tarifesi inceleyen ziyaretçiler satın alma aşamasına en yakın gruptur."
      );
    } else if (simLanding === "hero") {
      baseRate += 5;
    }

    // Engagement weight
    if (simEngagement === "price-calc") {
      baseRate += 7;
      recommendations.push(
        "Canlı mesafe/fiyat simülatörünü kullanan ziyaretçilerde form doldurma oranı %54'e çıkar."
      );
    } else if (simEngagement === "reviews") {
      baseRate += 5;
      recommendations.push(
        "Kasko güvencesi ve 5 yıldızlı yorumlar kurumsal müşterilerin kararını hızlandırır."
      );
    }

    // Form weight
    if (simForm === "quick-form") {
      baseRate += 6;
    } else if (simForm === "corp-form") {
      baseRate += 3;
      expectedValue += 1800;
      recommendations.push(
        "Kurumsal form hacimce daha az ancak sipariş başına ciro 2.5 kat daha fazladır."
      );
    } else if (simForm === "whatsapp") {
      baseRate += 5;
      expectedValue -= 200;
    }

    return {
      predictedConversionRate: Math.min(68, Math.max(12, baseRate)),
      predictedDealValue: expectedValue,
      scoreText:
        baseRate >= 36 ? "Mükemmel (A+)" : baseRate >= 28 ? "Güçlü (B+)" : "Geliştirilebilir (C)",
      recommendations
    };
  }, [simChannel, simLanding, simEngagement, simForm]);

  // Export helper
  const handleExportCSV = () => {
    const headers = ["Kanal", "Ziyaretçi", "Form Başvurusu", "Dönüşüm Oranı (%)", "Toplam Ciro (TL)", "Ortalama Süre", "En Popüler Karşılama"];
    const rows = channelEffectiveness.map((c) => [
      `"${c.label}"`,
      c.visitors,
      c.conversions,
      `"%${c.conversionRate}"`,
      `"${c.totalRevenue} TL"`,
      `"${c.avgDuration}"`,
      `"${c.topLandingPage}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `musteri-yolculuk-haritasi-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. TOP HEADER & BREADCRUMB */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Route className="w-3.5 h-3.5 text-indigo-600" />
              <span>D3.js Customer Journey Engine</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Çok Temaslı Yolculuk Haritalama</span>
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <span>Customer Journey Mapping &amp; Müşteri Yolculuk Haritası</span>
          </h1>

          <p className="text-sm text-slate-600 mt-1.5 max-w-3xl leading-relaxed">
            Kullanıcının ilk reklam veya organik tıklamasından form dönüşümüne kadar tüm temas noktalarını
            ve terk (drop-off) aşamalarını D3.js ile görselleştirin. Sık yaşanan sürtünme noktalarını
            analiz edip kullanıcı kayıplarını minimuma indirin.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Verileri Dışa Aktar (CSV)</span>
          </button>

          {onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab("leads")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>CRM Lead Gelen Kutusu</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. TOP KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: En Çok Dönüştüren Kanal */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              En Yüksek Dönüşümlü Kanal
            </span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <span>Google Ads</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                %33.2
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              332 onaylı form başvurusu • 1.075.680 ₺ ciro
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-blue-700 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>%512 Tahmini Reklam Yatırımı Getirisi (ROI)</span>
          </div>
        </div>

        {/* KPI 2: Ortalama Karar Süresi */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Ortalama Karar Süresi
            </span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <span>4.1 Dakika</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                Hızlı Karar
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              İlk reklam tıklamasından form doldurmaya kadar
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-amber-700 font-medium flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" />
            <span>Acil Çekici sayfalarında süre 2.8 dakikaya iniyor</span>
          </div>
        </div>

        {/* KPI 3: En Etkili Karşılama Sayfası */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              En Etkili Karşılama Sayfası
            </span>
            <span className="p-2 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100">
              <Target className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <span>Acil Çekici</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
                %37.6
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              850 ziyaretçiden 298 başarılı lead üretimi
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-cyan-700 font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ana sayfaya kıyasla %22 daha yüksek form bitirme</span>
          </div>
        </div>

        {/* KPI 4: En Yüksek Dönüştürücü Araç */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Kritik Karar Adımı
            </span>
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <span>Fiyat Hesaplayıcı</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                %42.6
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Fiyat hesaplayan her 100 kişiden 42.6&apos;sı form gönderdi
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-purple-700 font-medium flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Şeffaf fiyat güveni form doldurmayı 2.3 kat hızlandırıyor</span>
          </div>
        </div>
      </div>

      {/* 3. MAIN NAVIGATION TABS & FILTER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        {/* Mode Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            id="tab-d3-flow"
            onClick={() => {
              setActiveViewTab("d3-flow");
              setSelectedPathId(null);
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeViewTab === "d3-flow"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Route className="w-4 h-4 text-indigo-400" />
            <span>D3 Yolculuk Akışı</span>
          </button>

          <button
            type="button"
            id="tab-drop-offs"
            onClick={() => {
              setActiveViewTab("drop-offs");
              setHighlightDropOffs(true);
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeViewTab === "drop-offs"
                ? "bg-rose-600 text-white shadow-xs"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-rose-300" />
            <span>Terk &amp; Drop-off Analizi</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                activeViewTab === "drop-offs"
                  ? "bg-rose-700 text-rose-100"
                  : "bg-rose-100 text-rose-800"
              }`}
            >
              5 Nokta
            </span>
          </button>

          <button
            type="button"
            id="tab-effectiveness"
            onClick={() => setActiveViewTab("effectiveness")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeViewTab === "effectiveness"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>Kanal Verimlilik Matrisi</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-mono">
              5 Kanal
            </span>
          </button>

          <button
            type="button"
            id="tab-top-paths"
            onClick={() => setActiveViewTab("top-paths")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeViewTab === "top-paths"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>En Başarılı 5 Rota</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-mono">
              Top 5
            </span>
          </button>

          <button
            type="button"
            id="tab-lead-timelines"
            onClick={() => setActiveViewTab("lead-timelines")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeViewTab === "lead-timelines"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Users className="w-4 h-4 text-sky-400" />
            <span>Gerçek Lead Yolculukları</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-sky-100 text-sky-800 font-mono">
              {config.leads?.length || 0}
            </span>
          </button>

          <button
            type="button"
            id="tab-simulator"
            onClick={() => setActiveViewTab("simulator")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeViewTab === "simulator"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Compass className="w-4 h-4 text-purple-400" />
            <span>Yolculuk Simülatörü</span>
          </button>
        </div>

        {/* Global Channel & Highlight Toggle Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Channel Dropdown Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedChannel}
              onChange={(e) => {
                setSelectedChannel(e.target.value);
                setSelectedPathId(null);
              }}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value="all">Tüm Kanallar</option>
              <option value="ads">Google Ads (Arama &amp; Harita)</option>
              <option value="organic">Organik Arama (Google SEO)</option>
              <option value="social">Sosyal Medya &amp; WhatsApp</option>
              <option value="direct">Doğrudan Erişim (Direkt)</option>
              <option value="referral">Tavsiye &amp; Referans</option>
            </select>
          </div>

          {/* Highlight Most Effective Channels Toggle */}
          <button
            type="button"
            id="toggle-highlight-effective"
            onClick={() => setHighlightEffectiveOnly(!highlightEffectiveOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              highlightEffectiveOnly
                ? "bg-amber-500 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>En Etkili Kanalları Vurgula</span>
            {highlightEffectiveOnly && (
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            )}
          </button>

          {/* Highlight Drop-offs Toggle */}
          <button
            type="button"
            id="toggle-highlight-dropoffs"
            onClick={() => setHighlightDropOffs(!highlightDropOffs)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              highlightDropOffs
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
            title="Tüm temas noktalarında ziyaretçi kayıplarını vurgulayın"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Terk Vurgula</span>
            {highlightDropOffs && (
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* 4. ACTIVE VIEW CONTENT */}

      {/* VIEW 1: D3 JOURNEY FLOW MAP */}
      {activeViewTab === "d3-flow" && (
        <div className="space-y-4">
          {/* Active Highlight Banner if a specific path or filter is chosen */}
          {selectedPathId && (
            <div className="flex items-center justify-between p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
              <div className="flex items-center gap-2 font-medium">
                <Route className="w-4 h-4 text-blue-600" />
                <span>
                  Vurgulanan Rota:{" "}
                  <strong>
                    {topPaths.find((p) => p.id === selectedPathId)?.name}
                  </strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPathId(null)}
                className="text-blue-700 hover:text-blue-900 font-bold underline cursor-pointer"
              >
                Vurgulamayı Kaldır
              </button>
            </div>
          )}

          {/* D3 VISUALIZER SVG */}
          <LeadJourneyD3Visualizer
            nodes={nodes}
            links={links}
            highlightEffectiveOnly={highlightEffectiveOnly}
            highlightDropOffs={highlightDropOffs}
            onToggleDropOffs={(val) => setHighlightDropOffs(val)}
            selectedChannel={selectedChannel}
            selectedPathId={selectedPathId}
            topPaths={topPaths}
            onSelectNode={(node) => setSelectedNodeDetail(node)}
          />

          {/* Quick Insights Bar below D3 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Google Ads Temas Noktası</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Google arama reklamlarından gelen ziyaretçilerin <strong>%37.6&apos;sı</strong> Acil
                Çekici sayfasına yönlendiğinde doğrudan forma ulaşıyor. Reklam başlıklarında
                &ldquo;15 Dakikada Varış&rdquo; vurgusu dönüşümü maksimize ediyor.
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Organik SEO &amp; Güven Aşaması</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Organik arama kullanıcıları <strong>%29.1</strong> oranında müşteri yorumlarını ve
                taşıma kasko sertifikalarını okuduktan sonra form dolduruyor. Güven sinyalleri
                organik trafikte en belirleyici faktör.
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-1">
                <span className="w-2 h-2 rounded-full bg-violet-500" />
                <span>Sosyal Medya &amp; WhatsApp Köprüsü</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Instagram reklamlarından gelenlerin <strong>%40&apos;ı</strong> uzun form yerine doğrudan
                WhatsApp butonunu tercih ediyor. Sosyal medya açılışlarında WhatsApp hızlı iletişim
                butonu öne çıkarılmalı.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: D3 DROP-OFF & FUNNEL FRICTION ANALYSIS */}
      {activeViewTab === "drop-offs" && (
        <div className="space-y-6">
          {/* Main D3 Drop-Off Waterfall Visualizer */}
          <CustomerJourneyDropOffChart
            stages={funnelStages}
            dropOffPoints={dropOffPoints}
            onSelectDropOffPoint={(dp) => setSelectedDropOffDetail(dp)}
          />

          {/* Interactive Drop-off Reduction ROI Simulator Card */}
          <div className="p-6 bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white rounded-2xl border border-indigo-500/20 shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="max-w-xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                    Akıllı İyileştirme Projeksiyonu
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  Terk Oranı İyileştirme &amp; Ek Ciro Simülatörü
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Aşağıdaki kaydırıcıyı kullanarak drop-off sürtünme noktalarını optimize ettiğinizde
                  kazanabileceğiniz ek form başvurularını ve net ciro katkısını hesaplayın.
                </p>

                {/* Slider */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">Hedeflenen Terk Azaltma Oranı:</span>
                    <span className="font-mono font-bold text-amber-300 text-sm">
                      %{dropOffReductionPercent} İyileşme
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="5"
                    value={dropOffReductionPercent}
                    onChange={(e) => setDropOffReductionPercent(Number(e.target.value))}
                    className="w-full accent-indigo-400 cursor-pointer h-2 bg-slate-700 rounded-lg appearance-none"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>%5 (Hızlı Düzeltmeler)</span>
                    <span>%15 (Önerilen Optimizasyon)</span>
                    <span>%30 (A/B Testli Tam Revizyon)</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Metric Output */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10 lg:w-[480px]">
                <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                  <span className="text-[10px] text-slate-300 block">Kurtarılan Ziyaretçi</span>
                  <div className="text-xl font-black text-white font-mono mt-1">
                    +{Math.round(1922 * (dropOffReductionPercent / 100))}
                  </div>
                  <span className="text-[9px] text-emerald-400 font-semibold mt-0.5 block">
                    terk etmeyen kullanıcı
                  </span>
                </div>

                <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                  <span className="text-[10px] text-slate-300 block">Ek Nitelikli Lead</span>
                  <div className="text-xl font-black text-amber-300 font-mono mt-1">
                    +{Math.round(1922 * (dropOffReductionPercent / 100) * 0.28)}
                  </div>
                  <span className="text-[9px] text-slate-300 block mt-0.5">
                    yeni form &amp; arama
                  </span>
                </div>

                <div className="col-span-2 sm:col-span-1 p-3 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                  <span className="text-[10px] text-emerald-300 block font-semibold">Ek Aylık Ciro</span>
                  <div className="text-xl font-black text-emerald-300 font-mono mt-1">
                    +₺{(Math.round(1922 * (dropOffReductionPercent / 100) * 0.28 * 2500)).toLocaleString('tr-TR')}
                  </div>
                  <span className="text-[9px] text-emerald-400 font-semibold mt-0.5 block">
                    net tahmini kazanç
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Diagnostic Breakdown: 5 Common Drop-off Points */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-md bg-rose-50 text-rose-600">
                    <AlertTriangle className="w-4 h-4" />
                  </span>
                  <h2 className="text-base font-bold text-slate-900">
                    En Sık Yaşanan 5 Kritik Terk Noktası (Common Drop-Off Points)
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kullanıcı davranış verilerine göre funnel boyunca sürtünme yaratan noktalar, ayrılma nedenleri ve 1-tıkla uygulanabilir çözümler.
                </p>
              </div>

              <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
                Toplam 5 Sürtünme Tespit Edildi
              </span>
            </div>

            <div className="p-5 space-y-4">
              {dropOffPoints.map((point, index) => {
                const isCritical = point.severity === "critical";
                const isHigh = point.severity === "high";

                return (
                  <div
                    key={point.id}
                    id={`dropoff-card-${point.id}`}
                    className={`p-5 rounded-2xl border transition-all ${
                      isCritical
                        ? "bg-rose-50/40 border-rose-200 hover:border-rose-300"
                        : isHigh
                        ? "bg-amber-50/30 border-amber-200 hover:border-amber-300"
                        : "bg-slate-50/50 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      {/* Left: Metadata & Descriptions */}
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isCritical
                                ? "bg-rose-100 text-rose-800 border border-rose-200"
                                : isHigh
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : "bg-slate-100 text-slate-800 border border-slate-200"
                            }`}
                          >
                            {isCritical
                              ? "🚨 Kritik Öncelik"
                              : isHigh
                              ? "⚠️ Yüksek Öncelik"
                              : "ℹ️ Orta Öncelik"}
                          </span>

                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white text-slate-600 border border-slate-200">
                            {point.stageName}
                          </span>

                          <span className="text-xs text-slate-400 font-mono">
                            Konum: {point.location}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                          <span>{index + 1}. {point.name}</span>
                        </h3>

                        <p className="text-xs text-slate-700 leading-relaxed">
                          <strong>Sürtünme Nedeni:</strong> {point.reason}
                        </p>

                        <div className="p-3 bg-white rounded-xl border border-slate-200/80 text-xs text-slate-800 space-y-1">
                          <div className="flex items-center gap-1.5 font-semibold text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Önerilen Çözüm &amp; Optimizasyon:</span>
                          </div>
                          <p className="text-slate-600 leading-relaxed">
                            {point.recommendedAction}
                          </p>
                        </div>
                      </div>

                      {/* Right: Metrics & Action Buttons */}
                      <div className="lg:w-72 flex flex-col justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
                        <div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 font-medium">Terk Oranı:</span>
                            <span className="font-mono font-bold text-rose-600 text-base">
                              %{point.dropOffRate.toFixed(1)}
                            </span>
                          </div>

                          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-1.5 flex">
                            <div
                              className="bg-rose-500 h-full rounded-full"
                              style={{ width: `${Math.min(point.dropOffRate, 100)}%` }}
                            />
                          </div>

                          <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                            <span>Kayıp: {point.lostVisitors} kişi</span>
                            <span>Kalan: {point.retainedVisitors} kişi</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-slate-500">Tahmini Kayıp Ciro:</span>
                          <span className="font-bold text-rose-700 font-mono">
                            ~₺{point.lostRevenueEstimate.toLocaleString('tr-TR')} / ay
                          </span>
                        </div>

                        <button
                          type="button"
                          id={`btn-action-${point.id}`}
                          onClick={() => setSelectedDropOffDetail(point)}
                          className="w-full mt-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          <span>Detaylı Teşhis &amp; Çözüm</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: CHANNEL EFFECTIVENESS LEADERBOARD */}
      {activeViewTab === "effectiveness" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Kanal Dönüşüm &amp; Verimlilik Liderlik Tablosu
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tüm edinme kanallarının ziyaretçi hacmi, form dönüşüm oranı (CR%), ortalama anlaşma
                  tutarı ve tahmini ROI karşılaştırması.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Lider: Google Ads (%512 ROI)
                </span>
              </div>
            </div>

            {/* Effectiveness Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Edinme Kanalı</th>
                    <th className="py-3 px-3 text-right">Ziyaretçi</th>
                    <th className="py-3 px-3 text-right">Form Başvurusu</th>
                    <th className="py-3 px-4 text-right">Dönüşüm Oranı</th>
                    <th className="py-3 px-3 text-right">Terk Oranı</th>
                    <th className="py-3 px-3 text-right">Ort. Değer</th>
                    <th className="py-3 px-4 text-right">Toplam Ciro</th>
                    <th className="py-3 px-3 text-right">Karar Süresi</th>
                    <th className="py-3 px-4 text-right">Tahmini ROI</th>
                    <th className="py-3 px-4">En Başarılı Karşılama</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
                  {channelEffectiveness.map((ch) => (
                    <tr
                      key={ch.channel}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        ch.isWinner ? "bg-amber-50/30" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: ch.color }}
                          />
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{ch.label}</span>
                              {ch.isWinner && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 border border-amber-300">
                                  ★ #1
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 block">
                              {ch.description}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-900">
                        {ch.visitors.toLocaleString("tr-TR")}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-600">
                        {ch.conversions.toLocaleString("tr-TR")}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className="font-bold font-mono text-slate-900">
                            %{ch.conversionRate.toFixed(1)}
                          </span>
                          <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.min(100, ch.conversionRate * 2.5)}%`,
                                backgroundColor: ch.color
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-500">
                        %{ch.dropOffRate.toFixed(1)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-800">
                        {ch.avgDealValue.toLocaleString("tr-TR")} ₺
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-indigo-700">
                        {ch.totalRevenue.toLocaleString("tr-TR")} ₺
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-600">
                        {ch.avgDuration}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          %{ch.roiEstimate}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-xs text-slate-800 font-semibold block">
                          {ch.topLandingPage}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {ch.badge}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: TOP 5 CONVERTING PATHS */}
      {activeViewTab === "top-paths" && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                En Yüksek Dönüşüm Getiren 5 Müşteri Yolculuk Rotası
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                İlk reklam tıklamasından nihai form gönderimine kadar adım adım en başarılı conversion rotaları.
              </p>
            </div>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-100">
              Gerçek Dönüşüm Oranlarına Göre Sıralı
            </span>
          </div>

          <div className="space-y-3">
            {topPaths.map((path, idx) => (
              <div
                key={path.id}
                className={`p-5 bg-white rounded-2xl border transition-all shadow-xs ${
                  path.isWinner
                    ? "border-amber-300 ring-2 ring-amber-400/20 bg-gradient-to-r from-amber-50/20 via-white to-white"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex items-center justify-center w-7 h-7 rounded-xl font-bold text-xs ${
                        path.isWinner
                          ? "bg-amber-400 text-slate-900 shadow-xs"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      #{idx + 1}
                    </span>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          {path.name}
                        </span>
                        {path.isWinner && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            ★ En Karlı Rota
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500">
                        {path.channelLabel} • Ortalama Süre: <strong>{path.avgDuration}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Metrics Badges & Highlight Action */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase">
                        Dönüşüm Oranı
                      </span>
                      <span className="text-sm font-bold text-emerald-600 font-mono">
                        %{path.conversionRate.toFixed(1)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase">
                        Kazanılan Ciro
                      </span>
                      <span className="text-sm font-bold text-slate-900 font-mono">
                        {path.totalRevenue.toLocaleString("tr-TR")} ₺
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPathId(path.id);
                        setActiveViewTab("d3-flow");
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
                    >
                      <Route className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Rotayı D3&apos;te Vurgula</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Step-by-Step Breadcrumb Path Nodes */}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {path.steps.map((step, sIdx) => (
                    <React.Fragment key={sIdx}>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {sIdx + 1}
                        </span>
                        <span className="font-semibold text-slate-800">
                          {step.name}
                        </span>
                      </div>

                      {sIdx < path.steps.length - 1 && (
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 4: REAL LEADS CUSTOMER JOURNEY TIMELINE */}
      {activeViewTab === "lead-timelines" && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Gerçek Lead Yolculuk Kayıtları (CRM Entegrasyonu)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Sitenizin formlarından gelen gerçek potansiyel müşterilerin reklam tıklamasından onaylanan forma kadar temas adımları.
              </p>
            </div>

            {/* Search filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchLeadQuery}
                onChange={(e) => setSearchLeadQuery(e.target.value)}
                placeholder="Müşteri adı veya hizmet ara..."
                className="pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-64"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredIndividualJourneys.map((leadJourney) => (
              <div
                key={leadJourney.id}
                className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-indigo-200 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          {leadJourney.leadName}
                        </span>
                        {leadJourney.isHighValue && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            ★ VIP Lead
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500">
                        {leadJourney.serviceOrProduct} • {leadJourney.date}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-indigo-600 block font-mono">
                        {leadJourney.dealValue.toLocaleString("tr-TR")} ₺
                      </span>
                      <span className="text-[10px] font-medium text-slate-500">
                        Süre: {leadJourney.totalDuration}
                      </span>
                    </div>
                  </div>

                  {/* Chronological Steps */}
                  <div className="mt-4 space-y-3 relative before:absolute before:inset-y-2 before:left-[11px] before:w-0.5 before:bg-slate-100">
                    {leadJourney.steps.map((step, idx) => (
                      <div key={idx} className="relative flex items-start gap-3 text-xs">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 text-[10px] font-bold ${
                            step.isKeyMoment
                              ? "bg-indigo-600 text-white shadow-xs"
                              : "bg-white border border-slate-200 text-slate-600"
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">
                              {step.title}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              +{step.timestamp}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer action */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{leadJourney.outcome}</span>
                  </span>

                  {onSelectLeadForDetail && (
                    <button
                      type="button"
                      onClick={() => {
                        const target = config.leads?.find((l) => l.id === leadJourney.leadId);
                        if (target) onSelectLeadForDetail(target);
                      }}
                      className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>CRM Detayı</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 5: JOURNEY PATH SIMULATOR & PREDICTOR */}
      {activeViewTab === "simulator" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Compass className="w-4 h-4 text-purple-600" />
              <h2 className="text-base font-bold text-slate-900">
                Müşteri Yolculuğu &amp; Dönüşüm Tahmin Simülatörü
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Farklı reklam kaynakları, karşılama sayfaları ve form türlerini kombine ederek tahmini form
              dönüşüm oranını ve ciro beklentisini hesaplayın.
            </p>
          </div>

          {/* Simulator Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Step 1: Edinme Kanalı */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                1. Edinme Kanalı / Reklam
              </label>
              <select
                value={simChannel}
                onChange={(e) => setSimChannel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium cursor-pointer"
              >
                <option value="ads">Google Search Ads (Arama Reklamı)</option>
                <option value="organic">Organik Arama (Google SEO #1)</option>
                <option value="social">Meta / Instagram Hikaye Reklamı</option>
                <option value="direct">Doğrudan Web Adresi (Direkt)</option>
              </select>
            </div>

            {/* Step 2: Karşılama Sayfası */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                2. Karşılama Sayfası (Landing)
              </label>
              <select
                value={simLanding}
                onChange={(e) => setSimLanding(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium cursor-pointer"
              >
                <option value="emergency">Acil Oto Çekici Hizmet Sayfası</option>
                <option value="pricing">Fiyat Tarifesi &amp; Hesaplayıcı</option>
                <option value="hero">Ana Sayfa Karşılama (Hero B)</option>
              </select>
            </div>

            {/* Step 3: Etkileşim Öğesi */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                3. Ziyaretçi Etkileşim Adımı
              </label>
              <select
                value={simEngagement}
                onChange={(e) => setSimEngagement(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium cursor-pointer"
              >
                <option value="price-calc">Canlı Fiyat &amp; Mesafe Simülatörü</option>
                <option value="reviews">Müşteri Yorumları &amp; Kasko Güvencesi</option>
                <option value="skip">Doğrudan Forma Atlama</option>
              </select>
            </div>

            {/* Step 4: Form Türü */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                4. Form &amp; Dönüşüm Aracı
              </label>
              <select
                value={simForm}
                onChange={(e) => setSimForm(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium cursor-pointer"
              >
                <option value="quick-form">Hızlı Teklif Formu (Ad + Tel)</option>
                <option value="corp-form">Detaylı Kurumsal / Nakil Formu</option>
                <option value="whatsapp">WhatsApp Canlı Destek Tıklaması</option>
              </select>
            </div>
          </div>

          {/* Simulator Results Output Card */}
          <div className="p-5 bg-gradient-to-br from-indigo-50/60 via-purple-50/40 to-white rounded-2xl border border-indigo-200/80">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-indigo-100">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Tahmini Form Dönüşüm Oranı
                </span>
                <div className="text-3xl font-extrabold text-indigo-600 font-mono mt-1">
                  %{simulatorResult.predictedConversionRate.toFixed(1)}
                </div>
                <span className="text-xs text-indigo-700 font-medium">
                  Performans Puanı: <strong>{simulatorResult.scoreText}</strong>
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Beklenen Sipariş / Anlaşma Değeri
                </span>
                <div className="text-3xl font-extrabold text-slate-900 font-mono mt-1">
                  {simulatorResult.predictedDealValue.toLocaleString("tr-TR")} ₺
                </div>
                <span className="text-xs text-slate-500">
                  Sektörel ortalamanın üzerinde
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  En Kritik Başarı Faktörü
                </span>
                <div className="text-xs font-semibold text-slate-800 mt-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Şeffaf Fiyatlandırma &amp; Mesafe Seçimi</span>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="mt-4">
              <span className="text-xs font-bold text-slate-800 block mb-2">
                💡 Bu Yolculuk Rotası İçin Optimizasyon Tavsiyeleri:
              </span>
              <ul className="space-y-1.5">
                {simulatorResult.recommendations.map((rec, rIdx) => (
                  <li
                    key={rIdx}
                    className="flex items-start gap-2 text-xs text-slate-600"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 5. NODE DETAIL SLIDEOVER MODAL */}
      {selectedNodeDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setSelectedNodeDetail(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedNodeDetail.color }} />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {JOURNEY_STAGES.find((s) => s.key === selectedNodeDetail.stage)?.title}
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              {selectedNodeDetail.name}
            </h3>

            {selectedNodeDetail.badge && (
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                {selectedNodeDetail.badge}
              </span>
            )}

            <div className="grid grid-cols-2 gap-3 my-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">Toplam Ziyaretçi Hacmi:</span>
                <span className="font-bold text-sm text-slate-900 font-mono">
                  {selectedNodeDetail.visitors.toLocaleString("tr-TR")}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Form Dönüşüm Oranı:</span>
                <span className="font-bold text-sm text-emerald-600 font-mono">
                  %{selectedNodeDetail.conversionRate.toFixed(1)}
                </span>
              </div>
              {selectedNodeDetail.avgDealValue && (
                <div>
                  <span className="text-slate-500 block text-[10px]">Ortalama Sipariş / Ciro:</span>
                  <span className="font-bold text-sm text-amber-600 font-mono">
                    {selectedNodeDetail.avgDealValue.toLocaleString("tr-TR")} ₺
                  </span>
                </div>
              )}
              {selectedNodeDetail.dropOffRate !== undefined && (
                <div>
                  <span className="text-slate-500 block text-[10px]">Aşama Terk Oranı (Drop-off):</span>
                  <span className="font-bold text-sm text-rose-600 font-mono">
                    %{selectedNodeDetail.dropOffRate.toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <p className="font-semibold text-slate-800">
                🎯 Bu Temas Noktasını İyileştirme Önerileri:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-600">
                <li>Sayfa açılış hızını mobil cihazlar için 1 saniyenin altında tutun.</li>
                <li>Teklif formunda telefon numarasını zorunlu tutup e-posta alanını isteğe bağlı bırakın.</li>
                <li>Hemen arama ve WhatsApp iletişim butonlarını ekranın sağ altında sabit tutun.</li>
              </ul>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedNodeDetail(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. DROP-OFF POINT DETAIL MODAL */}
      {selectedDropOffDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setSelectedDropOffDetail(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
                Sürtünme &amp; Terk Teşhis Raporu
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              {selectedDropOffDetail.name}
            </h3>

            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-semibold text-slate-500">
                Konum: {selectedDropOffDetail.location}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold text-slate-500">
                Aşama: {selectedDropOffDetail.stageName}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 my-4 p-3 bg-rose-50/50 rounded-xl border border-rose-200 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">Terk Oranı (Drop-off):</span>
                <span className="font-bold text-base text-rose-700 font-mono">
                  %{selectedDropOffDetail.dropOffRate.toFixed(1)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Ayrılan Ziyaretçi:</span>
                <span className="font-bold text-base text-slate-900 font-mono">
                  {selectedDropOffDetail.lostVisitors} kişi
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Tahmini Ciro Kaybı:</span>
                <span className="font-bold text-base text-rose-800 font-mono">
                  ₺{selectedDropOffDetail.lostRevenueEstimate.toLocaleString('tr-TR')}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div>
                <span className="font-bold text-slate-900 block mb-0.5">
                  🔍 Neden Ayrılıyorlar? (Kullanıcı Sürtünmesi):
                </span>
                <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 leading-relaxed">
                  {selectedDropOffDetail.reason}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-900 block mb-0.5">
                  💡 Önerilen Optimizasyon &amp; Eylem Planı:
                </span>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 leading-relaxed">
                  {selectedDropOffDetail.recommendedAction}
                </div>
              </div>

              {/* Actionable Checklist */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1.5">
                  ✅ 3 Adımlı İyileştirme Kontrol Listesi:
                </span>
                <ul className="space-y-1 text-[11px] text-slate-600 list-disc pl-4">
                  <li>Formdaki gereksiz zorunlu alanları kaldırarak tek sütunlu yerleşime geçin.</li>
                  <li>WhatsApp hızlı teklif butonunu belirginleştirerek alternatif temas yolu sunun.</li>
                  <li>Müşteri memnuniyet rozetleri ve referans logolarını hemen butonun altına yerleştirin.</li>
                </ul>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Tahmini iyileşme: <strong>+{Math.round(selectedDropOffDetail.lostVisitors * 0.22)} ek lead</strong>
              </span>
              <button
                type="button"
                onClick={() => setSelectedDropOffDetail(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Anladım, Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
