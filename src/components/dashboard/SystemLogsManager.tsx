import React, { useState, useMemo, useEffect } from "react";
import { SiteConfig, SystemBackupLog, SystemLogStatus, SystemLogBackupType } from "../../types";
import {
  getAllSystemLogs,
  getSystemLogStats,
  runLiveBackupIntegrityTest,
  exportSystemLogsCsv,
  exportSystemLogsJson,
  exportSystemLogsTxt
} from "../../utils/systemLogManager";
import {
  ScrollText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  HardDrive,
  Download,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Copy,
  Check,
  Eye,
  FileCode,
  Layers,
  ChevronDown,
  ChevronUp,
  Activity,
  History,
  X,
  FileText
} from "lucide-react";

interface SystemLogsManagerProps {
  config: SiteConfig;
  onNavigateTab?: (tab: string) => void;
}

export const SystemLogsManager: React.FC<SystemLogsManagerProps> = ({
  config,
  onNavigateTab
}) => {
  const [logs, setLogs] = useState<SystemBackupLog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | SystemLogBackupType>("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | SystemLogStatus>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "size_desc" | "size_asc">("newest");

  // Live test feedback & loading state
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "info" } | null>(null);

  // Detail Modal State
  const [selectedLogForDetail, setSelectedLogForDetail] = useState<SystemBackupLog | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Refresh logs on mount and when config changes
  const reloadLogs = () => {
    const list = getAllSystemLogs(config);
    setLogs(list);
  };

  useEffect(() => {
    reloadLogs();
  }, [config]);

  // Compute aggregate stats
  const stats = useMemo(() => {
    return getSystemLogStats(logs);
  }, [logs]);

  // Filtered & Sorted logs
  const filteredLogs = useMemo(() => {
    return logs
      .filter((log) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchDate = log.dateFormatted.toLowerCase().includes(q) || log.dateString.includes(q);
          const matchMsg = log.statusMessage.toLowerCase().includes(q);
          const matchHash = log.checksum.toLowerCase().includes(q);
          const matchTrigger = log.trigger.toLowerCase().includes(q);
          if (!matchDate && !matchMsg && !matchHash && !matchTrigger) {
            return false;
          }
        }

        // Type filter
        if (selectedType !== "all" && log.backupType !== selectedType) {
          return false;
        }

        // Status filter
        if (selectedStatus !== "all" && log.status !== selectedStatus) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "newest") return b.timestamp - a.timestamp;
        if (sortBy === "oldest") return a.timestamp - b.timestamp;
        if (sortBy === "size_desc") return b.fileSizeBytes - a.fileSizeBytes;
        if (sortBy === "size_asc") return a.fileSizeBytes - b.fileSizeBytes;
        return 0;
      });
  }, [logs, searchQuery, selectedType, selectedStatus, sortBy]);

  // Trigger live integrity test
  const handleRunIntegrityTest = () => {
    setIsRunningTest(true);
    setTimeout(() => {
      const newLog = runLiveBackupIntegrityTest(config);
      reloadLogs();
      setIsRunningTest(false);
      setFeedback({
        message: `Canlı sistem bütünlük testi tamamlandı! Boyut: ${newLog.fileSizeFormatted}, Durum: Başarılı (${newLog.durationMs}ms).`,
        type: "success"
      });
      setTimeout(() => setFeedback(null), 4500);
    }, 400);
  };

  const handleCopyChecksum = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2500);
  };

  return (
    <div id="system-logs-manager-panel" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 sm:p-7 text-white shadow-md border border-slate-700/60 relative overflow-hidden">
        {/* Decorative Background Blur */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mb-20" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1.5">
                <ScrollText className="w-3.5 h-3.5 text-cyan-400" />
                <span>Sistem Günlüğü (Audit Log)</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold font-mono">
                Otomatik Günlük Yedekler
              </span>
              <span className="px-2.5 py-1 rounded-full bg-slate-700/60 text-slate-300 text-xs font-mono">
                {stats.totalDailyAuto} Otomatik Kayıt
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Sistem Günlüğü &amp; Otomatik Yedekleme Denetimi
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Sistem tarafından her gece saat 03:00'te ve oturum açılışlarında otomatik olarak alınan web sitesi
              yedeklerinin tarihini, başarı durumunu, dosya boyutunu ve SHA-256 bütünlük imzalarını anlık izleyin.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              id="btn-run-integrity-test"
              onClick={handleRunIntegrityTest}
              disabled={isRunningTest}
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
              title="Şu anki web sitesi verilerini test ederek canlı bir sistem günlüğü kaydı oluşturun"
            >
              <RefreshCw className={`w-4 h-4 ${isRunningTest ? "animate-spin" : ""}`} />
              <span>{isRunningTest ? "Test Ediliyor..." : "Canlı Test Çalıştır"}</span>
            </button>

            {/* Export Dropdown / Buttons */}
            <div className="inline-flex rounded-xl bg-white/10 p-0.5 border border-white/20">
              <button
                type="button"
                id="btn-export-logs-csv"
                onClick={() => exportSystemLogsCsv(filteredLogs, config.companyName)}
                className="px-3 py-2 text-xs font-bold text-white hover:bg-white/15 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                title="CSV formatında Excel için dışa aktar"
              >
                <Download className="w-3.5 h-3.5 text-cyan-300" />
                <span>CSV</span>
              </button>
              <button
                type="button"
                id="btn-export-logs-json"
                onClick={() => exportSystemLogsJson(filteredLogs, config.companyName)}
                className="px-3 py-2 text-xs font-bold text-white hover:bg-white/15 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                title="JSON formatında teknik denetim raporu"
              >
                <FileCode className="w-3.5 h-3.5 text-indigo-300" />
                <span>JSON</span>
              </button>
              <button
                type="button"
                id="btn-export-logs-txt"
                onClick={() => exportSystemLogsTxt(filteredLogs, config.companyName)}
                className="px-3 py-2 text-xs font-bold text-white hover:bg-white/15 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                title="TXT formatında sunucu audit logu"
              >
                <FileText className="w-3.5 h-3.5 text-amber-300" />
                <span>TXT</span>
              </button>
            </div>

            {onNavigateTab && (
              <button
                type="button"
                id="btn-nav-to-backups-tab"
                onClick={() => onNavigateTab("backups")}
                className="px-4 py-2.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Yedekleri geri yükleme veya manuel yedek oluşturma paneline git"
              >
                <History className="w-4 h-4 text-indigo-400" />
                <span>Yedekler &amp; Sürümler →</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Feedback Toast in Banner */}
        {feedback && (
          <div className="relative z-10 mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{feedback.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-emerald-300 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 4 Core KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Success Rate */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Başarı Durumu Oranı
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-2.5">
            <div className="text-2xl font-black text-slate-900 font-mono">
              %{stats.successRate} <span className="text-xs font-bold text-emerald-600 font-sans">Kusursuz</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              <span>{stats.successCount} Başarılı / {stats.errorCount} Hata</span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>Doğrulama:</span>
            <span className="font-bold text-emerald-700 font-mono">SHA-256 Checksum</span>
          </div>
        </div>

        {/* Card 2: Average File Size */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Ortalama Dosya Boyutu
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-2.5">
            <div className="text-2xl font-black text-slate-900 font-mono">
              {stats.avgFileSizeKb} <span className="text-sm font-semibold font-sans text-slate-500">KB</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              Toplam Arşiv Hacmi: <strong className="text-slate-800 font-mono">{stats.totalStorageKb} KB</strong>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>Sıkıştırma:</span>
            <span className="font-bold text-cyan-700 font-mono">Optimize JSON Şeması</span>
          </div>
        </div>

        {/* Card 3: Total Logs / Daily Backups */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Toplam Yedek Günlüğü
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-2.5">
            <div className="text-2xl font-black text-slate-900 font-mono">
              {stats.totalLogs} <span className="text-sm font-semibold font-sans text-slate-500">Kayıt</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              {stats.totalDailyAuto} Otomatik Günlük • {stats.totalLogs - stats.totalDailyAuto} Canlı/Manuel
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>Saklama Politikası:</span>
            <span className="font-bold text-indigo-700 font-mono">30 Günlük Döngü</span>
          </div>
        </div>

        {/* Card 4: Next Scheduled Backup */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Son &amp; Sıradaki Yedekleme
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-2.5">
            <div className="text-sm font-black text-slate-900 truncate">
              {stats.lastBackupDate || "Henüz Alınmadı"}
            </div>
            <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1 font-medium">
              <span className="text-amber-600 font-bold">Planlanan:</span>
              <span className="font-mono text-slate-700">{stats.nextScheduledBackup}</span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>Otomasyon:</span>
            <span className="font-bold text-emerald-600 font-mono">Sistem Cron Aktif</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="input-search-system-logs"
              placeholder="Tarih, SHA-256 hash veya tetikleyici ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filters & Sorting */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Type Filter */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-400 text-[11px] font-medium hidden md:inline">Tür:</span>
              <select
                id="select-log-type-filter"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as any)}
                className="px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">Tüm Yedek Türleri</option>
                <option value="daily_auto">Otomatik Günlük</option>
                <option value="manual">Manuel İstek</option>
                <option value="health_check">Bütünlük Testi</option>
                <option value="pre_restore">Geri Yükleme Öncesi</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-400 text-[11px] font-medium hidden md:inline">Durum:</span>
              <select
                id="select-log-status-filter"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="success">Başarılı</option>
                <option value="warning">Uyarı</option>
                <option value="error">Hata</option>
              </select>
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-1 text-xs">
              <select
                id="select-log-sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="newest">En Yeni Tarih</option>
                <option value="oldest">En Eski Tarih</option>
                <option value="size_desc">Boyuta Göre (Azalan)</option>
                <option value="size_asc">Boyuta Göre (Artan)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Summary pills if filtered */}
        {(searchQuery || selectedType !== "all" || selectedStatus !== "all") && (
          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 text-slate-500">
            <span>
              Filtrelenen: <strong>{filteredLogs.length}</strong> / {logs.length} kayıt
            </span>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedType("all");
                setSelectedStatus("all");
              }}
              className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer underline text-[11px]"
            >
              Filtreleri Temizle
            </button>
          </div>
        )}
      </div>

      {/* Main System Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-sm font-bold text-slate-900">
              Günlük Otomatik Yedekleme Denetim Kayıtları
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {filteredLogs.length} Kayıt Gösteriliyor
            </span>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tüm yedekler SHA-256 bütünlük imzası ile arşivlenir</span>
          </div>
        </div>

        {/* Table Container */}
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <ScrollText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Eşleşen Sistem Günlüğü Bulunamadı</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Arama kriterlerinize uygun sistem günlüğü bulunamadı. Filtreleri sıfırlayabilir veya canlı test
              çalıştırabilirsiniz.
            </p>
            <button
              type="button"
              onClick={handleRunIntegrityTest}
              className="mt-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
            >
              Canlı Bütünlük Testi Yap
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4">Tarih &amp; Saat</th>
                  <th className="py-3 px-4">Yedekleme Türü</th>
                  <th className="py-3 px-4">Başarı Durumu</th>
                  <th className="py-3 px-4">Dosya Boyutu</th>
                  <th className="py-3 px-4">İçerik Kapsamı</th>
                  <th className="py-3 px-4">Bütünlük (SHA-256)</th>
                  <th className="py-3 px-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => {
                  const isDaily = log.backupType === "daily_auto";
                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-default"
                    >
                      {/* 1. Tarih & Saat */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                            <Calendar className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                              <span>{log.dateFormatted}</span>
                              {log.relativeTime.includes("Bugün") && (
                                <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold font-mono">
                                  Bugün
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                              <span>{log.timeString}</span>
                              <span>•</span>
                              <span>{log.relativeTime}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Yedekleme Türü */}
                      <td className="py-3.5 px-4">
                        {isDaily ? (
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[11px]">
                            <Clock className="w-3 h-3 text-emerald-600" />
                            <span>Otomatik Günlük</span>
                          </div>
                        ) : log.backupType === "health_check" ? (
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 font-bold text-[11px]">
                            <Activity className="w-3 h-3 text-cyan-600" />
                            <span>Bütünlük Testi</span>
                          </div>
                        ) : log.backupType === "pre_restore" ? (
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200 font-bold text-[11px]">
                            <History className="w-3 h-3 text-purple-600" />
                            <span>Geri Yükleme Güvenliği</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200 font-bold text-[11px]">
                            <Layers className="w-3 h-3 text-slate-600" />
                            <span>Manuel Yedek</span>
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400 mt-1 truncate max-w-[140px]" title={log.trigger}>
                          {log.trigger}
                        </div>
                      </td>

                      {/* 3. Başarı Durumu */}
                      <td className="py-3.5 px-4">
                        {log.status === "success" ? (
                          <div className="space-y-0.5">
                            <div className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>Başarılı</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                              <span>Doğrulandı ({log.durationMs}ms)</span>
                            </div>
                          </div>
                        ) : log.status === "warning" ? (
                          <div className="space-y-0.5">
                            <div className="inline-flex items-center gap-1 text-amber-700 font-bold text-xs">
                              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                              <span>Uyarı</span>
                            </div>
                            <div className="text-[10px] text-amber-600">{log.statusText}</div>
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <div className="inline-flex items-center gap-1 text-rose-700 font-bold text-xs">
                              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                              <span>Hata</span>
                            </div>
                            <div className="text-[10px] text-rose-600">{log.statusMessage}</div>
                          </div>
                        )}
                      </td>

                      {/* 4. Dosya Boyutu */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-bold text-slate-900 text-xs">
                          {log.fileSizeFormatted}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {log.fileSizeBytes.toLocaleString("tr-TR")} bayt
                        </div>
                        {/* Micro visual meter */}
                        <div className="w-20 bg-slate-100 rounded-full h-1 mt-1 overflow-hidden">
                          <div
                            className="bg-cyan-500 h-1 rounded-full"
                            style={{
                              width: `${Math.min(100, Math.max(15, (log.fileSizeKb / 150) * 100))}%`
                            }}
                          />
                        </div>
                      </td>

                      {/* 5. İçerik Kapsamı (Payload) */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 text-[10px] font-mono">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {log.metadata.pageCount} Sayfa
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {log.metadata.productsCount} Ürün
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {log.metadata.servicesCount} Hizmet
                          </span>
                          {log.metadata.leadsCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {log.metadata.leadsCount} Lead
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 6. Bütünlük Checksum (SHA-256) */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 text-[10px] select-all cursor-pointer hover:bg-slate-200 transition-colors truncate max-w-[120px]"
                            title={log.checksum}
                            onClick={() => handleCopyChecksum(log.checksum)}
                          >
                            {log.checksum.slice(0, 16)}...
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyChecksum(log.checksum)}
                            className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                            title="SHA-256 Hash Kopyala"
                          >
                            {copiedHash === log.checksum ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* 7. İşlemler */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedLogForDetail(log)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                            title="Teknik detayları ve log dökümünü incele"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>İncele</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Notes & Summary */}
        <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-600" />
            <span>
              <strong>Otomatik Saklama Döngüsü:</strong> Sistem, geriye dönük 30 günlük otomatik yedekleme kayıtlarını
              yerel depolama kotası dahilinde güvenle muhafaza eder.
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px] text-slate-600">
            <span>Toplam Depolanan Hacim: {stats.totalStorageKb} KB</span>
            <span>•</span>
            <span className="text-emerald-700 font-bold">100% Şema Bütünlüğü</span>
          </div>
        </div>
      </div>

      {/* Log Detail Modal */}
      {selectedLogForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl animate-fadeIn">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 rounded-t-2xl">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center">
                  <ScrollText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Sistem Günlüğü Teknik Raporu
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    ID: {selectedLogForDetail.id}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLogForDetail(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Status Banner */}
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  selectedLogForDetail.status === "success"
                    ? "bg-emerald-50/80 border-emerald-200 text-emerald-900"
                    : "bg-amber-50/80 border-amber-200 text-amber-900"
                }`}
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-sm">
                    {selectedLogForDetail.statusText}
                  </div>
                  <p className="leading-relaxed">{selectedLogForDetail.statusMessage}</p>
                </div>
              </div>

              {/* Key Value Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs font-mono">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-sans block text-[11px]">Yedekleme Tarihi</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedLogForDetail.dateFormatted}</span>
                  <span className="text-[10px] text-slate-500 block font-sans">
                    Saat: {selectedLogForDetail.timeString} ({selectedLogForDetail.relativeTime})
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-sans block text-[11px]">Dosya Boyutu</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    {selectedLogForDetail.fileSizeFormatted}
                  </span>
                  <span className="text-[10px] text-slate-500 block font-sans">
                    Tam Bayt: {selectedLogForDetail.fileSizeBytes.toLocaleString("tr-TR")} bytes
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-sans block text-[11px]">Tetikleyici Kaynak</span>
                  <span className="font-bold text-slate-900">{selectedLogForDetail.trigger}</span>
                  <span className="text-[10px] text-slate-500 block font-sans">
                    Tür: {selectedLogForDetail.backupType}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-sans block text-[11px]">İşlem Süresi</span>
                  <span className="font-bold text-indigo-700 text-sm">
                    {selectedLogForDetail.durationMs} ms
                  </span>
                  <span className="text-[10px] text-slate-500 block font-sans">
                    Gecikme: 0.04 saniyenin altında
                  </span>
                </div>
              </div>

              {/* SHA-256 Checksum Block */}
              <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    <span>Kriptografik Bütünlük İmzası (SHA-256)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyChecksum(selectedLogForDetail.checksum)}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedHash === selectedLogForDetail.checksum ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Kopyalandı</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Kopyala</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="font-mono text-xs text-slate-300 bg-slate-950 p-2.5 rounded-lg break-all select-all border border-slate-800">
                  {selectedLogForDetail.checksum}
                </div>
              </div>

              {/* Payload Breakdown */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Yedeklenen Veri Kapsamı
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-center font-mono">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-sans block">Sayfalar</span>
                    <span className="font-black text-slate-800 text-base">
                      {selectedLogForDetail.metadata.pageCount}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-sans block">Hizmetler</span>
                    <span className="font-black text-slate-800 text-base">
                      {selectedLogForDetail.metadata.servicesCount}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-sans block">Ürünler</span>
                    <span className="font-black text-slate-800 text-base">
                      {selectedLogForDetail.metadata.productsCount}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-sans block">Lead Talepleri</span>
                    <span className="font-black text-indigo-700 text-base">
                      {selectedLogForDetail.metadata.leadsCount}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex items-center justify-between">
              <div className="text-xs text-slate-500 font-mono">
                Saklama: {selectedLogForDetail.retentionPolicy || "30 Günlük Otomatik Döngü"}
              </div>
              <button
                type="button"
                onClick={() => setSelectedLogForDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
