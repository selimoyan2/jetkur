import React, { useState, useMemo } from "react";
import { CompetitorKeywordRanking, CompetitorContentMetric } from "../../types";
import {
  GitCompare,
  X,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Trophy,
  Check,
  AlertCircle,
  BarChart2,
  Layers,
  Filter,
  SlidersHorizontal,
  Download,
  Info,
  ChevronDown,
  Target,
  Minus
} from "lucide-react";

export interface CompetitorDiffViewPanelProps {
  selectedRankings: CompetitorKeywordRanking[];
  allRankings: CompetitorKeywordRanking[];
  userName: string;
  competitors: CompetitorContentMetric[];
  onClose: () => void;
  onSelectBaseline?: (id: string) => void;
  baselineId?: string;
  onRemoveSelectedRow: (id: string) => void;
  onAddRowToDiff: (id: string) => void;
  onFocusRowInTable?: (id: string) => void;
}

export const CompetitorDiffViewPanel: React.FC<CompetitorDiffViewPanelProps> = ({
  selectedRankings,
  allRankings,
  userName,
  competitors,
  onClose,
  onSelectBaseline,
  baselineId,
  onRemoveSelectedRow,
  onAddRowToDiff,
  onFocusRowInTable
}) => {
  // Local active baseline if not externally controlled
  const [localBaselineId, setLocalBaselineId] = useState<string>(
    baselineId || selectedRankings[0]?.id || ""
  );

  // View mode within diff panel: "matrix" (tablo) or "cards" (yan yana kartlar)
  const [viewLayout, setViewLayout] = useState<"matrix" | "cards">("matrix");

  // Filter diffs: "all" (tüm metrikler), "onlyDiffs" (fark olanlar), "highlights" (en iyi/en kötü)
  const [diffFilter, setDiffFilter] = useState<"all" | "onlyDiffs" | "highlights">("all");

  const activeBaselineId = baselineId || localBaselineId || selectedRankings[0]?.id || "";

  // Competitor display names
  const comp1 = competitors[0] || { name: "1. Rakip", domain: "rakip1.com" };
  const comp2 = competitors[1] || { name: "2. Rakip", domain: "rakip2.com" };
  const comp3 = competitors[2] || { name: "3. Rakip", domain: "rakip3.com" };

  const baselineItem = useMemo(() => {
    return selectedRankings.find((r) => r.id === activeBaselineId) || selectedRankings[0];
  }, [selectedRankings, activeBaselineId]);

  // Parse volume helper
  const parseVol = (volStr?: string) => {
    if (!volStr) return 0;
    const num = parseInt(volStr.replace(/[^0-9]/g, ""), 10);
    return isNaN(num) ? 0 : num;
  };

  // Best competitor rank for a row
  const getBestCompRank = (r: CompetitorKeywordRanking) => {
    const list = [r.comp1Rank, r.comp2Rank, r.comp3Rank].filter((x): x is number => x !== null && !isNaN(x));
    return list.length > 0 ? Math.min(...list) : 99;
  };

  // Stats spread across selected rows
  const diffSummary = useMemo(() => {
    if (selectedRankings.length === 0) return null;

    const volumes = selectedRankings.map((r) => parseVol(r.monthlyVolume));
    const userRanks = selectedRankings.map((r) => r.userRank ?? 99);
    const difficulties = selectedRankings.map((r) => r.difficulty);
    const gaps = selectedRankings.map((r) => (r.userRank ?? 99) - getBestCompRank(r));

    const maxVol = Math.max(...volumes);
    const minVol = Math.min(...volumes);
    const volSpread = maxVol - minVol;

    const validUserRanks = userRanks.filter((rk) => rk <= 20);
    const bestUserRank = validUserRanks.length > 0 ? Math.min(...validUserRanks) : null;
    const worstUserRank = validUserRanks.length > 0 ? Math.max(...validUserRanks) : null;

    const leadingCount = selectedRankings.filter((r) => {
      const ur = r.userRank ?? 99;
      const bc = getBestCompRank(r);
      return ur <= bc;
    }).length;

    const maxKD = Math.max(...difficulties);
    const minKD = Math.min(...difficulties);
    const kdSpread = maxKD - minKD;

    return {
      volSpread,
      maxVol,
      minVol,
      bestUserRank,
      worstUserRank,
      leadingCount,
      totalCount: selectedRankings.length,
      kdSpread,
      maxKD,
      minKD
    };
  }, [selectedRankings]);

  // Unselected rows that can be added to the comparison
  const availableToAdd = useMemo(() => {
    const selectedSet = new Set(selectedRankings.map((r) => r.id));
    return allRankings.filter((r) => !selectedSet.has(r.id));
  }, [allRankings, selectedRankings]);

  const handleBaselineChange = (id: string) => {
    setLocalBaselineId(id);
    if (onSelectBaseline) {
      onSelectBaseline(id);
    }
  };

  // Export diff summary as CSV
  const handleExportDiffCsv = () => {
    if (selectedRankings.length === 0) return;
    const base = baselineItem;
    const baseVol = parseVol(base?.monthlyVolume);
    const baseRank = base?.userRank ?? 99;

    let csvContent = "\uFEFF"; // UTF-8 BOM
    csvContent += "Anahtar Kelime,Arama Niyeti,Aylık Hacim,Hacim Farki (vs Baz),Siteniz Sırası,Sıra Farkı (vs Baz),1. Rakip,2. Rakip,3. Rakip,SEO Zorluğu (KD),Referans mı?\n";

    selectedRankings.forEach((r) => {
      const isBase = r.id === base?.id;
      const vol = parseVol(r.monthlyVolume);
      const diffVol = vol - baseVol;
      const diffVolStr = isBase ? "0 (Baz)" : diffVol > 0 ? `+${diffVol}` : `${diffVol}`;

      const uRank = r.userRank ?? 99;
      const diffRank = uRank - baseRank;
      const diffRankStr = isBase ? "0 (Baz)" : diffRank < 0 ? `+${Math.abs(diffRank)} sıra daha iyi` : `-${diffRank} sıra daha geride`;

      const safeKeyword = `"${(r.keyword || "").replace(/"/g, '""')}"`;
      csvContent += `${safeKeyword},${r.searchIntent},${r.monthlyVolume},${diffVolStr},${r.userRank !== null ? `#${r.userRank}` : "İlk 20'de Yok"},${diffRankStr},${r.comp1Rank ?? "-"},${r.comp2Rank ?? "-"},${r.comp3Rank ?? "-"},${r.difficulty},${isBase ? "EVET" : "HAYIR"}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SEO_Rakip_Farklilik_Analizi_DiffView_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (selectedRankings.length < 2) {
    return (
      <div
        id="diff-view-highlight-panel"
        data-testid="diff-view-highlight-panel"
        className="p-4 sm:p-5 rounded-3xl bg-indigo-950 text-white border-2 border-indigo-500/80 shadow-xl space-y-3 animate-in fade-in duration-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-amber-400" />
            <h4 className="text-sm font-black text-white">Farklılıkları Vurgula (Diff View) Modu</h4>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-indigo-900/60 border border-indigo-500/40 text-xs">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="flex-1 text-slate-200">
            Metrik farklarını karşılaştırmak için <strong>en az 2 rakip satırı</strong> seçilmelidir. Lütfen tablodaki satırların yanındaki kutucukları işaretleyin veya aşağıdaki butonla hızlıca ilk 2 satırı karşılaştırın.
          </div>
          {allRankings.length >= 2 && (
            <button
              type="button"
              id="btn-diff-auto-select-top2"
              data-testid="btn-diff-auto-select-top2"
              onClick={() => {
                onAddRowToDiff(allRankings[0].id);
                onAddRowToDiff(allRankings[1].id);
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black shrink-0 transition-all cursor-pointer shadow-md active:scale-95"
            >
              İlk 2 Satırı Seç & Karşılaştır
            </button>
          )}
        </div>
      </div>
    );
  }

  // Base metrics for comparison
  const baseVol = parseVol(baselineItem?.monthlyVolume);
  const baseUserRank = baselineItem?.userRank ?? 99;
  const baseBestCompRank = baselineItem ? getBestCompRank(baselineItem) : 99;
  const baseGap = (baselineItem?.userRank ?? 99) - baseBestCompRank;
  const baseDifficulty = baselineItem?.difficulty ?? 50;

  return (
    <div
      id="diff-view-highlight-panel"
      data-testid="diff-view-highlight-panel"
      className="p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-white border-2 border-indigo-400/80 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-3 duration-200"
    >
      {/* 1. HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-indigo-800/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-400 text-slate-950 font-black text-xs shadow-md">
              <GitCompare className="w-4 h-4 stroke-[2.5]" />
              <span>Farklılıkları Vurgula (Diff View)</span>
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-indigo-900 text-amber-300 text-[11px] font-bold border border-indigo-500/50">
              {selectedRankings.length} Satır Karşılaştırılıyor
            </span>
            <span className="text-[11px] text-slate-300 font-medium hidden sm:inline">
              • Metrik sapmaları ve varyasyonlar referans satıra göre anlık hesaplanmaktadır.
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Aşağıdaki tabloda yeşil rozetler <strong>avantaj / daha yüksek performans</strong>, kırmızı rozetler <strong>geride kalınan değerleri</strong>, mor rozet ise seçtiğiniz <strong>Referans (Baz) satırı</strong> ifade eder.
          </p>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
          {/* Baseline Selector */}
          <div className="flex items-center gap-1.5 text-xs bg-slate-900/90 px-2.5 py-1.5 rounded-xl border border-indigo-700/80">
            <span className="text-slate-400 text-[11px] font-bold">Referans (Baz):</span>
            <select
              id="select-diff-baseline-row"
              data-testid="select-diff-baseline-row"
              value={activeBaselineId}
              onChange={(e) => handleBaselineChange(e.target.value)}
              className="bg-indigo-950 text-amber-300 text-xs font-bold rounded-lg px-2 py-0.5 border border-indigo-600 focus:outline-hidden cursor-pointer"
            >
              {selectedRankings.map((r, i) => (
                <option key={r.id} value={r.id}>
                  {i + 1}. {r.keyword} ({r.userRank !== null ? `#${r.userRank}` : "İlk 20'de Yok"})
                </option>
              ))}
            </select>
          </div>

          {/* View Layout Toggle */}
          <div className="inline-flex rounded-xl bg-slate-900/90 p-0.5 border border-indigo-700/80 text-xs">
            <button
              type="button"
              id="btn-diff-layout-matrix"
              data-testid="btn-diff-layout-matrix"
              onClick={() => setViewLayout("matrix")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                viewLayout === "matrix"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Metrik Fark Matrisi Tablosu"
            >
              Matris
            </button>
            <button
              type="button"
              id="btn-diff-layout-cards"
              data-testid="btn-diff-layout-cards"
              onClick={() => setViewLayout("cards")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                viewLayout === "cards"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Yan Yana Kart Görünümü"
            >
              Kartlar
            </button>
          </div>

          {/* Export CSV */}
          <button
            type="button"
            id="btn-diff-export-csv"
            data-testid="btn-diff-export-csv"
            onClick={handleExportDiffCsv}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-indigo-200 hover:text-white border border-indigo-700 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
            title="Seçili satırların fark analizini CSV tablosu olarak indirin"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Farkları CSV Yap</span>
          </button>

          {/* Close Button */}
          <button
            type="button"
            id="btn-close-diff-view"
            data-testid="btn-close-diff-view"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            title="Farklılıkları Vurgula (Diff View) modunu kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. EXECUTIVE DIFFERENCE HIGHLIGHT CARDS */}
      {diffSummary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          {/* Card 1: Volume Spread */}
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-indigo-900/70 space-y-1">
            <div className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
              <span>Hacim Yayılımı (Δ)</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-base font-black font-mono text-amber-300">
              {diffSummary.volSpread.toLocaleString("tr-TR")}
              <span className="text-[10px] font-normal text-slate-400 ml-1">arama/ay</span>
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              Maks: {diffSummary.maxVol.toLocaleString("tr-TR")} • Min: {diffSummary.minVol.toLocaleString("tr-TR")}
            </div>
          </div>

          {/* Card 2: Rank Spread */}
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-indigo-900/70 space-y-1">
            <div className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
              <span>En İyi vs En Zayıf Sıra</span>
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-base font-black font-mono text-emerald-400 flex items-center gap-1.5">
              <span>#{diffSummary.bestUserRank ?? "-"}</span>
              <span className="text-slate-500 font-normal text-xs">&rarr;</span>
              <span className="text-rose-400">#{diffSummary.worstUserRank ?? "-"}</span>
            </div>
            <div className="text-[10px] text-slate-400">
              {diffSummary.bestUserRank !== null && diffSummary.worstUserRank !== null
                ? `${Math.abs(diffSummary.worstUserRank - diffSummary.bestUserRank)} pozisyon sıralama farkı`
                : "Sıralama verisi mevcut"}
            </div>
          </div>

          {/* Card 3: Leadership Ratio */}
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-indigo-900/70 space-y-1">
            <div className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
              <span>Lider Olunan Satırlar</span>
              <Target className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="text-base font-black font-mono text-white">
              {diffSummary.leadingCount} / {diffSummary.totalCount}
              <span className="text-[10px] font-normal text-slate-400 ml-1">
                (%{Math.round((diffSummary.leadingCount / diffSummary.totalCount) * 100)})
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              Rakiplerden önde veya eşit pozisyonda
            </div>
          </div>

          {/* Card 4: Difficulty Spread */}
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-indigo-900/70 space-y-1">
            <div className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
              <span>Zorluk Farkı (Δ KD)</span>
              <SlidersHorizontal className="w-3.5 h-3.5 text-pink-400" />
            </div>
            <div className="text-base font-black font-mono text-indigo-300">
              Δ {diffSummary.kdSpread} pt
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              En kolay: {diffSummary.minKD} KD • En zor: {diffSummary.maxKD} KD
            </div>
          </div>
        </div>
      )}

      {/* 3. DIFF HIGHLIGHT FILTER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-400 font-bold flex items-center gap-1 text-[11px]">
            <Filter className="w-3 h-3 text-indigo-400" />
            <span>Filtrele:</span>
          </span>
          <button
            type="button"
            onClick={() => setDiffFilter("all")}
            className={`px-2 py-0.5 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
              diffFilter === "all"
                ? "bg-indigo-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            Tüm Metrikler
          </button>
          <button
            type="button"
            onClick={() => setDiffFilter("onlyDiffs")}
            className={`px-2 py-0.5 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
              diffFilter === "onlyDiffs"
                ? "bg-amber-400 text-slate-950 font-black"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            Sadece Farklı Değerler
          </button>
          <button
            type="button"
            onClick={() => setDiffFilter("highlights")}
            className={`px-2 py-0.5 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
              diffFilter === "highlights"
                ? "bg-emerald-500 text-slate-950 font-black"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            Ekstremumlar (En İyi / En Zayıf)
          </button>
        </div>

        {/* Add more rows to diff quick selector */}
        {availableToAdd.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400">+ Karşılaştırmaya Ekle:</span>
            <select
              id="select-add-row-to-diff"
              data-testid="select-add-row-to-diff"
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  onAddRowToDiff(e.target.value);
                }
              }}
              className="bg-slate-800 text-slate-200 text-xs rounded-lg px-2 py-1 border border-slate-700 cursor-pointer focus:outline-hidden"
            >
              <option value="">-- Satır Seçin --</option>
              {availableToAdd.map((r) => (
                <option key={r.id} value={r.id}>
                  + {r.keyword} ({r.userRank !== null ? `#${r.userRank}` : "Unranked"})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 4. MAIN COMPARISON DISPLAY: MATRIX TABLE OR CARDS */}
      {viewLayout === "matrix" ? (
        <div className="overflow-x-auto rounded-2xl border border-indigo-900/80 bg-slate-950/70">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-white border-b border-indigo-900/80">
                <th className="py-3 px-3.5 font-black text-[11px] uppercase tracking-wider text-slate-300 min-w-[160px] sticky left-0 bg-slate-900 z-10">
                  Metrik & Parametre
                </th>
                {selectedRankings.map((r, i) => {
                  const isBase = r.id === baselineItem?.id;
                  return (
                    <th
                      key={r.id}
                      className={`py-3 px-3.5 font-bold min-w-[200px] border-l border-indigo-900/60 ${
                        isBase ? "bg-indigo-950/80 ring-1 ring-inset ring-indigo-500/50" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] text-slate-400">#{i + 1}</span>
                            <span className="font-black text-white text-xs truncate max-w-[130px]" title={r.keyword}>
                              {r.keyword}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {isBase ? (
                              <span className="px-1.5 py-0.2 rounded-md bg-indigo-600 text-white font-black text-[9px]">
                                BAZ REFERANS
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleBaselineChange(r.id)}
                                className="text-[10px] text-indigo-300 hover:text-amber-300 hover:underline cursor-pointer"
                              >
                                Referans Yap &uarr;
                              </button>
                            )}
                            <span className="text-[9px] text-slate-400 px-1 py-0.2 rounded bg-slate-800">
                              {r.searchIntent}
                            </span>
                          </div>
                        </div>

                        {/* Remove from comparison */}
                        <button
                          type="button"
                          onClick={() => onRemoveSelectedRow(r.id)}
                          className="p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Bu satırı karşılaştırmadan çıkar"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-indigo-950/80 font-medium">
              {/* Row 1: Search Volume */}
              <tr className="hover:bg-indigo-950/30 transition-colors">
                <td className="py-2.5 px-3.5 font-bold text-slate-300 sticky left-0 bg-slate-950 z-10">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Arama Hacmi (Volume)</span>
                  </div>
                </td>
                {selectedRankings.map((r) => {
                  const isBase = r.id === baselineItem?.id;
                  const vol = parseVol(r.monthlyVolume);
                  const diff = vol - baseVol;
                  const pct = baseVol > 0 ? Math.round((diff / baseVol) * 100) : 0;
                  const isMax = vol === diffSummary?.maxVol;
                  const isMin = vol === diffSummary?.minVol;

                  return (
                    <td
                      key={r.id}
                      className={`py-2.5 px-3.5 border-l border-indigo-950/60 ${
                        isBase ? "bg-indigo-950/40" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-bold text-white text-xs">
                          {r.monthlyVolume}
                        </span>
                        {isBase ? (
                          <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950 px-1.5 py-0.5 rounded border border-indigo-700">
                            Baz
                          </span>
                        ) : diff !== 0 ? (
                          <span
                            className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                              diff > 0
                                ? "bg-emerald-950/90 text-emerald-300 border border-emerald-500/40"
                                : "bg-rose-950/90 text-rose-300 border border-rose-500/40"
                            }`}
                          >
                            {diff > 0 ? `+${diff.toLocaleString("tr-TR")}` : diff.toLocaleString("tr-TR")}
                            <span className="text-[9px]">({diff > 0 ? `+${pct}%` : `${pct}%`})</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-500">Aynı</span>
                        )}
                      </div>
                      {isMax && selectedRankings.length > 2 && (
                        <div className="text-[9px] font-bold text-emerald-400 mt-0.5">★ En Yüksek Hacim</div>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Row 2: Your Site SERP Rank */}
              <tr className="hover:bg-indigo-950/30 transition-colors">
                <td className="py-2.5 px-3.5 font-bold text-slate-300 sticky left-0 bg-slate-950 z-10">
                  <div className="flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>Keyword Rank ({userName})</span>
                  </div>
                </td>
                {selectedRankings.map((r) => {
                  const isBase = r.id === baselineItem?.id;
                  const uRank = r.userRank ?? 99;
                  const diff = uRank - baseUserRank; // In rank: negative diff is BETTER (e.g. #1 vs #4 = -3 = 3 ranks better)

                  return (
                    <td
                      key={r.id}
                      className={`py-2.5 px-3.5 border-l border-indigo-950/60 ${
                        isBase ? "bg-indigo-950/40" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`font-mono font-black text-xs px-2 py-0.5 rounded-md ${
                            r.userRank === 1
                              ? "bg-amber-400 text-slate-950 shadow-xs"
                              : r.userRank !== null && r.userRank <= 3
                              ? "bg-emerald-500 text-white"
                              : r.userRank !== null && r.userRank <= 10
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {r.userRank !== null ? `#${r.userRank}` : "İlk 20'de Yok"}
                        </span>

                        {isBase ? (
                          <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950 px-1.5 py-0.5 rounded border border-indigo-700">
                            Baz
                          </span>
                        ) : diff !== 0 ? (
                          <span
                            className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                              diff < 0
                                ? "bg-emerald-950/90 text-emerald-300 border border-emerald-500/40"
                                : "bg-rose-950/90 text-rose-300 border border-rose-500/40"
                            }`}
                          >
                            {diff < 0 ? `▲ +${Math.abs(diff)} sıra önde` : `▼ -${diff} sıra geride`}
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-500">Aynı Sıra</span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Row 3: Competitor 1 Rank */}
              <tr className="hover:bg-indigo-950/30 transition-colors">
                <td className="py-2.5 px-3.5 font-bold text-slate-300 sticky left-0 bg-slate-950 z-10">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    <span>1. {comp1.name.split(" ")[0]} ({comp1.domain})</span>
                  </div>
                </td>
                {selectedRankings.map((r) => {
                  const isBase = r.id === baselineItem?.id;
                  const cRank = r.comp1Rank;
                  const baseCRank = baselineItem?.comp1Rank;
                  const diff = (cRank ?? 99) - (baseCRank ?? 99);

                  return (
                    <td
                      key={r.id}
                      className={`py-2.5 px-3.5 border-l border-indigo-950/60 font-mono ${
                        isBase ? "bg-indigo-950/40" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="font-bold text-slate-200">
                          {cRank !== null ? `#${cRank}` : "-"}
                        </span>
                        {!isBase && cRank !== null && baseCRank !== null && diff !== 0 && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {diff < 0 ? `Δ +${Math.abs(diff)}` : `Δ -${diff}`}
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Row 4: Competitor 2 Rank */}
              <tr className="hover:bg-indigo-950/30 transition-colors">
                <td className="py-2.5 px-3.5 font-bold text-slate-300 sticky left-0 bg-slate-950 z-10">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    <span>2. {comp2.name.split(" ")[0]} ({comp2.domain})</span>
                  </div>
                </td>
                {selectedRankings.map((r) => {
                  const isBase = r.id === baselineItem?.id;
                  const cRank = r.comp2Rank;

                  return (
                    <td
                      key={r.id}
                      className={`py-2.5 px-3.5 border-l border-indigo-950/60 font-mono ${
                        isBase ? "bg-indigo-950/40" : ""
                      }`}
                    >
                      <span className="font-bold text-slate-200">
                        {cRank !== null ? `#${cRank}` : "-"}
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* Row 5: Competitor 3 Rank */}
              <tr className="hover:bg-indigo-950/30 transition-colors">
                <td className="py-2.5 px-3.5 font-bold text-slate-300 sticky left-0 bg-slate-950 z-10">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-2 h-2 rounded-full bg-pink-400" />
                    <span>3. {comp3.name.split(" ")[0]} ({comp3.domain})</span>
                  </div>
                </td>
                {selectedRankings.map((r) => {
                  const isBase = r.id === baselineItem?.id;
                  const cRank = r.comp3Rank;

                  return (
                    <td
                      key={r.id}
                      className={`py-2.5 px-3.5 border-l border-indigo-950/60 font-mono ${
                        isBase ? "bg-indigo-950/40" : ""
                      }`}
                    >
                      <span className="font-bold text-slate-200">
                        {cRank !== null ? `#${cRank}` : "-"}
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* Row 6: Best Competitor Rank & Rank Gap */}
              <tr className="hover:bg-indigo-950/30 transition-colors">
                <td className="py-2.5 px-3.5 font-bold text-slate-300 sticky left-0 bg-slate-950 z-10">
                  <div className="flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Lider Rakip Pozisyonu & Gap</span>
                  </div>
                </td>
                {selectedRankings.map((r) => {
                  const isBase = r.id === baselineItem?.id;
                  const bestComp = getBestCompRank(r);
                  const ur = r.userRank ?? 99;
                  const gap = ur - bestComp; // negative = you lead, positive = competitor leads

                  return (
                    <td
                      key={r.id}
                      className={`py-2.5 px-3.5 border-l border-indigo-950/60 ${
                        isBase ? "bg-indigo-950/40" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="font-mono text-slate-300">
                          En İyi Rakip: <strong className="text-white">#{bestComp}</strong>
                        </span>
                        <span
                          className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded ${
                            gap <= 0
                              ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                              : "bg-rose-950 text-rose-300 border border-rose-500/40"
                          }`}
                        >
                          {gap <= 0 ? `+${Math.abs(gap)} Önde` : `-${gap} Geride`}
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Row 7: SEO Difficulty (KD) */}
              <tr className="hover:bg-indigo-950/30 transition-colors">
                <td className="py-2.5 px-3.5 font-bold text-slate-300 sticky left-0 bg-slate-950 z-10">
                  <div className="flex items-center gap-1.5">
                    <BarChart2 className="w-3.5 h-3.5 text-pink-400" />
                    <span>SEO Zorluk Skoru (KD)</span>
                  </div>
                </td>
                {selectedRankings.map((r) => {
                  const isBase = r.id === baselineItem?.id;
                  const diff = r.difficulty - baseDifficulty;

                  return (
                    <td
                      key={r.id}
                      className={`py-2.5 px-3.5 border-l border-indigo-950/60 font-mono ${
                        isBase ? "bg-indigo-950/40" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-white">
                          {r.difficulty}/100
                        </span>
                        {isBase ? (
                          <span className="text-[10px] text-indigo-300">Baz KD</span>
                        ) : diff !== 0 ? (
                          <span
                            className={`text-[10px] font-bold px-1 rounded ${
                              diff < 0
                                ? "text-emerald-300 bg-emerald-950/80"
                                : "text-amber-300 bg-amber-950/80"
                            }`}
                          >
                            {diff < 0 ? `Δ ${diff} (Daha Kolay)` : `Δ +${diff} (Daha Zor)`}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500">Aynı KD</span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Row 8: Focus in Table Action */}
              <tr className="bg-slate-900/60">
                <td className="py-2 px-3.5 text-slate-400 text-[11px] sticky left-0 bg-slate-900/90 z-10">
                  Satıra Git
                </td>
                {selectedRankings.map((r) => (
                  <td key={r.id} className="py-2 px-3.5 border-l border-indigo-900/60 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        if (onFocusRowInTable) {
                          onFocusRowInTable(r.id);
                        } else {
                          const el = document.getElementById(`row-${r.id}`);
                          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                        }
                      }}
                      className="text-[11px] font-bold text-amber-300 hover:text-amber-200 hover:underline cursor-pointer"
                    >
                      Tabloda Göster &darr;
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        /* CARDS VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {selectedRankings.map((r, idx) => {
            const isBase = r.id === baselineItem?.id;
            const vol = parseVol(r.monthlyVolume);
            const diffVol = vol - baseVol;
            const uRank = r.userRank ?? 99;
            const diffRank = uRank - baseUserRank;
            const bestComp = getBestCompRank(r);
            const gap = uRank - bestComp;

            return (
              <div
                key={r.id}
                className={`p-4 rounded-2xl border transition-all space-y-3 relative ${
                  isBase
                    ? "bg-indigo-950/90 border-indigo-400 ring-2 ring-indigo-500/50"
                    : "bg-slate-900/80 border-indigo-900/70 hover:border-indigo-600"
                }`}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-[10px] text-slate-400">#{idx + 1}</span>
                      <h5 className="font-black text-white text-xs" title={r.keyword}>
                        {r.keyword}
                      </h5>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isBase ? (
                        <span className="px-1.5 py-0.2 rounded bg-indigo-600 text-white font-black text-[9px]">
                          BAZ REFERANS
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleBaselineChange(r.id)}
                          className="text-[10px] text-indigo-300 hover:text-amber-300 underline cursor-pointer"
                        >
                          Referans Yap
                        </button>
                      )}
                      <span className="text-[9px] text-slate-400 px-1 py-0.2 rounded bg-slate-800">
                        {r.searchIntent}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveSelectedRow(r.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 rounded cursor-pointer"
                    title="Bu satırı karşılaştırmadan çıkar"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Metrics Comparison Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Volume */}
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block">Arama Hacmi</span>
                    <span className="font-mono font-bold text-white">{r.monthlyVolume}</span>
                    {!isBase && diffVol !== 0 && (
                      <span
                        className={`block text-[10px] font-mono font-black ${
                          diffVol > 0 ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {diffVol > 0 ? `+${diffVol.toLocaleString("tr-TR")}` : diffVol.toLocaleString("tr-TR")}
                      </span>
                    )}
                  </div>

                  {/* User Rank */}
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block">Siteniz Sırası</span>
                    <span className="font-mono font-black text-amber-300">
                      {r.userRank !== null ? `#${r.userRank}` : "İlk 20'de Yok"}
                    </span>
                    {!isBase && diffRank !== 0 && (
                      <span
                        className={`block text-[10px] font-mono font-black ${
                          diffRank < 0 ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {diffRank < 0 ? `▲ +${Math.abs(diffRank)} sıra önde` : `▼ -${diffRank} sıra geride`}
                      </span>
                    )}
                  </div>

                  {/* Competitor 1 */}
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block truncate">1. {comp1.name}</span>
                    <span className="font-mono font-bold text-slate-200">
                      {r.comp1Rank !== null ? `#${r.comp1Rank}` : "-"}
                    </span>
                  </div>

                  {/* Rank Gap */}
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block">Lider Rakip Gap</span>
                    <span
                      className={`font-mono font-black text-xs ${
                        gap <= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {gap <= 0 ? `+${Math.abs(gap)} Önde` : `-${gap} Geride`}
                    </span>
                  </div>
                </div>

                {/* Footer Link */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">SEO Zorluk: {r.difficulty}/100</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (onFocusRowInTable) {
                        onFocusRowInTable(r.id);
                      } else {
                        const el = document.getElementById(`row-${r.id}`);
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                      }
                    }}
                    className="text-amber-400 hover:underline cursor-pointer font-bold"
                  >
                    Tabloda İncele &darr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. FOOTER STATUS BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-indigo-900/80 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          <span>
            Tablodaki satırların kutucuklarını (checkbox) işaretleyerek yeni rakipleri ekleyebilir veya çıkarabilirsiniz.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="btn-diff-clear-and-exit"
            data-testid="btn-diff-clear-and-exit"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            Farklılık Modunu Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
