import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  StickyNote,
  X,
  Search,
  Plus,
  Trash2,
  Edit3,
  Check,
  ArrowRight,
  Sparkles,
  Copy,
  Clock,
  Tag,
  Download,
  Filter,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  FileText,
  GripVertical,
  Maximize2,
  Minimize2,
  LayoutGrid,
  ListOrdered,
  RotateCcw,
  CheckCircle2,
  Move,
  Flame,
  Zap,
  BookOpen,
  Eye
} from "lucide-react";
import { CompetitorKeywordRanking } from "../../types";
import { StrategicCompetitorNote } from "./RowStrategicNotepad";

interface StrategicNotesDrawerPanelProps {
  isOpen: boolean;
  onClose: () => void;
  rankings: CompetitorKeywordRanking[];
  notes: Record<string, StrategicCompetitorNote>;
  onSaveNote: (id: string, text: string, tags?: string[]) => void;
  onDeleteNote: (id: string) => void;
  onJumpToRow: (id: string) => void;
  userName?: string;
  userDomain?: string;
}

const STRATEGIC_QUICK_SNIPPETS = [
  { label: "⚡ Mobil Hız Fırsatı", snippet: "Rakibin mobil açılış hızı yavaş (LCP > 3.0s). Cloudflare Edge CDN ve optimize görsel yapımızla bu kelimede kolayca öne geçebiliriz." },
  { label: "📝 SSS & Şema Boşluğu", snippet: "Rakip sayfada FAQ Schema ve detaylı teknik açıklamalar eksik. Sayfamıza yapılandırılmış veri ve zengin SSS ekleyerek öne çıkalım." },
  { label: "🔗 Backlink Zayıflığı", snippet: "Bu URL'e gelen referans domain sayısı düşük (< 5 domain). Güçlü bir otorite backlinki ile ilk 3 pozisyon hedeflenebilir." },
  { label: "💰 Fiyat Şeffaflığı", snippet: "Rakip fiyatları gizli tutuyor. Başlıkta 'Şeffaf Fiyat Garantisi' vurgusu yaparak tıklama oranını (CTR) %35 artırabiliriz." },
  { label: "🎯 Ticari Arama Niyeti", snippet: "Kullanıcılar doğrudan teklif ve çözüm arıyor. İletişim formunu ve WhatsApp hızlı arama butonunu sayfanın ilk ekranına sabitleyelim." }
];

const PRESET_TAGS = [
  { id: "🚨 Kritik Rakip", label: "🚨 Kritik Rakip", color: "bg-rose-500/20 text-rose-300 border-rose-500/40" },
  { id: "⚡ Hızlı Kazanım", label: "⚡ Hızlı Kazanım", color: "bg-amber-500/20 text-amber-300 border-amber-500/40" },
  { id: "📝 İçerik Boşluğu", label: "📝 İçerik Boşluğu", color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40" },
  { id: "👀 İzlemede", label: "👀 İzlemede", color: "bg-slate-500/20 text-slate-300 border-slate-500/40" },
  { id: "✅ Tamamlandı", label: "✅ Tamamlandı", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" }
];

// Kanban stage definition for drag-and-drop workflow
interface KanbanColumnDef {
  id: string;
  title: string;
  tag: string;
  colorClass: string;
  badgeClass: string;
  dropBorderClass: string;
  icon: React.ReactNode;
}

const KANBAN_COLUMNS: KanbanColumnDef[] = [
  {
    id: "critical",
    title: "Kritik Eylem",
    tag: "🚨 Kritik Rakip",
    colorClass: "border-rose-500/30 bg-rose-950/20",
    badgeClass: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    dropBorderClass: "ring-2 ring-rose-400 border-rose-400 bg-rose-950/40",
    icon: <Flame className="w-3.5 h-3.5 text-rose-400" />
  },
  {
    id: "quick_win",
    title: "Hızlı Kazanım",
    tag: "⚡ Hızlı Kazanım",
    colorClass: "border-amber-500/30 bg-amber-950/20",
    badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    dropBorderClass: "ring-2 ring-amber-400 border-amber-400 bg-amber-950/40",
    icon: <Zap className="w-3.5 h-3.5 text-amber-400" />
  },
  {
    id: "content_gap",
    title: "İçerik & Şema",
    tag: "📝 İçerik Boşluğu",
    colorClass: "border-indigo-500/30 bg-indigo-950/20",
    badgeClass: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
    dropBorderClass: "ring-2 ring-indigo-400 border-indigo-400 bg-indigo-950/40",
    icon: <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
  },
  {
    id: "watching",
    title: "İzlemede",
    tag: "👀 İzlemede",
    colorClass: "border-slate-500/30 bg-slate-900/40",
    badgeClass: "bg-slate-500/20 text-slate-300 border-slate-500/40",
    dropBorderClass: "ring-2 ring-slate-400 border-slate-400 bg-slate-800/60",
    icon: <Eye className="w-3.5 h-3.5 text-slate-300" />
  },
  {
    id: "completed",
    title: "Tamamlandı",
    tag: "✅ Tamamlandı",
    colorClass: "border-emerald-500/30 bg-emerald-950/20",
    badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    dropBorderClass: "ring-2 ring-emerald-400 border-emerald-400 bg-emerald-950/40",
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
  }
];

const LOCAL_STORAGE_CUSTOM_ORDER_KEY = "seo_strategic_notes_custom_order_v1";

export const StrategicNotesDrawerPanel: React.FC<StrategicNotesDrawerPanelProps> = ({
  isOpen,
  onClose,
  rankings,
  notes,
  onSaveNote,
  onDeleteNote,
  onJumpToRow,
  userName = "Siteniz",
  userDomain = "example.com"
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState<"all_with_notes" | "all_rows" | "tagged">("all_with_notes");
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [draftText, setDraftText] = useState("");
  const [draftTags, setDraftTags] = useState<string[]>([]);
  const [copiedAllToast, setCopiedAllToast] = useState(false);

  // View Layout: List (with drag reordering) or Kanban Board (drag between columns)
  const [viewLayout, setViewLayout] = useState<"list" | "kanban">("list");
  // Panel width expand toggle
  const [isExpanded, setIsExpanded] = useState(false);

  // Drag and Drop States
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);
  const [dropPlacement, setDropPlacement] = useState<"above" | "below" | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);
  const [dragNotification, setDragNotification] = useState<string | null>(null);

  // Custom ordered list of item IDs
  const [customOrder, setCustomOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CUSTOM_ORDER_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Failed to load saved strategic notes order", e);
    }
    return [];
  });

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Sync customOrder when rankings change (add missing IDs to the end)
  useEffect(() => {
    const rankingIds = rankings.map((r) => r.id);
    setCustomOrder((prev) => {
      const existingInRankings = prev.filter((id) => rankingIds.includes(id));
      const missing = rankingIds.filter((id) => !existingInRankings.includes(id));
      const combined = [...existingInRankings, ...missing];
      return combined;
    });
  }, [rankings]);

  // Persist custom order
  const saveCustomOrder = (newOrder: string[]) => {
    setCustomOrder(newOrder);
    try {
      localStorage.setItem(LOCAL_STORAGE_CUSTOM_ORDER_KEY, JSON.stringify(newOrder));
    } catch (e) {
      console.warn("Failed to persist custom order", e);
    }
  };

  const handleResetOrder = () => {
    const defaultIds = rankings.map((r) => r.id);
    saveCustomOrder(defaultIds);
    showToastNotification("Öncelik sıralaması varsayılan tablo düzenine sıfırlandı.");
  };

  const showToastNotification = (msg: string) => {
    setDragNotification(msg);
    setTimeout(() => {
      setDragNotification(null);
    }, 3000);
  };

  // Statistics
  const totalNotesCount = useMemo(() => Object.keys(notes).length, [notes]);
  const totalKeywordsCount = rankings.length;

  // Ordered list of ranking items based on customOrder
  const orderedRankings = useMemo(() => {
    const rankingMap = new Map<string, CompetitorKeywordRanking>();
    rankings.forEach((r) => rankingMap.set(r.id, r));

    const result: CompetitorKeywordRanking[] = [];
    customOrder.forEach((id) => {
      const item = rankingMap.get(id);
      if (item) {
        result.push(item);
        rankingMap.delete(id);
      }
    });
    // Add any remaining
    rankingMap.forEach((item) => result.push(item));
    return result;
  }, [rankings, customOrder]);

  // Filtered list of ranking rows
  const filteredList = useMemo(() => {
    return orderedRankings.filter((item) => {
      const note = notes[item.id];
      const hasNote = Boolean(note && note.text && note.text.trim().length > 0);

      if (filterMode === "all_with_notes" && !hasNote) {
        return false;
      }

      if (selectedTagFilter) {
        if (!note || !note.tags || !note.tags.includes(selectedTagFilter)) {
          return false;
        }
      }

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const keywordMatch = item.keyword.toLowerCase().includes(query);
        const competitorMatch = (item as any).competitorName?.toLowerCase().includes(query);
        const noteMatch = note?.text?.toLowerCase().includes(query);
        const tagMatch = note?.tags?.some((t) => t.toLowerCase().includes(query));
        return keywordMatch || competitorMatch || noteMatch || tagMatch;
      }

      return true;
    });
  }, [orderedRankings, notes, filterMode, selectedTagFilter, searchTerm]);

  // Group items by Kanban column
  const kanbanColumnItems = useMemo(() => {
    const map: Record<string, CompetitorKeywordRanking[]> = {
      critical: [],
      quick_win: [],
      content_gap: [],
      watching: [],
      completed: []
    };

    filteredList.forEach((item) => {
      const note = notes[item.id];
      const tags = note?.tags || [];

      if (tags.some((t) => t.includes("Kritik"))) {
        map.critical.push(item);
      } else if (tags.some((t) => t.includes("Hızlı") || t.includes("Kazanım"))) {
        map.quick_win.push(item);
      } else if (tags.some((t) => t.includes("İçerik") || t.includes("Şema"))) {
        map.content_gap.push(item);
      } else if (tags.some((t) => t.includes("Tamamlandı") || t.includes("Uygulandı"))) {
        map.completed.push(item);
      } else {
        // Defaults to watching or if has 'İzlemede'
        map.watching.push(item);
      }
    });

    return map;
  }, [filteredList, notes]);

  // Handle start editing a note in the drawer
  const handleStartEdit = (id: string) => {
    setEditingNoteId(id);
    const existing = notes[id];
    setDraftText(existing ? existing.text : "");
    setDraftTags(existing && existing.tags ? [...existing.tags] : []);
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setDraftText("");
    setDraftTags([]);
  };

  const handleSaveDrawerNote = (id: string) => {
    if (!draftText.trim()) return;
    onSaveNote(id, draftText.trim(), draftTags);
    setEditingNoteId(null);
    setDraftText("");
    setDraftTags([]);
  };

  const toggleDraftTag = (tagLabel: string) => {
    setDraftTags((prev) =>
      prev.includes(tagLabel) ? prev.filter((t) => t !== tagLabel) : [...prev, tagLabel]
    );
  };

  // Copy all notes to clipboard in formatted Markdown
  const handleCopyAllNotes = () => {
    const lines: string[] = [
      `# 📋 Stratejik Notlar Raporu (${userDomain})`,
      `*Tarih: ${new Date().toLocaleDateString("tr-TR")} | Toplam Not: ${totalNotesCount}*`,
      ""
    ];

    orderedRankings.forEach((item, index) => {
      const note = notes[item.id];
      if (note && note.text.trim()) {
        lines.push(`### [Öncelik #${index + 1}] 🔑 ${item.keyword}`);
        lines.push(`- **Siteniz Sırası:** ${item.userRank ? `#${item.userRank}` : "İlk 100 Dışı"}`);
        lines.push(`- **Lider Rakip Sırası:** ${item.comp1Rank ? `#${item.comp1Rank}` : "—"}`);
        if (note.tags && note.tags.length > 0) {
          lines.push(`- **Etiketler:** ${note.tags.join(", ")}`);
        }
        lines.push(`- **Son Güncelleme:** ${note.updatedAt}`);
        lines.push(`- **Stratejik Not:** ${note.text}`);
        lines.push("");
      }
    });

    navigator.clipboard.writeText(lines.join("\n"));
    setCopiedAllToast(true);
    setTimeout(() => setCopiedAllToast(false), 3000);
  };

  // Download all notes as JSON
  const handleDownloadNotesJson = () => {
    const exportData = {
      domain: userDomain,
      exportedAt: new Date().toISOString(),
      totalNotes: totalNotesCount,
      notes: (Object.entries(notes) as [string, StrategicCompetitorNote][]).map(([id, n]) => {
        const row = rankings.find((r) => r.id === id);
        const orderIdx = customOrder.indexOf(id);
        return {
          priorityRank: orderIdx !== -1 ? orderIdx + 1 : null,
          rowId: id,
          keyword: row?.keyword || "Bilinmiyor",
          userRank: row?.userRank,
          comp1Rank: row?.comp1Rank,
          note: n.text,
          tags: n.tags || [],
          updatedAt: n.updatedAt
        };
      })
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stratejik-notlar-${userDomain}-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ==================== DRAG & DROP HANDLERS ====================

  // 1. Drag Start: Store dragged ID in state & dataTransfer
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItemId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.setData("application/strategic-note-id", id);
  };

  // 2. Drag Over List Card: Calculate whether mouse is in top half or bottom half
  const handleCardDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    if (!draggedItemId || draggedItemId === targetId) {
      setDragOverItemId(null);
      setDropPlacement(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const placement = e.clientY < midY ? "above" : "below";

    setDragOverItemId(targetId);
    setDropPlacement(placement);
  };

  // 3. Drop on List Card: Reorder cards in customOrder
  const handleCardDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItemId || draggedItemId === targetId) {
      resetDragState();
      return;
    }

    const currentOrder = [...customOrder];
    const sourceIdx = currentOrder.indexOf(draggedItemId);
    const targetIdx = currentOrder.indexOf(targetId);

    if (sourceIdx === -1 || targetIdx === -1) {
      resetDragState();
      return;
    }

    // Remove dragged item from order
    currentOrder.splice(sourceIdx, 1);

    // Calculate insertion index
    const newTargetIdx = currentOrder.indexOf(targetId);
    const insertionIdx = dropPlacement === "below" ? newTargetIdx + 1 : newTargetIdx;

    currentOrder.splice(insertionIdx, 0, draggedItemId);
    saveCustomOrder(currentOrder);

    const draggedItem = rankings.find((r) => r.id === draggedItemId);
    const kw = draggedItem ? `"${draggedItem.keyword}"` : "Not";
    showToastNotification(`✨ ${kw} yeni öncelik sırasına (#${insertionIdx + 1}) taşındı.`);

    resetDragState();
  };

  // 4. Drag Over Kanban Column: Highlight the column
  const handleColumnDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverColumnId !== columnId) {
      setDragOverColumnId(columnId);
    }
  };

  // 5. Drop on Kanban Column: Update note tag to match column's stage
  const handleColumnDrop = (e: React.DragEvent, columnDef: KanbanColumnDef) => {
    e.preventDefault();
    const noteId = draggedItemId || e.dataTransfer.getData("application/strategic-note-id");

    if (!noteId) {
      resetDragState();
      return;
    }

    const currentNote = notes[noteId];
    const targetTag = columnDef.tag;

    // Filter out previous stage tags and insert new stage tag
    const allStageTags = KANBAN_COLUMNS.map((c) => c.tag);
    const existingTags = currentNote?.tags || [];
    const filteredOtherTags = existingTags.filter((t) => !allStageTags.includes(t));
    const newTags = [targetTag, ...filteredOtherTags];

    // If note text doesn't exist yet, provide a starter draft
    const textToSave = currentNote?.text?.trim()
      ? currentNote.text
      : `Bu kelime ${columnDef.title} aşamasına taşındı.`;

    onSaveNote(noteId, textToSave, newTags);

    const item = rankings.find((r) => r.id === noteId);
    showToastNotification(`🏷️ "${item?.keyword || 'Not'}" -> ${columnDef.title} aşamasına taşındı.`);

    resetDragState();
  };

  const resetDragState = () => {
    setDraggedItemId(null);
    setDragOverItemId(null);
    setDropPlacement(null);
    setDragOverColumnId(null);
  };

  if (!isOpen) return null;

  return (
    <div
      id="strategic-notes-drawer-container"
      data-testid="strategic-notes-drawer-container"
      className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200"
      aria-labelledby="strategic-notes-drawer-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Dark Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6">
        <div
          className={`w-screen ${
            isExpanded ? "max-w-5xl" : "max-w-xl"
          } bg-slate-900 text-slate-100 shadow-2xl border-l border-slate-800 flex flex-col h-full transform transition-all ease-in-out duration-300`}
        >
          {/* 1. Header */}
          <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center shadow-inner shrink-0">
                <StickyNote className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2
                    id="strategic-notes-drawer-title"
                    className="text-base font-black text-white tracking-tight flex items-center gap-2"
                  >
                    Stratejik Notlar & Öncelik Paneli
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-black">
                    {totalNotesCount} Not
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold flex items-center gap-1">
                    <Move className="w-3 h-3 text-indigo-400" />
                    Sürükle-Bırak Aktif
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Notları sürükleyip bırakarak öncelik sırasını belirleyin veya durum aşamaları arasında taşıyın.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Expand / Collapse Panel Toggle */}
              <button
                type="button"
                id="btn-toggle-expand-notes-drawer"
                data-testid="btn-toggle-expand-notes-drawer"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors cursor-pointer hidden sm:flex items-center justify-center"
                title={isExpanded ? "Normal Genişliğe Dön" : "Geniş Görünüm (Kanban için önerilir)"}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                type="button"
                id="btn-close-strategic-notes-drawer"
                data-testid="btn-close-strategic-notes-drawer"
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                title="Paneli Kapat (Esc)"
                aria-label="Paneli Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Toast Notification Banner for Drag & Drop Actions */}
          {dragNotification && (
            <div className="px-4 py-2 bg-gradient-to-r from-amber-500/20 via-indigo-500/20 to-amber-500/20 border-b border-amber-500/30 text-amber-200 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2 duration-150">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">{dragNotification}</span>
            </div>
          )}

          {/* 2. Action Toolbar & View Mode Selectors */}
          <div className="p-4 border-b border-slate-800 bg-slate-950/50 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              {/* View Mode: Priority List vs Kanban Board */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  id="tab-view-layout-list"
                  data-testid="tab-view-layout-list"
                  onClick={() => setViewLayout("list")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewLayout === "list"
                      ? "bg-amber-400 text-slate-950 shadow-md font-black"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="Kartları dikeyde sürükleyip bırakarak öncelik sırasını düzenleyin"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                  <span>Öncelik Sıralaması</span>
                </button>

                <button
                  type="button"
                  id="tab-view-layout-kanban"
                  data-testid="tab-view-layout-kanban"
                  onClick={() => {
                    setViewLayout("kanban");
                    setIsExpanded(true); // Auto-expand for comfortable Kanban columns
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewLayout === "kanban"
                      ? "bg-indigo-600 text-white shadow-md font-black"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="Notları sütunlar arasında sürükleyip bırakarak durumunu değiştirin"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Durum Panosu (Kanban)</span>
                </button>
              </div>

              {/* Reset Order & Export Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {viewLayout === "list" && (
                  <button
                    type="button"
                    id="btn-reset-strategic-notes-order"
                    data-testid="btn-reset-strategic-notes-order"
                    onClick={handleResetOrder}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Özelleştirilmiş öncelik sıralamasını varsayılan tablo sırasına sıfırlayın"
                  >
                    <RotateCcw className="w-3 h-3 text-slate-400" />
                    <span>Sırayı Sıfırla</span>
                  </button>
                )}

                <button
                  type="button"
                  id="btn-copy-all-notes"
                  data-testid="btn-copy-all-notes"
                  onClick={handleCopyAllNotes}
                  disabled={totalNotesCount === 0}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-amber-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Tüm notları öncelik sırasıyla Markdown formatında kopyalayın"
                >
                  {copiedAllToast ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Kopyalandı!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Kopyala</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  id="btn-download-notes-json"
                  data-testid="btn-download-notes-json"
                  onClick={handleDownloadNotesJson}
                  disabled={totalNotesCount === 0}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Notları JSON formatında indirin"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>İndir</span>
                </button>
              </div>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1">
              <div className="sm:col-span-6 flex items-center gap-1.5">
                <button
                  type="button"
                  id="tab-filter-with-notes"
                  data-testid="tab-filter-with-notes"
                  onClick={() => setFilterMode("all_with_notes")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filterMode === "all_with_notes"
                      ? "bg-amber-400 text-slate-950 shadow-md font-black"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  Sadece Not Olanlar ({totalNotesCount})
                </button>
                <button
                  type="button"
                  id="tab-filter-all-rows"
                  data-testid="tab-filter-all-rows"
                  onClick={() => setFilterMode("all_rows")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filterMode === "all_rows"
                      ? "bg-indigo-600 text-white shadow-md font-black"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  Tüm Kelimeler ({totalKeywordsCount})
                </button>
              </div>

              {/* Search Box */}
              <div className="sm:col-span-6 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  id="search-notes-drawer-input"
                  data-testid="search-notes-drawer-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Kelime, rakip veya not içeriğinde ara..."
                  className="w-full pl-9 pr-8 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Tag Filter Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Etiket Filtresi:</span>
              <button
                type="button"
                onClick={() => setSelectedTagFilter(null)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                  selectedTagFilter === null
                    ? "bg-amber-400 text-slate-950 border-amber-300 font-black"
                    : "bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white"
                }`}
              >
                Hepsi
              </button>
              {PRESET_TAGS.map((t) => {
                const isSelected = selectedTagFilter === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTagFilter(isSelected ? null : t.id)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-amber-400 text-slate-950 border-amber-300 font-black"
                        : t.color
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Main Content: List View OR Kanban Board */}
          <div className="flex-1 overflow-y-auto p-4">
            {filteredList.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/40 rounded-3xl border border-slate-800/60 my-6">
                <StickyNote className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-300 mb-1">
                  {filterMode === "all_with_notes"
                    ? "Henüz Not Eklenmiş Satır Bulunamadı"
                    : "Kriterlere Uygun Satır Bulunamadı"}
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                  {filterMode === "all_with_notes"
                    ? "'Tüm Kelimeler' sekmesine geçerek satırlara hemen not ekleyebilir veya tablodan not oluşturabilirsiniz."
                    : "Arama filtresini temizleyerek tüm kelimeleri listeleyebilirsiniz."}
                </p>
                {filterMode === "all_with_notes" && (
                  <button
                    type="button"
                    onClick={() => setFilterMode("all_rows")}
                    className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-colors cursor-pointer"
                  >
                    Tüm Kelimeleri Göster & Not Ekle
                  </button>
                )}
              </div>
            ) : viewLayout === "list" ? (
              /* ==================== LIST VIEW (DRAG TO REORDER) ==================== */
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1 pb-1">
                  <span className="flex items-center gap-1.5 text-[11px]">
                    <GripVertical className="w-3.5 h-3.5 text-amber-400" />
                    <span>Öncelik sıralamasını değiştirmek için kartları tutamaçtan <strong>sürükleyip bırakın</strong>.</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    {filteredList.length} Öğe
                  </span>
                </div>

                {filteredList.map((item, index) => {
                  const note = notes[item.id];
                  const isEditing = editingNoteId === item.id;
                  const hasNote = Boolean(note && note.text && note.text.trim().length > 0);
                  const isDraggingThis = draggedItemId === item.id;
                  const isOverThis = dragOverItemId === item.id;

                  return (
                    <div
                      key={item.id}
                      id={`drawer-note-card-${item.id}`}
                      data-testid={`drawer-note-card-${item.id}`}
                      draggable={!isEditing}
                      onDragStart={(e) => handleDragStart(e, item.id)}
                      onDragOver={(e) => handleCardDragOver(e, item.id)}
                      onDrop={(e) => handleCardDrop(e, item.id)}
                      onDragEnd={resetDragState}
                      className={`relative p-4 rounded-2xl border transition-all select-none ${
                        isDraggingThis
                          ? "opacity-40 border-dashed border-amber-400 bg-amber-950/20 scale-[0.99]"
                          : isOverThis && dropPlacement === "above"
                          ? "border-t-4 border-t-amber-400 bg-slate-900/90 shadow-xl"
                          : isOverThis && dropPlacement === "below"
                          ? "border-b-4 border-b-amber-400 bg-slate-900/90 shadow-xl"
                          : hasNote
                          ? "bg-slate-950/70 border-slate-800 hover:border-slate-700"
                          : "bg-slate-900/40 border-slate-800/40 border-dashed"
                      }`}
                    >
                      {/* Drag Handle & Priority Badge */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="cursor-grab active:cursor-grabbing p-1 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-amber-400 transition-colors shrink-0"
                            title="Öncelik sırasını değiştirmek için sürükleyin"
                          >
                            <GripVertical className="w-4 h-4" />
                          </div>

                          <span className="px-2 py-0.5 rounded-lg bg-amber-400/10 text-amber-300 border border-amber-400/30 text-[10px] font-mono font-black shrink-0">
                            #{index + 1}
                          </span>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-xs font-black text-white truncate max-w-[200px]">
                                {item.keyword}
                              </h4>
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                                KD: {item.difficulty}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400">
                                {item.monthlyVolume}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                              <span>
                                {userName}:{" "}
                                <strong
                                  className={
                                    item.userRank && item.userRank <= 3
                                      ? "text-emerald-400"
                                      : "text-amber-400"
                                  }
                                >
                                  {item.userRank ? `#${item.userRank}` : "—"}
                                </strong>
                              </span>
                              <span>•</span>
                              <span>
                                Rakip ({(item as any).competitorName || "Lider"}):{" "}
                                <strong className="text-indigo-300">
                                  {item.comp1Rank ? `#${item.comp1Rank}` : "—"}
                                </strong>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Jump to row in table */}
                        <button
                          type="button"
                          id={`btn-jump-to-row-${item.id}`}
                          data-testid={`btn-jump-to-row-${item.id}`}
                          onClick={() => onJumpToRow(item.id)}
                          className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-amber-300 border border-slate-700 hover:border-amber-400 text-[11px] font-bold flex items-center gap-1 transition-all shrink-0 cursor-pointer shadow-xs"
                          title={`Bu satıra tabloda odaklan ve göster: "${item.keyword}"`}
                        >
                          <span>Tabloda Göster</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Active Note Content */}
                      {hasNote && !isEditing && (
                        <div className="space-y-2 mt-2 pt-2 border-t border-slate-800/80">
                          {note.tags && note.tags.length > 0 && (
                            <div className="flex items-center gap-1 flex-wrap">
                              {note.tags.map((t, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 leading-relaxed font-normal whitespace-pre-wrap">
                            {note.text}
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-1 text-[10px] text-slate-500">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{note.updatedAt}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                id={`btn-drawer-edit-note-${item.id}`}
                                data-testid={`btn-drawer-edit-note-${item.id}`}
                                onClick={() => handleStartEdit(item.id)}
                                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                title="Notu düzenle"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Düzenle</span>
                              </button>

                              <button
                                type="button"
                                id={`btn-drawer-delete-note-${item.id}`}
                                data-testid={`btn-drawer-delete-note-${item.id}`}
                                onClick={() => onDeleteNote(item.id)}
                                className="p-1 rounded-lg bg-slate-800 hover:bg-rose-950/80 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                                title="Notu sil"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Not Yet Added State */}
                      {!hasNote && !isEditing && (
                        <div className="mt-2 pt-2 border-t border-slate-800/50 flex items-center justify-between">
                          <span className="text-[11px] text-slate-500 italic">
                            Bu kelimeye ait henüz stratejik not bulunmuyor.
                          </span>
                          <button
                            type="button"
                            id={`btn-drawer-add-note-${item.id}`}
                            data-testid={`btn-drawer-add-note-${item.id}`}
                            onClick={() => handleStartEdit(item.id)}
                            className="px-2.5 py-1 rounded-lg bg-amber-400/20 hover:bg-amber-400 text-amber-300 hover:text-slate-950 border border-amber-400/40 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Not Ekle</span>
                          </button>
                        </div>
                      )}

                      {/* Inline Editor */}
                      {isEditing && (
                        <div className="mt-3 pt-3 border-t border-amber-500/40 space-y-3 animate-in fade-in">
                          <div>
                            <span className="text-[10px] font-bold text-amber-300 block mb-1">
                              ⚡ Hazır Stratejik Şablon Ekle:
                            </span>
                            <div className="flex items-center gap-1 flex-wrap">
                              {STRATEGIC_QUICK_SNIPPETS.map((qs, qIdx) => (
                                <button
                                  key={qIdx}
                                  type="button"
                                  onClick={() => {
                                    setDraftText((prev) =>
                                      prev ? `${prev}\n\n${qs.snippet}` : qs.snippet
                                    );
                                  }}
                                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-medium text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                                  title={qs.snippet}
                                >
                                  {qs.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          <textarea
                            id={`drawer-note-textarea-${item.id}`}
                            data-testid={`drawer-note-textarea-${item.id}`}
                            value={draftText}
                            onChange={(e) => setDraftText(e.target.value)}
                            placeholder="Bu rakip ve anahtar kelime için stratejik SEO notunuzu yazın..."
                            rows={3}
                            className="w-full p-2.5 bg-slate-900 border border-amber-400/50 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors"
                            autoFocus
                          />

                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold text-slate-400">Etiketler:</span>
                            {PRESET_TAGS.map((tag) => {
                              const isSelected = draftTags.includes(tag.id);
                              return (
                                <button
                                  key={tag.id}
                                  type="button"
                                  onClick={() => toggleDraftTag(tag.id)}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                                    isSelected
                                      ? "bg-amber-400 text-slate-950 border-amber-300 font-black"
                                      : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
                                  }`}
                                >
                                  {tag.label}
                                </button>
                              );
                            })}
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                            >
                              İptal
                            </button>
                            <button
                              type="button"
                              id={`btn-drawer-save-note-${item.id}`}
                              data-testid={`btn-drawer-save-note-${item.id}`}
                              onClick={() => handleSaveDrawerNote(item.id)}
                              disabled={!draftText.trim()}
                              className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 text-xs font-black transition-colors cursor-pointer shadow-md"
                            >
                              Kaydet
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* ==================== KANBAN BOARD VIEW (DRAG BETWEEN COLUMNS) ==================== */
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1 pb-1">
                  <span className="flex items-center gap-1.5 text-[11px]">
                    <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Notları aşamalar arasında güncellemek için ilgili sütuna <strong>sürükleyip bırakın</strong>.</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 items-start">
                  {KANBAN_COLUMNS.map((col) => {
                    const colItems = kanbanColumnItems[col.id] || [];
                    const isOverColumn = dragOverColumnId === col.id;

                    return (
                      <div
                        key={col.id}
                        id={`kanban-col-${col.id}`}
                        data-testid={`kanban-col-${col.id}`}
                        onDragOver={(e) => handleColumnDragOver(e, col.id)}
                        onDrop={(e) => handleColumnDrop(e, col)}
                        className={`rounded-2xl border p-3 flex flex-col min-h-[360px] transition-all ${
                          isOverColumn
                            ? col.dropBorderClass
                            : `${col.colorClass} border-slate-800/80`
                        }`}
                      >
                        {/* Column Header */}
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800/60 mb-2.5">
                          <div className="flex items-center gap-1.5">
                            {col.icon}
                            <h4 className="text-xs font-black text-slate-200">{col.title}</h4>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${col.badgeClass}`}>
                            {colItems.length}
                          </span>
                        </div>

                        {/* Drop Zone hint when dragging */}
                        {draggedItemId && (
                          <div className={`p-2 mb-2 rounded-xl text-center text-[10px] font-bold border border-dashed transition-all ${
                            isOverColumn
                              ? "bg-amber-400/20 border-amber-400 text-amber-300"
                              : "bg-slate-900/40 border-slate-700/60 text-slate-400"
                          }`}>
                            {isOverColumn ? "✨ Bu aşamaya bırakın!" : "Buraya sürükleyin"}
                          </div>
                        )}

                        {/* Cards inside column */}
                        <div className="space-y-2.5 flex-1">
                          {colItems.length === 0 ? (
                            <div className="p-4 text-center text-slate-500 text-[11px] italic">
                              Bu aşamada not yok
                            </div>
                          ) : (
                            colItems.map((item) => {
                              const note = notes[item.id];
                              const isDraggingThis = draggedItemId === item.id;

                              return (
                                <div
                                  key={item.id}
                                  id={`kanban-card-${item.id}`}
                                  data-testid={`kanban-card-${item.id}`}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, item.id)}
                                  onDragEnd={resetDragState}
                                  className={`p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 shadow-sm cursor-grab active:cursor-grabbing transition-all select-none ${
                                    isDraggingThis
                                      ? "opacity-30 border-dashed border-amber-400 scale-95"
                                      : "hover:scale-[1.01]"
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-1 mb-1.5">
                                    <h5 className="text-xs font-black text-white truncate max-w-[140px]">
                                      {item.keyword}
                                    </h5>
                                    <button
                                      type="button"
                                      onClick={() => onJumpToRow(item.id)}
                                      className="text-slate-500 hover:text-amber-400 p-0.5 transition-colors cursor-pointer"
                                      title="Tabloda göster"
                                    >
                                      <ArrowRight className="w-3 h-3" />
                                    </button>
                                  </div>

                                  <div className="text-[10px] text-slate-400 flex items-center justify-between mb-2">
                                    <span>
                                      Sıra:{" "}
                                      <strong className="text-amber-400">
                                        {item.userRank ? `#${item.userRank}` : "—"}
                                      </strong>
                                    </span>
                                    <span>KD: {item.difficulty}</span>
                                  </div>

                                  {note && note.text && (
                                    <p className="text-[11px] text-slate-300 line-clamp-3 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 mb-2">
                                      {note.text}
                                    </p>
                                  )}

                                  <div className="flex items-center justify-between pt-1 text-[9px] text-slate-500">
                                    <span className="flex items-center gap-1">
                                      <GripVertical className="w-3 h-3 text-slate-600" />
                                      Sürükle
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleStartEdit(item.id)}
                                      className="text-amber-300 hover:underline font-bold cursor-pointer"
                                    >
                                      Düzenle
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 4. Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
            <div className="flex items-center gap-1.5 text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Sürükle-bırak öncelik sıralaması tarayıcı yerel belleğinde kalıcı saklanır.</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors cursor-pointer"
            >
              Paneli Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
