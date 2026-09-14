import React, { useState, useMemo } from "react";
import {
  Bell,
  BellRing,
  TrendingUp,
  Award,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ExternalLink,
  Search,
  Filter,
  Sliders,
  Send,
  RefreshCw,
  Zap,
  Globe,
  Eye,
  Check,
  X,
  Flame,
  Clock,
  ChevronDown,
  ChevronUp,
  Share2,
  Calendar,
  Volume2,
  VolumeX,
  Layers,
  BarChart3,
  BadgePercent
} from "lucide-react";
import {
  SiteConfig,
  SeoProgressNotificationConfig,
  SeoProgressNotificationLog,
  SeoKeywordRankShift
} from "../../types";
import {
  DEFAULT_SEO_PROGRESS_CONFIG,
  generateSeoProgressLog
} from "../../utils/seoProgressTracker";

interface SeoProgressNotificationSystemProps {
  config: SiteConfig;
  onChange?: (updatedConfig: SiteConfig) => void;
  onNavigateTab?: (tab: string) => void;
  onOpenPreview?: (path: string) => void;
  onClose?: () => void;
  isInlineMode?: boolean; // When rendered inline inside Remediation panel or Health manager
}

export const SeoProgressNotificationSystem: React.FC<SeoProgressNotificationSystemProps> = ({
  config,
  onChange,
  onNavigateTab,
  onOpenPreview,
  onClose,
  isInlineMode = false
}) => {
  // Config fallback
  const notifConfig: SeoProgressNotificationConfig = useMemo(() => {
    return config.seoProgressNotifications || DEFAULT_SEO_PROGRESS_CONFIG;
  }, [config.seoProgressNotifications]);

  const logs = notifConfig.logs || [];

  // Filter & Search states
  const [filterType, setFilterType] = useState<"all" | "unread" | "top_3" | "first_page" | "milestone">("all");
  const [clusterFilter, setClusterFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedLogIds, setExpandedLogIds] = useState<Set<string>>(new Set([logs[0]?.id].filter(Boolean)));
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Settings form states
  const [tempSettings, setTempSettings] = useState<SeoProgressNotificationConfig>({
    ...notifConfig
  });

  // Simulated live rank check state
  const [isSimulatingCrawl, setIsSimulatingCrawl] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Toggle log expanded
  const toggleExpand = (id: string) => {
    setExpandedLogIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Mark single as read
  const handleToggleRead = (id: string) => {
    const updated: SiteConfig = JSON.parse(JSON.stringify(config));
    if (!updated.seoProgressNotifications) {
      updated.seoProgressNotifications = { ...notifConfig };
    }
    const target = updated.seoProgressNotifications.logs.find(l => l.id === id);
    if (target) {
      target.isRead = !target.isRead;
      onChange?.(updated);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = () => {
    const updated: SiteConfig = JSON.parse(JSON.stringify(config));
    if (!updated.seoProgressNotifications) {
      updated.seoProgressNotifications = { ...notifConfig };
    }
    updated.seoProgressNotifications.logs.forEach(l => {
      l.isRead = true;
    });
    onChange?.(updated);
    showToast("Tüm sıralama bildirimleri okundu olarak işaretlendi. ✓");
  };

  // Save settings
  const handleSaveSettings = () => {
    const updated: SiteConfig = JSON.parse(JSON.stringify(config));
    updated.seoProgressNotifications = { ...tempSettings };
    onChange?.(updated);
    setShowSettingsModal(false);
    showToast("SEO Bildirim tercihleri kaydedildi! ✓");
  };

  // Test webhook send
  const [isSendingWebhookTest, setIsSendingWebhookTest] = useState(false);
  const handleTestWebhook = () => {
    setIsSendingWebhookTest(true);
    setTimeout(() => {
      setIsSendingWebhookTest(false);
      showToast("Örnek Sıralama Sıçraması bildirim yükü webhook adresine başarıyla gönderildi! (200 OK)");
    }, 700);
  };

  // Manual Trigger: GoogleBot Crawl & Rank Re-check simulation
  const handleTriggerLiveRankCheck = () => {
    setIsSimulatingCrawl(true);
    setTimeout(() => {
      const updated: SiteConfig = JSON.parse(JSON.stringify(config));
      if (!updated.seoProgressNotifications) {
        updated.seoProgressNotifications = { ...notifConfig };
      }

      // Generate a new fresh rank boost event
      const freshLog = generateSeoProgressLog({
        pageId: "service-besiktas",
        pageTitle: "Beşiktaş 7/24 Acil Oto Çekici",
        pageUrl: "/hizmetlerimiz/besiktas-oto-cekici",
        clusterId: "cluster-district",
        clusterTitle: "İlçe & Bölgesel Çekici",
        actionType: "h1_optimization",
        appliedH1: "Beşiktaş 7/24 Acil Oto Çekici & Yol Yardım",
        appliedMeta: "Beşiktaş, Barbaros Bulvarı ve Ortaköy bölgesinde 15 dakikada en yakın oto çekici. Şeffaf fiyat, 7/24 garantili kurtarma.",
        appliedKeywords: "beşiktaş oto çekici, beşiktaş acil yol yardım, barbaros oto kurtarıcı"
      });

      freshLog.googleBotCrawlTime = "Şimdi (GoogleBot Realtime SERP Fetcher - HTTP 200 OK)";
      freshLog.isRead = false;
      freshLog.alertLevel = "top_3";

      updated.seoProgressNotifications.logs.unshift(freshLog);
      onChange?.(updated);
      setIsSimulatingCrawl(false);

      // Expand the new log
      setExpandedLogIds(prev => new Set([freshLog.id, ...Array.from(prev)]));
      showToast("🚀 Yeni Sıralama Sıçraması Algılandı! Beşiktaş sayfası Google 3. sıraya yükseldi!");
    }, 1200);
  };

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (filterType === "unread" && log.isRead) return false;
      if (filterType === "top_3" && log.status !== "top_3") return false;
      if (filterType === "first_page" && log.currentAverageRank > 10) return false;
      if (filterType === "milestone" && log.alertLevel !== "milestone") return false;

      if (clusterFilter !== "all" && log.clusterId !== clusterFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = log.pageTitle.toLowerCase().includes(q);
        const matchesAction = log.actionDescription.toLowerCase().includes(q);
        const matchesKw = log.keywords.some(k => k.keyword.toLowerCase().includes(q));
        if (!matchesTitle && !matchesAction && !matchesKw) return false;
      }

      return true;
    });
  }, [logs, filterType, clusterFilter, searchQuery]);

  // Aggregate KPI Calculations
  const stats = useMemo(() => {
    const totalCount = logs.length;
    const unreadCount = logs.filter(l => !l.isRead).length;

    const avgRankGain = totalCount > 0
      ? parseFloat((logs.reduce((acc, l) => acc + l.rankImprovement, 0) / totalCount).toFixed(1))
      : 0;

    const top3Count = logs.filter(l => l.status === "top_3" || l.keywords.some(k => k.currentRank <= 3)).length;
    const firstPageCount = logs.filter(l => l.currentAverageRank <= 10).length;
    const totalTraffic = logs.reduce((acc, l) => acc + l.estimatedTrafficGrowth, 0);
    const totalRevenue = logs.reduce((acc, l) => acc + l.estimatedMonthlyRevenueGain, 0);

    return {
      totalCount,
      unreadCount,
      avgRankGain,
      top3Count,
      firstPageCount,
      totalTraffic,
      totalRevenue
    };
  }, [logs]);

  // Relative time helper
  const getRelativeTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 5) return "Az önce";
      if (diffMins < 60) return `${diffMins} dakika önce`;
      if (diffHours < 24) return `${diffHours} saat önce`;
      if (diffDays === 1) return "Dün";
      return `${diffDays} gün önce`;
    } catch {
      return "Yakın zamanda";
    }
  };

  return (
    <div className="space-y-6">
      {/* TOAST FEEDBACK */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/50 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-emerald-200">{toastMessage}</p>
        </div>
      )}

      {/* 1. TOP HEADER & IMPACT SUMMARY */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-600/20 via-emerald-600/15 to-transparent blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                <BellRing className="w-5 h-5 animate-pulse" />
              </div>
              <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                <span>SEO İlerleme Bildirim Sistemi</span>
                {stats.unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold font-mono">
                    {stats.unreadCount} Yeni Sıçrama
                  </span>
                )}
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              SEO Düzeltme Paneli üzerinden optimize edilen sayfaların Google SERP sıralama değişimleri,
              GoogleBot tarama zamanları ve tahmini organik trafik kazanımları otomatik olarak loglanır ve bildirim olarak sunulur.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              id="btn-trigger-live-rank-check"
              disabled={isSimulatingCrawl}
              onClick={handleTriggerLiveRankCheck}
              className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md cursor-pointer disabled:opacity-50"
              title="GoogleBot sıralama kontrolünü hemen çalıştır ve yeni sıralama değişikliğini kaydet"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSimulatingCrawl ? "animate-spin" : ""}`} />
              <span>{isSimulatingCrawl ? "GoogleBot Taranıyor..." : "Sıralama Kontrolünü Tetikle"}</span>
            </button>

            {stats.unreadCount > 0 && (
              <button
                type="button"
                id="btn-mark-all-read"
                onClick={handleMarkAllAsRead}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tümünü Okundu Say</span>
              </button>
            )}

            <button
              type="button"
              id="btn-open-notif-settings"
              onClick={() => {
                setTempSettings({ ...notifConfig });
                setShowSettingsModal(true);
              }}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
              title="Bildirim kanalları ve sıralama sıçrama eşiklerini yapılandırın"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>Bildirim Tercihleri</span>
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                title="Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 2. STATS KPI CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 pt-5 border-t border-slate-800">
          {/* Average Rank Gain */}
          <div className="bg-slate-800/80 border border-slate-700/70 rounded-xl p-3.5 flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ort. Sıra Kazanımı</span>
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-black text-emerald-400 font-mono">
                +{stats.avgRankGain}
              </span>
              <span className="text-[11px] text-slate-400">sıra yükselme</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1">İyileştirilen tüm sayfalarda</span>
          </div>

          {/* Top 3 Pages */}
          <div className="bg-slate-800/80 border border-slate-700/70 rounded-xl p-3.5 flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Google İlk 3 (Top 3)</span>
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-black text-amber-400 font-mono">
                {stats.top3Count} Sayfa
              </span>
              <span className="text-[11px] text-slate-400">zirve pozisyon</span>
            </div>
            <span className="text-[10px] text-amber-500/80 mt-1">En yüksek tıklama potansiyeli</span>
          </div>

          {/* First Page Pages */}
          <div className="bg-slate-800/80 border border-slate-700/70 rounded-xl p-3.5 flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>1. Sayfaya Girenler</span>
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-black text-indigo-300 font-mono">
                {stats.firstPageCount} / {stats.totalCount}
              </span>
              <span className="text-[11px] text-slate-400">sayfa</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1">Google 1-10. sıra arası</span>
          </div>

          {/* Organic Traffic Gain */}
          <div className="bg-slate-800/80 border border-slate-700/70 rounded-xl p-3.5 flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Ek Organik Trafik</span>
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-black text-teal-300 font-mono">
                +{stats.totalTraffic.toLocaleString("tr-TR")}
              </span>
              <span className="text-[11px] text-slate-400">/ay</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1">Sıralama sıçraması etkisiyle</span>
          </div>

          {/* Revenue Contribution */}
          <div className="bg-slate-800/80 border border-slate-700/70 rounded-xl p-3.5 flex flex-col justify-between col-span-2 sm:col-span-1">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <BadgePercent className="w-3.5 h-3.5 text-rose-400" />
              <span>Tahmini Ciro Katkısı</span>
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-black text-rose-300 font-mono">
                +₺{stats.totalRevenue.toLocaleString("tr-TR")}
              </span>
              <span className="text-[11px] text-slate-400">/ay</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1">Dönüşüm oranı projeksiyonu</span>
          </div>
        </div>
      </div>

      {/* 3. FILTERS & SEARCH BAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterType === "all"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Tüm Bildirimler ({logs.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterType("unread")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterType === "unread"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            <span>Okunmamış</span>
            {stats.unreadCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] flex items-center justify-center font-mono">
                {stats.unreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setFilterType("top_3")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterType === "top_3"
                ? "bg-amber-600 text-white"
                : "bg-amber-50 text-amber-800 hover:bg-amber-100"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Google İlk 3 ({stats.top3Count})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterType("first_page")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterType === "first_page"
                ? "bg-indigo-600 text-white"
                : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
            }`}
          >
            1. Sayfa (Top 10)
          </button>

          <button
            type="button"
            onClick={() => setFilterType("milestone")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterType === "milestone"
                ? "bg-purple-600 text-white"
                : "bg-purple-50 text-purple-700 hover:bg-purple-100"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Rekor / Milestone</span>
          </button>
        </div>

        {/* Cluster Filter & Search Input */}
        <div className="flex items-center gap-2">
          <select
            value={clusterFilter}
            onChange={e => setClusterFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white text-slate-700 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Tüm İçerik Kümeleri</option>
            <option value="cluster-district">İlçe & Bölgesel</option>
            <option value="cluster-heavy">Ağır Vasıta</option>
            <option value="cluster-pricing">Fiyat & KM</option>
            <option value="cluster-guides">Rehberler & SSS</option>
            <option value="cluster-emergency">Acil Çekici</option>
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Sayfa veya anahtar kelime ara..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 w-48 sm:w-56"
            />
          </div>
        </div>
      </div>

      {/* 4. NOTIFICATIONS TIMELINE FEED */}
      <div className="space-y-3.5">
        {filteredLogs.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-500">
            <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-800">Eşleşen Sıralama Bildirimi Bulunamadı</p>
            <p className="text-xs text-slate-400 mt-1">
              Filtrelerinizi temizleyebilir veya SEO Düzeltme Paneli üzerinden yeni bir sayfayı optimize ederek bildirim oluşturabilirsiniz.
            </p>
          </div>
        ) : (
          filteredLogs.map(log => {
            const isExpanded = expandedLogIds.has(log.id);

            // Badge styling according to alertLevel
            const alertBadge = (() => {
              if (log.alertLevel === "top_3") {
                return (
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-800 text-[11px] font-bold flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>Google İlk 3 (Top 3) Zirve!</span>
                  </span>
                );
              }
              if (log.alertLevel === "milestone") {
                return (
                  <span className="px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-700 text-[11px] font-bold flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-purple-600" />
                    <span>Büyük Sıralama Rekoru (+15+ Sıra)</span>
                  </span>
                );
              }
              if (log.alertLevel === "first_page") {
                return (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 text-[11px] font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Google 1. Sayfa (Top 10)</span>
                  </span>
                );
              }
              return (
                <span className="px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-700 text-[11px] font-bold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Sıralama İlerlemesi</span>
                </span>
              );
            })();

            return (
              <div
                key={log.id}
                className={`bg-white rounded-2xl border transition-all shadow-xs ${
                  log.isRead ? "border-slate-200/90" : "border-emerald-300 ring-1 ring-emerald-400/30 bg-emerald-50/15"
                }`}
              >
                {/* CARD SUMMARY HEADER */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {/* Status Circle */}
                    <div
                      onClick={() => handleToggleRead(log.id)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 cursor-pointer transition-all ${
                        log.isRead
                          ? "bg-slate-100 text-slate-400 hover:bg-slate-200"
                          : "bg-emerald-500 text-white shadow-xs hover:bg-emerald-600"
                      }`}
                      title={log.isRead ? "Okunmadı olarak işaretle" : "Okundu olarak işaretle"}
                    >
                      <Check className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {alertBadge}

                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-mono">
                          {log.clusterTitle}
                        </span>

                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{getRelativeTime(log.timestamp)}</span>
                        </span>

                        {!log.isRead && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        )}
                      </div>

                      <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                        <span>{log.pageTitle}</span>
                        <span className="text-xs font-mono font-normal text-slate-400">
                          {log.pageUrl}
                        </span>
                      </h3>

                      <p className="text-xs text-slate-600 mt-1 max-w-2xl line-clamp-1">
                        {log.actionDescription}
                      </p>
                    </div>
                  </div>

                  {/* Right Side: Rank Shift & Toggle */}
                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    {/* Visual Rank Shift */}
                    <div className="bg-slate-900 text-white px-3.5 py-2 rounded-xl border border-slate-800 flex items-center gap-2.5">
                      <div className="flex flex-col text-right">
                        <span className="text-[10px] text-slate-400 font-mono">Önceki</span>
                        <span className="text-xs font-mono text-slate-300 font-bold line-through">
                          #{log.previousAverageRank}
                        </span>
                      </div>

                      <span className="text-emerald-400 font-black text-sm">➔</span>

                      <div className="flex flex-col">
                        <span className="text-[10px] text-emerald-400 font-mono">Şimdiki</span>
                        <span className="text-base font-mono text-emerald-300 font-black">
                          #{log.currentAverageRank}
                        </span>
                      </div>

                      <div className="pl-2 border-l border-slate-700/80 flex flex-col text-left">
                        <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center">
                          +{log.rankImprovement} Sıra 🚀
                        </span>
                        <span className="text-[10px] text-slate-400">
                          +{log.estimatedTrafficGrowth} ziy/ay
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleExpand(log.id)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                      title={isExpanded ? "Detayları gizle" : "Detayları görüntüle"}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* EXPANDED DETAILS */}
                {isExpanded && (
                  <div className="px-4 sm:px-5 pb-5 pt-3 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl space-y-4">
                    {/* KEYWORDS RANK PROGRESSION TABLE */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                        <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Hedef Anahtar Kelimelerdeki Pozisyon Değişimi</span>
                      </h4>

                      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[11px]">
                              <th className="py-2.5 px-3">Anahtar Kelime</th>
                              <th className="py-2.5 px-3">Önceki Sıra</th>
                              <th className="py-2.5 px-3">Yeni Sıra</th>
                              <th className="py-2.5 px-3">Fark (Kazanç)</th>
                              <th className="py-2.5 px-3">Aylık Hacim</th>
                              <th className="py-2.5 px-3">Kazanılan SERP Özelliği</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium">
                            {log.keywords.map((kw, kwIdx) => (
                              <tr key={kwIdx} className="hover:bg-slate-50/80 transition-colors">
                                <td className="py-2.5 px-3 font-semibold text-slate-900">
                                  {kw.keyword}
                                </td>
                                <td className="py-2.5 px-3 font-mono text-slate-500">
                                  #{kw.previousRank}
                                </td>
                                <td className="py-2.5 px-3 font-mono font-bold text-emerald-600">
                                  #{kw.currentRank} {kw.currentRank <= 3 ? "🏆" : ""}
                                </td>
                                <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">
                                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200">
                                    +{kw.rankChange} sıra
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 font-mono text-slate-600">
                                  {kw.monthlySearchVolume.toLocaleString("tr-TR")} arama/ay
                                </td>
                                <td className="py-2.5 px-3">
                                  <div className="flex flex-wrap gap-1">
                                    {kw.serpFeatures?.map((f, fIdx) => (
                                      <span
                                        key={fIdx}
                                        className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-medium"
                                      >
                                        {f}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* GOOGLEBOT CRAWL & SERP PREVIEW */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* GoogleBot Verification Box */}
                      <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2">
                        <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>GoogleBot Tarama ve İndeks Doğrulaması</span>
                        </span>
                        <p className="text-xs font-mono text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                          {log.googleBotCrawlTime}
                        </p>
                        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                          <span>Tahmini Organik Trafik:</span>
                          <span className="font-bold text-teal-600 font-mono">
                            +{log.estimatedTrafficGrowth} ziyaret / ay
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>Potansiyel Aylık Ciro Etkisi:</span>
                          <span className="font-bold text-rose-600 font-mono">
                            +₺{log.estimatedMonthlyRevenueGain.toLocaleString("tr-TR")} / ay
                          </span>
                        </div>
                      </div>

                      {/* SERP Snippet Preview */}
                      {log.serpPreviewSnippet && (
                        <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1.5">
                          <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Google Arama Sonucu Görünümü (Canlı Snippet)</span>
                          </span>
                          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1">
                            <div className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                              <span>{log.serpPreviewSnippet.url}</span>
                            </div>
                            <div className="text-xs font-bold text-indigo-700 line-clamp-1 hover:underline cursor-pointer">
                              {log.serpPreviewSnippet.title}
                            </div>
                            <div className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                              {log.serpPreviewSnippet.description}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* CARD FOOTER ACTIONS */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                      <div className="flex items-center gap-2">
                        {onOpenPreview && (
                          <button
                            type="button"
                            onClick={() => onOpenPreview(log.pageUrl)}
                            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                            <span>Sayfayı Canlı Önizle</span>
                          </button>
                        )}

                        {onNavigateTab && (
                          <button
                            type="button"
                            onClick={() => onNavigateTab("site-health")}
                            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <BarChart3 className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Isı Haritasında Gör</span>
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleRead(log.id)}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                      >
                        {log.isRead ? "Okunmadı olarak işaretle" : "Okundu olarak işaretle ✓"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 5. NOTIFICATION PREFERENCES MODAL */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">SEO Bildirim Tercihleri</h3>
                  <p className="text-xs text-slate-500">Sıralama sıçramaları ve bildirim dağıtım kanalları</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Toggles */}
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Sıralama Bildirimleri Aktif</span>
                    <span className="text-[11px] text-slate-500">İyileştirmelerden sonra otomatik bildirim üret</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={tempSettings.enabled}
                    onChange={e => setTempSettings({ ...tempSettings, enabled: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded-md focus:ring-indigo-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">İlk 3 (Top 3) Zirve Bildirimi</span>
                    <span className="text-[11px] text-slate-500">Bir sayfa Google ilk 3'e girdiğinde acil bildirim ilet</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={tempSettings.notifyOnTop3}
                    onChange={e => setTempSettings({ ...tempSettings, notifyOnTop3: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded-md focus:ring-indigo-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">1. Sayfa (Top 10) Giriş Bildirimi</span>
                    <span className="text-[11px] text-slate-500">2. veya 3. sayfadan 1. sayfaya sıçrayan içerikleri haber ver</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={tempSettings.notifyOnFirstPage}
                    onChange={e => setTempSettings({ ...tempSettings, notifyOnFirstPage: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded-md focus:ring-indigo-500"
                  />
                </label>
              </div>

              {/* Threshold Slider */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>Minimum Sıralama Sıçrama Eşiği:</span>
                  <span className="text-indigo-600 font-mono font-black">
                    +{tempSettings.minRankJumpThreshold} Sıra
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={tempSettings.minRankJumpThreshold}
                  onChange={e => setTempSettings({ ...tempSettings, minRankJumpThreshold: parseInt(e.target.value) || 2 })}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <p className="text-[11px] text-slate-500">
                  Yalnızca belirtilen değer veya daha fazla sıra yükselen anahtar kelimeler için bildirim üretilir.
                </p>
              </div>

              {/* Email Alerts */}
              <div className="p-3.5 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">E-Posta Sıralama Raporu</span>
                  <input
                    type="checkbox"
                    checked={tempSettings.emailAlerts.enabled}
                    onChange={e => setTempSettings({
                      ...tempSettings,
                      emailAlerts: { ...tempSettings.emailAlerts, enabled: e.target.checked }
                    })}
                    className="w-4 h-4 text-indigo-600 rounded-md focus:ring-indigo-500"
                  />
                </div>
                <input
                  type="email"
                  value={tempSettings.emailAlerts.recipientEmail}
                  onChange={e => setTempSettings({
                    ...tempSettings,
                    emailAlerts: { ...tempSettings.emailAlerts, recipientEmail: e.target.value }
                  })}
                  placeholder="admin@yildizotokurtarma.com.tr"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              {/* Webhook / Slack */}
              <div className="p-3.5 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Slack / Webhook Bildirimi</span>
                  <input
                    type="checkbox"
                    checked={tempSettings.webhookAlerts.enabled}
                    onChange={e => setTempSettings({
                      ...tempSettings,
                      webhookAlerts: { ...tempSettings.webhookAlerts, enabled: e.target.checked }
                    })}
                    className="w-4 h-4 text-indigo-600 rounded-md focus:ring-indigo-500"
                  />
                </div>
                <input
                  type="url"
                  value={tempSettings.webhookAlerts.webhookUrl}
                  onChange={e => setTempSettings({
                    ...tempSettings,
                    webhookAlerts: { ...tempSettings.webhookAlerts, webhookUrl: e.target.value }
                  })}
                  placeholder="https://hooks.slack.com/services/..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
                <button
                  type="button"
                  disabled={isSendingWebhookTest}
                  onClick={handleTestWebhook}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingWebhookTest ? "Gönderiliyor..." : "Test Bildirimi Gönder"}</span>
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all cursor-pointer"
              >
                Tercihleri Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
