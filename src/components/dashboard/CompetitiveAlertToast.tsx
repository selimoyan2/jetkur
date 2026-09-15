import React, { useEffect, useState } from "react";
import { SeoCompetitiveAlert, CustomerPanelTab } from "../../types";
import { 
  AlertTriangle, 
  Sparkles, 
  X, 
  ArrowRight, 
  TrendingDown, 
  BellRing,
  ExternalLink,
  ChevronRight
} from "lucide-react";

export interface CompetitiveAlertToastProps {
  alert: SeoCompetitiveAlert | null;
  onClose: () => void;
  onOpenAlertCenter: () => void;
  onTakeAction?: (alert: SeoCompetitiveAlert) => void;
  autoCloseDelay?: number; // ms, default 10000
}

export const CompetitiveAlertToast: React.FC<CompetitiveAlertToastProps> = ({
  alert,
  onClose,
  onOpenAlertCenter,
  onTakeAction,
  autoCloseDelay = 10000
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!alert) return;
    setProgress(100);

    const stepMs = 100;
    const decrement = (stepMs / autoCloseDelay) * 100;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onClose();
          return 0;
        }
        return prev - decrement;
      });
    }, stepMs);

    return () => clearInterval(interval);
  }, [alert, autoCloseDelay, onClose]);

  if (!alert) return null;

  return (
    <div 
      id="competitive-alert-push-toast"
      className="fixed bottom-5 right-5 z-50 max-w-md w-full sm:w-[420px] bg-slate-900 border border-amber-500/50 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300 text-white"
    >
      {/* Progress countdown line */}
      <div className="w-full bg-slate-800 h-1">
        <div 
          className="bg-gradient-to-r from-amber-400 to-rose-500 h-1 transition-all ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-4 space-y-3">
        {/* Header bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <BellRing className="w-3 h-3 text-rose-400" />
              <span>SEO Rekabet Alarmı</span>
            </span>
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30">
              {alert.severity === "critical" ? "Kritik Gerileme" : "Sıralama Değişimi"}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            title="Kapat"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-1">
          <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
            {alert.title}
          </h4>
          <p className="text-xs text-slate-300 line-clamp-2">
            {alert.description}
          </p>
        </div>

        {/* Comparison Mini Bar */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-xs">
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400">Rakip ({alert.competitorName})</span>
            <div className="font-bold font-mono text-amber-400 flex items-center gap-1">
              <span>#{alert.competitorRank}</span>
              <span className="text-[10px] text-emerald-400">({alert.competitorRankChange ? `+${alert.competitorRankChange}` : 'Önde'})</span>
            </div>
          </div>

          <div className="text-center font-mono text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
            {alert.rankDelta > 0 ? `-${alert.rankDelta} sıra geride` : 'Kayıp'}
          </div>

          <div className="space-y-0.5 text-right">
            <span className="text-[10px] text-slate-400">Siteniz</span>
            <div className="font-bold font-mono text-slate-200">
              {alert.userRank ? `#${alert.userRank}` : 'İlk 20 Dışı'}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenAlertCenter();
            }}
            className="text-xs text-slate-400 hover:text-white font-medium flex items-center gap-1 transition-colors"
          >
            <span>Tüm Alarmları Gör</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              if (onTakeAction) {
                onTakeAction(alert);
              } else {
                onOpenAlertCenter();
              }
            }}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
            <span>{alert.recommendedAction?.label || "Aksiyon Al"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
