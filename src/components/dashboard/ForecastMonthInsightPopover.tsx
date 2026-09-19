import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  X, 
  Save, 
  Trash2, 
  Check, 
  Zap, 
  Target, 
  FileText, 
  Link2, 
  Smartphone, 
  StickyNote, 
  TrendingUp, 
  Calendar,
  Layers,
  ArrowRight,
  ShieldAlert,
  Lightbulb
} from "lucide-react";
import { MonthlyDataPoint, ForecastMetricType } from "./CompetitorGrowthForecastD3Chart";
import { MonthForecastAnnotation, FORECAST_NOTE_CATEGORIES } from "./ForecastMonthAnnotationBox";

interface ForecastMonthInsightPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  monthData: MonthlyDataPoint;
  monthIndex: number;
  currentNote?: MonthForecastAnnotation;
  onSaveNote: (monthIndex: number, text: string, category: MonthForecastAnnotation["category"]) => void;
  onDeleteNote: (monthIndex: number) => void;
  position: { x: number; y: number };
  containerWidth: number;
  selectedMetric: ForecastMetricType;
  userName: string;
  competitors: Array<{ name: string; domain?: string; rank?: number }>;
  entityContext?: {
    id: "user" | "comp1" | "comp2" | "comp3";
    name: string;
    color: string;
    value: number;
  } | null;
}

export const ForecastMonthInsightPopover: React.FC<ForecastMonthInsightPopoverProps> = ({
  isOpen,
  onClose,
  monthData,
  monthIndex,
  currentNote,
  onSaveNote,
  onDeleteNote,
  position,
  containerWidth,
  selectedMetric,
  userName,
  competitors,
  entityContext
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [noteText, setNoteText] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<MonthForecastAnnotation["category"]>("general");
  const [isSavedRecently, setIsSavedRecently] = useState<boolean>(false);

  // Sync state whenever monthIndex or currentNote changes
  useEffect(() => {
    if (currentNote) {
      setNoteText(currentNote.text || "");
      setSelectedCategory(currentNote.category || "general");
    } else {
      setNoteText("");
      setSelectedCategory("general");
    }
    setIsSavedRecently(false);
  }, [monthIndex, currentNote]);

  // Focus textarea when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isOpen, monthIndex]);

  // Click outside and Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !monthData) return null;

  // Metric values formatting
  const formatMetricVal = (val: number) => {
    if (selectedMetric === "traffic") {
      return `${val.toLocaleString("tr-TR")} tekil/ay`;
    }
    return `${val} puan`;
  };

  const userVal = monthData.values.user || 0;
  const comp1Val = monthData.values.comp1 || 0;
  const userDiffFromComp1 = userVal - comp1Val;
  const isLeadingComp1 = userDiffFromComp1 >= 0;

  // Handle Save
  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!noteText.trim()) return;

    onSaveNote(monthIndex, noteText.trim(), selectedCategory);
    setIsSavedRecently(true);
    setTimeout(() => {
      setIsSavedRecently(false);
    }, 2500);
  };

  // Handle Delete
  const handleDelete = () => {
    onDeleteNote(monthIndex);
    setNoteText("");
    setSelectedCategory("general");
  };

  // Preset suggestions tailored to current month & data
  const dynamicSuggestions = [
    {
      title: "⚡ Core Web Vitals & Hız",
      category: "technical" as const,
      text: `Mobil 98/100 hız avantajını kullanarak ${monthIndex === 0 ? "mevcut" : `+${monthIndex}. aydaki`} LCP süresini 1.8s altına sabitleyip 1. Rakip'in önbelleksiz sayfalarını sıralamada geride bırak.`
    },
    {
      title: "🎯 Pazar Payı & Crossover",
      category: "crossover" as const,
      text: `${monthData.monthLabel} dönemi hedefi: ${userName}, ${competitors[0]?.name || "1. Rakip"} ile arasındaki ${Math.abs(userDiffFromComp1).toLocaleString("tr-TR")} farkı kapatarak SERP görünürlüğünü %25 artıracak.`
    },
    {
      title: "✍️ İçerik & Niyet Odaklı Küme",
      category: "content" as const,
      text: `Yüksek hacimli anahtar kelimeler için ${monthIndex}. ayda 15 yeni derinlemesine içerik ve FAQ schema yayına alınarak organik tıklama oranı (CTR) yükseltilecek.`
    },
    {
      title: "🔗 Otorite Backlink Hamlesi",
      category: "backlink" as const,
      text: `Yerel rehber siteler ve sektörel yayınlardan 8 adet yüksek kaliteli editoryal dofollow backlink alınarak domain otoritesi 45+ seviyesine çıkarılacak.`
    }
  ];

  // Popover Positioning calculations
  const popoverWidth = Math.min(380, containerWidth - 32);
  // Center horizontally over clicked dot, clamped within bounds
  let leftPos = position.x - popoverWidth / 2;
  leftPos = Math.max(16, Math.min(containerWidth - popoverWidth - 16, leftPos));

  // Determine if popover should sit above or below the dot
  const showAbove = position.y > 210;
  const topPos = showAbove ? Math.max(10, position.y - 365) : position.y + 16;

  // Arrow X offset relative to popover box
  const arrowLeft = Math.max(20, Math.min(popoverWidth - 20, position.x - leftPos));

  return (
    <div
      ref={popoverRef}
      id="d3-forecast-insight-popover"
      data-testid="forecast-insight-popover"
      data-month={monthIndex}
      className="absolute z-40 bg-slate-900/98 text-slate-100 rounded-2xl border border-amber-400/50 shadow-2xl backdrop-blur-xl p-4 transition-all duration-200 animate-in fade-in zoom-in-95 text-xs"
      style={{
        left: `${leftPos}px`,
        top: `${topPos}px`,
        width: `${popoverWidth}px`
      }}
    >
      {/* Caret / Pointer Arrow */}
      <div
        className={`absolute w-3 h-3 bg-slate-900 border-amber-400/50 transform rotate-45 pointer-events-none ${
          showAbove
            ? "bottom-[-7px] border-r border-b"
            : "top-[-7px] border-l border-t"
        }`}
        style={{ left: `${arrowLeft - 6}px` }}
      />

      {/* 1. Header Bar */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-700/80">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-black text-white text-[13px]">
              <span>{monthData.monthLabel}</span>
              <span className="text-amber-400 font-mono text-[11px]">({monthData.monthName})</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              Stratejik Tahmin & Büyüme Insight Notu
            </p>
          </div>
        </div>

        <button
          type="button"
          id="btn-close-insight-popover"
          data-testid="btn-close-insight-popover"
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="Insight popover'ını kapat"
          aria-label="Kapat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Projected Month Metrics Comparison Card */}
      <div className="mt-2.5 p-2 rounded-xl bg-slate-800/80 border border-slate-700/70">
        <div className="flex items-center justify-between text-[11px] mb-1.5">
          <span className="text-slate-400 font-medium">Bu Aydaki Tahmini Değer:</span>
          <span className={`px-1.5 py-0.2 rounded font-black text-[10px] ${
            isLeadingComp1 
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
          }`}>
            {isLeadingComp1 ? "🏆 SERP Lideri" : `🎯 Fark: -${Math.abs(userDiffFromComp1).toLocaleString("tr-TR")}`}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
          <div className="p-1.5 rounded-lg bg-emerald-950/50 border border-emerald-500/30">
            <div className="text-[10px] text-emerald-400 font-sans font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>{userName} (Siz)</span>
            </div>
            <div className="font-black text-white text-xs mt-0.5">
              {formatMetricVal(userVal)}
            </div>
          </div>

          <div className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-700/60">
            <div className="text-[10px] text-slate-400 font-sans font-bold flex items-center gap-1 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              <span className="truncate">{competitors[0]?.name || "1. Rakip"}</span>
            </div>
            <div className="font-black text-slate-200 text-xs mt-0.5">
              {formatMetricVal(comp1Val)}
            </div>
          </div>
        </div>

        {entityContext && (
          <div className="mt-1.5 pt-1.5 border-t border-slate-700/50 text-[10px] text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entityContext.color }} />
              <span>Tıklanan Seri: <strong>{entityContext.name}</strong></span>
            </span>
            <span className="font-mono font-bold text-amber-300">
              {formatMetricVal(entityContext.value)}
            </span>
          </div>
        )}
      </div>

      {/* 3. Category Selector */}
      <div className="mt-2.5">
        <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
          Insight Strateji Kategorisi
        </label>
        <div className="grid grid-cols-3 gap-1">
          {FORECAST_NOTE_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-1.5 py-1 rounded-lg text-[10px] font-bold text-left truncate transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-amber-400 text-slate-950 border-amber-300 shadow-xs scale-102"
                    : "bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Strategic Note Input Form */}
      <form onSubmit={handleSave} className="mt-2.5">
        <div className="flex items-center justify-between mb-1">
          <label 
            htmlFor="insight-popover-note-input"
            className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1"
          >
            <StickyNote className="w-3 h-3 text-amber-400" />
            <span>O Aya Özel Stratejik Not</span>
          </label>
          <span className="text-[9px] font-mono text-slate-400">
            {noteText.length} karakter
          </span>
        </div>

        <textarea
          ref={textareaRef}
          id="insight-popover-note-input"
          data-testid="insight-popover-note-input"
          rows={3}
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Örn: Bu ayda başlayacak yerel landing page kampanyası ile 1. Rakip'in ilk sıradaki kelimeleri hedeflenecek..."
          className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder:text-slate-500 text-xs focus:outline-hidden focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all resize-none leading-relaxed"
        />

        {/* 5. Quick Insight Presets (Click to Insert) */}
        <div className="mt-2">
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 mb-1">
            <Lightbulb className="w-3 h-3 text-amber-400" />
            <span>Hızlı Öneri Şablonları (Tıkla & Ekle):</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {dynamicSuggestions.map((sug, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setNoteText(sug.text);
                  setSelectedCategory(sug.category);
                }}
                className="shrink-0 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px] font-medium border border-slate-700/80 transition-colors cursor-pointer flex items-center gap-1"
                title={sug.text}
              >
                <span>{sug.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 6. Action Buttons: Save & Delete */}
        <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-700/80">
          <div>
            {currentNote?.text && (
              <button
                type="button"
                id="btn-delete-insight-popover"
                data-testid="btn-delete-insight-popover"
                onClick={handleDelete}
                className="px-2.5 py-1.5 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                title="Bu ayın stratejik tahmin notunu sil"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Notu Sil</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold transition-all cursor-pointer"
            >
              Vazgeç
            </button>

            <button
              type="submit"
              id="btn-save-insight-popover"
              data-testid="btn-save-insight-popover"
              disabled={!noteText.trim()}
              className={`px-3.5 py-1.5 rounded-xl text-[11px] font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-md disabled:opacity-40 disabled:cursor-not-allowed ${
                isSavedRecently
                  ? "bg-emerald-500 text-slate-950 border border-emerald-400"
                  : "bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 border border-amber-300 active:scale-95"
              }`}
            >
              {isSavedRecently ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Kaydedildi!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Insight Notunu Kaydet</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
