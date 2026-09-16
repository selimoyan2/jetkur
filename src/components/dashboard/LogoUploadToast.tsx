import React, { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, Info, X, RefreshCw, Sparkles, Image as ImageIcon } from "lucide-react";

export interface LogoToastInfo {
  type: "success" | "error" | "info";
  title: string;
  message: string;
  fileName?: string;
  fileSize?: number;
  previewUrl?: string;
  dimensions?: { width: number; height: number };
  savingsPercentage?: number;
  onRetry?: () => void;
}

interface LogoUploadToastProps {
  toast: LogoToastInfo | null;
  onClose: () => void;
  autoCloseDelay?: number; // ms, default 5000
}

export const LogoUploadToast: React.FC<LogoUploadToastProps> = ({
  toast,
  onClose,
  autoCloseDelay = 5000
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!toast) return;
    setProgress(100);

    // If error, keep longer (7000ms) so user can read message and retry
    const delay = toast.type === "error" ? Math.max(autoCloseDelay, 7500) : autoCloseDelay;
    const stepMs = 100;
    const decrement = (stepMs / delay) * 100;

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
  }, [toast, autoCloseDelay, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === "success";
  const isError = toast.type === "error";

  const borderColor = isSuccess
    ? "border-emerald-500/50"
    : isError
    ? "border-rose-500/60"
    : "border-sky-500/50";

  const progressBg = isSuccess
    ? "bg-emerald-500"
    : isError
    ? "bg-rose-500"
    : "bg-sky-500";

  return (
    <div
      id="logo-upload-notification-toast"
      role="alert"
      className={`fixed bottom-5 right-5 z-50 max-w-md w-full sm:w-[420px] bg-slate-900 border ${borderColor} rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300 text-white`}
    >
      {/* Progress countdown line */}
      <div className="w-full bg-slate-800 h-1">
        <div
          className={`h-full ${progressBg} transition-all duration-100 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Status Icon */}
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isSuccess
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : isError
                ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                : "bg-sky-500/20 text-sky-400 border border-sky-500/30"
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : isError ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <Info className="w-5 h-5" />
            )}
          </div>

          {/* Main Body */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
                <span>{toast.title}</span>
                {isSuccess && toast.savingsPercentage !== undefined && toast.savingsPercentage > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/40">
                    %{toast.savingsPercentage} WebP
                  </span>
                )}
              </h4>
              <button
                type="button"
                id="close-logo-toast-btn"
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                aria-label="Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed break-words">
              {toast.message}
            </p>

            {/* Thumbnail Preview & Dimension Metadata */}
            {isSuccess && toast.previewUrl && (
              <div className="mt-2.5 flex items-center gap-3 p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="w-12 h-10 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0 p-1">
                  <img
                    src={toast.previewUrl}
                    alt="Logo Önizleme"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1 text-[11px] text-slate-400">
                  <div className="font-bold text-white truncate">
                    {toast.fileName || "Yeni Logo"}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                    {toast.dimensions && toast.dimensions.width > 0 && (
                      <span>{toast.dimensions.width}×{toast.dimensions.height}px</span>
                    )}
                    <span>• Canlı yayında aktif</span>
                  </div>
                </div>
              </div>
            )}

            {/* Error Action / Retry */}
            {isError && toast.onRetry && (
              <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-end">
                <button
                  type="button"
                  id="retry-logo-upload-btn"
                  onClick={() => {
                    onClose();
                    toast.onRetry?.();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Tekrar Dosya Seç</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
