import React, { useState, useEffect } from "react";
import {
  SiteConfig,
  PerformanceCriticalAlert,
  PerformanceAnomalyType,
  CustomerPanelTab
} from "../../types";
import {
  detectPerformanceAnomalies,
  resolvePerformanceAnomaly
} from "../../utils/performanceAnomalyDetector";
import { PerformanceAnomalyModal } from "./PerformanceAnomalyModal";
import {
  AlertTriangle,
  Zap,
  CheckCircle2,
  X,
  TrendingDown,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Eye,
  Sliders,
  Sparkles,
  ChevronRight,
  Layers,
  Check
} from "lucide-react";

interface PerformanceCriticalAlertBarProps {
  config: SiteConfig;
  onChange: (updatedConfig: SiteConfig) => void;
  onNavigateTab?: (tab: CustomerPanelTab) => void;
  className?: string;
}

export const PerformanceCriticalAlertBar: React.FC<PerformanceCriticalAlertBarProps> = ({
  config,
  onChange,
  onNavigateTab,
  className = ""
}) => {
  const [simulationMode, setSimulationMode] = useState<PerformanceAnomalyType | "all" | "none">("all");
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>([]);
  const [selectedAlertForModal, setSelectedAlertForModal] = useState<PerformanceCriticalAlert | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [showSimulateMenu, setShowSimulateMenu] = useState(false);

  // Detect active anomalies
  const activeAlerts = detectPerformanceAnomalies(config, {
    forceSimulatedAnomaly: simulationMode,
    dismissedAlertIds
  });

  const handleResolveAlert = (alertId: string) => {
    setResolvingId(alertId);
    setTimeout(() => {
      const { updatedConfig, successMessage } = resolvePerformanceAnomaly(alertId, config);
      onChange(updatedConfig);
      setDismissedAlertIds((prev) => [...prev, alertId]);
      setResolvingId(null);
      setSuccessToast(successMessage);
      setTimeout(() => setSuccessToast(null), 5000);
    }, 900);
  };

  const handleDismiss = (alertId: string) => {
    setDismissedAlertIds((prev) => [...prev, alertId]);
  };

  const currentAlert = activeAlerts[0];

  return (
    <div id="performance-critical-alert-wrapper" className={`space-y-3 ${className}`}>
      {/* SUCCESS TOAST AFTER RESOLUTION */}
      {successToast && (
        <div
          id="performance-anomaly-success-toast"
          className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/90 text-emerald-900 shadow-xs flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold">Performans Anomalisi Başarıyla Giderildi!</div>
              <div className="text-[11px] text-emerald-800 leading-relaxed mt-0.5">{successToast}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-100/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ACTIVE CRITICAL ALERT BANNER */}
      {currentAlert ? (
        <div
          id={`performance-alert-banner-${currentAlert.id}`}
          className={`p-4 sm:p-5 rounded-3xl border shadow-sm transition-all relative overflow-hidden ${
            currentAlert.severity === "critical"
              ? "bg-gradient-to-r from-rose-50 via-rose-50/70 to-amber-50/50 border-rose-200/90 text-rose-950"
              : "bg-gradient-to-r from-amber-50 via-amber-50/70 to-yellow-50/50 border-amber-200/90 text-amber-950"
          }`}
        >
          {/* Subtle decorative edge indicator */}
          <div
            className={`absolute top-0 left-0 w-2 h-full ${
              currentAlert.severity === "critical" ? "bg-rose-500" : "bg-amber-500"
            }`}
          />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pl-2">
            {/* Alert Left Details */}
            <div className="flex items-start gap-3.5 max-w-3xl">
              <div
                className={`p-2.5 rounded-2xl shrink-0 ${
                  currentAlert.severity === "critical"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-amber-500 text-white shadow-xs"
                }`}
              >
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      currentAlert.severity === "critical"
                        ? "bg-rose-200 text-rose-900 border border-rose-300"
                        : "bg-amber-200 text-amber-900 border border-amber-300"
                    }`}
                  >
                    {currentAlert.severity === "critical" ? "Kritik Performans Uyarısı" : "Performans Sapması"}
                  </span>

                  <span className="text-[11px] font-bold text-rose-800 bg-rose-100/80 px-2 py-0.5 rounded-md">
                    {currentAlert.metricName}: {currentAlert.currentValue} ({currentAlert.percentageChange > 0 ? `+${currentAlert.percentageChange}%` : `${currentAlert.percentageChange}%`})
                  </span>

                  <span className="text-[11px] text-slate-500">
                    {currentAlert.detectedAt}
                  </span>
                </div>

                <div className="text-xs sm:text-sm font-black text-slate-900">
                  {currentAlert.title}
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">
                  {currentAlert.description}
                </p>

                {currentAlert.estimatedLostLeadsOrRevenue && (
                  <div className="text-[11px] font-bold text-rose-700 inline-flex items-center gap-1.5 pt-0.5">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>Tahmini Etki: {currentAlert.estimatedLostLeadsOrRevenue}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Alert Right Action Buttons */}
            <div className="flex items-center gap-2 shrink-0 self-start lg:self-center flex-wrap">
              {/* Quick Auto-Fix Button */}
              <button
                type="button"
                id={`autofix-btn-${currentAlert.id}`}
                onClick={() => handleResolveAlert(currentAlert.id)}
                disabled={resolvingId === currentAlert.id}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                title="Yapay zeka tavsiyeli otomatik onarımı uygula"
              >
                {resolvingId === currentAlert.id ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                )}
                <span>{resolvingId === currentAlert.id ? "Onarılıyor..." : currentAlert.actionButtonText}</span>
              </button>

              {/* Detailed Diagnostic Modal Button */}
              <button
                type="button"
                id="open-anomaly-diagnosis-btn"
                onClick={() => setSelectedAlertForModal(currentAlert)}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Eye className="w-3.5 h-3.5 text-indigo-600" />
                <span>Teşhis Raporu</span>
              </button>

              {/* Simulation Mode Menu Button */}
              <div className="relative">
                <button
                  type="button"
                  id="simulate-anomaly-toggle-btn"
                  onClick={() => setShowSimulateMenu(!showSimulateMenu)}
                  className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 text-xs transition-colors cursor-pointer"
                  title="Anomali Test Simülasyonu"
                >
                  <Sliders className="w-3.5 h-3.5" />
                </button>

                {showSimulateMenu && (
                  <div className="absolute right-0 top-full mt-1.5 w-64 p-2 rounded-2xl bg-white border border-slate-200 shadow-xl z-30 text-xs space-y-1">
                    <div className="px-2 py-1 font-bold text-slate-400 text-[10px] uppercase">
                      Anomali Simülasyon Senaryoları
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSimulationMode("conversion_rate_drop");
                        setDismissedAlertIds([]);
                        setShowSimulateMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 font-semibold text-slate-700"
                    >
                      1. Form Dönüşümünde Ani Düşüş (%85.6)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSimulationMode("traffic_source_drop");
                        setDismissedAlertIds([]);
                        setShowSimulateMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 font-semibold text-slate-700"
                    >
                      2. Google Organik Trafik Çöküşü (%42.8)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSimulationMode("bot_spam_surge");
                        setDismissedAlertIds([]);
                        setShowSimulateMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 font-semibold text-slate-700"
                    >
                      3. Şüpheli Bot/Spam Sıçraması (+340%)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSimulationMode("mobile_conversion_disparity");
                        setDismissedAlertIds([]);
                        setShowSimulateMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 font-semibold text-slate-700"
                    >
                      4. Mobil Dönüşüm Kırılması
                    </button>
                    <div className="pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setSimulationMode("none");
                          setShowSimulateMenu(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 text-emerald-700 font-bold"
                      >
                        ✓ Anomalileri Temizle (Normal Durum)
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Dismiss Button */}
              <button
                type="button"
                onClick={() => handleDismiss(currentAlert.id)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white/60 transition-colors cursor-pointer"
                title="Şimdilik gizle"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* HEALTHY MONITORING BAR (COLLAPSIBLE / MINIMAL) */
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-slate-700">
              Performans & Dönüşüm Sağlığı:
            </span>
            <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
              Tüm Metrikler Normal Seviyede
            </span>
            <span className="hidden md:inline text-slate-400 text-[11px]">
              Dönüşüm oranı ve trafik kaynakları 7/24 anomali izleme altında
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSimulationMode("conversion_rate_drop");
                setDismissedAlertIds([]);
              }}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-bold transition-colors cursor-pointer"
              title="Sistemin nasıl uyarı verdiğini görmek için test uyarısı tetikle"
            >
              <Zap className="w-3 h-3 text-amber-500 inline mr-1" />
              <span>Anomali Test Et</span>
            </button>
          </div>
        </div>
      )}

      {/* DIAGNOSTIC MODAL */}
      {selectedAlertForModal && (
        <PerformanceAnomalyModal
          alert={selectedAlertForModal}
          config={config}
          isOpen={true}
          onClose={() => setSelectedAlertForModal(null)}
          onResolve={(alertId) => {
            handleResolveAlert(alertId);
            setSelectedAlertForModal(null);
          }}
          onNavigateTab={onNavigateTab}
        />
      )}
    </div>
  );
};
