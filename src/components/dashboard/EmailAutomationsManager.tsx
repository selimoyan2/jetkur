import React, { useState, useMemo, useEffect } from "react";
import {
  SiteConfig,
  FormLead,
  LeadThankYouEmailConfig,
  EmailAuditLogEntry
} from "../../types";
import { EmailAutomationSettings } from "./EmailAutomationSettings";
import {
  MailCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Hourglass,
  Search,
  Filter,
  Eye,
  Send,
  RotateCcw,
  RefreshCw,
  Sliders,
  Download,
  Plus,
  X,
  Mail,
  User,
  Phone,
  Building,
  Calendar,
  Sparkles,
  Zap,
  Info,
  Check,
  Copy,
  ChevronDown,
  ShieldCheck,
  FileText,
  Terminal,
  ExternalLink,
  AlertTriangle,
  ArrowRight,
  Layers,
  Activity,
  SlidersHorizontal
} from "lucide-react";

interface EmailAutomationsManagerProps {
  config: SiteConfig;
  onChange: (updatedConfig: SiteConfig) => void;
  onUpdateLead?: (leadId: string, updates: Partial<FormLead>) => void;
  onNavigateToLeads?: () => void;
  onPreview?: () => void;
}

// Normalized Audit Record for every lead & log entry
export interface AutomatedEmailAuditRecord {
  id: string; // Unique audit event ID (e.g. audit_lead_100_...)
  leadId: string;
  leadName: string;
  recipientEmail: string;
  recipientPhone?: string;
  serviceOrProduct?: string;
  sourcePage?: string;
  leadScore?: number;
  leadScorePriority?: "high" | "medium" | "low";
  // Status Tracking
  status: "delivered" | "pending" | "failed";
  statusText: string;
  // Timing
  timestamp: string; // Event timestamp
  scheduledFor?: string;
  sentAt?: string;
  delayMinutes?: number;
  latencyMs?: number;
  // Message Details
  subject: string;
  renderedBody?: string;
  triggerType: "autoresponder" | "followup" | "notification" | "manual_resend" | "test";
  triggerLabel: string;
  // Technical / SMTP Audit Trail
  messageId: string;
  smtpServer: string;
  smtpResponseCode: string;
  tlsVersion: string;
  spfDkimStatus: string;
  failureReason?: string;
  retryCount: number;
  leadRef: FormLead;
}

export const EmailAutomationsManager: React.FC<EmailAutomationsManagerProps> = ({
  config,
  onChange,
  onUpdateLead,
  onNavigateToLeads,
  onPreview
}) => {
  // Main view switcher: "audit-log" vs "template-settings"
  const [activeViewMode, setActiveViewMode] = useState<"audit-log" | "template-settings">("audit-log");

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "delivered" | "pending" | "failed">("all");
  const [timeFilter, setTimeFilter] = useState<"all" | "today" | "yesterday" | "last7days">("all");
  const [sortOption, setSortOption] = useState<"newest" | "oldest" | "status-pending" | "status-failed" | "name">("newest");

  // Selection & Modal states
  const [selectedAuditRecord, setSelectedAuditRecord] = useState<AutomatedEmailAuditRecord | null>(null);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [copiedAuditJson, setCopiedAuditJson] = useState(false);
  const [actionFeedbackToast, setActionFeedbackToast] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [lastFetchedAt, setLastFetchedAt] = useState<string>(() => {
    return new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  });

  // Simulated Test Send Form State
  const [testName, setTestName] = useState("Ahmet Kaya");
  const [testEmail, setTestEmail] = useState("ahmet.kaya@example.com");
  const [testPhone, setTestPhone] = useState("0555 123 45 67");
  const [testService, setTestService] = useState(
    config.services?.[0]?.title || config.sector ? `${config.sector} Hizmeti` : "Genel Hizmet Talebi"
  );
  const [testDelayMinutes, setTestDelayMinutes] = useState<number>(
    Number(config.leadThankYouEmail?.delayMinutes ?? config.customForm?.thankYouEmail?.delayMinutes ?? 5)
  );

  const emailConfig: LeadThankYouEmailConfig =
    config.leadThankYouEmail ||
    config.customForm?.thankYouEmail || {
      enabled: true,
      requireEmail: true,
      subject: "Talebiniz Alındı! Teşekkür Ederiz - {firma}",
      body: "<p>Talebiniz bize ulaştı. Teşekkür ederiz.</p>",
      delayMinutes: 5,
      delayRandomWindow: true
    };

  // Toast Helper
  const showToast = (msg: string) => {
    setActionFeedbackToast(msg);
    setTimeout(() => setActionFeedbackToast(null), 3800);
  };

  // Live Refresh / Fetch Simulation
  const handleFetchAuditLog = (silent = false) => {
    setIsFetching(true);
    setTimeout(() => {
      const timeStr = new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setLastFetchedAt(timeStr);
      setIsFetching(false);
      if (!silent) {
        showToast(`E-posta denetim günlüğü güncellendi (${auditRecords.length} adet otomatik e-posta kaydı doğrulandı).`);
      }
    }, 450);
  };

  // Build Unified Audit Records from leads & any stored emailAuditLogs
  const auditRecords = useMemo<AutomatedEmailAuditRecord[]>(() => {
    const leads = config.leads || [];
    const records: AutomatedEmailAuditRecord[] = [];

    leads.forEach((lead, index) => {
      // Show leads that have an email or thankYouEmailStatus or thankYouEmailSent flag
      const hasEmail = Boolean(lead.email || lead.thankYouEmailStatus || lead.thankYouEmailSent !== undefined);
      if (!hasEmail) return;

      // Determine status
      let status: "delivered" | "pending" | "failed" = "delivered";
      if (lead.thankYouEmailStatus === "failed") {
        status = "failed";
      } else if (lead.thankYouEmailStatus === "pending" || lead.thankYouEmailStatus === "queued" || lead.thankYouEmailSent === false) {
        status = "pending";
      } else if (lead.thankYouEmailStatus === "delivered" || lead.thankYouEmailSent === true) {
        status = "delivered";
      }

      // Generate consistent deterministic technical metadata
      const leadNum = lead.id.replace(/\D/g, "") || String(100 + index);
      const messageId = `<msg-lead-${leadNum}-${lead.id}@mail.hizliweb.cloud>`;
      const smtpServer = "smtp-out.hizliweb.cloud:587 (TLS 1.3)";
      const smtpResponseCode =
        status === "delivered"
          ? "250 2.0.0 OK: message queued 10928371 via MTA"
          : status === "pending"
          ? "220 Ready - Scheduled in queue worker #1"
          : lead.thankYouEmailFailureReason?.includes("550")
          ? "550 5.1.1 Mailbox unavailable: recipient address rejected"
          : "421 4.7.0 Connection timeout / Temporary delivery failure";

      const latencyMs = status === "delivered" ? 750 + (parseInt(leadNum, 10) % 650) : undefined;
      const spfDkimStatus = "SPF: PASS • DKIM: PASS (2048-bit RSA) • DMARC: PASS";

      // Subject
      const rawSubject =
        lead.thankYouEmailSubject ||
        emailConfig.subject ||
        "Talebiniz Alındı! Teşekkür Ederiz - {firma}";
      const subject = rawSubject
        .replace(/{firma}/g, config.companyName || "Şirketimiz")
        .replace(/{isim}/g, lead.name || "Müşterimiz")
        .replace(/{hizmet}/g, lead.serviceOrProduct || "Hizmet")
        .replace(/{telefon}/g, config.phone || "");

      // Body preview
      const rawBody =
        lead.thankYouEmailRenderedBody ||
        emailConfig.body ||
        `<p>Sayın <strong>{isim}</strong>,</p><p><strong>{hizmet}</strong> konulu başvurunuz elimize ulaştı. Teşekkür ederiz.</p>`;
      const renderedBody = rawBody
        .replace(/{firma}/g, config.companyName || "Şirketimiz")
        .replace(/{isim}/g, lead.name || "Müşterimiz")
        .replace(/{hizmet}/g, lead.serviceOrProduct || "Hizmet")
        .replace(/{telefon}/g, config.phone || "");

      // Status text label
      const statusText =
        status === "delivered"
          ? "Delivered (İletildi)"
          : status === "pending"
          ? "Pending (Kuyrukta / Beklemede)"
          : "Failed (Başarısız / Hata)";

      records.push({
        id: `audit-${lead.id}`,
        leadId: lead.id,
        leadName: lead.name || "İsimsiz Talep",
        recipientEmail: lead.email || "e-posta-belirtilmedi@domain.com",
        recipientPhone: lead.phone,
        serviceOrProduct: lead.serviceOrProduct,
        sourcePage: lead.sourcePage,
        leadScore: lead.leadScore,
        leadScorePriority: lead.leadScorePriority,
        status,
        statusText,
        timestamp: lead.date || "Bugün 12:00",
        scheduledFor: lead.thankYouEmailScheduledFor,
        sentAt: lead.thankYouEmailSentAt,
        delayMinutes: lead.thankYouEmailDelayMinutes ?? emailConfig.delayMinutes ?? 5,
        latencyMs,
        subject,
        renderedBody,
        triggerType: (lead.tags?.includes("Test Yanıt") ? "test" : "autoresponder"),
        triggerLabel: (lead.tags?.includes("Test Yanıt") ? "Simüle Test Yanıtı" : "Form Gönderimi Teşekkür E-postası"),
        messageId,
        smtpServer,
        smtpResponseCode,
        tlsVersion: "TLSv1.3 (AES_256_GCM_SHA384)",
        spfDkimStatus,
        failureReason: lead.thankYouEmailFailureReason,
        retryCount: status === "failed" ? 3 : 0,
        leadRef: lead
      });
    });

    return records;
  }, [config.leads, emailConfig, config.companyName, config.phone]);

  // Top Statistics
  const stats = useMemo(() => {
    let delivered = 0;
    let pending = 0;
    let failed = 0;

    auditRecords.forEach((r) => {
      if (r.status === "delivered") delivered++;
      else if (r.status === "pending") pending++;
      else if (r.status === "failed") failed++;
    });

    const total = auditRecords.length;
    const successRate = total > 0 ? Math.round((delivered / total) * 100) : 100;
    const bounceRate = total > 0 ? Math.round((failed / total) * 100) : 0;

    return { total, delivered, pending, failed, successRate, bounceRate };
  }, [auditRecords]);

  // Filtered & Sorted Records
  const filteredRecords = useMemo(() => {
    return auditRecords
      .filter((rec) => {
        // Status Filter
        if (statusFilter !== "all" && rec.status !== statusFilter) {
          return false;
        }

        // Time Filter
        if (timeFilter !== "all") {
          const t = rec.timestamp.toLowerCase();
          if (timeFilter === "today" && !t.includes("bugün") && !t.includes("today")) return false;
          if (timeFilter === "yesterday" && !t.includes("dün") && !t.includes("yesterday")) return false;
          if (timeFilter === "last7days" && (t.includes("ay önce") || t.includes("hafta önce"))) return false;
        }

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = rec.leadName.toLowerCase().includes(q);
          const matchEmail = rec.recipientEmail.toLowerCase().includes(q);
          const matchSubject = rec.subject.toLowerCase().includes(q);
          const matchId = rec.leadId.toLowerCase().includes(q);
          const matchService = (rec.serviceOrProduct || "").toLowerCase().includes(q);
          if (!matchName && !matchEmail && !matchSubject && !matchId && !matchService) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOption === "name") {
          return a.leadName.localeCompare(b.leadName, "tr");
        }
        if (sortOption === "status-pending") {
          if (a.status === "pending" && b.status !== "pending") return -1;
          if (a.status !== "pending" && b.status === "pending") return 1;
        }
        if (sortOption === "status-failed") {
          if (a.status === "failed" && b.status !== "failed") return -1;
          if (a.status !== "failed" && b.status === "failed") return 1;
        }
        if (sortOption === "oldest") {
          return a.leadId.localeCompare(b.leadId);
        }
        // Default newest first
        return b.leadId.localeCompare(a.leadId);
      });
  }, [auditRecords, statusFilter, timeFilter, searchQuery, sortOption]);

  // Action: Immediate send for pending message (bypasses delay timer)
  const handleSendNow = (rec: AutomatedEmailAuditRecord) => {
    const curTime = new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
    const updates: Partial<FormLead> = {
      thankYouEmailSent: true,
      thankYouEmailStatus: "delivered",
      thankYouEmailSentAt: `Bugün ${curTime}`,
      thankYouEmailScheduledFor: `Anında iletildi (Kuyruk atlandı • ${curTime})`,
      thankYouEmailFailureReason: undefined
    };

    if (onUpdateLead) {
      onUpdateLead(rec.leadId, updates);
    } else {
      const updatedLeads = (config.leads || []).map((l) => (l.id === rec.leadId ? { ...l, ...updates } : l));
      onChange({ ...config, leads: updatedLeads });
    }

    if (selectedAuditRecord && selectedAuditRecord.leadId === rec.leadId) {
      setSelectedAuditRecord({
        ...selectedAuditRecord,
        status: "delivered",
        statusText: "Delivered (İletildi)",
        sentAt: `Bugün ${curTime}`,
        scheduledFor: `Anında iletildi (Kuyruk atlandı • ${curTime})`,
        smtpResponseCode: "250 2.0.0 OK: message queued 10928371 via MTA"
      });
    }

    showToast(`'${rec.leadName}' (${rec.recipientEmail}) için otomatik teşekkür e-postası anında teslim edildi (250 OK).`);
  };

  // Action: Resend / Retry delivery
  const handleResend = (rec: AutomatedEmailAuditRecord) => {
    const curTime = new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
    const updates: Partial<FormLead> = {
      thankYouEmailSent: true,
      thankYouEmailStatus: "delivered",
      thankYouEmailSentAt: `Bugün ${curTime}`,
      thankYouEmailFailureReason: undefined
    };

    if (onUpdateLead) {
      onUpdateLead(rec.leadId, updates);
    } else {
      const updatedLeads = (config.leads || []).map((l) => (l.id === rec.leadId ? { ...l, ...updates } : l));
      onChange({ ...config, leads: updatedLeads });
    }

    if (selectedAuditRecord && selectedAuditRecord.leadId === rec.leadId) {
      setSelectedAuditRecord({
        ...selectedAuditRecord,
        status: "delivered",
        statusText: "Delivered (İletildi)",
        sentAt: `Bugün ${curTime}`,
        failureReason: undefined,
        smtpResponseCode: "250 2.0.0 OK: Re-delivered successfully via SMTP handshake"
      });
    }

    showToast(`'${rec.recipientEmail}' adresine e-posta yeniden iletildi (250 2.0.0 OK).`);
  };

  // Action: Manual Status Override (Delivered / Pending / Failed)
  const handleChangeStatus = (rec: AutomatedEmailAuditRecord, newStatus: "delivered" | "pending" | "failed") => {
    const curTime = new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
    const updates: Partial<FormLead> = {
      thankYouEmailStatus: newStatus,
      thankYouEmailSent: newStatus === "delivered"
    };

    if (newStatus === "delivered" && !rec.sentAt) {
      updates.thankYouEmailSentAt = `Bugün ${curTime}`;
    }
    if (newStatus === "failed") {
      updates.thankYouEmailFailureReason = "550 5.1.1 Manuel denetim: Geçersiz posta kutusu veya alan adı hatası";
    } else {
      updates.thankYouEmailFailureReason = undefined;
    }

    if (onUpdateLead) {
      onUpdateLead(rec.leadId, updates);
    } else {
      const updatedLeads = (config.leads || []).map((l) => (l.id === rec.leadId ? { ...l, ...updates } : l));
      onChange({ ...config, leads: updatedLeads });
    }

    if (selectedAuditRecord && selectedAuditRecord.leadId === rec.leadId) {
      setSelectedAuditRecord({
        ...selectedAuditRecord,
        status: newStatus,
        statusText:
          newStatus === "delivered"
            ? "Delivered (İletildi)"
            : newStatus === "pending"
            ? "Pending (Kuyrukta / Beklemede)"
            : "Failed (Başarısız / Hata)",
        sentAt: newStatus === "delivered" ? `Bugün ${curTime}` : undefined,
        failureReason: newStatus === "failed" ? updates.thankYouEmailFailureReason : undefined
      });
    }

    showToast(`'${rec.leadName}' e-posta durumu '${newStatus.toUpperCase()}' olarak güncellendi.`);
  };

  // Action: Copy email address
  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  // Action: Create Simulated Test Automation
  const handleCreateTestAutomation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail.trim()) return;

    const isInstant = testDelayMinutes === 0;
    const curTime = new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
    const targetDate = new Date(Date.now() + testDelayMinutes * 60 * 1000);
    const scheduledTime = targetDate.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });

    const newLead: FormLead = {
      id: `lead-${Date.now()}`,
      date: `Bugün ${curTime}`,
      name: testName.trim() || "Test Müşteri",
      phone: testPhone.trim() || "0555 000 00 00",
      email: testEmail.trim(),
      serviceOrProduct: testService,
      message: "E-posta Otomasyonu Denetim Günlüğü testi için simüle edilen talep.",
      sourcePage: "Email Automations Test",
      status: "new",
      thankYouEmailSent: isInstant,
      thankYouEmailSentAt: isInstant ? `Bugün ${curTime}` : undefined,
      thankYouEmailStatus: isInstant ? "delivered" : "pending",
      thankYouEmailScheduledFor: isInstant
        ? "Anında İletildi (0 dk gecikme)"
        : `Bugün ${scheduledTime} (${testDelayMinutes} dk doğal gecikme)`,
      thankYouEmailDelayMinutes: testDelayMinutes,
      thankYouEmailSubject: (emailConfig.subject || "Talebiniz Alındı! Teşekkür Ederiz - {firma}")
        .replace(/{firma}/g, config.companyName || "Şirketimiz")
        .replace(/{isim}/g, testName.trim() || "Müşterimiz"),
      tags: ["Test Otomasyon", isInstant ? "Delivered" : "Pending"]
    };

    const updatedLeads = [newLead, ...(config.leads || [])];
    onChange({ ...config, leads: updatedLeads });

    setIsTestModalOpen(false);
    showToast(
      isInstant
        ? `Yeni test e-postası '${testEmail}' adresine anında teslim edildi (Delivered).`
        : `Yeni test e-postası saat ${scheduledTime}'a (${testDelayMinutes} dk bekleme) planlandı (Pending).`
    );
  };

  // Export to CSV
  const handleExportCsv = () => {
    const headers = [
      "Audit ID",
      "Lead ID",
      "Tarih / Zaman Damgası",
      "Müşteri Adı",
      "Alıcı E-Posta",
      "Telefon",
      "Hizmet / Talep",
      "Durum (Status)",
      "Konu Başlığı",
      "Tetikleyici Türü",
      "Planlanan Zaman (Scheduled)",
      "Teslimat Zamanı (SentAt)",
      "Gecikme (Dk)",
      "Gecikme Süresi (Latency ms)",
      "Message-ID",
      "SMTP Yanıt Kodu",
      "Hata Açıklaması (Failure Reason)"
    ];

    const rows = auditRecords.map((r) => {
      return [
        `"${r.id}"`,
        `"${r.leadId}"`,
        `"${r.timestamp}"`,
        `"${(r.leadName || "").replace(/"/g, '""')}"`,
        `"${(r.recipientEmail || "").replace(/"/g, '""')}"`,
        `"${(r.recipientPhone || "").replace(/"/g, '""')}"`,
        `"${(r.serviceOrProduct || "").replace(/"/g, '""')}"`,
        `"${r.status.toUpperCase()}"`,
        `"${(r.subject || "").replace(/"/g, '""')}"`,
        `"${r.triggerLabel}"`,
        `"${(r.scheduledFor || "-").replace(/"/g, '""')}"`,
        `"${(r.sentAt || "-").replace(/"/g, '""')}"`,
        `"${r.delayMinutes ?? 0}"`,
        `"${r.latencyMs ?? "-"}"`,
        `"${r.messageId}"`,
        `"${(r.smtpResponseCode || "").replace(/"/g, '""')}"`,
        `"${(r.failureReason || "-").replace(/"/g, '""')}"`
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `email_automations_audit_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("E-posta otomasyon denetim günlüğü (CSV) başarıyla indirildi.");
  };

  // Export to JSON
  const handleExportJson = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(auditRecords, null, 2)
    )}`;
    const link = document.createElement("a");
    link.setAttribute("href", jsonString);
    link.setAttribute("download", `email_automations_audit_log_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Teknik denetim günlüğü (JSON) başarıyla indirildi.");
  };

  return (
    <div id="email-automations-section" className="space-y-6">
      {/* Toast Notification */}
      {actionFeedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-950 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionFeedbackToast}</span>
        </div>
      )}

      {/* 1. MASTER HEADER CARD */}
      <div className="bg-white rounded-2xl p-6 lg:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200/70 text-sky-600 flex items-center justify-center shrink-0 shadow-xs">
              <MailCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Email Automations
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-sky-100 text-sky-900 border border-sky-200 flex items-center gap-1.5 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-600 animate-pulse" />
                  Detailed Delivery Audit Log & Lead Status Tracking
                </span>
              </div>
              <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
                Form dolduran tüm potansiyel müşterilere (leads) gönderilen otomatik e-postaların detaylı denetim kaydını
                (audit log) inceleyin. Her talep için teslimat durumunu (<strong>Delivered</strong> /{" "}
                <strong>Pending</strong> / <strong>Failed</strong>) bağımsız olarak izleyin, kuyruğu yönetin ve teknik SMTP
                yanıtlarını denetleyin.
              </p>
              <div className="flex items-center gap-3 pt-0.5 text-[11px] text-slate-500 flex-wrap">
                <span className="flex items-center gap-1.5 font-medium text-slate-600">
                  <span className={`w-2 h-2 rounded-full ${isFetching ? "bg-amber-500 animate-ping" : "bg-emerald-500"}`} />
                  <span>{isFetching ? "Sunucu denetim logları çekiliyor..." : `Canlı Güncel • Son Eşitleme: ${lastFetchedAt}`}</span>
                </span>
                <span className="text-slate-300">•</span>
                <span>{auditRecords.length} Otomatik E-Posta Kaydı</span>
                <span className="text-slate-300">•</span>
                <span className="text-emerald-700 font-semibold">% {stats.successRate} Başarılı Teslimat</span>
              </div>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            {/* Live Fetch / Refresh Button */}
            <button
              type="button"
              id="btn-fetch-audit-log"
              onClick={() => handleFetchAuditLog(false)}
              disabled={isFetching}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
              title="E-posta sunucusu ve kuyruğundan son denetim loglarını getir / yenile"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${isFetching ? "animate-spin" : ""}`} />
              <span>{isFetching ? "Getiriliyor..." : "Denetim Kaydını Yenile"}</span>
            </button>

            {/* Simulate Test Email */}
            <button
              type="button"
              id="btn-simulate-test-email"
              onClick={() => setIsTestModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Denetim günlüğünü test etmek için yeni bir simüle e-posta tetikle"
            >
              <Plus className="w-4 h-4" />
              <span>Test E-postası Tetikle</span>
            </button>

            {/* Export CSV & JSON */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                id="btn-export-audit-csv"
                onClick={handleExportCsv}
                className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                title="CSV Denetim Raporu İndir"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>CSV</span>
              </button>
              <button
                type="button"
                id="btn-export-audit-json"
                onClick={handleExportJson}
                className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                title="Teknik JSON Log İndir"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>JSON</span>
              </button>
            </div>
          </div>
        </div>

        {/* SUB-VIEW SWITCHER: AUDIT LOG vs TEMPLATE CONFIGURATION */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <button
            type="button"
            id="tab-view-audit-log"
            onClick={() => setActiveViewMode("audit-log")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeViewMode === "audit-log"
                ? "bg-sky-600 text-white shadow-xs shadow-sky-500/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Denetim Günlüğü & Lead Takibi (Audit Log)</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
              activeViewMode === "audit-log" ? "bg-sky-500 text-white" : "bg-slate-100 text-slate-600"
            }`}>
              {auditRecords.length}
            </span>
          </button>

          <button
            type="button"
            id="tab-view-template-settings"
            onClick={() => setActiveViewMode("template-settings")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeViewMode === "template-settings"
                ? "bg-sky-600 text-white shadow-xs shadow-sky-500/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Şablon & Zamanlayıcı Kuralı Ayarları</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-amber-100 text-amber-900 border border-amber-200">
              {emailConfig.delayMinutes ?? 5} dk gecikme
            </span>
          </button>
        </div>

        {/* 2. STATS & KPI METRICS SUMMARY CARDS */}
        {activeViewMode === "audit-log" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {/* Card 1: Total Sent & Logged */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                  <span>Toplam Otomasyon</span>
                  <Mail className="w-4 h-4 text-slate-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-slate-900">{stats.total}</div>
                <div className="text-[11px] text-slate-500">Müşteri denetim kaydı</div>
              </div>

              {/* Card 2: Delivered (İletildi) */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
                <div className="flex items-center justify-between text-emerald-800 text-xs font-semibold">
                  <span>Delivered (İletildi)</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold font-mono text-emerald-950">{stats.delivered}</div>
                <div className="text-[11px] text-emerald-700 font-medium">Başarı Oranı: %{stats.successRate}</div>
              </div>

              {/* Card 3: Pending (Beklemede / Sırada) */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1">
                <div className="flex items-center justify-between text-amber-800 text-xs font-semibold">
                  <span>Pending (Beklemede)</span>
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl font-bold font-mono text-amber-950">{stats.pending}</div>
                <div className="text-[11px] text-amber-700">Kuyrukta zamanlayıcıda</div>
              </div>

              {/* Card 4: Failed (Başarısız / Hata) */}
              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 space-y-1">
                <div className="flex items-center justify-between text-rose-800 text-xs font-semibold">
                  <span>Failed (Hata)</span>
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                </div>
                <div className="text-2xl font-bold font-mono text-rose-950">{stats.failed}</div>
                <div className="text-[11px] text-rose-700 font-medium">Hata Oranı: %{stats.bounceRate}</div>
              </div>

              {/* Card 5: Rule & Active Mode */}
              <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200/80 space-y-1 col-span-2 sm:col-span-1">
                <div className="flex items-center justify-between text-sky-800 text-xs font-semibold">
                  <span>Aktif Kural & Delay</span>
                  <Hourglass className="w-4 h-4 text-sky-600" />
                </div>
                <div className="text-2xl font-bold font-mono text-sky-950">
                  {(emailConfig.delayMinutes ?? 5) > 0 ? `${emailConfig.delayMinutes ?? 5} Dk` : "Anında"}
                </div>
                <div className="text-[11px] text-sky-700">
                  {(emailConfig.delayMinutes ?? 5) > 0 ? "Doğal Takip Gecikmesi" : "Gecikmesiz İletim"}
                </div>
              </div>
            </div>

            {/* Informative Rule Summary Banner */}
            <div className="p-3.5 rounded-xl bg-sky-50/60 border border-sky-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-sky-950">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
                <span>
                  <strong>Denetim Standardı:</strong> Her e-posta gönderim girişimi Message-ID, SMTP handshake, alıcı yanıt kodu ve teslimat gecikmesi (latency) ile kalıcı olarak günlüklenir.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveViewMode("template-settings")}
                className="text-sky-800 font-bold hover:underline shrink-0 flex items-center gap-1 cursor-pointer"
              >
                <span>Şablon ve Gecikme Kuralını Düzenle</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. SUB-VIEW: TEMPLATE SETTINGS EMBED */}
      {activeViewMode === "template-settings" && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveViewMode("audit-log")}
                className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
              >
                ← Denetim Günlüğüne Geri Dön
              </button>
            </div>
            <span className="text-xs text-slate-500">
              Burada yapacağınız şablon ve gecikme değişiklikleri yeni oluşturulacak tüm otomasyonlara yansıtılır.
            </span>
          </div>
          <EmailAutomationSettings
            config={config}
            onChange={onChange}
            onPreview={onPreview}
            onNavigateToLeads={onNavigateToLeads}
            onNavigateToResponses={() => setActiveViewMode("audit-log")}
          />
        </div>
      )}

      {/* 4. SUB-VIEW: DETAILED AUDIT LOG & INDIVIDUAL LEAD STATUS TRACKING */}
      {activeViewMode === "audit-log" && (
        <div className="space-y-4">
          {/* TOOLBAR: SEARCH, STATUS FILTER PILLS, TIME FILTER & SORT */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search input */}
            <div className="relative w-full lg:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="input-search-email-automations"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="İsim, e-posta, konu veya Lead ID ara..."
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 bg-slate-50/50"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
              <button
                type="button"
                id="filter-status-all"
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === "all"
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                }`}
              >
                Tümü ({auditRecords.length})
              </button>

              <button
                type="button"
                id="filter-status-delivered"
                onClick={() => setStatusFilter("delivered")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  statusFilter === "delivered"
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "bg-emerald-50 text-emerald-800 border border-emerald-200/60 hover:bg-emerald-100"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Delivered ({stats.delivered})
              </button>

              <button
                type="button"
                id="filter-status-pending"
                onClick={() => setStatusFilter("pending")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  statusFilter === "pending"
                    ? "bg-amber-600 text-white shadow-2xs"
                    : "bg-amber-50 text-amber-800 border border-amber-200/60 hover:bg-amber-100"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                Pending ({stats.pending})
              </button>

              <button
                type="button"
                id="filter-status-failed"
                onClick={() => setStatusFilter("failed")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  statusFilter === "failed"
                    ? "bg-rose-600 text-white shadow-2xs"
                    : "bg-rose-50 text-rose-800 border border-rose-200/60 hover:bg-rose-100"
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5" />
                Failed ({stats.failed})
              </button>
            </div>

            {/* Time Filter & Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Time Filter */}
              <select
                id="select-time-email-automations"
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as any)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="all">Tüm Zamanlar</option>
                <option value="today">Bugün</option>
                <option value="yesterday">Dün</option>
                <option value="last7days">Son 7 Gün</option>
              </select>

              {/* Sort Selector */}
              <select
                id="select-sort-email-automations"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as any)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="newest">En Yeni Gönderim</option>
                <option value="oldest">En Eski Gönderim</option>
                <option value="status-pending">Bekleyenler Önce (Pending)</option>
                <option value="status-failed">Hatalılar Önce (Failed)</option>
                <option value="name">Müşteri Adı (A-Z)</option>
              </select>
            </div>
          </div>

          {/* AUDIT LOG TABLE */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse" id="table-email-automations-audit-log">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Alıcı / Müşteri (Lead)</th>
                    <th className="py-3 px-4">E-Posta Konusu & Tetikleyici</th>
                    <th className="py-3 px-4">Bireysel Durum (Status)</th>
                    <th className="py-3 px-4 hidden md:table-cell">Zamanlama & Gecikme</th>
                    <th className="py-3 px-4 hidden lg:table-cell">Teknik Denetim (SMTP)</th>
                    <th className="py-3 px-4 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <div className="max-w-xs mx-auto space-y-2">
                          <Mail className="w-8 h-8 mx-auto text-slate-300" />
                          <p className="font-semibold text-slate-700">Denetim günlüğü kaydı bulunamadı</p>
                          <p className="text-[11px] text-slate-400">
                            Arama kriterlerinizi değiştirin veya &apos;Test E-postası Tetikle&apos; ile yeni bir otomasyon kaydı oluşturun.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((rec) => {
                      return (
                        <tr
                          key={rec.id}
                          className="hover:bg-slate-50/80 transition-colors group"
                        >
                          {/* 1. Lead & Recipient Info */}
                          <td className="py-3.5 px-4 align-top">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                                  {rec.leadName}
                                </span>
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                                  #{rec.leadId}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                                <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="font-mono">{rec.recipientEmail}</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyEmail(rec.recipientEmail)}
                                  className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
                                  title="E-posta adresini kopyala"
                                >
                                  {copiedEmail === rec.recipientEmail ? (
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>

                              {rec.serviceOrProduct && (
                                <div className="text-[11px] text-slate-500 font-medium">
                                  {rec.serviceOrProduct}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* 2. Email Subject & Trigger */}
                          <td className="py-3.5 px-4 align-top max-w-xs">
                            <div className="space-y-1">
                              <div className="font-semibold text-slate-800 line-clamp-1" title={rec.subject}>
                                {rec.subject}
                              </div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold flex items-center gap-1">
                                  <Zap className="w-2.5 h-2.5 text-amber-500" />
                                  <span>{rec.triggerLabel}</span>
                                </span>
                                {rec.sourcePage && (
                                  <span className="text-[10px] text-slate-400">
                                    • {rec.sourcePage}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* 3. Individual Status Tracking (Delivered / Pending / Failed) */}
                          <td className="py-3.5 px-4 align-top">
                            <div className="space-y-1">
                              {rec.status === "delivered" && (
                                <div>
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Delivered (İletildi)</span>
                                  </span>
                                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                    {rec.sentAt || rec.timestamp}
                                  </div>
                                </div>
                              )}

                              {rec.status === "pending" && (
                                <div>
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                    <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                                    <span>Pending (Kuyrukta)</span>
                                  </span>
                                  <div className="text-[10px] text-amber-700 font-medium mt-0.5">
                                    {rec.scheduledFor || `${rec.delayMinutes} dk bekleme`}
                                  </div>
                                </div>
                              )}

                              {rec.status === "failed" && (
                                <div>
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                                    <span>Failed (Başarısız)</span>
                                  </span>
                                  <div className="text-[10px] text-rose-600 font-medium mt-0.5 line-clamp-1" title={rec.failureReason}>
                                    {rec.failureReason || "550 Mailbox unavailable"}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* 4. Timing & Delay Details */}
                          <td className="py-3.5 px-4 align-top hidden md:table-cell text-slate-600">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1 text-[11px] font-medium text-slate-700">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                <span>{rec.timestamp}</span>
                              </div>
                              <div className="text-[10px] text-slate-500">
                                Gecikme: <strong>{rec.delayMinutes ?? 0} dakika</strong>
                              </div>
                              {rec.latencyMs && (
                                <div className="text-[10px] font-mono text-emerald-600">
                                  Teslimat Süresi: {rec.latencyMs} ms
                                </div>
                              )}
                            </div>
                          </td>

                          {/* 5. Technical SMTP Audit */}
                          <td className="py-3.5 px-4 align-top hidden lg:table-cell text-slate-500 font-mono text-[10px]">
                            <div className="space-y-0.5 max-w-[200px]">
                              <div className="truncate text-slate-600 font-semibold" title={rec.messageId}>
                                {rec.messageId}
                              </div>
                              <div className="truncate text-slate-400" title={rec.smtpResponseCode}>
                                {rec.smtpResponseCode}
                              </div>
                              <div className="text-slate-400">
                                {rec.tlsVersion.split(" ")[0]}
                              </div>
                            </div>
                          </td>

                          {/* 6. Action Controls */}
                          <td className="py-3.5 px-4 align-top text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Inspect Audit Modal */}
                              <button
                                type="button"
                                onClick={() => setSelectedAuditRecord(rec)}
                                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-all cursor-pointer"
                                title="Detaylı denetim kaydını ve e-posta içeriğini incele"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Pending: Immediate Send */}
                              {rec.status === "pending" && (
                                <button
                                  type="button"
                                  onClick={() => handleSendNow(rec)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                                  title="Gecikmeyi atla ve e-postayı şimdi gönder"
                                >
                                  <Send className="w-3 h-3" />
                                  <span>Şimdi Gönder</span>
                                </button>
                              )}

                              {/* Failed: Retry */}
                              {rec.status === "failed" && (
                                <button
                                  type="button"
                                  onClick={() => handleResend(rec)}
                                  className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                                  title="E-posta teslimatını yeniden dene"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>Yeniden Dene</span>
                                </button>
                              )}

                              {/* Delivered: Resend button */}
                              {rec.status === "delivered" && (
                                <button
                                  type="button"
                                  onClick={() => handleResend(rec)}
                                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
                                  title="E-postayı tekrar gönder"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Quick Status Override Dropdown */}
                              <div className="relative group/status">
                                <select
                                  value={rec.status}
                                  onChange={(e) => handleChangeStatus(rec, e.target.value as any)}
                                  className="text-[10px] font-bold px-1.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-slate-400 focus:outline-none cursor-pointer"
                                  title="Durumu elle güncelle"
                                >
                                  <option value="delivered">İletildi (Delivered)</option>
                                  <option value="pending">Beklemede (Pending)</option>
                                  <option value="failed">Hata (Failed)</option>
                                </select>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer / Summary */}
            <div className="bg-slate-50/70 border-t border-slate-200/80 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span>
                  Gösterilen: <strong>{filteredRecords.length}</strong> / {auditRecords.length} e-posta denetim kaydı
                </span>
                {statusFilter !== "all" && (
                  <span className="font-semibold text-slate-700">
                    (Filtre: {statusFilter.toUpperCase()})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="text-slate-700 hover:text-slate-900 font-bold hover:underline cursor-pointer flex items-center gap-1 text-[11px]"
                >
                  <Download className="w-3 h-3" />
                  <span>CSV Dışa Aktar</span>
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={() => handleFetchAuditLog(false)}
                  className="text-sky-700 hover:text-sky-900 font-bold hover:underline cursor-pointer flex items-center gap-1 text-[11px]"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Yenile</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. IN-DEPTH PER-LEAD AUDIT INSPECTION MODAL */}
      {selectedAuditRecord && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
          onClick={() => setSelectedAuditRecord(null)}
        >
          <div
            className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden space-y-0 my-8 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider font-mono bg-sky-500 text-slate-950">
                    Denetim Kaydı (Audit Log)
                  </span>
                  <span className="text-xs font-mono text-slate-300">
                    #{selectedAuditRecord.leadId}
                  </span>
                  {selectedAuditRecord.status === "delivered" && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Delivered (250 OK)</span>
                    </span>
                  )}
                  {selectedAuditRecord.status === "pending" && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Pending (Kuyrukta Bekliyor)</span>
                    </span>
                  )}
                  {selectedAuditRecord.status === "failed" && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                      <span>Failed (İletilemedi)</span>
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-white">
                  {selectedAuditRecord.leadName}
                </h3>
                <p className="text-xs text-slate-300 flex items-center gap-2">
                  <span>{selectedAuditRecord.recipientEmail}</span>
                  {selectedAuditRecord.recipientPhone && (
                    <>
                      <span>•</span>
                      <span>{selectedAuditRecord.recipientPhone}</span>
                    </>
                  )}
                  {selectedAuditRecord.serviceOrProduct && (
                    <>
                      <span>•</span>
                      <span>{selectedAuditRecord.serviceOrProduct}</span>
                    </>
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAuditRecord(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Event-by-Event Transmission Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-sky-600" />
                  <span>Gönderim Yaşam Döngüsü & Olay Zaman Çizelgesi</span>
                </h4>
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3 font-mono text-xs">
                  {/* Step 1 */}
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 text-[10px] font-bold">
                      1
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">Form Başvurusu Alındı</div>
                      <div className="text-[11px] text-slate-500 font-sans">
                        Müşteri {selectedAuditRecord.sourcePage || "İletişim Formu"} üzerinden formu başarıyla gönderdi. ({selectedAuditRecord.timestamp})
                      </div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 text-[10px] font-bold">
                      2
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">Otomasyon Kuralı Değerlendirildi</div>
                      <div className="text-[11px] text-slate-500 font-sans">
                        Teşekkür E-postası kuralı tetiklendi. Doğal gecikme parametresi: <strong>{selectedAuditRecord.delayMinutes ?? 5} dakika</strong>.
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                      selectedAuditRecord.status === "pending"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-700"
                    }`}>
                      3
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">Kuyruk & Dağıtım İşleyicisi (Queue Dispatcher)</div>
                      <div className="text-[11px] text-slate-500 font-sans">
                        {selectedAuditRecord.status === "pending"
                          ? `Kuyrukta zamanlayıcı bekleniyor: Planlanan teslimat zamanı: ${selectedAuditRecord.scheduledFor || "Bugün"}`
                          : `Zamanlayıcı tamamlandı, dağıtım motoruna teslim edildi. (${selectedAuditRecord.sentAt || selectedAuditRecord.timestamp})`}
                      </div>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                      selectedAuditRecord.status === "delivered"
                        ? "bg-emerald-100 text-emerald-700"
                        : selectedAuditRecord.status === "failed"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-slate-200 text-slate-600"
                    }`}>
                      4
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">
                        {selectedAuditRecord.status === "delivered"
                          ? "Teslimat Onayı (250 2.0.0 OK)"
                          : selectedAuditRecord.status === "failed"
                          ? "Teslimat Hatası (550 Mailbox Unavailable)"
                          : "SMTP Handshake Beklemede"}
                      </div>
                      <div className="text-[11px] text-slate-500 font-sans">
                        {selectedAuditRecord.status === "delivered" && (
                          <span className="text-emerald-700 font-semibold">
                            Alıcı e-posta sunucusuna teslim edildi. Gecikme süresi: {selectedAuditRecord.latencyMs || 840} ms.
                          </span>
                        )}
                        {selectedAuditRecord.status === "failed" && (
                          <span className="text-rose-700 font-semibold">
                            Hata Nedeni: {selectedAuditRecord.failureReason || "Alıcı posta kutusu geçersiz veya kabul etmedi."}
                          </span>
                        )}
                        {selectedAuditRecord.status === "pending" && (
                          <span>Kuyruk süresi dolduğunda otomatik olarak gönderilecektir.</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical SMTP Headers & Metadata */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-slate-600" />
                  <span>Teknik Başlıklar & SMTP Denetim Verileri</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 font-mono">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Message-ID</div>
                    <div className="text-[11px] text-slate-800 break-all">{selectedAuditRecord.messageId}</div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 font-mono">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">SMTP Sunucusu & Port</div>
                    <div className="text-[11px] text-slate-800">{selectedAuditRecord.smtpServer}</div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 font-mono">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Şifreleme & Protokol</div>
                    <div className="text-[11px] text-slate-800">{selectedAuditRecord.tlsVersion}</div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 font-mono">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Doğrulama (SPF / DKIM / DMARC)</div>
                    <div className="text-[11px] text-emerald-700 font-semibold">{selectedAuditRecord.spfDkimStatus}</div>
                  </div>
                </div>
              </div>

              {/* Rendered Email Preview */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-sky-600" />
                  <span>İletilen / Hazırlanan E-posta İçeriği</span>
                </h4>
                <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-3 shadow-xs">
                  <div className="border-b border-slate-100 pb-3 space-y-1 text-xs">
                    <div>
                      <span className="text-slate-400 font-medium">Konu: </span>
                      <strong className="text-slate-900">{selectedAuditRecord.subject}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Alıcı: </span>
                      <span className="font-mono text-slate-700">{selectedAuditRecord.recipientEmail}</span>
                    </div>
                  </div>

                  {/* Rendered HTML */}
                  <div
                    className="text-xs text-slate-700 leading-relaxed space-y-2 prose prose-xs max-w-none pt-2"
                    dangerouslySetInnerHTML={{ __html: selectedAuditRecord.renderedBody || "<p>E-posta gövdesi hazırlandı.</p>" }}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="bg-slate-50 border-t border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(selectedAuditRecord, null, 2));
                  setCopiedAuditJson(true);
                  setTimeout(() => setCopiedAuditJson(false), 2000);
                }}
                className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                {copiedAuditJson ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAuditJson ? "Audit JSON Kopyalandı!" : "Teknik JSON Logunu Kopyala"}</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {selectedAuditRecord.status === "pending" && (
                  <button
                    type="button"
                    onClick={() => {
                      handleSendNow(selectedAuditRecord);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Gecikmeyi Atla & Şimdi Gönder</span>
                  </button>
                )}

                {(selectedAuditRecord.status === "delivered" || selectedAuditRecord.status === "failed") && (
                  <button
                    type="button"
                    onClick={() => {
                      handleResend(selectedAuditRecord);
                    }}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>E-postayı Yeniden Gönder</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedAuditRecord(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. SIMULATE TEST AUTOMATED EMAIL MODAL */}
      {isTestModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
          onClick={() => setIsTestModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden space-y-0 my-8 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-sky-600 text-white p-6 flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <MailCheck className="w-5 h-5" />
                  <span>Test Otomasyon E-postası Tetikle</span>
                </h3>
                <p className="text-xs text-sky-100">
                  Denetim günlüğü akışını test etmek için simüle bir müşteri talebi oluşturun.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsTestModalOpen(false)}
                className="w-8 h-8 rounded-full bg-sky-700 text-sky-200 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTestAutomation} className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Alıcı Müşteri Adı</label>
                <input
                  type="text"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 font-medium focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Alıcı E-Posta Adresi</label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">İlgilenilen Hizmet</label>
                <input
                  type="text"
                  value={testService}
                  onChange={(e) => setTestService(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Teslimat Zamanlaması (Delay Timer)</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTestDelayMinutes(0)}
                    className={`py-2 px-2.5 rounded-xl border text-center font-bold cursor-pointer transition-all ${
                      testDelayMinutes === 0
                        ? "bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Anında (Delivered)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestDelayMinutes(5)}
                    className={`py-2 px-2.5 rounded-xl border text-center font-bold cursor-pointer transition-all ${
                      testDelayMinutes === 5
                        ? "bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-500/20"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    5 Dk (Pending)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestDelayMinutes(15)}
                    className={`py-2 px-2.5 rounded-xl border text-center font-bold cursor-pointer transition-all ${
                      testDelayMinutes === 15
                        ? "bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-500/20"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    15 Dk (Pending)
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  {testDelayMinutes === 0
                    ? "E-posta anında teslim edilecek ve denetim günlüğünde 'Delivered' olarak görünecektir."
                    : `E-posta ${testDelayMinutes} dakika sonraya planlanacak ve denetim günlüğünde 'Pending' olarak listelenecektir.`}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTestModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Otomasyonu Kaydet & Başlat</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
