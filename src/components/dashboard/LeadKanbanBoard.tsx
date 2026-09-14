import React, { useState } from "react";
import {
  GripVertical,
  Check,
  Phone,
  MessageCircle,
  Mail,
  FileText,
  Lock,
  Tag,
  Trash2,
  DollarSign,
  Calendar,
  Inbox,
  ArrowRight,
  MoveRight,
  Sparkles,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  Clock
} from "lucide-react";
import { FormLead, SiteConfig, LeadCustomTag } from "../../types";
import { LeadTagsManager, getLeadTagStyle } from "./LeadTagsManager";
import { LeadScoreBadge } from "./LeadScoreBadge";

interface LeadKanbanBoardProps {
  leads: FormLead[];
  config: SiteConfig;
  allCustomTags: LeadCustomTag[];
  allExistingTags: string[];
  onUpdateLead: (leadId: string, updates: Partial<FormLead>) => void;
  onDeleteLead: (leadId: string) => void;
  onOpenLeadDetail: (lead: FormLead) => void;
  onOpenLeadTimeline?: (lead: FormLead) => void;
  onAddTag: (leadId: string, newTag: string | { name: string; color: string; id?: string }) => void;
  onRemoveTag: (leadId: string, tagToRemove: string) => void;
  onOpenManageTagsModal?: () => void;
  onMarkLeadAsRead?: (leadId: string) => void;
  selectedLeadIds?: string[];
  onToggleSelectLead?: (leadId: string) => void;
}

type KanbanStatus = "new" | "contacted" | "offered" | "closed";

interface ColumnConfig {
  id: KanbanStatus;
  title: string;
  subtitle: string;
  badgeBg: string;
  badgeText: string;
  headerBorder: string;
  columnBg: string;
  columnBorder: string;
  activeDropBg: string;
  activeDropBorder: string;
  dotColor: string;
}

const COLUMNS: ColumnConfig[] = [
  {
    id: "new",
    title: "Yeni Talepler",
    subtitle: "Web sitesinden yeni gelen formlar",
    badgeBg: "bg-blue-100 dark:bg-blue-950/60",
    badgeText: "text-blue-700 dark:text-blue-300",
    headerBorder: "border-blue-300 dark:border-blue-700",
    columnBg: "bg-slate-50/70 dark:bg-slate-900/40",
    columnBorder: "border-slate-200 dark:border-slate-800",
    activeDropBg: "bg-blue-50/90 dark:bg-blue-950/40",
    activeDropBorder: "border-blue-400 ring-2 ring-blue-300 dark:ring-blue-800",
    dotColor: "bg-blue-500",
  },
  {
    id: "contacted",
    title: "İletişime Geçildi",
    subtitle: "Telefon veya WhatsApp ile ulaşıldı",
    badgeBg: "bg-amber-100 dark:bg-amber-950/60",
    badgeText: "text-amber-800 dark:text-amber-300",
    headerBorder: "border-amber-300 dark:border-amber-700",
    columnBg: "bg-slate-50/70 dark:bg-slate-900/40",
    columnBorder: "border-slate-200 dark:border-slate-800",
    activeDropBg: "bg-amber-50/90 dark:bg-amber-950/40",
    activeDropBorder: "border-amber-400 ring-2 ring-amber-300 dark:ring-amber-800",
    dotColor: "bg-amber-500",
  },
  {
    id: "offered",
    title: "Teklif & Müzakere",
    subtitle: "Fiyat teklifi verildi, değerlendiriliyor",
    badgeBg: "bg-indigo-100 dark:bg-indigo-950/60",
    badgeText: "text-indigo-800 dark:text-indigo-300",
    headerBorder: "border-indigo-300 dark:border-indigo-700",
    columnBg: "bg-slate-50/70 dark:bg-slate-900/40",
    columnBorder: "border-slate-200 dark:border-slate-800",
    activeDropBg: "bg-indigo-50/90 dark:bg-indigo-950/40",
    activeDropBorder: "border-indigo-400 ring-2 ring-indigo-300 dark:ring-indigo-800",
    dotColor: "bg-indigo-500",
  },
  {
    id: "closed",
    title: "Satış & Kapanan",
    subtitle: "Anlaşma sağlandı, işlem tamamlandı",
    badgeBg: "bg-emerald-100 dark:bg-emerald-950/60",
    badgeText: "text-emerald-800 dark:text-emerald-300",
    headerBorder: "border-emerald-300 dark:border-emerald-700",
    columnBg: "bg-slate-50/70 dark:bg-slate-900/40",
    columnBorder: "border-slate-200 dark:border-slate-800",
    activeDropBg: "bg-emerald-50/90 dark:bg-emerald-950/40",
    activeDropBorder: "border-emerald-400 ring-2 ring-emerald-300 dark:ring-emerald-800",
    dotColor: "bg-emerald-500",
  },
];

export const LeadKanbanBoard: React.FC<LeadKanbanBoardProps> = ({
  leads,
  config,
  allCustomTags,
  allExistingTags,
  onUpdateLead,
  onDeleteLead,
  onOpenLeadDetail,
  onOpenLeadTimeline,
  onAddTag,
  onRemoveTag,
  onOpenManageTagsModal,
  onMarkLeadAsRead,
  selectedLeadIds = [],
  onToggleSelectLead
}) => {
  // Drag and drop state
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<KanbanStatus | null>(null);
  const [lastMoveToast, setLastMoveToast] = useState<string | null>(null);

  // Group leads into status columns
  const leadsByStatus = {
    new: leads.filter((l) => (l.status || "new") === "new"),
    contacted: leads.filter((l) => l.status === "contacted"),
    offered: leads.filter((l) => l.status === "offered"),
    closed: leads.filter((l) => l.status === "closed"),
  };

  const calculateColumnTotal = (status: KanbanStatus) => {
    return leadsByStatus[status].reduce(
      (sum, l) => sum + (Number(l.dealValue) || 0),
      0
    );
  };

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.setData("text/plain", leadId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggedLeadId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, status: KanbanStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
    }
  };

  const handleDragLeave = (e: React.DragEvent, status: KanbanStatus) => {
    // Only reset if we're actually leaving the column container
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (dragOverColumn === status) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatus: KanbanStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const leadId = e.dataTransfer.getData("text/plain") || draggedLeadId;
    if (!leadId) return;

    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    if (lead.status === targetStatus) return; // No change

    // Execute status update
    const targetColName = COLUMNS.find((c) => c.id === targetStatus)?.title || targetStatus;
    onUpdateLead(leadId, {
      status: targetStatus,
      ...(targetStatus === "closed" && !lead.dealValue ? { dealValue: 1000 } : {}),
      ...(targetStatus === "closed" && !lead.completedAt ? { completedAt: "Bugün" } : {}),
      ...(lead.isRead === false ? { isRead: true } : {}),
    });

    setLastMoveToast(`"${lead.name}" talebi ➔ "${targetColName}" sütununa taşındı.`);
    setTimeout(() => {
      setLastMoveToast(null);
    }, 3000);
    setDraggedLeadId(null);
  };

  const handleQuickMove = (lead: FormLead, targetStatus: KanbanStatus) => {
    if (lead.status === targetStatus) return;
    const targetColName = COLUMNS.find((c) => c.id === targetStatus)?.title || targetStatus;
    onUpdateLead(lead.id, {
      status: targetStatus,
      ...(targetStatus === "closed" && !lead.dealValue ? { dealValue: 1000 } : {}),
      ...(targetStatus === "closed" && !lead.completedAt ? { completedAt: "Bugün" } : {}),
      ...(lead.isRead === false ? { isRead: true } : {}),
    });

    setLastMoveToast(`"${lead.name}" talebi ➔ "${targetColName}" sütununa taşındı.`);
    setTimeout(() => {
      setLastMoveToast(null), 3000;
    });
  };

  return (
    <div className="space-y-4">
      {/* KANBAN FEEDBACK TOAST */}
      {lastMoveToast && (
        <div className="p-3 rounded-2xl bg-indigo-600 text-white text-xs font-bold flex items-center justify-between shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>{lastMoveToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setLastMoveToast(null)}
            className="text-indigo-200 hover:text-white ml-2 text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* INSTRUCTION BANNER */}
      <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 flex flex-wrap items-center justify-between gap-3 text-xs text-indigo-950 dark:text-indigo-200">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span>
            <strong>Sürükle & Bırak (Drag & Drop):</strong> Talepleri sütunlar arasında sürükleyerek durumlarını anında güncelleyebilirsiniz.
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
          <span>Toplam <strong>{leads.length}</strong> Talep</span>
          <span>•</span>
          <span>
            Toplam Boru Hattı Değeri:{" "}
            <strong className="text-slate-900 dark:text-white font-mono font-bold">
              ₺{leads.reduce((s, l) => s + (Number(l.dealValue) || 0), 0).toLocaleString("tr-TR")}
            </strong>
          </span>
        </div>
      </div>

      {/* KANBAN COLUMNS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
        {COLUMNS.map((column) => {
          const columnLeads = leadsByStatus[column.id];
          const columnTotal = calculateColumnTotal(column.id);
          const isDropActive = dragOverColumn === column.id;

          return (
            <div
              key={column.id}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={(e) => handleDragLeave(e, column.id)}
              onDrop={(e) => handleDrop(e, column.id)}
              className={`rounded-3xl border transition-all flex flex-col min-h-[500px] max-h-[85vh] ${
                column.columnBg
              } ${
                isDropActive
                  ? `${column.activeDropBg} ${column.activeDropBorder} scale-[1.01] shadow-lg`
                  : column.columnBorder
              }`}
            >
              {/* COLUMN HEADER */}
              <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 shrink-0 bg-white/70 dark:bg-slate-900/70 rounded-t-3xl backdrop-blur-xs">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full ${column.dotColor} shrink-0`} />
                    <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">
                      {column.title}
                    </h3>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-black font-mono shadow-2xs shrink-0 ${column.badgeBg} ${column.badgeText}`}
                  >
                    {columnLeads.length}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="truncate">{column.subtitle}</span>
                  {columnTotal > 0 && (
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-200 shrink-0 ml-1">
                      ₺{columnTotal.toLocaleString("tr-TR")}
                    </span>
                  )}
                </div>

                {isDropActive && (
                  <div className="mt-2 py-1 px-2.5 rounded-xl bg-indigo-500 text-white text-[11px] font-bold text-center animate-pulse">
                    Buraya Bırakın ➔ Durumu Güncelle
                  </div>
                )}
              </div>

              {/* COLUMN CARDS CONTAINER (SCROLLABLE) */}
              <div className="p-3 space-y-3 overflow-y-auto flex-1 min-h-[160px]">
                {columnLeads.map((lead) => {
                  const isBeingDragged = draggedLeadId === lead.id;
                  const isUnread =
                    lead.isRead === false || (lead.isRead === undefined && lead.status === "new");
                  const isSelected = selectedLeadIds.includes(lead.id);

                  return (
                    <div
                      key={lead.id}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      onDragEnd={handleDragEnd}
                      className={`group relative p-3.5 rounded-2xl bg-white dark:bg-slate-900 border transition-all cursor-grab active:cursor-grabbing hover:shadow-md ${
                        isSelected
                          ? "ring-2 ring-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 border-indigo-400 dark:border-indigo-600"
                          : isBeingDragged
                          ? "opacity-40 border-dashed border-indigo-400 scale-95"
                          : isUnread
                          ? "border-rose-300 dark:border-rose-900/60 shadow-xs ring-1 ring-rose-200 dark:ring-rose-950"
                          : lead.status === "closed"
                          ? "border-emerald-200 dark:border-emerald-800/80 hover:border-emerald-300"
                          : "border-slate-200/90 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700"
                      }`}
                    >
                      {/* CARD TOP BAR: CHECKBOX, DRAG HANDLE, NAME, DATE, UNREAD PILL */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {onToggleSelectLead && (
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                e.stopPropagation();
                                onToggleSelectLead(lead.id);
                              }}
                              className="w-3.5 h-3.5 rounded-sm text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer shrink-0"
                              title="Talebi seç"
                            />
                          )}
                          <GripVertical
                            className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 shrink-0 transition-colors"
                            title="Sürüklemek için tutun"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                                {lead.name}
                              </span>
                              {isUnread && (
                                <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-black uppercase tracking-wider font-mono">
                                  YENİ
                                </span>
                              )}
                              {lead.heroVariant && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                                  V-{lead.heroVariant}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-slate-400 font-mono">
                                {lead.date}
                              </span>
                              <LeadScoreBadge lead={lead} scoringConfig={config.leadNotifications?.scoring} compact />
                            </div>
                          </div>
                        </div>

                        {/* Quick detail & unread actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          {isUnread && onMarkLeadAsRead && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onMarkLeadAsRead(lead.id);
                              }}
                              className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[10px] font-bold"
                              title="Okundu yap"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          )}
                          {onOpenLeadTimeline && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenLeadTimeline(lead);
                              }}
                              className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                              title="Zaman Çizelgesi & İletişim Geçmişi"
                            >
                              <Clock className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenLeadDetail(lead);
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                            title="Detayları ve Dahili Notları Aç"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* SERVICE BADGE */}
                      {lead.serviceOrProduct && (
                        <div className="mb-2">
                          <span className="inline-block px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold truncate max-w-full">
                            {lead.serviceOrProduct}
                          </span>
                        </div>
                      )}

                      {/* MESSAGE PREVIEW */}
                      {lead.message && (
                        <p
                          onClick={() => onOpenLeadDetail(lead)}
                          className="text-[11px] text-slate-600 dark:text-slate-400 italic line-clamp-2 leading-snug mb-2.5 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200"
                          title="Tüm mesajı ve detayları görmek için tıklayın"
                        >
                          "{lead.message}"
                        </p>
                      )}

                      {/* PRIVATE NOTES PREVIEW BADGE */}
                      {(lead.privateNotes || lead.dealNotes) && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenLeadDetail(lead);
                          }}
                          className="mb-2.5 p-2 rounded-xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200/90 dark:border-amber-800/80 flex items-start gap-1.5 cursor-pointer hover:bg-amber-100/80 transition-colors group/note"
                          title="Dahili Özel Notu Görüntüle ve Düzenle"
                        >
                          <Lock className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-bold text-amber-900 dark:text-amber-300 block">
                              Dahili Not ✎
                            </span>
                            <p className="text-[10px] text-slate-700 dark:text-slate-300 line-clamp-1 italic font-medium">
                              "{lead.privateNotes || lead.dealNotes}"
                            </p>
                          </div>
                        </div>
                      )}

                      {/* CRM TAGS MINI DISPLAY */}
                      {(lead.tags && lead.tags.length > 0) && (
                        <div className="flex flex-wrap items-center gap-1 mb-2.5">
                          {lead.tags.map((tagName) => {
                            const customTagObj = allCustomTags.find(
                              (ct) => ct.name.toLowerCase() === tagName.toLowerCase()
                            );
                            const style = getLeadTagStyle(tagName, customTagObj?.color);
                            return (
                              <span
                                key={tagName}
                                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${style.bg} ${style.text} ${style.border}`}
                              >
                                <span className={`w-1 h-1 rounded-full ${style.dot}`} />
                                <span className="truncate max-w-[100px]">{tagName}</span>
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {/* DEAL VALUE & QUICK CONTACT BUTTONS */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                        {/* Deal value inline edit */}
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-bold text-slate-400 font-mono">₺</span>
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
                            className="w-16 px-1 py-0.5 text-xs font-mono font-bold rounded border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-indigo-500 bg-transparent text-slate-800 dark:text-slate-100 outline-none"
                            title="Teklif veya Kapanan Tutar (TL)"
                          />
                        </div>

                        {/* Actions: Call, WhatsApp, Move */}
                        <div className="flex items-center gap-1 shrink-0">
                          {lead.phone && (
                            <a
                              href={`tel:${lead.phone.replace(/[^0-9+]/g, "")}`}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                              title={`Ara: ${lead.phone}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Phone className="w-3 h-3 text-amber-500" />
                            </a>
                          )}
                          {lead.phone && (
                            <a
                              href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}?text=Merhaba%20${encodeURIComponent(lead.name)},%20${encodeURIComponent(config.companyName || "firmamız")}%20olarak%20web%20sitemizden%20ilettiğiniz%20teklif%20talebiniz%20hakkında%20yazıyoruz.`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 transition-colors"
                              title="WhatsApp Mesajı Gönder"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MessageCircle className="w-3 h-3" />
                            </a>
                          )}

                          {/* Quick Status Move Dropdown (for touch/non-drag users) */}
                          <select
                            value={lead.status || "new"}
                            onChange={(e) => handleQuickMove(lead, e.target.value as KanbanStatus)}
                            onClick={(e) => e.stopPropagation()}
                            className="text-[10px] font-bold p-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 outline-none cursor-pointer hover:bg-slate-100"
                            title="Durumu Hızlı Değiştir"
                          >
                            <option value="new">Yeni</option>
                            <option value="contacted">İletişim</option>
                            <option value="offered">Teklif</option>
                            <option value="closed">Kapandı</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {columnLeads.length === 0 && (
                  <div className="py-12 px-3 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 dark:text-slate-500 text-xs">
                    <Inbox className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-1.5 opacity-60" />
                    <p className="font-semibold text-[11px]">Bu aşamada talep yok</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Kartları buraya sürükleyip bırakabilirsiniz
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
