import React from "react";
import { 
  X, 
  Activity, 
  Clock, 
  Download, 
  Trash2, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCw, 
  ExternalLink,
  Smartphone,
  Monitor,
  Server
} from "lucide-react";
import { PageSpeedSyncLogEntry } from "../../services/pagespeedSyncService";

interface PageSpeedSyncLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: PageSpeedSyncLogEntry[];
  onClearLogs: () => void;
  onTriggerSync: () => void;
  isSyncing: boolean;
  activeStrategy: "mobile" | "desktop";
}

export const PageSpeedSyncLogsModal: React.FC<PageSpeedSyncLogsModalProps> = ({
  isOpen,
  onClose,
  logs,
  onClearLogs,
  onTriggerSync,
  isSyncing,
  activeStrategy,
}) => {
  if (!isOpen) return null;

  // Export logs to CSV
  const handleExportCsv = () => {
    if (logs.length === 0) return;

    const rows: string[] = [
      "Zaman,Strateji,Hedef Domain,Ad,Skor,LCP (s),INP (ms),CLS,FCP (s),TTFB (ms),CWV Durum,Kaynak,Darboğaz",
    ];

    logs.forEach((log) => {
      log.results.forEach((res) => {
        const m = res.metrics;
        const line = [
          `"${log.timeFormatted}"`,
          `"${log.strategy}"`,
          `"${res.domain}"`,
          `"${res.name}"`,
          m.score,
          m.lcp,
          m.inp,
          m.cls,
          m.fcp,
          m.ttfb,
          `"${m.passedCWV ? "Geçti" : "Başarısız"}"`,
          `"${res.source}"`,
          `"${(m.bottleneck || "").replace(/"/g, '""')}"`,
        ].join(",");
        rows.push(line);
      });
    });

    const blob = new Blob(["\uFEFF" + rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `google-pagespeed-sync-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      id="pagespeed-sync-logs-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="pagespeed-sync-logs-modal"
        className="w-full max-w-4xl max-h-[85vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>Google PageSpeed Senkronizasyon Günlüğü</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/30 uppercase">
                  Canlı Servis
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Google PageSpeed Insights API ve Lighthouse v12 motoruna gönderilen tüm periyodik denetim kayıtları.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onTriggerSync}
              disabled={isSyncing}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 active:scale-95 shadow-md shadow-amber-500/20"
              title="Şimdi tüm rakipleri yeniden tara"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Taranıyor..." : "Şimdi Tara"}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar Info & Actions */}
        <div className="px-5 py-3 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span>Toplam Kayıt: <strong className="text-white">{logs.length} Denetim Döngüsü</strong></span>
            <span>•</span>
            <span className="flex items-center gap-1">
              {activeStrategy === "mobile" ? (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-slate-300">Mobil Modu Aktif</span>
                </>
              ) : (
                <>
                  <Monitor className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-slate-300">Masaüstü Modu Aktif</span>
                </>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={logs.length === 0}
              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs text-slate-300 hover:text-white font-medium flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>CSV Olarak İndir</span>
            </button>

            <button
              type="button"
              onClick={onClearLogs}
              disabled={logs.length === 0}
              className="px-3 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 disabled:opacity-40 text-xs text-rose-300 font-medium flex items-center gap-1.5 transition-all cursor-pointer border border-rose-900/40"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Günlüğü Temizle</span>
            </button>
          </div>
        </div>

        {/* Content Logs List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {logs.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                <Clock className="w-7 h-7" />
              </div>
              <p className="text-sm text-slate-400">Henüz kayıtlı bir senkronizasyon geçmişi yok.</p>
              <button
                type="button"
                onClick={onTriggerSync}
                className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all cursor-pointer"
              >
                İlk Otomatik Taramayı Başlat
              </button>
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3"
              >
                {/* Round Header */}
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-bold text-white">{log.timeFormatted}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">{log.targetsCount} URL tarandı</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400 font-mono">{log.durationMs}ms</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-mono text-slate-300 uppercase">
                      {log.strategy}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold border border-indigo-500/30">
                      {log.source === "google-pagespeed-api" ? "Google PSI v5 API" : "Lighthouse v12 Calibrated"}
                    </span>
                  </div>
                </div>

                {/* Grid of Results */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {log.results.map((res) => {
                    const m = res.metrics;
                    const scoreColor =
                      m.score >= 90
                        ? "text-emerald-400 border-emerald-500/40 bg-emerald-500/10"
                        : m.score >= 50
                        ? "text-amber-400 border-amber-500/40 bg-amber-500/10"
                        : "text-rose-400 border-rose-500/40 bg-rose-500/10";

                    return (
                      <div
                        key={res.id}
                        className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-2"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div className="truncate">
                            <div className="text-xs font-bold text-white truncate" title={res.name}>
                              {res.isUser ? `★ ${res.name}` : res.name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono truncate" title={res.domain}>
                              {res.domain}
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded-lg text-xs font-mono font-black border ${scoreColor}`}>
                            {m.score}
                          </span>
                        </div>

                        {/* Core metrics */}
                        <div className="grid grid-cols-3 gap-1 text-center bg-slate-950/60 p-1.5 rounded-lg text-[10px] font-mono">
                          <div>
                            <div className="text-slate-500">LCP</div>
                            <div className={m.lcp <= 2.5 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                              {m.lcp}s
                            </div>
                          </div>
                          <div>
                            <div className="text-slate-500">INP</div>
                            <div className={m.inp <= 200 ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                              {m.inp}ms
                            </div>
                          </div>
                          <div>
                            <div className="text-slate-500">CLS</div>
                            <div className={m.cls <= 0.1 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                              {m.cls}
                            </div>
                          </div>
                        </div>

                        {/* Delta indicator if present */}
                        {res.deltas && res.deltas.summaryText !== "Değişiklik yok" && (
                          <div className="text-[10px] text-amber-300 font-semibold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30 truncate">
                            ⚡ {res.deltas.summaryText}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
