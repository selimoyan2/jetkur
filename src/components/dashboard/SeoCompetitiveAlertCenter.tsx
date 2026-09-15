import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  SiteConfig, 
  CustomerPanelTab, 
  SeoCompetitiveAlert, 
  SeoCompetitiveAlertSettings,
  CompetitiveAlertSummary,
  CompetitorKeywordRanking,
  CompetitorContentMetric
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
  evaluateCompetitiveRankings
} from "../../utils/seoCompetitiveAlertEngine";
import { CompetitiveAlertToast } from "./CompetitiveAlertToast";
import { 
  Bell, 
  BellRing, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
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
  Layers, 
  ArrowRight, 
  ExternalLink, 
  Volume2, 
  VolumeX, 
  Smartphone, 
  Monitor, 
  Filter, 
  ChevronRight, 
  Info, 
  Target, 
  Zap, 
  Building2, 
  MapPin, 
  Clock, 
  Radio, 
  Award,
  ChevronDown
} from "lucide-react";

export interface SeoCompetitiveAlertCenterProps {
  config: SiteConfig;
  onChange?: (updatedConfig: SiteConfig) => void;
  onNavigateTab?: (tab: CustomerPanelTab) => void;
  onSendToAiBlog?: (keyword: string, draftTitle?: string) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const SeoCompetitiveAlertCenter: React.FC<SeoCompetitiveAlertCenterProps> = ({
  config,
  onChange,
  onNavigateTab,
  onSendToAiBlog,
  onClose,
  isModal = false
}) => {
  // Alerts and settings state
  const [alerts, setAlerts] = useState<SeoCompetitiveAlert[]>(() => loadCompetitiveAlerts(config));
  const [settings, setSettings] = useState<SeoCompetitiveAlertSettings>(() => loadCompetitiveAlertSettings());
  
  // UI filter tabs
  const [activeFilter, setActiveFilter] = useState<"all" | "critical" | "warning" | "opportunity" | "resolved">("all");
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "unsupported">(() => getNotificationPermission());
  
  // Active toast banner for simulation or real-time event
  const [activeToastAlert, setActiveToastAlert] = useState<SeoCompetitiveAlert | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Compute summary KPI metrics
  const summary: CompetitiveAlertSummary = useMemo(() => {
    return calculateAlertSummary(alerts, config);
  }, [alerts, config]);

  // Sync settings changes to localStorage
  const handleUpdateSettings = (newSettings: Partial<SeoCompetitiveAlertSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveCompetitiveAlertSettings(updated);
  };

  // Browser push notification permission handler
  const handleRequestPermission = async () => {
    const permission = await requestBrowserNotificationPermission();
    setNotificationPermission(permission);
    if (permission === "granted") {
      setSuccessBanner("Masaüstü push bildirim izinleri başarıyla onaylandı!");
      setTimeout(() => setSuccessBanner(null), 4000);
      handleUpdateSettings({ browserPushEnabled: true });
    }
  };

  // Dispatch alert notification (Push + Toast + Sound)
  const dispatchAlertNotification = useCallback(async (alert: SeoCompetitiveAlert) => {
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

  // Real-Time SERP scan & simulation handler
  const handleTriggerRealtimeScan = async () => {
    setIsScanning(true);
    setSuccessBanner(null);

    // Simulate realistic network delay for SERP scraping and AI analysis
    setTimeout(async () => {
      const { newAlert, updatedAlerts } = simulateRankingShift(config, alerts);
      setAlerts(updatedAlerts);
      setIsScanning(false);

      // Trigger alerts
      await dispatchAlertNotification(newAlert);

      setSuccessBanner(`SERP Taraması Tamamlandı: "${newAlert.competitorName}" için yeni bir sıralama değişimi tespit edildi!`);
      setTimeout(() => setSuccessBanner(null), 5000);
    }, 1200);
  };

  // Instant Test Notification
  const handleTestNotification = async () => {
    if (alerts.length === 0) return;
    const testAlert = alerts[0];
    await dispatchAlertNotification({
      ...testAlert,
      id: `test-alert-${Date.now()}`,
      title: `🔔 [TEST] ${testAlert.competitorName} birincil aramalarda sitenizi geçti!`,
      description: `Bu bir test bildirimidir. Gerçek SERP değişimlerinde masaüstü ve panel alarmları bu şekilde tetiklenecektir.`
    });
    setSuccessBanner("Test bildirimi başarıyla gönderildi!");
    setTimeout(() => setSuccessBanner(null), 3000);
  };

  // Mark single alert as read
  const handleMarkAsRead = (alertId: string) => {
    setAlerts(prev => markAlertAsRead(prev, alertId));
  };

  // Mark all as read
  const handleMarkAllRead = () => {
    setAlerts(prev => markAllAlertsAsRead(prev));
    setSuccessBanner("Tüm alarmlar okundu olarak işaretlendi.");
    setTimeout(() => setSuccessBanner(null), 3000);
  };

  // Mark alert as resolved
  const handleResolve = (alertId: string) => {
    setAlerts(prev => markAlertAsResolved(prev, alertId));
    setSuccessBanner("Alarm başarıyla 'Çözüldü' olarak arşivlendi.");
    setTimeout(() => setSuccessBanner(null), 3000);
  };

  // Dismiss alert
  const handleDismiss = (alertId: string) => {
    setAlerts(prev => dismissAlert(prev, alertId));
  };

  // Execute recommended counter-action
  const handleExecuteAction = (alert: SeoCompetitiveAlert) => {
    handleMarkAsRead(alert.id);

    if (alert.recommendedAction.type === "blog") {
      if (onSendToAiBlog && alert.recommendedAction.prefillKeyword) {
        onSendToAiBlog(alert.recommendedAction.prefillKeyword, alert.recommendedAction.prefillDraftTitle);
        if (onClose) onClose();
        return;
      }
      if (onNavigateTab) {
        onNavigateTab("ai-blog");
        if (onClose) onClose();
        return;
      }
    }

    if (alert.recommendedAction.targetTab && onNavigateTab) {
      onNavigateTab(alert.recommendedAction.targetTab);
      if (onClose) onClose();
    }
  };

  // Filter alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      if (activeFilter === "resolved") return a.status === "resolved";
      if (a.status !== "active") return false;
      if (activeFilter === "all") return true;
      if (activeFilter === "critical") return a.severity === "critical";
      if (activeFilter === "warning") return a.severity === "warning";
      if (activeFilter === "opportunity") return a.severity === "opportunity";
      return true;
    });
  }, [alerts, activeFilter]);

  return (
    <div className={`space-y-6 ${isModal ? "p-3 sm:p-5" : ""}`} id="seo-competitive-alert-center-root">
      {/* 1. TOP HEADER WITH REAL-TIME MONITOR BADGE & CONTROLS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
              Canlı SERP Rakip Radarı Aktif
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300 font-mono border border-slate-700 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Son Tarama: Az Önce</span>
            </span>
            {summary.unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-bold animate-pulse flex items-center gap-1">
                <BellRing className="w-3 h-3 text-rose-400" />
                <span>{summary.unreadCount} Yeni Rakip Alarmı</span>
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
            <span>SEO Competitive Alert System</span>
            <span className="text-slate-400 text-xs font-normal">
              ({config.sector} • {config.city})
            </span>
          </h2>

          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Google SERP'te birincil anahtar kelimelerinizde herhangi bir rakip sitenizin önüne geçtiğinde anında masaüstü ve panel bildirimi alın; sıralama kaybını telafi edecek karşı içerik ve teknik adımları tek tıkla uygulayın.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {onClose && (
            <button
              type="button"
              id="alert-center-close-btn"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            id="test-competitive-push-btn"
            onClick={handleTestNotification}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
            title="Örnek bir push ve panel bildirimi tetikleyerek sistemi test edin"
          >
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span>Test Bildirimi Gönder</span>
          </button>

          <button
            type="button"
            id="toggle-alert-settings-btn"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isSettingsOpen 
                ? "bg-amber-400 text-slate-950 border-amber-400 font-black" 
                : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
            }`}
            title="Alarm ve Bildirim Ayarları"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            type="button"
            id="scan-serp-now-btn"
            onClick={handleTriggerRealtimeScan}
            disabled={isScanning}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>SERP Taranıyor...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 text-slate-950" />
                <span>Sıralamaları Şimdi Tara</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success / Alert Banner */}
      {successBanner && (
        <div 
          id="alert-center-success-banner"
          className="p-3.5 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs font-medium flex items-center justify-between gap-3 animate-fadeIn"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessBanner(null)}
            className="text-emerald-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. SETTINGS PANEL (COLLAPSIBLE) */}
      {isSettingsOpen && (
        <div 
          id="competitive-alert-settings-drawer"
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-md space-y-5 animate-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900">Alarm &amp; Push Bildirim Yapılandırması</h3>
            </div>
            <button
              type="button"
              onClick={() => setIsSettingsOpen(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
            >
              Kapat
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Setting 1: Browser Web Push Notifications */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Monitor className="w-4 h-4 text-blue-600" />
                  <span>Masaüstü Web Push</span>
                </span>
                <input
                  type="checkbox"
                  id="setting-browser-push-toggle"
                  checked={settings.browserPushEnabled}
                  onChange={(e) => handleUpdateSettings({ browserPushEnabled: e.target.checked })}
                  className="rounded text-amber-500 focus:ring-amber-400 h-4 w-4 cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Rakip öne geçtiğinde tarayıcı açıkken sistem bildirimi gönderir.
              </p>
              <div className="pt-1 flex items-center justify-between text-[10px]">
                <span className="text-slate-500">İzin Durumu:</span>
                {notificationPermission === "granted" ? (
                  <span className="font-bold text-emerald-600">✓ İzin Verildi</span>
                ) : notificationPermission === "denied" ? (
                  <span className="font-bold text-rose-600">✕ Engellendi</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleRequestPermission}
                    className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold hover:bg-blue-700 cursor-pointer"
                  >
                    İzin İste
                  </button>
                )}
              </div>
            </div>

            {/* Setting 2: In-App Toast & Sound Cue */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <BellRing className="w-4 h-4 text-amber-600" />
                  <span>Panel İçi Toast &amp; Ses</span>
                </span>
                <input
                  type="checkbox"
                  id="setting-toast-toggle"
                  checked={settings.inAppToastEnabled}
                  onChange={(e) => handleUpdateSettings({ inAppToastEnabled: e.target.checked })}
                  className="rounded text-amber-500 focus:ring-amber-400 h-4 w-4 cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Panelde gezinirken sağ altta kayan alarm kartı ve sesli uyarı verir.
              </p>
              <div className="pt-1 flex items-center justify-between text-[10px]">
                <span className="text-slate-500">Ses Efekti:</span>
                <button
                  type="button"
                  onClick={() => handleUpdateSettings({ audioCueEnabled: !settings.audioCueEnabled })}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                    settings.audioCueEnabled ? "bg-amber-100 text-amber-800" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {settings.audioCueEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
                  <span>{settings.audioCueEnabled ? "Açık" : "Kapalı"}</span>
                </button>
              </div>
            </div>

            {/* Setting 3: Sensitivity Threshold */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-emerald-600" />
                  <span>Alarm Hassasiyeti</span>
                </span>
              </div>
              <div className="space-y-1 text-[11px]">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.alertOnTop3Loss}
                    onChange={(e) => handleUpdateSettings({ alertOnTop3Loss: e.target.checked })}
                    className="rounded text-amber-500 h-3.5 w-3.5"
                  />
                  <span className="text-slate-700">İlk 3 Sıra Kaybında Kritik Alarm</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.alertOnHighVolumeOnly}
                    onChange={(e) => handleUpdateSettings({ alertOnHighVolumeOnly: e.target.checked })}
                    className="rounded text-amber-500 h-3.5 w-3.5"
                  />
                  <span className="text-slate-700">Yalnızca Hacmi &gt; 2.5K Kelimeler</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. SUMMARY KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Rakiplerin Önde Olduğu</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600 font-mono">
              {summary.outrankedKeywordsCount}
            </span>
            <span className="text-xs text-slate-400">kelime</span>
          </div>
          <p className="text-[10px] text-slate-400">İlk sıraları rakipler elinde tutuyor</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Kritik Sıralama Kayıpları</span>
            <ShieldAlert className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600 font-mono">
              {summary.criticalCount}
            </span>
            <span className="text-xs text-slate-400">acil tehdit</span>
          </div>
          <p className="text-[10px] text-slate-400">#1 pozisyonu veya Top 3 kaybı</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Risk Altındaki Trafik</span>
            <TrendingDown className="w-4 h-4 text-purple-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
              {summary.potentialTrafficAtRisk}
            </span>
          </div>
          <p className="text-[10px] text-slate-400">Rakiplere kaptırılan aylık ziyaretçi</p>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">En Tehditkâr Rakip</span>
            <Building2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-sm sm:text-base font-bold text-slate-900 truncate">
            {summary.topThreatCompetitor}
          </div>
          <p className="text-[10px] text-emerald-600 font-medium">
            Siteniz {summary.protectedRankingsCount} aramada lider
          </p>
        </div>
      </div>

      {/* 4. FILTER TABS & BULK ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            id="filter-alerts-all"
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeFilter === "all"
                ? "bg-slate-900 text-amber-400 shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span>Aktif Alarmlar</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono">
              {summary.activeCount}
            </span>
          </button>

          <button
            type="button"
            id="filter-alerts-critical"
            onClick={() => setActiveFilter("critical")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeFilter === "critical"
                ? "bg-rose-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-300" />
            <span>Kritik (Öne Geçilenler)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-rose-800 text-[10px] font-mono">
              {summary.criticalCount}
            </span>
          </button>

          <button
            type="button"
            id="filter-alerts-warning"
            onClick={() => setActiveFilter("warning")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeFilter === "warning"
                ? "bg-amber-500 text-slate-950 font-black shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span>Sıralama Kayıpları</span>
          </button>

          <button
            type="button"
            id="filter-alerts-opportunity"
            onClick={() => setActiveFilter("opportunity")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeFilter === "opportunity"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span>İçerik Boşlukları</span>
          </button>

          <button
            type="button"
            id="filter-alerts-resolved"
            onClick={() => setActiveFilter("resolved")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeFilter === "resolved"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>Çözülenler</span>
          </button>
        </div>

        {summary.unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1 shrink-0"
          >
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tümünü Okundu İşaretle</span>
          </button>
        )}
      </div>

      {/* 5. ALERT CARDS FEED */}
      <div className="space-y-4" id="competitive-alerts-list">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-800">
              Bu Filtrede Herhangi Bir Sıralama Tehdidi Yok
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Siteniz hedeflenen aramalarda rakiplere karşı pozisyonunu koruyor. Yeni bir SERP taraması yapmak için yukarıdaki butonu kullanabilirsiniz.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isResolved = alert.status === "resolved";
            const isCritical = alert.severity === "critical";

            return (
              <div
                key={alert.id}
                id={`alert-card-${alert.id}`}
                className={`bg-white border rounded-2xl p-5 shadow-xs transition-all space-y-4 ${
                  !alert.isRead
                    ? "border-amber-400/80 ring-2 ring-amber-400/10 bg-amber-50/10"
                    : isResolved
                    ? "border-emerald-200 bg-emerald-50/20 opacity-80"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {/* Alert Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      isCritical
                        ? "bg-rose-100 text-rose-800 border border-rose-200"
                        : "bg-amber-100 text-amber-800 border border-amber-200"
                    }`}>
                      {alert.category === "lost_number_one"
                        ? "🚨 #1 Pozisyonu Kaybedildi"
                        : alert.category === "lost_top3"
                        ? "⚠️ İlk 3'ten Düşüş"
                        : alert.category === "high_volume_threat"
                        ? "🎯 Kritik İçerik Boşluğu"
                        : "📉 Rakip Öne Geçti"}
                    </span>

                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200">
                      {alert.searchIntent}
                    </span>

                    <span className="text-xs font-mono font-bold text-slate-500">
                      Hacim: {alert.monthlyVolume}
                    </span>

                    {!alert.isRead && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Yeni Bildirim" />
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(alert.detectedAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</span>
                    <span>•</span>
                    <span className="font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                      {alert.trafficLossEstimate}
                    </span>
                  </div>
                </div>

                {/* Core Comparison & Alert Title */}
                <div className="space-y-2">
                  <h4 className="text-sm sm:text-base font-bold text-slate-900">
                    {alert.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {alert.description}
                  </p>
                </div>

                {/* Head-to-Head Visual Bar */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  {/* Competitor Side */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold font-mono text-amber-700 text-sm shrink-0">
                      #{alert.competitorRank}
                    </div>
                    <div className="space-y-0.5 truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-800 truncate">{alert.competitorName}</span>
                        <Award className="w-3 h-3 text-amber-500 shrink-0" />
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">{alert.competitorDomain}</p>
                    </div>
                  </div>

                  {/* Delta & Gap Indicator */}
                  <div className="flex flex-col items-center justify-center text-center space-y-1 py-1 sm:py-0 border-y sm:border-y-0 sm:border-x border-slate-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Sıralama Farkı
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-mono text-xs font-black">
                      {alert.userRank ? `${alert.rankDelta} Sıra Geride` : 'İlk 20 Dışında'}
                    </span>
                    {alert.competitorRankChange && (
                      <span className="text-[10px] text-emerald-600 font-semibold">
                        Rakip: +{alert.competitorRankChange} sıra kazandı
                      </span>
                    )}
                  </div>

                  {/* User Site Side */}
                  <div className="flex items-center justify-end gap-3">
                    <div className="space-y-0.5 text-right truncate">
                      <span className="text-xs font-bold text-slate-800 truncate">{config.companyName} (Siz)</span>
                      <p className="text-[10px] text-slate-400">Mevcut Sıralamanız</p>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold font-mono text-sm shrink-0">
                      {alert.userRank ? `#${alert.userRank}` : '—'}
                    </div>
                  </div>
                </div>

                {/* Root Cause & Diagnostic Insight */}
                <div className="p-3 bg-slate-100/70 border border-slate-200/80 rounded-xl space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700 text-[11px]">
                    <Info className="w-3.5 h-3.5 text-blue-600" />
                    <span>Neden Öne Geçtiler (SERP Teşhisi):</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {alert.rootCause}
                  </p>
                </div>

                {/* Footer Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    {!alert.isRead && (
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(alert.id)}
                        className="text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors"
                      >
                        Okundu İşaretle
                      </button>
                    )}
                    {!isResolved && (
                      <button
                        type="button"
                        onClick={() => handleResolve(alert.id)}
                        className="text-xs text-emerald-700 hover:text-emerald-900 font-medium flex items-center gap-1 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Çözüldü Olarak Arşivle</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDismiss(alert.id)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition-colors"
                    >
                      Kapat
                    </button>

                    <button
                      type="button"
                      id={`action-btn-${alert.id}`}
                      onClick={() => handleExecuteAction(alert)}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>{alert.recommendedAction.label}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Push Toast (if triggered) */}
      <CompetitiveAlertToast
        alert={activeToastAlert}
        onClose={() => setActiveToastAlert(null)}
        onOpenAlertCenter={() => setActiveFilter("all")}
        onTakeAction={handleExecuteAction}
      />
    </div>
  );
};
