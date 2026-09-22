import React, { useEffect, useState } from "react";
import { CoreWebVitalsAlertItem } from "../../types";
import { 
  getBrowserNotificationPermission, 
  requestBrowserNotificationPermission 
} from "../../utils/performanceAlertEngine";
import { 
  AlertTriangle, 
  X, 
  Zap, 
  Clock, 
  Layers, 
  Bell, 
  BellRing, 
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Volume2
} from "lucide-react";

export interface PerformanceAlertToastProps {
  onOpenAlertManager?: () => void;
  onNavigateTab?: (tab: string) => void;
  autoCloseDelayMs?: number; // default 9000ms
}

export const PerformanceAlertToast: React.FC<PerformanceAlertToastProps> = ({
  onOpenAlertManager,
  onNavigateTab,
  autoCloseDelayMs = 9000
}) => {
  const [activeAlert, setActiveAlert] = useState<CoreWebVitalsAlertItem | null>(null);
  const [progress, setProgress] = useState(100);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");

  useEffect(() => {
    setPermission(getBrowserNotificationPermission());

    const handleAlertEvent = (e: CustomEvent<CoreWebVitalsAlertItem>) => {
      if (e.detail) {
        setActiveAlert(e.detail);
        setProgress(100);
      }
    };

    window.addEventListener("cwv-performance-alert" as any, handleAlertEvent);
    return () => {
      window.removeEventListener("cwv-performance-alert" as any, handleAlertEvent);
    };
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!activeAlert) return;

    const stepMs = 100;
    const decrement = (stepMs / autoCloseDelayMs) * 100;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setActiveAlert(null);
          return 0;
        }
        return prev - decrement;
      });
    }, stepMs);

    return () => clearInterval(interval);
  }, [activeAlert, autoCloseDelayMs]);

  if (!activeAlert) return null;

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case "LCP": return <Zap className="w-5 h-5 text-rose-400" />;
      case "CLS": return <Layers className="w-5 h-5 text-indigo-400" />;
      case "FID": return <Clock className="w-5 h-5 text-amber-400" />;
      default: return <AlertTriangle className="w-5 h-5 text-rose-400" />;
    }
  };

  const handleEnableNotifications = async () => {
    const res = await requestBrowserNotificationPermission();
    setPermission(res);
  };

  return (
    <div
      id="cwv-realtime-performance-alert-toast"
      className="fixed bottom-5 right-5 z-50 max-w-md w-[92vw] sm:w-[440px] bg-slate-900/95 backdrop-blur-md border-2 border-rose-500/80 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300 text-white font-sans"
    >
      {/* Countdown progress bar */}
      <div className="w-full bg-slate-800 h-1">
        <div 
          className="bg-rose-500 h-full transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-4 sm:p-5">
        {/* Header Badge */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-rose-950/80 text-rose-300 border border-rose-800/80 text-[10px] font-black uppercase tracking-wider">
              Google CWV 'Kötü' Eşiği Aşıldı
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {activeAlert.formattedTime}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setActiveAlert(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0 mt-0.5">
            {getMetricIcon(activeAlert.metric)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <h4 className="text-sm font-black text-white truncate">
                {activeAlert.metric}: {activeAlert.metricLabel}
              </h4>
              <span className="text-sm font-black text-rose-400 font-mono shrink-0">
                {activeAlert.currentValue}{activeAlert.unit}
              </span>
            </div>
            <p className="text-xs text-rose-200/90 mt-0.5 line-clamp-2">
              {activeAlert.message}
            </p>
            <div className="mt-1.5 text-[11px] text-slate-300 bg-slate-800/80 p-2 rounded-lg border border-slate-700/80">
              <strong className="text-amber-400">Öneri:</strong> {activeAlert.recommendation}
            </div>
          </div>
        </div>

        {/* Browser notification permission hint banner if not enabled */}
        {permission !== "granted" && permission !== "unsupported" && (
          <div className="mb-3 px-2.5 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-800/60 flex items-center justify-between gap-2 text-[11px]">
            <span className="text-indigo-200 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-indigo-400" />
              Masaüstü bildirimleri kapalı
            </span>
            <button
              type="button"
              onClick={handleEnableNotifications}
              className="text-indigo-300 hover:text-white font-bold underline cursor-pointer"
            >
              Tarayıcı İzni Ver
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-rose-400" />
            <span>Kötü Eşik: &gt;{activeAlert.threshold}{activeAlert.unit}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveAlert(null)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Sustur
            </button>
            {onOpenAlertManager && (
              <button
                type="button"
                id="btn-alert-toast-view-details"
                onClick={() => {
                  setActiveAlert(null);
                  onOpenAlertManager();
                }}
                className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <span>Uyarı Detayları</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
