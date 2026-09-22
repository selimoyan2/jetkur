import React, { useState, useEffect } from "react";
import { 
  CoreVitalMetric, 
  CoreWebVitalsAlertConfig, 
  CoreWebVitalsAlertItem 
} from "../../types";
import {
  loadAlertConfig,
  saveAlertConfig,
  loadAlertHistory,
  saveAlertHistory,
  getBrowserNotificationPermission,
  requestBrowserNotificationPermission,
  triggerNativeBrowserNotification,
  simulateMetricSpike,
  playAlertChime,
  DEFAULT_CWV_THRESHOLDS
} from "../../utils/performanceAlertEngine";
import {
  Bell,
  BellRing,
  AlertTriangle,
  Zap,
  Clock,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Volume2,
  VolumeX,
  RefreshCw,
  Trash2,
  Check,
  ExternalLink,
  ChevronRight,
  Info,
  Radio,
  Flame
} from "lucide-react";

export interface PerformanceAlertManagerProps {
  onClose?: () => void;
  className?: string;
}

export const PerformanceAlertManager: React.FC<PerformanceAlertManagerProps> = ({
  onClose,
  className = ""
}) => {
  const [config, setConfig] = useState<CoreWebVitalsAlertConfig>(loadAlertConfig);
  const [alerts, setAlerts] = useState<CoreWebVitalsAlertItem[]>([]);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [isSimulating, setIsSimulating] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "LCP" | "CLS" | "FID">("all");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Live Simulated Metric Ticker
  const [liveMetrics, setLiveMetrics] = useState({
    lcp: 1.48,
    cls: 0.014,
    fid: 19
  });

  // Load alert history & permission
  useEffect(() => {
    setAlerts(loadAlertHistory());
    setPermission(getBrowserNotificationPermission());

    const handleHistoryUpdate = (e: CustomEvent<CoreWebVitalsAlertItem[]>) => {
      if (e.detail) {
        setAlerts(e.detail);
      }
    };

    window.addEventListener("cwv-alert-history-updated" as any, handleHistoryUpdate);
    return () => {
      window.removeEventListener("cwv-alert-history-updated" as any, handleHistoryUpdate);
    };
  }, []);

  // Periodic heartbeat slight fluctuation for live telemetry ticker
  useEffect(() => {
    if (!config.isRealtimeMonitoringEnabled) return;

    const interval = setInterval(() => {
      setLiveMetrics({
        lcp: Number((1.35 + Math.random() * 0.35).toFixed(2)),
        cls: Number((0.010 + Math.random() * 0.008).toFixed(3)),
        fid: Math.round(15 + Math.random() * 12)
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [config.isRealtimeMonitoringEnabled]);

  const handleRequestPermission = async () => {
    const res = await requestBrowserNotificationPermission();
    setPermission(res);

    if (res === "granted") {
      // Send a confirmation test push
      triggerNativeBrowserNotification({
        id: `perm-test-${Date.now()}`,
        metric: "LCP",
        metricLabel: "Bildirim Doğrulama Testi",
        currentValue: 1.45,
        threshold: 4.0,
        unit: "s",
        status: "warning",
        timestamp: new Date().toISOString(),
        formattedTime: "Şimdi",
        affectedUrl: window.location.href,
        device: "desktop",
        message: "Tarayıcı bildirimleri başarıyla etkinleştirildi! Core Web Vitals eşik aşımlarında anında uyarı alacaksınız.",
        recommendation: "Google PageSpeed 'Kötü' eşik aşımları otomatik olarak burada ve masaüstünüzde bildirilir.",
        isRead: true,
        isDismissed: false
      });
    }
  };

  const handleSaveThresholds = (newThresholds: Partial<typeof config.thresholds>) => {
    const updated = {
      ...config,
      thresholds: {
        ...config.thresholds,
        ...newThresholds
      }
    };
    setConfig(updated);
    saveAlertConfig(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleResetToGoogleDefaults = () => {
    const updated = {
      ...config,
      thresholds: DEFAULT_CWV_THRESHOLDS
    };
    setConfig(updated);
    saveAlertConfig(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleToggleMonitoring = () => {
    const updated = {
      ...config,
      isRealtimeMonitoringEnabled: !config.isRealtimeMonitoringEnabled
    };
    setConfig(updated);
    saveAlertConfig(updated);
  };

  const handleToggleBrowserNotifications = async () => {
    if (!config.browserNotificationsEnabled && permission !== "granted") {
      const res = await requestBrowserNotificationPermission();
      setPermission(res);
      if (res !== "granted") return;
    }

    const updated = {
      ...config,
      browserNotificationsEnabled: !config.browserNotificationsEnabled
    };
    setConfig(updated);
    saveAlertConfig(updated);
  };

  const handleToggleSound = () => {
    const updated = {
      ...config,
      soundEnabled: !config.soundEnabled
    };
    setConfig(updated);
    saveAlertConfig(updated);
    if (!config.soundEnabled) {
      playAlertChime();
    }
  };

  const handleTriggerTestSpike = (metric: CoreVitalMetric) => {
    setIsSimulating(metric);
    setTimeout(() => {
      simulateMetricSpike(metric, config);
      setIsSimulating(null);
    }, 400);
  };

  const handleMarkAllAsRead = () => {
    const updated = alerts.map(a => ({ ...a, isRead: true }));
    setAlerts(updated);
    saveAlertHistory(updated);
  };

  const handleClearHistory = () => {
    setAlerts([]);
    saveAlertHistory([]);
  };

  const filteredAlerts = alerts.filter(a => {
    if (activeFilter === "all") return true;
    return a.metric === activeFilter;
  });

  const unreadCount = alerts.filter(a => !a.isRead).length;

  return (
    <div 
      id="performance-alert-manager-module"
      className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden font-sans ${className}`}
    >
      {/* 1. Header Banner */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
              <BellRing className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
              <span>Gerçek Zamanlı Core Web Vitals Performans Uyarı Sistemi</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-xs font-black">
                  {unreadCount} Yeni
                </span>
              )}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            LCP, CLS ve FID değerleri Google'ın resmi <strong>'Kötü' (Poor)</strong> eşiklerini aştığında tarayıcı masaüstü bildirimi ve sesli uyarı gönderir.
          </p>
        </div>

        {/* Live Monitoring Heartbeat Indicator */}
        <div className="flex items-center gap-2.5 bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700/80 shrink-0">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              {config.isRealtimeMonitoringEnabled ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-500"></span>
              )}
            </span>
            <span className="text-xs font-bold text-slate-200">
              {config.isRealtimeMonitoringEnabled ? "Canlı Telemetri Aktif" : "İzleme Duraklatıldı"}
            </span>
          </div>

          <button
            type="button"
            onClick={handleToggleMonitoring}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              config.isRealtimeMonitoringEnabled
                ? "bg-slate-700 hover:bg-slate-600 text-slate-300"
                : "bg-emerald-600 hover:bg-emerald-500 text-white"
            }`}
          >
            {config.isRealtimeMonitoringEnabled ? "Duraklat" : "Başlat"}
          </button>
        </div>
      </div>

      {/* 2. Notification Permissions & Quick Control Bar */}
      <div className="p-4 sm:p-5 bg-slate-50/80 dark:bg-slate-950/50 border-b border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Browser Permission Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-300">Tarayıcı Bildirimleri:</span>
            {permission === "granted" ? (
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                İzin Verildi (Aktif)
              </span>
            ) : permission === "denied" ? (
              <span className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 font-bold border border-rose-300 dark:border-rose-800">
                Engellendi (Tarayıcı Ayarları)
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-800">
                İzin Bekliyor
              </span>
            )}
          </div>

          {permission !== "granted" && permission !== "unsupported" && (
            <button
              type="button"
              id="btn-request-browser-notification-perm"
              onClick={handleRequestPermission}
              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Tarayıcı İzni Ver</span>
            </button>
          )}

          {permission === "granted" && (
            <button
              type="button"
              id="btn-toggle-browser-notifications"
              onClick={handleToggleBrowserNotifications}
              className={`px-2.5 py-1 rounded-lg font-bold border transition-colors cursor-pointer ${
                config.browserNotificationsEnabled
                  ? "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-400 border-transparent"
              }`}
            >
              {config.browserNotificationsEnabled ? "Bildirimleri Kapat" : "Bildirimleri Aç"}
            </button>
          )}
        </div>

        {/* Audio Sound & In-App Toast Toggles */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="btn-toggle-sound-chime"
            onClick={handleToggleSound}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-bold transition-all cursor-pointer ${
              config.soundEnabled
                ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
            }`}
            title="Sesli uyarı zilini aç/kapat"
          >
            {config.soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Sesli Uyarı (Açık)</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span>Sesli Uyarı (Kapalı)</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={playAlertChime}
            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold transition-colors cursor-pointer"
            title="Sesi test et"
          >
            Sesi Test Et 🔔
          </button>
        </div>
      </div>

      {/* 3. Predefined Google 'Poor' Thresholds & Live Telemetry Stream */}
      <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-5 border-b border-slate-200 dark:border-slate-800">
        
        {/* Metric 1: LCP Threshold Card */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-rose-500/20" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  LCP (Yükleme Hızı)
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-[10px] font-black border border-rose-200 dark:border-rose-800">
                Kötü Eşik: &gt;{config.thresholds.lcpPoor}s
              </span>
            </div>

            <div className="flex items-baseline justify-between mt-3 mb-2">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block">Canlı Ölçüm:</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {liveMetrics.lcp}s
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                Şu An İyi (≤2.5s)
              </span>
            </div>

            {/* Threshold Input */}
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center justify-between mb-1">
                <span>Uyarı Tetikleme Eşiği (Saniye):</span>
                <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">{config.thresholds.lcpPoor}s</span>
              </label>
              <input
                type="range"
                min="2.5"
                max="6.0"
                step="0.1"
                value={config.thresholds.lcpPoor}
                onChange={(e) => handleSaveThresholds({ lcpPoor: parseFloat(e.target.value) })}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                <span>2.5s (Hassas)</span>
                <span>4.0s (Google Standart)</span>
                <span>6.0s (Toleranslı)</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
            <span className="text-[10px] text-slate-400">Google: &gt;4.0s Kötü</span>
            <button
              type="button"
              id="btn-simulate-lcp-spike"
              onClick={() => handleTriggerTestSpike("LCP")}
              disabled={isSimulating === "LCP"}
              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-800 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
            >
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              <span>{isSimulating === "LCP" ? "Uyarılıyor..." : "LCP Aşımı Simüle Et"}</span>
            </button>
          </div>
        </div>

        {/* Metric 2: CLS Threshold Card */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-indigo-500/20" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  CLS (Yerleşim Kayması)
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-[10px] font-black border border-rose-200 dark:border-rose-800">
                Kötü Eşik: &gt;{config.thresholds.clsPoor}
              </span>
            </div>

            <div className="flex items-baseline justify-between mt-3 mb-2">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block">Canlı Ölçüm:</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {liveMetrics.cls}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                Şu An İyi (≤0.10)
              </span>
            </div>

            {/* Threshold Input */}
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center justify-between mb-1">
                <span>Uyarı Tetikleme Eşiği (Skor):</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{config.thresholds.clsPoor}</span>
              </label>
              <input
                type="range"
                min="0.10"
                max="0.50"
                step="0.01"
                value={config.thresholds.clsPoor}
                onChange={(e) => handleSaveThresholds({ clsPoor: parseFloat(e.target.value) })}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                <span>0.10 (Hassas)</span>
                <span>0.25 (Google Standart)</span>
                <span>0.50 (Toleranslı)</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
            <span className="text-[10px] text-slate-400">Google: &gt;0.25 Kötü</span>
            <button
              type="button"
              id="btn-simulate-cls-spike"
              onClick={() => handleTriggerTestSpike("CLS")}
              disabled={isSimulating === "CLS"}
              className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
            >
              <Flame className="w-3.5 h-3.5 text-indigo-500" />
              <span>{isSimulating === "CLS" ? "Uyarılıyor..." : "CLS Aşımı Simüle Et"}</span>
            </button>
          </div>
        </div>

        {/* Metric 3: FID Threshold Card */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-amber-500/20" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  FID / INP (Gecikme)
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-[10px] font-black border border-rose-200 dark:border-rose-800">
                Kötü Eşik: &gt;{config.thresholds.fidPoor}ms
              </span>
            </div>

            <div className="flex items-baseline justify-between mt-3 mb-2">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block">Canlı Ölçüm:</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {liveMetrics.fid}ms
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                Şu An İyi (≤100ms)
              </span>
            </div>

            {/* Threshold Input */}
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center justify-between mb-1">
                <span>Uyarı Tetikleme Eşiği (ms):</span>
                <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">{config.thresholds.fidPoor}ms</span>
              </label>
              <input
                type="range"
                min="100"
                max="500"
                step="10"
                value={config.thresholds.fidPoor}
                onChange={(e) => handleSaveThresholds({ fidPoor: parseInt(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                <span>100ms (Hassas)</span>
                <span>300ms (Google Standart)</span>
                <span>500ms (Toleranslı)</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
            <span className="text-[10px] text-slate-400">Google: &gt;300ms Kötü</span>
            <button
              type="button"
              id="btn-simulate-fid-spike"
              onClick={() => handleTriggerTestSpike("FID")}
              disabled={isSimulating === "FID"}
              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-800 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>{isSimulating === "FID" ? "Uyarılıyor..." : "FID Aşımı Simüle Et"}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Threshold reset banner */}
      <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-indigo-500" />
          <span>Eşik değerleri Google Core Web Vitals resmi sınıflandırma baremlerine dayanmaktadır.</span>
          {saveSuccess && (
            <span className="text-emerald-600 dark:text-emerald-400 font-bold ml-2">✓ Değişiklikler kaydedildi</span>
          )}
        </span>
        <button
          type="button"
          onClick={handleResetToGoogleDefaults}
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-bold underline cursor-pointer"
        >
          Google Standartlarına Sıfırla (4.0s / 0.25 / 300ms)
        </button>
      </div>

      {/* 4. Alert History Log Feed */}
      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-black text-slate-900 dark:text-white">
              Tetiklenen Performans Uyarıları Geçmişi ({alerts.length})
            </h4>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-black">
                {unreadCount} okunmamış
              </span>
            )}
          </div>

          {/* Metric Filter Tabs & Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold">
              {(["all", "LCP", "CLS", "FID"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setActiveFilter(f)}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    activeFilter === f
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {f === "all" ? "Tümü" : f}
                </button>
              ))}
            </div>

            {alerts.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                >
                  Okundu İşaretle
                </button>
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="px-2.5 py-1 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Temizle</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* List of Alerts */}
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-10 px-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
            <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
            <h5 className="text-sm font-bold text-slate-900 dark:text-white">
              Herhangi Bir Kritik Aşım Uyarısı Yok
            </h5>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              Sitenizin Core Web Vitals ölçümleri tanımlanan 'Kötü' eşiklerinin altındadır. Bir eşik aşımı simüle etmek için yukarıdaki test butonlarını kullanabilirsiniz.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {filteredAlerts.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all ${
                  item.isRead
                    ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                    : "bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60 ring-1 ring-rose-400/20"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      item.metric === "LCP" 
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                        : item.metric === "CLS"
                        ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                    }`}>
                      {item.metric === "LCP" && <Zap className="w-4 h-4" />}
                      {item.metric === "CLS" && <Layers className="w-4 h-4" />}
                      {item.metric === "FID" && <Clock className="w-4 h-4" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {item.metricLabel}
                        </span>
                        <span className="px-2 py-0.2 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-[10px] font-black border border-rose-300 dark:border-rose-800">
                          {item.currentValue}{item.unit} (Eşik: &gt;{item.threshold}{item.unit})
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {item.formattedTime}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                          {item.device}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">
                        {item.message}
                      </p>

                      <div className="mt-2 text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700/60">
                        <strong className="text-indigo-600 dark:text-indigo-400 font-semibold">Tavsiye Edilen Çözüm:</strong> {item.recommendation}
                      </div>
                    </div>
                  </div>

                  {!item.isRead && (
                    <button
                      type="button"
                      onClick={() => {
                        const updated = alerts.map(a => a.id === item.id ? { ...a, isRead: true } : a);
                        setAlerts(updated);
                        saveAlertHistory(updated);
                      }}
                      className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 cursor-pointer"
                    >
                      Okundu
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
