import React, { useState, useMemo, useEffect } from "react";
import { CompetitorKeywordRanking, CompetitorContentMetric } from "../../types";
import { CompetitorRankingD3BarChart } from "./CompetitorRankingD3BarChart";
import { 
  X, 
  BarChart3, 
  Trophy, 
  Target, 
  TrendingUp, 
  Download, 
  Plus, 
  Check, 
  Layers, 
  Sparkles,
  Users
} from "lucide-react";

interface SelectedCompetitorComparisonChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRankings: CompetitorKeywordRanking[];
  userName: string;
  competitors: CompetitorContentMetric[];
  onApplyAllKeywords?: (keywords: string[]) => void;
  onExportSelectedCsv?: (rankings: CompetitorKeywordRanking[]) => void;
}

export const SelectedCompetitorComparisonChartModal: React.FC<SelectedCompetitorComparisonChartModalProps> = ({
  isOpen,
  onClose,
  selectedRankings,
  userName,
  competitors,
  onApplyAllKeywords,
  onExportSelectedCsv
}) => {
  const [activeCompetitors, setActiveCompetitors] = useState<{
    user: boolean;
    comp1: boolean;
    comp2: boolean;
    comp3: boolean;
  }>({
    user: true,
    comp1: true,
    comp2: true,
    comp3: true
  });

  const [isAddedAll, setIsAddedAll] = useState(false);

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

  const comp1 = competitors[0] || { name: "1. Rakip", domain: "rakip1.com", rank: 1 };
  const comp2 = competitors[1] || { name: "2. Rakip", domain: "rakip2.com", rank: 2 };
  const comp3 = competitors[2] || { name: "3. Rakip", domain: "rakip3.com", rank: 3 };

  // Calculate comparison metrics for selected items
  const stats = useMemo(() => {
    if (!selectedRankings || selectedRankings.length === 0) {
      return {
        totalVolume: 0,
        userAvgRank: 0,
        comp1AvgRank: 0,
        comp2AvgRank: 0,
        comp3AvgRank: 0,
        userLeadingCount: 0,
        gapTotal: 0
      };
    }

    let totalVol = 0;
    let userRankSum = 0;
    let userRankCount = 0;
    let comp1RankSum = 0;
    let comp1RankCount = 0;
    let comp2RankSum = 0;
    let comp2RankCount = 0;
    let comp3RankSum = 0;
    let comp3RankCount = 0;
    let userLeadingCount = 0;
    let gapTotal = 0;

    selectedRankings.forEach((r) => {
      const volNum = parseInt(r.monthlyVolume.replace(/[^0-9]/g, "") || "0", 10);
      const isK = r.monthlyVolume.toLowerCase().includes("k");
      totalVol += isK ? volNum * 1000 : volNum;

      if (r.userRank !== null) {
        userRankSum += r.userRank;
        userRankCount++;
      }
      if (r.comp1Rank !== null) {
        comp1RankSum += r.comp1Rank;
        comp1RankCount++;
      }
      if (r.comp2Rank !== null) {
        comp2RankSum += r.comp2Rank;
        comp2RankCount++;
      }
      if (r.comp3Rank !== null) {
        comp3RankSum += r.comp3Rank;
        comp3RankCount++;
      }

      const compRanks = [r.comp1Rank, r.comp2Rank, r.comp3Rank].filter((n): n is number => n !== null);
      const bestComp = compRanks.length > 0 ? Math.min(...compRanks) : 1;
      if (r.userRank !== null && r.userRank <= bestComp) {
        userLeadingCount++;
      }

      gapTotal += r.gap;
    });

    return {
      totalVolume: totalVol,
      userAvgRank: userRankCount > 0 ? (userRankSum / userRankCount).toFixed(1) : "-",
      comp1AvgRank: comp1RankCount > 0 ? (comp1RankSum / comp1RankCount).toFixed(1) : "-",
      comp2AvgRank: comp2RankCount > 0 ? (comp2RankSum / comp2RankCount).toFixed(1) : "-",
      comp3AvgRank: comp3RankCount > 0 ? (comp3RankSum / comp3RankCount).toFixed(1) : "-",
      userLeadingCount,
      gapTotal
    };
  }, [selectedRankings]);

  // Filter competitors passed to the D3 chart based on active toggles
  const filteredCompetitors = useMemo(() => {
    return [
      activeCompetitors.comp1 ? comp1 : { ...comp1, name: `${comp1.name} (Gizli)`, domain: "-" },
      activeCompetitors.comp2 ? comp2 : { ...comp2, name: `${comp2.name} (Gizli)`, domain: "-" },
      activeCompetitors.comp3 ? comp3 : { ...comp3, name: `${comp3.name} (Gizli)`, domain: "-" }
    ];
  }, [comp1, comp2, comp3, activeCompetitors]);

  const handleApplyAll = () => {
    if (onApplyAllKeywords && selectedRankings.length > 0) {
      onApplyAllKeywords(selectedRankings.map((r) => r.keyword));
      setIsAddedAll(true);
      setTimeout(() => setIsAddedAll(false), 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      id="separate-comparison-chart-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="comparison-chart-modal-title"
    >
      <div className="relative w-full max-w-5xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
                <BarChart3 className="w-5 h-5" />
              </span>
              <div>
                <h2 id="comparison-chart-modal-title" className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <span>Seçilen Rakipler & Kelimeler Karşılaştırma Grafiği</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-xs font-black">
                    {selectedRankings.length} Kelime Seçili
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Tablodan işaretlediğiniz anahtar kelimeleri ve rakiplerin SERP skorlarını D3.js grafiğinde doğrudan karşılaştırın.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onExportSelectedCsv && (
              <button
                type="button"
                id="btn-modal-export-csv"
                onClick={() => onExportSelectedCsv(selectedRankings)}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                title="Yalnızca seçilen kelimeleri CSV olarak indirin"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Seçilenleri CSV İndir</span>
              </button>
            )}

            {onApplyAllKeywords && (
              <button
                type="button"
                id="btn-modal-add-all-targets"
                onClick={handleApplyAll}
                disabled={isAddedAll}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                  isAddedAll
                    ? "bg-emerald-500 text-white"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white"
                }`}
                title="Tüm seçili kelimeleri SEO hedeflerine ekleyin"
              >
                {isAddedAll ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isAddedAll ? "Hedeflere Eklendi" : "Hedeflere Ekle"}</span>
              </button>
            )}

            <button
              type="button"
              id="btn-close-comparison-modal"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* 1. Competitor Toggle Selector */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>Grafikte Karşılaştırılacak Rakipleri Seçin:</span>
              </span>
              <span className="text-[11px] text-slate-400">
                Grafikte gizlemek veya öne çıkarmak istediğiniz rakipleri işaretleyin
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Siteniz */}
              <label 
                className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                  activeCompetitors.user
                    ? "bg-amber-400/10 border-amber-400/40 text-amber-300"
                    : "bg-slate-900 border-slate-800 text-slate-500 opacity-60"
                }`}
              >
                <input
                  type="checkbox"
                  checked={activeCompetitors.user}
                  onChange={(e) => setActiveCompetitors(prev => ({ ...prev, user: e.target.checked }))}
                  className="w-4 h-4 text-amber-400 rounded border-slate-700 focus:ring-amber-400 cursor-pointer"
                />
                <div className="truncate text-xs">
                  <div className="font-bold flex items-center gap-1 truncate">
                    <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                    <span className="truncate">{userName} (Siteniz)</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Ort. Sıra: #{stats.userAvgRank}</div>
                </div>
              </label>

              {/* 1. Rakip */}
              <label 
                className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                  activeCompetitors.comp1
                    ? "bg-rose-500/10 border-rose-500/40 text-rose-300"
                    : "bg-slate-900 border-slate-800 text-slate-500 opacity-60"
                }`}
              >
                <input
                  type="checkbox"
                  checked={activeCompetitors.comp1}
                  onChange={(e) => setActiveCompetitors(prev => ({ ...prev, comp1: e.target.checked }))}
                  className="w-4 h-4 text-rose-500 rounded border-slate-700 focus:ring-rose-500 cursor-pointer"
                />
                <div className="truncate text-xs">
                  <div className="font-bold flex items-center gap-1 truncate">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    <span className="truncate">{comp1.name.split(" ")[0]}</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Ort. Sıra: #{stats.comp1AvgRank}</div>
                </div>
              </label>

              {/* 2. Rakip */}
              <label 
                className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                  activeCompetitors.comp2
                    ? "bg-sky-500/10 border-sky-500/40 text-sky-300"
                    : "bg-slate-900 border-slate-800 text-slate-500 opacity-60"
                }`}
              >
                <input
                  type="checkbox"
                  checked={activeCompetitors.comp2}
                  onChange={(e) => setActiveCompetitors(prev => ({ ...prev, comp2: e.target.checked }))}
                  className="w-4 h-4 text-sky-500 rounded border-slate-700 focus:ring-sky-500 cursor-pointer"
                />
                <div className="truncate text-xs">
                  <div className="font-bold flex items-center gap-1 truncate">
                    <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                    <span className="truncate">{comp2.name.split(" ")[0]}</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Ort. Sıra: #{stats.comp2AvgRank}</div>
                </div>
              </label>

              {/* 3. Rakip */}
              <label 
                className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                  activeCompetitors.comp3
                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                    : "bg-slate-900 border-slate-800 text-slate-500 opacity-60"
                }`}
              >
                <input
                  type="checkbox"
                  checked={activeCompetitors.comp3}
                  onChange={(e) => setActiveCompetitors(prev => ({ ...prev, comp3: e.target.checked }))}
                  className="w-4 h-4 text-emerald-500 rounded border-slate-700 focus:ring-emerald-500 cursor-pointer"
                />
                <div className="truncate text-xs">
                  <div className="font-bold flex items-center gap-1 truncate">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="truncate">{comp3.name.split(" ")[0]}</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Ort. Sıra: #{stats.comp3AvgRank}</div>
                </div>
              </label>
            </div>
          </div>

          {/* 2. Comparative Metrics Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Toplam Aylık Hacim</span>
              <div className="text-base font-black text-emerald-400 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                <span>{stats.totalVolume.toLocaleString("tr-TR")} arama/ay</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Lider Olduğunuz Kelimeler</span>
              <div className="text-base font-black text-amber-400 flex items-center gap-1">
                <Trophy className="w-4 h-4" />
                <span>{stats.userLeadingCount} / {selectedRankings.length}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Siteniz Ort. Sırası</span>
              <div className="text-base font-black text-indigo-400 flex items-center gap-1">
                <Target className="w-4 h-4" />
                <span>#{stats.userAvgRank}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">En Güçlü Rakip</span>
              <div className="text-base font-black text-rose-400 flex items-center gap-1">
                <Layers className="w-4 h-4" />
                <span className="truncate">{comp1.name.split(" ")[0]} (#{stats.comp1AvgRank})</span>
              </div>
            </div>
          </div>

          {/* 3. The Dedicated D3 Comparison Bar Chart */}
          <div className="rounded-2xl bg-slate-950 border border-slate-800 p-2 sm:p-4 overflow-hidden">
            <div className="mb-3 px-2 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  D3.js Skor Grafiği (Seçili {selectedRankings.length} Kelime)
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Skor formülü: 1. Sıra = 100 Puan, 20. Sıra = 10 Puan
              </span>
            </div>

            <CompetitorRankingD3BarChart
              rankings={selectedRankings}
              userName={userName}
              competitors={filteredCompetitors}
            />
          </div>

          {/* 4. Selected Keywords Chips List */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Karşılaştırmaya Dahil Edilen Kelimeler ({selectedRankings.length}):
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {selectedRankings.map((item) => (
                <span 
                  key={item.id}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5"
                >
                  <span className="font-bold text-white">{item.keyword}</span>
                  <span className="font-mono text-[10px] text-amber-300">
                    {item.userRank !== null ? `#${item.userRank}` : "Yok"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">({item.monthlyVolume})</span>
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400">
            İpucu: Farklı kelime ve rakipleri karşılaştırmak için tablodaki onay kutularını işaretleyebilirsiniz.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer"
          >
            Kapat
          </button>
        </div>

      </div>
    </div>
  );
};
