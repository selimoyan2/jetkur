import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Columns3,
  Eye,
  EyeOff,
  GripVertical,
  RotateCcw,
  Check,
  X,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ArrowRight,
  Search,
  Sparkles,
  Layers,
  Info,
  ShieldCheck,
  CheckSquare,
  Square
} from "lucide-react";

export interface ColumnDefinition {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  category: "control" | "metric" | "competitor" | "action";
  canHide: boolean;
  defaultVisible: boolean;
  minWidth?: string;
}

export const TABLE_COLUMNS: ColumnDefinition[] = [
  {
    id: "drag",
    label: "Sıralama Tutamacı (#)",
    shortLabel: "Özel Sıra",
    description: "Satırları el ile sürükleyip bırakarak dikey sıralama",
    category: "control",
    canHide: true,
    defaultVisible: true,
    minWidth: "w-12"
  },
  {
    id: "select",
    label: "Toplu Seçim Kutucuğu",
    shortLabel: "Seçim",
    description: "Toplu işlem, Excel/CSV ve PDF raporu için satır seçimi",
    category: "control",
    canHide: true,
    defaultVisible: true,
    minWidth: "w-10"
  },
  {
    id: "keyword",
    label: "Anahtar Kelime & Arama Niyeti & KD",
    shortLabel: "Anahtar Kelime",
    description: "Hedef sorgu, arama niyeti (Ticari/Bilgi) ve SEO zorluk skoru (KD)",
    category: "metric",
    canHide: false,
    defaultVisible: true,
    minWidth: "min-w-[190px]"
  },
  {
    id: "volume",
    label: "Aylık Arama Hacmi (Search Volume)",
    shortLabel: "Arama Hacmi",
    description: "Google Türkiye son 30 gün ortalama arama sorgu sayısı",
    category: "metric",
    canHide: true,
    defaultVisible: true,
    minWidth: "min-w-[130px]"
  },
  {
    id: "userRank",
    label: "Sitenizin Sıralaması (Keyword Rank & PSI)",
    shortLabel: "Sitenizin Sırası",
    description: "Kendi sitenizin organik Google SERP pozisyonu ve Core Web Vitals",
    category: "metric",
    canHide: true,
    defaultVisible: true,
    minWidth: "min-w-[145px]"
  },
  {
    id: "goalAttainment",
    label: "Hedef Değer & Gelişim Sapması",
    shortLabel: "Hedef & Gelişim",
    description: "Hedeflenen Google sırasına göre yüzdesel başarım ve sapma izleme",
    category: "metric",
    canHide: true,
    defaultVisible: false,
    minWidth: "min-w-[170px]"
  },
  {
    id: "trendGrowth",
    label: "6 Aylık Trend Tahmini (d3.js Sparkline)",
    shortLabel: "6-Ay Trend",
    description: "Algoritmik 6 aylık organik büyüme ve SERP tırmanış eğrisi",
    category: "metric",
    canHide: true,
    defaultVisible: false,
    minWidth: "min-w-[210px]"
  },
  {
    id: "competitorName",
    label: "Lider Rakip Alan Adı (Competitor Name)",
    shortLabel: "Lider Rakip",
    description: "Sitenizle en doğrudan rekabet eden rakip domain ve mobil hızı",
    category: "competitor",
    canHide: true,
    defaultVisible: true,
    minWidth: "min-w-[140px]"
  },
  {
    id: "comp1Rank",
    label: "1. Rakip Sıralaması & PSI",
    shortLabel: "1. Rakip Sırası",
    description: "1. ana rakibinizin SERP konumu ve mobil hız değeri",
    category: "competitor",
    canHide: true,
    defaultVisible: true,
    minWidth: "min-w-[110px]"
  },
  {
    id: "comp2Rank",
    label: "2. Rakip Sıralaması & PSI",
    shortLabel: "2. Rakip Sırası",
    description: "2. ana rakibinizin SERP konumu ve mobil hız değeri",
    category: "competitor",
    canHide: true,
    defaultVisible: true,
    minWidth: "min-w-[110px]"
  },
  {
    id: "comp3Rank",
    label: "3. Rakip Sıralaması & PSI",
    shortLabel: "3. Rakip Sırası",
    description: "3. ana rakibinizin SERP konumu ve mobil hız değeri",
    category: "competitor",
    canHide: true,
    defaultVisible: true,
    minWidth: "min-w-[110px]"
  },
  {
    id: "gap",
    label: "Rank Gap (Pozisyon Farkı & Trafik Fırsatı)",
    shortLabel: "Rank Gap",
    description: "Siteniz ile lider rakip arasındaki net pozisyon farkı",
    category: "metric",
    canHide: true,
    defaultVisible: true,
    minWidth: "min-w-[125px]"
  },
  {
    id: "aiRecommendation",
    label: "Gemini Stratejik AI Eylemi",
    shortLabel: "Gemini AI Eylemi",
    description: "Gemini AI modeli tarafından üretilen eylem önerisi ve hızlı blog başlatıcı",
    category: "action",
    canHide: true,
    defaultVisible: true,
    minWidth: "min-w-[240px]"
  },
  {
    id: "actions",
    label: "Satır İçi İşlemler (Not / Düzenle / Kopyala / Sil)",
    shortLabel: "Satır İşlemleri",
    description: "Stratejik not ekleme, metrik düzenleme, kopyalama ve silme",
    category: "action",
    canHide: true,
    defaultVisible: true,
    minWidth: "min-w-[280px]"
  }
];

export const DEFAULT_COLUMN_ORDER: string[] = TABLE_COLUMNS.map((c) => c.id);

export function getDefaultColumnVisibility(isGoalTracking = false, isTrendActive = false): Record<string, boolean> {
  const map: Record<string, boolean> = {};
  TABLE_COLUMNS.forEach((col) => {
    if (col.id === "goalAttainment") {
      map[col.id] = isGoalTracking;
    } else if (col.id === "trendGrowth") {
      map[col.id] = isTrendActive;
    } else {
      map[col.id] = col.defaultVisible;
    }
  });
  return map;
}

export function loadSavedColumnConfig(userDomain: string, isGoalTracking = false, isTrendActive = false) {
  try {
    const rawOrder = localStorage.getItem(`seo_table_col_order_${userDomain || "default"}`);
    const rawVis = localStorage.getItem(`seo_table_col_vis_${userDomain || "default"}`);

    let order = DEFAULT_COLUMN_ORDER;
    if (rawOrder) {
      const parsed = JSON.parse(rawOrder);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure all known columns exist in order
        const validIds = new Set(TABLE_COLUMNS.map((c) => c.id));
        const filtered = parsed.filter((id: string) => validIds.has(id));
        const missing = DEFAULT_COLUMN_ORDER.filter((id) => !filtered.includes(id));
        order = [...filtered, ...missing];
      }
    }

    let visibility = getDefaultColumnVisibility(isGoalTracking, isTrendActive);
    if (rawVis) {
      const parsed = JSON.parse(rawVis);
      if (typeof parsed === "object" && parsed !== null) {
        visibility = { ...visibility, ...parsed };
        // Keyword must always remain visible
        visibility.keyword = true;
      }
    }

    return { order, visibility };
  } catch (_) {
    return {
      order: DEFAULT_COLUMN_ORDER,
      visibility: getDefaultColumnVisibility(isGoalTracking, isTrendActive)
    };
  }
}

export function saveColumnConfig(userDomain: string, order: string[], visibility: Record<string, boolean>) {
  try {
    localStorage.setItem(`seo_table_col_order_${userDomain || "default"}`, JSON.stringify(order));
    localStorage.setItem(`seo_table_col_vis_${userDomain || "default"}`, JSON.stringify(visibility));
  } catch (_) {}
}

// Preset configurations for fast one-click switching
export interface ColumnPreset {
  id: string;
  name: string;
  description: string;
  apply: (currentVisibility: Record<string, boolean>) => Record<string, boolean>;
}

export const COLUMN_PRESETS: ColumnPreset[] = [
  {
    id: "all",
    name: "Tüm Sütunlar (Tam Görünüm)",
    description: "Tüm 14 SEO metriği, rakip sütunları ve araçlar açık",
    apply: () => {
      const next: Record<string, boolean> = {};
      TABLE_COLUMNS.forEach((c) => {
        next[c.id] = true;
      });
      return next;
    }
  },
  {
    id: "standard",
    name: "Standart Görünüm (Varsayılan)",
    description: "En çok kullanılan temel SERP sıralama ve rakip metrikleri",
    apply: () => getDefaultColumnVisibility(false, false)
  },
  {
    id: "summary",
    name: "Özet Görünüm (Minimalist)",
    description: "Sadece Anahtar Kelime, Hacim, Siteniz, 1. Rakip ve Gap",
    apply: () => ({
      drag: true,
      select: true,
      keyword: true,
      volume: true,
      userRank: true,
      goalAttainment: false,
      trendGrowth: false,
      competitorName: true,
      comp1Rank: true,
      comp2Rank: false,
      comp3Rank: false,
      gap: true,
      aiRecommendation: false,
      actions: true
    })
  },
  {
    id: "competitors_only",
    name: "Yalnızca Rakipler (Pazar Kıyaslama)",
    description: "1., 2. ve 3. rakipler ile Rank Gap odaklı görünüm",
    apply: () => ({
      drag: true,
      select: true,
      keyword: true,
      volume: false,
      userRank: true,
      goalAttainment: false,
      trendGrowth: false,
      competitorName: true,
      comp1Rank: true,
      comp2Rank: true,
      comp3Rank: true,
      gap: true,
      aiRecommendation: false,
      actions: true
    })
  },
  {
    id: "action_focus",
    name: "AI & Aksiyon Odaklı",
    description: "Gemini tavsiyeleri, stratejik notlar ve satır aksiyonları",
    apply: () => ({
      drag: true,
      select: true,
      keyword: true,
      volume: true,
      userRank: true,
      goalAttainment: false,
      trendGrowth: false,
      competitorName: false,
      comp1Rank: true,
      comp2Rank: false,
      comp3Rank: false,
      gap: true,
      aiRecommendation: true,
      actions: true
    })
  }
];

// Dropdown component for instant column visibility toggle & reordering
interface TableColumnVisibilityDropdownProps {
  columnOrder: string[];
  columnVisibility: Record<string, boolean>;
  onToggleColumn: (colId: string) => void;
  onReorderColumns: (newOrder: string[]) => void;
  onApplyPreset: (presetId: string) => void;
  onResetToDefault: () => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenFullManager?: () => void;
}

export const TableColumnVisibilityDropdown: React.FC<TableColumnVisibilityDropdownProps> = ({
  columnOrder,
  columnVisibility,
  onToggleColumn,
  onReorderColumns,
  onApplyPreset,
  onResetToDefault,
  isOpen,
  onClose,
  onOpenFullManager
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [draggedColId, setDraggedColId] = useState<string | null>(null);
  const [dragOverColId, setDragOverColId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const columnMap = useMemo(() => {
    const map = new Map<string, ColumnDefinition>();
    TABLE_COLUMNS.forEach((c) => map.set(c.id, c));
    return map;
  }, []);

  const orderedColumns = useMemo(() => {
    return columnOrder
      .map((id) => columnMap.get(id))
      .filter((c): c is ColumnDefinition => c !== undefined);
  }, [columnOrder, columnMap]);

  const filteredColumns = useMemo(() => {
    if (!searchTerm.trim()) return orderedColumns;
    const term = searchTerm.toLowerCase();
    return orderedColumns.filter(
      (c) =>
        c.label.toLowerCase().includes(term) ||
        c.shortLabel.toLowerCase().includes(term) ||
        c.description.toLowerCase().includes(term)
    );
  }, [orderedColumns, searchTerm]);

  const visibleCount = useMemo(() => {
    return columnOrder.filter((id) => columnVisibility[id] !== false).length;
  }, [columnOrder, columnVisibility]);

  const totalCount = TABLE_COLUMNS.length;

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    setDraggedColId(id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedColId && draggedColId !== id) {
      setDragOverColId(id);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData("text/plain") || draggedColId;
    if (!sourceId || sourceId === targetId) {
      setDraggedColId(null);
      setDragOverColId(null);
      return;
    }

    const newOrder = [...columnOrder];
    const sourceIdx = newOrder.indexOf(sourceId);
    const targetIdx = newOrder.indexOf(targetId);

    if (sourceIdx !== -1 && targetIdx !== -1) {
      newOrder.splice(sourceIdx, 1);
      newOrder.splice(targetIdx, 0, sourceId);
      onReorderColumns(newOrder);
    }

    setDraggedColId(null);
    setDragOverColId(null);
  };

  const moveColumn = (colId: string, direction: "up" | "down") => {
    const newOrder = [...columnOrder];
    const idx = newOrder.indexOf(colId);
    if (idx === -1) return;

    if (direction === "up" && idx > 0) {
      const temp = newOrder[idx - 1];
      newOrder[idx - 1] = newOrder[idx];
      newOrder[idx] = temp;
      onReorderColumns(newOrder);
    } else if (direction === "down" && idx < newOrder.length - 1) {
      const temp = newOrder[idx + 1];
      newOrder[idx + 1] = newOrder[idx];
      newOrder[idx] = temp;
      onReorderColumns(newOrder);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      id="table-column-visibility-menu"
      data-testid="table-column-visibility-menu"
      className="absolute z-50 right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200/90 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-800"
    >
      {/* Header */}
      <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-amber-300">
            <Columns3 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-wide">Sütun Görünürlüğü & Sıralama</span>
              <span className="px-1.5 py-0.2 rounded-md bg-indigo-600 text-white text-[10px] font-mono font-bold">
                {visibleCount}/{totalCount}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Sütunları tek tıkla gizleyin veya sürükleyerek sıralayın
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
          title="Menüyü Kapat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Presets Bar */}
      <div className="px-3 py-2 bg-slate-50 border-b border-slate-200/80">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
          <span>Hızlı Şablonlar:</span>
          <button
            type="button"
            id="btn-col-preset-reset"
            data-testid="btn-col-preset-reset"
            onClick={onResetToDefault}
            className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer font-bold lowercase text-[10px]"
            title="Varsayılan sütun sırası ve görünürlüğüne dön"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>varsayılana dön</span>
          </button>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {COLUMN_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              id={`btn-col-preset-${preset.id}`}
              data-testid={`btn-col-preset-${preset.id}`}
              onClick={() => onApplyPreset(preset.id)}
              className="px-2 py-0.5 rounded-md bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-900 border border-slate-200 text-[10px] font-semibold transition-colors cursor-pointer shadow-2xs"
              title={preset.description}
            >
              {preset.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input Filter */}
      <div className="p-2.5 border-b border-slate-100 bg-white">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            id="input-search-columns"
            data-testid="input-search-columns"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Sütun ara (örn: KD, Hacim, Rakip)..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white focus:ring-1 focus:ring-indigo-500 text-slate-900 placeholder-slate-400"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Draggable & Toggleable Columns List */}
      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 p-1">
        {filteredColumns.map((col, idx) => {
          const isVisible = columnVisibility[col.id] !== false;
          const isDragging = draggedColId === col.id;
          const isOver = dragOverColId === col.id;

          return (
            <div
              key={col.id}
              id={`col-item-${col.id}`}
              data-testid={`col-item-${col.id}`}
              draggable={true}
              onDragStart={(e) => handleDragStart(e, col.id)}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
              onDragEnd={() => {
                setDraggedColId(null);
                setDragOverColId(null);
              }}
              className={`flex items-center justify-between p-2 rounded-xl transition-all ${
                isDragging
                  ? "opacity-30 bg-indigo-50"
                  : isOver
                  ? "bg-indigo-100 ring-2 ring-indigo-400"
                  : isVisible
                  ? "hover:bg-slate-50"
                  : "bg-slate-50/70 opacity-60 hover:opacity-90"
              }`}
            >
              {/* Drag Handle & Label */}
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div
                  className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-700 p-0.5 rounded"
                  title="Sırasını değiştirmek için sürükleyin"
                >
                  <GripVertical className="w-3.5 h-3.5" />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (col.canHide) {
                      onToggleColumn(col.id);
                    }
                  }}
                  className={`text-left flex-1 min-w-0 flex items-center gap-2 cursor-pointer ${
                    !col.canHide ? "cursor-default" : ""
                  }`}
                  title={col.description}
                >
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      isVisible ? "bg-emerald-500" : "bg-slate-300"
                    }`}
                  />
                  <div className="truncate">
                    <span
                      className={`text-xs block truncate ${
                        isVisible ? "font-bold text-slate-900" : "text-slate-500 line-through"
                      }`}
                    >
                      {col.shortLabel}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {col.label}
                    </span>
                  </div>
                </button>
              </div>

              {/* Move Up/Down & One-Click Eye Toggle */}
              <div className="flex items-center gap-1 shrink-0 ml-2">
                {/* Move buttons */}
                <div className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => moveColumn(col.id, "up")}
                    disabled={idx === 0}
                    className="p-0.5 rounded text-slate-400 hover:text-indigo-600 disabled:opacity-20 cursor-pointer disabled:pointer-events-none"
                    title="Yukarı taşı"
                  >
                    <ChevronUp className="w-2.5 h-2.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveColumn(col.id, "down")}
                    disabled={idx === filteredColumns.length - 1}
                    className="p-0.5 rounded text-slate-400 hover:text-indigo-600 disabled:opacity-20 cursor-pointer disabled:pointer-events-none"
                    title="Aşağı taşı"
                  >
                    <ChevronDown className="w-2.5 h-2.5" />
                  </button>
                </div>

                {/* Visibility Toggle Button */}
                {col.canHide ? (
                  <button
                    type="button"
                    id={`btn-toggle-col-vis-${col.id}`}
                    data-testid={`btn-toggle-col-vis-${col.id}`}
                    onClick={() => onToggleColumn(col.id)}
                    className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      isVisible
                        ? "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-500 border border-slate-300"
                    }`}
                    title={isVisible ? `"${col.shortLabel}" sütununu gizle` : `"${col.shortLabel}" sütununu göster`}
                  >
                    {isVisible ? (
                      <Eye className="w-3.5 h-3.5 text-indigo-600" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>
                ) : (
                  <span
                    className="p-1.5 text-[10px] font-mono text-slate-400"
                    title="Bu temel sütun her zaman görünür kalmalıdır"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info Strip */}
      <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
        {onOpenFullManager ? (
          <button
            type="button"
            id="btn-col-dropdown-open-modal"
            data-testid="btn-col-dropdown-open-modal"
            onClick={() => {
              onClose();
              onOpenFullManager();
            }}
            className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer hover:underline text-[11px]"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Gelişmiş Yöneticiyi Aç</span>
          </button>
        ) : (
          <span className="flex items-center gap-1 text-[10px]">
            <Info className="w-3 h-3 text-slate-400 shrink-0" />
            <span>Sütun başlıklarından da anlık gizleyebilirsiniz</span>
          </span>
        )}
        <button
          type="button"
          onClick={onClose}
          className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer shadow-xs"
        >
          Tamam
        </button>
      </div>
    </div>
  );
};

// Mini Context Menu / Quick Action triggered directly from a table column header (TH)
interface ColumnHeaderContextMenuProps {
  columnId: string;
  columnLabel: string;
  canHide: boolean;
  onHideColumn: () => void;
  onMoveColumn: (direction: "left" | "right") => void;
  onOpenColumnManager: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const ColumnHeaderContextMenu: React.FC<ColumnHeaderContextMenuProps> = ({
  columnId,
  columnLabel,
  canHide,
  onHideColumn,
  onMoveColumn,
  onOpenColumnManager,
  isOpen,
  onClose
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      id={`col-header-menu-dropdown-${columnId}`}
      data-testid={`col-header-menu-dropdown-${columnId}`}
      onClick={(e) => e.stopPropagation()}
      className="absolute z-50 left-0 top-full mt-1.5 w-56 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl text-white p-1.5 text-xs animate-in fade-in zoom-in-95 duration-100 font-normal normal-case select-none"
    >
      <div className="px-2 py-1 border-b border-slate-800 text-[10px] font-bold text-amber-300 truncate">
        Sütun: {columnLabel}
      </div>

      <div className="py-1 space-y-0.5">
        {canHide && (
          <button
            type="button"
            id={`btn-col-header-hide-${columnId}`}
            data-testid={`btn-col-header-hide-${columnId}`}
            onClick={(e) => {
              e.stopPropagation();
              onHideColumn();
              onClose();
            }}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-rose-300 hover:bg-rose-950/80 hover:text-rose-200 transition-colors text-left cursor-pointer"
          >
            <EyeOff className="w-3.5 h-3.5 text-rose-400" />
            <span className="font-semibold">Bu Sütunu Gizle</span>
          </button>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMoveColumn("left");
            onClose();
          }}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-slate-200 hover:bg-slate-800 hover:text-white transition-colors text-left cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-indigo-400" />
          <span>Sola Kaydır</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMoveColumn("right");
            onClose();
          }}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-slate-200 hover:bg-slate-800 hover:text-white transition-colors text-left cursor-pointer"
        >
          <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
          <span>Sağa Kaydır</span>
        </button>

        <div className="border-t border-slate-800 pt-1 mt-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenColumnManager();
              onClose();
            }}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-amber-300 hover:bg-slate-800 transition-colors text-left cursor-pointer font-bold"
          >
            <Columns3 className="w-3.5 h-3.5 text-amber-400" />
            <span>Tüm Sütunları Yönet...</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Full-Screen / Modal version for Comprehensive Column Management
export interface TableColumnManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  columnOrder: string[];
  columnVisibility: Record<string, boolean>;
  onToggleColumn: (columnId: string) => void;
  onReorderColumns: (newOrder: string[]) => void;
  onApplyPreset: (presetId: string) => void;
  onResetToDefault: () => void;
}

export const TableColumnManagerModal: React.FC<TableColumnManagerModalProps> = ({
  isOpen,
  onClose,
  columnOrder,
  columnVisibility,
  onToggleColumn,
  onReorderColumns,
  onApplyPreset,
  onResetToDefault
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [draggedColId, setDraggedColId] = useState<string | null>(null);
  const [dragOverColId, setDragOverColId] = useState<string | null>(null);

  if (!isOpen) return null;

  const columnMap = new Map<string, ColumnDefinition>();
  TABLE_COLUMNS.forEach((c) => columnMap.set(c.id, c));

  const orderedColumns = columnOrder
    .map((id) => columnMap.get(id))
    .filter((c): c is ColumnDefinition => c !== undefined);

  const filteredColumns = orderedColumns.filter((c) => {
    const matchesSearch =
      !searchTerm.trim() ||
      c.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.shortLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = activeCategory === "all" || c.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  const visibleCount = columnOrder.filter((id) => columnVisibility[id] !== false).length;
  const totalCount = TABLE_COLUMNS.length;

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    setDraggedColId(id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedColId && draggedColId !== id) {
      setDragOverColId(id);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData("text/plain") || draggedColId;
    if (!sourceId || sourceId === targetId) {
      setDraggedColId(null);
      setDragOverColId(null);
      return;
    }

    const newOrder = [...columnOrder];
    const sourceIdx = newOrder.indexOf(sourceId);
    const targetIdx = newOrder.indexOf(targetId);

    if (sourceIdx !== -1 && targetIdx !== -1) {
      newOrder.splice(sourceIdx, 1);
      newOrder.splice(targetIdx, 0, sourceId);
      onReorderColumns(newOrder);
    }

    setDraggedColId(null);
    setDragOverColId(null);
  };

  const moveColumn = (colId: string, direction: "up" | "down") => {
    const newOrder = [...columnOrder];
    const idx = newOrder.indexOf(colId);
    if (idx === -1) return;

    if (direction === "up" && idx > 0) {
      const temp = newOrder[idx - 1];
      newOrder[idx - 1] = newOrder[idx];
      newOrder[idx] = temp;
      onReorderColumns(newOrder);
    } else if (direction === "down" && idx < newOrder.length - 1) {
      const temp = newOrder[idx + 1];
      newOrder[idx + 1] = newOrder[idx];
      newOrder[idx] = temp;
      onReorderColumns(newOrder);
    }
  };

  return (
    <div
      id="seo-table-column-manager-modal"
      data-testid="seo-table-column-manager-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-amber-300 shadow-inner">
              <Columns3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">
                  Sütun Yönetimi & Görünürlük Yapılandırması
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-amber-300 text-xs font-mono font-black">
                  {visibleCount}/{totalCount} Aktif
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Sütunları sürükleyip bırakarak yeniden sıralayın veya tek tıkla gizleyip gösterin
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-close-column-manager-modal"
            data-testid="btn-close-column-manager-modal"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
            title="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets Strip */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-600 mr-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Hazır Şablonlar:</span>
            </span>
            {COLUMN_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                id={`btn-modal-preset-${preset.id}`}
                data-testid={`btn-modal-preset-${preset.id}`}
                onClick={() => onApplyPreset(preset.id)}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-50 text-slate-800 hover:text-indigo-950 border border-slate-200 text-xs font-semibold transition-all cursor-pointer shadow-2xs active:scale-95"
                title={preset.description}
              >
                {preset.name}
              </button>
            ))}
          </div>

          <button
            type="button"
            id="btn-modal-reset-columns"
            data-testid="btn-modal-reset-columns"
            onClick={onResetToDefault}
            className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
            title="Varsayılan sütun sırası ve görünürlüğüne dön"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Varsayılana Sıfırla</span>
          </button>
        </div>

        {/* Search & Category Tabs */}
        <div className="p-4 border-b border-slate-200 bg-white space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              id="input-modal-search-columns"
              data-testid="input-modal-search-columns"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Sütun adı veya açıklamasına göre filtreleyin..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-indigo-500 text-slate-900"
            />
          </div>

          {/* Categories */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            {[
              { id: "all", label: "Tüm Sütunlar" },
              { id: "metric", label: "SERP & Metrikler" },
              { id: "competitor", label: "Rakip Sıralamaları" },
              { id: "action", label: "AI & Eylem Sütunları" },
              { id: "control", label: "Kontroller" }
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Column List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 divide-y divide-slate-100">
          {filteredColumns.map((col, idx) => {
            const isVisible = columnVisibility[col.id] !== false;
            const isDragging = draggedColId === col.id;
            const isOver = dragOverColId === col.id;

            return (
              <div
                key={col.id}
                id={`modal-col-row-${col.id}`}
                data-testid={`modal-col-row-${col.id}`}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, col.id)}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDrop={(e) => handleDrop(e, col.id)}
                onDragEnd={() => {
                  setDraggedColId(null);
                  setDragOverColId(null);
                }}
                className={`pt-2 first:pt-0 flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                  isDragging
                    ? "opacity-30 bg-indigo-50 border-indigo-300"
                    : isOver
                    ? "bg-indigo-100 border-indigo-500 ring-2 ring-indigo-400"
                    : isVisible
                    ? "bg-white border-slate-200 hover:border-indigo-300 shadow-2xs"
                    : "bg-slate-50/70 border-slate-200 opacity-60 hover:opacity-100"
                }`}
              >
                {/* Drag Handle & Info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-indigo-600 p-1 rounded-lg hover:bg-slate-100"
                    title="Sütunu taşımak için sürükleyin"
                  >
                    <GripVertical className="w-4 h-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          isVisible ? "bg-emerald-500" : "bg-slate-300"
                        }`}
                      />
                      <span
                        className={`text-xs block font-bold truncate ${
                          isVisible ? "text-slate-900" : "text-slate-400 line-through"
                        }`}
                      >
                        {col.label}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-slate-100 text-slate-500 border border-slate-200">
                        {col.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate pl-4">
                      {col.description}
                    </p>
                  </div>
                </div>

                {/* Actions (Move & Toggle) */}
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => moveColumn(col.id, "up")}
                      disabled={idx === 0}
                      className="p-1 rounded text-slate-600 hover:text-indigo-700 hover:bg-white disabled:opacity-20 cursor-pointer disabled:pointer-events-none"
                      title="Yukarı taşı"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveColumn(col.id, "down")}
                      disabled={idx === filteredColumns.length - 1}
                      className="p-1 rounded text-slate-600 hover:text-indigo-700 hover:bg-white disabled:opacity-20 cursor-pointer disabled:pointer-events-none"
                      title="Aşağı taşı"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {col.canHide ? (
                    <button
                      type="button"
                      id={`modal-btn-toggle-${col.id}`}
                      data-testid={`modal-btn-toggle-${col.id}`}
                      onClick={() => onToggleColumn(col.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                        isVisible
                          ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                          : "bg-slate-200 hover:bg-slate-300 text-slate-700"
                      }`}
                    >
                      {isVisible ? (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>Görünür</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                          <span>Gizli</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Zorunlu</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Yapılan tüm sıralama ve gizleme tercihleri otomatik olarak tarayıcınızda saklanır.
          </p>
          <button
            type="button"
            id="btn-modal-column-manager-done"
            data-testid="btn-modal-column-manager-done"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
          >
            Tamamla ve Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
