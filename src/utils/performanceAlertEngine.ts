/**
 * Core Web Vitals Real-Time Performance Alert Engine
 * Monitors LCP, CLS, and FID metrics against Google's predefined 'Poor' thresholds
 * and triggers Browser Notifications, Web Audio chimes, and In-App Toasts.
 */

import { 
  CoreVitalMetric, 
  CoreWebVitalsThresholds, 
  CoreWebVitalsAlertItem, 
  CoreWebVitalsAlertConfig 
} from "../types";

export const DEFAULT_CWV_THRESHOLDS: CoreWebVitalsThresholds = {
  lcpPoor: 4.0,   // Google Official Poor: > 4.0s
  clsPoor: 0.25,  // Google Official Poor: > 0.25
  fidPoor: 300,   // Google Official Poor: > 300ms
  lcpWarning: 2.5, // Needs improvement: 2.5s - 4.0s
  clsWarning: 0.10, // Needs improvement: 0.10 - 0.25
  fidWarning: 100  // Needs improvement: 100ms - 300ms
};

export const DEFAULT_CWV_ALERT_CONFIG: CoreWebVitalsAlertConfig = {
  isRealtimeMonitoringEnabled: true,
  browserNotificationsEnabled: true,
  soundEnabled: true,
  inAppToastEnabled: true,
  pollIntervalSeconds: 8,
  cooldownSeconds: 40,
  thresholds: DEFAULT_CWV_THRESHOLDS
};

const STORAGE_KEY_CONFIG = "cwv_alert_config_v1";
const STORAGE_KEY_HISTORY = "cwv_alert_history_v1";
const STORAGE_KEY_COOLDOWN = "cwv_alert_cooldown_v1";

/**
 * Load alert configuration from localStorage
 */
export function loadAlertConfig(): CoreWebVitalsAlertConfig {
  if (typeof window === "undefined") return DEFAULT_CWV_ALERT_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (!raw) return DEFAULT_CWV_ALERT_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_CWV_ALERT_CONFIG,
      ...parsed,
      thresholds: {
        ...DEFAULT_CWV_THRESHOLDS,
        ...(parsed.thresholds || {})
      }
    };
  } catch (e) {
    console.error("Failed to load CWV alert config:", e);
    return DEFAULT_CWV_ALERT_CONFIG;
  }
}

/**
 * Save alert configuration to localStorage
 */
export function saveAlertConfig(config: CoreWebVitalsAlertConfig): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent("cwv-alert-config-changed", { detail: config }));
  } catch (e) {
    console.error("Failed to save CWV alert config:", e);
  }
}

/**
 * Load alert history from localStorage
 */
export function loadAlertHistory(): CoreWebVitalsAlertItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (!raw) {
      // Return initial realistic seed alerts demonstrating the feature
      const initialSeed: CoreWebVitalsAlertItem[] = [
        {
          id: "cwv-alert-seed-1",
          metric: "LCP",
          metricLabel: "Largest Contentful Paint",
          currentValue: 4.35,
          threshold: 4.0,
          unit: "s",
          status: "poor",
          timestamp: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
          formattedTime: "28 dk önce",
          affectedUrl: "https://alanadi.com/urunler/kategori",
          device: "mobile",
          message: "Mobil ağda LCP 4.35s seviyesine yükselerek Google 'Kötü' eşiğini (>4.0s) aştı!",
          recommendation: "Hero görselinin WebP/AVIF formatında sunulduğundan ve CDN Edge önbelleğinde olduğundan emin olun.",
          isRead: false,
          isDismissed: false
        },
        {
          id: "cwv-alert-seed-2",
          metric: "CLS",
          metricLabel: "Cumulative Layout Shift",
          currentValue: 0.28,
          threshold: 0.25,
          unit: "",
          status: "poor",
          timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
          formattedTime: "3 saat önce",
          affectedUrl: "https://alanadi.com/",
          device: "desktop",
          message: "Masaüstü ana sayfada dinamik banner yüklenirken CLS 0.28 skoruna ulaştı!",
          recommendation: "Görsel kapsayıcı elementine kesin 'min-height' ve aspect-ratio stili tanımlayın.",
          isRead: true,
          isDismissed: false
        }
      ];
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(initialSeed));
      return initialSeed;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load CWV alert history:", e);
    return [];
  }
}

/**
 * Save alert history to localStorage
 */
export function saveAlertHistory(alerts: CoreWebVitalsAlertItem[]): void {
  if (typeof window === "undefined") return;
  try {
    // Keep max 50 recent alerts
    const trimmed = alerts.slice(0, 50);
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(trimmed));
    window.dispatchEvent(new CustomEvent("cwv-alert-history-updated", { detail: trimmed }));
  } catch (e) {
    console.error("Failed to save CWV alert history:", e);
  }
}

/**
 * Check browser notification permission status
 */
export function getBrowserNotificationPermission(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}

/**
 * Request browser notification permission from user
 */
export async function requestBrowserNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (e) {
    console.warn("Notification requestPermission error:", e);
    return Notification.permission;
  }
}

/**
 * Plays a modern, pleasant Web Audio notification chime
 */
export function playAlertChime(): void {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    // Note 1 (587.33 Hz - D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
    gain1.gain.setValueAtTime(0.08, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.35);

    // Note 2 (880.00 Hz - A5) slightly delayed
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(880.00, ctx.currentTime + 0.12);
    gain2.gain.setValueAtTime(0.09, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.55);
  } catch (e) {
    // AudioContext autoplay restrictions are handled gracefully
  }
}

/**
 * Dispatches a native browser notification
 */
export function triggerNativeBrowserNotification(alert: CoreWebVitalsAlertItem): boolean {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }

  if (Notification.permission !== "granted") {
    return false;
  }

  try {
    const title = `🚨 Core Web Vitals Uyarısı: ${alert.metric} Kötü Eşiği Aşıldı!`;
    const options: NotificationOptions = {
      body: `${alert.metricLabel}: ${alert.currentValue}${alert.unit} (Google Kötü Eşiği: >${alert.threshold}${alert.unit})\n${alert.recommendation}`,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: `cwv-poor-alert-${alert.metric}-${alert.id}`,
      requireInteraction: false
    };

    const notification = new Notification(title, options);
    notification.onclick = () => {
      window.focus();
      notification.close();
      window.dispatchEvent(new CustomEvent("cwv-alert-clicked", { detail: alert }));
    };

    return true;
  } catch (e) {
    console.warn("Could not dispatch native browser notification:", e);
    return false;
  }
}

/**
 * Check if metric is currently in cooldown to prevent spamming
 */
function isMetricInCooldown(metric: CoreVitalMetric, cooldownSeconds: number): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COOLDOWN);
    if (!raw) return false;
    const map = JSON.parse(raw);
    const lastTimestamp = map[metric];
    if (!lastTimestamp) return false;
    const elapsedSeconds = (Date.now() - lastTimestamp) / 1000;
    return elapsedSeconds < cooldownSeconds;
  } catch (e) {
    return false;
  }
}

/**
 * Record cooldown timestamp for metric
 */
function recordMetricCooldown(metric: CoreVitalMetric): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COOLDOWN);
    const map = raw ? JSON.parse(raw) : {};
    map[metric] = Date.now();
    localStorage.setItem(STORAGE_KEY_COOLDOWN, JSON.stringify(map));
  } catch (e) {
    // Ignore storage issues
  }
}

/**
 * Evaluate real-time readings against predefined poor thresholds
 * Triggers browser notification and adds to alert history if poor threshold exceeded
 */
export function evaluateRealtimeCoreWebVitals(
  reading: {
    lcp: number;
    cls: number;
    fid: number;
    url?: string;
    device?: "mobile" | "desktop";
  },
  customConfig?: CoreWebVitalsAlertConfig
): CoreWebVitalsAlertItem[] {
  const config = customConfig || loadAlertConfig();
  if (!config.isRealtimeMonitoringEnabled) return [];

  const { thresholds, cooldownSeconds } = config;
  const newAlerts: CoreWebVitalsAlertItem[] = [];
  const currentUrl = reading.url || (typeof window !== "undefined" ? window.location.pathname : "/");
  const currentDevice = reading.device || "mobile";
  const now = new Date();
  const timeStr = now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  // 1. Check LCP (Largest Contentful Paint)
  if (reading.lcp > thresholds.lcpPoor && !isMetricInCooldown("LCP", cooldownSeconds)) {
    recordMetricCooldown("LCP");
    newAlerts.push({
      id: `cwv-lcp-${Date.now()}`,
      metric: "LCP",
      metricLabel: "Largest Contentful Paint (Yükleme Hızı)",
      currentValue: Number(reading.lcp.toFixed(2)),
      threshold: thresholds.lcpPoor,
      unit: "s",
      status: "poor",
      timestamp: now.toISOString(),
      formattedTime: timeStr,
      affectedUrl: currentUrl,
      device: currentDevice,
      message: `LCP değeri ${reading.lcp.toFixed(2)}s seviyesine yükselerek Google 'Kötü' eşiğini (>${thresholds.lcpPoor}s) aştı!`,
      recommendation: "Görselleri AVIF/WebP olarak sunun, Cloudflare Early Hints uygulayın ve kritik CSS'i inline hale getirin.",
      isRead: false,
      isDismissed: false
    });
  }

  // 2. Check CLS (Cumulative Layout Shift)
  if (reading.cls > thresholds.clsPoor && !isMetricInCooldown("CLS", cooldownSeconds)) {
    recordMetricCooldown("CLS");
    newAlerts.push({
      id: `cwv-cls-${Date.now()}`,
      metric: "CLS",
      metricLabel: "Cumulative Layout Shift (Yerleşim Kayması)",
      currentValue: Number(reading.cls.toFixed(3)),
      threshold: thresholds.clsPoor,
      unit: "",
      status: "poor",
      timestamp: now.toISOString(),
      formattedTime: timeStr,
      affectedUrl: currentUrl,
      device: currentDevice,
      message: `CLS değeri ${reading.cls.toFixed(3)} skoruna ulaşarak Google 'Kötü' eşiğini (>${thresholds.clsPoor}) aştı!`,
      recommendation: "Tüm resim ve reklam öğelerine kesin aspect-ratio veya genişlik/yükseklik boyutları tanımlayın.",
      isRead: false,
      isDismissed: false
    });
  }

  // 3. Check FID (First Input Delay)
  if (reading.fid > thresholds.fidPoor && !isMetricInCooldown("FID", cooldownSeconds)) {
    recordMetricCooldown("FID");
    newAlerts.push({
      id: `cwv-fid-${Date.now()}`,
      metric: "FID",
      metricLabel: "First Input Delay (İlk Girdi Gecikmesi)",
      currentValue: Math.round(reading.fid),
      threshold: thresholds.fidPoor,
      unit: "ms",
      status: "poor",
      timestamp: now.toISOString(),
      formattedTime: timeStr,
      affectedUrl: currentUrl,
      device: currentDevice,
      message: `FID gecikmesi ${Math.round(reading.fid)}ms seviyesine fırlayarak Google 'Kötü' eşiğini (>${thresholds.fidPoor}ms) aştı!`,
      recommendation: "Uzun süren JavaScript görevlerini bölün (code-splitting) ve gereksiz üçüncü taraf scriptlerini kaldırın.",
      isRead: false,
      isDismissed: false
    });
  }

  // Process triggered alerts
  if (newAlerts.length > 0) {
    const currentHistory = loadAlertHistory();
    const updatedHistory = [...newAlerts, ...currentHistory];
    saveAlertHistory(updatedHistory);

    newAlerts.forEach((alert) => {
      // 1. Native browser notification
      if (config.browserNotificationsEnabled) {
        triggerNativeBrowserNotification(alert);
      }

      // 2. Subtle audio chime
      if (config.soundEnabled) {
        playAlertChime();
      }

      // 3. Dispatch in-app real-time event for UI toast / widgets
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cwv-performance-alert", { detail: alert }));
      }
    });
  }

  return newAlerts;
}

/**
 * Simulates an intentional metric spike above the poor threshold
 * Allows the user to test the real-time notification system immediately
 */
export function simulateMetricSpike(
  metric: CoreVitalMetric,
  customConfig?: CoreWebVitalsAlertConfig
): CoreWebVitalsAlertItem {
  const config = customConfig || loadAlertConfig();
  const { thresholds } = config;
  const now = new Date();
  const timeStr = now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  let simulatedItem: CoreWebVitalsAlertItem;

  if (metric === "LCP") {
    const spikeValue = Number((thresholds.lcpPoor + 0.45 + Math.random() * 0.5).toFixed(2));
    simulatedItem = {
      id: `cwv-sim-lcp-${Date.now()}`,
      metric: "LCP",
      metricLabel: "Largest Contentful Paint (Yükleme Hızı)",
      currentValue: spikeValue,
      threshold: thresholds.lcpPoor,
      unit: "s",
      status: "poor",
      timestamp: now.toISOString(),
      formattedTime: timeStr,
      affectedUrl: "https://alanadi.com/katalog",
      device: "mobile",
      message: `Mobil ağda LCP ${spikeValue}s seviyesine yükselerek Google 'Kötü' eşiğini (>${thresholds.lcpPoor}s) aştı!`,
      recommendation: "Hero görselinin WebP/AVIF formatında sunulduğundan ve Cloudflare CDN Edge önbelleğinde olduğundan emin olun.",
      isRead: false,
      isDismissed: false
    };
  } else if (metric === "CLS") {
    const spikeValue = Number((thresholds.clsPoor + 0.08 + Math.random() * 0.1).toFixed(3));
    simulatedItem = {
      id: `cwv-sim-cls-${Date.now()}`,
      metric: "CLS",
      metricLabel: "Cumulative Layout Shift (Yerleşim Kayması)",
      currentValue: spikeValue,
      threshold: thresholds.clsPoor,
      unit: "",
      status: "poor",
      timestamp: now.toISOString(),
      formattedTime: timeStr,
      affectedUrl: "https://alanadi.com/",
      device: "desktop",
      message: `Ana sayfada CLS ${spikeValue} skoruna fırlayarak Google 'Kötü' eşiğini (>${thresholds.clsPoor}) aştı!`,
      recommendation: "Dinamik yüklenen banner ve görsel kapsayıcılarına kesin 'min-height' ve aspect-ratio uygulayın.",
      isRead: false,
      isDismissed: false
    };
  } else {
    const spikeValue = Math.round(thresholds.fidPoor + 45 + Math.random() * 80);
    simulatedItem = {
      id: `cwv-sim-fid-${Date.now()}`,
      metric: "FID",
      metricLabel: "First Input Delay (İlk Girdi Gecikmesi)",
      currentValue: spikeValue,
      threshold: thresholds.fidPoor,
      unit: "ms",
      status: "poor",
      timestamp: now.toISOString(),
      formattedTime: timeStr,
      affectedUrl: "https://alanadi.com/iletisim",
      device: "mobile",
      message: `İletişim formunda FID gecikmesi ${spikeValue}ms seviyesine çıkarak Google 'Kötü' eşiğini (>${thresholds.fidPoor}ms) aştı!`,
      recommendation: "JavaScript bundle boyutunu küçültün ve analiz scriptlerini 'defer' ile erteleyin.",
      isRead: false,
      isDismissed: false
    };
  }

  // Save to history
  const currentHistory = loadAlertHistory();
  const updatedHistory = [simulatedItem, ...currentHistory];
  saveAlertHistory(updatedHistory);

  // Trigger browser notification
  if (config.browserNotificationsEnabled) {
    triggerNativeBrowserNotification(simulatedItem);
  }

  // Play sound
  if (config.soundEnabled) {
    playAlertChime();
  }

  // Dispatch event for UI
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("cwv-performance-alert", { detail: simulatedItem }));
  }

  return simulatedItem;
}
