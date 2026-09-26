import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  SiteConfig, 
  CustomerPanelTab, 
  SeoCompetitiveAlert, 
  SeoCompetitiveAlertSettings,
  CompetitiveAlertSummary
} from "../../types";
import { 
  loadCompetitiveAlerts,
  saveCompetitiveAlerts,
  loadCompetitiveAlertSettings,
  saveCompetitiveAlertSettings,
  markAlertAsRead,
  markAllAlertsAsRead,
  markAlertAsResolved,
  dismissAlert,
  calculateAlertSummary,
  playAlertChime,
  triggerBrowserPushNotification,
  requestBrowserNotificationPermission,
  getNotificationPermission,
  simulateRankingShift,
  simulateVolumeSpikeAlert,
  dispatchCompetitiveAlertNotification,
  evaluateCompetitiveRankings
} from "../../utils/seoCompetitiveAlertEngine";
import { CompetitiveAlertToast } from "./CompetitiveAlertToast";
import { SeoCompetitiveAlertConfigPanel } from "./SeoCompetitiveAlertConfigPanel";
import { 
  Bell, 
  BellRing, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Check, 
  CheckCircle2, 
  Sparkles, 
  RefreshCw, 
  Settings, 
  X, 
  ShieldAlert, 
  ShieldCheck, 
  Flame, 
  SlidersHorizontal, 
  ArrowRight, 
  Volume2, 
  VolumeX, 
  Filter, 
  ChevronRight, 
  Info, 
  Target, 
  Zap, 
  Building2, 
  Clock, 
  Radio, 
  Search,
  Activity,
  ArrowUpRight,
  BarChart3,
  ExternalLink,
  FileDown
} from "lucide-react";

export interface SeoCompetitiveAlertModuleProps {
  config: SiteConfig;
  onNavigateTab?: (tab: string) => void;
  onSendToAiBlog?: (keyword: string, draftTitle?: string) => void;
  isCompact?: boolean;
  onDownloadPdf?: () => void;
}

export const SeoCompetitiveAlertModule: React.FC<SeoCompetitiveAlertModuleProps> = ({
  config,
  onNavigateTab,
  onSendToAiBlog,
  isCompact = false,
  onDownloadPdf
}) => {
  // 1. Alerts & Settings State
  const [alerts, setAlerts] = useState<SeoCompetitiveAlert[]>(() => loadCompetitiveAlerts(config));
  const [settings, setSettings] = useState<SeoCompetitiveAlertSettings>(() => loadCompetitiveAlertSettings());
  
  // 2. UI & Filter State
  const [activeFilter, setActiveFilter] = useState<"all" | "volume_spike" | "critical" | "warning" | "opportunity" | "resolved">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "unsupported">(() => getNotificationPermission());
  
  // 3. Active Toast & Banner
  const [activeToastAlert, setActiveToastAlert] = useState<SeoCompetitiveAlert | null>(null);
  const [statusNotice, setStatusNotice] = useState<{ type: "success" | "info" | "warning"; message: string } | null>(null);

  // Sync summary metrics
  const summary: CompetitiveAlertSummary = useMemo(() => {
    return calculateAlertSummary(alerts, config);
  }, [alerts, config]);

  // Find max volume spike if available
  const topVolumeSpikeAlert = useMemo(() => {
    const spikeAlerts = alerts.filter(a => a.category === "volume_spike" && a.volumeChangePercentage);
    if (spikeAlerts.length === 0) return null;
    return spikeAlerts.reduce((max, curr) => 
      (curr.volumeChangePercentage || 0) > (max.volumeChangePercentage || 0) ? curr : max
    , spikeAlerts[0]);
  }, [alerts]);

  // Update Settings
  const handleUpdateSettings = (newSettings: Partial<SeoCompetitiveAlertSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveCompetitiveAlertSettings(updated);
    setStatusNotice({ type: "success", message: "Alarm ayarları güncellendi ve kaydedildi." });
    setTimeout(() => setStatusNotice(null), 3000);
  };

  // Request browser notification permission
  const handleRequestPermission = async () => {
    const permission = await requestBrowserNotificationPermission();
    setNotificationPermission(permission);
    if (permission === "granted") {
      setStatusNotice({ type: "success", message: "Masaüstü bildirim izinleri onaylandı! Ani hacim değişimlerinde anlık bildirim alacaksınız." });
      handleUpdateSettings({ browserPushEnabled: true });
    } else if (permission === "denied") {
      setStatusNotice({ type: "warning", message: "Masaüstü bildirimleri tarayıcı ayarlarından engellendi." });
    }
    setTimeout(() => setStatusNotice(null), 4500);
  };

  // Dispatch full alert notification (Sound + Toast + Browser Push)
  const dispatchAlert = useCallback(async (alert: SeoCompetitiveAlert) => {
    if (settings.audioCueEnabled) {
      playAlertChime();
    }
    if (settings.inAppToastEnabled) {
      setActiveToastAlert(alert);
    }
    if (settings.browserPushEnabled) {
      await triggerBrowserPushNotification(alert);
    }
  }, [settings]);

  // Real-time Sudden Volume Spike Simulation
  const handleTriggerVolumeSpikeSimulation = async () => {
    setIsScanning(true);
    setStatusNotice(null);

    setTimeout(async () => {
      const { newAlert, updatedAlerts } = simulateVolumeSpikeAlert(config, alerts);
      setAlerts(updatedAlerts);
      setIsScanning(false);

      await dispatchAlert(newAlert);

      setStatusNotice({ 
        type: "success", 
        message: `🚨 [ANİ HACİM ALARMI] "${newAlert.competitorName}" için "${newAlert.keyword}" kelimesinde +%${newAlert.volumeChangePercentage} hacim patlaması tespit edildi!` 
      });
      setTimeout(() => setStatusNotice(null), 6000);
    }, 1000);
  };

  // Immediate Test Notification
  const handleSendTestNotification = async () => {
    const testAlert: SeoCompetitiveAlert = alerts[0] || {
      id: `test-${Date.now()}`,
      keyword: `${config.sector || 'Hizmet'} Fiyatları`,
      monthlyVolume: "6.2K / ay",
      previousMonthlyVolume: "2.8K / ay",
      volumeChangePercentage: 121,
      volatilityLevel: "extreme",
      searchIntent: "Ticari",
      competitorName: "Örnek Lider Rakip",
      userRank: 4,
      competitorRank: 1,
      rankDelta: 3,
      severity: "critical",
      category: "volume_spike",
      title: "🔔 [TEST BİLDİRİMİ] Rakip kelimesinde +%121 ani hacim patlaması!",
      description: "SEO Rekabet Alarmı sistemi sorunsuz çalışıyor. Sesli ve masaüstü bildiriminiz başarıyla iletildi.",
      trafficLossEstimate: "Test Alarmı",
      detectedAt: new Date().toISOString(),
      isRead: false,
      status: "active",
      rootCause: "Test senaryosu",
      recommendedAction: {
        type: "blog",
        label: "Test Aksiyonu",
        description: "Test amaçlı tetiklendi"
      }
    };

    await dispatchAlert(testAlert);
    setStatusNotice({ type: "success", message: "🔔 Test bildirimi ve sesli uyarı başarıyla gönderildi!" });
    setTimeout(() => setStatusNotice(null), 4000);
  };

  // Full Live SERP & Volume Re-scan
  const handleRescanSerp = () => {
    setIsScanning(true);
    setStatusNotice(null);

    setTimeout(() => {
      const freshAlerts = evaluateCompetitiveRankings(config, undefined, undefined, settings);
      setAlerts(freshAlerts);
      saveCompetitiveAlerts(freshAlerts);
      setIsScanning(false);
      setStatusNotice({ type: "info", message: `Canlı SERP taraması tamamlandı: ${freshAlerts.length} aktif rekabet ve hacim durumu senkronize edildi.` });
      setTimeout(() => setStatusNotice(null), 4000);
    }, 1300);
  };

  // Mark single as read
  const handleMarkAsRead = (id: string) => {
    setAlerts(prev => markAlertAsRead(prev, id));
  };

  // Mark all as read
  const handleMarkAllRead = () => {
    setAlerts(prev => markAllAlertsAsRead(prev));
    setStatusNotice({ type: "info", message: "Tüm alarmlar okundu olarak işaretlendi." });
    setTimeout(() => setStatusNotice(null), 3000);
  };

  // Mark resolved
  const handleResolve = (id: string) => {
    setAlerts(prev => markAlertAsResolved(prev, id));
    setStatusNotice({ type: "success", message: "Alarm çözüldü olarak arşivlendi." });
    setTimeout(() => setStatusNotice(null), 3000);
  };

  // Dismiss
  const handleDismiss = (id: string) => {
    setAlerts(prev => dismissAlert(prev, id));
  };

  // Execute recommended counter-action
  const handleExecuteAction = (alert: SeoCompetitiveAlert) => {
    handleMarkAsRead(alert.id);

    if (alert.recommendedAction.type === "blog") {
      if (onSendToAiBlog && alert.recommendedAction.prefillKeyword) {
        onSendToAiBlog(alert.recommendedAction.prefillKeyword, alert.recommendedAction.prefillDraftTitle);
        return;
      }
      if (onNavigateTab) {
        onNavigateTab("ai-blog-engine");
        return;
      }
    }

    if (alert.recommendedAction.targetTab && onNavigateTab) {
      onNavigateTab(alert.recommendedAction.targetTab);
    }
  };

  // Filtered alerts list
  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      // Status filter
      if (activeFilter === "resolved") {
        if (a.status !== "resolved") return false;
      } else {
        if (a.status !== "active") return false;
        if (activeFilter === "volume_spike" && a.category !== "volume_spike") return false;
        if (activeFilter === "critical" && a.severity !== "critical") return false;
        if (activeFilter === "warning" && a.severity !== "warning") return false;
        if (activeFilter === "opportunity" && a.severity !== "opportunity") return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesKeyword = a.keyword.toLowerCase().includes(q);
        const matchesCompetitor = a.competitorName.toLowerCase().includes(q);
        const matchesTitle = a.title.toLowerCase().includes(q);
        if (!matchesKeyword && !matchesCompetitor && !matchesTitle) return false;
      }

      return true;
    });
  }, [alerts, activeFilter, searchQuery]);

  return (
    <div className="space-y-6" id="seo-competitive-alert-module-root">
      {/* 1. REAL-TIME MONITOR HEADER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              Canlı Hacim Dalgalanma Dedektörü Aktif
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-[11px] text-slate-300 font-mono border border-slate-700 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Oto-Kontrol: Her {settings.autoCheckIntervalHours} Saatte Bir</span>
            </span>
            {summary.unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-bold animate-pulse flex items-center gap-1.5">
                <BellRing className="w-3.5 h-3.5 text-rose-400" />
                <span>{summary.unreadCount} Okunmamış Alarm</span>
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2.5 text-white">
            <Flame className="w-6 h-6 text-amber-400" />
            <span>SEO Rekabet Alarmı</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Ani Hacim & Sıra İzleme
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Rakiplerinizin hedef anahtar kelimelerindeki ani arama hacmi sıçramaları (+%40+), 1. sıra gaspları ve trafik tehditleri tespit edildiğinde tarayıcınıza anlık masaüstü ve sesli bildirimler iletilir.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 self-start md:self-center">
          <button
            type="button"
            onClick={handleTriggerVolumeSpikeSimulation}
            disabled={isScanning}
            className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md active:scale-95 disabled:opacity-50"
            title="Rakiplerin hacimlerinde ani sıçrama gerçekleştiğinde sistemin nasıl uyarı verdiğini deneyimleyin"
          >
            <Zap className="w-4 h-4 text-white animate-bounce" />
            <span>⚡ Ani Hacim Değişimi Simüle Et</span>
          </button>

          <button
            type="button"
            onClick={handleSendTestNotification}
            className="px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-95"
            title="Masaüstü ve sesli bildirimleri test edin"
          >
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span>Test Bildirimi</span>
          </button>

          <button
            type="button"
            onClick={handleRescanSerp}
            disabled={isScanning}
            className="px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isScanning ? "animate-spin" : ""}`} />
            <span>{isScanning ? "Taranıyor..." : "Canlı Tara"}</span>
          </button>

          {onDownloadPdf && (
            <button
              type="button"
              id="alert-module-download-pdf-btn"
              onClick={onDownloadPdf}
              className="px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-sm active:scale-95 ring-1 ring-blue-400/30"
              title="Download comprehensive PDF report of competitor SEO radar data and alert logs"
            >
              <FileDown className="w-3.5 h-3.5 text-cyan-200" />
              <span>Download PDF</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              isSettingsOpen 
                ? "bg-indigo-600 border-indigo-500 text-white" 
                : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
            }`}
            title="Alarm Ayarlarını Yapılandır"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. OPTIONAL STATUS / SUCCESS NOTICE */}
      {statusNotice && (
        <div className={`p-4 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between gap-3 shadow-md transition-all ${
          statusNotice.type === "success" 
            ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
            : statusNotice.type === "warning"
            ? "bg-amber-50 text-amber-800 border border-amber-200"
            : "bg-blue-50 text-blue-800 border border-blue-200"
        }`}>
          <div className="flex items-center gap-2.5">
            {statusNotice.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
            {statusNotice.type === "warning" && <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />}
            {statusNotice.type === "info" && <Info className="w-5 h-5 text-blue-600 shrink-0" />}
            <span>{statusNotice.message}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setStatusNotice(null)} 
            className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. BROWSER PUSH PERMISSION PROMPT BANNER (IF NOT GRANTED) */}
      {notificationPermission !== "granted" && notificationPermission !== "unsupported" && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-600 shrink-0">
              <BellRing className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                Masaüstü Bildirimleri Henüz Aktif Değil
              </h4>
              <p className="text-xs text-amber-800/90 mt-0.5">
                Rakiplerin arama hacimlerinde ani patlama olduğunda sekme arka plandayken bile anlık uyarı alabilmek için tarayıcı bildirimlerine izin verin.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRequestPermission}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs cursor-pointer active:scale-95 shrink-0 flex items-center justify-center gap-1.5"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Masaüstü Bildirimlerini Etkinleştir</span>
          </button>
        </div>
      )}

      {/* 4. SETTINGS PANEL (IF OPEN) */}
      {isSettingsOpen && (
        <div className="animate-in fade-in duration-200">
          <SeoCompetitiveAlertConfigPanel
            config={config}
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            onSettingsSaved={(newSettings) => {
              setSettings(newSettings);
              setStatusNotice({ type: "success", message: "Alarm yapılandırma ayarları başarıyla kaydedildi." });
              setTimeout(() => setStatusNotice(null), 3000);
            }}
            onAlertTriggered={(newAlert) => setAlerts((prev) => [newAlert, ...prev])}
            mode="inline"
          />
        </div>
      )}

      {/* 5. METRIC KPI OVERVIEW CARDS (4 BENTO CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Active Volume & Rank Alerts */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Aktif Alarmlar</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <BellRing className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 flex items-baseline gap-2">
              <span>{summary.activeCount}</span>
              <span className="text-xs font-medium text-slate-500">alarm açık</span>
            </div>
            <p className="text-xs text-rose-600 font-semibold mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{summary.criticalCount} kritik müdahale gerektiriyor</span>
            </p>
          </div>
        </div>

        {/* KPI 2: Max Volume Spike Detected */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Maksimum Hacim Sıçraması</span>
            <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-orange-600 flex items-baseline gap-2">
              <span>+{topVolumeSpikeAlert ? topVolumeSpikeAlert.volumeChangePercentage : 146}%</span>
              <span className="text-xs font-medium text-slate-500">ani artış</span>
            </div>
            <p className="text-xs text-slate-600 mt-1 truncate" title={topVolumeSpikeAlert?.keyword || "Acil talep kelimesi"}>
              <span className="font-semibold text-slate-800">{topVolumeSpikeAlert ? topVolumeSpikeAlert.keyword : "En Yakın 7/24 Hizmet"}</span>
            </p>
          </div>
        </div>

        {/* KPI 3: Potential Traffic At Risk */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Risk Altındaki Trafik</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-rose-600">
              {summary.potentialTrafficAtRisk}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Rakiplerin öne geçtiği kelimelerdeki aylık kaçırılan potansiyel
            </p>
          </div>
        </div>

        {/* KPI 4: Push & Sound Alert Status */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bildirim Sistemi</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              {settings.audioCueEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${
                notificationPermission === "granted" && settings.browserPushEnabled ? "bg-emerald-500" : "bg-amber-500"
              }`} />
              <span className="text-sm font-bold text-slate-800">
                {notificationPermission === "granted" && settings.browserPushEnabled ? "Masaüstü & Ses Açık" : "Kısmi Bildirim"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center justify-between">
              <span>Ses: {settings.audioCueEnabled ? "Aktif" : "Kapalı"}</span>
              <button
                type="button"
                onClick={handleSendTestNotification}
                className="text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer"
              >
                Test Et
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* 6. FILTER TABS & SEARCH BAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeFilter === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Tüm Alarmlar ({alerts.filter(a => a.status === "active").length})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("volume_spike")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === "volume_spike"
                ? "bg-amber-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-amber-50 hover:text-amber-700"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>⚡ Ani Hacim Patlamaları ({alerts.filter(a => a.status === "active" && a.category === "volume_spike").length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("critical")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === "critical"
                ? "bg-rose-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-rose-50 hover:text-rose-700"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Kritik ({alerts.filter(a => a.status === "active" && a.severity === "critical").length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("opportunity")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === "opportunity"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
            }`}
          >
            <Target className="w-3.5 h-3.5 text-indigo-400" />
            <span>Fırsatlar ({alerts.filter(a => a.status === "active" && a.severity === "opportunity").length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("resolved")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === "resolved"
                ? "bg-emerald-700 text-white shadow-xs"
                : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Çözülenler ({alerts.filter(a => a.status === "resolved").length})</span>
          </button>
        </div>

        {/* Search & Bulk Read */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Kelime veya rakip ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
            />
          </div>

          {summary.unreadCount > 0 && activeFilter !== "resolved" && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg whitespace-nowrap cursor-pointer"
            >
              Tümünü Okundu Say
            </button>
          )}
        </div>
      </div>

      {/* 7. ALERTS LIST */}
      {filteredAlerts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-900">
            Bu filtrede herhangi bir alarm bulunamadı
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Rakipleriniz sıralama kazandığında veya anahtar kelime arama hacimlerinde ani patlama gerçekleştiğinde alarmlarınız burada listelenecektir.
          </p>
          <button
            type="button"
            onClick={handleTriggerVolumeSpikeSimulation}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs cursor-pointer inline-flex items-center gap-2 mt-2"
          >
            <Zap className="w-4 h-4" />
            <span>Örnek Ani Hacim Alarmı Oluştur</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => {
            const isSpike = alert.category === "volume_spike";
            const isResolved = alert.status === "resolved";

            return (
              <div
                key={alert.id}
                id={`alert-card-${alert.id}`}
                className={`bg-white border rounded-2xl p-5 transition-all shadow-2xs hover:shadow-md ${
                  !alert.isRead && !isResolved
                    ? isSpike 
                      ? "border-amber-400/80 bg-amber-500/[0.02]" 
                      : "border-rose-300 bg-rose-500/[0.02]"
                    : "border-slate-200"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left: Main Alert Content */}
                  <div className="space-y-3 flex-1">
                    {/* Top Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {isSpike ? (
                        <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 font-black text-[11px] flex items-center gap-1 border border-amber-300">
                          <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                          <span>ANİ HACİM PATLAMASI (+%{alert.volumeChangePercentage || 120})</span>
                        </span>
                      ) : alert.severity === "critical" ? (
                        <span className="px-2.5 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold text-[11px] flex items-center gap-1 border border-rose-200">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          <span>KRİTİK SIRALAMA GASPI</span>
                        </span>
                      ) : alert.severity === "warning" ? (
                        <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[11px] flex items-center gap-1 border border-amber-200">
                          <TrendingDown className="w-3.5 h-3.5 text-amber-600" />
                          <span>DİKKAT</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-bold text-[11px] flex items-center gap-1 border border-indigo-200">
                          <Target className="w-3.5 h-3.5 text-indigo-600" />
                          <span>İÇERİK BOŞLUĞU FIRSATI</span>
                        </span>
                      )}

                      <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px] border border-slate-200 flex items-center gap-1">
                        <Search className="w-3 h-3 text-slate-500" />
                        <span>{alert.keyword}</span>
                      </span>

                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium text-[10px]">
                        Niyet: {alert.searchIntent}
                      </span>

                      {alert.volatilityLevel === "extreme" && (
                        <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                          Aşırı Volatilite
                        </span>
                      )}

                      {!alert.isRead && !isResolved && (
                        <span className="h-2 w-2 rounded-full bg-rose-500" title="Okunmamış Alarm" />
                      )}
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <span>{alert.title}</span>
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                        {alert.description}
                      </p>
                    </div>

                    {/* Search Volume Volatility Sparkline & Metrics Bar */}
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Metric 1: Volume Shift */}
                      <div>
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                          Aylık Arama Hacmi Değişimi
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-sm font-semibold text-slate-400 line-through">
                            {alert.previousMonthlyVolume || "2.4K / ay"}
                          </span>
                          <span className="text-sm text-slate-400">➔</span>
                          <span className="text-sm font-black text-slate-900">
                            {alert.currentMonthlyVolume || alert.monthlyVolume}
                          </span>
                          {alert.volumeChangePercentage && (
                            <span className="text-xs font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                              +{alert.volumeChangePercentage}%
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Metric 2: Competitor vs User Rank */}
                      <div>
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                          Sıralama Durumu
                        </span>
                        <div className="flex items-center gap-2 mt-0.5 text-xs font-semibold">
                          <span className="text-slate-800">
                            Rakip: <strong className="text-indigo-600">#{alert.competitorRank}</strong>
                          </span>
                          <span className="text-slate-300">|</span>
                          <span className="text-slate-800">
                            Siteniz: <strong className={alert.userRank && alert.userRank <= 3 ? "text-emerald-600" : "text-rose-600"}>
                              {alert.userRank ? `#${alert.userRank}` : "İlk 20 Dışı"}
                            </strong>
                          </span>
                        </div>
                      </div>

                      {/* Metric 3: Estimated Impact */}
                      <div>
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                          Tahmini Trafik Etkisi
                        </span>
                        <span className="text-xs font-bold text-rose-600 mt-0.5 block">
                          {alert.trafficLossEstimate}
                        </span>
                      </div>
                    </div>

                    {/* Root cause analysis */}
                    <div className="flex items-start gap-2 text-xs text-slate-600 bg-slate-100/70 p-2.5 rounded-lg">
                      <Info className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <strong className="text-slate-800">Algoritmik Kök Neden: </strong>
                        <span>{alert.rootCause}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Counter-Action & Status Controls */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-stretch gap-2 shrink-0 lg:w-56 pt-2 lg:pt-0">
                    <button
                      type="button"
                      onClick={() => handleExecuteAction(alert)}
                      className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      <Sparkles className="w-4 h-4 text-indigo-200" />
                      <span>{alert.recommendedAction.label}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {!alert.isRead && !isResolved && (
                        <button
                          type="button"
                          onClick={() => handleMarkAsRead(alert.id)}
                          className="flex-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors text-center cursor-pointer"
                        >
                          Okundu
                        </button>
                      )}

                      {!isResolved ? (
                        <button
                          type="button"
                          onClick={() => handleResolve(alert.id)}
                          className="flex-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors text-center cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Çözüldü</span>
                        </button>
                      ) : (
                        <span className="flex-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-emerald-100 text-emerald-800 text-center flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Çözümlendi</span>
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDismiss(alert.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Alarmı Kapat"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <span className="text-[10px] text-slate-400 text-center block mt-1">
                      Tespit: {new Date(alert.detectedAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 8. ACTIVE REAL-TIME TOAST BANNER */}
      {activeToastAlert && (
        <CompetitiveAlertToast
          alert={activeToastAlert}
          onClose={() => setActiveToastAlert(null)}
          onActionClick={(alert) => {
            handleExecuteAction(alert);
            setActiveToastAlert(null);
          }}
        />
      )}
    </div>
  );
};
