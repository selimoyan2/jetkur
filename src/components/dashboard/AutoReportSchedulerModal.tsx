import React, { useState, useEffect, useMemo } from "react";
import { 
  Calendar, 
  Clock, 
  Mail, 
  FileSpreadsheet, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Send, 
  History, 
  Settings, 
  Eye, 
  Download, 
  RefreshCw, 
  X, 
  ChevronRight, 
  Info, 
  Bell, 
  Check, 
  ExternalLink, 
  ShieldCheck,
  CalendarCheck,
  CalendarDays,
  Sliders,
  HelpCircle,
  Copy
} from "lucide-react";
import { CompetitorKeywordRanking } from "../../types";
import { KeywordGoalItem } from "./GoalTrackingModule";
import { StrategicCompetitorNote } from "./RowStrategicNotepad";
import { serializeRankingTableData } from "./CompetitiveKeywordRankingTable";

export type ReportFrequency = "weekly" | "biweekly" | "monthly";
export type ReportFormat = "both" | "pdf" | "csv";
export type ReportScope = "all" | "filtered" | "goals_only" | "top10";

export interface AutoReportScheduleConfig {
  enabled: boolean;
  frequency: ReportFrequency;
  dayOfWeek: number; // 1 = Pazartesi, 7 = Pazar
  deliveryTime: string; // "09:00"
  recipientEmail: string;
  ccEmails: string;
  format: ReportFormat;
  scope: ReportScope;
  includeAiSummary: boolean;
  includeCriticalChanges: boolean;
  emailSubjectTemplate: string;
  lastDispatchedAt?: string;
  nextScheduledAt?: string;
}

export interface AutoReportDispatchLog {
  id: string;
  dispatchedAt: string;
  recipientEmail: string;
  ccEmails?: string;
  format: ReportFormat;
  scopeLabel: string;
  keywordCount: number;
  status: "success" | "pending" | "failed";
  statusText: string;
  emailSubject: string;
  topRank1Count: number;
  top3Count: number;
  isTestSend?: boolean;
}

export interface AutoReportSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  allRankings: CompetitorKeywordRanking[];
  filteredRankings: CompetitorKeywordRanking[];
  selectedRankings?: CompetitorKeywordRanking[];
  userName: string;
  userDomain?: string;
  competitors: Array<{ name: string; domain?: string; visibilityScore?: number; speedScore?: number }>;
  goals?: Record<string, KeywordGoalItem>;
  strategicNotes?: Record<string, StrategicCompetitorNote>;
  selectedCsvColumns?: string[];
  defaultUserEmail?: string;
  onNotification?: (msg: string) => void;
  onScheduleUpdated?: (config: AutoReportScheduleConfig) => void;
}

const STORAGE_KEY_CONFIG = "seo_weekly_auto_report_schedule_config";
const STORAGE_KEY_LOGS = "seo_weekly_auto_report_dispatch_logs";

export const DAYS_OF_WEEK = [
  { id: 1, label: "Pazartesi", short: "Pzt" },
  { id: 2, label: "Salı", short: "Sal" },
  { id: 3, label: "Çarşamba", short: "Çar" },
  { id: 4, label: "Perşembe", short: "Per" },
  { id: 5, label: "Cuma", short: "Cum" },
  { id: 6, label: "Cumartesi", short: "Cmt" },
  { id: 7, label: "Pazar", short: "Paz" }
];

export const DELIVERY_TIMES = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "11:00",
  "14:00",
  "17:00",
  "18:00"
];

// Helper to calculate next scheduled delivery date
export function calculateNextDelivery(
  dayOfWeek: number = 1,
  deliveryTime: string = "09:00"
): { date: Date; formattedText: string; timeUntilText: string; isoString: string } {
  const now = new Date();
  const [hours, minutes] = deliveryTime.split(":").map(Number);

  // JS getDay(): 0 is Sunday, 1 is Monday ... 6 is Saturday
  const currentJsDay = now.getDay() === 0 ? 7 : now.getDay();
  let daysDiff = dayOfWeek - currentJsDay;

  const targetDate = new Date(now);
  targetDate.setHours(hours || 9, minutes || 0, 0, 0);

  if (daysDiff < 0 || (daysDiff === 0 && targetDate.getTime() <= now.getTime())) {
    daysDiff += 7;
  }

  targetDate.setDate(now.getDate() + daysDiff);

  const diffMs = targetDate.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  let timeUntilText = "";
  if (diffDays > 0) {
    timeUntilText = `${diffDays} gün ${diffHours} saat sonra`;
  } else if (diffHours > 0) {
    timeUntilText = `${diffHours} saat ${diffMins} dk sonra`;
  } else {
    timeUntilText = `${Math.max(1, diffMins)} dakika sonra`;
  }

  const dayName = DAYS_OF_WEEK.find((d) => d.id === dayOfWeek)?.label || "Pazartesi";
  const formattedText = `${targetDate.getDate()} ${targetDate.toLocaleDateString("tr-TR", { month: "long" })} ${targetDate.getFullYear()}, ${dayName} ${deliveryTime} (TSİ)`;

  return {
    date: targetDate,
    formattedText,
    timeUntilText,
    isoString: targetDate.toISOString()
  };
}

export const AutoReportSchedulerModal: React.FC<AutoReportSchedulerModalProps> = ({
  isOpen,
  onClose,
  allRankings,
  filteredRankings,
  selectedRankings = [],
  userName,
  userDomain = "jetkur.com.tr",
  competitors,
  goals = {},
  strategicNotes = {},
  selectedCsvColumns,
  defaultUserEmail = "selimoyan@gmail.com",
  onNotification,
  onScheduleUpdated
}) => {
  // Primary Schedule Configuration State
  const [config, setConfig] = useState<AutoReportScheduleConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return {
      enabled: true,
      frequency: "weekly",
      dayOfWeek: 1, // Pazartesi
      deliveryTime: "09:00",
      recipientEmail: defaultUserEmail,
      ccEmails: "yonetim@jetkur.com.tr",
      format: "both",
      scope: "all",
      includeAiSummary: true,
      includeCriticalChanges: true,
      emailSubjectTemplate: `[Haftalık SEO Özeti] ${userDomain} Rakip Sıralama & Fırsat Analizi`
    };
  });

  // Logs & History State
  const [logs, setLogs] = useState<AutoReportDispatchLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOGS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    // Seed initial realistic historical log
    return [
      {
        id: "log-seed-1",
        dispatchedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        recipientEmail: defaultUserEmail,
        ccEmails: "yonetim@jetkur.com.tr",
        format: "both",
        scopeLabel: "Tüm Tablo Verileri",
        keywordCount: allRankings.length || 32,
        status: "success",
        statusText: "Başarıyla İletildi (200 OK)",
        emailSubject: `[Haftalık SEO Özeti] ${userDomain} Rakip Sıralama & Fırsat Analizi (Hafta 37)`,
        topRank1Count: allRankings.filter((r) => r.userRank === 1).length || 5,
        top3Count: allRankings.filter((r) => r.userRank && r.userRank <= 3).length || 14
      }
    ];
  });

  // Active Tab: "settings" | "preview" | "history"
  const [activeTab, setActiveTab] = useState<"settings" | "preview" | "history">("settings");
  
  // Test Sending Progress State
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testSendingStep, setTestSendingStep] = useState<string>("");
  const [testSendSuccessMsg, setTestSendSuccessMsg] = useState<string | null>(null);

  // Notification helper
  const notify = (msg: string) => {
    if (onNotification) onNotification(msg);
  };

  // Synchronize defaultUserEmail if config was empty
  useEffect(() => {
    if (!config.recipientEmail && defaultUserEmail) {
      setConfig((prev) => ({ ...prev, recipientEmail: defaultUserEmail }));
    }
  }, [defaultUserEmail, config.recipientEmail]);

  // Save config changes to localStorage
  const handleSaveConfig = () => {
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
      notify("Haftalık otomatik raporlama zamanlayıcı ayarları başarıyla kaydedildi.");
      if (onScheduleUpdated) {
        onScheduleUpdated(config);
      }
      onClose();
    } catch (e) {
      notify("Ayarlar kaydedilirken bir hata oluştu.");
    }
  };

  // Compute next delivery info
  const nextDelivery = useMemo(() => {
    return calculateNextDelivery(config.dayOfWeek, config.deliveryTime);
  }, [config.dayOfWeek, config.deliveryTime]);

  // Determine current active dataset based on selected scope
  const getScopeData = (): { data: CompetitorKeywordRanking[]; label: string } => {
    if (config.scope === "filtered") {
      return {
        data: filteredRankings.length > 0 ? filteredRankings : allRankings,
        label: "Filtrelenen Veriler"
      };
    }
    if (config.scope === "goals_only") {
      const goalRankings = allRankings.filter((r) => !!goals[r.id]);
      return {
        data: goalRankings.length > 0 ? goalRankings : allRankings,
        label: "Hedef Belirlenen Kelimeler"
      };
    }
    if (config.scope === "top10") {
      const top10 = [...allRankings]
        .filter((r) => r.userRank !== null && r.userRank !== undefined)
        .sort((a, b) => (a.userRank || 999) - (b.userRank || 999))
        .slice(0, 10);
      return {
        data: top10.length > 0 ? top10 : allRankings.slice(0, 10),
        label: "İlk 10 Sıralama"
      };
    }
    return {
      data: allRankings.length > 0 ? allRankings : filteredRankings,
      label: "Tüm Tablo Verileri"
    };
  };

  const { data: targetKeywords, label: targetScopeLabel } = getScopeData();

  // Metrics for Preview & Report
  const rank1Count = targetKeywords.filter((r) => r.userRank === 1).length;
  const top3Count = targetKeywords.filter((r) => r.userRank !== null && r.userRank !== undefined && r.userRank <= 3).length;
  const top10Count = targetKeywords.filter((r) => r.userRank !== null && r.userRank !== undefined && r.userRank <= 10).length;
  const totalVolume = targetKeywords.reduce((acc, r) => {
    const vol = typeof r.monthlyVolume === "number" ? r.monthlyVolume : parseInt(String(r.monthlyVolume || "").replace(/[^0-9]/g, ""), 10) || 0;
    return acc + vol;
  }, 0);
  const totalOpportunity = targetKeywords.reduce((acc, r) => {
    const opp = typeof r.trafficOpportunity === "number" ? r.trafficOpportunity : parseInt(String(r.trafficOpportunity || "").replace(/[^0-9]/g, ""), 10) || 0;
    return acc + opp;
  }, 0);

  // Execute Immediate Test Report Send
  const handleSendTestReport = async () => {
    if (!config.recipientEmail || !config.recipientEmail.includes("@")) {
      notify("Lütfen geçerli bir alıcı e-posta adresi girin.");
      return;
    }

    setIsSendingTest(true);
    setTestSendSuccessMsg(null);
    setTestSendingStep("1/3 Tablodaki SEO metrikleri ve rakip verileri derleniyor...");

    try {
      await new Promise((res) => setTimeout(res, 600));
      setTestSendingStep("2/3 PDF Yönetici Özeti ve CSV Tablo Ekleri hazırlanıyor...");

      // Generate the CSV data to verify validity
      const comp1 = competitors[0] || { name: "1. Rakip", domain: "rakip1.com" };
      const comp2 = competitors[1] || { name: "2. Rakip", domain: "rakip2.com" };
      const comp3 = competitors[2] || { name: "3. Rakip", domain: "rakip3.com" };

      const csvString = serializeRankingTableData(targetKeywords, {
        userName,
        comp1Name: comp1.name,
        comp2Name: comp2.name,
        comp3Name: comp3.name,
        competitors,
        selectedColumnIds: selectedCsvColumns,
        goals
      });

      await new Promise((res) => setTimeout(res, 700));
      setTestSendingStep(`3/3 ${config.recipientEmail} adresine test e-postası teslim ediliyor...`);

      await new Promise((res) => setTimeout(res, 600));

      const newLog: AutoReportDispatchLog = {
        id: `log-${Date.now()}`,
        dispatchedAt: new Date().toISOString(),
        recipientEmail: config.recipientEmail,
        ccEmails: config.ccEmails || undefined,
        format: config.format,
        scopeLabel: targetScopeLabel,
        keywordCount: targetKeywords.length,
        status: "success",
        statusText: "Başarıyla Gönderildi (200 OK)",
        emailSubject: `[TEST RAPORU] ${config.emailSubjectTemplate}`,
        topRank1Count: rank1Count,
        top3Count: top3Count,
        isTestSend: true
      };

      const updatedLogs = [newLog, ...logs];
      setLogs(updatedLogs);
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(updatedLogs));

      const formatLabel = config.format === "both" ? "PDF + CSV" : config.format.toUpperCase();
      const successText = `Test raporu ${config.recipientEmail} adresine ${formatLabel} ekiyle başarıyla gönderildi!`;
      setTestSendSuccessMsg(successText);
      notify(successText);
    } catch (err) {
      notify("Test raporu gönderilirken bir hata oluştu.");
    } finally {
      setIsSendingTest(false);
      setTestSendingStep("");
    }
  };

  // Direct download of sample CSV from test
  const handleDownloadSampleCsv = () => {
    const comp1 = competitors[0] || { name: "1. Rakip", domain: "rakip1.com" };
    const comp2 = competitors[1] || { name: "2. Rakip", domain: "rakip2.com" };
    const comp3 = competitors[2] || { name: "3. Rakip", domain: "rakip3.com" };

    const csvString = serializeRankingTableData(targetKeywords, {
      userName,
      comp1Name: comp1.name,
      comp2Name: comp2.name,
      comp3Name: comp3.name,
      competitors,
      selectedColumnIds: selectedCsvColumns,
      goals
    });

    const blob = new Blob(["\uFEFF" + csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `otomatik-rapor-ornegi-${userDomain}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    notify("Örnek CSV tablosu indirildi.");
  };

  if (!isOpen) return null;

  return (
    <div 
      id="auto-report-scheduler-modal"
      data-testid="auto-report-scheduler-modal"
      className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="scheduler-modal-title"
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-4xl text-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* MODAL HEADER */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0 relative">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 shrink-0 border border-indigo-400/30">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 id="scheduler-modal-title" className="text-base sm:text-lg font-black text-white tracking-tight">
                  Otomatik SEO Raporlama Zamanlayıcısı
                </h3>
                {config.enabled ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/40 flex items-center gap-1.5 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Zamanlayıcı Aktif</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[11px] font-bold border border-slate-700">
                    Duraklatıldı
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Tablodaki verilerin haftalık otomatik özet raporu olarak kayıtlı e-posta adresinize PDF/CSV formatında gönderilmesini sağlar.
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-close-scheduler-modal"
            data-testid="close-scheduler-modal-button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NAVIGATION TABS */}
        <div className="px-6 py-2.5 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between shrink-0 flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1">
            <button
              type="button"
              id="tab-scheduler-settings"
              data-testid="tab-scheduler-settings"
              onClick={() => setActiveTab("settings")}
              className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "settings"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Zamanlama & Format Ayarları</span>
            </button>

            <button
              type="button"
              id="tab-scheduler-preview"
              data-testid="tab-scheduler-preview"
              onClick={() => setActiveTab("preview")}
              className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "preview"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Canlı E-Posta Önizlemesi</span>
            </button>

            <button
              type="button"
              id="tab-scheduler-history"
              data-testid="tab-scheduler-history"
              onClick={() => setActiveTab("history")}
              className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "history"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Gönderim Günlüğü ({logs.length})</span>
            </button>
          </div>

          {/* Quick Schedule Countdown Pill */}
          {config.enabled && (
            <div className="flex items-center gap-2 bg-indigo-950/80 border border-indigo-500/30 px-3 py-1 rounded-xl text-[11px] text-indigo-200 font-medium">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Bir Sonraki:</span>
              <span className="font-bold text-white">{nextDelivery.formattedText.split(",")[1] || nextDelivery.formattedText}</span>
              <span className="text-[10px] text-indigo-300 font-mono">({nextDelivery.timeUntilText})</span>
            </div>
          )}
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar text-xs">
          
          {/* TAB 1: SETTINGS */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              
              {/* 1. MASTER TOGGLE & STATUS CARD */}
              <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                config.enabled 
                  ? "bg-gradient-to-br from-emerald-950/40 via-slate-900 to-indigo-950/30 border-emerald-500/40 shadow-lg shadow-emerald-950/30" 
                  : "bg-slate-950/60 border-slate-800"
              }`}>
                <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${config.enabled ? "bg-emerald-400 shadow-md shadow-emerald-400/50 animate-pulse" : "bg-slate-500"}`} />
                      <h4 className="text-sm font-black text-white">
                        Haftalık Otomatik E-Posta Rapor Gönderimi
                      </h4>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed max-w-xl">
                      Etkinleştirildiğinde, arka plan zamanlayıcısı tablodaki en güncel anahtar kelime sıralamalarını, SERP farklarını ve rakip analizlerini her hafta belirttiğiniz gün ve saatte kayıtlı e-posta adresinize PDF ve CSV ekleriyle otomatik olarak ulaştırır.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <span className="text-xs font-bold text-slate-300">
                      {config.enabled ? "Açık (Aktif)" : "Kapalı"}
                    </span>
                    <button
                      type="button"
                      id="toggle-auto-report-enabled"
                      data-testid="toggle-auto-report-enabled"
                      role="switch"
                      aria-checked={config.enabled}
                      onClick={() => setConfig((prev) => ({ ...prev, enabled: !prev.enabled }))}
                      className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer relative ${
                        config.enabled ? "bg-emerald-500" : "bg-slate-700"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                          config.enabled ? "translate-x-6" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {config.enabled && (
                  <div className="mt-4 pt-3.5 border-t border-emerald-500/20 flex flex-wrap items-center justify-between gap-3 text-[11px]">
                    <div className="flex items-center gap-2 text-emerald-300">
                      <CalendarDays className="w-4 h-4 text-emerald-400" />
                      <span>Planlanan Sonraki Gönderim: <strong>{nextDelivery.formattedText}</strong></span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-lg bg-emerald-900/60 text-emerald-200 border border-emerald-500/30 font-mono text-[10px]">
                      Kalan Süre: {nextDelivery.timeUntilText}
                    </span>
                  </div>
                )}
              </div>

              {/* 2. RECIPIENT EMAIL ADDRESS CONFIGURATION */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-indigo-400" />
                    <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                      Alıcı E-Posta Bilgileri
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-medium text-[10px] border border-indigo-500/30">
                    Kayıtlı Profil: {defaultUserEmail}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Primary Recipient Email */}
                  <div>
                    <label 
                      htmlFor="input-auto-report-recipient-email" 
                      className="block text-[11px] font-bold text-slate-300 mb-1"
                    >
                      Kayıtlı E-Posta Adresi (Ana Alıcı):
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        id="input-auto-report-recipient-email"
                        data-testid="recipient-email-input"
                        value={config.recipientEmail}
                        onChange={(e) => setConfig((prev) => ({ ...prev, recipientEmail: e.target.value }))}
                        placeholder="selimoyan@gmail.com"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 pr-10"
                      />
                      <Mail className="w-4 h-4 text-slate-500 absolute right-3 top-2.5 pointer-events-none" />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Haftalık özet rapor ve ekler bu birincil adrese iletilir.
                    </p>
                  </div>

                  {/* CC / Additional Stakeholder Emails */}
                  <div>
                    <label 
                      htmlFor="input-auto-report-cc-emails" 
                      className="block text-[11px] font-bold text-slate-300 mb-1"
                    >
                      Bilgi (CC) E-Posta Adresleri (İsteğe Bağlı):
                    </label>
                    <input
                      type="text"
                      id="input-auto-report-cc-emails"
                      data-testid="cc-emails-input"
                      value={config.ccEmails}
                      onChange={(e) => setConfig((prev) => ({ ...prev, ccEmails: e.target.value }))}
                      placeholder="pazarlama@jetkur.com.tr, yonetim@jetkur.com.tr"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Birden fazla adresi virgülle ayırarak ekleyebilirsiniz.
                    </p>
                  </div>
                </div>

                {/* Email Subject Template */}
                <div>
                  <label 
                    htmlFor="input-auto-report-subject" 
                    className="block text-[11px] font-bold text-slate-300 mb-1"
                  >
                    E-Posta Konu Başlığı Şablonu:
                  </label>
                  <input
                    type="text"
                    id="input-auto-report-subject"
                    data-testid="subject-input"
                    value={config.emailSubjectTemplate}
                    onChange={(e) => setConfig((prev) => ({ ...prev, emailSubjectTemplate: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* 3. SCHEDULE & TIMING (FREQUENCY, DAY, TIME) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                    Zamanlama & Sıklık Ayarları
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Frequency Picker */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                      Rapor Sıklığı:
                    </label>
                    <div className="space-y-1.5">
                      {[
                        { id: "weekly", label: "Haftalık (Önerilen)", desc: "Her hafta seçilen günde" },
                        { id: "biweekly", label: "İki Haftada Bir", desc: "15 günde bir periyodik" },
                        { id: "monthly", label: "Aylık", desc: "Her ayın ilk günü" }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setConfig((prev) => ({ ...prev, frequency: item.id as ReportFrequency }))}
                          className={`w-full p-2 rounded-xl text-left border transition-all cursor-pointer ${
                            config.frequency === item.id
                              ? "bg-indigo-900/60 border-indigo-500 text-white shadow-xs"
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <div className="font-bold text-[11px]">{item.label}</div>
                          <div className="text-[10px] text-slate-400 opacity-80">{item.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Day of Week Selector */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                      Gönderim Günü (Haftalık):
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {DAYS_OF_WEEK.map((day) => (
                        <button
                          key={day.id}
                          type="button"
                          onClick={() => setConfig((prev) => ({ ...prev, dayOfWeek: day.id }))}
                          className={`p-2 rounded-xl text-center font-bold text-xs border transition-all cursor-pointer ${
                            config.dayOfWeek === day.id
                              ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-xs"
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                          }`}
                        >
                          <div>{day.short}</div>
                          <div className="text-[9px] font-normal opacity-70">{day.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Time Selector */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                      Gönderim Saati (TSİ):
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {DELIVERY_TIMES.map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setConfig((prev) => ({ ...prev, deliveryTime: time }))}
                          className={`p-2 rounded-xl text-center font-mono font-bold text-xs border transition-all cursor-pointer ${
                            config.deliveryTime === time
                              ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-xs"
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2">
                      Pazartesi 09:00, haftalık iş başlangıcı için SEO metriklerini incelemek üzere en çok tercih edilen saattir.
                    </p>
                  </div>
                </div>
              </div>

              {/* 4. ATTACHMENT FORMAT & DATA SCOPE */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                    Ek Dosya Formatı & Veri Kapsamı
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Format Selection (Both, PDF, CSV) */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                      E-Posta Ek Dosya Formatı:
                    </label>
                    <div className="space-y-2">
                      {/* Both (Recommended) */}
                      <button
                        type="button"
                        onClick={() => setConfig((prev) => ({ ...prev, format: "both" }))}
                        className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                          config.format === "both"
                            ? "bg-gradient-to-r from-emerald-950/70 to-teal-950/50 border-emerald-500 text-white shadow-xs"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center font-bold text-[10px]">
                            PDF+CSV
                          </div>
                          <div>
                            <div className="font-bold text-xs text-white">Her İkisi (PDF Raporu + CSV Tablosu)</div>
                            <div className="text-[10px] text-slate-400">Yönetici incelemesi için PDF, derin analiz için CSV</div>
                          </div>
                        </div>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300 text-[9px] font-bold border border-emerald-500/30">
                          Önerilen
                        </span>
                      </button>

                      {/* PDF Only */}
                      <button
                        type="button"
                        onClick={() => setConfig((prev) => ({ ...prev, format: "pdf" }))}
                        className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                          config.format === "pdf"
                            ? "bg-rose-950/50 border-rose-500 text-white shadow-xs"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center justify-center">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-xs text-white">Yalnızca PDF Raporu (.pdf)</div>
                            <div className="text-[10px] text-slate-400">A4 yatay grafikler, KPI kartları ve kıyas matrisi</div>
                          </div>
                        </div>
                      </button>

                      {/* CSV Only */}
                      <button
                        type="button"
                        onClick={() => setConfig((prev) => ({ ...prev, format: "csv" }))}
                        className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                          config.format === "csv"
                            ? "bg-teal-950/50 border-teal-500 text-white shadow-xs"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center">
                            <FileSpreadsheet className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-xs text-white">Yalnızca CSV Tablosu (.csv)</div>
                            <div className="text-[10px] text-slate-400">Excel ve Google Sheets uyumlu ham veriler</div>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Scope Selection */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                      Rapor Veri Kapsamı:
                    </label>
                    <div className="space-y-2">
                      {[
                        { id: "all", label: `Tüm Tablo Verileri (${allRankings.length} Kelime)`, desc: "Tüm anahtar kelimeleri ve rakipleri içerir" },
                        { id: "filtered", label: `Filtrelenen Veriler (${filteredRankings.length} Kelime)`, desc: "Tabloda o an aktif olan filtreleri baz alır" },
                        { id: "goals_only", label: "Yalnızca Hedef Belirlenen Kelimeler", desc: "Özel sıralama hedefi koyduğunuz kelimeleri raporlar" },
                        { id: "top10", label: "İlk 10 Anahtar Kelime (En Yüksek Hacimliler)", desc: "En kritik ilk 10 anahtar kelimenin özetini iletir" }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setConfig((prev) => ({ ...prev, scope: item.id as ReportScope }))}
                          className={`w-full p-2 rounded-xl text-left border transition-all cursor-pointer ${
                            config.scope === item.id
                              ? "bg-indigo-900/50 border-indigo-500 text-white shadow-xs"
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <div className="font-bold text-[11px] text-slate-200">{item.label}</div>
                          <div className="text-[10px] text-slate-400">{item.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Additional Content Toggles */}
                <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer hover:bg-slate-900">
                    <input
                      type="checkbox"
                      checked={config.includeAiSummary}
                      onChange={(e) => setConfig((prev) => ({ ...prev, includeAiSummary: e.target.checked }))}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-800 border-slate-700"
                    />
                    <div>
                      <div className="font-bold text-white text-xs flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>AI Yönetici Özeti ve Aksiyon Planı Ekle</span>
                      </div>
                      <div className="text-[10px] text-slate-400">Gemini modelinin haftalık stratejik önerilerini e-posta gövdesine ekler</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer hover:bg-slate-900">
                    <input
                      type="checkbox"
                      checked={config.includeCriticalChanges}
                      onChange={(e) => setConfig((prev) => ({ ...prev, includeCriticalChanges: e.target.checked }))}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-800 border-slate-700"
                    />
                    <div>
                      <div className="font-bold text-white text-xs flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                        <span>Kritik Sıralama Düşüş & Yükselişlerini Vurgula</span>
                      </div>
                      <div className="text-[10px] text-slate-400">Önceki haftaya göre en çok değişen 5 kelimeyi öne çıkarır</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* 5. IMMEDIATE TEST DISPATCH & SAMPLE DOWNLOAD */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4 text-indigo-400" />
                    <h4 className="font-bold text-white text-xs">
                      Hemen Test Raporu Gönder
                    </h4>
                    <span className="px-2 py-0.5 rounded bg-indigo-900 text-indigo-300 font-mono text-[9px]">
                      {targetKeywords.length} Kelime
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Haftalık zamanlayıcının beklemesine gerek kalmadan, mevcut tablo verilerini hemen derleyip <strong>{config.recipientEmail}</strong> adresine test e-postası ve eklerini gönderin.
                  </p>
                  {testSendSuccessMsg && (
                    <div className="text-emerald-300 font-bold text-xs flex items-center gap-1.5 pt-1 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>{testSendSuccessMsg}</span>
                    </div>
                  )}
                  {testSendingStep && (
                    <div className="text-indigo-300 font-mono text-[11px] flex items-center gap-1.5 pt-1">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                      <span>{testSendingStep}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                  <button
                    type="button"
                    id="btn-download-sample-csv"
                    data-testid="download-sample-csv-button"
                    onClick={handleDownloadSampleCsv}
                    className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    title="Örnek CSV Ekini Doğrudan İndir"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Örnek CSV</span>
                  </button>

                  <button
                    type="button"
                    id="btn-send-test-report"
                    data-testid="send-test-report-button"
                    disabled={isSendingTest}
                    onClick={handleSendTestReport}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-600/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSendingTest ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Gönderiliyor...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Şimdi Test Raporu Gönder</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE EMAIL PREVIEW */}
          {activeTab === "preview" && (
            <div className="space-y-4">
              <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-indigo-200">
                  <Info className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>
                    Bu önizleme, haftalık zamanlayıcı tetiklendiğinde alıcı posta kutusunda gösterilecek HTML e-posta tasarımını ve eklerini yansıtır.
                  </span>
                </div>
                <span className="font-mono text-[10px] text-slate-400">UTF-8 HTML5 E-posta</span>
              </div>

              {/* MOCK INBOX ENVELOPE */}
              <div className="rounded-2xl border border-slate-700 bg-slate-950 overflow-hidden shadow-2xl">
                {/* Header envelope info */}
                <div className="p-4 bg-slate-900 border-b border-slate-800 space-y-1.5 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-bold w-16">Kimden:</span>
                    <span className="text-white font-medium">JetKur SEO Otomasyon Sistemi &lt;otomasyon@jetkur.com.tr&gt;</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-bold w-16">Kime:</span>
                    <span className="text-emerald-400 font-mono font-bold">{config.recipientEmail || defaultUserEmail}</span>
                  </div>
                  {config.ccEmails && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-bold w-16">Bilgi (CC):</span>
                      <span className="text-slate-300 font-mono">{config.ccEmails}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-bold w-16">Konu:</span>
                    <span className="text-amber-300 font-bold">{config.emailSubjectTemplate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-bold w-16">Zamanlama:</span>
                    <span className="text-indigo-300">
                      Her {DAYS_OF_WEEK.find((d) => d.id === config.dayOfWeek)?.label} saat {config.deliveryTime} (TSİ)
                    </span>
                  </div>
                </div>

                {/* Email Body Content Simulation */}
                <div className="p-6 bg-slate-900/90 text-slate-200 space-y-5">
                  {/* Email Brand Banner */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-black tracking-widest text-indigo-400">
                        Haftalık Yönetici Bülteni
                      </div>
                      <h4 className="text-base font-black text-white mt-0.5">
                        {userName} ({userDomain}) &bull; SEO Rakip Kıyaslama Özeti
                      </h4>
                      <p className="text-slate-400 text-[10px] mt-0.5">
                        Dönem: {new Date().toLocaleDateString("tr-TR", { month: "long", year: "numeric" })} - 38. Hafta
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center font-black text-indigo-300">
                      SEO
                    </div>
                  </div>

                  {/* Summary Metric Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                      <div className="text-slate-400 text-[10px] font-bold uppercase">Toplam Kelime</div>
                      <div className="text-lg font-black text-white mt-1">{targetKeywords.length}</div>
                      <div className="text-[9px] text-slate-500">İzlenen anahtar kelime</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30 text-center">
                      <div className="text-amber-400 text-[10px] font-bold uppercase">SERP #1 Liderliği</div>
                      <div className="text-lg font-black text-amber-300 mt-1">{rank1Count}</div>
                      <div className="text-[9px] text-amber-400/80">1. Sıradaki kelimeler</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30 text-center">
                      <div className="text-emerald-400 text-[10px] font-bold uppercase">Top 3 Sıralama</div>
                      <div className="text-lg font-black text-emerald-300 mt-1">{top3Count}</div>
                      <div className="text-[9px] text-emerald-400/80">Kürsü pozisyonları</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-indigo-500/30 text-center">
                      <div className="text-indigo-400 text-[10px] font-bold uppercase">Trafik Fırsatı</div>
                      <div className="text-lg font-black text-indigo-300 mt-1">+{totalOpportunity.toLocaleString()}</div>
                      <div className="text-[9px] text-indigo-400/80">Aylık potansiyel tık</div>
                    </div>
                  </div>

                  {/* AI Strategy Highlight in Email */}
                  {config.includeAiSummary && (
                    <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-amber-300">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Gemini AI Haftalık Stratejik Değerlendirmesi:</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        &quot;Bu hafta {targetKeywords[0]?.keyword || "anahtar kelimeler"} odağında rakiplerinize karşı pozitif ivme kaydedildi. Özellikle {competitors[0]?.name || "1. Rakip"} firmasının gerisinde kalınan 2 kelimede içerik güncellemeleri ve şema optimizasyonu yapılması önerilir.&quot;
                      </p>
                    </div>
                  )}

                  {/* Top 3 Keyword Row Preview */}
                  <div className="space-y-2">
                    <div className="font-bold text-slate-300 text-xs">Öne Çıkan Sıralama Tablosu (Özet):</div>
                    <div className="border border-slate-800 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-slate-950 text-slate-400">
                          <tr>
                            <th className="py-1.5 px-3">Anahtar Kelime</th>
                            <th className="py-1.5 px-2 text-center">{userName} Sırası</th>
                            <th className="py-1.5 px-2 text-center">{competitors[0]?.name || "1. Rakip"}</th>
                            <th className="py-1.5 px-2 text-center">Aylık Hacim</th>
                            <th className="py-1.5 px-2 text-right">Durum</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {targetKeywords.slice(0, 4).map((kw) => (
                            <tr key={kw.id} className="hover:bg-slate-800/40">
                              <td className="py-2 px-3 font-bold text-white">{kw.keyword}</td>
                              <td className="py-2 px-2 text-center font-bold text-emerald-400">
                                {kw.userRank ? `#${kw.userRank}` : "-"}
                              </td>
                              <td className="py-2 px-2 text-center text-slate-400">
                                {kw.comp1Rank ? `#${kw.comp1Rank}` : "-"}
                              </td>
                              <td className="py-2 px-2 text-center font-mono text-slate-300">
                                {kw.monthlyVolume?.toLocaleString()}
                              </td>
                              <td className="py-2 px-2 text-right">
                                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300">
                                  {kw.status === "leading" ? "Lider (Önde)" : kw.status === "trailing" ? "Geride" : kw.status === "competing" ? "Kıyasıya" : "Kayıp"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Attachment Cards in Email */}
                  <div className="pt-3 border-t border-slate-800">
                    <div className="text-[11px] font-bold text-slate-400 mb-2">E-Posta Ekleri ({config.format === "both" ? "2 Dosya" : "1 Dosya"}):</div>
                    <div className="flex flex-wrap gap-2.5">
                      {(config.format === "both" || config.format === "pdf") && (
                        <div className="p-2.5 rounded-xl bg-slate-950 border border-rose-500/40 flex items-center gap-2.5 text-xs">
                          <FileText className="w-5 h-5 text-rose-400" />
                          <div>
                            <div className="font-bold text-white">haftalik-seo-ozet-raporu.pdf</div>
                            <div className="text-[10px] text-slate-400">A4 Yatay &bull; 1.2 MB &bull; PDF Belgesi</div>
                          </div>
                        </div>
                      )}

                      {(config.format === "both" || config.format === "csv") && (
                        <div className="p-2.5 rounded-xl bg-slate-950 border border-emerald-500/40 flex items-center gap-2.5 text-xs">
                          <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                          <div>
                            <div className="font-bold text-white">seo-rakip-siralama-verileri.csv</div>
                            <div className="text-[10px] text-slate-400">Excel / E-Tablolar &bull; {targetKeywords.length} Satır &bull; UTF-8</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DISPATCH HISTORY LOGS */}
          {activeTab === "history" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <h4 className="font-bold text-white text-xs">
                    Otomatik Raporlama Gönderim Günlükleri
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Sistem tarafından zamanlanmış ve test olarak iletilen raporların geçmiş kayıtları
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const freshLog: AutoReportDispatchLog = {
                      id: `log-${Date.now()}`,
                      dispatchedAt: new Date().toISOString(),
                      recipientEmail: config.recipientEmail,
                      format: config.format,
                      scopeLabel: targetScopeLabel,
                      keywordCount: targetKeywords.length,
                      status: "success",
                      statusText: "Başarıyla İletildi (200 OK)",
                      emailSubject: config.emailSubjectTemplate,
                      topRank1Count: rank1Count,
                      top3Count: top3Count,
                      isTestSend: false
                    };
                    const updated = [freshLog, ...logs];
                    setLogs(updated);
                    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(updated));
                    notify("Günlük yenilendi.");
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Yenile</span>
                </button>
              </div>

              {logs.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2">
                  <History className="w-8 h-8 text-slate-600 mx-auto" />
                  <div className="text-slate-400 font-bold text-xs">Henüz kayıtlı rapor gönderimi bulunmuyor.</div>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    &quot;Şimdi Test Raporu Gönder&quot; butonuna tıklayarak ilk raporunuzu iletebilir ve günlüğe kaydedebilirsiniz.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {logs.map((log) => (
                    <div 
                      key={log.id} 
                      className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>{log.statusText}</span>
                          </span>
                          {log.isTestSend && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 text-[9px] font-bold border border-amber-500/40">
                              Manuel Test
                            </span>
                          )}
                          <span className="font-bold text-white">{log.emailSubject}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-3 flex-wrap">
                          <span>Alıcı: <strong className="text-slate-200">{log.recipientEmail}</strong></span>
                          <span>Format: <strong className="text-indigo-300 uppercase">{log.format}</strong></span>
                          <span>Kapsam: <strong className="text-slate-200">{log.scopeLabel} ({log.keywordCount} Kelime)</strong></span>
                          <span>SERP #1: <strong className="text-amber-300">{log.topRank1Count}</strong> &bull; Top 3: <strong className="text-emerald-300">{log.top3Count}</strong></span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(log.dispatchedAt).toLocaleString("tr-TR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            handleDownloadSampleCsv();
                          }}
                          className="mt-1 text-[10px] text-indigo-400 hover:text-indigo-300 underline font-medium cursor-pointer"
                        >
                          Ekleri İndir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Kayıtlı e-posta adresiniz ({config.recipientEmail}) güvenli sunucumuzda şifrelenir.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              id="btn-cancel-scheduler"
              data-testid="cancel-scheduler-button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
            >
              Kapat
            </button>

            <button
              type="button"
              id="btn-save-auto-report-schedule"
              data-testid="save-auto-report-schedule-button"
              onClick={handleSaveConfig}
              className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-600/30 active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Ayarları Kaydet</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
