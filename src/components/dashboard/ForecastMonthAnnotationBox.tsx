import React, { useState, useEffect } from "react";
import {
  StickyNote,
  Save,
  Trash2,
  Check,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Zap,
  Target,
  FileText,
  Link2,
  Smartphone,
  Calendar,
  RotateCcw,
  TrendingUp,
  Info
} from "lucide-react";
import { MonthlyDataPoint, ForecastMetricType } from "./CompetitorGrowthForecastD3Chart";

export interface MonthForecastAnnotation {
  monthIndex: number;
  monthLabel: string;
  monthName: string;
  text: string;
  category: "technical" | "content" | "backlink" | "crossover" | "ux" | "general";
  updatedAt?: string;
}

export const FORECAST_NOTE_CATEGORIES: {
  id: MonthForecastAnnotation["category"];
  label: string;
  color: string;
  icon: typeof Zap;
}[] = [
  { id: "technical", label: "⚡ Teknik SEO & Hız", color: "bg-amber-500/10 text-amber-600 border-amber-500/30", icon: Zap },
  { id: "content", label: "✍️ İçerik & Anahtar Kelime", color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/30", icon: FileText },
  { id: "backlink", label: "🔗 Backlink & Otorite", color: "bg-blue-500/10 text-blue-600 border-blue-500/30", icon: Link2 },
  { id: "crossover", label: "🎯 Rekabetçi Crossover", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30", icon: Target },
  { id: "ux", label: "📱 UX & Core Web Vitals", color: "bg-purple-500/10 text-purple-600 border-purple-500/30", icon: Smartphone },
  { id: "general", label: "📌 Genel Strateji", color: "bg-slate-500/10 text-slate-600 border-slate-500/30", icon: StickyNote }
];

export const DEFAULT_MONTH_PRESETS: Record<number, { text: string; category: MonthForecastAnnotation["category"] }> = {
  0: {
    text: "Mevcut durum analizi: 1. Rakip ile aradaki organik trafik açığı belirlendi. Cloudflare Edge önbellekleme ve mobil Core Web Vitals iyileştirmelerine başlanacak.",
    category: "technical"
  },
  1: {
    text: "Teknik SEO & Hız Paketi: LCP süresi < 2.0s hedefleniyor. Statik görsel sıkıştırma ve font ön yükleme tamamlanarak ilk sıra kazanımları tetiklenecek.",
    category: "technical"
  },
  2: {
    text: "İçerik Kümesi Lansmanı: Ticari ve bilgi niyetli 35 yeni derinlemesine rehber içeriği ve FAQ Schema yayına alınacak.",
    category: "content"
  },
  3: {
    text: "Otorite Backlink Hamlesi: Sektörel haber bültenleri ve yüksek DA referans sitelerden 12 kaliteli dofollow bağlantı ile 3. Rakip sıralamada geçilecek.",
    category: "backlink"
  },
  4: {
    text: "Kategori Sayfaları & UX: E-ticaret listeleme ve filtreleme sayfaları hızlandırılarak organik hemen çıkma oranı %15 düşürülecek.",
    category: "ux"
  },
  5: {
    text: "Sıralama Geçişi (Crossover): 2. Rakip geride bırakılarak yüksek hacimli anahtar kelimelerde organik ilk 3 pozisyon domine edilecek.",
    category: "crossover"
  },
  6: {
    text: "Final Büyüme Eşiği: Organik trafikte %70+ net büyüme sağlanarak 1. Rakip ile fark minimuma indirilecek ve SERP liderliği hedeflenecek.",
    category: "crossover"
  }
};

const QUICK_SNIPPET_TEMPLATES: { label: string; text: string; category: MonthForecastAnnotation["category"] }[] = [
  { label: "⚡ CWV & LCP < 2.0s", text: "Core Web Vitals optimizasyonu: Görseller WebP/AVIF'e çevrilerek mobil LCP 1.9s seviyesine çekilecek.", category: "technical" },
  { label: "✍️ 25 Yeni Kategori Rehberi", text: "İçerik genişletme: Satın alma niyeti yüksek anahtar kelimelerde 25 kapsamlı kategori rehberi yayınlanacak.", category: "content" },
  { label: "🔗 10 Otorite Backlink", text: "Backlink edinimi: Domain Authority (DA) 60+ sektörel kaynaklardan 10 editoryal referans bağlantı sağlanacak.", category: "backlink" },
  { label: "🎯 2. Rakibi Geçme Eşiği", text: "SERP geçişi: 2. ana rakibin geride bırakılarak pazar payında 2. sıraya yerleşilmesi hedefleniyor.", category: "crossover" },
  { label: "🛍️ Mobil Dönüşüm & Sepet UX", text: "Dönüşüm optimizasyonu: Mobil sepet akışı ve hızlı arama filtreleri optimize edilerek organik dönüşüm %20 artırılacak.", category: "ux" }
];

interface ForecastMonthAnnotationBoxProps {
  months: MonthlyDataPoint[];
  selectedMonthIndex: number;
  onSelectMonth: (index: number) => void;
  notes: Record<number, MonthForecastAnnotation>;
  onSaveNote: (monthIndex: number, text: string, category: MonthForecastAnnotation["category"]) => void;
  onDeleteNote: (monthIndex: number) => void;
  onResetDefaults: () => void;
  selectedMetric: ForecastMetricType;
  userName: string;
  competitors: Array<{ name: string; domain: string; rank: number }>;
}

export const ForecastMonthAnnotationBox: React.FC<ForecastMonthAnnotationBoxProps> = ({
  months,
  selectedMonthIndex,
  onSelectMonth,
  notes,
  onSaveNote,
  onDeleteNote,
  onResetDefaults,
  selectedMetric,
  userName,
  competitors
}) => {
  const currentMonthData = months[selectedMonthIndex] || months[0];
  const activeNote = notes[selectedMonthIndex];

  const [inputText, setInputText] = useState<string>(activeNote?.text || "");
  const [selectedCategory, setSelectedCategory] = useState<MonthForecastAnnotation["category"]>(
    activeNote?.category || "general"
  );
  const [isSavedFeedback, setIsSavedFeedback] = useState<boolean>(false);

  // Sync state when selected month changes
  useEffect(() => {
    const note = notes[selectedMonthIndex];
    if (note) {
      setInputText(note.text);
      setSelectedCategory(note.category);
    } else {
      const preset = DEFAULT_MONTH_PRESETS[selectedMonthIndex];
      setInputText(preset ? preset.text : "");
      setSelectedCategory(preset ? preset.category : "general");
    }
    setIsSavedFeedback(false);
  }, [selectedMonthIndex, notes]);

  const handleSave = () => {
    if (!inputText.trim()) return;
    onSaveNote(selectedMonthIndex, inputText.trim(), selectedCategory);
    setIsSavedFeedback(true);
    setTimeout(() => {
      setIsSavedFeedback(false);
    }, 2500);
  };

  const handleInsertSnippet = (snippet: { text: string; category: MonthForecastAnnotation["category"] }) => {
    setInputText((prev) => {
      if (!prev.trim()) return snippet.text;
      return `${prev.trim()}\n• ${snippet.text}`;
    });
    setSelectedCategory(snippet.category);
  };

  const totalNotesCount = Object.keys(notes).filter((k) => notes[Number(k)]?.text?.trim()).length;

  // Monthly values calculation for snapshot
  const userVal = currentMonthData?.values.user || 0;
  const comp1Val = currentMonthData?.values.comp1 || 0;
  const comp2Val = currentMonthData?.values.comp2 || 0;
  const comp3Val = currentMonthData?.values.comp3 || 0;
  const baseUser = months[0]?.values.user || 1;
  const growthPct = Math.round(((userVal - baseUser) / baseUser) * 100);

  const formatMetricVal = (v: number) => {
    if (selectedMetric === "traffic") return v.toLocaleString("tr-TR");
    return `${v} pt`;
  };

  return (
    <div
      id="d3-monthly-forecast-annotation-box"
      data-testid="d3-monthly-forecast-annotation-box"
      className="p-5 sm:p-6 rounded-3xl bg-slate-900 text-white border border-slate-700/90 shadow-2xl space-y-4"
    >
      {/* Target anchor for smooth scroll & dual test identifier */}
      <div id="interactive-forecast-note-box" data-testid="interactive-forecast-note-box" className="hidden" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-xs">
            <StickyNote className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-black text-white tracking-tight">
                6 Aylık Performans Grafiği Tahmin Notları Açıklama Kutusu
              </h4>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                {totalNotesCount}/{months.length} Ay Notlu
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 uppercase tracking-wider">
                İnteraktif Mod
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Grafikteki her ay (0. - 6. Ay) için özel tahmin notu ve stratejik kilometre taşları ekleyin; kaydedilen notlar anında grafik pinlerine ve bilgi kartlarına yansır.
            </p>
          </div>
        </div>

        {/* Quick Reset & Info */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            type="button"
            id="btn-reset-forecast-notes"
            data-testid="btn-reset-forecast-notes"
            onClick={onResetDefaults}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer border border-slate-700"
            title="Tüm ayların tahmin notlarını önerilen varsayılan stratejik şablonlara sıfırla"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Şablonlara Sıfırla</span>
          </button>
        </div>
      </div>

      {/* Month Selector Pills (0. Ay to 6. Ay) */}
      <div className="space-y-1.5" data-testid="forecast-month-selector">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
          <span>Düzenlenecek ve İncelenecek Ayı Seçin:</span>
          <span className="text-amber-400 font-mono">
            {currentMonthData.monthLabel} ({currentMonthData.monthName})
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {months.map((m) => {
            const hasNote = Boolean(notes[m.monthIndex]?.text?.trim());
            const isSelected = m.monthIndex === selectedMonthIndex;
            const noteCategory = notes[m.monthIndex]?.category || "general";
            const categoryMeta = FORECAST_NOTE_CATEGORIES.find((c) => c.id === noteCategory);

            return (
              <button
                key={m.monthIndex}
                type="button"
                id={`btn-select-month-${m.monthIndex}`}
                data-testid={`btn-select-month-${m.monthIndex}`}
                onClick={() => onSelectMonth(m.monthIndex)}
                className={`relative flex flex-col p-2.5 rounded-2xl text-left transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-amber-500/20 border-amber-400/80 ring-2 ring-amber-400/40 text-white shadow-md"
                    : hasNote
                    ? "bg-slate-800/90 hover:bg-slate-800 border-slate-700 text-slate-300"
                    : "bg-slate-850 hover:bg-slate-800 border-slate-800/80 text-slate-400"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-xs font-black ${isSelected ? "text-amber-300" : "text-slate-200"}`}>
                    {m.monthLabel}
                  </span>
                  {hasNote ? (
                    <span
                      className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/40"
                      title="Bu ay için özel tahmin notu kayıtlı"
                    />
                  ) : (
                    <span className="text-[10px] text-slate-500 font-mono">+Not</span>
                  )}
                </div>

                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {m.monthName.split(" ")[0]}
                </div>

                {hasNote && categoryMeta && (
                  <div className="mt-1 flex items-center gap-1 text-[9px] font-bold text-amber-300 truncate">
                    <span className="truncate">{categoryMeta.label.split(" ")[0]}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Month Workspace (Metrics Snapshot & Note Editor) */}
      <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
        {/* Month Metrics Header & Nav */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-black font-mono">
              {currentMonthData.monthLabel}
            </span>
            <span className="text-sm font-bold text-white">
              {currentMonthData.monthName} Stratejik Tahmin Notu
            </span>
          </div>

          {/* Month Steppers */}
          <div className="flex items-center gap-1.5 self-end sm:self-center">
            <button
              type="button"
              id="btn-prev-month-note"
              data-testid="btn-prev-month-note"
              disabled={selectedMonthIndex === 0}
              onClick={() => onSelectMonth(Math.max(0, selectedMonthIndex - 1))}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all border border-slate-700"
              title="Önceki Aya Geç"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-slate-400 px-1">
              Ay {selectedMonthIndex} / {months.length - 1}
            </span>
            <button
              type="button"
              id="btn-next-month-note"
              data-testid="btn-next-month-note"
              disabled={selectedMonthIndex === months.length - 1}
              onClick={() => onSelectMonth(Math.min(months.length - 1, selectedMonthIndex + 1))}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all border border-slate-700"
              title="Sonraki Aya Geç"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Forecast Value Snapshot Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[10px] text-slate-400 font-medium">{userName} (Siz) Hedef:</div>
            <div className="text-sm font-black text-emerald-400 font-mono mt-0.5">
              {formatMetricVal(userVal)}
            </div>
            <div className="text-[10px] text-emerald-300/80 font-bold mt-0.5">
              {growthPct >= 0 ? `+${growthPct}%` : `${growthPct}%`} büyüme
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[10px] text-slate-400 font-medium">1. {competitors[0]?.name.split(" ")[0]}:</div>
            <div className="text-sm font-black text-slate-200 font-mono mt-0.5">
              {formatMetricVal(comp1Val)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Fark: {userVal - comp1Val >= 0 ? `+${formatMetricVal(userVal - comp1Val)}` : `${formatMetricVal(userVal - comp1Val)}`}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[10px] text-slate-400 font-medium">2. {competitors[1]?.name.split(" ")[0]}:</div>
            <div className="text-sm font-black text-slate-200 font-mono mt-0.5">
              {formatMetricVal(comp2Val)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {userVal >= comp2Val ? "🎯 Geçildi (+Önde)" : `${formatMetricVal(userVal - comp2Val)}`}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[10px] text-slate-400 font-medium">3. {competitors[2]?.name.split(" ")[0]}:</div>
            <div className="text-sm font-black text-slate-200 font-mono mt-0.5">
              {formatMetricVal(comp3Val)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {userVal >= comp3Val ? "🎯 Geçildi (+Önde)" : `${formatMetricVal(userVal - comp3Val)}`}
            </div>
          </div>
        </div>

        {/* Category Chips Selector */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-400">
            Stratejik Kategori / Odak Alanı:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {FORECAST_NOTE_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const IconComp = cat.icon;
              return (
                <button
                  key={cat.id}
                  type="button"
                  id={`btn-cat-${cat.id}`}
                  data-testid={`btn-cat-${cat.id}`}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-amber-500 text-slate-950 border-amber-400 font-black shadow-xs"
                      : "bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border-slate-800"
                  }`}
                >
                  <IconComp className="w-3 h-3" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Note Textarea */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
            <label htmlFor="forecast-note-textarea" className="flex items-center gap-1 text-slate-300">
              <StickyNote className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentMonthData.monthLabel} İçin Özel Tahmin Notu:</span>
            </label>
            <span className="font-mono text-[10px] text-slate-500">
              {inputText.length} karakter
            </span>
          </div>

          <textarea
            id="forecast-note-textarea"
            data-testid="forecast-note-textarea"
            rows={3}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`${currentMonthData.monthLabel} (${currentMonthData.monthName}) için planlanan SEO eylemleri, içerik yayını, teknik düzeltmeler veya hedeflenen sıralama kilometre taşını buraya yazın...`}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-white text-xs leading-relaxed placeholder-slate-500 focus:outline-hidden transition-all resize-y"
          />
        </div>

        {/* Quick Snippet Templates */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Hızlı Stratejik Şablon Ekle:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_SNIPPET_TEMPLATES.map((tmpl, idx) => (
              <button
                key={idx}
                type="button"
                id={`btn-snippet-${idx}`}
                data-testid={`btn-snippet-${idx}`}
                onClick={() => handleInsertSnippet(tmpl)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-800 text-[11px] font-medium transition-all cursor-pointer"
                title={tmpl.text}
              >
                <span>+</span>
                <span>{tmpl.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-save-forecast-note"
              data-testid="btn-save-forecast-note"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-md"
            >
              {isSavedFeedback ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Tahmin Notu Kaydedildi!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Bu Ayın Notunu Kaydet</span>
                </>
              )}
            </button>

            {activeNote && (
              <button
                type="button"
                id="btn-delete-forecast-note"
                data-testid="btn-delete-forecast-note"
                onClick={() => {
                  onDeleteNote(selectedMonthIndex);
                  setInputText("");
                }}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/80 hover:text-rose-300 hover:border-rose-800/80 text-slate-400 text-xs font-semibold transition-all cursor-pointer border border-slate-700"
                title="Bu ayın notunu sil"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Notu Sil</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            {activeNote?.updatedAt && (
              <span className="font-mono text-[10px] text-slate-500">
                Son güncelleme: {activeNote.updatedAt}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
