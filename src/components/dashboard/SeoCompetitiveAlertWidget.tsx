import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { 
  SiteConfig, 
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
  simulateDomainAuthorityAlert,
  simulateTrafficVolumeAlert,
  dispatchCompetitiveAlertNotification,
  evaluateCompetitiveRankings
} from "../../utils/seoCompetitiveAlertEngine";
import { SeoCompetitiveAlertConfigPanel } from "./SeoCompetitiveAlertConfigPanel";
import { 
  Bell, 
  BellRing, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  Sparkles, 
  RefreshCw, 
  Settings, 
  X, 
  Check, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  Radio, 
  Search, 
  SlidersHorizontal, 
  ArrowRight, 
  ArrowUpRight, 
  ExternalLink, 
  FileDown, 
  Clock, 
  Zap, 
  ShieldAlert, 
  Flame, 
  Building2, 
  Info,
  ChevronRight,
  Filter,
  Activity
} from "lucide-react";

export interface SeoCompetitiveAlertWidgetProps {
  config: SiteConfig;
  onNavigateTab?: (tab: string) => void;
  onSendToAiBlog?: (keyword: string, draftTitle?: string) => void;
  onDownloadPdf?: () => void;
  onAlertTriggered?: (alert: SeoCompetitiveAlert) => void;
  className?: string;
  isCompact?: boolean;
}

export const SeoCompetitiveAlertWidget: React.FC<SeoCompetitiveAlertWidgetProps> = ({
  config,
  onNavigateTab,
  onSendToAiBlog,
  onDownloadPdf,
  onAlertTriggered,
  className = "",
  isCompact = false
}) => {
  // 1. Alerts & Settings State
  const [alerts, setAlerts] = useState<SeoCompetitiveAlert[]>(() => loadCompetitiveAlerts(config));
  const [settings, setSettings] = useState<SeoCompetitiveAlertSettings>(() => loadCompetitiveAlertSettings());
  
  // 2. Real-time Tracking Engine State
  const [isLiveTracking, setIsLiveTracking] = useState<boolean>(true);
  const [trackingIntervalSeconds, setTrackingIntervalSeconds] = useState<number>(30);
  const [secondsUntilNextCheck, setSecondsUntilNextCheck] = useState<number>(30);
  const [lastCheckTimestamp, setLastCheckTimestamp] = useState<string>("Az önce");
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "unsupported">(() => getNotificationPermission());
  
  // 3. UI Filters & Panels
  const [activeFilter, setActiveFilter] = useState<"all" | "volume_spike" | "critical" | "warning" | "opportunity" | "unread">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [statusNotice, setStatusNotice] = useState<{ type: "success" | "info" | "warning"; message: string } | null>(null);

  // Sync summary KPI metrics
  const summary: CompetitiveAlertSummary = useMemo(() => {
    return calculateAlertSummary(alerts, config);
  }, [alerts, config]);

  // Request browser Web Push notification permissions
  const handleRequestPushPermission = async () => {
    const permission = await requestBrowserNotificationPermission();
    setNotificationPermission(permission);
    if (permission === "granted") {
      const updated = { ...settings, browserPushEnabled: true };
      setSettings(updated);
      saveCompetitiveAlertSettings(updated);
      setStatusNotice({ 
        type: "success", 
        message: "Masaüstü bildirim izinleri aktifleştirildi! Rakip sıralama değişimlerinde anlık push uyarısı alacaksınız." 
      });
    } else if (permission === "denied") {
      setStatusNotice({ 
        type: "warning", 
        message: "Masaüstü bildirimleri tarayıcı izinleriniz tarafından engellenmiş durumda." 
      });
    }
    setTimeout(() => setStatusNotice(null), 4000);
  };

  // Toggle Sound Cue
  const handleToggleSound = () => {
    const nextVal = !settings.audioCueEnabled;
    const updated = { ...settings, audioCueEnabled: nextVal };
    setSettings(updated);
    saveCompetitiveAlertSettings(updated);
    if (nextVal) {
      playAlertChime();
      setStatusNotice({ type: "info", message: "Sesli SEO bildirim melodisi aktifleştirildi (test sesi çalındı)." });
    } else {
      setStatusNotice({ type: "info", message: "Sesli bildirim uyarısı kapatıldı." });
    }
    setTimeout(() => setStatusNotice(null), 3000);
  };

  // Central Dispatch Method: plays sound, triggers native push, and notifies parent Strategic Analysis view
  const dispatchAlertNotification = useCallback(async (newAlert: SeoCompetitiveAlert) => {
    if (settings.audioCueEnabled) {
      playAlertChime();
    }
    if (settings.browserPushEnabled) {
      await triggerBrowserPushNotification(newAlert);
    }
    // Propagate to parent Strategic Analysis view so it displays the floating push toast
    if (onAlertTriggered) {
      onAlertTriggered(newAlert);
    }
  }, [settings, onAlertTriggered]);

  // Real-time Background Tracking Timer
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isLiveTracking) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setSecondsUntilNextCheck(trackingIntervalSeconds);

    timerRef.current = setInterval(() => {
      setSecondsUntilNextCheck(prev => {
        if (prev <= 1) {
          // Trigger automated simulated ranking monitor check
          performBackgroundRankCheck();
          return trackingIntervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLiveTracking, trackingIntervalSeconds, alerts, config, dispatchAlertNotification]);

  // Perform a background real-time check cycle
  const performBackgroundRankCheck = useCallback(() => {
    // 50% probability of picking volume spike vs ranking shift
    const isVolumeSurge = Math.random() > 0.5;
    
    if (isVolumeSurge) {
      const { newAlert, updatedAlerts } = simulateVolumeSpikeAlert(config, alerts);
      setAlerts(updatedAlerts);
      dispatchAlertNotification(newAlert);
    } else {
      const { newAlert, updatedAlerts } = simulateRankingShift(config, alerts);
      setAlerts(updatedAlerts);
      dispatchAlertNotification(newAlert);
    }

    setLastCheckTimestamp(new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
  }, [config, alerts, dispatchAlertNotification]);

  // Manual Trigger: Immediate Competitor Rank Shift
  const handleTriggerRankShift = async () => {
    setIsScanning(true);
    setStatusNotice(null);

    setTimeout(async () => {
      const { newAlert, updatedAlerts } = simulateRankingShift(config, alerts);
      setAlerts(updatedAlerts);
      setIsScanning(false);
      setLastCheckTimestamp(new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));

      await dispatchAlertNotification(newAlert);

      setStatusNotice({
        type: "success",
        message: `🚨 [CANLI SERP ALARMI] "${newAlert.competitorName}", "${newAlert.keyword}" kelimesinde #1. sıraya oturdu! Bildirim Strategic Analysis paneline iletildi.`
      });
      setTimeout(() => setStatusNotice(null), 5000);
    }, 900);
  };

  // Manual Trigger: Immediate Search Volume Spike
  const handleTriggerVolumeSpike = async () => {
    setIsScanning(true);
    setStatusNotice(null);

    setTimeout(async () => {
      const { newAlert, updatedAlerts } = simulateVolumeSpikeAlert(config, alerts);
      setAlerts(updatedAlerts);
      setIsScanning(false);
      setLastCheckTimestamp(new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));

      await dispatchAlertNotification(newAlert);

      setStatusNotice({
        type: "success",
        message: `⚡ [HACİM PATLAMASI] "${newAlert.keyword}" teriminde +%${newAlert.volumeChangePercentage} talep artışı tespit edildi!`
      });
      setTimeout(() => setStatusNotice(null), 5000);
    }, 900);
  };

  // Manual Trigger: Immediate Competitor Domain Authority (DA) Shift Alert
  const handleTriggerDaShift = async () => {
    setIsScanning(true);
    setStatusNotice(null);

    setTimeout(async () => {
      const { newAlert, updatedAlerts } = simulateDomainAuthorityAlert(config, alerts, settings);
      setAlerts(updatedAlerts);
      setIsScanning(false);
      setLastCheckTimestamp(new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));

      await dispatchAlertNotification(newAlert);
      if (onAlertTriggered) onAlertTriggered(newAlert);

      setStatusNotice({
        type: "success",
        message: `🛡️ [DOMAİN OTORİTESİ ALARMI] "${newAlert.competitorName}" DA değeri güncellendi (DA ${newAlert.previousCompetitorDa} -> ${newAlert.competitorDa})! Bildirim iletildi.`
      });
      setTimeout(() => setStatusNotice(null), 5000);
    }, 800);
  };

  // Manual Trigger: Immediate Competitor Organic Traffic Volume Surge Alert
  const handleTriggerTrafficShift = async () => {
    setIsScanning(true);
    setStatusNotice(null);

    setTimeout(async () => {
      const { newAlert, updatedAlerts } = simulateTrafficVolumeAlert(config, alerts, settings);
      setAlerts(updatedAlerts);
      setIsScanning(false);
      setLastCheckTimestamp(new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));

      await dispatchAlertNotification(newAlert);
      if (onAlertTriggered) onAlertTriggered(newAlert);

      setStatusNotice({
        type: "success",
        message: `⚡ [TRAFİK HACMİ PATLAMASI] "${newAlert.competitorName}" aylık organik trafiğinde %${newAlert.volumeChangePercentage} artış tespit edildi!`
      });
      setTimeout(() => setStatusNotice(null), 5000);
    }, 800);
  };

  // Manual Trigger: Instant Push Test
  const handleSendTestPush = async () => {
    const testAlert: SeoCompetitiveAlert = alerts[0] || {
      id: `test-push-${Date.now()}`,
      keyword: `${config.sector || 'Hizmet'} Fiyatları 2026`,
      monthlyVolume: "5.8K / ay",
      previousMonthlyVolume: "2.4K / ay",
      volumeChangePercentage: 142,
      volatilityLevel: "extreme",
      searchIntent: "Ticari",
      competitorName: "Pazar Lideri Rakip",
      userRank: 4,
      competitorRank: 1,
      rankDelta: 3,
      severity: "critical",
      category: "volume_spike",
      title: "🔔 [TEST PUSH BİLDİRİMİ] Rakip kelimesinde ani sıralama ve hacim değişimi!",
      description: "SEO Competitive Alert izleyicisi sorunsuz çalışıyor. Sesli melodi ve anlık push bildirimi Strategic Analysis görünümüne gönderildi.",
      trafficLossEstimate: "-420 Tıklama Riski",
      detectedAt: new Date().toISOString(),
      isRead: false,
      status: "active",
      rootCause: "Canlı SERP izleme mekanizması doğrulandı.",
      recommendedAction: {
        type: "blog",
        label: "AI Karşı Blog Üret",
        description: "Test aksiyonu başarıyla tetiklendi."
      }
    };

    await dispatchAlertNotification(testAlert);
    setStatusNotice({ type: "success", message: "🔔 Test bildirimi ve sesli uyarı Strategic Analysis görünümüne iletildi!" });
    setTimeout(() => setStatusNotice(null), 4000);
  };

  // Rescan all keywords against SERP
  const handleRescanSerp = () => {
    setIsScanning(true);
    setStatusNotice(null);

    setTimeout(() => {
      const freshAlerts = evaluateCompetitiveRankings(config, undefined, undefined, settings);
      setAlerts(freshAlerts);
      saveCompetitiveAlerts(freshAlerts);
      setIsScanning(false);
      setLastCheckTimestamp(new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setStatusNotice({ 
        type: "info", 
        message: `Canlı SERP taraması tamamlandı: ${freshAlerts.length} rekabet durumu güncellendi.` 
      });
      setTimeout(() => setStatusNotice(null), 4000);
    }, 1200);
  };

  // Item Management
  const handleMarkAsRead = (id: string) => {
    setAlerts(prev => markAlertAsRead(prev, id));
  };

  const handleMarkAllRead = () => {
    setAlerts(prev => markAllAlertsAsRead(prev));
    setStatusNotice({ type: "info", message: "Tüm alarmlar okundu olarak işaretlendi." });
    setTimeout(() => setStatusNotice(null), 3000);
  };

  const handleResolve = (id: string) => {
    setAlerts(prev => markAlertAsResolved(prev, id));
    setStatusNotice({ type: "success", message: "Alarm çözümlendi olarak arşivlendi." });
    setTimeout(() => setStatusNotice(null), 3000);
  };

  const handleDismiss = (id: string) => {
    setAlerts(prev => dismissAlert(prev, id));
  };

  // Execute Recommended Tactical Action
  const handleExecuteAction = (alert: SeoCompetitiveAlert) => {
    handleMarkAsRead(alert.id);

    if (alert.recommendedAction.type === "blog") {
      if (onSendToAiBlog && alert.recommendedAction.prefillKeyword) {
        onSendToAiBlog(alert.recommendedAction.prefillKeyword, alert.recommendedAction.prefillDraftTitle);
        return;
      }
      if (onNavigateTab) {
        onNavigateTab("customer-panel");
        return;
      }
    }

    if (onNavigateTab) {
      onNavigateTab(alert.recommendedAction.targetTab || "customer-panel");
    }
  };

  // Filtered Alert List
  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      // 1. Text Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesKeyword = a.keyword.toLowerCase().includes(q);
        const matchesComp = a.competitorName.toLowerCase().includes(q) || a.competitorDomain.toLowerCase().includes(q);
        const matchesTitle = a.title.toLowerCase().includes(q);
        if (!matchesKeyword && !matchesComp && !matchesTitle) return false;
      }

      // 2. Tab Filter
      if (activeFilter === "volume_spike") return a.category === "volume_spike";
      if (activeFilter === "critical") return a.severity === "critical";
      if (activeFilter === "warning") return a.severity === "warning";
      if (activeFilter === "opportunity") return a.severity === "opportunity" || a.category === "high_volume_threat";
      if (activeFilter === "unread") return !a.isRead && a.status === "active";

      return true;
    });
  }, [alerts, activeFilter, searchQuery]);

  return (
    <div 
      id="seo-competitive-alert-widget"
      className={`bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden space-y-6 ${className}`}
    >
      {/* ===================================================================== */}
      {/* 1. TOP WIDGET HEADER BAR WITH REAL-TIME PULSE & CONTROLS */}
      {/* ===================================================================== */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-5 sm:p-6 border-b border-indigo-950/60">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left: Title & Real-time Live Radar Status */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-black tracking-wide">
                <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span>SEO Competitive Alert Widget</span>
              </span>

              {/* Real-time Live Radar Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold">
                <span className="flex h-2 w-2 relative">
                  {isLiveTracking && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  )}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isLiveTracking ? 'bg-emerald-400' : 'bg-slate-400'}`}></span>
                </span>
                <span className="font-mono">
                  {isLiveTracking ? `CANLI İZLEME AKTİF (${secondsUntilNextCheck}s)` : "İZLEME DURAKLATILDI"}
                </span>
              </div>

              {summary.unreadCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-xs font-black">
                  <BellRing className="w-3 h-3" />
                  <span>{summary.unreadCount} Yeni Bildirim</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <span>Rakiplerin Sıralama Değişimleri & Canlı SERP Uyarıları</span>
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Google SERP üzerinde rakiplerinizin öne geçişlerini, 1. sıra kayıplarını ve ani arama hacmi patlamalarını 
              gerçek zamanlı izler; Strategic Analysis görünümüne anlık <strong>sesli ve masaüstü push bildirimleri</strong> gönderir.
            </p>
          </div>

          {/* Right: Live Controls & Instant Simulation Triggers */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Live Auto-Track Toggle */}
            <button
              type="button"
              id="widget-toggle-live-tracking-btn"
              onClick={() => setIsLiveTracking(!isLiveTracking)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                isLiveTracking 
                  ? "bg-emerald-600/30 border-emerald-500/50 text-emerald-200 hover:bg-emerald-600/40" 
                  : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
              }`}
              title="Gerçek zamanlı otomatik arka plan taramasını aç/kapat"
            >
              <Activity className={`w-3.5 h-3.5 ${isLiveTracking ? 'text-emerald-400 animate-spin' : 'text-slate-400'}`} />
              <span>{isLiveTracking ? "Otomatik Takip Açık" : "Takibi Başlat"}</span>
            </button>

            {/* Sound Toggle */}
            <button
              type="button"
              id="widget-toggle-sound-btn"
              onClick={handleToggleSound}
              className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                settings.audioCueEnabled 
                  ? "bg-indigo-600/40 border-indigo-400/50 text-indigo-200 hover:bg-indigo-600/50" 
                  : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
              }`}
              title={settings.audioCueEnabled ? "Sesli uyarı açık (Kapatmak için tıkla)" : "Sesli uyarı kapalı (Açmak için tıkla)"}
            >
              {settings.audioCueEnabled ? <Volume2 className="w-4 h-4 text-indigo-300" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            {/* Push Permission Toggle */}
            <button
              type="button"
              id="widget-request-push-btn"
              onClick={handleRequestPushPermission}
              className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                notificationPermission === "granted"
                  ? "bg-emerald-600/30 border-emerald-400/50 text-emerald-200"
                  : "bg-amber-600/30 border-amber-400/50 text-amber-200 hover:bg-amber-600/40"
              }`}
              title={notificationPermission === "granted" ? "Web Push Bildirimleri Onaylı" : "Web Push Bildirimlerini Aktifleştir"}
            >
              <Bell className="w-4 h-4" />
            </button>

            {/* Open Alert Configuration Panel */}
            <button
              type="button"
              id="widget-open-settings-panel-btn"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                isSettingsOpen
                  ? "bg-indigo-600 border-indigo-400 text-white shadow-md ring-2 ring-indigo-300"
                  : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200"
              }`}
              title="SEO Rekabet Alarmı Eşik ve Bildirim Yapılandırma Paneli"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-300" />
              <span>Alarm Yapılandırması</span>
            </button>

            {/* DA Shift Simulation */}
            <button
              type="button"
              id="widget-trigger-da-btn"
              onClick={handleTriggerDaShift}
              disabled={isScanning}
              className="px-3 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              title="Domain Otoritesi (DA) değişimini ve tehdidini simüle et"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-indigo-200" />
              <span>DA Değişimi Test Et</span>
            </button>

            {/* Traffic Shift Simulation */}
            <button
              type="button"
              id="widget-trigger-traffic-btn"
              onClick={handleTriggerTrafficShift}
              disabled={isScanning}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              title="Rakip aylık organik trafik hacmi sıçramasını test et"
            >
              <Zap className="w-3.5 h-3.5 text-teal-200" />
              <span>Trafik Artışı Test Et</span>
            </button>

            {/* Instant SERP Shift Simulation */}
            <button
              type="button"
              id="widget-trigger-shift-btn"
              onClick={handleTriggerRankShift}
              disabled={isScanning}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              title="Rakip sıralama değişimini canlı olarak simüle et ve Strategic Analysis paneline push gönder"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse text-amber-200" />
              <span>Sıralama Değişimini Test Et</span>
            </button>

            {/* Volume Spike Simulation */}
            <button
              type="button"
              id="widget-trigger-volume-btn"
              onClick={handleTriggerVolumeSpike}
              disabled={isScanning}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              title="Ani arama hacmi patlamasını (+%140) simüle et"
            >
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
              <span>Hacim Patlaması Simüle Et</span>
            </button>

            {/* Full Rescan Button */}
            <button
              type="button"
              id="widget-rescan-serp-btn"
              onClick={handleRescanSerp}
              disabled={isScanning}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer disabled:opacity-50"
              title="Tüm anahtar kelimeleri SERP ile yeniden eşle"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-indigo-400' : 'text-slate-400'}`} />
              <span>Canlı Tara</span>
            </button>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* 1.1 CONFIGURATION PANEL DRAWER (IF OPEN) */}
        {/* ===================================================================== */}
        {isSettingsOpen && (
          <div className="mt-4 pt-4 border-t border-indigo-900/60 animate-in fade-in duration-200">
            <SeoCompetitiveAlertConfigPanel
              config={config}
              isOpen={isSettingsOpen}
              onClose={() => setIsSettingsOpen(false)}
              onSettingsSaved={(newSettings) => {
                setSettings(newSettings);
                setStatusNotice({
                  type: "success",
                  message: "SEO Rekabet Alarmı eşik ayarları başarıyla kaydedildi ve canlı takip motoruna uygulandı."
                });
                setTimeout(() => setStatusNotice(null), 4000);
              }}
              onAlertTriggered={(newAlert) => {
                setAlerts((prev) => [newAlert, ...prev]);
                if (onAlertTriggered) onAlertTriggered(newAlert);
              }}
              mode="inline"
            />
          </div>
        )}

        {/* Live Broadcast Notice Bar */}
        {statusNotice && (
          <div 
            id="widget-status-notice-bar"
            className={`mt-4 p-3 rounded-2xl text-xs font-bold flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
              statusNotice.type === "success" 
                ? "bg-emerald-500/20 border border-emerald-400/50 text-emerald-200" 
                : statusNotice.type === "warning" 
                ? "bg-amber-500/20 border border-amber-400/50 text-amber-200" 
                : "bg-indigo-500/20 border border-indigo-400/50 text-indigo-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span>{statusNotice.message}</span>
            </div>
            <button 
              type="button" 
              onClick={() => setStatusNotice(null)}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* ===================================================================== */}
        {/* 2. SUMMARY KPI STAT TILES */}
        {/* ===================================================================== */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Card 1: Active Alerts */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">Aktif Alarmlar</span>
              <Bell className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 font-mono">{summary.activeCount}</span>
              {summary.unreadCount > 0 && (
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  {summary.unreadCount} okunmamış
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 block">Sürekli SERP Taraması</span>
          </div>

          {/* Card 2: Outranked Keywords */}
          <div className="bg-rose-50/50 border border-rose-200/80 rounded-2xl p-4 space-y-1">
            <div className="flex items-center justify-between text-rose-700">
              <span className="text-[11px] font-bold uppercase tracking-wider">Sıralamada Gerilen</span>
              <TrendingDown className="w-4 h-4 text-rose-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-rose-900 font-mono">{summary.outrankedCount}</span>
              <span className="text-xs font-bold text-rose-700">Terim</span>
            </div>
            <span className="text-[10px] text-rose-600/80 block">Rakip öne geçti</span>
          </div>

          {/* Card 3: Top Threat Competitor */}
          <div className="bg-indigo-50/50 border border-indigo-200/80 rounded-2xl p-4 space-y-1">
            <div className="flex items-center justify-between text-indigo-700">
              <span className="text-[11px] font-bold uppercase tracking-wider">En Agresif Rakip</span>
              <Building2 className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="truncate font-black text-sm text-indigo-950 font-mono mt-1" title={summary.topThreatCompetitor}>
              {summary.topThreatCompetitor}
            </div>
            <span className="text-[10px] text-indigo-600/80 block">En çok terimde öne geçti</span>
          </div>

          {/* Card 4: Potential Traffic at Risk */}
          <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-4 space-y-1">
            <div className="flex items-center justify-between text-amber-800">
              <span className="text-[11px] font-bold uppercase tracking-wider">Risk Altındaki Trafik</span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-xl font-black text-amber-950 font-mono">
              {summary.potentialTrafficAtRisk}
            </div>
            <span className="text-[10px] text-amber-700/80 block">Aylık potansiyel kayıp</span>
          </div>

          {/* Card 5: Push Notification Mode */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-1 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Bildirim Durumu</span>
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            </div>
            <div className="text-xs font-mono font-bold text-emerald-300 mt-1">
              Web Push + Ses Aktif
            </div>
            <div className="text-[10px] text-slate-400 flex items-center justify-between">
              <span>Son: {lastCheckTimestamp}</span>
              <button 
                type="button" 
                onClick={handleSendTestPush}
                className="text-amber-300 hover:text-amber-200 underline cursor-pointer"
              >
                Test Et
              </button>
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* 3. FILTER CHIPS, SEARCH & ACTION BUTTONS */}
        {/* ===================================================================== */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-2">
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === "all"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Tümü ({alerts.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("volume_spike")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                activeFilter === "volume_spike"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Hacim Patlamaları ({alerts.filter(a => a.category === "volume_spike").length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("critical")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                activeFilter === "critical"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200"
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Kritik Gerilemeler ({alerts.filter(a => a.severity === "critical").length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("unread")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                activeFilter === "unread"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200"
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Okunmamışlar ({summary.unreadCount})</span>
            </button>
          </div>

          {/* Search Bar & Mark All */}
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Kelime veya rakip ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {summary.unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors whitespace-nowrap cursor-pointer"
              >
                Tümünü Oku
              </button>
            )}

            {onDownloadPdf && (
              <button
                type="button"
                onClick={onDownloadPdf}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                title="Alarmları PDF Raporu Olarak İndir"
              >
                <FileDown className="w-4 h-4 text-indigo-600" />
              </button>
            )}
          </div>
        </div>

        {/* ===================================================================== */}
        {/* 4. REAL-TIME RANKING SHIFT STREAM & COMPETITOR MOVEMENT CARDS */}
        {/* ===================================================================== */}
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm">Filtreye uygun alarm bulunamadı</h4>
            <p className="text-xs text-slate-500">Tüm arama motoru sıralamalarınız koruma altında veya filtre kriteri sonuç vermedi.</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredAlerts.map((alert) => {
              const isResolved = alert.status === "resolved";
              const isVolumeSpike = alert.category === "volume_spike";
              const isCritical = alert.severity === "critical";

              return (
                <div
                  key={alert.id}
                  id={`alert-card-${alert.id}`}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3.5 ${
                    !alert.isRead 
                      ? "bg-white border-amber-300 shadow-md ring-1 ring-amber-400/20" 
                      : isResolved
                      ? "bg-slate-50/70 border-slate-200 opacity-80"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {/* Top Bar of Alert Card */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Status indicator dot */}
                      {!alert.isRead && (
                        <span className="flex h-2.5 w-2.5 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                        </span>
                      )}

                      {/* Category Badge */}
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-black tracking-wide border ${
                        isVolumeSpike 
                          ? "bg-amber-100 text-amber-900 border-amber-300" 
                          : isCritical 
                          ? "bg-rose-100 text-rose-900 border-rose-300" 
                          : "bg-indigo-100 text-indigo-900 border-indigo-200"
                      }`}>
                        {isVolumeSpike 
                          ? `⚡ Ani Hacim Patlaması (+%${alert.volumeChangePercentage || 120})` 
                          : alert.category === "lost_number_one"
                          ? "🚨 #1. Sıra Kaybı"
                          : alert.category === "lost_top3"
                          ? "⚠️ İlk 3 Sıra Kaybı"
                          : "📉 Rakip Öne Geçti"}
                      </span>

                      {/* Keyword Tag */}
                      <span className="font-mono font-bold text-xs text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        {alert.keyword}
                      </span>

                      {/* Search Intent */}
                      <span className="text-[10px] text-slate-500 font-semibold">
                        • {alert.searchIntent}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(alert.detectedAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</span>
                      <span className="text-slate-300">|</span>
                      <span className="text-[11px] font-bold text-slate-500">{alert.competitorName} ({alert.competitorDomain})</span>
                    </div>
                  </div>

                  {/* Middle: Title, Description & Shift Metrics */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                    <div className="lg:col-span-8 space-y-2">
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                        {alert.title}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {alert.description}
                      </p>

                      {/* Rank Movement Badges */}
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                        {/* Competitor Rank Badge */}
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200">
                          <span className="text-slate-500 text-[11px]">Rakip:</span>
                          <span className="font-mono font-black text-amber-900">
                            #{alert.competitorRank}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1 rounded">
                            {alert.competitorRankChange ? `+${alert.competitorRankChange} Sıra` : "#1 Lider"}
                          </span>
                        </div>

                        {/* User Rank Badge */}
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200">
                          <span className="text-slate-500 text-[11px]">Siteniz:</span>
                          <span className="font-mono font-bold text-slate-800">
                            {alert.userRank !== null ? `#${alert.userRank}` : "İlk 20 Dışı"}
                          </span>
                          {alert.userRankChange !== null && alert.userRankChange !== undefined && alert.userRankChange < 0 && (
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1 rounded">
                              {alert.userRankChange} Sıra
                            </span>
                          )}
                        </div>

                        {/* Monthly Volume */}
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-50 border border-indigo-200">
                          <span className="text-slate-500 text-[11px]">Hacim:</span>
                          <span className="font-mono font-bold text-indigo-950">
                            {alert.monthlyVolume}
                          </span>
                        </div>

                        {/* Traffic Loss Estimate */}
                        <div className="text-rose-600 font-bold text-xs">
                          {alert.trafficLossEstimate}
                        </div>
                      </div>
                    </div>

                    {/* Right: Counter-Action Box */}
                    <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-100 pt-3 lg:pt-0 lg:pl-4">
                      <button
                        type="button"
                        onClick={() => handleExecuteAction(alert)}
                        className="w-full px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                        <span>{alert.recommendedAction?.label || "Karşı İçerik Üret"}</span>
                      </button>

                      <div className="flex items-center gap-1.5 w-full">
                        {!alert.isRead && !isResolved && (
                          <button
                            type="button"
                            onClick={() => handleMarkAsRead(alert.id)}
                            className="flex-1 py-1.5 px-2 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 text-[11px] font-bold transition-colors cursor-pointer text-center"
                          >
                            Okundu
                          </button>
                        )}

                        {!isResolved ? (
                          <button
                            type="button"
                            onClick={() => handleResolve(alert.id)}
                            className="flex-1 py-1.5 px-2 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 text-[11px] font-bold transition-colors cursor-pointer text-center flex items-center justify-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>Çöz</span>
                          </button>
                        ) : (
                          <span className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-bold text-center">
                            Çözüldü ✓
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDismiss(alert.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Alarmı Gizle"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
