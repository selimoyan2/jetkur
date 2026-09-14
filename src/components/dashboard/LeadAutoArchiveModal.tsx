import React, { useState } from "react";
import {
  Archive,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Info,
  X,
  Sliders,
  Calendar,
  Check,
  Tag,
  ShieldAlert,
  Inbox
} from "lucide-react";
import { FormLead, SiteConfig, LeadAutoArchiveConfig } from "../../types";
import {
  DEFAULT_AUTO_ARCHIVE_CONFIG,
  getLeadAgeInDays,
  isLeadEligibleForAutoArchive,
  processAutoArchiveLeads,
  restoreArchivedLead
} from "../../utils/leadAutoArchive";

interface LeadAutoArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SiteConfig;
  onUpdateConfig: (updater: (prev: SiteConfig) => SiteConfig) => void;
  onFilterToArchived?: () => void;
}

export const LeadAutoArchiveModal: React.FC<LeadAutoArchiveModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  onFilterToArchived
}) => {
  const currentSettings: LeadAutoArchiveConfig = {
    ...DEFAULT_AUTO_ARCHIVE_CONFIG,
    ...(config.leadAutoArchive || {})
  };

  const [settings, setSettings] = useState<LeadAutoArchiveConfig>(currentSettings);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [lastArchivedCount, setLastArchivedCount] = useState<number | null>(null);

  if (!isOpen) return null;

  const leads = config.leads || [];
  const currentlyArchivedLeads = leads.filter((l) => l.status === "archived");
  const eligibleLeads = leads.filter((l) => isLeadEligibleForAutoArchive(l, settings));

  const handleToggleEnabled = () => {
    setSettings((prev) => ({ ...prev, enabled: !prev.enabled }));
  };

  const handleSave = () => {
    onUpdateConfig((prev) => ({
      ...prev,
      leadAutoArchive: settings
    }));
    setFeedbackMessage("Otomatik arşivleme ayarları kaydedildi!");
    setTimeout(() => {
      setFeedbackMessage(null);
      onClose();
    }, 1200);
  };

  const handleRunNow = () => {
    const result = processAutoArchiveLeads(leads, settings);
    if (result.archivedCount === 0) {
      setFeedbackMessage("Şu anda 30+ gün inaktif kriterine uyan yeni talep bulunamadı.");
      setTimeout(() => setFeedbackMessage(null), 3500);
      return;
    }

    const nowIso = new Date().toISOString();
    onUpdateConfig((prev) => ({
      ...prev,
      leads: result.updatedLeads,
      leadAutoArchive: {
        ...settings,
        lastRunAt: nowIso,
        totalArchivedCount: (settings.totalArchivedCount || 0) + result.archivedCount
      }
    }));

    setSettings((prev) => ({
      ...prev,
      lastRunAt: nowIso,
      totalArchivedCount: (prev.totalArchivedCount || 0) + result.archivedCount
    }));

    setLastArchivedCount(result.archivedCount);
    setFeedbackMessage(
      `Başarılı: ${result.archivedCount} adet inaktif müşteri talebi arşiv durumuna taşındı!`
    );
    setTimeout(() => setFeedbackMessage(null), 4500);
  };

  const handleAddSampleOldLead = () => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const mockOldLead: FormLead = {
      id: "lead-" + (Date.now() - 35 * 24 * 60 * 60 * 1000), // 35 days ago
      date: "35 gün önce",
      createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
      lastActivityAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
      name: `Cemil Yıldız (35 Günlük İnaktif)`,
      phone: `0532 999 11 ${randomSuffix % 100}`,
      email: `cemil.yildiz${randomSuffix}@eski-ornek.com`,
      serviceOrProduct: "Yol Yardım & Akü",
      message: "35 gün önce iletilen ancak sonrasında herhangi bir işlem yapılmayan eski talep örneği.",
      sourcePage: "Web Teklif Formu",
      status: "new",
      isRead: false,
      dealValue: 850,
      tags: ["Test / Simülasyon"]
    };

    onUpdateConfig((prev) => ({
      ...prev,
      leads: [mockOldLead, ...(prev.leads || [])]
    }));

    setFeedbackMessage(
      `35 günlük inaktif test talebi eklendi! "Şimdi Otomatik Arşivle" butonuna basarak arşivlenmesini test edebilirsiniz.`
    );
    setTimeout(() => setFeedbackMessage(null), 4500);
  };

  const handleRestoreAllArchived = () => {
    if (currentlyArchivedLeads.length === 0) return;
    const restoredLeads = leads.map((l) =>
      l.status === "archived" ? restoreArchivedLead(l, "contacted") : l
    );

    onUpdateConfig((prev) => ({
      ...prev,
      leads: restoredLeads
    }));

    setFeedbackMessage(`${currentlyArchivedLeads.length} adet talep arşivden çıkarıldı ve aktif listeye geri yüklendi.`);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  return (
    <div
      id="lead-auto-archive-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 text-indigo-300 border border-white/10 shadow-inner">
              <Archive className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight text-white">
                  Otomatik Arşivleme Ayarları
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  Lead Auto-Archive
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                30 günden uzun süredir işlem yapılmayan eski talepleri otomatik olarak arşive taşıyın
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedbackMessage && (
          <div className="px-6 py-3 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{feedbackMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackMessage(null)}
              className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 dark:text-slate-300">
          {/* Main Toggle Switch Card */}
          <div className="p-4.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  Otomatik Arşivleme Motoru
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    settings.enabled
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                      : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                  }`}
                >
                  {settings.enabled ? "Aktif" : "Devre Dışı"}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sistem; belirlenen gün eşiğinden eski ve inaktif kalan talepleri otomatik olarak gelen kutusundan arşiv durumuna aktarır.
              </p>
            </div>

            <button
              type="button"
              id="btn-toggle-auto-archive"
              onClick={handleToggleEnabled}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                settings.enabled ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  settings.enabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Configuration Settings */}
          <div className="space-y-4">
            {/* Days Inactive Threshold */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <label className="text-xs font-bold text-slate-900 dark:text-white">
                    İnaktiflik Süre Eşiği
                  </label>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-black">
                  {settings.daysInactive} Gün
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {[14, 30, 45, 60].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setSettings((prev) => ({ ...prev, daysInactive: days }))}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                      settings.daysInactive === days
                        ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 shadow-xs"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {days === 30 ? `${days} Gün (Varsayılan)` : `${days} Gün`}
                  </button>
                ))}
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Talebin oluşturulduğu veya üzerinde son işlem (not, arama, aşama güncellemesi) yapıldığı tarihten itibaren <strong>{settings.daysInactive} gün</strong> geçerse otomatik arşivlenir.
              </p>
            </div>

            {/* Target Statuses Selection */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <label className="text-xs font-bold text-slate-900 dark:text-white">
                  Arşivlenecek Hedef Aşamalar
                </label>
              </div>

              <div className="space-y-2">
                <label className="flex items-start gap-3 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.targetStatuses?.includes("new")}
                    onChange={(e) => {
                      const cur = settings.targetStatuses || ["new", "contacted"];
                      const next = e.target.checked
                        ? [...cur, "new" as const]
                        : cur.filter((s) => s !== "new");
                      setSettings((prev) => ({ ...prev, targetStatuses: next }));
                    }}
                    className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      🟢 Yeni Talepler (New)
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Geldikten sonra hiç yanıt verilmemiş veya işlem yapılmamış eski talepler.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.targetStatuses?.includes("contacted")}
                    onChange={(e) => {
                      const cur = settings.targetStatuses || ["new", "contacted"];
                      const next = e.target.checked
                        ? [...cur, "contacted" as const]
                        : cur.filter((s) => s !== "contacted");
                      setSettings((prev) => ({ ...prev, targetStatuses: next }));
                    }}
                    className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      💬 İletişime Geçildi (Contacted)
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      İlk temas kurulmuş ancak teklif aşamasına geçmemiş ve 30 gündür yanıtsız kalan talepler.
                    </span>
                  </div>
                </label>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Güvenlik Önlemi:</strong> Teklif Verildi (Offered) ve Satış Tamamlandı (Closed) aşamasındaki talepler mali veri taşıdığı için asla otomatik arşivlenmez.
                </span>
              </div>
            </div>

            {/* Auto Tag & Notifications */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-600" />
                <label className="text-xs font-bold text-slate-900 dark:text-white">
                  Etiketleme & Bildirim
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Arşiv Etiketi
                  </label>
                  <input
                    type="text"
                    value={settings.autoTag || "30+ Gün İnaktif"}
                    onChange={(e) => setSettings((prev) => ({ ...prev, autoTag: e.target.value }))}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Örn: 30+ Gün İnaktif"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifyOnArchive ?? true}
                      onChange={(e) => setSettings((prev) => ({ ...prev, notifyOnArchive: e.target.checked }))}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Arşivleme yapıldığında panoda bildirim göster</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Current Live Stats & Quick Actions */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                Canlı Durum & Analiz
              </span>
              {settings.lastRunAt && (
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono">
                  Son Çalışma: {new Date(settings.lastRunAt).toLocaleDateString("tr-TR")} {new Date(settings.lastRunAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 text-center">
                <span className="text-[10px] font-semibold text-slate-400 block">Toplam Talep</span>
                <span className="text-base font-black text-slate-900 dark:text-white">
                  {leads.length}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 text-center">
                <span className="text-[10px] font-semibold text-slate-400 block">Arşivde Olan</span>
                <span className="text-base font-black text-slate-900 dark:text-white">
                  {currentlyArchivedLeads.length}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 text-center">
                <span className="text-[10px] font-semibold text-amber-600 block">
                  30+ Gün Bekleyen
                </span>
                <span className="text-base font-black text-amber-600">
                  {eligibleLeads.length}
                </span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                id="btn-run-auto-archive-now"
                onClick={handleRunNow}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                title="Kriterlere uyan inaktif talepleri hemen arşive taşı"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Şimdi Otomatik Arşivle (Çalıştır)</span>
              </button>

              <button
                type="button"
                id="btn-add-sample-old-lead"
                onClick={handleAddSampleOldLead}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Test amaçlı 35 günlük inaktif lead simüle eder"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>35 Günlük Test Talebi Ekle</span>
              </button>

              {currentlyArchivedLeads.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      if (onFilterToArchived) onFilterToArchived();
                      onClose();
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Archive className="w-3.5 h-3.5 text-amber-400" />
                    <span>Arşivlenenleri Gör ({currentlyArchivedLeads.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRestoreAllArchived}
                    className="px-2.5 py-2 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Tüm arşivlenmiş talepleri aktif listeye geri alır"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Tümünü Geri Yükle</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            Vazgeç
          </button>

          <button
            type="button"
            id="btn-save-auto-archive-settings"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Ayarları Kaydet</span>
          </button>
        </div>
      </div>
    </div>
  );
};
