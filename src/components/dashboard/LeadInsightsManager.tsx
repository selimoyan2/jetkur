import React, { useState, useMemo } from "react";
import { SiteConfig, FormLead } from "../../types";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import {
  Sparkles,
  TrendingUp,
  Award,
  Zap,
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
  ExternalLink,
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
  Eye
} from "lucide-react";
import {
  analyzeLeadInsights,
  ACQUISITION_CHANNELS,
  AcquisitionChannelKey,
  ChannelMeta,
  EnrichedLead
} from "../../utils/leadInsights";
import { LeadScoreBadge } from "./LeadScoreBadge";

interface LeadInsightsManagerProps {
  config: SiteConfig;
  onNavigateTab?: (tab: string) => void;
  onSelectLeadForDetail?: (lead: FormLead) => void;
}

export const LeadInsightsManager: React.FC<LeadInsightsManagerProps> = ({
  config,
  onNavigateTab,
  onSelectLeadForDetail
}) => {
  // Filter States
  const [timeRange, setTimeRange] = useState<"all" | "7d" | "30d" | "90d">("all");
  const [channelFilter, setChannelFilter] = useState<"all" | AcquisitionChannelKey>("all");
  const [qualityFilter, setQualityFilter] = useState<"all" | "high" | "medium" | "low">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChartTab, setActiveChartTab] = useState<"quality" | "sources" | "matrix">("quality");
  const [selectedLeadModal, setSelectedLeadModal] = useState<EnrichedLead | null>(null);

  // Time-filtered leads
  const timeFilteredLeads = useMemo(() => {
    const all = config.leads || [];
    if (timeRange === "all") return all;

    const now = new Date().getTime();
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const cutoff = now - days * 24 * 60 * 60 * 1000;

    return all.filter((l) => {
      if (!l.date) return true;
      if (l.createdAt) {
        const time = new Date(l.createdAt).getTime();
        return !isNaN(time) ? time >= cutoff : true;
      }
      return true;
    });
  }, [config.leads, timeRange]);

  // Lead Insights Report generated from leads
  const report = useMemo(() => {
    return analyzeLeadInsights(timeFilteredLeads, config.leadNotifications?.scoring);
  }, [timeFilteredLeads, config.leadNotifications?.scoring]);

  // Leads filtered by search and channel/quality filters for table view
  const displayLeads: EnrichedLead[] = useMemo(() => {
    const scoringCfg = config.leadNotifications?.scoring;
    const fullAnalysis = analyzeLeadInsights(timeFilteredLeads, scoringCfg);

    // Collect all enriched leads
    const allEnriched = [
      ...fullAnalysis.qualityTiers.high.leads,
      ...fullAnalysis.qualityTiers.medium.leads,
      ...fullAnalysis.qualityTiers.low.leads
    ];

    return allEnriched.filter((item) => {
      // Channel filter
      if (channelFilter !== "all" && item.channel !== channelFilter) {
        return false;
      }
      // Quality filter
      if (qualityFilter !== "all" && item.scoreResult.priority !== qualityFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = (item.lead.name || "").toLowerCase().includes(q);
        const matchPhone = (item.lead.phone || "").toLowerCase().includes(q);
        const matchService = (item.lead.serviceOrProduct || "").toLowerCase().includes(q);
        const matchMessage = (item.lead.message || "").toLowerCase().includes(q);
        const matchChannel = item.channelMeta.label.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchService && !matchMessage && !matchChannel) {
          return false;
        }
      }
      return true;
    });
  }, [timeFilteredLeads, config.leadNotifications?.scoring, channelFilter, qualityFilter, searchQuery]);

  // Export report summary as CSV
  const handleExportSummaryCsv = () => {
    const rows = [
      ["Müşteri Adı", "Telefon", "Hizmet", "Edinme Kanalı", "Kalite Skoru", "Öncelik Kademesi", "Tarih", "Durum", "Anlaşma Değeri (TL)"]
    ];

    displayLeads.forEach((item) => {
      rows.push([
        `"${item.lead.name || ""}"`,
        `"${item.lead.phone || ""}"`,
        `"${item.lead.serviceOrProduct || ""}"`,
        `"${item.channelMeta.label}"`,
        String(item.scoreResult.score),
        `"${item.scoreResult.priority === "high" ? "Yüksek Kalite" : item.scoreResult.priority === "medium" ? "Orta Kalite" : "Düşük Kalite"}"`,
        `"${item.lead.date || ""}"`,
        `"${item.lead.status}"`,
        String(item.lead.dealValue || 0)
      ]);
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `lead-insights-raporu-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl shadow-md border border-indigo-900/50">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Lead Kalite & Edinme Kaynak Analitiği</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Lead Insights (Talep Analizi)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Müşteri form taleplerinin kalite puanlarını, dönüşüm oranlarını ve yüksek puanlı taleplerin edinme kaynaklarını (organik, reklam, sosyal) derinlemesine analiz edin.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Time Range Filter */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-2xl border border-slate-700 text-xs font-bold">
            <button
              type="button"
              onClick={() => setTimeRange("all")}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                timeRange === "all" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-300 hover:text-white"
              }`}
            >
              Tümü
            </button>
            <button
              type="button"
              onClick={() => setTimeRange("30d")}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                timeRange === "30d" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-300 hover:text-white"
              }`}
            >
              Son 30 Gün
            </button>
            <button
              type="button"
              onClick={() => setTimeRange("7d")}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                timeRange === "7d" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-300 hover:text-white"
              }`}
            >
              Son 7 Gün
            </button>
          </div>

          {/* Action buttons */}
          <button
            type="button"
            onClick={handleExportSummaryCsv}
            className="px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-white/15"
            title="Analiz verilerini CSV formatında indir"
          >
            <Download className="w-3.5 h-3.5 text-slate-300" />
            <span className="hidden sm:inline">Rapor İndir</span>
          </button>

          {onNavigateTab && (
            <>
              <button
                type="button"
                onClick={() => onNavigateTab("lead-forecasting")}
                className="px-3.5 py-2 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer border border-cyan-500/40 shadow-xs"
                title="Gelecek Ay Tahminleme (D3.js 30 Günlük Projeksiyon)"
              >
                <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                <span>Gelecek Ay Tahminleme</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab("lead-automations")}
                className="px-3.5 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Lead Otomasyon Kuralları (CRM, E-posta, Bildirimler)"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Otomasyon Kuralları</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab("leads")}
                className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Müşteri Talepleri CRM sayfasına git"
              >
                <Users className="w-3.5 h-3.5" />
                <span>CRM'de Gör</span>
                <ArrowUpRight className="w-3 h-3 text-indigo-200" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* TOP 5 STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total Leads */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">İncelenen Talepler</span>
            <div className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {report.totalLeads}
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {timeRange === "all" ? "Tüm Zamanlar" : timeRange === "30d" ? "Son 30 Gün" : "Son 7 Gün"}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{report.highQualityCount} yüksek</span>
            <span>•</span>
            <span>{report.qualityTiers.medium.count} orta</span>
            <span>•</span>
            <span>{report.qualityTiers.low.count} düşük</span>
          </div>
        </div>

        {/* Quality Index / Average Score */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Lead Kalite Skoru</span>
            <div className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {report.averageScore}
              </span>
              <span className="text-xs font-bold text-slate-400">/100</span>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                report.averageScore >= 75
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  : report.averageScore >= 50
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                  : "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300"
              }`}
            >
              {report.averageScore >= 75 ? "Çok İyi" : report.averageScore >= 50 ? "Standart" : "Geliştirilmeli"}
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(5, report.averageScore))}%` }}
            />
          </div>
        </div>

        {/* High Quality Leads Rate */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Yüksek Nitelik Oranı</span>
            <div className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              %{report.highQualityRate}
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {report.highQualityCount} / {report.totalLeads}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
            70+ puan alan, telefon içeren ve sıcak takip gerektiren talepler
          </p>
        </div>

        {/* Best Acquisition Channel */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">En Kaliteli Kanal</span>
            <div className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-base font-black text-slate-900 dark:text-white truncate" title={report.bestSource?.meta.label}>
              {report.bestSource ? report.bestSource.meta.shortLabel : "-"}
            </span>
            {report.bestSource && (
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                %{report.bestSource.highRate} Kalite
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
            {report.bestSource
              ? `${report.bestSource.highCount} yüksek kaliteli lead (${report.bestSource.avgScore} ort. puan)`
              : "Veri toplanıyor..."}
          </p>
        </div>

        {/* High Quality Deal Value / Revenue Potential */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Nitelikli Ciro Hacmi</span>
            <div className="p-1.5 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              ₺{report.highQualityRevenue.toLocaleString("tr-TR")}
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {report.qualityTiers.high.closedDealsCount} Kapanan
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
            Yüksek puanlı müşterilerin getirdiği toplam teklif ve anlaşma değeri
          </p>
        </div>
      </div>

      {/* CHART SECTION: LEAD KALİTE DAĞILIMI & KAYNAK ANALİZİ */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-3xl p-6 shadow-xs space-y-6">
        {/* Navigation Tabs between Visuals */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4 gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <span>Görsel Analiz: Kalite Kademeleri & Kaynak Korelasyonu</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Form puanlama algoritmamız ile analiz edilen müşteri taleplerinin kalite yüzdeleri ve hangi pazarlama kanalından geldikleri.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700/60 p-1 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveChartTab("quality")}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeChartTab === "quality"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Kalite Dağılımı</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveChartTab("sources")}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeChartTab === "sources"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Yüksek Puanlı Kaynaklar</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveChartTab("matrix")}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeChartTab === "matrix"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Kanal Karşılaştırma</span>
            </button>
          </div>
        </div>

        {/* TAB 1: LEAD KALİTE DAĞILIMI */}
        {activeChartTab === "quality" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Pie / Donut Chart */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                  Talep Kalite Kademeleri Yüzde Dağılımı
                </span>
                <div className="w-full h-64 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={report.qualityChartData}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={4}
                      >
                        {report.qualityChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: any, name: any, item: any) => [
                          `${val} Talep (%${item.payload.value})`,
                          name
                        ]}
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          borderRadius: "12px",
                          color: "#fff",
                          border: "none",
                          fontSize: "12px"
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Centered Donut Label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      %{report.highQualityRate}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Yüksek Kalite
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 mt-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Yüksek ({report.qualityTiers.high.count})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Orta ({report.qualityTiers.medium.count})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-slate-400" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Düşük ({report.qualityTiers.low.count})
                    </span>
                  </div>
                </div>
              </div>

              {/* Quality Tiers Detailed Breakdown Cards */}
              <div className="lg:col-span-7 space-y-3">
                {/* High Tier Card */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="font-black text-sm text-emerald-950 dark:text-emerald-200">
                        Yüksek Kalite (Öncelikli Sıcak Talepler)
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200">
                        70 - 100 Puan
                      </span>
                    </div>
                    <span className="text-base font-black text-emerald-700 dark:text-emerald-300">
                      {report.qualityTiers.high.count} Lead (%{report.qualityTiers.high.percent})
                    </span>
                  </div>
                  <p className="text-xs text-emerald-900/80 dark:text-emerald-300/80 leading-relaxed">
                    Telefon numarası eksiksiz verilmiş, detaylı talep metni yazılmış ve "acil, hemen, fiyat, kurumsal" gibi sıcak satın alma sinyalleri içeren öncelikli müşteri adayları.
                  </p>
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-emerald-200/60 dark:border-emerald-800/40 text-xs">
                    <div>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-semibold">Ortalama Puan</span>
                      <span className="font-bold text-emerald-950 dark:text-emerald-100">{report.qualityTiers.high.avgScore} / 100</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-semibold">Toplam Ciro Hacmi</span>
                      <span className="font-bold text-emerald-950 dark:text-emerald-100">₺{report.qualityTiers.high.totalDealValue.toLocaleString("tr-TR")}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-semibold">Kapanış Oranı</span>
                      <span className="font-bold text-emerald-950 dark:text-emerald-100">%{report.qualityTiers.high.closedRate}</span>
                    </div>
                  </div>
                </div>

                {/* Medium Tier Card */}
                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="font-black text-sm text-amber-950 dark:text-amber-200">
                        Orta Kalite (Standart Bilgi Talepleri)
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200">
                        40 - 69 Puan
                      </span>
                    </div>
                    <span className="text-base font-black text-amber-700 dark:text-amber-300">
                      {report.qualityTiers.medium.count} Lead (%{report.qualityTiers.medium.percent})
                    </span>
                  </div>
                  <p className="text-xs text-amber-900/80 dark:text-amber-300/80 leading-relaxed">
                    İletişim bilgisi veya hizmet seçimi mevcut, standart teklif arayan ancak özel aciliyet belirtilmemiş potansiyel müşteriler.
                  </p>
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-amber-200/60 dark:border-amber-800/40 text-xs">
                    <div>
                      <span className="text-[10px] text-amber-700 dark:text-amber-400 block font-semibold">Ortalama Puan</span>
                      <span className="font-bold text-amber-950 dark:text-amber-100">{report.qualityTiers.medium.avgScore} / 100</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-amber-700 dark:text-amber-400 block font-semibold">Toplam Değer</span>
                      <span className="font-bold text-amber-950 dark:text-amber-100">₺{report.qualityTiers.medium.totalDealValue.toLocaleString("tr-TR")}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-amber-700 dark:text-amber-400 block font-semibold">Kapanış Oranı</span>
                      <span className="font-bold text-amber-950 dark:text-amber-100">%{report.qualityTiers.medium.closedRate}</span>
                    </div>
                  </div>
                </div>

                {/* Low Tier Card */}
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                      <span className="font-black text-sm text-slate-800 dark:text-slate-200">
                        Düşük Kalite (Eksik veya Soğuk Bilgi)
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                        0 - 39 Puan
                      </span>
                    </div>
                    <span className="text-base font-black text-slate-600 dark:text-slate-400">
                      {report.qualityTiers.low.count} Lead (%{report.qualityTiers.low.percent})
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Telefon numarası yazılmamış ya da çok kısa mesaj iletilmiş formlar. Otomatik e-posta ile ek bilgi talep edilebilir.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: YÜKSEK PUANLI LEADLERİN KAYNAK ANALİZİ (ORGANİK, REKLAM, SOSYAL) */}
        {activeChartTab === "sources" && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 flex items-start gap-3">
              <Target className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-xs sm:text-sm font-bold text-indigo-950 dark:text-indigo-200">
                  Yüksek Kaliteli Talepler Nereden Geliyor?
                </h3>
                <p className="text-xs text-indigo-900/80 dark:text-indigo-300/80">
                  Bu grafik, 70+ kalite puanı alan en sıcak potansiyel müşterilerin hangi kanallardan (Google SEO, Sponsorlu Reklamlar, Sosyal Medya/WhatsApp vb.) web sitenize ulaştığını gösterir.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* High Quality Bar Chart */}
              <div className="lg:col-span-7 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report.sourceComparisonChartData} margin={{ top: 20, right: 20, left: -10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="shortName"
                      tick={{ fontSize: 11, fontWeight: 600, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      formatter={(val: any, name: any) => [
                        `${val} Talep`,
                        name === "high" ? "Yüksek Kalite" : name === "medium" ? "Orta Kalite" : "Düşük Kalite"
                      ]}
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        borderRadius: "12px",
                        color: "#fff",
                        border: "none",
                        fontSize: "12px"
                      }}
                    />
                    <Legend
                      formatter={(val) =>
                        val === "high" ? "Yüksek Kalite (70-100)" : val === "medium" ? "Orta Kalite (40-69)" : "Düşük (0-39)"
                      }
                      wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                    />
                    <Bar dataKey="high" name="high" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="medium" name="medium" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="low" name="low" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Channel Share of High Quality Leads */}
              <div className="lg:col-span-5 space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Yüksek Kaliteli Taleplerin Kanal Dağılımı
                </h4>

                {report.highQualitySourceBreakdown.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="font-bold text-slate-900 dark:text-white">{item.name}</span>
                      </div>
                      <span className="font-black text-slate-900 dark:text-white">
                        {item.count} Lead (%{item.percentOfHigh})
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${item.percentOfHigh}%`,
                          backgroundColor: item.color
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>Tahmini Potansiyel: ₺{item.dealValue.toLocaleString("tr-TR")}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const channelMatch = report.channelsList.find((c) => c.meta.shortLabel === item.name);
                          if (channelMatch) {
                            setChannelFilter(channelMatch.key);
                            setQualityFilter("high");
                          }
                        }}
                        className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                      >
                        Listele →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: KANAL KARŞILAŞTIRMA MATRİSİ */}
        {activeChartTab === "matrix" && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-3">Edinme Kanalı</th>
                    <th className="py-3 px-3">Toplam Lead</th>
                    <th className="py-3 px-3">Yüksek Kalite</th>
                    <th className="py-3 px-3">Kalite Oranı</th>
                    <th className="py-3 px-3">Ortalama Skor</th>
                    <th className="py-3 px-3">Toplam Ciro Değeri</th>
                    <th className="py-3 px-3">Kapanış</th>
                    <th className="py-3 px-3 text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {report.channelsList.map((channel) => (
                    <tr key={channel.key} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: channel.meta.color }} />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">{channel.meta.shortLabel}</span>
                            <span className="text-[10px] text-slate-400 truncate max-w-[180px] block">
                              {channel.meta.description}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white">
                        {channel.totalCount}
                      </td>
                      <td className="py-3.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                        {channel.highCount}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 dark:text-white">%{channel.highRate}</span>
                          <div className="w-12 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden hidden sm:block">
                            <div
                              className="bg-emerald-500 h-1.5 rounded-full"
                              style={{ width: `${channel.highRate}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-bold text-indigo-600 dark:text-indigo-400">
                        {channel.avgScore} / 100
                      </td>
                      <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white">
                        ₺{channel.totalDealValue.toLocaleString("tr-TR")}
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-600 dark:text-slate-300">
                        {channel.closedDealsCount} satış (%{channel.closedRate})
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setChannelFilter(channel.key);
                            setQualityFilter("all");
                          }}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-all cursor-pointer"
                        >
                          Filtrele
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* STRATEGIC TAKEAWAYS & AI GROWTH RECOMMENDATIONS */}
      <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Akıllı Çıkarımlar & Büyüme Tavsiyeleri
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mevcut form verilerinizin analizinden üretilen operasyonel satış ve reklam içgörüleri.
              </p>
            </div>
          </div>

          {onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab("notifications")}
              className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Skor Kurallarını Ayarla</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {report.takeaways.map((takeaway) => (
            <div
              key={takeaway.id}
              className={`p-4 rounded-2xl border space-y-2 transition-all ${
                takeaway.type === "positive"
                  ? "bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60"
                  : takeaway.type === "tip"
                  ? "bg-blue-50/70 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/60"
                  : "bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    takeaway.type === "positive"
                      ? "bg-emerald-200/80 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200"
                      : takeaway.type === "tip"
                      ? "bg-blue-200/80 text-blue-900 dark:bg-blue-900 dark:text-blue-200"
                      : "bg-amber-200/80 text-amber-900 dark:bg-amber-900 dark:text-amber-200"
                  }`}
                >
                  {takeaway.type === "positive" ? "Fırsat & Güçlü Yön" : takeaway.type === "tip" ? "Optimizasyon" : "İçgörü"}
                </span>
                {takeaway.metric && (
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {takeaway.metric}
                  </span>
                )}
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                {takeaway.title}
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                {takeaway.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* FILTERABLE LEADS LIST & INSPECTION TABLE */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4 gap-3">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Talepleri Kaynak ve Kaliteye Göre İncele ({displayLeads.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tıklayarak talebin puanlama detaylarını ve hangi kriterlerden puan aldığını görün.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Channel Pill Filter */}
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value as any)}
              className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="all">Tüm Kaynaklar (Organik, Reklam, Sosyal)</option>
              <option value="organic">🟢 Organik Arama (SEO)</option>
              <option value="ads">🔵 Google Reklamları (Ads)</option>
              <option value="social">🟣 Sosyal Medya (IG/FB)</option>
              <option value="direct">🟡 Doğrudan Erişim</option>
              <option value="referral">🌐 Referans & Tavsiye</option>
            </select>

            {/* Quality Pill Filter */}
            <select
              value={qualityFilter}
              onChange={(e) => setQualityFilter(e.target.value as any)}
              className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="all">Tüm Kalite Kademeleri</option>
              <option value="high">🟢 Yüksek Kalite (70-100 Puan)</option>
              <option value="medium">🟡 Orta Kalite (40-69 Puan)</option>
              <option value="low">⚪ Düşük Kalite (0-39 Puan)</option>
            </select>

            {/* Fast Search input */}
            <div className="relative min-w-[180px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Müşteri, telefon veya mesaj ara..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Leads Table */}
        {displayLeads.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="text-xs font-semibold">Seçili filtrelere uygun müşteri talebi bulunamadı.</p>
            <button
              type="button"
              onClick={() => {
                setChannelFilter("all");
                setQualityFilter("all");
                setSearchQuery("");
              }}
              className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
            >
              Filtreleri Temizle
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {displayLeads.map((item) => {
              const cleanPhone = (item.lead.phone || "").replace(/[^0-9]/g, "");
              const waPhone = cleanPhone.startsWith("0") ? "9" + cleanPhone : cleanPhone.startsWith("90") ? cleanPhone : "90" + cleanPhone;
              const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(
                `Merhaba ${item.lead.name}, web sitemiz üzerinden ilettiğiniz "${item.lead.serviceOrProduct || "hizmet"}" talebiniz ile ilgili iletişime geçiyorum.`
              )}`;

              return (
                <div
                  key={item.lead.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 px-2 rounded-2xl transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {item.lead.name}
                      </span>

                      {/* Lead Quality Score Badge */}
                      <LeadScoreBadge
                        scoreResult={item.scoreResult}
                        showReasons={false}
                        size="sm"
                      />

                      {/* Acquisition Channel Badge */}
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${item.channelMeta.badgeBg}`}
                        title={item.channelMeta.description}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.channelMeta.color }} />
                        <span>{item.channelMeta.shortLabel}</span>
                      </span>

                      {/* Deal Value Badge if available */}
                      {item.lead.dealValue && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          ₺{Number(item.lead.dealValue).toLocaleString("tr-TR")}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {item.lead.serviceOrProduct}:
                      </span>{" "}
                      {item.lead.message || "Mesaj içeriği belirtilmemiş."}
                    </p>

                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>{item.lead.date}</span>
                      <span>•</span>
                      <span>{item.lead.phone}</span>
                      {item.lead.email && (
                        <>
                          <span>•</span>
                          <span>{item.lead.email}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedLeadModal(item)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      title="Puanlama faktörlerini incele"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Skor Detayı</span>
                    </button>

                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-600 dark:text-emerald-400 transition-colors cursor-pointer"
                      title="WhatsApp ile yanıtla"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>

                    <a
                      href={`tel:${cleanPhone}`}
                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                      title="Hemen ara"
                    >
                      <Phone className="w-4 h-4 text-indigo-600" />
                    </a>

                    {onSelectLeadForDetail && (
                      <button
                        type="button"
                        onClick={() => onSelectLeadForDetail(item.lead)}
                        className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        title="CRM Detaylarını Aç"
                      >
                        <span>CRM</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* LEAD SCORE & SOURCE DRILL-DOWN POPUP MODAL */}
      {selectedLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Lead Analitik İncelemesi
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {selectedLeadModal.lead.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLeadModal(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Score & Source Header */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Edinme Kaynağı
                </span>
                <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedLeadModal.channelMeta.color }} />
                  {selectedLeadModal.channelMeta.label}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                  {selectedLeadModal.channelMeta.description}
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  {selectedLeadModal.scoreResult.score}
                </span>
                <span className="text-xs text-slate-400 font-bold">/100</span>
                <span
                  className={`block text-[10px] font-black uppercase tracking-wider ${
                    selectedLeadModal.scoreResult.priority === "high"
                      ? "text-emerald-600"
                      : selectedLeadModal.scoreResult.priority === "medium"
                      ? "text-amber-600"
                      : "text-slate-500"
                  }`}
                >
                  {selectedLeadModal.scoreResult.priority === "high" ? "Yüksek Kalite" : selectedLeadModal.scoreResult.priority === "medium" ? "Orta Kalite" : "Düşük Kalite"}
                </span>
              </div>
            </div>

            {/* Factors breakdown */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 block">
                Skor Faktörleri & Sinyaller:
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {selectedLeadModal.scoreResult.breakdown.map((f, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700 text-xs flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-medium text-slate-800 dark:text-slate-200">{f.label}</span>
                    </div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      +{f.points} Puan
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Close modal */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedLeadModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
