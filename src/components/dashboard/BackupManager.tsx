import React, { useState, useEffect, useRef } from "react";
import { SiteConfig } from "../../types";
import {
  BackupSnapshot,
  BackupType,
  getAllBackups,
  createManualBackup,
  restoreBackup,
  deleteBackup,
  clearAllBackups,
  exportBackupsJson,
  exportSingleBackupJson,
  importBackupsJson,
  getStorageUsage,
  checkAndCreateDailyBackup,
  formatBackupDate,
  getTodayDateString
} from "../../utils/backupManager";
import {
  History,
  ShieldCheck,
  RotateCcw,
  Download,
  Upload,
  Plus,
  Trash2,
  Eye,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Layers,
  FileJson,
  ArrowRight,
  HardDrive,
  Calendar,
  Clock,
  ArrowLeftRight,
  ScrollText,
  Camera,
  FolderArchive,
  X
} from "lucide-react";
import { OneClickSnapshotModal } from "./OneClickSnapshotModal";

interface BackupManagerProps {
  config: SiteConfig;
  onChange: (newConfig: SiteConfig) => void;
  onPreview?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const BackupManager: React.FC<BackupManagerProps> = ({
  config,
  onChange,
  onPreview,
  onNavigateTab
}) => {
  const [backups, setBackups] = useState<BackupSnapshot[]>([]);
  const [filterType, setFilterType] = useState<"all" | BackupType>("all");
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Snapshot modal state
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState(false);

  // Manual backup modal state
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualNote, setManualNote] = useState("");

  // Restore confirmation modal state
  const [restoreCandidate, setRestoreCandidate] = useState<BackupSnapshot | null>(null);

  // Inspect / Compare modal state
  const [inspectCandidate, setInspectCandidate] = useState<BackupSnapshot | null>(null);

  // File input ref for import
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshBackups = () => {
    const list = getAllBackups();
    setBackups(list);
  };

  useEffect(() => {
    // Check and create daily backup on mount if not exists
    const res = checkAndCreateDailyBackup(config);
    if (res.created) {
      setFeedback({
        message: "Bugünün otomatik günlük web sitesi yedeği başarıyla oluşturuldu!",
        type: "success"
      });
      setTimeout(() => setFeedback(null), 4000);
    }
    refreshBackups();
  }, [config]);

  const storageStats = getStorageUsage();

  const handleCreateManual = (e: React.FormEvent) => {
    e.preventDefault();
    const note = manualNote.trim();
    createManualBackup(config, note || undefined);
    setIsManualModalOpen(false);
    setManualNote("");
    refreshBackups();
    setFeedback({
      message: "Yeni manuel yedek başarıyla oluşturuldu ve yerel belleğe kaydedildi!",
      type: "success"
    });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleConfirmRestore = () => {
    if (!restoreCandidate) return;

    const { restoredConfig, preRestoreSnapshot } = restoreBackup(restoreCandidate, config);
    onChange(restoredConfig);
    setRestoreCandidate(null);
    setInspectCandidate(null);
    refreshBackups();

    setFeedback({
      message: `"${restoreCandidate.title}" sürümüne başarıyla dönüldü! Önceki haliniz "${preRestoreSnapshot.title}" olarak güvenceye alındı.`,
      type: "success"
    });
    setTimeout(() => setFeedback(null), 5000);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`"${title}" yedeğini silmek istediğinizden emin misiniz?`)) {
      deleteBackup(id);
      refreshBackups();
      setFeedback({
        message: "Yedek başarıyla silindi.",
        type: "info"
      });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleClearAll = () => {
    if (window.confirm("DİKKAT: Tüm yerel yedek geçmişini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) {
      clearAllBackups();
      refreshBackups();
      setFeedback({
        message: "Tüm yedek geçmişi temizlendi.",
        type: "info"
      });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importBackupsJson(content);
      if (res.success) {
        refreshBackups();
        setFeedback({
          message: `${res.count} adet yedek başarıyla içe aktarıldı!`,
          type: "success"
        });
      } else {
        setFeedback({
          message: res.error || "Yedek dosyası içe aktarılamadı.",
          type: "error"
        });
      }
      setTimeout(() => setFeedback(null), 4000);
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const filteredBackups = backups.filter((b) => {
    if (filterType === "all") return true;
    return b.type === filterType;
  });

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between shadow-lg transition-all animate-fadeIn ${
            feedback.type === "success"
              ? "bg-emerald-600 text-white shadow-emerald-500/20"
              : feedback.type === "error"
              ? "bg-rose-600 text-white shadow-rose-500/20"
              : "bg-slate-900 text-slate-100 shadow-slate-900/20"
          }`}
        >
          <div className="flex items-center gap-3 text-sm font-semibold">
            {feedback.type === "success" && <CheckCircle2 className="w-5 h-5 shrink-0" />}
            {feedback.type === "error" && <AlertCircle className="w-5 h-5 shrink-0" />}
            {feedback.type === "info" && <ShieldCheck className="w-5 h-5 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="p-1 hover:bg-white/20 rounded-lg text-white font-bold transition-all"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Header Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                  Otomatik Günlük Yedekleme & Sürüm Geçmişi
                </h1>
                <p className="text-xs text-slate-500">
                  Her gün ilk açılışta ve önemli işlemler öncesinde web sitenizin tam bir kopyası güvenle saklanır.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />

            <button
              type="button"
              id="btn-trigger-snapshot-header"
              onClick={() => setIsSnapshotModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white text-xs font-black flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              title="Tüm siteConfig.json ve medya varlıklarını içeren tek tıkla çevrimdışı yedek (.ZIP) paketi indirin"
            >
              <Camera className="w-4 h-4 text-emerald-200" />
              <span>Tek Tıkla Snapshot İndir</span>
            </button>

            <button
              type="button"
              onClick={() => setIsManualModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-black flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Şimdi Yedek Al</span>
            </button>

            <button
              type="button"
              onClick={() => exportBackupsJson(config.companyName)}
              disabled={backups.length === 0}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 disabled:opacity-50 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Tüm yedek geçmişini JSON dosyası olarak bilgisayarınıza indirin"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Yedekleri İndir</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Daha önce indirdiğiniz bir yedek dosyasını geri yükleyin"
            >
              <Upload className="w-4 h-4 text-slate-600" />
              <span>Yedek Yükle</span>
            </button>

            {onNavigateTab && (
              <button
                type="button"
                id="btn-goto-system-logs"
                onClick={() => onNavigateTab("system-logs")}
                className="px-3.5 py-2.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Günlük otomatik yedekleme kayıtlarını, başarı durumlarını ve dosya boyutlarını Sistem Günlüğü'nde inceleyin"
              >
                <ScrollText className="w-4 h-4 text-cyan-600" />
                <span>Sistem Günlüğü →</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Status Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Otomatik Yedek</span>
            </div>
            <div className="text-sm font-black text-slate-800">
              {storageStats.hasDailyToday ? "Bugün Alındı ✓" : "Aktif (Hazır)"}
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Son Yedek</span>
            </div>
            <div className="text-sm font-black text-slate-800 truncate" title={storageStats.latestDate || "Kayıt yok"}>
              {storageStats.latestDate || "Henüz yok"}
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <Layers className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Kayıtlı Sürüm</span>
            </div>
            <div className="text-sm font-black text-slate-800">
              {storageStats.count} / 30 Adet
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <HardDrive className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Hafıza Alanı</span>
            </div>
            <div className="text-sm font-black text-slate-800">
              {storageStats.usedKb} KB (Hafif)
            </div>
          </div>
        </div>

        {/* Safety Guarantee Banner */}
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/70 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed space-y-1">
            <span className="font-black text-amber-950 block">
              Sıfır Veri Kaybı Garantisi:
            </span>
            <p>
              İstenmeyen bir değişiklik yaptığınızda geçmiş herhangi bir güne tek tıkla dönebilirsiniz. 
              Geri yükleme işlemi başlatıldığında, <strong>mevcut web siteniz otomatik olarak "Geri Yükleme Öncesi Güvenlik Yedeği"</strong> adıyla anında arşivlenir. 
              Böylece yanlışlıkla geri dönseniz bile hiçbir çalışmanız silinmez.
            </p>
          </div>
        </div>
      </div>

      {/* One-Click Site Snapshot Feature Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 rounded-3xl p-6 border border-emerald-500/30 shadow-md text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 tracking-wider">
                YENİ • ONE-CLICK OFFLINE BACKUP
              </span>
              <span className="text-[11px] text-slate-400 font-mono">.ZIP Arşivi</span>
            </div>
            
            <h2 className="text-lg md:text-xl font-black text-white tracking-tight flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-400" />
              <span>Tek Tıkla Tam Site Snapshot & Medya Arşivi</span>
            </h2>
            
            <p className="text-xs text-slate-300 leading-relaxed">
              Tüm <strong>siteConfig.json</strong> konfigürasyonunuzu ve sitenizde kullanılan <strong>bütün medya varlıklarını (logo, hero arkaplanı, hizmet & ürün fotoğrafları, blog görselleri)</strong> yerel çevrimdışı depolama için tek bir ZIP dosyası olarak anında indirin. İçerisinde çevrimdışı gezinme HTML görüntüleyicisi de yer alır.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <button
              type="button"
              id="btn-open-oneclick-snapshot-card"
              onClick={() => setIsSnapshotModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-slate-950 text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4 text-slate-950" />
              <span>Snapshot Al ve İndir (.ZIP)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Backups List */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          {/* Filters */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === "all"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Tüm Sürümler ({backups.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("daily_auto")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === "daily_auto"
                  ? "bg-white text-emerald-700 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Otomatik Günlük ({backups.filter((b) => b.type === "daily_auto").length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("manual")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === "manual"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Manuel ({backups.filter((b) => b.type === "manual").length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("pre_restore")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === "pre_restore"
                  ? "bg-white text-amber-700 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Güvenlik ({backups.filter((b) => b.type === "pre_restore").length})
            </button>
          </div>

          {backups.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs font-semibold text-rose-500 hover:text-rose-700 flex items-center gap-1 transition-colors self-end sm:self-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Geçmişi Temizle</span>
            </button>
          )}
        </div>

        {/* Backups Timeline / Cards */}
        {filteredBackups.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <History className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              Bu kategoride kayıtlı yedek bulunamadı
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Sitenizi düzenlerken günlük yedekler kendiliğinden oluşur veya dilediğiniz an manuel yedek alabilirsiniz.
            </p>
            <button
              type="button"
              onClick={() => setIsManualModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>İlk Manuel Yedeğinizi Alın</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBackups.map((snapshot) => {
              const isToday = snapshot.dateString === getTodayDateString();

              return (
                <div
                  key={snapshot.id}
                  className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 hover:border-indigo-200 bg-slate-50/40 hover:bg-indigo-50/20 transition-all space-y-3.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Type Badge */}
                        {snapshot.type === "daily_auto" && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Otomatik Günlük
                          </span>
                        )}
                        {snapshot.type === "manual" && (
                          <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Manuel Yedek
                          </span>
                        )}
                        {snapshot.type === "pre_restore" && (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-amber-600" />
                            Geri Yükleme Emniyeti
                          </span>
                        )}

                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{snapshot.formattedDate}</span>
                          {isToday && (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                              (Bugün)
                            </span>
                          )}
                        </span>
                      </div>

                      <h4 className="text-sm font-black text-slate-900">
                        {snapshot.title}
                      </h4>
                      {snapshot.note && (
                        <p className="text-xs text-slate-500 italic">
                          "{snapshot.note}"
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
                      <button
                        type="button"
                        onClick={() => setInspectCandidate(snapshot)}
                        className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs"
                        title="Bu sürümün detaylarını ve mevcut siteyle olan farklarını inceleyin"
                      >
                        <ArrowLeftRight className="w-3.5 h-3.5 text-slate-500" />
                        <span>Karşılaştır</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRestoreCandidate(snapshot)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-xs"
                        title="Web sitenizi bu tarihteki haline geri döndürün"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-white" />
                        <span>Bu Sürüme Geri Yükle</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => exportSingleBackupJson(snapshot)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-all"
                        title="Bu tekil yedeği JSON dosyası olarak indirin"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(snapshot.id, snapshot.title)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                        title="Bu yedeği sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Summary Badges of Snapshot */}
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 bg-white/70 p-2.5 rounded-xl border border-slate-100">
                    <span className="font-semibold text-slate-700">
                      🏢 {snapshot.companyName}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span>🛠️ {snapshot.servicesCount} Hizmet</span>
                    <span className="text-slate-300">•</span>
                    <span>📦 {snapshot.productsCount} Ürün</span>
                    <span className="text-slate-300">•</span>
                    <span>📄 {snapshot.pageCount} Sayfa</span>
                    <span className="text-slate-300">•</span>
                    <span>📥 {snapshot.leadsCount} Talep</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-mono text-slate-400">💾 {snapshot.configSizeKb} KB</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Manual Backup Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-indigo-600 font-bold">
                <Sparkles className="w-5 h-5" />
                <h3 className="text-base font-black text-slate-900">
                  Yeni Manuel Yedek Al
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsManualModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Mevcut web sitenizin o anki tüm içeriği ve ayarları anında bir sürüm olarak yerel belleğe kopyalanır.
            </p>

            <form onSubmit={handleCreateManual} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Yedek Notu / Başlığı (İsteğe Bağlı)
                </label>
                <input
                  type="text"
                  placeholder="Örn: Yeni logo ve hizmetler eklenmeden önceki hal"
                  value={manualNote}
                  onChange={(e) => setManualNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-all"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black transition-all shadow-xs cursor-pointer"
                >
                  Yedeği Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restore Confirmation Modal */}
      {restoreCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-scaleUp">
            <div className="flex items-center gap-3 text-emerald-600">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Sürümü Geri Yükle
                </h3>
                <p className="text-xs text-slate-500">
                  Web sitenizi seçtiğiniz geçmiş tarihteki haline döndürmek üzeresiniz.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Hedef Sürüm:</span>
                <span className="font-bold text-slate-800">{restoreCandidate.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tarih:</span>
                <span className="font-bold text-slate-800">{restoreCandidate.formattedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Firma Adı:</span>
                <span className="font-bold text-slate-800">{restoreCandidate.companyName}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p>
                <strong>Güvendesiniz:</strong> Şu an düzenlemekte olduğunuz mevcut durumunuz otomatik olarak 
                <strong> "Geri Yükleme Öncesi Güvenlik Yedeği"</strong> adıyla saklanacaktır. 
                İstediğiniz zaman bugünkü halinize de geri dönebilirsiniz.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setRestoreCandidate(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-all cursor-pointer"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleConfirmRestore}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Evet, Bu Sürüme Geri Dön
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspect & Compare Modal */}
      {inspectCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-scaleUp max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-indigo-600 font-bold">
                <ArrowLeftRight className="w-5 h-5" />
                <h3 className="text-base font-black text-slate-900">
                  Sürüm Karşılaştırması & Detaylar
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectCandidate(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-black text-slate-800">
                {inspectCandidate.title}
              </h4>
              <p className="text-xs text-slate-500">
                Yedeklenme Zamanı: {inspectCandidate.formattedDate}
              </p>
            </div>

            {/* Side-by-side comparison table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
              <div className="grid grid-cols-3 bg-slate-100/80 p-3 font-black text-slate-700 border-b border-slate-200">
                <span>Özellik / Alan</span>
                <span>Yedek Sürüm ({inspectCandidate.dateString})</span>
                <span>Şu Anki Canlı Durum</span>
              </div>

              <div className="divide-y divide-slate-100">
                <div className="grid grid-cols-3 p-3">
                  <span className="font-bold text-slate-600">Şirket Adı</span>
                  <span className="text-slate-800 font-medium">{inspectCandidate.config.companyName}</span>
                  <span className={inspectCandidate.config.companyName === config.companyName ? "text-slate-600" : "text-amber-600 font-bold"}>
                    {config.companyName}
                  </span>
                </div>

                <div className="grid grid-cols-3 p-3 bg-slate-50/50">
                  <span className="font-bold text-slate-600">Slogan</span>
                  <span className="text-slate-800 font-medium truncate">{inspectCandidate.config.slogan || "-"}</span>
                  <span className="text-slate-600 truncate">{config.slogan || "-"}</span>
                </div>

                <div className="grid grid-cols-3 p-3">
                  <span className="font-bold text-slate-600">Telefon</span>
                  <span className="text-slate-800 font-medium">{inspectCandidate.config.phone || "-"}</span>
                  <span className="text-slate-600">{config.phone || "-"}</span>
                </div>

                <div className="grid grid-cols-3 p-3 bg-slate-50/50">
                  <span className="font-bold text-slate-600">Renk Paleti</span>
                  <span className="text-slate-800 font-medium">{inspectCandidate.config.palette?.name || "-"}</span>
                  <span className="text-slate-600">{config.palette?.name || "-"}</span>
                </div>

                <div className="grid grid-cols-3 p-3">
                  <span className="font-bold text-slate-600">Hizmet Sayısı</span>
                  <span className="text-slate-800 font-medium">{inspectCandidate.servicesCount} adet</span>
                  <span className="text-slate-600">{config.services?.items?.length || 0} adet</span>
                </div>

                <div className="grid grid-cols-3 p-3 bg-slate-50/50">
                  <span className="font-bold text-slate-600">Ürün Sayısı</span>
                  <span className="text-slate-800 font-medium">{inspectCandidate.productsCount} adet</span>
                  <span className="text-slate-600">{config.products?.items?.length || 0} adet</span>
                </div>

                <div className="grid grid-cols-3 p-3">
                  <span className="font-bold text-slate-600">Özel Sayfa Sayısı</span>
                  <span className="text-slate-800 font-medium">{inspectCandidate.pageCount} adet</span>
                  <span className="text-slate-600">{config.pages?.length || 0} adet</span>
                </div>

                <div className="grid grid-cols-3 p-3 bg-slate-50/50">
                  <span className="font-bold text-slate-600">Form Talepleri (CRM)</span>
                  <span className="text-slate-800 font-medium">{inspectCandidate.leadsCount} adet</span>
                  <span className="text-slate-600">{config.leads?.length || 0} adet</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => exportSingleBackupJson(inspectCandidate)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>JSON Olarak İndir</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInspectCandidate(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-all"
                >
                  Kapat
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const toRestore = inspectCandidate;
                    setInspectCandidate(null);
                    setRestoreCandidate(toRestore);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Bu Sürüme Geri Yükle</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* One-Click Site Snapshot Modal */}
      <OneClickSnapshotModal
        isOpen={isSnapshotModalOpen}
        onClose={() => {
          setIsSnapshotModalOpen(false);
          refreshBackups();
        }}
        config={config}
        onNavigateTab={onNavigateTab}
      />
    </div>
  );
};
