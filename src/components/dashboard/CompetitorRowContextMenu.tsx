import React, { useEffect, useRef } from "react";
import { 
  Pin, 
  PinOff, 
  Pencil, 
  Copy, 
  Trash2, 
  StickyNote, 
  CheckSquare, 
  Square,
  Columns3,
  ExternalLink,
  Sparkles
} from "lucide-react";
import { CompetitorKeywordRanking } from "../../types";

export interface CompetitorRowContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number } | null;
  ranking: CompetitorKeywordRanking | null;
  isPinned: boolean;
  onTogglePin: (rowId: string) => void;
  onEdit: (ranking: CompetitorKeywordRanking) => void;
  onDuplicate: (ranking: CompetitorKeywordRanking) => void;
  onDelete: (rowId: string, keyword: string) => void;
  onToggleNote: (rowId: string) => void;
  hasNote: boolean;
  isSelected: boolean;
  onToggleSelect: (rowId: string) => void;
  onClose: () => void;
  onToggleCompareSelectedView?: () => void;
}

export const CompetitorRowContextMenu: React.FC<CompetitorRowContextMenuProps> = ({
  isOpen,
  position,
  ranking,
  isPinned,
  onTogglePin,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleNote,
  hasNote,
  isSelected,
  onToggleSelect,
  onClose,
  onToggleCompareSelectedView
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on Escape or click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleScroll = () => {
      onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !position || !ranking) return null;

  // Viewport boundaries safeguard
  const menuWidth = 260;
  const menuHeight = 360;
  const windowWidth = typeof window !== "undefined" ? window.innerWidth : 1200;
  const windowHeight = typeof window !== "undefined" ? window.innerHeight : 800;

  let left = position.x;
  let top = position.y;

  if (left + menuWidth > windowWidth - 16) {
    left = Math.max(16, windowWidth - menuWidth - 16);
  }
  if (top + menuHeight > windowHeight - 16) {
    top = Math.max(16, windowHeight - menuHeight - 16);
  }

  const competitorDisplay = (ranking as any).competitorName || ranking.comp1Domain || ranking.keyword;

  return (
    <div
      ref={menuRef}
      id="competitor-row-context-menu"
      data-testid="competitor-row-context-menu"
      style={{ left: `${left}px`, top: `${top}px` }}
      onClick={(e) => e.stopPropagation()}
      className="fixed z-[9999] w-64 rounded-2xl bg-slate-900/98 backdrop-blur-md border border-slate-700/80 shadow-2xl shadow-slate-950/80 text-white p-1.5 text-xs select-none animate-in fade-in zoom-in-95 duration-150"
      role="menu"
      aria-label={`"${ranking.keyword}" için satır bağlam menüsü`}
    >
      {/* Header Info */}
      <div className="px-3 py-2 border-b border-slate-800/90 mb-1">
        <div className="flex items-center justify-between gap-1.5 mb-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
            Rakip Satır Eylemleri
          </span>
          {isPinned && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-black font-mono bg-amber-400 text-slate-950">
              <Pin className="w-2.5 h-2.5 fill-current" />
              SABİT
            </span>
          )}
        </div>
        <div className="font-bold text-slate-100 truncate text-xs flex items-center gap-1.5">
          <span className="truncate">{ranking.keyword || "Rakip Satırı"}</span>
        </div>
        {competitorDisplay && competitorDisplay !== ranking.keyword && (
          <div className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">
            {competitorDisplay}
          </div>
        )}
      </div>

      {/* Primary Action: Pin to Top / Unpin */}
      <div className="p-1 space-y-1">
        <button
          type="button"
          id="context-menu-pin-to-top"
          data-testid="context-menu-pin-to-top"
          data-action="pin-to-top"
          onClick={() => {
            onTogglePin(ranking.id);
            onClose();
          }}
          className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center gap-2.5 font-bold transition-all cursor-pointer group ${
            isPinned
              ? "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-400/40"
              : "hover:bg-indigo-600/90 text-slate-100 hover:text-white"
          }`}
          role="menuitem"
        >
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
            isPinned ? "bg-amber-400 text-slate-950" : "bg-indigo-500/30 text-indigo-300 group-hover:bg-white/20 group-hover:text-white"
          }`}>
            {isPinned ? (
              <PinOff className="w-3.5 h-3.5 stroke-[2.5]" />
            ) : (
              <Pin className="w-3.5 h-3.5 stroke-[2.5]" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-black text-xs">
                {isPinned ? "Sabitlemeyi Kaldır" : "Başa Sabitle (Pin to Top)"}
              </span>
              <span className="text-[9px] font-mono text-slate-400 group-hover:text-white/80">
                {isPinned ? "Unpin" : "Pin"}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 group-hover:text-slate-200 leading-tight">
              {isPinned ? "Normal sıralamaya geri döner" : "Analiz için daima en üstte tut"}
            </p>
          </div>
        </button>

        {/* Action: Select / Compare Selected Toggle */}
        <button
          type="button"
          id="context-menu-toggle-select"
          data-testid="context-menu-toggle-select"
          onClick={() => {
            onToggleSelect(ranking.id);
            onClose();
          }}
          className="w-full text-left px-2.5 py-1.5 rounded-xl flex items-center gap-2 text-slate-200 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          role="menuitem"
        >
          {isSelected ? (
            <CheckSquare className="w-4 h-4 text-indigo-400 shrink-0" />
          ) : (
            <Square className="w-4 h-4 text-slate-400 shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <span className="font-medium text-xs">
              {isSelected ? "Seçimi Kaldır" : "Seç (Compare Selected)"}
            </span>
          </div>
        </button>

        {/* Action: Toggle Strategic Note */}
        <button
          type="button"
          id="context-menu-toggle-note"
          data-testid="context-menu-toggle-note"
          onClick={() => {
            onToggleNote(ranking.id);
            onClose();
          }}
          className="w-full text-left px-2.5 py-1.5 rounded-xl flex items-center gap-2 text-slate-200 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          role="menuitem"
        >
          <StickyNote className={`w-4 h-4 shrink-0 ${hasNote ? "text-amber-400" : "text-slate-400"}`} />
          <div className="flex-1 min-w-0">
            <span className="font-medium text-xs">
              {hasNote ? "Stratejik Notu Gör / Düzenle" : "Stratejik Not Ekle"}
            </span>
          </div>
          {hasNote && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
        </button>

        {/* Action: Edit Row Inline */}
        <button
          type="button"
          id="context-menu-edit"
          data-testid="context-menu-edit"
          onClick={() => {
            onEdit(ranking);
            onClose();
          }}
          className="w-full text-left px-2.5 py-1.5 rounded-xl flex items-center gap-2 text-slate-200 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          role="menuitem"
        >
          <Pencil className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="font-medium text-xs">Satırı Düzenle</span>
          </div>
        </button>

        {/* Action: Duplicate Row */}
        <button
          type="button"
          id="context-menu-duplicate"
          data-testid="context-menu-duplicate"
          onClick={() => {
            onDuplicate(ranking);
            onClose();
          }}
          className="w-full text-left px-2.5 py-1.5 rounded-xl flex items-center gap-2 text-slate-200 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          role="menuitem"
        >
          <Copy className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="font-medium text-xs">Yeni Satıra Kopyala</span>
          </div>
        </button>
      </div>

      <div className="my-1 border-t border-slate-800" />

      {/* Destructive Action: Delete */}
      <div className="p-1">
        <button
          type="button"
          id="context-menu-delete"
          data-testid="context-menu-delete"
          onClick={() => {
            onDelete(ranking.id, ranking.keyword);
            onClose();
          }}
          className="w-full text-left px-2.5 py-1.5 rounded-xl flex items-center gap-2 text-rose-400 hover:text-white hover:bg-rose-600/80 transition-colors cursor-pointer"
          role="menuitem"
        >
          <Trash2 className="w-4 h-4 shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="font-bold text-xs">Satırı Sil</span>
          </div>
        </button>
      </div>
    </div>
  );
};
