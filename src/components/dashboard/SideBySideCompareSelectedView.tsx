import React from "react";
import {
  Columns3,
  X,
  Trophy,
  AlertTriangle,
  Flame,
  CheckCircle2,
  BarChart3,
  FileDown,
  RotateCcw,
  Sparkles,
  Search,
  ArrowUpRight,
  TrendingUp,
  StickyNote,
  Scale,
  Plus
} from "lucide-react";
import { CompetitorKeywordRanking } from "../../types";

export interface SideBySideCompareSelectedViewProps {
  selectedRankings: CompetitorKeywordRanking[];
  allRankings: CompetitorKeywordRanking[];
  competitors: { name: string; domain: string; rank?: number; speedScore?: number }[];
  userName?: string;
  userDomain?: string;
  onDeselectRanking: (id: string) => void;
  onSelectRanking?: (id: string) => void;
  onExitCompareView: () => void;
  onOpenChartModal?: () => void;
  onExportPdf?: () => void;
  onClearSelection: () => void;
  strategicNotes?: Record<string, { text: string; category?: string; priority?: string; date?: string }>;
  onOpenStrategicNoteModal?: (item: CompetitorKeywordRanking) => void;
  onApplyKeyword?: (keyword: string) => void;
}

export const SideBySideCompareSelectedView: React.FC<SideBySideCompareSelectedViewProps> = ({
  selectedRankings,
  allRankings,
  competitors,
  userName = "Siteniz",
  userDomain = "sitemiz.com.tr",
  onDeselectRanking,
  onSelectRanking,
  onExitCompareView,
  onOpenChartModal,
  onExportPdf,
  onClearSelection,
  strategicNotes = {},
  onOpenStrategicNoteModal,
  onApplyKeyword
}) => {
  const comp1 = competitors[0] || { name: "1. Rakip", domain: "rakip1.com" };
  const comp2 = competitors[1] || { name: "2. Rakip", domain: "rakip2.com" };
  const comp3 = competitors[2] || { name: "3. Rakip", domain: "rakip3.com" };

  // Calculate summary metrics across the chosen competitors
  const totalVolume = selectedRankings.reduce((acc, r) => {
    const num = parseInt(r.monthlyVolume.replace(/[^0-9]/g, ""), 10);
    return acc + (isNaN(num) ? 0 : num);
  }, 0);

  const avgDifficulty = selectedRankings.length > 0
    ? Math.round(selectedRankings.reduce((acc, r) => acc + (r.difficulty || 0), 0) / selectedRankings.length)
    : 0;

  const leadingCount = selectedRankings.filter((r) => {
    const compRanks = [r.comp1Rank, r.comp2Rank, r.comp3Rank].filter((k): k is number => k !== null);
    const bestComp = compRanks.length > 0 ? Math.min(...compRanks) : 1;
    return r.userRank !== null && r.userRank <= bestComp;
  }).length;

  const trailingCount = selectedRankings.length - leadingCount;

  // Potential items to add if less than 3 are selected
  const unselectedRankings = allRankings.filter(
    (r) => !selectedRankings.some((sr) => sr.id === r.id)
  ).slice(0, 5);

  return (
    <div
      id="side-by-side-compare-selected-view"
      data-testid="side-by-side-compare-selected-view"
      className="p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-white border-2 border-amber-400/60 shadow-2xl shadow-indigo-950/40 space-y-5 animate-in fade-in duration-200 relative overflow-hidden"
    >
      {/* Decorative backdrop accents */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* 1. Header & Controls */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black shadow-xs">
              <Columns3 className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Yan Yana 'Compare Selected' Görünümü</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 text-xs font-mono font-bold">
              {selectedRankings.length} Rakip Satırı Odaklandı
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Odaklanmış Rakip Karşılaştırma Analizi</span>
            <Scale className="w-5 h-5 text-amber-300" />
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Seçtiğiniz rakipler yan yana hizalanarak sıralamalar, metrik farkları ve yapay zeka stratejileri doğrudan karşılaştırılıyor. Aşağıdaki tablo da yalnızca bu seçilen rakiplere göre filtrelenmiştir.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {onOpenChartModal && (
            <button
              type="button"
              id="btn-compare-view-open-chart"
              data-testid="btn-compare-view-open-chart"
              onClick={onOpenChartModal}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
              title="Seçili rakipleri D3 grafiğinde inceleyin"
            >
              <BarChart3 className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>D3 Grafiği</span>
            </button>
          )}

          {onExportPdf && (
            <button
              type="button"
              id="btn-compare-view-export-pdf"
              data-testid="btn-compare-view-export-pdf"
              onClick={onExportPdf}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 border border-indigo-400/40"
              title="Seçili rakiplerin karşılaştırma raporunu PDF olarak indirin"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>PDF Al</span>
            </button>
          )}

          <button
            type="button"
            id="btn-compare-view-clear"
            data-testid="btn-compare-view-clear"
            onClick={onClearSelection}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700 active:scale-95"
            title="Tüm seçimleri temizle"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Seçimi Temizle</span>
          </button>

          <button
            type="button"
            id="btn-exit-compare-selected-view"
            data-testid="btn-exit-compare-selected-view"
            onClick={onExitCompareView}
            className="px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-amber-400/30 active:scale-95"
            title="Yan yana karşılaştırma modundan çıkın ve tüm tabloyu görüntüleyin"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
            <span>Tüm Tabloyu Göster (Çıkış)</span>
          </button>
        </div>
      </div>

      {/* 2. Quick Benchmarks & Win/Loss Tally Strip */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
              Siz Öndesiniz
            </span>
            <span className="text-base font-black text-emerald-400">
              {leadingCount} / {selectedRankings.length} Kelime
            </span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
              Rakip Önde
            </span>
            <span className="text-base font-black text-rose-400">
              {trailingCount} Kelime
            </span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
              Toplam Arama Hacmi
            </span>
            <span className="text-base font-black text-amber-300 font-mono">
              {totalVolume.toLocaleString()} / ay
            </span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
              Ortalama Zorluk (KD)
            </span>
            <span className="text-base font-black text-indigo-300 font-mono">
              {avgDifficulty}/100
            </span>
          </div>
        </div>
      </div>

      {/* 3. Side-by-Side Competitor Cards Grid */}
      <div className="relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 items-stretch">
          {selectedRankings.map((item, idx) => {
            const compRanks = [item.comp1Rank, item.comp2Rank, item.comp3Rank].filter((r): r is number => r !== null);
            const bestCompRank = compRanks.length > 0 ? Math.min(...compRanks) : 1;
            const isLeading = item.userRank !== null && item.userRank <= bestCompRank;
            const gap = item.userRank !== null ? item.userRank - bestCompRank : 99;

            // Top competitor detail
            const compList = [
              { name: comp1.name, domain: comp1.domain, rank: item.comp1Rank },
              { name: comp2.name, domain: comp2.domain, rank: item.comp2Rank },
              { name: comp3.name, domain: comp3.domain, rank: item.comp3Rank }
            ].filter((c): c is { name: string; domain: string; rank: number } => c.rank !== null)
             .sort((a, b) => a.rank - b.rank);
            const topComp = compList[0];

            const note = strategicNotes[item.id];
            const customCompName = (item as any).competitorName;

            return (
              <div
                key={item.id}
                id={`side-by-side-card-${item.id}`}
                data-testid={`side-by-side-card-${item.id}`}
                className="rounded-2xl bg-slate-800/90 border border-slate-700 flex flex-col justify-between hover:border-amber-400/70 transition-all shadow-lg hover:shadow-amber-400/10 overflow-hidden"
              >
                {/* Card Top Strip */}
                <div className="p-4 border-b border-slate-700/80 bg-slate-850/60 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 font-mono font-bold text-xs border border-amber-400/30">
                      #{idx + 1} Odak
                    </span>
                    
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-bold text-[10px] border border-indigo-500/30">
                      {item.searchIntent}
                    </span>

                    <button
                      type="button"
                      id={`btn-remove-from-compare-${item.id}`}
                      data-testid={`btn-remove-from-compare-${item.id}`}
                      onClick={() => onDeselectRanking(item.id)}
                      className="text-slate-400 hover:text-rose-400 p-1 rounded-md hover:bg-slate-700 cursor-pointer transition-colors"
                      title="Bu rakibi yan yana karşılaştırmadan çıkar"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <h4 className="text-base font-black text-white line-clamp-1" title={item.keyword}>
                      {item.keyword}
                    </h4>
                    {customCompName && (
                      <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1 mt-0.5">
                        <span>🏢 {customCompName}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Head-to-Head Rank Battle (Sıralama Karşılaştırma Matrisi) */}
                <div className="p-4 space-y-3.5 flex-1">
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Sıralama Karşılaştırması (SERP)
                    </span>
                    
                    <div className="grid grid-cols-4 gap-1.5 text-center">
                      {/* Siteniz */}
                      <div className={`p-2 rounded-xl border ${
                        isLeading
                          ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                          : "bg-slate-900 border-indigo-500/40 text-white"
                      }`}>
                        <span className="text-[9px] font-bold block text-slate-400 truncate" title={userName}>
                          Siz
                        </span>
                        <span className="text-base font-black font-mono">
                          {item.userRank !== null ? `#${item.userRank}` : "-"}
                        </span>
                      </div>

                      {/* 1. Rakip */}
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white">
                        <span className="text-[9px] font-bold block text-slate-400 truncate" title={comp1.name}>
                          {comp1.name.split(" ")[0]}
                        </span>
                        <span className="text-base font-bold font-mono text-slate-300">
                          {item.comp1Rank !== null ? `#${item.comp1Rank}` : "-"}
                        </span>
                      </div>

                      {/* 2. Rakip */}
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white">
                        <span className="text-[9px] font-bold block text-slate-400 truncate" title={comp2.name}>
                          {comp2.name.split(" ")[0]}
                        </span>
                        <span className="text-base font-bold font-mono text-slate-300">
                          {item.comp2Rank !== null ? `#${item.comp2Rank}` : "-"}
                        </span>
                      </div>

                      {/* 3. Rakip */}
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white">
                        <span className="text-[9px] font-bold block text-slate-400 truncate" title={comp3.name}>
                          {comp3.name.split(" ")[0]}
                        </span>
                        <span className="text-base font-bold font-mono text-slate-300">
                          {item.comp3Rank !== null ? `#${item.comp3Rank}` : "-"}
                        </span>
                      </div>
                    </div>

                    {/* Gap Indicator */}
                    <div className="pt-1 flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">Liderlik Durumu:</span>
                      {isLeading ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          <Trophy className="w-3 h-3" />
                          <span>Öndesiniz ({gap <= 0 ? gap : `+${gap}`})</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{gap > 0 ? `+${gap} sıra geride` : "İlk 20 Dışı"}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Core Metrics Box */}
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Aylık Arama:</span>
                      <span className="font-mono font-bold text-white">{item.monthlyVolume}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Zorluk (KD):</span>
                      <span className="font-mono font-bold text-indigo-300">{item.difficulty}/100</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Trafik Fırsatı:</span>
                      <span className="font-mono font-bold text-emerald-400">{item.trafficOpportunity}</span>
                    </div>
                    {topComp && (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                        <span className="text-slate-400">En İyi Rakip:</span>
                        <span className="font-bold text-amber-300 truncate max-w-[130px]" title={`${topComp.name} (${topComp.domain})`}>
                          {topComp.name} (#{topComp.rank})
                        </span>
                      </div>
                    )}
                  </div>

                  {/* AI Recommendation */}
                  {item.aiRecommendation && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/20 space-y-1">
                      <div className="flex items-center gap-1 text-amber-300 font-bold text-[11px]">
                        <Sparkles className="w-3 h-3" />
                        <span>Gemini Tavsiyesi</span>
                      </div>
                      <p className="text-[11px] text-slate-300 line-clamp-3 leading-relaxed">
                        {item.aiRecommendation}
                      </p>
                    </div>
                  )}

                  {/* Strategic Note */}
                  {note && note.text && (
                    <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-400/20 text-xs text-indigo-200">
                      <div className="flex items-center gap-1 font-bold text-[10px] text-indigo-300 mb-0.5">
                        <StickyNote className="w-3 h-3" />
                        <span>Stratejik Not:</span>
                      </div>
                      <p className="text-[11px] line-clamp-2">{note.text}</p>
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="p-3 bg-slate-850 border-t border-slate-700/80 flex items-center justify-between gap-2">
                  {onOpenStrategicNoteModal && (
                    <button
                      type="button"
                      onClick={() => onOpenStrategicNoteModal(item)}
                      className="text-[11px] font-bold text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <StickyNote className="w-3 h-3 text-indigo-400" />
                      <span>{note ? "Notu Düzenle" : "Not Ekle"}</span>
                    </button>
                  )}

                  {onApplyKeyword && (
                    <button
                      type="button"
                      onClick={() => onApplyKeyword(item.keyword)}
                      className="ml-auto text-[11px] font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1 cursor-pointer"
                      title="Hedef anahtar kelimelere ekle"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Hedefe Ekle</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Helper Card to Add More Competitors if fewer than 3 are selected */}
          {selectedRankings.length < 3 && unselectedRankings.length > 0 && (
            <div
              id="side-by-side-add-more-card"
              className="rounded-2xl border-2 border-dashed border-slate-700 p-5 flex flex-col items-center justify-center text-center space-y-3 bg-slate-850/40 hover:bg-slate-850/70 transition-all"
            >
              <div className="w-10 h-10 rounded-2xl bg-amber-400/10 text-amber-400 flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h5 className="font-bold text-sm text-white">Yan Yana Kıyasa Ekle</h5>
                <p className="text-xs text-slate-400 max-w-[200px]">
                  Karşılaştırmayı zenginleştirmek için aşağıdaki listeden veya tablodan bir rakip daha seçin.
                </p>
              </div>

              {onSelectRanking && (
                <div className="w-full space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Önerilen Eklemeler:
                  </span>
                  {unselectedRankings.slice(0, 3).map((unsel) => (
                    <button
                      key={unsel.id}
                      type="button"
                      onClick={() => onSelectRanking(unsel.id)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-900/60 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold flex items-center justify-between gap-1 transition-colors cursor-pointer text-left"
                    >
                      <span className="truncate">{unsel.keyword}</span>
                      <span className="text-amber-300 shrink-0 font-mono text-[10px]">#{unsel.userRank ?? "-"}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
