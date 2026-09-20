import React, { useState, useEffect } from "react";
import {
  Bookmark,
  FileText,
  Sparkles,
  Save,
  Trash2,
  Calendar,
  TrendingUp,
  Check,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Tag,
  ChevronDown,
  ChevronUp,
  X,
  Target,
  Zap,
  ShieldAlert,
  Megaphone,
  Link2,
  Code2
} from "lucide-react";
import { FORECAST_MONTHS, CompetitorGrowthProfile } from "../../utils/competitorGrowthEngine";
import { TrendMetricType } from "./CompetitorTrendForecastModule";

export type StrategicNoteCategory = 
  | "content" 
  | "technical" 
  | "backlink" 
  | "campaign" 
  | "algorithm" 
  | "other";

export type StrategicNoteImpact = 
  | "high_positive" 
  | "moderate_positive" 
  | "neutral_stable" 
  | "risk_volatility";

export interface StrategicForecastNote {
  monthIndex: number; // 0 to 6
  monthLabel: string; // e.g. "Kas 2026"
  fullMonth: string;  // e.g. "Kasım 2026 (2. Ay Öngörüsü)"
  note: string;
  category: StrategicNoteCategory;
  expectedImpact: StrategicNoteImpact;
  actionItems?: string[];
  updatedAt?: string;
}

export const STRATEGIC_NOTE_CATEGORIES: Array<{
  id: StrategicNoteCategory;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeClass: string;
  dotColor: string;
}> = [
  { 
    id: "content", 
    label: "İçerik Stratejisi", 
    icon: FileText, 
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100", 
    dotColor: "#3b82f6" 
  },
  { 
    id: "technical", 
    label: "Teknik SEO & PSI", 
    icon: Code2, 
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100", 
    dotColor: "#8b5cf6" 
  },
  { 
    id: "backlink", 
    label: "Backlink & Otorite", 
    icon: Link2, 
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100", 
    dotColor: "#10b981" 
  },
  { 
    id: "campaign", 
    label: "Sezonsal Kampanya", 
    icon: Megaphone, 
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100", 
    dotColor: "#f59e0b" 
  },
  { 
    id: "algorithm", 
    label: "Algoritma Riski", 
    icon: ShieldAlert, 
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100", 
    dotColor: "#ef4444" 
  },
  { 
    id: "other", 
    label: "Genel Aksiyon", 
    icon: Zap, 
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200", 
    dotColor: "#64748b" 
  }
];

export const STRATEGIC_NOTE_IMPACTS: Array<{
  id: StrategicNoteImpact;
  label: string;
  desc: string;
  badgeClass: string;
}> = [
  { 
    id: "high_positive", 
    label: "🚀 Yüksek Büyüme (+%15+)", 
    desc: "Büyük SERP sıçraması ve organik trafik patlaması",
    badgeClass: "bg-emerald-600 text-white" 
  },
  { 
    id: "moderate_positive", 
    label: "📈 Ilımlı Artış (+%5-%15)", 
    desc: "İstikrarlı ve dengeli pozisyon yükselişi",
    badgeClass: "bg-teal-600 text-white" 
  },
  { 
    id: "neutral_stable", 
    label: "🛡️ Pozisyon Koruma", 
    desc: "Mevcut sıralamaları savunma ve dalgalanmayı önleme",
    badgeClass: "bg-slate-600 text-white" 
  },
  { 
    id: "risk_volatility", 
    label: "⚠️ Risk / Oynaklık", 
    desc: "Algoritma veya rakip atağı kaynaklı olası dalgalanma",
    badgeClass: "bg-rose-600 text-white" 
  }
];

export const DEFAULT_STRATEGIC_FORECAST_NOTES: Record<number, StrategicForecastNote> = {
  1: {
    monthIndex: 1,
    monthLabel: "Eki 2026",
    fullMonth: "Ekim 2026 (1. Ay Öngörüsü)",
    note: "Mobil Core Web Vitals (LCP < 2.5s) optimizasyonu canlıya alınacak ve 15 yeni rehber içerik yayına girecek.",
    category: "technical",
    expectedImpact: "moderate_positive",
    actionItems: ["PSI 85+ hedeflendi", "15 rehber içerik yayını"],
    updatedAt: "Bugün"
  },
  2: {
    monthIndex: 2,
    monthLabel: "Kas 2026",
    fullMonth: "Kasım 2026 (2. Ay Öngörüsü)",
    note: "Black Friday ve Yılbaşı alışveriş sezonu için ana hedef kategorilerinde 30 yeni landing page güncellenecek.",
    category: "campaign",
    expectedImpact: "high_positive",
    actionItems: ["Black Friday landing page'leri", "Ürün schema zenginleştirmesi"],
    updatedAt: "Bugün"
  },
  3: {
    monthIndex: 3,
    monthLabel: "Ara 2026",
    fullMonth: "Aralık 2026 (3. Ay Öngörüsü)",
    note: "Sektörel haber sitelerinden 8 adet yüksek otoriteli (DA 60+) backlink lansmanı ve dahili linkleme mimarisi revizyonu.",
    category: "backlink",
    expectedImpact: "high_positive",
    actionItems: ["8 adet DA 60+ backlink", "Silo dahili linkleme"],
    updatedAt: "Bugün"
  },
  5: {
    monthIndex: 5,
    monthLabel: "Şub 2027",
    fullMonth: "Şubat 2027 (5. Ay Öngörüsü)",
    note: "Google Core Search algoritma güncellemesine hazırlık: Kapsamlı E-E-A-T yazar kutuları ve güvenilirlik sinyalleri denetimi.",
    category: "algorithm",
    expectedImpact: "neutral_stable",
    actionItems: ["E-E-A-T denetimi", "Yazar biyografileri"],
    updatedAt: "Bugün"
  },
  6: {
    monthIndex: 6,
    monthLabel: "Mar 2027",
    fullMonth: "Mart 2027 (6. Ay Öngörüsü)",
    note: "Q1 final hedefi: Rakip 1 ve Rakip 2'nin önünde ilk 3 sıraya yerleşerek aylık 45.000+ organik tıklama hacmine ulaşmak.",
    category: "content",
    expectedImpact: "high_positive",
    actionItems: ["İlk 3 sıra penetrasyonu", "45k organik tıklama"],
    updatedAt: "Bugün"
  }
};

const QUICK_NOTE_SNIPPETS = [
  "🎯 20 Yeni Kategori Rehberi ve Hub Sayfaları Yayını",
  "⚡ Mobil PageSpeed LCP < 2.5s ve INP Optimizasyonu",
  "🛍️ Black Friday & Yılbaşı Sezonu İçin Özel Landing Page",
  "🔗 8 Adet DA 60+ Sektörel Otorite Backlink Çalışması",
  "🔍 Kapsamlı FAQ & HowTo Schema Zenginleştirilmesi",
  "🛡️ Google Çekirdek Algoritma Güncellemesi Güvenlik Denetimi"
];

interface StrategicForecastNotesBoxProps {
  notes: Record<number, StrategicForecastNote>;
  selectedMonthIndex: number;
  onSelectMonth: (monthIndex: number) => void;
  onSaveNote: (note: StrategicForecastNote) => void;
  onDeleteNote: (monthIndex: number) => void;
  onResetNotes: () => void;
  onPopulateDefaults: () => void;
  userProfile?: CompetitorGrowthProfile;
  isOpen: boolean;
  onToggleOpen: () => void;
  selectedMetric: TrendMetricType;
}

export const StrategicForecastNotesBox: React.FC<StrategicForecastNotesBoxProps> = ({
  notes,
  selectedMonthIndex,
  onSelectMonth,
  onSaveNote,
  onDeleteNote,
  onResetNotes,
  onPopulateDefaults,
  userProfile,
  isOpen,
  onToggleOpen,
  selectedMetric
}) => {
  const activeMonthInfo = FORECAST_MONTHS[selectedMonthIndex] || FORECAST_MONTHS[0];
  const existingNote = notes[selectedMonthIndex];

  // Local form edit state
  const [draftNote, setDraftNote] = useState<string>("");
  const [draftCategory, setDraftCategory] = useState<StrategicNoteCategory>("content");
  const [draftImpact, setDraftImpact] = useState<StrategicNoteImpact>("moderate_positive");
  const [showSavedFeedback, setShowSavedFeedback] = useState<boolean>(false);
  const [showSummaryGrid, setShowSummaryGrid] = useState<boolean>(false);

  // Sync draft when selected month changes
  useEffect(() => {
    if (existingNote) {
      setDraftNote(existingNote.note);
      setDraftCategory(existingNote.category);
      setDraftImpact(existingNote.expectedImpact);
    } else {
      setDraftNote("");
      setDraftCategory("content");
      setDraftImpact("moderate_positive");
    }
    setShowSavedFeedback(false);
  }, [selectedMonthIndex, existingNote]);

  const totalNotesCount = Object.keys(notes).length;

  const handleSave = () => {
    if (!draftNote.trim()) return;
    const newNote: StrategicForecastNote = {
      monthIndex: selectedMonthIndex,
      monthLabel: activeMonthInfo.label,
      fullMonth: activeMonthInfo.full,
      note: draftNote.trim(),
      category: draftCategory,
      expectedImpact: draftImpact,
      updatedAt: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
    };
    onSaveNote(newNote);
    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 2500);
  };

  const handleDelete = () => {
    onDeleteNote(selectedMonthIndex);
    setDraftNote("");
  };

  const handleAppendSnippet = (snippet: string) => {
    setDraftNote((prev) => {
      if (!prev.trim()) return snippet;
      return `${prev}\n• ${snippet}`;
    });
  };

  const userPoint = userProfile?.points[selectedMonthIndex];
  const metricDisplay = userPoint ? (
    selectedMetric === "traffic" ? `${userPoint.traffic.toLocaleString("tr-TR")} tık/ay`
    : selectedMetric === "visibility" ? `%${userPoint.visibility} Görünürlük`
    : `#${userPoint.avgRank} Ort. Sıra`
  ) : null;

  return (
    <div
      id="strategic-forecast-notes-container"
      data-testid="strategic-forecast-notes-container"
      className="rounded-2xl border border-indigo-200/90 bg-white shadow-xs overflow-hidden transition-all duration-300"
    >
      {/* 1. Header Bar with Month Timeline Navigation */}
      <div className="p-3.5 sm:p-4 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-3 select-none">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center shrink-0 shadow-inner text-amber-300">
            <Bookmark className="w-4 h-4 fill-amber-300/30" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                <span>Aylık Stratejik Tahmin Notları & Eylem Planı</span>
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black font-mono">
                {totalNotesCount}/7 Ay Notlu
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              6 aylık D3.js büyüme grafiğinde her ay için ekibinizin hedef stratejilerini ve tahmin açıklamalarını ekleyin.
            </p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            id="btn-toggle-all-notes-summary"
            data-testid="btn-toggle-all-notes-summary"
            onClick={() => setShowSummaryGrid((prev) => !prev)}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
              showSummaryGrid
                ? "bg-amber-400 text-slate-950 border-amber-300 font-black shadow-xs"
                : "bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white"
            }`}
            title="Tüm 6 ayın stratejik tahmin notlarını tek bir çizelgede inceleyin"
          >
            <Target className="w-3.5 h-3.5" />
            <span>{showSummaryGrid ? "Editöre Dön" : "Tüm Ayları Gör"}</span>
          </button>

          {totalNotesCount === 0 && (
            <button
              type="button"
              id="btn-load-default-strategic-notes"
              data-testid="btn-load-default-strategic-notes"
              onClick={onPopulateDefaults}
              className="px-2.5 py-1 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400/50 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="Gerçekçi örnek stratejik tahmin notlarını yükle"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Örnek Notları Doldur</span>
            </button>
          )}

          <button
            type="button"
            id="btn-toggle-strategic-notes-box"
            data-testid="btn-toggle-strategic-notes-box"
            onClick={onToggleOpen}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            title={isOpen ? "Açıklama Kutusunu Daralt" : "Açıklama Kutusunu Genişlet"}
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. Interactive Month Selector Strip (Always visible or toggled) */}
      <div className="p-2 sm:px-4 sm:py-2.5 bg-slate-50/90 border-b border-slate-200/80 overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          <span className="text-[11px] font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            <span>Ay Seç:</span>
          </span>

          {FORECAST_MONTHS.map((m) => {
            const isSelected = m.index === selectedMonthIndex;
            const hasNote = Boolean(notes[m.index]);
            const noteObj = notes[m.index];
            const catObj = noteObj ? STRATEGIC_NOTE_CATEGORIES.find((c) => c.id === noteObj.category) : null;

            return (
              <button
                key={m.index}
                type="button"
                id={`btn-month-tab-${m.index}`}
                data-testid={`btn-month-tab-${m.index}`}
                onClick={() => onSelectMonth(m.index)}
                className={`group relative px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  isSelected
                    ? "bg-indigo-600 text-white border-indigo-700 shadow-sm ring-2 ring-indigo-200 scale-[1.02]"
                    : hasNote
                    ? "bg-white text-slate-800 border-indigo-200 hover:bg-indigo-50/50 shadow-2xs"
                    : "bg-white/80 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-800"
                }`}
                title={`${m.full} ${hasNote ? `(Stratejik Not: ${noteObj?.note.slice(0, 40)}...)` : "(Not girilmemiş)"}`}
              >
                <span>{m.short}</span>
                {m.index > 0 && <span className="text-[10px] opacity-75 font-mono">({m.index}.Ay)</span>}

                {/* Has Note Indicator Badge */}
                {hasNote && (
                  <span
                    className={`w-2 h-2 rounded-full ring-1 ring-white ${
                      isSelected ? "bg-amber-300" : "bg-indigo-600"
                    }`}
                    style={catObj ? { backgroundColor: isSelected ? "#fcd34d" : catObj.dotColor } : undefined}
                    title={`Not Kayıtlı: ${catObj?.label || "Strateji"}`}
                  />
                )}
              </button>
            );
          })}

          <div className="ml-auto flex items-center gap-1 pl-2 text-slate-400">
            <button
              type="button"
              id="btn-prev-month"
              data-testid="btn-prev-month"
              disabled={selectedMonthIndex <= 0}
              onClick={() => onSelectMonth(Math.max(0, selectedMonthIndex - 1))}
              className="p-1 rounded-lg hover:bg-slate-200 text-slate-600 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              title="Önceki Ay"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              id="btn-next-month"
              data-testid="btn-next-month"
              disabled={selectedMonthIndex >= 6}
              onClick={() => onSelectMonth(Math.min(6, selectedMonthIndex + 1))}
              className="p-1 rounded-lg hover:bg-slate-200 text-slate-600 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              title="Sonraki Ay"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Interactive Body (When Open) */}
      {isOpen && (
        <div className="p-4 sm:p-5 space-y-4">
          {showSummaryGrid ? (
            /* All Months Strategic Notes Summary Breakdown */
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-indigo-600" />
                  <span>6 Aylık Stratejik SEO Yol Haritası & Not Matrisi</span>
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {totalNotesCount} ay için stratejik not girildi
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {FORECAST_MONTHS.map((m) => {
                  const item = notes[m.index];
                  const cat = item ? STRATEGIC_NOTE_CATEGORIES.find((c) => c.id === item.category) : null;
                  const imp = item ? STRATEGIC_NOTE_IMPACTS.find((i) => i.id === item.expectedImpact) : null;

                  return (
                    <div
                      key={m.index}
                      onClick={() => {
                        onSelectMonth(m.index);
                        setShowSummaryGrid(false);
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        m.index === selectedMonthIndex
                          ? "border-indigo-500 bg-indigo-50/70 shadow-xs ring-2 ring-indigo-200"
                          : item
                          ? "border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xs"
                          : "border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-slate-400"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className="font-black text-xs text-slate-900">
                            {m.label} <span className="text-[10px] font-normal text-slate-500 font-mono">({m.short})</span>
                          </span>
                          {cat && (
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold font-mono ${cat.badgeClass}`}>
                              {cat.label}
                            </span>
                          )}
                        </div>

                        {item ? (
                          <>
                            <p className="text-xs text-slate-700 leading-relaxed line-clamp-3">
                              "{item.note}"
                            </p>
                            {imp && (
                              <div className="mt-2 text-[10px] font-mono font-bold text-slate-600">
                                {imp.label}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="py-4 text-center text-slate-400 text-xs italic">
                            Henüz stratejik not eklenmemiş. Tıklayarak not girin.
                          </div>
                        )}
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold">
                        <span className="text-indigo-600 hover:underline">Düzenle ➔</span>
                        {item && <span className="text-slate-400 font-mono">{item.updatedAt}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Active Selected Month Interactive Note Editor */
            <div className="space-y-4">
              {/* Selected Month Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-indigo-50/80 border border-indigo-100 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
                  <span className="font-black text-indigo-950 text-sm">
                    {activeMonthInfo.full}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white text-indigo-800 text-[10px] font-bold border border-indigo-200">
                    {selectedMonthIndex === 0 ? "Mevcut Ay" : `${selectedMonthIndex}. Projeksiyon Ayı`}
                  </span>
                </div>

                {metricDisplay && (
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-600 bg-white/80 px-2.5 py-1 rounded-lg border border-indigo-100">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Algoritmik Öngörü:</span>
                    <strong className="text-indigo-950">{metricDisplay}</strong>
                  </div>
                )}
              </div>

              {/* Category & Impact Pickers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* 1. Strateji Kategorisi */}
                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1.5 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Stratejik Eylem Kategorisi:</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {STRATEGIC_NOTE_CATEGORIES.map((cat) => {
                      const isSelected = draftCategory === cat.id;
                      const Icon = cat.icon;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          id={`btn-cat-${cat.id}`}
                          data-testid={`btn-cat-${cat.id}`}
                          onClick={() => setDraftCategory(cat.id)}
                          className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? "bg-slate-900 text-white border-slate-900 shadow-xs ring-2 ring-indigo-200 font-black"
                              : `${cat.badgeClass}`
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Beklenen Momentum / Etki Seviyesi */}
                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1.5 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Beklenen Momentum / SERP Etkisi:</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {STRATEGIC_NOTE_IMPACTS.map((imp) => {
                      const isSelected = draftImpact === imp.id;
                      return (
                        <button
                          key={imp.id}
                          type="button"
                          id={`btn-impact-${imp.id}`}
                          data-testid={`btn-impact-${imp.id}`}
                          onClick={() => setDraftImpact(imp.id)}
                          className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? `${imp.badgeClass} border-transparent shadow-xs ring-2 ring-indigo-200 font-black`
                              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                          }`}
                          title={imp.desc}
                        >
                          <span>{imp.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 3. Textarea Note Input */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <label htmlFor="textarea-strategic-forecast-note" className="text-[11px] font-black text-slate-700 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Stratejik Tahmin Notu & Aksiyon Açıklaması:</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {draftNote.length} karakter
                  </span>
                </div>

                <textarea
                  id="textarea-strategic-forecast-note"
                  data-testid="textarea-strategic-forecast-note"
                  rows={3}
                  value={draftNote}
                  onChange={(e) => setDraftNote(e.target.value)}
                  placeholder={`Örn: Bu ay için ${activeMonthInfo.label} döneminde 10 yeni kategori rehberi yayına alınacak, mobil Core Web Vitals skoru 90+'ya çıkarılacak ve Rakip 1'in SERP payı hedeflenecek...`}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-xs text-slate-800 placeholder-slate-400 transition-all font-sans leading-relaxed resize-y"
                />
              </div>

              {/* 4. Quick Predefined Action Snippets */}
              <div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Hızlı Stratejik Şablon Ekle:</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_NOTE_SNIPPETS.map((snippet, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAppendSnippet(snippet)}
                      className="text-[11px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors cursor-pointer text-left"
                    >
                      + {snippet}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Action Buttons & Feedback */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    id="btn-save-strategic-note"
                    data-testid="btn-save-strategic-note"
                    onClick={handleSave}
                    disabled={!draftNote.trim()}
                    className="px-4 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:pointer-events-none text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{existingNote ? "Notu Güncelle" : "Notu Kaydet"}</span>
                  </button>

                  {existingNote && (
                    <button
                      type="button"
                      id="btn-delete-strategic-note"
                      data-testid="btn-delete-strategic-note"
                      onClick={handleDelete}
                      className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Bu ayın stratejik notunu sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Notu Sil</span>
                    </button>
                  )}

                  {showSavedFeedback && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 animate-fade-in">
                      <Check className="w-3.5 h-3.5" />
                      <span>{activeMonthInfo.label} stratejik notu kaydedildi!</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {totalNotesCount > 0 && (
                    <button
                      type="button"
                      id="btn-reset-all-strategic-notes"
                      data-testid="btn-reset-all-strategic-notes"
                      onClick={onResetNotes}
                      className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 cursor-pointer transition-colors"
                      title="Tüm ayların notlarını temizle"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Tüm Notları Sıfırla</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
