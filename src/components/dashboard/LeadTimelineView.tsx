import React, { useState, useMemo } from "react";
import {
  Clock,
  Phone,
  MessageCircle,
  Mail,
  FileText,
  Lock,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Inbox,
  User,
  Calendar,
  Filter,
  ArrowUpDown,
  Download,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  Tag,
  Search,
  Send,
  Flame,
  Archive,
  Layers
} from "lucide-react";
import { FormLead, LeadTimelineEntry, LeadTimelineEventType, SiteConfig } from "../../types";
import {
  buildInitialLeadTimeline,
  addTimelineEntryToLead,
  removeTimelineEntryFromLead,
  updateTimelineEntryInLead,
  downloadTimelineReport
} from "../../utils/leadTimelineHelper";

interface LeadTimelineViewProps {
  lead: FormLead;
  config: SiteConfig;
  onUpdateLead: (leadId: string, updates: Partial<FormLead>) => void;
  compactMode?: boolean;
}

export const LeadTimelineView: React.FC<LeadTimelineViewProps> = ({
  lead,
  config,
  onUpdateLead,
  compactMode = false
}) => {
  // Sort order: "newest_first" or "oldest_first"
  const [sortOrder, setSortOrder] = useState<"newest_first" | "oldest_first">("newest_first");
  // Category filter
  const [typeFilter, setTypeFilter] = useState<"all" | LeadTimelineEventType>("all");
  // Text search filter
  const [searchQuery, setSearchQuery] = useState("");
  // Composer visibility
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  // Editing state for an entry
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editOutcome, setEditOutcome] = useState("");

  // New entry composer form state
  const [newType, setNewType] = useState<LeadTimelineEventType>("call");
  const [newTitle, setNewTitle] = useState("Telefon Görüşmesi Yapıldı");
  const [newDesc, setNewDesc] = useState("");
  const [newAuthor, setNewAuthor] = useState("Operasyon Danışmanı");
  const [newDuration, setNewDuration] = useState("");
  const [newOutcome, setNewOutcome] = useState("Olumlu / Görüşüldü");
  const [newDealValue, setNewDealValue] = useState<string>("");
  const [newStatusUpdate, setNewStatusUpdate] = useState<FormLead["status"] | "no_change">("no_change");

  // Format today's date nicely for the entry default
  const getCurrentFormattedTime = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, "0");
    const mins = String(now.getMinutes()).padStart(2, "0");
    return `${day}.${month}.${year} ${hours}:${mins}`;
  };
  const [newDate, setNewDate] = useState<string>(getCurrentFormattedTime());

  // Get current timeline entries
  const timelineEntries = useMemo(() => {
    return buildInitialLeadTimeline(lead, config.companyName || "Firmamız");
  }, [lead, config.companyName]);

  // Statistics
  const stats = useMemo(() => {
    const total = timelineEntries.length;
    const calls = timelineEntries.filter((e) => e.type === "call").length;
    const whatsapps = timelineEntries.filter((e) => e.type === "whatsapp").length;
    const emails = timelineEntries.filter((e) => e.type === "email").length;
    const notes = timelineEntries.filter((e) => e.type === "note").length;
    const quotes = timelineEntries.filter((e) => e.type === "quote").length;
    return { total, calls, whatsapps, emails, notes, quotes };
  }, [timelineEntries]);

  // Filtered & sorted entries
  const displayedEntries = useMemo(() => {
    let list = [...timelineEntries];

    // Filter by type
    if (typeFilter !== "all") {
      list = list.filter((item) => item.type === typeFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          (item.author && item.author.toLowerCase().includes(q)) ||
          (item.outcome && item.outcome.toLowerCase().includes(q))
      );
    }

    // Sort
    if (sortOrder === "oldest_first") {
      // Reverse if default was newest first
      list.reverse();
    }

    return list;
  }, [timelineEntries, typeFilter, searchQuery, sortOrder]);

  // Handle setting active composer tab with sensible title defaults
  const handleSelectComposerType = (t: LeadTimelineEventType) => {
    setNewType(t);
    setNewDate(getCurrentFormattedTime());
    switch (t) {
      case "call":
        setNewTitle("Telefon Görüşmesi Yapıldı");
        setNewOutcome("Görüşüldü / Detay Alındı");
        break;
      case "whatsapp":
        setNewTitle("WhatsApp Görüşmesi & Bilgilendirme");
        setNewOutcome("Mesaj İletildi");
        break;
      case "email":
        setNewTitle("E-posta Gönderildi");
        setNewOutcome("İletildi");
        break;
      case "meeting":
        setNewTitle("Yüz Yüze Görüşme / Saha Keşfi");
        setNewOutcome("Görüşme Tamamlandı");
        break;
      case "note":
        setNewTitle("Dahili Özel Not Eklendi");
        setNewOutcome("Kaydedildi");
        break;
      case "quote":
        setNewTitle("Fiyat Teklifi Sunuldu");
        setNewOutcome("Teklif Beklemede");
        break;
      case "deal_closed":
        setNewTitle("Satış / Hizmet Kapatıldı 🎉");
        setNewOutcome("Başarılı");
        break;
      default:
        setNewTitle("Yeni İletişim Kaydı");
        setNewOutcome("Tamamlandı");
    }
  };

  // Handle adding new timeline entry
  const handleAddNewEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim()) return;

    const parsedDealVal = newDealValue ? parseFloat(newDealValue) : undefined;

    const entryToSave: Omit<LeadTimelineEntry, "id"> = {
      type: newType,
      date: newDate.trim() || getCurrentFormattedTime(),
      title: newTitle.trim() || "İletişim Kaydı",
      description: newDesc.trim(),
      author: newAuthor.trim() || "Operasyon Ekibi",
      duration: newDuration.trim() || undefined,
      outcome: newOutcome.trim() || undefined,
      dealValue: !isNaN(parsedDealVal as number) ? parsedDealVal : undefined,
      statusTo: newStatusUpdate !== "no_change" ? newStatusUpdate : undefined
    };

    const updatedLead = addTimelineEntryToLead(lead, entryToSave, config.companyName || "Firmamız");

    onUpdateLead(lead.id, {
      timeline: updatedLead.timeline,
      privateNotes: updatedLead.privateNotes,
      dealNotes: updatedLead.dealNotes,
      lastActivityAt: updatedLead.lastActivityAt,
      ...(parsedDealVal !== undefined ? { dealValue: parsedDealVal } : {}),
      ...(newStatusUpdate !== "no_change" ? { status: newStatusUpdate } : {})
    });

    // Reset composer form
    setNewDesc("");
    setNewDuration("");
    setNewDealValue("");
    setNewStatusUpdate("no_change");
    setIsComposerOpen(false);
  };

  // Handle editing an entry
  const handleStartEdit = (entry: LeadTimelineEntry) => {
    setEditingEntryId(entry.id);
    setEditTitle(entry.title);
    setEditDesc(entry.description);
    setEditOutcome(entry.outcome || "");
  };

  const handleSaveEdit = (entryId: string) => {
    const updatedLead = updateTimelineEntryInLead(
      lead,
      entryId,
      {
        title: editTitle.trim(),
        description: editDesc.trim(),
        outcome: editOutcome.trim() || undefined
      },
      config.companyName || "Firmamız"
    );

    onUpdateLead(lead.id, {
      timeline: updatedLead.timeline,
      lastActivityAt: updatedLead.lastActivityAt
    });
    setEditingEntryId(null);
  };

  // Handle deleting an entry
  const handleDeleteEntry = (entryId: string, title: string) => {
    if (window.confirm(`"${title}" kaydını zaman çizelgesinden silmek istediğinize emin misiniz?`)) {
      const updatedLead = removeTimelineEntryFromLead(lead, entryId, config.companyName || "Firmamız");
      onUpdateLead(lead.id, {
        timeline: updatedLead.timeline,
        lastActivityAt: updatedLead.lastActivityAt
      });
    }
  };

  // Render type icon with theme colors
  const renderTypeIcon = (type: LeadTimelineEventType) => {
    switch (type) {
      case "call":
        return (
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 flex items-center justify-center shadow-xs">
            <Phone className="w-4 h-4" />
          </div>
        );
      case "whatsapp":
        return (
          <div className="w-8 h-8 rounded-xl bg-green-100 text-green-700 dark:bg-green-950/80 dark:text-green-300 flex items-center justify-center shadow-xs">
            <MessageCircle className="w-4 h-4" />
          </div>
        );
      case "email":
        return (
          <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300 flex items-center justify-center shadow-xs">
            <Mail className="w-4 h-4" />
          </div>
        );
      case "meeting":
        return (
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 flex items-center justify-center shadow-xs">
            <User className="w-4 h-4" />
          </div>
        );
      case "note":
        return (
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 flex items-center justify-center shadow-xs">
            <Lock className="w-4 h-4" />
          </div>
        );
      case "form_submission":
        return (
          <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 flex items-center justify-center shadow-xs">
            <Inbox className="w-4 h-4" />
          </div>
        );
      case "quote":
        return (
          <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-950/80 dark:text-violet-300 flex items-center justify-center shadow-xs">
            <DollarSign className="w-4 h-4" />
          </div>
        );
      case "deal_closed":
        return (
          <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md animate-bounce-subtle">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        );
      case "status_change":
        return (
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 flex items-center justify-center shadow-xs">
            <RotateCcw className="w-4 h-4" />
          </div>
        );
      case "score":
        return (
          <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 flex items-center justify-center shadow-xs">
            <Flame className="w-4 h-4" />
          </div>
        );
      case "archive":
        return (
          <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 flex items-center justify-center shadow-xs">
            <Archive className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 flex items-center justify-center shadow-xs">
            <Clock className="w-4 h-4" />
          </div>
        );
    }
  };

  // Get readable badge text for entry type
  const getEntryTypeLabel = (type: LeadTimelineEventType) => {
    switch (type) {
      case "call":
        return "Telefon Görüşmesi";
      case "whatsapp":
        return "WhatsApp Mesajı";
      case "email":
        return "E-posta";
      case "meeting":
        return "Yüz Yüze / Saha";
      case "note":
        return "Dahili Özel Not";
      case "form_submission":
        return "Form Başvurusu";
      case "quote":
        return "Fiyat Teklifi";
      case "deal_closed":
        return "Satış Kapandı";
      case "status_change":
        return "Durum Değişimi";
      case "score":
        return "Scoring / Öncelik";
      case "archive":
        return "Arşiv";
      default:
        return "İşlem";
    }
  };

  const cleanPhone = lead.phone ? lead.phone.replace(/[^0-9]/g, "") : "";
  const waUrl = `https://wa.me/${cleanPhone}?text=Merhaba%20Sayın%20${encodeURIComponent(lead.name)},%20${encodeURIComponent(config.companyName || "firmamız")}%20olarak%20web%20sitemizden%20ilettiğiniz%20teklif%20talebiniz%20hakkında%20yazıyoruz.`;

  return (
    <div className="space-y-4">
      {/* TIMELINE TOP METRICS & QUICK SUMMARY */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/80 border border-indigo-400/40 text-white flex items-center justify-center shadow-inner">
            <Clock className="w-5 h-5 text-indigo-200" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm sm:text-base font-black text-white tracking-tight">
                {lead.name} — Zaman Çizelgesi
              </h4>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider font-mono ${
                lead.status === "closed"
                  ? "bg-emerald-500 text-white"
                  : lead.status === "offered"
                  ? "bg-indigo-500 text-white"
                  : lead.status === "contacted"
                  ? "bg-amber-400 text-slate-950"
                  : lead.status === "archived"
                  ? "bg-slate-700 text-slate-300"
                  : "bg-blue-500 text-white"
              }`}>
                {lead.status === "closed" ? "Satış Tamamlandı" : lead.status === "offered" ? "Teklif Verildi" : lead.status === "contacted" ? "İletişime Geçildi" : lead.status === "archived" ? "Arşivde" : "Yeni Talep"}
              </span>
              {lead.dealValue && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 text-emerald-300 border border-emerald-500/30">
                  ₺{lead.dealValue.toLocaleString("tr-TR")}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-2 flex-wrap">
              <span className="font-mono text-slate-400">{lead.phone}</span>
              <span>•</span>
              <span className="truncate max-w-[200px] text-slate-300">{lead.serviceOrProduct}</span>
              <span>•</span>
              <span className="text-amber-300 font-bold">{stats.total} Toplam Etkinlik</span>
            </p>
          </div>
        </div>

        {/* Action buttons: Add activity & Export report */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => downloadTimelineReport(lead, timelineEntries)}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-white/15 shadow-xs"
            title="Tüm zaman çizelgesini ve notları metin raporu olarak indir"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Rapor İndir</span>
          </button>

          <button
            type="button"
            onClick={() => setIsComposerOpen(!isComposerOpen)}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            {isComposerOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            <span>{isComposerOpen ? "Kapat" : "Yeni İletişim / Not Ekle"}</span>
          </button>
        </div>
      </div>

      {/* STATS CHIPS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-500 block truncate">Toplam Etkinlik</span>
            <span className="text-xs font-black text-slate-800 dark:text-slate-100">{stats.total}</span>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
            <Phone className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-500 block truncate">Aramalar</span>
            <span className="text-xs font-black text-slate-800 dark:text-slate-100">{stats.calls}</span>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300">
            <MessageCircle className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-500 block truncate">WhatsApp</span>
            <span className="text-xs font-black text-slate-800 dark:text-slate-100">{stats.whatsapps}</span>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
            <Mail className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-500 block truncate">E-Posta</span>
            <span className="text-xs font-black text-slate-800 dark:text-slate-100">{stats.emails}</span>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
            <Lock className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-500 block truncate">Özel Notlar</span>
            <span className="text-xs font-black text-slate-800 dark:text-slate-100">{stats.notes}</span>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300">
            <DollarSign className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-500 block truncate">Teklif & Ciro</span>
            <span className="text-xs font-black text-slate-800 dark:text-slate-100">₺{(lead.dealValue || 0).toLocaleString("tr-TR")}</span>
          </div>
        </div>
      </div>

      {/* EXPANDABLE COMPOSER: ADD NEW COMMUNICATION OR NOTE */}
      {isComposerOpen && (
        <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border-2 border-indigo-200 dark:border-indigo-800 space-y-4 shadow-sm animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </div>
              <h5 className="text-sm font-black text-slate-900 dark:text-white">
                Yeni İletişim veya Not Kaydet
              </h5>
            </div>
            <button
              type="button"
              onClick={() => setIsComposerOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Activity type tabs */}
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handleSelectComposerType("call")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                newType === "call"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100"
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Telefon Araması</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectComposerType("whatsapp")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                newType === "whatsapp"
                  ? "bg-green-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100"
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectComposerType("email")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                newType === "email"
                  ? "bg-sky-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>E-Posta</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectComposerType("meeting")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                newType === "meeting"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Toplantı / Keşif</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectComposerType("note")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                newType === "note"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Dahili Özel Not</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectComposerType("quote")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                newType === "quote"
                  ? "bg-violet-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100"
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Fiyat Teklifi</span>
            </button>
          </div>

          {/* Composer Form */}
          <form onSubmit={handleAddNewEntry} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                  Başlık
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Görüşme Başlığı"
                  required
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                  Tarih / Saat
                </label>
                <input
                  type="text"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  placeholder="DD.MM.YYYY HH:mm"
                  required
                  className="w-full px-3 py-2 text-xs font-mono font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                  İşlemi Yapan (Temsilci)
                </label>
                <input
                  type="text"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  placeholder="Örn: Operasyon Danışmanı"
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Description textarea */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                İletişim Detayı & Not Açıklaması *
              </label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder={
                  newType === "call"
                    ? "Örn: Müşteri arandı. Randevu saati Cumartesi 14:00 olarak kararlaştırıldı. Fiyat teklifi onaylandı."
                    : newType === "whatsapp"
                    ? "Örn: WhatsApp üzerinden detaylı katalog ve adres konumu gönderildi."
                    : newType === "quote"
                    ? "Örn: Özel çekici hizmeti için 1.400 TL + KDV teklif sunuldu. Pazartesiye kadar geçerli."
                    : "Örn: Müşteri hakkında dahili gözlem veya operasyon notu..."
                }
                rows={3}
                required
                className="w-full p-3 text-xs sm:text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Optional parameters: Duration, Outcome, Pipeline change, Deal Value */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                  Görüşme Süresi (Opsiyonel)
                </label>
                <input
                  type="text"
                  value={newDuration}
                  onChange={(e) => setNewDuration(e.target.value)}
                  placeholder="Örn: 5 dk"
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                  Sonuç / Durum
                </label>
                <input
                  type="text"
                  value={newOutcome}
                  onChange={(e) => setNewOutcome(e.target.value)}
                  placeholder="Örn: Olumlu / Randevu Alındı"
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                  Pipeline Aşaması Güncelle
                </label>
                <select
                  value={newStatusUpdate}
                  onChange={(e) => setNewStatusUpdate(e.target.value as FormLead["status"] | "no_change")}
                  className="w-full px-2.5 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none"
                >
                  <option value="no_change">Değiştirme ({lead.status})</option>
                  <option value="contacted">💬 İletişime Geçildi</option>
                  <option value="offered">📑 Teklif Verildi</option>
                  <option value="closed">🏆 Satış Tamamlandı</option>
                  <option value="archived">📦 Arşive Taşı</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                  Teklif / Ciro Tutarı (TL)
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-mono font-bold text-slate-400">₺</span>
                  <input
                    type="number"
                    value={newDealValue}
                    onChange={(e) => setNewDealValue(e.target.value)}
                    placeholder={lead.dealValue ? String(lead.dealValue) : "0"}
                    className="w-full px-2 py-1.5 text-xs font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Submit & Cancel */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-indigo-200/60 dark:border-indigo-900/60">
              <button
                type="button"
                onClick={() => setIsComposerOpen(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Vazgeç
              </button>

              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Zaman Çizelgesine Kaydet</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FILTER & CONTROLS TOOLBAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        {/* Category filters */}
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => setTypeFilter("all")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              typeFilter === "all"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            Tümü ({timelineEntries.length})
          </button>

          <button
            type="button"
            onClick={() => setTypeFilter("call")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              typeFilter === "call"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
            }`}
          >
            <Phone className="w-3 h-3" />
            <span>Aramalar ({stats.calls})</span>
          </button>

          <button
            type="button"
            onClick={() => setTypeFilter("whatsapp")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              typeFilter === "whatsapp"
                ? "bg-green-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-green-50 dark:hover:bg-green-950/40"
            }`}
          >
            <MessageCircle className="w-3 h-3" />
            <span>WhatsApp ({stats.whatsapps})</span>
          </button>

          <button
            type="button"
            onClick={() => setTypeFilter("email")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              typeFilter === "email"
                ? "bg-sky-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-sky-50 dark:hover:bg-sky-950/40"
            }`}
          >
            <Mail className="w-3 h-3" />
            <span>E-Posta ({stats.emails})</span>
          </button>

          <button
            type="button"
            onClick={() => setTypeFilter("note")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              typeFilter === "note"
                ? "bg-amber-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
            }`}
          >
            <Lock className="w-3 h-3" />
            <span>Özel Notlar ({stats.notes})</span>
          </button>

          <button
            type="button"
            onClick={() => setTypeFilter("quote")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              typeFilter === "quote"
                ? "bg-violet-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-violet-50 dark:hover:bg-violet-950/40"
            }`}
          >
            <DollarSign className="w-3 h-3" />
            <span>Teklifler ({stats.quotes})</span>
          </button>
        </div>

        {/* Right side: Search and sort toggle */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Search box */}
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Çizelgede ara..."
              className="w-full pl-8 pr-2.5 py-1 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Chronological sort toggle */}
          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === "newest_first" ? "oldest_first" : "newest_first")}
            className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shadow-2xs"
            title="Sıralamayı değiştir"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-indigo-500" />
            <span>{sortOrder === "newest_first" ? "En Yeni Üstte" : "Eskiden Yeniye"}</span>
          </button>
        </div>
      </div>

      {/* CHRONOLOGICAL TIMELINE STREAM */}
      <div className="relative pl-6 sm:pl-8 space-y-6 pt-2 pb-6">
        {/* Continuous vertical timeline guide line */}
        <div className="absolute left-3.5 sm:left-4.5 top-3 bottom-3 w-0.5 bg-slate-200 dark:bg-slate-800 -translate-x-1/2" />

        {displayedEntries.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
              Bu filtreye uygun zaman çizelgesi kaydı bulunamadı.
            </p>
            {(typeFilter !== "all" || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setTypeFilter("all");
                  setSearchQuery("");
                }}
                className="mt-2 text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
              >
                Filtreleri Temizle
              </button>
            )}
          </div>
        ) : (
          displayedEntries.map((entry, idx) => {
            const isEditing = editingEntryId === entry.id;

            return (
              <div key={entry.id} className="relative group">
                {/* Node icon connecting to the vertical timeline line */}
                <div className="absolute -left-6 sm:-left-8 top-1.5 -translate-x-1/2 z-10">
                  {renderTypeIcon(entry.type)}
                </div>

                {/* Entry Card Content */}
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    entry.pinned
                      ? "bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800 ring-1 ring-indigo-300 dark:ring-indigo-700"
                      : entry.type === "note"
                      ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60"
                      : entry.type === "deal_closed"
                      ? "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  } shadow-2xs space-y-2`}
                >
                  {/* Top Bar: Type, Title, Date, Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          entry.type === "call"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : entry.type === "whatsapp"
                            ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                            : entry.type === "email"
                            ? "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300"
                            : entry.type === "note"
                            ? "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300"
                            : entry.type === "quote"
                            ? "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300"
                            : entry.type === "deal_closed"
                            ? "bg-emerald-500 text-white"
                            : entry.type === "form_submission"
                            ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
                            : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {getEntryTypeLabel(entry.type)}
                      </span>

                      {isEditing ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="px-2 py-0.5 text-xs font-bold rounded-lg border border-indigo-300 bg-white dark:bg-slate-800"
                        />
                      ) : (
                        <h6 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                          {entry.title}
                        </h6>
                      )}

                      {entry.pinned && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-indigo-200 text-indigo-900">
                          Başlangıç
                        </span>
                      )}
                    </div>

                    {/* Right side: Timestamp & inline actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {entry.date}
                      </span>

                      {/* Edit / Delete buttons */}
                      {!entry.pinned && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(entry.id)}
                                className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50"
                                title="Kaydet"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingEntryId(null)}
                                className="p-1 rounded-md text-slate-400 hover:bg-slate-100"
                                title="Vazgeç"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleStartEdit(entry)}
                                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="Düzenle"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteEntry(entry.id, entry.title)}
                                className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                title="Sil"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Body description */}
                  {isEditing ? (
                    <div className="space-y-2 pt-1">
                      <textarea
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        rows={3}
                        className="w-full p-2.5 text-xs font-medium rounded-xl border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editOutcome}
                          onChange={(e) => setEditOutcome(e.target.value)}
                          placeholder="Sonuç durumu (örn: Olumlu)"
                          className="px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(entry.id)}
                          className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                        >
                          Değişikliği Kaydet
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
                      {entry.description}
                    </p>
                  )}

                  {/* Footer Chips: Author, Duration, Outcome, Deal Value */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                    {entry.author && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{entry.author}</span>
                      </span>
                    )}

                    {entry.duration && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                        <Clock className="w-3 h-3" />
                        <span>Süre: {entry.duration}</span>
                      </span>
                    )}

                    {entry.outcome && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">
                        <Check className="w-3 h-3" />
                        <span>{entry.outcome}</span>
                      </span>
                    )}

                    {entry.dealValue && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800">
                        <DollarSign className="w-3 h-3" />
                        <span>Tutar: ₺{entry.dealValue.toLocaleString("tr-TR")}</span>
                      </span>
                    )}

                    {entry.statusTo && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px]">
                        <span>Aşama: {entry.statusTo.toUpperCase()}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
