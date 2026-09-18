import React, { useState, useEffect } from "react";
import { 
  StickyNote, 
  Save, 
  Trash2, 
  X, 
  Check, 
  Sparkles, 
  Copy, 
  Clock, 
  Tag, 
  Lightbulb,
  ShieldAlert,
  Zap,
  TrendingUp,
  FileText
} from "lucide-react";

export interface StrategicCompetitorNote {
  text: string;
  updatedAt: string;
  tags?: string[];
}

interface RowStrategicNotepadProps {
  itemId: string;
  keyword: string;
  competitorName?: string;
  userRank?: number | null;
  competitorRank?: number | null;
  note?: StrategicCompetitorNote;
  onSave: (text: string, tags?: string[]) => void;
  onDelete: () => void;
  onClose: () => void;
  toastMessage?: string | null;
}

const STRATEGIC_QUICK_SNIPPETS = [
  { label: "⚡ Mobil Hız Fırsatı", snippet: "Rakibin mobil açılış hızı yavaş (LCP > 3.0s). Cloudflare Edge CDN ve optimize görsel yapımızla bu kelimede kolayca öne geçebiliriz." },
  { label: "📝 SSS & Şema Boşluğu", snippet: "Rakip sayfada FAQ Schema ve detaylı teknik açıklamalar eksik. Sayfamıza yapılandırılmış veri ve zengin SSS ekleyerek öne çıkalım." },
  { label: "🔗 Backlink Zayıflığı", snippet: "Bu URL'e gelen referans domain sayısı düşük (< 5 domain). Güçlü bir otorite backlinki ile ilk 3 pozisyon hedeflenebilir." },
  { label: "💰 Fiyat Şeffaflığı", snippet: "Rakip fiyatları gizli tutuyor. Başlıkta 'Şeffaf Fiyat Garantisi' vurgusu yaparak tıklama oranını (CTR) %35 artırabiliriz." },
  { label: "🎯 Ticari Arama Niyeti", snippet: "Kullanıcılar doğrudan teklif ve çözüm arıyor. İletişim formunu ve WhatsApp hızlı arama butonunu sayfanın ilk ekranına sabitleyelim." }
];

const AVAILABLE_STRATEGY_TAGS = [
  { id: "kritik", label: "🚨 Kritik Rakip", color: "bg-rose-100 text-rose-800 border-rose-300" },
  { id: "hizli_kazanim", label: "⚡ Hızlı Kazanım", color: "bg-amber-100 text-amber-800 border-amber-300" },
  { id: "icerik_firsati", label: "📝 İçerik Boşluğu", color: "bg-indigo-100 text-indigo-800 border-indigo-300" },
  { id: "izlemede", label: "👀 İzlemede", color: "bg-slate-100 text-slate-800 border-slate-300" }
];

export const RowStrategicNotepad: React.FC<RowStrategicNotepadProps> = ({
  itemId,
  keyword,
  competitorName = "Rakip",
  userRank,
  competitorRank,
  note,
  onSave,
  onDelete,
  onClose,
  toastMessage
}) => {
  const [draftText, setDraftText] = useState<string>(note?.text || "");
  const [selectedTags, setSelectedTags] = useState<string[]>(note?.tags || []);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isSavedRecently, setIsSavedRecently] = useState<boolean>(false);

  useEffect(() => {
    setDraftText(note?.text || "");
    setSelectedTags(note?.tags || []);
  }, [note]);

  const handleAppendSnippet = (snippet: string) => {
    setDraftText((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return snippet;
      return `${trimmed}\n• ${snippet}`;
    });
  };

  const handleToggleTag = (tagLabel: string) => {
    setSelectedTags((prev) => 
      prev.includes(tagLabel) 
        ? prev.filter((t) => t !== tagLabel)
        : [...prev, tagLabel]
    );
  };

  const handleSave = () => {
    if (!draftText.trim()) return;
    onSave(draftText.trim(), selectedTags);
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 2200);
  };

  const handleCopyNote = () => {
    if (!draftText) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(draftText).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      });
    }
  };

  return (
    <div 
      id={`notepad-container-${itemId}`}
      data-testid={`notepad-container-${itemId}`}
      className="rounded-2xl bg-amber-50/80 border-2 border-amber-300/90 shadow-md p-4 space-y-3.5 text-slate-900 transition-all duration-200 animate-fade-in"
    >
      {/* 1. Header with Title, Target Competitor Context, and Close Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/90 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-xs shrink-0">
            <StickyNote className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
                <span>Stratejik Rakip Not Defteri</span>
                <span className="text-amber-800 font-bold">"{keyword || 'Seçili Kelime'}"</span>
              </h4>
              {note?.updatedAt && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-200/70 text-amber-900 text-[10px] font-mono font-bold">
                  <Clock className="w-3 h-3" />
                  <span>Son Kayıt: {note.updatedAt}</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-600">
              Bu kelimedeki rakip analizlerinizi, içerik açıklarını ve hedeflenen SEO aksiyonlarını not alın.
            </p>
          </div>
        </div>

        {/* Right context tags & close */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white border border-amber-200 text-slate-700 font-mono">
            {competitorName}: #{competitorRank ?? "-"} vs Siteniz: #{userRank ?? "-"}
          </span>
          <button
            type="button"
            id={`btn-close-note-${itemId}`}
            data-testid={`btn-close-note-${itemId}`}
            onClick={onClose}
            className="p-1 rounded-lg bg-amber-200/60 hover:bg-amber-300 text-amber-900 transition-colors cursor-pointer"
            title="Not defterini kapat"
            aria-label="Not defterini kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Quick Strategy Prompt Snippets (Hızlı Strateji Ekle) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-bold text-amber-900">
          <span className="flex items-center gap-1">
            <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
            <span>Hızlı Strateji Önerileri (Tıklayarak nota ekleyin):</span>
          </span>
          <span className="text-[10px] text-slate-500 font-normal">Tek tıkla ekler</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {STRATEGIC_QUICK_SNIPPETS.map((snip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleAppendSnippet(snip.snippet)}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-100 border border-amber-300/80 text-[11px] font-semibold text-slate-800 hover:text-amber-950 transition-all cursor-pointer shadow-2xs active:scale-95 text-left"
              title={snip.snippet}
            >
              {snip.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Text Area for Strategic Notes */}
      <div className="space-y-1">
        <textarea
          id={`textarea-strategic-note-${itemId}`}
          data-testid={`textarea-strategic-note-${itemId}`}
          value={draftText}
          onChange={(e) => setDraftText(e.target.value)}
          rows={3}
          placeholder={`"${keyword}" için rakibin zayıf yönlerini (örn. yavaş mobil hız, yetersiz içerik uzunluğu, eksik SSS) ve sitenizin sıralama kazanma planını yazın...`}
          className="w-full p-3 rounded-xl bg-white border border-amber-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-400/40 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden transition-all shadow-inner leading-relaxed"
        />
        <div className="flex items-center justify-between text-[10px] text-slate-500 px-1">
          <span>Stratejik notlar otomatik olarak yerel hafızada (localStorage) saklanır.</span>
          <span className="font-mono font-medium">{draftText.length} karakter</span>
        </div>
      </div>

      {/* 4. Strategic Category Badges (Etiketler) */}
      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
        <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1 mr-1">
          <Tag className="w-3 h-3 text-slate-500" />
          <span>Etiketler:</span>
        </span>
        {AVAILABLE_STRATEGY_TAGS.map((t) => {
          const isActive = selectedTags.includes(t.label);
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => handleToggleTag(t.label)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all cursor-pointer active:scale-95 ${
                isActive 
                  ? `${t.color} shadow-xs font-black ring-1 ring-amber-400`
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {isActive ? `✓ ${t.label}` : t.label}
            </button>
          );
        })}
      </div>

      {/* 5. Footer Actions: Kaydet, Kopyala, Sil, Kapat & Feedback Toast */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2 border-t border-amber-200/90">
        
        {/* Status Toast or Help Message */}
        <div className="text-xs font-bold">
          {(isSavedRecently || toastMessage) ? (
            <span className="text-emerald-700 flex items-center gap-1.5 animate-pulse">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{toastMessage || "Stratejik not kaydedildi!"}</span>
            </span>
          ) : draftText.trim() !== (note?.text || "").trim() ? (
            <span className="text-amber-800 text-[11px]">
              ⚠️ Kaydedilmemiş değişiklikler var.
            </span>
          ) : (
            <span className="text-slate-500 text-[11px]">
              Notunuz tablodaki bu rakip satırında her zaman görünecektir.
            </span>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {draftText.trim().length > 0 && (
            <button
              type="button"
              id={`btn-copy-note-${itemId}`}
              data-testid={`btn-copy-note-${itemId}`}
              onClick={handleCopyNote}
              className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
              title="Notu panoya kopyala"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? "Kopyalandı" : "Kopyala"}</span>
            </button>
          )}

          {note && (
            <button
              type="button"
              id={`btn-delete-note-${itemId}`}
              data-testid={`btn-delete-note-${itemId}`}
              onClick={onDelete}
              className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs active:scale-95"
              title="Bu satıra ait notu tamamen sil"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Notu Sil</span>
            </button>
          )}

          <button
            type="button"
            id={`btn-save-note-${itemId}`}
            data-testid={`btn-save-note-${itemId}`}
            onClick={handleSave}
            disabled={!draftText.trim()}
            className="px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 disabled:opacity-50 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-amber-400/30"
            title="Stratejik notu yerel hafızaya kaydet"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Kaydet</span>
          </button>
        </div>
      </div>
    </div>
  );
};
