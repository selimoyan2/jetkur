import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  Calendar,
  Tag,
  Paperclip,
  Check,
  FileText,
  Lock,
  Sparkles,
  Save,
  Trash2,
  Copy,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  DollarSign,
  User,
  Layers,
  Inbox,
  BellRing,
  Flame,
  Zap,
  MailCheck,
  Send,
  RotateCcw,
  Archive
} from "lucide-react";
import { FormLead, SiteConfig, LeadCustomTag } from "../../types";
import { LeadTagsManager, getLeadTagStyle } from "./LeadTagsManager";
import { calculateLeadScore, getPriorityBadgeStyle, getPriorityLabel } from "../../utils/leadScoring";
import { dispatchLeadNotification } from "../../utils/leadNotificationDispatcher";
import { LeadTimelineView } from "./LeadTimelineView";
import { buildInitialLeadTimeline } from "../../utils/leadTimelineHelper";

interface LeadDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: FormLead | null;
  config: SiteConfig;
  onUpdateLead: (leadId: string, updates: Partial<FormLead>) => void;
  onDeleteLead?: (leadId: string) => void;
  allCustomTags: LeadCustomTag[];
  allExistingTags: string[];
  onAddTag: (leadId: string, newTag: string | { name: string; color: string; id?: string }) => void;
  onRemoveTag: (leadId: string, tagToRemove: string) => void;
  onOpenManageTagsModal?: () => void;
  onNavigateToEmailAutomations?: () => void;
  initialTab?: "details" | "timeline";
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  isOpen,
  onClose,
  lead,
  config,
  onUpdateLead,
  onDeleteLead,
  allCustomTags,
  allExistingTags,
  onAddTag,
  onRemoveTag,
  onOpenManageTagsModal,
  onNavigateToEmailAutomations,
  initialTab = "details"
}) => {
  if (!isOpen || !lead) return null;

  // Tab state between standard Details and Timeline
  const [modalActiveTab, setModalActiveTab] = useState<"details" | "timeline">(initialTab);

  // Local state for Private Notes
  const initialNotes = lead.privateNotes || lead.dealNotes || "";
  const [notesText, setNotesText] = useState<string>(initialNotes);
  const [isNotesDirty, setIsNotesDirty] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [copiedContact, setCopiedContact] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync state when lead or initialTab changes
  useEffect(() => {
    const currentNotes = lead.privateNotes || lead.dealNotes || "";
    setNotesText(currentNotes);
    setIsNotesDirty(false);
    setSaveStatus("idle");
    if (initialTab) {
      setModalActiveTab(initialTab);
    }
  }, [lead.id, lead.privateNotes, lead.dealNotes, initialTab]);

  // Lead score calculation
  const leadScoreResult = React.useMemo(() => {
    return calculateLeadScore(lead, config.leadNotifications?.scoring);
  }, [lead, config.leadNotifications?.scoring]);

  const [isDispatchingNotification, setIsDispatchingNotification] = useState(false);
  const [notificationFeedback, setNotificationFeedback] = useState<string | null>(null);

  const handleManualDispatchNotification = async () => {
    setIsDispatchingNotification(true);
    setNotificationFeedback(null);
    try {
      const res = await dispatchLeadNotification(
        {
          ...lead,
          leadScore: leadScoreResult.score,
          leadScorePriority: leadScoreResult.priority,
          leadScoreReasons: leadScoreResult.reasons
        },
        config
      );

      if (res.skipReason) {
        setNotificationFeedback(`ℹ️ Gönderilmedi: ${res.skipReason}`);
      } else {
        const parts: string[] = [];
        if (res.slackSent) parts.push("Slack uyarısı gönderildi");
        if (res.emailSent) parts.push("E-posta uyarısı gönderildi");
        setNotificationFeedback(parts.length > 0 ? `${parts.join(" ve ")} ✓` : "Bildirim başarıyla iletildi ✓");
      }
    } catch (e: any) {
      setNotificationFeedback(`Hata: ${e.message || "Gönderilemedi"}`);
    } finally {
      setIsDispatchingNotification(false);
      setTimeout(() => setNotificationFeedback(null), 5000);
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleSaveNotesIfDirty();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isNotesDirty, notesText, lead.id]);

  // Save notes directly to the siteConfig lead object
  const handleSaveNotes = (explicitText?: string) => {
    const textToSave = explicitText !== undefined ? explicitText : notesText;
    setSaveStatus("saving");

    onUpdateLead(lead.id, {
      privateNotes: textToSave,
      dealNotes: textToSave, // Keep dealNotes in sync for backward compatibility
    });

    setIsNotesDirty(false);
    setSaveStatus("saved");
    setTimeout(() => {
      setSaveStatus("idle");
    }, 2500);
  };

  const handleSaveNotesIfDirty = () => {
    if (isNotesDirty) {
      handleSaveNotes();
    }
  };

  // Insert timestamp or template snippet into Private Notes
  const handleInsertSnippet = (prefix: string) => {
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, "0")}.${String(now.getMonth() + 1).padStart(2, "0")}.${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const snippet = `\n[${formattedDate} - ${prefix}]: `;
    const updated = notesText ? `${notesText.trimEnd()}${snippet}` : `[${formattedDate} - ${prefix}]: `;
    setNotesText(updated);
    setIsNotesDirty(true);

    // Focus textarea and move cursor to end
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.selectionStart = textareaRef.current.value.length;
        textareaRef.current.selectionEnd = textareaRef.current.value.length;
      }
    }, 50);
  };

  const handleCopyMessage = () => {
    if (!lead.message) return;
    navigator.clipboard?.writeText(lead.message);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  const handleCopyContact = () => {
    const text = `${lead.name} | Tel: ${lead.phone}${lead.email ? ` | E-posta: ${lead.email}` : ""}`;
    navigator.clipboard?.writeText(text);
    setCopiedContact(true);
    setTimeout(() => setCopiedContact(false), 2000);
  };

  const cleanPhone = lead.phone ? lead.phone.replace(/[^0-9]/g, "") : "";
  const waUrl = `https://wa.me/${cleanPhone}?text=Merhaba%20Sayın%20${encodeURIComponent(lead.name)},%20${encodeURIComponent(config.companyName || "firmamız")}%20olarak%20web%20sitemizden%20ilettiğiniz%20teklif%20talebiniz%20hakkında%20bilgilendirme%20yapmak%20istiyoruz.`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleSaveNotesIfDirty();
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-3xl my-6 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* MODAL HEADER */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md">
              {lead.name ? lead.name.charAt(0).toUpperCase() : "M"}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
                  {lead.name}
                </h3>
                {(lead.isRead === false || (lead.isRead === undefined && lead.status === "new")) && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black uppercase tracking-wider font-mono shadow-xs animate-pulse">
                    YENİ TALEP
                  </span>
                )}
                {lead.heroVariant && (
                  <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[10px] font-bold border border-purple-200 dark:border-purple-800">
                    A/B Testi: Varyant {lead.heroVariant}
                  </span>
                )}
                {/* Lead Score Badge */}
                {(() => {
                  const bStyle = getPriorityBadgeStyle(leadScoreResult.priority);
                  return (
                    <span
                      title={leadScoreResult.reasons.join(" • ")}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${bStyle.bg} ${bStyle.text} ${bStyle.border}`}
                    >
                      <Flame className={`w-3 h-3 ${leadScoreResult.priority === "high" ? "text-rose-500 animate-pulse" : "text-amber-500"}`} />
                      <span>Skor: {leadScoreResult.score}/100</span>
                      <span className="font-extrabold uppercase">({getPriorityLabel(leadScoreResult.priority)})</span>
                    </span>
                  );
                })()}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                <span className="font-mono">{lead.id}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {lead.date}
                </span>
                <span>•</span>
                <span className="truncate">{lead.sourcePage || "İletişim Formu"}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {lead.isRead ? (
              <button
                type="button"
                onClick={() => onUpdateLead(lead.id, { isRead: false })}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Okunmadı olarak işaretle"
              >
                <span>Okunmadı Yap</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onUpdateLead(lead.id, { isRead: true })}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
                title="Okundu olarak işaretle"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Okundu İşaretle</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                handleSaveNotesIfDirty();
                onClose();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Kapat (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SUB-HEADER NAVIGATION TABS: DETAILS vs TIMELINE */}
        <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-950/60 px-6 pt-2 shrink-0">
          <button
            type="button"
            onClick={() => setModalActiveTab("details")}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              modalActiveTab === "details"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 rounded-t-xl shadow-xs"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Talep Detayları & Notlar</span>
          </button>

          <button
            type="button"
            onClick={() => setModalActiveTab("timeline")}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              modalActiveTab === "timeline"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 rounded-t-xl shadow-xs"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Zaman Çizelgesi & İletişim Geçmişi</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              {buildInitialLeadTimeline(lead, config.companyName).length}
            </span>
          </button>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {modalActiveTab === "timeline" ? (
            <LeadTimelineView
              lead={lead}
              config={config}
              onUpdateLead={onUpdateLead}
            />
          ) : (
            <>
              {/* ACTION BAR: DIRECT CALL / WHATSAPP / EMAIL */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
            <a
              href={`tel:${cleanPhone}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
            >
              <Phone className="w-4 h-4 text-amber-400" />
              <span>Hemen Ara ({lead.phone})</span>
            </a>

            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp ile Yanıtla</span>
            </a>

            {lead.email && (
              <a
                href={`mailto:${lead.email}?subject=${encodeURIComponent(`Teklif Talebiniz - ${config.companyName || ""}`)}`}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
              >
                <Mail className="w-4 h-4 text-indigo-500" />
                <span>E-posta Gönder</span>
              </a>
            )}

            <button
              type="button"
              onClick={handleCopyContact}
              className="ml-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all cursor-pointer"
              title="İletişim bilgilerini panoya kopyala"
            >
              {copiedContact ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 dark:text-emerald-400">Kopyalandı!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Kopyala</span>
                </>
              )}
            </button>
          </div>

          {/* ARCHIVED LEAD ALERT BANNER IF ARCHIVED */}
          {lead.status === "archived" && (
            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  <Archive className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      Bu Talep Arşivde Saklanıyor
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      İnaktif Lead
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {lead.archivedReason || "30 günden uzun süredir işlem yapılmadığı için arşive taşınmıştır."}
                    {lead.archivedAt && ` (${new Date(lead.archivedAt).toLocaleDateString("tr-TR")})`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onUpdateLead(lead.id, {
                    status: "contacted",
                    archivedAt: undefined,
                    archivedReason: undefined,
                    lastActivityAt: new Date().toISOString()
                  });
                }}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Arşivden Çıkar (Aktif Et)</span>
              </button>
            </div>
          )}

          {/* CRM LEAD STATUS & PIPELINE OVERVIEW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Status Selector */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Talep Durumu (Pipeline)
              </label>
              <select
                value={lead.status}
                onChange={(e) => {
                  const newStatus = e.target.value as FormLead["status"];
                  onUpdateLead(lead.id, {
                    status: newStatus,
                    ...(newStatus === "closed" && !lead.dealValue ? { dealValue: 1000 } : {}),
                    ...(newStatus === "closed" && !lead.completedAt ? { completedAt: "Bugün" } : {}),
                    ...(newStatus === "archived" && !lead.archivedAt ? { archivedAt: new Date().toISOString(), archivedReason: "Kullanıcı tarafından manuel arşivlendi." } : {}),
                    ...(newStatus !== "archived" ? { archivedAt: undefined, archivedReason: undefined, lastActivityAt: new Date().toISOString() } : {})
                  });
                }}
                className={`w-full text-xs font-bold px-2.5 py-1.5 rounded-xl border outline-none cursor-pointer transition-all ${
                  lead.status === "closed"
                    ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700"
                    : lead.status === "offered"
                    ? "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-950 dark:text-indigo-200 border-indigo-300 dark:border-indigo-700"
                    : lead.status === "contacted"
                    ? "bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 border-amber-300 dark:border-amber-700"
                    : lead.status === "archived"
                    ? "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-200 border-slate-400 dark:border-slate-600"
                    : "bg-blue-100 dark:bg-blue-950/60 text-blue-950 dark:text-blue-200 border-blue-300 dark:border-blue-700"
                }`}
              >
                <option value="new">🟢 Yeni Talep (Bekliyor)</option>
                <option value="contacted">💬 İletişime Geçildi</option>
                <option value="offered">📑 Fiyat Teklifi Verildi</option>
                <option value="closed">🏆 Satış Tamamlandı (Kapandı)</option>
                <option value="archived">📦 Arşivlendi (İnaktif)</option>
              </select>
            </div>

            {/* Service / Product */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Talep Edilen Hizmet
              </label>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate pt-1">
                {lead.serviceOrProduct || "Genel Teklif / İletişim"}
              </div>
            </div>

            {/* Deal Value */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                {lead.status === "closed" ? "Kapanan Ciro (TL)" : "Teklif Değeri (TL)"}
              </label>
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className="text-xs font-mono font-bold text-slate-400">₺</span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={lead.dealValue !== undefined ? lead.dealValue : ""}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    onUpdateLead(lead.id, { dealValue: isNaN(val) ? 0 : val });
                  }}
                  placeholder="0"
                  className="w-full px-2 py-0.5 text-xs font-mono font-black rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Completion / Follow-up */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                İşlem / Kapanış Zamanı
              </label>
              <input
                type="text"
                value={lead.completedAt || ""}
                onChange={(e) => onUpdateLead(lead.id, { completedAt: e.target.value })}
                placeholder="Örn: Bugün 16:30"
                className="w-full px-2 py-1 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* CUSTOMER'S ORIGINAL INQUIRY MESSAGE */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/70 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-black text-slate-700 dark:text-slate-300">
                <Inbox className="w-4 h-4 text-indigo-500" />
                <span>Müşterinin Gönderdiği Form Mesajı</span>
              </div>
              <button
                type="button"
                onClick={handleCopyMessage}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
                title="Mesajı kopyala"
              >
                {copiedMessage ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-600 font-bold">Kopyalandı</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Mesajı Kopyala</span>
                  </>
                )}
              </button>
            </div>
            <blockquote className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 italic leading-relaxed whitespace-pre-wrap">
              "{lead.message || "Mesaj içeriği bulunmuyor."}"
            </blockquote>
          </div>

          {/* DYNAMIC FORM CUSTOM FIELDS & ATTACHMENTS */}
          {((lead.customFields && Object.keys(lead.customFields).length > 0) ||
            (lead.attachments && lead.attachments.length > 0)) && (
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/60">
              <div className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-500" />
                <span>Form Ek Bilgileri & Yüklenen Belgeler</span>
              </div>

              {/* Custom fields */}
              {lead.customFields && Object.keys(lead.customFields).length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(lead.customFields).map(([key, val]) => {
                    const cleanLabel = key
                      .replace(/^lead_/, "")
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase());
                    const isBoolean = typeof val === "boolean";
                    return (
                      <div
                        key={key}
                        className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs"
                      >
                        <span className="text-slate-500 dark:text-slate-400 font-medium">
                          {cleanLabel}:
                        </span>
                        {isBoolean ? (
                          <span
                            className={`font-bold px-2 py-0.5 rounded-md text-[10px] ${
                              val
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {val ? "✓ Onaylandı" : "Hayır"}
                          </span>
                        ) : (
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {String(val)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Attachments */}
              {lead.attachments && lead.attachments.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <div className="text-[11px] font-bold text-slate-500">Müşterinin Eklediği Dosyalar:</div>
                  <div className="flex flex-wrap items-center gap-2">
                    {lead.attachments.map((att, idx) => (
                      <div
                        key={idx}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/50 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-2xs"
                      >
                        <Paperclip className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="truncate max-w-[200px]">{att.name}</span>
                        {att.size && (
                          <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                            ({(att.size / 1024).toFixed(0)} KB)
                          </span>
                        )}
                        {att.dataUrl && (
                          <a
                            href={att.dataUrl}
                            download={att.name}
                            className="text-indigo-600 hover:text-indigo-800 underline text-[11px] font-bold ml-1"
                          >
                            İndir
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CRM COLOR-CODED LABELS / TAGS */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/70 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-black text-slate-700 dark:text-slate-300">
                <Tag className="w-4 h-4 text-indigo-500" />
                <span>CRM Etiketleri & Renk Kodları</span>
              </div>
              {onOpenManageTagsModal && (
                <button
                  type="button"
                  onClick={onOpenManageTagsModal}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Etiketleri Yönet →
                </button>
              )}
            </div>
            <LeadTagsManager
              leadId={lead.id}
              tags={lead.tags || []}
              customTags={lead.customTags || []}
              allAvailableTags={allCustomTags}
              allExistingTags={allExistingTags}
              onAddTag={(newTag) => onAddTag(lead.id, newTag)}
              onRemoveTag={(tagToRemove) => onRemoveTag(lead.id, tagToRemove)}
              onOpenManageModal={onOpenManageTagsModal}
            />
          </div>

          {/* LEAD SCORING & HIGH-PRIORITY NOTIFICATIONS DISPATCH */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 space-y-3.5 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-xs ${
                  leadScoreResult.priority === "high"
                    ? "bg-rose-500 text-white"
                    : leadScoreResult.priority === "medium"
                    ? "bg-amber-500 text-slate-950"
                    : "bg-slate-700 text-slate-200"
                }`}>
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-white">
                      Lead Scoring & Anlık Bildirim
                    </h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider font-mono ${
                      leadScoreResult.priority === "high"
                        ? "bg-rose-500 text-white"
                        : leadScoreResult.priority === "medium"
                        ? "bg-amber-400 text-slate-950"
                        : "bg-slate-700 text-slate-300"
                    }`}>
                      {getPriorityLabel(leadScoreResult.priority)} ({leadScoreResult.score} / 100)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Bütçe, iletişim tamlığı ve aciliyet anahtar kelimelerine göre hesaplanmıştır.
                  </p>
                </div>
              </div>

              {/* Action button */}
              <button
                type="button"
                id="btn-dispatch-modal-notification"
                onClick={handleManualDispatchNotification}
                disabled={isDispatchingNotification}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer whitespace-nowrap"
                title="Bu talep için Slack ve E-Posta bildirim kuralını manuel tetikle"
              >
                <BellRing className={`w-3.5 h-3.5 ${isDispatchingNotification ? "animate-spin" : ""}`} />
                <span>{isDispatchingNotification ? "İletiliyor..." : "Slack & E-Posta Uyarısı Tetikle"}</span>
              </button>
            </div>

            {/* Notification Feedback Toast */}
            {notificationFeedback && (
              <div className="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs font-medium text-emerald-300 flex items-center justify-between gap-2 animate-fadeIn">
                <span>{notificationFeedback}</span>
                <span className="text-[10px] text-slate-400 font-mono">Kaydedildi</span>
              </div>
            )}

            {/* Scoring reasons / breakdown tags */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Puan Faktörleri & Nedenler:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {leadScoreResult.reasons.map((r, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700/80 text-[11px] font-medium flex items-center gap-1"
                  >
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{r}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ⭐ CORE FEATURE: PRIVATE NOTES (DAHİLİ ÖZEL NOTLAR) ⭐ */}
          <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border-2 border-amber-300/80 dark:border-amber-700/60 space-y-3 shadow-xs">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Dahili Özel Notlar (Private Notes)</span>
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                      Yalnızca Dahili / Gizli
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Müşteriye asla iletilmez. Ekip içi gözlemleri, teklif koşullarını veya görüşme notlarını buraya kaydedin.
                  </p>
                </div>
              </div>

              {/* Status indicator */}
              <div className="flex items-center gap-2">
                {saveStatus === "saved" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-800 animate-fadeIn">
                    <Check className="w-3.5 h-3.5" />
                    <span>SiteConfig'e Kaydedildi ✓</span>
                  </span>
                )}
                {saveStatus === "saving" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300 animate-pulse">
                    <span>Kaydediliyor...</span>
                  </span>
                )}
                {isNotesDirty && saveStatus === "idle" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-300">
                    <span>Kaydedilmemiş Değişiklik</span>
                  </span>
                )}
              </div>
            </div>

            {/* Quick action stamp templates */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mr-1">
                Hızlı Ekle:
              </span>
              <button
                type="button"
                onClick={() => handleInsertSnippet("Zaman Damgası")}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer"
                title="Şu anki tarih ve saati ekle"
              >
                🕒 Tarih/Saat Ekle
              </button>
              <button
                type="button"
                onClick={() => handleInsertSnippet("Telefon Görüşmesi")}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer"
                title="Telefon görüşmesi not başlığı ekle"
              >
                📞 Arama Yapıldı
              </button>
              <button
                type="button"
                onClick={() => handleInsertSnippet("Fiyat Teklifi İletildi")}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer"
                title="Teklif not şablonu ekle"
              >
                📑 Teklif İletildi
              </button>
              <button
                type="button"
                onClick={() => handleInsertSnippet("Müşteri Geri Dönüş Bekliyor")}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer"
                title="Takip hatırlatması ekle"
              >
                ⏳ Takip Hatırlatması
              </button>
            </div>

            {/* TEXTAREA FOR PRIVATE NOTES */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={notesText}
                onChange={(e) => {
                  setNotesText(e.target.value);
                  setIsNotesDirty(true);
                }}
                onBlur={() => {
                  if (isNotesDirty) {
                    handleSaveNotes();
                  }
                }}
                placeholder="Örnek Dahili Not: Müşteri ile 14:30'da görüşüldü. Şişli otoparkında aracın çekilmesi için saat 16:00'ya randevu verildi. Fiyatta 150 TL indirim uygulandı. Salı günü memnuniyet için tekrar aranacak..."
                rows={5}
                className="w-full p-3.5 text-xs sm:text-sm font-medium leading-relaxed rounded-xl border border-amber-300/80 dark:border-amber-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
              />
            </div>

            {/* Bottom Bar for Private Notes: Stats & Explicit Save Button */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-3">
                <span>{notesText.length} karakter</span>
                <span>•</span>
                <span>{notesText.trim() ? notesText.trim().split(/\s+/).length : 0} kelime</span>
                {lead.privateNotes && (
                  <>
                    <span>•</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                      ✓ Mevcut not kayıtlı
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                {notesText.trim() && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Bu talebe ait tüm özel notları silmek istediğinize emin misiniz?")) {
                        setNotesText("");
                        handleSaveNotes("");
                      }
                    }}
                    className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                  >
                    Notu Temizle
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleSaveNotes()}
                  className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer ${
                    isNotesDirty
                      ? "bg-amber-600 hover:bg-amber-500 text-white shadow-md animate-pulse"
                      : "bg-slate-900 hover:bg-slate-800 text-white"
                  }`}
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isNotesDirty ? "Notu SiteConfig'e Kaydet" : "Kaydedildi"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* EMAIL AUTOMATIONS & AUDIT TRACKING CARD */}
          <div className="p-4 sm:p-5 rounded-2xl bg-sky-50/60 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800 space-y-3 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-xs">
                  <MailCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      Email Automations & Gönderim Durumu
                    </h4>
                    {/* Status Badge */}
                    {lead.thankYouEmailStatus === "delivered" || lead.thankYouEmailSent ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider font-mono bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Delivered</span>
                      </span>
                    ) : lead.thankYouEmailStatus === "failed" ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider font-mono bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-300 dark:border-rose-800 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-rose-600" />
                        <span>Failed</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider font-mono bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                        <span>Pending</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Form doldurulduğunda otomatik iletilen teşekkür ve doğrulama e-postası.
                  </p>
                </div>
              </div>

              {onNavigateToEmailAutomations && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToEmailAutomations();
                  }}
                  className="text-xs font-bold text-sky-600 hover:text-sky-700 dark:text-sky-400 flex items-center gap-1 cursor-pointer hover:underline"
                >
                  <span>Email Automations Tabında İncele</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
                <div className="text-[10px] text-slate-400 font-medium">Alıcı E-Posta & Durum</div>
                <div className="font-mono font-bold text-slate-800 dark:text-slate-200 break-all">
                  {lead.email || "E-posta belirtilmedi"}
                </div>
                <div className="text-[11px] text-slate-500">
                  {lead.thankYouEmailSentAt
                    ? `Teslim Zamanı: ${lead.thankYouEmailSentAt}`
                    : lead.thankYouEmailScheduledFor
                    ? `Planlanan: ${lead.thankYouEmailScheduledFor}`
                    : "Kuyrukta beklemede"}
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
                <div className="text-[10px] text-slate-400 font-medium">SMTP & Hata Durumu</div>
                <div className="text-[11px] text-slate-700 dark:text-slate-300 font-mono">
                  {lead.thankYouEmailStatus === "delivered" || lead.thankYouEmailSent
                    ? "250 2.0.0 OK: Delivered"
                    : lead.thankYouEmailStatus === "failed"
                    ? lead.thankYouEmailFailureReason || "550 Mailbox unavailable"
                    : "Kuyrukta • Gecikme bekleniyor"}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  {(lead.thankYouEmailStatus === "pending" || (!lead.thankYouEmailSent && lead.thankYouEmailStatus !== "failed")) && (
                    <button
                      type="button"
                      onClick={() => {
                        const curTime = new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
                        onUpdateLead(lead.id, {
                          thankYouEmailSent: true,
                          thankYouEmailStatus: "delivered",
                          thankYouEmailSentAt: `Bugün ${curTime}`
                        });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      <span>Şimdi Gönder</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const curTime = new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
                      onUpdateLead(lead.id, {
                        thankYouEmailSent: true,
                        thankYouEmailStatus: "delivered",
                        thankYouEmailSentAt: `Bugün ${curTime}`,
                        thankYouEmailFailureReason: undefined
                      });
                    }}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Yeniden Gönder</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
            </>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between gap-3 shrink-0">
          <div>
            {onDeleteLead && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`${lead.name} adlı müşterinin talebini kalıcı olarak silmek istediğinize emin misiniz?`)) {
                    onDeleteLead(lead.id);
                    onClose();
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Talebi Sil</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                handleSaveNotesIfDirty();
                onClose();
              }}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
            >
              Tamam & Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
