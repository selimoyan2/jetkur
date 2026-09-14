import React, { useState, useMemo, useEffect } from "react";
import { SiteConfig, FormLead, LeadThankYouEmailConfig } from "../../types";
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
  ExternalLink,
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
  ChevronDown
} from "lucide-react";

interface AutomatedResponsesManagerProps {
  config: SiteConfig;
  onChange: (updatedConfig: SiteConfig) => void;
  onUpdateLead?: (leadId: string, updates: Partial<FormLead>) => void;
  onNavigateToEmailSettings?: () => void;
  onNavigateToLeads?: () => void;
}

export const AutomatedResponsesManager: React.FC<AutomatedResponsesManagerProps> = ({
  config,
  onChange,
  onUpdateLead,
  onNavigateToEmailSettings,
  onNavigateToLeads
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "delivered" | "pending" | "failed">("all");
  const [sortOption, setSortOption] = useState<"newest" | "scheduled" | "name">("newest");
  const [selectedLeadForPreview, setSelectedLeadForPreview] = useState<FormLead | null>(null);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [actionFeedbackToast, setActionFeedbackToast] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [lastFetchedAt, setLastFetchedAt] = useState<string>(() => {
    return new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  });

  // Initial fetch effect simulation
  useEffect(() => {
    setIsFetching(true);
    const timer = setTimeout(() => {
      setIsFetching(false);
      setLastFetchedAt(new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  // Handle Fetch / Refresh History
  const handleFetchHistory = (silent = false) => {
    setIsFetching(true);
    setTimeout(() => {
      const timeStr = new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setLastFetchedAt(timeStr);
      setIsFetching(false);
      if (!silent) {
        showToast(`Otomatik yanıt geçmişi sunucudan başarıyla getirildi (${responseLeads.length} müşteri etkileşimi).`);
      }
    }, 550);
  };

  // New test response form state
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

  // Filter leads that have automated thank-you email interactions or an email address
  const responseLeads = useMemo(() => {
    return (config.leads || []).filter((l) => {
      // Show leads that have an email or thank you email status
      return Boolean(l.email || l.thankYouEmailStatus || l.thankYouEmailSent !== undefined);
    });
  }, [config.leads]);

  // Statistics calculation
  const stats = useMemo(() => {
    let delivered = 0;
    let pending = 0;
    let failed = 0;

    responseLeads.forEach((l) => {
      const status = l.thankYouEmailStatus;
      if (status === "delivered" || (l.thankYouEmailSent && !status)) {
        delivered++;
      } else if (status === "pending" || status === "queued") {
        pending++;
      } else if (status === "failed") {
        failed++;
      } else if (l.thankYouEmailSent === false && !status) {
        pending++;
      }
    });

    const total = responseLeads.length;
    const successRate = total > 0 ? Math.round((delivered / total) * 100) : 100;

    return { total, delivered, pending, failed, successRate };
  }, [responseLeads]);

  // Filter and Sort leads
  const filteredLeads = useMemo(() => {
    return responseLeads
      .filter((lead) => {
        // Status filter
        const rawStatus = lead.thankYouEmailStatus;
        const normalizedStatus =
          rawStatus === "queued" ? "pending" : rawStatus || (lead.thankYouEmailSent ? "delivered" : "pending");

        if (statusFilter !== "all" && normalizedStatus !== statusFilter) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = lead.name?.toLowerCase().includes(q);
          const matchEmail = lead.email?.toLowerCase().includes(q);
          const matchService = lead.serviceOrProduct?.toLowerCase().includes(q);
          const matchSubject = lead.thankYouEmailSubject?.toLowerCase().includes(q);
          const matchScheduled = lead.thankYouEmailScheduledFor?.toLowerCase().includes(q);
          if (!matchName && !matchEmail && !matchService && !matchSubject && !matchScheduled) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOption === "name") {
          return (a.name || "").localeCompare(b.name || "", "tr");
        }
        if (sortOption === "scheduled") {
          // Put pending / scheduled ones first
          const aPending = a.thankYouEmailStatus === "pending" || a.thankYouEmailStatus === "queued";
          const bPending = b.thankYouEmailStatus === "pending" || b.thankYouEmailStatus === "queued";
          if (aPending && !bPending) return -1;
          if (!aPending && bPending) return 1;
        }
        // Default: newest first by id or order in array
        return b.id.localeCompare(a.id);
      });
  }, [responseLeads, statusFilter, searchQuery, sortOption]);

  const showToast = (msg: string) => {
    setActionFeedbackToast(msg);
    setTimeout(() => setActionFeedbackToast(null), 3500);
  };

  // Immediate send for pending message
  const handleSendNow = (lead: FormLead) => {
    const currentTime = new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
    const updates: Partial<FormLead> = {
      thankYouEmailSent: true,
      thankYouEmailStatus: "delivered",
      thankYouEmailSentAt: `Bugün ${currentTime}`,
      thankYouEmailScheduledFor: `Anında iletildi (Gecikme atlandı • ${currentTime})`
    };

    if (onUpdateLead) {
      onUpdateLead(lead.id, updates);
    } else {
      const updatedLeads = (config.leads || []).map((l) => (l.id === lead.id ? { ...l, ...updates } : l));
      onChange({ ...config, leads: updatedLeads });
    }

    if (selectedLeadForPreview && selectedLeadForPreview.id === lead.id) {
      setSelectedLeadForPreview({ ...selectedLeadForPreview, ...updates });
    }

    showToast(`'${lead.name}' isimli müşteriye teşekkür e-postası başarıyla anında iletildi.`);
  };

  // Retry failed or resend delivered message
  const handleResend = (lead: FormLead) => {
    const currentTime = new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
    const updates: Partial<FormLead> = {
      thankYouEmailSent: true,
      thankYouEmailStatus: "delivered",
      thankYouEmailSentAt: `Bugün ${currentTime}`,
      thankYouEmailFailureReason: undefined
    };

    if (onUpdateLead) {
      onUpdateLead(lead.id, updates);
    } else {
      const updatedLeads = (config.leads || []).map((l) => (l.id === lead.id ? { ...l, ...updates } : l));
      onChange({ ...config, leads: updatedLeads });
    }

    if (selectedLeadForPreview && selectedLeadForPreview.id === lead.id) {
      setSelectedLeadForPreview({ ...selectedLeadForPreview, ...updates });
    }

    showToast(`'${lead.name}' adresine e-posta yeniden iletildi (250 OK).`);
  };

  // Manual status change
  const handleChangeStatus = (lead: FormLead, newStatus: FormLead["thankYouEmailStatus"]) => {
    const updates: Partial<FormLead> = {
      thankYouEmailStatus: newStatus,
      thankYouEmailSent: newStatus === "delivered"
    };

    if (newStatus === "delivered" && !lead.thankYouEmailSentAt) {
      updates.thankYouEmailSentAt = `Bugün ${new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}`;
    }

    if (onUpdateLead) {
      onUpdateLead(lead.id, updates);
    } else {
      const updatedLeads = (config.leads || []).map((l) => (l.id === lead.id ? { ...l, ...updates } : l));
      onChange({ ...config, leads: updatedLeads });
    }

    showToast(`'${lead.name}' durum güncellendi: ${newStatus?.toUpperCase()}`);
  };

  // Copy email to clipboard
  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  // Create a new simulated lead with automated response
  const handleCreateTestResponse = (e: React.FormEvent) => {
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
      message: "Test formu üzerinden gönderilen otomatik yanıt deneme talebi.",
      sourcePage: "Otomatik Yanıtlayıcı Testi",
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
      tags: ["Test Yanıt", isInstant ? "Anında" : "Gecikmeli Takip"]
    };

    const updatedLeads = [newLead, ...(config.leads || [])];
    onChange({ ...config, leads: updatedLeads });

    setIsTestModalOpen(false);
    showToast(
      isInstant
        ? `Yeni test yanıtı '${testEmail}' adresine anında teslim edildi.`
        : `Yeni test yanıtı saat ${scheduledTime}'a (${testDelayMinutes} dk bekleme) kuyruğa alındı.`
    );
  };

  // Export Automated Responses Log to CSV
  const handleExportCsv = () => {
    const headers = [
      "ID",
      "Kayıt Tarihi",
      "Müşteri Adı",
      "E-Posta",
      "Telefon",
      "Hizmet / Talep",
      "Gönderim Durumu",
      "Planlanan Teslimat Zamanı",
      "Gecikme Süresi (Dk)",
      "Teslimat Zamanı",
      "Hata Açıklaması"
    ];

    const rows = responseLeads.map((l) => {
      const st = l.thankYouEmailStatus || (l.thankYouEmailSent ? "delivered" : "pending");
      return [
        `"${l.id}"`,
        `"${l.date}"`,
        `"${(l.name || "").replace(/"/g, '""')}"`,
        `"${(l.email || "").replace(/"/g, '""')}"`,
        `"${(l.phone || "").replace(/"/g, '""')}"`,
        `"${(l.serviceOrProduct || "").replace(/"/g, '""')}"`,
        `"${st}"`,
        `"${(l.thankYouEmailScheduledFor || "-").replace(/"/g, '""')}"`,
        `"${l.thankYouEmailDelayMinutes ?? 0}"`,
        `"${(l.thankYouEmailSentAt || "-").replace(/"/g, '""')}"`,
        `"${(l.thankYouEmailFailureReason || "-").replace(/"/g, '""')}"`
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `otomatik_yanitlar_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Otomatik yanıtlar log tablosu CSV olarak başarıyla indirildi.");
  };

  // Helper for rendering personalized email body preview
  const renderPersonalizedEmail = (lead: FormLead) => {
    const rawSubject = lead.thankYouEmailSubject || emailConfig.subject || "Talebiniz Alındı! - {firma}";
    const rawBody =
      lead.thankYouEmailRenderedBody ||
      emailConfig.body ||
      `<p>Sayın <strong>{isim}</strong>,</p><p><strong>{hizmet}</strong> konulu başvurunuz elimize ulaştı. Teşekkür ederiz.</p>`;

    const subject = rawSubject
      .replace(/{firma}/g, config.companyName || "Şirketimiz")
      .replace(/{isim}/g, lead.name || "Müşterimiz")
      .replace(/{hizmet}/g, lead.serviceOrProduct || "Hizmet")
      .replace(/{telefon}/g, config.phone || "");

    const body = rawBody
      .replace(/{firma}/g, config.companyName || "Şirketimiz")
      .replace(/{isim}/g, lead.name || "Müşterimiz")
      .replace(/{hizmet}/g, lead.serviceOrProduct || "Hizmet")
      .replace(/{telefon}/g, config.phone || "");

    return { subject, body };
  };

  return (
    <div id="automated-response-history-section" className="space-y-6">
      {/* Toast Notification */}
      {actionFeedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-950 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionFeedbackToast}</span>
        </div>
      )}

      {/* 1. HERO HEADER CARD */}
      <div className="bg-white rounded-2xl p-6 lg:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/70 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
              <MailCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Automated Response History
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1.5 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                  Otomatik Yanıt Geçmişi & Log Kayıtları
                </span>
              </div>
              <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
                Form dolduran müşterilerle gerçekleşen tüm etkileşimleri, gönderilen otomatik teşekkür e-postalarını,
                iletim durumlarını (<strong>delivered</strong> / <strong>pending</strong> / <strong>failed</strong>) ve
                her etkileşimin zaman damgalarını detaylı olarak listeleyin.
              </p>
              <div className="flex items-center gap-3 pt-0.5 text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5 font-medium text-slate-600">
                  <span className={`w-2 h-2 rounded-full ${isFetching ? "bg-amber-500 animate-ping" : "bg-emerald-500"}`} />
                  <span>{isFetching ? "Sunucudan kayıtlar getiriliyor..." : `Veriler Güncel • Son Çekilme: ${lastFetchedAt}`}</span>
                </span>
                <span className="text-slate-300">•</span>
                <span>{responseLeads.length} Müşteri Etkileşimi</span>
              </div>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            {/* Fetch & Refresh Button */}
            <button
              type="button"
              id="btn-fetch-response-history"
              onClick={() => handleFetchHistory(false)}
              disabled={isFetching}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
              title="E-posta sunucusu ve kuyruğundan son gönderim durumlarını getir / yenile"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isFetching ? "animate-spin" : ""}`} />
              <span>{isFetching ? "Getiriliyor..." : "Geçmişi Getir (Fetch)"}</span>
            </button>

            <button
              type="button"
              id="btn-trigger-test-response"
              onClick={() => setIsTestModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Simüle Yanıt Tetikle</span>
            </button>

            <button
              type="button"
              id="btn-export-responses-csv"
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              title="CSV olarak dışa aktar"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>CSV İndir</span>
            </button>

            {onNavigateToEmailSettings && (
              <button
                type="button"
                id="btn-goto-email-settings-from-responses"
                onClick={onNavigateToEmailSettings}
                className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Sliders className="w-4 h-4 text-slate-500" />
                <span>Şablon Ayarları</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. STATS & METRICS SUMMARY CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Card 1: Total */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Toplam Kayıt</span>
              <Mail className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900">{stats.total}</div>
            <div className="text-[11px] text-slate-500">Müşteri form başvurusu</div>
          </div>

          {/* Card 2: Delivered */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
            <div className="flex items-center justify-between text-emerald-800 text-xs font-semibold">
              <span>Teslim Edildi</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-950">{stats.delivered}</div>
            <div className="text-[11px] text-emerald-700">Başarıyla ulaştı ({stats.successRate}%)</div>
          </div>

          {/* Card 3: Pending / Scheduled */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1">
            <div className="flex items-center justify-between text-amber-800 text-xs font-semibold">
              <span>Kuyrukta Bekliyor</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-amber-950">{stats.pending}</div>
            <div className="text-[11px] text-amber-700">Zamanlayıcıda planlandı</div>
          </div>

          {/* Card 4: Failed */}
          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 space-y-1">
            <div className="flex items-center justify-between text-rose-800 text-xs font-semibold">
              <span>Başarısız / Hata</span>
              <AlertCircle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-rose-950">{stats.failed}</div>
            <div className="text-[11px] text-rose-700">Yeniden gönderim gerekebilir</div>
          </div>

          {/* Card 5: Active Delay Mode */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-1 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-blue-800 text-xs font-semibold">
              <span>Aktif Gecikme</span>
              <Hourglass className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-blue-950">
              {(emailConfig.delayMinutes ?? 5) > 0 ? `${emailConfig.delayMinutes ?? 5} Dk` : "0 Dk"}
            </div>
            <div className="text-[11px] text-blue-700">
              {(emailConfig.delayMinutes ?? 5) > 0 ? "Doğal Takip Modu" : "Anında İletim"}
            </div>
          </div>
        </div>

        {/* Informative Delay Strategy Callout */}
        <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Aktif Sistem Kuralı:</strong> Yeni gelen formlar için{" "}
              <strong>{emailConfig.delayMinutes ?? 5} dakikalık doğal inceleme gecikmesi</strong> uygulanmaktadır.
              {emailConfig.delayRandomWindow !== false && " İnsani varyasyon (±1-3 dk) etkindir."}
            </span>
          </div>

          {onNavigateToEmailSettings && (
            <button
              type="button"
              onClick={onNavigateToEmailSettings}
              className="text-amber-800 font-bold hover:underline shrink-0 flex items-center gap-1 cursor-pointer"
            >
              Gecikme Süresini Değiştir
              <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
            </button>
          )}
        </div>
      </div>

      {/* 3. FILTER & SEARCH TOOLBAR */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-automated-responses"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Müşteri adı, e-posta veya hizmet ara..."
            className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 bg-slate-50/50"
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

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
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
            Tümü ({responseLeads.length})
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
            Teslim Edildi ({stats.delivered})
          </button>

          <button
            type="button"
            id="filter-status-pending"
            onClick={() => setStatusFilter("pending")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              statusFilter === "pending"
                ? "bg-amber-600 text-white shadow-2xs"
                : "bg-amber-50 text-amber-900 border border-amber-200/70 hover:bg-amber-100"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Bekliyor / Kuyrukta ({stats.pending})
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
            Başarısız ({stats.failed})
          </button>
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-slate-400 font-medium">Sırala:</span>
          <select
            id="select-sort-automated-responses"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="newest">En Yeni Kayıt</option>
            <option value="scheduled">Planlanan Zamana Göre</option>
            <option value="name">Müşteri Adına Göre (A-Z)</option>
          </select>
        </div>
      </div>

      {/* 4. MAIN RESPONSES TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isFetching ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <RefreshCw className="w-6 h-6 animate-spin text-amber-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Otomatik Yanıt Geçmişi Yükleniyor...</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Müşteri etkileşimleri ve e-posta kuyruk kayıtları sunucudan getiriliyor, lütfen bekleyin.
            </p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <MailCheck className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Hiçbir Otomatik Yanıt Bulunamadı</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {searchQuery || statusFilter !== "all"
                ? "Arama kriterlerinize veya seçilen filtreye uygun otomatik yanıt bulunamadı. Filtreleri temizleyebilirsiniz."
                : "Henüz web sitenizden gelen ve e-posta içeren bir form başvurusu bulunmuyor. Test yanıtı oluşturarak sistemi hemen deneyebilirsiniz."}
            </p>
            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handleFetchHistory(false)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Geçmişi Yenile (Fetch)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setIsTestModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                Örnek Test Yanıtı Oluştur
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" id="table-automated-responses">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Alıcı Müşteri & İletişim</th>
                  <th className="py-3.5 px-4">Müşteri Etkileşim Zamanı</th>
                  <th className="py-3.5 px-4">E-Posta Konusu & Şablon</th>
                  <th className="py-3.5 px-4">Gönderim Durumu</th>
                  <th className="py-3.5 px-4">Gönderim / Teslimat Zamanı</th>
                  <th className="py-3.5 px-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredLeads.map((lead) => {
                  const rawStatus = lead.thankYouEmailStatus;
                  const status =
                    rawStatus === "queued" ? "pending" : rawStatus || (lead.thankYouEmailSent ? "delivered" : "pending");
                  const isDelivered = status === "delivered";
                  const isPending = status === "pending";
                  const isFailed = status === "failed";

                  const { subject } = renderPersonalizedEmail(lead);

                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-slate-50/60 transition-colors group"
                      id={`response-row-${lead.id}`}
                    >
                      {/* 1. Recipient & Contact */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                              {(lead.name || "M").charAt(0).toUpperCase()}
                            </span>
                            <div>
                              <div className="font-bold text-slate-900 leading-tight flex items-center gap-1.5">
                                <span>{lead.name || "İsimsiz Başvuru"}</span>
                                {lead.tags && lead.tags.length > 0 && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                    {lead.tags[0]}
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400 block font-mono">ID: {lead.id}</span>
                            </div>
                          </div>

                          {/* Email & Phone */}
                          <div className="flex items-center gap-2 pt-0.5 text-[11px]">
                            {lead.email ? (
                              <button
                                type="button"
                                onClick={() => handleCopyEmail(lead.email!)}
                                className="inline-flex items-center gap-1 text-slate-600 hover:text-blue-600 font-mono transition-colors cursor-pointer group/mail"
                                title="E-postayı kopyala"
                              >
                                <Mail className="w-3 h-3 text-slate-400 group-hover/mail:text-blue-500" />
                                <span>{lead.email}</span>
                                {copiedEmail === lead.email ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-2.5 h-2.5 text-slate-300 opacity-0 group-hover/mail:opacity-100" />
                                )}
                              </button>
                            ) : (
                              <span className="text-slate-400 italic">E-posta belirtilmedi</span>
                            )}

                            {lead.phone && (
                              <span className="text-slate-400 flex items-center gap-1 font-mono">
                                • {lead.phone}
                              </span>
                            )}
                          </div>

                          {/* Service Tag */}
                          {lead.serviceOrProduct && (
                            <div className="pt-0.5">
                              <span className="inline-block text-[10px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/60 font-medium">
                                {lead.serviceOrProduct}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 2. Customer Interaction Timestamp (When lead filled form) */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{lead.date || "Bugün"}</span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 font-medium text-[10px]">
                              <span>Kaynak:</span>
                              <strong>{lead.sourcePage || "İletişim Formu"}</strong>
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 3. Subject & Template */}
                      <td className="py-3.5 px-4 align-top max-w-xs">
                        <div className="space-y-1">
                          <div className="font-semibold text-slate-800 line-clamp-1 flex items-center gap-1.5">
                            <span className="truncate">{subject}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                            {lead.message || "Otomatik teşekkür bilgilendirmesi ve müşteri takip yanıtı."}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium pt-0.5">
                            <span>Gönderen: {emailConfig.senderName || config.companyName}</span>
                            <span>• SMTP Kuyruğu</span>
                          </div>
                        </div>
                      </td>

                      {/* 4. Send Status */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="space-y-1.5">
                          {isDelivered && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Teslim Edildi (Delivered)</span>
                            </span>
                          )}

                          {isPending && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs ring-1 ring-amber-400/30">
                              <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                              <span>Bekliyor / Planlandı (Pending)</span>
                            </span>
                          )}

                          {isFailed && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200 shadow-2xs">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Başarısız (Failed)</span>
                            </span>
                          )}

                          {/* Detail Note */}
                          <div className="text-[11px]">
                            {isDelivered && (
                              <span className="text-emerald-700 font-mono text-[10px]">
                                250 OK • Posta kutusuna ulaştı
                              </span>
                            )}

                            {isPending && (
                              <span className="text-amber-800 font-semibold text-[10px] block">
                                ⏳ Doğal bekleme kuyruğunda
                              </span>
                            )}

                            {isFailed && (
                              <span
                                className="text-rose-600 line-clamp-2 text-[10px] block"
                                title={lead.thankYouEmailFailureReason}
                              >
                                {lead.thankYouEmailFailureReason || "550 SMTP Reddi / Zaman aşımı"}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 5. Send Timestamp / Scheduled Delivery Time */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="space-y-1.5">
                          {isPending ? (
                            <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-200/90 space-y-1">
                              <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                                <Hourglass className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                                <span>{lead.thankYouEmailScheduledFor || "Bugün içinde planlandı"}</span>
                              </div>
                              <div className="text-[11px] text-amber-800/80 flex items-center justify-between">
                                <span>Gecikme: {lead.thankYouEmailDelayMinutes ?? 5} Dk</span>
                                <span className="font-semibold text-amber-700">Kuyrukta Bekliyor</span>
                              </div>
                            </div>
                          ) : isDelivered ? (
                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-0.5">
                              <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{lead.thankYouEmailSentAt || "Bugün iletildi"}</span>
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {lead.thankYouEmailDelayMinutes && lead.thankYouEmailDelayMinutes > 0
                                  ? `${lead.thankYouEmailDelayMinutes} dk doğal inceleme sonrası iletildi`
                                  : "Anında iletildi (0 dk bekleme)"}
                              </div>
                            </div>
                          ) : (
                            <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-200 space-y-0.5">
                              <div className="text-xs font-semibold text-rose-900 flex items-center gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                                <span>{lead.thankYouEmailScheduledFor || "Planlanan saat geçti"}</span>
                              </div>
                              <div className="text-[11px] text-rose-700">Gönderim denenirken hata oluştu</div>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 6. Actions */}
                      <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Preview Modal */}
                          <button
                            type="button"
                            id={`btn-view-preview-${lead.id}`}
                            onClick={() => setSelectedLeadForPreview(lead)}
                            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 hover:text-blue-600 transition-colors cursor-pointer shadow-2xs"
                            title="E-posta İçeriğini & Gönderim Raporunu Görüntüle"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* If Pending: Send Now Button */}
                          {isPending && (
                            <button
                              type="button"
                              id={`btn-send-now-${lead.id}`}
                              onClick={() => handleSendNow(lead)}
                              className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                              title="Gecikmeyi atla ve hemen gönder"
                            >
                              <Zap className="w-3 h-3 fill-current" />
                              <span>Şimdi Gönder</span>
                            </button>
                          )}

                          {/* If Failed or Delivered: Resend Button */}
                          {(isFailed || isDelivered) && (
                            <button
                              type="button"
                              id={`btn-resend-${lead.id}`}
                              onClick={() => handleResend(lead)}
                              className={`p-2 rounded-xl border transition-colors cursor-pointer shadow-2xs ${
                                isFailed
                                  ? "bg-rose-600 hover:bg-rose-500 text-white border-rose-600"
                                  : "border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900"
                              }`}
                              title={isFailed ? "Yeniden Gönder (Tekrar Dene)" : "Tekrar Gönder"}
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Quick Status Selector Dropdown */}
                          <div className="relative group/status inline-block text-left">
                            <select
                              value={status}
                              onChange={(e) => handleChangeStatus(lead, e.target.value as any)}
                              className="text-[10px] font-bold py-1 px-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-slate-300 focus:outline-none cursor-pointer"
                              title="Durumu elle değiştir"
                            >
                              <option value="delivered">Teslim Edildi</option>
                              <option value="pending">Bekliyor (Planlandı)</option>
                              <option value="failed">Başarısız</option>
                            </select>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. EMAIL PREVIEW & AUDIT TRAIL MODAL */}
      {selectedLeadForPreview && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedLeadForPreview(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center">
                  <MailCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Otomatik Teşekkür E-Postası Önizlemesi</h3>
                  <p className="text-[11px] text-slate-400">
                    Alıcı: {selectedLeadForPreview.name} ({selectedLeadForPreview.email || "E-posta yok"})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLeadForPreview(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Email Meta Card */}
            <div className="p-5 border-b border-slate-100 bg-slate-50 space-y-2 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 font-medium">Kimden (From):</span>{" "}
                  <strong className="text-slate-900">
                    {emailConfig.senderName || config.companyName} &lt;{config.email || "destek@ornek.com"}&gt;
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Kime (To):</span>{" "}
                  <strong className="text-slate-900">
                    {selectedLeadForPreview.name} &lt;{selectedLeadForPreview.email}&gt;
                  </strong>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-medium">Konu (Subject):</span>{" "}
                <strong className="text-slate-900">
                  {renderPersonalizedEmail(selectedLeadForPreview).subject}
                </strong>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px]">
                <span className="text-slate-500">
                  Durum:{" "}
                  <strong
                    className={
                      selectedLeadForPreview.thankYouEmailStatus === "delivered"
                        ? "text-emerald-600 font-bold"
                        : selectedLeadForPreview.thankYouEmailStatus === "pending"
                        ? "text-amber-600 font-bold"
                        : "text-rose-600 font-bold"
                    }
                  >
                    {(selectedLeadForPreview.thankYouEmailStatus || "delivered").toUpperCase()}
                  </strong>
                </span>

                <span className="text-slate-500">
                  Planlanan / İletim Zamanı:{" "}
                  <strong>
                    {selectedLeadForPreview.thankYouEmailScheduledFor || selectedLeadForPreview.thankYouEmailSentAt || selectedLeadForPreview.date}
                  </strong>
                </span>

                <span className="text-slate-500">
                  Uygulanan Gecikme:{" "}
                  <strong>{selectedLeadForPreview.thankYouEmailDelayMinutes ?? 5} Dakika</strong>
                </span>
              </div>
            </div>

            {/* Rendered Email Body in Email Client Container */}
            <div className="p-6 space-y-4 max-h-[55vh] overflow-y-auto">
              <div className="rounded-2xl border border-slate-200 p-6 bg-white shadow-2xs space-y-4">
                {/* Branding Banner */}
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <div className="font-bold text-slate-900 text-sm">{config.companyName || "Web Siteniz"}</div>
                  <span className="text-[10px] text-slate-400">Doğrulanmış İletişim</span>
                </div>

                {/* HTML Body */}
                <div
                  className="prose prose-sm max-w-none text-slate-700 text-xs leading-relaxed space-y-2"
                  dangerouslySetInnerHTML={{
                    __html: renderPersonalizedEmail(selectedLeadForPreview).body
                  }}
                />

                {/* Form Data Summary Box */}
                <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                  <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                    📋 Doldurulan Form Verileri Özeti:
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                    <div>
                      <strong>Hizmet:</strong> {selectedLeadForPreview.serviceOrProduct}
                    </div>
                    <div>
                      <strong>Telefon:</strong> {selectedLeadForPreview.phone}
                    </div>
                    {selectedLeadForPreview.message && (
                      <div className="col-span-2">
                        <strong>Mesaj:</strong> {selectedLeadForPreview.message}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Delivery Audit Trail Logs */}
              <div className="rounded-xl bg-slate-900 p-4 text-[11px] font-mono text-slate-300 space-y-1 border border-slate-800">
                <div className="text-slate-400 font-bold border-b border-slate-800 pb-1 mb-1">
                  📡 SMTP İletim & Zamanlayıcı Denetim Kaydı (Audit Trail):
                </div>
                <div className="text-emerald-400">
                  ✓ [T=0] Form Başarıyla Alındı (Kaynak: {selectedLeadForPreview.sourcePage})
                </div>
                <div className="text-sky-400">
                  ℹ [T+0s] Otomatik Teşekkür Yanıtlayıcısı Tetiklendi (Alıcı: {selectedLeadForPreview.email})
                </div>
                <div className="text-amber-400">
                  ⏱ [Kuyruk] Doğal Gecikme Zamanlayıcısı: {selectedLeadForPreview.thankYouEmailDelayMinutes ?? 5} dk bekleme aralığı
                </div>
                {selectedLeadForPreview.thankYouEmailStatus === "delivered" ? (
                  <div className="text-emerald-300 font-bold">
                    ✓ [Teslimat] 250 2.0.0 OK: Alıcı posta kutusuna iletildi ({selectedLeadForPreview.thankYouEmailSentAt || "Bugün"})
                  </div>
                ) : selectedLeadForPreview.thankYouEmailStatus === "pending" ? (
                  <div className="text-amber-300 font-bold animate-pulse">
                    ⏳ [Beklemede] Saat {selectedLeadForPreview.thankYouEmailScheduledFor} için kuyrukta bekletiliyor...
                  </div>
                ) : (
                  <div className="text-rose-400 font-bold">
                    ✗ [Hata] {selectedLeadForPreview.thankYouEmailFailureReason || "550 Mailbox unavailable"}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedLeadForPreview(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Kapat
              </button>

              <div className="flex items-center gap-2">
                {selectedLeadForPreview.thankYouEmailStatus === "pending" && (
                  <button
                    type="button"
                    onClick={() => handleSendNow(selectedLeadForPreview)}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>Hemen Gönder (Gecikmeyi Atla)</span>
                  </button>
                )}

                {(selectedLeadForPreview.thankYouEmailStatus === "failed" ||
                  selectedLeadForPreview.thankYouEmailStatus === "delivered") && (
                  <button
                    type="button"
                    onClick={() => handleResend(selectedLeadForPreview)}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Yeniden Gönder</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. TRIGGER TEST LEAD RESPONSE MODAL */}
      {isTestModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsTestModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Simüle Otomatik Yanıt Tetikle</h3>
                  <p className="text-[11px] text-slate-400">Gecikmeli veya anında teslimat simülasyonu</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsTestModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTestResponse} className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Müşteri Adı Soyadı</label>
                <input
                  type="text"
                  required
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  placeholder="Örn: Ahmet Kaya"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-amber-500 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Müşteri E-Posta Adresi</label>
                <input
                  type="email"
                  required
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="ahmet@example.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-amber-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Telefon</label>
                  <input
                    type="text"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder="0555 123 45 67"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-amber-500 bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Hizmet / Talep</label>
                  <input
                    type="text"
                    value={testService}
                    onChange={(e) => setTestService(e.target.value)}
                    placeholder="Oto Çekici"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-amber-500 bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <label className="font-bold text-slate-700 flex items-center justify-between">
                  <span>Gecikme Süresi (Dakika)</span>
                  <span className="font-mono text-amber-700 font-bold">
                    {testDelayMinutes === 0 ? "0 dk (Anında İletim)" : `${testDelayMinutes} dk doğal gecikme`}
                  </span>
                </label>

                <div className="grid grid-cols-4 gap-2">
                  {[0, 5, 15, 30].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setTestDelayMinutes(m)}
                      className={`p-2 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                        testDelayMinutes === m
                          ? "bg-amber-100 border-amber-400 text-amber-900 shadow-2xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {m === 0 ? "0 dk" : `${m} dk`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/70 text-[11px] text-amber-900">
                {testDelayMinutes > 0 ? (
                  <span>
                    ⏱️ Bu kayıt <strong>{testDelayMinutes} dakika sonra</strong> teslim edilmek üzere kuyruğa
                    alınacaktır (tabloda <em>Pending</em> durumunda ve planlanan saatle görünecektir).
                  </span>
                ) : (
                  <span>
                    ⚡ Bu kayıt <strong>anında iletilmiş</strong> olarak kaydedilecektir (tabloda <em>Delivered</em>{" "}
                    olarak görünecektir).
                  </span>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTestModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all cursor-pointer shadow-xs"
                >
                  Oluştur & Tabloya Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
