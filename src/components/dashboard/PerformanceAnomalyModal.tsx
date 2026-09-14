import React, { useState } from "react";
import {
  PerformanceCriticalAlert,
  SiteConfig,
  CustomerPanelTab
} from "../../types";
import {
  AlertTriangle,
  Zap,
  CheckCircle2,
  X,
  TrendingDown,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Bell,
  Settings2,
  Check,
  Globe,
  Sliders,
  Sparkles,
  Info
} from "lucide-react";

interface PerformanceAnomalyModalProps {
  alert: PerformanceCriticalAlert;
  config: SiteConfig;
  isOpen: boolean;
  onClose: () => void;
  onResolve: (alertId: string) => void;
  onNavigateTab?: (tab: CustomerPanelTab) => void;
}

export const PerformanceAnomalyModal: React.FC<PerformanceAnomalyModalProps> = ({
  alert,
  config,
  isOpen,
  onClose,
  onResolve,
  onNavigateTab
}) => {
  const [activeTab, setActiveTab] = useState<"diagnosis" | "settings">("diagnosis");
  const [isResolving, setIsResolving] = useState(false);
  const [isResolvedSuccess, setIsResolvedSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Settings State
  const [thresholdPercent, setThresholdPercent] = useState<number>(30);
  const [notifyEmail, setNotifyEmail] = useState<boolean>(true);
  const [notifyWhatsApp, setNotifyWhatsApp] = useState<boolean>(true);
  const [emailInput, setEmailInput] = useState<string>("admin@site.com");

  if (!isOpen) return null;

  const handleRunAutoFix = () => {
    setIsResolving(true);
    setTimeout(() => {
      setIsResolving(false);
      setIsResolvedSuccess(true);
      onResolve(alert.id);
      setToastMessage("Otomatik onarım başarıyla uygulandı ve test edildi!");
      setTimeout(() => {
        onClose();
      }, 2200);
    }, 1200);
  };

  const isCritical = alert.severity === "critical";

  return (
    <div
      id="performance-anomaly-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id="performance-anomaly-modal-container"
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* MODAL HEADER */}
        <div className={`p-6 border-b flex items-start justify-between gap-4 ${
          isCritical 
            ? "bg-rose-50/70 border-rose-100" 
            : "bg-amber-50/70 border-amber-100"
        }`}>
          <div className="flex items-start gap-3.5">
            <div className={`p-3 rounded-2xl ${
              isCritical ? "bg-rose-600 text-white" : "bg-amber-500 text-white"
            }`}>
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  isCritical 
                    ? "bg-rose-100 text-rose-800 border border-rose-200" 
                    : "bg-amber-100 text-amber-800 border border-amber-200"
                }`}>
                  {isCritical ? "Kritik Performans Uyarısı" : "Performans Sapması"}
                </span>

                <span className="text-xs text-slate-500 font-medium">
                  {alert.detectedAt}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                {alert.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white/80 transition-colors cursor-pointer"
            title="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL TABS */}
        <div className="flex items-center gap-4 px-6 border-b border-slate-100 text-xs font-bold bg-slate-50/50">
          <button
            type="button"
            onClick={() => setActiveTab("diagnosis")}
            className={`py-3 border-b-2 transition-all cursor-pointer ${
              activeTab === "diagnosis"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Detaylı Teşhis & Kök Neden Analizi
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`py-3 border-b-2 transition-all cursor-pointer ${
              activeTab === "settings"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Uyarı Eşikleri & Bildirim Ayarları
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-700 text-xs leading-relaxed">
          {activeTab === "diagnosis" ? (
            <>
              {/* Metric Delta Comparison Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Normal Beklenen Seviye
                  </div>
                  <div className="text-base font-black text-slate-800 mt-1">
                    {alert.baselineValue}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">30 Günlük Geçmiş Ort.</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200">
                  <div className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
                    Tespit Edilen Anomali
                  </div>
                  <div className="text-base font-black text-rose-700 mt-1">
                    {alert.currentValue}
                  </div>
                  <div className="text-[10px] text-rose-600 font-bold mt-0.5">
                    {alert.percentageChange > 0 ? `+${alert.percentageChange}%` : `${alert.percentageChange}%`} Değişim
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200">
                  <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                    Tahmini Etki / Kayıp
                  </div>
                  <div className="text-xs font-bold text-amber-950 mt-1">
                    {alert.estimatedLostLeadsOrRevenue || "Müşteri Trafiği Kaybı"}
                  </div>
                  <div className="text-[10px] text-amber-700 mt-0.5">Müdahale Gerektirir</div>
                </div>
              </div>

              {/* Anomaly Description */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="font-black text-slate-900 text-xs">
                  Anomali Açıklaması:
                </div>
                <p className="text-slate-600 leading-relaxed text-xs">
                  {alert.description}
                </p>
                <div className="text-[11px] text-slate-500 pt-1 font-semibold">
                  Etkilenen Kaynak / URL: <strong>{alert.affectedPageOrSource}</strong>
                </div>
              </div>

              {/* Root Cause Breakdown */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-900 uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Yapay Zeka Teşhisi: Olası Kök Nedenler</span>
                </div>

                <div className="space-y-2">
                  {alert.rootCauses.map((cause, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5 shadow-2xs"
                    >
                      <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-800 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{cause}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Fix Box */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2">
                <div className="flex items-center gap-1.5 font-black text-indigo-950 text-xs">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Tavsiye Edilen Otomatik Çözüm Eylemi:</span>
                </div>
                <p className="text-xs text-indigo-900 leading-relaxed">
                  {alert.recommendedFixAction}
                </p>
              </div>

              {/* Toast Feedback */}
              {toastMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{toastMessage}</span>
                </div>
              )}
            </>
          ) : (
            /* SETTINGS TAB */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  <span>Anomali Tespit Hassasiyeti</span>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-600 mb-1.5 font-medium">
                    <span>Dönüşüm Düşüşü Tetikleme Eşiği:</span>
                    <strong>%{thresholdPercent} Düşüş</strong>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="60"
                    step="5"
                    value={thresholdPercent}
                    onChange={(e) => setThresholdPercent(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="text-[11px] text-slate-400 mt-1">
                    Son 4 saatlik dönüşüm oranı bu yüzdeden fazla düşerse anında uyarı tetiklenir.
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                  <Bell className="w-4 h-4 text-indigo-600" />
                  <span>Bildirim Kanalları</span>
                </div>

                <div className="space-y-2.5">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyEmail}
                      onChange={(e) => setNotifyEmail(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 accent-indigo-600"
                    />
                    <div className="text-xs">
                      <div className="font-semibold text-slate-800">E-Posta Bildirimi</div>
                      <div className="text-slate-500 text-[11px]">Kritik anomali anında yönetici e-postasına uyarı gönder</div>
                    </div>
                  </label>

                  {notifyEmail && (
                    <div className="pl-7">
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="admin@site.com"
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-800 focus:outline-hidden focus:border-indigo-600"
                      />
                    </div>
                  )}

                  <label className="flex items-center gap-3 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={notifyWhatsApp}
                      onChange={(e) => setNotifyWhatsApp(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 accent-indigo-600"
                    />
                    <div className="text-xs">
                      <div className="font-semibold text-slate-800">WhatsApp / Webhook Uyarısı</div>
                      <div className="text-slate-500 text-[11px]">Kritik düşüşlerde webhook üzerinden anlık cep telefonu bildirimi</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER ACTIONS */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            Kapat
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {alert.actionTab && onNavigateTab && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateTab(alert.actionTab!);
                }}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-200/80 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>İlgili Sekmeyi Aç</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              id="anomaly-autofix-btn"
              onClick={handleRunAutoFix}
              disabled={isResolving || isResolvedSuccess}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isResolving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : isResolvedSuccess ? (
                <Check className="w-4 h-4 stroke-[3] text-emerald-300" />
              ) : (
                <Zap className="w-4 h-4 text-amber-300" />
              )}
              <span>
                {isResolving 
                  ? "Onarılıyor..." 
                  : isResolvedSuccess 
                  ? "Onarım Tamamlandı!" 
                  : alert.actionButtonText || "Tek Tıkla Otomatik Onar"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
